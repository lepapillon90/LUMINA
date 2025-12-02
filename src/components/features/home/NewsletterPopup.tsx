import React, { useState, useEffect } from 'react';
import { X, Mail } from 'lucide-react';

const NewsletterPopup: React.FC = () => {
    const [isVisible, setIsVisible] = useState(false);
    const [email, setEmail] = useState('');

    useEffect(() => {
        // Check if already seen in this session
        const hasSeen = sessionStorage.getItem('newsletter_popup_seen');
        if (!hasSeen) {
            // Show after 3 seconds
            const timer = setTimeout(() => {
                setIsVisible(true);
            }, 3000);
            return () => clearTimeout(timer);
        }
    }, []);

    const handleClose = () => {
        setIsVisible(false);
        sessionStorage.setItem('newsletter_popup_seen', 'true');
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!email) return;

        // Mock subscription
        alert(`구독해주셔서 감사합니다! 10% 할인 쿠폰이 ${email}로 발송되었습니다.`);
        handleClose();
    };

    if (!isVisible) return null;

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-fade-in">
            <div className="bg-white w-full max-w-md md:max-w-2xl rounded-lg overflow-hidden shadow-2xl flex flex-col md:flex-row relative">
                <button
                    onClick={handleClose}
                    className="absolute top-4 right-4 text-gray-400 hover:text-black z-10"
                >
                    <X size={24} />
                </button>

                {/* Image Side */}
                <div className="hidden md:block w-1/2 bg-gray-100">
                    <img
                        src="https://images.unsplash.com/photo-1576016770956-debb63d92058?auto=format&fit=crop&q=80&w=600"
                        alt="Newsletter"
                        className="w-full h-full object-cover"
                    />
                </div>

                {/* Content Side */}
                <div className="w-full md:w-1/2 p-8 md:p-10 flex flex-col justify-center text-center md:text-left">
                    <h3 className="text-2xl font-serif text-primary mb-2">Join the Club</h3>
                    <p className="text-gray-600 mb-6 text-sm leading-relaxed">
                        루미나 뉴스레터를 구독하고 첫 구매 <span className="font-bold text-black">10% 할인 쿠폰</span>을 받으세요.
                        신상품 소식과 시크릿 세일 정보를 가장 먼저 알려드립니다.
                    </p>

                    <form onSubmit={handleSubmit} className="space-y-3">
                        <div className="relative">
                            <Mail size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                            <input
                                type="email"
                                placeholder="이메일 주소를 입력하세요"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded focus:outline-none focus:border-black text-sm"
                                required
                            />
                        </div>
                        <button
                            type="submit"
                            className="w-full bg-black text-white py-3 rounded font-medium text-sm hover:bg-gray-800 transition"
                        >
                            구독하고 혜택 받기
                        </button>
                    </form>

                    <button
                        onClick={handleClose}
                        className="mt-4 text-xs text-gray-400 underline hover:text-gray-600"
                    >
                        괜찮습니다, 다음에 할게요
                    </button>
                </div>
            </div>
        </div>
    );
};

export default NewsletterPopup;
