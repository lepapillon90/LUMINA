import React, { useState } from 'react';
import { useCart, useAuth } from '../contexts';
import { createOrder } from '../services/orderService';
import { BANK_INFO } from '../constants';
import { Trash2, ArrowRight, Minus, Plus, Heart, Gift, ShieldCheck, Truck, CreditCard, RefreshCw } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useGlobalModal } from '../contexts/GlobalModalContext';

const Cart: React.FC = () => {
  const { cart, removeFromCart, updateQuantity, updateCartItem, clearCart, savedItems, saveForLater, moveToCart, removeFromSaved, addToCart } = useCart();
  const { user } = useAuth();
  const { showAlert } = useGlobalModal();
  const [step, setStep] = useState<'cart' | 'payment' | 'success'>('cart');
  const [formData, setFormData] = useState({ name: 'Test User', email: 'test@example.com', address: 'Test Address' });
  const [error, setError] = useState('');
  const [orderTotal, setOrderTotal] = useState(0);
  const [isGiftWrapped, setIsGiftWrapped] = useState(false);
  const [couponCode, setCouponCode] = useState('');
  const [discount, setDiscount] = useState(0);

  const total = cart.reduce((acc, item) => acc + (item.price * item.quantity), 0);
  const shipping = total > 50000 ? 0 : 3000;
  const giftWrapFee = isGiftWrapped ? 3000 : 0;
  const finalTotal = total + shipping + giftWrapFee - discount;

  // Mock Cross-selling items
  const crossSellItems = [
    { id: 901, name: 'Silver Polishing Cloth', price: 5000, image: 'https://images.unsplash.com/photo-1611591437281-460bfbe1220a?auto=format&fit=crop&q=80&w=200', category: 'accessory' },
    { id: 902, name: 'Gift Box Set', price: 8000, image: 'https://images.unsplash.com/photo-1549465220-1a8b9238cd48?auto=format&fit=crop&q=80&w=200', category: 'accessory' }
  ];

  const handleApplyCoupon = () => {
    if (couponCode.toUpperCase() === 'WELCOME10') {
      const discountAmount = Math.floor(total * 0.1);
      setDiscount(discountAmount);
      showAlert(`10% 할인이 적용되었습니다! (-${discountAmount.toLocaleString()}원)`, "쿠폰 적용 성공");
    } else {
      showAlert("유효하지 않은 쿠폰 코드입니다.", "오류");
      setDiscount(0);
    }
  };

  const handleCheckout = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!formData.name.trim() || !formData.email.trim() || !formData.address.trim()) {
      setError('모든 항목을 입력해주세요.');
      return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(formData.email)) {
      setError('유효한 이메일 주소를 입력해주세요.');
      return;
    }

    const processCheckout = async () => {
      if (user) {
        try {
          await createOrder(user.uid, {
            userId: user.uid,
            items: cart,
            customerName: formData.name,
            total: finalTotal,
            status: '입금대기',
            date: new Date().toISOString().split('T')[0]
          });
        } catch (err) {
          console.error("Failed to save order:", err);
          await showAlert(`주문 저장 실패: ${err}`, "오류");
          return;
        }
      }

      setOrderTotal(finalTotal);
      setStep('success');
      clearCart();
      window.scrollTo(0, 0);
    };

    processCheckout();
  };

  // Calculate estimated delivery date (Today + 2 days)
  const deliveryDate = new Date();
  deliveryDate.setDate(deliveryDate.getDate() + 2);
  const formattedDeliveryDate = `${deliveryDate.getMonth() + 1}/${deliveryDate.getDate()} (${['일', '월', '화', '수', '목', '금', '토'][deliveryDate.getDay()]})`;

  if (step === 'success') {
    return (
      <div className="pt-32 pb-20 min-h-screen bg-gray-50 flex items-center justify-center px-4">
        <div className="bg-white p-8 md:p-12 rounded-lg shadow-lg max-w-lg w-full text-center">
          <div className="w-16 h-16 bg-green-100 text-green-600 rounded-full flex items-center justify-center mx-auto mb-6">
            <span className="text-2xl">✓</span>
          </div>
          <h2 className="text-2xl font-serif mb-4">주문이 완료되었습니다!</h2>
          <p className="text-gray-600 mb-8">
            감사합니다, {formData.name}님. <br />
            24시간 이내에 아래 계좌로 입금해주시면 주문이 확정됩니다.
          </p>

          <div className="bg-gray-50 p-6 rounded border border-gray-200 text-left mb-8">
            <p className="text-sm text-gray-500 mb-1">은행명</p>
            <p className="font-medium mb-3">{BANK_INFO.bankName}</p>
            <p className="text-sm text-gray-500 mb-1">계좌번호</p>
            <p className="font-medium mb-3 tracking-widest">{BANK_INFO.accountNumber}</p>
            <p className="text-sm text-gray-500 mb-1">예금주</p>
            <p className="font-medium mb-3">{BANK_INFO.holder}</p>
            <p className="text-sm text-gray-500 mb-1">입금하실 금액</p>
            <p className="font-bold text-lg text-primary">₩{orderTotal.toLocaleString()}</p>
          </div>

          <Link to="/" className="inline-block px-8 py-3 bg-primary text-white hover:bg-black transition">
            쇼핑 계속하기
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="pt-24 pb-20 min-h-screen bg-white">
      <div className="container mx-auto px-6 max-w-6xl">
        <h1 className="text-3xl font-serif mb-10">장바구니 ({cart.length})</h1>

        {cart.length === 0 && savedItems.length === 0 ? (
          <div className="text-center py-20">
            <p className="text-gray-500 mb-6">장바구니가 비어있습니다.</p>
            <Link to="/shop" className="text-primary border-b border-primary hover:text-accent hover:border-accent">
              컬렉션 둘러보기
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
            {/* Left Column: Cart Items & Saved Items */}
            <div className="lg:col-span-2 space-y-12">

              {/* Free Shipping Gauge */}
              {cart.length > 0 && (
                <div className="bg-gray-50 p-6 rounded-lg mb-8">
                  {total >= 50000 ? (
                    <p className="text-sm text-green-600 font-medium mb-2 flex items-center gap-2">
                      <Truck size={18} /> 무료 배송이 적용되었습니다!
                    </p>
                  ) : (
                    <p className="text-sm text-gray-600 mb-2">
                      <span className="font-bold text-black">{(50000 - total).toLocaleString()}원</span> 더 담으면 <span className="text-primary font-bold">무료 배송!</span>
                    </p>
                  )}
                  <div className="w-full h-2 bg-gray-200 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-primary transition-all duration-500 ease-out"
                      style={{ width: `${Math.min((total / 50000) * 100, 100)}%` }}
                    ></div>
                  </div>
                </div>
              )}

              {/* Cart Items List */}
              {cart.length > 0 && (
                <div className="space-y-6">
                  {cart.map(item => (
                    <div key={item.id} className="flex py-6 border-b border-gray-100">
                      <div className="w-24 h-32 bg-gray-100 overflow-hidden">
                        <img src={item.image} alt={item.name} className="w-full h-full object-cover" />
                      </div>
                      <div className="ml-6 flex-1 flex flex-col justify-between">
                        <div>
                          <div className="flex justify-between items-start">
                            <h3 className="font-medium text-lg">{item.name}</h3>
                            <p className="font-medium">₩{item.price.toLocaleString()}</p>
                          </div>
                          <p className="text-sm text-gray-500 capitalize">{item.category === 'earring' ? '귀걸이' : item.category === 'necklace' ? '목걸이' : item.category === 'ring' ? '반지' : '팔찌'}</p>

                          {/* Option Change */}
                          <div className="flex gap-2 mt-2">
                            {(item.category === 'ring' || (item.sizes && item.sizes.length > 0)) && (
                              <select
                                value={item.selectedSize || ''}
                                onChange={(e) => updateCartItem(item.id, { selectedSize: e.target.value })}
                                className="text-xs border border-gray-200 rounded px-1 py-0.5"
                              >
                                <option value="" disabled>사이즈 선택</option>
                                {item.sizes?.map(s => <option key={s} value={s}>{s}</option>) || [9, 11, 13, 15, 17].map(s => <option key={s} value={s}>{s}호</option>)}
                              </select>
                            )}
                            {item.colors && item.colors.length > 0 && (
                              <select
                                value={item.selectedColor || ''}
                                onChange={(e) => updateCartItem(item.id, { selectedColor: e.target.value })}
                                className="text-xs border border-gray-200 rounded px-1 py-0.5"
                              >
                                <option value="" disabled>색상 선택</option>
                                {item.colors.map(c => <option key={c} value={c}>{c}</option>)}
                              </select>
                            )}
                          </div>
                        </div>

                        <div className="flex justify-between items-end mt-4">
                          <div className="flex items-center space-x-3">
                            <button
                              onClick={() => updateQuantity(item.id, item.quantity - 1)}
                              disabled={item.quantity <= 1}
                              className="w-8 h-8 flex items-center justify-center rounded-full border border-gray-200 text-gray-500 hover:bg-gray-100 disabled:opacity-30 disabled:hover:bg-transparent transition"
                            >
                              <Minus size={14} />
                            </button>
                            <span className="text-sm font-medium w-4 text-center">{item.quantity}</span>
                            <button
                              onClick={() => updateQuantity(item.id, item.quantity + 1)}
                              className="w-8 h-8 flex items-center justify-center rounded-full border border-gray-200 text-gray-500 hover:bg-gray-100 transition"
                            >
                              <Plus size={14} />
                            </button>
                          </div>

                          <div className="flex items-center gap-4">
                            <button
                              onClick={() => saveForLater(item.id)}
                              className="text-gray-400 hover:text-black transition flex items-center text-xs space-x-1"
                            >
                              <Heart size={16} />
                              <span className="hidden sm:inline">나중에 구매</span>
                            </button>
                            <button
                              onClick={() => removeFromCart(item.id)}
                              className="text-gray-400 hover:text-red-500 transition flex items-center text-xs space-x-1"
                            >
                              <Trash2 size={16} />
                              <span className="hidden sm:inline">삭제</span>
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {/* Cart Reminder */}
              {cart.length > 0 && (
                <div className="flex justify-end">
                  <button
                    onClick={() => showAlert("장바구니 목록이 이메일로 발송되었습니다.", "알림")}
                    className="text-xs text-gray-500 underline hover:text-black"
                  >
                    장바구니 메일로 보내기
                  </button>
                </div>
              )}

              {/* Saved for Later */}
              {savedItems.length > 0 && (
                <div className="mt-12 pt-12 border-t border-gray-100">
                  <h3 className="text-xl font-serif mb-6">나중에 구매하기 ({savedItems.length})</h3>
                  <div className="space-y-6">
                    {savedItems.map(item => (
                      <div key={item.id} className="flex py-4 border-b border-gray-50 opacity-75 hover:opacity-100 transition">
                        <div className="w-20 h-24 bg-gray-100 overflow-hidden">
                          <img src={item.image} alt={item.name} className="w-full h-full object-cover grayscale hover:grayscale-0 transition" />
                        </div>
                        <div className="ml-6 flex-1 flex flex-col justify-between">
                          <div className="flex justify-between items-start">
                            <h3 className="font-medium">{item.name}</h3>
                            <p className="text-sm text-gray-500">₩{item.price.toLocaleString()}</p>
                          </div>
                          <div className="flex justify-end gap-4">
                            <button
                              onClick={() => removeFromSaved(item.id)}
                              className="text-gray-400 hover:text-red-500 text-xs"
                            >
                              삭제
                            </button>
                            <button
                              onClick={() => moveToCart(item.id)}
                              className="text-primary hover:text-black text-xs font-medium border-b border-primary hover:border-black transition"
                            >
                              장바구니로 이동
                            </button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Cross Selling */}
              {cart.length > 0 && (
                <div className="mt-12 bg-gray-50 p-6 rounded-lg">
                  <h3 className="text-lg font-serif mb-4">함께 구매하면 좋은 상품</h3>
                  <div className="grid grid-cols-2 gap-4">
                    {crossSellItems.map(item => (
                      <div key={item.id} className="flex gap-3 bg-white p-3 rounded border border-gray-100">
                        <div className="w-16 h-16 bg-gray-100 flex-shrink-0">
                          <img src={item.image} alt={item.name} className="w-full h-full object-cover" />
                        </div>
                        <div className="flex-1 flex flex-col justify-between">
                          <p className="text-sm font-medium line-clamp-1">{item.name}</p>
                          <div className="flex justify-between items-end">
                            <span className="text-xs text-gray-500">₩{item.price.toLocaleString()}</span>
                            <button
                              onClick={() => addToCart({ ...item, sizes: [], colors: [], stock: 100, description: '', images: [item.image], material: 'Accessory', rating: 5, reviewCount: 0, createdAt: new Date() } as any)}
                              className="text-xs bg-black text-white px-2 py-1 rounded-sm hover:bg-gray-800"
                            >
                              추가
                            </button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Right Column: Summary / Form */}
            <div className="bg-gray-50 p-8 h-fit sticky top-24">
              {step === 'cart' ? (
                <>
                  <h3 className="text-lg font-serif mb-6">주문 내역</h3>
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

                  {/* Gift Option */}
                  <div className="mb-6">
                    <label className="flex items-center gap-2 cursor-pointer select-none">
                      <input
                        type="checkbox"
                        checked={isGiftWrapped}
                        onChange={(e) => setIsGiftWrapped(e.target.checked)}
                        className="w-4 h-4 text-primary border-gray-300 rounded focus:ring-primary"
                      />
                      <span className="text-sm text-gray-700 flex items-center gap-1">
                        <Gift size={14} /> 선물 포장 신청 (+3,000원)
                      </span>
                    </label>
                  </div>

                  {/* Coupon */}
                  <div className="mb-6 flex gap-2">
                    <input
                      type="text"
                      placeholder="쿠폰 코드 (WELCOME10)"
                      value={couponCode}
                      onChange={(e) => setCouponCode(e.target.value)}
                      className="flex-1 border border-gray-300 p-2 text-sm focus:outline-none focus:border-black uppercase"
                    />
                    <button
                      onClick={handleApplyCoupon}
                      className="bg-gray-200 text-gray-700 px-3 py-2 text-xs font-bold hover:bg-gray-300 transition"
                    >
                      적용
                    </button>
                  </div>

                  <div className="flex justify-between font-bold text-lg mb-8">
                    <span>총 결제금액</span>
                    <span>₩{finalTotal.toLocaleString()}</span>
                  </div>

                  {/* Trust Badges */}
                  <div className="grid grid-cols-3 gap-2 mb-6 text-center">
                    <div className="flex flex-col items-center gap-1 text-[10px] text-gray-500">
                      <ShieldCheck size={20} className="text-gray-400" />
                      <span>100% 정품</span>
                    </div>
                    <div className="flex flex-col items-center gap-1 text-[10px] text-gray-500">
                      <RefreshCw size={20} className="text-gray-400" />
                      <span>무료 반품</span>
                    </div>
                    <div className="flex flex-col items-center gap-1 text-[10px] text-gray-500">
                      <CreditCard size={20} className="text-gray-400" />
                      <span>보안 결제</span>
                    </div>
                  </div>

                  {/* Estimated Delivery */}
                  <div className="mb-8 bg-white p-3 rounded border border-gray-100 text-center">
                    <p className="text-xs text-gray-500 mb-1">오늘 주문 시 도착 예정일</p>
                    <p className="font-bold text-primary">{formattedDeliveryDate}</p>
                  </div>

                  <button
                    onClick={() => setStep('payment')}
                    disabled={cart.length === 0}
                    className="w-full bg-primary text-white py-4 uppercase tracking-wider text-sm hover:bg-black transition flex justify-center items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    주문하기 <ArrowRight size={16} />
                  </button>
                </>
              ) : (
                <form onSubmit={handleCheckout}>
                  <h3 className="text-lg font-serif mb-6">배송 정보</h3>
                  {error && (
                    <div className="mb-4 bg-red-50 text-red-500 text-xs p-3 rounded">
                      {error}
                    </div>
                  )}
                  <div className="space-y-4 mb-6">
                    <div>
                      <label className="block text-xs uppercase text-gray-500 mb-1">받으시는 분</label>
                      <input
                        required
                        type="text"
                        value={formData.name}
                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                        className="w-full border border-gray-300 p-3 text-sm focus:outline-none focus:border-black"
                      />
                    </div>
                    <div>
                      <label className="block text-xs uppercase text-gray-500 mb-1">이메일</label>
                      <input
                        required
                        type="email"
                        value={formData.email}
                        onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                        className="w-full border border-gray-300 p-3 text-sm focus:outline-none focus:border-black"
                      />
                    </div>
                    <div>
                      <label className="block text-xs uppercase text-gray-500 mb-1">주소</label>
                      <textarea
                        required
                        value={formData.address}
                        onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                        className="w-full border border-gray-300 p-3 text-sm focus:outline-none focus:border-black h-24 resize-none"
                      />
                    </div>
                  </div>

                  <div className="mb-6 bg-yellow-50 p-4 text-xs text-yellow-800 border border-yellow-200">
                    결제 수단: <strong>무통장 입금</strong><br />
                    입금 계좌 정보는 주문 완료 후 확인 가능합니다.
                  </div>

                  <button
                    type="submit"
                    className="w-full bg-primary text-white py-4 uppercase tracking-wider text-sm hover:bg-black transition"
                  >
                    결제하기 - ₩{finalTotal.toLocaleString()}
                  </button>
                  <button
                    type="button"
                    onClick={() => setStep('cart')}
                    className="w-full mt-3 text-gray-500 text-xs hover:text-black"
                  >
                    장바구니로 돌아가기
                  </button>
                </form>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Cart;