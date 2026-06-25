import { Request, Response } from "express";
import jwt from "jsonwebtoken";
interface JwtPayload {
    email: string;
    iat?: number;
    exp?: number;
}

export const sellerLogin = async (req: Request, res: Response) => {
    try {
        const { email, password } = req.body;
        if (!email || !password) {
            return res.status(400).json({ error: "Missing required fields" });
        }
        if(password===process.env.SELLER_PASSWORD && email===process.env.SELLER_EMAIL){
            const token = jwt.sign({ email }, process.env.JWT_SECRET || "secret", {
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
    } catch (error) {
        console.error(error);
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
        const decoded = jwt.verify(token, process.env.JWT_SECRET || "secret") as JwtPayload;
        if (decoded.email === process.env.SELLER_EMAIL) {
            return res.status(200).json({success: true, message: "Seller authenticated successfully" });
        } else {
            return res.status(401).json({success: false, error: "Unauthorized - Invalid token payload" });
        }
    } catch (error) {
        console.error("JWT verification error:", error);
        return res.status(401).json({ error: "Unauthorized - Invalid token" });
    }
};

//seller logout
export const sellerLogout = (req: Request, res: Response) => {
    try {
        res.clearCookie("sellerToken");
        return res.status(200).json({ message: "Seller logged out successfully" });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: "Failed to logout seller" });
    }
};
