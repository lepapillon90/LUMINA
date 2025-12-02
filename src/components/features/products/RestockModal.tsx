import React, { useState } from 'react';
import { X, Bell } from 'lucide-react';

interface RestockModalProps {
    isOpen: boolean;
    onClose: () => void;
    productName: string;
}

const RestockModal: React.FC<RestockModalProps> = ({ isOpen, onClose, productName }) => {
    const [email, setEmail] = useState('');
    const [isSubmitted, setIsSubmitted] = useState(false);

    if (!isOpen) return null;

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        // Mock API call
        setTimeout(() => {
            setIsSubmitted(true);
        }, 500);
    };

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
            <div className="bg-white w-full max-w-md p-8 relative shadow-2xl animate-fade-in-up">
                <button
                    onClick={onClose}
                    className="absolute top-4 right-4 text-gray-400 hover:text-black transition"
                >
                    <X size={20} />
                </button>

                {!isSubmitted ? (
                    <>
                        <div className="text-center mb-6">
                            <div className="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                                <Bell size={20} className="text-gray-900" />
                            </div>
                            <h3 className="text-2xl font-serif mb-2">재입고 알림 신청</h3>
                            <p className="text-gray-500 text-sm">
                                <span className="font-medium text-gray-900">{productName}</span> 상품이 재입고되면<br />
                                가장 먼저 알려드리겠습니다.
                            </p>
                        </div>

                        <form onSubmit={handleSubmit} className="space-y-4">
                            <div>
                                <label htmlFor="email" className="block text-xs font-bold uppercase tracking-wider mb-2">Email Address</label>
                                <input
                                    type="email"
                                    id="email"
                                    required
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    placeholder="example@email.com"
                                    className="w-full border border-gray-300 px-4 py-3 text-sm focus:outline-none focus:border-black transition"
                                />
                            </div>
                            <button
                                type="submit"
                                className="w-full bg-black text-white py-4 uppercase tracking-widest text-sm font-medium hover:bg-gray-800 transition duration-300"
                            >
                                알림 받기
                            </button>
                        </form>
                    </>
                ) : (
                    <div className="text-center py-8">
                        <div className="w-16 h-16 bg-green-50 rounded-full flex items-center justify-center mx-auto mb-6">
                            <span className="text-2xl">✨</span>
                        </div>
                        <h3 className="text-2xl font-serif mb-2">신청 완료</h3>
                        <p className="text-gray-500 mb-8">
                            재입고 시 입력하신 이메일로<br />
                            알림을 보내드리겠습니다.
                        </p>
                        <button
                            onClick={onClose}
                            className="w-full border border-black text-black py-3 uppercase tracking-widest text-sm font-medium hover:bg-black hover:text-white transition duration-300"
                        >
                            확인
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
};

export default RestockModal;
