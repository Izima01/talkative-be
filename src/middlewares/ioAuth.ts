import { User } from '../types/express';
const jwt = require('jsonwebtoken');

export function ioAuthFunction(token: string) {
    const [tokenType, tokenValue] = token.split(" ");

    if (tokenType == "Bearer") {
        const verifiedUser: User = jwt.verify(tokenValue, process.env.secret);

        return {
            error: '',
            user: verifiedUser
        }
    }

    return {
        error: 'Not authorized',
        user: {}
    }
}