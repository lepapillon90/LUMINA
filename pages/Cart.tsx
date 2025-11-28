import React, { useState } from 'react';
import { useCart } from '../App';
import { BANK_INFO } from '../constants';
import { Trash2, ArrowRight, Minus, Plus } from 'lucide-react';
import { Link } from 'react-router-dom';

const Cart: React.FC = () => {
  const { cart, removeFromCart, updateQuantity, clearCart } = useCart();
  const [step, setStep] = useState<'cart' | 'payment' | 'success'>('cart');
  const [formData, setFormData] = useState({ name: '', email: '', address: '' });
  const [error, setError] = useState('');

  const total = cart.reduce((acc, item) => acc + (item.price * item.quantity), 0);
  const shipping = total > 50000 ? 0 : 3000;
  const finalTotal = total + shipping;

  const handleCheckout = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    // Exception Handling: Validate inputs
    if (!formData.name.trim() || !formData.email.trim() || !formData.address.trim()) {
      setError('모든 항목을 입력해주세요.');
      return;
    }

    // Basic email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(formData.email)) {
      setError('유효한 이메일 주소를 입력해주세요.');
      return;
    }

    setStep('success');
    clearCart();
    window.scrollTo(0, 0);
  };

  if (step === 'success') {
    return (
      <div className="pt-32 pb-20 min-h-screen bg-gray-50 flex items-center justify-center px-4">
        <div className="bg-white p-8 md:p-12 rounded-lg shadow-lg max-w-lg w-full text-center">
          <div className="w-16 h-16 bg-green-100 text-green-600 rounded-full flex items-center justify-center mx-auto mb-6">
            <span className="text-2xl">✓</span>
          </div>
          <h2 className="text-2xl font-serif mb-4">주문이 완료되었습니다!</h2>
          <p className="text-gray-600 mb-8">
            감사합니다, {formData.name}님. <br/>
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
            <p className="font-bold text-lg text-primary">₩{finalTotal.toLocaleString()}</p>
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
        <h1 className="text-3xl font-serif mb-10">쇼핑백 ({cart.length})</h1>

        {cart.length === 0 ? (
          <div className="text-center py-20">
            <p className="text-gray-500 mb-6">쇼핑백이 비어있습니다.</p>
            <Link to="/shop" className="text-primary border-b border-primary hover:text-accent hover:border-accent">
              컬렉션 둘러보기
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
            {/* Cart Items */}
            <div className="lg:col-span-2 space-y-6">
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
                    </div>
                    
                    <div className="flex justify-between items-end mt-4">
                      {/* Quantity Control */}
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
              ))}
            </div>

            {/* Summary / Form */}
            <div className="bg-gray-50 p-8 h-fit">
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
                  </div>
                  <div className="flex justify-between font-bold text-lg mb-8">
                    <span>총 결제금액</span>
                    <span>₩{finalTotal.toLocaleString()}</span>
                  </div>
                  <button 
                    onClick={() => setStep('payment')}
                    className="w-full bg-primary text-white py-4 uppercase tracking-wider text-sm hover:bg-black transition flex justify-center items-center gap-2"
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
                        onChange={(e) => setFormData({...formData, name: e.target.value})}
                        className="w-full border border-gray-300 p-3 text-sm focus:outline-none focus:border-black"
                      />
                    </div>
                    <div>
                      <label className="block text-xs uppercase text-gray-500 mb-1">이메일</label>
                      <input 
                        required
                        type="email" 
                        value={formData.email}
                        onChange={(e) => setFormData({...formData, email: e.target.value})}
                        className="w-full border border-gray-300 p-3 text-sm focus:outline-none focus:border-black"
                      />
                    </div>
                    <div>
                      <label className="block text-xs uppercase text-gray-500 mb-1">주소</label>
                      <textarea 
                        required
                        value={formData.address}
                        onChange={(e) => setFormData({...formData, address: e.target.value})}
                        className="w-full border border-gray-300 p-3 text-sm focus:outline-none focus:border-black h-24 resize-none"
                      />
                    </div>
                  </div>
                  
                  <div className="mb-6 bg-yellow-50 p-4 text-xs text-yellow-800 border border-yellow-200">
                    결제 수단: <strong>무통장 입금</strong><br/>
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