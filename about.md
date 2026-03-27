# ABOUT - Rajkonna Frontend

This document is an interview-ready walkthrough of the Rajkonna frontend project.
It explains the real React architecture, how UI events become API calls, and how to answer common frontend interview questions clearly.

---

## 1) 30-Second Version (Most Important)

Rajkonna frontend is a React 19 + Vite 7 e-commerce storefront for skincare products. It uses Context API for app-wide state (auth, products, modal), React Router for page navigation, Tailwind CSS for styling, and GSAP/React Spring for motion. The API layer is centralized through Axios (`/api` base path), then Vercel rewrites forward calls to the backend service. The app supports login/register, product browsing with search, product details, cart management, checkout (COD), profile editing, and an admin orders dashboard.

---

## 2) 1-2 Minute Technical Explanation

The app starts from `src/main.jsx`, where `App` is wrapped with:
- `AuthProvider`
- `ModalProvider`
- `ProductProvider`
- global `Toaster` for notifications

Routing is configured in `src/App.jsx`:
- `/` home page
- `/products` listing
- `/products/:id` details
- `/cart` cart page
- `/admin` admin orders dashboard
- `*` not-found fallback

The main data flow is:
UI component -> Context action -> Axios client -> `/api/*` -> backend response -> UI update/toast.

`src/api/axiosInstance.js` sets `baseURL: "/api"`. In production, `vercel.json` rewrites:
- `/api/(.*)` -> `https://ecommerce-backend-api-wyxt.onrender.com/api/$1`
- all other routes -> `/` (SPA fallback)

Auth logic lives in `src/context/AuthContext.jsx` (login/register/logout + localStorage persistence). Product and cart logic lives in `src/context/ProductProvider.jsx` (fetch products, product CRUD, cart item updates). Components/pages call these actions and render loading/error states.

---

## 3) Deep Dive (Only If They Ask)

### 3.1 Architecture and Request Lifecycle

Request lifecycle from a user action:
1. User clicks in the UI (for example, Add to Cart).
2. Component calls a Context method (`addToCart`, `login`, `fetchProducts`, etc.).
3. Context method calls Axios endpoint (`/api/...`).
4. Backend returns JSON.
5. Context/page updates state and shows toast feedback.
6. React re-renders affected UI.

Core architecture pattern:
- Pages/components: rendering and user interaction
- Contexts: shared app state + business actions
- Axios client: HTTP abstraction
- Backend API: source of truth for products/cart/orders/profile

### 3.2 Authentication Deep Dive

Primary file: `src/context/AuthContext.jsx`

- Register:
	- `POST /api/auth/register`
	- normalizes returned user role (`isAdmin -> role: admin`)
	- stores user in localStorage and context state

- Login:
	- `POST /api/auth/login`
	- same normalization and persistence flow

- Logout:
	- `POST /api/auth/logout`
	- clears context user and localStorage

UI entry point:
- `src/components/modals/AuthModal.jsx` handles login/register form UX and validation

### 3.3 Product Discovery Flow Deep Dive

Key files:
- `src/pages/ProductListing.jsx`
- `src/components/ProductCard.jsx`
- `src/context/ProductProvider.jsx`

Behavior:
- Search input updates `searchQuery`
- Debounced effect calls `fetchProducts({ q })`
- `fetchProducts` calls `GET /api/products`
- Results render in responsive grid cards

Product details:
- `src/pages/ProductDetail.jsx` loads `GET /api/products/:id`
- Add to Cart button calls shared `addToCart`

### 3.4 Cart Flow Deep Dive

Key files:
- `src/pages/CartPage.jsx`
- `src/context/ProductProvider.jsx`

Cart operations:
- Load cart: `GET /api/cart`
- Add item: `POST /api/cart/items`
- Update qty: `PUT /api/cart/items/:productId`
- Remove item: `DELETE /api/cart/items/:productId`
- Clear cart: `DELETE /api/cart`

Checkout:
- `POST /api/orders` with `{ paymentMethod: "COD" }`
- Success toast shown and cart UI cleared locally

### 3.5 Admin Flow Deep Dive

Order admin dashboard (`src/pages/AdminDashboard.jsx`):
- List orders: `GET /api/orders?page=&limit=10`
- View single order: `GET /api/orders/:orderId`
- Delete order: `DELETE /api/orders/:orderId`

Product admin actions in context:
- Add: `POST /api/products`
- Edit: `PUT /api/products/:id`
- Delete: `DELETE /api/products/:id`

### 3.6 Profile Sidebar Flow

Key file: `src/components/ProfileSidebar.jsx`

