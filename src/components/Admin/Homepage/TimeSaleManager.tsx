import React, { useState, useEffect } from 'react';
import { Clock, Save, Package, Eye } from 'lucide-react';
import { HomepageTimeSale, User, Product } from '../../../types';
import { getHomepageTimeSale, saveHomepageTimeSale } from '../../../services/homepageService';
import { getProducts } from '../../../services/productService';
import { useGlobalModal } from '../../../contexts';
import PreviewModal from '../Shared/PreviewModal';
import TimeSale from '../../features/home/TimeSale';
import FileUpload from '../Shared/FileUpload';
import TextStyleControl from '../Shared/TextStyleControl';

interface TimeSaleManagerProps {
    user: User | null;
}

const TimeSaleManager: React.FC<TimeSaleManagerProps> = ({ user }) => {
    const { showAlert } = useGlobalModal();
    const [loading, setLoading] = useState(false);
    const [saving, setSaving] = useState(false);
    const [allProducts, setAllProducts] = useState<Product[]>([]);
    const [isPreviewOpen, setIsPreviewOpen] = useState(false);
    const [timeSale, setTimeSale] = useState<Partial<HomepageTimeSale>>({
        title: 'Flash Sale: 24 Hours Only',
        description: '오늘 자정까지만 진행되는 특별한 혜택. 엄선된 베스트셀러 아이템을 최대 30% 할인된 가격으로 만나보세요.',
        discountPercentage: 30,
        productIds: [],
        countdownEndTime: null,
        backgroundColor: '#000000',
        textColor: '#FFFFFF',
        isActive: true,
        startDate: new Date().toISOString().split('T')[0],
        endDate: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        titleStyle: { fontSize: '2.25rem', color: '#FFFFFF', fontWeight: '700', letterSpacing: 'normal' },
        descriptionStyle: { fontSize: '1rem', color: '#E5E7EB', fontWeight: '300', letterSpacing: 'normal' },
        badgeStyle: { fontSize: '0.75rem', color: '#FFFFFF', fontWeight: '700', letterSpacing: 'normal', backgroundColor: '#DC2626' },
    });

    useEffect(() => {
        loadData();
    }, []);

    const loadData = async () => {
        setLoading(true);
        try {
            const [products, currentTimeSale] = await Promise.all([
                getProducts(),
                getHomepageTimeSale()
            ]);

            setAllProducts(products);

            if (currentTimeSale) {
                setTimeSale({
                    ...currentTimeSale,
                    titleStyle: currentTimeSale.titleStyle || { fontSize: '2.25rem', color: '#FFFFFF', fontWeight: '700', letterSpacing: 'normal' },
                    descriptionStyle: currentTimeSale.descriptionStyle || { fontSize: '1rem', color: '#E5E7EB', fontWeight: '300', letterSpacing: 'normal' },
                    badgeStyle: currentTimeSale.badgeStyle || { fontSize: '0.75rem', color: '#FFFFFF', fontWeight: '700', letterSpacing: 'normal', backgroundColor: '#DC2626' },
                });
            }
        } catch (error) {
            console.error('[MY_LOG] Error loading timesale data:', error);
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

        if (!timeSale.endDate) {
            await showAlert('종료일을 설정해주세요.', '오류');
            return;
        }

        setSaving(true);
        try {
            // Set countdown end time to end of endDate
            const endDate = new Date(timeSale.endDate);
            endDate.setHours(23, 59, 59, 999);

            const timeSaleData: Omit<HomepageTimeSale, 'id'> = {
                title: timeSale.title || 'Flash Sale: 24 Hours Only',
                titleStyle: timeSale.titleStyle,
                description: timeSale.description || '',
                descriptionStyle: timeSale.descriptionStyle,
                badgeStyle: timeSale.badgeStyle,
                discountPercentage: timeSale.discountPercentage || 0,
                productIds: timeSale.productIds || [],
                countdownEndTime: endDate,
                backgroundColor: timeSale.backgroundColor,
                backgroundImageUrl: timeSale.backgroundImageUrl,
                textColor: timeSale.textColor,
                isActive: timeSale.isActive ?? true,
                startDate: timeSale.startDate || new Date().toISOString().split('T')[0],
                endDate: timeSale.endDate || '',
            };

            await saveHomepageTimeSale(timeSaleData, {
                uid: user.uid,
                username: user.username || 'Admin'
            });

            await showAlert('타임세일이 저장되었습니다.', '성공');
        } catch (error: any) {
            console.error('[MY_LOG] Error saving timesale:', error);
            await showAlert('저장에 실패했습니다. ' + (error.message || ''), '오류');
        } finally {
            setSaving(false);
        }
    };

    const toggleProduct = (productId: number | string) => {
        const id = Number(productId);
        const currentIds = timeSale.productIds || [];
        if (currentIds.includes(id)) {
            setTimeSale({
                ...timeSale,
                productIds: currentIds.filter(pid => pid !== id)
            });
        } else {
            setTimeSale({
                ...timeSale,
                productIds: [...currentIds, id]
            });
        }
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center py-12">
                <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-gray-900"></div>
            </div>
        );
    }

    const selectedProducts = allProducts.filter(p =>
        timeSale.productIds?.includes(p.id)
    );

    // Construct preview data
    const previewData = {
        title: timeSale.title,
        titleStyle: timeSale.titleStyle,
        description: timeSale.description,
        descriptionStyle: timeSale.descriptionStyle,
        badgeStyle: timeSale.badgeStyle,
        discountPercentage: timeSale.discountPercentage,
        backgroundColor: timeSale.backgroundColor,
        backgroundImageUrl: timeSale.backgroundImageUrl,
        textColor: timeSale.textColor,
        endDate: timeSale.endDate,
        isActive: timeSale.isActive,
        productIds: timeSale.productIds
    };

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <div>
                    <h2 className="text-xl font-bold text-gray-800 flex items-center gap-2">
                        <Clock size={20} /> 타임세일 관리
                    </h2>
                    <p className="text-sm text-gray-500 mt-1">홈페이지 타임세일 섹션을 관리합니다.</p>
                </div>
            </div>

            <form onSubmit={handleSave} className="space-y-6">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    {/* Left Column: Form */}
                    <div className="space-y-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">제목</label>
                            <input
                                type="text"
                                value={timeSale.title || ''}
                                onChange={(e) => setTimeSale({ ...timeSale, title: e.target.value })}
                                className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm"
                                placeholder="Flash Sale: 24 Hours Only"
                                required
                            />
                            <div className="mt-2">
                                <TextStyleControl
                                    label="제목 스타일"
                                    value={timeSale.titleStyle}
                                    onChange={(style) => setTimeSale({ ...timeSale, titleStyle: style })}
                                />
                            </div>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">설명</label>
                            <textarea
                                value={timeSale.description || ''}
                                onChange={(e) => setTimeSale({ ...timeSale, description: e.target.value })}
                                className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm"
                                rows={3}
                                placeholder="오늘 자정까지만 진행되는 특별한 혜택..."
                            />
                            <div className="mt-2">
                                <TextStyleControl
                                    label="설명 스타일"
                                    value={timeSale.descriptionStyle}
                                    onChange={(style) => setTimeSale({ ...timeSale, descriptionStyle: style })}
                                />
                            </div>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">배지 스타일 (LIMITED TIME OFFER)</label>
                            <TextStyleControl
                                label="배지 스타일"
                                value={timeSale.badgeStyle}
                                onChange={(style) => setTimeSale({ ...timeSale, badgeStyle: style })}
                                showBackgroundColor={true}
                            />
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">할인율 (%)</label>
                                <input
                                    type="number"
                                    value={timeSale.discountPercentage || 0}
                                    onChange={(e) => setTimeSale({ ...timeSale, discountPercentage: parseInt(e.target.value) || 0 })}
                                    min="0"
                                    max="100"
                                    className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">배경색</label>
                                <input
                                    type="color"
                                    value={timeSale.backgroundColor || '#000000'}
                                    onChange={(e) => setTimeSale({ ...timeSale, backgroundColor: e.target.value })}
                                    className="w-full h-10 border border-gray-300 rounded-md"
                                />
                            </div>
                        </div>

                        <FileUpload
                            label="배경 이미지 (선택)"
                            value={timeSale.backgroundImageUrl || ''}
                            onUpload={(url) => setTimeSale({ ...timeSale, backgroundImageUrl: url })}
                            accept="image/*"
                            storagePath="homepage/timesale"
                            helperText="이미지를 업로드하면 배경색 대신 이미지가 표시됩니다."
                        />

                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">시작일</label>
                                <input
                                    type="date"
                                    value={timeSale.startDate || ''}
                                    onChange={(e) => setTimeSale({ ...timeSale, startDate: e.target.value })}
                                    className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm"
                                    required
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">종료일</label>
                                <input
                                    type="date"
                                    value={timeSale.endDate || ''}
                                    onChange={(e) => setTimeSale({ ...timeSale, endDate: e.target.value })}
                                    className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm"
                                    required
                                />
                            </div>
                        </div>

                        <div className="flex items-center gap-2">
                            <input
                                type="checkbox"
                                id="isActive"
                                checked={timeSale.isActive ?? true}
                                onChange={(e) => setTimeSale({ ...timeSale, isActive: e.target.checked })}
                                className="w-4 h-4 text-gray-900 border-gray-300 rounded focus:ring-gray-900"
                            />
                            <label htmlFor="isActive" className="text-sm font-medium text-gray-700">
                                활성화
                            </label>
                        </div>
                    </div>

                    {/* Right Column: Product Selection */}
                    <div className="space-y-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center gap-2">
                                <Package size={16} /> 타임세일 상품 선택 ({selectedProducts.length}개)
                            </label>
                            <div className="bg-white border border-gray-200 rounded-lg max-h-[500px] overflow-y-auto">
                                {allProducts.length === 0 ? (
                                    <div className="p-8 text-center text-gray-400">상품이 없습니다.</div>
                                ) : (
                                    <div className="divide-y divide-gray-100">
                                        {allProducts.map((product) => {
                                            const isSelected = timeSale.productIds?.includes(product.id);
                                            return (
                                                <label
                                                    key={product.id}
                                                    className={`flex items-center gap-3 p-3 cursor-pointer hover:bg-gray-50 ${isSelected ? 'bg-blue-50' : ''
                                                        }`}
                                                >
                                                    <input
                                                        type="checkbox"
                                                        checked={!!isSelected}
                                                        onChange={() => toggleProduct(product.id)}
                                                        className="w-4 h-4 text-gray-900 border-gray-300 rounded focus:ring-gray-900"
                                                    />
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
                                                </label>
                                            );
                                        })}
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                </div>

                <div className="flex justify-end gap-3 pt-4 border-t border-gray-200">
                    <button
                        type="button"
                        onClick={() => setIsPreviewOpen(true)}
                        className="flex items-center gap-2 px-4 py-2 border border-gray-300 text-gray-700 rounded-md text-sm hover:bg-gray-50 transition"
                    >
                        <Eye size={16} />
                        미리보기
                    </button>
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
                title="타임세일 섹션"
            >
                <TimeSale previewData={previewData} />
            </PreviewModal>
        </div>
    );
};

export default TimeSaleManager;
