import React, { useState } from 'react';
import { useCart, useAuth } from '../contexts';
import { Trash2, ArrowRight, Minus, Plus, Truck } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { useGlobalModal } from '../contexts/GlobalModalContext';

const Cart: React.FC = () => {
  const { cart, removeFromCart, updateQuantity, updateCartItem, clearCart, addToCart } = useCart();
  const { user } = useAuth();
  const { showAlert } = useGlobalModal();
  const navigate = useNavigate();

  const total = cart.reduce((acc, item) => acc + (item.price * item.quantity), 0);
  const shipping = total > 50000 ? 0 : 3000;
  const finalTotal = total + shipping;

  // Mock Cross-selling items
  const crossSellItems = [
    { id: 901, name: 'Silver Polishing Cloth', price: 5000, image: 'https://images.unsplash.com/photo-1611591437281-460bfbe1220a?auto=format&fit=crop&q=80&w=200', category: 'accessory' },
    { id: 902, name: 'Gift Box Set', price: 8000, image: 'https://images.unsplash.com/photo-1549465220-1a8b9238cd48?auto=format&fit=crop&q=80&w=200', category: 'accessory' }
  ];


  const handleCheckout = () => {
    if (cart.length === 0) {
      showAlert("장바구니가 비어있습니다.", "알림");
      return;
    }

    // 로그인 확인
    if (!user) {
      showAlert("결제를 위해 로그인이 필요합니다.", "알림");
      navigate('/login');
      return;
    }

    // 결제 페이지로 이동
    navigate('/checkout');
  };


  return (
    <div className="pt-40 pb-20 min-h-screen bg-white">
      <div className="container mx-auto px-6 max-w-6xl">
        <h1 className="text-3xl font-serif mb-10">장바구니 ({cart.length})</h1>

        {cart.length === 0 ? (
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
                      <div className="w-24 h-24 bg-gray-100 overflow-hidden">
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

            {/* Right Column: Summary */}
            <div className="bg-gray-50 p-8 h-fit sticky top-24">
              {(
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
                  </div>


                  <div className="flex justify-between font-bold text-lg mb-8">
                    <span>총 결제금액</span>
                    <span>₩{finalTotal.toLocaleString()}</span>
                  </div>


                  <button
                    onClick={handleCheckout}
                    disabled={cart.length === 0}
                    className="w-full bg-primary text-white py-4 uppercase tracking-wider text-sm hover:bg-black transition flex justify-center items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    주문하기 <ArrowRight size={16} />
                  </button>
                </>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Cart;