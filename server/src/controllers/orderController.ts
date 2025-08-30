import prisma from "../configs/db";
import { Request, Response } from "express";

export const placeOrderCOD = async (req: Request, res: Response) => {
    try {
        const { userId, items, addressId } = req.body;
        if (!userId || !items || !addressId) {
            return res.status(400).json({ error: "Missing required fields" });
        }
        //calculate total amount
        let totalAmount = await items.reduce(async (total: number, item: any) => {
            const product = await prisma.product.findUnique({ where: { id: item.productId } });
            if (!product) {
                throw new Error(`Product with id ${item.productId} not found`);
            }
            return total + product.offerPrice * item.quantity;
        }, 0);

        // add tax
        totalAmount += Math.round(totalAmount * 0.02);
        const order = await prisma.order.create({
            data: {
                userId,
                addressId,
                items,
                amount: totalAmount,
                paymentType: "COD",
                isPaid: false,
            },
        });
        return res.status(201).json({ order });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: "Failed to place order" });
    }
};

// order details of individual user
export const orderDetails = async (req: Request, res: Response) => {
    try {
        const { userId } = req.body;
        // verify isPaid is true and cod also
        const orders = await prisma.order.findMany({
            where: {
              userId: userId,
              OR: [
                { paymentType: "COD" },
                { isPaid: true }
              ],
            },
            include: {
              items: {
                include: {
                  product: true,   // populate product inside items
                },
              },
              address: true,       // populate address
            },
            orderBy: {
              createdAt: "desc",   // sort latest first
            },
          }); 
        return res.status(200).json({ orders });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: "Failed to get orders" });
    }
};

// get all oreder of admin
export const getAllOrders = async (req: Request, res: Response) => {
    try {
        // we need cod or ispaid condition
        const orders = await prisma.order.findMany({
            where: {
              OR: [
                { paymentType: "COD" },
                { isPaid: true }
              ],
            },
            include: {
              items: {
                include: {
                  product: true,   // populate product inside items
                },
              },
              address: true,       // populate address
            },
            orderBy: {
              createdAt: "desc",   // sort latest first
            },
          }); 
        return res.status(200).json({ orders });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: "Failed to get orders" });
    }
};