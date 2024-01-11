import { getChats, createGroupChat, renameGroupChat, addToGroupChat, removeFromGroupChat, accessSingleChats } from './../controllers/chats';
import express from "express";
import isLoggedIn from "../middlewares/isLoggedIn";

const router = express.Router();

router.get('/', isLoggedIn, getChats);
router.post('/', isLoggedIn, accessSingleChats);
router.post('/new-group', isLoggedIn, createGroupChat);
router.put('/rename-group', isLoggedIn, renameGroupChat);
router.put('/remove-from-group', isLoggedIn, removeFromGroupChat);
router.put('/add-to-group', isLoggedIn, addToGroupChat);

export const chatRoutes = router;