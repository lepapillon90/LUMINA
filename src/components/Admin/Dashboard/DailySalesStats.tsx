import React from 'react';
import { Order } from '../../../types';

interface DailySalesStatsProps {
    orders: Order[];
}

const DailySalesStats: React.FC<DailySalesStatsProps> = ({ orders }) => {
    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);

    const thisWeekStart = new Date(today);
    thisWeekStart.setDate(today.getDate() - today.getDay()); // Sunday start
    const lastWeekStart = new Date(thisWeekStart);
    lastWeekStart.setDate(lastWeekStart.getDate() - 7);
    const lastWeekEnd = new Date(thisWeekStart);
    lastWeekEnd.setDate(lastWeekEnd.getDate() - 1);

    const thisMonthStart = new Date(now.getFullYear(), now.getMonth(), 1);
    const lastMonthStart = new Date(now.getFullYear(), now.getMonth() - 1, 1);
    const lastMonthEnd = new Date(now.getFullYear(), now.getMonth(), 0);

    const getOrderDate = (order: Order) => {
        if (!order.createdAt) return new Date();
        if (order.createdAt.toDate) return order.createdAt.toDate();
        return new Date(order.createdAt);
    };

    const calculateTotal = (start: Date, end: Date) => {
        return orders.reduce((acc, order) => {
            const date = getOrderDate(order);
            if (date >= start && date <= end && order.status !== '취소' && order.status !== '반품') {
                return acc + (order.total || 0);
            }
            return acc;
        }, 0);
    };

    // Daily
    const todaySales = calculateTotal(today, new Date(today.getTime() + 86400000 - 1));
    const yesterdaySales = calculateTotal(yesterday, new Date(yesterday.getTime() + 86400000 - 1));
    const dailyGrowth = yesterdaySales === 0 ? 100 : ((todaySales - yesterdaySales) / yesterdaySales) * 100;

    // Weekly
    const thisWeekSales = calculateTotal(thisWeekStart, new Date());
    const lastWeekSales = calculateTotal(lastWeekStart, lastWeekEnd);
    const weeklyGrowth = lastWeekSales === 0 ? 100 : ((thisWeekSales - lastWeekSales) / lastWeekSales) * 100;

    // Monthly
    const thisMonthSales = calculateTotal(thisMonthStart, new Date());
    const lastMonthSales = calculateTotal(lastMonthStart, lastMonthEnd);
    const monthlyGrowth = lastMonthSales === 0 ? 100 : ((thisMonthSales - lastMonthSales) / lastMonthSales) * 100;

    const formatCurrency = (amount: number) => `₩${amount.toLocaleString()}`;
    const formatGrowth = (growth: number) => {
        const isPositive = growth >= 0;
        return (
            <span className={`text-xs ${isPositive ? 'text-green-500' : 'text-red-500'} mt-1`}>
                {isPositive ? '▲' : '▼'} {Math.abs(growth).toFixed(1)}% ({isPositive ? '증가' : '감소'})
            </span>
        );
    };

    return (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
            <div className="bg-white p-4 rounded-lg border border-gray-200 shadow-sm">
                <p className="text-xs text-gray-500 mb-1">오늘 매출</p>
                <p className="text-2xl font-bold text-gray-900">{formatCurrency(todaySales)}</p>
                {formatGrowth(dailyGrowth)}
            </div>
            <div className="bg-white p-4 rounded-lg border border-gray-200 shadow-sm">
                <p className="text-xs text-gray-500 mb-1">이번 주 매출</p>
                <p className="text-2xl font-bold text-gray-900">{formatCurrency(thisWeekSales)}</p>
                {formatGrowth(weeklyGrowth)}
            </div>
            <div className="bg-white p-4 rounded-lg border border-gray-200 shadow-sm">
                <p className="text-xs text-gray-500 mb-1">이번 달 매출</p>
                <p className="text-2xl font-bold text-gray-900">{formatCurrency(thisMonthSales)}</p>
                {formatGrowth(monthlyGrowth)}
            </div>
        </div>
    );
};

export default DailySalesStats;
