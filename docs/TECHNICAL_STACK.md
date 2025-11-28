# 기술 스택 및 규칙 (Technical Stack & Rules)

## 1. 핵심 프레임워크 (Core Framework)
*   **라이브러리:** React 19.
*   **번들러/런타임:** Vite (Local Build).
*   **언어:** TypeScript (TSX).

## 2. 스타일링 (Styling)
*   **프레임워크:** Tailwind CSS (v3.x).
*   **설정:** `tailwind.config.js` 및 `index.css` 사용.

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

## 7. 배포 (Deployment)
# 기술 스택 및 규칙 (Technical Stack & Rules)

## 1. 핵심 프레임워크 (Core Framework)
*   **라이브러리:** React 19.
*   **번들러/런타임:** Vite (Local Build).
*   **언어:** TypeScript (TSX).

## 2. 스타일링 (Styling)
*   **프레임워크:** Tailwind CSS (v3.x).
*   **설정:** `tailwind.config.js` 및 `index.css` 사용.

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

## 7. 배포 (Deployment)
*   **호스팅:** Firebase Hosting.
*   **빌드:** `npm run build` (Vite Build).

## 8. 폴더 구조 (Folder Structure)
```
/
├── components/     # 재사용 가능한 UI 컴포넌트
├── pages/          # 라우트 컴포넌트
├── services/       # API 통합 (Gemini)
├── docs/           # 프로젝트 문서 (PRD, 컨벤션 등)
├── roadmaps/       # 향후 개발 계획
├── App.tsx         # 메인 레이아웃
├── constants.ts    # 모의 데이터
├── types.ts        # TypeScript 인터페이스
└── ...
```
