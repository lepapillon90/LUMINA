import React, { useState, useEffect } from 'react';
import { User, Gift, CreditCard, Copy, Check } from 'lucide-react';
import { useAuth } from '../../contexts';
import { useGlobalModal } from '../../contexts/GlobalModalContext';
import { 
    getUserMembershipInfo, 
    getUserCoupons, 
    getPointHistory, 
    getOrCreateInviteCode,
    getMembershipTier 
} from '../../services/membershipService';
import { Coupon, PointHistory } from '../../types';

const Membership: React.FC = () => {
    const { user } = useAuth();
    const { showAlert } = useGlobalModal();
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState<'coupons' | 'points'>('coupons');
    const [copied, setCopied] = useState(false);
    
    // 멤버십 정보
    const [membershipInfo, setMembershipInfo] = useState<{
        grade: string;
        gradeName: string;
        totalSpent: number;
        points: number;
        discountRate: number;
        nextTierInfo: {
            nextGrade: string;
            nextGradeName: string;
            remainingAmount: number;
            progress: number;
        } | null;
    } | null>(null);
    
    // 초대 코드
    const [inviteCode, setInviteCode] = useState<string>('');
    
    // 쿠폰 및 포인트 내역
    const [coupons, setCoupons] = useState<Coupon[]>([]);
    const [pointHistory, setPointHistory] = useState<PointHistory[]>([]);

    useEffect(() => {
        if (user?.uid) {
            loadMembershipData();
        }
    }, [user?.uid]);

    const loadMembershipData = async () => {
        if (!user?.uid) return;

        try {
            setLoading(true);
            
            // 멤버십 정보 로드
            const membership = await getUserMembershipInfo(user.uid);
            if (membership) {
                setMembershipInfo(membership);
            }
            
            // 초대 코드 로드 또는 생성
            if (user.username) {
                const code = await getOrCreateInviteCode(user.uid, user.username);
                setInviteCode(code);
            }
            
            // 쿠폰 로드
            const userCoupons = await getUserCoupons(user.uid);
            setCoupons(userCoupons);
            
            // 포인트 내역 로드
            const history = await getPointHistory(user.uid);
            setPointHistory(history);
        } catch (error) {
            console.error('[MY_LOG] Error loading membership data:', error);
            await showAlert("멤버십 정보를 불러오는 중 오류가 발생했습니다.", "오류");
        } finally {
            setLoading(false);
        }
    };

    const handleCopy = () => {
        if (inviteCode) {
            navigator.clipboard.writeText(inviteCode);
            setCopied(true);
            setTimeout(() => setCopied(false), 2000);
        }
    };

    const formatDate = (dateString: string | any): string => {
        if (!dateString) return '';
        
        let date: Date;
        if (dateString.toDate) {
            date = dateString.toDate();
        } else if (dateString instanceof Date) {
            date = dateString;
        } else {
            date = new Date(dateString);
        }
        
        return date.toLocaleDateString('ko-KR', {
            year: 'numeric',
            month: '2-digit',
            day: '2-digit'
        }).replace(/\./g, '.').replace(/\s/g, '');
    };

    if (loading) {
        return (
            <div className="text-center py-10 text-gray-500">
                멤버십 정보를 불러오는 중...
            </div>
        );
    }

    if (!membershipInfo) {
        return (
            <div className="text-center py-10 text-gray-500">
                멤버십 정보를 불러올 수 없습니다.
            </div>
        );
    }

    const progress = membershipInfo.nextTierInfo 
        ? Math.min(100, Math.max(0, membershipInfo.nextTierInfo.progress))
        : 100;

    return (
        <div className="space-y-8">
            {/* Grade Dashboard */}
            <div className="bg-gradient-to-r from-gray-900 to-gray-800 rounded-xl p-8 text-white relative overflow-hidden">
                <div className="relative z-10">
                    <div className="flex justify-between items-start mb-6">
                        <div>
                            <p className="text-gray-400 text-sm mb-1">MEMBERSHIP</p>
                            <h3 className="text-3xl font-serif font-bold">{membershipInfo.grade}</h3>
                        </div>
                        <div className="bg-white/10 p-2 rounded-full">
                            <User size={24} />
                        </div>
                    </div>

                    {membershipInfo.nextTierInfo && (
                        <>
                            <div className="mb-2 flex justify-between text-sm text-gray-300">
                                <span>다음 등급({membershipInfo.nextTierInfo.nextGradeName})까지</span>
                                <span>₩{membershipInfo.nextTierInfo.remainingAmount.toLocaleString()} 남음</span>
                            </div>
                            <div className="w-full bg-gray-700 rounded-full h-2 mb-6">
                                <div 
                                    className="bg-primary h-2 rounded-full transition-all duration-300" 
                                    style={{ width: `${progress}%` }}
                                ></div>
                            </div>
                        </>
                    )}

                    {!membershipInfo.nextTierInfo && (
                        <div className="mb-6 text-sm text-gray-300">
                            최고 등급입니다!
                        </div>
                    )}

                    <div className="grid grid-cols-3 gap-4 border-t border-gray-700 pt-6">
                        <div className="text-center">
                            <p className="text-gray-400 text-xs mb-1">적립률</p>
                            <p className="font-bold text-lg">{membershipInfo.discountRate}%</p>
                        </div>
                        <div className="text-center border-l border-gray-700">
                            <p className="text-gray-400 text-xs mb-1">보유 쿠폰</p>
                            <p className="font-bold text-lg">{coupons.length}장</p>
                        </div>
                        <div className="text-center border-l border-gray-700">
                            <p className="text-gray-400 text-xs mb-1">포인트</p>
                            <p className="font-bold text-lg">{membershipInfo.points.toLocaleString()} P</p>
                        </div>
                    </div>
                </div>

                {/* Decorative Circles */}
                <div className="absolute top-0 right-0 -mr-16 -mt-16 w-64 h-64 bg-white/5 rounded-full blur-3xl"></div>
                <div className="absolute bottom-0 left-0 -ml-16 -mb-16 w-64 h-64 bg-primary/20 rounded-full blur-3xl"></div>
            </div>

            {/* Invite Code */}
            {inviteCode && (
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
            )}

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
                        {coupons.length > 0 ? (
                            coupons.map((coupon) => (
                                <div 
                                    key={coupon.id} 
                                    className="border border-gray-200 rounded-lg p-4 flex justify-between items-center hover:shadow-sm transition"
                                >
                                    <div className="flex items-center gap-4">
                                        <div className="bg-gray-100 p-3 rounded-full text-gray-500">
                                            <Gift size={24} />
                                        </div>
                                        <div>
                                            <h5 className="font-bold text-gray-900">{coupon.title}</h5>
                                            <p className="text-sm text-gray-500">{coupon.description}</p>
                                            {coupon.minPurchaseAmount > 0 && (
                                                <p className="text-xs text-gray-400 mt-1">
                                                    ₩{coupon.minPurchaseAmount.toLocaleString()} 이상 구매 시 사용 가능
                                                </p>
                                            )}
                                            <p className="text-xs text-primary mt-1">
                                                {formatDate(coupon.expiryDate)} 까지
                                            </p>
                                        </div>
                                    </div>
                                    <div className="text-right">
                                        <span className="block text-2xl font-bold text-primary">
                                            {coupon.discountType === 'percentage' 
                                                ? `${coupon.discountValue}%`
                                                : `₩${coupon.discountValue.toLocaleString()}`
                                            }
                                        </span>
                                        <span className="text-xs text-gray-400">
                                            {coupon.discountType === 'percentage' ? 'OFF' : '할인'}
                                        </span>
                                    </div>
                                </div>
                            ))
                        ) : (
                            <div className="text-center py-12 text-gray-500 border border-dashed border-gray-300 rounded-lg">
                                <Gift size={48} className="mx-auto mb-4 text-gray-300" />
                                <p>보유한 쿠폰이 없습니다.</p>
                            </div>
                        )}
                    </div>
                )}

                {activeTab === 'points' && (
                    <div className="space-y-4">
                        {pointHistory.length > 0 ? (
                            pointHistory.map((history) => (
                                <div 
                                    key={history.id} 
                                    className="flex justify-between items-center border-b border-gray-50 pb-4 last:border-0"
                                >
                                    <div className="flex items-center gap-3">
                                        <div className={`p-2 rounded ${
                                            history.type === 'earned' 
                                                ? 'bg-green-50 text-green-600' 
                                                : history.type === 'used'
                                                ? 'bg-red-50 text-red-600'
                                                : 'bg-gray-50 text-gray-400'
                                        }`}>
                                            <CreditCard size={16} />
                                        </div>
                                        <div>
                                            <p className="text-sm font-medium text-gray-900">{history.description}</p>
                                            <p className="text-xs text-gray-500">{formatDate(history.createdAt)}</p>
                                        </div>
                                    </div>
                                    <span className={`font-bold ${
                                        history.type === 'earned' 
                                            ? 'text-primary' 
                                            : history.type === 'used'
                                            ? 'text-red-500'
                                            : 'text-gray-400'
                                    }`}>
                                        {history.type === 'earned' ? '+' : '-'}{history.amount.toLocaleString()} P
                                    </span>
                                </div>
                            ))
                        ) : (
                            <div className="text-center py-12 text-gray-500 border border-dashed border-gray-300 rounded-lg">
                                <CreditCard size={48} className="mx-auto mb-4 text-gray-300" />
                                <p>포인트 내역이 없습니다.</p>
                            </div>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
};

export default Membership;
