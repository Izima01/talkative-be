import { chatModel } from './../models/chats';
import { UserModel } from '../models/users';
import { messageModel } from './../models/message';
import { Request, Response } from 'express';

export const fetchMessagesForAChat = async (req: Request, res: Response) => {
    try {
        const chatId = req.query.chatId;
        const chat = await chatModel.findById(chatId);

        let messages = await messageModel.find({ chat: chatId }).populate("sender");

        let allChats = await UserModel.populate(chat, {
            path: 'chat.users',
            select: "-password"
        });

        res.status(200).json({ success: true, chat: allChats, messages });
    } catch(error) {
        console.log(error);
        res.status(400).json({ success: false, error });
    }
}

export const sendMessage = async (req: Request, res: Response) => {
    try {
        const { content, chatId } = req.body;

        if (!content || !chatId) return res.status(400).json({ success: false, error: "Incomplete data sent" });

        const newMessage = await messageModel.create({ chat: chatId, content, sender: req.user.userId.toString() });

        let message = await messageModel.findById(newMessage._id).populate("sender", "-password").populate("chat").populate("chat.users", "-password");

        await chatModel.findByIdAndUpdate(chatId, { latestMessage: message._id });
        res.status(201).json({ success: true, message });
    } catch(error) {
        console.log(error);
        res.status(400).json({ success: false, error });
    }
}

export const delMessageFromUser = async (req: Request, res: Response) => {
    const userId = req.body.user;

    const allMessages = await messageModel.find({
        sender: userId
    });
    console.log(allMessages.length);
    
    // while (allMessages.length > 30) {
        messageModel.findOneAndDelete({ sender: userId.toString() });
    // }

    // res.sendStatus(allMessages.length);
}