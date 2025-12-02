# 홈페이지 섹션 구조 분석 문서

## 개요

LUMINA 쇼핑몰 홈페이지(`src/pages/Home.tsx`)의 각 섹션별 상세 구조와 기능을 분석한 문서입니다.

---

## 홈페이지 전체 구조

```
Home.tsx
├── SEO 컴포넌트
├── Hero Section (비디오 배경)
├── TimeSale 컴포넌트
├── New Arrivals 섹션
├── LookbookSection 컴포넌트
├── TrendingOOTDSection 컴포넌트
├── MagazineSection 컴포넌트
├── InstagramFeed 컴포넌트
├── NewsletterPopup 컴포넌트 (조건부 표시)
└── PurchaseNotification 컴포넌트 (조건부 표시)
```

---

## 1. Hero Section

### 파일 위치
- `src/pages/Home.tsx` (라인 54-101)

### 현재 구현
- 비디오 배경 자동 재생
- 포스터 이미지 (fallback)
- 브랜드 타이틀 및 설명 텍스트
- "컬렉션 보기" 버튼
- 오버레이 효과

### 데이터 소스
- **하드코딩**: 비디오 URL, 텍스트 내용
- **비디오 URL**: `https://videos.pexels.com/video-files/5359634/...`
- **포스터 이미지**: `/hero_poster.png`

### 관리 필요 항목
- ✅ 비디오 URL
- ✅ 포스터 이미지
- ✅ 제목, 부제목, 설명 텍스트
- ✅ 버튼 텍스트 및 링크

### 관리자 페이지 연동
- `HomepageManager` → `HeroSectionManager`

---

## 2. TimeSale 컴포넌트

### 파일 위치
- `src/components/features/home/TimeSale.tsx`

### 현재 구현
- 24시간 카운트다운 타이머
- 할인 상품 미리보기
- "LIMITED TIME OFFER" 배지
- 할인 전/후 가격 표시

### 데이터 소스
- **하드코딩**: 제목, 설명, 상품 정보
- **동적**: 자정까지의 카운트다운 (자동 계산)

### 관리 필요 항목
- ✅ 타임세일 제목/설명
- ✅ 할인율
- ✅ 상품 선택
- ✅ 배경 스타일
- ✅ 종료 시간 설정

### 관리자 페이지 연동
- `HomepageManager` → `TimeSaleManager`

---

## 3. New Arrivals 섹션

### 파일 위치
- `src/pages/Home.tsx` (라인 106-192)

### 현재 구현
- "New Arrivals" 제목 및 설명
- 좌우 스크롤 슬라이더
- 상품 카드 그리드
- 위시리스트 기능
- "NEW" 배지

### 데이터 소스
- **Firestore**: `products` 컬렉션에서 `isNew === true` 필터링
- **서비스**: `productService.getProducts()`

### 관리 필요 항목
- ✅ 신상품으로 표시할 상품 선택
- ✅ 표시 순서 조정
- ✅ 최대 표시 개수
- ✅ 섹션 제목/설명

### 관련 로직
```typescript
const allProducts = await getProducts();
const newProducts = allProducts.filter(p => p.isNew);
setNewArrivals(newProducts);
```

### 관리자 페이지 연동
- `HomepageManager` → `NewArrivalsManager`

---

## 4. LookbookSection 컴포넌트

### 파일 위치
- `src/components/features/home/LookbookSection.tsx`

### 현재 구현
- 룩북 이미지 표시
- 인터랙티브 핫스팟 (클릭/호버 시 상품 정보 표시)
- 툴팁 형태의 상품 정보
- "Shop the Collection" 링크

### 데이터 소스
- **하드코딩**: 
  - 룩북 이미지 URL
  - 핫스팟 좌표 (x, y 퍼센트)
  - 연결된 상품 정보

### 핫스팟 구조
```typescript
interface Hotspot {
  id: number;
  x: number;      // 퍼센트 (0-100)
  y: number;      // 퍼센트 (0-100)
  product: {
    id: number;
    name: string;
    price: number;
    image: string;
  };
}
```

### 관리 필요 항목
- ✅ 룩북 이미지 업로드
- ✅ 핫스팟 추가/수정/삭제
- ✅ 각 핫스팟에 연결할 상품 선택
- ✅ 섹션 제목/설명
- ✅ 여러 룩북 관리 (시즌별)

### 관리자 페이지 연동
- `HomepageManager` → `LookbookManager`

---

## 5. TrendingOOTDSection 컴포넌트

### 파일 위치
- `src/components/features/home/TrendingOOTDSection.tsx`

