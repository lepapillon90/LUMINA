import React, { useState, useEffect } from 'react';
import { Video, Save, Eye } from 'lucide-react';
import { HomepageHero, User } from '../../../types';
import { getHomepageHero, saveHomepageHero } from '../../../services/homepageService';
import { useGlobalModal } from '../../../contexts';

interface HeroSectionManagerProps {
    user: User | null;
}

const HeroSectionManager: React.FC<HeroSectionManagerProps> = ({ user }) => {
    const { showAlert } = useGlobalModal();
    const [loading, setLoading] = useState(false);
    const [saving, setSaving] = useState(false);
    const [hero, setHero] = useState<Partial<HomepageHero>>({
        videoUrl: '',
        imageUrl: '',
        posterUrl: '',
        title: 'LUMINA',
        subtitle: 'Timeless Elegance',
        description: '내면의 빛을 발견하세요. 당신을 위해 수작업으로 완성된 모던 악세서리.',
        buttonText: '컬렉션 보기',
        buttonLink: '/shop',
        isActive: true,
    });

    useEffect(() => {
        loadData();
    }, []);

    const loadData = async () => {
        setLoading(true);
        try {
            const currentHero = await getHomepageHero();
            if (currentHero) {
                setHero(currentHero);
            }
        } catch (error) {
            console.error('[MY_LOG] Error loading hero data:', error);
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
            await saveHomepageHero(hero as Omit<HomepageHero, 'id'>, {
                uid: user.uid,
                username: user.username || 'Admin'
            });

            await showAlert('Hero 섹션이 저장되었습니다.', '성공');
        } catch (error: any) {
            console.error('[MY_LOG] Error saving hero:', error);
            await showAlert('저장에 실패했습니다. ' + (error.message || ''), '오류');
        } finally {
            setSaving(false);
        }
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
            <div className="flex justify-between items-center">
                <div>
                    <h2 className="text-xl font-bold text-gray-800 flex items-center gap-2">
                        <Video size={20} /> Hero 섹션 관리
                    </h2>
                    <p className="text-sm text-gray-500 mt-1">홈페이지 메인 히어로 섹션을 관리합니다.</p>
                </div>
            </div>

            <form onSubmit={handleSave} className="space-y-6">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    {/* Left Column: Form */}
                    <div className="space-y-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">비디오 URL</label>
                            <input
                                type="url"
                                value={hero.videoUrl || ''}
                                onChange={(e) => setHero({ ...hero, videoUrl: e.target.value })}
                                className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm"
                                placeholder="https://videos.pexels.com/video-files/..."
                            />
                            <p className="text-xs text-gray-500 mt-1">비디오가 없으면 이미지가 표시됩니다.</p>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">이미지 URL (Fallback)</label>
                            <input
                                type="url"
                                value={hero.imageUrl || ''}
                                onChange={(e) => setHero({ ...hero, imageUrl: e.target.value })}
                                className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm"
                                placeholder="/hero_poster.png"
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">포스터 이미지 URL</label>
                            <input
                                type="url"
                                value={hero.posterUrl || ''}
                                onChange={(e) => setHero({ ...hero, posterUrl: e.target.value })}
                                className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm"
                                placeholder="/hero_poster.png"
                                required
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">제목 (영문)</label>
                            <input
                                type="text"
                                value={hero.title || ''}
                                onChange={(e) => setHero({ ...hero, title: e.target.value })}
                                className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm"
                                placeholder="LUMINA"
                                required
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">부제목</label>
                            <input
                                type="text"
                                value={hero.subtitle || ''}
                                onChange={(e) => setHero({ ...hero, subtitle: e.target.value })}
                                className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm"
                                placeholder="Timeless Elegance"
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">설명</label>
                            <textarea
                                value={hero.description || ''}
                                onChange={(e) => setHero({ ...hero, description: e.target.value })}
                                className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm"
                                rows={3}
                                placeholder="내면의 빛을 발견하세요..."
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">버튼 텍스트</label>
                            <input
                                type="text"
                                value={hero.buttonText || ''}
                                onChange={(e) => setHero({ ...hero, buttonText: e.target.value })}
                                className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm"
                                placeholder="컬렉션 보기"
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">버튼 링크</label>
                            <input
                                type="text"
                                value={hero.buttonLink || ''}
                                onChange={(e) => setHero({ ...hero, buttonLink: e.target.value })}
                                className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm"
                                placeholder="/shop"
                            />
                        </div>

                        <div className="flex items-center gap-2">
                            <input
                                type="checkbox"
                                id="isActive"
                                checked={hero.isActive || false}
                                onChange={(e) => setHero({ ...hero, isActive: e.target.checked })}
                                className="w-4 h-4 text-gray-900 border-gray-300 rounded focus:ring-gray-900"
                            />
                            <label htmlFor="isActive" className="text-sm font-medium text-gray-700">
                                활성화
                            </label>
                        </div>
                    </div>

                    {/* Right Column: Preview */}
                    <div className="space-y-4">
                        <div className="bg-gray-50 rounded-lg p-4">
                            <div className="flex items-center gap-2 mb-4">
                                <Eye size={16} className="text-gray-600" />
                                <h3 className="font-medium text-gray-800">미리보기</h3>
                            </div>
                            <div className="relative aspect-video bg-gray-200 rounded-lg overflow-hidden mb-4">
                                {hero.videoUrl ? (
                                    <video
                                        src={hero.videoUrl}
                                        poster={hero.posterUrl}
                                        className="w-full h-full object-cover"
                                        muted
                                        loop
                                    />
                                ) : hero.posterUrl ? (
                                    <img
                                        src={hero.posterUrl}
                                        alt="Hero preview"
                                        className="w-full h-full object-cover"
                                        onError={(e) => {
                                            e.currentTarget.src = 'https://via.placeholder.com/800x450?text=No+Image';
                                        }}
                                    />
                                ) : (
                                    <div className="w-full h-full flex items-center justify-center text-gray-400">
                                        이미지 또는 비디오를 추가하세요
                                    </div>
                                )}
                                <div className="absolute inset-0 bg-black/30"></div>
                            </div>
                            <div className="text-center text-white bg-black/80 p-4 rounded-lg">
                                <p className="text-xs mb-2 text-[#FFD700] font-bold">
                                    {hero.subtitle || 'Timeless Elegance'}
                                </p>
                                <h1 className="text-2xl font-serif font-bold mb-2">
                                    {hero.title || 'LUMINA'}
                                </h1>
                                <p className="text-sm opacity-95 mb-4">
                                    {hero.description || '내면의 빛을 발견하세요...'}
                                </p>
                                {hero.buttonText && (
                                    <button className="px-6 py-2 border border-white text-white text-xs hover:bg-white hover:text-black transition">
                                        {hero.buttonText}
                                    </button>
                                )}
                            </div>
                        </div>
                    </div>
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
    );
};

export default HeroSectionManager;

