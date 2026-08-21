import express from "express";
import authUser from "../middlewares/authUser";
import authSeller from "../middlewares/authSeller";
import { placeOrderCOD, orderDetails, getAllOrders, updateOrderStatus } from "../controllers/orderController";
import { validateBody } from "../middlewares/validate";
import { placeOrderSchema, updateOrderStatusSchema } from "../validators/schemas";

const orderRouter = express.Router();

orderRouter.post("/cod", authUser, validateBody(placeOrderSchema), placeOrderCOD);
orderRouter.get("/user", authUser, orderDetails);
orderRouter.get("/seller", authSeller, getAllOrders);
orderRouter.patch("/:id/status", authSeller, validateBody(updateOrderStatusSchema), updateOrderStatus);

export default orderRouter;