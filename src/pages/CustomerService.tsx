import React, { useState, useEffect } from 'react';
import { Headphones, MessageCircle, HelpCircle, FileText, Phone, Mail, Send, Search, Plus, X } from 'lucide-react';
import { useAuth, useGlobalModal } from '../contexts';
import { useNavigate, useLocation } from 'react-router-dom';
import SEO from '../components/common/SEO';

interface Inquiry {
    id: string;
    userId: string;
    type: 'product' | 'general' | 'return' | 'delivery' | 'payment';
    title: string;
    content: string;
    status: 'pending' | 'answered' | 'closed';
    createdAt: string;
    answer?: string;
    answeredAt?: string;
}

const CustomerService: React.FC = () => {
    const { user } = useAuth();
    const { showAlert } = useGlobalModal();
    const navigate = useNavigate();
    const location = useLocation();
    const [activeTab, setActiveTab] = useState<'faq' | 'inquiry' | 'my-inquiries'>('faq');

    // URL 해시에서 탭 읽기
    useEffect(() => {
        const hash = location.hash.replace('#', '');
        if (hash === 'inquiry' || hash === 'my-inquiries') {
            setActiveTab(hash as typeof activeTab);
        } else {
            setActiveTab('faq');
        }
    }, [location.hash]);

    // 탭 변경 시 URL 해시 업데이트
    const handleTabChange = (tab: typeof activeTab) => {
        setActiveTab(tab);
        if (tab === 'faq') {
            navigate('/cs', { replace: true });
        } else {
            navigate(`/cs#${tab}`, { replace: true });
        }
    };
    const [inquiries, setInquiries] = useState<Inquiry[]>([]);
    const [loading, setLoading] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');
    const [isInquiryModalOpen, setIsInquiryModalOpen] = useState(false);
    const [inquiryForm, setInquiryForm] = useState({
        type: 'general' as Inquiry['type'],
        title: '',
        content: ''
    });

    const faqCategories = [
        {
            id: 'product',
            title: '상품 문의',
            icon: FileText,
            faqs: [
                { q: '사이즈는 어떻게 선택하나요?', a: '각 상품 페이지에 상세 사이즈 가이드가 제공됩니다. 측정 방법을 참고하시거나 고객센터로 문의해주세요.' },
                { q: '재입고 일정은 어떻게 확인하나요?', a: '재입고 알림 버튼을 통해 등록하시면 재입고 시 알림을 받으실 수 있습니다.' },
                { q: '상품 교환/반품이 가능한가요?', a: '제품 하자나 배송 오류의 경우 무료로 교환/반품이 가능합니다. 단순 변심의 경우 배송비는 고객 부담입니다.' }
            ]
        },
        {
            id: 'delivery',
            title: '배송 안내',
            icon: FileText,
            faqs: [
                { q: '배송 기간은 얼마나 걸리나요?', a: '주문 후 1-2일 내 발송되며, 배송은 2-3일이 소요됩니다. 도서산간 지역은 추가 1-2일이 더 소요될 수 있습니다.' },
                { q: '배송비는 얼마인가요?', a: '5만원 이상 구매 시 무료배송입니다. 미만 시 3,000원이 부과됩니다.' },
                { q: '배송 추적은 어떻게 하나요?', a: '주문 완료 후 발송되면 SMS와 이메일로 송장번호를 안내드립니다.' }
            ]
        },
        {
            id: 'payment',
            title: '결제 안내',
            icon: FileText,
            faqs: [
                { q: '결제 방법은 어떤 것이 있나요?', a: '신용카드, 무통장입금, 계좌이체, 카카오페이, 네이버페이 등을 이용하실 수 있습니다.' },
                { q: '무통장입금은 언제까지 해야 하나요?', a: '주문일로부터 3일 이내 입금해주시면 됩니다. 입금 확인 후 주문이 완료됩니다.' },
                { q: '환불은 언제 받을 수 있나요?', a: '반품 접수 확인 후 상품 도착 후 3-5일 이내 환불처리 됩니다. 카드 결제는 결제일로부터 2-3일 소요됩니다.' }
            ]
        },
        {
            id: 'return',
            title: '교환/반품',
            icon: FileText,
            faqs: [
                { q: '교환/반품 기간은?', a: '상품 수령일로부터 7일 이내 가능합니다. 단, 상품 하자는 확인 후 무제한 가능합니다.' },
                { q: '교환/반품 방법은?', a: '마이페이지 > 주문내역에서 교환/반품 신청을 하시거나 고객센터로 연락주세요.' },
                { q: '반품 배송비는 누가 부담하나요?', a: '상품 하자나 배송 오류의 경우 당사 부담이며, 단순 변심의 경우 고객 부담입니다.' }
            ]
        }
    ];

    const filteredFaqs = faqCategories.flatMap(category =>
        category.faqs
            .filter(faq =>
                searchQuery === '' ||
                faq.q.toLowerCase().includes(searchQuery.toLowerCase()) ||
                faq.a.toLowerCase().includes(searchQuery.toLowerCase())
            )
            .map(faq => ({ ...faq, category: category.title }))
    );

    const handleSubmitInquiry = async () => {
        if (!user) {
            await showAlert('로그인이 필요합니다.', '알림');
            navigate('/login');
            return;
        }

        if (!inquiryForm.title.trim() || !inquiryForm.content.trim()) {
            await showAlert('제목과 내용을 입력해주세요.', '알림');
            return;
        }

        setLoading(true);
        try {
            // TODO: Firestore에 문의 등록
            // const inquiryId = await createInquiry({ ...inquiryForm, userId: user.uid });

            await showAlert('문의가 등록되었습니다. 빠른 시일 내에 답변 드리겠습니다.', '성공');
            setIsInquiryModalOpen(false);
            setInquiryForm({ type: 'general', title: '', content: '' });
            setActiveTab('my-inquiries');
            // loadInquiries();
        } catch (error) {
            console.error('[MY_LOG] Error submitting inquiry:', error);
            await showAlert('문의 등록에 실패했습니다.', '오류');
        } finally {
            setLoading(false);
        }
    };

    const loadMyInquiries = async () => {
        if (!user) return;

        setLoading(true);
        try {
            // TODO: Firestore에서 사용자 문의 조회
            // const data = await getMyInquiries(user.uid);
            // setInquiries(data);
        } catch (error) {
            console.error('[MY_LOG] Error loading inquiries:', error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (activeTab === 'my-inquiries' && user) {
            loadMyInquiries();
        }
    }, [activeTab, user]);

    return (
        <>
            <SEO title="고객센터 - LUMINA" description="LUMINA 고객센터에서 자주 묻는 질문, 1:1 문의, 공지사항을 확인하세요." />
            <div className="min-h-screen bg-gray-50 pt-40">
                {/* Header */}
                <div className="bg-white border-b border-gray-200">
                    <div className="container mx-auto px-6 pb-12">
                        <div className="flex items-center gap-4 mb-6">
                            <div className="w-16 h-16 bg-gray-900 rounded-full flex items-center justify-center">
                                <Headphones size={32} className="text-white" />
                            </div>
                            <div>
                                <h1 className="text-3xl font-bold text-gray-900 mb-2">고객센터</h1>
                                <p className="text-gray-600">무엇을 도와드릴까요?</p>
                            </div>
                        </div>

                        {/* Contact Info */}
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            <div className="flex items-center gap-3 p-4 bg-gray-50 rounded-lg">
                                <Phone size={20} className="text-gray-600" />
                                <div>
                                    <p className="text-xs text-gray-500">전화 문의</p>
                                    <p className="font-bold text-gray-900">1588-0000</p>
                                </div>
                            </div>
                            <div className="flex items-center gap-3 p-4 bg-gray-50 rounded-lg">
                                <Mail size={20} className="text-gray-600" />
                                <div>
                                    <p className="text-xs text-gray-500">이메일 문의</p>
                                    <p className="font-bold text-gray-900">cs@lumina.com</p>
                                </div>
                            </div>
                            <div className="flex items-center gap-3 p-4 bg-gray-50 rounded-lg">
                                <MessageCircle size={20} className="text-gray-600" />
                                <div>
                                    <p className="text-xs text-gray-500">운영 시간</p>
                                    <p className="font-bold text-gray-900">평일 10:00 - 18:00</p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="container mx-auto px-6 py-8">
                    {/* Tabs */}
                    <div className="flex space-x-2 mb-6 border-b border-gray-200">
                        <button
                            onClick={() => handleTabChange('faq')}
                            className={`px-6 py-3 font-medium transition ${activeTab === 'faq'
                                ? 'text-gray-900 border-b-2 border-gray-900'
                                : 'text-gray-500 hover:text-gray-700'
                                }`}
                        >
                            <HelpCircle size={18} className="inline mr-2" />
                            자주 묻는 질문
                        </button>
                        <button
                            onClick={() => handleTabChange('inquiry')}
                            className={`px-6 py-3 font-medium transition ${activeTab === 'inquiry'
                                ? 'text-gray-900 border-b-2 border-gray-900'
                                : 'text-gray-500 hover:text-gray-700'
                                }`}
                        >
                            <MessageCircle size={18} className="inline mr-2" />
                            1:1 문의하기
                        </button>
                        {user && (
                            <button
                                onClick={() => handleTabChange('my-inquiries')}
                                className={`px-6 py-3 font-medium transition ${activeTab === 'my-inquiries'
                                    ? 'text-gray-900 border-b-2 border-gray-900'
                                    : 'text-gray-500 hover:text-gray-700'
                                    }`}
                            >
                                <FileText size={18} className="inline mr-2" />
                                내 문의 내역
                            </button>
                        )}
                    </div>

                    {/* FAQ Tab */}
                    {activeTab === 'faq' && (
                        <div className="space-y-6">
                            {/* Search */}
                            <div className="relative">
                                <Search size={20} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
                                <input
                                    type="text"
                                    placeholder="검색어를 입력하세요"
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                    className="w-full pl-12 pr-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-900"
                                />
                            </div>

                            {/* FAQ Categories */}
                            <div className="space-y-6">
                                {faqCategories.map(category => {
                                    const Icon = category.icon;
                                    const categoryFaqs = category.faqs.filter(faq =>
                                        searchQuery === '' ||
                                        faq.q.toLowerCase().includes(searchQuery.toLowerCase()) ||
                                        faq.a.toLowerCase().includes(searchQuery.toLowerCase())
                                    );

                                    if (categoryFaqs.length === 0 && searchQuery) return null;

                                    return (
                                        <div key={category.id} className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
                                            <div className="p-4 bg-gray-50 border-b border-gray-200">
                                                <h3 className="font-bold text-gray-900 flex items-center gap-2">
                                                    <Icon size={20} />
                                                    {category.title}
                                                </h3>
                                            </div>
                                            <div className="divide-y divide-gray-100">
                                                {categoryFaqs.map((faq, index) => (
                                                    <details key={index} className="group">
                                                        <summary className="p-4 cursor-pointer hover:bg-gray-50 transition flex items-center justify-between">
                                                            <span className="font-medium text-gray-800">{faq.q}</span>
                                                            <span className="text-gray-400 group-open:rotate-180 transition">▼</span>
                                                        </summary>
                                                        <div className="p-4 pt-0 text-gray-600 bg-gray-50">
                                                            {faq.a}
                                                        </div>
                                                    </details>
                                                ))}
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>

                            {searchQuery && filteredFaqs.length === 0 && (
                                <div className="text-center py-12 text-gray-400">
                                    <HelpCircle size={48} className="mx-auto mb-4 text-gray-300" />
                                    <p>검색 결과가 없습니다.</p>
                                </div>
                            )}
                        </div>
                    )}

                    {/* Inquiry Tab */}
                    {activeTab === 'inquiry' && (
                        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                            {!isInquiryModalOpen ? (
                                <div className="text-center py-12">
                                    <MessageCircle size={64} className="mx-auto text-gray-300 mb-4" />
                                    <h3 className="text-xl font-bold text-gray-900 mb-2">1:1 문의하기</h3>
                                    <p className="text-gray-600 mb-6">궁금하신 사항을 남겨주시면 빠르게 답변 드리겠습니다.</p>
                                    {!user ? (
                                        <div>
                                            <p className="text-gray-500 mb-4">로그인 후 문의하실 수 있습니다.</p>
                                            <button
                                                onClick={() => navigate('/login')}
                                                className="px-6 py-2 bg-gray-900 text-white rounded-lg hover:bg-gray-800 transition"
                                            >
                                                로그인하기
                                            </button>
                                        </div>
                                    ) : (
                                        <button
                                            onClick={() => setIsInquiryModalOpen(true)}
                                            className="px-6 py-3 bg-gray-900 text-white rounded-lg hover:bg-gray-800 transition flex items-center gap-2 mx-auto"
                                        >
                                            <Plus size={20} />
                                            문의하기
                                        </button>
                                    )}
                                </div>
                            ) : (
                                <div className="space-y-6">
                                    <div className="flex justify-between items-center">
                                        <h3 className="text-xl font-bold text-gray-900">문의 작성</h3>
                                        <button
                                            onClick={() => {
                                                setIsInquiryModalOpen(false);
                                                setInquiryForm({ type: 'general', title: '', content: '' });
                                            }}
                                            className="text-gray-400 hover:text-gray-600"
                                        >
                                            <X size={24} />
                                        </button>
                                    </div>

                                    <div>
                                        <label className="block text-sm font-bold text-gray-700 mb-2">문의 유형</label>
                                        <select
                                            value={inquiryForm.type}
                                            onChange={(e) => setInquiryForm({ ...inquiryForm, type: e.target.value as Inquiry['type'] })}
                                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-900"
                                        >
                                            <option value="general">일반 문의</option>
                                            <option value="product">상품 문의</option>
                                            <option value="delivery">배송 문의</option>
                                            <option value="payment">결제 문의</option>
                                            <option value="return">교환/반품</option>
                                        </select>
                                    </div>

                                    <div>
                                        <label className="block text-sm font-bold text-gray-700 mb-2">제목</label>
                                        <input
                                            type="text"
                                            value={inquiryForm.title}
                                            onChange={(e) => setInquiryForm({ ...inquiryForm, title: e.target.value })}
                                            placeholder="문의 제목을 입력하세요"
                                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-900"
                                        />
                                    </div>

                                    <div>
                                        <label className="block text-sm font-bold text-gray-700 mb-2">내용</label>
                                        <textarea
                                            value={inquiryForm.content}
                                            onChange={(e) => setInquiryForm({ ...inquiryForm, content: e.target.value })}
                                            placeholder="문의 내용을 자세히 입력해주세요"
                                            rows={10}
                                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-900 resize-none"
                                        />
                                    </div>

                                    <div className="flex gap-3">
                                        <button
                                            onClick={() => {
                                                setIsInquiryModalOpen(false);
                                                setInquiryForm({ type: 'general', title: '', content: '' });
                                            }}
                                            className="flex-1 px-6 py-3 border border-gray-300 rounded-lg hover:bg-gray-50 transition"
                                        >
                                            취소
                                        </button>
                                        <button
                                            onClick={handleSubmitInquiry}
                                            disabled={loading || !inquiryForm.title.trim() || !inquiryForm.content.trim()}
                                            className="flex-1 px-6 py-3 bg-gray-900 text-white rounded-lg hover:bg-gray-800 transition disabled:bg-gray-300 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                                        >
                                            {loading ? '등록 중...' : (
                                                <>
                                                    <Send size={18} />
                                                    문의 등록
                                                </>
                                            )}
                                        </button>
                                    </div>
                                </div>
                            )}
                        </div>
                    )}

                    {/* My Inquiries Tab */}
                    {activeTab === 'my-inquiries' && (
                        <div className="bg-white rounded-lg shadow-sm border border-gray-200">
                            {!user ? (
                                <div className="text-center py-12">
                                    <MessageCircle size={64} className="mx-auto text-gray-300 mb-4" />
                                    <p className="text-gray-600 mb-4">로그인 후 문의 내역을 확인하실 수 있습니다.</p>
                                    <button
                                        onClick={() => navigate('/login')}
                                        className="px-6 py-2 bg-gray-900 text-white rounded-lg hover:bg-gray-800 transition"
                                    >
                                        로그인하기
                                    </button>
                                </div>
                            ) : inquiries.length === 0 ? (
                                <div className="text-center py-12">
                                    <FileText size={64} className="mx-auto text-gray-300 mb-4" />
                                    <p className="text-gray-600">등록된 문의가 없습니다.</p>
                                </div>
                            ) : (
                                <div className="divide-y divide-gray-100">
                                    {inquiries.map(inquiry => (
                                        <div key={inquiry.id} className="p-6">
                                            <div className="flex justify-between items-start mb-3">
                                                <div>
                                                    <div className="flex items-center gap-2 mb-2">
                                                        <span className={`text-xs px-2 py-1 rounded-full font-medium ${inquiry.type === 'return' ? 'bg-red-100 text-red-600' :
                                                            inquiry.type === 'product' ? 'bg-blue-100 text-blue-600' :
                                                                'bg-gray-100 text-gray-600'
                                                            }`}>
                                                            {inquiry.type === 'return' ? '교환/반품' :
                                                                inquiry.type === 'product' ? '상품 문의' :
                                                                    inquiry.type === 'delivery' ? '배송 문의' :
                                                                        inquiry.type === 'payment' ? '결제 문의' : '일반 문의'}
                                                        </span>
                                                        <span className={`text-xs px-2 py-1 rounded-full font-medium ${inquiry.status === 'answered' ? 'bg-green-100 text-green-600' :
                                                            inquiry.status === 'closed' ? 'bg-gray-100 text-gray-600' :
                                                                'bg-orange-100 text-orange-600'
                                                            }`}>
                                                            {inquiry.status === 'answered' ? '답변완료' :
                                                                inquiry.status === 'closed' ? '처리완료' : '답변대기'}
                                                        </span>
                                                    </div>
                                                    <h4 className="font-bold text-gray-900 mb-1">{inquiry.title}</h4>
                                                    <p className="text-sm text-gray-500">{inquiry.createdAt}</p>
                                                </div>
                                            </div>
                                            <p className="text-gray-700 mb-4">{inquiry.content}</p>
                                            {inquiry.answer && (
                                                <div className="mt-4 p-4 bg-gray-50 rounded-lg border-l-4 border-gray-900">
                                                    <p className="text-sm font-bold text-gray-900 mb-2">답변</p>
                                                    <p className="text-gray-700">{inquiry.answer}</p>
                                                    {inquiry.answeredAt && (
                                                        <p className="text-xs text-gray-500 mt-2">{inquiry.answeredAt}</p>
                                                    )}
                                                </div>
                                            )}
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    )}
                </div>
            </div>
        </>
    );
};

export default CustomerService;

