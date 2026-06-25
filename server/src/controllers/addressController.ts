import prisma from "../configs/db";
import { Request, Response } from "express";

export const addAddress = async (req: Request, res: Response) => {
    try {
        const userId = req.userId;
        const { address } = req.body;
        if (!userId || !address) {
            return res.status(400).json({ error: "Missing required fields" });
        }
        const addresses = await prisma.address.create({ data: { userId, ...address } });
        return res.status(200).json({ addresses });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: "Failed to add address" });
    }
};

export const getAddress = async (req: Request, res: Response) => {
    try {
        const userId = req.userId;
        if (!userId) {
            return res.status(400).json({ error: "Missing userId" });
        }
        const addresses = await prisma.address.findFirst({
            where: { userId },
            orderBy: { createdAt: "desc" },
        });
        return res.status(200).json({ addresses });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: "Failed to get address" });
    }
};