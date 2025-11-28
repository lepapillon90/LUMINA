
# LUMINA Project Task List

## Phase 1: Foundation & Setup
- [x] **Project Structure:** Set up React, TypeScript, and Tailwind via CDN/Importmap.
- [x] **Design System:** Define Fonts (Cinzel/Noto), Colors, and Tailwind config.
- [x] **Routing:** Configure `HashRouter` and basic routes (Home, Shop, Cart, Login).
- [x] **Context:** Implement `CartContext` and `AuthContext`.
- [x] **Mock Data:** Create `constants.ts` for Products, Orders, and OOTD posts.

## Phase 2: User Interface & Features

### Home Page
- [x] **Hero Banner:** Implement full-width banner with emotional copy.
- [x] **New Arrivals:** Create horizontal slider (Carousel) with mobile peeking effect.
- [x] **Brand Story:** Add "Lumina Philosophy" section.

### Shop & Product Detail
- [x] **Product Listing:** Grid view with category filtering.
- [x] **Sorting:** Implement "Newest" sort logic.
- [x] **Detail View:** Left (Gallery) / Right (Info) layout.
- [x] **Gallery:** Main image + thumbnails.
- [x] **Tabs:** Implement "Details", "Reviews", and "OOTD" tabs.
- [x] **Functionality:** Quantity selector and "Add to Cart" with specific quantity.
- [x] **Zoom:** Remove zoom functionality (as requested).

### Cart & Checkout
- [x] **Cart Management:** List items, adjust quantities (+/-), remove items.
- [x] **Checkout Form:** Validate Name, Email, Address.
- [x] **Payment:** Implement Bank Transfer info display upon success.

### OOTD (Community)
- [x] **Feed:** Grid layout of user styles.
- [x] **Interactivity:** Hover overlay with Likes and User ID.
- [x] **Tagging:** Link "Used Products" to Product Detail pages.

### AI Stylist
- [x] **Integration:** Connect Google Gemini API.
- [x] **UI:** Floating chat widget with toggle.
- [x] **Persona:** Configure "Lumi" persona with context-aware prompting.

## Phase 3: Admin Dashboard (Back Office)

### Layout & Navigation
- [x] **Sidebar:** Dark navy theme (`#1e293b`) with comprehensive menu.
- [x] **Header:** User info and Breadcrumbs.

### Dashboard Widgets
- [x] **To-Do Board:** Status counters for Orders (Blue) and Claims (Pink).
- [x] **Charts:**
    - [x] Real-time Visitor Chart (Mixed Bar/Line SVG).
    - [x] Daily Visitor Chart (Bar SVG).
    - [x] Daily Sales Status (Line Chart + Table).
- [x] **Tabs:** Implement sub-tabs (Daily Sales, Real-time, Order Proc, Member, Posts).

### Management Modules
- [x] **Products:** List view with Edit/Delete/Add Modal.
- [x] **Orders:** status update dropdowns.
- [x] **Customers:** List view with membership grades.
- [x] **Post Status:** Stats table implementation.

## Phase 4: Refinement & Validation (Current Focus)
- [x] **Exception Handling:** Image `onError` fallbacks.
- [x] **Validation:** Form input checks (Admin Product Add, Cart Checkout).
- [x] **UI Polishing:**
    - [x] Navbar mobile menu.
    - [x] Home slider resizing (80% width on mobile).
    - [x] Home slider image consistency (Strict 4:5 ratio).
    - [x] Admin table scrolling.
- [ ] **Deployment Preparation:** Final code review.
