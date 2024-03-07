import { Request, Response } from "express";
import { getUserByUsername, updateUserById, createUser, UserModel } from "../models/users";
const jwt = require('jsonwebtoken');
import { encryptPassword } from "../utils";
require('dotenv').config();
const secret = process.env.secret;
const bcrypt = require('bcrypt');

export const editProfile = async (req: Request, res: Response) => {
    try {
        const { userId: id, username: oldUsername } = req.user;
        const { username: newUsername, picture } = req.body;

        if (newUsername === oldUsername) return res.status(400).json({ success: false, error: "Same as previous username" });

        const doesUsernameExist = await UserModel.find({ username: newUsername });

        if (doesUsernameExist.length > 0) return res.status(400).json({ success: false, error: "Username taken" });

        const newDetails = await updateUserById(id, { username: newUsername, picture });

        res.status(200).json({ updatedUser: await UserModel.findById(newDetails._id) });
    } catch(error) {
        console.log(error);
        return res.status(400).send({ error: error.Stack, success: false });
    }
}

export const searchUsers = async (req: Request, res: Response) => {
    const keyword = req.query.search ? {
        username: { $regex: req.query.search, $options: "i" }
    } : {};

    const users = await UserModel.find(keyword).find({ _id: { $ne: req.user.userId } });

    res.status(200).json(users);
}

export const register = async (req: Request, res: Response) => {
    try {
        const { password, username, picture } = req.body;

        if (!username) return res.status(400).send({ error: 'Username not given', success: false });
        else if (!password) return res.status(400).send({ error: 'Password not given', success: false });

        const userExists = await getUserByUsername(username);
        if (userExists) return res.status(400).send({ error: 'Username already taken', success: false });

        const hashPassword = encryptPassword(password);
        const user = await createUser({
            username,
            password: hashPassword,
            picture : picture
        });

        const newUser = await UserModel.findById(user._id).select("-password");
        const token = jwt.sign({
            username: newUser.username,
            userId: newUser._id,
            picture: newUser.picture
        }, secret);

        res.status(201).json({ success: true, user: newUser, token });
    } catch(error) {
        res.status(400).send({ error, success: false });
        throw new Error("Failed to Create the User");
    }
}

export const login = async (req: Request, res: Response) => {
    try {
        const { username, password } = req.body;

        if (!username) {
            return res.status(400).send({ error: 'Username not given', success: false });
        } else if (!password) {
            return res.status(400).send({ error: 'Password not given', success: false });
        }

        const user = await getUserByUsername(username).select('+password');

        if (!user) {
            return res.status(400).json({ success: false, error: "User doesn't exist" });
        }

        const passwordMatch = bcrypt.compareSync(password, user.password);

        if (!passwordMatch) return res.status(403).send({
            success: false,
            error: "Invalid Password"
        });

        const token = jwt.sign({
            username: user.username,
            userId: user._id,
            picture: user.picture
        }, secret);

        res.status(200).json({ success: true, token });
    } catch(error) {
        console.log(error);
        return res.status(400).send({ error: error.error, success: false });
    }
}

export const testLogin = async (req: Request, res: Response) => {
    try {
        const { username } = req.body;

        if (!username) {
            return res.status(400).send({ error: 'Username not given', success: false });
        }

        const user = await getUserByUsername(username).select('+password');

        if (!user) {
            const hashPassword = encryptPassword(username+'1234');
            const user = await createUser({
                username,
                password: hashPassword
            });

            const token = jwt.sign({
                username: user.username,
                userId: user._id,
                picture: user.picture
            }, secret);
    
            return res.status(200).json({ success: true, token });
        }
        
        const token = jwt.sign({
            username: user.username,
            userId: user._id,
            picture: user.picture
        }, secret);

        return res.status(200).json({ success: true, token });
    } catch(error) {
        console.log(error);
        return res.status(400).send({ error: error.error, success: false });
    }
}

