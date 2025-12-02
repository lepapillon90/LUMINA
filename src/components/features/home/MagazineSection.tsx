import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';

interface MagazineSectionProps {
    showViewAll?: boolean;
}

const MagazineSection: React.FC<MagazineSectionProps> = ({ showViewAll = true }) => {
    const articles = [
        {
            id: 1,
            category: "STYLE GUIDE",
            title: "How to Layer Necklaces Like a Pro",
            excerpt: "완벽한 레이어링을 위한 3가지 법칙. 길이와 소재의 조화를 통해 나만의 스타일을 완성해보세요.",
            image: "https://images.unsplash.com/photo-1611591437281-460bfbe1220a?auto=format&fit=crop&q=80&w=600",
            link: "/blog/layering-guide"
        },
        {
            id: 2,
            category: "BRAND STORY",
            title: "The Art of Handcrafting",
            excerpt: "루미나의 모든 제품이 탄생하는 과정. 장인의 손길로 완성되는 섬세한 디테일을 만나보세요.",
            image: "https://images.unsplash.com/photo-1573408301185-9146fe634ad0?auto=format&fit=crop&q=80&w=600",
            link: "/blog/craftsmanship"
        },
        {
            id: 3,
            category: "TREND REPORT",
            title: "2025 Jewelry Trends",
            excerpt: "올해 주목해야 할 쥬얼리 트렌드 키워드. 볼드한 골드부터 미니멀한 실버까지.",
            image: "https://images.unsplash.com/photo-1535632066927-ab7c9ab60908?auto=format&fit=crop&q=80&w=600",
            link: "/blog/trends-2025"
        }
    ];

    return (
        <section className="py-16 md:py-24 bg-white">
            <div className="container mx-auto px-6">
                <div className="flex justify-between items-end mb-12">
                    <div>
                        <h2 className="text-3xl font-serif text-primary mb-2">Lumina Magazine</h2>
                        <p className="text-gray-500">스타일링 팁부터 브랜드 스토리까지</p>
                    </div>
                    {showViewAll && (
                        <Link to="/magazine" className="hidden md:flex items-center gap-2 text-sm font-medium hover:gap-3 transition-all">
                            더 보기 <ArrowRight size={16} />
                        </Link>
                    )}
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                    {articles.map((article) => (
                        <article key={article.id} className="group cursor-pointer">
                            <div className="overflow-hidden rounded-lg mb-6 aspect-[4/3]">
                                <img
                                    src={article.image}
                                    alt={article.title}
                                    className="w-full h-full object-cover transition duration-700 group-hover:scale-105"
                                />
                            </div>
                            <div className="flex flex-col">
                                <span className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">{article.category}</span>
                                <h3 className="text-xl font-serif text-primary mb-3 group-hover:text-gray-600 transition">{article.title}</h3>
                                <p className="text-gray-500 text-sm leading-relaxed mb-4 line-clamp-2">{article.excerpt}</p>
                                <span className="text-xs font-medium underline decoration-gray-300 underline-offset-4 group-hover:text-gray-600 transition">READ MORE</span>
                            </div>
                        </article>
                    ))}
                </div>

                {showViewAll && (
                    <div className="mt-10 text-center md:hidden">
                        <Link to="/magazine" className="inline-flex items-center gap-2 text-sm font-medium border-b border-black pb-1">
                            더 많은 매거진 보기 <ArrowRight size={16} />
                        </Link>
                    </div>
                )}
            </div>
        </section>
    );
};

export default MagazineSection;
