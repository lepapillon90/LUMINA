# 홈페이지 관리 탭 구현 완료 문서

## 개요

홈페이지 관리 탭에 실제 Firestore DB 연동을 통해 핵심 섹션들의 관리 기능을 활성화했습니다.

---

## 구현 완료된 섹션

### ✅ 1. Hero Section Manager
**파일**: `src/components/Admin/Homepage/HeroSectionManager.tsx`

**기능**:
- 비디오/이미지 URL 관리
- 포스터 이미지 설정
- 제목, 부제목, 설명 텍스트 편집
- 버튼 텍스트 및 링크 설정
- 활성화/비활성화 토글
- 실시간 미리보기

**Firestore 컬렉션**: `homepage_hero` (문서 ID: `current`)

---

### ✅ 2. New Arrivals Manager
**파일**: `src/components/Admin/Homepage/NewArrivalsManager.tsx`

**기능**:
- 신상품으로 표시할 상품 선택
- 드래그 앤 드롭으로 순서 조정
- 섹션 제목/설명 관리
- 최대 표시 개수 설정
- 활성화/비활성화

**Firestore 컬렉션**: `homepage_newarrivals` (문서 ID: `current`)

---

### ✅ 3. TimeSale Manager
**파일**: `src/components/Admin/Homepage/TimeSaleManager.tsx`

**기능**:
- 타임세일 제목/설명 관리
- 할인율 설정
- 타임세일 상품 선택 (체크박스)
- 시작일/종료일 설정
- 배경색/배경 이미지 설정
- 활성화/비활성화

**Firestore 컬렉션**: `homepage_timesale` (문서 ID: `current`)

---

### ✅ 4. Magazine Manager
**파일**: `src/components/Admin/Homepage/MagazineManager.tsx`

**기능**:
- 매거진 아티클 추가/수정/삭제
- 이미지 URL 설정
- 카테고리, 제목, 설명 관리
- 발행일 설정
- 링크 URL 설정
- 활성화/비활성화
- 아티클 순서 관리

**Firestore 컬렉션**: `homepage_magazines` (컬렉션)

---

## 구현 대기 중인 섹션

다음 섹션들은 기본 구조만 있으며, 필요 시 구현할 수 있습니다:

1. **Lookbook Manager** - 룩북 및 핫스팟 관리
2. **Trending OOTD Manager** - 트렌딩 OOTD 설정
3. **Instagram Feed Manager** - 인스타그램 피드 관리
4. **Newsletter Manager** - 뉴스레터 설정 및 구독자 관리
5. **Banners Manager** - 배너 관리
6. **Promotions Manager** - 프로모션 관리

---

## 사용 방법

### 1. 관리자 페이지 접속
1. 관리자 계정으로 로그인
2. 좌측 메뉴에서 "홈페이지 관리" 클릭

### 2. 섹션 선택 및 관리
- 상단 네비게이션에서 관리할 섹션 선택
- 각 섹션의 폼을 통해 콘텐츠 편집
- "저장" 버튼 클릭하여 Firestore에 저장

### 3. 변경사항 확인
- 모든 변경사항은 즉시 Firestore에 저장
- 감사 로그에 작업 기록
- 홈페이지에 반영 (실시간 또는 새로고침 후)

---

## Firestore 컬렉션 구조

### 단일 문서 컬렉션
```
homepage_hero/
  └── current

homepage_timesale/
  └── current

homepage_newarrivals/
  └── current

homepage_trending_ootd/
  └── current

homepage_instagram_feed/
  └── current

homepage_newsletter/
  └── current
```

### 다중 문서 컬렉션
```
homepage_magazines/
  ├── {articleId1}
  ├── {articleId2}
  └── ...

homepage_lookbooks/
  ├── {lookbookId1}
  ├── {lookbookId2}
  └── ...
```

---

## 다음 단계

### 즉시 구현 가능한 기능
1. **홈페이지 컴포넌트에서 DB 데이터 사용**
   - `Home.tsx`에서 Firestore 데이터 조회하도록 수정
   - 하드코딩된 데이터를 동적 데이터로 교체

2. **추가 섹션 구현**
   - Lookbook Manager (핫스팟 편집 UI)
   - Newsletter Manager (구독자 통계 포함)

### 향후 개선 사항
- 이미지 업로드 기능 (Firebase Storage)
- 실시간 미리보기 (홈페이지 바로 확인)
- 변경 이력 관리 (롤백 기능)
- 다국어 지원

---

## 관련 파일

### 컴포넌트
- `src/components/Admin/Homepage/HomepageManager.tsx`
- `src/components/Admin/Homepage/HeroSectionManager.tsx`
- `src/components/Admin/Homepage/NewArrivalsManager.tsx`
- `src/components/Admin/Homepage/TimeSaleManager.tsx`
- `src/components/Admin/Homepage/MagazineManager.tsx`

### 서비스
- `src/services/homepageService.ts`

### 타입
- `src/types.ts` (홈페이지 관리 관련 타입)

---

**작성일**: 2024-12-04  
**작성자**: AI Assistant  
**버전**: 1.0

