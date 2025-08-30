import express from "express";
import { registerUser, loginUser, checkAuth, logoutUser } from "../controllers/userController";   
import authUser from "../middlewares/authUser"

const userRouter = express.Router();

userRouter.post("/register", registerUser);
userRouter.post("/login", loginUser);
userRouter.get("/is-auth", authUser, checkAuth);
userRouter.get("/logout", authUser, logoutUser);

export default userRouter;