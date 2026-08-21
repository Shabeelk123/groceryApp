import prisma from "../configs/db";
import { Request, Response } from "express";
import { VAT_RATE, getShippingFee } from "../utils/pricing";
import logger from "../configs/logger";
import { sendEmail } from "../configs/email";

export const placeOrderCOD = async (req: Request, res: Response) => {
    try {
        const userId = req.userId;
        if (!userId) {
            return res.status(401).json({ error: "Unauthorized" });
        }
        const { items, addressId } = req.body;

        const address = await prisma.address.findUnique({ where: { id: addressId } });
        if (!address || address.userId !== userId) {
            return res.status(400).json({ error: "Invalid address" });
        }

        // Calculate subtotal using for...of to correctly await each lookup
        let subtotal = 0;
        for (const item of items) {
            const product = await prisma.product.findUnique({ where: { id: item.productId } });
            if (!product) {
                return res.status(404).json({ error: `Product with id ${item.productId} not found` });
            }
            subtotal += product.offerPrice * item.quantity;
        }

        const vat = subtotal * VAT_RATE;
        const shippingFee = getShippingFee(subtotal, address.emirate);
        const totalAmount = subtotal + vat + shippingFee;

        const order = await prisma.order.create({
            data: {
                userId,
                addressId,
                items: {
                    create: items.map((item: any) => ({
                        productId: item.productId,
                        quantity: item.quantity,
                        price: item.price,
                    })),
                },
                amount: totalAmount,
                paymentType: "COD",
                isPaid: false,
            },
        });

        try {
            const orderer = await prisma.user.findUnique({ where: { id: userId }, select: { email: true, name: true } });
            if (orderer) {
                await sendEmail({
                    to: orderer.email,
                    subject: `Order Confirmed — #${order.id}`,
                    text: `Hi ${orderer.name}, your order #${order.id} for AED ${totalAmount.toFixed(2)} has been placed (Cash on Delivery). We'll email you when it ships.`,
                });
            }
        } catch (emailError) {
            logger.error(emailError, "Failed to send order confirmation email");
        }

        return res.status(201).json({ success: true, order });
    } catch (error) {
        logger.error(error);
        res.status(500).json({ error: "Failed to place order" });
    }
};

// order details of individual user
export const orderDetails = async (req: Request, res: Response) => {
    try {
        const userId = req.userId;
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
        logger.error(error);
        res.status(500).json({ error: "Failed to get orders" });
    }
};

export const updateOrderStatus = async (req: Request, res: Response) => {
    try {
        const { id } = req.params;
        const { status } = req.body;
        const order = await prisma.order.update({
            where: { id: Number(id) },
            data: { status },
            include: { user: { select: { email: true, name: true } } },
        });

        try {
            await sendEmail({
                to: order.user.email,
                subject: `Order #${order.id} update: ${status}`,
                text: `Hi ${order.user.name}, your order #${order.id} status has been updated to: ${status}.`,
            });
        } catch (emailError) {
            logger.error(emailError, "Failed to send order status update email");
        }

        const { user, ...orderData } = order;
        return res.status(200).json({ order: orderData });
    } catch (error) {
        logger.error(error);
        res.status(500).json({ error: "Failed to update order status" });
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
        logger.error(error);
        res.status(500).json({ error: "Failed to get orders" });
    }
};