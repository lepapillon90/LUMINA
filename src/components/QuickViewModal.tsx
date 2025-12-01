import React from 'react';
import { X, ShoppingBag, Heart } from 'lucide-react';
import { Product } from '../types';
import { Link } from 'react-router-dom';
import { useCart, useAuth } from '../contexts';
import { useGlobalModal } from '../contexts/GlobalModalContext';

interface QuickViewModalProps {
    product: Product;
    onClose: () => void;
}

const QuickViewModal: React.FC<QuickViewModalProps> = ({ product, onClose }) => {
    const { addToCart } = useCart();
    const { user, toggleWishlist } = useAuth();
    const { showAlert } = useGlobalModal();
    const isWishlisted = user?.wishlist?.includes(product.id);

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black bg-opacity-50 backdrop-blur-sm animate-fade-in">
            <div className="bg-white rounded-lg shadow-2xl w-full max-w-4xl overflow-hidden relative flex flex-col md:flex-row animate-slide-up">
                <button
                    onClick={onClose}
                    className="absolute top-4 right-4 text-gray-400 hover:text-black z-10"
                >
                    <X className="w-6 h-6" />
                </button>

                {/* Image Section */}
                <div className="w-full md:w-1/2 h-64 md:h-auto bg-gray-100 relative">
                    <img
                        src={product.image}
                        alt={product.name}
                        className="w-full h-full object-cover"
                    />
                    {/* Badges */}
                    <div className="absolute top-4 left-4 flex flex-col gap-2 z-10">
                        {product.stock !== undefined && product.stock > 0 && product.stock <= 5 && (
                            <span className="bg-red-600 text-white text-xs px-2 py-1 uppercase tracking-wider font-bold shadow-sm">
                                Low Stock
                            </span>
                        )}
                        {product.isNew && (
                            <span className="bg-black text-white text-xs px-2 py-1 uppercase tracking-wider shadow-sm">
                                New
                            </span>
                        )}
                    </div>
                    {product.stock === 0 && (
                        <div className="absolute inset-0 bg-black/40 z-10 flex items-center justify-center">
                            <span className="text-white font-bold text-xl tracking-widest uppercase border-2 border-white px-6 py-3 backdrop-blur-sm">
                                Sold Out
                            </span>
                        </div>
                    )}
                </div>

                {/* Details Section */}
                <div className="w-full md:w-1/2 p-8 flex flex-col justify-center">
                    <div className="mb-2">
                        <span className="text-sm text-gray-500 uppercase tracking-wide">{product.category}</span>
                    </div>
                    <h2 className="text-3xl font-serif mb-4">{product.name}</h2>
                    <p className="text-xl font-medium mb-6">₩{product.price.toLocaleString()}</p>

                    <p className="text-gray-600 mb-8 leading-relaxed">
                        {product.description}
                    </p>

                    {/* Stock Status Text */}
                    {product.stock !== undefined && product.stock > 0 && product.stock <= 5 && (
                        <p className="text-red-600 font-bold mb-4 animate-pulse">
                            Only {product.stock} left in stock!
                        </p>
                    )}

                    <div className="space-y-4">
                        <div className="flex space-x-4">
                            <button
                                onClick={() => {
                                    addToCart(product);
                                    onClose();
                                }}
                                disabled={product.stock === 0}
                                className={`flex-1 py-3 px-6 flex items-center justify-center space-x-2 transition-colors ${product.stock === 0
                                    ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                                    : 'bg-black text-white hover:bg-gray-800'
                                    }`}
                            >
                                <ShoppingBag className="w-5 h-5" />
                                <span>{product.stock === 0 ? 'Sold Out' : 'Add to Cart'}</span>
                            </button>
                            <button
                                onClick={async () => {
                                    if (!user) {
                                        await showAlert("로그인이 필요한 서비스입니다.", "알림");
                                        return;
                                    }
                                    toggleWishlist(product.id);
                                }}
                                className={`p-3 border rounded-md hover:bg-gray-50 transition ${isWishlisted ? 'text-red-500 border-red-500' : 'text-gray-400 border-gray-300'}`}
                                title={isWishlisted ? "Remove from Wishlist" : "Add to Wishlist"}
                            >
                                <Heart className={`w-5 h-5 ${isWishlisted ? 'fill-current' : ''}`} />
                            </button>
                        </div>

                        <Link
                            to={`/product/${product.id}`}
                            className="block text-center text-sm text-gray-500 hover:text-black underline"
                            onClick={onClose}
                        >
                            View Full Details
                        </Link>
                    </div>

                    {/* Additional Info */}
                    <div className="mt-8 pt-6 border-t border-gray-100 grid grid-cols-2 gap-4 text-sm">
                        <div>
                            <span className="text-gray-500 block">Material</span>
                            <span className="font-medium">{product.material || 'N/A'}</span>
                        </div>
                        <div>
                            <span className="text-gray-500 block">Color</span>
                            <span className="font-medium">{product.colors?.join(', ') || 'N/A'}</span>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default QuickViewModal;
