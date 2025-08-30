import { NextFunction, Request, Response } from "express";
import jwt from "jsonwebtoken";

interface JwtPayload {
    email: string;
    iat?: number;
    exp?: number;
}


const authSeller = (req: Request, res: Response, next: NextFunction) => {
    const { sellerToken } = req.cookies;
    
    if (!sellerToken) {
        return res.status(401).json({ error: "Unauthorized - No token provided" });
    }
    
    try {
        const decoded = jwt.verify(sellerToken, process.env.JWT_SECRET || "secret") as JwtPayload;
        
        if (decoded.email === process.env.SELLER_EMAIL) {
            next();
        } else {
            return res.status(401).json({ error: "Unauthorized - Invalid token payload" });
        }
    } catch (error) {
        console.error("JWT verification error:", error);
        return res.status(401).json({ error: "Unauthorized - Invalid token" });
    }
};

export default authSeller;
