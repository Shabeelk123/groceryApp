import prisma from "../configs/db";
import cloudinary from "cloudinary";
import { Request, Response } from "express";
import { productDataSchema } from "../validators/schemas";
import logger from "../configs/logger";

export const addProduct = async (req: Request, res: Response) => {
    try {
        let parsedJson: unknown;
        try {
            parsedJson = JSON.parse(req.body?.productData);
        } catch {
            return res.status(400).json({ error: "Invalid productData JSON" });
        }

        const result = productDataSchema.safeParse(parsedJson);
        if (!result.success) {
            const first = result.error.issues[0];
            return res.status(400).json({ error: first?.message || "Invalid product data" });
        }
        const productData = result.data;

        const images = req.files as Express.Multer.File[];
        if (!images || images.length === 0) {
            return res.status(400).json({ error: "Missing images" });
        }
        const imageUrls = await Promise.all(images.map(async (image: Express.Multer.File) => {
            const result = await cloudinary.v2.uploader.upload(image.path, {
                resource_type: "image"
            });
            return result.secure_url;
        }));

        const product = await prisma.product.create({ data: { ...productData, image: imageUrls } });
        return res.status(201).json({ product });
    } catch (error) {
        logger.error(error);
        res.status(500).json({ error: "Failed to add product" });
    }
};

// PRODUCT list — supports optional ?page=&limit=&search=&category=&sort=
// for the seller admin table. Called with no query params, behaves exactly
// as before (returns every product) so the public storefront is unaffected.
export const listProducts = async (req: Request, res: Response) => {
    try {
        const { page, limit, search, category, sort } = req.query as Record<string, string | undefined>;

        const where: any = {};
        if (search) where.name = { contains: search, mode: "insensitive" };
        if (category) where.category = category;

        const orderBy: any =
            sort === "price-asc" ? { offerPrice: "asc" } :
            sort === "price-desc" ? { offerPrice: "desc" } :
            sort === "oldest" ? { createdAt: "asc" } :
            { createdAt: "desc" };

        if (!page) {
            // No pagination requested — original unpaginated behavior
            const products = await prisma.product.findMany({ where, orderBy });
            return res.status(200).json({ products });
        }

        const pageNum = Math.max(1, Number(page) || 1);
        const pageSize = Math.min(100, Math.max(1, Number(limit) || 20));

        const [products, total] = await Promise.all([
            prisma.product.findMany({
                where,
                orderBy,
                skip: (pageNum - 1) * pageSize,
                take: pageSize,
            }),
            prisma.product.count({ where }),
        ]);

        return res.status(200).json({
            products,
            pagination: { page: pageNum, limit: pageSize, total, totalPages: Math.ceil(total / pageSize) },
        });
    } catch (error) {
        logger.error(error);
        res.status(500).json({ error: "Failed to list products" });
    }
};

//single product
export const singleProduct = async (req: Request, res: Response) => {
    try {
        const { id } = req.params;
        const product = await prisma.product.findUnique({ where: { id: Number(id) } });
        return res.status(200).json({ product });
    } catch (error) {
        logger.error(error);
        res.status(500).json({ error: "Failed to get product" });
    }
};

//change stock
export const changeStock = async (req: Request, res: Response) => {
    try {
        const { id } = req.params;
        const { inStock } = req.body;
        const product = await prisma.product.update({ where: { id: Number(id) }, data: { inStock } });
        return res.status(200).json({ product });
    } catch (error) {
        logger.error(error);
        res.status(500).json({ error: "Failed to change stock" });
    }
};

// full product edit — name/description/price/offerPrice/category/model/inStock,
// and optionally replace all images if new files are uploaded
export const updateProduct = async (req: Request, res: Response) => {
    try {
        const { id } = req.params;
        const existing = await prisma.product.findUnique({ where: { id: Number(id) } });
        if (!existing) {
            return res.status(404).json({ error: "Product not found" });
        }

        let parsedJson: unknown;
        try {
            parsedJson = JSON.parse(req.body?.productData);
        } catch {
            return res.status(400).json({ error: "Invalid productData JSON" });
        }

        const result = productDataSchema.safeParse(parsedJson);
        if (!result.success) {
            const first = result.error.issues[0];
            return res.status(400).json({ error: first?.message || "Invalid product data" });
        }
        const { name, description, price, offerPrice, category, model, inStock } = result.data;

        const images = req.files as Express.Multer.File[] | undefined;
        let imageUrls: string[] | undefined;
        if (images && images.length > 0) {
            imageUrls = await Promise.all(images.map(async (image: Express.Multer.File) => {
                const result = await cloudinary.v2.uploader.upload(image.path, {
                    resource_type: "image"
                });
                return result.secure_url;
            }));
        }

        const product = await prisma.product.update({
            where: { id: Number(id) },
            data: {
                name, description, price, offerPrice, category, model, inStock,
                ...(imageUrls ? { image: imageUrls } : {}),
            },
        });
        return res.status(200).json({ product });
    } catch (error) {
        logger.error(error);
        res.status(500).json({ error: "Failed to update product" });
    }
};

export const deleteProduct = async (req: Request, res: Response) => {
    try {
        const { id } = req.params;
        await prisma.product.delete({ where: { id: Number(id) } });
        return res.status(200).json({ success: true });
    } catch (error: any) {
        // FK constraint (orderItems references this product) — Prisma error code P2003
        if (error?.code === "P2003") {
            return res.status(400).json({ error: "Cannot delete a product that has existing orders. Mark it out of stock instead." });
        }
        logger.error(error);
        res.status(500).json({ error: "Failed to delete product" });
    }
};
