import cloudinary from "cloudinary";

const connectCloudinary = async () => {
    try {
        await cloudinary.v2.config({
            cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
            api_key: process.env.CLOUDINARY_API_KEY,
            api_secret: process.env.CLOUDINARY_API_SECRET,
        });
        console.log("Cloudinary connected successfully");
    } catch (error) {
        console.error("Failed to connect to Cloudinary:", error);
    }
};

export default connectCloudinary;
