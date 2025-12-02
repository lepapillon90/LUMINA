# 관리자 페이지 - 홈페이지 관리 기능 문서

## 개요

이 문서는 LUMINA 쇼핑몰의 홈페이지를 관리하기 위한 관리자 페이지 기능 명세서입니다. 홈페이지의 각 섹션을 효과적으로 관리할 수 있는 기능들을 정의합니다.

---

## 1. 홈페이지 구조 분석

### 1.1 현재 홈페이지 섹션

홈페이지(`src/pages/Home.tsx`)는 다음과 같은 섹션들로 구성됩니다:

1. **Hero Section** - 메인 비디오/이미지 배경
2. **TimeSale** - 타임세일 섹션
3. **New Arrivals** - 신상품 슬라이더
4. **LookbookSection** - 인터랙티브 룩북
5. **TrendingOOTDSection** - 트렌딩 OOTD
6. **MagazineSection** - 매거진 섹션
7. **InstagramFeed** - 인스타그램 피드
8. **NewsletterPopup** - 뉴스레터 구독 팝업
9. **PurchaseNotification** - 실시간 구매 알림

---

## 2. 관리자 페이지 탭 구조

### 2.1 현재 관리자 페이지 탭

현재 관리자 페이지(`src/pages/Admin.tsx`)에는 다음 탭들이 있습니다:

| 탭 ID | 탭 이름 | 컴포넌트 | 상태 |
|-------|---------|----------|------|
| `home` | 홈 | `Dashboard` | ✅ 구현됨 |
| `orders` | 주문 | `OrderManager` | ✅ 구현됨 |
| `products` | 상품 | `ProductManager` | ✅ 구현됨 |
| `customers` | 고객 | `CustomerManager` | ✅ 구현됨 |
| `messages` | 메시지 | `CSManager` | ✅ 구현됨 |
| `board` | 게시판 | placeholder | ⏳ 준비 중 |
| `design` | 디자인 | `DesignManager` | ✅ 구현됨 |
| `promotion` | 프로모션 | placeholder | ⏳ 준비 중 |
| `analytics` | 애널리틱스 | `AnalyticsManager` | ✅ 구현됨 |
| `stats` | 통계 | placeholder | ⏳ 준비 중 |
| `excel` | 통합엑셀 | placeholder | ⏳ 준비 중 |
| `system` | 시스템 관리 | `SystemManager` | ✅ 구현됨 |

### 2.2 추가 필요한 탭: 홈페이지 관리

홈페이지의 각 섹션을 관리하기 위한 새로운 탭이 필요합니다:

| 탭 ID | 탭 이름 | 설명 |
|-------|---------|------|
| `homepage` | 홈페이지 관리 | 홈페이지의 모든 섹션을 통합 관리 |

---

## 3. 홈페이지 관리 기능 상세

### 3.1 Hero Section 관리

**현재 상태**: 비디오 URL이 하드코딩되어 있음  
**필요 기능**:
- 비디오/이미지 업로드 및 URL 관리
- 포스터 이미지 업로드
- 텍스트 컨텐츠 관리 (제목, 설명, 버튼 텍스트)
- 링크 URL 설정
- 활성화/비활성화 설정
- 시작일/종료일 설정 (스케줄링)

**Firestore 컬렉션**: `homepage_hero`

**인터페이스**:
```typescript
interface HomepageHero {
  id: string;
  videoUrl?: string;
  imageUrl?: string; // 비디오 없을 경우 fallback
  posterUrl: string;
  title: string;
  subtitle: string;
  description: string;
  buttonText: string;
  buttonLink: string;
  isActive: boolean;
  startDate?: string;
  endDate?: string;
  createdAt: Timestamp;
  updatedAt: Timestamp;
}
```

---

### 3.2 TimeSale 관리

**현재 상태**: 하드코딩된 타임세일 정보  
**필요 기능**:
- 타임세일 제목/설명 관리
- 할인율 설정
- 타임세일 상품 선택
- 카운트다운 종료 시간 설정
- 배경 이미지/색상 설정
- 활성화/비활성화 설정
- 시작일/종료일 설정

**Firestore 컬렉션**: `homepage_timesale`

**인터페이스**:
```typescript
interface TimeSale {
  id: string;
  title: string;
  description: string;
  discountPercentage: number;
  productIds: number[];
  countdownEndTime: Timestamp;
  backgroundColor?: string;
  backgroundImageUrl?: string;
  textColor?: string;
  isActive: boolean;
  startDate: string;
  endDate: string;
  createdAt: Timestamp;
  updatedAt: Timestamp;
}
```

