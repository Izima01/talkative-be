import * as Express from 'express';

export interface User {
    userId: string;
    username: string;
    picture: string;
    isOnline?: boolean;
}

declare global {
    namespace Express {
        interface Request {
            user?: User;
        }
    }
}