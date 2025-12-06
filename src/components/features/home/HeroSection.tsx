import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import OptimizedImage from '../../common/OptimizedImage';
import { getHomepageHero } from '../../../services/homepageService';
import { HomepageHero } from '../../../types';
import { getCache, CACHE_KEYS } from '../../../utils/cache';

// Default hero data for fallback
const DEFAULT_HERO: Partial<HomepageHero> = {
    videoUrl: '',
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
};

interface HeroSectionProps {
    previewData?: Partial<HomepageHero>;
    viewMode?: 'desktop' | 'mobile';
}

const HeroSection: React.FC<HeroSectionProps> = ({ previewData, viewMode = 'desktop' }) => {
    // Initialize with cached data from service or default
    const [heroData, setHeroData] = useState<Partial<HomepageHero>>(() => {
        const cached = getCache<HomepageHero>(CACHE_KEYS.HERO);
        return cached || DEFAULT_HERO;
    });

    // Track if component is ready to prevent layout shift
    const [isReady, setIsReady] = useState(false);

    // Track if remote image is loaded
    const [imageLoaded, setImageLoaded] = useState(false);

    useEffect(() => {
        // Mark as ready after initial render to prevent FOUC
        setIsReady(true);
    }, []);

    // Preload remote image in background
    useEffect(() => {
        const imageUrl = heroData.imageUrl || heroData.posterUrl;
        if (imageUrl && imageUrl !== '/hero_poster.png') {
            const img = new Image();
            img.onload = () => setImageLoaded(true);
            img.src = imageUrl;
        } else {
            // Local image, mark as loaded immediately
            setImageLoaded(true);
        }
    }, [heroData.imageUrl, heroData.posterUrl]);

    useEffect(() => {
        if (previewData) {
            setHeroData(prev => ({ ...prev, ...previewData }));
        } else {
            // getHomepageHero now has built-in caching
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

    // Get background image URL with fallback - use local fallback first for fast rendering
    const remoteImageUrl = heroData.imageUrl || heroData.posterUrl;
    const localFallback = '/hero_poster.png';
    // Show remote image only after it's loaded, otherwise show local fallback
    const backgroundImageUrl = imageLoaded && remoteImageUrl ? remoteImageUrl : localFallback;

    return (
        <section
            className="relative w-full flex items-center justify-center overflow-hidden"
            style={{
                height: '100dvh',
                minHeight: '600px', // Minimum height to prevent collapse
            }}
        >
            {/* Background - Fixed dimensions to prevent layout shift */}
            <div
                className="absolute inset-0 z-0"
                style={{
                    // Set background color as placeholder to prevent flash
                    backgroundColor: '#1a1a1a',
                }}
            >
                {heroData.videoUrl ? (
                    <video
                        autoPlay
                        loop
                        muted
                        playsInline
                        poster={heroData.posterUrl}
                        className="w-full h-full object-cover"
                        src={heroData.videoUrl}
                        style={{
                            // Ensure video fills container
                            position: 'absolute',
                            top: 0,
                            left: 0,
                            width: '100%',
                            height: '100%',
                        }}
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
                    // Use CSS background-image for instant display without layout shift
                    <div
                        className="w-full h-full"
                        style={{
                            backgroundImage: `url(${backgroundImageUrl})`,
                            backgroundSize: 'cover',
                            backgroundPosition: 'center',
                            backgroundRepeat: 'no-repeat',
                            // Smooth transition when remote image loads
                            transition: 'background-image 0.3s ease-in-out',
                        }}
                    />
                )}

                {/* Overlay */}
                <div className="absolute inset-0 bg-black/30"></div>
            </div>

            {/* Content - Use visibility to prevent FOUC instead of conditional rendering */}
            <div
                className="relative z-10 text-center text-white px-4 pt-20"
                style={{
                    // Prevent content flash by using opacity transition
                    opacity: isReady ? 1 : 0,
                    transition: 'opacity 0.1s ease-in',
                }}
            >
                <p
                    className={`mb-4 uppercase font-bold drop-shadow-[0_2px_2px_rgba(0,0,0,0.8)] ${isMobile ? 'text-sm' : 'text-sm md:text-base'} tracking-[0.3em]`}
                    style={{
                        color: heroData.subtitleStyle?.color || '#FFD700',
                        // Set explicit line height to prevent shift
                        lineHeight: '1.5',
                        ...getResponsiveStyle(heroData.subtitleStyle)
                    }}
                >
                    {heroData.subtitle}
                </p>
                <h1
                    className={`font-serif font-bold mb-6 drop-shadow-md ${isMobile ? 'text-4xl' : 'text-4xl md:text-[64px]'}`}
                    style={{
                        fontFamily: "'Cinzel', serif",
                        color: heroData.titleStyle?.color,
                        // Reserve space for text to prevent layout shift
                        lineHeight: '1.2',
                        minHeight: isMobile ? '44px' : '77px',
                        ...getResponsiveStyle(heroData.titleStyle, true)
                    }}
                >
                    {heroData.title}
                </h1>
                <p
                    className={`font-light mb-8 max-w-lg mx-auto opacity-95 text-shadow whitespace-pre-line ${isMobile ? 'text-base' : 'text-lg'}`}
                    style={{
                        color: heroData.descriptionStyle?.color,
                        lineHeight: '1.8',
                        minHeight: '60px', // Reserve space
                        ...getResponsiveStyle(heroData.descriptionStyle)
                    }}
                >
                    {heroData.description}
                </p>
                {heroData.buttonText && (
                    <Link
                        to={heroData.buttonLink || '/shop'}
                        className="inline-block px-10 py-4 border border-white text-white hover:bg-white hover:text-black transition duration-300 uppercase tracking-widest text-sm backdrop-blur-sm"
                    >
                        {heroData.buttonText}
                    </Link>
                )}
            </div>
        </section>
    );
};

export default HeroSection;

