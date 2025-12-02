import React, { useState, useEffect } from 'react';
import { Image as ImageIcon, Save, Plus, Trash2, ExternalLink } from 'lucide-react';
import { HomepageInstagramFeed, InstagramPost, User } from '../../../types';
import { getHomepageInstagramFeed, saveHomepageInstagramFeed } from '../../../services/homepageService';
import { useGlobalModal } from '../../../contexts';

interface InstagramFeedManagerProps {
    user: User | null;
}

const InstagramFeedManager: React.FC<InstagramFeedManagerProps> = ({ user }) => {
    const { showAlert, showConfirm } = useGlobalModal();
    const [loading, setLoading] = useState(false);
    const [saving, setSaving] = useState(false);
    const [feed, setFeed] = useState<Partial<HomepageInstagramFeed>>({
        accountName: '@lumina_official',
        title: '@lumina_official',
        description: 'Share your moments with #LuminaStyle',
        displayCount: 6,
        posts: [],
        isActive: true,
    });

    useEffect(() => {
        loadData();
    }, []);

    const loadData = async () => {
        setLoading(true);
        try {
            const currentFeed = await getHomepageInstagramFeed();
            if (currentFeed) {
                setFeed(currentFeed);
            }
        } catch (error) {
            console.error('[MY_LOG] Error loading instagram feed:', error);
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
            const feedData: Omit<HomepageInstagramFeed, 'id'> = {
                accountName: feed.accountName || '@lumina_official',
                title: feed.title || feed.accountName || '@lumina_official',
                description: feed.description || '',
                displayCount: feed.displayCount || 6,
                posts: feed.posts || [],
                isActive: feed.isActive ?? true,
            };

            await saveHomepageInstagramFeed(feedData, {
                uid: user.uid,
                username: user.username || 'Admin'
            });

            await showAlert('인스타그램 피드가 저장되었습니다.', '성공');
        } catch (error: any) {
            console.error('[MY_LOG] Error saving instagram feed:', error);
            await showAlert('저장에 실패했습니다. ' + (error.message || ''), '오류');
        } finally {
            setSaving(false);
        }
    };

    const handleAddPost = () => {
        const newPost: InstagramPost = {
            id: Date.now().toString(),
            imageUrl: '',
            likes: 0,
            comments: 0,
            link: 'https://instagram.com',
            displayOrder: feed.posts?.length || 0,
            isActive: true,
            createdAt: new Date(),
        };
        setFeed({
            ...feed,
            posts: [...(feed.posts || []), newPost]
        });
    };

    const handleUpdatePost = (postId: string, updates: Partial<InstagramPost>) => {
        setFeed({
            ...feed,
            posts: feed.posts?.map(p => p.id === postId ? { ...p, ...updates } : p)
        });
    };

    const handleRemovePost = async (postId: string) => {
        if (!await showConfirm('정말 이 포스트를 삭제하시겠습니까?')) return;
        setFeed({
            ...feed,
            posts: feed.posts?.filter(p => p.id !== postId)
        });
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center py-12">
                <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-gray-900"></div>
            </div>
        );
    }

    const sortedPosts = [...(feed.posts || [])].sort((a, b) => a.displayOrder - b.displayOrder);

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <div>
                    <h2 className="text-xl font-bold text-gray-800 flex items-center gap-2">
                        <ImageIcon size={20} /> 인스타그램 피드 관리
                    </h2>
                    <p className="text-sm text-gray-500 mt-1">홈페이지에 표시될 인스타그램 포스트를 관리합니다.</p>
                </div>
            </div>

            <form onSubmit={handleSave} className="space-y-6">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    {/* Left Column: Settings */}
                    <div className="space-y-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">계정명</label>
                            <input
                                type="text"
                                value={feed.accountName || ''}
                                onChange={(e) => setFeed({ ...feed, accountName: e.target.value, title: e.target.value })}
                                className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm"
                                placeholder="@lumina_official"
                                required
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">섹션 제목</label>
                            <input
                                type="text"
                                value={feed.title || ''}
                                onChange={(e) => setFeed({ ...feed, title: e.target.value })}
                                className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm"
                                placeholder="@lumina_official"
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">설명</label>
                            <input
                                type="text"
                                value={feed.description || ''}
                                onChange={(e) => setFeed({ ...feed, description: e.target.value })}
                                className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm"
                                placeholder="Share your moments with #LuminaStyle"
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">표시 개수</label>
                            <input
                                type="number"
                                value={feed.displayCount || 6}
                                onChange={(e) => setFeed({ ...feed, displayCount: parseInt(e.target.value) || 6 })}
                                min="1"
                                max="12"
                                className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm"
                            />
                        </div>

                        <div className="flex items-center gap-2">
                            <input
                                type="checkbox"
                                id="isActive"
                                checked={feed.isActive ?? true}
                                onChange={(e) => setFeed({ ...feed, isActive: e.target.checked })}
                                className="w-4 h-4 text-gray-900 border-gray-300 rounded focus:ring-gray-900"
                            />
                            <label htmlFor="isActive" className="text-sm font-medium text-gray-700">
                                활성화
                            </label>
                        </div>
                    </div>

                    {/* Right Column: Posts Preview */}
                    <div className="space-y-4">
                        <div className="flex justify-between items-center">
                            <h3 className="text-sm font-medium text-gray-700">포스트 목록 ({sortedPosts.length}개)</h3>
                            <button
                                type="button"
                                onClick={handleAddPost}
                                className="flex items-center gap-1 px-3 py-1.5 bg-gray-100 text-gray-700 rounded-md text-sm hover:bg-gray-200 transition"
                            >
                                <Plus size={14} />
                                포스트 추가
                            </button>
                        </div>
                        <div className="bg-gray-50 rounded-lg p-4 max-h-[600px] overflow-y-auto">
                            <div className="grid grid-cols-2 gap-3">
                                {sortedPosts.length === 0 ? (
                                    <div className="col-span-2 text-center py-8 text-gray-400 text-sm">
                                        포스트가 없습니다. 포스트를 추가해주세요.
                                    </div>
                                ) : (
                                    sortedPosts.map((post) => (
                                        <div key={post.id} className="relative group aspect-square bg-gray-200 rounded-lg overflow-hidden">
                                            <img
                                                src={post.imageUrl}
                                                alt="Instagram post"
                                                className="w-full h-full object-cover"
                                                onError={(e) => {
                                                    e.currentTarget.src = 'https://via.placeholder.com/300?text=No+Image';
                                                }}
                                            />
                                            <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition flex flex-col items-center justify-center text-white gap-1 text-xs">
                                                <div className="flex items-center gap-1">
                                                    <span className="font-bold">{post.likes.toLocaleString()}</span>
                                                </div>
                                                <div className="flex items-center gap-1">
                                                    <span className="font-bold">{post.comments.toLocaleString()}</span>
                                                </div>
                                            </div>
                                            <button
                                                type="button"
                                                onClick={() => handleRemovePost(post.id)}
                                                className="absolute top-1 right-1 p-1 bg-red-500 text-white rounded-full opacity-0 group-hover:opacity-100 transition"
                                            >
                                                <Trash2 size={12} />
                                            </button>
                                        </div>
                                    ))
                                )}
                            </div>
                        </div>
                    </div>
                </div>

                {/* Posts Form */}
                {sortedPosts.length > 0 && (
                    <div className="border-t border-gray-200 pt-6">
                        <h3 className="text-sm font-medium text-gray-700 mb-4">포스트 상세 정보</h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {sortedPosts.map((post) => (
                                <div key={post.id} className="border border-gray-200 rounded-lg p-4 space-y-3">
                                    <div className="flex items-center justify-between">
                                        <span className="text-xs font-medium text-gray-500">포스트 #{sortedPosts.indexOf(post) + 1}</span>
                                        <button
                                            type="button"
                                            onClick={() => handleRemovePost(post.id)}
                                            className="p-1 text-red-500 hover:bg-red-50 rounded"
                                        >
                                            <Trash2 size={14} />
                                        </button>
                                    </div>
                                    <div>
                                        <label className="block text-xs font-medium text-gray-600 mb-1">이미지 URL</label>
                                        <input
                                            type="url"
                                            value={post.imageUrl}
                                            onChange={(e) => handleUpdatePost(post.id, { imageUrl: e.target.value })}
                                            className="w-full border border-gray-300 rounded-md px-2 py-1.5 text-sm"
                                            placeholder="https://..."
                                            required
                                        />
                                    </div>
                                    <div className="grid grid-cols-2 gap-2">
                                        <div>
                                            <label className="block text-xs font-medium text-gray-600 mb-1">좋아요</label>
                                            <input
                                                type="number"
                                                value={post.likes}
                                                onChange={(e) => handleUpdatePost(post.id, { likes: parseInt(e.target.value) || 0 })}
                                                className="w-full border border-gray-300 rounded-md px-2 py-1.5 text-sm"
                                                min="0"
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-xs font-medium text-gray-600 mb-1">댓글</label>
                                            <input
                                                type="number"
                                                value={post.comments}
                                                onChange={(e) => handleUpdatePost(post.id, { comments: parseInt(e.target.value) || 0 })}
                                                className="w-full border border-gray-300 rounded-md px-2 py-1.5 text-sm"
                                                min="0"
                                            />
                                        </div>
                                    </div>
                                    <div>
                                        <label className="block text-xs font-medium text-gray-600 mb-1">링크</label>
                                        <input
                                            type="url"
                                            value={post.link}
                                            onChange={(e) => handleUpdatePost(post.id, { link: e.target.value })}
                                            className="w-full border border-gray-300 rounded-md px-2 py-1.5 text-sm"
                                            placeholder="https://instagram.com/p/..."
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-xs font-medium text-gray-600 mb-1">순서</label>
                                        <input
                                            type="number"
                                            value={post.displayOrder}
                                            onChange={(e) => handleUpdatePost(post.id, { displayOrder: parseInt(e.target.value) || 0 })}
                                            className="w-full border border-gray-300 rounded-md px-2 py-1.5 text-sm"
                                            min="0"
                                        />
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                )}

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

export default InstagramFeedManager;

