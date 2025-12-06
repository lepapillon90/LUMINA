# LUMINA Project Rules & Guidelines

## 0. Communication & Language Rules
1.  **Language**: Always respond in **Korean (한국어)**.
2.  **Code Comments**: 주석도 반드시 **한국어**로 작성할 것 through.
3.  **Explanation**: 기술적인 용어는 영어를 병기하되(ex: 변수(Variable)), 설명은 쉽게 한국어로 풀어서 할 것.

## 1. Tech Stack
- **Framework**: React 18+ (Vite)
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **Backend/DB**: Firebase (Firestore, Storage, Auth)
- **State Management**: React Context API / React Query
- **Icons**: Lucide React

## 2. Coding Standards

### TypeScript
- **No `any`**: Avoid using `any` type. Define interfaces or types for all props and data structures.
- **Interfaces**: Use `interface` for object definitions and `type` for unions/primitives.
- **Props**: Define `Props` interface for all components receiving props.

### React Components
- **Functional Components**: Use `React.FC<Props>` or directly destructure props.
- **Hooks**: meaningful variable names for hooks (e.g., `useAuth`, `useEffect`).
- **File Structure**: One component per file usually. `index.ts` for cleaner exports is optional but good.

### Styling (Tailwind CSS)
- **Utility First**: Use utility classes for styling.
- **No Inline Styles**: Avoid `style={{}}` unless dynamic values are strictly necessary.
- **Mobile First**: Design for mobile first, then add sm:, md:, lg: prefixes.

## 3. Project Structure
- `src/components`: Reusable UI components.
- `src/pages`: Route pages.
- `src/services`: API calls and Firebase interaction logic.
- `src/contexts`: Global state providers.
- `src/types`: TypeScript type definitions.
- `src/utils`: Helper functions.

## 4. Git / Version Control
- **Commits**: Clear, descriptive commit messages (e.g., "feat: add product modal", "fix: login error").
- **Branches**: Use feature branches for new tasks.

## 5. Firebase Best Practices
- **Security**: Never expose API keys in public repos (use `.env`).
- **Data**: Validate data before sending to Firestore.
- **Storage**: Clean up unused images when deleting records (e.g., deleting a product should delete its images).

## 6. Performance
- **Image Optimization**: Compress images before upload.
- **Lazy Loading**: Use `React.lazy` for heavy routes.
