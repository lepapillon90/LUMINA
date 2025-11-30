import React, { useState } from 'react';
import { Users, Plus, Search, Maximize2, FileText } from 'lucide-react';
import { Customer } from '../../../types';
import CustomerDetailModal from './CustomerDetailModal';
import CustomerMemoModal from './CustomerMemoModal';

interface CustomerManagerProps {
    customers: Customer[];
    setCustomers: React.Dispatch<React.SetStateAction<Customer[]>>;
}

const CustomerManager: React.FC<CustomerManagerProps> = ({ customers, setCustomers }) => {
    const [customerFilter, setCustomerFilter] = useState<'all' | 'vip' | 'at_risk' | 'potential'>('all');
    const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null);
    const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
    const [isMemoModalOpen, setIsMemoModalOpen] = useState(false);

    // CRM Logic: Calculate Stats
    const totalCustomers = customers.length;
    const newCustomers = customers.filter(c => {
        const join = new Date(c.joinDate);
        const now = new Date();
        return join.getMonth() === now.getMonth() && join.getFullYear() === now.getFullYear();
    }).length;
    const vipCustomers = customers.filter(c => c.grade === 'VIP').length;
    const atRiskCustomers = customers.filter(c => c.status === 'inactive' || !c.lastLoginDate).length;

    // Filter Logic
    const filteredCustomers = customers.filter(c => {
        if (customerFilter === 'all') return true;
        if (customerFilter === 'vip') return c.grade === 'VIP';
        if (customerFilter === 'at_risk') return c.status === 'inactive';
        if (customerFilter === 'potential') return c.totalSpent === 0;
        return true;
    });

    const handleViewDetails = (customer: Customer) => {
        setSelectedCustomer(customer);
        setIsDetailModalOpen(true);
    };

    const handleOpenMemo = (customer: Customer) => {
        setSelectedCustomer(customer);
        setIsMemoModalOpen(true);
    };

    const handleSaveMemo = (customerId: string, memo: string) => {
        setCustomers(prev => prev.map(c => c.id === customerId ? { ...c, memo } : c));
        alert('메모가 저장되었습니다.');
    };

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <h2 className="text-xl font-bold text-gray-800 flex items-center gap-2">
                    <Users size={20} /> 고객 관리 (CRM)
                </h2>
                <button className="bg-black text-white px-4 py-2 rounded-sm text-sm hover:bg-gray-800 transition flex items-center gap-2">
                    <Plus size={16} /> 고객 수동 등록
                </button>
            </div>

            {/* CRM Stats Cards */}
            <div className="grid grid-cols-4 gap-4">
                <div className="bg-white p-4 rounded-lg border border-gray-200 shadow-sm">
                    <p className="text-xs text-gray-500 mb-1">총 회원수</p>
                    <p className="text-2xl font-bold text-gray-900">{totalCustomers.toLocaleString()}</p>
                </div>
                <div className="bg-white p-4 rounded-lg border border-gray-200 shadow-sm">
                    <p className="text-xs text-gray-500 mb-1">신규 회원 (이번달)</p>
                    <p className="text-2xl font-bold text-blue-600">+{newCustomers}</p>
                </div>
                <div className="bg-white p-4 rounded-lg border border-gray-200 shadow-sm">
                    <p className="text-xs text-gray-500 mb-1">VIP 회원</p>
                    <p className="text-2xl font-bold text-purple-600">{vipCustomers}</p>
                </div>
                <div className="bg-white p-4 rounded-lg border border-gray-200 shadow-sm">
                    <p className="text-xs text-gray-500 mb-1">이탈 위험</p>
                    <p className="text-2xl font-bold text-red-500">{atRiskCustomers}</p>
                </div>
            </div>

            <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
                {/* Filters & Search */}
                <div className="p-4 border-b border-gray-200 flex flex-col md:flex-row justify-between items-center gap-4 bg-gray-50">
                    <div className="flex space-x-2">
                        {[
                            { id: 'all', label: '전체' },
                            { id: 'vip', label: 'VIP' },
                            { id: 'at_risk', label: '이탈위험' },
                            { id: 'potential', label: '잠재고객' }
                        ].map(tab => (
                            <button
                                key={tab.id}
                                onClick={() => setCustomerFilter(tab.id as any)}
                                className={`px-3 py-1.5 text-sm rounded-sm transition ${customerFilter === tab.id
                                    ? 'bg-black text-white font-medium'
                                    : 'bg-white text-gray-600 border border-gray-300 hover:bg-gray-50'
                                    }`}
                            >
                                {tab.label}
                            </button>
                        ))}
                    </div>
                    <div className="flex items-center w-full md:w-auto bg-white border border-gray-300 rounded-sm px-3 py-1.5">
                        <Search size={16} className="text-gray-400 mr-2" />
                        <input type="text" placeholder="회원명, 아이디, 전화번호" className="text-sm w-full focus:outline-none" />
                    </div>
                </div>

                <div className="overflow-x-auto">
                    <table className="w-full text-left text-sm">
                        <thead className="bg-white text-gray-600 border-b border-gray-200">
                            <tr>
                                <th className="px-6 py-3 font-medium">고객명</th>
                                <th className="px-6 py-3 font-medium">연락처/이메일</th>
                                <th className="px-6 py-3 font-medium">최근 접속</th>
                                <th className="px-6 py-3 font-medium">총 구매액</th>
                                <th className="px-6 py-3 font-medium">등급/상태</th>
                                <th className="px-6 py-3 font-medium text-right">관리</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-50">
                            {filteredCustomers.map(customer => (
                                <tr key={customer.id} className="hover:bg-gray-50 transition group">
                                    <td className="px-6 py-4 font-medium text-gray-800">
                                        <div className="flex items-center gap-2">
                                            <div className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center text-xs font-bold text-gray-500">
                                                {customer.name[0]}
                                            </div>
                                            {customer.name}
                                        </div>
                                    </td>
                                    <td className="px-6 py-4">
                                        <p className="text-gray-900">{customer.phone}</p>
                                        <p className="text-xs text-gray-400">{customer.email}</p>
                                    </td>
                                    <td className="px-6 py-4 text-gray-600">
                                        {customer.lastLoginDate || '-'}
                                        {customer.status === 'inactive' && <span className="ml-2 text-[10px] text-red-500 font-bold">휴면</span>}
                                    </td>
                                    <td className="px-6 py-4 text-slate-700">₩{customer.totalSpent.toLocaleString()}</td>
                                    <td className="px-6 py-4">
                                        <span className={`px-2 py-0.5 rounded-sm text-xs font-medium border
                      ${customer.grade === 'VIP' ? 'bg-purple-50 text-purple-700 border-purple-100' :
                                                customer.grade === 'Gold' ? 'bg-yellow-50 text-yellow-700 border-yellow-100' :
                                                    customer.grade === 'Silver' ? 'bg-gray-50 text-gray-700 border-gray-200' : 'bg-orange-50 text-orange-700 border-orange-100'}`}>
                                            {customer.grade}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 text-right">
                                        <button
                                            onClick={() => handleViewDetails(customer)}
                                            className="text-gray-400 hover:text-blue-600 mr-2"
                                            title="상세보기"
                                        >
                                            <Maximize2 size={16} />
                                        </button>
                                        <button
                                            onClick={() => handleOpenMemo(customer)}
                                            className="text-gray-400 hover:text-gray-800"
                                            title="메모"
                                        >
                                            <FileText size={16} />
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>

            <CustomerDetailModal
                isOpen={isDetailModalOpen}
                onClose={() => setIsDetailModalOpen(false)}
                customer={selectedCustomer}
            />

            <CustomerMemoModal
                isOpen={isMemoModalOpen}
                onClose={() => setIsMemoModalOpen(false)}
                customer={selectedCustomer}
                onSave={handleSaveMemo}
            />
        </div>
    );
};

export default CustomerManager;
