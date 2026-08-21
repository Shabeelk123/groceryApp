import prisma from "../configs/db";
import bcrypt from "bcryptjs";
import crypto from "crypto";
import { Request, Response } from "express";
import jwt from "jsonwebtoken";
import { JWT_SECRET } from "../configs/env";
import logger from "../configs/logger";
import { sendEmail } from "../configs/email";

export const registerUser = async (req: Request, res: Response) => {
    try {
        const { name, email, password } = req.body;

        const existingUser = await prisma.user.findUnique({ where: { email } });
        if (existingUser) {
            return res.status(400).json({ error: "User already exists" });
        }

        const hashedPassword = await bcrypt.hash(password, 10);

        const user = await prisma.user.create({
            data: {
                name,
                email,
                password: hashedPassword,
            },
        });
        //token
        const token = jwt.sign({ id: user.id }, JWT_SECRET, {
            expiresIn: "2h",
        });
        res.cookie("token", token, {
            httpOnly: true,
            secure: process.env.NODE_ENV === "production",
            sameSite: process.env.NODE_ENV === "production" ? "none" : "strict", //csrf protection
            maxAge: 2 * 60 * 60 * 1000, //2 hour
        });
        const { password: _password, ...safeUser } = user;
        return res.status(201).json({ user: safeUser });
    } catch (error) {
        logger.error(error);
        res.status(500).json({ error: "Failed to register user" });
    }
};

//login
export const loginUser = async (req: Request, res: Response) => {
    try {
        const { email, password } = req.body;

        const user = await prisma.user.findUnique({ where: { email } });
        if (!user) {
            return res.status(400).json({ error: "User not found" });
        }

        const isPasswordValid = await bcrypt.compare(password, user.password);
        if (!isPasswordValid) {
            return res.status(400).json({ error: "Invalid password" });
        }

        const token = jwt.sign({ id: user.id }, JWT_SECRET, {
            expiresIn: "2h",
        });
        res.cookie("token", token, {
            httpOnly: true,
            secure: process.env.NODE_ENV === "production",
            sameSite: process.env.NODE_ENV === "production" ? "none" : "strict", //csrf protection
            maxAge: 2 * 60 * 60 * 1000, //2 hour
        });
        const { password: _password, ...safeUser } = user;
        return res.status(200).json({ user: safeUser });
    } catch (error) {
        logger.error(error);
        res.status(500).json({ error: "Failed to login user" });
    }
};

//checkAuth
export const checkAuth = async (req: Request, res: Response) => {
    try {
        const userId = req.userId;
        if (!userId) {
            return res.status(401).json({ error: "User ID not found in request" });
        }
        
        // have to exclude password from return
        const user = await prisma.user.findUnique({ where: { id: userId }, select: { id: true, name: true, email: true, cartItems: true }});
        if (!user) {
            return res.status(400).json({ error: "User not found" });
        }
        return res.status(200).json({ user });
    } catch (error) {
        logger.error(error);
        res.status(500).json({ error: "Failed to check authentication" });
    }
};

// Always responds the same way whether or not the email is registered —
// don't leak which emails exist in the system
export const forgotPassword = async (req: Request, res: Response) => {
    try {
        const { email } = req.body;
        const user = await prisma.user.findUnique({ where: { email } });

        if (user) {
            const token = crypto.randomBytes(32).toString("hex");
            const tokenHash = crypto.createHash("sha256").update(token).digest("hex");
            const expiry = new Date(Date.now() + 60 * 60 * 1000); // 1 hour

            await prisma.user.update({
                where: { id: user.id },
                data: { resetTokenHash: tokenHash, resetTokenExpiry: expiry },
            });

            const resetUrl = `${process.env.FRONTEND_URL || "http://localhost:5173"}/reset-password?token=${token}`;
            await sendEmail({
                to: user.email,
                subject: "Reset your CaseHub password",
                text: `Click this link to reset your password (expires in 1 hour): ${resetUrl}`,
            });
        }

        return res.status(200).json({ message: "If an account exists for that email, a reset link has been sent." });
    } catch (error) {
        logger.error(error);
        res.status(500).json({ error: "Failed to process request" });
    }
};

export const resetPassword = async (req: Request, res: Response) => {
    try {
        const { token, newPassword } = req.body;
        const tokenHash = crypto.createHash("sha256").update(token).digest("hex");

        const user = await prisma.user.findFirst({
            where: { resetTokenHash: tokenHash, resetTokenExpiry: { gt: new Date() } },
        });
        if (!user) {
            return res.status(400).json({ error: "This reset link is invalid or has expired" });
        }

        const hashedPassword = await bcrypt.hash(newPassword, 10);
        await prisma.user.update({
            where: { id: user.id },
            data: { password: hashedPassword, resetTokenHash: null, resetTokenExpiry: null },
        });

        return res.status(200).json({ message: "Password reset successfully" });
    } catch (error) {
        logger.error(error);
        res.status(500).json({ error: "Failed to reset password" });
    }
};

//logout
export const logoutUser = async (req: Request, res: Response) => {
    try {
        res.clearCookie("token");
        return res.status(200).json({ message: "User logged out successfully" });
    } catch (error) {
        logger.error(error);
        res.status(500).json({ error: "Failed to logout user" });
    }
};

