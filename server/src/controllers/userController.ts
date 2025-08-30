import prisma from "../configs/db";
import bcrypt from "bcryptjs";
import { Request, Response } from "express";
import jwt from "jsonwebtoken";

export const registerUser = async (req: Request, res: Response) => {
    try {
        const { name, email, password } = req.body;
        if (!name || !email || !password) {
            return res.status(400).json({ error: "Missing required fields" });
        }

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
        const token = jwt.sign({ id: user.id }, process.env.JWT_SECRET || "secret", {
            expiresIn: "2h",
        });
        res.cookie("token", token, {
            httpOnly: true,
            secure: process.env.NODE_ENV === "production",
            sameSite: process.env.NODE_ENV === "production" ? "none" : "strict", //csrf protection
            maxAge: 2 * 60 * 60 * 1000, //2 hour
        });
        return res.status(201).json({ user });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: "Failed to register user" });
    }
};

//login
export const loginUser = async (req: Request, res: Response) => {
    try {
        const { email, password } = req.body;
        if (!email || !password) {
            return res.status(400).json({ error: "Missing required fields" });
        }

        const user = await prisma.user.findUnique({ where: { email } });
        if (!user) {
            return res.status(400).json({ error: "User not found" });
        }

        const isPasswordValid = await bcrypt.compare(password, user.password);
        if (!isPasswordValid) {
            return res.status(400).json({ error: "Invalid password" });
        }

        const token = jwt.sign({ id: user.id }, process.env.JWT_SECRET || "secret", {
            expiresIn: "2h",
        });
        res.cookie("token", token, {
            httpOnly: true,
            secure: process.env.NODE_ENV === "production",
            sameSite: process.env.NODE_ENV === "production" ? "none" : "strict", //csrf protection
            maxAge: 2 * 60 * 60 * 1000, //2 hour
        });
        return res.status(200).json({ user });
    } catch (error) {
        console.error(error);
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
        console.error(error);
        res.status(500).json({ error: "Failed to check authentication" });
    }
};

//logout
export const logoutUser = async (req: Request, res: Response) => {
    try {
        res.clearCookie("token");
        return res.status(200).json({ message: "User logged out successfully" });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: "Failed to logout user" });
    }
};

