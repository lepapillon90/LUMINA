import React from 'react';
import { Link } from 'react-router-dom';
import { Product } from '../types';
import { Eye, Heart } from 'lucide-react';
import { useAuth } from '../contexts';
import { useGlobalModal } from '../contexts/GlobalModalContext';

interface ProductCardProps {
    product: Product;
    onQuickView?: (product: Product) => void;
}

const ProductCard: React.FC<ProductCardProps> = ({ product, onQuickView }) => {
    const { user, toggleWishlist } = useAuth();
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

    return (
        <div className="group relative">
            <Link to={`/product/${product.id}`} className="block relative">
                {/* Image Container with Aspect Ratio */}
                <div className="relative w-full pt-[100%] bg-gray-100 overflow-hidden mb-4">
                    <img
                        src={product.image}
                        alt={product.name}
                        onError={(e) => {
                            e.currentTarget.src = "https://via.placeholder.com/400x500?text=No+Image";
                        }}
                        className="absolute top-0 left-0 w-full h-full object-cover transition duration-700 group-hover:scale-110"
                    />
                    {/* Overlay or Badge if needed */}
                    {/* Badges Container */}
                    <div className="absolute top-3 left-3 flex flex-col gap-1 z-10">
                        {product.stock !== undefined && product.stock > 0 && product.stock <= 5 && (
                            <div className="bg-red-600 text-white px-2 py-1 text-[10px] font-bold tracking-widest uppercase shadow-sm">
                                Low Stock
                            </div>
                        )}
                        {product.isNew && (
                            <div className="bg-white/90 px-2 py-1 text-[10px] font-medium tracking-widest uppercase shadow-sm">
                                New
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

                    {/* Wishlist Button - Top Right */}
                    <button
                        onClick={handleWishlistClick}
                        className={`absolute top-3 right-3 p-2 rounded-full shadow-md transition-all duration-300 z-20 ${isWishlisted
                            ? 'bg-red-500 text-white'
                            : 'bg-white/80 text-gray-600 hover:bg-white hover:text-red-500 opacity-0 group-hover:opacity-100'
                            }`}
                        title={isWishlisted ? "Remove from Wishlist" : "Add to Wishlist"}
                    >
                        <Heart className={`w-4 h-4 ${isWishlisted ? 'fill-current' : ''}`} />
                    </button>

                    {/* Quick View Button */}
                    {onQuickView && (
                        <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300 bg-black/10 pointer-events-none">
                            <button
                                onClick={(e) => {
                                    e.preventDefault();
                                    e.stopPropagation();
                                    onQuickView(product);
                                }}
                                className="bg-white text-black p-3 rounded-full shadow-lg hover:bg-gray-100 transform translate-y-4 group-hover:translate-y-0 transition-all duration-300 pointer-events-auto"
                                title="Quick View"
                            >
                                <Eye className="w-5 h-5" />
                            </button>
                        </div>
                    )}
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
