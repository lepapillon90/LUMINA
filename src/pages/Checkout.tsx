import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useCart, useAuth } from '../contexts';
import { useGlobalModal } from '../contexts/GlobalModalContext';
import { createOrder } from '../services/orderService';
import { BANK_INFO } from '../constants';
import { DeliveryAddress, Coupon } from '../types';
import { db } from '../firebase';
import { collection, query, where, getDocs } from 'firebase/firestore';
import { getUserCoupons } from '../services/membershipService';
import { ArrowLeft, MapPin, Plus, Gift, CreditCard } from 'lucide-react';
import AddressModal from '../components/MyPage/AddressModal';
import { Link } from 'react-router-dom';
import { Timestamp } from 'firebase/firestore';

const Checkout: React.FC = () => {
    const { cart, clearCart } = useCart();
    const { user } = useAuth();
    const { showAlert } = useGlobalModal();
    const navigate = useNavigate();

    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [addresses, setAddresses] = useState<DeliveryAddress[]>([]);
    const [selectedAddressId, setSelectedAddressId] = useState<string | null>(null);
    const [showAddressModal, setShowAddressModal] = useState(false);
    const [isGiftWrapped, setIsGiftWrapped] = useState(false);
    const [availableCoupons, setAvailableCoupons] = useState<Coupon[]>([]);
    const [selectedCouponId, setSelectedCouponId] = useState<string | null>(null);
    const [discount, setDiscount] = useState(0);

    // 장바구니가 비어있으면 장바구니로 리다이렉트
    useEffect(() => {
        if (cart.length === 0) {
            navigate('/cart');
        }
    }, [cart.length, navigate]);

    // 로그인 확인
    useEffect(() => {
        if (!user) {
            showAlert("결제를 위해 로그인이 필요합니다.", "알림");
            navigate('/login');
        }
    }, [user, navigate, showAlert]);

    // 배송지 목록 로드
    useEffect(() => {
        if (user?.uid) {
            loadAddresses();
            loadCoupons();
        }
    }, [user?.uid]);

    const loadAddresses = async () => {
        if (!user?.uid) return;

        try {
            const addressesQuery = query(
                collection(db, 'user_addresses'),
                where('userId', '==', user.uid)
            );
            const querySnapshot = await getDocs(addressesQuery);
            
            const loadedAddresses: DeliveryAddress[] = [];
            querySnapshot.forEach((doc) => {
                loadedAddresses.push({
                    id: doc.id,
                    ...doc.data()
                } as DeliveryAddress);
            });

            // 기본 배송지 우선 정렬
            loadedAddresses.sort((a, b) => (b.isDefault ? 1 : 0) - (a.isDefault ? 1 : 0));
            setAddresses(loadedAddresses);

            // 기본 배송지 선택
            const defaultAddress = loadedAddresses.find(addr => addr.isDefault);
            if (defaultAddress) {
                setSelectedAddressId(defaultAddress.id);
            } else if (loadedAddresses.length > 0) {
                setSelectedAddressId(loadedAddresses[0].id);
            }
        } catch (error) {
            console.error('[MY_LOG] Error loading addresses:', error);
        }
    };

    const loadCoupons = async () => {
        if (!user?.uid) return;

        try {
            const coupons = await getUserCoupons(user.uid);
            setAvailableCoupons(coupons);
        } catch (error) {
            console.error('[MY_LOG] Error loading coupons:', error);
        }
    };

    const selectedAddress = addresses.find(addr => addr.id === selectedAddressId);

    const total = cart.reduce((acc, item) => acc + (item.price * item.quantity), 0);
    const shipping = total > 50000 ? 0 : 3000;
    const giftWrapFee = isGiftWrapped ? 3000 : 0;

    // 선택한 쿠폰에 따라 할인 계산
    useEffect(() => {
        if (!selectedCouponId) {
            setDiscount(0);
            return;
        }

        const selectedCoupon = availableCoupons.find(c => c.id === selectedCouponId);
        if (!selectedCoupon) {
            setDiscount(0);
            return;
        }

        // 최소 구매 금액 체크
        if (total < selectedCoupon.minPurchaseAmount) {
            setDiscount(0);
            return;
        }

        // 할인 계산
        let discountAmount = 0;
        if (selectedCoupon.discountType === 'percentage') {
            discountAmount = Math.floor(total * (selectedCoupon.discountValue / 100));
        } else {
            discountAmount = selectedCoupon.discountValue;
        }

        setDiscount(discountAmount);
    }, [selectedCouponId, availableCoupons, total]);

    const finalTotal = total + shipping + giftWrapFee - discount;

    const handleCouponChange = (couponId: string) => {
        if (couponId === '') {
            setSelectedCouponId(null);
            return;
        }

        const coupon = availableCoupons.find(c => c.id === couponId);
        if (!coupon) {
            setSelectedCouponId(null);
            return;
        }

        // 최소 구매 금액 체크
        if (total < coupon.minPurchaseAmount) {
            showAlert(
                `이 쿠폰은 최소 ${coupon.minPurchaseAmount.toLocaleString()}원 이상 구매 시 사용 가능합니다.`,
                "쿠폰 적용 불가"
            );
            setSelectedCouponId(null);
            return;
        }

        setSelectedCouponId(couponId);
    };

    const formatCouponLabel = (coupon: Coupon): string => {
        const discountText = coupon.discountType === 'percentage' 
            ? `${coupon.discountValue}% 할인`
            : `₩${coupon.discountValue.toLocaleString()} 할인`;
        
        const minAmountText = coupon.minPurchaseAmount > 0 
            ? ` (${coupon.minPurchaseAmount.toLocaleString()}원 이상)`
            : '';
        
        return `${coupon.title} - ${discountText}${minAmountText}`;
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');

        if (!selectedAddress) {
            setError('배송지를 선택해주세요.');
            return;
        }

        if (!user) {
            setError('로그인이 필요합니다.');
            return;
        }

        try {
            setLoading(true);

            const orderId = await createOrder(user.uid, {
                userId: user.uid,
                items: cart,
                customerName: selectedAddress.recipient,
                total: finalTotal,
                status: '입금대기',
                date: new Date().toISOString().split('T')[0],
                shippingAddress: `${selectedAddress.address} ${selectedAddress.detailAddress}`,
                phone: selectedAddress.phone,
                email: user.email || ''
            });

            clearCart();
            navigate(`/checkout/success?orderId=${orderId}&total=${finalTotal}`);
        } catch (err: any) {
            console.error('[MY_LOG] Error creating order:', err);
            setError(err?.message || '주문 처리 중 오류가 발생했습니다.');
        } finally {
            setLoading(false);
        }
    };

    const handleAddressAdded = async () => {
        await loadAddresses();
        setShowAddressModal(false);
    };

    if (cart.length === 0) {
        return null;
    }

    return (
        <div className="pt-24 pb-20 min-h-screen bg-gray-50">
            <div className="container mx-auto px-6 max-w-6xl">
                <Link 
                    to="/cart" 
                    className="inline-flex items-center gap-2 text-gray-600 hover:text-black mb-6 transition"
                >
                    <ArrowLeft size={18} />
                    장바구니로 돌아가기
                </Link>

                <h1 className="text-3xl font-serif mb-10">주문/결제</h1>

                <form onSubmit={handleSubmit}>
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                        {/* Left Column: 배송 정보 및 결제 */}
                        <div className="lg:col-span-2 space-y-6">
                            {/* 배송지 선택 */}
                            <div className="bg-white p-6 rounded-lg shadow-sm">
                                <div className="flex justify-between items-center mb-4">
                                    <h2 className="text-xl font-serif">배송지 정보</h2>
                                    <button
                                        type="button"
                                        onClick={() => setShowAddressModal(true)}
                                        className="flex items-center gap-2 text-sm text-gray-600 hover:text-black transition"
                                    >
                                        <Plus size={16} />
                                        새 배송지 추가
                                    </button>
                                </div>

                                {error && (
                                    <div className="mb-4 bg-red-50 text-red-500 text-xs p-3 rounded">
                                        {error}
                                    </div>
                                )}

                                {addresses.length === 0 ? (
                                    <div className="text-center py-8">
                                        <MapPin size={48} className="mx-auto text-gray-300 mb-4" />
                                        <p className="text-gray-500 mb-4">등록된 배송지가 없습니다.</p>
                                        <button
                                            type="button"
                                            onClick={() => setShowAddressModal(true)}
                                            className="px-4 py-2 bg-primary text-white rounded-md hover:bg-gray-800 transition"
                                        >
                                            배송지 추가하기
                                        </button>
                                    </div>
                                ) : (
                                    <div className="space-y-3">
                                        {addresses.map((address) => (
                                            <label
                                                key={address.id}
                                                className={`flex items-start gap-3 p-4 border-2 rounded-lg cursor-pointer transition ${
                                                    selectedAddressId === address.id
                                                        ? 'border-primary bg-primary/5'
                                                        : 'border-gray-200 hover:border-gray-300'
                                                }`}
                                            >
                                                <input
                                                    type="radio"
                                                    name="address"
                                                    value={address.id}
                                                    checked={selectedAddressId === address.id}
                                                    onChange={(e) => setSelectedAddressId(e.target.value)}
                                                    className="mt-1"
                                                />
                                                <div className="flex-1">
                                                    <div className="flex justify-between items-start mb-2">
                                                        <div>
                                                            <span className="font-medium">{address.name}</span>
                                                            {address.isDefault && (
                                                                <span className="ml-2 px-2 py-0.5 bg-primary text-white text-xs rounded">
                                                                    기본
                                                                </span>
                                                            )}
                                                        </div>
                                                        <span className="text-sm text-gray-500">{address.recipient}</span>
                                                    </div>
                                                    <p className="text-sm text-gray-600 mb-1">{address.phone}</p>
                                                    <p className="text-sm text-gray-600">
                                                        ({address.postalCode}) {address.address} {address.detailAddress}
                                                    </p>
                                                </div>
                                            </label>
                                        ))}
                                    </div>
                                )}
                            </div>

                            {/* 주문 상품 */}
                            <div className="bg-white p-6 rounded-lg shadow-sm">
                                <h2 className="text-xl font-serif mb-4">주문 상품</h2>
                                <div className="space-y-4">
                                    {cart.map((item) => (
                                        <div key={item.id} className="flex gap-4 pb-4 border-b border-gray-100 last:border-0">
                                            <div className="w-20 h-20 bg-gray-100 overflow-hidden rounded">
                                                <img src={item.image} alt={item.name} className="w-full h-full object-cover" />
                                            </div>
                                            <div className="flex-1">
                                                <h3 className="font-medium">{item.name}</h3>
                                                <p className="text-sm text-gray-500">
                                                    {item.selectedSize && `사이즈: ${item.selectedSize} `}
                                                    {item.selectedColor && `색상: ${item.selectedColor}`}
                                                </p>
                                                <div className="flex justify-between items-end mt-2">
                                                    <span className="text-sm text-gray-500">수량: {item.quantity}개</span>
                                                    <span className="font-medium">₩{(item.price * item.quantity).toLocaleString()}</span>
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            {/* 선물 포장 */}
                            <div className="bg-white p-6 rounded-lg shadow-sm">
                                <label className="flex items-center gap-3 cursor-pointer select-none">
                                    <input
                                        type="checkbox"
                                        checked={isGiftWrapped}
                                        onChange={(e) => setIsGiftWrapped(e.target.checked)}
                                        className="w-5 h-5 text-primary border-gray-300 rounded focus:ring-primary"
                                    />
                                    <Gift size={20} className="text-gray-400" />
                                    <div>
                                        <span className="font-medium">선물 포장 신청</span>
                                        <span className="ml-2 text-sm text-gray-500">(+3,000원)</span>
                                    </div>
                                </label>
                            </div>

                            {/* 쿠폰 */}
                            <div className="bg-white p-6 rounded-lg shadow-sm">
                                <h2 className="text-xl font-serif mb-4">쿠폰</h2>
                                {availableCoupons.length === 0 ? (
                                    <div className="text-center py-4">
                                        <p className="text-gray-500 text-sm">사용 가능한 쿠폰이 없습니다.</p>
                                        <Link 
                                            to="/mypage?tab=membership" 
                                            className="text-primary text-sm hover:underline mt-2 inline-block"
                                        >
                                            쿠폰 받으러 가기
                                        </Link>
                                    </div>
                                ) : (
                                    <div>
                                        <select
                                            value={selectedCouponId || ''}
                                            onChange={(e) => handleCouponChange(e.target.value)}
                                            className="w-full border border-gray-300 p-3 text-sm focus:outline-none focus:border-black"
                                        >
                                            <option value="">쿠폰 선택</option>
                                            {availableCoupons.map((coupon) => {
                                                const isDisabled = total < coupon.minPurchaseAmount;
                                                return (
                                                    <option 
                                                        key={coupon.id} 
                                                        value={coupon.id}
                                                        disabled={isDisabled}
                                                    >
                                                        {formatCouponLabel(coupon)}
                                                        {isDisabled && ` (최소 ${coupon.minPurchaseAmount.toLocaleString()}원 필요)`}
                                                    </option>
                                                );
                                            })}
                                        </select>
                                        {selectedCouponId && (
                                            <div className="mt-3 p-3 bg-green-50 border border-green-200 rounded">
                                                <p className="text-sm text-green-800">
                                                    <strong>{availableCoupons.find(c => c.id === selectedCouponId)?.title}</strong> 쿠폰이 적용되었습니다.
                                                </p>
                                                <p className="text-xs text-green-600 mt-1">
                                                    할인 금액: -₩{discount.toLocaleString()}
                                                </p>
                                            </div>
                                        )}
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Right Column: 주문 요약 */}
                        <div className="lg:col-span-1">
                            <div className="bg-white p-6 rounded-lg shadow-sm sticky top-24">
                                <h2 className="text-xl font-serif mb-6">주문 요약</h2>
                                
                                <div className="space-y-3 text-sm text-gray-600 mb-6 border-b border-gray-200 pb-6">
                                    <div className="flex justify-between">
                                        <span>상품 금액</span>
                                        <span>₩{total.toLocaleString()}</span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span>배송비</span>
                                        <span>{shipping === 0 ? '무료' : `₩${shipping.toLocaleString()}`}</span>
                                    </div>
                                    {isGiftWrapped && (
                                        <div className="flex justify-between text-primary">
                                            <span>선물 포장</span>
                                            <span>+₩{giftWrapFee.toLocaleString()}</span>
                                        </div>
                                    )}
                                    {discount > 0 && (
                                        <div className="flex justify-between text-red-500">
                                            <span>할인 (쿠폰)</span>
                                            <span>-₩{discount.toLocaleString()}</span>
                                        </div>
                                    )}
                                </div>

                                <div className="flex justify-between font-bold text-lg mb-6">
                                    <span>총 결제금액</span>
                                    <span>₩{finalTotal.toLocaleString()}</span>
                                </div>

                                <div className="mb-6 bg-yellow-50 p-4 text-xs text-yellow-800 border border-yellow-200 rounded">
                                    결제 수단: <strong>무통장 입금</strong><br />
                                    입금 계좌 정보는 주문 완료 후 확인 가능합니다.
                                </div>

                                <button
                                    type="submit"
                                    disabled={loading || !selectedAddress || cart.length === 0}
                                    className="w-full bg-primary text-white py-4 uppercase tracking-wider text-sm hover:bg-black transition disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                    {loading ? '처리 중...' : `결제하기 - ₩${finalTotal.toLocaleString()}`}
                                </button>
                            </div>
                        </div>
                    </div>
                </form>

                {/* 배송지 추가 모달 */}
                {showAddressModal && (
                    <AddressModal
                        isOpen={showAddressModal}
                        onClose={() => setShowAddressModal(false)}
                        onSave={async () => {
                            await handleAddressAdded();
                        }}
                    />
                )}
            </div>
        </div>
    );
};

export default Checkout;

