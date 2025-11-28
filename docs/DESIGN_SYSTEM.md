# LUMINA - 디자인 시스템 (Design System)

## 1. 타이포그래피 (Typography)
**기본 폰트 (제목/브랜드):** `Cinzel` (Serif)
*   사용: 로고, 섹션 헤더, 히어로 타이틀.
*   굵기: 400 (Regular), 600 (Bold).

**보조 폰트 (본문/UI):** `Noto Sans KR` (Sans-serif)
*   사용: 본문 텍스트, 버튼, 입력 필드, 내비게이션.
*   굵기: 300 (Light), 400 (Regular), 500 (Medium), 700 (Bold).

**강조 폰트:** `Noto Serif KR` (Serif)
*   사용: 한글 제목, 감성적인 텍스트.

## 2. 컬러 팔레트 (Color Palette)

### 주요 색상 (Primary Colors)
*   **Primary Black:** `#1a1a1a` (텍스트, 푸터, 주요 버튼)
*   **White:** `#ffffff` (배경, 카드)

### 보조 및 강조 색상 (Secondary & Accents)
*   **Gold (Accent):** `#d4af37` (강조, 링크, 스페셜 배지)
*   **Secondary BG:** `#f8f8f8` (섹션 배경, 입력 필드)
*   **Border Gray:** `#e5e7eb` (구분선, 카드 테두리)

### 관리자 팔레트 (Admin Palette)
*   **Sidebar:** `#1e293b` (Slate 800)
*   **Order Status (Blue):** `#eff6ff` (배경), `#3b82f6` (텍스트)
*   **Claim Status (Pink):** `#fff1f2` (배경), `#f43f5e` (텍스트)

## 3. UI 컴포넌트 (UI Components)

### 버튼 (Buttons)
*   **스타일:** 날카로운 모서리 (rounded-none 또는 rounded-sm), 대문자 텍스트, 넓은 자간.
*   **Primary:** 어두운 배경, 흰색 텍스트.
*   **Secondary:** 흰색 배경, 어두운 테두리.

### 상품 카드 (Product Cards)
*   **이미지:** 4:5 비율 (세로형) 또는 1:1 (슬라이더용 정사각형).
*   **상호작용:** 호버 줌 (요청에 따라 제거됨), 퀵 애드 버튼.

### OOTD 카드 (OOTD Cards)
*   **이미지:** 4:5 비율.
*   **정보:** 사용자 ID, 좋아요 수, 착용 상품 태그.
*   **상호작용:** 하트(좋아요) 토글, 댓글 확장.

### 레이아웃 (Layouts)
*   **컨테이너:** `max-w-6xl`, 중앙 정렬.
*   **그리드:** 반응형 (모바일 1열, 태블릿 2열, 데스크탑 3-4열).
*   **관리자:** 사이드바 + 상단 헤더 + 콘텐츠 영역.

## 4. 아이콘 (Icons)
*   **라이브러리:** `lucide-react`
*   **스타일:** 미니멀한 라인 아이콘 (선 두께 1.5 또는 2).
