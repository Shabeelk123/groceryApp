import prisma from "../configs/db";
import { Request, Response } from "express";
import logger from "../configs/logger";

export const updateCart = async (req: Request, res: Response) => {
    try {
        const userId = req.userId;
        if (!userId) {
            return res.status(401).json({ error: "Unauthorized" });
        }

        const { productId, cartItems } = req.body;

        let cart;

        if (cartItems !== undefined) {
            // Replace the entire cart array (used for removal, quantity change, and clearing)
            cart = await prisma.user.update({
                where: { id: userId },
                data: { cartItems },
                select: { cartItems: true },
            });
        } else if (productId !== undefined) {
            // Push a single product ID into the cart array
            cart = await prisma.user.update({
                where: { id: userId },
                data: { cartItems: { push: productId } },
                select: { cartItems: true },
            });
        } else {
            return res.status(400).json({ error: "Either productId or cartItems must be provided" });
        }

        return res.status(200).json({ cart });
    } catch (error) {
        logger.error(error);
        res.status(500).json({ error: "Failed to update cart" });
    }
};