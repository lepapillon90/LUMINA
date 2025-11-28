import React from 'react';
import { Order } from '../../types';
import { X, Printer } from 'lucide-react';

interface InvoiceModalProps {
    orders: Order[];
    onClose: () => void;
}

export const InvoiceModal: React.FC<InvoiceModalProps> = ({ orders, onClose }) => {
    const handlePrint = () => {
        window.print();
    };

    return (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4 backdrop-blur-sm print:p-0 print:bg-white print:static">
            <div className="bg-white rounded-lg shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto print:shadow-none print:w-full print:max-w-none print:max-h-none print:rounded-none">
                {/* Header - Hidden on Print */}
                <div className="flex justify-between items-center p-6 border-b border-gray-200 print:hidden">
                    <h2 className="text-xl font-bold text-gray-800">송장 출력 미리보기 ({orders.length}건)</h2>
                    <div className="flex items-center gap-2">
                        <button
                            onClick={handlePrint}
                            className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-sm hover:bg-blue-700 transition"
                        >
                            <Printer size={16} />
                            <span>인쇄하기</span>
                        </button>
                        <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-full transition">
                            <X size={24} className="text-gray-500" />
                        </button>
                    </div>
                </div>

                {/* Invoice Content */}
                <div className="p-8 space-y-8 print:p-0 print:space-y-0">
                    {orders.map((order) => (
                        <div key={order.id} className="border border-gray-300 p-8 bg-white print:border-none print:break-after-page">
                            {/* Invoice Header */}
                            <div className="flex justify-between items-start mb-8 border-b-2 border-gray-800 pb-4">
                                <div>
                                    <h1 className="text-3xl font-bold text-gray-900 mb-2">INVOICE</h1>
                                    <p className="text-sm text-gray-500">LUMINA (루미나)</p>
                                    <p className="text-sm text-gray-500">서울시 강남구 테헤란로 123</p>
                                </div>
                                <div className="text-right">
                                    <p className="text-lg font-bold text-gray-800">주문번호: {order.id}</p>
                                    <p className="text-sm text-gray-600">주문일자: {order.date}</p>
                                </div>
                            </div>

                            {/* Customer Info */}
                            <div className="grid grid-cols-2 gap-8 mb-8">
                                <div>
                                    <h3 className="text-sm font-bold text-gray-500 uppercase mb-2">Bill To</h3>
                                    <p className="font-bold text-gray-800 text-lg">{order.customerName}</p>
                                    <p className="text-gray-600">010-1234-5678 (Mock)</p>
                                    <p className="text-gray-600">서울시 마포구 (Mock Address)</p>
                                </div>
                                <div className="text-right">
                                    <h3 className="text-sm font-bold text-gray-500 uppercase mb-2">Ship To</h3>
                                    <p className="font-bold text-gray-800 text-lg">{order.customerName}</p>
                                    <p className="text-gray-600">010-1234-5678 (Mock)</p>
                                    <p className="text-gray-600">서울시 마포구 (Mock Address)</p>
                                </div>
                            </div>

                            {/* Items Table */}
                            <table className="w-full mb-8">
                                <thead>
                                    <tr className="border-b border-gray-200">
                                        <th className="text-left py-2 font-bold text-gray-600">상품명</th>
                                        <th className="text-right py-2 font-bold text-gray-600">수량</th>
                                        <th className="text-right py-2 font-bold text-gray-600">단가</th>
                                        <th className="text-right py-2 font-bold text-gray-600">합계</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {/* Mock Items if empty */}
                                    {(order.items && order.items.length > 0 ? order.items : [{ name: 'Lumina Signature Ring', quantity: 1, price: order.total }]).map((item: any, idx: number) => (
                                        <tr key={idx} className="border-b border-gray-100">
                                            <td className="py-4 text-gray-800">{item.name}</td>
                                            <td className="py-4 text-right text-gray-600">{item.quantity || 1}</td>
                                            <td className="py-4 text-right text-gray-600">₩{(item.price || order.total).toLocaleString()}</td>
                                            <td className="py-4 text-right font-bold text-gray-800">₩{((item.price || order.total) * (item.quantity || 1)).toLocaleString()}</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>

                            {/* Total */}
                            <div className="flex justify-end border-t-2 border-gray-800 pt-4">
                                <div className="text-right">
                                    <p className="text-sm text-gray-500 mb-1">Total Amount</p>
                                    <p className="text-3xl font-bold text-blue-600">₩{order.total.toLocaleString()}</p>
                                </div>
                            </div>

                            {/* Footer */}
                            <div className="mt-12 text-center text-xs text-gray-400">
                                <p>Thank you for your business!</p>
                                <p>LUMINA Accessories</p>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
};
