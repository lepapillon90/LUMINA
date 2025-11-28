# Technical Infrastructure Future Roadmap

안정적이고 빠른 서비스를 제공하기 위한 기술적인 개선 로드맵입니다. 성능, 보안, 확장성을 고려한 엔지니어링 과제들입니다.

## 1단계: 성능 최적화 (Performance)
> **목표**: 로딩 속도 개선 및 Core Web Vitals 점수 향상
- [ ] **이미지 최적화 (CDN)**: Cloudinary, Imgix 등을 도입하여 디바이스에 맞는 최적의 이미지 포맷(WebP/AVIF)과 사이즈 자동 서빙.
- [ ] **코드 스플리팅 (Code Splitting)**: 페이지별로 필요한 자바스크립트만 로드하도록 번들 최적화 (React.lazy, Suspense).
- [ ] **캐싱 전략 (Caching)**: React Query 등을 활용한 서버 데이터 캐싱 및 브라우저 캐시 정책 수립.
- [ ] **Lighthouse 점수 개선**: LCP(최대 콘텐츠 렌더링), CLS(누적 레이아웃 이동) 등 주요 지표 모니터링 및 개선.

## 2단계: 검색 엔진 최적화 (SEO)
> **목표**: 오가닉 트래픽 증대를 위한 검색 엔진 친화적 구조
- [ ] **동적 메타 태그**: 상품별, 페이지별로 고유한 Title, Description, OG Tag 자동 생성 (React Helmet Async).
- [ ] **Sitemap & Robots.txt**: 검색 엔진 봇이 사이트를 잘 크롤링할 수 있도록 사이트맵 자동 생성 및 제출.
- [ ] **구조화 데이터 (Schema.org)**: 상품, 리뷰, FAQ 등에 JSON-LD 마크업을 적용하여 검색 결과에 리치 스니펫 노출.
- [ ] **SSR/Prerendering**: 크롤러가 콘텐츠를 잘 읽을 수 있도록 서버 사이드 렌더링(Next.js 마이그레이션 고려) 또는 프리렌더링 도입.

## 3단계: 데이터 분석 및 마케팅 도구 (Analytics & Marketing)
> **목표**: 사용자 행동 추적 및 마케팅 성과 측정
- [ ] **Google Analytics 4 (GA4)**: 전자상거래 이벤트(상품 조회, 장바구니, 결제) 정밀 추적 설정.
- [ ] **Google Tag Manager (GTM)**: 개발자 없이 마케터가 직접 픽셀이나 스크립트를 심을 수 있는 환경 구축.
- [ ] **히트맵 (Hotjar)**: 사용자의 클릭, 스크롤, 마우스 움직임을 시각화하여 UX 문제점 발견.

## 4단계: 개발 생산성 및 품질 (DevOps & QA)
> **목표**: 안정적인 배포와 버그 없는 코드
- [ ] **CI/CD 파이프라인**: GitHub Actions를 통해 코드 푸시 시 자동 빌드, 테스트, 배포 자동화.
- [ ] **자동화 테스트**: Jest(유닛 테스트), Cypress/Playwright(E2E 테스트) 도입으로 핵심 기능 결함 방지.
- [ ] **에러 모니터링 (Sentry)**: 사용자 브라우저에서 발생하는 런타임 에러를 실시간으로 수집하고 알림 받기.
- [ ] **디자인 시스템 구축 (Storybook)**: UI 컴포넌트를 문서화하고 독립적으로 테스트할 수 있는 환경 마련.
