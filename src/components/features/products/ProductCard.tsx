import React from 'react';
import { Link } from 'react-router-dom';
import { Product } from '../../../types';
import { Heart, ShoppingBag, Eye } from 'lucide-react';
import { useAuth, useCart } from '../../../contexts';
import { useGlobalModal } from '../../../contexts/GlobalModalContext';
import OptimizedImage from '../../common/OptimizedImage';

interface ProductCardProps {
    product: Product;
    onQuickView?: (product: Product) => void;
}

const ProductCard: React.FC<ProductCardProps> = ({ product, onQuickView }) => {
    const { user, toggleWishlist } = useAuth();
    const { addToCart } = useCart();
    const { showAlert } = useGlobalModal();
    const isWishlisted = user?.wishlist?.includes(product.id);

    const handleWishlistClick = async (e: React.MouseEvent) => {
        e.preventDefault();
        e.stopPropagation();
        if (!user) {
            await showAlert("로그인이 필요한 서비스입니다.", "알림");
            return;
        }
        await toggleWishlist(product.id);
    };

    const handleAddToCart = async (e: React.MouseEvent) => {
        e.preventDefault();
        e.stopPropagation();
        if (product.stock === 0) {
            await showAlert("품절된 상품입니다.", "알림");
            return;
        }
        addToCart(product, 1);
        await showAlert("장바구니에 담겼습니다.", "장바구니");
    };

    const handleQuickView = (e: React.MouseEvent) => {
        e.preventDefault();
        e.stopPropagation();
        if (onQuickView) {
            onQuickView(product);
        }
    };

    return (
        <div className="group relative">
            <Link to={`/product/${product.id}`} className="block relative">
                {/* Image Container with Aspect Ratio */}
                <div className="relative w-full pt-[100%] bg-gray-100 overflow-hidden mb-4">
                    <div className="absolute inset-0 w-full h-full group-hover:scale-110 transition duration-700">
                        <OptimizedImage
                            src={product.image}
                            alt={product.name}
                            className="w-full h-full object-cover"
                        />
                    </div>

                    {/* Badges Container - Matching Homepage New Arrivals Style */}
                    <div className="absolute top-2 left-2 flex flex-col gap-1 z-10">
                        {product.isNew && (
                            <div className="bg-black text-white text-[10px] font-bold px-2 py-1">
                                NEW
                            </div>
                        )}
                        {product.stock !== undefined && product.stock > 0 && product.stock <= 5 && (
                            <div className="bg-red-600 text-white px-2 py-1 text-[10px] font-bold tracking-wider uppercase">
                                Low Stock
                            </div>
                        )}
                    </div>

                    {/* Sold Out Overlay */}
                    {product.stock === 0 && (
                        <div className="absolute inset-0 bg-black/40 z-10 flex items-center justify-center pointer-events-none">
                            <span className="text-white font-bold text-lg tracking-widest uppercase border-2 border-white px-4 py-2 backdrop-blur-sm">
                                Sold Out
                            </span>
                        </div>
                    )}

                    {/* Action Buttons - Right Side */}
                    <div className="absolute top-2 right-2 flex flex-col gap-2 z-20">
                        {/* Wishlist Button */}
                        <button
                            onClick={handleWishlistClick}
                            className={`p-2.5 rounded-full shadow-md transition-all duration-300 ${isWishlisted
                                ? 'bg-red-500 text-white'
                                : 'bg-white/90 text-gray-600 hover:bg-white hover:text-red-500'
                                }`}
                            title={isWishlisted ? "찜 해제" : "찜하기"}
                        >
                            <Heart className={`w-5 h-5 ${isWishlisted ? 'fill-current' : ''}`} />
                        </button>

                        {/* Quick View Button */}
                        {onQuickView && (
                            <button
                                onClick={handleQuickView}
                                className="p-2.5 rounded-full shadow-md transition-all duration-300 bg-white/90 text-gray-600 hover:bg-black hover:text-white"
                                title="미리보기"
                            >
                                <Eye className="w-5 h-5" />
                            </button>
                        )}

                        {/* Cart Button */}
                        <button
                            onClick={handleAddToCart}
                            className="p-2.5 rounded-full shadow-md transition-all duration-300 bg-white/90 text-gray-600 hover:bg-black hover:text-white"
                            title="장바구니 담기"
                        >
                            <ShoppingBag className="w-5 h-5" />
                        </button>
                    </div>
                </div>

                {/* Product Info */}
                <div className="text-center">
                    <h3 className="text-sm text-gray-900 font-medium group-hover:text-gray-600 transition truncate px-2">
                        {product.name}
                    </h3>
                    <p className="mt-1 text-sm font-serif text-gray-900">
                        ₩{product.price.toLocaleString()}
                    </p>
                </div>
            </Link>
        </div>
    );
};

export default ProductCard;



