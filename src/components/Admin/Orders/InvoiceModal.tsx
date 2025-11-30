import React from 'react';
import { Order } from '../../../types';

interface InvoiceModalProps {
    orders: Order[];
    onClose: () => void;
}

const InvoiceModal: React.FC<InvoiceModalProps> = ({ orders, onClose }) => (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4 backdrop-blur-sm">
        <div className="bg-white rounded-lg shadow-2xl max-w-2xl w-full p-6 max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-6 border-b pb-4">
                <h2 className="text-xl font-bold text-gray-800">송장 출력</h2>
                <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
                    <span className="sr-only">Close</span>
                    <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
                </button>
            </div>
            <div className="space-y-4">
                {orders.map(order => (
                    <div key={order.id} className="border p-4 rounded-sm">
                        <div className="flex justify-between mb-2">
                            <span className="font-bold">주문번호: {order.id}</span>
                            <span className="text-gray-500">{order.date}</span>
                        </div>
                        <div className="text-sm text-gray-600">
                            <p>받는사람: {order.customerName}</p>
                            <p>금액: ₩{order.total.toLocaleString()}</p>
                        </div>
                    </div>
                ))}
            </div>
            <div className="mt-6 flex justify-end gap-2">
                <button onClick={onClose} className="px-4 py-2 border border-gray-300 rounded-sm hover:bg-gray-50">취소</button>
                <button onClick={() => { alert('출력되었습니다.'); onClose(); }} className="px-4 py-2 bg-blue-600 text-white rounded-sm hover:bg-blue-700">인쇄하기</button>
            </div>
        </div>
    </div>
);

export default InvoiceModal;
