import { messageRoutes } from './router/messages';
import { chatRoutes } from './router/chats';
import { userRoutes } from './router/user';
import express, { NextFunction } from 'express';
import mongoose from 'mongoose';
import cors from 'cors';
require('dotenv').config();
import { notFound, errorHandler } from "./middlewares/errorHandler";
import { Server } from 'socket.io';
import { ClientToServerEvents, ServerToClientEvents, SocketData } from 'types/socket.io';
import { createServer } from 'http';
import { ioAuthFunction } from './middlewares/ioAuth';
import { UserModel } from './models/users';
import { chatModel } from 'models/chats';
import { messageModel } from 'models/message';

const app = express();
const port = process.env.PORT || 8080;
const url = process.env.mongoDBURL;

app.use(cors({
  origin: [/^http:\/\/localhost:3000/, /^https:\/\/talkative-chat.vercel.app/],
  allowedHeaders: ["Authorization", "Content-type"],
  methods: ['GET', 'PUT', 'PATCH', 'POST', 'DELETE'],
  credentials: true
}));

const httpServer = createServer(app);
const io = new Server<ClientToServerEvents, ServerToClientEvents, SocketData >(httpServer, {
  cors: {
    origin: [/^http:\/\/localhost:3000/, /^https:\/\/talkative-chat.vercel.app/ ],
    // origin: ["http://localhost:3000/", "https://talkative-chat.vercel.app"],
    allowedHeaders: ["Authorization", "Content-type"],
    methods: ['GET', 'PUT', 'PATCH', 'POST', 'DELETE'],
    credentials: true
  }
});

mongoose.connect(url)
// .then(() => console.log("Connected to db successfully"))
.catch((error: Error) =>console.error("Error connecting to db", error));

app.use(express.urlencoded({ extended: false }));
app.use(express.json());

app.use('/v1/users', userRoutes);
app.use('/v1/chats', chatRoutes);
app.use('/v1/messages', messageRoutes);

io.use((socket, next: NextFunction) => {
  const token = socket.request.headers.authorization;

  const { error, user } = ioAuthFunction(token);

  if (error) return socket.emit("error", error);

  socket.data = user;
  next();
});

io.on("connection", (socket) => {
  socket.on("setup", async(userData) => {
    socket.join(userData.userId);
    socket.emit("connection");
    await UserModel.findByIdAndUpdate(userData.userId, { isOnline: true });
  });

  socket.on("joinChat", (chatId) => {
    socket.join(chatId);
  });

  socket.on("error", (error) => {
    console.log(error);
  });

  socket.on("newMessage", (message) => {
    const chat = message.chat;
    
    if (!chat.users) return console.log("No users in group chat");
    
    chat.users.map((u: string) => socket.to(u).emit("messageRecieved", message));
  });

  socket.on("newUser", async() => {
    const chatData = {
      chatName: "personal",
      isGroupChat: false,
      users: [ "65bd4c3c246007ad53daa6ae", socket.data.userId ]
    };

    const createdChat = await chatModel.create(chatData);

    await messageModel.create({
      chat: createdChat._id,
      content: `Hi ${socket.data.username}. Welcome to my Chat app. Send a message to me or search for new users or create a group chat`,
      sender: "65bd4c3c246007ad53daa6ae"
    });
  });

  socket.on("newGroup", (group) => {
    console.log("new group chat");
    console.log((group));
    
    group.users.map((u: Record<string, any>) => {
      socket.to(u._id).emit("addedToGroup", group);
    });
  });

  socket.on("typing", (room, username) => socket.to(room).emit("typing", username));
  socket.on("stopTyping", (room) => socket.to(room).emit("stopTyping"));

  socket.on("disconnect", async () => {
    socket.leave(socket.data.userId);

    await UserModel.findByIdAndUpdate(socket.data.userId, { isOnline: false }, { new: true });
  });
});

// Error Handling middlewares
app.use(notFound);
app.use(errorHandler);

httpServer.listen(port, () => {
  console.log("Connected to", `http://localhost:${port}`);
});
