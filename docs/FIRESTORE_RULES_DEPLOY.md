# Firestore 보안 규칙 배포 가이드

## 문제 상황
로그인한 상태에서 배송지 저장 시 "권한이 없습니다" 오류가 발생합니다.

## 해결 방법

### 1. Firestore 보안 규칙 배포
Firestore 보안 규칙 파일(`firestore.rules`)을 Firebase에 배포해야 합니다.

**터미널에서 실행:**
```bash
firebase deploy --only firestore:rules
```

또는 특정 데이터베이스에만 배포하려면:
```bash
firebase deploy --only firestore:rules:lumina
```

### 2. Firebase Console에서 직접 배포
1. [Firebase Console](https://console.firebase.google.com/) 접속
2. 프로젝트 선택: `lumina-shop-prod-8291`
3. **Build** → **Firestore Database** 이동
4. **Rules** 탭 선택
5. **데이터베이스 선택**: `lumina` 데이터베이스 선택
6. `firestore.rules` 파일 내용을 복사하여 붙여넣기
7. **게시** 버튼 클릭

### 3. 확인 사항

#### 3.1 데이터베이스 확인
- Firebase Console → Firestore Database → **데이터베이스** 탭
- `lumina` 데이터베이스가 존재하는지 확인
- 없으면 생성 필요

#### 3.2 규칙 적용 확인
- Firebase Console → Firestore Database → **Rules** 탭
- `lumina` 데이터베이스 선택
- 현재 규칙이 배포되어 있는지 확인

### 4. 테스트
1. 로그인 상태 확인
2. 마이페이지 → 계정 설정 → 배송지 추가
3. 배송지 정보 입력 후 저장
4. 정상적으로 저장되는지 확인

## 문제가 계속되는 경우

### 추가 확인 사항:
1. **로그인 상태 확인**
   - 브라우저 개발자 도구 → Application → Session Storage
   - Firebase Auth 토큰 확인

2. **콘솔 로그 확인**
   - 개발자 도구 → Console
   - `[MY_LOG] Error saving address:` 로그 확인
   - 에러 코드 및 메시지 확인

3. **Firestore 규칙 테스트**
   - Firebase Console → Firestore Database → Rules → Rules Playground
   - 배송지 생성 시뮬레이션 테스트

## 현재 설정된 보안 규칙

```javascript
// User Addresses: Owner read/write
match /user_addresses/{addressId} {
  // 읽기: 자신의 주소만 읽기 가능
  allow read: if isAuthenticated() && resource.data.userId == request.auth.uid;
  
  // 생성: 자신의 userId로만 생성 가능
  allow create: if isAuthenticated() && 
    request.resource.data.userId == request.auth.uid;
  
  // 수정: 자신의 주소만 수정 가능 (userId는 변경 불가)
  allow update: if isAuthenticated() && 
    resource.data.userId == request.auth.uid && 
    request.resource.data.userId == request.auth.uid;
  
  // 삭제: 자신의 주소만 삭제 가능
  allow delete: if isAuthenticated() && resource.data.userId == request.auth.uid;
}
```

## 참고
- Firestore 보안 규칙은 배포 후 즉시 적용됩니다
- 규칙 배포 후 몇 분 정도 소요될 수 있습니다
- `firebase.json`에서 `lumina` 데이터베이스에 대한 규칙 설정이 되어 있는지 확인하세요

