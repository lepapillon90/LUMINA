import React, { useEffect, useState } from 'react';
import { Product } from '../../types';
import { Link } from 'react-router-dom';
import { Clock } from 'lucide-react';

const RecentlyViewed: React.FC = () => {
    const [products, setProducts] = useState<Product[]>([]);

    useEffect(() => {
        const stored = localStorage.getItem('recentlyViewed');
        if (stored) {
            try {
                setProducts(JSON.parse(stored));
            } catch (e) {
                console.error("Failed to parse recently viewed products", e);
            }
        }
    }, []);

    const handleImageError = (e: React.SyntheticEvent<HTMLImageElement, Event>) => {
        e.currentTarget.src = "https://via.placeholder.com/400x500?text=No+Image";
    };

    if (products.length === 0) {
        return (
            <div className="text-center py-16 bg-gray-50 rounded-lg border border-gray-100">
                <Clock className="mx-auto h-12 w-12 text-gray-300 mb-4" />
                <p className="text-gray-500">최근 본 상품이 없습니다.</p>
                <Link to="/shop" className="text-primary font-bold underline mt-2 inline-block text-sm hover:text-accent">
                    쇼핑하러 가기
                </Link>
            </div>
        );
    }

    return (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {products.map((product) => (
                <Link key={product.id} to={`/product/${product.id}`} className="group block">
                    <div className="aspect-square bg-gray-100 overflow-hidden mb-3 rounded-md relative">
                        <img
                            src={product.image}
                            alt={product.name}
                            onError={handleImageError}
                            className="w-full h-full object-cover transition duration-500 group-hover:scale-105"
                        />
                        {product.isNew && (
                            <span className="absolute top-2 left-2 bg-black text-white text-[10px] px-2 py-1 uppercase tracking-wider">
                                New
                            </span>
                        )}
                    </div>
                    <div>
                        <h3 className="text-sm font-medium text-gray-900 group-hover:text-primary transition-colors truncate">
                            {product.name}
                        </h3>
                        <p className="text-sm text-gray-500 mt-1">₩{product.price.toLocaleString()}</p>
                    </div>
                </Link>
            ))}
        </div>
    );
};

export default RecentlyViewed;
