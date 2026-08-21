import express from "express";
import { registerUser, loginUser, checkAuth, logoutUser } from "../controllers/userController";
import authUser from "../middlewares/authUser"
import { createAuthRateLimiter } from "../configs/rateLimit";
import { validateBody } from "../middlewares/validate";
import { registerSchema, loginSchema } from "../validators/schemas";

const userRouter = express.Router();

userRouter.post("/register", createAuthRateLimiter(), validateBody(registerSchema), registerUser);
userRouter.post("/login", createAuthRateLimiter(), validateBody(loginSchema), loginUser);
userRouter.get("/is-auth", authUser, checkAuth);
userRouter.get("/logout", authUser, logoutUser);

export default userRouter;