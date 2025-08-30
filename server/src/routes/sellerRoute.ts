import express from "express";
import { sellerLogin, sellerAuth, sellerLogout } from "../controllers/sellerController";
import authSeller from "../middlewares/authSeller";

const sellerRouter = express.Router();

sellerRouter.post("/login", sellerLogin);
sellerRouter.get("/auth", authSeller, sellerAuth);
sellerRouter.get("/logout", authSeller, sellerLogout);

export default sellerRouter;
