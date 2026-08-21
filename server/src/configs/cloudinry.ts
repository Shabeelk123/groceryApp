import cloudinary from "cloudinary";
import logger from "./logger";

const connectCloudinary = async () => {
    try {
        await cloudinary.v2.config({
            cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
            api_key: process.env.CLOUDINARY_API_KEY,
            api_secret: process.env.CLOUDINARY_API_SECRET,
        });
        logger.info("Cloudinary connected successfully");
    } catch (error) {
        logger.error({ error }, "Failed to connect to Cloudinary");
    }
};

export default connectCloudinary;
