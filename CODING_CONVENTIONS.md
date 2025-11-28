# Coding Style & Conventions

## 1. Naming Conventions
*   **Components:** PascalCase (e.g., `ProductCard.tsx`, `AIStylist.tsx`).
*   **Functions/Variables:** camelCase (e.g., `handleAddToCart`, `isMenuOpen`).
*   **Constants:** UPPER_SNAKE_CASE (e.g., `PRODUCTS`, `BANK_INFO`).
*   **Interfaces:** PascalCase (e.g., `Product`, `Order`).

## 2. Component Structure
*   **Imports:** React -> 3rd Party (Lucide, Router) -> Local Components -> Types/Constants.
*   **Props:** typed via `interface`.
*   **Logic:** Hooks and Handlers at the top.
*   **Render:** return JSX.

## 3. CSS / Tailwind
*   Use utility classes directly in JSX `className`.
*   Avoid inline `style={{}}` unless dynamic (e.g., background images).
*   Use `group` and `group-hover` for interactive parent-child styles.

## 4. TypeScript
*   Avoid `any` where possible.
*   Use explicit return types for Services.
*   Share interfaces via `types.ts` to avoid duplication.

## 5. Error Handling
*   **Images:** Use `onError` handlers to provide placeholders.
*   **Inputs:** Validate form data before submission (e.g., Cart checkout, Admin product add).
*   **API:** Try/Catch blocks for Gemini API calls.
