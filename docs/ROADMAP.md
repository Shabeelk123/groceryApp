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

- [ ] Fix session-restore route mismatch: `App.tsx` calls `/api/users/auth`, real route is `/api/users/is-auth` — pick one and align both sides
- [ ] Fix `sellerLogin` to return 401 on bad credentials instead of hanging
- [ ] Fix or remove the Navbar wishlist link (`\wishlist` typo → dead route)
- [ ] Reorder `productRoute.ts` middleware: `authSeller` before `upload.array(...)`
- [ ] Add file-type allowlist (jpeg/png/webp) and size limit to `server/src/configs/multer.ts`
- [ ] Remove the hardcoded `"secret"` JWT fallback in all 4 places (`userController.ts`, `sellerController.ts`, `authUser.ts`, `authSeller.ts`) — throw on startup if `JWT_SECRET` is missing instead
- [ ] Add `.env.example` to both `client/` and `server/` (var names only, no real values)
- [ ] Delete leftover grocery-era images from `server/public/uploads/`

---

## Phase 1 — Regionalize for Dubai / UAE

This is the actual pivot the storefront needs — content is already themed for
phone accessories, but money, tax, and shipping logic still assume India.

- [ ] Replace every hardcoded `₹` with AED. Fastest correct path: make `formatCurrency()` (`client/src/utils/commonUtils.ts`) the *only* place currency is rendered, default it to `AED` (or `د.إ` if you want the Arabic symbol), and replace every literal `₹{...}` across `ProductDetail.tsx`, `Cart.tsx`, `Checkout.tsx`, `Products.tsx`, `Navbar.tsx`, `UserOrders.tsx`, seller `Orders.tsx` with `formatCurrency(...)` calls
- [ ] Update `VITE_CURRENCY` in `client/.env` (and `.env.example`) to `AED`
- [ ] Replace the fake flat "2% tax" in `orderController.ts` with real **UAE VAT at 5%**, applied and itemized clearly (subtotal / VAT / shipping / total) on both checkout UI and order confirmation
- [ ] Rework the `Address` model for UAE addressing: replace/relabel `state` → `emirate` (Dubai, Abu Dhabi, Sharjah, etc. — a fixed dropdown, not free text), make `zipCode` optional (UAE has no reliable postal code system), consider adding an optional PO Box / Makani number field
- [ ] Add Emirate-based shipping rates/zones (e.g. free/flat delivery within Dubai, small surcharge for other Emirates)
- [ ] Decide and document the shipping SLA copy (currently generic "3-5 business days" placeholder text in `ProductDetail.tsx`)

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

- [ ] Add product **edit** (full update: name, description, price, offerPrice, images, category, model) and **delete** endpoints + UI
- [ ] Add multiple saved addresses: list/select/edit/delete endpoints (the `Address` model already supports multiple rows — only the UI/API for choosing among them is missing)
- [ ] Add order status management for admin (e.g. Placed → Packed → Shipped → Delivered), not just a static default string
- [ ] Add basic admin dashboard stats (orders today, revenue, low-stock count) — even a simple version beats none
- [ ] Add inventory **quantity** tracking, not just a boolean `inStock` (so "3 left" style urgency and auto out-of-stock work)
- [ ] Server-side pagination + search/filter/sort on `GET /api/products/list` — required once the catalog grows past a page or two

---

## Phase 4 — Security & hardening

- [ ] Add request validation with `zod` (already TypeScript-native, pairs well with Prisma) on every controller that takes user input — replaces the current scattered manual `if (!field)` checks
- [ ] Add `express-rate-limit` on `/api/users/login`, `/api/users/register`, `/api/sellers/login` at minimum
- [ ] Add `helmet` to `server.ts`
- [ ] Add structured logging (`pino` is a good lightweight fit) to replace bare `console.error`
- [ ] Add error tracking (Sentry free tier is enough to start) on both client and server
- [ ] Confirm CORS allowlist supports your real production domain(s), not just `FRONTEND_URL` + localhost
- [ ] Rotate the Cloudinary and DB credentials currently sitting in `server/.env` before this project is shared with anyone else or deployed anywhere — they're gitignored correctly, but treat any credential that's been sitting in a local `.env` for a while as due for rotation before go-live

---

## Phase 5 — Customer-facing feature completeness

Replace the mocked product-detail content with the real thing:

- [ ] Reviews & ratings: `Review` model (userId, productId, rating, comment, verified-purchase flag), endpoints, and swap `MOCK_REVIEWS` for real data
- [ ] Product variants: if you actually sell multiple colors/sizes per case, model that properly (either a `ProductVariant` table or, if variants are just cosmetic, drop `MOCK_COLORS`/`MOCK_SIZES` from the UI entirely rather than showing fake options)
- [ ] Wishlist: `Wishlist` model + endpoints + page, or remove the icon (see Phase 0 bug #3 — don't leave it half-wired)
- [ ] Coupon/discount codes: `Coupon` model + validation endpoint, wire up the existing Cart UI field
- [ ] Forgot-password / reset-password flow (email-based token)
- [ ] Order confirmation + shipping-update emails (Resend, SendGrid, or AWS SES all fine)
- [ ] Real search (even simple `ILIKE` on name/description server-side beats client-only filtering once the catalog grows)

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
