import React from 'react';
import { Link } from 'react-router-dom';
import { OOTD_POSTS } from '../../../constants';
import { Heart, ArrowRight } from 'lucide-react';
import { FadeInUp, StaggerFadeIn } from '../../common/AnimatedElements';

const TrendingOOTDSection: React.FC = () => {
    // Sort by likes descending and take top 3
    const trendingPosts = [...OOTD_POSTS]
        .sort((a, b) => b.likes - a.likes)
        .slice(0, 3);

    const handleImageError = (e: React.SyntheticEvent<HTMLImageElement, Event>) => {
        e.currentTarget.src = 'https://via.placeholder.com/400x500?text=No+Image';
    };

    return (
        <section className="py-16 bg-gray-50">
            <div className="container mx-auto px-6">
                <FadeInUp>
                    <div className="flex justify-between items-end mb-8">
                        <div>
                            <h2 className="text-3xl md:text-4xl font-serif text-primary mb-3">Trending OOTD</h2>
                            <p className="text-gray-500 font-light">지금 가장 사랑받는 스타일을 만나보세요</p>
                        </div>
                        <Link
                            to="/ootd"
                            className="hidden md:flex items-center text-sm font-medium text-gray-900 hover:text-primary transition group"
                        >
                            더 보기
                            <ArrowRight size={16} className="ml-2 transform group-hover:translate-x-1 transition" />
                        </Link>
                    </div>
                </FadeInUp>

                <StaggerFadeIn childSelector=".ootd-card" stagger={0.12} className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    {trendingPosts.map((post, index) => (
                        <Link
                            to="/ootd"
                            key={post.id}
                            className="ootd-card group block bg-white rounded-lg overflow-hidden shadow-sm hover:shadow-md transition-all duration-300 hover:-translate-y-1"
                        >
                            <div className="relative aspect-[4/5] overflow-hidden">
                                <img
                                    src={post.image}
                                    alt={`Trending OOTD by ${post.user}`}
                                    onError={handleImageError}
                                    className="w-full h-full object-cover transition duration-700 group-hover:scale-105"
                                />
                                <div className="absolute top-4 left-4 bg-white/90 backdrop-blur-sm px-3 py-1 rounded-full text-xs font-bold shadow-sm">
                                    #{index + 1} Trending
                                </div>
                                <div className="absolute bottom-0 left-0 w-full p-4 bg-gradient-to-t from-black/60 to-transparent text-white opacity-0 group-hover:opacity-100 transition duration-300">
                                    <p className="text-sm font-medium truncate">{post.caption}</p>
                                </div>
                            </div>

                            <div className="p-4 flex items-center justify-between">
                                <div className="flex items-center space-x-2">
                                    <div className="w-6 h-6 rounded-full bg-gray-100 flex items-center justify-center text-[10px] font-bold text-gray-500">
                                        {post.user.substring(1, 3).toUpperCase()}
                                    </div>
                                    <span className="text-sm font-medium text-gray-700">{post.user}</span>
                                </div>
                                <div className="flex items-center text-red-500 space-x-1">
                                    <Heart size={16} className="fill-current" />
                                    <span className="text-sm font-bold">{post.likes}</span>
                                </div>
                            </div>
                        </Link>
                    ))}
                </StaggerFadeIn>

                <FadeInUp delay={0.3}>
                    <div className="mt-8 text-center md:hidden">
                        <Link
                            to="/ootd"
                            className="inline-flex items-center text-sm font-medium text-gray-900 hover:text-primary transition"
                        >
                            더 많은 스타일 보기
                            <ArrowRight size={16} className="ml-2" />
                        </Link>
                    </div>
                </FadeInUp>
            </div>
        </section>
    );
};

export default TrendingOOTDSection;

