import React, { useState } from 'react';
import { ImageIcon, Plus, Edit3, Trash2, LinkIcon, Calendar, GripVertical, Percent, Package, ExternalLink } from 'lucide-react';
import { Banner, Promotion, Product } from '../../../types';

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
    draggedItemIndex
}) => {
    const [isBannerModalOpen, setIsBannerModalOpen] = useState(false);
    const [isPromotionModalOpen, setIsPromotionModalOpen] = useState(false);
    const [editingBanner, setEditingBanner] = useState<Banner | null>(null);
    const [editingPromotion, setEditingPromotion] = useState<Promotion | null>(null);

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
                                    <button className="p-1.5 bg-white rounded-full shadow-sm hover:text-blue-600"><Edit3 size={14} /></button>
                                    <button className="p-1.5 bg-white rounded-full shadow-sm hover:text-red-600"><Trash2 size={14} /></button>
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
                    <button className="text-sm text-blue-600 hover:underline">순서 저장</button>
                </div>

                <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
                    <div className="p-4 bg-gray-50 border-b border-gray-200 text-xs text-gray-500">
                        * 드래그하여 순서를 변경할 수 있습니다.
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
                        onClick={() => { setEditingPromotion(null); setIsPromotionModalOpen(true); }}
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
                                        <button className="text-gray-400 hover:text-blue-600"><Edit3 size={18} /></button>
                                        <button className="text-gray-400 hover:text-red-600"><Trash2 size={18} /></button>
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
                        <form onSubmit={(e) => { e.preventDefault(); setIsBannerModalOpen(false); }} className="space-y-4">
                            <div>
                                <label className="block text-xs font-bold text-gray-600 mb-1">제목</label>
                                <input defaultValue={editingBanner?.title} className="w-full border border-gray-300 p-2 text-sm rounded-sm outline-none" />
                            </div>
                            <div>
                                <label className="block text-xs font-bold text-gray-600 mb-1">이미지 URL</label>
                                <input defaultValue={editingBanner?.imageUrl} className="w-full border border-gray-300 p-2 text-sm rounded-sm outline-none" />
                            </div>
                            <div>
                                <label className="block text-xs font-bold text-gray-600 mb-1">링크</label>
                                <input defaultValue={editingBanner?.link} className="w-full border border-gray-300 p-2 text-sm rounded-sm outline-none" />
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-xs font-bold text-gray-600 mb-1">시작일</label>
                                    <input type="date" defaultValue={editingBanner?.startDate} className="w-full border border-gray-300 p-2 text-sm rounded-sm outline-none" />
                                </div>
                                <div>
                                    <label className="block text-xs font-bold text-gray-600 mb-1">종료일</label>
                                    <input type="date" defaultValue={editingBanner?.endDate} className="w-full border border-gray-300 p-2 text-sm rounded-sm outline-none" />
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
                        <form onSubmit={(e) => { e.preventDefault(); setIsPromotionModalOpen(false); }} className="space-y-4">
                            <div>
                                <label className="block text-xs font-bold text-gray-600 mb-1">기획전명</label>
                                <input defaultValue={editingPromotion?.title} className="w-full border border-gray-300 p-2 text-sm rounded-sm outline-none" />
                            </div>
                            <div>
                                <label className="block text-xs font-bold text-gray-600 mb-1">설명</label>
                                <textarea defaultValue={editingPromotion?.description} rows={2} className="w-full border border-gray-300 p-2 text-sm rounded-sm outline-none resize-none" />
                            </div>
                            <div>
                                <label className="block text-xs font-bold text-gray-600 mb-1">배너 이미지 URL</label>
                                <input defaultValue={editingPromotion?.bannerImage} className="w-full border border-gray-300 p-2 text-sm rounded-sm outline-none" />
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-xs font-bold text-gray-600 mb-1">시작일</label>
                                    <input type="date" defaultValue={editingPromotion?.startDate} className="w-full border border-gray-300 p-2 text-sm rounded-sm outline-none" />
                                </div>
                                <div>
                                    <label className="block text-xs font-bold text-gray-600 mb-1">종료일</label>
                                    <input type="date" defaultValue={editingPromotion?.endDate} className="w-full border border-gray-300 p-2 text-sm rounded-sm outline-none" />
                                </div>
                            </div>
                            <div>
                                <label className="block text-xs font-bold text-gray-600 mb-1">상품 선택</label>
                                <div className="border border-gray-300 rounded-sm p-2 max-h-40 overflow-y-auto bg-gray-50">
                                    {products.map(product => (
                                        <label key={product.id} className="flex items-center space-x-2 p-1 hover:bg-white rounded cursor-pointer">
                                            <input type="checkbox" className="rounded text-blue-500" defaultChecked={editingPromotion?.productIds.includes(product.id)} />
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
