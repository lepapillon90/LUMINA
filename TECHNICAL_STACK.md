# 기술 스택 및 규칙 (Technical Stack & Rules)

## 1. 핵심 프레임워크 (Core Framework)
*   **라이브러리:** React 19 (CDN/Importmap 사용).
*   **번들러/런타임:** 브라우저 네이티브 ES Modules (현재 환경에서 로컬 빌드 단계 없음).
*   **언어:** TypeScript (TSX).

## 2. 스타일링 (Styling)
*   **프레임워크:** Tailwind CSS (v3.x CDN 사용).
*   **설정:** `index.html`에 정의된 커스텀 테마 확장.

## 3. 상태 관리 (State Management)
*   **전역 상태:** React Context API (`CartContext`, `AuthContext`).
*   **로컬 상태:** `useState`, `useReducer`.

## 4. 라우팅 (Routing)
*   **라이브러리:** `react-router-dom` (v6/v7).
*   **전략:** `HashRouter` (정적 호환성을 위해 사용).

## 5. AI 통합 (AI Integration)
*   **제공자:** Google Gemini API (`@google/genai`).
*   **모델:** `gemini-2.5-flash`.
*   **서비스:** `services/geminiService.ts`.

## 6. 데이터 관리 (Data Management)
*   **소스:** 정적 모의 데이터 (`constants.ts`).
*   **타입:** 컴포넌트 간 공유되는 `types.ts`에 정의.

## 7. 폴더 구조 (Folder Structure)
```
/
├── components/     # 재사용 가능한 UI 컴포넌트 (Navbar, Footer, ProductCard, AIStylist)
├── pages/          # 라우트 컴포넌트 (Home, Shop, Admin, Cart 등)
├── services/       # API 통합
├── App.tsx         # 메인 레이아웃 및 Context Providers
├── constants.ts    # 모의 데이터
├── types.ts        # TypeScript 인터페이스
├── index.tsx       # 진입점 (Entry point)
└── index.html      # HTML 템플릿 및 Importmap
```
