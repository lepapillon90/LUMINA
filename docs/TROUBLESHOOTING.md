# 배송지 저장 문제 해결 가이드

## 문제 상황
로그인한 상태에서 배송지 저장 시 "권한이 없습니다" 오류가 발생합니다.

## 확인 사항

### 1. 브라우저 콘솔 확인
개발자 도구 (F12) → Console 탭에서 다음 로그 확인:
- `[MY_LOG] Error saving address:`
- `[MY_LOG] User UID:`
- `[MY_LOG] Error Code:`
- `[MY_LOG] Error Message:`

### 2. 로그인 상태 확인
- 브라우저 개발자 도구 → Application → Session Storage
- Firebase Auth 토큰이 있는지 확인
- 페이지 새로고침 후 다시 시도

### 3. Firestore 규칙 배포 확인
Firebase Console에서:
1. [Firebase Console](https://console.firebase.google.com/) 접속
2. 프로젝트: `lumina-shop-prod-8291` 선택
3. **Build** → **Firestore Database** → **Rules** 탭
4. 데이터베이스 선택: **lumina** (중요!)
5. 현재 규칙 확인

### 4. 데이터베이스 확인
- Firebase Console → Firestore Database → **데이터베이스** 탭
- `lumina` 데이터베이스가 존재하는지 확인
- `(default)` 데이터베이스가 아닌 `lumina` 데이터베이스를 사용하는지 확인

## 해결 방법

### 방법 1: 브라우저 캐시 및 세션 초기화
1. 브라우저 개발자 도구 열기 (F12)
2. Application 탭 → Clear storage
3. Session Storage, Local Storage 모두 삭제
4. 페이지 새로고침
5. 다시 로그인
6. 배송지 저장 시도

### 방법 2: Firestore 규칙 직접 확인 및 배포
Firebase Console에서:
1. Firestore Database → Rules
2. `lumina` 데이터베이스 선택
3. 규칙이 올바르게 설정되어 있는지 확인
4. "게시" 버튼 클릭

### 방법 3: 로그인 다시 시도
1. 로그아웃
2. 페이지 새로고침
3. 다시 로그인
4. 배송지 저장 시도

## 추가 디버깅

콘솔에서 다음 명령어 실행하여 인증 상태 확인:
```javascript
// Firebase Auth 상태 확인
import { auth } from './firebase';
console.log('Current user:', auth.currentUser?.uid);
```

## 문제가 계속되는 경우

1. **에러 로그 수집**: 브라우저 콘솔의 모든 `[MY_LOG]` 로그 복사
2. **Firebase Console 확인**: Firestore → Rules → lumina 데이터베이스 규칙 확인
3. **네트워크 탭 확인**: 개발자 도구 → Network 탭에서 Firestore 요청 실패 여부 확인

