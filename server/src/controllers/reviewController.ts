import prisma from "../configs/db";
import { Request, Response } from "express";
import logger from "../configs/logger";

// Public — list reviews for a product, newest first, with the average rating
export const listReviews = async (req: Request, res: Response) => {
    try {
        const productId = Number(req.params.productId);
        const reviews = await prisma.review.findMany({
            where: { productId },
            include: { user: { select: { name: true } } },
            orderBy: { createdAt: "desc" },
        });
        const avgRating = reviews.length > 0
            ? reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length
            : 0;
        return res.status(200).json({ reviews, avgRating, count: reviews.length });
    } catch (error) {
        logger.error(error);
        res.status(500).json({ error: "Failed to get reviews" });
    }
};

export const createReview = async (req: Request, res: Response) => {
    try {
        const userId = req.userId;
        if (!userId) {
            return res.status(401).json({ error: "Unauthorized" });
        }
        const { productId, rating, comment } = req.body;

        const existing = await prisma.review.findUnique({
            where: { userId_productId: { userId, productId } },
        });
        if (existing) {
            return res.status(400).json({ error: "You've already reviewed this product" });
        }

        // Verified purchase — has this user ever ordered this product?
        const purchase = await prisma.orderItem.findFirst({
            where: { productId, order: { userId } },
        });

        const review = await prisma.review.create({
            data: { userId, productId, rating, comment, verifiedPurchase: !!purchase },
            include: { user: { select: { name: true } } },
        });
        return res.status(201).json({ review });
    } catch (error) {
        logger.error(error);
        res.status(500).json({ error: "Failed to create review" });
    }
};

export const deleteReview = async (req: Request, res: Response) => {
    try {
        const userId = req.userId;
        const { id } = req.params;
        const existing = await prisma.review.findUnique({ where: { id: Number(id) } });
        if (!existing || existing.userId !== userId) {
            return res.status(404).json({ error: "Review not found" });
        }
        await prisma.review.delete({ where: { id: Number(id) } });
        return res.status(200).json({ success: true });
    } catch (error) {
        logger.error(error);
        res.status(500).json({ error: "Failed to delete review" });
    }
};
