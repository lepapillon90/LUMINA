import React from 'react';

const DailyVisitorChart = () => {
    const dates = ['11-21', '11-22', '11-23', '11-24', '11-25', '11-26', '11-27'];
    const data = [120, 150, 180, 140, 160, 210, 350];
    const maxVal = 400;

    return (
        <div className="w-full h-64 relative mt-4">
            <div className="absolute inset-0 flex flex-col justify-between text-xs text-gray-300 pointer-events-none">
                {[...Array(5)].map((_, i) => (
                    <div key={i} className="w-full border-b border-gray-100 h-0 flex items-center">
                        <span className="ml-[-25px] absolute">{maxVal - (i * 100)}</span>
                    </div>
                ))}
                <div className="w-full border-b border-gray-200 h-0">
                    <span className="ml-[-25px] absolute">0</span>
                </div>
            </div>

            <div className="absolute inset-0 flex items-end justify-around pl-4 z-10">
                {data.map((val, idx) => (
                    <div key={idx} className="flex flex-col items-center w-full group">
                        <div
                            className="w-6 bg-[#6cdad8] rounded-t-sm hover:bg-[#5bcac8] transition-all relative group"
                            style={{ height: `${(val / maxVal) * 100}%` }}
                        >
                            <div className="opacity-0 group-hover:opacity-100 absolute -top-6 left-1/2 -translate-x-1/2 text-xs font-bold text-[#6cdad8]">
                                {val}
                            </div>
                        </div>
                        <span className="text-[10px] text-gray-500 mt-2">{dates[idx]}</span>
                    </div>
                ))}
            </div>

            {/* Legend */}
            <div className="absolute -bottom-8 left-0 right-0 flex justify-center text-xs">
                <div className="flex items-center"><span className="w-2 h-2 bg-[#6cdad8] mr-1"></span>방문자 수</div>
            </div>
        </div>
    );
};

export default DailyVisitorChart;
