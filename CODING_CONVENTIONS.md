# 코딩 스타일 및 컨벤션

## 1. 네이밍 컨벤션 (Naming Conventions)
*   **컴포넌트 (Components):** PascalCase (예: `ProductCard.tsx`, `AIStylist.tsx`).
*   **함수/변수 (Functions/Variables):** camelCase (예: `handleAddToCart`, `isMenuOpen`).
*   **상수 (Constants):** UPPER_SNAKE_CASE (예: `PRODUCTS`, `BANK_INFO`).
*   **인터페이스 (Interfaces):** PascalCase (예: `Product`, `Order`).

## 2. 컴포넌트 구조 (Component Structure)
*   **임포트 (Imports):** React -> 서드파티 (Lucide, Router) -> 로컬 컴포넌트 -> 타입/상수 순서.
*   **Props:** `interface`를 통해 타입 정의.
*   **로직 (Logic):** Hooks와 핸들러는 최상단에 위치.
*   **렌더링 (Render):** JSX 반환.

## 3. CSS / Tailwind
*   JSX `className`에 유틸리티 클래스를 직접 사용.
*   동적인 경우(예: 배경 이미지)가 아니면 인라인 `style={{}}` 사용 지양.
*   상호작용하는 부모-자식 스타일에는 `group`과 `group-hover` 사용.

## 4. TypeScript
*   가능한 한 `any` 사용 지양.
*   서비스(Services)에는 명시적인 반환 타입 사용.
*   중복 방지를 위해 `types.ts`를 통해 인터페이스 공유.

## 5. 에러 처리 (Error Handling)
*   **이미지 (Images):** `onError` 핸들러를 사용하여 대체 이미지(placeholder) 제공.
*   **입력 (Inputs):** 제출 전 폼 데이터 유효성 검사 (예: 장바구니 결제, 관리자 상품 추가).
*   **API:** Gemini API 호출 시 Try/Catch 블록 사용.
