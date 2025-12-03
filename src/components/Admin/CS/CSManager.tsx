import React, { useState } from 'react';
import { MessageCircle, Search, CheckCircle, Clock, AlertCircle } from 'lucide-react';

interface Inquiry {
    id: number;
    type: 'product' | 'general' | 'return';
    customer: string;
    title: string;
    date: string;
    status: 'pending' | 'answered';
    content: string;
}

const MOCK_INQUIRIES: Inquiry[] = [
    { id: 1, type: 'product', customer: '김민지', title: '사이즈 문의드립니다', date: '2023-12-01', status: 'pending', content: '반지 호수가 정확하지 않은데 교환 가능한가요?' },
    { id: 2, type: 'return', customer: '이준호', title: '반품 요청', date: '2023-11-30', status: 'pending', content: '단순 변심으로 반품 원합니다.' },
    { id: 3, type: 'general', customer: '박서연', title: '배송 언제 되나요?', date: '2023-11-29', status: 'answered', content: '주문한지 3일 지났는데 아직 배송준비중이라서요.' },
    { id: 4, type: 'product', customer: '최영수', title: '재입고 일정', date: '2023-11-28', status: 'answered', content: '품절된 상품 언제 재입고 되나요?' },
    { id: 5, type: 'return', customer: '정수진', title: '상품 불량 교환', date: '2023-11-28', status: 'pending', content: '받아보니 스크래치가 있네요. 교환해주세요.' },
];

