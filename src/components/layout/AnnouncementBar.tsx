import React, { useState, useEffect } from 'react';
import { X } from 'lucide-react';
import { getHomepageAnnouncementBar } from '../../services/homepageService';

const AnnouncementBar: React.FC = () => {
    const [isVisible, setIsVisible] = useState(true);
    const [currentIndex, setCurrentIndex] = useState(0);
    const [announcements, setAnnouncements] = useState<string[]>([]);
    const [backgroundColor, setBackgroundColor] = useState('#000000');
    const [textColor, setTextColor] = useState('#ffffff');
    const [rotationInterval, setRotationInterval] = useState(4000);
    const [isActive, setIsActive] = useState(true);

    useEffect(() => {
        loadAnnouncementBar();
    }, []);

    const loadAnnouncementBar = async () => {
        try {
            const data = await getHomepageAnnouncementBar();
            if (data) {
                if (data.isActive && data.messages && data.messages.length > 0) {
                    setAnnouncements(data.messages.filter(msg => msg.trim().length > 0));
                    setBackgroundColor(data.backgroundColor || '#000000');
                    setTextColor(data.textColor || '#ffffff');
                    setRotationInterval(data.rotationInterval || 4000);
                    setIsActive(data.isActive);
                } else {
                    setIsActive(false);
                }
            } else {
                // 기본값 (하위 호환성)
                setAnnouncements([
                    "🎉 신규 회원 가입 시 10% 할인 쿠폰 증정!",
                    "🚚 5만원 이상 구매 시 무료 배송",
                    "💎 시즌 오프 세일: 최대 50% 할인 (기간 한정)"
                ]);
            }
        } catch (error: any) {
            // 권한 오류는 조용히 처리하고 기본값 사용
            if (error?.code === 'permission-denied') {
                // 기본값 사용 (오류 로그 출력 안 함)
                setAnnouncements([
                    "🎉 신규 회원 가입 시 10% 할인 쿠폰 증정!",
                    "🚚 5만원 이상 구매 시 무료 배송",
                    "💎 시즌 오프 세일: 최대 50% 할인 (기간 한정)"
                ]);
            } else {
                // 다른 오류만 로그 출력
                console.warn('[MY_LOG] Error loading announcement bar:', error);
                setAnnouncements([
                    "🎉 신규 회원 가입 시 10% 할인 쿠폰 증정!",
                    "🚚 5만원 이상 구매 시 무료 배송",
                    "💎 시즌 오프 세일: 최대 50% 할인 (기간 한정)"
                ]);
            }
        }
    };

    useEffect(() => {
        if (announcements.length === 0 || !isActive) return;
        
        const interval = setInterval(() => {
            setCurrentIndex((prev) => (prev + 1) % announcements.length);
        }, rotationInterval);
        
        return () => clearInterval(interval);
    }, [announcements.length, rotationInterval, isActive]);

    if (!isVisible || !isActive || announcements.length === 0) return null;

    return (
        <div 
            className="text-xs md:text-sm py-2 px-4 relative z-[60]"
            style={{ backgroundColor, color: textColor }}
        >
            <div className="container mx-auto flex justify-center items-center">
                <div className="overflow-hidden h-5 w-full max-w-md text-center">
                    <p className="animate-fade-in transition-all duration-500">
                        {announcements[currentIndex]}
                    </p>
                </div>
                <button
                    onClick={() => setIsVisible(false)}
                    className="absolute right-4 top-1/2 -translate-y-1/2 opacity-60 hover:opacity-100 transition"
                    style={{ color: textColor }}
                >
                    <X size={14} />
                </button>
            </div>
        </div>
    );
};

export default AnnouncementBar;
