import React, { useEffect, useState } from 'react';
import { Users, TrendingUp, AlertCircle, UserPlus, Globe, ArrowUpRight } from 'lucide-react';
import { getCustomerSegments, getTrafficSources, CustomerSegment, TrafficSource } from '../../../services/analyticsService';

const AnalyticsManager: React.FC = () => {
    const [segments, setSegments] = useState<CustomerSegment[]>([]);
    const [trafficSources, setTrafficSources] = useState<TrafficSource[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const [segmentsData, trafficData] = await Promise.all([
                    getCustomerSegments(),
                    getTrafficSources()
                ]);
                setSegments(segmentsData);
                setTrafficSources(trafficData);
            } catch (error) {
                console.error("Failed to fetch analytics data:", error);
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, []);

    if (loading) {
        return <div className="flex justify-center items-center h-64"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div></div>;
    }

    const vipSegment = segments.find(s => s.id === 'vip');
    const atRiskSegment = segments.find(s => s.id === 'at_risk');
    const newSegment = segments.find(s => s.id === 'new');

    return (
        <div className="space-y-8">
            <div className="flex justify-between items-center">
                <h2 className="text-2xl font-bold text-gray-800">데이터 분석 및 인사이트</h2>
                <div className="text-sm text-gray-500">
                    마지막 업데이트: {new Date().toLocaleString()}
                </div>
            </div>

            {/* Customer Insights Section */}
            <section>
                <h3 className="text-lg font-bold text-gray-700 mb-4 flex items-center gap-2">
                    <Users size={20} /> 고객 세그먼트 분석 (CRM)
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    {/* VIP Card */}
                    <div className="bg-white p-6 rounded-lg shadow-sm border border-indigo-100">
                        <div className="flex justify-between items-start mb-4">
                            <div className="p-3 bg-indigo-50 rounded-lg text-indigo-600">
                                <TrendingUp size={24} />
                            </div>
                            <span className="text-2xl font-bold text-gray-900">{vipSegment?.count || 0}명</span>
                        </div>
                        <h4 className="font-bold text-gray-800 mb-1">VIP 고객</h4>
                        <p className="text-xs text-gray-500 mb-4">{vipSegment?.description}</p>
                        <div className="space-y-2">
                            {vipSegment?.customers.slice(0, 3).map(c => (
                                <div key={c.id} className="flex justify-between text-sm border-b border-gray-50 pb-1 last:border-0">
                                    <span className="text-gray-700">{c.name}</span>
                                    <span className="font-medium text-indigo-600">₩{c.totalSpent.toLocaleString()}</span>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* At-Risk Card */}
                    <div className="bg-white p-6 rounded-lg shadow-sm border border-red-100">
                        <div className="flex justify-between items-start mb-4">
                            <div className="p-3 bg-red-50 rounded-lg text-red-600">
                                <AlertCircle size={24} />
                            </div>
                            <span className="text-2xl font-bold text-gray-900">{atRiskSegment?.count || 0}명</span>
                        </div>
                        <h4 className="font-bold text-gray-800 mb-1">이탈 위험 고객</h4>
                        <p className="text-xs text-gray-500 mb-4">{atRiskSegment?.description}</p>
                        <div className="space-y-2">
                            {atRiskSegment?.customers.slice(0, 3).map(c => (
                                <div key={c.id} className="flex justify-between text-sm border-b border-gray-50 pb-1 last:border-0">
                                    <span className="text-gray-700">{c.name}</span>
                                    <span className="text-xs text-gray-400">{c.lastLoginDate || '기록 없음'}</span>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* New Customers Card */}
                    <div className="bg-white p-6 rounded-lg shadow-sm border border-green-100">
                        <div className="flex justify-between items-start mb-4">
                            <div className="p-3 bg-green-50 rounded-lg text-green-600">
                                <UserPlus size={24} />
                            </div>
                            <span className="text-2xl font-bold text-gray-900">{newSegment?.count || 0}명</span>
                        </div>
                        <h4 className="font-bold text-gray-800 mb-1">신규 고객 (최근 30일)</h4>
                        <p className="text-xs text-gray-500 mb-4">{newSegment?.description}</p>
                        <div className="space-y-2">
                            {newSegment?.customers.slice(0, 3).map(c => (
                                <div key={c.id} className="flex justify-between text-sm border-b border-gray-50 pb-1 last:border-0">
                                    <span className="text-gray-700">{c.name}</span>
                                    <span className="text-xs text-gray-400">{c.joinDate}</span>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </section>

            {/* Traffic Analysis Section */}
            <section>
                <h3 className="text-lg font-bold text-gray-700 mb-4 flex items-center gap-2">
                    <Globe size={20} /> 유입 경로 분석 (Traffic Sources)
                </h3>
                <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
                    <div className="grid grid-cols-1 md:grid-cols-2">
                        {/* Chart Visualization (Simple Bar) */}
                        <div className="p-6 border-r border-gray-100">
                            <h4 className="font-bold text-gray-800 mb-6">채널별 유입 비중</h4>
                            <div className="space-y-4">
                                {trafficSources.map(source => (
                                    <div key={source.source}>
                                        <div className="flex justify-between text-sm mb-1">
                                            <span className="text-gray-700">{source.source}</span>
                                            <span className="font-bold text-gray-900">{source.percentage}%</span>
                                        </div>
                                        <div className="w-full bg-gray-100 rounded-full h-2.5">
                                            <div
                                                className="bg-blue-600 h-2.5 rounded-full"
                                                style={{ width: `${source.percentage}%` }}
                                            ></div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Detailed Table */}
                        <div className="p-6">
                            <h4 className="font-bold text-gray-800 mb-4">상세 데이터</h4>
                            <table className="w-full text-sm text-left">
                                <thead className="text-xs text-gray-500 uppercase bg-gray-50">
                                    <tr>
                                        <th className="px-4 py-3">소스 (Source)</th>
                                        <th className="px-4 py-3">방문수 (Visits)</th>
                                        <th className="px-4 py-3">비중</th>
                                        <th className="px-4 py-3">추세</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {trafficSources.map(source => (
                                        <tr key={source.source} className="border-b border-gray-100 last:border-0 hover:bg-gray-50">
                                            <td className="px-4 py-3 font-medium text-gray-900">{source.source}</td>
                                            <td className="px-4 py-3">{source.visits.toLocaleString()}</td>
                                            <td className="px-4 py-3">{source.percentage}%</td>
                                            <td className="px-4 py-3 text-green-500 flex items-center gap-1">
                                                <ArrowUpRight size={14} />
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>
            </section>
        </div>
    );
};

export default AnalyticsManager;
