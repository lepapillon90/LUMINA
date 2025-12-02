import React, { useState, useEffect } from 'react';
import { Image, Plus, Edit3, Trash2, Save, X } from 'lucide-react';
import { HomepageLookbook, LookbookHotspot, User, Product } from '../../../types';
import { getHomepageLookbooks, createHomepageLookbook, updateHomepageLookbook, deleteHomepageLookbook } from '../../../services/homepageService';
import { getProducts } from '../../../services/productService';
import { useGlobalModal } from '../../../contexts';

interface LookbookManagerProps {
    user: User | null;
}

const LookbookManager: React.FC<LookbookManagerProps> = ({ user }) => {
    const { showAlert, showConfirm } = useGlobalModal();
    const [loading, setLoading] = useState(false);
    const [lookbooks, setLookbooks] = useState<HomepageLookbook[]>([]);
    const [allProducts, setAllProducts] = useState<Product[]>([]);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingLookbook, setEditingLookbook] = useState<HomepageLookbook | null>(null);
    const [currentHotspots, setCurrentHotspots] = useState<LookbookHotspot[]>([]);
    const [previewImage, setPreviewImage] = useState<string>('');
    const [isEditingHotspot, setIsEditingHotspot] = useState(false);
    const [editingHotspotId, setEditingHotspotId] = useState<string | null>(null);

    useEffect(() => {
        loadData();
    }, []);

    const loadData = async () => {
        setLoading(true);
        try {
            const [lookbooksData, products] = await Promise.all([
                getHomepageLookbooks(),
                getProducts()
            ]);
            setLookbooks(lookbooksData);
            setAllProducts(products);
        } catch (error) {
            console.error('[MY_LOG] Error loading lookbooks:', error);
            await showAlert('데이터를 불러오는데 실패했습니다.', '오류');
        } finally {
            setLoading(false);
        }
    };

    const handleOpenModal = (lookbook?: HomepageLookbook) => {
        if (lookbook) {
            setEditingLookbook(lookbook);
            setCurrentHotspots(lookbook.hotspots || []);
            setPreviewImage(lookbook.imageUrl);
        } else {
            setEditingLookbook(null);
            setCurrentHotspots([]);
            setPreviewImage('');
        }
        setIsModalOpen(true);
        setIsEditingHotspot(false);
    };

    const handleImageClick = (e: React.MouseEvent<HTMLDivElement>) => {
        if (!isEditingHotspot || !previewImage) return;

        const rect = e.currentTarget.getBoundingClientRect();
        const x = ((e.clientX - rect.left) / rect.width) * 100;
        const y = ((e.clientY - rect.top) / rect.height) * 100;

        if (editingHotspotId) {
            // Update existing hotspot
            setCurrentHotspots(currentHotspots.map(h =>
                h.id === editingHotspotId
                    ? { ...h, x: Math.max(0, Math.min(100, x)), y: Math.max(0, Math.min(100, y)) }
                    : h
            ));
            setEditingHotspotId(null);
        } else {
            // Create new hotspot (product selection will be required)
            const newId = Date.now().toString();
            setCurrentHotspots([...currentHotspots, {
                id: newId,
                x: Math.max(0, Math.min(100, x)),
                y: Math.max(0, Math.min(100, y)),
                productId: 0
            }]);
            setEditingHotspotId(newId);
        }
        setIsEditingHotspot(false);
    };

    const handleSave = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!user) {
            await showAlert('사용자 정보를 찾을 수 없습니다.', '오류');
            return;
        }

        const formData = new FormData(e.currentTarget);
        const lookbookData: Omit<HomepageLookbook, 'id'> = {
            title: formData.get('title') as string,
            description: formData.get('description') as string,
            imageUrl: formData.get('imageUrl') as string,
            hotspots: currentHotspots.filter(h => h.productId > 0),
            season: formData.get('season') as string || undefined,
            isActive: formData.get('isActive') === 'on',
        };

        try {
            if (editingLookbook) {
                await updateHomepageLookbook(editingLookbook.id, lookbookData, {
                    uid: user.uid,
                    username: user.username || 'Admin'
                });
                await showAlert('룩북이 수정되었습니다.', '성공');
            } else {
                await createHomepageLookbook(lookbookData, {
                    uid: user.uid,
                    username: user.username || 'Admin'
                });
                await showAlert('룩북이 생성되었습니다.', '성공');
            }
            setIsModalOpen(false);
            await loadData();
        } catch (error: any) {
            console.error('[MY_LOG] Error saving lookbook:', error);
            await showAlert('저장에 실패했습니다. ' + (error.message || ''), '오류');
        }
    };

    const handleDelete = async (id: string) => {
        if (!user) {
            await showAlert('사용자 정보를 찾을 수 없습니다.', '오류');
            return;
        }

        if (!await showConfirm('정말 이 룩북을 삭제하시겠습니까?')) return;

        try {
            await deleteHomepageLookbook(id, {
                uid: user.uid,
                username: user.username || 'Admin'
            });
            await showAlert('룩북이 삭제되었습니다.', '성공');
            await loadData();
        } catch (error: any) {
            console.error('[MY_LOG] Error deleting lookbook:', error);
            await showAlert('삭제에 실패했습니다.', '오류');
        }
    };

    const handleHotspotProductChange = (hotspotId: string, productId: number) => {
        setCurrentHotspots(currentHotspots.map(h =>
            h.id === hotspotId ? { ...h, productId } : h
        ));
        setEditingHotspotId(null);
    };

    const handleRemoveHotspot = (hotspotId: string) => {
        setCurrentHotspots(currentHotspots.filter(h => h.id !== hotspotId));
        setEditingHotspotId(null);
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
                        <Image size={20} /> 룩북 관리
                    </h2>
                    <p className="text-sm text-gray-500 mt-1">인터랙티브 룩북 이미지와 핫스팟을 관리합니다.</p>
                </div>
                <button
                    onClick={() => handleOpenModal()}
                    className="flex items-center gap-2 bg-gray-900 text-white px-4 py-2 rounded-md text-sm hover:bg-gray-800 transition"
                >
                    <Plus size={16} />
                    룩북 추가
                </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {lookbooks.length === 0 ? (
                    <div className="col-span-full text-center py-12 text-gray-400">
                        등록된 룩북이 없습니다.
                    </div>
                ) : (
                    lookbooks.map((lookbook) => (
                        <div key={lookbook.id} className="bg-white border border-gray-200 rounded-lg overflow-hidden group">
                            <div className="relative aspect-[4/3] bg-gray-100">
                                <img
                                    src={lookbook.imageUrl}
                                    alt={lookbook.title}
                                    className="w-full h-full object-cover"
                                    onError={(e) => {
                                        e.currentTarget.src = 'https://via.placeholder.com/400x300?text=No+Image';
                                    }}
                                />
                                <div className="absolute top-2 right-2 flex gap-1 opacity-0 group-hover:opacity-100 transition">
                                    <button
                                        onClick={() => handleOpenModal(lookbook)}
                                        className="p-1.5 bg-white rounded-full shadow-sm hover:text-blue-600"
                                    >
                                        <Edit3 size={14} />
                                    </button>
                                    <button
                                        onClick={() => handleDelete(lookbook.id)}
                                        className="p-1.5 bg-white rounded-full shadow-sm hover:text-red-600"
                                    >
                                        <Trash2 size={14} />
                                    </button>
                                </div>
                                <div className="absolute bottom-2 left-2 bg-black/50 text-white text-xs px-2 py-1 rounded">
                                    핫스팟 {lookbook.hotspots?.length || 0}개
                                </div>
                            </div>
                            <div className="p-4">
                                <h3 className="font-bold text-gray-800 mb-1">{lookbook.title}</h3>
                                <p className="text-sm text-gray-500 line-clamp-2 mb-3">{lookbook.description}</p>
                                <div className="flex items-center justify-between">
                                    <span className={`text-xs px-2 py-1 rounded-full ${lookbook.isActive ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-600'}`}>
                                        {lookbook.isActive ? '게시중' : '비활성'}
                                    </span>
                                    {lookbook.season && (
                                        <span className="text-xs text-gray-500">{lookbook.season}</span>
                                    )}
                                </div>
                            </div>
                        </div>
                    ))
                )}
            </div>

            {/* Modal */}
            {isModalOpen && (
                <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4 backdrop-blur-sm">
                    <div className="bg-white rounded-lg shadow-2xl max-w-6xl w-full p-6 max-h-[90vh] overflow-y-auto">
                        <h2 className="text-lg font-bold mb-6 text-gray-800 border-b pb-2">
                            {editingLookbook ? '룩북 수정' : '룩북 추가'}
                        </h2>
                        <form onSubmit={handleSave} className="space-y-6">
                            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                                {/* Left: Form */}
                                <div className="space-y-4">
                                    <div>
                                        <label className="block text-xs font-bold text-gray-600 mb-1">제목</label>
                                        <input
                                            name="title"
                                            defaultValue={editingLookbook?.title}
                                            className="w-full border border-gray-300 p-2 text-sm rounded-sm outline-none"
                                            required
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-xs font-bold text-gray-600 mb-1">설명</label>
                                        <textarea
                                            name="description"
                                            defaultValue={editingLookbook?.description}
                                            rows={3}
                                            className="w-full border border-gray-300 p-2 text-sm rounded-sm outline-none resize-none"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-xs font-bold text-gray-600 mb-1">이미지 URL</label>
                                        <input
                                            name="imageUrl"
                                            type="url"
                                            value={previewImage}
                                            onChange={(e) => setPreviewImage(e.target.value)}
                                            className="w-full border border-gray-300 p-2 text-sm rounded-sm outline-none"
                                            required
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-xs font-bold text-gray-600 mb-1">시즌 (선택)</label>
                                        <input
                                            name="season"
                                            defaultValue={editingLookbook?.season}
                                            className="w-full border border-gray-300 p-2 text-sm rounded-sm outline-none"
                                            placeholder="winter, spring, summer, fall"
                                        />
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <input
                                            type="checkbox"
                                            name="isActive"
                                            defaultChecked={editingLookbook?.isActive ?? true}
                                            className="w-4 h-4 text-gray-900 border-gray-300 rounded focus:ring-gray-900"
                                        />
                                        <label className="text-sm font-medium text-gray-700">활성화</label>
                                    </div>
                                </div>

                                {/* Right: Image Preview with Hotspots */}
                                <div className="space-y-4">
                                    <div className="flex items-center justify-between">
                                        <label className="text-xs font-bold text-gray-600">핫스팟 편집</label>
                                        <button
                                            type="button"
                                            onClick={() => {
                                                setIsEditingHotspot(!isEditingHotspot);
                                                setEditingHotspotId(null);
                                            }}
                                            className={`px-3 py-1 text-xs rounded-md transition ${
                                                isEditingHotspot
                                                    ? 'bg-red-100 text-red-700'
                                                    : 'bg-blue-100 text-blue-700'
                                            }`}
                                        >
                                            {isEditingHotspot ? '편집 완료' : '핫스팟 추가'}
                                        </button>
                                    </div>
                                    {previewImage ? (
                                        <div
                                            className="relative w-full aspect-[4/3] bg-gray-100 rounded-lg overflow-hidden border-2 border-gray-300 cursor-crosshair"
                                            onClick={handleImageClick}
                                        >
                                            <img
                                                src={previewImage}
                                                alt="Preview"
                                                className="w-full h-full object-cover"
                                                onError={(e) => {
                                                    e.currentTarget.src = 'https://via.placeholder.com/800x600?text=No+Image';
                                                }}
                                            />
                                            {currentHotspots.map((hotspot) => {
                                                const product = allProducts.find(p => p.id === hotspot.productId);
                                                return (
                                                    <div
                                                        key={hotspot.id}
                                                        className="absolute transform -translate-x-1/2 -translate-y-1/2"
                                                        style={{ left: `${hotspot.x}%`, top: `${hotspot.y}%` }}
                                                    >
                                                        <div className="relative w-8 h-8 flex items-center justify-center">
                                                            <span className="absolute inset-0 bg-white rounded-full opacity-50 animate-ping"></span>
                                                            <span className="absolute inset-0 bg-white rounded-full shadow-lg flex items-center justify-center">
                                                                <Plus size={16} className="text-primary" />
                                                            </span>
                                                            <button
                                                                type="button"
                                                                onClick={(e) => {
                                                                    e.stopPropagation();
                                                                    if (editingHotspotId === hotspot.id) {
                                                                        setEditingHotspotId(null);
                                                                    } else {
                                                                        setEditingHotspotId(hotspot.id);
                                                                    }
                                                                }}
                                                                className="absolute -top-8 -right-8 w-6 h-6 bg-red-500 text-white rounded-full flex items-center justify-center text-xs hover:bg-red-600"
                                                            >
                                                                <X size={12} />
                                                            </button>
                                                        </div>
                                                        {editingHotspotId === hotspot.id && (
                                                            <div className="absolute top-10 left-1/2 -translate-x-1/2 w-64 bg-white p-3 shadow-xl rounded-lg z-20">
                                                                <label className="block text-xs font-medium mb-2">상품 선택</label>
                                                                <select
                                                                    value={hotspot.productId}
                                                                    onChange={(e) => handleHotspotProductChange(hotspot.id, parseInt(e.target.value))}
                                                                    className="w-full border border-gray-300 p-2 text-sm rounded"
                                                                >
                                                                    <option value="0">상품 선택</option>
                                                                    {allProducts.map(p => (
                                                                        <option key={p.id} value={p.id}>{p.name}</option>
                                                                    ))}
                                                                </select>
                                                                {product && (
                                                                    <div className="mt-2 flex gap-2 items-center">
                                                                        <img src={product.image} alt={product.name} className="w-10 h-10 rounded object-cover" />
                                                                        <div>
                                                                            <p className="text-xs font-medium">{product.name}</p>
                                                                            <p className="text-xs text-gray-500">₩{product.price.toLocaleString()}</p>
                                                                        </div>
                                                                    </div>
                                                                )}
                                                            </div>
                                                        )}
                                                    </div>
                                                );
                                            })}
                                        </div>
                                    ) : (
                                        <div className="w-full aspect-[4/3] bg-gray-100 rounded-lg flex items-center justify-center text-gray-400">
                                            이미지 URL을 입력하세요
                                        </div>
                                    )}
                                    <div className="text-xs text-gray-500">
                                        * 이미지를 클릭하여 핫스팟을 추가하고, 핫스팟을 클릭하여 상품을 연결하세요.
                                    </div>
                                </div>
                            </div>

                            <div className="flex space-x-2 pt-4 border-t border-gray-200">
                                <button
                                    type="button"
                                    onClick={() => setIsModalOpen(false)}
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

export default LookbookManager;

