import React, { useState } from 'react';
import { ShoppingCart, Search, Printer, MoreHorizontal, Download, Trash2 } from 'lucide-react';
import { Order, User } from '../../../types';
import InvoiceModal from './InvoiceModal';
import OrderDetailModal from './OrderDetailModal';
import { updateOrderStatuses, deleteOrder } from '../../../services/orderService';
import ConfirmModal from '../Shared/ConfirmModal';
import { useGlobalModal } from '../../../contexts/GlobalModalContext';

interface OrderManagerProps {
    orders: Order[];
    setOrders: React.Dispatch<React.SetStateAction<Order[]>>;
    user: User | null;
}

const OrderManager: React.FC<OrderManagerProps> = ({ orders, setOrders, user }) => {
    const [selectedOrderIds, setSelectedOrderIds] = useState<string[]>([]);
    const [isInvoiceModalOpen, setIsInvoiceModalOpen] = useState(false);
    const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
    const [selectedBatchStatus, setSelectedBatchStatus] = useState<string>('');
    const [isConfirmModalOpen, setIsConfirmModalOpen] = useState(false);
    const { showConfirm, showAlert } = useGlobalModal();

    const statusColors: Record<string, string> = {
        '입금대기': 'bg-yellow-50 border border-yellow-100 text-yellow-700',
        '결제완료': 'bg-blue-50 border border-blue-100 text-blue-600',
        '배송준비': 'bg-purple-50 border border-purple-100 text-purple-600',
        '배송중': 'bg-indigo-50 border border-indigo-100 text-indigo-600',
        '배송완료': 'bg-gray-100 border border-gray-200 text-gray-500',
        '주문취소': 'bg-red-50 border border-red-100 text-red-600',
        '취소요청': 'bg-orange-50 border border-orange-100 text-orange-600'
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

    const handleBatchStatusClick = () => {
        if (selectedOrderIds.length === 0 || !selectedBatchStatus) return;
        setIsConfirmModalOpen(true);
    };

    const executeBatchStatusChange = async () => {
        if (!user) {
            await showAlert('사용자 정보를 찾을 수 없습니다.', '오류');
            return;
        }
        try {
            await updateOrderStatuses(selectedOrderIds, selectedBatchStatus, { uid: user.uid, username: user.username });
            setOrders(prev => prev.map(o => selectedOrderIds.includes(o.id) ? { ...o, status: selectedBatchStatus } : o));
            setSelectedOrderIds([]); // Clear selection after update
            setSelectedBatchStatus(''); // Reset status selection
            setIsConfirmModalOpen(false);
            await showAlert('주문 상태가 변경되었습니다.', '알림');
        } catch (error) {
            console.error("Failed to update order status:", error);
            await showAlert('주문 상태 변경에 실패했습니다.', '오류');
            setIsConfirmModalOpen(false);
        }
    };

    const handleDeleteOrder = async (orderId: string) => {
        const confirmed = await showConfirm(
            '정말로 이 주문 내역을 삭제하시겠습니까? 삭제 후에는 복구할 수 없습니다.',
            '주문 내역 삭제',
            true
        );

        if (confirmed) {
            try {
                await deleteOrder(orderId);
                setOrders(prev => prev.filter(o => o.id !== orderId));
                await showAlert('주문 내역이 삭제되었습니다.', '삭제 완료');
            } catch (error) {
                console.error("Failed to delete order:", error);
                await showAlert('주문 내역 삭제에 실패했습니다.', '오류');
            }
        }
    };

    const handlePrintInvoice = () => {
        if (selectedOrderIds.length === 0) return;
        setIsInvoiceModalOpen(true);
    };

    const handleExcelDownload = () => {
        const headers = ['Order ID', 'Date', 'Customer Name', 'Login ID', 'Total Amount', 'Status', 'Items Count'];
        const rows = orders.map(order => [
            order.id,
            order.date,
            order.customerName,
            order.email || order.userId || '-',
            order.total,
            order.status,
            order.items.length
        ]);
        const csvContent = [
            headers.join(','),
            ...rows.map(row => row.join(','))
        ].join('\n');
        const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.setAttribute('href', url);
        link.setAttribute('download', `orders_export_${new Date().toISOString().split('T')[0]}.csv`);
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
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
                        <select
                            value={selectedBatchStatus}
                            onChange={(e) => setSelectedBatchStatus(e.target.value)}
                            className="bg-white border border-gray-300 text-gray-700 text-sm rounded-sm focus:ring-blue-500 focus:border-blue-500 block p-1.5"
                        >
                            <option value="">상태 변경 선택</option>
                            <option value="입금대기">입금대기</option>
                            <option value="결제완료">결제완료</option>
                            <option value="배송준비">배송준비</option>
                            <option value="배송중">배송중</option>
                            <option value="배송완료">배송완료</option>
                            <option value="취소요청">취소요청</option>
                            <option value="주문취소">주문취소</option>
                        </select>
                        <button
                            onClick={handleBatchStatusClick}
                            disabled={!selectedBatchStatus}
                            className={`px-3 py-1.5 rounded-sm text-xs font-bold transition
                                        ${selectedBatchStatus
                                    ? 'bg-blue-600 text-white hover:bg-blue-700 shadow-sm'
                                    : 'bg-gray-100 text-gray-400 cursor-not-allowed'}`}
                        >
                            변경
                        </button>
                        <div className="h-4 w-px bg-gray-300 mx-2"></div>
                        <button
                            onClick={handlePrintInvoice}
                            className="flex items-center gap-1 px-3 py-1.5 border border-gray-300 rounded-sm text-xs font-medium hover:bg-white text-gray-700"
                        >
                            <Printer size={14} />
                            <span>송장 출력</span>
                        </button>
                    </div>
                    <div className="space-x-2">
                        <button
                            onClick={handleExcelDownload}
                            className="flex items-center gap-1 px-3 py-1.5 bg-white border border-gray-300 text-xs rounded-sm hover:bg-gray-50 transition"
                        >
                            <Download size={14} />
                            엑셀 다운로드
                        </button>
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
                                <th className="px-6 py-3 font-medium">로그인 아이디</th>
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
                                    <td className="px-6 py-4 text-gray-600 text-xs">{order.email || order.userId || '-'}</td>
                                    <td className="px-6 py-4 text-gray-600">₩{order.total.toLocaleString()}</td>
                                    <td className="px-6 py-4">
                                        <span className={`px-2 py-1 rounded-sm text-xs font-medium ${statusColors[order.status] || 'bg-gray-100 text-gray-600'}`}>
                                            {order.status}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 text-right flex justify-end gap-2">
                                        {order.status === '주문취소' && (
                                            <button
                                                onClick={() => handleDeleteOrder(order.id)}
                                                className="text-gray-400 hover:text-red-600 transition"
                                                title="주문 내역 삭제"
                                            >
                                                <Trash2 size={18} />
                                            </button>
                                        )}
                                        <button
                                            onClick={() => setSelectedOrder(order)}
                                            className="text-gray-400 hover:text-blue-600 transition"
                                        >
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

            {selectedOrder && (
                <OrderDetailModal
                    order={selectedOrder}
                    onClose={() => setSelectedOrder(null)}
                />
            )}

            <ConfirmModal
                isOpen={isConfirmModalOpen}
                onClose={() => setIsConfirmModalOpen(false)}
                onConfirm={executeBatchStatusChange}
                title="주문 상태 변경"
                message={`선택한 ${selectedOrderIds.length}개의 주문 상태를 '${selectedBatchStatus}'(으)로 변경하시겠습니까?`}
                confirmLabel="변경"
                isDestructive={false}
            />
        </div>
    );
};

export default OrderManager;
