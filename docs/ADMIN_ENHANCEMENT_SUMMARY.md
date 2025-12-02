# 관리자 페이지 고도화 진행 요약

## 개요

관리자 페이지 고도화 작업을 진행하여 홈페이지 관리 기능을 추가하고 기존 시스템을 확장했습니다.

---

## 완료된 작업

### 1. 타입 정의 추가 ✅

**파일**: `src/types.ts`

홈페이지 관리에 필요한 모든 타입을 추가했습니다:

- `HomepageHero` - Hero 섹션 관리
- `HomepageTimeSale` - 타임세일 관리
- `HomepageNewArrivals` - 신상품 진열 관리
- `HomepageLookbook` - 룩북 관리
- `HomepageTrendingOOTD` - 트렌딩 OOTD 관리
- `MagazineArticle` - 매거진 아티클
- `HomepageInstagramFeed` - 인스타그램 피드
- `HomepageNewsletter` - 뉴스레터 설정
- `NewsletterSubscriber` - 뉴스레터 구독자
- `LookbookHotspot` - 룩북 핫스팟

### 2. 홈페이지 관리 서비스 생성 ✅

**파일**: `src/services/homepageService.ts`

Firestore와 연동하는 서비스 함수들을 구현했습니다:

#### Hero Section
- `getHomepageHero()` - Hero 섹션 데이터 조회
- `saveHomepageHero()` - Hero 섹션 저장

#### TimeSale
- `getHomepageTimeSale()` - 타임세일 데이터 조회
- `saveHomepageTimeSale()` - 타임세일 저장

#### New Arrivals
- `getHomepageNewArrivals()` - 신상품 진열 데이터 조회
- `saveHomepageNewArrivals()` - 신상품 진열 저장

#### Lookbook
- `getHomepageLookbooks()` - 룩북 목록 조회
- `createHomepageLookbook()` - 룩북 생성
- `updateHomepageLookbook()` - 룩북 수정
- `deleteHomepageLookbook()` - 룩북 삭제

#### Trending OOTD
- `getHomepageTrendingOOTD()` - 트렌딩 OOTD 데이터 조회
- `saveHomepageTrendingOOTD()` - 트렌딩 OOTD 저장

#### Magazine
- `getMagazineArticles()` - 매거진 아티클 목록 조회
- `createMagazineArticle()` - 매거진 아티클 생성
- `updateMagazineArticle()` - 매거진 아티클 수정
- `deleteMagazineArticle()` - 매거진 아티클 삭제

#### Instagram Feed
- `getHomepageInstagramFeed()` - 인스타그램 피드 데이터 조회
- `saveHomepageInstagramFeed()` - 인스타그램 피드 저장

#### Newsletter
- `getHomepageNewsletter()` - 뉴스레터 설정 조회
- `saveHomepageNewsletter()` - 뉴스레터 설정 저장
- `getNewsletterSubscribers()` - 구독자 목록 조회

모든 서비스 함수는 감사 로그(`auditService`)와 연동되어 관리자 작업을 기록합니다.

### 3. 홈페이지 관리 컴포넌트 생성 ✅

**파일**: `src/components/Admin/Homepage/HomepageManager.tsx`

홈페이지 관리를 위한 메인 컴포넌트를 생성했습니다:

- 섹션별 탭 네비게이션 (9개 섹션)
- 개요 대시보드
- 각 섹션별 관리 UI (기본 구조 완성, 기능 구현 대기 중)

#### 섹션 목록
1. 개요 (Overview)
2. Hero 섹션
3. 타임세일
4. 신상품
5. 룩북
6. 트렌딩 OOTD
7. 매거진
8. 인스타그램
9. 뉴스레터

### 4. Admin.tsx 통합 ✅

**파일**: `src/pages/Admin.tsx`

관리자 페이지에 홈페이지 관리 탭을 추가했습니다:

- 메뉴 항목 추가: "홈페이지 관리"
- 아이콘: `Layout` (lucide-react)
- 탭 타입 추가: `'homepage'`
- 라우팅 추가: `HomepageManager` 컴포넌트 렌더링

---

## Firestore 컬렉션 구조

새로 생성될 Firestore 컬렉션:

