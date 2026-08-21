import express from "express";
import { addToWishlist, listWishlist, removeFromWishlist } from "../controllers/wishlistController";
import authUser from "../middlewares/authUser";
import { validateBody } from "../middlewares/validate";
import { wishlistAddSchema } from "../validators/schemas";

const wishlistRouter = express.Router();

wishlistRouter.get("/", authUser, listWishlist);
wishlistRouter.post("/", authUser, validateBody(wishlistAddSchema), addToWishlist);
wishlistRouter.delete("/:productId", authUser, removeFromWishlist);

export default wishlistRouter;
