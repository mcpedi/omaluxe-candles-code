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

## Custom Notification System
- [x] DB schema: notifications table (userId, type, title, message, isRead, createdAt)
- [x] DB schema: notification_preferences table (userId, orderUpdates, promotions, newArrivals)
- [x] Run migration and apply SQL for new tables
- [x] tRPC router: notifications.list (get user's notifications)
- [x] tRPC router: notifications.markRead (mark one or all as read)
- [x] tRPC router: notifications.preferences.get / update
- [x] Auto-create in-app notification for customer on order placement
- [x] Auto-create in-app notification for customer on order status change (admin updates)
- [x] Owner push notification on new order (already exists, enhance with structured details)
- [x] In-app notification bell icon in Navbar with unread count badge
- [x] Notification dropdown/panel showing recent notifications
- [x] Mark all as read button in notification panel
- [x] Customer notification preferences page (opt in/out of order updates, promotions, new arrivals)
- [x] Toast notifications for key actions (add to cart, order placed, status update)
- [x] Admin: send broadcast notification to all users (promotions / new arrivals)
- [x] Vitest tests for notification router

## SEO Fixes (Homepage /)
- [x] Set page title to 30–60 characters (keyword-rich)
- [x] Add meta description (50–160 characters)
- [x] Add meta keywords tag with relevant candle/scent keywords
- [x] Set document.title dynamically in Home.tsx for SPA correctness

## Currency & Contact Updates
- [x] Change currency symbol from $ to KSh across all pages (Cart, Checkout, ProductCard, ProductDetail, Admin, OrderConfirmation)
- [x] Update contact phone number to +254790876812 in About/Contact page and Footer

## WhatsApp Floating Button
- [x] Add floating WhatsApp chat button linking to +254790876812

## Google Search Console
- [x] Upload Google verification file (googlef64e420495b2f575.html) to public folder

## Email & WhatsApp Updates
- [x] Update contact email to omaluxescentskenya@gmail.com across About, Footer, and contact pages
- [x] Update WhatsApp number to 0778758364 (international: +254778758364) in WhatsAppButton and contact pages

## Image Upload Feature
- [x] Create image upload component for Admin Panel
- [x] Add upload handler to backend (tRPC router)
- [x] Integrate image upload into product form (add and edit)
- [x] Show image preview in product form

## Wishlist Feature
- [x] Create wishlist database schema (wishlist_items table)
- [x] Add wishlist query helpers to db.ts
- [x] Create wishlist tRPC router (add, remove, list, check if wishlisted)
- [x] Create WishlistButton component with heart icon
- [x] Add wishlist button to ProductCard component
- [x] Add wishlist button to ProductDetail page
- [x] Create Wishlist page showing all saved items
- [x] Add Wishlist link to Navbar
- [x] Add wishlist count badge to Navbar
- [x] Show toast notifications on add/remove from wishlist

## Stripe Payment Integration
- [ ] Add Stripe feature via webdev_add_feature
- [ ] Configure Stripe API keys (publishable and secret)
- [ ] Create payment intent endpoint in backend
- [ ] Build StripePaymentForm component with card element
- [ ] Integrate Stripe into Checkout page
- [ ] Handle payment success and error states
- [ ] Update order creation to include Stripe payment ID
- [ ] Test end-to-end payment flow

## Advanced Admin Dashboard
- [x] Create coupons table in database schema
- [x] Add sales analytics and revenue calculation functions
- [x] Create tRPC routers for analytics, coupons, customers, and email marketing
- [x] Build Sales Analytics tab UI with charts and key metrics
- [x] Build Inventory Management tab UI with stock levels and low stock alerts
- [x] Build Customer Management tab UI with customer list and details
- [x] Build Coupon Management tab UI with create/edit/delete coupons
- [x] Build Product Performance Tracking tab UI with best sellers and trends
- [x] Build Bulk Email Marketing tab UI for campaigns
- [x] Build Revenue Reports tab UI with detailed financial data
- [x] Integrate all tabs into enhanced Admin Dashboard
- [x] Write Vitest tests for admin dashboard functionality
- [x] Test all dashboard features end-to-end in browser
- [x] Save checkpoint with complete admin dashboard

## Product Reviews & Ratings
- [x] Create reviews table in database schema (productId, userId, rating, title, comment, createdAt)
- [x] Run migration and apply SQL for reviews table
- [x] Add review query helpers to db.ts (create, list by product, get average rating, delete)
- [x] Create tRPC routers for reviews (create, list, delete, get average rating)
- [x] Create ProductReviews UI component with review form and list
- [x] Add star rating display component
- [x] Integrate reviews into ProductDetail page
- [ ] Add review count and average rating to ProductCard component
- [x] Write Vitest tests for review functionality
- [x] Test reviews feature end-to-end in browser

