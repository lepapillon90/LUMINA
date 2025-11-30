import React from 'react';

interface StatusBoxProps {
    title: string;
    count: number;
    type: 'order' | 'claim' | 'normal';
}

const StatusBox: React.FC<StatusBoxProps> = ({ title, count, type }) => (
    <div className={`flex flex-col justify-center p-4 border-r border-gray-100 last:border-r-0 h-24 
    ${type === 'order' ? 'bg-[#f0f9ff]' : type === 'claim' ? 'bg-[#fff0f6]' : 'bg-white'}`}>
        <span className="text-xs text-gray-500 mb-1">{title}</span>
        <div className="flex items-center space-x-1">
            <span className={`text-lg font-bold ${count > 0 ? (type === 'claim' ? 'text-red-500' : 'text-blue-500') : 'text-gray-800'}`}>
                {count}
            </span>
            {count > 0 && type === 'claim' && <span className="text-[10px] text-red-400">처리중</span>}
        </div>
    </div>
);

export default StatusBox;
