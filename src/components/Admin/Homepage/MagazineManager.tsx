import React, { useState, useEffect } from 'react';
import { BookOpen, Plus, Edit3, Trash2, Save, GripVertical } from 'lucide-react';
import { MagazineArticle, User } from '../../../types';
import { getMagazineArticles, createMagazineArticle, updateMagazineArticle, deleteMagazineArticle } from '../../../services/homepageService';
import { useGlobalModal } from '../../../contexts';

interface MagazineManagerProps {
    user: User | null;
}

const MagazineManager: React.FC<MagazineManagerProps> = ({ user }) => {
    const { showAlert, showConfirm } = useGlobalModal();
    const [loading, setLoading] = useState(false);
    const [articles, setArticles] = useState<MagazineArticle[]>([]);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingArticle, setEditingArticle] = useState<MagazineArticle | null>(null);
    const [draggedIndex, setDraggedIndex] = useState<number | null>(null);

    useEffect(() => {
        loadArticles();
    }, []);

    const loadArticles = async () => {
        setLoading(true);
        try {
            const data = await getMagazineArticles();
            setArticles(data);
        } catch (error) {
            console.error('[MY_LOG] Error loading magazine articles:', error);
            await showAlert('매거진 아티클을 불러오는데 실패했습니다.', '오류');
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

        const formData = new FormData(e.currentTarget);
        const articleData = {
            category: formData.get('category') as string,
            title: formData.get('title') as string,
            excerpt: formData.get('excerpt') as string,
            imageUrl: formData.get('imageUrl') as string,
            link: formData.get('link') as string,
            publishedDate: formData.get('publishedDate') as string,
            displayOrder: editingArticle ? editingArticle.displayOrder : articles.length,
            isActive: formData.get('isActive') === 'on',
        };

        try {
            if (editingArticle) {
                await updateMagazineArticle(editingArticle.id, articleData, {
                    uid: user.uid,
                    username: user.username || 'Admin'
                });
                await showAlert('매거진 아티클이 수정되었습니다.', '성공');
            } else {
                await createMagazineArticle(articleData, {
                    uid: user.uid,
                    username: user.username || 'Admin'
                });
                await showAlert('매거진 아티클이 생성되었습니다.', '성공');
            }
            setIsModalOpen(false);
            setEditingArticle(null);
            await loadArticles();
        } catch (error: any) {
            console.error('[MY_LOG] Error saving magazine article:', error);
            await showAlert('저장에 실패했습니다. ' + (error.message || ''), '오류');
        }
    };

    const handleDelete = async (id: string) => {
        if (!user) {
            await showAlert('사용자 정보를 찾을 수 없습니다.', '오류');
            return;
        }

        if (!await showConfirm('정말 이 아티클을 삭제하시겠습니까?')) return;

        try {
            await deleteMagazineArticle(id, {
                uid: user.uid,
                username: user.username || 'Admin'
            });
            await showAlert('매거진 아티클이 삭제되었습니다.', '성공');
            await loadArticles();
        } catch (error: any) {
            console.error('[MY_LOG] Error deleting magazine article:', error);
            await showAlert('삭제에 실패했습니다.', '오류');
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
                        <BookOpen size={20} /> 매거진 관리
                    </h2>
                    <p className="text-sm text-gray-500 mt-1">홈페이지 매거진 섹션의 아티클을 관리합니다.</p>
                </div>
                <button
                    onClick={() => {
                        setEditingArticle(null);
                        setIsModalOpen(true);
                    }}
                    className="flex items-center gap-2 bg-gray-900 text-white px-4 py-2 rounded-md text-sm hover:bg-gray-800 transition"
                >
                    <Plus size={16} />
                    아티클 추가
                </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {articles.length === 0 ? (
                    <div className="col-span-full text-center py-12 text-gray-400">
                        등록된 매거진 아티클이 없습니다.
                    </div>
                ) : (
                    articles.map((article) => (
                        <div key={article.id} className="bg-white border border-gray-200 rounded-lg overflow-hidden group">
                            <div className="relative aspect-[4/3] bg-gray-100">
                                <img
                                    src={article.imageUrl}
                                    alt={article.title}
                                    className="w-full h-full object-cover"
                                    onError={(e) => {
                                        e.currentTarget.src = 'https://via.placeholder.com/400x300?text=No+Image';
                                    }}
                                />
                                <div className="absolute top-2 right-2 flex gap-1 opacity-0 group-hover:opacity-100 transition">
                                    <button
                                        onClick={() => {
                                            setEditingArticle(article);
                                            setIsModalOpen(true);
                                        }}
                                        className="p-1.5 bg-white rounded-full shadow-sm hover:text-blue-600"
                                    >
                                        <Edit3 size={14} />
                                    </button>
                                    <button
                                        onClick={() => handleDelete(article.id)}
                                        className="p-1.5 bg-white rounded-full shadow-sm hover:text-red-600"
                                    >
                                        <Trash2 size={14} />
                                    </button>
                                </div>
                            </div>
                            <div className="p-4">
                                <span className="text-xs font-bold text-gray-400 uppercase">{article.category}</span>
                                <h3 className="font-bold text-gray-800 mt-2 mb-1 line-clamp-1">{article.title}</h3>
                                <p className="text-sm text-gray-500 line-clamp-2 mb-3">{article.excerpt}</p>
                                <div className="flex items-center justify-between">
                                    <span className={`text-xs px-2 py-1 rounded-full ${article.isActive ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-600'}`}>
                                        {article.isActive ? '게시중' : '비활성'}
                                    </span>
                                    <span className="text-xs text-gray-500">순서: {article.displayOrder + 1}</span>
                                </div>
                            </div>
                        </div>
                    ))
                )}
            </div>

            {/* Modal */}
            {isModalOpen && (
                <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4 backdrop-blur-sm">
                    <div className="bg-white rounded-lg shadow-2xl max-w-2xl w-full p-6 max-h-[90vh] overflow-y-auto">
                        <h2 className="text-lg font-bold mb-6 text-gray-800 border-b pb-2">
                            {editingArticle ? '아티클 수정' : '아티클 추가'}
                        </h2>
                        <form onSubmit={handleSave} className="space-y-4">
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-xs font-bold text-gray-600 mb-1">카테고리</label>
                                    <input
                                        name="category"
                                        defaultValue={editingArticle?.category}
                                        className="w-full border border-gray-300 p-2 text-sm rounded-sm outline-none"
                                        placeholder="STYLE GUIDE"
                                        required
                                    />
                                </div>
                                <div>
                                    <label className="block text-xs font-bold text-gray-600 mb-1">발행일</label>
                                    <input
                                        type="date"
                                        name="publishedDate"
                                        defaultValue={editingArticle?.publishedDate}
                                        className="w-full border border-gray-300 p-2 text-sm rounded-sm outline-none"
                                        required
                                    />
                                </div>
                            </div>
                            <div>
                                <label className="block text-xs font-bold text-gray-600 mb-1">제목</label>
                                <input
                                    name="title"
                                    defaultValue={editingArticle?.title}
                                    className="w-full border border-gray-300 p-2 text-sm rounded-sm outline-none"
                                    required
                                />
                            </div>
                            <div>
                                <label className="block text-xs font-bold text-gray-600 mb-1">설명</label>
                                <textarea
                                    name="excerpt"
                                    defaultValue={editingArticle?.excerpt}
                                    rows={3}
                                    className="w-full border border-gray-300 p-2 text-sm rounded-sm outline-none resize-none"
                                    required
                                />
                            </div>
                            <div>
                                <label className="block text-xs font-bold text-gray-600 mb-1">이미지 URL</label>
                                <input
                                    name="imageUrl"
                                    type="url"
                                    defaultValue={editingArticle?.imageUrl}
                                    className="w-full border border-gray-300 p-2 text-sm rounded-sm outline-none"
                                    required
                                />
                            </div>
                            <div>
                                <label className="block text-xs font-bold text-gray-600 mb-1">링크</label>
                                <input
                                    name="link"
                                    defaultValue={editingArticle?.link}
                                    className="w-full border border-gray-300 p-2 text-sm rounded-sm outline-none"
                                    placeholder="/blog/..."
                                    required
                                />
                            </div>
                            <div className="flex items-center gap-2">
                                <input
                                    type="checkbox"
                                    name="isActive"
                                    defaultChecked={editingArticle?.isActive ?? true}
                                    className="w-4 h-4 text-gray-900 border-gray-300 rounded focus:ring-gray-900"
                                />
                                <label className="text-sm font-medium text-gray-700">활성화</label>
                            </div>
                            <div className="flex space-x-2 pt-4">
                                <button
                                    type="button"
                                    onClick={() => {
                                        setIsModalOpen(false);
                                        setEditingArticle(null);
                                    }}
                                    className="flex-1 py-2.5 border border-gray-300 text-gray-700 text-sm font-medium hover:bg-gray-50 transition rounded-sm"
                                >
                                    취소
                                </button>
                                <button
                                    type="submit"
                                    className="flex-1 py-2.5 bg-blue-600 text-white text-sm font-medium hover:bg-blue-700 transition rounded-sm shadow-sm"
                                >
                                    저장
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default MagazineManager;