- Fetch user profile on open: `GET /api/auth/profile`
- Save profile edits: `PUT /api/auth/profile`
- Includes phone and structured address fields

### 3.7 Motion and UX Layer

Motion stack used in UI:
- GSAP (`@gsap/react`) for nav/sidebar/table interactions
- React Spring for scroll/parallax patterns
- Tailwind animations and custom keyframes in `src/index.css`

This gives the project stronger visual identity beyond a plain CRUD interface.

---

## Folder and File Guide (Frontend)

## Root

- `index.html`
	- Vite HTML entry with `#root` mount.

- `package.json`
	- Scripts and dependencies (React 19, Vite 7, Router 7, Tailwind 4, Axios, GSAP, etc.).

- `vite.config.js`
	- React and Tailwind Vite plugins + `@` alias to `src`.

- `vercel.json`
	- Rewrites API calls to backend and supports SPA route fallback.

- `eslint.config.js`
	- Lint rules for JS/React hooks/react refresh.

- `README.md`
	- Project overview and setup notes.

- `about.md`
	- This interview guide.

## public

- `assets/audio/*`
	- Background audio for UI effects.

- `assets/videos/*`
	- Hero video assets.

- `assets/fonts/*`
	- Custom font files used in global CSS.

- `images/*`
	- Branding and section imagery.

## src

### Core

- `main.jsx`
	- Bootstraps app with providers and toaster.

- `App.jsx`
	- Route definitions and global auth modal mount.

- `index.css`
	- Theme variables, font-face setup, shared utility styles, animations.

### API

- `api/axiosInstance.js`
	- Shared Axios client (`baseURL: "/api"`).

### Context

- `context/AuthContext.jsx`
	- User session state and auth actions.

- `context/ModalContext.jsx`
	- Global auth modal state.

- `context/ProductContext.jsx`
	- Context object definition for product/cart domain.

- `context/ProductProvider.jsx`
	- Products + cart + admin product operations.

- `context/useProducts.js`
	- Hook wrapper for product context.

### Pages

- `pages/Home.jsx`
	- Composes landing sections (hero/about/products/contact/footer).

- `pages/ProductListing.jsx`
	- Product list with live search.

- `pages/ProductDetail.jsx`
	- Single product view + add to cart.

- `pages/CartPage.jsx`
	- Cart operations, totals display, checkout action.

- `pages/AdminDashboard.jsx`
	- Admin orders management with details + deletion.

- `pages/AddProduct.jsx`
	- Admin add product form (currently not routed in `App.jsx`).

- `pages/EditProduct.jsx`
	- Admin edit product form (currently not routed in `App.jsx`).

- `pages/NotFound.jsx`
	- Fallback route page.

### Components

- `components/Navbar.jsx`
	- Navigation, auth actions, cart link, mobile menu, profile sidebar trigger.

- `components/modals/AuthModal.jsx`
	- Login/register modal controlled by `ModalContext`.

- `components/ProfileSidebar.jsx`
	- Profile read/update panel.

- `components/ProductCard.jsx`
	- Reusable product card with add-to-cart and admin delete button.

- `components/Hero.jsx`, `HeroSection.jsx`, `VideoPinSection.jsx`, `StarBackground.jsx`
	- Hero visuals and animated presentation.

- `components/AboutSection.jsx`, `Product.jsx`, `Facewash.jsx`, `Moisture.jsx`, `Contact.jsx`, `RajkonnaFooter.jsx`, `AudioToggle.jsx`
	- Brand storytelling and section-level UI blocks.

### Utility and Data

- `lib/utils.jsx`
	- `cn(...)` class merge helper + `normalizeId(...)` id normalizer.

- `data/products.json`
	- Static product reference data.

---

## Interview Q&A Bank

### Q: How does data flow in this frontend?

Short answer:
- Component -> Context action -> Axios -> backend -> state update -> re-render.

Long answer:
- Components remain mostly presentation/event layers.
- Context providers hold shared state and reusable async actions.
- A shared Axios client keeps network calls consistent.
- Toasts and loading flags provide user feedback.

### Q: How is authentication handled on frontend?

Short answer:
- Auth modal calls login/register actions from `AuthContext`; user state is persisted in localStorage and reused on refresh.

Long answer:
- `AuthContext` exposes `login`, `register`, `logout`.
- Successful auth responses are normalized and stored in both state and localStorage.
- UI conditionally renders auth buttons/profile options using `user` state.

### Q: How do product and cart features work?

- Product list and detail pages call `ProductProvider` methods.
- Cart page fetches latest cart totals from backend and provides update/remove/clear operations.
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
