# LUMINA 프로젝트 작업 목록 (Project Task List)

## 1단계: 기초 및 설정 (Phase 1: Foundation & Setup)
- [x] **프로젝트 구조:** CDN/Importmap을 통한 React, TypeScript, Tailwind 설정.
- [x] **디자인 시스템:** 폰트 (Cinzel/Noto), 색상, Tailwind 설정 정의.
- [x] **라우팅:** `HashRouter` 및 기본 라우트 구성 (Home, Shop, Cart, Login).
- [x] **컨텍스트:** `CartContext` 및 `AuthContext` 구현.
- [x] **모의 데이터:** 상품, 주문, OOTD 게시물을 위한 `constants.ts` 생성.

## 2단계: 사용자 인터페이스 및 기능 (Phase 2: User Interface & Features)

### 홈 페이지 (Home Page)
- [x] **히어로 배너:** 감성적인 문구가 포함된 전체 너비 배너 구현.
- [x] **신상품 (New Arrivals):** 모바일 피킹(peeking) 효과가 있는 가로 슬라이더(Carousel) 생성.
- [x] **브랜드 스토리:** "Lumina Philosophy" 섹션 추가.

### 쇼핑 및 상품 상세 (Shop & Product Detail)
- [x] **상품 목록:** 카테고리 필터링이 있는 그리드 뷰.
- [x] **정렬:** "최신순" 정렬 로직 구현.
- [x] **상세 뷰:** 좌측(갤러리) / 우측(정보) 레이아웃.
- [x] **갤러리:** 메인 이미지 + 썸네일.
- [x] **탭:** "상세 정보", "리뷰", "OOTD" 탭 구현.
- [x] **기능:** 수량 선택기 및 특정 수량 "장바구니 담기".
- [x] **줌:** 줌 기능 제거 (요청 사항).
- [x] **Shop Page Enhancement**
    - [x] Implement Detailed Filtering (Price, Material, Color, Size)
    - [x] Implement Smart Search (Fuse.js)
    - [x] Implement Sorting Options (Popularity, Sales, Reviews)
    - [x] Implement Quick View Modal
    - [x] Implement Wishlist Functionality
    - [x] Implement Stock Notifications

### 장바구니 및 결제 (Cart & Checkout)
- [x] **장바구니 관리:** 아이템 목록, 수량 조절 (+/-), 아이템 삭제.
- [x] **결제 폼:** 이름, 이메일, 주소 유효성 검사.
- [x] **결제:** 성공 시 무통장 입금 정보 표시 구현.

### OOTD (커뮤니티)
- [x] **피드:** 사용자 스타일 그리드 레이아웃.
- [x] **상호작용:** 좋아요 및 사용자 ID가 있는 호버 오버레이.
- [x] **태그:** "착용 상품"을 상품 상세 페이지로 연결.

### AI 스타일리스트 (AI Stylist)
- [x] **통합:** Google Gemini API 연결.
- [x] **UI:** 토글 가능한 플로팅 채팅 위젯.
- [x] **페르소나:** 문맥 인식 프롬프팅으로 "Lumi" 페르소나 설정.

## 3단계: 관리자 대시보드 (Phase 3: Admin Dashboard)

### 레이아웃 및 내비게이션
- [x] **사이드바:** 포괄적인 메뉴가 있는 다크 네이비 테마 (`#1e293b`).
- [x] **헤더:** 사용자 정보 및 브레드크럼.

### 대시보드 위젯
- [x] **할 일 보드:** 주문(파랑) 및 클레임(분홍) 상태 카운터.
- [x] **차트:**
    - [x] 실시간 방문자 차트 (혼합 막대/선 SVG).
    - [x] 일일 방문자 차트 (막대 SVG).
    - [x] 일일 매출 현황 (선 차트 + 테이블).
- [x] **탭:** 서브 탭 구현 (일별 매출, 실시간, 주문 처리, 회원, 게시물).

### 관리 모듈
- [x] **상품:** 편집/삭제/추가 모달이 있는 리스트 뷰.
- [x] **주문:** 상태 업데이트 드롭다운.
- [x] **고객:** 멤버십 등급이 있는 리스트 뷰.
- [x] **게시물 상태:** 통계 테이블 구현.

## 4단계: 개선 및 검증 (Phase 4: Refinement & Validation)
- [x] **예외 처리:** 이미지 `onError` 대체 처리.
- [x] **유효성 검사:** 폼 입력 확인 (관리자 상품 추가, 장바구니 결제).
- [x] **UI 다듬기:**
    - [x] 내비게이션 모바일 메뉴.
    - [x] 홈 슬라이더 리사이징 (모바일에서 80% 너비).
    - [x] 홈 슬라이더 이미지 일관성 (엄격한 4:5 비율).
    - [x] 관리자 테이블 스크롤.
