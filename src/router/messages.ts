import { delMessageFromUser, fetchMessagesForAChat, sendMessage } from './../controllers/messages';
import express from "express";
import isLoggedIn from "../middlewares/isLoggedIn";

const router = express.Router();

router.get('/', isLoggedIn, fetchMessagesForAChat);
router.post('/', isLoggedIn, sendMessage);
router.delete('/', isLoggedIn, delMessageFromUser);

export const messageRoutes = router;