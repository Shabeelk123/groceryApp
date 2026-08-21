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
- Product listing (`/products`) with client-side search, category filter, price filter, sort — also reads `?search=` from the URL so Navbar search results land here pre-filled
- Real site-wide search: Navbar search icon (desktop) and mobile drawer search both do a live, debounced, server-backed autocomplete (`GET /api/products/list?search=`) — previously both were decorative with no handler at all
- Category collection pages (`/collections/:category`)
- Product detail page with image gallery, related products, bundle upsell, real reviews (see below), and a real "Compatibility" section driven by `product.model` — no more fake color/size selectors or a spec sheet that claimed every product had "MagSafe: Built-in N52 Magnets"
- Cart page, add/remove/update quantity
- Checkout with saved-address reuse or new-address form
- Order history page (`/orders`)
- Cash-on-delivery order placement, end to end, now sends an order-confirmation email (logged, see Infra) and a shipping-update email on every status change
- Content is already themed for the pivot: categories are iPhone Cases, MagSafe, Watch Bands, Earbuds, etc, and `Product.model` field exists for device compatibility (e.g. "iPhone 17 Pro Max")

**Auth**
- Register/login/logout with bcrypt password hashing + JWT in httpOnly cookie
- Session restore on page load (`/api/users/is-auth`)
- Protected routes on the client (`ProtectedRoute` component)
- Forgot-password / reset-password flow: single-use, sha256-hashed, 1-hour-expiry tokens on the `User` row; `POST /api/users/forgot-password` responds identically whether or not the email exists (no account enumeration). Client pages at `/forgot-password` and `/reset-password`.
- Separate seller/admin login, gated by `SELLER_EMAIL`/`SELLER_PASSWORD` env vars (single hardcoded admin, not a real user role)
- `JWT_SECRET` is required at startup (`server/src/configs/env.ts`) — the server refuses to boot instead of silently falling back to a guessable secret

**Admin (seller) panel**
- Dashboard (`/seller`, new index route) with orders-today, revenue, pending-orders, and out-of-stock stat tiles
- Add product with multi-image upload to Cloudinary (JPEG/PNG/WebP only, 5MB/6-file limits) — now at `/seller/add`
- Full product **edit** (`/seller/edit/:id`, reuses the add form) and **delete**, with delete blocked by a clean 400 (not a raw DB error) if the product has existing orders
- Product list view with search, toggle in-stock/out-of-stock
- View all orders, update order status (Order Placed → Packed → Shipped → Delivered, or Cancelled)

**Regionalization (Dubai/UAE)**
- Currency is AED everywhere via `formatCurrency()` — no hardcoded `₹` left in the codebase
- VAT calculated at the real UAE rate (5%), itemized on Cart/Checkout as subtotal / VAT / delivery / total
- Address form collects a real Emirate (7-item dropdown) instead of free-text state, with an optional PO Box/Makani field; `zipCode` is now optional in the schema
- Emirate-based shipping: free above AED 200, flat AED 15 within Dubai, AED 25 for other Emirates — calculated identically on client (checkout display) and server (order total), see `client/src/utils/commonUtils.ts` and `server/src/utils/pricing.ts`
- Server now verifies the order's address actually belongs to the requesting user, and the delivery fee is included in the stored order total (previously it was computed on the client for display but silently dropped from the number actually saved)

**Customer account**
- Multiple saved addresses: list, select at checkout, edit, delete — all ownership-checked server-side (a user can't read/edit/delete another user's address)
- Product reviews & ratings: real `Review` model, one review per user per product, server-computed "Verified Purchase" badge (checks actual order history, not client-supplied), average rating + rating-distribution bars computed from real data, users can delete their own review. Replaces the old `MOCK_REVIEWS`/hardcoded "4.8 (124 reviews)" entirely.
- Wishlist: real `Wishlist` model, a `/wishlist` page, Redux-tracked state so the heart icon shows filled/outline consistently across Products/ProductDetail/Navbar. This also fixed three previously-dead decorative heart buttons (`Products.tsx` list + grid view, `ProductDetail.tsx`) that had no `onClick` at all before this pass.

**Security & hardening**
- Every JSON-body endpoint validates input with `zod` (`server/src/validators/schemas.ts` + `validateBody` middleware) instead of scattered manual `if (!field)` checks; the two multipart product endpoints validate their JSON form field directly in the controller
- Rate limiting on `/api/users/register`, `/api/users/login`, `/api/sellers/login` — 10 requests/15min per IP, each endpoint with its own independent counter
- `helmet` applied globally in `server.ts`
- Structured logging via `pino` + `pino-http` — every request is logged (method/path/status/duration), replacing all `console.error`/`console.log` calls
- `registerUser`/`loginUser`/`updateCart` no longer echo the bcrypt password hash back in the response body (three separate leaks found and fixed across Phase 3/4 testing — `updateCart` was the same class of bug as the first two, just easy to miss since its response is a whole `User` row)
- `npm audit fix` applied in `server/`: 12 of 15 pre-existing transitive-dependency vulnerabilities resolved (multer DoS bugs, `jws`, `qs`, `path-to-regexp`, `picomatch`). The remaining 3 all trace back to `prisma`'s own tooling deps and would require a `prisma` downgrade — left alone.

