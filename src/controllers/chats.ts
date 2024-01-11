import { Request, Response } from "express";
import { chatModel } from "../models/chats";
import { UserModel } from "../models/users";

export const createGroupChat = async (req: Request, res: Response) => {
    try {
        const { users, chatName } = req.body;
        if (!users || !chatName) return res.status(400).send({ success: false, error: "Please fill all the fields" });

        const userArray: [string] = JSON.parse(users);

        if (userArray.length < 2) return res.status(400).json({ success: false, error: "More than 2 users needed" });

        userArray.push(req.user.userId);

        const groupChat = await chatModel.create({
            chatName,
            users: userArray,
            isGroupChat: true,
            groupAdmin: req.user.userId
        });
        const fullGroupChat = await chatModel.findOne({ _id: groupChat._id })
        .populate("users", "-password")
        .populate("groupAdmin", "-password");

        res.status(201).json(fullGroupChat);
    } catch(error) {
        console.log(error);
        res.status(400).json({ success: false, error });
    }
}

export const getChats = async (req: Request, res: Response) => {
    const { userId } = req.user;

    try {
        chatModel.find({ users: {
            $elemMatch: { $eq: userId }
        } })
            .populate("users", "-password")
            .populate("groupAdmin", "-password")
            .populate("latestMessage")
            .sort({ updatedAt: -1 })
            .then(async(results: any) => {
                results = await UserModel.populate(results, {
                path: 'latestMessage.sender',
                select: "username picture"
            });

            res.status(200).json({ allChats: results});
        });

    } catch(error) {
        console.log(error);
        res.status(400).json({ success: false, error });
    }
}

export const accessSingleChats = async (req: Request, res: Response) => {
    try {
        const receiver = req.query.receiver;

        if (receiver == req.user.userId) return res.status(400).json({ success: false, error:"You can't create a chat with yourself" });

        if (!receiver) return res.status(400).json({ succes: false, error: "UserId Param not send with request" });

        const isChatExists = await chatModel.find({
            isGroupChat: false,
            $and: [
                { users: { $elemMatch: { $eq: req.user.userId } } },
                { users: { $elemMatch: { $eq: receiver } } }
            ]
        }).populate("users", "-password").populate("latestMessage");

        const allChats = await UserModel.populate(isChatExists, {
            path: 'latestMessage.sender',
            select: "username picture"
        });

        if (allChats.length > 0) return res.status(200).json({ success: true, chat: allChats[0] });

        else {
            const chatData = {
                chatName: "personal",
                isGroupChat: false,
                users: [ receiver, req.user.userId ]
            };

            try {
                let createdChat = await chatModel.create(chatData);
                createdChat = await createdChat.populate("users", "-password");

                res.status(201).json({ success: true, chat: createdChat });
            } catch(err) {
                res.status(400);
                throw new Error(err.message);
            }
        }
    } catch(error) {
        console.log(error);
        res.status(400).json({ success: false, error });
    }
}

export const renameGroupChat = async (req: Request, res: Response) => {
    try {
        const { newName, chatId } = req.body;

        const updatedChat = await chatModel.findByIdAndUpdate(chatId, { chatName: newName }, { new: true }).populate("users", "-password").populate("groupAdmin", "-password").populate("latestMessage");

        const allChats = await UserModel.populate(updatedChat, {
            path: 'latestMessage.sender',
            select: "username picture"
        });

        if (!updatedChat) return res.status(404).json({ success: false, error: "Chat doesn't exist" });

        res.status(200).json({ success: true, updatedChat: allChats });
    } catch(error) {
        console.log(error);
        res.status(400).json({ success: false, error });
    }
}

export const removeFromGroupChat = async (req: Request, res: Response) => {
    try {
        const { chatId, user } = req.body;
        const chat = await chatModel.findById(chatId);

        if (chat.groupAdmin.toString() !== req.user.userId) return res.status(403).json({ success: false, error: "You are not an admin" });

        if (!chat.users.includes(user)) return res.status(400).json({ success: false, error: "User not in group" });

        const updatedChat = await chatModel.findByIdAndUpdate(chatId, { $pull: { users: user } }, { new: true }).populate("users", "-password").populate("groupAdmin", "-password").populate("latestMessage");

        const allChats = await UserModel.populate(updatedChat, {
            path: 'latestMessage.sender',
            select: "username picture"
        });

        if (!updatedChat) return res.status(404).json({ success: false, error: "Chat not found" });

        res.status(200).json({ success: true, updatedChat: allChats });
    } catch(error) {
        console.log(error);
        res.status(400).json({ success: false, error });
    }
}

export const addToGroupChat = async (req: Request, res: Response) => {
    try {
        const { chatId, user } = req.body;
        const chat = await chatModel.findById(chatId);

        if (chat.groupAdmin.toString() !== req.user.userId) return res.status(403).json({ success: false, error: "You are not an admin" });

        if (chat.users.includes(user)) return res.status(400).json({ success: false, error: "User already in group" });

        const updatedChat = await chatModel.findByIdAndUpdate(chatId, { $push: { users: user } }, { new: true }).populate("users", "-password").populate("groupAdmin", "-password").populate("latestMessage");

        const allChats = await UserModel.populate(updatedChat, {
            path: 'latestMessage.sender',
            select: "username picture"
        });

        if (!updatedChat) return res.status(404).json({ success: false, error: "Chat not found" });

        res.status(200).json({ success: true, updatedChat: allChats });
    } catch(error) {
        console.log(error);
        res.status(400).json({ success: false, error });
    }
}

