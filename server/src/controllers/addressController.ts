import prisma from "../configs/db";
import { Request, Response } from "express";
import logger from "../configs/logger";

export const addAddress = async (req: Request, res: Response) => {
    try {
        const userId = req.userId;
        if (!userId) {
            return res.status(401).json({ error: "Unauthorized" });
        }
        const { address } = req.body;
        const created = await prisma.address.create({ data: { userId, ...address } });
        return res.status(200).json({ address: created });
    } catch (error) {
        logger.error(error);
        res.status(500).json({ error: "Failed to add address" });
    }
};

// Lists all saved addresses for the user, newest first
export const listAddresses = async (req: Request, res: Response) => {
    try {
        const userId = req.userId;
        if (!userId) {
            return res.status(400).json({ error: "Missing userId" });
        }
        const addresses = await prisma.address.findMany({
            where: { userId },
            orderBy: { createdAt: "desc" },
        });
        return res.status(200).json({ addresses });
    } catch (error) {
        logger.error(error);
        res.status(500).json({ error: "Failed to get addresses" });
    }
};

export const updateAddress = async (req: Request, res: Response) => {
    try {
        const userId = req.userId;
        const { id } = req.params;
        const { address } = req.body;

        const existing = await prisma.address.findUnique({ where: { id: Number(id) } });
        if (!existing || existing.userId !== userId) {
            return res.status(404).json({ error: "Address not found" });
        }

        const updated = await prisma.address.update({ where: { id: Number(id) }, data: address });
        return res.status(200).json({ address: updated });
    } catch (error) {
        logger.error(error);
        res.status(500).json({ error: "Failed to update address" });
    }
};

export const deleteAddress = async (req: Request, res: Response) => {
    try {
        const userId = req.userId;
        const { id } = req.params;

        const existing = await prisma.address.findUnique({ where: { id: Number(id) } });
        if (!existing || existing.userId !== userId) {
            return res.status(404).json({ error: "Address not found" });
        }

        await prisma.address.delete({ where: { id: Number(id) } });
        return res.status(200).json({ success: true });
    } catch (error: any) {
        if (error?.code === "P2003") {
            return res.status(400).json({ error: "Cannot delete an address that's attached to an existing order." });
        }
        logger.error(error);
        res.status(500).json({ error: "Failed to delete address" });
    }
};
