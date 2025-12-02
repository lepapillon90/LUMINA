import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Clock } from 'lucide-react';

const TimeSale: React.FC = () => {
    const [timeLeft, setTimeLeft] = useState({ hours: 0, minutes: 0, seconds: 0 });

    useEffect(() => {
        // Set deadline to midnight tonight
        const now = new Date();
        const deadline = new Date(now);
        deadline.setHours(24, 0, 0, 0);

        const timer = setInterval(() => {
            const currentTime = new Date();
            const difference = deadline.getTime() - currentTime.getTime();

            if (difference <= 0) {
                // Reset for next day simulation
                deadline.setDate(deadline.getDate() + 1);
            } else {
                const hours = Math.floor((difference / (1000 * 60 * 60)) % 24);
                const minutes = Math.floor((difference / 1000 / 60) % 60);
                const seconds = Math.floor((difference / 1000) % 60);
                setTimeLeft({ hours, minutes, seconds });
            }
        }, 1000);

        return () => clearInterval(timer);
    }, []);

    return (
        <section className="py-12 md:py-16 bg-black text-white">
            <div className="container mx-auto px-6">
                <div className="flex flex-col md:flex-row items-center justify-between gap-8">

                    {/* Text & Timer */}
                    <div className="flex-1 text-center md:text-left">
                        <div className="inline-flex items-center gap-2 bg-red-600 text-white text-xs font-bold px-3 py-1 rounded-full mb-4 animate-pulse">
                            <Clock size={12} /> LIMITED TIME OFFER
                        </div>
                        <h2 className="text-3xl md:text-4xl font-serif mb-4">Flash Sale: 24 Hours Only</h2>
                        <p className="text-gray-400 mb-8 max-w-md">
                            오늘 자정까지만 진행되는 특별한 혜택.
                            엄선된 베스트셀러 아이템을 최대 30% 할인된 가격으로 만나보세요.
                        </p>

                        <div className="flex items-center justify-center md:justify-start gap-4 text-center">
                            <div>
                                <div className="bg-gray-800 w-12 h-12 md:w-16 md:h-16 rounded-lg flex items-center justify-center text-xl md:text-2xl font-bold font-mono mb-2">
                                    {String(timeLeft.hours).padStart(2, '0')}
                                </div>
                                <span className="text-[10px] md:text-xs text-gray-500 uppercase">Hours</span>
                            </div>
                            <span className="text-xl md:text-2xl font-bold -mt-6">:</span>
                            <div>
                                <div className="bg-gray-800 w-12 h-12 md:w-16 md:h-16 rounded-lg flex items-center justify-center text-xl md:text-2xl font-bold font-mono mb-2">
                                    {String(timeLeft.minutes).padStart(2, '0')}
                                </div>
                                <span className="text-[10px] md:text-xs text-gray-500 uppercase">Mins</span>
                            </div>
                            <span className="text-xl md:text-2xl font-bold -mt-6">:</span>
                            <div>
                                <div className="bg-gray-800 w-12 h-12 md:w-16 md:h-16 rounded-lg flex items-center justify-center text-xl md:text-2xl font-bold font-mono mb-2 text-red-500">
                                    {String(timeLeft.seconds).padStart(2, '0')}
                                </div>
                                <span className="text-[10px] md:text-xs text-gray-500 uppercase">Secs</span>
                            </div>
                        </div>
                    </div>

                    {/* Product Preview */}
                    <div className="flex-1 w-full max-w-lg">
                        <div className="bg-white/10 backdrop-blur-sm p-6 rounded-xl border border-white/10 flex items-center gap-6">
                            <div className="w-32 h-32 bg-gray-800 rounded-lg overflow-hidden flex-shrink-0">
                                <img src="https://images.unsplash.com/photo-1602173574767-37ac01994b2a?auto=format&fit=crop&q=80&w=300" alt="Sale Item" className="w-full h-full object-cover" />
                            </div>
                            <div>
                                <h3 className="text-xl font-medium mb-2">Midnight Collection Set</h3>
                                <div className="flex items-center gap-3 mb-4">
                                    <span className="text-gray-400 line-through">₩250,000</span>
                                    <span className="text-2xl font-bold text-white">₩175,000</span>
                                </div>
                                <Link to="/shop" className="inline-block bg-white text-black px-6 py-2 rounded font-medium text-sm hover:bg-gray-200 transition">
                                    Shop Now
                                </Link>
                            </div>
                        </div>
                    </div>

                </div>
            </div>
        </section>
    );
};

export default TimeSale;
