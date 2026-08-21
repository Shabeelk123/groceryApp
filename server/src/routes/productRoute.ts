import express from "express";
import { addProduct, changeStock, deleteProduct, listProducts, singleProduct, updateProduct } from "../controllers/productController";
import authSeller from "../middlewares/authSeller";
import { upload } from "../configs/multer";

const productRouter = express.Router();

productRouter.post("/add", authSeller, upload.array("images"), addProduct);
productRouter.get("/list", listProducts);
productRouter.get("/:id", singleProduct);
productRouter.put("/:id", authSeller, changeStock);
productRouter.patch("/:id", authSeller, upload.array("images"), updateProduct);
productRouter.delete("/:id", authSeller, deleteProduct);

export default productRouter;
