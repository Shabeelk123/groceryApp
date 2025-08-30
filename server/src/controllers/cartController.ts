import prisma from "../configs/db";
import { Request, Response } from "express";

export const updateCart = async (req: Request, res: Response) => {
    try {
        const { productId, userId } = req.body;
        const cart = await prisma.user.update({
            where: { id: userId },
            data: { cartItems: { push: productId } },
        });
        return res.status(200).json({ cart });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: "Failed to update cart" });
    }
};