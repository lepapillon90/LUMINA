import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Product } from '../../../types';
import { getProducts } from '../../../services/productService';
import { useAuth } from '../../../contexts';

const PersonalizedRecommendation: React.FC = () => {
    const [products, setProducts] = useState<Product[]>([]);
    const { user } = useAuth();
    const [title, setTitle] = useState("Recommended for You");

    useEffect(() => {
        const fetchRecommendations = async () => {
            try {
                // 1. Try to get recently viewed from localStorage
                const recentJson = localStorage.getItem('recentlyViewed');
                let recommendedItems: Product[] = [];

                if (recentJson) {
                    const recentIds = JSON.parse(recentJson) as number[];
                    if (recentIds.length > 0) {
                        const allProducts = await getProducts();
                        // Find products that match recent IDs
                        const viewedProducts = allProducts.filter(p => recentIds.includes(p.id));

                        // Find similar items (same category)
                        if (viewedProducts.length > 0) {
                            const category = viewedProducts[0].category;
                            recommendedItems = allProducts
                                .filter(p => p.category === category && !recentIds.includes(p.id))
                                .slice(0, 4);

                            if (user) {
                                setTitle(`${user.displayName || user.username}님을 위한 추천 아이템`);
                            } else {
                                setTitle("최근 본 상품과 비슷한 스타일");
                            }
                        }
                    }
                }

                // 2. If no recent items or not enough recommendations, show random "Best" items
                if (recommendedItems.length === 0) {
                    const allProducts = await getProducts();
                    // Shuffle and pick 4
                    recommendedItems = allProducts
                        .sort(() => 0.5 - Math.random())
                        .slice(0, 4);
                    setTitle("LUMINA's Pick: 오늘의 추천");
                }

                setProducts(recommendedItems);
            } catch (error) {
                console.error("Failed to fetch recommendations:", error);
            }
        };

        fetchRecommendations();
    }, [user]);

    if (products.length === 0) return null;

    return (
        <section className="py-20 bg-white border-t border-gray-100">
            <div className="container mx-auto px-6">
                <div className="flex items-center justify-between mb-10">
                    <h2 className="text-2xl md:text-3xl font-serif text-primary">{title}</h2>
                    <Link to="/shop" className="text-sm text-gray-500 hover:text-black transition underline">View All</Link>
                </div>

                <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                    {products.map((product) => (
                        <Link key={product.id} to={`/product/${product.id}`} className="group">
                            <div className="relative aspect-[3/4] bg-gray-100 overflow-hidden mb-4 rounded-sm">
                                <img
                                    src={product.image}
                                    alt={product.name}
                                    className="w-full h-full object-cover transition duration-700 group-hover:scale-105"
                                />
                                {product.isNew && (
                                    <span className="absolute top-2 left-2 bg-black text-white text-[10px] px-2 py-1 uppercase tracking-wider">
                                        New
                                    </span>
                                )}
                            </div>
                            <h3 className="text-sm font-medium text-gray-900 group-hover:text-gray-600 transition">
                                {product.name}
                            </h3>
                            <p className="text-sm text-gray-500 mt-1">₩{product.price.toLocaleString()}</p>
                        </Link>
                    ))}
                </div>
            </div>
        </section>
    );
};

export default PersonalizedRecommendation;