const CSManager: React.FC = () => {
    const [activeTab, setActiveTab] = useState<'all' | 'product' | 'return'>('all');
    const [selectedInquiry, setSelectedInquiry] = useState<Inquiry | null>(null);
    const [reply, setReply] = useState('');

    const filteredInquiries = MOCK_INQUIRIES.filter(inquiry => {
        if (activeTab === 'all') return true;
        if (activeTab === 'product') return inquiry.type === 'product' || inquiry.type === 'general';
        if (activeTab === 'return') return inquiry.type === 'return';
        return true;
    });

    const handleReplySubmit = () => {
        if (!selectedInquiry) return;
        alert(`답변이 등록되었습니다: ${reply}`);
        setReply('');
        setSelectedInquiry(null);
    };

    return (
        <div className="space-y-6">
            <h2 className="text-xl font-bold text-gray-800 flex items-center gap-2">
                <MessageCircle size={20} /> 고객센터 관리
            </h2>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Inquiry List */}
                <div className="lg:col-span-1 bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden flex flex-col h-[600px]">
                    <div className="p-4 border-b border-gray-200">
                        <div className="flex space-x-2 mb-4">
                            <button
                                onClick={() => setActiveTab('all')}
                                className={`flex-1 py-1.5 text-xs font-medium rounded-sm transition ${activeTab === 'all' ? 'bg-gray-900 text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}
                            >
                                전체
                            </button>
                            <button
                                onClick={() => setActiveTab('product')}
                                className={`flex-1 py-1.5 text-xs font-medium rounded-sm transition ${activeTab === 'product' ? 'bg-gray-900 text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}
                            >
                                상품/일반
                            </button>
                            <button
                                onClick={() => setActiveTab('return')}
                                className={`flex-1 py-1.5 text-xs font-medium rounded-sm transition ${activeTab === 'return' ? 'bg-gray-900 text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}
                            >
                                반품/교환
                            </button>
                        </div>
                        <div className="relative">
                            <Search size={14} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                            <input
                                type="text"
                                placeholder="고객명, 제목 검색"
                                className="w-full pl-9 pr-3 py-2 bg-gray-50 border border-gray-200 rounded-sm text-sm focus:outline-none focus:border-blue-500"
                            />
                        </div>
                    </div>
                    <div className="overflow-y-auto flex-1">
                        {filteredInquiries.map(inquiry => (
                            <div
                                key={inquiry.id}
                                onClick={() => setSelectedInquiry(inquiry)}
                                className={`p-4 border-b border-gray-100 cursor-pointer hover:bg-gray-50 transition ${selectedInquiry?.id === inquiry.id ? 'bg-blue-50 border-l-4 border-l-blue-500' : 'border-l-4 border-l-transparent'}`}
                            >
                                <div className="flex justify-between items-start mb-1">
                                    <span className={`text-xs px-1.5 py-0.5 rounded-sm font-medium ${inquiry.type === 'return' ? 'bg-red-100 text-red-600' : 'bg-blue-100 text-blue-600'}`}>
                                        {inquiry.type === 'return' ? '반품/교환' : inquiry.type === 'product' ? '상품문의' : '일반문의'}
                                    </span>
                                    <span className="text-xs text-gray-400">{inquiry.date}</span>
                                </div>
                                <h4 className="font-medium text-gray-800 text-sm mb-1 truncate">{inquiry.title}</h4>
                                <div className="flex justify-between items-center">
                                    <span className="text-xs text-gray-500">{inquiry.customer}</span>
                                    {inquiry.status === 'answered' ? (
                                        <span className="flex items-center text-xs text-green-600 font-medium">
                                            <CheckCircle size={12} className="mr-1" /> 답변완료
                                        </span>
                                    ) : (
                                        <span className="flex items-center text-xs text-orange-500 font-medium">
                                            <Clock size={12} className="mr-1" /> 답변대기
                                        </span>
                                    )}
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Detail View */}
                <div className="lg:col-span-2 bg-white rounded-lg shadow-sm border border-gray-200 h-[600px] flex flex-col">
                    {selectedInquiry ? (
                        <>
                            <div className="p-6 border-b border-gray-200">
                                <div className="flex justify-between items-start mb-4">
                                    <div>
                                        <div className="flex items-center gap-2 mb-2">
                                            <span className={`text-xs px-2 py-1 rounded-sm font-medium ${selectedInquiry.type === 'return' ? 'bg-red-100 text-red-600' : 'bg-blue-100 text-blue-600'}`}>
                                                {selectedInquiry.type === 'return' ? '반품/교환' : selectedInquiry.type === 'product' ? '상품문의' : '일반문의'}
                                            </span>
                                            <span className="text-sm text-gray-500">{selectedInquiry.date}</span>
                                        </div>
                                        <h3 className="text-xl font-bold text-gray-800">{selectedInquiry.title}</h3>
                                    </div>
                                    <div className="text-right">
                                        <p className="font-medium text-gray-900">{selectedInquiry.customer}</p>
                                        <p className="text-xs text-gray-500">VIP 회원</p>
                                    </div>
                                </div>
                                <div className="bg-gray-50 p-4 rounded-sm text-gray-700 text-sm leading-relaxed">
                                    {selectedInquiry.content}
                                </div>
                            </div>
                            <div className="flex-1 p-6 flex flex-col">
                                <h4 className="font-bold text-gray-800 mb-3 flex items-center gap-2">
                                    <MessageCircle size={18} /> 답변 작성
                                </h4>
                                <div className="flex-1 mb-4">
                                    <textarea
                                        value={reply}
                                        onChange={(e) => setReply(e.target.value)}
                                        placeholder="고객님께 전송할 답변을 입력하세요. 자주 사용하는 문구는 우측 템플릿에서 선택 가능합니다."
                                        className="w-full h-full p-4 border border-gray-300 rounded-sm focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none text-sm"
                                    ></textarea>
                                </div>
                                <div className="flex justify-between items-center">
                                    <div className="flex gap-2">
                                        <button className="px-3 py-1.5 border border-gray-300 rounded-sm text-xs hover:bg-gray-50">배송지연 안내</button>
                                        <button className="px-3 py-1.5 border border-gray-300 rounded-sm text-xs hover:bg-gray-50">반품 절차 안내</button>
                                    </div>
                                    <button
                                        onClick={handleReplySubmit}
                                        disabled={!reply.trim()}
                                        className={`px-6 py-2 rounded-sm text-sm font-bold text-white transition ${reply.trim() ? 'bg-blue-600 hover:bg-blue-700' : 'bg-gray-300 cursor-not-allowed'}`}
                                    >
                                        답변 등록
                                    </button>
                                </div>
                            </div>
                        </>
                    ) : (
                        <div className="flex-1 flex flex-col items-center justify-center text-gray-400">
                            <MessageCircle size={48} className="mb-4 text-gray-200" />
                            <p>좌측 목록에서 문의를 선택해주세요.</p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default CSManager;
