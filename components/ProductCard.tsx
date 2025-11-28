import React from 'react';
import { Product } from '../types';
import { ShoppingBag } from 'lucide-react';
import { useCart } from '../contexts';
import { Link } from 'react-router-dom';

interface ProductCardProps {
  product: Product;
}

const ProductCard: React.FC<ProductCardProps> = ({ product }) => {
  const { addToCart } = useCart();

  const handleImageError = (e: React.SyntheticEvent<HTMLImageElement, Event>) => {
    e.currentTarget.src = "https://via.placeholder.com/400x500?text=No+Image";
  };

  return (
    <div className="group relative flex flex-col">
      <Link to={`/product/${product.id}`} className="block relative w-full pt-[125%] bg-gray-100 mb-4 overflow-hidden cursor-pointer">
        <img
          src={product.image}
          alt={product.name}
          onError={handleImageError}
          className="absolute top-0 left-0 w-full h-full object-cover object-center transition-transform duration-700 group-hover:scale-105"
        />
        {product.isNew && (
          <span className="absolute top-2 left-2 bg-white/90 text-xs font-bold px-2 py-1 uppercase tracking-widest z-10">
            New
          </span>
        )}
      </Link>

      <div className="flex justify-between items-start mb-3">
        <Link to={`/product/${product.id}`} className="block">
          <h3 className="text-sm text-gray-900 font-medium hover:text-gray-600 transition">
            {product.name}
          </h3>
          <p className="mt-1 text-xs text-gray-500 capitalize">{product.category}</p>
        </Link>
        <p className="text-sm font-serif text-gray-900">
          ₩{product.price.toLocaleString()}
        </p>
      </div>

      <button
        onClick={() => addToCart(product)}
        className="w-full bg-primary text-white py-3 text-sm font-medium hover:bg-accent transition-colors flex items-center justify-center gap-2 mt-auto"
      >
        <ShoppingBag size={16} />
        장바구니 담기
      </button>
    </div>
  );
};

export default ProductCard;