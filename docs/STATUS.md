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
- Session restore on page load (`/api/users/auth`)
- Protected routes on the client (`ProtectedRoute` component)
- Separate seller/admin login, gated by `SELLER_EMAIL`/`SELLER_PASSWORD` env vars (single hardcoded admin, not a real user role)

**Admin (seller) panel**
- Add product with multi-image upload to Cloudinary
- Product list view, toggle in-stock/out-of-stock
- View all orders

**Infra**
- `.env` files correctly gitignored in both `client/` and `server/` (verified — not tracked in git)
- CORS configured with an origin allowlist (not `*`)
- Cookies set `httpOnly`, `secure` in production, `sameSite` adjusted per environment

---

## 🐛 Known bugs — fix these first, before anything else

These aren't missing features, they're broken behavior in code that looks done:

1. **Session restore is broken.** `client/src/App.tsx` calls `GET /api/users/auth` on every page load to restore login state, but the route actually registered in `server/src/routes/userRoute.ts` is `GET /api/users/is-auth`. Every refresh 404s (silently swallowed by the `catch`), so logged-in users appear logged out until they navigate in a way that re-triggers auth. **One-line fix, high impact.**
2. **Seller login hangs on wrong credentials.** `sellerController.ts` → `sellerLogin` only calls `res.send(...)` inside the success branch (`if (password === ... && email === ...)`). There's no `else`, so an incorrect password just hangs the request until client timeout instead of returning 401.
3. **Wishlist link is a dead end.** Navbar has a wishlist icon linking to `"\wishlist"` (backslash typo, and `/wishlist` isn't a registered route anyway) — clicking it 404s. Either wire up a real wishlist or remove the icon.
4. **Middleware order lets unauthenticated uploads through partially.** `productRoute.ts`: `upload.array("images")` (multer, writes to disk) runs *before* `authSeller`. An unauthenticated POST still gets its files written to `server/public/uploads/` before being rejected. Swap the order.
5. **Multer has no file-type or size limit configured** (`server/src/configs/multer.ts`) — any file type/size can currently be uploaded.

---

## ⚠️ Partially done / stubbed — looks finished, isn't

- **Card payment at checkout is a visual-only stub.** The UI has a Stripe-style card form, but it's `disabled`, nothing calls Stripe, and the place-order button is disabled whenever "card" is selected (`client/src/pages/Checkout.tsx`). `stripe` is in `server/package.json` but is never imported anywhere in `server/src`. Right now **cash-on-delivery is the only way to actually complete an order.**
- **Currency is hardcoded to ₹ (Indian Rupee)** in ~10+ files (ProductDetail, Cart, Checkout, Products, Navbar, seller Orders, etc.) via literal `₹` characters, not the `VITE_CURRENCY` env var that already exists in `client/.env`. A `formatCurrency()` util exists in `client/src/utils/commonUtils.ts` (defaults to `₹`) but **isn't called anywhere** — currency is just typed inline everywhere.
- **One address per user.** `addAddress` always creates a new row; `getAddress` just returns the most recently created one. There's no edit, no delete, no "choose from saved addresses" list — checkout silently uses whichever address was created last.
- **Admin can't edit or delete products.** Only `add` and stock-toggle (`PUT /api/products/:id` only touches `inStock`) exist. No way to fix a price/description/image typo without touching the DB directly.
- **No pagination or server-side filtering.** `GET /api/products/list` returns the entire product table; all search/sort/filter in `Products.tsx` happens client-side over that full list. Fine at 30 products, breaks down once the catalog grows.
- **Cart model is a hack.** `User.cartItems` is `String[]` — quantity is represented by repeating the same product ID N times (`client/src/pages/Checkout.tsx:75-80` rebuilds counts by tallying duplicates). No cart line-item table, no per-item cart timestamps, no server-side stock check when adding to cart.
- Product upload route runs `multer` (file parsing) **before** `authSeller` (`server/src/routes/productRoute.ts:8`) — an unauthenticated request still pays the cost of multipart parsing before being rejected. (See bug #4 above.)
- **Product detail page is heavily mocked**: colors, sizes, compatibility list, spec sheet, reviews, and FAQ on `ProductDetail.tsx` are all `MOCK_*` constants, not real data — none of these fields exist on the `Product` model, and there's no reviews table/endpoint. The reviews shown to customers right now are fake.
- **Coupon/promo code field on Cart page is UI-only** — `couponCode` state exists, no backend coupon model or endpoint to apply it against.
- **`Products.tsx` filter UI (`MOCK_FILTERS`) offers colors/brands/materials that don't exist on the Product model** — the code even has a comment acknowledging this. Filtering only actually works for category, price, and in-stock/search.
- No `.env.example` in either package — a new machine has to guess required env vars.
- `server/public/uploads/` still has leftover images from the original grocery-app version of this project (tomatoes, onions, etc.) mixed with real phone-accessory uploads — worth a cleanup pass.

---

## ❌ Not started

**Payments & UAE commerce basics**
- No real payment gateway wired up (Stripe, Telr, PayTabs, Network International — all common in UAE) — see `[[payments]]` in roadmap
- No BNPL (Tabby / Tamara are near-standard for UAE e-commerce)
- No Apple Pay / Google Pay
- No VAT (5%) calculation — order total logic currently adds a hardcoded "2% tax" (`server/src/controllers/orderController.ts:23`), which is neither UAE VAT nor labeled as such
- No Emirates-based shipping zones/rates (Dubai vs. other Emirates vs. free-zone delivery)
- Address model uses `state`/`zipCode: Int` — doesn't fit UAE addressing (Emirate name, no reliable postal codes, PO Box / Makani number are the norm)

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
- `JWT_SECRET` has a hardcoded fallback (`"secret"`) in multiple files — if the env var is ever missing in prod, auth silently runs on a guessable secret
- No rate limiting anywhere (login, register, checkout all unthrottled — brute force / abuse risk)
- No request validation library (zod/joi) — validation is manual `if (!field)` checks, easy to miss edge cases
- No `helmet` or other HTTP security headers
- No CSRF token (relies solely on `sameSite` cookies)
- Order creation isn't wrapped in a DB transaction — a crash mid-loop could create a partial order
- No structured logging or error tracking (Sentry etc.) — just `console.error`
- No file-upload limits/type validation beyond whatever `multer` defaults to

**Quality & ops**
- No automated tests at all (no Jest/Vitest/Playwright config, zero test files in either package)
- No seed script — every dev has to manually create products through the admin UI
- No README anywhere in the project (this is being fixed now)
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
| AED currency everywhere | Hardcoded to ₹ | **Yes** |
| VAT calculation | Missing (fake "2% tax") | **Yes** |
| Admin product edit/delete | Missing | **Yes** |
| Multiple saved addresses | Missing (1 only) | Should-have |
| Security hardening (rate limit, validation, JWT secret) | Missing | **Yes** |
| Tests | None | Should-have before scaling team |
| Legal pages | None | **Yes** (UAE consumer protection) |
| Deployment/CI | None | **Yes** |
