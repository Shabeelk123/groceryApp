import { NextFunction, Request, Response, RequestHandler } from "express";
import jwt from "jsonwebtoken";

interface JwtPayload {
    id: number;
    iat?: number;
    exp?: number;
}

// Extend Request interface to include userId
declare global {
    namespace Express {
        interface Request {
            userId?: number;
        }
    }
}

const authUser: RequestHandler = (req: Request, res: Response, next: NextFunction) => {
    const token = req.cookies.token;
    
    if (!token) {
        return res.status(401).json({ error: "Unauthorized - No token provided" });
    }
    
    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET || "secret") as JwtPayload;
        
        if (decoded.id) {
            // Set userId on the request object instead of req.body
            req.userId = decoded.id;
            next();
        } else {
            return res.status(401).json({ error: "Unauthorized - Invalid token payload" });
        }
    } catch (error) {
        console.error("JWT verification error:", error);
        return res.status(401).json({ error: "Unauthorized - Invalid token" });
    }
};

export default authUser;
