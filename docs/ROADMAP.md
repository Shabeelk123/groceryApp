# Roadmap — Path to Production

Companion to [STATUS.md](STATUS.md) (read that first for what already exists).
This file is the prioritized task list to take the storefront from "working
demo" to "production-ready Dubai mobile-accessories store." Phases are
ordered by dependency and launch-blocking risk, not by size — do Phase 0
before Phase 1 even if Phase 1 feels more important.

Check items off as you go (`- [x]`) so this file stays a live source of truth
instead of a one-time snapshot. Update [STATUS.md](STATUS.md) alongside it.

---

## Phase 0 — Fix what's broken (do this first, ~1 day)

Bugs, not features. Cheap to fix, currently undermining everything else.

- [x] Fix session-restore route mismatch: `App.tsx` calls `/api/users/auth`, real route is `/api/users/is-auth` — pick one and align both sides
- [x] Fix `sellerLogin` to return 401 on bad credentials instead of hanging
- [x] Fix or remove the Navbar wishlist link (`\wishlist` typo → dead route) — now shows a "coming soon" toast instead of navigating
- [x] Reorder `productRoute.ts` middleware: `authSeller` before `upload.array(...)`
- [x] Add file-type allowlist (jpeg/png/webp) and size limit to `server/src/configs/multer.ts`
- [x] Remove the hardcoded `"secret"` JWT fallback in all places — `server/src/configs/env.ts` now throws on startup if `JWT_SECRET` is missing (also required reordering `dotenv.config()` above the route imports in `server.ts`, since CommonJS `require()` runs in file order)
- [x] Add `.env.example` to both `client/` and `server/` (var names only, no real values)
- [x] Delete leftover grocery-era images from `server/public/uploads/`
- [x] *(found while fixing the above)* Fixed a `tsc -b` build failure in `Home.tsx` plus unused-import errors — `npm run build` was broken before this

---

## Phase 1 — Regionalize for Dubai / UAE

This is the actual pivot the storefront needs — content is already themed for
phone accessories, but money, tax, and shipping logic still assume India.

- [x] Replace every hardcoded `₹` with AED — `formatCurrency()` (`client/src/utils/commonUtils.ts`) is now the only place currency is rendered, defaults to `VITE_CURRENCY`/`AED`. All literal `₹{...}` across `ProductDetail.tsx`, `Cart.tsx`, `Checkout.tsx`, `Products.tsx`, `CollectionPage.tsx`, `UserOrders.tsx`, `Home.tsx`, seller `AddProduct.tsx`/`ProductList.tsx`/`Orders.tsx` replaced with `formatCurrency(...)` calls; also removed leftover "India"/`en-IN` copy and locale calls
- [x] Update `VITE_CURRENCY` in `client/.env` (and `.env.example`) to `AED`
- [x] Replace the fake flat "2% tax" in `orderController.ts` with real **UAE VAT at 5%** (`server/src/utils/pricing.ts`), itemized as subtotal / VAT / shipping / total on the checkout UI. *(Order model still stores a single `amount` total, not a broken-out record — itemization is client-side only for now; see Phase 6/schema note below if that needs to change.)*
- [x] Reworked the `Address` model for UAE addressing via a real Prisma migration (`state`→`emirate` rename preserving existing data, `zipCode` now optional, added optional `poBox`/Makani field, `country` defaults to "United Arab Emirates"). Checkout form now renders `emirate` as a fixed 7-Emirate dropdown instead of free text.
- [x] Added Emirate-based shipping: free above `AED 200` subtotal, flat `AED 15` within Dubai, `AED 25` for other Emirates (`getShippingFee()`, duplicated by hand in `client/src/utils/commonUtils.ts` and `server/src/utils/pricing.ts` — no shared package, keep both in sync)
- [x] Updated shipping/delivery copy across `Home.tsx` and `ProductDetail.tsx` to Dubai/UAE-specific SLAs instead of the generic placeholder text
- [x] *(found while fixing the above)* `placeOrderCOD` now verifies the address belongs to the requesting user before using it — it previously trusted any `addressId` from the request body; and it now actually includes the delivery fee in the stored order total, which it silently ignored before

**⚠️ Action needed — not something to auto-fix:** the 12 products already seeded in the DB have prices like `3700`, `6900`, `2200` — clearly priced in ₹, and now displayed as literal AED (e.g. "AED 6,900" for a phone case, which is roughly $1,880). Re-price the existing catalog through the seller admin panel (or a one-off script) before this goes anywhere near real customers. This wasn't touched automatically since it's a real business pricing decision, not a currency-formatting bug.

