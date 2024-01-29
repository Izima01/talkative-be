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

const app = express();
const port = process.env.PORT || 8080;
const url = process.env.mongoDBURL;
const httpServer = createServer(app);
const io = new Server<ClientToServerEvents, ServerToClientEvents, SocketData >(httpServer, {
  pingTimeout: 60000
});

mongoose.connect(url)
// .then(() => console.log("Connected to db successfully"))
.catch((error: Error) =>console.log("Error connecting to db", error));

app.use(cors({ origin: ['http://localhost:3000/chats', 'https://talkative-chat.vercel.app'] }));
app.use(express.urlencoded({ extended: false }));
app.use(express.json());


app.use('/v1/users', userRoutes);
app.use('/v1/chats', chatRoutes);
app.use('/v1/messages', messageRoutes);

// Error Handling middlewares
app.use(notFound);
app.use(errorHandler);

io.use((socket, next: NextFunction) => {
  const token = socket.request.headers.authorization;

  const { error, user } = ioAuthFunction(token);

  if (error) return socket.emit("basicemit", error);

  socket.data = user;
  next();
});

io.on("connection", (socket) => {
  console.log("connected to socket");

  socket.on("setup", async(userData) => {
    socket.join(userData.userId);
    socket.emit("basicemit", "connection");

    await UserModel.findByIdAndUpdate(userData.userId, { isOnline: true }, { new: true });
  });

  socket.on("joinChat", (chatId) => {
    socket.join(chatId);

    console.log(`${socket.data.username} joined this group chat`);
  });

  socket.on("error", (error) => {
    console.log(error);
  });

  socket.on("newMessage", (message) => {
    const chat = message.chat;

    if (!chat.users) return console.log("No users in group chat");
    
    socket.broadcast.emit("basicemit", "newMessage", message);
  });

  socket.on("typing", (room) => socket.in(room).emit("basicemit", "typing"));
  socket.on("stopTyping", (room) => socket.in(room).emit("basicemit", "stop typing"));

  socket.off("setup", async(userData) => {
    console.log("user disconnected");
    socket.leave(userData.userId);
    
    await UserModel.findByIdAndUpdate(userData.userId, { isOnline: false }, { new: true });
  })                                                       
});

httpServer.listen(port, () => {
  console.log("Connected to", `http://localhost:${port}`);
});
