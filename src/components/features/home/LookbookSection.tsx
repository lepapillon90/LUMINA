import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Plus } from 'lucide-react';
import { SlideIn, Parallax } from '../../common/AnimatedElements';

interface Hotspot {
    id: number;
    x: number;
    y: number;
    product: {
        id: number;
        name: string;
        price: number;
        image: string;
    };
}

const LookbookSection: React.FC = () => {
    const [activeHotspot, setActiveHotspot] = useState<number | null>(null);

    // Mock hotspots for the lookbook image
    const hotspots: Hotspot[] = [
        {
            id: 1,
            x: 45,
            y: 30,
            product: {
                id: 101,
                name: "Lumina Signature Necklace",
                price: 125000,
                image: "https://images.unsplash.com/photo-1599643478518-17488fbbcd75?auto=format&fit=crop&q=80&w=200"
            }
        },
        {
            id: 2,
            x: 60,
            y: 65,
            product: {
                id: 102,
                name: "Classic Gold Ring",
                price: 89000,
                image: "https://images.unsplash.com/photo-1605100804763-247f67b3557e?auto=format&fit=crop&q=80&w=200"
            }
        }
    ];

    return (
        <section className="py-24 bg-gray-50 overflow-hidden">
            <div className="container mx-auto px-6">
                <div className="flex flex-col md:flex-row items-center gap-12">
                    {/* Text Content - Slide in from left */}
                    <SlideIn direction="left" className="md:w-1/3 text-center md:text-left">
                        <h2 className="text-3xl md:text-4xl font-serif text-primary mb-6">Winter Lookbook</h2>
                        <p className="text-gray-600 leading-relaxed mb-8">
                            차가운 겨울 공기 속에서도 빛나는 당신을 위한 스타일링.
                            루미나의 윈터 컬렉션으로 우아함을 더해보세요.
                        </p>
                        <Link
                            to="/shop"
                            className="inline-block border-b border-black pb-1 uppercase tracking-widest text-sm hover:text-gray-600 transition"
                        >
                            Shop the Collection
                        </Link>
                    </SlideIn>

                    {/* Interactive Image - with Parallax */}
                    <div className="md:w-2/3 relative w-full aspect-[4/3] md:aspect-[16/9] bg-gray-200 rounded-lg overflow-hidden group">
                        <Parallax speed={0.2} className="absolute inset-0 w-full h-[120%] -top-[10%]">
                            <img
                                src="https://images.unsplash.com/photo-1615655406736-b37c4fabf923?auto=format&fit=crop&q=80&w=1200"
                                alt="Winter Lookbook"
                                className="w-full h-full object-cover"
                            />
                        </Parallax>

                        {/* Hotspots */}
                        {hotspots.map((spot) => (
                            <div
                                key={spot.id}
                                className="absolute"
                                style={{ top: `${spot.y}%`, left: `${spot.x}%` }}
                            >
                                <button
                                    onClick={() => setActiveHotspot(activeHotspot === spot.id ? null : spot.id)}
                                    className="relative w-8 h-8 flex items-center justify-center"
                                >
                                    <span className="absolute inset-0 bg-white rounded-full opacity-50 animate-ping"></span>
                                    <span className="absolute inset-0 bg-white rounded-full shadow-lg flex items-center justify-center transform hover:scale-110 transition">
                                        <Plus size={16} className={`text-primary transition-transform duration-300 ${activeHotspot === spot.id ? 'rotate-45' : ''}`} />
                                    </span>
                                </button>

                                {/* Tooltip */}
                                {activeHotspot === spot.id && (
                                    <div className="absolute top-10 left-1/2 -translate-x-1/2 w-48 bg-white p-3 shadow-xl rounded-lg z-20 animate-fade-in">
                                        <Link to={`/product/${spot.product.id}`} className="flex gap-3 items-center group/item">
                                            <img
                                                src={spot.product.image}
                                                alt={spot.product.name}
                                                className="w-12 h-12 object-cover rounded bg-gray-100"
                                            />
                                            <div className="text-left">
                                                <p className="text-xs font-bold text-gray-900 group-hover/item:text-primary transition line-clamp-1">{spot.product.name}</p>
                                                <p className="text-xs text-gray-500 mt-1">₩{spot.product.price.toLocaleString()}</p>
                                            </div>
                                        </Link>
                                    </div>
                                )}
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </section>
    );
};

export default LookbookSection;
