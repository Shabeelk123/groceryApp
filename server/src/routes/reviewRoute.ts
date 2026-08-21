import express from "express";
import { createReview, deleteReview, listReviews } from "../controllers/reviewController";
import authUser from "../middlewares/authUser";
import { validateBody } from "../middlewares/validate";
import { createReviewSchema } from "../validators/schemas";

const reviewRouter = express.Router();

reviewRouter.get("/product/:productId", listReviews);
reviewRouter.post("/", authUser, validateBody(createReviewSchema), createReview);
reviewRouter.delete("/:id", authUser, deleteReview);

export default reviewRouter;
