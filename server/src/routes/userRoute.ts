import express from "express";
import { registerUser, loginUser, checkAuth, logoutUser, forgotPassword, resetPassword } from "../controllers/userController";
import authUser from "../middlewares/authUser"
import { createAuthRateLimiter } from "../configs/rateLimit";
import { validateBody } from "../middlewares/validate";
import { registerSchema, loginSchema, forgotPasswordSchema, resetPasswordSchema } from "../validators/schemas";

const userRouter = express.Router();

userRouter.post("/register", createAuthRateLimiter(), validateBody(registerSchema), registerUser);
userRouter.post("/login", createAuthRateLimiter(), validateBody(loginSchema), loginUser);
userRouter.post("/forgot-password", createAuthRateLimiter(), validateBody(forgotPasswordSchema), forgotPassword);
userRouter.post("/reset-password", createAuthRateLimiter(), validateBody(resetPasswordSchema), resetPassword);
userRouter.get("/is-auth", authUser, checkAuth);
userRouter.get("/logout", authUser, logoutUser);

export default userRouter;