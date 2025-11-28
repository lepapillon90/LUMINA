# Environmental Variables Manager

## 1. Required Variables
The application requires the following environment variables to function correctly, specifically for the AI features.

| Variable Name | Description | Required | Usage |
| :--- | :--- | :--- | :--- |
| `API_KEY` | Google Gemini API Key | Yes | Used in `services/geminiService.ts` to authenticate with Google GenAI. |

## 2. Injection Method
*   In this environment, `process.env.API_KEY` is injected automatically by the execution context.
*   **Security Note:** The API key is exposed in the frontend code. In a production environment, this should be proxied through a backend server.

## 3. Usage Code
```typescript
const apiKey = process.env.API_KEY || '';
const ai = new GoogleGenAI({ apiKey });
```
