# 관리자 페이지 탭 구조 문서

## 개요

LUMINA 쇼핑몰의 관리자 페이지 탭 구조와 각 탭의 기능, 상태, 개발 우선순위를 정리한 문서입니다.

---

## 현재 탭 구조

### 1. 홈 (Dashboard) ✅

- **탭 ID**: `home`
- **컴포넌트**: `Dashboard`
- **경로**: `src/components/Admin/Dashboard/Dashboard.tsx`
- **상태**: ✅ 구현 완료
- **기능**:
  - 실시간 방문자 통계
  - 일일 매출 통계
  - 주문 처리 현황
  - 회원 포인트 통계
  - 게시물 통계
  - 차트 시각화

---

### 2. 주문 (Orders) ✅

- **탭 ID**: `orders`
- **컴포넌트**: `OrderManager`
- **경로**: `src/components/Admin/Orders/OrderManager.tsx`
- **상태**: ✅ 구현 완료
- **권한**: `permissions.orders`
- **기능**:
  - 주문 목록 조회 (필터링, 검색)
  - 주문 상세 정보
  - 주문 상태 변경
  - 송장 발행
  - 주문 취소/환불 처리
  - 주문 내보내기

---

### 3. 상품 (Products) ✅

- **탭 ID**: `products`
- **컴포넌트**: `ProductManager`
- **경로**: `src/components/Admin/Products/ProductManager.tsx`
- **상태**: ✅ 구현 완료
- **권한**: `permissions.products`
- **기능**:
  - 상품 목록 조회
  - 상품 추가/수정/삭제
  - 상품 이미지 업로드
  - 재고 관리
  - 카테고리 관리
  - 상품 검색/필터링

---

### 4. 고객 (Customers) ✅

- **탭 ID**: `customers`
- **컴포넌트**: `CustomerManager`
- **경로**: `src/components/Admin/Customers/CustomerManager.tsx`
- **상태**: ✅ 구현 완료
- **권한**: `permissions.customers`
- **기능**:
  - 고객 목록 조회
  - 고객 상세 정보
  - 고객 메모 관리
  - 회원 등급 관리
  - 포인트 관리
  - 주문 이력 조회

---

### 5. 메시지 (Messages) ✅

- **탭 ID**: `messages`
- **컴포넌트**: `CSManager`
- **경로**: `src/components/Admin/CS/CSManager.tsx`
- **상태**: ✅ 구현 완료
- **권한**: 없음 (모든 관리자 접근 가능)
- **기능**:
  - 고객 문의 목록
  - 문의 상세 및 답변
  - 문의 상태 관리

---

### 6. 게시판 (Board) ⏳

- **탭 ID**: `board`
- **컴포넌트**: placeholder
- **상태**: ⏳ 준비 중
- **기능** (계획):
  - 공지사항 관리
  - FAQ 관리
  - Q&A 관리
  - 게시글 승인/반려
  - 댓글 관리

---

### 7. 디자인 (Design) ✅

- **탭 ID**: `design`
- **컴포넌트**: `DesignManager`
- **경로**: `src/components/Admin/Design/DesignManager.tsx`
- **상태**: ✅ 구현 완료
- **권한**: 없음 (모든 관리자 접근 가능)
- **기능**:
  - 배너 관리 (추가/수정/삭제)
  - 프로모션 관리
  - 상품 진열 순서 관리 (드래그 앤 드롭)

---

### 8. 프로모션 (Promotion) ⏳

- **탭 ID**: `promotion`
- **컴포넌트**: placeholder
- **상태**: ⏳ 준비 중
- **기능** (계획):
  - 쿠폰 관리 (생성/수정/삭제)
  - 할인 이벤트 관리
  - 적립 이벤트 관리
  - 프로모션 통계

---

### 9. 애널리틱스 (Analytics) ✅

- **탭 ID**: `analytics`
- **컴포넌트**: `AnalyticsManager`
- **경로**: `src/components/Admin/Analytics/AnalyticsManager.tsx`
- **상태**: ✅ 구현 완료
- **권한**: `permissions.analytics`
- **기능**:
  - 방문자 통계
  - 매출 통계
  - 상품 통계
  - 고객 세그멘테이션
  - 트래픽 소스 분석

---

### 10. 통계 (Stats) ⏳

- **탭 ID**: `stats`
- **컴포넌트**: placeholder
- **상태**: ⏳ 준비 중
- **기능** (계획):
  - 상세 통계 리포트
  - 커스텀 리포트 생성
  - 데이터 시각화
  - 리포트 내보내기 (PDF, Excel)

---

### 11. 통합엑셀 (Excel Integration) ⏳

- **탭 ID**: `excel`
- **컴포넌트**: placeholder
- **상태**: ⏳ 준비 중
- **기능** (계획):
  - 주문 데이터 내보내기
  - 상품 데이터 내보내기
  - 고객 데이터 내보내기
  - 엑셀 템플릿 업로드
  - 대량 데이터 일괄 처리

