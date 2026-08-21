import { Request, Response, NextFunction } from "express";
import type { ZodType } from "zod";

// Validates req.body against a zod schema. On success, req.body is replaced
// with the parsed (and coerced/defaulted) data. On failure, responds 400
// with the first validation issue instead of letting a bad payload reach
// the controller/Prisma.
export const validateBody = (schema: ZodType) => (req: Request, res: Response, next: NextFunction) => {
    const result = schema.safeParse(req.body);
    if (!result.success) {
        const first = result.error.issues[0];
        const field = first?.path?.length ? `${first.path.join(".")}: ` : "";
        return res.status(400).json({ error: `${field}${first?.message || "Invalid request body"}` });
    }
    req.body = result.data;
    next();
};
