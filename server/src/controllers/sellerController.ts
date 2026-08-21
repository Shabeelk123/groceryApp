import { Request, Response } from "express";
import jwt from "jsonwebtoken";
import { JWT_SECRET } from "../configs/env";
import logger from "../configs/logger";
interface JwtPayload {
    email: string;
    iat?: number;
    exp?: number;
}

export const sellerLogin = async (req: Request, res: Response) => {
    try {
        const { email, password } = req.body;
        if(password===process.env.SELLER_PASSWORD && email===process.env.SELLER_EMAIL){
            const token = jwt.sign({ email }, JWT_SECRET, {
                expiresIn: "2h",
            });
            res.cookie("sellerToken", token, {
                httpOnly: true,
                secure: process.env.NODE_ENV === "production",
                sameSite: process.env.NODE_ENV === "production" ? "none" : "strict", //csrf protection
                maxAge: 2 * 60 * 60 * 1000, //2 hour
            });
            return res.status(200).json({ message: "Seller logged in successfully" });
        }
        return res.status(401).json({ error: "Invalid email or password" });
    } catch (error) {
        logger.error(error);
        res.status(500).json({ error: "Failed to login seller" });
    }
};

//seller auth
export const sellerAuth = (req: Request, res: Response) => {
    const token = req.cookies.sellerToken;
    if (!token) {
        return res.status(401).json({ error: "Unauthorized - No token provided" });
    }
    try {
        const decoded = jwt.verify(token, JWT_SECRET) as JwtPayload;
        if (decoded.email === process.env.SELLER_EMAIL) {
            return res.status(200).json({success: true, message: "Seller authenticated successfully" });
        } else {
            return res.status(401).json({success: false, error: "Unauthorized - Invalid token payload" });
        }
    } catch (error) {
        logger.error({ error }, "JWT verification error");
        return res.status(401).json({ error: "Unauthorized - Invalid token" });
    }
};

//seller logout
export const sellerLogout = (req: Request, res: Response) => {
    try {
        res.clearCookie("sellerToken");
        return res.status(200).json({ message: "Seller logged out successfully" });
    } catch (error) {
        logger.error(error);
        res.status(500).json({ error: "Failed to logout seller" });
    }
};