**Infra**
- `.env` files correctly gitignored in both `client/` and `server/` (verified — not tracked in git)
- `.env.example` exists in both packages
- CORS configured with an origin allowlist (not `*`)
- Cookies set `httpOnly`, `secure` in production, `sameSite` adjusted per environment
- Email abstraction (`server/src/configs/email.ts`, `sendEmail()`): no provider configured yet, so it logs the email via `pino` instead of sending it. Used by forgot-password, order confirmation, and order status updates — swapping in a real provider (Resend/SendGrid/SES) later is a one-file change since every feature calls the same function.

---

## ⚠️ Partially done / stubbed — looks finished, isn't

- **Card payment at checkout is a visual-only stub.** The UI has a Stripe-style card form, but it's `disabled`, nothing calls Stripe, and the place-order button is disabled whenever "card" is selected (`client/src/pages/Checkout.tsx`). `stripe` is in `server/package.json` but is never imported anywhere in `server/src`. Right now **cash-on-delivery is the only way to actually complete an order.**
- **Existing seeded products are still priced as if they were ₹, not AED.** The 12 products in the DB have prices like `3700`, `6900` — clearly denominated in rupees, now displayed as literal AED (e.g. "AED 6,900" ≈ $1,880 for a phone case). This needs a manual re-price pass through the admin panel; it wasn't touched automatically since it's a business pricing decision, not a formatting bug.
- **`Products.tsx` (public storefront) still filters/sorts/searches entirely client-side**, even though `GET /api/products/list` now supports `?page=&limit=&search=&category=&sort=` (used by the seller admin panel and the new Navbar search). This was a deliberate scoping decision, not an oversight — converting the public browsing UX to paginated loading is a real design change (infinite scroll vs. pages, per-filter loading states) that deserves its own pass. Fine at the current catalog size (~12 products); revisit once it grows.
- **Cart model is a hack.** `User.cartItems` is `String[]` — quantity is represented by repeating the same product ID N times (`client/src/pages/Checkout.tsx` rebuilds counts by tallying duplicates). No cart line-item table, no per-item cart timestamps, no server-side stock check when adding to cart or placing an order.
- **No inventory quantity tracking**, still just boolean `inStock`. Deliberately deferred out of the Phase 3 admin-panel work — doing it properly means a schema change plus a stock-decrement step in order placement, which belongs alongside the Phase 2 "stock re-check at order time" / DB-transaction work, not bolted onto the admin panel separately.
- **`ProductDetail.tsx`'s FAQ section is still generic static copy** (`MOCK_FAQ`) — left alone deliberately, it's not a false per-product claim like the removed color/size/spec mocks were, just boilerplate info.
- **Coupon/promo code field on Cart page is UI-only, and staying that way** — `couponCode` state exists with no backend behind it. Confirmed descoped, not a gap.
- **`Products.tsx` filter UI (`MOCK_FILTERS`) offers colors/brands/materials that don't exist on the Product model** — the code even has a comment acknowledging this. Filtering only actually works for category, price, and in-stock/search.
- **Order total is still one opaque number.** `Order.amount` stores the final total only — subtotal/VAT/shipping aren't broken out in the DB, only computed and shown client-side before submission. Fine for now; revisit if order confirmation emails or admin reporting need the breakdown later.

---

## ❌ Not started

**Payments**
- No real payment gateway wired up (Stripe, Telr, PayTabs, Network International — all common in UAE)
- No BNPL (Tabby / Tamara are near-standard for UAE e-commerce)
- No Apple Pay / Google Pay

**Commerce features**
- No low-stock alerts for admin (would need inventory quantity tracking first — see above)
- No CSV/bulk product import

**Security & production hardening**
- No CSRF token (relies solely on `sameSite` cookies)
- Order creation isn't wrapped in a DB transaction — a crash mid-loop could create a partial order (Phase 2 item, paired with the stock-recheck-at-order-time work)
- No error tracking (Sentry etc.) — needs an external account/DSN to wire up
- CORS allowlist only covers `FRONTEND_URL` + localhost — revisit once a real production domain exists

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
| Admin product edit/delete | Done | — |
| Multiple saved addresses | Done | — |
| Order status management | Done | — |
| Admin dashboard stats | Done (basic) | — |
| Product reviews & ratings | Done | — |
| Wishlist | Done | — |
| Site search | Done (server-backed autocomplete) | — |
| Forgot-password flow | Done (email logged, not sent — no provider yet) | — |
| Order confirmation/status emails | Done (email logged, not sent — no provider yet) | — |
| Coupon codes | **Descoped** — not needed for this store | — |
| Inventory quantity tracking | Missing — deferred to pair with Phase 2 stock-recheck work | Should-have |
| Security hardening (rate limit, request validation, helmet, logging) | Done (zod, rate limiting, helmet, pino, password-leak fixes); CSRF/Sentry/DB-transaction still open | **Yes** — remaining pieces (CSRF, Sentry) |
| Tests | None | Should-have before scaling team |
| Legal pages | None | **Yes** (UAE consumer protection) |
| Deployment/CI | None | **Yes** |
