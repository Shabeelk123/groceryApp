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
app.use(cors({
    origin: process.env.FRONTEND_URL || "http://localhost:5173", // Vite default port
    credentials: true, // Allow cookies to be sent
    methods: ["GET", "POST", "PUT", "DELETE"],
    allowedHeaders: ["Content-Type", "Authorization"]
}));
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