- [x] **배포 준비:** 최종 코드 리뷰.
- [x] **배포 (Deployment):** Firebase Hosting 배포 완료.

## 5단계: 문서화 및 리팩토링 (Phase 5: Documentation & Refactoring)
- [x] **로드맵 작성:** Home, Shop, OOTD, Cart, MyPage, Admin, Technical 로드맵 생성.
- [x] **문서 정리:** `docs/` 폴더 생성 및 PRD, 컨벤션 등 이동.
- [x] **프로젝트 구조 리팩토링:** 소스 코드를 `src/` 폴더로 이동 및 설정 파일 업데이트.
- [x] **README 업데이트:** 프로젝트 소개 및 배포 링크 추가.

## 6단계: 최적화 및 출시 준비 (Phase 6: Optimization & Launch Prep)
- [ ] **SEO 최적화:** 메타 태그 (Title, Description, OG Tags) 추가.
- [ ] **성능 최적화:** Lighthouse 점수 점검, 이미지 최적화, 코드 스플리팅 (Lazy Loading).
- [ ] **접근성 (a11y):** 키보드 내비게이션, ARIA 레이블 점검.
- [ ] **코드 리팩토링:** 사용하지 않는 코드 제거, TypeScript 타입 강화 (`any` 제거).
- [ ] **최종 테스트:** 주요 사용자 흐름 (쇼핑 -> 장바구니 -> 결제) 수동 테스트.

## 7단계: 백엔드 통합 (Phase 7: Backend Integration)
- [x] **백엔드 로드맵:** `roadmaps/BACKEND_ROADMAP.md` 작성.
    - [x] Create Data Migration Tool (`src/components/Admin/DataMigration.tsx`) <!-- id: 4 -->
    - [x] Update `Shop` and `OOTD` components to use Firestore <!-- id: 5 -->
    - [/] Run Data Migration (User Action Required) <!-- id: 6 -->
- [x] **Firebase 설정:** `firebase.ts` 및 `.env` 설정.
- [x] **인증 구현 (Auth):**
    - [x] `src/types.ts`: Order 인터페이스 수정 (userId, items 추가) <!-- id: 10 -->
    - [x] `src/services/orderService.ts`: 주문 생성 및 구매 내역 조회 함수 구현 <!-- id: 11 -->
    - [x] `src/pages/Cart.tsx`: 결제 완료 시 주문 정보 Firestore 저장 로직 추가 <!-- id: 12 -->
    - [x] `src/components/CreatePostModal.tsx`: 구매 내역 연동 및 탭 UI 구현 <!-- id: 13 -->
- [x] **위시리스트 및 리뷰:**
    - [x] `src/types.ts`: WishlistFolder, WishlistItem, Review 타입 추가 <!-- id: 26 -->
    - [x] `src/services/wishlistService.ts`: 위시리스트 관리 서비스 구현 <!-- id: 27 -->
    - [x] `src/services/reviewService.ts`: 리뷰 관리 서비스 구현 <!-- id: 28 -->
    - [x] `src/components/MyPage/Wishlist.tsx`: 위시리스트 컴포넌트 구현 <!-- id: 29 -->
    - [x] `src/components/ReviewForm.tsx`: 리뷰 작성 폼 구현 <!-- id: 30 -->
    - [x] `src/components/MyPage/PendingReviews.tsx`: 리뷰 작성 가능 상품 목록 컴포넌트 <!-- id: 31 -->
    - [x] `src/pages/MyPage.tsx`: 위시리스트 및 리뷰 탭 추가 <!-- id: 32 -->
    - [x] `src/pages/Shop.tsx`: 찜하기 버튼 추가 <!-- id: 33 -->
    - [x] `src/pages/ProductDetail.tsx`: 찜하기 및 리뷰 작성 기능 추가 <!-- id: 34 -->
- [x] **스토리지 (Storage):** 이미지 업로드 기능.
- [x] **비밀번호 찾기:** 이메일 재설정 기능 구현.
- [x] **프로필 사진:** 마이페이지 프로필 이미지 업로드 구현.
- [x] **보안 규칙:** Firestore 및 Storage 보안 규칙 적용.
- [x] **마이페이지 네비게이션:** Navbar 사용자 아이콘을 마이페이지로 연결 및 로그아웃 버튼 분리.
- [ ] **구매 내역 연동:** OOTD 작성 시 구매한 상품 태그 기능 추가.
