import { useEffect, useRef } from 'react';
import { useLocation } from 'react-router-dom';
import Lenis from 'lenis';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

// GSAP 플러그인 등록
gsap.registerPlugin(ScrollTrigger);

interface SmoothScrollerProps {
    children: React.ReactNode;
}

/**
 * SmoothScroller - Lenis 기반 부드러운 스크롤 래퍼
 * 
 * Apple 스타일의 부드럽고 고급스러운 스크롤 경험을 제공합니다.
 * - 부드러운 관성 스크롤
 * - 터치 디바이스 지원
 * - GSAP ScrollTrigger 연동
 * - 관리자 페이지에서는 비활성화 (일반 스크롤 사용)
 */
const SmoothScroller: React.FC<SmoothScrollerProps> = ({ children }) => {
    const lenisRef = useRef<Lenis | null>(null);
    const location = useLocation();

    // 관리자 페이지인지 확인
    const isAdminPage = location.pathname.startsWith('/admin');

    useEffect(() => {
        // 관리자 페이지에서는 Lenis 비활성화
        if (isAdminPage) {
            // 기존 Lenis 인스턴스 정리
            if (lenisRef.current) {
                lenisRef.current.destroy();
                lenisRef.current = null;
                // @ts-ignore
                window.lenis = null;
            }
            return;
        }

        // Lenis 인스턴스 생성
        const lenis = new Lenis({
            duration: 1.2, // 스크롤 애니메이션 지속 시간 (높을수록 부드러움)
            easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)), // 이징 함수 (자연스러운 감속)
            orientation: 'vertical', // 수직 스크롤
            gestureOrientation: 'vertical', // 제스처 방향
            smoothWheel: true, // 마우스 휠 부드럽게
            wheelMultiplier: 1, // 휠 속도 배율
            touchMultiplier: 2, // 터치 속도 배율
            infinite: false, // 무한 스크롤 비활성화
        });

        lenisRef.current = lenis;

        // Lenis와 ScrollTrigger 연동
        lenis.on('scroll', ScrollTrigger.update);

        // GSAP ticker에 Lenis raf 연결
        const rafCallback = (time: number) => {
            lenis.raf(time * 1000);
        };
        gsap.ticker.add(rafCallback);

        // GSAP ticker에서 lag smoothing 비활성화 (더 부드러운 애니메이션)
        gsap.ticker.lagSmoothing(0);

        // 전역에서 Lenis 인스턴스에 접근할 수 있도록 설정
        // @ts-ignore
        window.lenis = lenis;

        // 클린업
        return () => {
            lenis.destroy();
            gsap.ticker.remove(rafCallback);
            // @ts-ignore
            window.lenis = null;
        };
    }, [isAdminPage]);

    // 페이지 이동 시 스크롤 위치 초기화 및 ScrollTrigger 새로고침
    useEffect(() => {
        const handleRouteChange = () => {
            if (lenisRef.current) {
                lenisRef.current.scrollTo(0, { immediate: true });
            }
            // ScrollTrigger 새로고침 (새 페이지의 트리거 재계산)
            setTimeout(() => {
                ScrollTrigger.refresh();
            }, 100);
        };

        // popstate 이벤트 (브라우저 뒤로가기/앞으로가기)
        window.addEventListener('popstate', handleRouteChange);

        return () => {
            window.removeEventListener('popstate', handleRouteChange);
        };
    }, []);

    return <>{children}</>;
};

export default SmoothScroller;


