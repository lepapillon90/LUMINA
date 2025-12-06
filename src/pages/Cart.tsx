import React, { useState, useEffect } from 'react';
import { useCart, useAuth } from '../contexts';
import { Trash2, ArrowRight, Minus, Plus, Truck, ChevronDown } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { useGlobalModal } from '../contexts/GlobalModalContext';
import { FadeInUp, StaggerFadeIn } from '../components/common/AnimatedElements';
import { getProductById } from '../services/productService';
import { Product } from '../types';

const Cart: React.FC = () => {
  const { cart, removeFromCart, updateQuantity, updateCartItem, clearCart, addToCart } = useCart();
  const { user } = useAuth();
  const { showAlert } = useGlobalModal();
  const navigate = useNavigate();
  const [productDetails, setProductDetails] = useState<{ [id: number]: Product }>({});

  const total = cart.reduce((acc, item) => acc + (item.price * item.quantity), 0);
  const shipping = total > 50000 ? 0 : 3000;
  const finalTotal = total + shipping;

  // Fetch product details for size/color stock info
  useEffect(() => {
    const fetchProductDetails = async () => {
      const details: { [id: number]: Product } = {};
      for (const item of cart) {
        if (!productDetails[item.id]) {
          try {
            const product = await getProductById(item.id);
            if (product) {
              details[item.id] = product;
            }
          } catch (error) {
            console.error(`Failed to fetch product ${item.id}:`, error);
          }
        }
      }
      if (Object.keys(details).length > 0) {
        setProductDetails(prev => ({ ...prev, ...details }));
      }
    };

    if (cart.length > 0) {
      fetchProductDetails();
    }
  }, [cart]);

  // Get available sizes for a product
  const getAvailableSizes = (productId: number): string[] => {
    const product = productDetails[productId];
    if (!product?.sizeColorStock) return product?.sizes || [];
    const sizes = [...new Set(product.sizeColorStock.map(item => item.size))];
    return sizes;
  };

  // Get available colors for a specific size
  const getAvailableColors = (productId: number, size?: string): { color: string; quantity: number }[] => {
    const product = productDetails[productId];
    if (!product?.sizeColorStock) {
      return (product?.colors || []).map(c => ({ color: c, quantity: 999 }));
    }
    if (!size) return [];
    return product.sizeColorStock
      .filter(item => item.size === size)
      .map(item => ({ color: item.color, quantity: item.quantity }));
  };

  // Handle size change
  const handleSizeChange = (itemId: number, newSize: string) => {
    const colors = getAvailableColors(itemId, newSize);
    const availableColor = colors.find(c => c.quantity > 0)?.color;
    updateCartItem(itemId, {
      selectedSize: newSize,
      selectedColor: availableColor || colors[0]?.color
    });
  };

  // Handle color change
  const handleColorChange = (itemId: number, newColor: string) => {
    updateCartItem(itemId, { selectedColor: newColor });
  };

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
        <FadeInUp>
          <h1 className="text-3xl font-serif mb-10">장바구니 ({cart.length})</h1>
        </FadeInUp>

        {cart.length === 0 ? (
          <FadeInUp delay={0.1}>
            <div className="text-center py-20">
              <p className="text-gray-500 mb-6">장바구니가 비어있습니다.</p>
              <Link to="/shop" className="text-primary border-b border-primary hover:text-accent hover:border-accent">
                컬렉션 둘러보기
              </Link>
            </div>
          </FadeInUp>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
            {/* Left Column: Cart Items & Saved Items */}
            <div className="lg:col-span-2 space-y-12">

              {/* Free Shipping Gauge */}
              {cart.length > 0 && (
                <FadeInUp delay={0.1}>
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
                </FadeInUp>
              )}

              {/* Cart Items List */}
              {cart.length > 0 && (
                <StaggerFadeIn childSelector=".cart-item" stagger={0.1} className="space-y-6">
                  {cart.map(item => {
                    const sizes = getAvailableSizes(item.id);
                    const colors = getAvailableColors(item.id, item.selectedSize);
                    const hasSizeColorStock = productDetails[item.id]?.sizeColorStock && productDetails[item.id]?.sizeColorStock!.length > 0;

                    return (
                      <div key={`${item.id}-${item.selectedSize}-${item.selectedColor}`} className="cart-item flex py-6 border-b border-gray-100">
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

                            {/* Size/Color Selection with Inventory DB Integration */}
                            {hasSizeColorStock && sizes.length > 0 ? (
                              <div className="flex gap-3 mt-3">
                                {/* Size Selector */}
                                <div className="relative">
                                  <select
                                    value={item.selectedSize || ''}
                                    onChange={(e) => handleSizeChange(item.id, e.target.value)}
                                    className="text-sm border border-gray-300 rounded-md px-3 py-2 pr-8 appearance-none bg-white focus:outline-none focus:ring-2 focus:ring-black"
                                  >
                                    <option value="" disabled>사이즈</option>
                                    {sizes.map(size => (
                                      <option key={size} value={size}>{size}</option>
                                    ))}
                                  </select>
                                  <ChevronDown size={14} className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
                                </div>

                                {/* Color Selector */}
                                {colors.length > 0 && (
                                  <div className="relative">
                                    <select
                                      value={item.selectedColor || ''}
                                      onChange={(e) => handleColorChange(item.id, e.target.value)}
                                      className="text-sm border border-gray-300 rounded-md px-3 py-2 pr-8 appearance-none bg-white focus:outline-none focus:ring-2 focus:ring-black"
                                    >
                                      <option value="" disabled>색상</option>
                                      {colors.map(({ color, quantity }) => (
                                        <option
                                          key={color}
                                          value={color}
                                          disabled={quantity === 0}
                                        >
                                          {color} {quantity === 0 ? '(품절)' : quantity <= 5 ? `(${quantity}개 남음)` : ''}
                                        </option>
                                      ))}
                                    </select>
                                    <ChevronDown size={14} className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
                                  </div>
                                )}
                              </div>
                            ) : (
                              /* Fallback for products without sizeColorStock */
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
                            )}
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
                    );
                  })}
                </StaggerFadeIn>
              )}



              {/* Cross Selling */}
              {cart.length > 0 && (
                <FadeInUp delay={0.3}>
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
                </FadeInUp>
              )}
            </div>

            {/* Right Column: Summary */}
            <FadeInUp delay={0.2}>
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
            </FadeInUp>
          </div>
        )}
      </div>
    </div>
  );
};

export default Cart;

