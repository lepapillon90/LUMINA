import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import OptimizedImage from '../../common/OptimizedImage';
import { getHomepageHero } from '../../../services/homepageService';
import { HomepageHero } from '../../../types';

interface HeroSectionProps {
    previewData?: Partial<HomepageHero>;
    viewMode?: 'desktop' | 'mobile';
}

const HeroSection: React.FC<HeroSectionProps> = ({ previewData, viewMode = 'desktop' }) => {
    // ... existing useState ...
    const [heroData, setHeroData] = useState<Partial<HomepageHero>>({
        videoUrl: 'https://videos.pexels.com/video-files/5359634/5359634-uhd_2560_1440_25fps.mp4',
        imageUrl: '',
        posterUrl: '/hero_poster.png',
        title: 'LUMINA',
        subtitle: 'Timeless Elegance',
        description: '내면의 빛을 발견하세요. 당신을 위해 수작업으로 완성된 모던 악세서리.',
        buttonText: '컬렉션 보기',
        buttonLink: '/shop',
        isActive: true,
        titleStyle: { fontSize: '', color: '', fontWeight: '', letterSpacing: '' },
        subtitleStyle: { fontSize: '', color: '', fontWeight: '', letterSpacing: '' },
        descriptionStyle: { fontSize: '', color: '', fontWeight: '', letterSpacing: '' },
    });

    useEffect(() => {
        if (previewData) {
            setHeroData({ ...heroData, ...previewData });
        } else {
            const fetchData = async () => {
                try {
                    const data = await getHomepageHero();
                    if (data) {
                        setHeroData(data);
                    }
                } catch (error) {
                    console.error('Failed to fetch hero data:', error);
                }
            };
            fetchData();
        }
    }, [previewData]);

    if (heroData.isActive === false) return null;

    // Helper to get responsive style
    const getResponsiveStyle = (style?: any, isTitle = false) => {
        if (!style) return {};

        const isMobile = viewMode === 'mobile';
        const newStyle = { ...style };

        // Simple heuristic for responsive font size if pixel value is provided
        if (isMobile && style.fontSize && style.fontSize.includes('px')) {
            const size = parseInt(style.fontSize);
            if (!isNaN(size)) {
                // Scale down logic: Title ~50%, others ~80% or fixed
                // Default mobile title is usually ~36px (text-4xl), desktop is 64px. Ratio ~0.56
                const scale = isTitle ? 0.6 : 0.85;
                newStyle.fontSize = `${Math.round(size * scale)}px`;
            }
        }

        return newStyle;
    };

    const isMobile = viewMode === 'mobile';

    return (
        <section className="relative h-[100dvh] w-full flex items-center justify-center overflow-hidden">
            {/* Background Video */}
            <div className="absolute inset-0 z-0">
                {heroData.videoUrl ? (
                    <video
                        autoPlay
                        loop
                        muted
                        playsInline
                        poster={heroData.posterUrl}
                        className="w-full h-full object-cover"
                        src={heroData.videoUrl}
                    >
                        {/* Fallback Image */}
                        <OptimizedImage
                            src={heroData.posterUrl || '/hero_poster.png'}
                            alt="Hero Background"
                            className="w-full h-full object-cover"
                            loading="eager"
                            // @ts-ignore
                            fetchPriority="high"
                        />
                    </video>
                ) : (
                    <OptimizedImage
                        src={heroData.imageUrl || heroData.posterUrl || '/hero_poster.png'}
                        alt="Hero Background"
                        className="w-full h-full object-cover"
                        loading="eager"
                        // @ts-ignore
                        fetchPriority="high"
                    />
                )}

                {/* Overlay */}
                <div className="absolute inset-0 bg-black/30"></div>
            </div>

            {/* Content */}
            <div className="relative z-10 text-center text-white px-4 pt-20">
                <p
                    className={`mb-4 uppercase font-bold drop-shadow-[0_2px_2px_rgba(0,0,0,0.8)] animate-fade-in-up ${isMobile ? 'text-sm' : 'text-sm md:text-base'
                        } tracking-[0.3em]`}
                    style={{
                        color: heroData.subtitleStyle?.color || '#FFD700',
                        ...getResponsiveStyle(heroData.subtitleStyle)
                    }}
                >
                    {heroData.subtitle}
                </p>
                <h1
                    className={`font-serif font-bold mb-6 drop-shadow-md animate-fade-in-up delay-100 ${isMobile ? 'text-4xl' : 'text-4xl md:text-[64px]'
                        }`}
                    style={{
                        fontFamily: "'Cinzel', serif",
                        color: heroData.titleStyle?.color,
                        ...getResponsiveStyle(heroData.titleStyle, true)
                    }}
                >
                    {heroData.title}
                </h1>
                <p
                    className={`font-light mb-8 max-w-lg mx-auto opacity-95 text-shadow animate-fade-in-up delay-200 whitespace-pre-line ${isMobile ? 'text-base' : 'text-lg'
                        }`}
                    style={{
                        color: heroData.descriptionStyle?.color,
                        ...getResponsiveStyle(heroData.descriptionStyle)
                    }}
                >
                    {heroData.description}
                </p>
                {heroData.buttonText && (
                    <Link
                        to={heroData.buttonLink || '/shop'}
                        className="inline-block px-10 py-4 border border-white text-white hover:bg-white hover:text-black transition duration-300 uppercase tracking-widest text-sm backdrop-blur-sm animate-fade-in-up delay-300"
                    >
                        {heroData.buttonText}
                    </Link>
                )}
            </div>
        </section>
    );
};

export default HeroSection;
