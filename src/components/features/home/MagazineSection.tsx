import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';
import MagazineDetailModal from './MagazineDetailModal';
import { FadeInUp, StaggerFadeIn } from '../../common/AnimatedElements';

interface MagazineSectionProps {
    showViewAll?: boolean;
}

const MagazineSection: React.FC<MagazineSectionProps> = ({ showViewAll = true }) => {
    const [selectedArticle, setSelectedArticle] = useState<any>(null);
    const [isModalOpen, setIsModalOpen] = useState(false);

    const handleArticleClick = (article: any) => {
        setSelectedArticle(article);
        setIsModalOpen(true);
    };

    const articles = [
        {
            id: 1,
            category: "STYLE GUIDE",
            title: "How to Layer Necklaces Like a Pro",
            excerpt: "완벽한 레이어링을 위한 3가지 법칙. 길이와 소재의 조화를 통해 나만의 스타일을 완성해보세요.",
            image: "https://images.unsplash.com/photo-1611591437281-460bfbe1220a?auto=format&fit=crop&q=80&w=600",
            date: "2025.03.10",
            author: "Sarah Kim",
            content: (
                <>
                    <p>
                        목걸이 레이어링은 단순한 액세서리 착용을 넘어 하나의 예술과도 같습니다.
                        잘못하면 엉키고 과해 보일 수 있지만, 몇 가지 원칙만 지킨다면 누구나 세련된 룩을 연출할 수 있습니다.
                    </p>

                    <h3>Rule 1: 길이의 차이를 두세요 (The Cascade Effect)</h3>
                    <p>
                        가장 기본적인 규칙은 서로 다른 길이의 목걸이를 매치하는 것입니다.
                        보통 3개를 레이어링할 때 가장 이상적인 비율은 다음과 같습니다:
                    </p>
                    <ul>
                        <li><strong>초커 (35-40cm):</strong> 목에 딱 붙는 스타일로 베이스가 됩니다.</li>
                        <li><strong>미디엄 (45-50cm):</strong> 펜던트가 있는 디자인으로 포인트를 줍니다.</li>
                        <li><strong>롱 (55cm 이상):</strong> 시선을 아래로 길게 떨어뜨려 우아함을 더합니다.</li>
                    </ul>
                    <img src="https://images.unsplash.com/photo-1599643478518-17488fbbcd75?auto=format&fit=crop&q=80&w=800" alt="Necklace Layering Example" />

                    <h3>Rule 2: 텍스처와 두께를 믹스하세요</h3>
                    <p>
                        모두 같은 굵기의 체인을 하면 자칫 밋밋해 보일 수 있습니다.
                        얇은 스네이크 체인과 볼드한 링크 체인을 섞거나, 진주와 메탈을 함께 매치해보세요.
                        서로 다른 질감이 만나면 훨씬 풍성하고 입체적인 느낌을 줍니다.
                    </p>

                    <h3>Rule 3: 하나의 주인공을 정하세요</h3>
                    <p>
                        모든 목걸이가 화려할 필요는 없습니다. 가장 돋보이고 싶은 '스테이트먼트 피스(Statement Piece)'를 하나 정하고,
                        나머지는 그를 받쳐주는 조연 역할을 하도록 심플한 디자인을 선택하는 것이 좋습니다.
                    </p>
                </>
            )
        },
        {
            id: 2,
            category: "BRAND STORY",
            title: "The Art of Handcrafting",
            excerpt: "루미나의 모든 제품이 탄생하는 과정. 장인의 손길로 완성되는 섬세한 디테일을 만나보세요.",
            image: "https://images.unsplash.com/photo-1573408301185-9146fe634ad0?auto=format&fit=crop&q=80&w=600",
            date: "2025.02.28",
            author: "Lumina Studio",
            content: (
                <>
                    <p>
                        빠르게 소비되는 패스트 패션의 시대, 루미나는 '시간이 빚어내는 가치'를 믿습니다.
                        우리의 모든 주얼리는 서울 성수동의 작은 아틀리에에서 시작됩니다.
                    </p>

                    <h3>1. 영감과 스케치 (Inspiration & Sketch)</h3>
                    <p>
                        디자인 팀은 자연의 곡선, 현대 건축물의 구조, 그리고 빛의 산란에서 영감을 얻습니다.
                        수백 번의 스케치 수정 과정을 거쳐, 착용했을 때 가장 아름다운 라인을 찾아냅니다.
                    </p>
                    <img src="https://images.unsplash.com/photo-1531956531700-dc29e18b90d4?auto=format&fit=crop&q=80&w=800" alt="Jewelry Sketching" />

                    <h3>2. 왁스 카빙과 몰딩 (Wax Carving)</h3>
                    <p>
                        평면의 그림을 입체로 구현하는 과정입니다. 장인은 왁스를 깎아 0.1mm의 오차도 허용하지 않는 정교한 원형을 만듭니다.
                        이 과정에서 주얼리의 착용감과 무게 중심이 결정됩니다.
                    </p>

                    <h3>3. 폴리싱과 세팅 (Polishing & Setting)</h3>
                    <p>
                        주조된 금속은 거친 표면을 가지고 있습니다. 장인의 손끝에서 수천 번의 연마 과정을 거쳐야 비로소 루미나만의 깊은 광택이 완성됩니다.
                        스톤을 물리는 세팅 작업은 가장 고도의 집중력을 요하는 단계로, 현미경을 통해 완벽한 고정을 확인합니다.
                    </p>

                    <p>
                        당신이 착용하는 루미나의 주얼리에는 이 모든 시간과 정성이 담겨 있습니다.
                    </p>
                </>
            )
        },
        {
            id: 3,
            category: "TREND REPORT",
            title: "2025 Jewelry Trends",
            excerpt: "올해 주목해야 할 쥬얼리 트렌드 키워드. 볼드한 골드부터 미니멀한 실버까지.",
            image: "https://images.unsplash.com/photo-1535632066927-ab7c9ab60908?auto=format&fit=crop&q=80&w=600",
            date: "2025.03.01",
            author: "Fashion Week Daily",
            content: (
                <>
                    <p>
                        2025년 쥬얼리 트렌드는 '대담함'과 '개인화'로 요약됩니다.
                        미니멀리즘이 가고, 자신의 개성을 확실하게 드러내는 맥시멀리즘이 돌아왔습니다.
                    </p>

                    <h3>1. Bold Gold (청키한 골드)</h3>
                    <p>
                        80년대를 연상시키는 두껍고 과감한 골드 체인이 런웨이를 장악했습니다.
                        특히 매끄러운 표면보다는 해머링(망치질) 텍스처가 들어간 빈티지한 무드의 골드가 인기입니다.
                    </p>
                    <img src="https://images.unsplash.com/photo-1601121141461-9d6647bca1ed?auto=format&fit=crop&q=80&w=800" alt="Bold Gold Jewelry" />

                    <h3>2. Sculptural Silver (조각 같은 실버)</h3>
                    <p>
                        골드의 강세 속에서도 실버는 쿨하고 지적인 매력으로 자리를 지키고 있습니다.
                        이번 시즌 실버는 유기적인 곡선이 돋보이는 '웨어러블 아트(Wearable Art)' 형태가 주를 이룹니다.
                        마치 몸에 흐르는 듯한 유려한 라인의 뱅글이나 귀걸이를 주목하세요.
                    </p>

                    <h3>3. Colorful Gemstones (컬러의 향연)</h3>
                    <p>
                        다이아몬드뿐만 아니라 에메랄드, 사파이어, 루비 등 유색 보석이 캐주얼한 디자인과 만났습니다.
                        티셔츠나 데님 같은 일상복에 화려한 컬러 젬스톤을 매치하는 '하이-로우(High-Low)' 스타일링이 트렌드입니다.
                    </p>
                </>
            )
        }
    ];

    return (
        <section className="py-16 md:py-24 bg-white">
            <div className="container mx-auto px-6">
                <FadeInUp>
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
                </FadeInUp>

                <StaggerFadeIn childSelector=".magazine-card" stagger={0.15} className="grid grid-cols-1 md:grid-cols-3 gap-8">
                    {articles.map((article) => (
                        <article
                            key={article.id}
                            className="magazine-card group cursor-pointer"
                            onClick={() => handleArticleClick(article)}
                        >
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
                                <button
                                    className="text-xs font-medium underline decoration-gray-300 underline-offset-4 group-hover:text-gray-600 transition text-left w-fit"
                                >
                                    READ MORE
                                </button>
                            </div>
                        </article>
                    ))}
                </StaggerFadeIn>

                {showViewAll && (
                    <FadeInUp delay={0.3}>
                        <div className="mt-10 text-center md:hidden">
                            <Link to="/magazine" className="inline-flex items-center gap-2 text-sm font-medium border-b border-black pb-1">
                                더 많은 매거진 보기 <ArrowRight size={16} />
                            </Link>
                        </div>
                    </FadeInUp>
                )}
            </div>

            <MagazineDetailModal
                article={selectedArticle}
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
            />
        </section>
    );
};

export default MagazineSection;

