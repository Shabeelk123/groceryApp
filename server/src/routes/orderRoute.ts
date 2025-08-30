import express from "express";
import authUser from "../middlewares/authUser";
import { placeOrderCOD, orderDetails, getAllOrders } from "../controllers/orderController";

const orderRouter = express.Router();

orderRouter.post("/cod", authUser, placeOrderCOD);
orderRouter.get("/user", authUser, orderDetails);
orderRouter.get("/seller", authUser, getAllOrders);

export default orderRouter;