# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project

CaseHub — a Dubai-based mobile accessories e-commerce storefront (iPhone
cases, MagSafe accessories, watch bands, earbuds). Originally scaffolded as a
generic grocery app and mid-pivot to this niche — some naming/leftovers
still reflect that (see `docs/STATUS.md`).

For current build status (what's done vs. broken vs. missing) and the
prioritized task list, read `docs/STATUS.md` and `docs/ROADMAP.md` before
starting work — don't re-derive that from scratch by re-auditing the code.

## Commands

This is a monorepo with two independent, unlinked npm packages — there is no
root `package.json`; run commands from inside `client/` or `server/`.

**Client** (`client/`):
```
npm run dev       # Vite dev server, http://localhost:5173
npm run build     # tsc -b && vite build
npm run lint      # eslint .
npm run preview   # preview a production build
```

**Server** (`server/`):
```
npm run dev       # nodemon + ts-node, http://localhost:3000
npm run build     # tsc -> dist/
npm run start     # node dist/server.js (run build first)
npx prisma migrate dev     # apply/create migrations against DATABASE_URL
npx prisma studio          # browse the DB
npx prisma generate        # regenerate the Prisma client after schema changes
```

There is currently **no test suite** in either package (no Jest/Vitest/
Playwright config, zero test files) — don't assume a `test` script exists.

Both packages require a local `.env` (see `client/.env.example` and
`server/.env.example` for the required variables — Postgres connection
string, JWT secret, Cloudinary credentials, seller/admin credentials).

## Architecture

**Two independent apps, no shared code/types package.** Request/response
shapes are duplicated by hand between `server/src/controllers/*.ts` and the
TypeScript interfaces declared inline in the corresponding `client/src/pages/
*.tsx` files. When changing an API response shape, update both sides
manually — there's no generated/shared type.

### Server (`server/src`)

Layout: `routes/*Route.ts` → `controllers/*Controller.ts` → Prisma. Each
resource (user, seller, product, cart, address, order) has one route file and
one controller file, wired into `server.ts` under `/api/<resource>`.

- **Auth is cookie-based JWT, not Bearer tokens.** Two separate cookies:
  `token` (customer, verified by `middlewares/authUser.ts`, sets `req.userId`)
  and `sellerToken` (admin, verified by `middlewares/authSeller.ts`). There is
  no role system — the "seller" is a single hardcoded account authenticated
  against `SELLER_EMAIL`/`SELLER_PASSWORD` env vars, not a DB row.
- **Prisma schema** (`server/prisma/schema.prisma`): `User`, `Product`,
  `Address`, `Order`, `OrderItem`. Notable non-obvious modeling choices:
  - `User.cartItems` is a flat `String[]` of product IDs — there is no cart
    line-item table. Quantity is represented by an ID appearing multiple
    times in the array; client code reconstructs quantities by tallying
    duplicates (see `Checkout.tsx`). Keep this in mind before "fixing" what
    looks like a duplicate-ID bug.
  - `Address` supports multiple rows per user, but `getAddress` only ever
    fetches the most recently created one (`findFirst` ordered by
    `createdAt desc`) — there's no list/select/edit/delete endpoint yet.
  - `Product.category` and `Product.model` (device compatibility, e.g.
    "iPhone 17 Pro Max") are plain strings, not relations — no `Category`
    table.
- **Image uploads**: `multer` writes to disk (`server/public/uploads/`) as
  an intermediate step, then `productController.ts` uploads each file to
  Cloudinary and stores the returned `secure_url` — the local file is not
  the persisted source of truth.
- **CORS** is an explicit origin allowlist (`FRONTEND_URL` env var +
  localhost variants) in `server.ts`, not a wildcard — required because
  cookies need `credentials: true`.

### Client (`client/src`)

- **Routing**: `react-router-dom` v7, all routes declared in `App.tsx`.
  Customer routes (`/cart`, `/checkout`, `/orders`) are wrapped in
  `ProtectedRoute.tsx`, which checks Redux user state client-side — real
  enforcement happens server-side via `authUser` on the API. The `/seller/*`
  subtree similarly has no client-side route guard against direct
  navigation; it's gated by API-level `authSeller`.
- **State**: Redux Toolkit, two slices (`redux/userSlice.ts` for the logged-in
  user + cart item IDs, `redux/sellerSlice.ts` for seller UI state). Typed
  hooks in `hooks.ts` (`useAppDispatch`/`useAppSelector`) — use these instead
  of the untyped `react-redux` hooks directly.
- **HTTP**: single shared `axiosInstance` in `lib/axiosConfig.ts`
  (`withCredentials: true` for cookie auth). Its response interceptor
  globally dispatches `clearUser`/`setUser(null)` on any 401 — a 401 from
  any endpoint will silently log the user out client-side, which matters
  when debugging "why did I get logged out."
- **Session restore on load**: `App.tsx` calls the auth-check endpoint on
  mount to rehydrate Redux state from the httpOnly cookie after a refresh
  (since Redux state doesn't persist across reloads on its own). Currently
  broken due to a route-name mismatch — see `docs/STATUS.md` bug #1 before
  assuming new auth-related bugs are yours.
- **Styling**: Tailwind CSS 4 via the `@tailwindcss/vite` plugin (CSS-first
  config, no `tailwind.config.js`). No component library — everything is
  hand-rolled with Tailwind + `lucide-react` icons.
- **Currency/formatting**: a `formatCurrency()` util exists in
  `utils/commonUtils.ts` but most pages currently render currency as
  hardcoded literal symbols instead of calling it — check
  `docs/ROADMAP.md` Phase 1 before adding new price displays; new code
  should use `formatCurrency()`, not a literal symbol.
- Several product-detail sections (colors, sizes, compatibility, specs,
  reviews, FAQ) are currently `MOCK_*` constants in `ProductDetail.tsx`
  with no backing schema/endpoint — don't mistake them for real data when
  reading that file.
