import React, { useState, useEffect } from 'react';
import { ImageIcon, Plus, Edit3, Trash2, Calendar, LinkIcon } from 'lucide-react';
import { Banner, User } from '../../../types';
import { getBanners, createBanner, updateBanner, deleteBanner } from '../../../services/designService';
import { useGlobalModal } from '../../../contexts';

interface BannersManagerProps {
    user: User | null;
}

const BannersManager: React.FC<BannersManagerProps> = ({ user }) => {
    const { showAlert, showConfirm } = useGlobalModal();
    const [loading, setLoading] = useState(false);
    const [banners, setBanners] = useState<Banner[]>([]);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingBanner, setEditingBanner] = useState<Banner | null>(null);

    useEffect(() => {
        loadBanners();
    }, []);

    const loadBanners = async () => {
        setLoading(true);
        try {
            const data = await getBanners();
            setBanners(data);
        } catch (error) {
            console.error('[MY_LOG] Error loading banners:', error);
            await showAlert('배너를 불러오는데 실패했습니다.', '오류');
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
        const bannerData: Omit<Banner, 'id'> = {
            title: formData.get('title') as string,
            imageUrl: formData.get('imageUrl') as string,
            link: formData.get('link') as string,
            startDate: formData.get('startDate') as string,
            endDate: formData.get('endDate') as string,
            position: (formData.get('position') as Banner['position']) || 'middle_banner',
            isActive: formData.get('isActive') === 'on',
        };

        try {
            if (editingBanner) {
                await updateBanner(editingBanner.id, bannerData, {
                    uid: user.uid,
                    username: user.username || 'Admin'
                });
                await showAlert('배너가 수정되었습니다.', '성공');
            } else {
                await createBanner(bannerData, {
                    uid: user.uid,
                    username: user.username || 'Admin'
                });
                await showAlert('배너가 등록되었습니다.', '성공');
            }
            setIsModalOpen(false);
            setEditingBanner(null);
            await loadBanners();
        } catch (error: any) {
            console.error('[MY_LOG] Error saving banner:', error);
            await showAlert('저장에 실패했습니다. ' + (error.message || ''), '오류');
        }
    };

    const handleDelete = async (id: string | number) => {
        if (!user) {
            await showAlert('사용자 정보를 찾을 수 없습니다.', '오류');
            return;
        }

        if (!await showConfirm('정말 이 배너를 삭제하시겠습니까?')) return;

        try {
            await deleteBanner(id, {
                uid: user.uid,
                username: user.username || 'Admin'
            });
            await showAlert('배너가 삭제되었습니다.', '성공');
            await loadBanners();
        } catch (error: any) {
            console.error('[MY_LOG] Error deleting banner:', error);
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
                        <ImageIcon size={20} /> 배너 관리
                    </h2>
                    <p className="text-sm text-gray-500 mt-1">전체 사이트에 표시될 배너를 관리합니다.</p>
                </div>
                <button
                    onClick={() => {
                        setEditingBanner(null);
                        setIsModalOpen(true);
                    }}
                    className="flex items-center gap-2 bg-gray-900 text-white px-4 py-2 rounded-md text-sm hover:bg-gray-800 transition"
                >
                    <Plus size={16} />
                    배너 등록
                </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {banners.length === 0 ? (
                    <div className="col-span-full text-center py-12 text-gray-400">
                        등록된 배너가 없습니다.
                    </div>
                ) : (
                    banners.map((banner) => (
                        <div key={banner.id} className="bg-white border border-gray-200 rounded-lg overflow-hidden group">
                            <div className="relative h-40 bg-gray-100">
                                <img
                                    src={banner.imageUrl}
                                    alt={banner.title}
                                    className="w-full h-full object-cover"
                                    onError={(e) => {
                                        e.currentTarget.src = 'https://via.placeholder.com/400x200?text=No+Image';
                                    }}
                                />
                                <div className="absolute top-2 right-2 flex gap-1 opacity-0 group-hover:opacity-100 transition">
                                    <button
                                        onClick={() => {
                                            setEditingBanner(banner);
                                            setIsModalOpen(true);
                                        }}
                                        className="p-1.5 bg-white rounded-full shadow-sm hover:text-blue-600"
                                    >
                                        <Edit3 size={14} />
                                    </button>
                                    <button
                                        onClick={() => handleDelete(banner.id)}
                                        className="p-1.5 bg-white rounded-full shadow-sm hover:text-red-600"
                                    >
                                        <Trash2 size={14} />
                                    </button>
                                </div>
                                <div className="absolute bottom-2 left-2 bg-black/50 text-white text-xs px-2 py-1 rounded">
                                    {banner.position === 'main_hero' ? '메인 히어로' : banner.position === 'popup' ? '팝업' : '중간 배너'}
                                </div>
                            </div>
                            <div className="p-4">
                                <h3 className="font-bold text-gray-800 mb-1">{banner.title || '제목 없음'}</h3>
                                <div className="flex items-center text-xs text-gray-500 gap-4 mb-3">
                                    <span className="flex items-center gap-1">
                                        <LinkIcon size={12} /> {banner.link || '링크 없음'}
                                    </span>
                                </div>
                                <div className="flex items-center justify-between">
                                    <span className="flex items-center gap-1 text-xs text-gray-500">
                                        <Calendar size={12} /> {banner.startDate} ~ {banner.endDate}
                                    </span>
                                    <span className={`text-xs px-2 py-0.5 rounded-full ${
                                        banner.isActive ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-600'
                                    }`}>
                                        {banner.isActive ? '게시중' : '비활성'}
                                    </span>
                                </div>
                            </div>
                        </div>
                    ))
                )}
            </div>

            {/* Modal */}
            {isModalOpen && (
                <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4 backdrop-blur-sm">
                    <div className="bg-white rounded-lg shadow-2xl max-w-lg w-full p-6">
                        <h2 className="text-lg font-bold mb-6 text-gray-800 border-b pb-2">
                            {editingBanner ? '배너 수정' : '배너 등록'}
                        </h2>
                        <form onSubmit={handleSave} className="space-y-4">
                            <div>
                                <label className="block text-xs font-bold text-gray-600 mb-1">제목</label>
                                <input
                                    name="title"
                                    defaultValue={editingBanner?.title}
                                    className="w-full border border-gray-300 p-2 text-sm rounded-sm outline-none"
                                    required
                                />
                            </div>
                            <div>
                                <label className="block text-xs font-bold text-gray-600 mb-1">이미지 URL</label>
                                <input
                                    name="imageUrl"
                                    type="url"
                                    defaultValue={editingBanner?.imageUrl}
                                    className="w-full border border-gray-300 p-2 text-sm rounded-sm outline-none"
                                    required
                                />
                            </div>
                            <div>
                                <label className="block text-xs font-bold text-gray-600 mb-1">링크</label>
                                <input
                                    name="link"
                                    defaultValue={editingBanner?.link}
                                    className="w-full border border-gray-300 p-2 text-sm rounded-sm outline-none"
                                    placeholder="/shop"
                                />
                            </div>
                            <div>
                                <label className="block text-xs font-bold text-gray-600 mb-1">위치</label>
                                <select
                                    name="position"
                                    defaultValue={editingBanner?.position || 'middle_banner'}
                                    className="w-full border border-gray-300 p-2 text-sm rounded-sm outline-none"
                                >
                                    <option value="main_hero">메인 히어로</option>
                                    <option value="middle_banner">중간 배너</option>
                                    <option value="popup">팝업</option>
                                </select>
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-xs font-bold text-gray-600 mb-1">시작일</label>
                                    <input
                                        type="date"
                                        name="startDate"
                                        defaultValue={editingBanner?.startDate}
                                        className="w-full border border-gray-300 p-2 text-sm rounded-sm outline-none"
                                        required
                                    />
                                </div>
                                <div>
                                    <label className="block text-xs font-bold text-gray-600 mb-1">종료일</label>
                                    <input
                                        type="date"
                                        name="endDate"
                                        defaultValue={editingBanner?.endDate}
                                        className="w-full border border-gray-300 p-2 text-sm rounded-sm outline-none"
                                        required
                                    />
                                </div>
                            </div>
                            <div className="flex items-center gap-2">
                                <input
                                    type="checkbox"
                                    name="isActive"
                                    defaultChecked={editingBanner?.isActive ?? true}
                                    className="w-4 h-4 text-gray-900 border-gray-300 rounded focus:ring-gray-900"
                                />
                                <label className="text-sm font-medium text-gray-700">활성화</label>
                            </div>
                            <div className="flex space-x-2 pt-4">
                                <button
                                    type="button"
                                    onClick={() => {
                                        setIsModalOpen(false);
                                        setEditingBanner(null);
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

export default BannersManager;

