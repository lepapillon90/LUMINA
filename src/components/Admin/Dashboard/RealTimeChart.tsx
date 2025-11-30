import React from 'react';

const RealTimeChart = () => {
    const categories = ['메인', '상품목록', '상품상세', '장바구니', '주문작성', '결제완료', '게시판', '기타'];
    const data = [
        { page: '메인', total: 45, mobile: 30, pc: 15 },
        { page: '상품목록', total: 12, mobile: 8, pc: 4 },
        { page: '상품상세', total: 28, mobile: 20, pc: 8 },
        { page: '장바구니', total: 5, mobile: 3, pc: 2 },
        { page: '주문작성', total: 2, mobile: 1, pc: 1 },
        { page: '결제완료', total: 1, mobile: 1, pc: 0 },
        { page: '게시판', total: 3, mobile: 2, pc: 1 },
        { page: '기타', total: 4, mobile: 3, pc: 1 },
    ];
    const maxVal = 50;

    return (
        <div className="w-full h-64 relative mt-4">
            <div className="absolute inset-0 flex flex-col justify-between text-xs text-gray-300 pointer-events-none z-0">
                {[...Array(5)].map((_, i) => (
                    <div key={i} className="w-full border-b border-gray-100 h-0 flex items-center">
                        <span className="ml-[-20px] absolute">{maxVal - (i * (maxVal / 4))}</span>
                    </div>
                ))}
                <div className="w-full border-b border-gray-200 h-0">
                    <span className="ml-[-20px] absolute">0</span>
                </div>
            </div>

            <div className="absolute inset-0 flex items-end justify-around pl-4 z-10">
                {data.map((item, idx) => (
                    <div key={idx} className="flex flex-col items-center w-full h-full justify-end group">
                        {/* Tooltip */}
                        <div className="hidden group-hover:block absolute bottom-full mb-2 bg-gray-800 text-white text-xs p-2 rounded z-50">
                            {item.page}: {item.total}명 (M:{item.mobile}/PC:{item.pc})
                        </div>

                        {/* Total Bar */}
                        <div
                            className="w-4 bg-sky-400 rounded-t-sm opacity-80 hover:opacity-100 transition-all relative"
                            style={{ height: `${(item.total / maxVal) * 100}%` }}
                        >
                            {/* PC Line Point (Simulated) */}
                            <div
                                className="absolute w-2 h-2 bg-purple-500 rounded-full border-2 border-white -ml-3"
                                style={{ bottom: `${(item.pc / item.total) * 100}%`, left: '50%' }}
                            />
                            {/* Mobile Line Point (Simulated) */}
                            <div
                                className="absolute w-2 h-2 bg-pink-500 rounded-full border-2 border-white ml-1"
                                style={{ bottom: `${(item.mobile / item.total) * 100}%`, left: '50%' }}
                            />
                        </div>
                        <span className="text-[10px] text-gray-500 mt-2">{item.page}</span>
                    </div>
                ))}
            </div>

            {/* Legend */}
            <div className="absolute -bottom-8 left-0 right-0 flex justify-center space-x-4 text-xs">
                <div className="flex items-center"><span className="w-2 h-2 bg-sky-400 mr-1"></span>전체</div>
                <div className="flex items-center"><span className="w-2 h-2 bg-pink-500 rounded-full mr-1"></span>Mobile</div>
                <div className="flex items-center"><span className="w-2 h-2 bg-purple-500 rounded-full mr-1"></span>PC</div>
            </div>
        </div>
    );
};

export default RealTimeChart;
