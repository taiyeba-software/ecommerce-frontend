# ABOUT - Rajkonna Frontend (Interview Guide)

This document explains the real architecture used in this frontend codebase, with focus on:
- global state + routing
- role fetching and role-based behavior
- backend API fetching techniques

## 1) Elevator Pitch (30-45 seconds)

Rajkonna frontend is a React 19 + Vite 7 e-commerce app. The app uses a provider-first architecture: `AuthProvider`, `ModalProvider`, and `ProductProvider` wrap `App` in `main.jsx`, and `App` contains `BrowserRouter`. That means every route can consume shared auth/product/modal state. API calls are centralized with one Axios instance (`baseURL: "/api"`, `withCredentials: true`), and Vercel rewrites `/api/*` to the deployed backend.

## 2) Architecture in One Flow

User Action -> Page/Component -> Context action or page API call -> Axios client -> `/api/*` -> backend response -> state/toast update -> rerender.

### Layer responsibilities

- UI layer: pages/components render and capture events.
- Context layer: shared state + reusable domain actions.
- API client layer: common transport config and error interception.
- Router layer: route mapping for public, cart, and admin pages.

## 3) Global State + Routing (Strong Interview Point)

The app mounts providers before the router:

- `AuthProvider`: authenticated user, auth loading, login/register/logout
- `ModalProvider`: global login/register modal visibility and type
- `ProductProvider`: products, cart actions, admin product actions

Then `App` defines routes inside `BrowserRouter`:

- `/`
- `/products`
- `/products/:id`
- `/cart`
- `/login` (opens modal then redirects home)
- `/admin`
- `/admin/products`
- `/admin/orders`
- `*` fallback

Because providers are above router, any route component can access global auth/product state without prop drilling.

## 4) Role Fetching and Role-Based Reaction

### How role is fetched

`AuthContext` normalizes user role from multiple payload shapes:

- supports `user.role`
- supports fallback `isAdmin === true` -> role becomes `"admin"`
- trims/lowercases role for consistency

On app startup:

1. Try localStorage user.
2. If present, normalize and set fast (for immediate UI).
3. Re-validate from backend using `GET /auth/profile`.
4. Keep `authLoading` until hydration finishes.

This pattern gives fast initial rendering with backend-verified role refresh.

### How UI reacts to role

Role gating is implemented in both domain actions and route pages:

- Domain guard in `ProductProvider`: add/edit/delete product checks `isAdminOrSeller(user)`.
- Page guard in admin routes (`/admin`, `/admin/products`, `/admin/orders`):
  - if `authLoading`: show loading
  - if no user: ask to log in
  - if not admin/seller: show access denied
  - else load admin data
- Component-level gating in `ProductCard`: show delete button only for admin/seller.

Important interview note: this frontend uses soft guards (UI gating). Final authorization is still enforced by backend APIs.

## 5) Backend Fetching API Techniques Used

## 5.1 Centralized Axios client

- single instance in `src/api/axiosInstance.js`
- `baseURL: "/api"`
- `withCredentials: true` for cookie/session auth
- response interceptor handles `401`
  - if session exists in localStorage and request is not auth bootstrap route
  - clear local user
  - redirect to `/login`

This keeps auth failure behavior consistent across the app.

## 5.2 Environment and deployment transport

- Production uses Vercel rewrite:
  - `/api/(.*)` -> Render backend `/api/$1`
  - `/(.*)` -> `/` for SPA fallback
- Frontend code always calls relative `/api/...`, so deployment target is abstracted.

## 5.3 Data-fetch patterns in features

- Product list: `GET /products`
- Product detail: `GET /products/:id` using `useParams`
- Cart:
  - `GET /cart`
  - `POST /cart/items`
  - `PATCH /cart/items/:productId`
  - `DELETE /cart/items/:productId`
  - `DELETE /cart`
- Orders:
  - `POST /orders` for checkout
  - admin list/details/delete from `/orders` endpoints
- Auth:
  - `POST /auth/login`
  - `POST /auth/register`
  - `POST /auth/logout`
  - `GET /auth/profile`

## 5.4 Reliability patterns used

- loading and error states before/after calls
- toast feedback for success/failure
- guarded fetches (`if authLoading || !user || !isAdminOrSeller(user) return`)
- `Promise.all` used in admin dashboard to fetch products + orders together
- `FormData` + multipart headers for product image create/edit
- normalized ID utility to handle mixed ID formats

## 6) Suggested Interview Answer (1 minute)

This project uses provider-first architecture with routing. In `main.jsx`, Auth, Modal, and Product providers wrap the app, and inside `App.jsx` we use `BrowserRouter` and route mapping. That gives every route shared access to auth and product state through context hooks, so there is no prop drilling. Role is normalized in `AuthContext` from either `role` or `isAdmin`, then revalidated with `/auth/profile` on startup. UI reacts to role in two places: admin pages are guarded and product admin actions are blocked unless `isAdminOrSeller` is true. API communication is centralized via one Axios instance using `/api` and `withCredentials`, with a 401 interceptor to clear stale sessions and redirect to login. In production, Vercel rewrites `/api/*` to backend, so frontend endpoints stay clean and consistent.
- Checkout currently posts a COD order request and gives immediate feedback.

### Q: How does API routing work in production?

- Frontend calls `/api/...` through Axios.
- Vercel rewrite forwards to Render backend URL.
- Non-API routes are rewritten to `/` for SPA navigation support.

### Q: How do you handle admin access?

- UI checks user role before allowing admin actions (delete order/product, create/edit product actions in context).
- `/admin` page exists in routes and shows management UI.

### Q: What is one technical decision you are proud of?

- The `normalizeId` helper: it handles multiple ID shapes and avoids subtle mismatches across API data and client usage.

---

## 2-3 Standout Features from This Frontend

1. Context-driven architecture with clear concerns
- Separate providers for auth, modal control, and product/cart logic keep feature ownership clean.

2. Strong branded UI with animation layer
- Tailwind + custom fonts + GSAP/React Spring create a distinct storefront feel.

3. End-to-end commerce journey in one SPA
- Users can authenticate, browse, view details, manage cart, checkout COD, and (as admin) monitor orders.

---

## Quick Interview Delivery Script

Use this exact speaking pattern:

1. 30 seconds:
- "It is a React 19 and Vite 7 e-commerce frontend using Context API, Axios, Tailwind, and animation libraries. It handles auth, product browsing, cart, checkout, and admin order management in a single SPA."

2. 1-2 minutes:
- "The app is structured as pages/components on top of a context layer. Components trigger context actions, context calls a shared Axios client with `/api`, and Vercel rewrites route those API calls to the backend. Auth, products, and cart are centralized in separate providers, and the UI includes loading/error/toast feedback for async operations."

3. Deep dive (if asked):
- Explain one flow in detail (Auth Modal Flow, Product Search Flow, or Cart to Checkout Flow).

---

## Suggested Improvement Talking Points (If Interviewer Asks)

- Use `import.meta.env.VITE_API_URL` in Axios or add a Vite dev proxy for cleaner local API behavior.
- Add route entries for `AddProduct` and `EditProduct` pages if they are intended for production use.
- Introduce an Error Boundary for better runtime fault isolation.
- Keep cart state fully synced in `ProductProvider` so pages do not need to re-fetch manually after every operation.
- Add a post-checkout confirmation page and redirect flow for better UX.

---

## Final Summary

This frontend demonstrates practical product engineering:
- clear React architecture,
- reusable shared state patterns,
- real backend integration,
- complete e-commerce user flows,
- and polished interaction design.

Use this document as your interview speaking guide when explaining how the Rajkonna frontend works end-to-end.
