import express from "express";
import { sellerLogin, sellerAuth, sellerLogout } from "../controllers/sellerController";
import authSeller from "../middlewares/authSeller";
import { createAuthRateLimiter } from "../configs/rateLimit";
import { validateBody } from "../middlewares/validate";
import { sellerLoginSchema } from "../validators/schemas";

const sellerRouter = express.Router();

sellerRouter.post("/login", createAuthRateLimiter(), validateBody(sellerLoginSchema), sellerLogin);
sellerRouter.get("/auth", authSeller, sellerAuth);
sellerRouter.get("/logout", authSeller, sellerLogout);

export default sellerRouter;
