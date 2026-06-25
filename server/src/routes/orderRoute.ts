import express from "express";
import authUser from "../middlewares/authUser";
import authSeller from "../middlewares/authSeller";
import { placeOrderCOD, orderDetails, getAllOrders } from "../controllers/orderController";

const orderRouter = express.Router();

orderRouter.post("/cod", authUser, placeOrderCOD);
orderRouter.get("/user", authUser, orderDetails);
orderRouter.get("/seller", authSeller, getAllOrders);

export default orderRouter;