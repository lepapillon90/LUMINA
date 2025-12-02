import React, { useState } from 'react';
import { Order, Product } from '../../types';
import { Package, ChevronRight, Download, RefreshCw, Truck } from 'lucide-react';
import ConfirmModal from '../common/ConfirmModal';
import { useCart } from '../../contexts';
import { useGlobalModal } from '../../contexts/GlobalModalContext';

interface OrderHistoryProps {
    orders: Order[];
    loading: boolean;
    onCancelOrder: (orderId: string) => void;
}

const OrderHistory: React.FC<OrderHistoryProps> = ({ orders, loading, onCancelOrder }) => {
    const [isConfirmModalOpen, setIsConfirmModalOpen] = useState(false);
    const [selectedOrderId, setSelectedOrderId] = useState<string | null>(null);
    const { addToCart } = useCart();
    const { showAlert } = useGlobalModal();

    const handleCancelClick = (orderId: string) => {
        setSelectedOrderId(orderId);
        setIsConfirmModalOpen(true);
    };

    const handleConfirmCancel = () => {
        if (selectedOrderId) {
            onCancelOrder(selectedOrderId);
        }
        setIsConfirmModalOpen(false);
        setSelectedOrderId(null);
    };

    const handleBuyAgain = (items: any[]) => {
        items.forEach(item => addToCart(item, item.quantity || 1));
        showAlert("상품이 장바구니에 담겼습니다.", "장바구니 추가");
    };

    const handleDownloadReceipt = (orderId: string) => {
        // Simulate PDF download
        showAlert(`영수증(PDF)이 다운로드되었습니다. (주문번호: ${orderId})`, "다운로드 완료");
    };

    const getDeliveryProgress = (status: string) => {
        const steps = ['입금대기', '결제완료', '배송준비', '배송중', '배송완료'];
        const currentIdx = steps.indexOf(status);
        if (currentIdx === -1) return 0;
        return ((currentIdx + 1) / steps.length) * 100;
    };

    if (loading) {
        return <div className="text-center py-10 text-gray-500">주문 내역을 불러오는 중...</div>;
    }

    if (orders.length === 0) {
        return (
            <div className="text-center py-16 bg-gray-50 rounded-lg border border-gray-100">
                <Package className="mx-auto h-12 w-12 text-gray-300 mb-4" />
                <p className="text-gray-500">아직 주문 내역이 없습니다.</p>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            {orders.map((order) => (
                <div key={order.id} className="bg-white border border-gray-200 rounded-lg overflow-hidden hover:shadow-sm transition-shadow">
                    <div className="bg-gray-50 px-6 py-4 flex justify-between items-center border-b border-gray-100">
                        <div>
                            <span className="font-bold text-gray-900 mr-3">{order.date}</span>
                            <span className="text-sm text-gray-500">주문번호 {order.id.substring(0, 8)}</span>
                        </div>
                        <div className="flex items-center gap-3">
                            <span className={`text-sm font-medium px-3 py-1 rounded-full ${order.status === '결제완료' ? 'bg-green-100 text-green-700' :
                                order.status === '배송중' ? 'bg-blue-100 text-blue-700' :
                                    order.status === '주문취소' ? 'bg-red-100 text-red-700' :
                                        order.status === '취소요청' ? 'bg-orange-100 text-orange-700' :
                                            'bg-gray-100 text-gray-700'
                                }`}>
                                {order.status}
                            </span>
                            {(order.status === '입금대기' || order.status === '결제완료') && (
                                <button
                                    onClick={() => handleCancelClick(order.id)}
                                    className="text-xs border border-gray-300 px-2 py-1 rounded hover:bg-gray-100 text-gray-600 transition-colors"
                                >
                                    주문취소
                                </button>
                            )}
                            <button className="text-gray-400 hover:text-gray-600">
                                <ChevronRight size={20} />
                            </button>
                        </div>
                    </div>

                    {/* Delivery Tracking Bar */}
                    {['결제완료', '배송준비', '배송중', '배송완료'].includes(order.status) && (
                        <div className="px-6 py-4 border-b border-gray-100">
                            <div className="flex items-center justify-between text-xs text-gray-500 mb-2">
                                <span>결제완료</span>
                                <span>배송준비</span>
                                <span>배송중</span>
                                <span>배송완료</span>
                            </div>
                            <div className="w-full bg-gray-200 rounded-full h-2">
                                <div
                                    className="bg-primary h-2 rounded-full transition-all duration-500"
                                    style={{ width: `${getDeliveryProgress(order.status)}%` }}
                                ></div>
                            </div>
                        </div>
                    )}

                    <div className="p-6">
                        <div className="space-y-4">
                            {order.items && order.items.map((item, idx) => (
                                <div key={idx} className="flex items-center">
                                    <div className="h-16 w-16 flex-shrink-0 overflow-hidden rounded border border-gray-200">
                                        <img
                                            src={item.image}
                                            alt={item.name}
                                            className="h-full w-full object-cover object-center"
                                        />
                                    </div>
                                    <div className="ml-4 flex-1">
                                        <h3 className="text-sm font-medium text-gray-900">{item.name}</h3>
                                        <p className="text-sm text-gray-500">{item.quantity}개 / ₩{item.price.toLocaleString()}</p>
                                    </div>
                                </div>
                            ))}
                        </div>
                        <div className="mt-6 flex justify-between items-center pt-4 border-t border-gray-100">
                            <div className="flex gap-2">
                                <button
                                    onClick={() => handleDownloadReceipt(order.id)}
                                    className="flex items-center gap-1 text-xs text-gray-500 hover:text-black border border-gray-200 px-3 py-1.5 rounded transition"
                                >
                                    <Download size={14} /> 영수증
                                </button>
                                <button
                                    onClick={() => handleBuyAgain(order.items)}
                                    className="flex items-center gap-1 text-xs text-primary hover:text-primary-dark border border-primary/30 px-3 py-1.5 rounded transition bg-primary/5"
                                >
                                    <RefreshCw size={14} /> 재구매
                                </button>
                            </div>
                            <div className="flex items-center gap-2">
                                <span className="text-sm font-medium text-gray-900">총 결제금액</span>
                                <span className="text-lg font-bold text-primary">₩{order.total.toLocaleString()}</span>
                            </div>
                        </div>
                    </div>
                </div>
            ))}

            <ConfirmModal
                isOpen={isConfirmModalOpen}
                onClose={() => setIsConfirmModalOpen(false)}
                onConfirm={handleConfirmCancel}
                title="주문 취소 확인"
                message="정말로 이 주문을 취소하시겠습니까? 취소 후에는 되돌릴 수 없습니다."
                confirmLabel="주문 취소"
                isDestructive={true}
            />
        </div>
    );
};

export default OrderHistory;