### 현재 구현
- 좋아요 수 기준 상위 3개 OOTD 표시
- 트렌딩 배지 (#1, #2, #3)
- 좋아요 수 표시
- "더 보기" 링크

### 데이터 소스
- **하드코딩**: `src/constants.ts`의 `OOTD_POSTS`
- **정렬**: 좋아요 수 내림차순

### 관련 로직
```typescript
const trendingPosts = [...OOTD_POSTS]
  .sort((a, b) => b.likes - a.likes)
  .slice(0, 3);
```

### 관리 필요 항목
- ✅ 표시할 OOTD 개수 설정
- ✅ 수동으로 OOTD 선택 (오버라이드)
- ✅ 정렬 기준 설정
- ✅ 섹션 제목/설명

### 관리자 페이지 연동
- `HomepageManager` → `TrendingOOTDManager`

---

## 6. MagazineSection 컴포넌트

### 파일 위치
- `src/components/features/home/MagazineSection.tsx`

### 현재 구현
- 매거진 아티클 그리드 (3개)
- 카테고리, 제목, 설명 표시
- 호버 시 이미지 확대 효과
- "더 보기" 링크

### 데이터 소스
- **하드코딩**: 컴포넌트 내부 배열

### 아티클 구조
```typescript
{
  id: number;
  category: string;
  title: string;
  excerpt: string;
  image: string;
  link: string;
}
```

### 관리 필요 항목
- ✅ 매거진 아티클 추가/수정/삭제
- ✅ 이미지 업로드
- ✅ 카테고리 관리
- ✅ 발행일 설정
- ✅ 순서 조정

### 관리자 페이지 연동
- `HomepageManager` → `MagazineManager`

---

## 7. InstagramFeed 컴포넌트

### 파일 위치
- `src/components/features/home/InstagramFeed.tsx`

### 현재 구현
- 인스타그램 그리드 레이아웃 (6개)
- 좋아요/댓글 수 표시
- 호버 시 오버레이
- "FOLLOW US" 링크

### 데이터 소스
- **하드코딩**: 컴포넌트 내부 배열

### 포스트 구조
```typescript
{
  id: number;
  image: string;
  likes: number;
  comments: number;
  link: string;
}
```

### 관리 필요 항목
- ✅ 인스타그램 계정 연결
- ✅ 포스트 이미지 업로드
- ✅ 좋아요/댓글 수 입력
- ✅ 링크 설정
- ✅ 표시할 포스트 수 설정

### 관리자 페이지 연동
- `HomepageManager` → `InstagramFeedManager`

---

## 8. NewsletterPopup 컴포넌트

### 파일 위치
- `src/components/features/home/NewsletterPopup.tsx`

### 현재 구현
- 첫 방문 시 팝업 표시 (localStorage 기반)
- 이메일 입력 폼
- 구독 버튼
- 닫기 버튼

### 데이터 소스
- **로컬 스토리지**: 팝업 표시 여부
- **Firestore**: 구독자 정보 저장 (예정)

### 관리 필요 항목
- ✅ 팝업 텍스트 관리
- ✅ 표시 조건 설정
- ✅ 할인 쿠폰 설정
- ✅ 구독자 목록
- ✅ 활성화/비활성화

### 관리자 페이지 연동
- `HomepageManager` → `NewsletterManager`

---

## 9. PurchaseNotification 컴포넌트

### 파일 위치
- `src/components/features/home/PurchaseNotification.tsx`

### 현재 구현
- 좌측 하단 고정 알림
- "방금 OOO님이 [상품명]을 구매하셨습니다" 메시지
- 자동 사라짐 (3초 후)

### 데이터 소스
- **하드코딩**: Mock 데이터 또는 실시간 주문 이벤트

### 관리 필요 항목
- ✅ 표시 여부 설정
- ✅ 표시 간격 설정
- ✅ 메시지 템플릿 설정

### 관리자 페이지 연동
- 시스템 설정 또는 별도 관리 불필요 (자동화)

---

## 데이터 흐름

### 현재 상태
```
홈페이지 컴포넌트
├── 하드코딩 데이터 (TimeSale, Lookbook, Magazine, Instagram)
├── Firestore 연동 (New Arrivals: products 컬렉션)
└── Constants (Trending OOTD: OOTD_POSTS)
```

### 개선 방향
```
홈페이지 컴포넌트
├── Firestore 컬렉션 (homepage_hero, homepage_timesale, etc.)
├── 실시간 데이터 동기화
└── 관리자 페이지에서 모든 콘텐츠 관리
```

---

## Firestore 컬렉션 구조 (제안)

### 기존 컬렉션
- `products` - 상품 정보 (`isNew` 필드 포함)

### 새로 필요한 컬렉션
- `homepage_hero` - Hero 섹션 설정
- `homepage_timesale` - 타임세일 정보
- `homepage_newarrivals` - 신상품 진열 설정
- `homepage_lookbooks` - 룩북 정보
- `homepage_trending_ootd` - 트렌딩 OOTD 설정
- `homepage_magazines` - 매거진 아티클
- `homepage_instagram_feed` - 인스타그램 피드 설정
- `homepage_newsletter` - 뉴스레터 팝업 설정
- `newsletter_subscribers` - 뉴스레터 구독자

---

## 컴포넌트 의존성

### 공통 컴포넌트
- `OptimizedImage` - 이미지 최적화
- `SEO` - SEO 메타 태그
- `Link` - React Router 링크

### Context 사용
- `useAuth` - 사용자 인증 상태
- `useGlobalModal` - 모달/알림

### 서비스
- `productService.getProducts()` - 상품 목록 조회

---

## 관련 파일 목록

### 페이지
- `src/pages/Home.tsx`

### 컴포넌트
- `src/components/features/home/TimeSale.tsx`
- `src/components/features/home/LookbookSection.tsx`
- `src/components/features/home/TrendingOOTDSection.tsx`
- `src/components/features/home/MagazineSection.tsx`
- `src/components/features/home/InstagramFeed.tsx`
- `src/components/features/home/NewsletterPopup.tsx`
- `src/components/features/home/PurchaseNotification.tsx`

### 서비스
- `src/services/productService.ts`

### 상수
- `src/constants.ts` (OOTD_POSTS)

---

## 개선 제안

### 1. 데이터 소스 통합
- 모든 하드코딩 데이터를 Firestore로 이전
- 관리자 페이지에서 통합 관리

### 2. 성능 최적화
- 이미지 레이지 로딩
- 컴포넌트 코드 스플리팅
- 데이터 캐싱

### 3. 개인화
- 로그인 사용자별 맞춤 콘텐츠
- 추천 알고리즘 적용

### 4. 실시간 업데이트
- 관리자 변경사항 즉시 반영
- 실시간 통계 업데이트

---

**작성일**: 2024-12-04  
**작성자**: AI Assistant  
**버전**: 1.0

