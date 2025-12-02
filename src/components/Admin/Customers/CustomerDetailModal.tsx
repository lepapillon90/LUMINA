import React, { useState, useEffect } from 'react';
import { Customer, Order } from '../../../types';
import { X, User, Phone, Mail, Calendar, CreditCard, Star, Package } from 'lucide-react';
import { getCustomerOrders } from '../../../services/customerService';

interface CustomerDetailModalProps {
    isOpen: boolean;
    onClose: () => void;
    customer: Customer | null;
}

const CustomerDetailModal: React.FC<CustomerDetailModalProps> = ({ isOpen, onClose, customer }) => {
    const [orders, setOrders] = useState<Order[]>([]);
    const [loadingOrders, setLoadingOrders] = useState(false);

    useEffect(() => {
        if (isOpen && customer) {
            loadOrders();
        }
    }, [isOpen, customer]);

    const loadOrders = async () => {
        if (!customer) return;
        setLoadingOrders(true);
        try {
            const data = await getCustomerOrders(customer.id);
            setOrders(data);
        } catch (error) {
            console.error('[MY_LOG] Error loading customer orders:', error);
        } finally {
            setLoadingOrders(false);
        }
    };

    if (!isOpen || !customer) return null;

    return (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4 backdrop-blur-sm">
            <div className="bg-white rounded-lg shadow-2xl max-w-2xl w-full p-6 max-h-[90vh] overflow-y-auto">
                <div className="flex justify-between items-center mb-6 border-b pb-4">
                    <h2 className="text-xl font-bold text-gray-800 flex items-center gap-2">
                        <User size={24} /> 고객 상세 정보
                    </h2>
                    <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
                        <X size={24} />
                    </button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
                    <div className="space-y-4">
                        <div className="flex items-center gap-3">
                            <div className="w-16 h-16 rounded-full bg-gray-100 flex items-center justify-center text-2xl font-bold text-gray-500">
                                {customer.name[0]}
                            </div>
                            <div>
                                <h3 className="text-lg font-bold text-gray-900">{customer.name}</h3>
                                <span className={`px-2 py-0.5 rounded-full text-xs font-medium border ${customer.grade === 'VIP' ? 'bg-purple-50 text-purple-700 border-purple-100' :
                                        customer.grade === 'Gold' ? 'bg-yellow-50 text-yellow-700 border-yellow-100' :
                                            customer.grade === 'Silver' ? 'bg-gray-50 text-gray-700 border-gray-200' : 'bg-orange-50 text-orange-700 border-orange-100'
                                    }`}>
                                    {customer.grade}
                                </span>
                            </div>
                        </div>
                    </div>

                    <div className="space-y-3 text-sm">
                        <div className="flex items-center gap-2 text-gray-600">
                            <Phone size={16} /> {customer.phone}
                        </div>
                        <div className="flex items-center gap-2 text-gray-600">
                            <Mail size={16} /> {customer.email}
                        </div>
                        <div className="flex items-center gap-2 text-gray-600">
                            <Calendar size={16} /> 가입일: {customer.joinDate}
                        </div>
                        <div className="flex items-center gap-2 text-gray-600">
                            <CreditCard size={16} /> 총 구매액: ₩{customer.totalSpent.toLocaleString()}
                        </div>
                    </div>
                </div>

                <div className="border-t pt-6">
                    <h3 className="font-bold text-gray-800 mb-4 flex items-center gap-2">
                        <Package size={18} /> 주문 내역 ({orders.length}건)
                    </h3>
                    {loadingOrders ? (
                        <div className="bg-gray-50 rounded-lg p-4 text-center text-gray-500 text-sm">
                            로딩 중...
                        </div>
                    ) : orders.length === 0 ? (
                        <div className="bg-gray-50 rounded-lg p-4 text-center text-gray-500 text-sm">
                            주문 내역이 없습니다.
                        </div>
                    ) : (
                        <div className="space-y-3 max-h-[400px] overflow-y-auto">
                            {orders.map(order => (
                                <div key={order.id} className="bg-gray-50 rounded-lg p-4 border border-gray-200">
                                    <div className="flex justify-between items-start mb-2">
                                        <div>
                                            <p className="font-medium text-gray-900">주문 #{order.id.slice(0, 8)}</p>
                                            <p className="text-xs text-gray-500">
                                                {order.createdAt 
                                                    ? (order.createdAt instanceof Date 
                                                        ? order.createdAt 
                                                        : order.createdAt.toDate?.() || new Date(order.createdAt)).toLocaleDateString('ko-KR')
                                                    : '-'}
                                            </p>
                                        </div>
                                        <span className={`px-2 py-1 rounded text-xs font-medium ${
                                            order.status === 'completed' ? 'bg-green-100 text-green-700' :
                                            order.status === 'pending' ? 'bg-yellow-100 text-yellow-700' :
                                            order.status === 'cancelled' ? 'bg-red-100 text-red-700' :
                                            'bg-gray-100 text-gray-700'
                                        }`}>
                                            {order.status === 'completed' ? '완료' :
                                             order.status === 'pending' ? '대기' :
                                             order.status === 'cancelled' ? '취소' :
                                             order.status || '알 수 없음'}
                                        </span>
                                    </div>
                                    <div className="flex justify-between items-center">
                                        <div className="text-sm text-gray-600">
                                            {order.items?.length || 0}개 상품
                                        </div>
                                        <div className="font-bold text-gray-900">
                                            ₩{order.total?.toLocaleString() || '0'}
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>

                <div className="mt-8 flex justify-end">
                    <button onClick={onClose} className="px-4 py-2 bg-gray-800 text-white rounded-sm hover:bg-gray-700">
                        닫기
                    </button>
                </div>
            </div>
        </div>
    );
};

export default CustomerDetailModal;
