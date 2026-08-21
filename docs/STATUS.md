# Project Status — Dubai Mobile Accessories Store

Snapshot of what exists in the codebase today vs. what's missing, so we don't
re-discover this by re-reading files every session. Update this file whenever
a roadmap item in [ROADMAP.md](ROADMAP.md) is finished.

**Stack**: React 19 + Vite + Redux Toolkit + Tailwind 4 (client) · Express 5 +
Prisma + PostgreSQL + JWT auth + Cloudinary (server). Single-seller/admin
model (not multi-vendor).

---

## ✅ Completed / working

**Storefront**
- Home page with hero, categories, featured/trending products, collections, testimonials sections
- Product listing (`/products`) with client-side search, category filter, price filter, sort
- Category collection pages (`/collections/:category`)
- Product detail page with image gallery, related products, bundle upsell
- Cart page, add/remove/update quantity
- Checkout with saved-address reuse or new-address form
- Order history page (`/orders`)
- Cash-on-delivery order placement, end to end
- Content is already themed for the pivot: categories are iPhone Cases, MagSafe, Watch Bands, Earbuds, etc, and `Product.model` field exists for device compatibility (e.g. "iPhone 17 Pro Max")

**Auth**
- Register/login/logout with bcrypt password hashing + JWT in httpOnly cookie
- Session restore on page load (`/api/users/is-auth`)
- Protected routes on the client (`ProtectedRoute` component)
- Separate seller/admin login, gated by `SELLER_EMAIL`/`SELLER_PASSWORD` env vars (single hardcoded admin, not a real user role)
- `JWT_SECRET` is required at startup (`server/src/configs/env.ts`) — the server refuses to boot instead of silently falling back to a guessable secret

**Admin (seller) panel**
- Add product with multi-image upload to Cloudinary (JPEG/PNG/WebP only, 5MB/6-file limits)
- Product list view, toggle in-stock/out-of-stock
- View all orders

**Regionalization (Dubai/UAE)**
- Currency is AED everywhere via `formatCurrency()` — no hardcoded `₹` left in the codebase
- VAT calculated at the real UAE rate (5%), itemized on Cart/Checkout as subtotal / VAT / delivery / total
- Address form collects a real Emirate (7-item dropdown) instead of free-text state, with an optional PO Box/Makani field; `zipCode` is now optional in the schema
- Emirate-based shipping: free above AED 200, flat AED 15 within Dubai, AED 25 for other Emirates — calculated identically on client (checkout display) and server (order total), see `client/src/utils/commonUtils.ts` and `server/src/utils/pricing.ts`
- Server now verifies the order's address actually belongs to the requesting user, and the delivery fee is included in the stored order total (previously it was computed on the client for display but silently dropped from the number actually saved)

**Infra**
- `.env` files correctly gitignored in both `client/` and `server/` (verified — not tracked in git)
- `.env.example` exists in both packages
- CORS configured with an origin allowlist (not `*`)
- Cookies set `httpOnly`, `secure` in production, `sameSite` adjusted per environment

---

## ⚠️ Partially done / stubbed — looks finished, isn't

