import prisma from "../configs/db";
import { Request, Response } from "express";

export const addAddress = async (req: Request, res: Response) => {
    try {
        const { userId, address } = req.body;
        const addresses = await prisma.address.create({ data: { userId, ...address } });
        return res.status(200).json({ addresses });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: "Failed to add address" });
    }
};

export const getAddress = async (req: Request, res: Response) => {
    try {
        const { userId } = req.body;
        const addresses = await prisma.address.findUnique({ where: { userId } });
        return res.status(200).json({ addresses });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: "Failed to get addresses" });
    }
};