import React, { useState } from 'react';
import { PRODUCTS } from '../constants';
import ProductCard from './ProductCard';

const tags = ["#베스트셀러", "#선물추천", "#데일리 아이템", "#MD's PICK"];

const RecommendedSection: React.FC = () => {
    const [activeTag, setActiveTag] = useState<string>(tags[0]);

    const filteredProducts = PRODUCTS.filter(product =>
        product.tags?.includes(activeTag)
    ).slice(0, 4); // Show up to 4 items

    return (
        <section className="py-20 bg-white">
            <div className="container mx-auto px-6">
                <div className="flex flex-col lg:flex-row gap-12">
                    {/* Sidebar Area */}
                    <div className="lg:w-1/4">
                        <h2 className="text-3xl md:text-4xl font-serif text-primary mb-3">Curated for You</h2>
                        <p className="text-gray-600 mb-8">
                            당신의 스타일을 완성할 완벽한 아이템을 찾아보세요
                        </p>

                        <div className="flex flex-row flex-nowrap lg:flex-col gap-2 lg:gap-4 overflow-x-auto no-scrollbar pb-2 lg:pb-0">
                            {tags.map((tag) => (
                                <button
                                    key={tag}
                                    onClick={() => setActiveTag(tag)}
                                    className={`text-sm md:text-base py-2 px-4 transition-colors duration-300 rounded-full lg:rounded-none whitespace-nowrap ${activeTag === tag
                                        ? 'bg-gray-100 font-medium text-black'
                                        : 'text-gray-400 hover:text-gray-600'
                                        } lg:text-left text-center`}
                                >
                                    {tag}
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Product Grid Area */}
                    <div className="lg:w-3/4">
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                            {filteredProducts.map((product) => (
                                <ProductCard key={product.id} product={product} />
                            ))}
                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
};

export default RecommendedSection;
