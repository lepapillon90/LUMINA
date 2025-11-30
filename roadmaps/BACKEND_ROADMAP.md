# Backend Roadmap (Firebase Integration)

LUMINA 쇼핑몰의 데이터 영속성과 실제 기능을 구현하기 위한 백엔드 통합 로드맵입니다. Google Firebase를 기반으로 Serverless 아키텍처를 구축합니다.

## 1단계: 사용자 인증 (Authentication)
> **목표**: 실제 회원가입, 로그인, 세션 유지 구현
- [x] **Firebase Auth 설정**: 이메일/비밀번호 로그인 활성화.
- [x] **회원가입/로그인 연동**: 기존 Mock 로직을 Firebase SDK로 교체.
- [ ] **소셜 로그인 (Optional)**: Google, Kakao 로그인 추가.
- [x] **비밀번호 찾기**: 이메일로 비밀번호 재설정 링크 발송 기능.

## 2단계: 데이터베이스 구축 (Firestore Database)
> **목표**: 상품, 주문, 게시물 데이터의 영구 저장
- [x] **데이터 모델링**: User, Product, Order, OOTD 컬렉션 구조 설계.
- [x] **사용자 프로필**: 회원가입 시 `users` 컬렉션에 추가 정보(닉네임, 등급 등) 저장.
- [x] **OOTD 게시물 연동**: `constants.ts`의 Mock 데이터를 Firestore로 이관 및 CRUD 구현.
- [x] **장바구니 동기화**: 로그인 시 DB에 저장된 장바구니 목록 불러오기.

## 3단계: 미디어 저장소 (Cloud Storage)
> **목표**: 사용자 업로드 이미지 처리
- [x] **이미지 업로드**: OOTD 작성 시 사진을 Firebase Storage에 업로드.
- [x] **프로필 사진**: 마이페이지에서 프로필 이미지 변경 기능.
- [ ] **이미지 최적화**: 업로드 시 리사이징 또는 압축 (Extension 활용).

## 4단계: 보안 및 규칙 (Security Rules)
> **목표**: 데이터 무결성 및 권한 관리
- [x] **Firestore 규칙**: 본인 데이터만 수정 가능하도록 읽기/쓰기 권한 설정.
- [x] **Storage 규칙**: 인증된 사용자만 이미지 업로드 가능하도록 설정.

## 5단계: 서버리스 함수 (Cloud Functions) - *Advanced*
> **목표**: 백엔드 로직 자동화
- [ ] **트리거**: 회원가입 시 환영 이메일 발송.
- [ ] **집계**: OOTD 좋아요 수 변경 시 사용자 총 좋아요 수 자동 집계.
- [ ] **관리자 알림**: 새 주문 발생 시 관리자에게 슬랙/이메일 알림.