- **Card payment at checkout is a visual-only stub.** The UI has a Stripe-style card form, but it's `disabled`, nothing calls Stripe, and the place-order button is disabled whenever "card" is selected (`client/src/pages/Checkout.tsx`). `stripe` is in `server/package.json` but is never imported anywhere in `server/src`. Right now **cash-on-delivery is the only way to actually complete an order.**
- **Existing seeded products are still priced as if they were ₹, not AED.** The ~15 products in the DB have prices like `3700`, `6900` — clearly denominated in rupees, now displayed as literal AED (e.g. "AED 6,900" ≈ $1,880 for a phone case). This needs a manual re-price pass through the admin panel; it wasn't touched automatically since it's a business pricing decision, not a formatting bug.
- **One address per user.** `addAddress` always creates a new row; `getAddress` just returns the most recently created one. There's no edit, no delete, no "choose from saved addresses" list — checkout silently uses whichever address was created last.
- **Admin can't edit or delete products.** Only `add` and stock-toggle (`PUT /api/products/:id` only touches `inStock`) exist. No way to fix a price/description/image typo without touching the DB directly.
- **No pagination or server-side filtering.** `GET /api/products/list` returns the entire product table; all search/sort/filter in `Products.tsx` happens client-side over that full list. Fine at 30 products, breaks down once the catalog grows.
- **Cart model is a hack.** `User.cartItems` is `String[]` — quantity is represented by repeating the same product ID N times (`client/src/pages/Checkout.tsx` rebuilds counts by tallying duplicates). No cart line-item table, no per-item cart timestamps, no server-side stock check when adding to cart or placing an order.
- **Product detail page is heavily mocked**: colors, sizes, compatibility list, spec sheet, reviews, and FAQ on `ProductDetail.tsx` are all `MOCK_*` constants, not real data — none of these fields exist on the `Product` model, and there's no reviews table/endpoint. The reviews shown to customers right now are fake.
- **Coupon/promo code field on Cart page is UI-only** — `couponCode` state exists, no backend coupon model or endpoint to apply it against.
- **`Products.tsx` filter UI (`MOCK_FILTERS`) offers colors/brands/materials that don't exist on the Product model** — the code even has a comment acknowledging this. Filtering only actually works for category, price, and in-stock/search.
- **Order total is still one opaque number.** `Order.amount` stores the final total only — subtotal/VAT/shipping aren't broken out in the DB, only computed and shown client-side before submission. Fine for now; revisit if order confirmation emails or admin reporting need the breakdown later.

---

## ❌ Not started

**Payments**
- No real payment gateway wired up (Stripe, Telr, PayTabs, Network International — all common in UAE)
- No BNPL (Tabby / Tamara are near-standard for UAE e-commerce)
- No Apple Pay / Google Pay

**Commerce features**
- No product reviews/ratings
- No wishlist
- No coupon/discount codes
- No inventory quantity tracking (only boolean `inStock`)
- No low-stock alerts for admin
- No order status transitions from admin side (no "mark as shipped/delivered" flow found beyond the default status string)
- No email notifications (order confirmation, shipping update, password reset)
- No forgot-password / reset-password flow
- No CSV/bulk product import

**Security & production hardening**
- No rate limiting anywhere (login, register, checkout all unthrottled — brute force / abuse risk)
- No request validation library (zod/joi) — validation is manual `if (!field)` checks, easy to miss edge cases
- No `helmet` or other HTTP security headers
- No CSRF token (relies solely on `sameSite` cookies)
- Order creation isn't wrapped in a DB transaction — a crash mid-loop could create a partial order
- No structured logging or error tracking (Sentry etc.) — just `console.error`

**Quality & ops**
- No automated tests at all (no Jest/Vitest/Playwright config, zero test files in either package)
- No seed script — every dev has to manually create products through the admin UI
- No CI (GitHub Actions or otherwise)
- No Docker/deployment config
- No monitoring/uptime checks

**Content/legal**
- No Terms of Service, Privacy Policy, or Returns/Refund policy pages (required for a real UAE storefront)
- No SEO meta tags, sitemap, or robots.txt
- No analytics (GA4 / Meta Pixel) wired up

---

## Quick reference: what each area needs before "production ready"

| Area | Status | Blocking for launch? |
|---|---|---|
| Browse/search/cart/checkout UX | Built | No — polish only |
| Real payment (card/Apple Pay/Tabby) | Missing | **Yes** |
| AED currency everywhere | Done | — |
| VAT calculation | Done (5%) | — |
| Emirate-based shipping | Done | — |
| Existing product prices re-denominated to AED | **Not done** — still ₹-scale numbers | **Yes** |
| Admin product edit/delete | Missing | **Yes** |
| Multiple saved addresses | Missing (1 only) | Should-have |
| Security hardening (rate limit, request validation) | Partially done (JWT secret fixed; rate limiting/zod still missing) | **Yes** |
| Tests | None | Should-have before scaling team |
| Legal pages | None | **Yes** (UAE consumer protection) |
| Deployment/CI | None | **Yes** |
