import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import userRouter from "./routes/userRoute";
import cookieParser from "cookie-parser";
import sellerRouter from "./routes/sellerRoute";
import connectCloudinary from "./configs/cloudinry";
import productRouter from "./routes/productRoute";
import cartRouter from "./routes/cartRoute";
import addressRouter from "./routes/addressRoute";
import orderRouter from "./routes/orderRoute";

// Load environment variables first
dotenv.config();

const app = express();

const PORT = process.env.PORT || 3000;

connectCloudinary();

app.use(express.json());

const ALLOWED_ORIGINS = [
    process.env.FRONTEND_URL || "http://localhost:5173",
    "http://localhost:5173",
    "http://127.0.0.1:5173",
];

app.use(cors({
    origin: (origin, callback) => {
        // Allow requests with no origin (e.g. mobile apps, curl, Postman)
        if (!origin) return callback(null, true);
        if (ALLOWED_ORIGINS.includes(origin)) {
            callback(null, origin); // reflect the exact origin — never returns "*"
        } else {
            callback(new Error(`CORS: origin ${origin} not allowed`));
        }
    },
    credentials: true,
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
}));

// Handle preflight for all routes (compatible with express 5 / path-to-regexp)
app.options(/.*/, cors());
app.use(cookieParser());


app.get("/", async (req, res) => {
    res.send("Hello World!");
});
app.use("/api/users", userRouter);
app.use("/api/sellers", sellerRouter);
app.use("/api/products", productRouter);
app.use("/api/cart", cartRouter);
app.use("/api/address", addressRouter);
app.use("/api/order", orderRouter);

app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
