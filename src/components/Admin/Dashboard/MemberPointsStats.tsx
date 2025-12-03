import React from 'react';
import { Customer } from '../../../types';

interface MemberPointsStatsProps {
    customers: Customer[];
}

const MemberPointsStats: React.FC<MemberPointsStatsProps> = ({ customers }) => {
    const totalPoints = customers.reduce((acc, c) => acc + (c.points || 0), 0);

    return (
        <div className="bg-white p-6 rounded-lg border border-gray-200 shadow-sm mb-6">
            <h3 className="font-bold text-gray-800 mb-4">회원 적립금 현황</h3>
            <div className="flex justify-between items-center">
                <div>
                    <p className="text-gray-500 text-xs mb-1">총 지급 적립금</p>
                    <p className="text-xl font-bold text-blue-600">-</p>
                </div>
                <div>
                    <p className="text-gray-500 text-xs mb-1">사용된 적립금</p>
                    <p className="text-xl font-bold text-red-600">-</p>
                </div>
                <div>
                    <p className="text-gray-500 text-xs mb-1">잔여 적립금</p>
                    <p className="text-xl font-bold text-gray-900">{totalPoints.toLocaleString()} P</p>
                </div>
            </div>
        </div>
    );
};

export default MemberPointsStats;
