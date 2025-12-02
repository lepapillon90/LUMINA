import React, { useRef } from 'react';
import { Star, ChevronLeft, ChevronRight } from 'lucide-react';

const ReviewSlider: React.FC = () => {
    const sliderRef = useRef<HTMLDivElement>(null);

    const reviews = [
        {
            id: 1,
            name: "Sarah K.",
            rating: 5,
            comment: "Absolutely stunning! The quality is amazing and it looks even better in person.",
            image: "https://images.unsplash.com/photo-1515934751635-c81c6bc9a2d8?auto=format&fit=crop&q=80&w=300",
            product: "Signature Necklace"
        },
        {
            id: 2,
            name: "Minji L.",
            rating: 5,
            comment: "데일리로 착용하기 너무 좋아요. 포장도 고급스럽고 배송도 빨랐습니다.",
            image: "https://images.unsplash.com/photo-1535632066927-ab7c9ab60908?auto=format&fit=crop&q=80&w=300",
            product: "Gold Ring"
        },
        {
            id: 3,
            name: "Jessica P.",
            rating: 4,
            comment: "Beautiful design. A bit smaller than expected but very elegant.",
            image: "https://images.unsplash.com/photo-1611591437281-460bfbe1220a?auto=format&fit=crop&q=80&w=300",
            product: "Pearl Earrings"
        },
        {
            id: 4,
            name: "Hyejin K.",
            rating: 5,
            comment: "친구 선물로 샀는데 너무 좋아해요! 재구매 의사 100%입니다.",
            image: "https://images.unsplash.com/photo-1515377905703-c4788e51af15?auto=format&fit=crop&q=80&w=300",
            product: "Silver Bracelet"
        }
    ];

    const scroll = (direction: 'left' | 'right') => {
        if (sliderRef.current) {
            const { current } = sliderRef;
            const scrollAmount = direction === 'left' ? -300 : 300;
            current.scrollBy({ left: scrollAmount, behavior: 'smooth' });
        }
    };

    return (
        <section className="py-20 bg-gray-50">
            <div className="container mx-auto px-6">
                <div className="flex justify-between items-end mb-10">
                    <div>
                        <h2 className="text-3xl font-serif text-primary mb-2">Loved by You</h2>
                        <p className="text-gray-500">고객님들이 직접 남겨주신 소중한 후기</p>
                    </div>
                    <div className="flex gap-2">
                        <button onClick={() => scroll('left')} className="p-2 border border-gray-300 rounded-full hover:bg-white transition">
                            <ChevronLeft size={20} />
                        </button>
                        <button onClick={() => scroll('right')} className="p-2 border border-gray-300 rounded-full hover:bg-white transition">
                            <ChevronRight size={20} />
                        </button>
                    </div>
                </div>

                <div
                    ref={sliderRef}
                    className="flex overflow-x-auto gap-6 pb-8 no-scrollbar snap-x snap-mandatory"
                >
                    {reviews.map((review) => (
                        <div key={review.id} className="min-w-[300px] md:min-w-[350px] bg-white p-4 rounded-lg shadow-sm snap-start flex gap-4">
                            <div className="w-24 h-24 flex-shrink-0 bg-gray-100 rounded overflow-hidden">
                                <img src={review.image} alt="Review" className="w-full h-full object-cover" />
                            </div>
                            <div className="flex flex-col justify-center">
                                <div className="flex text-yellow-400 mb-1">
                                    {[...Array(5)].map((_, i) => (
                                        <Star key={i} size={12} fill={i < review.rating ? "currentColor" : "none"} className={i < review.rating ? "" : "text-gray-300"} />
                                    ))}
                                </div>
                                <p className="text-sm text-gray-800 font-medium line-clamp-2 mb-2">"{review.comment}"</p>
                                <div className="mt-auto">
                                    <p className="text-xs font-bold text-gray-900">{review.name}</p>
                                    <p className="text-[10px] text-gray-500">{review.product}</p>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </section>
    );
};

export default ReviewSlider;