```
homepage_hero/
  └── current (단일 문서)

homepage_timesale/
  └── current (단일 문서)

homepage_newarrivals/
  └── current (단일 문서)

homepage_lookbooks/
  ├── {lookbookId1}
  ├── {lookbookId2}
  └── ...

homepage_trending_ootd/
  └── current (단일 문서)

homepage_magazines/
  ├── {articleId1}
  ├── {articleId2}
  └── ...

homepage_instagram_feed/
  └── current (단일 문서)

homepage_newsletter/
  └── current (단일 문서)

newsletter_subscribers/
  ├── {subscriberId1}
  ├── {subscriberId2}
  └── ...
```

---

## 다음 단계 (추가 구현 필요)

### Phase 1: 핵심 섹션 관리 구현

#### 1. Hero Section Manager
- [ ] 비디오/이미지 업로드 UI
- [ ] 텍스트 편집 폼
- [ ] 활성화/비활성화 토글
- [ ] 미리보기 기능

#### 2. TimeSale Manager
- [ ] 타임세일 설정 폼
- [ ] 상품 선택 UI
- [ ] 할인율 입력
- [ ] 종료 시간 설정

#### 3. New Arrivals Manager
- [ ] 상품 목록 표시
- [ ] 드래그 앤 드롭 순서 조정
- [ ] 상품 추가/제거
- [ ] 최대 표시 개수 설정

### Phase 2: 콘텐츠 관리 구현

#### 4. Lookbook Manager
- [ ] 룩북 이미지 업로드
- [ ] 핫스팟 편집 UI (드래그 가능)
- [ ] 상품 연결
- [ ] 여러 룩북 관리

#### 5. Trending OOTD Manager
- [ ] 표시 개수 설정
- [ ] 정렬 기준 선택
- [ ] 수동 선택 모드

#### 6. Magazine Manager
- [ ] 아티클 추가/수정/삭제
- [ ] 이미지 업로드
- [ ] 순서 조정 (드래그 앤 드롭)

### Phase 3: 통합 기능

#### 7. Instagram Feed Manager
- [ ] 포스트 추가/삭제
- [ ] 이미지 업로드
- [ ] 좋아요/댓글 수 입력

#### 8. Newsletter Manager
- [ ] 팝업 텍스트 편집
- [ ] 표시 조건 설정
- [ ] 쿠폰 설정
- [ ] 구독자 목록 및 통계

---

## 보안 규칙 추가 필요

`firestore.rules`에 다음 컬렉션에 대한 규칙을 추가해야 합니다:

```javascript
// Homepage Collections
match /homepage_{collection}/{document=**} {
  allow read: if true; // Public read for homepage display
  allow write: if isAuthenticated() && isAdmin();
}

match /newsletter_subscribers/{subscriberId} {
  allow read: if isAuthenticated() && isAdmin();
  allow create: if true; // Public can subscribe
  allow update, delete: if isAuthenticated() && isAdmin();
}
```

---

## 사용 방법

### 1. 관리자 페이지 접속
1. 관리자 계정으로 로그인
2. 좌측 메뉴에서 "홈페이지 관리" 클릭

### 2. 섹션 선택
- 상단 네비게이션에서 관리할 섹션 선택
- 각 섹션별 관리 UI에서 콘텐츠 편집

### 3. 변경사항 저장
- 각 섹션의 "저장" 버튼 클릭
- Firestore에 자동 저장
- 감사 로그에 작업 기록

---

## 관련 문서

- `docs/ADMIN_HOMEPAGE_MANAGEMENT.md` - 홈페이지 관리 기능 상세 명세
- `docs/ADMIN_TABS_STRUCTURE.md` - 관리자 페이지 탭 구조
- `docs/HOMEPAGE_SECTIONS_ANALYSIS.md` - 홈페이지 섹션 분석

---

## 기술 스택

- **Frontend**: React, TypeScript
- **State Management**: React Hooks
- **Database**: Firebase Firestore
- **Storage**: Firebase Storage (이미지/비디오 업로드 예정)
- **Icons**: Lucide React
- **Styling**: Tailwind CSS

---

**작성일**: 2024-12-04  
**작성자**: AI Assistant  
**버전**: 1.0

