import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Clock } from 'lucide-react';
import { getProductById } from '../../../services/productService';
import { Product } from '../../../types';

interface TimeSaleProps {
    previewData?: any;
    product?: Product;
}

const TimeSale: React.FC<TimeSaleProps> = ({ previewData, product: initialProduct }) => {
    const [timeLeft, setTimeLeft] = useState({ days: 0, hours: 0, minutes: 0, seconds: 0 });
    const [fetchedProduct, setFetchedProduct] = useState<Product | null>(null);

    // Use passed product or fetched product
    const displayProduct = initialProduct || fetchedProduct;

    useEffect(() => {
        // Fetch product if not provided but IDs exist
        const loadProduct = async () => {
            if (!initialProduct && previewData?.productIds?.length > 0) {
                // Fetch the first product
                const productId = previewData.productIds[0];
                const p = await getProductById(productId);
                setFetchedProduct(p);
            }
        };
        loadProduct();
    }, [initialProduct, previewData?.productIds]);

    useEffect(() => {
        const calculateTimeLeft = () => {
            // 종료 시간 계산: endDate를 우선 사용 (종료일 00:00:00에 종료)
            let endTime: Date;
            
            if (previewData?.endDate) {
                // endDate가 있으면 해당 날짜의 시작 시간(00:00:00)으로 설정 (종료일 00:00에 종료)
                const endDateStr = previewData.endDate;
                endTime = new Date(endDateStr);
                // 로컬 시간대로 설정 (UTC가 아닌)
                endTime.setHours(0, 0, 0, 0);
            } else if (previewData?.countdownEndTime) {
                // endDate가 없으면 countdownEndTime 사용 (하위 호환성)
                const countdownTime = previewData.countdownEndTime;
                if (countdownTime instanceof Date) {
                    endTime = countdownTime;
                } else if (typeof countdownTime === 'string') {
                    endTime = new Date(countdownTime);
                } else if (countdownTime?.toDate) {
                    // Firestore Timestamp인 경우
                    endTime = countdownTime.toDate();
                } else if (countdownTime?.seconds) {
                    // Firestore Timestamp의 seconds 속성이 있는 경우
                    endTime = new Date(countdownTime.seconds * 1000);
                } else {
                    endTime = new Date(countdownTime);
                }
            } else {
                // 기본값: 오늘 자정 (타임세일이 설정되지 않은 경우)
                endTime = new Date();
                endTime.setHours(23, 59, 59, 999);
            }

            const now = new Date();
            const difference = endTime.getTime() - now.getTime();

            if (difference > 0) {
                const totalSeconds = Math.floor(difference / 1000);
                const totalHours = Math.floor(totalSeconds / (60 * 60));
                const days = Math.floor(totalHours / 24);
                const hours = totalHours % 24;
                const minutes = Math.floor((totalSeconds % (60 * 60)) / 60);
                const seconds = totalSeconds % 60;
                
                // [MY_LOG] 시작일과 종료일이 같은 날이거나, 남은 시간이 24시간 미만이면 days = 0
                if (previewData?.startDate && previewData?.endDate) {
                    const startDate = new Date(previewData.startDate);
                    startDate.setHours(0, 0, 0, 0);
                    const endDate = new Date(previewData.endDate);
                    endDate.setHours(0, 0, 0, 0);
                    
                    // 시작일과 종료일이 같은 날이면 days = 0
                    if (startDate.getTime() === endDate.getTime()) {
                        return { days: 0, hours, minutes, seconds };
                    }
                }
                
                // [MY_LOG] 남은 시간이 24시간 미만이면 days = 0 (24시간 세일인 경우)
                if (totalHours < 24) {
                    return { days: 0, hours: totalHours, minutes, seconds };
                }
                
                return { days, hours, minutes, seconds };
            }
            return { days: 0, hours: 0, minutes: 0, seconds: 0 };
        };

        // Initial calculation
        setTimeLeft(calculateTimeLeft());

        const timer = setInterval(() => {
            setTimeLeft(calculateTimeLeft());
        }, 1000);

        return () => clearInterval(timer);
    }, [previewData]);

    // Use preview data if available
    const displayTitle = previewData?.title || "";
    const displayDesc = previewData?.description || "";
    const displayDiscount = previewData?.discountPercentage || 0;
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

    if (!previewData && !initialProduct && !fetchedProduct) return null;

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
                            {/* Days - 0일이면 표시하지 않음 */}
                            {timeLeft.days > 0 && (
                                <>
                                    <div>
                                        <div className="bg-gray-800 w-12 h-12 md:w-16 md:h-16 rounded-lg flex items-center justify-center text-xl md:text-2xl font-bold font-mono mb-2">
                                            {String(timeLeft.days).padStart(2, '0')}
                                        </div>
                                        <span className="text-[10px] md:text-xs text-gray-500 uppercase">Days</span>
                                    </div>
                                    <span className="text-xl md:text-2xl font-bold -mt-6">:</span>
                                </>
                            )}
                            {/* Hours */}
                            <div>
                                <div className="bg-gray-800 w-12 h-12 md:w-16 md:h-16 rounded-lg flex items-center justify-center text-xl md:text-2xl font-bold font-mono mb-2">
                                    {String(timeLeft.hours).padStart(2, '0')}
                                </div>
                                <span className="text-[10px] md:text-xs text-gray-500 uppercase">Hours</span>
                            </div>
                            <span className="text-xl md:text-2xl font-bold -mt-6">:</span>
                            {/* Minutes */}
                            <div>
                                <div className="bg-gray-800 w-12 h-12 md:w-16 md:h-16 rounded-lg flex items-center justify-center text-xl md:text-2xl font-bold font-mono mb-2">
                                    {String(timeLeft.minutes).padStart(2, '0')}
                                </div>
                                <span className="text-[10px] md:text-xs text-gray-500 uppercase">Mins</span>
                            </div>
                            <span className="text-xl md:text-2xl font-bold -mt-6">:</span>
                            {/* Seconds */}
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
                            <div className="w-24 h-24 md:w-32 md:h-32 bg-gray-800 rounded-lg overflow-hidden flex-shrink-0 flex items-center justify-center">
                                {displayProduct?.image ? (
                                    <img
                                        src={displayProduct.image}
                                        alt={displayProduct.name}
                                        className="w-full h-full object-cover"
                                    />
                                ) : (
                                    <div className="text-gray-500 text-xs text-center p-2">이미지<br />없음</div>
                                )}
                            </div>
                            <div className="min-w-0 flex-1">
                                <h3 className="text-lg md:text-xl font-medium mb-2 truncate">
                                    {displayProduct?.name || "상품을 선택해주세요"}
                                </h3>
                                <div className="flex flex-wrap items-center gap-2 md:gap-3 mb-4">
                                    {displayProduct && (
                                        <span className="text-sm md:text-base text-gray-400 line-through">
                                            ₩{displayProduct.price.toLocaleString()}
                                        </span>
                                    )}
                                    <span className="text-xl md:text-2xl font-bold text-white">
                                        {displayProduct
                                            ? `₩${(displayProduct.price * (1 - displayDiscount / 100)).toLocaleString()}`
                                            : "₩0"
                                        }
                                    </span>
                                </div>
                                <Link to={displayProduct ? `/product/${displayProduct.id}` : "/shop"} className="inline-block bg-white text-black px-4 py-2 md:px-6 md:py-2 rounded font-medium text-xs md:text-sm hover:bg-gray-200 transition">
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
