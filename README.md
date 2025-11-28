# LUMINA - Modern Jewelry Shop

<div align="center">
  <h3>✨ 내면의 빛을 발견하세요, LUMINA ✨</h3>
  <p>모던하고 우아한 쥬얼리 쇼핑몰 & 스타일링 커뮤니티</p>
  <a href="https://lumina-shop-prod-8291.web.app"><strong>배포 사이트 방문하기 »</strong></a>
</div>

<br />

## 📋 프로젝트 소개 (Project Overview)

**LUMINA**는 단순한 쇼핑몰을 넘어, 고객이 자신의 스타일을 발견하고 공유할 수 있는 **커뮤니티형 커머스 플랫폼**입니다.
Google Gemini 기반의 **AI 스타일리스트**와 사용자 참여형 **OOTD(Outfit Of The Day)** 기능을 통해 차별화된 쇼핑 경험을 제공합니다.

---

## 🚀 주요 기능 (Key Features)

### 1. 쇼핑 (Commerce)
- **홈 (Home)**: 감성적인 히어로 배너, 신상품 슬라이더, 트렌딩 OOTD 섹션.
- **상품 목록 (Shop)**: 카테고리별 필터링, 최신순 정렬.
- **상품 상세 (Detail)**: 갤러리 뷰, 연관 상품, 리뷰 탭.
- **장바구니 & 결제**: 수량 조절, 주소 입력 및 유효성 검사.

### 2. 커뮤니티 (Community)
- **OOTD 피드**: 사용자들이 올린 스타일링 샷 구경하기.
- **게시물 작성**: 사진 업로드(Mock), 캡션 작성, 착용 상품 태그.
- **상호작용**: 좋아요(Like) 및 댓글(Comment) 기능으로 소통.

### 3. AI 기술 (AI Tech)
- **AI 스타일리스트 'Lumi'**: Google Gemini API를 활용한 1:1 스타일링 상담 챗봇.
- 현재 보고 있는 상품이나 상황(TPO)에 맞는 쥬얼리 추천.

### 4. 관리자 (Admin)
- **대시보드**: 실시간 방문자, 매출 현황 차트 시각화.
- **관리 기능**: 상품, 주문, 고객, 게시물 관리 인터페이스.

---

## 🛠 기술 스택 (Tech Stack)

- **Frontend**: React 19, TypeScript, Vite
- **Styling**: Tailwind CSS, Lucide React (Icons)
- **AI**: Google Gemini API (`@google/genai`)
- **Deployment**: Firebase Hosting
- **Routing**: React Router v7

---

## 📂 프로젝트 구조 (Project Structure)

```
LUMINA/
├── components/     # 재사용 가능한 UI 컴포넌트
├── pages/          # 페이지 단위 컴포넌트 (Home, Shop, OOTD 등)
├── services/       # API 통신 로직 (Gemini 등)
├── docs/           # 프로젝트 문서 (PRD, 컨벤션, 디자인 시스템 등)
│   ├── PRD.md
│   ├── CODING_CONVENTIONS.md
│   └── ...
├── roadmaps/       # 향후 개발 계획 (페이지별 로드맵)
│   ├── HOME_ROADMAP.md
│   ├── SHOP_ROADMAP.md
│   └── ...
└── ...
```

---

## 🏃‍♂️ 시작하기 (Getting Started)

### 필수 조건
- Node.js (v18 이상 권장)
- npm

### 설치 및 실행

1. **저장소 클론**
   ```bash
   git clone [repository-url]
   cd LUMINA
   ```

2. **의존성 설치**
   ```bash
   npm install
   ```

3. **환경 변수 설정**
   `.env` 파일을 생성하고 Gemini API 키를 입력하세요.
   ```env
   VITE_GEMINI_API_KEY=your_api_key_here
   ```

4. **개발 서버 실행**
   ```bash
   npm run dev
   ```

---

## 📝 문서 (Documentation)

더 자세한 내용은 `docs/` 폴더를 참고하세요.
- [기획서 (PRD)](docs/PRD.md)
- [코딩 컨벤션](docs/CODING_CONVENTIONS.md)
- [디자인 시스템](docs/DESIGN_SYSTEM.md)

## 🗺️ 로드맵 (Roadmap)

향후 개발 계획은 `roadmaps/` 폴더에 정리되어 있습니다.
- [홈 페이지 로드맵](roadmaps/HOME_ROADMAP.md)
- [쇼핑 페이지 로드맵](roadmaps/SHOP_ROADMAP.md)
- [OOTD 로드맵](roadmaps/OOTD_ROADMAP.md)
