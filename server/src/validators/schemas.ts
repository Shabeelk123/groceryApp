import { z } from "zod";

export const EMIRATES = ["Dubai", "Abu Dhabi", "Sharjah", "Ajman", "Umm Al Quwain", "Ras Al Khaimah", "Fujairah"] as const;

export const registerSchema = z.object({
    name: z.string().trim().min(1, "Name is required").max(100),
    email: z.string().trim().toLowerCase().email("Invalid email address"),
    password: z.string().min(6, "Password must be at least 6 characters"),
});

export const loginSchema = z.object({
    email: z.string().trim().toLowerCase().email("Invalid email address"),
    password: z.string().min(1, "Password is required"),
});

export const forgotPasswordSchema = z.object({
    email: z.string().trim().toLowerCase().email("Invalid email address"),
});

export const resetPasswordSchema = z.object({
    token: z.string().min(1, "Reset token is required"),
    newPassword: z.string().min(6, "Password must be at least 6 characters"),
});

export const sellerLoginSchema = z.object({
    email: z.string().trim().toLowerCase().email("Invalid email address"),
    password: z.string().min(1, "Password is required"),
});

export const addressSchema = z.object({
    firstName: z.string().trim().min(1, "First name is required"),
    lastName: z.string().trim().min(1, "Last name is required"),
    street: z.string().trim().min(1, "Street is required"),
    city: z.string().trim().min(1, "City is required"),
    emirate: z.enum(EMIRATES, { message: "Emirate must be one of the 7 UAE Emirates" }),
    poBox: z.string().trim().nullable().optional(),
    zipCode: z.number().int().nullable().optional(),
    country: z.string().trim().min(1, "Country is required"),
    phone: z.string().trim().min(6, "Phone number looks too short"),
});

export const addAddressSchema = z.object({
    address: addressSchema,
});

export const updateAddressSchema = z.object({
    address: addressSchema,
});

export const productDataSchema = z.object({
    name: z.string().trim().min(1, "Product name is required"),
    description: z.string().trim().min(1, "Description is required"),
    price: z.number().positive("Price must be greater than 0"),
    offerPrice: z.number().positive("Offer price must be greater than 0"),
    category: z.string().trim().min(1, "Category is required"),
    model: z.string().trim().nullable().optional(),
    inStock: z.boolean(),
});

export const changeStockSchema = z.object({
    inStock: z.boolean(),
});

export const orderItemSchema = z.object({
    productId: z.number().int().positive(),
    quantity: z.number().int().positive(),
    price: z.number().nonnegative(),
});

export const placeOrderSchema = z.object({
    addressId: z.number().int().positive(),
    items: z.array(orderItemSchema).min(1, "Cart is empty"),
});

export const updateOrderStatusSchema = z.object({
    status: z.enum(["Order Placed", "Packed", "Shipped", "Delivered", "Cancelled"]),
});

export const createReviewSchema = z.object({
    productId: z.number().int().positive(),
    rating: z.number().int().min(1, "Rating must be between 1 and 5").max(5, "Rating must be between 1 and 5"),
    comment: z.string().trim().min(1, "Please write a comment").max(1000, "Comment is too long"),
});

export const wishlistAddSchema = z.object({
    productId: z.number().int().positive(),
});

export const cartUpdateSchema = z.object({
    // cartItems is a String[] of product IDs (see User.cartItems in schema.prisma —
    // quantity is represented by an ID repeating, not a separate quantity field)
    productId: z.string().min(1).optional(),
    cartItems: z.array(z.string()).optional(),
}).refine((data) => data.productId !== undefined || data.cartItems !== undefined, {
    message: "Either productId or cartItems must be provided",
});
