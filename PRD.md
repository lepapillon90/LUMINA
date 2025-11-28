# LUMINA - Project Requirements Document (PRD)

## 1. Project Overview
**Project Name:** LUMINA (루미나)
**Description:** A premium women's accessory shopping mall focusing on timeless elegance. The platform features AI-driven personal styling, an Instagram-style OOTD community, and a sophisticated Admin dashboard for store management.
**Brand Identity:** Derived from Latin "Luminósus" (Bright/Clear). Keywords: Elegant, Modern, Clarified, Shining.

## 2. Key Features

### User Side (Front Office)
*   **Home:** 
    *   Hero banner with emotional branding.
    *   "New Arrivals" horizontal scroll slider (Mobile peeking effect).
    *   Brand philosophy section.
*   **Shop (Collection):**
    *   Product grid with filtering (Earrings, Necklaces, Rings, Bracelets).
    *   Sorting by "New" status.
*   **Product Detail:**
    *   High-quality image gallery.
    *   Detailed description, shipping/AS info.
    *   **Tabs:** Details, Customer Reviews, OOTD Styling (User styling examples).
    *   Quantity selection & "Add to Cart".
*   **Cart & Checkout:**
    *   Item management (Quantity update, Remove).
    *   Checkout form with validation.
    *   **Payment Method:** Bank Transfer (Deposit) only.
*   **OOTD (Outfit Of The Day):**
    *   Community feed showing products in real life.
    *   Hover effects showing likes and user info.
    *   Tagged products linking to detail pages.
*   **AI Stylist (Lumi):**
    *   Floating chat widget powered by Google Gemini.
    *   Context-aware product recommendations.

### Admin Side (Back Office)
*   **Dashboard:**
    *   "Today's To-Do" status board (Orders/Claims).
    *   Real-time visitor analytics (PC vs Mobile).
    *   Daily sales visualization (Charts & Tables).
*   **Product Management:**
    *   CRUD operations (Create, Read, Update, Delete).
    *   Modal-based editing form.
*   **Order Management:**
    *   List view with status updates (Deposit Wait -> Completed).
    *   Filtering and search.
*   **Customer Management:**
    *   User list, total spend tracking, and membership grading (Bronze to VIP).

## 3. User Roles
*   **Guest/Customer:** Browse, Shop, View OOTD, Chat with AI.
*   **Admin:** Manage Products, Orders, Customers, and view Analytics.

## 4. Technical Constraints
*   **Platform:** Web Application (Responsive).
*   **Language:** Korean (Primary).
*   **Data:** Currently using mock data (`constants.ts`) for prototype.
