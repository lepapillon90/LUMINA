import React, { useState } from 'react';
import { PRODUCTS } from '../constants';
import ProductCard from '../components/ProductCard';
import SEO from '../components/SEO';

const Shop: React.FC = () => {
  const [filter, setFilter] = useState<'all' | 'earring' | 'necklace' | 'ring' | 'bracelet'>('all');

  const filteredProducts = (filter === 'all' ? [...PRODUCTS] : PRODUCTS.filter(p => p.category === filter))
    .sort((a, b) => (a.isNew === b.isNew ? 0 : a.isNew ? -1 : 1));

  const categories = [
    { id: 'all', label: '전체' },
    { id: 'earring', label: '귀걸이' },
    { id: 'necklace', label: '목걸이' },
    { id: 'ring', label: '반지' },
    { id: 'bracelet', label: '팔찌' }
  ];

  return (
    <div className="pt-24 pb-20 bg-white min-h-screen">
      <SEO title="Shop" description="LUMINA의 모든 컬렉션을 만나보세요." />
      <div className="container mx-auto px-6">
        <h1 className="text-4xl font-serif text-center mb-12">Collection</h1>

        {/* Filters */}
        <div className="flex justify-center flex-wrap gap-4 mb-16">
          {categories.map(cat => (
            <button
              key={cat.id}
              onClick={() => setFilter(cat.id as any)}
              className={`px-6 py-2 text-sm uppercase tracking-wide border rounded-full transition-all ${filter === cat.id
                  ? 'bg-primary text-white border-primary'
                  : 'bg-white text-gray-500 border-gray-200 hover:border-gray-800 hover:text-black'
                }`}
            >
              {cat.label}
            </button>
          ))}
        </div>

        {/* Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
          {filteredProducts.map(product => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>

        {filteredProducts.length === 0 && (
          <div className="text-center text-gray-400 py-20">
            해당 카테고리에 상품이 없습니다.
          </div>
        )}
      </div>
    </div>
  );
};

export default Shop;