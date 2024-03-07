import { editProfile, searchUsers, login, register, testLogin } from "../controllers/user";
import express from "express";
import isLoggedIn from "../middlewares/isLoggedIn";

const router = express.Router();

router.get('/', isLoggedIn, searchUsers);
router.post('/register', register);
router.post('/login', login);
router.post('/login-test', testLogin);
router.put('/edit', isLoggedIn, editProfile);

export const userRoutes = router;