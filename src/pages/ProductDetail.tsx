import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { getProductById, getProductsByCategory } from '../services/productService';
import { Product } from '../types';
import { useCart, useAuth, useGlobalModal } from '../contexts';
import { getHomepageTimeSale } from '../services/homepageService';
import { HomepageTimeSale } from '../types';
import { ChevronRight, Star, Truck, ShieldCheck, Heart, Ruler, Clock } from 'lucide-react';
import Loading from '../components/common/Loading';
import SEO from '../components/common/SEO';
import ConfirmModal from '../components/common/ConfirmModal';
import RestockModal from '../components/features/products/RestockModal';
import ReactGA from 'react-ga4';
import { doc, onSnapshot } from 'firebase/firestore';
import { db } from '../firebase';

// Simple Countdown Component
const CountdownTimer = ({ targetDate }: { targetDate: Date | string | any }) => {
    const [timeLeft, setTimeLeft] = useState('');

    useEffect(() => {
        const updateTimer = () => {
            // targetDate를 Date 객체로 변환
            let endTime: Date;
            
            if (targetDate instanceof Date) {
                endTime = targetDate;
            } else if (typeof targetDate === 'string') {
                endTime = new Date(targetDate);
            } else if (targetDate?.toDate) {
                // Firestore Timestamp인 경우
                endTime = targetDate.toDate();
            } else if (targetDate?.seconds) {
                // Firestore Timestamp의 seconds 속성이 있는 경우
                endTime = new Date(targetDate.seconds * 1000);
            } else {
                endTime = new Date(targetDate);
            }

            const now = new Date();
            const diff = endTime.getTime() - now.getTime();

            if (diff <= 0) {
                setTimeLeft('종료됨');
                return;
            }

            // 시간 계산 (24시간 이상도 표시)
            const totalHours = Math.floor(diff / (1000 * 60 * 60));
            const hours = totalHours % 24;
            const days = Math.floor(totalHours / 24);
            const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
            const seconds = Math.floor((diff % (1000 * 60)) / 1000);

            if (days > 0) {
                setTimeLeft(`${days}일 ${hours}시간 ${minutes}분 ${seconds}초`);
            } else {
                setTimeLeft(`${hours}시간 ${minutes}분 ${seconds}초`);
            }
        };

        updateTimer();
        const interval = setInterval(updateTimer, 1000);
        return () => clearInterval(interval);
    }, [targetDate]);

    return <span>{timeLeft}</span>;
};

