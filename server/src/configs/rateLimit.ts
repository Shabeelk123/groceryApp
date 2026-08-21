import rateLimit from "express-rate-limit";

// Throttles brute-force attempts against auth endpoints — 10 requests per 15
// minutes per IP. Each call creates an independent limiter/counter, so
// brute-forcing login doesn't also lock a user out of registration, and
// vice versa. Applied only to auth endpoints, not globally, so normal
// browsing/checkout traffic is unaffected.
export const createAuthRateLimiter = () => rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 10,
    message: { error: "Too many attempts. Please try again later." },
    standardHeaders: true,
    legacyHeaders: false,
});
