import express from "express";
import { addProduct, changeStock, listProducts, singleProduct } from "../controllers/productController";
import authSeller from "../middlewares/authSeller";
import { upload } from "../configs/multer";

const productRouter = express.Router();

productRouter.post("/add", upload.array("images"), authSeller, addProduct);
productRouter.get("/list", listProducts);
productRouter.get("/:id", singleProduct);
productRouter.put("/:id", authSeller, changeStock);

export default productRouter;
