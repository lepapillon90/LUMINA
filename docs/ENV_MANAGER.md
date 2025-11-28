# 환경 변수 관리자 (Environmental Variables Manager)

## 1. 필수 변수 (Required Variables)
애플리케이션이 올바르게 작동하기 위해, 특히 AI 기능을 위해 다음 환경 변수가 필요합니다.

| 변수명 (Variable Name) | 설명 (Description) | 필수 여부 (Required) | 용도 (Usage) |
| :--- | :--- | :--- | :--- |
| `VITE_GEMINI_API_KEY` | Google Gemini API 키 | 예 (Yes) | `services/geminiService.ts`에서 Google GenAI 인증에 사용됩니다. |

## 2. 주입 방법 (Injection Method)
*   프로젝트 루트의 `.env` 파일에 정의합니다.
*   Vite가 빌드 시점에 `import.meta.env` 객체를 통해 주입합니다.
*   **보안 참고:** API 키가 프론트엔드 코드에 노출됩니다. 프로덕션 환경에서는 백엔드 서버를 통해 프록시 처리해야 합니다.

## 3. 사용 코드 (Usage Code)
```typescript
const apiKey = import.meta.env.VITE_GEMINI_API_KEY || '';
const ai = new GoogleGenAI({ apiKey });
```
