import { UserModel } from './../models/users';
const bcrypt = require('bcrypt');
require('dotenv').config();

export const encryptPassword = (value: string) => {
    const salt = bcrypt.genSaltSync(6);
    const encryptedValue = bcrypt.hashSync(value, salt);

    return encryptedValue;
}

export const populateChats = async function (chat: Record<string, any>) {
    let fullChat = chat
        .populate("users", "-password")
        .populate("groupAdmin", "-password")
        .populate("latestMessage");

    return fullChat = await UserModel.populate(fullChat, {
        path: 'latestMessage.sender',
        select: "username picture"
    });
}