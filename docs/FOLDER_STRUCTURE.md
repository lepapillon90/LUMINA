# 📂 프로젝트 폴더 구조 (Project Folder Structure)

LUMINA 프로젝트의 주요 디렉토리와 파일에 대한 상세 설명입니다.

## 📦 Root Directory
| 폴더/파일 | 설명 |
| :--- | :--- |
| `.storybook/` | Storybook 설정 파일 (`main.ts`, `preview.ts`)이 위치합니다. |
| `docs/` | 프로젝트 문서 (PRD, 기술 스택, 디자인 시스템 등)를 관리합니다. |
| `roadmaps/` | 페이지별, 기능별 개발 로드맵 마크다운 파일들이 있습니다. |
| `scripts/` | 데이터 마이그레이션 등 유틸리티 스크립트를 보관합니다. |
| `src/` | 애플리케이션의 소스 코드가 위치하는 메인 디렉토리입니다. |
| `public/` | 정적 파일 (이미지, 파비콘 등)을 저장합니다. |
| `firebase.json` | Firebase Hosting 및 Functions 설정 파일입니다. |
| `vite.config.ts` | Vite 번들러 설정 파일입니다. |

## 💻 Source Code (`src/`)
| 폴더 | 설명 |
| :--- | :--- |
| `components/` | 재사용 가능한 UI 컴포넌트들을 분류하여 관리합니다. |
| `contexts/` | React Context API (Auth, Cart 등) 정의 파일들이 있습니다. |
| `pages/` | 라우팅에 매핑되는 페이지 단위 컴포넌트들입니다. |
| `services/` | 외부 API (Firebase, Gemini) 통신 로직을 담당합니다. |
| `stories/` | Storybook 초기화 시 생성된 예제 스토리 파일들입니다. (실제 스토리는 컴포넌트와 함께 위치) |
| `utils/` | 공통 유틸리티 함수들이 위치합니다. |
| `App.tsx` | 메인 애플리케이션 컴포넌트 (라우팅 및 프로바이더 설정). |
| `main.tsx` | React 앱의 진입점 (Entry Point). |

### 🧩 Components (`src/components/`)
| 폴더 | 설명 |
| :--- | :--- |
| `common/` | 버튼, 입력창, 모달 등 범용적으로 사용되는 아토믹 컴포넌트. |
| `features/` | 특정 기능이나 도메인에 종속된 컴포넌트 (예: Home의 배너, Shop의 필터). |
| `layout/` | Navbar, Footer 등 레이아웃 관련 컴포넌트. |
| `Admin/` | 관리자 페이지 전용 컴포넌트. |
| `MyPage/` | 마이페이지 전용 컴포넌트. |

### 📄 Pages (`src/pages/`)
주요 라우트 페이지들이 위치합니다.
- `Home.tsx`: 메인 랜딩 페이지
- `Shop.tsx`: 상품 목록 페이지
- `ProductDetail.tsx`: 상품 상세 페이지
- `Cart.tsx`: 장바구니 페이지
- `OOTD.tsx`: 커뮤니티 피드 페이지
- `Admin.tsx`: 관리자 대시보드
- `Auth/`: 로그인, 회원가입 등 인증 관련 페이지

## 🛠 Services (`src/services/`)
- `firebase.ts`: Firebase 초기화 및 인스턴스 export.
- `geminiService.ts`: Google Gemini AI API 호출 로직.
- `productService.ts`: 상품 데이터 CRUD 로직.
- `authService.ts`: 사용자 인증 관련 로직.
