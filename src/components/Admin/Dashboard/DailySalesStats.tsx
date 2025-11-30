import React from 'react';

const DailySalesStats = () => (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <div className="bg-white p-4 rounded-lg border border-gray-200 shadow-sm">
            <p className="text-xs text-gray-500 mb-1">오늘 매출</p>
            <p className="text-2xl font-bold text-gray-900">₩1,250,000</p>
            <p className="text-xs text-green-500 mt-1">▲ 12% (어제 대비)</p>
        </div>
        <div className="bg-white p-4 rounded-lg border border-gray-200 shadow-sm">
            <p className="text-xs text-gray-500 mb-1">이번 주 매출</p>
            <p className="text-2xl font-bold text-gray-900">₩8,450,000</p>
            <p className="text-xs text-green-500 mt-1">▲ 5% (지난주 대비)</p>
        </div>
        <div className="bg-white p-4 rounded-lg border border-gray-200 shadow-sm">
            <p className="text-xs text-gray-500 mb-1">이번 달 매출</p>
            <p className="text-2xl font-bold text-gray-900">₩32,150,000</p>
            <p className="text-xs text-red-500 mt-1">▼ 2% (지난달 대비)</p>
        </div>
    </div>
);

export default DailySalesStats;
