import React, { useState, useEffect } from 'react';
import { X, Minus, Plus, ShoppingBag, ChevronDown } from 'lucide-react';
import { useCart } from '../../contexts';
import { Link, useNavigate } from 'react-router-dom';
import { getProductById } from '../../services/productService';
import { Product } from '../../types';

interface CartDrawerProps {
    isOpen: boolean;
    onClose: () => void;
}

const CartDrawer: React.FC<CartDrawerProps> = ({ isOpen, onClose }) => {
    const { cart, removeFromCart, updateQuantity, updateCartItem } = useCart();
    const navigate = useNavigate();
    const [productDetails, setProductDetails] = useState<{ [id: number]: Product }>({});

    const total = cart.reduce((acc, item) => acc + (item.price * item.quantity), 0);

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

        if (isOpen && cart.length > 0) {
            fetchProductDetails();
        }
    }, [isOpen, cart]);

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

    // Get stock quantity for a specific size/color combination
    const getStockQuantity = (productId: number, size?: string, color?: string): number => {
        const product = productDetails[productId];
        if (!product?.sizeColorStock) return 999;
        const stock = product.sizeColorStock.find(
            item => item.size === size && item.color === color
        );
        return stock?.quantity || 0;
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

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-[60] flex justify-end">
            {/* Backdrop */}
            <div
                className="absolute inset-0 bg-black/30 backdrop-blur-sm transition-opacity"
                onClick={onClose}
            ></div>

            {/* Drawer */}
            <div className="relative w-full max-w-md bg-white h-full shadow-2xl flex flex-col animate-slide-in-right">
                {/* Header */}
                <div className="p-6 border-b border-gray-100 flex justify-between items-center bg-white z-10">
                    <h2 className="text-xl font-serif font-bold flex items-center gap-2">
                        <ShoppingBag size={20} />
                        장바구니 ({cart.length})
                    </h2>
                    <button onClick={onClose} className="text-gray-400 hover:text-gray-600 transition">
                        <X size={24} />
                    </button>
                </div>

                {/* Free Shipping Gauge */}
                {cart.length > 0 && (
                    <div className="px-6 py-4 bg-gray-50 border-b border-gray-100">
                        {total >= 50000 ? (
                            <p className="text-sm text-green-600 font-medium mb-2">🎉 무료 배송이 적용되었습니다!</p>
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

                {/* Cart Items */}
                <div className="flex-1 overflow-y-auto p-6 space-y-6">
                    {cart.length === 0 ? (
                        <div className="h-full flex flex-col items-center justify-center text-gray-400 space-y-4">
                            <ShoppingBag size={48} className="opacity-20" />
                            <p>장바구니가 비어있습니다.</p>
                            <button
                                onClick={() => { onClose(); navigate('/shop'); }}
                                className="text-primary border-b border-primary hover:text-accent hover:border-accent transition"
                            >
                                쇼핑 계속하기
                            </button>
                        </div>
                    ) : (
                        cart.map(item => {
                            const sizes = getAvailableSizes(item.id);
                            const colors = getAvailableColors(item.id, item.selectedSize);
                            const hasSizeColorStock = productDetails[item.id]?.sizeColorStock && productDetails[item.id]?.sizeColorStock!.length > 0;

                            return (
                                <div key={`${item.id}-${item.selectedSize}-${item.selectedColor}`} className="flex gap-4">
                                    <div className="w-20 h-20 bg-gray-100 flex-shrink-0 overflow-hidden rounded-sm">
                                        <img src={item.image} alt={item.name} className="w-full h-full object-cover" />
                                    </div>
                                    <div className="flex-1 flex flex-col justify-between">
                                        <div>
                                            <div className="flex justify-between items-start">
                                                <h3 className="font-medium text-sm line-clamp-1">{item.name}</h3>
                                                <button
                                                    onClick={() => removeFromCart(item.id)}
                                                    className="text-gray-300 hover:text-red-500 transition ml-2"
                                                >
                                                    <X size={16} />
                                                </button>
                                            </div>
                                            <p className="text-sm text-gray-500 mt-0.5">₩{item.price.toLocaleString()}</p>
                                        </div>

                                        {/* Size/Color Selection */}
                                        {hasSizeColorStock && sizes.length > 0 && (
                                            <div className="flex gap-2 mt-2">
                                                {/* Size Selector */}
                                                <div className="relative flex-1">
                                                    <select
                                                        value={item.selectedSize || ''}
                                                        onChange={(e) => handleSizeChange(item.id, e.target.value)}
                                                        className="w-full text-xs border border-gray-200 rounded px-2 py-1.5 pr-6 appearance-none bg-white focus:outline-none focus:border-black"
                                                    >
                                                        <option value="" disabled>사이즈</option>
                                                        {sizes.map(size => (
                                                            <option key={size} value={size}>{size}</option>
                                                        ))}
                                                    </select>
                                                    <ChevronDown size={12} className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
                                                </div>

                                                {/* Color Selector */}
                                                {colors.length > 0 && (
                                                    <div className="relative flex-1">
                                                        <select
                                                            value={item.selectedColor || ''}
                                                            onChange={(e) => handleColorChange(item.id, e.target.value)}
                                                            className="w-full text-xs border border-gray-200 rounded px-2 py-1.5 pr-6 appearance-none bg-white focus:outline-none focus:border-black"
                                                        >
                                                            <option value="" disabled>색상</option>
                                                            {colors.map(({ color, quantity }) => (
                                                                <option
                                                                    key={color}
                                                                    value={color}
                                                                    disabled={quantity === 0}
                                                                >
                                                                    {color} {quantity === 0 ? '(품절)' : quantity <= 5 ? `(${quantity}개)` : ''}
                                                                </option>
                                                            ))}
                                                        </select>
                                                        <ChevronDown size={12} className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
                                                    </div>
                                                )}
                                            </div>
                                        )}

                                        {/* Display selected options if no stock system */}
                                        {!hasSizeColorStock && (item.selectedSize || item.selectedColor) && (
                                            <p className="text-xs text-gray-400 mt-1">
                                                {item.selectedSize && <span>{item.selectedSize}</span>}
                                                {item.selectedSize && item.selectedColor && <span> / </span>}
                                                {item.selectedColor && <span>{item.selectedColor}</span>}
                                            </p>
                                        )}

                                        <div className="flex justify-between items-center mt-2">
                                            <div className="flex items-center border border-gray-200 rounded-sm">
                                                <button
                                                    onClick={() => updateQuantity(item.id, item.quantity - 1)}
                                                    disabled={item.quantity <= 1}
                                                    className="px-2 py-1 text-gray-500 hover:bg-gray-50 disabled:opacity-30 transition"
                                                >
                                                    <Minus size={12} />
                                                </button>
                                                <span className="text-xs font-medium w-6 text-center">{item.quantity}</span>
                                                <button
                                                    onClick={() => updateQuantity(item.id, item.quantity + 1)}
                                                    className="px-2 py-1 text-gray-500 hover:bg-gray-50 transition"
                                                >
                                                    <Plus size={12} />
                                                </button>
                                            </div>
                                            <p className="font-medium text-sm">₩{(item.price * item.quantity).toLocaleString()}</p>
                                        </div>
                                    </div>
                                </div>
                            );
                        })
                    )}
                </div>

                {/* Footer */}
                {cart.length > 0 && (
                    <div className="p-6 border-t border-gray-100 bg-gray-50">
                        <div className="flex justify-between items-center mb-4 text-lg font-bold">
                            <span>소계</span>
                            <span>₩{total.toLocaleString()}</span>
                        </div>
                        <p className="text-xs text-gray-500 mb-4 text-center">배송비 및 세금은 결제 단계에서 계산됩니다.</p>
                        <div className="space-y-3">
                            <button
                                onClick={() => { onClose(); navigate('/checkout'); }}
                                className="w-full bg-black text-white py-3 uppercase tracking-widest text-sm hover:bg-gray-800 transition"
                            >
                                결제하기
                            </button>
                            <button
                                onClick={() => { onClose(); navigate('/cart'); }}
                                className="w-full border border-black text-black py-3 uppercase tracking-widest text-sm hover:bg-white transition"
                            >
                                장바구니 보기
                            </button>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default CartDrawer;

