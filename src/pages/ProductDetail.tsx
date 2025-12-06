import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { getProductById, getProductsByCategory } from '../services/productService';
import { Product } from '../types';
import { useCart, useAuth, useGlobalModal } from '../contexts';
import { ChevronRight, Star, Truck, ShieldCheck, Heart } from 'lucide-react';
import SEO from '../components/common/SEO';
import Loading from '../components/common/Loading';
import ReactGA from 'react-ga4';
import ConfirmModal from '../components/common/ConfirmModal';
import { doc, onSnapshot } from 'firebase/firestore';
import { db } from '../firebase';

import RestockModal from '../components/features/products/RestockModal';

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

    const isWishlisted = product && user?.wishlist?.includes(product.id);

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

    // [MY_LOG] 사이즈/색상 선택 시 재고에 맞춰 수량 자동 조정
    useEffect(() => {
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

                        <p className="text-2xl font-medium text-gray-900 mb-8">₩{product.price.toLocaleString()}</p>

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
                            {/* Size Selector */}
                            {product.sizes && product.sizes.length > 0 && (
                                <div className="mb-6">
                                    <div className="flex justify-between items-center mb-2">
                                        <span className="text-sm font-medium text-gray-900">사이즈</span>
                                        <button
                                            onClick={() => setIsSizeGuideOpen(true)}
                                            className="text-xs text-gray-500 underline hover:text-black"
                                        >
                                            사이즈 가이드
                                        </button>
                                    </div>
                                    <div className="flex flex-wrap gap-2">
                                        {product.sizes.map(size => {
                                            // Check availability
                                            let isAvailable = true;
                                            if (product.sizeColorStock && product.sizeColorStock.length > 0) {
                                                if (selectedColor) {
                                                    // If color is selected, check specific combination
                                                    const variant = product.sizeColorStock.find(item => item.size === size && item.color === selectedColor);
                                                    isAvailable = variant ? variant.quantity > 0 : false;
                                                } else {
                                                    // If no color selected, check if size exists in any quantity
                                                    isAvailable = product.sizeColorStock.some(item => item.size === size && item.quantity > 0);
                                                }
                                            }

                                            return (
                                                <button
                                                    key={size}
                                                    onClick={() => isAvailable && setSelectedSize(size)}
                                                    disabled={!isAvailable}
                                                    className={`min-w-[3rem] px-3 py-2 text-sm border transition ${!isAvailable
                                                            ? 'border-red-200 text-red-300 bg-red-50 cursor-not-allowed decoration-red-300 line-through'
                                                            : selectedSize === size
                                                                ? 'border-black bg-black text-white'
                                                                : 'border-gray-200 text-gray-600 hover:border-gray-400'
                                                        }`}
                                                >
                                                    {size}
                                                </button>
                                            );
                                        })}
                                    </div>
                                </div>
                            )}

                            {/* Color Selector */}
                            {product.colors && product.colors.length > 0 && (
                                <div className="mb-6">
                                    <span className="block text-sm font-medium text-gray-900 mb-2">색상</span>
                                    <div className="flex flex-wrap gap-2">
                                        {product.colors.map(color => {
                                            // Check availability
                                            let isAvailable = true;
                                            if (product.sizeColorStock && product.sizeColorStock.length > 0) {
                                                if (selectedSize) {
                                                    // If size is selected, check specific combination
                                                    const variant = product.sizeColorStock.find(item => item.size === selectedSize && item.color === color);
                                                    isAvailable = variant ? variant.quantity > 0 : false;
                                                } else {
                                                    // If no size selected, check if color exists in any quantity
                                                    isAvailable = product.sizeColorStock.some(item => item.color === color && item.quantity > 0);
                                                }
                                            }

                                            return (
                                                <button
                                                    key={color}
                                                    onClick={() => isAvailable && setSelectedColor(color)}
                                                    disabled={!isAvailable}
                                                    className={`px-4 py-2 text-sm border transition ${!isAvailable
                                                            ? 'border-red-200 text-red-300 bg-red-50 cursor-not-allowed decoration-red-300 line-through'
                                                            : selectedColor === color
                                                                ? 'border-black bg-black text-white'
                                                                : 'border-gray-200 text-gray-600 hover:border-gray-400'
                                                        }`}
                                                >
                                                    {color}
                                                </button>
                                            );
                                        })}
                                    </div>
                                </div>
                            )}

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
                                dangerouslySetInnerHTML={{ __html: product.description }}
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
                        <h3 className="text-2xl font-serif mb-6 text-center">Size Guide</h3>
                        <div className="space-y-6">
                            <div>
                                <h4 className="font-bold mb-2 border-b pb-1">Ring Size (KR)</h4>
                                <div className="grid grid-cols-2 gap-4 text-sm">
                                    <div className="flex justify-between"><span>6호</span><span>49mm</span></div>
                                    <div className="flex justify-between"><span>7호</span><span>50mm</span></div>
                                    <div className="flex justify-between"><span>8호</span><span>51mm</span></div>
                                    <div className="flex justify-between"><span>9호</span><span>52mm</span></div>
                                    <div className="flex justify-between"><span>10호</span><span>53mm</span></div>
                                    <div className="flex justify-between"><span>11호</span><span>54mm</span></div>
                                    <div className="flex justify-between"><span>12호</span><span>55mm</span></div>
                                    <div className="flex justify-between"><span>13호</span><span>56mm</span></div>
                                </div>
                            </div>
                            <div>
                                <h4 className="font-bold mb-2 border-b pb-1">Necklace Length</h4>
                                <ul className="text-sm space-y-1">
                                    <li>• 40cm: 쇄골 라인 (Choker)</li>
                                    <li>• 42cm: 기본 길이 (Princess)</li>
                                    <li>• 45cm: 여유로운 길이 (Matinee)</li>
                                    <li>• 50cm: 가슴 윗선 (Opera)</li>
                                </ul>
                            </div>
                            <p className="text-xs text-gray-500 mt-4">* 측정 방법에 따라 1-2mm 오차가 있을 수 있습니다.</p>
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


