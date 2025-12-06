import { useEffect, useRef } from 'react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

// GSAP 플러그인 등록
gsap.registerPlugin(ScrollTrigger);

// 기본 GSAP 설정 - GPU 가속 활성화
gsap.defaults({
    force3D: true, // GPU 가속 강제 (translateZ(0) 효과)
});

// Lenis와 ScrollTrigger 연동
if (typeof window !== 'undefined') {
    // @ts-ignore
    ScrollTrigger.defaults({
        // Lenis와 함께 사용할 때 스크롤 업데이트
        toggleActions: 'play none none reverse',
    });
}

/**
 * will-change 설정 헬퍼 (GPU 레이어 생성)
 */
const setWillChange = (element: HTMLElement, properties: string = 'transform, opacity') => {
    element.style.willChange = properties;
};

/**
 * will-change 해제 헬퍼 (메모리 최적화)
 */
const clearWillChange = (element: HTMLElement) => {
    element.style.willChange = 'auto';
};

/**
 * 기본 fade-in-up 애니메이션 훅
 * 요소가 뷰포트에 들어오면 아래에서 위로 페이드인
 * GPU 가속 적용
 */
export const useFadeInUp = <T extends HTMLElement>(
    options?: {
        delay?: number;
        duration?: number;
        y?: number;
    }
) => {
    const ref = useRef<T>(null);
    const { delay = 0, duration = 0.8, y = 50 } = options || {};

    useEffect(() => {
        if (!ref.current) return;

        const element = ref.current;

        // GPU 레이어 생성
        setWillChange(element);

        // 3D transform 사용 (GPU 가속)
        gsap.set(element, {
            opacity: 0,
            y,
            force3D: true,
        });

        const trigger = ScrollTrigger.create({
            trigger: element,
            start: 'top 85%',
            onEnter: () => {
                gsap.to(element, {
                    opacity: 1,
                    y: 0,
                    duration,
                    delay,
                    ease: 'power3.out',
                    force3D: true,
                    onComplete: () => clearWillChange(element),
                });
            },
        });

        return () => {
            trigger.kill();
            clearWillChange(element);
        };
    }, [delay, duration, y]);

    return ref;
};

/**
 * 스태거 애니메이션 훅 (자식 요소들이 순차적으로 등장)
 * GPU 가속 적용
 */
export const useStaggerFadeIn = <T extends HTMLElement>(
    childSelector: string,
    options?: {
        stagger?: number;
        duration?: number;
        y?: number;
        delay?: number;
    }
) => {
    const ref = useRef<T>(null);
    const { stagger = 0.1, duration = 0.6, y = 30, delay = 0 } = options || {};

    useEffect(() => {
        if (!ref.current) return;

        const container = ref.current;
        const children = container.querySelectorAll(childSelector);

        if (children.length === 0) return;

        // GPU 레이어 생성
        children.forEach(child => setWillChange(child as HTMLElement));

        gsap.set(children, {
            opacity: 0,
            y,
            force3D: true,
        });

        const trigger = ScrollTrigger.create({
            trigger: container,
            start: 'top 80%',
            onEnter: () => {
                gsap.to(children, {
                    opacity: 1,
                    y: 0,
                    duration,
                    delay,
                    stagger,
                    ease: 'power2.out',
                    force3D: true,
                    onComplete: () => children.forEach(child => clearWillChange(child as HTMLElement)),
                });
            },
        });

        return () => {
            trigger.kill();
            children.forEach(child => clearWillChange(child as HTMLElement));
        };
    }, [childSelector, stagger, duration, y, delay]);

    return ref;
};

/**
 * 패럴랙스 효과 훅 (스크롤 시 배경이 느리게 움직임)
 * GPU 가속 적용
 */
export const useParallax = <T extends HTMLElement>(
    speed: number = 0.3
) => {
    const ref = useRef<T>(null);

    useEffect(() => {
        if (!ref.current) return;

        const element = ref.current;

        // GPU 레이어 생성 (패럴랙스는 계속 활성화)
        setWillChange(element, 'transform');

        const trigger = gsap.to(element, {
            yPercent: -20 * speed,
            ease: 'none',
            force3D: true,
            scrollTrigger: {
                trigger: element,
                start: 'top bottom',
                end: 'bottom top',
                scrub: true,
            },
        });

        return () => {
            trigger.scrollTrigger?.kill();
            clearWillChange(element);
        };
    }, [speed]);

    return ref;
};

/**
 * 스크롤 시 스케일 애니메이션
 * GPU 가속 적용
 */
export const useScaleOnScroll = <T extends HTMLElement>(
    options?: {
        startScale?: number;
        endScale?: number;
    }
) => {
    const ref = useRef<T>(null);
    const { startScale = 0.9, endScale = 1 } = options || {};

    useEffect(() => {
        if (!ref.current) return;

        const element = ref.current;

        setWillChange(element);

        gsap.set(element, {
            scale: startScale,
            opacity: 0.5,
            force3D: true,
        });

        const trigger = gsap.to(element, {
            scale: endScale,
            opacity: 1,
            ease: 'power2.out',
            force3D: true,
            scrollTrigger: {
                trigger: element,
                start: 'top 85%',
                end: 'top 50%',
                scrub: 1,
            },
        });

        return () => {
            trigger.scrollTrigger?.kill();
            clearWillChange(element);
        };
    }, [startScale, endScale]);

    return ref;
};

/**
 * 텍스트 슬라이드 인 효과
 * GPU 가속 적용
 */
export const useSlideIn = <T extends HTMLElement>(
    direction: 'left' | 'right' = 'left',
    options?: {
        duration?: number;
        distance?: number;
    }
) => {
    const ref = useRef<T>(null);
    const { duration = 0.8, distance = 100 } = options || {};

    useEffect(() => {
        if (!ref.current) return;

        const element = ref.current;
        const x = direction === 'left' ? -distance : distance;

        setWillChange(element);

        gsap.set(element, {
            opacity: 0,
            x,
            force3D: true,
        });

        const trigger = ScrollTrigger.create({
            trigger: element,
            start: 'top 85%',
            onEnter: () => {
                gsap.to(element, {
                    opacity: 1,
                    x: 0,
                    duration,
                    ease: 'power3.out',
                    force3D: true,
                    onComplete: () => clearWillChange(element),
                });
            },
        });

        return () => {
            trigger.kill();
            clearWillChange(element);
        };
    }, [direction, duration, distance]);

    return ref;
};

/**
 * Lenis + ScrollTrigger 연동 업데이트
 * SmoothScroller에서 호출
 */
export const updateScrollTrigger = () => {
    ScrollTrigger.update();
};

// ScrollTrigger 전역 새로고침 (라우트 변경 시 사용)
export const refreshScrollTrigger = () => {
    ScrollTrigger.refresh();
};

