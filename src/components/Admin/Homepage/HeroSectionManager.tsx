import React, { useState, useEffect } from 'react';
import { Video, Save, Eye } from 'lucide-react';
import { HomepageHero, User } from '../../../types';
import { getHomepageHero, saveHomepageHero } from '../../../services/homepageService';
import { useGlobalModal } from '../../../contexts';
import PreviewModal from '../Shared/PreviewModal';
import HeroSection from '../../features/home/HeroSection';
import FileUpload from '../Shared/FileUpload';
import TextStyleControl from '../Shared/TextStyleControl';

interface HeroSectionManagerProps {
    user: User | null;
}

const HeroSectionManager: React.FC<HeroSectionManagerProps> = ({ user }) => {
    const { showAlert } = useGlobalModal();
    const [loading, setLoading] = useState(false);
    const [saving, setSaving] = useState(false);
    const [isPreviewOpen, setIsPreviewOpen] = useState(false);
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
        titleStyle: { fontSize: '64px', color: '#FFFFFF', fontWeight: '700', letterSpacing: 'normal' },
        subtitleStyle: { fontSize: '16px', color: '#FFD700', fontWeight: '700', letterSpacing: '0.3em' },
        descriptionStyle: { fontSize: '18px', color: '#FFFFFF', fontWeight: '300', letterSpacing: 'normal' },
    });

    useEffect(() => {
        loadData();
    }, []);

    const loadData = async () => {
        setLoading(true);
        try {
            const currentHero = await getHomepageHero();
            if (currentHero) {
                setHero({
                    ...currentHero,
                    titleStyle: currentHero.titleStyle || { fontSize: '64px', color: '#FFFFFF', fontWeight: '700', letterSpacing: 'normal' },
                    subtitleStyle: currentHero.subtitleStyle || { fontSize: '16px', color: '#FFD700', fontWeight: '700', letterSpacing: '0.3em' },
                    descriptionStyle: currentHero.descriptionStyle || { fontSize: '18px', color: '#FFFFFF', fontWeight: '300', letterSpacing: 'normal' },
                });
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

    // Construct preview data
    const previewData = {
        videoUrl: hero.videoUrl,
        imageUrl: hero.imageUrl,
        posterUrl: hero.posterUrl,
        title: hero.title,
        titleStyle: hero.titleStyle,
        subtitle: hero.subtitle,
        subtitleStyle: hero.subtitleStyle,
        description: hero.description,
        descriptionStyle: hero.descriptionStyle,
        buttonText: hero.buttonText,
        buttonLink: hero.buttonLink,
        isActive: hero.isActive
    };

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
                        <FileUpload
                            label="비디오 파일"
                            value={hero.videoUrl || ''}
                            onUpload={(url) => setHero({ ...hero, videoUrl: url })}
                            accept="video/*"
                            storagePath="homepage/hero"
                            helperText="비디오가 없으면 이미지가 표시됩니다."
                        />

                        <FileUpload
                            label="이미지 파일 (Fallback)"
                            value={hero.imageUrl || ''}
                            onUpload={(url) => setHero({ ...hero, imageUrl: url })}
                            accept="image/*"
                            storagePath="homepage/hero"
                        />

                        <FileUpload
                            label="포스터 이미지"
                            value={hero.posterUrl || ''}
                            onUpload={(url) => setHero({ ...hero, posterUrl: url })}
                            accept="image/*"
                            storagePath="homepage/hero"
                        />

                        <div className="space-y-2">
                            <label className="block text-sm font-medium text-gray-700 mb-1">제목 (영문)</label>
                            <input
                                type="text"
                                value={hero.title || ''}
                                onChange={(e) => setHero({ ...hero, title: e.target.value })}
                                className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm"
                                placeholder="LUMINA"
                                required
                            />
                            <TextStyleControl
                                label="제목 스타일"
                                value={hero.titleStyle}
                                onChange={(style) => setHero({ ...hero, titleStyle: style })}
                            />
                        </div>

                        <div className="space-y-2">
                            <label className="block text-sm font-medium text-gray-700 mb-1">부제목</label>
                            <input
                                type="text"
                                value={hero.subtitle || ''}
                                onChange={(e) => setHero({ ...hero, subtitle: e.target.value })}
                                className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm"
                                placeholder="Timeless Elegance"
                            />
                            <TextStyleControl
                                label="부제목 스타일"
                                value={hero.subtitleStyle}
                                onChange={(style) => setHero({ ...hero, subtitleStyle: style })}
                            />
                        </div>

                        <div className="space-y-2">
                            <label className="block text-sm font-medium text-gray-700 mb-1">설명</label>
                            <textarea
                                value={hero.description || ''}
                                onChange={(e) => setHero({ ...hero, description: e.target.value })}
                                className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm"
                                rows={3}
                                placeholder="내면의 빛을 발견하세요..."
                            />
                            <TextStyleControl
                                label="설명 스타일"
                                value={hero.descriptionStyle}
                                onChange={(style) => setHero({ ...hero, descriptionStyle: style })}
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
                            <div className="flex items-center justify-between mb-4">
                                <div className="flex items-center gap-2">
                                    <Eye size={16} className="text-gray-600" />
                                    <h3 className="font-medium text-gray-800">미리보기</h3>
                                </div>
                                <button
                                    type="button"
                                    onClick={() => setIsPreviewOpen(true)}
                                    className="text-xs bg-blue-600 text-white px-3 py-1 rounded hover:bg-blue700 transition"
                                >
                                    전체 화면 미리보기
                                </button>
                            </div>

                            {/* Small Preview */}
                            <div className="relative aspect-video bg-gray-200 rounded-lg overflow-hidden mb-4 group cursor-pointer" onClick={() => setIsPreviewOpen(true)}>
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
                                <div className="absolute inset-0 bg-black/30 group-hover:bg-black/40 transition"></div>
                                <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition">
                                    <Eye className="text-white w-8 h-8" />
                                </div>
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

            <PreviewModal
                isOpen={isPreviewOpen}
                onClose={() => setIsPreviewOpen(false)}
                title="Hero 섹션"
            >
                <HeroSection previewData={previewData} />
            </PreviewModal>
        </div>
    );
};

export default HeroSectionManager;
