import React from 'react';
import { Product } from '../../types';
import { Heart, ShoppingBag } from 'lucide-react';
import { Link } from 'react-router-dom';

interface WishlistProps {
    items: Product[];
    loading: boolean;
}

const Wishlist: React.FC<WishlistProps> = ({ items, loading }) => {
    if (loading) {
        return <div className="text-center py-10 text-gray-500">위시리스트를 불러오는 중...</div>;
    }

    if (items.length === 0) {
        return (
            <div className="text-center py-16 bg-gray-50 rounded-lg border border-gray-100">
                <Heart className="mx-auto h-12 w-12 text-gray-300 mb-4" />
                <p className="text-gray-500">위시리스트가 비어있습니다.</p>
                <Link to="/shop" className="text-primary font-bold underline mt-2 inline-block text-sm hover:text-accent">
                    쇼핑하러 가기
                </Link>
            </div>
        );
    }

    return (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {items.map((product) => (
                <div key={product.id} className="group">
                    <Link to={`/product/${product.id}`} className="block relative aspect-square bg-gray-100 overflow-hidden mb-3 rounded-md">
                        <img
                            src={product.image}
                            alt={product.name}
                            className="w-full h-full object-cover transition duration-500 group-hover:scale-105"
                        />
                        <button className="absolute top-2 right-2 p-2 bg-white/80 rounded-full hover:bg-white text-red-500 transition shadow-sm">
                            <Heart size={16} fill="currentColor" />
                        </button>
                    </Link>
                    <div>
                        <h3 className="text-sm font-medium text-gray-900 truncate">{product.name}</h3>
                        <p className="text-sm text-gray-500 mt-1">₩{product.price.toLocaleString()}</p>
                        <button className="mt-3 w-full flex items-center justify-center gap-2 bg-white border border-gray-200 py-2 text-xs font-medium uppercase tracking-wider hover:bg-gray-50 transition">
                            <ShoppingBag size={14} />
                            Add to Cart
                        </button>
                    </div>
                </div>
            ))}
        </div>
    );
};

export default Wishlist;
