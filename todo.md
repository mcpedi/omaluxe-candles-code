# OmaLuxe Candles and Scents — Project TODO

## Database & Backend
- [x] Define schema: products, categories, cart_items, orders, order_items tables
- [x] Run migration and apply SQL
- [x] Seed initial candle products with names, descriptions, prices, scents, sizes
- [x] tRPC routers: products (list, get, create, update, delete)
- [x] tRPC routers: cart (add, remove, update, get)
- [x] tRPC routers: orders (place, list, get by user, list all for admin)
- [x] tRPC routers: admin (product CRUD, order management)
- [x] Owner notification on new order placement (full order + customer details)

## Homepage & Layout
- [x] Global navigation bar with logo, links, cart icon, auth state
- [x] Transparent-to-solid navbar on scroll with white-to-dark color transition
- [x] Hero section with brand tagline and CTA
- [x] Featured collections section
- [x] Bestsellers section
- [x] Footer with brand info, links, contact

## Pages
- [x] Product catalog page with filters and grid layout
- [x] Product detail page (scent description, sizes, quantity, add-to-cart)
- [x] Shopping cart page (item management, order summary)
- [x] Checkout page (customer info, order placement)
- [x] Order confirmation page
- [x] Collections page with 6 mood-based collections
- [x] About/Contact page with brand story and contact info
- [x] User account page with order history
- [x] Admin panel: product management (add, edit, delete)
- [x] Admin panel: order management (view all orders, update status)

## AI Widget
- [x] AI scent recommendation chat widget (Oma advisor)
- [x] Mood/preference input flow with quick prompts
- [x] Product recommendation output linked to catalog

## Auth
- [x] Login / Sign up flow via Manus OAuth
- [x] Protected routes for account and admin pages
- [x] Role-based admin access

## Style & Polish
- [x] Luxury color palette (warm creams, deep golds, soft blacks)
- [x] Premium typography (Cormorant Garamond serif + Jost sans-serif)
- [x] Smooth hover animations and transitions
- [x] Responsive design (mobile, tablet, desktop)
- [x] High-quality image presentation

## Testing
- [x] Vitest: product router tests (14 tests passing)
- [x] Vitest: order router tests
- [x] Vitest: cart router tests
- [x] Vitest: auth tests
- [x] Vitest: AI recommendation tests
