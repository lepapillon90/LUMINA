# Technical Stack & Rules

## 1. Core Framework
*   **Library:** React 19 (via CDN/Importmap).
*   **Bundler/Runtime:** Browser-native ES Modules (no local build step in current environment).
*   **Language:** TypeScript (TSX).

## 2. Styling
*   **Framework:** Tailwind CSS (v3.x via CDN).
*   **Config:** Custom theme extensions defined in `index.html`.

## 3. State Management
*   **Global State:** React Context API (`CartContext`, `AuthContext`).
*   **Local State:** `useState`, `useReducer`.

## 4. Routing
*   **Library:** `react-router-dom` (v6/v7).
*   **Strategy:** `HashRouter` (for static compatibility).

## 5. AI Integration
*   **Provider:** Google Gemini API (`@google/genai`).
*   **Model:** `gemini-2.5-flash`.
*   **Service:** `services/geminiService.ts`.

## 6. Data Management
*   **Source:** Static Mock Data (`constants.ts`).
*   **Types:** Defined in `types.ts` shared across components.

## 7. Folder Structure
```
/
├── components/     # Reusable UI components (Navbar, Footer, ProductCard, AIStylist)
├── pages/          # Route components (Home, Shop, Admin, Cart, etc.)
├── services/       # API integrations
├── App.tsx         # Main layout & Context Providers
├── constants.ts    # Mock data
├── types.ts        # TypeScript interfaces
├── index.tsx       # Entry point
└── index.html      # HTML template & Importmap
```