const ProductDetail: React.FC = () => {
    const { id } = useParams<{ id: string }>();
    const [product, setProduct] = useState<Product | null>(null);
    const [loading, setLoading] = useState(true);
    const [quantity, setQuantity] = useState(1);
    const [activeTab, setActiveTab] = useState<'details' | 'reviews' | 'ootd'>('details');
    const [selectedImage, setSelectedImage] = useState<string>('');
    const [selectedSize, setSelectedSize] = useState<string>('');
    const [selectedColor, setSelectedColor] = useState<string>('');
    const [isConfirmModalOpen, setIsConfirmModalOpen] = useState(false);
    const [relatedProducts, setRelatedProducts] = useState<Product[]>([]);
    const [isSizeGuideOpen, setIsSizeGuideOpen] = useState(false);
    const [isRestockModalOpen, setIsRestockModalOpen] = useState(false);
    const { addToCart } = useCart();
    const { user, toggleWishlist } = useAuth();
    const { showConfirm, showAlert } = useGlobalModal();
    const [timeSale, setTimeSale] = useState<HomepageTimeSale | null>(null);

    useEffect(() => {
        const fetchTimeSale = async () => {
            try {
                const data = await getHomepageTimeSale();
                setTimeSale(data);
            } catch (error) {
                console.error("Failed to fetch time sale:", error);
            }
        };
        fetchTimeSale();
    }, []);

    const isWishlisted = product && user?.wishlist?.includes(product.id);

    // [MY_LOG] HTML 내용에서 텍스트의 띄어쓰기 처리 (엔터, 스페이스바 자동 처리)
    const normalizeDescriptionSpacing = (html: string): string => {
        if (!html) return html;

        // HTML 태그를 임시로 보호하면서 텍스트만 처리
        const tempMarkers: { [key: string]: string } = {};
        let markerIndex = 0;

        // HTML 태그를 임시 마커로 교체
        let processed = html.replace(/<[^>]+>/g, (match) => {
            const marker = `__HTML_TAG_${markerIndex}__`;
            tempMarkers[marker] = match;
            markerIndex++;
            return marker;
        });

        // 텍스트 부분의 띄어쓰기 처리
        // 1. 탭을 공백으로 변환 (탭은 공백 4개로 처리)
        processed = processed.replace(/\t/g, '    ');

        // 2. 연속된 공백은 CSS의 white-space: pre-wrap으로 처리하므로 유지
        // 단, 5개 이상의 연속 공백은 정리 (실수로 입력된 경우)
        processed = processed.replace(/[ ]{5,}/g, '    ');

        // 3. 줄바꿈은 유지 (CSS로 처리)
        // 줄바꿈 전후의 불필요한 공백만 제거
        processed = processed.replace(/[ ]{2,}\n/g, '\n');
        processed = processed.replace(/\n[ ]{2,}/g, '\n');

        // 4. 문장 시작/끝의 과도한 공백만 제거 (1개는 유지)
        processed = processed.replace(/^[ ]{2,}/gm, ' ');
        processed = processed.replace(/[ ]{2,}$/gm, ' ');

        // 5. 연속된 줄바꿈은 유지 (CSS로 처리)
        // 단, 4개 이상의 연속 줄바꿈은 최대 3개로 제한
        processed = processed.replace(/\n{4,}/g, '\n\n\n');

        // 6. 줄바꿈을 <br> 태그로 변환 (HTML에서 줄바꿈 표시를 위해)
        // 단, 이미 <br>이나 <p> 태그가 있는 경우는 제외하기 위해 마커 복원 후 처리
        Object.keys(tempMarkers).forEach(marker => {
            processed = processed.replace(marker, tempMarkers[marker]);
        });

        // 7. HTML 태그 사이의 줄바꿈과 공백 정리
        // 태그 사이의 공백/줄바꿈 제거 (가독성을 위해)
        processed = processed.replace(/>\s+</g, '><');
        // 단, </p><p> 같은 경우는 줄바꿈 유지
        processed = processed.replace(/<\/p>\s*<p/g, '</p>\n<p');
        processed = processed.replace(/<\/div>\s*<div/g, '</div>\n<div');

        // 8. 텍스트 노드 내의 줄바꿈을 <br>로 변환
        // 태그가 아닌 부분의 줄바꿈을 <br>로 변환
        processed = processed.replace(/([^>])\n([^<])/g, '$1<br>$2');

        return processed;
    };

    // [MY_LOG] 재고 계산: 선택한 사이즈/색상 조합의 재고 또는 전체 재고
    const getCurrentStock = (): number => {
        if (!product) return 0;

        // 사이즈-색상 조합별 재고가 있는 경우
        if (product.sizeColorStock && product.sizeColorStock.length > 0) {
            // 사이즈와 색상이 모두 선택된 경우, 해당 조합의 재고 반환
            if (selectedSize && selectedColor) {
                const variant = product.sizeColorStock.find(
                    item => item.size === selectedSize && item.color === selectedColor
                );
                return variant ? variant.quantity : 0;
            }
            // 전체 재고 합계 반환
            return product.sizeColorStock.reduce((acc, item) => acc + item.quantity, 0);
        }

        // 일반 재고 필드 사용
        return product.stock || 0;
    };

    // [MY_LOG] 사이즈/색상 선택 시 재고에 맞춰 수량 자동 조정 및 유효하지 않은 선택 해제
    useEffect(() => {
        if (product && product.sizeColorStock && product.sizeColorStock.length > 0) {
            // 사이즈 선택 시, 선택한 사이즈와 조합되어 재고가 없는 색상이 선택되어 있으면 해제
            if (selectedSize && selectedColor) {
                const variant = product.sizeColorStock.find(
                    item => item.size === selectedSize && item.color === selectedColor
                );
                if (!variant || variant.quantity === 0) {
                    setSelectedColor('');
                }
            }
            // 색상 선택 시, 선택한 색상과 조합되어 재고가 없는 사이즈가 선택되어 있으면 해제
            if (selectedColor && selectedSize) {
                const variant = product.sizeColorStock.find(
                    item => item.size === selectedSize && item.color === selectedColor
                );
                if (!variant || variant.quantity === 0) {
                    setSelectedSize('');
                }
            }
        }

        // 수량 자동 조정
        if (product && (selectedSize || selectedColor)) {
            const stock = getCurrentStock();
            if (quantity > stock && stock > 0) {
                setQuantity(stock);
            } else if (stock === 0) {
                setQuantity(1);
            }
        }
    }, [selectedSize, selectedColor, product, quantity]);

    const handleToggleWishlist = async () => {
        if (!product) return;

        if (!user) {
            const confirm = await showConfirm("로그인이 필요한 서비스입니다.\n로그인 페이지로 이동하시겠습니까?", "알림");
            if (confirm) {
                window.location.href = '/login';
            }
            return;
        }

        try {
            await toggleWishlist(product.id);
            const isAdded = !isWishlisted;
            await showAlert(
                isAdded ? "관심 상품에 추가되었습니다." : "관심 상품에서 제거되었습니다.",
                "완료"
            );
        } catch (error) {
            console.error("Error toggling wishlist:", error);
            await showAlert("오류가 발생했습니다. 다시 시도해주세요.", "오류");
        }
    };

    useEffect(() => {
        if (!id) return;

        let unsubscribe: (() => void) | null = null;

        const fetchProduct = async () => {
            try {
                // 초기 데이터 로드
                const data = await getProductById(parseInt(id));
                if (data) {
                    setProduct(data);
                    setSelectedImage(data.image);

                    // Fetch related products
                    const related = await getProductsByCategory(data.category);
                    setRelatedProducts(related.filter(p => p.id !== data.id).slice(0, 4));

                    // Save to Recently Viewed
                    const stored = localStorage.getItem('recentlyViewed');
                    let recent: Product[] = stored ? JSON.parse(stored) : [];
                    recent = recent.filter(p => p.id !== data.id);
                    recent.unshift(data);
                    if (recent.length > 10) recent.pop();
                    localStorage.setItem('recentlyViewed', JSON.stringify(recent));

                    // GA4 E-commerce Event: view_item
                    ReactGA.event('view_item', {
                        currency: 'KRW',
                        value: data.price,
                        items: [{
                            item_id: data.id.toString(),
                            item_name: data.name,
                            item_category: data.category,
                            price: data.price,
                            quantity: 1
                        }]
                    });
                }

                // [MY_LOG] 실시간 재고 업데이트를 위한 Firestore 리스너 설정
                const productRef = doc(db, 'products', id);
                unsubscribe = onSnapshot(productRef, (docSnap) => {
                    if (docSnap.exists()) {
                        const updatedData = { id: docSnap.id as any, ...docSnap.data() } as Product;
                        console.log('[MY_LOG] 재고 업데이트:', updatedData.name, '재고:', updatedData.stock);
                        setProduct(updatedData);
                    }
                }, (error) => {
                    console.error('[MY_LOG] 실시간 재고 업데이트 오류:', error);
                });
            } catch (error) {
                console.error('[MY_LOG] 상품 로드 오류:', error);
            } finally {
                setLoading(false);
            }
        };

        fetchProduct();

        // Cleanup: 컴포넌트 언마운트 시 리스너 해제
        return () => {
            if (unsubscribe) {
                unsubscribe();
            }
        };
    }, [id]);

    const handleAddToCart = () => {
        if (product) {
            // Validate options
            if (product.sizes && product.sizes.length > 0 && !selectedSize) {
                showAlert("사이즈를 선택해주세요.", "알림");
                return;
            }
            if (product.colors && product.colors.length > 0 && !selectedColor) {
                showAlert("색상을 선택해주세요.", "알림");
                return;
            }

            // [MY_LOG] 재고 확인
            if (currentStock === 0) {
                showAlert("선택하신 옵션의 재고가 없습니다.", "알림");
                return;
            }

            if (quantity > currentStock) {
                showAlert(`재고가 부족합니다. (현재 재고: ${currentStock}개)`, "알림");
                setQuantity(currentStock);
                return;
            }

            setIsConfirmModalOpen(true);
        }
    };

    const confirmAddToCart = () => {
        if (product) {
            addToCart(product, quantity, { selectedSize, selectedColor });
            setIsConfirmModalOpen(false);

            // GA4 E-commerce Event: add_to_cart
            ReactGA.event('add_to_cart', {
                currency: 'KRW',
                value: product.price * quantity,
                items: [{
                    item_id: product.id.toString(),
                    item_name: product.name,
                    item_category: product.category,
                    price: product.price,
                    quantity: quantity,
                    item_variant: selectedSize ? `Size: ${selectedSize}` : selectedColor ? `Color: ${selectedColor}` : undefined
                }]
            });
        }
    };

    if (loading) return <Loading />;

    if (!product) {
        return (
            <div className="min-h-screen flex flex-col items-center justify-center">
                <h2 className="text-2xl font-serif mb-4">상품을 찾을 수 없습니다.</h2>
                <Link to="/shop" className="text-primary underline">쇼핑 계속하기</Link>
            </div>
        );
    }

    // Combine main image and additional images for the gallery
    const allImages = [product.image, ...(product.images || [])];

    const currentStock = getCurrentStock();
    const totalStock = product ? (
        (product.sizeColorStock && product.sizeColorStock.length > 0)
            ? product.sizeColorStock.reduce((acc, item) => acc + item.quantity, 0)
            : (product.stock || 0)
    ) : 0;

    return (
        <div className="pt-40 pb-20 bg-white min-h-screen">
            <SEO
                title={product.name}
                description={product.description}
                image={product.image}
                jsonLd={{
                    "@context": "https://schema.org/",
                    "@type": "Product",
                    "name": product.name,
                    "image": product.image,
                    "description": product.description,
                    "sku": product.id,
                    "offers": {
                        "@type": "Offer",
                        "url": window.location.href,
                        "priceCurrency": "KRW",
                        "price": product.price,
                        "availability": totalStock > 0 ? "https://schema.org/InStock" : "https://schema.org/OutOfStock"
                    }
                }}
            />

            <div className="container mx-auto px-6">
                {/* Breadcrumb */}
                <div className="flex items-center text-sm text-gray-500 mb-8 font-light">
                    <Link to="/" className="hover:text-black">Home</Link>
                    <ChevronRight size={14} className="mx-2" />
                    <Link to="/shop" className="hover:text-black">Shop</Link>
                    <ChevronRight size={14} className="mx-2" />
                    <Link
                        to="/shop"
                        state={{ category: product.category }}
                        className="hover:text-black capitalize"
                    >
                        {product.category}
                    </Link>
                    <ChevronRight size={14} className="mx-2" />
                    <span className="text-black font-medium">{product.name}</span>
                </div>

                <div className="flex flex-col lg:flex-row gap-12 lg:gap-20">
                    {/* Left: Gallery */}
                    <div className="lg:w-1/2">
                        <div className="relative aspect-square bg-gray-50 overflow-hidden mb-4 border border-gray-100">
                            <img
                                src={selectedImage || product.image}
                                alt={product.name}
                                className="w-full h-full object-contain"
                                onError={(e) => e.currentTarget.src = "https://via.placeholder.com/600x750?text=No+Image"}
                            />
                        </div>
                        {/* Thumbnails */}
                        {allImages.length > 1 && (
                            <div className="flex gap-4 overflow-x-auto pb-2">
                                {allImages.map((img, idx) => (
                                    <div
                                        key={idx}
                                        className={`w-20 h-20 flex-shrink-0 bg-gray-50 cursor-pointer border transition ${selectedImage === img ? 'border-black opacity-100' : 'border-transparent opacity-70 hover:opacity-100'}`}
                                        onClick={() => setSelectedImage(img)}
                                    >
                                        <img src={img} alt={`Thumbnail ${idx}`} className="w-full h-full object-cover" />
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>

                    {/* Right: Info */}
                    <div className="lg:w-1/2">
                        <div className="mb-2">
                            {product.isNew && <span className="text-xs font-bold tracking-widest uppercase bg-black text-white px-2 py-1">New Arrival</span>}
                        </div>
                        <h1 className="text-3xl md:text-4xl font-serif text-primary mb-4">{product.name}</h1>

                        {/* Stock Status - DB 연동 실시간 재고 표시 */}
                        {(() => {
                            // 선택한 사이즈/색상 조합의 재고 표시
                            if (selectedSize && selectedColor && product.sizeColorStock) {
                                const variantStock = product.sizeColorStock.find(
                                    item => item.size === selectedSize && item.color === selectedColor
                                )?.quantity || 0;

                                if (variantStock === 0) {
                                    return (
                                        <p className="text-red-600 font-bold mb-2 text-lg">
                                            선택하신 옵션 품절 (Sold Out)
                                        </p>
                                    );
                                } else if (variantStock <= 3) {
                                    return (
                                        <p className="text-red-600 font-bold mb-2 animate-pulse">
                                            선택 옵션 재고: {variantStock}개 남음
                                        </p>
                                    );
                                } else {
                                    return (
                                        <p className="text-green-600 font-medium mb-2 text-sm">
                                            선택 옵션 재고: {variantStock}개
                                        </p>
                                    );
                                }
                            }

                            // 전체 재고 표시
                            if (totalStock > 0 && totalStock <= 5) {
                                return (
                                    <p className="text-red-600 font-bold mb-2 animate-pulse">
                                        품절 임박! 남은 수량: {totalStock}개
                                    </p>
                                );
                            }
                            if (totalStock === 0) {
                                return (
                                    <p className="text-red-600 font-bold mb-2 text-xl">
                                        일시 품절 (Sold Out)
                                    </p>
                                );
                            }
                            return (
                                <p className="text-gray-600 font-medium mb-2 text-sm">
                                    재고: {totalStock}개
                                </p>
                            );
                        })()}

                        {/* Time Sale Badge & Pricing */}
                        {(() => {
                            // 종료 시간 계산: endDate를 우선 사용 (종료일 00:00:00에 종료)
                            let endTime: Date;
                            if (timeSale?.endDate) {
                                // endDate가 있으면 해당 날짜의 시작 시간(00:00:00)으로 설정 (종료일 00:00에 종료)
                                endTime = new Date(timeSale.endDate);
                                endTime.setHours(0, 0, 0, 0);
                            } else if (timeSale?.countdownEndTime) {
                                // endDate가 없으면 countdownEndTime 사용 (하위 호환성)
                                const countdownTime = timeSale.countdownEndTime;
                                if (countdownTime instanceof Date) {
                                    endTime = countdownTime;
                                } else if (typeof countdownTime === 'string') {
                                    endTime = new Date(countdownTime);
                                } else if (countdownTime?.toDate) {
                                    endTime = countdownTime.toDate();
                                } else if (countdownTime?.seconds) {
                                    endTime = new Date(countdownTime.seconds * 1000);
                                } else {
                                    endTime = new Date(countdownTime);
                                }
                            } else {
                                endTime = new Date(0); // 과거 날짜로 설정하여 타임세일 비활성화
                            }

                            const isTimeSale = timeSale && product && timeSale.isActive &&
                                timeSale.productIds?.some(id => String(id) === String(product.id)) &&
                                endTime > new Date();

                            if (isTimeSale && timeSale) {
                                const discountedPrice = Math.floor(product.price * (1 - timeSale.discountPercentage / 100));
                                return (
                                    <div className="mb-8">
                                        <div
                                            className="inline-flex items-center gap-2 px-3 py-1 rounded-full mb-3 animate-pulse"
                                            style={{
                                                backgroundColor: timeSale.badgeStyle?.backgroundColor || '#DC2626',
                                                color: timeSale.badgeStyle?.color || '#FFFFFF',
                                                fontSize: '0.875rem',
                                                fontWeight: 'bold'
                                            }}
                                        >
                                            <Clock size={14} />
                                            TIME SALE {timeSale.discountPercentage}% OFF
                                        </div>
                                        <div className="flex items-end gap-3">
                                            <p className="text-3xl md:text-4xl font-serif text-red-600 font-bold">
                                                ₩{discountedPrice.toLocaleString()}
                                            </p>
                                            <p className="text-xl text-gray-400 line-through mb-1">
                                                ₩{product.price.toLocaleString()}
                                            </p>
                                        </div>
                                        <p className="text-sm text-red-500 mt-1">
                                            남은 시간: <CountdownTimer targetDate={endTime} />
                                        </p>
                                    </div>
                                );
                            }

                            return (
                                <p className="text-2xl font-medium text-gray-900 mb-8">₩{product.price.toLocaleString()}</p>
                            );
                        })()}

                        {/* Short Description */}
                        {product.shortDescription ? (
                            <div className="text-sm text-gray-600 mb-8 whitespace-pre-wrap leading-relaxed">
                                {product.shortDescription}
                            </div>
                        ) : (
                            <div className="text-sm text-gray-600 mb-8 space-y-2">
                                <p>• 모던하고 심플한 디자인</p>
                                <p>• 데일리 아이템으로 추천</p>
                                <p>• 알러지 방지 처리 완료</p>
                            </div>
                        )}



                        {/* Options & Quantity */}
                        <div className="border-t border-b border-gray-100 py-6 mb-8">
                            {/* Size Guide Button - Always visible */}
                            <div className="flex justify-end mb-4">
                                <button
                                    onClick={() => setIsSizeGuideOpen(true)}
                                    className="text-sm font-medium text-gray-500 underline hover:text-black flex items-center gap-1.5"
                                >
                                    <Ruler size={16} /> 사이즈 가이드
                                </button>
                            </div>

                            {/* Size Selector - DB 재고가 있는 사이즈만 표시 */}
                            {(() => {
                                // [MY_LOG] sizeColorStock에서 사이즈 추출 또는 product.sizes 사용
                                let allSizes: string[] = [];

                                if (product.sizeColorStock && product.sizeColorStock.length > 0) {
                                    // sizeColorStock에서 고유한 사이즈 추출
                                    allSizes = Array.from(new Set(product.sizeColorStock.map(item => item.size).filter(s => s)));
                                } else if (product.sizes && product.sizes.length > 0) {
                                    allSizes = product.sizes;
                                }

                                // 재고가 있는 사이즈만 필터링
                                let availableSizes = allSizes;

                                if (product.sizeColorStock && product.sizeColorStock.length > 0) {
                                    if (selectedColor) {
                                        // 색상이 선택된 경우, 해당 색상과 조합된 사이즈 중 재고가 있는 것만
                                        availableSizes = allSizes.filter(size => {
                                            const variant = product.sizeColorStock!.find(
                                                item => item.size === size && item.color === selectedColor
                                            );
                                            return variant && variant.quantity > 0;
                                        });
                                    } else {
                                        // 색상이 선택되지 않은 경우, 어떤 색상과든 조합되어 재고가 있는 사이즈만
                                        availableSizes = allSizes.filter(size => {
                                            return product.sizeColorStock!.some(
                                                item => item.size === size && item.quantity > 0
                                            );
                                        });
                                    }
                                } else if (product.stock !== undefined) {
                                    // 일반 재고가 있는 경우에만 사이즈 표시
                                    if (product.stock <= 0) {
                                        availableSizes = [];
                                    }
                                }

                                // 사이즈가 하나도 없으면 표시하지 않음
                                if (allSizes.length === 0) {
                                    return null;
                                }

                                if (availableSizes.length === 0) {
                                    return (
                                        <div className="mb-6">
                                            <span className="text-sm font-medium text-gray-900 mb-2 block">사이즈</span>
                                            <p className="text-sm text-red-600">재고가 있는 사이즈가 없습니다.</p>
                                        </div>
                                    );
                                }

                                return (
                                    <div className="mb-6">
                                        <div className="flex justify-between items-center mb-2">
                                            <span className="text-sm font-medium text-gray-900">사이즈</span>
                                        </div>
                                        <div className="flex flex-wrap gap-2">
                                            {availableSizes.map(size => (
                                                <button
                                                    key={size}
                                                    onClick={() => setSelectedSize(size)}
                                                    className={`min-w-[3rem] px-3 py-2 text-sm border transition ${selectedSize === size
                                                        ? 'border-black bg-black text-white'
                                                        : 'border-gray-200 text-gray-600 hover:border-gray-400'
                                                        }`}
                                                >
                                                    {size}
                                                </button>
                                            ))}
                                        </div>
                                    </div>
                                );
                            })()}

                            {/* Color Selector - DB 재고가 있는 색상만 표시 */}
                            {(() => {
                                // [MY_LOG] sizeColorStock에서 색상 추출 또는 product.colors 사용
                                let allColors: string[] = [];

                                if (product.sizeColorStock && product.sizeColorStock.length > 0) {
                                    // sizeColorStock에서 고유한 색상 추출
                                    allColors = Array.from(new Set(product.sizeColorStock.map(item => item.color).filter(c => c)));
                                } else if (product.colors && product.colors.length > 0) {
                                    allColors = product.colors;
                                }

                                // 재고가 있는 색상만 필터링
                                let availableColors = allColors;

                                if (product.sizeColorStock && product.sizeColorStock.length > 0) {
                                    if (selectedSize) {
                                        // 사이즈가 선택된 경우, 해당 사이즈와 조합된 색상 중 재고가 있는 것만
                                        availableColors = allColors.filter(color => {
                                            const variant = product.sizeColorStock!.find(
                                                item => item.size === selectedSize && item.color === color
                                            );
                                            return variant && variant.quantity > 0;
                                        });
                                    } else {
                                        // 사이즈가 선택되지 않은 경우, 어떤 사이즈와든 조합되어 재고가 있는 색상만
                                        availableColors = allColors.filter(color => {
                                            return product.sizeColorStock!.some(
                                                item => item.color === color && item.quantity > 0
                                            );
                                        });
                                    }
                                } else if (product.stock !== undefined) {
                                    // 일반 재고가 있는 경우에만 색상 표시
                                    if (product.stock <= 0) {
                                        availableColors = [];
                                    }
                                }

                                // 색상이 하나도 없으면 표시하지 않음
                                if (allColors.length === 0) {
                                    return null;
                                }

                                if (availableColors.length === 0) {
                                    return (
                                        <div className="mb-6">
                                            <span className="block text-sm font-medium text-gray-900 mb-2">색상</span>
                                            <p className="text-sm text-red-600">재고가 있는 색상이 없습니다.</p>
                                        </div>
                                    );
                                }

                                return (
                                    <div className="mb-6">
                                        <span className="block text-sm font-medium text-gray-900 mb-2">색상</span>
                                        <div className="flex flex-wrap gap-2">
                                            {availableColors.map(color => (
                                                <button
                                                    key={color}
                                                    onClick={() => setSelectedColor(color)}
                                                    className={`px-4 py-2 text-sm border transition ${selectedColor === color
                                                        ? 'border-black bg-black text-white'
                                                        : 'border-gray-200 text-gray-600 hover:border-gray-400'
                                                        }`}
                                                >
                                                    {color}
                                                </button>
                                            ))}
                                        </div>
                                    </div>
                                );
                            })()}

                            {/* 재고 정보 - 수량 선택기 위쪽 표시 */}
                            {(() => {
                                if (selectedSize && selectedColor && product.sizeColorStock) {
                                    const variantStock = product.sizeColorStock.find(
                                        item => item.size === selectedSize && item.color === selectedColor
                                    )?.quantity || 0;

                                    if (variantStock > 0) {
                                        return (
                                            <div className="mb-4 p-3 bg-gray-50 border border-gray-200 rounded-md">
                                                <div className="flex items-center justify-between">
                                                    <span className="text-sm font-medium text-gray-700">현재 선택 옵션 재고</span>
                                                    <span className={`text-sm font-bold ${variantStock <= 3 ? 'text-red-600' : 'text-gray-900'
                                                        }`}>
                                                        {variantStock}개
                                                    </span>
                                                </div>
                                                {variantStock <= 3 && (
                                                    <p className="text-xs text-red-600 mt-1">품절 임박! 서둘러 주문해주세요.</p>
                                                )}
                                            </div>
                                        );
                                    }
                                } else if (totalStock > 0) {
                                    return (
                                        <div className="mb-4 p-3 bg-gray-50 border border-gray-200 rounded-md">
                                            <div className="flex items-center justify-between">
                                                <span className="text-sm font-medium text-gray-700">전체 재고</span>
                                                <span className={`text-sm font-bold ${totalStock <= 5 ? 'text-red-600' : 'text-gray-900'
                                                    }`}>
                                                    {totalStock}개
                                                </span>
                                            </div>
                                            {totalStock <= 5 && (
                                                <p className="text-xs text-red-600 mt-1">품절 임박! 서둘러 주문해주세요.</p>
                                            )}
                                        </div>
                                    );
                                }
                                return null;
                            })()}

                            <div className="flex items-center justify-between">
                                <span className="text-sm font-medium text-gray-900">수량</span>
                                <div className="flex items-center gap-2">
                                    <div className="flex items-center border border-gray-300">
                                        <button
                                            onClick={() => setQuantity(Math.max(1, quantity - 1))}
                                            className="px-3 py-1 hover:bg-gray-100 transition disabled:opacity-50"
                                            disabled={currentStock === 0 || quantity <= 1}
                                        >-</button>
                                        <span className="px-3 py-1 text-sm font-medium min-w-[2rem] text-center">{quantity}</span>
                                        <button
                                            onClick={() => {
                                                const maxQuantity = currentStock > 0 ? currentStock : totalStock;
                                                setQuantity(Math.min(quantity + 1, maxQuantity));
                                            }}
                                            className="px-3 py-1 hover:bg-gray-100 transition disabled:opacity-50"
                                            disabled={currentStock === 0 || quantity >= currentStock}
                                        >+</button>
                                    </div>
                                    {currentStock > 0 && (
                                        <span className="text-xs text-gray-500">
                                            (최대 {currentStock}개)
                                        </span>
                                    )}
                                </div>
                            </div>
                        </div>

                        {/* Actions */}
                        <div className="flex gap-4 mb-10">
                            {currentStock === 0 ? (
                                <button
                                    onClick={() => setIsRestockModalOpen(true)}
                                    className="flex-1 bg-gray-800 text-white py-4 uppercase tracking-widest text-sm font-medium hover:bg-black transition duration-300"
                                >
                                    재입고 알림 신청
                                </button>
                            ) : (
                                <button
                                    onClick={handleAddToCart}
                                    disabled={currentStock === 0}
                                    className="flex-1 bg-primary text-white py-4 uppercase tracking-widest text-sm font-medium hover:bg-accent transition duration-300 disabled:bg-gray-400 disabled:cursor-not-allowed"
                                >
                                    장바구니 담기
                                </button>
                            )}
                            <button
                                onClick={handleToggleWishlist}
                                className={`p-4 border transition duration-300 ${isWishlisted
                                    ? 'border-red-500 text-red-500 bg-red-50'
                                    : 'border-gray-300 hover:border-red-400 hover:text-red-500'
                                    }`}
                            >
                                <Heart size={20} fill={isWishlisted ? "currentColor" : "none"} />
                            </button>
                        </div>

                        {/* Trust Badges */}
                        <div className="grid grid-cols-2 gap-4 text-xs text-gray-500">
                            <div className="flex items-center gap-2">
                                <Truck size={16} />
                                <span>무료 배송 (5만원 이상)</span>
                            </div>
                            <div className="flex items-center gap-2">
                                <ShieldCheck size={16} />
                                <span>품질 보증 1년</span>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Tabs */}
                <div className="mt-24">
                    <div className="flex border-b border-gray-200 mb-8 justify-center">
                        {['details', 'reviews', 'ootd'].map((tab) => (
                            <button
                                key={tab}
                                onClick={() => setActiveTab(tab as any)}
                                className={`px-8 py-4 text-sm uppercase tracking-widest font-medium transition-all relative ${activeTab === tab
                                    ? 'text-primary'
                                    : 'text-gray-400 hover:text-gray-600'
                                    }`}
                            >
                                {tab === 'details' ? '상세 정보' : tab === 'reviews' ? '리뷰 (0)' : 'Style OOTD'}
                                {activeTab === tab && (
                                    <span className="absolute bottom-0 left-0 w-full h-[2px] bg-primary"></span>
                                )}
                            </button>
                        ))}
                    </div>

                    <div className="max-w-4xl mx-auto py-8 px-4">
                        {activeTab === 'details' && (
                            <div
                                className="prose prose-lg max-w-none text-gray-600 leading-relaxed"
                                style={{ whiteSpace: 'pre-wrap', wordBreak: 'break-word' }}
                                dangerouslySetInnerHTML={{ __html: normalizeDescriptionSpacing(product.description) }}
                            />
                        )}
                        {activeTab === 'reviews' && (
                            <div className="text-center text-gray-500">
                                <p>아직 작성된 리뷰가 없습니다.</p>
                            </div>
                        )}
                        {activeTab === 'ootd' && (
                            <div className="text-center text-gray-500">
                                <p>이 상품을 착용한 스타일링 샷이 없습니다.</p>
                            </div>
                        )}
                    </div>
                </div>

                {/* Related Products */}
                {relatedProducts.length > 0 && (
                    <div className="mt-24 border-t border-gray-100 pt-16">
                        <h3 className="text-2xl font-serif text-center mb-12">Related Products</h3>
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
                            {relatedProducts.map(rp => (
                                <Link to={`/product/${rp.id}`} key={rp.id} className="group">
                                    <div className="aspect-square bg-gray-50 overflow-hidden mb-4 relative">
                                        <img
                                            src={rp.image}
                                            alt={rp.name}
                                            className="w-full h-full object-cover transition duration-500 group-hover:scale-105"
                                        />
                                        {rp.stock === 0 && (
                                            <div className="absolute inset-0 bg-black/30 flex items-center justify-center">
                                                <span className="text-white font-bold text-sm tracking-widest">SOLD OUT</span>
                                            </div>
                                        )}
                                    </div>
                                    <h4 className="font-medium text-gray-900 mb-1 group-hover:text-primary transition">{rp.name}</h4>
                                    <p className="text-sm text-gray-500">₩{rp.price.toLocaleString()}</p>
                                </Link>
                            ))}
                        </div>
                    </div>
                )}
            </div>

            <ConfirmModal
                isOpen={isConfirmModalOpen}
                onClose={() => setIsConfirmModalOpen(false)}
                onConfirm={confirmAddToCart}
                title="장바구니 담기"
                message={`${product.name}을(를) 장바구니에 담으시겠습니까?`}
                confirmLabel="담기"
                isDestructive={false}
            />

            {/* Size Guide Modal */}
            {isSizeGuideOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4" onClick={() => setIsSizeGuideOpen(false)}>
                    <div className="bg-white p-8 max-w-lg w-full rounded-lg shadow-xl relative" onClick={e => e.stopPropagation()}>
                        <button
                            onClick={() => setIsSizeGuideOpen(false)}
                            className="absolute top-4 right-4 text-gray-400 hover:text-black"
                        >
                            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path></svg>
                        </button>
                        <h3 className="text-2xl font-serif mb-6 text-center">사이즈 가이드</h3>
                        <div className="space-y-6 max-h-[60vh] overflow-y-auto pr-2">
                            {/* Ring Guide */}
                            {(product.category === 'ring') && (
                                <div>
                                    <h4 className="font-bold mb-3 border-b pb-2">Ring Size (KR)</h4>
                                    <div className="grid grid-cols-3 gap-2 text-sm text-center">
                                        <div className="bg-gray-50 p-2 rounded">6호 (49mm)</div>
                                        <div className="bg-gray-50 p-2 rounded">7호 (50mm)</div>
                                        <div className="bg-gray-50 p-2 rounded">8호 (51mm)</div>
                                        <div className="bg-gray-50 p-2 rounded">9호 (52mm)</div>
                                        <div className="bg-gray-50 p-2 rounded">10호 (53mm)</div>
                                        <div className="bg-gray-50 p-2 rounded">11호 (54mm)</div>
                                        <div className="bg-gray-50 p-2 rounded">12호 (55mm)</div>
                                        <div className="bg-gray-50 p-2 rounded">13호 (56mm)</div>
                                        <div className="bg-gray-50 p-2 rounded">14호 (57mm)</div>
                                        <div className="bg-gray-50 p-2 rounded">15호 (58mm)</div>
                                        <div className="bg-gray-50 p-2 rounded">16호 (59mm)</div>
                                        <div className="bg-gray-50 p-2 rounded">17호 (60mm)</div>
                                    </div>
                                    <p className="text-xs text-gray-500 mt-2">
                                        * 종이를 띠로 잘라 손가락 둘레를 측정한 후 mm 단위를 확인하세요.
                                    </p>
                                </div>
                            )}

                            {/* Necklace Guide */}
                            {(product.category === 'necklace') && (
                                <div>
                                    <h4 className="font-bold mb-3 border-b pb-2">Necklace Length Guide</h4>
                                    <div className="space-y-3 text-sm">
                                        <div className="flex justify-between items-center border-b border-gray-100 pb-2">
                                            <span className="font-medium">Choker (35-40cm)</span>
                                            <span className="text-gray-500">목에 딱 맞는 길이</span>
                                        </div>
                                        <div className="flex justify-between items-center border-b border-gray-100 pb-2">
                                            <span className="font-medium">Princess (42-45cm)</span>
                                            <span className="text-gray-500">쇄골 라인에 걸치는 기본 길이</span>
                                        </div>
                                        <div className="flex justify-between items-center border-b border-gray-100 pb-2">
                                            <span className="font-medium">Matinee (50-55cm)</span>
                                            <span className="text-gray-500">가슴 윗부분까지 오는 길이</span>
                                        </div>
                                        <div className="flex justify-between items-center border-b border-gray-100 pb-2">
                                            <span className="font-medium">Opera (60cm~)</span>
                                            <span className="text-gray-500">가슴 중앙까지 오는 긴 길이</span>
                                        </div>
                                    </div>
                                </div>
                            )}

                            {/* Bracelet Guide */}
                            {(product.category === 'bracelet') && (
                                <div>
                                    <h4 className="font-bold mb-3 border-b pb-2">Bracelet Size Guide</h4>
                                    <ul className="text-sm space-y-2 text-gray-600">
                                        <li><strong>S (15-16cm)</strong>: 손목이 얇은 체형</li>
                                        <li><strong>M (17-18cm)</strong>: 보통 체형 (가장 대중적)</li>
                                        <li><strong>L (19-20cm)</strong>: 여유 있는 착용감</li>
                                    </ul>
                                    <div className="mt-4 bg-gray-50 p-3 rounded text-xs text-gray-500">
                                        TIP: 손목 가장 튀어나온 뼈 부분의 둘레를 측정한 후 +1.5cm~2cm를 더한 사이즈를 추천드립니다.
                                    </div>
                                </div>
                            )}

                            {/* Earring/Common Guide */}
                            {(product.category !== 'ring' && product.category !== 'necklace' && product.category !== 'bracelet') && (
                                <div>
                                    <h4 className="font-bold mb-3 border-b pb-2">General Size Info</h4>
                                    <p className="text-sm text-gray-600 mb-4">
                                        대부분의 제품은 Free Size로 제작되거나 상세 페이지에 별도 표기된 사이즈를 따릅니다.
                                    </p>
                                    <ul className="text-sm text-gray-600 space-y-2">
                                        <li>• 제품의 소재 특성에 따라 미세한 오차가 있을 수 있습니다.</li>
                                        <li>• 알러지 방지 처리가 되어 있으나, 개인차에 따라 반응이 다를 수 있습니다.</li>
                                    </ul>
                                </div>
                            )}

                            <p className="text-xs text-gray-400 mt-6 pt-4 border-t">
                                * 측정 방법에 따라 1-3mm 정도의 오차가 발생할 수 있습니다.<br />
                                * 정확한 사이즈 측정 후 구매를 권장드립니다.
                            </p>
                        </div>
                    </div>
                </div>
            )}

            {/* Restock Modal */}
            <RestockModal
                isOpen={isRestockModalOpen}
                onClose={() => setIsRestockModalOpen(false)}
                productName={product.name}
            />
        </div>
    );
};

export default ProductDetail;


