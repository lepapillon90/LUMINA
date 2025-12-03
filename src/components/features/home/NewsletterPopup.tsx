import React, { useState, useEffect } from 'react';
import { X, Mail } from 'lucide-react';

interface NewsletterPopupProps {
    forceShow?: boolean;
}

const NewsletterPopup: React.FC<NewsletterPopupProps> = ({ forceShow = false }) => {
    const [isVisible, setIsVisible] = useState(forceShow);
    const [email, setEmail] = useState('');
    const [error, setError] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [isSubmitted, setIsSubmitted] = useState(false);

    useEffect(() => {
        if (forceShow) {
            setIsVisible(true);
            return;
        }

        // Check if already seen in this session
        const hasSeen = sessionStorage.getItem('newsletter_popup_seen');
        if (!hasSeen) {
            // Show after 3 seconds
            const timer = setTimeout(() => {
                setIsVisible(true);
            }, 3000);
            return () => clearTimeout(timer);
        }
    }, [forceShow]);

    const handleClose = () => {
        setIsVisible(false);
        sessionStorage.setItem('newsletter_popup_seen', 'true');
    };

    // 이메일 유효성 검증 함수
    const validateEmail = (emailValue: string): string | null => {
        const trimmedEmail = emailValue.trim();

        if (!trimmedEmail) {
            return '이메일을 입력해주세요.';
        }

        if (trimmedEmail.length > 50) {
            return '이메일은 50자 이하여야 합니다.';
        }

        // 이메일 형식 검증 (더 상세한 정규식)
        const emailRegex = /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)*$/;
        if (!emailRegex.test(trimmedEmail)) {
            return '유효한 이메일 주소 형식으로 입력해주세요.';
        }

        // 도메인 부분 검증
        const parts = trimmedEmail.split('@');
        if (parts.length !== 2) {
            return '유효한 이메일 주소 형식으로 입력해주세요.';
        }

        const domain = parts[1];
        if (!domain || domain.length > 253) {
            return '유효한 이메일 주소 형식으로 입력해주세요.';
        }

        return null;
    };

    const handleEmailChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const value = e.target.value;
        // 최대 길이 제한
        if (value.length <= 50) {
            setEmail(value);
        }
        // 에러가 있으면 입력 시 제거
        if (error) {
            setError('');
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');

        const trimmedEmail = email.trim();
        setEmail(trimmedEmail);

        // 유효성 검증
        const validationError = validateEmail(trimmedEmail);
        if (validationError) {
            setError(validationError);
            return;
        }

        try {
            setIsLoading(true);

            // TODO: 실제 구독 API 연동
            // 현재는 Mock 구독 (실제 구현 시 Firebase Firestore나 백엔드 API 연동)
            await new Promise(resolve => setTimeout(resolve, 1000)); // API 호출 시뮬레이션

            // 구독 성공
            setIsSubmitted(true);

            // 3초 후 자동으로 닫기
            setTimeout(() => {
                handleClose();
            }, 3000);
        } catch (err: any) {
            console.error("[MY_LOG] Newsletter subscription error:", err);
            setError('구독 처리 중 오류가 발생했습니다. 잠시 후 다시 시도해주세요.');
        } finally {
            setIsLoading(false);
        }
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
                        src="https://images.unsplash.com/photo-1515562141207-7a88fb7ce338?auto=format&fit=crop&q=80&w=600"
                        alt="Premium Jewelry"
                        className="w-full h-full object-cover"
                    />
                </div>

                {/* Content Side */}
                <div className="w-full md:w-1/2 p-8 md:p-10 flex flex-col justify-center text-center md:text-left">
                    {!isSubmitted ? (
                        <>
                            <h3 className="text-2xl font-serif text-primary mb-2">Join the Club</h3>
                            <p className="text-gray-600 mb-6 text-sm leading-relaxed">
                                루미나 뉴스레터를 구독하고 첫 구매 <span className="font-bold text-black">10% 할인 쿠폰</span>을 받으세요.
                                신상품 소식과 시크릿 세일 정보를 가장 먼저 알려드립니다.
                            </p>

                            {error && (
                                <div className="mb-3 p-3 bg-red-50 border border-red-200 rounded text-red-600 text-xs text-center">
                                    {error}
                                </div>
                            )}

                            <form onSubmit={handleSubmit} className="space-y-3">
                                <div className="relative">
                                    <Mail size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                                    <input
                                        type="email"
                                        placeholder="이메일 주소를 입력하세요"
                                        value={email}
                                        onChange={handleEmailChange}
                                        maxLength={50}
                                        className={`w-full pl-10 pr-4 py-3 border rounded focus:outline-none focus:border-black text-sm ${error ? 'border-red-500' : 'border-gray-200'
                                            }`}
                                        disabled={isLoading}
                                        required
                                    />
                                </div>
                                <button
                                    type="submit"
                                    disabled={isLoading || !email.trim()}
                                    className="w-full bg-black text-white py-3 rounded font-medium text-sm hover:bg-gray-800 transition disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                    {isLoading ? '구독 처리 중...' : '구독하고 혜택 받기'}
                                </button>
                            </form>

                            <button
                                onClick={handleClose}
                                disabled={isLoading}
                                className="mt-4 text-xs text-gray-400 underline hover:text-gray-600 disabled:opacity-50"
                            >
                                괜찮습니다, 다음에 할게요
                            </button>
                        </>
                    ) : (
                        <div className="text-center py-4">
                            <div className="mb-4 text-green-600">
                                <p className="font-medium text-lg mb-2">✓ 구독 완료!</p>
                                <p className="text-sm text-gray-600">
                                    구독해주셔서 감사합니다!<br />
                                    10% 할인 쿠폰이 <strong>{email}</strong>로 발송되었습니다.
                                </p>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default NewsletterPopup;
