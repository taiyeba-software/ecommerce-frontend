# Rajkonna Frontend

Rajkonna is a React 19 + Vite 7 skincare e-commerce frontend with product browsing, authentication modal flow, cart, checkout, and admin management pages.

Live site: https://frontend-rajkonna.vercel.app/

## Tech Stack

- React 19
- Vite 7
- React Router DOM 7
- Tailwind CSS 4
- Axios
- React Context API
- React Hot Toast
- GSAP, React Spring, Framer Motion

## Core Architecture

The app uses a provider-first architecture with route-level pages.

1. `main.jsx` wraps `App` with global providers:
   - `AuthProvider`
   - `ModalProvider`
   - `ProductProvider`
2. `App.jsx` mounts `BrowserRouter` + route map.
3. Pages/components consume global state through context hooks.
4. API communication is centralized through one Axios instance.

Flow:

UI Event -> Context/Page Action -> Axios (`/api`) -> Backend -> State/Toast Update -> Re-render

## Routing Map

- `/` -> Home
- `/products` -> Product listing
- `/products/:id` -> Product detail
- `/cart` -> Cart page
- `/login` -> Opens auth modal and redirects home
- `/admin` -> Admin dashboard
- `/admin/products` -> Admin products management
- `/admin/orders` -> Admin orders management
- `*` -> Not found fallback

## Global State + Routing Strategy

Because providers are mounted above router, shared data is available on all routes.

- Auth state (`user`, `authLoading`, `login`, `register`, `logout`) is available app-wide.
- Product/cart actions are reusable from any page.
- Modal state is global, so auth modal can open from multiple places.

This avoids prop drilling and keeps route components focused on UI + feature logic.

## Role Fetching and Role-Based Behavior

Role handling is normalized inside `AuthContext`:

- If backend returns `role`, it is trimmed/lowercased.
- If backend returns `isAdmin: true`, frontend maps it to `role: "admin"`.

Session hydration flow on startup:

1. Read user from localStorage (fast initial UI).
2. Normalize role.
3. Revalidate with `GET /auth/profile`.
4. Update context/localStorage from backend profile.

How UI reacts to role:

- `isAdminOrSeller(user)` utility controls admin/seller privileges.
- Admin pages (`/admin`, `/admin/products`, `/admin/orders`) deny access for non-admin/seller users.
- Product delete button is shown only for admin/seller users.
- Product create/edit/delete actions are also guarded in provider/page logic.

Note: These are frontend guards for UX. Final permission enforcement is done by backend APIs.

## Backend Fetching Techniques

### 1) Centralized Axios instance

`src/api/axiosInstance.js`:

- `baseURL: "/api"`
- `withCredentials: true` for cookie/session auth
- response interceptor for `401`:
  - clears stale local session
  - redirects to `/login` (except ignored auth bootstrap routes)

### 2) Deployment rewrite strategy

`vercel.json` rewrites:

- `/api/(.*)` -> `https://ecommerce-backend-api-wyxt.onrender.com/api/$1`
- `/(.*)` -> `/` (SPA fallback)

So frontend code always calls `/api/...` while Vercel forwards to backend in production.

### 3) API usage patterns in code

- guarded fetches based on auth state
- loading/error state per feature
- user-facing success/error toasts
- concurrent dashboard fetching with `Promise.all`
- multipart upload (`FormData`) for product image create/edit
- route-parameter fetch (`useParams` + `GET /products/:id`)

## Toast Notification Flow

This project uses `react-hot-toast` as the global feedback system for async actions.

### 1) Global mount

- `Toaster` is mounted once in `main.jsx` with `position="top-center"`.
- Because it is mounted at app root, any page, component, or context can trigger toasts.

### 2) Where toasts are triggered

- `AuthContext`
  - success: login, register, logout
  - error: auth request failures
- `ProductProvider`
  - success: add to cart, product create/update/delete, cart update/remove/clear
  - error: unauthorized actions, API failures, validation-style checks (for example qty < 1)
- Route pages (`CartPage`, admin pages)
  - success: checkout, admin create/update/delete flows
  - error: feature-level fetch failures (orders/products/cart)

### 3) Practical behavior pattern

Most async handlers use this sequence:

1. start action (set loading if needed)
2. call API
3. `toast.success(...)` on success
4. `toast.error(...)` on failure with backend message fallback
5. refresh state or rerender affected UI

### 4) Why this architecture works

- feedback is consistent across all routes
- business logic can display messages directly from contexts
- pages can still show local toasts for page-specific operations
- user gets immediate success/error feedback without extra UI wiring

## Endpoint Summary (Frontend Usage)

Auth:

- `POST /api/auth/login`
- `POST /api/auth/register`
- `POST /api/auth/logout`
- `GET /api/auth/profile`

Products:

- `GET /api/products`
- `GET /api/products/:id`
- `POST /api/products` (admin/seller)
- `PATCH /api/products/:id` (admin/seller)
- `DELETE /api/products/:id` (admin/seller)

Cart:

- `GET /api/cart`
- `POST /api/cart/items`
- `PATCH /api/cart/items/:productId`
- `DELETE /api/cart/items/:productId`
- `DELETE /api/cart`

Orders:

- `POST /api/orders` (checkout)
- `GET /api/orders?page=1&limit=100` (admin/seller)
- `GET /api/orders/:id` (admin/seller)
- `DELETE /api/orders/:id` (admin/seller)

## Project Structure

```text
src/
  api/          # axios instance + transport policies
  components/   # reusable UI and modal components
  context/      # global state providers and hooks
  data/         # static data
  lib/          # shared helpers (e.g., normalizeId)
  pages/        # route-level pages
  App.jsx       # route map
  main.jsx      # provider wiring
```

See `about.md` for interview-focused explanation.

## Getting Started

1. Install dependencies

```bash
npm install
```

2. Start development server

```bash
npm run dev
```

3. Build production bundle

```bash
npm run build
```

4. Preview production build

```bash
npm run preview
```

## Scripts

- `npm run dev`
- `npm run build`
- `npm run preview`
- `npm run lint`
