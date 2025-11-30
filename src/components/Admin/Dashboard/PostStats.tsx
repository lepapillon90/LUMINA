import React from 'react';
import { Settings, ArrowDown } from 'lucide-react';

const PostStats = () => {
    const categories = [
        '공지사항', '상품 사용후기', '상품 Q&A', '자유게시판',
        '갤러리', '뉴스/이벤트', '이용안내 FAQ', '자료실'
    ];

    const dates = [
        { label: '11월 28일', isToday: true, values: [0, 0, 0, 0, 0, 0, 0, 0] },
        { label: '11월 27일', values: [0, 0, 0, 0, 0, 0, 0, 0] },
        { label: '11월 26일', values: [0, 0, 0, 0, 0, 0, 0, 0] },
        { label: '11월 25일', values: [0, 0, 0, 0, 0, 0, 0, 0] },
        { label: '11월 24일', values: [0, 0, 0, 0, 0, 0, 0, 0] },
        { label: '11월 23일', values: [0, 0, 0, 0, 0, 0, 0, 0] },
        { label: '11월 22일', values: [1, 0, 0, 0, 0, 0, 0, 0] },
    ];

    // Calculate totals
    const totals = categories.map((_, idx) =>
        dates.reduce((acc, curr) => acc + curr.values[idx], 0)
    );

    return (
        <div className="mt-4">
            <div className="overflow-x-auto">
                <table className="w-full text-sm text-center min-w-[1000px]">
                    <thead className="text-gray-500 border-b border-gray-100">
                        <tr>
                            <th className="py-3 font-normal text-left pl-4 flex items-center gap-1 cursor-pointer w-32 whitespace-nowrap">
                                날짜 <ArrowDown size={12} />
                            </th>
                            {categories.map((cat, idx) => (
                                <th key={idx} className="py-3 font-normal whitespace-nowrap px-2">{cat}</th>
                            ))}
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-50">
                        {/* Summary Row */}
                        <tr className="bg-[#f0f9ff]/50 font-bold text-gray-800">
                            <td className="py-4 text-left pl-4">합계</td>
                            {totals.map((t, idx) => (
                                <td key={idx}>{t}</td>
                            ))}
                        </tr>

                        {/* Date Rows */}
                        {dates.map((row, idx) => (
                            <tr key={idx} className="hover:bg-gray-50 transition group">
                                <td className="py-4 text-left pl-4 font-medium text-gray-600 flex items-center whitespace-nowrap">
                                    {row.label}
                                    {row.isToday && <span className="ml-2 bg-blue-500 text-white text-[10px] px-1.5 py-0.5 rounded-sm font-light">오늘</span>}
                                </td>
                                {row.values.map((val, vIdx) => (
                                    <td key={vIdx} className={val > 0 ? "font-bold text-gray-800" : "text-gray-400"}>
                                        {val}
                                    </td>
                                ))}
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            <div className="flex justify-end mt-4">
                <button className="flex items-center gap-1 px-3 py-1.5 border border-gray-300 rounded bg-white text-xs font-medium hover:bg-gray-50 text-gray-700">
                    <Settings size={12} />
                    게시물 현황 설정
                </button>
            </div>
        </div>
    );
};

export default PostStats;