---

### 3.3 New Arrivals 관리

**현재 상태**: `Product.isNew === true`인 상품들을 필터링하여 표시  
**필요 기능**:
- 신상품으로 표시할 상품 선택 (드래그 앤 드롭으로 순서 조정)
- 최대 표시 개수 설정
- 섹션 제목/설명 관리
- 활성화/비활성화 설정

**Firestore 컬렉션**: `homepage_newarrivals`

**인터페이스**:
```typescript
interface NewArrivals {
  id: string;
  title: string;
  description: string;
  productIds: number[]; // 순서 포함
  maxDisplayCount: number;
  isActive: boolean;
  updatedAt: Timestamp;
}
```

**관련 기능**:
- 상품 관리 페이지에서 `isNew` 플래그 자동 업데이트

---

### 3.4 Lookbook 관리

**현재 상태**: 하드코딩된 이미지와 핫스팟  
**필요 기능**:
- 룩북 이미지 업로드
- 핫스팟 추가/수정/삭제 (드래그하여 위치 조정)
- 각 핫스팟에 연결할 상품 선택
- 섹션 제목/설명 관리
- 여러 룩북 관리 (시즌별)
- 활성화/비활성화 설정

**Firestore 컬렉션**: `homepage_lookbooks`

**인터페이스**:
```typescript
interface LookbookHotspot {
  id: string;
  x: number; // 퍼센트 (0-100)
  y: number; // 퍼센트 (0-100)
  productId: number;
}

interface Lookbook {
  id: string;
  title: string;
  description: string;
  imageUrl: string;
  hotspots: LookbookHotspot[];
  isActive: boolean;
  season?: string; // "winter", "spring", etc.
  createdAt: Timestamp;
  updatedAt: Timestamp;
}
```

---

### 3.5 Trending OOTD 관리

**현재 상태**: 좋아요 수 기준으로 자동 정렬  
**필요 기능**:
- 표시할 OOTD 게시물 수 설정
- 수동으로 OOTD 게시물 선택 (오버라이드)
- 섹션 제목/설명 관리
- 정렬 기준 설정 (좋아요, 최신순 등)
- 활성화/비활성화 설정

**Firestore 컬렉션**: `homepage_trending_ootd`

**인터페이스**:
```typescript
interface TrendingOOTD {
  id: string;
  title: string;
  description: string;
  displayCount: number;
  sortBy: 'likes' | 'recent' | 'manual';
  manualPostIds?: number[]; // sortBy가 'manual'일 때만 사용
  isActive: boolean;
  updatedAt: Timestamp;
}
```

---

### 3.6 Magazine 관리

**현재 상태**: 하드코딩된 매거진 아티클  
**필요 기능**:
- 매거진 아티클 추가/수정/삭제
- 카테고리 관리
- 이미지 업로드
- 링크 URL 설정
- 발행일 설정
- 활성화/비활성화 설정
- 순서 조정 (드래그 앤 드롭)

**Firestore 컬렉션**: `homepage_magazines`

**인터페이스**:
```typescript
interface MagazineArticle {
  id: string;
  category: string;
  title: string;
  excerpt: string;
  imageUrl: string;
  link: string;
  publishedDate: string;
  displayOrder: number;
  isActive: boolean;
  createdAt: Timestamp;
  updatedAt: Timestamp;
}
```

---

### 3.7 Instagram Feed 관리

**현재 상태**: 하드코딩된 인스타그램 포스트  
**필요 기능**:
- 인스타그램 계정 연결 (API 연동 또는 수동 입력)
- 표시할 포스트 수 설정
- 수동으로 포스트 추가/삭제
- 섹션 제목/설명 관리
- 활성화/비활성화 설정

**Firestore 컬렉션**: `homepage_instagram_feed`

**인터페이스**:
```typescript
interface InstagramPost {
  id: string;
  imageUrl: string;
  likes: number;
  comments: number;
  link: string;
  displayOrder: number;
  isActive: boolean;
  createdAt: Timestamp;
}

interface InstagramFeed {
  id: string;
  accountName: string; // "@lumina_official"
  title: string;
  description: string;
  displayCount: number;
  posts: InstagramPost[];
  isActive: boolean;
  updatedAt: Timestamp;
}
```

---

### 3.8 Newsletter 관리

