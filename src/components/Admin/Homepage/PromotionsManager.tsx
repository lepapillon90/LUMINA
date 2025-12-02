import React, { useState, useEffect } from 'react';
import { Percent, Plus, Edit3, Trash2, Calendar, Package } from 'lucide-react';
import { Promotion, User, Product } from '../../../types';
import { getPromotions, createPromotion, updatePromotion, deletePromotion } from '../../../services/designService';
import { getProducts } from '../../../services/productService';
import { useGlobalModal } from '../../../contexts';

interface PromotionsManagerProps {
    user: User | null;
}

const PromotionsManager: React.FC<PromotionsManagerProps> = ({ user }) => {
    const { showAlert, showConfirm } = useGlobalModal();
    const [loading, setLoading] = useState(false);
    const [promotions, setPromotions] = useState<Promotion[]>([]);
    const [allProducts, setAllProducts] = useState<Product[]>([]);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingPromotion, setEditingPromotion] = useState<Promotion | null>(null);
    const [selectedProductIds, setSelectedProductIds] = useState<number[]>([]);

    useEffect(() => {
        loadData();
    }, []);

    const loadData = async () => {
        setLoading(true);
        try {
            const [promotionsData, products] = await Promise.all([
                getPromotions(),
                getProducts()
            ]);
            setPromotions(promotionsData);
            setAllProducts(products);
        } catch (error) {
            console.error('[MY_LOG] Error loading promotions:', error);
            await showAlert('프로모션을 불러오는데 실패했습니다.', '오류');
        } finally {
            setLoading(false);
        }
    };

    const handleOpenModal = (promotion?: Promotion) => {
        if (promotion) {
            setEditingPromotion(promotion);
            setSelectedProductIds(promotion.productIds || []);
        } else {
            setEditingPromotion(null);
            setSelectedProductIds([]);
        }
        setIsModalOpen(true);
    };

    const handleSave = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!user) {
            await showAlert('사용자 정보를 찾을 수 없습니다.', '오류');
            return;
        }

        const formData = new FormData(e.currentTarget);
        const promotionData: Omit<Promotion, 'id'> = {
            title: formData.get('title') as string,
            description: formData.get('description') as string,
            bannerImage: formData.get('bannerImage') as string,
            startDate: formData.get('startDate') as string,
            endDate: formData.get('endDate') as string,
            productIds: selectedProductIds,
            isActive: formData.get('isActive') === 'on',
        };

        try {
            if (editingPromotion) {
                await updatePromotion(editingPromotion.id, promotionData, {
                    uid: user.uid,
                    username: user.username || 'Admin'
                });
                await showAlert('프로모션이 수정되었습니다.', '성공');
            } else {
                await createPromotion(promotionData, {
                    uid: user.uid,
                    username: user.username || 'Admin'
                });
                await showAlert('프로모션이 생성되었습니다.', '성공');
            }
            setIsModalOpen(false);
            setEditingPromotion(null);
            setSelectedProductIds([]);
            await loadData();
        } catch (error: any) {
            console.error('[MY_LOG] Error saving promotion:', error);
            await showAlert('저장에 실패했습니다. ' + (error.message || ''), '오류');
        }
    };

    const handleDelete = async (id: string | number) => {
        if (!user) {
            await showAlert('사용자 정보를 찾을 수 없습니다.', '오류');
            return;
        }

        if (!await showConfirm('정말 이 프로모션을 삭제하시겠습니까?')) return;

        try {
            await deletePromotion(id, {
                uid: user.uid,
                username: user.username || 'Admin'
            });
            await showAlert('프로모션이 삭제되었습니다.', '성공');
            await loadData();
        } catch (error: any) {
            console.error('[MY_LOG] Error deleting promotion:', error);
            await showAlert('삭제에 실패했습니다.', '오류');
        }
    };

    const toggleProduct = (productId: number) => {
        if (selectedProductIds.includes(productId)) {
            setSelectedProductIds(selectedProductIds.filter(id => id !== productId));
        } else {
            setSelectedProductIds([...selectedProductIds, productId]);
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
                        <Percent size={20} /> 프로모션 관리
                    </h2>
                    <p className="text-sm text-gray-500 mt-1">기획전 및 프로모션 이벤트를 관리합니다.</p>
                </div>
                <button
                    onClick={() => handleOpenModal()}
                    className="flex items-center gap-2 bg-gray-900 text-white px-4 py-2 rounded-md text-sm hover:bg-gray-800 transition"
                >
                    <Plus size={16} />
                    프로모션 생성
                </button>
            </div>

            <div className="grid grid-cols-1 gap-6">
                {promotions.length === 0 ? (
                    <div className="text-center py-12 text-gray-400">
                        등록된 프로모션이 없습니다.
                    </div>
                ) : (
                    promotions.map((promo) => (
                        <div key={promo.id} className="bg-white border border-gray-200 rounded-lg p-6 flex gap-6">
                            <div className="w-48 h-32 bg-gray-100 rounded-lg overflow-hidden shrink-0">
                                <img
                                    src={promo.bannerImage}
                                    alt={promo.title}
                                    className="w-full h-full object-cover"
                                    onError={(e) => {
                                        e.currentTarget.src = 'https://via.placeholder.com/192x128?text=No+Image';
                                    }}
                                />
                            </div>
                            <div className="flex-1">
                                <div className="flex justify-between items-start">
                                    <div>
                                        <h3 className="text-lg font-bold text-gray-800 mb-1">{promo.title}</h3>
                                        <p className="text-gray-600 text-sm mb-3">{promo.description}</p>
                                    </div>
                                    <div className="flex space-x-2">
                                        <button
                                            onClick={() => handleOpenModal(promo)}
                                            className="text-gray-400 hover:text-blue-600"
                                        >
                                            <Edit3 size={18} />
                                        </button>
                                        <button
                                            onClick={() => handleDelete(promo.id)}
                                            className="text-gray-400 hover:text-red-600"
                                        >
                                            <Trash2 size={18} />
                                        </button>
                                    </div>
                                </div>
                                <div className="flex items-center gap-4 text-sm text-gray-500 mb-4">
                                    <span className="flex items-center gap-1">
                                        <Calendar size={14} /> {promo.startDate} ~ {promo.endDate}
                                    </span>
                                    <span className="flex items-center gap-1">
                                        <Package size={14} /> 상품 {promo.productIds.length}개
                                    </span>
                                </div>
                                <div className="flex items-center gap-2">
                                    <span className={`text-xs px-2 py-1 rounded-full ${
                                        promo.isActive ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-600'
                                    }`}>
                                        {promo.isActive ? '진행중' : '종료'}
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
                    <div className="bg-white rounded-lg shadow-2xl max-w-2xl w-full p-6 max-h-[90vh] overflow-y-auto">
                        <h2 className="text-lg font-bold mb-6 text-gray-800 border-b pb-2">
                            {editingPromotion ? '프로모션 수정' : '프로모션 생성'}
                        </h2>
                        <form onSubmit={handleSave} className="space-y-4">
                            <div>
                                <label className="block text-xs font-bold text-gray-600 mb-1">프로모션명</label>
                                <input
                                    name="title"
                                    defaultValue={editingPromotion?.title}
                                    className="w-full border border-gray-300 p-2 text-sm rounded-sm outline-none"
                                    required
                                />
                            </div>
                            <div>
                                <label className="block text-xs font-bold text-gray-600 mb-1">설명</label>
                                <textarea
                                    name="description"
                                    defaultValue={editingPromotion?.description}
                                    rows={2}
                                    className="w-full border border-gray-300 p-2 text-sm rounded-sm outline-none resize-none"
                                />
                            </div>
                            <div>
                                <label className="block text-xs font-bold text-gray-600 mb-1">배너 이미지 URL</label>
                                <input
                                    name="bannerImage"
                                    type="url"
                                    defaultValue={editingPromotion?.bannerImage}
                                    className="w-full border border-gray-300 p-2 text-sm rounded-sm outline-none"
                                    required
                                />
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-xs font-bold text-gray-600 mb-1">시작일</label>
                                    <input
                                        type="date"
                                        name="startDate"
                                        defaultValue={editingPromotion?.startDate}
                                        className="w-full border border-gray-300 p-2 text-sm rounded-sm outline-none"
                                        required
                                    />
                                </div>
                                <div>
                                    <label className="block text-xs font-bold text-gray-600 mb-1">종료일</label>
                                    <input
                                        type="date"
                                        name="endDate"
                                        defaultValue={editingPromotion?.endDate}
                                        className="w-full border border-gray-300 p-2 text-sm rounded-sm outline-none"
                                        required
                                    />
                                </div>
                            </div>
                            <div>
                                <label className="block text-xs font-bold text-gray-600 mb-1">상품 선택 ({selectedProductIds.length}개)</label>
                                <div className="border border-gray-300 rounded-sm p-2 max-h-40 overflow-y-auto bg-gray-50">
                                    {allProducts.length === 0 ? (
                                        <p className="text-xs text-gray-400 text-center py-4">상품이 없습니다.</p>
                                    ) : (
                                        allProducts.map(product => (
                                            <label
                                                key={product.id}
                                                className="flex items-center space-x-2 p-1 hover:bg-white rounded cursor-pointer"
                                            >
                                                <input
                                                    type="checkbox"
                                                    className="rounded text-blue-500"
                                                    checked={selectedProductIds.includes(product.id)}
                                                    onChange={() => toggleProduct(product.id)}
                                                />
                                                <img
                                                    src={product.image}
                                                    alt={product.name}
                                                    className="w-6 h-6 rounded object-cover"
                                                    onError={(e) => {
                                                        e.currentTarget.src = 'https://via.placeholder.com/24?text=No';
                                                    }}
                                                />
                                                <span className="text-sm text-gray-700">{product.name}</span>
                                            </label>
                                        ))
                                    )}
                                </div>
                            </div>
                            <div className="flex items-center gap-2">
                                <input
                                    type="checkbox"
                                    name="isActive"
                                    defaultChecked={editingPromotion?.isActive ?? true}
                                    className="w-4 h-4 text-gray-900 border-gray-300 rounded focus:ring-gray-900"
                                />
                                <label className="text-sm font-medium text-gray-700">활성화</label>
                            </div>
                            <div className="flex space-x-2 pt-4">
                                <button
                                    type="button"
                                    onClick={() => {
                                        setIsModalOpen(false);
                                        setEditingPromotion(null);
                                        setSelectedProductIds([]);
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

export default PromotionsManager;

