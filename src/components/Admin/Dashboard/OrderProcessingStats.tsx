import React from 'react';

const OrderProcessingStats = () => (
    <div className="bg-white p-6 rounded-lg border border-gray-200 shadow-sm mb-6">
        <h3 className="font-bold text-gray-800 mb-4">주문 처리 현황</h3>
        <div className="grid grid-cols-5 gap-4 text-center">
            <div>
                <p className="text-gray-500 text-xs mb-1">입금대기</p>
                <p className="text-xl font-bold text-gray-900">5</p>
            </div>
            <div>
                <p className="text-gray-500 text-xs mb-1">결제완료</p>
                <p className="text-xl font-bold text-gray-900">12</p>
            </div>
            <div>
                <p className="text-gray-500 text-xs mb-1">배송준비</p>
                <p className="text-xl font-bold text-gray-900">8</p>
            </div>
            <div>
                <p className="text-gray-500 text-xs mb-1">배송중</p>
                <p className="text-xl font-bold text-gray-900">15</p>
            </div>
            <div>
                <p className="text-gray-500 text-xs mb-1">배송완료</p>
                <p className="text-xl font-bold text-gray-900">42</p>
            </div>
        </div>
    </div>
);

export default OrderProcessingStats;
