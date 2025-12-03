import React, { useState, useEffect } from 'react';
import { Bell, Plus, Trash2, MoveUp, MoveDown, Save } from 'lucide-react';
import { HomepageAnnouncementBar, User } from '../../../types';
import { getHomepageAnnouncementBar, saveHomepageAnnouncementBar } from '../../../services/homepageService';
import { useGlobalModal } from '../../../contexts';

interface AnnouncementBarManagerProps {
    user: User | null;
}

const AnnouncementBarManager: React.FC<AnnouncementBarManagerProps> = ({ user }) => {
    const { showAlert } = useGlobalModal();
    const [loading, setLoading] = useState(false);
    const [announcementBar, setAnnouncementBar] = useState<Partial<HomepageAnnouncementBar>>({
        messages: [],
        backgroundColor: '#000000',
        textColor: '#ffffff',
        rotationInterval: 4000,
        isActive: true
    });

    useEffect(() => {
        loadData();
    }, []);

    const loadData = async () => {
        setLoading(true);
        try {
            const current = await getHomepageAnnouncementBar();
            if (current) {
                setAnnouncementBar(current);
            } else {
                // 기본값 설정
                setAnnouncementBar({
                    messages: [
                        '🎉 신규 회원 가입 시 10% 할인 쿠폰 증정!',
                        '🚚 5만원 이상 구매 시 무료 배송',
                        '💎 시즌 오프 세일: 최대 50% 할인 (기간 한정)'
                    ],
                    backgroundColor: '#000000',
                    textColor: '#ffffff',
                    rotationInterval: 4000,
                    isActive: true
                });
            }
        } catch (error) {
            console.error('[MY_LOG] Error loading announcement bar data:', error);
            await showAlert('데이터를 불러오는데 실패했습니다.', '오류');
        } finally {
            setLoading(false);
        }
    };

    const handleSave = async () => {
        if (!user) {
            await showAlert('사용자 정보를 찾을 수 없습니다.', '오류');
            return;
        }

        if (!announcementBar.messages || announcementBar.messages.length === 0) {
            await showAlert('알림 메시지를 최소 1개 이상 추가해주세요.', '알림');
            return;
        }

        try {
            const announcementBarData: Omit<HomepageAnnouncementBar, 'id'> = {
                messages: announcementBar.messages || [],
                backgroundColor: announcementBar.backgroundColor || '#000000',
                textColor: announcementBar.textColor || '#ffffff',
                rotationInterval: announcementBar.rotationInterval || 4000,
                isActive: announcementBar.isActive ?? true
            };

            await saveHomepageAnnouncementBar(announcementBarData, {
                uid: user.uid,
                username: user.username || 'Admin'
            });

            await showAlert('상단 알림 바가 저장되었습니다.', '성공');
        } catch (error) {
            console.error('[MY_LOG] Error saving announcement bar:', error);
            await showAlert('저장에 실패했습니다.', '오류');
        }
    };

    const handleAddMessage = () => {
        setAnnouncementBar({
            ...announcementBar,
            messages: [...(announcementBar.messages || []), '']
        });
    };

    const handleUpdateMessage = (index: number, value: string) => {
        const messages = [...(announcementBar.messages || [])];
        messages[index] = value;
        setAnnouncementBar({ ...announcementBar, messages });
    };

    const handleDeleteMessage = (index: number) => {
        const messages = announcementBar.messages?.filter((_, i) => i !== index) || [];
        setAnnouncementBar({ ...announcementBar, messages });
    };

    const handleMoveMessage = (index: number, direction: 'up' | 'down') => {
        const messages = [...(announcementBar.messages || [])];
        if (direction === 'up' && index > 0) {
            [messages[index - 1], messages[index]] = [messages[index], messages[index - 1]];
        } else if (direction === 'down' && index < messages.length - 1) {
            [messages[index], messages[index + 1]] = [messages[index + 1], messages[index]];
        }
        setAnnouncementBar({ ...announcementBar, messages });
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center py-12">
                <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-gray-900"></div>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            <div>
                <h2 className="text-xl font-bold text-gray-800 flex items-center gap-2">
                    <Bell size={20} /> 상단 알림 바 관리
                </h2>
                <p className="text-sm text-gray-500 mt-1">홈페이지 상단에 표시되는 알림 메시지를 관리합니다.</p>
            </div>

            <div className="bg-white border border-gray-200 rounded-lg p-6 space-y-6">
                {/* 알림 메시지 목록 */}
                <div>
                    <div className="flex justify-between items-center mb-4">
                        <h3 className="font-bold text-gray-800">알림 메시지</h3>
                        <button
                            onClick={handleAddMessage}
                            className="flex items-center gap-2 bg-gray-900 text-white px-3 py-1.5 rounded-md text-sm hover:bg-gray-800 transition"
                        >
                            <Plus size={16} />
                            메시지 추가
                        </button>
                    </div>

                    <div className="space-y-3">
                        {announcementBar.messages?.map((message, index) => (
                            <div key={index} className="flex items-start gap-2 p-3 border border-gray-200 rounded-lg">
                                <div className="flex-1">
                                    <input
                                        type="text"
                                        value={message}
                                        onChange={(e) => handleUpdateMessage(index, e.target.value)}
                                        placeholder="알림 메시지를 입력하세요"
                                        className="w-full border border-gray-300 p-2 text-sm rounded-sm outline-none focus:border-gray-900"
                                    />
                                </div>
                                <div className="flex gap-1">
                                    <button
                                        onClick={() => handleMoveMessage(index, 'up')}
                                        disabled={index === 0}
                                        className="p-2 text-gray-400 hover:text-gray-600 disabled:opacity-30 disabled:cursor-not-allowed"
                                        title="위로 이동"
                                    >
                                        <MoveUp size={16} />
                                    </button>
                                    <button
                                        onClick={() => handleMoveMessage(index, 'down')}
                                        disabled={index === (announcementBar.messages?.length || 0) - 1}
                                        className="p-2 text-gray-400 hover:text-gray-600 disabled:opacity-30 disabled:cursor-not-allowed"
                                        title="아래로 이동"
                                    >
                                        <MoveDown size={16} />
                                    </button>
                                    <button
                                        onClick={() => handleDeleteMessage(index)}
                                        className="p-2 text-red-400 hover:text-red-600"
                                        title="삭제"
                                    >
                                        <Trash2 size={16} />
                                    </button>
                                </div>
                            </div>
                        ))}
                        {(!announcementBar.messages || announcementBar.messages.length === 0) && (
                            <div className="text-center py-8 text-gray-400 text-sm">
                                알림 메시지가 없습니다. 메시지를 추가해주세요.
                            </div>
                        )}
                    </div>
                </div>

                {/* 스타일 설정 */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-4 border-t border-gray-200">
                    <div>
                        <label className="block text-xs font-bold text-gray-600 mb-1">배경색</label>
                        <div className="flex gap-2">
                            <input
                                type="color"
                                value={announcementBar.backgroundColor || '#000000'}
                                onChange={(e) => setAnnouncementBar({ ...announcementBar, backgroundColor: e.target.value })}
                                className="w-16 h-10 border border-gray-300 rounded cursor-pointer"
                            />
                            <input
                                type="text"
                                value={announcementBar.backgroundColor || '#000000'}
                                onChange={(e) => setAnnouncementBar({ ...announcementBar, backgroundColor: e.target.value })}
                                className="flex-1 border border-gray-300 p-2 text-sm rounded-sm outline-none"
                                placeholder="#000000"
                            />
                        </div>
                    </div>

                    <div>
                        <label className="block text-xs font-bold text-gray-600 mb-1">텍스트 색상</label>
                        <div className="flex gap-2">
                            <input
                                type="color"
                                value={announcementBar.textColor || '#ffffff'}
                                onChange={(e) => setAnnouncementBar({ ...announcementBar, textColor: e.target.value })}
                                className="w-16 h-10 border border-gray-300 rounded cursor-pointer"
                            />
                            <input
                                type="text"
                                value={announcementBar.textColor || '#ffffff'}
                                onChange={(e) => setAnnouncementBar({ ...announcementBar, textColor: e.target.value })}
                                className="flex-1 border border-gray-300 p-2 text-sm rounded-sm outline-none"
                                placeholder="#ffffff"
                            />
                        </div>
                    </div>

                    <div>
                        <label className="block text-xs font-bold text-gray-600 mb-1">전환 간격 (밀리초)</label>
                        <input
                            type="number"
                            value={announcementBar.rotationInterval || 4000}
                            onChange={(e) => setAnnouncementBar({ ...announcementBar, rotationInterval: parseInt(e.target.value) || 4000 })}
                            className="w-full border border-gray-300 p-2 text-sm rounded-sm outline-none"
                            min="1000"
                            step="500"
                        />
                        <p className="text-xs text-gray-500 mt-1">메시지가 자동으로 전환되는 간격입니다. (기본: 4000ms)</p>
                    </div>

                    <div className="flex items-center gap-2 pt-6">
                        <input
                            type="checkbox"
                            checked={announcementBar.isActive ?? true}
                            onChange={(e) => setAnnouncementBar({ ...announcementBar, isActive: e.target.checked })}
                            className="w-4 h-4 text-gray-900 border-gray-300 rounded focus:ring-gray-900"
                            id="isActive"
                        />
                        <label htmlFor="isActive" className="text-sm font-medium text-gray-700">
                            활성화
                        </label>
                    </div>
                </div>

                {/* 저장 버튼 */}
                <div className="pt-4 border-t border-gray-200">
                    <button
                        onClick={handleSave}
                        className="flex items-center gap-2 bg-gray-900 text-white px-6 py-2.5 rounded-md text-sm font-medium hover:bg-gray-800 transition"
                    >
                        <Save size={16} />
                        저장
                    </button>
                </div>
            </div>
        </div>
    );
};

export default AnnouncementBarManager;

