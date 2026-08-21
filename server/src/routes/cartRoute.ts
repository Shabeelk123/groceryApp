import express from "express";
import { updateCart } from "../controllers/cartController";
import authUser from "../middlewares/authUser";
import { validateBody } from "../middlewares/validate";
import { cartUpdateSchema } from "../validators/schemas";

const cartRouter = express.Router();

cartRouter.post("/update", authUser, validateBody(cartUpdateSchema), updateCart);

export default cartRouter;