---

## Phase 2 — Real payments

Right now COD is the only functioning path. For a real Dubai storefront you
want at least one card processor and ideally a BNPL option — both are
expected by UAE shoppers, not optional nice-to-haves.

- [ ] Pick a gateway: **Stripe** (already a dependency, has UAE support) is the pragmatic default; **Telr** or **PayTabs** are UAE-local alternatives some banks/merchants prefer for AED settlement — confirm which your business bank account can settle into before building
- [ ] Server: add a payment-intent/checkout-session endpoint, webhook handler for payment confirmation, and mark `Order.isPaid` from the webhook (not from the client) so payment state can't be spoofed
- [ ] Client: replace the disabled card-form stub in `Checkout.tsx` with the real gateway's embedded element/redirect flow
- [ ] Wrap order creation (order + order items + stock decrement) in a single Prisma transaction — right now a mid-loop failure can leave a partial order
- [ ] Add server-side stock re-check at order time (currently nothing stops overselling out-of-stock items)
- [ ] Optional but expected in UAE retail: Tabby or Tamara (buy-now-pay-later) integration
- [ ] Optional: Apple Pay / Google Pay via the chosen gateway's wallet support

---

## Phase 3 — Admin/seller panel completeness

The admin panel can currently only add products and toggle stock — that's not
enough to run a real store without touching the database by hand.

