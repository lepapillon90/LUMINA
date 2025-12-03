import React from 'react';
import { X, Package, MapPin, CreditCard, User } from 'lucide-react';
import { Order } from '../../../types';

interface OrderDetailModalProps {
    order: Order;
    onClose: () => void;
}

const OrderDetailModal: React.FC<OrderDetailModalProps> = ({ order, onClose }) => {
    if (!order) return null;

    return (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4 backdrop-blur-sm animate-fadeIn">
            <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-hidden flex flex-col animate-scaleIn">
                {/* Header */}
                <div className="flex justify-between items-center p-6 border-b border-gray-100">
                    <div>
                        <h2 className="text-xl font-bold text-gray-800 font-serif">Order Details</h2>
                        <p className="text-sm text-gray-500 mt-1">주문번호: <span className="font-mono text-gray-700">{order.id}</span></p>
                    </div>
                    <button onClick={onClose} className="text-gray-400 hover:text-gray-600 transition">
                        <X size={24} />
                    </button>
                </div>

                {/* Body */}
                <div className="flex-1 overflow-y-auto p-6 space-y-8">
                    {/* Status & Date */}
                    <div className="flex justify-between items-center bg-gray-50 p-4 rounded-lg border border-gray-100">
                        <div>
                            <p className="text-xs text-gray-500 uppercase mb-1">Order Date</p>
                            <p className="font-medium text-gray-900">{order.date}</p>
                        </div>
                        <div className="text-right">
                            <p className="text-xs text-gray-500 uppercase mb-1">Status</p>
                            <span className={`px-3 py-1 rounded-full text-xs font-bold 
                                ${order.status === '입금대기' ? 'bg-yellow-100 text-yellow-700' :
                                    order.status === '결제완료' ? 'bg-blue-100 text-blue-700' :
                                        order.status === '배송준비' ? 'bg-purple-100 text-purple-700' :
                                            order.status === '배송중' ? 'bg-indigo-100 text-indigo-700' :
                                                'bg-gray-100 text-gray-700'}`}>
                                {order.status}
                            </span>
                        </div>
                    </div>

                    {/* Order Items */}
                    <div>
                        <h3 className="text-sm font-bold text-gray-900 uppercase tracking-wider mb-4 flex items-center gap-2">
                            <Package size={16} /> Ordered Items
                        </h3>
                        <div className="space-y-4">
                            {order.items.map((item, index) => (
                                <div key={`${item.id}-${index}`} className="flex gap-4 items-start border-b border-gray-50 pb-4 last:border-0">
                                    <div className="w-16 h-16 bg-gray-100 rounded-md overflow-hidden flex-shrink-0">
                                        <img src={item.image} alt={item.name} className="w-full h-full object-cover" />
                                    </div>
                                    <div className="flex-1">
                                        <div className="flex justify-between items-start">
                                            <h4 className="font-medium text-gray-900">{item.name}</h4>
                                            <p className="font-medium text-gray-900">₩{(item.price * item.quantity).toLocaleString()}</p>
                                        </div>
                                        <p className="text-sm text-gray-500 mt-1">
                                            {item.category}
                                            {item.material && ` / ${item.material}`}
                                            {item.selectedSize && ` / Size: ${item.selectedSize}`}
                                            {item.selectedColor && ` / Color: ${item.selectedColor}`}
                                        </p>
                                        <p className="text-sm text-gray-500 mt-1">Qty: {item.quantity}</p>
                                    </div>
                                </div>
                            ))}
                        </div>
                        <div className="mt-4 pt-4 border-t border-gray-100 flex justify-between items-center">
                            <span className="font-medium text-gray-900">Total Amount</span>
                            <span className="text-xl font-bold text-primary">₩{order.total.toLocaleString()}</span>
                        </div>
                    </div>

                    {/* Customer & Shipping Info */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                            <h3 className="text-sm font-bold text-gray-900 uppercase tracking-wider mb-4 flex items-center gap-2">
                                <User size={16} /> Customer
                            </h3>
                            <div className="bg-gray-50 p-4 rounded-lg border border-gray-100 text-sm space-y-2">
                                <p><span className="text-gray-500 w-16 inline-block">Name:</span> {order.customerName}</p>
                                <p><span className="text-gray-500 w-16 inline-block">Email:</span> {order.email || order.userId || '-'}</p>
                            </div>
                        </div>
                        <div>
                            <h3 className="text-sm font-bold text-gray-900 uppercase tracking-wider mb-4 flex items-center gap-2">
                                <MapPin size={16} /> Shipping
                            </h3>
                            <div className="bg-gray-50 p-4 rounded-lg border border-gray-100 text-sm">
                                <p className="text-gray-600 leading-relaxed">
                                    {/* Assuming address is part of user profile or stored in order, 
                                       but currently Order type doesn't have address. 
                                       Displaying placeholder or if we add address to Order type later. */}
                                    (배송지 정보가 주문 데이터에 포함되지 않았습니다.)
                                </p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Footer */}
                <div className="p-6 border-t border-gray-100 bg-gray-50 flex justify-end">
                    <button
                        onClick={onClose}
                        className="px-6 py-2 bg-white border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50 transition shadow-sm"
                    >
                        Close
                    </button>
                </div>
            </div>
        </div>
    );
};

export default OrderDetailModal;
