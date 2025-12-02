import React, { useState, useEffect } from 'react';
import { Star, Plus, X, GripVertical, Save, Trash2 } from 'lucide-react';
import { Product, HomepageNewArrivals, User } from '../../../types';
import { getHomepageNewArrivals, saveHomepageNewArrivals } from '../../../services/homepageService';
import { getProducts } from '../../../services/productService';
import { useGlobalModal } from '../../../contexts';

interface NewArrivalsManagerProps {
    user: User | null;
}

const NewArrivalsManager: React.FC<NewArrivalsManagerProps> = ({ user }) => {
    const { showAlert } = useGlobalModal();
    const [loading, setLoading] = useState(false);
    const [saving, setSaving] = useState(false);
    const [allProducts, setAllProducts] = useState<Product[]>([]);
    const [selectedProducts, setSelectedProducts] = useState<Product[]>([]);
    const [config, setConfig] = useState<HomepageNewArrivals | null>(null);
    const [draggedIndex, setDraggedIndex] = useState<number | null>(null);
    const [title, setTitle] = useState('New Arrivals');
    const [description, setDescription] = useState('가장 먼저 만나는 루미나의 새로운 컬렉션');
    const [maxDisplayCount, setMaxDisplayCount] = useState(10);
    const [isActive, setIsActive] = useState(true);

    useEffect(() => {
        loadData();
    }, []);

    const loadData = async () => {
        setLoading(true);
        try {
            // Load all products and current config
            const [products, currentConfig] = await Promise.all([
                getProducts(),
                getHomepageNewArrivals()
            ]);

            setAllProducts(products);

            if (currentConfig) {
                setConfig(currentConfig);
                setTitle(currentConfig.title);
                setDescription(currentConfig.description);
                setMaxDisplayCount(currentConfig.maxDisplayCount);
                setIsActive(currentConfig.isActive);

                // Load selected products by IDs
                const selected = currentConfig.productIds
                    .map(id => products.find(p => p.id.toString() === id.toString() || p.id === id))
                    .filter(Boolean) as Product[];
                setSelectedProducts(selected);
            } else {
                // Default values
                setSelectedProducts([]);
            }
        } catch (error) {
            console.error('[MY_LOG] Error loading new arrivals data:', error);
            await showAlert('데이터를 불러오는데 실패했습니다.', '오류');
        } finally {
            setLoading(false);
        }
    };

    const handleAddProduct = (product: Product) => {
        if (selectedProducts.find(p => p.id === product.id)) {
            showAlert('이미 추가된 상품입니다.', '알림');
            return;
        }
        setSelectedProducts([...selectedProducts, product]);
    };

    const handleRemoveProduct = (productId: number | string) => {
        setSelectedProducts(selectedProducts.filter(p => p.id !== productId));
    };

    const handleDragStart = (index: number) => {
        setDraggedIndex(index);
    };

    const handleDragOver = (e: React.DragEvent, index: number) => {
        e.preventDefault();
        if (draggedIndex === null || draggedIndex === index) return;

        const newProducts = [...selectedProducts];
        const draggedItem = newProducts[draggedIndex];
        newProducts.splice(draggedIndex, 1);
        newProducts.splice(index, 0, draggedItem);

        setSelectedProducts(newProducts);
        setDraggedIndex(index);
    };

    const handleDragEnd = () => {
        setDraggedIndex(null);
    };

    const handleSave = async () => {
        if (!user) {
            await showAlert('사용자 정보를 찾을 수 없습니다.', '오류');
            return;
        }

        setSaving(true);
        try {
            const productIds = selectedProducts.map(p => p.id);
            
            const newArrivalsData: Omit<HomepageNewArrivals, 'id'> = {
                title,
                description,
                productIds,
                maxDisplayCount,
                isActive
            };

            await saveHomepageNewArrivals(newArrivalsData, {
                uid: user.uid,
                username: user.username || 'Admin'
            });

            await showAlert('신상품 설정이 저장되었습니다.', '성공');
        } catch (error: any) {
            console.error('[MY_LOG] Error saving new arrivals:', error);
            await showAlert('저장에 실패했습니다. ' + (error.message || ''), '오류');
        } finally {
            setSaving(false);
        }
    };

    // 신상품 뱃지(isNew)가 있는 상품만 표시
    const newProducts = allProducts.filter(p => p.isNew === true);
    const availableProducts = newProducts.filter(
        p => !selectedProducts.find(sp => sp.id === p.id)
    );

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
                        <Star size={20} /> 신상품 관리
                    </h2>
                    <p className="text-sm text-gray-500 mt-1">신상품 뱃지가 있는 상품 중에서 홈페이지에 표시될 신상품을 선택하고 순서를 조정하세요.</p>
                </div>
                <button
                    onClick={handleSave}
                    disabled={saving}
                    className="flex items-center gap-2 bg-gray-900 text-white px-4 py-2 rounded-md text-sm hover:bg-gray-800 transition disabled:opacity-50"
                >
                    <Save size={16} />
                    {saving ? '저장 중...' : '저장'}
                </button>
            </div>

            {/* Settings */}
            <div className="bg-gray-50 p-4 rounded-lg space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">섹션 제목</label>
                        <input
                            type="text"
                            value={title}
                            onChange={(e) => setTitle(e.target.value)}
                            className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm"
                            placeholder="New Arrivals"
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">최대 표시 개수</label>
                        <input
                            type="number"
                            value={maxDisplayCount}
                            onChange={(e) => setMaxDisplayCount(parseInt(e.target.value) || 10)}
                            min="1"
                            max="50"
                            className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm"
                        />
                    </div>
                </div>
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">설명</label>
                    <input
                        type="text"
                        value={description}
                        onChange={(e) => setDescription(e.target.value)}
                        className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm"
                        placeholder="가장 먼저 만나는 루미나의 새로운 컬렉션"
                    />
                </div>
                <div className="flex items-center gap-2">
                    <input
                        type="checkbox"
                        id="isActive"
                        checked={isActive}
                        onChange={(e) => setIsActive(e.target.checked)}
                        className="w-4 h-4 text-gray-900 border-gray-300 rounded focus:ring-gray-900"
                    />
                    <label htmlFor="isActive" className="text-sm font-medium text-gray-700">
                        활성화
                    </label>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Selected Products */}
                <div className="space-y-4">
                    <h3 className="font-bold text-gray-800">선택된 상품 ({selectedProducts.length}개)</h3>
                    <div className="bg-white border border-gray-200 rounded-lg overflow-hidden">
                        <div className="p-3 bg-gray-50 border-b border-gray-200 text-xs text-gray-500">
                            * 드래그하여 순서를 변경할 수 있습니다
                        </div>
                        {selectedProducts.length === 0 ? (
                            <div className="p-8 text-center text-gray-400">
                                선택된 상품이 없습니다.
                            </div>
                        ) : (
                            <ul className="divide-y divide-gray-100">
                                {selectedProducts.map((product, index) => (
                                    <li
                                        key={product.id}
                                        draggable
                                        onDragStart={() => handleDragStart(index)}
                                        onDragOver={(e) => handleDragOver(e, index)}
                                        onDragEnd={handleDragEnd}
                                        className={`flex items-center gap-3 p-3 hover:bg-gray-50 transition cursor-move ${
                                            draggedIndex === index ? 'bg-blue-50 opacity-50' : ''
                                        }`}
                                    >
                                        <GripVertical size={16} className="text-gray-400" />
                                        <span className="w-6 text-center text-xs font-bold text-gray-400">
                                            {index + 1}
                                        </span>
                                        <img
                                            src={product.image}
                                            alt={product.name}
                                            className="w-12 h-12 object-cover rounded border border-gray-100"
                                            onError={(e) => {
                                                e.currentTarget.src = 'https://via.placeholder.com/48?text=No+Image';
                                            }}
                                        />
                                        <div className="flex-1 min-w-0">
                                            <p className="text-sm font-medium text-gray-800 truncate">{product.name}</p>
                                            <p className="text-xs text-gray-500">₩{product.price.toLocaleString()}</p>
                                        </div>
                                        <button
                                            onClick={() => handleRemoveProduct(product.id)}
                                            className="p-1 text-gray-400 hover:text-red-600 transition"
                                        >
                                            <X size={16} />
                                        </button>
                                    </li>
                                ))}
                            </ul>
                        )}
                    </div>
                </div>

                {/* Available Products */}
                <div className="space-y-4">
                    <div className="flex items-center justify-between">
                        <h3 className="font-bold text-gray-800">신상품 목록 (NEW 뱃지)</h3>
                        <span className="text-xs text-gray-500">{newProducts.length}개</span>
                    </div>
                    <div className="bg-white border border-gray-200 rounded-lg max-h-[600px] overflow-y-auto">
                        {availableProducts.length === 0 ? (
                            <div className="p-8 text-center text-gray-400">
                                추가할 수 있는 상품이 없습니다.
                            </div>
                        ) : (
                            <ul className="divide-y divide-gray-100">
                                {availableProducts.map((product) => (
                                    <li
                                        key={product.id}
                                        className="flex items-center gap-3 p-3 hover:bg-gray-50 transition"
                                    >
                                        <img
                                            src={product.image}
                                            alt={product.name}
                                            className="w-12 h-12 object-cover rounded border border-gray-100"
                                            onError={(e) => {
                                                e.currentTarget.src = 'https://via.placeholder.com/48?text=No+Image';
                                            }}
                                        />
                                        <div className="flex-1 min-w-0">
                                            <p className="text-sm font-medium text-gray-800 truncate">{product.name}</p>
                                            <p className="text-xs text-gray-500">₩{product.price.toLocaleString()}</p>
                                        </div>
                                        <button
                                            onClick={() => handleAddProduct(product)}
                                            className="p-2 text-gray-400 hover:text-gray-900 transition"
                                        >
                                            <Plus size={16} />
                                        </button>
                                    </li>
                                ))}
                            </ul>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default NewArrivalsManager;

