import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { getProductById, getProductsByCategory } from '../services/productService';
import { Product } from '../types';
import { useCart } from '../contexts';
import { ChevronRight, Star, Truck, ShieldCheck, Heart } from 'lucide-react';
import SEO from '../components/common/SEO';
import Loading from '../components/common/Loading';
import ConfirmModal from '../components/common/ConfirmModal';

const ProductDetail: React.FC = () => {
    const { id } = useParams<{ id: string }>();
    const [product, setProduct] = useState<Product | null>(null);
    const [loading, setLoading] = useState(true);
    const [quantity, setQuantity] = useState(1);
    const [activeTab, setActiveTab] = useState<'details' | 'reviews' | 'ootd'>('details');
    const [selectedImage, setSelectedImage] = useState<string>('');
    const [isConfirmModalOpen, setIsConfirmModalOpen] = useState(false);
    const [relatedProducts, setRelatedProducts] = useState<Product[]>([]);
    const [isSizeGuideOpen, setIsSizeGuideOpen] = useState(false);
    const { addToCart } = useCart();

    useEffect(() => {
        const fetchProduct = async () => {
            if (id) {
                try {
                    const data = await getProductById(parseInt(id));
                    setProduct(data || null);
                    if (data) {
                        setSelectedImage(data.image);
                        // Fetch related products
                        const related = await getProductsByCategory(data.category);
                        setRelatedProducts(related.filter(p => p.id !== data.id).slice(0, 4));

                        // Save to Recently Viewed
                        const stored = localStorage.getItem('recentlyViewed');
                        let recent: Product[] = stored ? JSON.parse(stored) : [];
                        // Remove duplicates
                        recent = recent.filter(p => p.id !== data.id);
                        // Add to front
                        recent.unshift(data);
                        // Limit to 10
                        if (recent.length > 10) recent.pop();
                        localStorage.setItem('recentlyViewed', JSON.stringify(recent));
                    }
                } catch (error) {
                    console.error("Error fetching product:", error);
                } finally {
                    setLoading(false);
                }
            }
        };

        fetchProduct();
    }, [id]);

    const handleAddToCart = () => {
        if (product) {
            setIsConfirmModalOpen(true);
        }
    };

    const confirmAddToCart = () => {
        if (product) {
            addToCart(product, quantity);
            setIsConfirmModalOpen(false);
        }
    };

    const handleRestockRequest = () => {
        const emailInput = prompt("재입고 알림을 받으실 이메일을 입력해주세요:");
        if (emailInput) {
            // In a real app, call emailService.sendRestockRequest(emailInput, product.id)
            alert(`${emailInput}으로 재입고 알림이 신청되었습니다.`);
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

    return (
        <div className="pt-24 pb-20 bg-white min-h-screen">
            <SEO title={product.name} description={product.description} image={product.image} />

            {/* JSON-LD Structured Data */}
            <script type="application/ld+json">
                {JSON.stringify({
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
                        "availability": product.stock > 0 ? "https://schema.org/InStock" : "https://schema.org/OutOfStock"
                    }
                })}
            </script>

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

                        {/* Stock Status */}
                        {product.stock !== undefined && product.stock > 0 && product.stock <= 5 && (
                            <p className="text-red-600 font-bold mb-2 animate-pulse">
                                품절 임박! 남은 수량: {product.stock}개
                            </p>
                        )}
                        {product.stock === 0 && (
                            <p className="text-red-600 font-bold mb-2 text-xl">
                                일시 품절 (Sold Out)
                            </p>
                        )}

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

                        {/* Size Guide Button */}
                        <button
                            onClick={() => setIsSizeGuideOpen(true)}
                            className="text-xs text-gray-500 underline mb-6 hover:text-black"
                        >
                            사이즈 가이드 보기
                        </button>

                        {/* Options & Quantity */}
                        <div className="border-t border-b border-gray-100 py-6 mb-8">
                            <div className="flex items-center justify-between mb-4">
                                <span className="text-sm font-medium text-gray-900">수량</span>
                                <div className="flex items-center border border-gray-300">
                                    <button
                                        onClick={() => setQuantity(Math.max(1, quantity - 1))}
                                        className="px-3 py-1 hover:bg-gray-100 transition disabled:opacity-50"
                                        disabled={product.stock === 0}
                                    >-</button>
                                    <span className="px-3 py-1 text-sm font-medium min-w-[2rem] text-center">{quantity}</span>
                                    <button
                                        onClick={() => setQuantity(quantity + 1)}
                                        className="px-3 py-1 hover:bg-gray-100 transition disabled:opacity-50"
                                        disabled={product.stock === 0}
                                    >+</button>
                                </div>
                            </div>
                        </div>

                        {/* Actions */}
                        <div className="flex gap-4 mb-10">
                            {product.stock === 0 ? (
                                <button
                                    onClick={handleRestockRequest}
                                    className="flex-1 bg-gray-800 text-white py-4 uppercase tracking-widest text-sm font-medium hover:bg-black transition duration-300"
                                >
                                    재입고 알림 신청
                                </button>
                            ) : (
                                <button
                                    onClick={handleAddToCart}
                                    className="flex-1 bg-primary text-white py-4 uppercase tracking-widest text-sm font-medium hover:bg-accent transition duration-300"
                                >
                                    장바구니 담기
                                </button>
                            )}
                            <button className="p-4 border border-gray-300 hover:border-red-400 hover:text-red-500 transition duration-300">
                                <Heart size={20} />
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
        </div>
    );
};

export default ProductDetail;
