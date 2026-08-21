import express from "express";
import { addAddress, deleteAddress, listAddresses, updateAddress } from "../controllers/addressController";
import authUser from "../middlewares/authUser";

const addressRouter = express.Router();

addressRouter.post("/add", authUser, addAddress);
addressRouter.get("/list", authUser, listAddresses);
addressRouter.put("/:id", authUser, updateAddress);
addressRouter.delete("/:id", authUser, deleteAddress);

export default addressRouter;
