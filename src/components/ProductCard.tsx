import React from 'react';
import { Link } from 'react-router-dom';
import { Product } from '../types';

interface ProductCardProps {
    product: Product;
}

const ProductCard: React.FC<ProductCardProps> = ({ product }) => {
    return (
        <div className="group cursor-pointer">
            <Link to={`/product/${product.id}`} className="block relative">
                {/* Image Container with Aspect Ratio */}
                <div className="relative w-full pt-[125%] bg-gray-100 overflow-hidden mb-4">
                    <img
                        src={product.image}
                        alt={product.name}
                        onError={(e) => {
                            e.currentTarget.src = "https://via.placeholder.com/400x500?text=No+Image";
                        }}
                        className="absolute top-0 left-0 w-full h-full object-cover transition duration-700 group-hover:scale-110"
                    />
                    {/* Overlay or Badge if needed */}
                    {product.isNew && (
                        <div className="absolute top-3 left-3 bg-white/90 px-2 py-1 text-[10px] font-medium tracking-widest uppercase">
                            New
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
