import React from 'react';
import { Customer } from '../../../types';
import { X, User, Phone, Mail, Calendar, CreditCard, Star } from 'lucide-react';

interface CustomerDetailModalProps {
    isOpen: boolean;
    onClose: () => void;
    customer: Customer | null;
}

const CustomerDetailModal: React.FC<CustomerDetailModalProps> = ({ isOpen, onClose, customer }) => {
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
                        <Star size={18} /> 최근 주문 내역
                    </h3>
                    <div className="bg-gray-50 rounded-lg p-4 text-center text-gray-500 text-sm">
                        최근 주문 내역이 없습니다.
                    </div>
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
