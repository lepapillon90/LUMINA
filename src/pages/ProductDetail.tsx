import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { getProductById } from '../services/productService';
import { Product } from '../types';
import { useCart } from '../contexts';
import { ChevronRight, Star, Truck, ShieldCheck, Heart } from 'lucide-react';
import SEO from '../components/SEO';
import Loading from '../components/Loading';

const ProductDetail: React.FC = () => {
    const { id } = useParams<{ id: string }>();
    const [product, setProduct] = useState<Product | null>(null);
    const [loading, setLoading] = useState(true);
    const [quantity, setQuantity] = useState(1);
    const [activeTab, setActiveTab] = useState<'details' | 'reviews' | 'ootd'>('details');
    const { addToCart } = useCart();

    useEffect(() => {
        const fetchProduct = async () => {
            if (id) {
                try {
                    const data = await getProductById(parseInt(id));
                    setProduct(data || null);

                    setProduct(data || null);
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
            addToCart(product, quantity);
            alert(`${product.name}이(가) 장바구니에 담겼습니다.`);
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

    return (
        <div className="pt-24 pb-20 bg-white min-h-screen">
            <SEO title={product.name} description={product.description} image={product.image} />

            <div className="container mx-auto px-6">
                {/* Breadcrumb */}
                <div className="flex items-center text-sm text-gray-500 mb-8 font-light">
                    <Link to="/" className="hover:text-black">Home</Link>
                    <ChevronRight size={14} className="mx-2" />
                    <Link to="/shop" className="hover:text-black">Shop</Link>
                    <ChevronRight size={14} className="mx-2" />
                    <span className="text-black font-medium">{product.name}</span>
                </div>

                <div className="flex flex-col lg:flex-row gap-12 lg:gap-20">
                    {/* Left: Gallery */}
                    <div className="lg:w-1/2">
                        <div className="relative aspect-[4/5] bg-gray-100 overflow-hidden mb-4">
                            <img
                                src={product.image}
                                alt={product.name}
                                className="w-full h-full object-cover"
                                onError={(e) => e.currentTarget.src = "https://via.placeholder.com/600x750?text=No+Image"}
                            />
                        </div>
                        {/* Thumbnails (Mock) */}
                        <div className="flex gap-4 overflow-x-auto">
                            {[product.image, product.image, product.image].map((img, idx) => (
                                <div key={idx} className="w-20 h-24 bg-gray-100 cursor-pointer opacity-70 hover:opacity-100 transition">
                                    <img src={img} alt="Thumbnail" className="w-full h-full object-cover" />
                                </div>
                            ))}
                        </div>
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

                        <p className="text-xl font-medium text-gray-900 mb-6">₩{product.price.toLocaleString()}</p>

                        <div
                            className="prose prose-sm text-gray-600 mb-8 leading-relaxed max-w-none"
                            dangerouslySetInnerHTML={{ __html: product.description }}
                        />

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
                            <button
                                onClick={handleAddToCart}
                                disabled={product.stock === 0}
                                className={`flex-1 text-white py-4 uppercase tracking-widest text-sm font-medium transition duration-300 ${product.stock === 0
                                    ? 'bg-gray-300 cursor-not-allowed'
                                    : 'bg-primary hover:bg-accent'
                                    }`}
                            >
                                {product.stock === 0 ? '품절 (Sold Out)' : '장바구니 담기'}
                            </button>
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

                    <div className="max-w-3xl mx-auto py-8">
                        {activeTab === 'details' && (
                            <div className="text-center text-gray-600 leading-loose">
                                <p>상품의 상세한 정보가 이곳에 표시됩니다.</p>
                                <p>소재, 사이즈, 관리 방법 등...</p>
                            </div>
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
            </div>


        </div>

    );
};

export default ProductDetail;
