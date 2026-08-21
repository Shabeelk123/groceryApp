import express from "express";
import { addAddress, deleteAddress, listAddresses, updateAddress } from "../controllers/addressController";
import authUser from "../middlewares/authUser";
import { validateBody } from "../middlewares/validate";
import { addAddressSchema, updateAddressSchema } from "../validators/schemas";

const addressRouter = express.Router();

addressRouter.post("/add", authUser, validateBody(addAddressSchema), addAddress);
addressRouter.get("/list", authUser, listAddresses);
addressRouter.put("/:id", authUser, validateBody(updateAddressSchema), updateAddress);
addressRouter.delete("/:id", authUser, deleteAddress);

export default addressRouter;
