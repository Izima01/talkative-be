import mongoose, { Schema } from "mongoose";

const chatSchema = new Schema({
    chatName: { type: String, required: true, trim: true },
    chatPhoto: { type: String },
    isGroupChat: { type: Boolean, default: false },
    users: [{
        type: Schema.Types.ObjectId,
        ref: 'Users'
    }],
    latestMessage: {
        type: Schema.Types.ObjectId,
        ref: 'Messages'
    },
    groupAdmin: {
        type: Schema.Types.ObjectId,
        ref: 'Users'    
    }
}, { timestamps: true });

export const chatModel = mongoose.model('Chats', chatSchema);