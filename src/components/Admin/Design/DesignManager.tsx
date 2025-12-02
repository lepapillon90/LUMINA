import React, { useState } from 'react';
import { ImageIcon, Plus, Edit3, Trash2, LinkIcon, Calendar, GripVertical, Percent, Package, ExternalLink, Save } from 'lucide-react';
import { Banner, Promotion, Product, User } from '../../../types';
import { createBanner, updateBanner, deleteBanner, createPromotion, updatePromotion, deletePromotion, updateProductOrder } from '../../../services/designService';
import { useGlobalModal } from '../../../contexts';

interface DesignManagerProps {
    banners: Banner[];
    setBanners: React.Dispatch<React.SetStateAction<Banner[]>>;
    promotions: Promotion[];
    setPromotions: React.Dispatch<React.SetStateAction<Promotion[]>>;
    products: Product[];
    onDragStart: (index: number) => void;
    onDragOver: (e: React.DragEvent, index: number) => void;
    onDragEnd: () => void;
    draggedItemIndex: number | null;
    user: User | null;
}

const DesignManager: React.FC<DesignManagerProps> = ({
    banners,
    setBanners,
    promotions,
    setPromotions,
    products,
    onDragStart,
    onDragOver,
    onDragEnd,
    draggedItemIndex,
    user
}) => {
    const { showAlert, showConfirm } = useGlobalModal();
    const [isBannerModalOpen, setIsBannerModalOpen] = useState(false);
    const [isPromotionModalOpen, setIsPromotionModalOpen] = useState(false);
    const [editingBanner, setEditingBanner] = useState<Banner | null>(null);
    const [editingPromotion, setEditingPromotion] = useState<Promotion | null>(null);
    const [selectedProductIds, setSelectedProductIds] = useState<number[]>([]);

    // --- Banner Handlers ---
    const handleSaveBanner = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        if (!user) {
            await showAlert('사용자 정보를 찾을 수 없습니다.', '오류');
            return;
        }

        const formData = new FormData(e.currentTarget);
        const bannerData = {
            title: formData.get('title') as string,
            imageUrl: formData.get('imageUrl') as string,
            link: formData.get('link') as string,
            startDate: formData.get('startDate') as string,
            endDate: formData.get('endDate') as string,
            position: 'main_hero' as const, // Default for now
            isActive: true
        };

        try {
            if (editingBanner) {
                await updateBanner(editingBanner.id, bannerData, { uid: user.uid, username: user.username });
                setBanners(prev => prev.map(b => b.id === editingBanner.id ? { ...b, ...bannerData } : b));
                await showAlert('배너가 수정되었습니다.', '성공');
            } else {
                const newBanner = await createBanner(bannerData, { uid: user.uid, username: user.username });
                setBanners(prev => [...prev, newBanner]);
                await showAlert('배너가 등록되었습니다.', '성공');
            }
            setIsBannerModalOpen(false);
        } catch (error: any) {
            console.error(error);
            await showAlert('배너 저장에 실패했습니다. ' + (error.message || ''), '오류');
        }
    };

    const handleDeleteBanner = async (id: string | number) => {
        if (!user) {
            await showAlert('사용자 정보를 찾을 수 없습니다.', '오류');
            return;
        }
        if (!await showConfirm('정말 이 배너를 삭제하시겠습니까?')) return;

        try {
            await deleteBanner(id, { uid: user.uid, username: user.username });
            setBanners(prev => prev.filter(b => b.id !== id));
            await showAlert('배너가 삭제되었습니다.', '성공');
        } catch (error) {
            console.error(error);
            await showAlert('배너 삭제에 실패했습니다.', '오류');
        }
    };

    // --- Promotion Handlers ---
    const handleSavePromotion = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        if (!user) {
            await showAlert('사용자 정보를 찾을 수 없습니다.', '오류');
            return;
        }

        const formData = new FormData(e.currentTarget);
        // Handle product selection manually or via form data if implemented
        // For simplicity, we'll assume productIds are handled separately or just mock for now
        const productIds: number[] = selectedProductIds;

        const promotionData = {
            title: formData.get('title') as string,
            description: formData.get('description') as string,
            bannerImage: formData.get('bannerImage') as string,
            startDate: formData.get('startDate') as string,
            endDate: formData.get('endDate') as string,
            productIds: productIds,
            isActive: true
        };

        try {
            if (editingPromotion) {
                await updatePromotion(editingPromotion.id, promotionData, { uid: user.uid, username: user.username });
                setPromotions(prev => prev.map(p => p.id === editingPromotion.id ? { ...p, ...promotionData } : p));
                await showAlert('기획전이 수정되었습니다.', '성공');
            } else {
                const newPromotion = await createPromotion(promotionData, { uid: user.uid, username: user.username });
                setPromotions(prev => [...prev, newPromotion]);
                await showAlert('기획전이 생성되었습니다.', '성공');
            }
            setIsPromotionModalOpen(false);
        } catch (error: any) {
            console.error(error);
            await showAlert('기획전 저장에 실패했습니다. ' + (error.message || ''), '오류');
        }
    };

    const handleDeletePromotion = async (id: string | number) => {
        if (!user) {
            await showAlert('사용자 정보를 찾을 수 없습니다.', '오류');
            return;
        }
        if (!await showConfirm('정말 이 기획전을 삭제하시겠습니까?')) return;

        try {
            await deletePromotion(id, { uid: user.uid, username: user.username });
            setPromotions(prev => prev.filter(p => p.id !== id));
            await showAlert('기획전이 삭제되었습니다.', '성공');
        } catch (error) {
            console.error(error);
            await showAlert('기획전 삭제에 실패했습니다.', '오류');
        }
    };

    // --- Product Order Handler ---
    const handleSaveProductOrder = async () => {
        if (!user) {
            await showAlert('사용자 정보를 찾을 수 없습니다.', '오류');
            return;
        }
        try {
            await updateProductOrder(products, { uid: user.uid, username: user.username });
            await showAlert('진열 순서가 저장되었습니다.', '성공');
        } catch (error: any) {
            console.error(error);
            await showAlert('순서 저장 실패: ' + (error.message || ''), '오류');
        }
    };

    return (
        <div className="space-y-8">
            {/* Banner Management */}
            <div className="space-y-4">
                <div className="flex justify-between items-center">
                    <h2 className="text-xl font-bold text-gray-800 flex items-center gap-2">
                        <ImageIcon size={20} /> 배너 관리
                    </h2>
                    <button
                        onClick={() => { setEditingBanner(null); setIsBannerModalOpen(true); }}
                        className="flex items-center space-x-2 bg-slate-700 text-white px-4 py-2 rounded-sm text-sm hover:bg-slate-800 transition"
                    >
                        <Plus size={16} />
                        <span>배너 등록</span>
                    </button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {banners.map(banner => (
                        <div key={banner.id} className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden group">
                            <div className="relative h-40 bg-gray-100">
                                <img src={banner.imageUrl} alt={banner.title} className="w-full h-full object-cover" />
                                <div className="absolute top-2 right-2 flex space-x-1 opacity-0 group-hover:opacity-100 transition">
                                    <button onClick={() => { setEditingBanner(banner); setIsBannerModalOpen(true); }} className="p-1.5 bg-white rounded-full shadow-sm hover:text-blue-600"><Edit3 size={14} /></button>
                                    <button onClick={() => handleDeleteBanner(banner.id)} className="p-1.5 bg-white rounded-full shadow-sm hover:text-red-600"><Trash2 size={14} /></button>
                                </div>
                                <div className="absolute bottom-2 left-2 bg-black/50 text-white text-xs px-2 py-1 rounded">
                                    {banner.position === 'main_hero' ? '메인 히어로' : '팝업'}
                                </div>
                            </div>
                            <div className="p-4">
                                <h3 className="font-bold text-gray-800 mb-1">{banner.title || '제목 없음'}</h3>
                                <div className="flex items-center text-xs text-gray-500 gap-4">
                                    <span className="flex items-center gap-1"><LinkIcon size={12} /> {banner.link}</span>
                                    <span className="flex items-center gap-1"><Calendar size={12} /> {banner.startDate} ~ {banner.endDate}</span>
                                </div>
                                <div className="mt-3 flex items-center justify-between">
                                    <span className={`text-xs px-2 py-0.5 rounded-full ${banner.isActive ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-600'}`}>
                                        {banner.isActive ? '게시중' : '비활성'}
                                    </span>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            {/* Display Management (DnD) */}
            <div className="space-y-4">
                <div className="flex justify-between items-center">
                    <h2 className="text-xl font-bold text-gray-800 flex items-center gap-2">
                        <GripVertical size={20} /> 진열 관리 (추천 상품 순서)
                    </h2>
                    <button onClick={handleSaveProductOrder} className="flex items-center space-x-1 text-sm text-blue-600 hover:text-blue-800 font-medium">
                        <Save size={16} />
                        <span>순서 저장</span>
                    </button>
                </div>

                <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
                    <div className="p-4 bg-gray-50 border-b border-gray-200 text-xs text-gray-500">
                        * 드래그하여 순서를 변경할 수 있습니다. 변경 후 반드시 '순서 저장' 버튼을 눌러주세요.
                    </div>
                    <ul className="divide-y divide-gray-100">
                        {products.slice(0, 5).map((product, index) => (
                            <li
                                key={product.id}
                                draggable
                                onDragStart={() => onDragStart(index)}
                                onDragOver={(e) => onDragOver(e, index)}
                                onDragEnd={onDragEnd}
                                className={`flex items-center p-4 hover:bg-gray-50 transition cursor-move ${draggedItemIndex === index ? 'bg-blue-50 opacity-50' : ''}`}
                            >
                                <div className="text-gray-400 mr-4"><GripVertical size={20} /></div>
                                <div className="w-8 text-center font-bold text-gray-400 mr-4">{index + 1}</div>
                                <img src={product.image} alt={product.name} className="w-12 h-12 object-cover rounded border border-gray-100 mr-4" />
                                <div className="flex-1">
                                    <p className="font-bold text-gray-800">{product.name}</p>
                                    <p className="text-xs text-gray-500">₩{product.price.toLocaleString()}</p>
                                </div>
                                <div className="text-xs text-gray-400">ID: {product.id}</div>
                            </li>
                        ))}
                    </ul>
                </div>
            </div>

            {/* Promotion Management */}
            <div className="space-y-6">
                <div className="flex justify-between items-center">
                    <h2 className="text-xl font-bold text-gray-800 flex items-center gap-2">
                        <Percent size={20} /> 기획전 관리
                    </h2>
                    <button
                        onClick={() => { setEditingPromotion(null); setSelectedProductIds([]); setIsPromotionModalOpen(true); }}
                        className="flex items-center space-x-2 bg-slate-700 text-white px-4 py-2 rounded-sm text-sm hover:bg-slate-800 transition"
                    >
                        <Plus size={16} />
                        <span>기획전 생성</span>
                    </button>
                </div>

                <div className="grid grid-cols-1 gap-6">
                    {promotions.map(promo => (
                        <div key={promo.id} className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 flex gap-6">
                            <div className="w-48 h-32 bg-gray-100 rounded-lg overflow-hidden shrink-0">
                                <img src={promo.bannerImage} alt={promo.title} className="w-full h-full object-cover" />
                            </div>
                            <div className="flex-1">
                                <div className="flex justify-between items-start">
                                    <div>
                                        <h3 className="text-lg font-bold text-gray-800 mb-1">{promo.title}</h3>
                                        <p className="text-gray-600 text-sm mb-3">{promo.description}</p>
                                    </div>
                                    <div className="flex space-x-2">
                                        <button onClick={() => { setEditingPromotion(promo); setSelectedProductIds(promo.productIds); setIsPromotionModalOpen(true); }} className="text-gray-400 hover:text-blue-600"><Edit3 size={18} /></button>
                                        <button onClick={() => handleDeletePromotion(promo.id)} className="text-gray-400 hover:text-red-600"><Trash2 size={18} /></button>
                                    </div>
                                </div>
                                <div className="flex items-center gap-4 text-sm text-gray-500 mb-4">
                                    <span className="flex items-center gap-1"><Calendar size={14} /> {promo.startDate} ~ {promo.endDate}</span>
                                    <span className="flex items-center gap-1"><Package size={14} /> 상품 {promo.productIds.length}개</span>
                                </div>
                                <div className="flex items-center gap-2">
                                    <span className={`text-xs px-2 py-1 rounded-full ${promo.isActive ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-600'}`}>
                                        {promo.isActive ? '진행중' : '종료'}
                                    </span>
                                    <button className="text-xs text-blue-600 hover:underline flex items-center gap-1">
                                        페이지 미리보기 <ExternalLink size={10} />
                                    </button>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            {/* Banner Modal */}
            {isBannerModalOpen && (
                <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4 backdrop-blur-sm">
                    <div className="bg-white rounded-lg shadow-2xl max-w-lg w-full p-6">
                        <h2 className="text-lg font-bold mb-6 text-gray-800 border-b pb-2">
                            {editingBanner ? '배너 수정' : '배너 등록'}
                        </h2>
                        <form onSubmit={handleSaveBanner} className="space-y-4">
                            <div>
                                <label className="block text-xs font-bold text-gray-600 mb-1">제목</label>
                                <input name="title" defaultValue={editingBanner?.title} className="w-full border border-gray-300 p-2 text-sm rounded-sm outline-none" required />
                            </div>
                            <div>
                                <label className="block text-xs font-bold text-gray-600 mb-1">이미지 URL</label>
                                <input name="imageUrl" defaultValue={editingBanner?.imageUrl} className="w-full border border-gray-300 p-2 text-sm rounded-sm outline-none" required />
                            </div>
                            <div>
                                <label className="block text-xs font-bold text-gray-600 mb-1">링크</label>
                                <input name="link" defaultValue={editingBanner?.link} className="w-full border border-gray-300 p-2 text-sm rounded-sm outline-none" />
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-xs font-bold text-gray-600 mb-1">시작일</label>
                                    <input type="date" name="startDate" defaultValue={editingBanner?.startDate} className="w-full border border-gray-300 p-2 text-sm rounded-sm outline-none" required />
                                </div>
                                <div>
                                    <label className="block text-xs font-bold text-gray-600 mb-1">종료일</label>
                                    <input type="date" name="endDate" defaultValue={editingBanner?.endDate} className="w-full border border-gray-300 p-2 text-sm rounded-sm outline-none" required />
                                </div>
                            </div>
                            <div className="flex space-x-2 pt-4">
                                <button type="button" onClick={() => setIsBannerModalOpen(false)} className="flex-1 py-2.5 border border-gray-300 text-gray-700 text-sm font-medium hover:bg-gray-50 transition rounded-sm">취소</button>
                                <button type="submit" className="flex-1 py-2.5 bg-blue-600 text-white text-sm font-medium hover:bg-blue-700 transition rounded-sm shadow-sm">저장</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* Promotion Modal */}
            {isPromotionModalOpen && (
                <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4 backdrop-blur-sm">
                    <div className="bg-white rounded-lg shadow-2xl max-w-2xl w-full p-6 max-h-[90vh] overflow-y-auto">
                        <h2 className="text-lg font-bold mb-6 text-gray-800 border-b pb-2">
                            {editingPromotion ? '기획전 수정' : '기획전 생성'}
                        </h2>
                        <form onSubmit={handleSavePromotion} className="space-y-4">
                            <div>
                                <label className="block text-xs font-bold text-gray-600 mb-1">기획전명</label>
                                <input name="title" defaultValue={editingPromotion?.title} className="w-full border border-gray-300 p-2 text-sm rounded-sm outline-none" required />
                            </div>
                            <div>
                                <label className="block text-xs font-bold text-gray-600 mb-1">설명</label>
                                <textarea name="description" defaultValue={editingPromotion?.description} rows={2} className="w-full border border-gray-300 p-2 text-sm rounded-sm outline-none resize-none" />
                            </div>
                            <div>
                                <label className="block text-xs font-bold text-gray-600 mb-1">배너 이미지 URL</label>
                                <input name="bannerImage" defaultValue={editingPromotion?.bannerImage} className="w-full border border-gray-300 p-2 text-sm rounded-sm outline-none" required />
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-xs font-bold text-gray-600 mb-1">시작일</label>
                                    <input type="date" name="startDate" defaultValue={editingPromotion?.startDate} className="w-full border border-gray-300 p-2 text-sm rounded-sm outline-none" required />
                                </div>
                                <div>
                                    <label className="block text-xs font-bold text-gray-600 mb-1">종료일</label>
                                    <input type="date" name="endDate" defaultValue={editingPromotion?.endDate} className="w-full border border-gray-300 p-2 text-sm rounded-sm outline-none" required />
                                </div>
                            </div>
                            <div>
                                <label className="block text-xs font-bold text-gray-600 mb-1">상품 선택</label>
                                <div className="border border-gray-300 rounded-sm p-2 max-h-40 overflow-y-auto bg-gray-50">
                                    {products.map(product => (
                                        <label key={product.id} className="flex items-center space-x-2 p-1 hover:bg-white rounded cursor-pointer">
                                            <input
                                                type="checkbox"
                                                className="rounded text-blue-500"
                                                checked={selectedProductIds.includes(product.id)}
                                                onChange={() => {
                                                    setSelectedProductIds(prev =>
                                                        prev.includes(product.id)
                                                            ? prev.filter(id => id !== product.id)
                                                            : [...prev, product.id]
                                                    );
                                                }}
                                            />
                                            <img src={product.image} alt="" className="w-6 h-6 rounded object-cover" />
                                            <span className="text-sm text-gray-700">{product.name}</span>
                                        </label>
                                    ))}
                                </div>
                            </div>
                            <div className="flex space-x-2 pt-4">
                                <button type="button" onClick={() => setIsPromotionModalOpen(false)} className="flex-1 py-2.5 border border-gray-300 text-gray-700 text-sm font-medium hover:bg-gray-50 transition rounded-sm">취소</button>
                                <button type="submit" className="flex-1 py-2.5 bg-blue-600 text-white text-sm font-medium hover:bg-blue-700 transition rounded-sm shadow-sm">저장</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default DesignManager;
