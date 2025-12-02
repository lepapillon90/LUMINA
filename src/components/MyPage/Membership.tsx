import React, { useState } from 'react';
import { User, Gift, CreditCard, Copy, Check } from 'lucide-react';

const Membership: React.FC = () => {
    const [activeTab, setActiveTab] = useState<'coupons' | 'points'>('coupons');
    const [copied, setCopied] = useState(false);
    const inviteCode = "LUMINA2024";

    const handleCopy = () => {
        navigator.clipboard.writeText(inviteCode);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    return (
        <div className="space-y-8">
            {/* Grade Dashboard */}
            <div className="bg-gradient-to-r from-gray-900 to-gray-800 rounded-xl p-8 text-white relative overflow-hidden">
                <div className="relative z-10">
                    <div className="flex justify-between items-start mb-6">
                        <div>
                            <p className="text-gray-400 text-sm mb-1">MEMBERSHIP</p>
                            <h3 className="text-3xl font-serif font-bold">SILVER</h3>
                        </div>
                        <div className="bg-white/10 p-2 rounded-full">
                            <User size={24} />
                        </div>
                    </div>

                    <div className="mb-2 flex justify-between text-sm text-gray-300">
                        <span>다음 등급(GOLD)까지</span>
                        <span>₩150,000 남음</span>
                    </div>
                    <div className="w-full bg-gray-700 rounded-full h-2 mb-6">
                        <div className="bg-primary h-2 rounded-full" style={{ width: '65%' }}></div>
                    </div>

                    <div className="grid grid-cols-3 gap-4 border-t border-gray-700 pt-6">
                        <div className="text-center">
                            <p className="text-gray-400 text-xs mb-1">적립률</p>
                            <p className="font-bold text-lg">2%</p>
                        </div>
                        <div className="text-center border-l border-gray-700">
                            <p className="text-gray-400 text-xs mb-1">보유 쿠폰</p>
                            <p className="font-bold text-lg">3장</p>
                        </div>
                        <div className="text-center border-l border-gray-700">
                            <p className="text-gray-400 text-xs mb-1">포인트</p>
                            <p className="font-bold text-lg">2,500 P</p>
                        </div>
                    </div>
                </div>

                {/* Decorative Circles */}
                <div className="absolute top-0 right-0 -mr-16 -mt-16 w-64 h-64 bg-white/5 rounded-full blur-3xl"></div>
                <div className="absolute bottom-0 left-0 -ml-16 -mb-16 w-64 h-64 bg-primary/20 rounded-full blur-3xl"></div>
            </div>

            {/* Invite Code */}
            <div className="bg-primary/5 border border-primary/20 rounded-lg p-6 flex items-center justify-between">
                <div>
                    <h4 className="font-bold text-primary mb-1">친구 초대하고 5,000P 받기</h4>
                    <p className="text-sm text-gray-600">친구가 내 코드로 가입하면 두 분 모두에게 혜택을 드려요.</p>
                </div>
                <div className="flex items-center gap-2 bg-white px-4 py-2 rounded border border-primary/20">
                    <span className="font-mono font-bold text-gray-800 tracking-wider">{inviteCode}</span>
                    <button onClick={handleCopy} className="text-gray-500 hover:text-primary transition">
                        {copied ? <Check size={18} className="text-green-500" /> : <Copy size={18} />}
                    </button>
                </div>
            </div>

            {/* Tabs */}
            <div>
                <div className="flex border-b border-gray-200 mb-6">
                    <button
                        onClick={() => setActiveTab('coupons')}
                        className={`px-6 py-3 text-sm font-medium transition-colors relative ${activeTab === 'coupons' ? 'text-primary' : 'text-gray-500 hover:text-gray-700'}`}
                    >
                        내 쿠폰함
                        {activeTab === 'coupons' && <span className="absolute bottom-0 left-0 w-full h-[2px] bg-primary"></span>}
                    </button>
                    <button
                        onClick={() => setActiveTab('points')}
                        className={`px-6 py-3 text-sm font-medium transition-colors relative ${activeTab === 'points' ? 'text-primary' : 'text-gray-500 hover:text-gray-700'}`}
                    >
                        포인트 내역
                        {activeTab === 'points' && <span className="absolute bottom-0 left-0 w-full h-[2px] bg-primary"></span>}
                    </button>
                </div>

                {activeTab === 'coupons' && (
                    <div className="grid gap-4">
                        {[1, 2, 3].map((i) => (
                            <div key={i} className="border border-gray-200 rounded-lg p-4 flex justify-between items-center hover:shadow-sm transition">
                                <div className="flex items-center gap-4">
                                    <div className="bg-gray-100 p-3 rounded-full text-gray-500">
                                        <Gift size={24} />
                                    </div>
                                    <div>
                                        <h5 className="font-bold text-gray-900">신규 회원 가입 감사 쿠폰 {i}</h5>
                                        <p className="text-sm text-gray-500">50,000원 이상 구매 시 사용 가능</p>
                                        <p className="text-xs text-primary mt-1">2024.12.31 까지</p>
                                    </div>
                                </div>
                                <div className="text-right">
                                    <span className="block text-2xl font-bold text-primary">10%</span>
                                    <span className="text-xs text-gray-400">OFF</span>
                                </div>
                            </div>
                        ))}
                    </div>
                )}

                {activeTab === 'points' && (
                    <div className="space-y-4">
                        {[1, 2, 3].map((i) => (
                            <div key={i} className="flex justify-between items-center border-b border-gray-50 pb-4 last:border-0">
                                <div className="flex items-center gap-3">
                                    <div className="bg-gray-50 p-2 rounded text-gray-400">
                                        <CreditCard size={16} />
                                    </div>
                                    <div>
                                        <p className="text-sm font-medium text-gray-900">상품 구매 적립</p>
                                        <p className="text-xs text-gray-500">2024.11.{10 + i}</p>
                                    </div>
                                </div>
                                <span className="font-bold text-primary">+500 P</span>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
};

export default Membership;
