import { NextFunction, Request, Response } from 'express';
import { getUserById, getUserBySessionToken } from '../models/users';
const jwt = require("jsonwebtoken");
require('dotenv').config();

const secret = process.env.secret;

const isLoggedIn = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const authorizationHeader = req.headers.authorization;
        
        if (!authorizationHeader) return res.status(401).send({
            error: "No authorization header"
        });
        
        const [authType, token] = authorizationHeader.split(" ");

        if (authType !== "Bearer") {
            return res.status(401).send({
                error: "User unauthorized"
            })
        }
        
        const decoded = jwt.verify(token, secret);
        
        const doesUserExist = await getUserById(decoded.userId);

        if (!doesUserExist) return res.status(400).json({ error: "User doesn't exist" });
        
        
        req.user = {
            userId: doesUserExist._id.toString(),
            username: doesUserExist.username,
            picture: doesUserExist.picture
        };
        next();
    } catch(err) {
        console.log(err);
        res.status(400).send(`Error authenticating user: ${err}`);
    }
}

export default isLoggedIn;