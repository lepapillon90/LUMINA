import React, { useState } from 'react';
import { HelpCircle } from 'lucide-react';
import { Order, Product, Customer } from '../../../types';
import StatusBox from '../Shared/StatusBox';
import DailySalesStats from './DailySalesStats';
import OrderProcessingStats from './OrderProcessingStats';
import MemberPointsStats from './MemberPointsStats';
import RealTimeChart from './RealTimeChart';
import DailyVisitorChart from './DailyVisitorChart';
import PostStats from './PostStats';

interface DashboardProps {
    orders: Order[];
    products: Product[];
    customers: Customer[];
}

const Dashboard: React.FC<DashboardProps> = ({ orders, products, customers }) => {
    const [dashboardSubTab, setDashboardSubTab] = useState('daily');

    // Current date logic
    const today = new Date();
    const dateString = `${today.getMonth() + 1}월 ${today.getDate()}일 ${['일', '월', '화', '수', '목', '금', '토'][today.getDay()]}요일`;

    // Counts logic
    const getCount = (status: string) => orders.filter(o => o.status === status).length;

    const tabs = [
        { id: 'daily', label: '일별 매출 현황' },
        { id: 'realtime', label: '실시간 접속 현황' },
        { id: 'order_proc', label: '주문처리 현황' },
        { id: 'member', label: '회원/적립금 현황' },
        { id: 'posts', label: '게시물 현황' }
    ];

    return (
        <div className="space-y-6">
            {/* Top Section: Today's To-Do */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
                <div className="px-5 py-3 border-b border-gray-100 flex items-center space-x-2">
                    <h3 className="font-bold text-gray-800 text-sm">오늘의 할 일</h3>
                    <span className="text-xs text-gray-400">{dateString}</span>
                    <HelpCircle size={14} className="text-gray-300 cursor-pointer" />
                </div>

                <div className="grid grid-cols-2 md:grid-cols-5 divide-x divide-gray-100 text-sm">
                    {/* Order Flow - Blue Tones */}
                    <StatusBox title="입금전" count={getCount('입금전')} type="order" />
                    <StatusBox title="배송준비중" count={getCount('입금대기')} type="order" />
                    <StatusBox title="배송보류중" count={0} type="order" />
                    <StatusBox title="배송대기" count={0} type="order" />
                    <StatusBox title="배송중" count={getCount('배송중')} type="order" />
                </div>
                <div className="grid grid-cols-2 md:grid-cols-5 divide-x divide-gray-100 border-t border-gray-100 text-sm">
                    {/* Claim Flow - Pink Tones */}
                    <StatusBox title="취소신청" count={0} type="claim" />
                    <StatusBox title="교환신청" count={0} type="claim" />
                    <StatusBox title="반품신청" count={0} type="claim" />
                    <StatusBox title="환불전" count={0} type="normal" />
                    <div className="flex flex-col justify-center p-4 h-24 bg-white">
                        <span className="text-xs text-gray-500 mb-1">재고부족 알림</span>
                        <span className="text-lg font-bold text-red-500">
                            {products.filter(p => (p.stock || 0) <= 10).length}
                        </span>
                    </div>
                </div>
            </div>

            {/* Dashboard Tabs */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                <div className="flex space-x-6 border-b border-gray-100 mb-6 overflow-x-auto whitespace-nowrap pb-2 scrollbar-hide">
                    {tabs.map(tab => (
                        <button
                            key={tab.id}
                            onClick={() => setDashboardSubTab(tab.id)}
                            className={`pb-2 text-sm font-medium transition relative ${dashboardSubTab === tab.id ? 'text-gray-900' : 'text-gray-400 hover:text-gray-600'}`}
                        >
                            {tab.label}
                            {dashboardSubTab === tab.id && (
                                <span className="absolute bottom-0 left-0 w-full h-0.5 bg-gray-900"></span>
                            )}
                        </button>
                    ))}
                </div>

                {/* Tab Content */}
                {dashboardSubTab === 'daily' && <DailySalesStats orders={orders} />}
                {dashboardSubTab === 'realtime' && <RealTimeChart />}
                {dashboardSubTab === 'order_proc' && <OrderProcessingStats orders={orders} />}
                {dashboardSubTab === 'member' && <MemberPointsStats customers={customers} />}
                {dashboardSubTab === 'posts' && <PostStats />}
            </div>
        </div>
    );
};

export default Dashboard;
