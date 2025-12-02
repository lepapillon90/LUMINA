import React from 'react';
import { X, Printer } from 'lucide-react';
import { Order } from '../../../types';

interface InvoiceModalProps {
    orders: Order[];
    onClose: () => void;
}

const InvoiceModal: React.FC<InvoiceModalProps> = ({ orders, onClose }) => {
    const handlePrint = () => {
        window.print();
    };

    return (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4 backdrop-blur-sm print:p-0 print:bg-white">
            <div className="bg-white rounded-lg shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto print:shadow-none print:w-full print:max-w-none print:h-auto print:overflow-visible">
                <div className="p-6 border-b border-gray-200 flex justify-between items-center print:hidden">
                    <h2 className="text-xl font-bold text-gray-800">운송장 출력 ({orders.length}건)</h2>
                    <div className="flex gap-2">
                        <button
                            onClick={handlePrint}
                            className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-sm hover:bg-blue-700 transition"
                        >
                            <Printer size={18} />
                            <span>인쇄하기</span>
                        </button>
                        <button onClick={onClose} className="text-gray-500 hover:text-gray-700">
                            <X size={24} />
                        </button>
                    </div>
                </div>

                <div className="p-8 bg-gray-100 print:bg-white print:p-0 space-y-8">
                    {orders.map((order) => (
                        <div key={order.id} className="bg-white p-0 shadow-sm border border-gray-300 w-[210mm] h-[148mm] mx-auto print:mx-0 print:shadow-none print:border-0 print:break-after-page relative text-black font-sans text-sm">
                            {/* Waybill Header */}
                            <div className="border-b-2 border-black p-4 flex justify-between items-start h-[15%]">
                                <div>
                                    <h1 className="text-3xl font-black tracking-tighter italic">LUMINA LOGISTICS</h1>
                                    <p className="text-xs mt-1">Tel: 1588-0000 / www.lumina.com</p>
                                </div>
                                <div className="text-right">
                                    <div className="inline-block border-2 border-black px-4 py-2 font-bold text-xl">
                                        {new Date().toLocaleDateString()} 도착
                                    </div>
                                </div>
                            </div>

                            <div className="flex h-[85%]">
                                {/* Left Column: Sender & Receiver */}
                                <div className="w-[60%] border-r-2 border-black flex flex-col">
                                    {/* Receiver */}
                                    <div className="flex-1 border-b border-black p-4">
                                        <div className="flex justify-between mb-2">
                                            <span className="font-bold text-lg border-b border-black">받는 분</span>
                                            <span className="font-bold text-2xl">{order.customerName}</span>
                                        </div>
                                        <div className="text-base leading-relaxed mt-4">
                                            <p>{order.shippingAddress}</p>
                                            <p className="mt-2 font-bold">{order.customerName} (010-XXXX-XXXX)</p>
                                        </div>
                                        <div className="mt-6 border border-gray-400 p-2 text-xs text-gray-600">
                                            배송 요청사항: 문 앞에 놓아주세요.
                                        </div>
                                    </div>

                                    {/* Sender */}
                                    <div className="h-[30%] p-4 bg-gray-50">
                                        <span className="font-bold text-sm border-b border-black mb-2 inline-block">보내는 분</span>
                                        <div className="text-sm mt-2">
                                            <p className="font-bold">LUMINA (루미나)</p>
                                            <p>서울특별시 강남구 테헤란로 123, 루미나빌딩 1층</p>
                                            <p>02-1234-5678</p>
                                        </div>
                                    </div>
                                </div>

                                {/* Right Column: Barcode & Details */}
                                <div className="w-[40%] flex flex-col">
                                    {/* Barcode Area */}
                                    <div className="h-[40%] border-b border-black flex flex-col items-center justify-center p-4">
                                        <div className="w-full h-16 bg-black mb-2"></div> {/* Mock Barcode */}
                                        <p className="font-mono text-lg font-bold tracking-widest">{order.id}</p>
                                    </div>

                                    {/* Product Details */}
                                    <div className="flex-1 p-4">
                                        <h3 className="font-bold border-b border-gray-400 pb-1 mb-2">상품 정보</h3>
                                        <ul className="space-y-1 text-xs">
                                            {order.items.map((item, i) => (
                                                <li key={i} className="flex justify-between">
                                                    <span className="truncate w-[70%]">{item.name}</span>
                                                    <span>{item.quantity}개</span>
                                                </li>
                                            ))}
                                        </ul>
                                        <div className="mt-4 pt-2 border-t border-gray-400 flex justify-between font-bold">
                                            <span>합계</span>
                                            <span>{order.items.length}개</span>
                                        </div>
                                    </div>

                                    {/* Footer Code */}
                                    <div className="h-[15%] bg-black text-white flex items-center justify-center text-2xl font-bold">
                                        A - 12 - 34
                                    </div>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
};

export default InvoiceModal;
