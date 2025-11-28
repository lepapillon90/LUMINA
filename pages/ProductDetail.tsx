
import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { PRODUCTS, OOTD_POSTS } from '../constants';
import { useCart } from '../App';
import { Star, ShoppingBag, Truck, ShieldCheck, Heart, Minus, Plus } from 'lucide-react';
import SEO from '../components/SEO';

// Mock Data for extended view
const MOCK_REVIEWS = [
  { id: 1, user: "김민지", rating: 5, date: "2023-11-20", comment: "실물이 훨씬 예뻐요! 배송도 빠르고 포장도 고급스럽습니다." },
  { id: 2, user: "이서연", rating: 4, date: "2023-11-18", comment: "데일리로 착용하기 딱 좋습니다. 약간 무게감은 있어요." },
  { id: 3, user: "박지은", rating: 5, date: "2023-11-15", comment: "친구 선물로 줬는데 너무 좋아하네요. 재구매 의사 있습니다!" },
];

const ProductDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const { addToCart } = useCart();
  const [selectedImage, setSelectedImage] = useState<string>('');
  const [activeTab, setActiveTab] = useState<'desc' | 'reviews' | 'ootd'>('desc');
  const [quantity, setQuantity] = useState(1);

  // Exception Handling: Check if ID is a valid number
  const productId = Number(id);
  const isValidId = !isNaN(productId);

  const product = isValidId ? PRODUCTS.find(p => p.id === productId) : undefined;

  // Filter OOTD posts that use this product
  const relatedOOTDs = product ? OOTD_POSTS.filter(post => post.productsUsed.includes(product.id)) : [];

  // Additional mock images based on the main image
  const images = product ? [
    product.image,
    `https://picsum.photos/400/500?random=${product.id + 100}`,
    `https://picsum.photos/400/500?random=${product.id + 200}`,
    `https://picsum.photos/400/500?random=${product.id + 300}`
  ] : [];

  useEffect(() => {
    if (images.length > 0) {
      setSelectedImage(images[0]);
    }
  }, [id, product]);

  const handleImageError = (e: React.SyntheticEvent<HTMLImageElement, Event>) => {
    e.currentTarget.src = "https://via.placeholder.com/400x500?text=No+Image";
  };

  const handleQuantityChange = (delta: number) => {
    setQuantity(prev => Math.max(1, prev + delta));
  };

  if (!isValidId || !product) {
    return (
      <div className="pt-32 pb-20 min-h-screen flex flex-col items-center justify-center bg-gray-50">
        <SEO title="Product Not Found" />
        <div className="text-center p-8 bg-white shadow-lg rounded-lg">
          <h2 className="text-2xl font-serif mb-4 text-gray-800">상품을 찾을 수 없습니다.</h2>
          <p className="text-gray-500 mb-6">요청하신 상품이 존재하지 않거나 삭제되었습니다.</p>
          <Link to="/shop" className="inline-block px-6 py-2 bg-primary text-white text-sm hover:bg-black transition">
            쇼핑몰로 돌아가기
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="pt-24 pb-20 bg-white min-h-screen">
      <SEO title={product.name} description={product.description} image={product.image} />
      <div className="container mx-auto px-6 max-w-6xl">
        {/* Breadcrumb */}
        <div className="flex items-center text-xs text-gray-500 mb-8 uppercase tracking-wider">
          <Link to="/" className="hover:text-black">HOME</Link>
          <span className="mx-2">/</span>
          <Link to="/shop" className="hover:text-black">SHOP</Link>
          <span className="mx-2">/</span>
          <span className="text-black font-medium">{product.name}</span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-12 lg:gap-20">
          {/* Left: Gallery */}
          <div>
            <div className="aspect-[4/5] bg-gray-100 overflow-hidden mb-4 border border-gray-100 relative">
              <img
                src={selectedImage}
                alt={product.name}
                onError={handleImageError}
                className="w-full h-full object-cover"
              />
            </div>
            <div className="grid grid-cols-4 gap-6">
              {images.map((img, idx) => (
                <div
                  key={idx}
                  onClick={() => setSelectedImage(img)}
                  className={`aspect-[4/5] bg-gray-100 cursor-pointer overflow-hidden border-2 transition-all ${selectedImage === img ? 'border-primary' : 'border-transparent hover:border-gray-200'}`}
                >
                  <img
                    src={img}
                    alt={`View ${idx}`}
                    onError={handleImageError}
                    className="w-full h-full object-cover"
                  />
                </div>
              ))}
            </div>
          </div>

          {/* Right: Info */}
          <div className="flex flex-col">
            <h1 className="text-3xl md:text-4xl font-serif font-bold text-gray-900 mb-4">{product.name}</h1>

            <div className="flex items-center space-x-4 mb-6">
              <span className="text-2xl font-serif text-gray-900">
                ₩{product.price.toLocaleString()}
              </span>
              <div className="flex items-center text-yellow-500 text-sm">
                <Star size={16} fill="currentColor" />
                <Star size={16} fill="currentColor" />
                <Star size={16} fill="currentColor" />
                <Star size={16} fill="currentColor" />
                <Star size={16} fill="currentColor" className="text-gray-300" />
                <span className="text-gray-400 ml-2">(12개 리뷰)</span>
              </div>
            </div>

            <p className="text-gray-600 leading-relaxed mb-8">
              {product.description} <br />
              루미나의 모든 제품은 장인의 손길을 거쳐 세심하게 제작됩니다.
              일상 속에서 은은하게 빛나는 우아함을 경험해보세요.
            </p>

            <div className="space-y-4 mb-8 text-sm text-gray-600">
              <div className="flex items-center space-x-3">
                <ShieldCheck size={18} className="text-gray-400" />
                <span>1년 무상 A/S 보증</span>
              </div>
              <div className="flex items-center space-x-3">
                <Truck size={18} className="text-gray-400" />
                <span>5만원 이상 무료 배송</span>
              </div>
            </div>

            {/* Quantity Selector */}
            <div className="flex items-center mb-6">
              <span className="text-sm font-bold text-gray-700 mr-4">수량</span>
              <div className="flex items-center border border-gray-300 rounded-sm">
                <button
                  onClick={() => handleQuantityChange(-1)}
                  disabled={quantity <= 1}
                  className="p-2.5 hover:bg-gray-50 text-gray-600 disabled:opacity-30 disabled:hover:bg-transparent"
                >
                  <Minus size={16} />
                </button>
                <span className="px-4 py-2 text-sm font-medium min-w-[3rem] text-center">{quantity}</span>
                <button
                  onClick={() => handleQuantityChange(1)}
                  className="p-2.5 hover:bg-gray-50 text-gray-600"
                >
                  <Plus size={16} />
                </button>
              </div>
            </div>

            <button
              onClick={() => addToCart(product, quantity)}
              className="w-full bg-primary text-white py-4 text-sm uppercase tracking-widest font-bold hover:bg-black transition flex items-center justify-center gap-2 mb-4"
            >
              <ShoppingBag size={18} />
              장바구니 담기
            </button>

            <div className="border-t border-gray-100 pt-8 mt-auto">
              <h3 className="font-serif font-bold mb-3">Material & Care</h3>
              <p className="text-xs text-gray-500 leading-normal">
                소재: 14K Gold Plated / Sterling Silver 925 / Freshwater Pearl <br />
                관리법: 착용 후 부드러운 천으로 닦아 보관해주세요. 습기와 땀에 주의하시면 더 오래 아름다움을 유지할 수 있습니다.
              </p>
            </div>
          </div>
        </div>

        {/* Bottom: Tabs */}
        <div className="mt-24 border-t border-gray-200 pt-10">
          <div className="flex justify-center flex-wrap gap-8 mb-10 border-b border-gray-100 pb-4">
            <button
              onClick={() => setActiveTab('desc')}
              className={`pb-2 text-sm uppercase tracking-widest transition relative ${activeTab === 'desc' ? 'text-primary font-bold' : 'text-gray-400 hover:text-gray-600'}`}
            >
              상세 정보
              {activeTab === 'desc' && <span className="absolute bottom-[-17px] left-0 w-full h-[2px] bg-primary"></span>}
            </button>
            <button
              onClick={() => setActiveTab('reviews')}
              className={`pb-2 text-sm uppercase tracking-widest transition relative ${activeTab === 'reviews' ? 'text-primary font-bold' : 'text-gray-400 hover:text-gray-600'}`}
            >
              고객 리뷰 ({MOCK_REVIEWS.length})
              {activeTab === 'reviews' && <span className="absolute bottom-[-17px] left-0 w-full h-[2px] bg-primary"></span>}
            </button>
            <button
              onClick={() => setActiveTab('ootd')}
              className={`pb-2 text-sm uppercase tracking-widest transition relative ${activeTab === 'ootd' ? 'text-primary font-bold' : 'text-gray-400 hover:text-gray-600'}`}
            >
              스타일링 OOTD ({relatedOOTDs.length})
              {activeTab === 'ootd' && <span className="absolute bottom-[-17px] left-0 w-full h-[2px] bg-primary"></span>}
            </button>
          </div>

          {activeTab === 'desc' && (
            <div className="max-w-3xl mx-auto text-center animate-fadeIn">
              <p className="text-gray-600 leading-loose mb-10">
                LUMINA의 디자인 철학은 '본연의 빛'에서 시작됩니다. <br />
                과하지 않은 디자인으로 당신이 가진 고유의 분위기를 해치지 않으면서도, <br />
                결정적인 순간에 시선을 사로잡는 포인트가 되어줍니다.
              </p>
              <div className="grid grid-cols-2 gap-4">
                <img
                  src={`https://picsum.photos/400/300?random=${product.id + 50}`}
                  alt="Detail 1"
                  onError={handleImageError}
                  className="w-full h-64 object-cover"
                />
                <img
                  src={`https://picsum.photos/400/300?random=${product.id + 60}`}
                  alt="Detail 2"
                  onError={handleImageError}
                  className="w-full h-64 object-cover"
                />
              </div>
            </div>
          )}

          {activeTab === 'reviews' && (
            <div className="max-w-3xl mx-auto animate-fadeIn">
              <div className="space-y-8">
                {MOCK_REVIEWS.map(review => (
                  <div key={review.id} className="border-b border-gray-100 pb-8 last:border-0">
                    <div className="flex justify-between items-start mb-2">
                      <div className="flex items-center space-x-2">
                        <span className="font-bold text-sm">{review.user}</span>
                        <div className="flex text-yellow-500">
                          {[...Array(5)].map((_, i) => (
                            <Star key={i} size={12} fill={i < review.rating ? "currentColor" : "none"} className={i >= review.rating ? "text-gray-300" : ""} />
                          ))}
                        </div>
                      </div>
                      <span className="text-xs text-gray-400">{review.date}</span>
                    </div>
                    <p className="text-gray-600 text-sm">{review.comment}</p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {activeTab === 'ootd' && (
            <div className="max-w-4xl mx-auto animate-fadeIn">
              {relatedOOTDs.length > 0 ? (
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                  {relatedOOTDs.map(post => (
                    <div key={post.id} className="relative group aspect-square bg-gray-100 overflow-hidden cursor-pointer">
                      <img
                        src={post.image}
                        alt={post.caption}
                        onError={handleImageError}
                        className="w-full h-full object-cover transition duration-500 group-hover:scale-110"
                      />
                      <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition flex flex-col items-center justify-center text-white p-4 text-center">
                        <div className="flex items-center space-x-1 mb-2">
                          <Heart size={20} fill="white" className="text-white" />
                          <span className="font-bold text-lg">{post.likes}</span>
                        </div>
                        <span className="text-sm font-medium border-t border-white/50 pt-2 w-full truncate">@{post.user}</span>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-12 bg-gray-50 rounded-lg border border-gray-100">
                  <Heart size={32} className="mx-auto text-gray-300 mb-4" />
                  <p className="text-gray-500">이 제품으로 등록된 OOTD가 아직 없습니다.</p>
                  <Link to="/ootd" className="text-primary font-bold underline mt-2 inline-block text-sm hover:text-accent">
                    가장 먼저 스타일을 공유해보세요!
                  </Link>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ProductDetail;
