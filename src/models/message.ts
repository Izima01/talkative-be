import mongoose, { Schema } from "mongoose";

const messageSchema = new Schema({
    sender: { type: Schema.Types.ObjectId, ref: 'Users', required: true },
    content: { type: String, required: true, trim: true },
    chat: { type: Schema.Types.ObjectId, ref: 'Chats' }
}, { timestamps: true });

export const messageModel = mongoose.model('Messages', messageSchema);

export const createNewMessage = (values: Record<string, any>) => new messageModel(values).save().then((user) => user.toObject());

export const getMessagesBySender = (senderId: string) =>  messageModel.find({ sender: senderId });

export const getMessagesByReceiver = (receiverId: string) => messageModel.find({ receiver: receiverId }).populate('sender receiver chat');

export const getMessagesBySenderAndReceiver = (sender: string, receiver: string) => messageModel.find({ sender, receiver });