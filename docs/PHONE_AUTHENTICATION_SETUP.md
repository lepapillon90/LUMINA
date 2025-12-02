# 전화번호 인증 (SMS) 설정 가이드

## 개요
Firebase Phone Authentication을 사용한 실제 SMS 발송 기능이 구현되었습니다.

## Firebase Console 설정

### 1. Phone Authentication 활성화

1. [Firebase Console](https://console.firebase.google.com/) 접속
2. 프로젝트 선택: `lumina-shop-prod-8291`
3. **Authentication** → **Sign-in method** 탭
4. **Phone** 제공업체 클릭
5. **Enable** 토글 활성화
6. **Save** 클릭

### 2. reCAPTCHA 설정

Firebase Phone Authentication은 자동으로 reCAPTCHA를 사용합니다. 별도 설정은 필요하지 않습니다.

### 3. 테스트 전화번호 설정 (선택사항)

개발/테스트 단계에서는 테스트 전화번호를 추가할 수 있습니다:

1. **Authentication** → **Sign-in method** → **Phone** 설정
2. **Phone numbers for testing** 섹션에서 테스트 번호 추가
3. 인증 코드 입력 (예: `123456`)

⚠️ **주의**: 테스트 번호는 프로덕션 환경에서 사용하지 마세요.

## 사용 방법

### 1. 배송지 추가 시

1. **마이페이지** → **계정 설정** → **배송지 관리**
2. **새 배송지 추가** 클릭
3. 전화번호 입력 (예: `010-1234-5678`)
4. **인증번호 발송** 버튼 클릭
5. SMS로 받은 인증 코드 입력 (6자리)
6. **인증 확인** 버튼 클릭
7. 인증 완료 후 배송지 저장

### 2. 전화번호 형식

- 한국 전화번호: `010-1234-5678`
- 자동으로 `+821012345678` 형식으로 변환됩니다

## 코드 구조

### 서비스 파일
- `src/services/phoneService.ts`: 전화번호 인증 로직
  - `sendVerificationCode()`: SMS 발송
  - `verifyCode()`: 인증 코드 검증
  - `isPhoneVerified()`: 인증 상태 확인

### 컴포넌트
- `src/components/MyPage/AddressModal.tsx`: 배송지 추가/수정 모달
  - 전화번호 입력 필드
  - 인증 코드 발송/입력 UI
  - 인증 상태 표시

## 주요 기능

### 1. 자동 전화번호 정규화
- `010-1234-5678` → `+821012345678` 형식으로 자동 변환

### 2. reCAPTCHA 자동 처리
- Invisible reCAPTCHA 사용
- 사용자 인터랙션 없이 자동 처리

### 3. 인증 상태 관리
- 세션 스토리지에 인증 상태 저장 (10분 유효)
- 전화번호 변경 시 인증 상태 초기화

### 4. 에러 처리
- 전화번호 형식 오류
- 인증 코드 만료
- SMS 발송 실패
- 인증 코드 불일치

## SMS 발송 비용

Firebase Phone Authentication은 사용한 SMS 수만큼 과금됩니다:
- 국가별 가격이 다릅니다
- 한국: 약 건당 가격 확인 필요
- Firebase Console → Billing에서 사용량 확인 가능

## 보안 고려사항

1. **reCAPTCHA**: 자동으로 스팸 방지
2. **인증 코드 유효기간**: 5분
3. **인증 상태 유효기간**: 10분
4. **세션 스토리지**: 브라우저 닫으면 초기화

## 문제 해결

### SMS가 발송되지 않는 경우

1. **Firebase Console 확인**
   - Phone Authentication이 활성화되었는지 확인
   - 일일 할당량을 초과하지 않았는지 확인

2. **전화번호 형식 확인**
   - 올바른 형식: `010-1234-5678`
   - 다른 형식은 자동 변환되지 않을 수 있음

3. **reCAPTCHA 확인**
   - 브라우저 콘솔에서 reCAPTCHA 에러 확인
   - 페이지 새로고침 후 재시도

4. **에러 코드 확인**
   - `auth/too-many-requests`: 요청 제한 초과
   - `auth/quota-exceeded`: 일일 할당량 초과
   - `auth/invalid-phone-number`: 잘못된 전화번호 형식

### 개발/테스트 모드

프로덕션 환경이 아닌 경우, 테스트 전화번호를 사용할 수 있습니다:
- Firebase Console에서 테스트 번호 등록
- 테스트 번호는 항상 동일한 인증 코드 사용

## 참고 자료

- [Firebase Phone Authentication 문서](https://firebase.google.com/docs/auth/web/phone-auth)
- [reCAPTCHA 설정](https://firebase.google.com/docs/auth/web/phone-auth#reCAPTCHA)

