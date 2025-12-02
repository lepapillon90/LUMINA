import React, { useState, useEffect } from 'react';
import { Mail, Save, Users, Download } from 'lucide-react';
import { HomepageNewsletter, NewsletterSubscriber, User } from '../../../types';
import { getHomepageNewsletter, saveHomepageNewsletter, getNewsletterSubscribers } from '../../../services/homepageService';
import { useGlobalModal } from '../../../contexts';

interface NewsletterManagerProps {
    user: User | null;
}

const NewsletterManager: React.FC<NewsletterManagerProps> = ({ user }) => {
    const { showAlert } = useGlobalModal();
    const [loading, setLoading] = useState(false);
    const [saving, setSaving] = useState(false);
    const [subscribers, setSubscribers] = useState<NewsletterSubscriber[]>([]);
    const [newsletter, setNewsletter] = useState<Partial<HomepageNewsletter>>({
        title: '뉴스레터 구독하기',
        description: '최신 소식과 특별 할인 혜택을 받아보세요',
        couponCode: '',
        discountAmount: 0,
        showOnFirstVisit: true,
        showOnExitIntent: false,
        isActive: true,
    });

    useEffect(() => {
        loadData();
    }, []);

    const loadData = async () => {
        setLoading(true);
        try {
            const [currentNewsletter, subscribersData] = await Promise.all([
                getHomepageNewsletter(),
                getNewsletterSubscribers()
            ]);

            if (currentNewsletter) {
                setNewsletter(currentNewsletter);
            }
            setSubscribers(subscribersData);
        } catch (error) {
            console.error('[MY_LOG] Error loading newsletter data:', error);
            await showAlert('데이터를 불러오는데 실패했습니다.', '오류');
        } finally {
            setLoading(false);
        }
    };

    const handleSave = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!user) {
            await showAlert('사용자 정보를 찾을 수 없습니다.', '오류');
            return;
        }

        setSaving(true);
        try {
            const newsletterData: Omit<HomepageNewsletter, 'id'> = {
                title: newsletter.title || '뉴스레터 구독하기',
                description: newsletter.description || '',
                couponCode: newsletter.couponCode,
                discountAmount: newsletter.discountAmount || 0,
                showOnFirstVisit: newsletter.showOnFirstVisit ?? true,
                showOnExitIntent: newsletter.showOnExitIntent ?? false,
                isActive: newsletter.isActive ?? true,
            };

            await saveHomepageNewsletter(newsletterData, {
                uid: user.uid,
                username: user.username || 'Admin'
            });

            await showAlert('뉴스레터 설정이 저장되었습니다.', '성공');
        } catch (error: any) {
            console.error('[MY_LOG] Error saving newsletter:', error);
            await showAlert('저장에 실패했습니다. ' + (error.message || ''), '오류');
        } finally {
            setSaving(false);
        }
    };

    const handleExportSubscribers = () => {
        const csv = [
            ['이메일', '구독일', '쿠폰코드', '상태'].join(','),
            ...subscribers.map(sub => [
                sub.email,
                sub.subscribedAt ? new Date(sub.subscribedAt).toLocaleDateString('ko-KR') : '',
                sub.couponCode || '',
                sub.isActive ? '활성' : '비활성'
            ].join(','))
        ].join('\n');

        const blob = new Blob(['\uFEFF' + csv], { type: 'text/csv;charset=utf-8;' });
        const link = document.createElement('a');
        link.href = URL.createObjectURL(blob);
        link.download = `newsletter_subscribers_${new Date().toISOString().split('T')[0]}.csv`;
        link.click();
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center py-12">
                <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-gray-900"></div>
            </div>
        );
    }

    const activeSubscribers = subscribers.filter(s => s.isActive).length;

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <div>
                    <h2 className="text-xl font-bold text-gray-800 flex items-center gap-2">
                        <Mail size={20} /> 뉴스레터 관리
                    </h2>
                    <p className="text-sm text-gray-500 mt-1">뉴스레터 팝업 설정 및 구독자 관리</p>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Settings Form */}
                <div className="lg:col-span-2">
                    <form onSubmit={handleSave} className="space-y-6 bg-white border border-gray-200 rounded-lg p-6">
                        <h3 className="font-bold text-gray-800 mb-4">팝업 설정</h3>
                        
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">제목</label>
                            <input
                                type="text"
                                value={newsletter.title || ''}
                                onChange={(e) => setNewsletter({ ...newsletter, title: e.target.value })}
                                className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm"
                                placeholder="뉴스레터 구독하기"
                                required
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">설명</label>
                            <textarea
                                value={newsletter.description || ''}
                                onChange={(e) => setNewsletter({ ...newsletter, description: e.target.value })}
                                className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm"
                                rows={3}
                                placeholder="최신 소식과 특별 할인 혜택을 받아보세요"
                            />
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">쿠폰 코드 (선택)</label>
                                <input
                                    type="text"
                                    value={newsletter.couponCode || ''}
                                    onChange={(e) => setNewsletter({ ...newsletter, couponCode: e.target.value })}
                                    className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm"
                                    placeholder="NEWSLETTER10"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">할인 금액 (원)</label>
                                <input
                                    type="number"
                                    value={newsletter.discountAmount || 0}
                                    onChange={(e) => setNewsletter({ ...newsletter, discountAmount: parseInt(e.target.value) || 0 })}
                                    className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm"
                                    min="0"
                                />
                            </div>
                        </div>

                        <div className="space-y-2">
                            <label className="block text-sm font-medium text-gray-700 mb-2">표시 조건</label>
                            <div className="space-y-2">
                                <label className="flex items-center gap-2 cursor-pointer">
                                    <input
                                        type="checkbox"
                                        checked={newsletter.showOnFirstVisit ?? true}
                                        onChange={(e) => setNewsletter({ ...newsletter, showOnFirstVisit: e.target.checked })}
                                        className="w-4 h-4 text-gray-900 border-gray-300 rounded focus:ring-gray-900"
                                    />
                                    <span className="text-sm text-gray-700">첫 방문 시 표시</span>
                                </label>
                                <label className="flex items-center gap-2 cursor-pointer">
                                    <input
                                        type="checkbox"
                                        checked={newsletter.showOnExitIntent ?? false}
                                        onChange={(e) => setNewsletter({ ...newsletter, showOnExitIntent: e.target.checked })}
                                        className="w-4 h-4 text-gray-900 border-gray-300 rounded focus:ring-gray-900"
                                    />
                                    <span className="text-sm text-gray-700">이탈 감지 시 표시</span>
                                </label>
                            </div>
                        </div>

                        <div className="flex items-center gap-2">
                            <input
                                type="checkbox"
                                id="isActive"
                                checked={newsletter.isActive ?? true}
                                onChange={(e) => setNewsletter({ ...newsletter, isActive: e.target.checked })}
                                className="w-4 h-4 text-gray-900 border-gray-300 rounded focus:ring-gray-900"
                            />
                            <label htmlFor="isActive" className="text-sm font-medium text-gray-700">
                                활성화
                            </label>
                        </div>

                        <div className="flex justify-end gap-3 pt-4 border-t border-gray-200">
                            <button
                                type="button"
                                onClick={loadData}
                                className="px-4 py-2 border border-gray-300 text-gray-700 rounded-md text-sm hover:bg-gray-50 transition"
                            >
                                취소
                            </button>
                            <button
                                type="submit"
                                disabled={saving}
                                className="flex items-center gap-2 bg-gray-900 text-white px-6 py-2 rounded-md text-sm hover:bg-gray-800 transition disabled:opacity-50"
                            >
                                <Save size={16} />
                                {saving ? '저장 중...' : '저장'}
                            </button>
                        </div>
                    </form>
                </div>

                {/* Subscribers Stats */}
                <div className="space-y-6">
                    <div className="bg-white border border-gray-200 rounded-lg p-6">
                        <div className="flex items-center gap-2 mb-4">
                            <Users size={20} className="text-gray-600" />
                            <h3 className="font-bold text-gray-800">구독자 통계</h3>
                        </div>
                        <div className="space-y-3">
                            <div>
                                <p className="text-2xl font-bold text-gray-900">{subscribers.length}</p>
                                <p className="text-xs text-gray-500">전체 구독자</p>
                            </div>
                            <div>
                                <p className="text-2xl font-bold text-green-600">{activeSubscribers}</p>
                                <p className="text-xs text-gray-500">활성 구독자</p>
                            </div>
                            <button
                                onClick={handleExportSubscribers}
                                className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-gray-100 text-gray-700 rounded-md text-sm hover:bg-gray-200 transition"
                            >
                                <Download size={16} />
                                구독자 내보내기 (CSV)
                            </button>
                        </div>
                    </div>

                    <div className="bg-white border border-gray-200 rounded-lg p-6">
                        <h3 className="font-bold text-gray-800 mb-4">최근 구독자</h3>
                        <div className="space-y-2 max-h-[400px] overflow-y-auto">
                            {subscribers.slice(0, 10).length === 0 ? (
                                <p className="text-sm text-gray-400 text-center py-4">구독자가 없습니다.</p>
                            ) : (
                                subscribers.slice(0, 10).map((sub) => (
                                    <div key={sub.id} className="flex items-center justify-between p-2 border-b border-gray-100">
                                        <div className="flex-1 min-w-0">
                                            <p className="text-sm font-medium text-gray-800 truncate">{sub.email}</p>
                                            <p className="text-xs text-gray-500">
                                                {sub.subscribedAt ? new Date(sub.subscribedAt).toLocaleDateString('ko-KR') : ''}
                                            </p>
                                        </div>
                                        <span className={`text-xs px-2 py-0.5 rounded-full ${
                                            sub.isActive ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-600'
                                        }`}>
                                            {sub.isActive ? '활성' : '비활성'}
                                        </span>
                                    </div>
                                ))
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default NewsletterManager;

