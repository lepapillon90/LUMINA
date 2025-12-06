import React from 'react';
import { useFadeInUp, useStaggerFadeIn, useSlideIn, useParallax } from '../../hooks/useScrollAnimation';

/**
 * 애니메이션 래퍼 컴포넌트들
 * 간단하게 자식 요소에 스크롤 애니메이션을 적용
 */

// Fade In Up 애니메이션
interface FadeInUpProps {
    children: React.ReactNode;
    delay?: number;
    duration?: number;
    y?: number;
    className?: string;
}

export const FadeInUp: React.FC<FadeInUpProps> = ({
    children,
    delay = 0,
    duration = 0.8,
    y = 50,
    className = '',
}) => {
    const ref = useFadeInUp<HTMLDivElement>({ delay, duration, y });

    return (
        <div ref={ref} className={className}>
            {children}
        </div>
    );
};

// Stagger Fade In (자식 요소들이 순차적으로 등장)
interface StaggerFadeInProps {
    children: React.ReactNode;
    childSelector?: string;
    stagger?: number;
    duration?: number;
    y?: number;
    delay?: number;
    className?: string;
}

export const StaggerFadeIn: React.FC<StaggerFadeInProps> = ({
    children,
    childSelector = '> *',
    stagger = 0.1,
    duration = 0.6,
    y = 30,
    delay = 0,
    className = '',
}) => {
    const ref = useStaggerFadeIn<HTMLDivElement>(childSelector, { stagger, duration, y, delay });

    return (
        <div ref={ref} className={className}>
            {children}
        </div>
    );
};

// Slide In 애니메이션 (좌우에서 슬라이드)
interface SlideInProps {
    children: React.ReactNode;
    direction?: 'left' | 'right';
    duration?: number;
    distance?: number;
    className?: string;
}

export const SlideIn: React.FC<SlideInProps> = ({
    children,
    direction = 'left',
    duration = 0.8,
    distance = 100,
    className = '',
}) => {
    const ref = useSlideIn<HTMLDivElement>(direction, { duration, distance });

    return (
        <div ref={ref} className={className}>
            {children}
        </div>
    );
};

// Parallax 효과 (배경이 느리게 스크롤)
interface ParallaxProps {
    children: React.ReactNode;
    speed?: number;
    className?: string;
}

export const Parallax: React.FC<ParallaxProps> = ({
    children,
    speed = 0.3,
    className = '',
}) => {
    const ref = useParallax<HTMLDivElement>(speed);

    return (
        <div ref={ref} className={className}>
            {children}
        </div>
    );
};

// 섹션 래퍼 (fade-in-up 기본 적용)
interface AnimatedSectionProps {
    children: React.ReactNode;
    className?: string;
    delay?: number;
}

export const AnimatedSection: React.FC<AnimatedSectionProps> = ({
    children,
    className = '',
    delay = 0,
}) => {
    const ref = useFadeInUp<HTMLElement>({ delay, duration: 0.8, y: 40 });

    return (
        <section ref={ref} className={className}>
            {children}
        </section>
    );
};
