import React, { useState } from 'react';
import { OOTD_POSTS, PRODUCTS } from '../constants';
import { Heart } from 'lucide-react';
import { Link } from 'react-router-dom';
import SEO from '../components/SEO';

const OOTD: React.FC = () => {
  const [hoveredPost, setHoveredPost] = useState<number | null>(null);

  const handleImageError = (e: React.SyntheticEvent<HTMLImageElement, Event>) => {
    e.currentTarget.src = 'https://via.placeholder.com/400x500?text=No+Image';
  };

  return (
    <div className="pt-24 pb-20 bg-white min-h-screen">
      <SEO title="OOTD" description="LUMINA와 함께한 고객님들의 스타일링을 확인해보세요." />
      <div className="container mx-auto px-6 max-w-4xl">
        <div className="text-center mb-16">
          <h1 className="text-4xl font-serif mb-4">#LuminaOOTD</h1>
          <p className="text-gray-500">당신의 빛나는 순간을 공유해주세요. @lumina_official 태그와 함께.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {OOTD_POSTS.map(post => {
            const featuredProducts = PRODUCTS.filter(p => post.productsUsed.includes(p.id));

            return (
              <div key={post.id} className="bg-white border border-gray-100 rounded-lg overflow-hidden shadow-sm hover:shadow-md transition">
                {/* Header */}
                <div className="p-4 flex items-center space-x-3">
                  <div className="w-8 h-8 rounded-full bg-gray-200 flex items-center justify-center text-xs font-bold text-gray-500">
                    {post.user.substring(1, 3).toUpperCase()}
                  </div>
                  <span className="text-sm font-medium">{post.user}</span>
                </div>

                {/* Image */}
                <div className="aspect-[4/5] bg-gray-100 relative">
                  <img
                    src={post.image}
                    alt="OOTD"
                    onError={handleImageError}
                    className="w-full h-full object-cover"
                  />
                </div>

                {/* Actions */}
                <div className="p-4">
                  <div className="flex items-center space-x-2 mb-3">
                    <Heart size={24} className="text-primary cursor-pointer hover:text-red-500 transition" />
                  </div>
                  <div className="text-sm font-bold mb-2">좋아요 {post.likes}개</div>
                  <p className="text-sm text-gray-700 mb-4">
                    <span className="font-bold mr-2">{post.user}</span>
                    {post.caption}
                  </p>

                  {/* Tagged Products */}
                  {featuredProducts.length > 0 && (
                    <div className="border-t border-gray-100 pt-3 mt-2">
                      <p className="text-xs text-gray-400 mb-2 uppercase tracking-wide">함께 착용한 아이템</p>
                      {featuredProducts.map(fp => (
                        <Link
                          to={`/product/${fp.id}`}
                          key={fp.id}
                          className="flex items-center space-x-3 mb-2 p-1 rounded hover:bg-gray-50 transition"
                        >
                          <img
                            src={fp.image}
                            alt={fp.name}
                            onError={handleImageError}
                            className="w-10 h-10 object-cover rounded"
                          />
                          <div className="text-xs">
                            <p className="font-medium text-gray-900 hover:text-primary">{fp.name}</p>
                            <p className="text-gray-500">₩{fp.price.toLocaleString()}</p>
                          </div>
                        </Link>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default OOTD;
