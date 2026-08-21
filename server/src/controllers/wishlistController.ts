import prisma from "../configs/db";
import { Request, Response } from "express";
import logger from "../configs/logger";

export const listWishlist = async (req: Request, res: Response) => {
    try {
        const userId = req.userId;
        if (!userId) {
            return res.status(401).json({ error: "Unauthorized" });
        }
        const items = await prisma.wishlist.findMany({
            where: { userId },
            include: { product: true },
            orderBy: { createdAt: "desc" },
        });
        return res.status(200).json({ items });
    } catch (error) {
        logger.error(error);
        res.status(500).json({ error: "Failed to get wishlist" });
    }
};

export const addToWishlist = async (req: Request, res: Response) => {
    try {
        const userId = req.userId;
        if (!userId) {
            return res.status(401).json({ error: "Unauthorized" });
        }
        const { productId } = req.body;

        const existing = await prisma.wishlist.findUnique({
            where: { userId_productId: { userId, productId } },
        });
        if (existing) {
            return res.status(200).json({ item: existing });
        }

        const item = await prisma.wishlist.create({
            data: { userId, productId },
            include: { product: true },
        });
        return res.status(201).json({ item });
    } catch (error) {
        logger.error(error);
        res.status(500).json({ error: "Failed to add to wishlist" });
    }
};

export const removeFromWishlist = async (req: Request, res: Response) => {
    try {
        const userId = req.userId;
        if (!userId) {
            return res.status(401).json({ error: "Unauthorized" });
        }
        const productId = Number(req.params.productId);
        await prisma.wishlist.deleteMany({ where: { userId, productId } });
        return res.status(200).json({ success: true });
    } catch (error) {
        logger.error(error);
        res.status(500).json({ error: "Failed to remove from wishlist" });
    }
};
