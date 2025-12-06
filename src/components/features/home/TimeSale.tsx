import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Clock } from 'lucide-react';

interface TimeSaleProps {
    previewData?: any;
}

const TimeSale: React.FC<TimeSaleProps> = ({ previewData }) => {
    const [timeLeft, setTimeLeft] = useState({ hours: 0, minutes: 0, seconds: 0 });

    useEffect(() => {
        // Set deadline to midnight tonight
        const now = new Date();
        const deadline = new Date(now);

        if (previewData?.endDate) {
            const end = new Date(previewData.endDate);
            end.setHours(23, 59, 59, 999);
            deadline.setTime(end.getTime());
        } else {
            deadline.setHours(24, 0, 0, 0);
        }

        const timer = setInterval(() => {
            const currentTime = new Date();
            const difference = deadline.getTime() - currentTime.getTime();

            if (difference <= 0) {
                // Reset for next day simulation if no specific end date
                if (!previewData?.endDate) {
                    deadline.setDate(deadline.getDate() + 1);
                } else {
                    setTimeLeft({ hours: 0, minutes: 0, seconds: 0 });
                    clearInterval(timer);
                    return;
                }
            } else {
                const hours = Math.floor((difference / (1000 * 60 * 60)) % 24);
                const minutes = Math.floor((difference / 1000 / 60) % 60);
                const seconds = Math.floor((difference / 1000) % 60);
                setTimeLeft({ hours, minutes, seconds });
            }
        }, 1000);

        return () => clearInterval(timer);
    }, [previewData]);

    // Use preview data if available
    const displayTitle = previewData?.title || "Flash Sale: 24 Hours Only";
    const displayDesc = previewData?.description || "오늘 자정까지만 진행되는 특별한 혜택.\n엄선된 베스트셀러 아이템을 최대 30% 할인된 가격으로 만나보세요.";
    const displayDiscount = previewData?.discountPercentage || 30;
    const displayBgColor = previewData?.backgroundColor || '#000000';
    const displayTextColor = previewData?.textColor || '#FFFFFF';
    const displayBgImage = previewData?.backgroundImageUrl;

    const titleStyle = previewData?.titleStyle || {};
    const descStyle = previewData?.descriptionStyle || {};
    const badgeStyle = previewData?.badgeStyle || {
        backgroundColor: '#DC2626',
        color: '#FFFFFF',
        fontSize: '0.75rem',
        fontWeight: '700'
    };

    return (
        <section
            className="py-12 md:py-16 relative overflow-hidden"
            style={{
                backgroundColor: displayBgColor,
                color: displayTextColor,
            }}
        >
            {/* Background Image Overlay */}
            {displayBgImage && (
                <div className="absolute inset-0 z-0">
                    <img
                        src={displayBgImage}
                        alt="Time Sale Background"
                        className="w-full h-full object-cover opacity-50"
                    />
                    <div className="absolute inset-0 bg-black/40"></div>
                </div>
            )}

            <div className="container mx-auto px-6 relative z-10">
                <div className="flex flex-col md:flex-row items-center justify-between gap-8">

                    {/* Text & Timer */}
                    <div className="flex-1 text-center md:text-left">
                        <div
                            className="inline-flex items-center gap-2 px-3 py-1 rounded-full mb-4 animate-pulse"
                            style={{
                                backgroundColor: badgeStyle.backgroundColor,
                                color: badgeStyle.color,
                                fontSize: badgeStyle.fontSize,
                                fontWeight: badgeStyle.fontWeight,
                                letterSpacing: badgeStyle.letterSpacing
                            }}
                        >
                            <Clock size={12} /> LIMITED TIME OFFER
                        </div>
                        <h2
                            className="text-3xl md:text-4xl font-serif mb-4"
                            style={{
                                color: titleStyle.color,
                                fontSize: titleStyle.fontSize,
                                fontWeight: titleStyle.fontWeight,
                                letterSpacing: titleStyle.letterSpacing
                            }}
                        >
                            {displayTitle}
                        </h2>
                        <p
                            className="text-gray-400 mb-8 max-w-md whitespace-pre-line"
                            style={{
                                color: descStyle.color,
                                fontSize: descStyle.fontSize,
                                fontWeight: descStyle.fontWeight,
                                letterSpacing: descStyle.letterSpacing
                            }}
                        >
                            {displayDesc}
                        </p>

                        <div className="flex items-center justify-center md:justify-start gap-4 text-center">
                            <div>
                                <div className="bg-gray-800 w-12 h-12 md:w-16 md:h-16 rounded-lg flex items-center justify-center text-xl md:text-2xl font-bold font-mono mb-2">
                                    {String(timeLeft.hours).padStart(2, '0')}
                                </div>
                                <span className="text-[10px] md:text-xs text-gray-500 uppercase">Hours</span>
                            </div>
                            <span className="text-xl md:text-2xl font-bold -mt-6">:</span>
                            <div>
                                <div className="bg-gray-800 w-12 h-12 md:w-16 md:h-16 rounded-lg flex items-center justify-center text-xl md:text-2xl font-bold font-mono mb-2">
                                    {String(timeLeft.minutes).padStart(2, '0')}
                                </div>
                                <span className="text-[10px] md:text-xs text-gray-500 uppercase">Mins</span>
                            </div>
                            <span className="text-xl md:text-2xl font-bold -mt-6">:</span>
                            <div>
                                <div className="bg-gray-800 w-12 h-12 md:w-16 md:h-16 rounded-lg flex items-center justify-center text-xl md:text-2xl font-bold font-mono mb-2 text-red-500">
                                    {String(timeLeft.seconds).padStart(2, '0')}
                                </div>
                                <span className="text-[10px] md:text-xs text-gray-500 uppercase">Secs</span>
                            </div>
                        </div>
                    </div>

                    {/* Product Preview */}
                    <div className="flex-1 w-full max-w-lg">
                        <div className="bg-white/10 backdrop-blur-sm p-4 md:p-6 rounded-xl border border-white/10 flex items-center gap-4 md:gap-6">
                            <div className="w-24 h-24 md:w-32 md:h-32 bg-gray-800 rounded-lg overflow-hidden flex-shrink-0">
                                <img src="https://images.unsplash.com/photo-1602173574767-37ac01994b2a?auto=format&fit=crop&q=80&w=300" alt="Sale Item" className="w-full h-full object-cover" />
                            </div>
                            <div className="min-w-0 flex-1">
                                <h3 className="text-lg md:text-xl font-medium mb-2 truncate">Midnight Collection Set</h3>
                                <div className="flex flex-wrap items-center gap-2 md:gap-3 mb-4">
                                    <span className="text-sm md:text-base text-gray-400 line-through">₩250,000</span>
                                    <span className="text-xl md:text-2xl font-bold text-white">
                                        ₩{(250000 * (1 - displayDiscount / 100)).toLocaleString()}
                                    </span>
                                </div>
                                <Link to="/shop" className="inline-block bg-white text-black px-4 py-2 md:px-6 md:py-2 rounded font-medium text-xs md:text-sm hover:bg-gray-200 transition">
                                    Shop Now
                                </Link>
                            </div>
                        </div>
                    </div>

                </div>
            </div>
        </section>
    );
};

export default TimeSale;
