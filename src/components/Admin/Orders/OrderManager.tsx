import React, { useState } from 'react';
import { ShoppingCart, Search, Printer, MoreHorizontal } from 'lucide-react';
import { Order } from '../../../types';
import InvoiceModal from './InvoiceModal';

interface OrderManagerProps {
    orders: Order[];
    setOrders: React.Dispatch<React.SetStateAction<Order[]>>;
}

const OrderManager: React.FC<OrderManagerProps> = ({ orders, setOrders }) => {
    const [selectedOrderIds, setSelectedOrderIds] = useState<string[]>([]);
    const [isInvoiceModalOpen, setIsInvoiceModalOpen] = useState(false);

    const statusColors: Record<string, string> = {
        '입금대기': 'bg-yellow-50 border border-yellow-100 text-yellow-700',
        '결제완료': 'bg-blue-50 border border-blue-100 text-blue-600',
        '배송중': 'bg-indigo-50 border border-indigo-100 text-indigo-600',
        '배송완료': 'bg-gray-100 border border-gray-200 text-gray-500'
    };

    const handleSelectAll = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.checked) {
            setSelectedOrderIds(orders.map(o => o.id));
        } else {
            setSelectedOrderIds([]);
        }
    };

    const handleSelectOrder = (id: string) => {
        setSelectedOrderIds(prev =>
            prev.includes(id) ? prev.filter(oid => oid !== id) : [...prev, id]
        );
    };

    const handleBatchStatusChange = (newStatus: string) => {
        if (selectedOrderIds.length === 0) return;
        if (window.confirm(`선택한 ${selectedOrderIds.length}개의 주문 상태를 '${newStatus}'(으)로 변경하시겠습니까?`)) {
            setOrders(prev => prev.map(o => selectedOrderIds.includes(o.id) ? { ...o, status: newStatus } : o));
            setSelectedOrderIds([]); // Clear selection after update
            // TODO: Call API/Service here
        }
    };

    const handlePrintInvoice = () => {
        if (selectedOrderIds.length === 0) return;
        setIsInvoiceModalOpen(true);
    };

    return (
        <div className="space-y-6">
            <h2 className="text-xl font-bold text-gray-800 flex items-center gap-2">
                <ShoppingCart size={20} /> 주문 관리
            </h2>

            <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
                <div className="p-4 border-b border-gray-200 flex items-center bg-gray-50 justify-between">
                    <div className="flex items-center gap-4">
                        <div className="flex items-center bg-white border border-gray-300 px-3 py-1.5 rounded-sm w-80">
                            <Search size={16} className="text-gray-400 mr-2" />
                            <input
                                type="text"
                                placeholder="주문자명, 주문번호 검색"
                                className="bg-transparent border-none focus:outline-none text-sm w-full"
                            />
                        </div>
                        {selectedOrderIds.length > 0 && (
                            <div className="flex items-center gap-2 animate-fadeIn">
                                <span className="text-sm text-blue-600 font-bold">{selectedOrderIds.length}개 선택됨</span>
                                <div className="h-4 w-px bg-gray-300 mx-2"></div>
                                <select
                                    onChange={(e) => handleBatchStatusChange(e.target.value)}
                                    className="px-3 py-1.5 border border-blue-200 rounded-sm text-xs font-medium text-blue-700 bg-blue-50 hover:bg-blue-100 cursor-pointer outline-none"
                                    value=""
                                >
                                    <option value="" disabled>상태 일괄 변경</option>
                                    <option value="입금대기">입금대기</option>
                                    <option value="결제완료">결제완료</option>
                                    <option value="배송중">배송중</option>
                                    <option value="배송완료">배송완료</option>
                                </select>
                                <button
                                    onClick={handlePrintInvoice}
                                    className="flex items-center gap-1 px-3 py-1.5 border border-gray-300 rounded-sm text-xs font-medium hover:bg-white text-gray-700"
                                >
                                    <Printer size={14} />
                                    <span>송장 출력</span>
                                </button>
                            </div>
                        )}
                    </div>
                    <div className="space-x-2">
                        <button className="px-3 py-1.5 bg-white border border-gray-300 text-xs rounded-sm hover:bg-gray-50">엑셀 다운로드</button>
                    </div>
                </div>
                <div className="overflow-x-auto">
                    <table className="w-full text-left text-sm">
                        <thead className="bg-white text-gray-600 border-b border-gray-200">
                            <tr>
                                <th className="px-6 py-3 font-medium w-10">
                                    <input
                                        type="checkbox"
                                        onChange={handleSelectAll}
                                        checked={orders.length > 0 && selectedOrderIds.length === orders.length}
                                        className="rounded text-blue-500 focus:ring-blue-500"
                                    />
                                </th>
                                <th className="px-6 py-3 font-medium">주문번호</th>
                                <th className="px-6 py-3 font-medium">주문일자</th>
                                <th className="px-6 py-3 font-medium">고객명</th>
                                <th className="px-6 py-3 font-medium">결제금액</th>
                                <th className="px-6 py-3 font-medium">상태</th>
                                <th className="px-6 py-3 font-medium text-right">상세</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-50">
                            {orders.map(order => (
                                <tr key={order.id} className="hover:bg-gray-50 transition group">
                                    <td className="px-6 py-4">
                                        <input
                                            type="checkbox"
                                            checked={selectedOrderIds.includes(order.id)}
                                            onChange={() => handleSelectOrder(order.id)}
                                            className="rounded text-blue-500 focus:ring-blue-500"
                                        />
                                    </td>
                                    <td className="px-6 py-4 font-medium text-gray-900">{order.id}</td>
                                    <td className="px-6 py-4 text-gray-500">{order.date}</td>
                                    <td className="px-6 py-4 font-medium text-gray-800">{order.customerName}</td>
                                    <td className="px-6 py-4 text-gray-600">₩{order.total.toLocaleString()}</td>
                                    <td className="px-6 py-4">
                                        <span className={`px-2 py-1 rounded-sm text-xs font-medium ${statusColors[order.status] || 'bg-gray-100 text-gray-600'}`}>
                                            {order.status}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 text-right">
                                        <button className="text-gray-400 hover:text-blue-600 transition">
                                            <MoreHorizontal size={18} />
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>

            {isInvoiceModalOpen && (
                <InvoiceModal
                    orders={orders.filter(o => selectedOrderIds.includes(o.id))}
                    onClose={() => setIsInvoiceModalOpen(false)}
                />
            )}
        </div>
    );
};

export default OrderManager;