- [x] Add product **edit** (full update: name, description, price, offerPrice, images, category, model) and **delete** endpoints + UI — `PATCH /api/products/:id` and `DELETE /api/products/:id`, with the delete blocked (clean 400, not a raw DB error) if the product has existing orders (`OrderItem` has a `RESTRICT` FK). `AddProduct.tsx` now doubles as the edit form via `/seller/edit/:id`.
- [x] Add multiple saved addresses: list/select/edit/delete endpoints — `addressController.ts` now has `listAddresses`/`updateAddress`/`deleteAddress`, all ownership-checked (a user can't touch another user's address; verified with a cross-user test during implementation). Checkout now shows a radio list of saved addresses with inline Edit/Delete, falling back to the add-address form when the list is empty.
- [x] Add order status management for admin — `PATCH /api/order/:id/status` (fixed set: Order Placed → Packed → Shipped → Delivered, plus Cancelled), a status dropdown in seller `Orders.tsx`, and the customer-facing timeline in `UserOrders.tsx` relabeled to match (was using a "Processing" label that didn't correspond to any real status value).
- [x] Add basic admin dashboard stats — new `Dashboard.tsx`, now the `/seller` index route (Add Product moved to `/seller/add`): orders today, revenue today, total revenue, pending orders, total products, out-of-stock count.
- [x] Server-side pagination + search/sort on `GET /api/products/list` — added as optional `?page=&limit=&search=&category=&sort=` params, backward compatible (no params still returns everything, so the public storefront is unaffected). Wired up in the seller `ProductList.tsx` search box; the public `Products.tsx` filter UI is intentionally left client-side for now (see note below).
- [ ] Add inventory **quantity** tracking, not just a boolean `inStock` (so "3 left" style urgency and auto out-of-stock work) — **deferred**, not done in this pass. Bigger than the rest of this phase: needs a schema change, a stock-decrement step in order placement (ideally inside the Phase 2 transaction work), and touches every place `inStock` is currently read. Do it alongside Phase 2's stock-recheck-at-order-time item rather than as a standalone change.

**Scoping note on the public catalog:** `Products.tsx`'s search/filter/sort still runs entirely client-side over the full product list. That's fine at the current catalog size (~12 products) and intentionally wasn't converted to use the new paginated endpoint — doing so is a real UX/design change (infinite scroll vs. pages vs. "load more", loading states per filter change) that deserves its own pass rather than being bundled into an admin-panel phase. Revisit once the catalog is large enough that shipping the whole list to the browser is actually a problem.

---

## Phase 4 — Security & hardening

- [x] *(found and fixed during Phase 3 testing)* `registerUser`/`loginUser` were echoing the bcrypt password hash back in the response body — now stripped before the response is sent
- [x] *(found and fixed during Phase 4 testing)* `updateCart` had the same leak — `prisma.user.update()` returned the full `User` row including `password`. Now scoped with `select: { cartItems: true }`, matching what the client actually reads from the response.
- [x] Add request validation with `zod` on every controller that takes user input — `server/src/validators/schemas.ts` + a `validateBody` middleware (`server/src/middlewares/validate.ts`) applied to every JSON-body route; the two multipart product endpoints (`addProduct`/`updateProduct`) validate the parsed `productData` JSON directly in the controller since it arrives as a form field, not the request body. Replaces the old scattered manual `if (!field)` checks everywhere.
- [x] Add `express-rate-limit` on `/api/users/login`, `/api/users/register`, `/api/sellers/login` — each gets its **own** limiter instance (`createAuthRateLimiter()`, 10 req/15min per IP) so brute-forcing one endpoint doesn't also lock a user out of the others.
- [x] Add `helmet` to `server.ts`
- [x] Add structured logging with `pino` + `pino-http` — replaces every `console.error`/`console.log` in the server, and every request is now logged (method/path/status/duration) via `pino-http` middleware.
- [x] Ran `npm audit fix` (non-breaking) in `server/`, resolving 12 of 15 pre-existing transitive-dependency vulnerabilities (multer DoS bugs, `jws` HMAC issue, `qs`/`path-to-regexp`/`picomatch` ReDoS, etc). The remaining 3 are all a single chain (`deepmerge-ts` → `@prisma/config` → `prisma`) that would require downgrading `prisma` itself — left alone rather than forcing a breaking dependency change.
- [ ] Add error tracking (Sentry free tier is enough to start) on both client and server — needs a Sentry account/DSN, can't be wired up without one
- [ ] Confirm CORS allowlist supports your real production domain(s), not just `FRONTEND_URL` + localhost — deployment-specific, revisit at Phase 7
- [ ] Rotate the Cloudinary and DB credentials currently sitting in `server/.env` before this project is shared with anyone else or deployed anywhere — they're gitignored correctly, but treat any credential that's been sitting in a local `.env` for a while as due for rotation before go-live. **Manual action — nothing to run for this.**

**Validation testing note:** every validated endpoint was exercised live against a real running server (not just typechecked) — registration/login with bad email/short password, address add with an invalid Emirate and a missing field, order placement with a negative quantity and an empty cart, order status with a bogus value, product stock/update with a zero price and a wrong type. This caught one real bug before it shipped: the cart-update schema initially required `productId` as a `number`, but the client actually sends it as a string (`String(product.id)`, since `User.cartItems` is a `String[]`) — would have broken every "add to cart" click. Fixed before commit.

---

## Phase 5 — Customer-facing feature completeness

Replace the mocked product-detail content with the real thing:

- [x] Reviews & ratings: `Review` model (`server/prisma/schema.prisma`; `userId`+`productId` unique, `rating` 1-5, `comment`, `verifiedPurchase`), `reviewController.ts`/`reviewRoute.ts` (`GET /api/reviews/product/:productId` public, `POST /api/reviews` and `DELETE /api/reviews/:id` authUser). `verifiedPurchase` is computed server-side by checking for a matching `OrderItem`, not client-supplied. `MOCK_REVIEWS` and the hardcoded "4.8 (124 reviews)" in `ProductDetail.tsx` are gone — average rating, rating distribution bars, and the review list are all computed from real data; users can write one review per product and delete their own.
- [x] Wishlist: `Wishlist` model + `wishlistController.ts`/`wishlistRoute.ts` (list/add/remove, unique per user+product), a real `client/src/pages/Wishlist.tsx` page at `/wishlist`, and wishlist state added to Redux (`userSlice.wishlist`, populated on session restore). This also fixed three *other* dead heart-icon buttons found while wiring this up — `Products.tsx` (list view and grid view) and `ProductDetail.tsx` had decorative `Heart` buttons with no `onClick` at all; all three now toggle the wishlist with a filled/outline state, and the Navbar wishlist icon shows a real count badge instead of the "coming soon" toast from Phase 0.
- [x] Both `Review.product` and `Wishlist.product` use `onDelete: Cascade` (unlike `OrderItem.product`, which stays `RESTRICT`) — deleting a product cleans up its reviews/wishlist entries automatically instead of being blocked by them. Verified directly: created a product with a review and a wishlist entry, deleted it, confirmed both child rows were gone and the delete-blocked-by-existing-orders behavior from Phase 3 still works for products that do have orders.
- [x] Product variants cleanup: removed `MOCK_COLORS`, `MOCK_SIZES`, and `MOCK_COMPATIBILITY` (fake interactive color/size selectors, and a compatibility list that was the same three hardcoded devices on every product regardless of what it actually was) along with `MOCK_SPECS` (a spec sheet that claimed "MagSafe: Built-in N52 Magnets" on every product, including watch straps). Replaced with a single real "Compatibility" block using the actual `product.model` field (only rendered when the product has one). `MOCK_FAQ` was left alone — it's generic informational copy, not a specific-but-false claim about the product.
- [x] ~~Coupon/discount codes~~ — **descoped, not needed for this store.** The `couponCode` UI field on the Cart page is left as-is (decorative, no backend); not being wired up.
- [x] Forgot-password / reset-password flow: `User.resetTokenHash`/`resetTokenExpiry` fields, `POST /api/users/forgot-password` (always returns the same response whether or not the email exists — no account enumeration) and `POST /api/users/reset-password` (sha256-hashed single-use token, 1-hour expiry). Client pages `ForgotPassword.tsx` and `ResetPassword.tsx` (reads `?token=` from the URL), linked from `Login.tsx`. Verified live: bogus token rejected, valid token works, old password stops working, new password works, and the same token can't be replayed a second time.
- [x] Order confirmation + shipping-update emails: `placeOrderCOD` sends a confirmation email after the order is created, `updateOrderStatus` sends an update email on every status change (not just "Shipped" — any transition). Both wrapped in their own try/catch so an email failure can never fail the underlying order/status operation. Verified live — both emails logged with correct recipient/content.
- [x] Real search: the Navbar search icon was a decorative button with no handler at all — now expands into a live autocomplete (debounced 300ms, hits `GET /api/products/list?search=&limit=5`, thumbnail+name+price, Enter navigates to `/products?search=`). The existing mobile drawer search input got the same treatment (it had a placeholder but no `value`/`onChange` before this). `Products.tsx` now reads `?search=` from the URL to pre-fill its existing client-side filter, so arriving from Navbar search lands with the term already applied.
- [x] Email delivery: no provider configured, so `server/src/configs/email.ts` logs the "email" via `pino` instead of sending it — `sendEmail({to, subject, text})` is the one call site every feature above uses, so swapping in Resend/SendGrid/SES later is a one-file change.

---

## Phase 6 — Quality & ops

- [ ] Seed script (`server/prisma/seed.ts`, wired via `prisma.seed` in `package.json`) with realistic Dubai mobile-accessory sample data — stop hand-creating products through the admin UI for every fresh clone
- [ ] Server tests: Jest or Vitest + Supertest for controllers (auth, cart math, order totals/VAT are the highest-value targets)
- [ ] Client tests: Vitest + React Testing Library for cart/checkout logic at minimum
- [ ] E2E smoke test (Playwright): register → browse → add to cart → checkout → order appears in history — this one test catches most regressions
- [ ] CI (GitHub Actions): run lint + typecheck + tests on every PR
- [ ] Root README with setup instructions (see [README.md](../README.md) — created alongside this roadmap)

---

## Phase 7 — Deployment & launch

- [ ] Dockerize server (or deploy directly to Render/Railway — both support Postgres + Node natively)
- [ ] Deploy client to Vercel/Netlify, server to Render/Railway/Fly.io, DB to a managed Postgres (Supabase, Neon, or the host's managed Postgres)
- [ ] Custom domain + SSL
- [ ] Legal pages required for a real UAE consumer storefront: Terms of Service, Privacy Policy, Returns/Refund Policy (UAE has specific e-commerce consumer-protection rules — worth a quick legal read or template review before launch, not just copy-pasting a generic template)
- [ ] SEO basics: meta tags per page, sitemap.xml, robots.txt, Open Graph tags for product pages (matters for social sharing of products)
- [ ] Analytics: GA4 and/or Meta Pixel (Meta/Instagram ads are a common acquisition channel for this kind of store in the UAE)
- [ ] Image optimization/CDN (Cloudinary already in use — make sure you're using its transformation/resizing params, not serving full-res originals)
- [ ] Basic uptime monitoring (UptimeRobot free tier is enough to start)

---

## Suggested execution order if you want the fastest path to "sellable"

If the goal is genuinely fastest-to-launch rather than most-complete:
**Phase 0 → Phase 1 → Phase 2 (Stripe only, skip BNPL/Apple Pay for v1) →
Phase 4 (security) → Phase 7 (deploy) → everything else after you have real
customers.** Phases 3, 5, and 6 make the business easier to run and the code
safer to extend, but none of them block taking a real paid order from a real
customer in Dubai.
