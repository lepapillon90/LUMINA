import React from 'react';
import { X } from 'lucide-react';
import { useAuth } from '../../../contexts';
import { PRODUCTS } from '../../../constants';
import ProductCard from './ProductCard';

interface WishlistModalProps {
    isOpen: boolean;
    onClose: () => void;
}

const WishlistModal: React.FC<WishlistModalProps> = ({ isOpen, onClose }) => {
    const { user } = useAuth();

    if (!isOpen) return null;

    const wishlistIds = user?.wishlist || [];
    const wishlistProducts = PRODUCTS.filter(p => wishlistIds.includes(p.id));

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black bg-opacity-50 backdrop-blur-sm animate-fade-in">
            <div className="bg-white rounded-lg shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-hidden flex flex-col animate-slide-up">
                <div className="p-4 border-b flex justify-between items-center">
                    <h2 className="text-xl font-serif font-bold">My Wishlist</h2>
                    <button onClick={onClose} className="text-gray-500 hover:text-black">
                        <X size={24} />
                    </button>
                </div>

                <div className="p-6 overflow-y-auto custom-scrollbar flex-1">
                    {wishlistProducts.length > 0 ? (
                        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                            {wishlistProducts.map(product => (
                                <ProductCard key={product.id} product={product} />
                            ))}
                        </div>
                    ) : (
                        <div className="text-center py-12 text-gray-500">
                            <p>위시리스트가 비어있습니다.</p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default WishlistModal;
