import React, { useState, useEffect } from 'react';
import { X } from 'lucide-react';

const AnnouncementBar: React.FC = () => {
    const [isVisible, setIsVisible] = useState(true);
    const [currentIndex, setCurrentIndex] = useState(0);

    const announcements = [
        "🎉 신규 회원 가입 시 10% 할인 쿠폰 증정!",
        "🚚 5만원 이상 구매 시 무료 배송",
        "💎 시즌 오프 세일: 최대 50% 할인 (기간 한정)"
    ];

    useEffect(() => {
        const interval = setInterval(() => {
            setCurrentIndex((prev) => (prev + 1) % announcements.length);
        }, 4000);
        return () => clearInterval(interval);
    }, []);

    if (!isVisible) return null;

    return (
        <div className="bg-black text-white text-xs md:text-sm py-2 px-4 relative z-[60]">
            <div className="container mx-auto flex justify-center items-center">
                <div className="overflow-hidden h-5 w-full max-w-md text-center">
                    <p className="animate-fade-in transition-all duration-500">
                        {announcements[currentIndex]}
                    </p>
                </div>
                <button
                    onClick={() => setIsVisible(false)}
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-white"
                >
                    <X size={14} />
                </button>
            </div>
        </div>
    );
};

export default AnnouncementBar;
