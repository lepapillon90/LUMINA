# Firebase Console 설정 체크리스트

LUMINA 프로젝트의 정상적인 작동을 위해 Firebase Console에서 다음 항목들을 설정해야 합니다.

## 1. Authentication (인증)
*   **Sign-in method (로그인 방법) 설정**:
    *   Firebase Console -> Build -> Authentication -> Sign-in method 탭으로 이동.
    *   **이메일/비밀번호 (Email/Password)** 제공업체를 **사용 설정(Enabled)** 하세요.
    *   (선택 사항) **Google** 로그인도 구현 예정이라면 사용 설정하세요.

*   **이메일 템플릿 설정 (비밀번호 재설정)**:
    *   Firebase Console -> Build -> Authentication -> Templates 탭으로 이동.
    *   **Password reset** 템플릿을 선택합니다.
    *   이메일 제목과 본문을 커스터마이징할 수 있습니다.
    *   **Action URL**은 비밀번호 재설정 완료 후 리다이렉트될 URL입니다 (예: `https://yourdomain.com/login`).
    *   **중요**: Firebase는 실제로 이메일을 발송합니다. 등록된 사용자의 이메일 주소로 비밀번호 재설정 링크가 전송됩니다.
    
*   **인증된 도메인 설정**:
    *   Firebase Console -> Build -> Authentication -> Settings -> Authorized domains에서 앱이 실행되는 도메인을 확인하세요.
    *   개발 환경에서는 `localhost`가 기본적으로 포함되어 있습니다.
    *   프로덕션 배포 시 실제 도메인을 추가해야 합니다.

## 2. Cloud Firestore (데이터베이스)
*   **데이터베이스 확인**:
    *   현재 코드는 `lumina`라는 이름의 데이터베이스를 사용하도록 설정되어 있습니다 (`src/firebase.ts`).
    *   Firebase Console -> Build -> Firestore Database에서 데이터베이스 목록을 확인하세요.
    *   만약 `(default)` 데이터베이스만 있다면, 코드를 수정하거나 `lumina` 데이터베이스를 생성해야 합니다.

*   **복합 색인 (Composite Indexes) 추가 (중요!)**:
    *   구매 내역 및 위시리스트 조회 기능이 작동하려면 복합 색인이 필요합니다.
    *   Firebase Console -> Build -> Firestore Database -> **Indexes (색인)** 탭으로 이동.
    *   **Create Index (색인 만들기)** 버튼을 클릭하여 다음 4개의 인덱스를 생성하세요:
        
        **1) orders 컬렉션 인덱스:**
        *   Collection ID: `orders`
        *   Fields: `userId` (Ascending), `createdAt` (Descending)
        *   Query scope: Collection
        
        **2) wishlist_folders 컬렉션 인덱스:**
        *   Collection ID: `wishlist_folders`
        *   Fields: `userId` (Ascending), `createdAt` (Ascending)
        *   Query scope: Collection
        
        **3) wishlist_items 컬렉션 인덱스 #1:**
        *   Collection ID: `wishlist_items`
        *   Fields: `userId` (Ascending), `folderId` (Ascending), `createdAt` (Descending)
        *   Query scope: Collection
        
        **4) wishlist_items 컬렉션 인덱스 #2:**
        *   Collection ID: `wishlist_items`
        *   Fields: `userId` (Ascending), `createdAt` (Descending)
        *   Query scope: Collection

*   **보안 규칙 (Rules)**:
    *   개발 단계에서는 테스트를 위해 모든 읽기/쓰기를 허용:
        ```
        rules_version = '2';
        service cloud.firestore {
          match /databases/{database}/documents {
            match /{document=**} {
              allow read, write: if true;
            }
          }
        }
        ```

## 3. Storage (스토리지)
*   **Storage 시작하기**:
    *   Firebase Console -> Build -> Storage -> **Get started** 클릭.
    *   테스트 모드로 생성 권장.

*   **보안 규칙 (Rules)**:
        ```
        rules_version = '2';
        service firebase.storage {
          match /b/{bucket}/o {
            match /{allPaths=**} {
              allow read, write: if true;
            }
          }
        }
        ```

## 4. 환경 변수 (.env) 확인
*   `.env` 파일이 Firebase Console의 **Project settings** -> **General** -> **Your apps** 섹션의 설정값과 일치하는지 확인하세요.
