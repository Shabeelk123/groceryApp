// Fails fast on startup instead of silently signing/verifying JWTs with a guessable fallback secret.
if (!process.env.JWT_SECRET) {
    throw new Error("JWT_SECRET environment variable is required but not set");
}

export const JWT_SECRET = process.env.JWT_SECRET;
