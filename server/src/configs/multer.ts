import multer from "multer";

const ALLOWED_MIME_TYPES = ["image/jpeg", "image/png", "image/webp"];

export const upload = multer({
    storage: multer.diskStorage({
        destination: "public/uploads/",
        filename: (req, file, cb) => {
            cb(null, Date.now() + "-" + file.originalname);
        },
    }),
    limits: {
        fileSize: 5 * 1024 * 1024, // 5MB per image
        files: 6,
    },
    fileFilter: (req, file, cb) => {
        if (ALLOWED_MIME_TYPES.includes(file.mimetype)) {
            cb(null, true);
        } else {
            cb(new Error("Only JPEG, PNG, and WebP images are allowed"));
        }
    },
});