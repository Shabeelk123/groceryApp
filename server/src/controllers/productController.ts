import prisma from "../configs/db";
import cloudinary from "cloudinary";
import { Request, Response } from "express";

interface Product {
    name: string;
    description: string;
    price: number;
    offerPrice: number;
    image: string;
    inStock: boolean;
    category: string;
}

export const addProduct = async (req: Request, res: Response) => {
    try {
        let productData = JSON.parse(req.body?.productData);
        if (!productData.name || !productData.description || !productData.price || !productData.offerPrice || !productData.image || !productData.inStock || !productData.category) {
            return res.status(400).json({ error: "Missing required fields" });
        }
       
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

        const product = await prisma.product.create({...productData, image: imageUrls});
        return res.status(201).json({ product });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: "Failed to add product" });
    }
};

//PRODUCT list
export const listProducts = async (req: Request, res: Response) => {
    try {
        const products = await prisma.product.findMany();
        return res.status(200).json({ products });
    } catch (error) {
        console.error(error);
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
        console.error(error);
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
        console.error(error);
        res.status(500).json({ error: "Failed to change stock" });
    }
};
