import React, { useState, useEffect } from 'react';
import { TrendingUp, Save, Heart } from 'lucide-react';
import { HomepageTrendingOOTD, User, OOTDPost } from '../../../types';
import { getHomepageTrendingOOTD, saveHomepageTrendingOOTD } from '../../../services/homepageService';
import { getOOTDPosts } from '../../../services/ootdService';
import { useGlobalModal } from '../../../contexts';

interface TrendingOOTDManagerProps {
    user: User | null;
}

const TrendingOOTDManager: React.FC<TrendingOOTDManagerProps> = ({ user }) => {
    const { showAlert } = useGlobalModal();
    const [loading, setLoading] = useState(false);
    const [saving, setSaving] = useState(false);
    const [allPosts, setAllPosts] = useState<OOTDPost[]>([]);
    const [config, setConfig] = useState<Partial<HomepageTrendingOOTD>>({
        title: 'Trending OOTD',
        description: '지금 가장 사랑받는 스타일을 만나보세요',
        displayCount: 3,
        sortBy: 'likes',
        manualPostIds: [],
        isActive: true,
    });

    useEffect(() => {
        loadData();
    }, []);

    const loadData = async () => {
        setLoading(true);
        try {
            const [posts, currentConfig] = await Promise.all([
                getOOTDPosts(),
                getHomepageTrendingOOTD()
            ]);

            // Sort posts by ID (newest first)
            const sortedPosts = posts.sort((a, b) => (b.id as number) - (a.id as number));
            setAllPosts(sortedPosts);

            if (currentConfig) {
                setConfig(currentConfig);
            }
        } catch (error) {
            console.error('[MY_LOG] Error loading trending OOTD data:', error);
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
            const trendingOOTDData: Omit<HomepageTrendingOOTD, 'id'> = {
                title: config.title || 'Trending OOTD',
                description: config.description || '',
                displayCount: config.displayCount || 3,
                sortBy: config.sortBy || 'likes',
                manualPostIds: config.sortBy === 'manual' ? config.manualPostIds : undefined,
                isActive: config.isActive ?? true,
            };

            await saveHomepageTrendingOOTD(trendingOOTDData, {
                uid: user.uid,
                username: user.username || 'Admin'
            });

            await showAlert('트렌딩 OOTD 설정이 저장되었습니다.', '성공');
        } catch (error: any) {
            console.error('[MY_LOG] Error saving trending OOTD:', error);
            await showAlert('저장에 실패했습니다. ' + (error.message || ''), '오류');
        } finally {
            setSaving(false);
        }
    };

    const toggleManualPost = (postId: number) => {
        const currentIds = config.manualPostIds || [];
        if (currentIds.includes(postId)) {
            setConfig({
                ...config,
                manualPostIds: currentIds.filter(id => id !== postId)
            });
        } else {
            setConfig({
                ...config,
                manualPostIds: [...currentIds, postId]
            });
        }
    };

    // Get posts to display based on sortBy
    const getDisplayPosts = () => {
        if (config.sortBy === 'manual') {
            return allPosts.filter(p => config.manualPostIds?.includes(p.id as number));
        } else if (config.sortBy === 'likes') {
            return [...allPosts].sort((a, b) => b.likes - a.likes);
        } else {
            // recent
            return [...allPosts].sort((a, b) => (b.id as number) - (a.id as number));
        }
    };

    const displayPosts = getDisplayPosts().slice(0, config.displayCount || 3);

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
                        <TrendingUp size={20} /> 트렌딩 OOTD 관리
                    </h2>
                    <p className="text-sm text-gray-500 mt-1">홈페이지에 표시될 트렌딩 OOTD를 관리합니다.</p>
                </div>
            </div>

            <form onSubmit={handleSave} className="space-y-6">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    {/* Left Column: Settings */}
                    <div className="space-y-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">섹션 제목</label>
                            <input
                                type="text"
                                value={config.title || ''}
                                onChange={(e) => setConfig({ ...config, title: e.target.value })}
                                className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm"
                                placeholder="Trending OOTD"
                                required
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">설명</label>
                            <input
                                type="text"
                                value={config.description || ''}
                                onChange={(e) => setConfig({ ...config, description: e.target.value })}
                                className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm"
                                placeholder="지금 가장 사랑받는 스타일을 만나보세요"
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">표시 개수</label>
                            <input
                                type="number"
                                value={config.displayCount || 3}
                                onChange={(e) => setConfig({ ...config, displayCount: parseInt(e.target.value) || 3 })}
                                min="1"
                                max="10"
                                className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm"
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">정렬 기준</label>
                            <div className="space-y-2">
                                <label className="flex items-center gap-2 cursor-pointer">
                                    <input
                                        type="radio"
                                        name="sortBy"
                                        value="likes"
                                        checked={config.sortBy === 'likes'}
                                        onChange={(e) => setConfig({ ...config, sortBy: e.target.value as 'likes' | 'recent' | 'manual' })}
                                        className="w-4 h-4 text-gray-900 border-gray-300 focus:ring-gray-900"
                                    />
                                    <span className="text-sm">좋아요 순</span>
                                </label>
                                <label className="flex items-center gap-2 cursor-pointer">
                                    <input
                                        type="radio"
                                        name="sortBy"
                                        value="recent"
                                        checked={config.sortBy === 'recent'}
                                        onChange={(e) => setConfig({ ...config, sortBy: e.target.value as 'likes' | 'recent' | 'manual' })}
                                        className="w-4 h-4 text-gray-900 border-gray-300 focus:ring-gray-900"
                                    />
                                    <span className="text-sm">최신순</span>
                                </label>
                                <label className="flex items-center gap-2 cursor-pointer">
                                    <input
                                        type="radio"
                                        name="sortBy"
                                        value="manual"
                                        checked={config.sortBy === 'manual'}
                                        onChange={(e) => setConfig({ ...config, sortBy: e.target.value as 'likes' | 'recent' | 'manual' })}
                                        className="w-4 h-4 text-gray-900 border-gray-300 focus:ring-gray-900"
                                    />
                                    <span className="text-sm">수동 선택</span>
                                </label>
                            </div>
                        </div>

                        <div className="flex items-center gap-2">
                            <input
                                type="checkbox"
                                id="isActive"
                                checked={config.isActive ?? true}
                                onChange={(e) => setConfig({ ...config, isActive: e.target.checked })}
                                className="w-4 h-4 text-gray-900 border-gray-300 rounded focus:ring-gray-900"
                            />
                            <label htmlFor="isActive" className="text-sm font-medium text-gray-700">
                                활성화
                            </label>
                        </div>
                    </div>

                    {/* Right Column: Preview */}
                    <div className="space-y-4">
                        <div>
                            <h3 className="text-sm font-medium text-gray-700 mb-3">
                                미리보기 ({displayPosts.length}개)
                            </h3>
                            {config.sortBy === 'manual' && (
                                <p className="text-xs text-gray-500 mb-3">
                                    * OOTD를 클릭하여 선택/해제할 수 있습니다.
                                </p>
                            )}
                            <div className="space-y-3 max-h-[600px] overflow-y-auto">
                                {displayPosts.length === 0 ? (
                                    <div className="text-center py-8 text-gray-400">
                                        {config.sortBy === 'manual' ? 'OOTD를 선택해주세요' : '표시할 OOTD가 없습니다'}
                                    </div>
                                ) : (
                                    displayPosts.map((post, index) => (
                                        <div
                                            key={post.id}
                                            className={`flex gap-3 p-3 border rounded-lg ${
                                                config.sortBy === 'manual' && config.manualPostIds?.includes(post.id as number)
                                                    ? 'border-blue-500 bg-blue-50'
                                                    : 'border-gray-200 hover:border-gray-300'
                                            } ${config.sortBy === 'manual' ? 'cursor-pointer' : ''}`}
                                            onClick={() => {
                                                if (config.sortBy === 'manual') {
                                                    toggleManualPost(post.id as number);
                                                }
                                            }}
                                        >
                                            <div className="w-20 h-20 bg-gray-100 rounded-lg overflow-hidden flex-shrink-0">
                                                <img
                                                    src={post.image}
                                                    alt={post.caption}
                                                    className="w-full h-full object-cover"
                                                    onError={(e) => {
                                                        e.currentTarget.src = 'https://via.placeholder.com/80?text=No+Image';
                                                    }}
                                                />
                                            </div>
                                            <div className="flex-1 min-w-0">
                                                <div className="flex items-center justify-between mb-1">
                                                    <span className="text-xs font-bold text-blue-600">#{index + 1} Trending</span>
                                                    <div className="flex items-center gap-1 text-red-500">
                                                        <Heart size={12} className="fill-current" />
                                                        <span className="text-xs font-bold">{post.likes}</span>
                                                    </div>
                                                </div>
                                                <p className="text-sm font-medium text-gray-800 truncate">{post.user}</p>
                                                <p className="text-xs text-gray-500 line-clamp-2 mt-1">{post.caption}</p>
                                            </div>
                                        </div>
                                    ))
                                )}
                            </div>
                        </div>

                        {config.sortBy === 'manual' && (
                            <div className="mt-4">
                                <h4 className="text-sm font-medium text-gray-700 mb-2">모든 OOTD 목록</h4>
                                <div className="space-y-2 max-h-[300px] overflow-y-auto">
                                    {allPosts.map((post) => {
                                        const isSelected = config.manualPostIds?.includes(post.id as number);
                                        return (
                                            <label
                                                key={post.id}
                                                className={`flex items-center gap-2 p-2 border rounded cursor-pointer hover:bg-gray-50 ${
                                                    isSelected ? 'border-blue-500 bg-blue-50' : 'border-gray-200'
                                                }`}
                                            >
                                                <input
                                                    type="checkbox"
                                                    checked={isSelected}
                                                    onChange={() => toggleManualPost(post.id as number)}
                                                    className="w-4 h-4 text-gray-900 border-gray-300 rounded focus:ring-gray-900"
                                                />
                                                <img
                                                    src={post.image}
                                                    alt={post.caption}
                                                    className="w-12 h-12 rounded object-cover"
                                                    onError={(e) => {
                                                        e.currentTarget.src = 'https://via.placeholder.com/48?text=No+Image';
                                                    }}
                                                />
                                                <div className="flex-1 min-w-0">
                                                    <p className="text-xs font-medium text-gray-800 truncate">{post.user}</p>
                                                    <div className="flex items-center gap-2 mt-1">
                                                        <Heart size={10} className="fill-red-500 text-red-500" />
                                                        <span className="text-xs text-gray-500">{post.likes}</span>
                                                    </div>
                                                </div>
                                            </label>
                                        );
                                    })}
                                </div>
                            </div>
                        )}
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

export default TrendingOOTDManager;