**현재 상태**: 구독 기능만 있고 관리 기능 없음  
**필요 기능**:
- 팝업 표시 조건 설정 (첫 방문, 이탈 감지 등)
- 팝업 텍스트 관리
- 할인 쿠폰 설정
- 활성화/비활성화 설정
- 구독자 목록 확인
- 구독자 통계

**Firestore 컬렉션**: `homepage_newsletter`, `newsletter_subscribers`

**인터페이스**:
```typescript
interface NewsletterPopup {
  id: string;
  title: string;
  description: string;
  couponCode?: string;
  discountAmount?: number;
  showOnFirstVisit: boolean;
  showOnExitIntent: boolean;
  isActive: boolean;
  updatedAt: Timestamp;
}

interface NewsletterSubscriber {
  id: string;
  email: string;
  subscribedAt: Timestamp;
  couponCode?: string;
  isActive: boolean;
}
```

---

## 4. 구현 계획

### 4.1 컴포넌트 구조

```
src/components/Admin/Homepage/
├── HomepageManager.tsx          # 메인 컴포넌트 (탭 컨테이너)
├── HeroSectionManager.tsx       # Hero 섹션 관리
├── TimeSaleManager.tsx          # TimeSale 관리
├── NewArrivalsManager.tsx       # New Arrivals 관리
├── LookbookManager.tsx          # Lookbook 관리
├── TrendingOOTDManager.tsx      # Trending OOTD 관리
├── MagazineManager.tsx          # Magazine 관리
├── InstagramFeedManager.tsx     # Instagram Feed 관리
└── NewsletterManager.tsx        # Newsletter 관리
```

### 4.2 서비스 구조

```
src/services/homepageService.ts
├── Hero Management
├── TimeSale Management
├── New Arrivals Management
├── Lookbook Management
├── Trending OOTD Management
├── Magazine Management
├── Instagram Feed Management
└── Newsletter Management
```

### 4.3 Firestore 컬렉션 구조

```
homepage_hero (단일 문서 또는 컬렉션)
homepage_timesale (단일 문서)
homepage_newarrivals (단일 문서)
homepage_lookbooks (컬렉션)
homepage_trending_ootd (단일 문서)
homepage_magazines (컬렉션)
homepage_instagram_feed (단일 문서 + 서브컬렉션)
homepage_newsletter (단일 문서)
newsletter_subscribers (컬렉션)
```

---

## 5. 관리자 페이지 메뉴 업데이트

### 5.1 메뉴 항목 추가

`src/pages/Admin.tsx`의 `MENU_ITEMS` 배열에 다음 항목 추가:

```typescript
{ id: 'homepage', label: '홈페이지 관리', icon: Layout, permission: null },
```

### 5.2 탭 라우팅 추가

```typescript
{activeTab === 'homepage' && (
  <HomepageManager user={user} />
)}
```

---

## 6. 우선순위 및 개발 단계

### Phase 1: 핵심 기능 (우선순위 높음)
1. ✅ Hero Section 관리
2. ✅ TimeSale 관리
3. ✅ New Arrivals 관리

### Phase 2: 콘텐츠 관리 (우선순위 중간)
4. ✅ Magazine 관리
5. ✅ Lookbook 관리
6. ✅ Trending OOTD 관리

### Phase 3: 통합 기능 (우선순위 낮음)
7. ✅ Instagram Feed 관리
8. ✅ Newsletter 관리 및 통계

---

## 7. 참고 사항

### 7.1 권한 관리
- 모든 홈페이지 관리 기능은 `ADMIN` 권한이 필요합니다.
- 특정 권한 필드 추가 가능 (`homepage` permission)

### 7.2 이미지 업로드
- Firebase Storage를 사용하여 이미지/비디오 업로드
- 최적화된 이미지 URL 자동 생성

### 7.3 미리보기 기능
- 각 섹션별 미리보기 버튼 제공
- 전체 홈페이지 미리보기 모달

### 7.4 변경 이력
- 모든 변경사항은 `auditService`를 통해 기록
- 롤백 기능 (선택사항)

---

## 8. 관련 파일

- `src/pages/Home.tsx` - 홈페이지 컴포넌트
- `src/components/features/home/` - 홈페이지 섹션 컴포넌트들
- `src/pages/Admin.tsx` - 관리자 페이지 메인
- `src/components/Admin/Design/DesignManager.tsx` - 디자인 관리 (참고용)
- `src/services/designService.ts` - 디자인 서비스 (참고용)

---

**작성일**: 2024-12-04  
**작성자**: AI Assistant  
**버전**: 1.0