---

### 12. 시스템 관리 (System) ✅

- **탭 ID**: `system`
- **컴포넌트**: `SystemManager`
- **경로**: `src/components/Admin/System/SystemManager.tsx`
- **상태**: ✅ 구현 완료
- **권한**: `permissions.system`
- **기능**:
  - 관리자 계정 관리
  - 권한 관리
  - 시스템 설정
  - 감사 로그 (Audit Log)
  - 데이터 마이그레이션

---

## 추가 예정 탭

### 13. 홈페이지 관리 (Homepage) 🔜

- **탭 ID**: `homepage`
- **컴포넌트**: `HomepageManager` (새로 생성 필요)
- **상태**: 🔜 개발 예정
- **권한**: 없음 (모든 관리자 접근 가능)
- **기능**:
  - Hero Section 관리
  - TimeSale 관리
  - New Arrivals 관리
  - Lookbook 관리
  - Trending OOTD 관리
  - Magazine 관리
  - Instagram Feed 관리
  - Newsletter 관리
- **상세 문서**: `docs/ADMIN_HOMEPAGE_MANAGEMENT.md`

---

## 탭 메뉴 구조

### 메뉴 항목 정의

`src/pages/Admin.tsx`에 정의된 `MENU_ITEMS`:

```typescript
const MENU_ITEMS = [
  { id: 'home', label: '홈', icon: Home, permission: null },
  { id: 'orders', label: '주문', icon: ShoppingCart, permission: 'orders' },
  { id: 'products', label: '상품', icon: Package, permission: 'products' },
  { id: 'customers', label: '고객', icon: Users, permission: 'customers' },
  { id: 'messages', label: '메시지', icon: MessageCircle, permission: null },
  { id: 'board', label: '게시판', icon: FileText, permission: null },
  { id: 'design', label: '디자인', icon: Palette, permission: null },
  { id: 'promotion', label: '프로모션', icon: Percent, permission: null },
  { id: 'analytics', label: '애널리틱스', icon: LineChart, permission: 'analytics' },
  { id: 'stats', label: '통계', icon: BarChart2, permission: 'analytics' },
  { id: 'excel', label: '통합엑셀', icon: Grid, permission: null },
  { id: 'system', label: '시스템 관리', icon: Shield, permission: 'system' },
];
```

### 권한 필터링

메뉴 항목은 사용자의 권한(`user.permissions`)에 따라 필터링됩니다:

```typescript
const filteredMenuItems = MENU_ITEMS.filter(item => {
  if (!item.permission) return true;
  if (!user?.permissions) return true;
  return user.permissions[item.permission as keyof UserPermissions];
});
```

---

## 개발 우선순위

### Phase 1: 필수 기능 ✅
- ✅ Dashboard
- ✅ Orders
- ✅ Products
- ✅ Customers
- ✅ System

### Phase 2: 지원 기능 ✅
- ✅ Messages (CS)
- ✅ Design
- ✅ Analytics

### Phase 3: 확장 기능 ⏳
- ⏳ Board
- ⏳ Promotion
- 🔜 Homepage
- ⏳ Stats
- ⏳ Excel Integration

---

## 탭 추가 가이드

### 1. 메뉴 항목 추가

`src/pages/Admin.tsx`의 `MENU_ITEMS` 배열에 새 항목 추가:

```typescript
{ id: 'newTab', label: '새 탭', icon: IconName, permission: 'permissionName' },
```

### 2. 타입 정의 추가

`Tab` 타입에 새 탭 ID 추가:

```typescript
type Tab = 'home' | 'orders' | ... | 'newTab';
```

### 3. 컴포넌트 생성

`src/components/Admin/NewTab/NewTabManager.tsx` 생성

### 4. 라우팅 추가

`src/pages/Admin.tsx`의 렌더링 부분에 추가:

```typescript
{activeTab === 'newTab' && <NewTabManager user={user} />}
```

### 5. 서비스 생성 (필요시)

`src/services/newTabService.ts` 생성

---

## 권한 관리

### 권한 필드

`src/types.ts`의 `UserPermissions` 인터페이스:

```typescript
export interface UserPermissions {
    orders: boolean;
    products: boolean;
    customers: boolean;
    analytics: boolean;
    system: boolean;
}
```

### 새 권한 추가 시

1. `UserPermissions` 인터페이스에 필드 추가
2. Firestore `users` 컬렉션의 권한 문서 구조 업데이트
3. 관리자 페이지에서 권한 설정 UI 추가

---

## 관련 파일

- `src/pages/Admin.tsx` - 관리자 페이지 메인 컴포넌트
- `src/types.ts` - 타입 정의 (Tab, UserPermissions 등)
- `src/components/Admin/` - 관리자 페이지 컴포넌트들
- `src/services/` - 관리자 페이지 서비스들

---

**작성일**: 2024-12-04  
**작성자**: AI Assistant  
**버전**: 1.0

