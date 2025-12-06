import React, { useState, useEffect } from 'react';
import { Calculator, Save, RefreshCw, DollarSign, Package, Truck, Percent, List, Search, Edit, X } from 'lucide-react';
import { Product, User } from '../../../types';
import { getProducts, updateProduct } from '../../../services/productService';
import { useToast } from '../../../contexts/ToastContext';
import { useGlobalModal } from '../../../contexts/GlobalModalContext';

interface OperationManagerProps {
    user: User | null;
}

type SubTab = 'calculator' | 'manual-products';

const OperationManager: React.FC<OperationManagerProps> = ({ user }) => {
    const [activeSubTab, setActiveSubTab] = useState<SubTab>('calculator');
    const { showAlert, showConfirm } = useGlobalModal();
    const [products, setProducts] = useState<Product[]>([]);
    const [selectedProductId, setSelectedProductId] = useState<string>('');
    const [loading, setLoading] = useState(false);
    const { showToast } = useToast();

    // Cost States
    const [purchasePrice, setPurchasePrice] = useState<number>(0);
    const [packagingCost, setPackagingCost] = useState<number>(0);
    const [shippingCost, setShippingCost] = useState<number>(3000); // Default shipping
    const [extraCost, setExtraCost] = useState<number>(0);
    const [targetMargin, setTargetMargin] = useState<number>(30); // Default 30% margin

    // Calculated States
    const [totalCost, setTotalCost] = useState<number>(0);
    const [calculatedPrice, setCalculatedPrice] = useState<number>(0);
    const [estimatedProfit, setEstimatedProfit] = useState<number>(0);

    useEffect(() => {
        fetchProducts();
    }, []);

    const fetchProducts = async () => {
        setLoading(true);
        try {
            const data = await getProducts();
            setProducts(data);
        } catch (error) {
            console.error('Failed to fetch products:', error);
            showToast('상품 목록을 불러오는데 실패했습니다.', 'error');
        } finally {
            setLoading(false);
        }
    };

    // Auto-calculate triggered by input changes
    useEffect(() => {
        const cost = purchasePrice + packagingCost + shippingCost + extraCost;
        setTotalCost(cost);

        // Simple Markup Formula: Cost * (1 + Margin/100)
        // Note: You might want (Cost / (1 - Margin/100)) for Gross Margin, but user likely means Markup here.
        // Let's stick to the requested logic: "Desired Profit Margin" typically implies adding a percentage ON TOP of cost in basic retail.
        // If user expected [Price - Cost] / Price = Margin, we'd use the Gross Margin formula.
        // Given the prompt "purchase price... desired return... selling price automatically calculated", Markup is safer.
        const price = Math.ceil((cost * (1 + targetMargin / 100)) / 100) * 100; // Round to nearest 100 KRW
        setCalculatedPrice(price);

        setEstimatedProfit(price - cost);
    }, [purchasePrice, packagingCost, shippingCost, extraCost, targetMargin]);

    const handleProductSelect = (e: React.ChangeEvent<HTMLSelectElement>) => {
        const productId = e.target.value;
        setSelectedProductId(productId);

        if (productId) {
            const product = products.find(p => p.id.toString() === productId);
            if (product) {
                // Determine if we should pre-fill anything. 
                // Currently we don't store cost info in Product type, so we reset or keep previous values?
                // Let's reset to defaults to avoid confusion, or keep current if user is "trying out" values.
                // Resetting is safer.
                setPurchasePrice(0);
                setPackagingCost(0);
                setShippingCost(3000);
                setExtraCost(0);
                setTargetMargin(30);
            }
        }
    };

    const handleApplyPrice = async () => {
        if (!selectedProductId || !user) return;

        const product = products.find(p => p.id.toString() === selectedProductId);
        if (!product) return;

        try {
            // [MY_LOG] 가격 적용 시 isManualCalculation 플래그도 함께 설정
            await updateProduct(
                product.id,
                { price: calculatedPrice, isManualCalculation: true } as any,
                { uid: user.uid, username: user.username }
            );
            showToast(`'${product.name}'의 판매가가 ${calculatedPrice.toLocaleString()}원으로 수정되었습니다.`, 'success');

            // Update local state to reflect change immediately (optional but good UX)
            setProducts(prev => prev.map(p => p.id === product.id ? { ...p, price: calculatedPrice, isManualCalculation: true } : p));
            
            // [MY_LOG] 가격 적용 후 수동 계산 상품 관리 탭으로 자동 이동
            setActiveSubTab('manual-products');
        } catch (error) {
            console.error('Failed to update price:', error);
            showToast('가격 수정에 실패했습니다.', 'error');
        }
    };

    const formatCurrency = (val: number) => val.toLocaleString();

    // 수동 계산 상품 필터링 (isManualCalculation 플래그가 있는 상품)
    const manualProducts = products.filter(p => (p as any).isManualCalculation === true);
    const [searchTerm, setSearchTerm] = useState('');
    const [filteredManualProducts, setFilteredManualProducts] = useState<Product[]>([]);

    useEffect(() => {
        if (searchTerm) {
            setFilteredManualProducts(
                manualProducts.filter(p =>
                    p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                    p.category.toLowerCase().includes(searchTerm.toLowerCase())
                )
            );
        } else {
            setFilteredManualProducts(manualProducts);
        }
    }, [searchTerm, products]);

    const handleMarkAsManual = async (product: Product) => {
        if (!user) return;
        
        const confirmed = await showConfirm(
            `'${product.name}'을(를) 수동 계산 상품으로 등록하시겠습니까?`
        );
        if (!confirmed) return;

        try {
            await updateProduct(
                product.id,
                { isManualCalculation: true } as any,
                { uid: user.uid, username: user.username }
            );
            showToast(`'${product.name}'이(가) 수동 계산 상품으로 등록되었습니다.`, 'success');
            fetchProducts();
        } catch (error) {
            console.error('Failed to mark as manual:', error);
            showToast('등록에 실패했습니다.', 'error');
        }
    };

    const handleRemoveManual = async (product: Product) => {
        if (!user) return;
        
        const confirmed = await showConfirm(
            `'${product.name}'을(를) 수동 계산 상품 목록에서 제거하시겠습니까?`
        );
        if (!confirmed) return;

        try {
            await updateProduct(
                product.id,
                { isManualCalculation: false } as any,
                { uid: user.uid, username: user.username }
            );
            showToast(`'${product.name}'이(가) 목록에서 제거되었습니다.`, 'success');
            fetchProducts();
        } catch (error) {
            console.error('Failed to remove manual:', error);
            showToast('제거에 실패했습니다.', 'error');
        }
    };

    return (
        <div className="max-w-6xl mx-auto space-y-6">
            <div className="flex items-center gap-2 mb-6">
                <Calculator className="text-gray-700" size={24} />
                <h2 className="text-2xl font-bold text-gray-800">쇼핑몰 운영관리</h2>
            </div>

            {/* 하위 탭 */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200">
                <div className="flex border-b border-gray-200">
                    <button
                        onClick={() => setActiveSubTab('calculator')}
                        className={`flex-1 px-6 py-3 text-sm font-medium transition ${
                            activeSubTab === 'calculator'
                                ? 'text-black border-b-2 border-black bg-gray-50'
                                : 'text-gray-500 hover:text-gray-700'
                        }`}
                    >
                        <div className="flex items-center justify-center gap-2">
                            <Calculator size={16} />
                            손익 계산기
                        </div>
                    </button>
                    <button
                        onClick={() => setActiveSubTab('manual-products')}
                        className={`flex-1 px-6 py-3 text-sm font-medium transition ${
                            activeSubTab === 'manual-products'
                                ? 'text-black border-b-2 border-black bg-gray-50'
                                : 'text-gray-500 hover:text-gray-700'
                        }`}
                    >
                        <div className="flex items-center justify-center gap-2">
                            <List size={16} />
                            수동 계산 상품 관리 ({manualProducts.length})
                        </div>
                    </button>
                </div>
            </div>

            {/* 탭 컨텐츠 */}
            {activeSubTab === 'calculator' && (
                <>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Left Column: Inputs */}
                <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200 space-y-4">
                    <h3 className="font-bold text-gray-700 border-b pb-2 mb-4 flex items-center gap-2">
                        <Package size={18} /> 비용 및 마진 설정
                    </h3>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">대상 상품 선택</label>
                        <select
                            value={selectedProductId}
                            onChange={handleProductSelect}
                            className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:ring-2 focus:ring-black focus:border-transparent outline-none"
                        >
                            <option value="">상품을 선택하세요</option>
                            {products.map(p => (
                                <option key={p.id} value={p.id}>
                                    {p.name} (현재가: {p.price.toLocaleString()}원)
                                </option>
                            ))}
                        </select>
                    </div>

                    <div className="grid grid-cols-1 gap-4 pt-2">
                        <div>
                            <label className="block text-sm font-medium text-gray-600 mb-1">매입가 (원)</label>
                            <div className="relative">
                                <DollarSign size={14} className="absolute left-3 top-3 text-gray-400" />
                                <input
                                    type="number"
                                    value={purchasePrice}
                                    onChange={(e) => setPurchasePrice(Number(e.target.value))}
                                    className="w-full pl-8 border border-gray-300 rounded-md px-3 py-2 text-sm focus:border-black outline-none"
                                />
                            </div>
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-600 mb-1">포장비 (원)</label>
                                <input
                                    type="number"
                                    value={packagingCost}
                                    onChange={(e) => setPackagingCost(Number(e.target.value))}
                                    className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:border-black outline-none"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-600 mb-1">택배비 (원)</label>
                                <input
                                    type="number"
                                    value={shippingCost}
                                    onChange={(e) => setShippingCost(Number(e.target.value))}
                                    className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:border-black outline-none"
                                />
                            </div>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-600 mb-1">기타 비용 (원)</label>
                            <input
                                type="number"
                                value={extraCost}
                                onChange={(e) => setExtraCost(Number(e.target.value))}
                                className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:border-black outline-none"
                            />
                        </div>

                        <div className="pt-2 border-t border-dashed">
                            <label className="block text-sm font-bold text-blue-600 mb-1">희망 수익률 (%)</label>
                            <div className="relative">
                                <Percent size={14} className="absolute left-3 top-3 text-blue-400" />
                                <input
                                    type="number"
                                    value={targetMargin}
                                    onChange={(e) => setTargetMargin(Number(e.target.value))}
                                    className="w-full pl-8 border border-blue-200 bg-blue-50 rounded-md px-3 py-2 text-sm font-bold text-blue-700 focus:border-blue-500 outline-none"
                                />
                            </div>
                        </div>
                    </div>
                </div>

                {/* Right Column: Results */}
                <div className="bg-gray-50 p-6 rounded-lg border border-gray-200 flex flex-col justify-between">
                    <div>
                        <h3 className="font-bold text-gray-700 border-b border-gray-200 pb-2 mb-6 flex items-center gap-2">
                            <RefreshCw size={18} /> 계산 결과
                        </h3>

                        <div className="space-y-4">
                            <div className="flex justify-between items-center text-sm">
                                <span className="text-gray-500">총 비용 (매입+운영비)</span>
                                <span className="font-medium">{formatCurrency(totalCost)} 원</span>
                            </div>
                            <div className="flex justify-between items-center text-sm">
                                <span className="text-gray-500">마진 금액</span>
                                <span className="font-medium text-blue-600">+{formatCurrency(calculatedPrice - totalCost)} 원</span>
                            </div>

                            <div className="my-4 border-t border-gray-200" />

                            <div className="flex justify-between items-end">
                                <span className="font-bold text-gray-800 text-lg">권장 판매가</span>
                                <span className="font-bold text-2xl text-black">{formatCurrency(calculatedPrice)} 원</span>
                            </div>
                            <p className="text-xs text-right text-gray-400">* 100원 단위 반올림</p>
                        </div>
                    </div>

                    <div className="mt-8">
                        <button
                            onClick={handleApplyPrice}
                            disabled={!selectedProductId || calculatedPrice <= 0}
                            className={`
                                w-full py-4 rounded-md font-bold text-lg shadow-md transition-all flex items-center justify-center gap-2
                                ${!selectedProductId || calculatedPrice <= 0
                                    ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                                    : 'bg-black text-white hover:bg-gray-800 hover:shadow-lg transform hover:-translate-y-1'}
                            `}
                        >
                            <Save size={20} />
                            가격 적용하기
                        </button>
                        {!selectedProductId && (
                            <p className="text-xs text-center text-gray-500 mt-2">먼저 상품을 선택해주세요.</p>
                        )}
                    </div>
                </div>
            </div>

                    <div className="bg-blue-50 border border-blue-100 rounded-lg p-4 text-sm text-blue-800">
                        <h4 className="font-bold mb-1">💡 도움말</h4>
                        <p>매입가와 각종 제반 비용을 입력하면, 설정한 마진율에 맞춰 적정 판매가를 자동으로 계산해줍니다. '가격 적용하기' 버튼을 누르면 실제 상품 가격이 즉시 변경됩니다.</p>
                    </div>
                </>
            )}

            {activeSubTab === 'manual-products' && (
                <div className="space-y-6">
                    {/* 검색 및 필터 */}
                    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
                        <div className="flex items-center gap-2">
                            <Search size={16} className="text-gray-400" />
                            <input
                                type="text"
                                placeholder="상품명, 카테고리로 검색..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="flex-1 border-none focus:outline-none text-sm"
                            />
                        </div>
                    </div>

                    {/* 수동 계산 상품 목록 */}
                    <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
                        <div className="overflow-x-auto">
                            <table className="w-full text-left text-sm">
                                <thead className="bg-gray-50 text-gray-600 border-b border-gray-200">
                                    <tr>
                                        <th className="px-6 py-3 font-medium">상품명</th>
                                        <th className="px-6 py-3 font-medium">카테고리</th>
                                        <th className="px-6 py-3 font-medium">현재 가격</th>
                                        <th className="px-6 py-3 font-medium">재고</th>
                                        <th className="px-6 py-3 font-medium">작업</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-50">
                                    {filteredManualProducts.length === 0 ? (
                                        <tr>
                                            <td colSpan={5} className="px-6 py-12 text-center text-gray-400">
                                                {searchTerm
                                                    ? '검색 결과가 없습니다.'
                                                    : '수동 계산 상품이 없습니다. 손익 계산기에서 상품을 선택하고 가격을 적용하면 자동으로 등록됩니다.'}
                                            </td>
                                        </tr>
                                    ) : (
                                        filteredManualProducts.map((product) => (
                                            <tr
                                                key={product.id}
                                                onClick={() => {
                                                    setSelectedProductId(product.id.toString());
                                                    setActiveSubTab('calculator');
                                                }}
                                                className="hover:bg-gray-50 transition cursor-pointer"
                                            >
                                                <td className="px-6 py-4">
                                                    <div className="flex items-center gap-3">
                                                        <img
                                                            src={product.image}
                                                            alt={product.name}
                                                            className="w-10 h-10 rounded object-cover border border-gray-100"
                                                            onError={(e) => {
                                                                e.currentTarget.src = 'https://via.placeholder.com/40?text=No+Image';
                                                            }}
                                                        />
                                                        <span className="font-medium text-gray-800">{product.name}</span>
                                                    </div>
                                                </td>
                                                <td className="px-6 py-4 text-gray-500 capitalize">{product.category}</td>
                                                <td className="px-6 py-4">
                                                    <span className="font-medium text-gray-900">
                                                        ₩{product.price.toLocaleString()}
                                                    </span>
                                                </td>
                                                <td className="px-6 py-4">
                                                    <span className={`font-medium ${
                                                        (product.stock || 0) <= 5 ? 'text-red-600' : 'text-gray-900'
                                                    }`}>
                                                        {product.sizeColorStock && product.sizeColorStock.length > 0
                                                            ? product.sizeColorStock.reduce((sum, item) => sum + item.quantity, 0)
                                                            : (product.stock || 0)
                                                        }개
                                                    </span>
                                                </td>
                                                <td className="px-6 py-4" onClick={(e) => e.stopPropagation()}>
                                                    <div className="flex items-center gap-2">
                                                        <button
                                                            onClick={() => {
                                                                setSelectedProductId(product.id.toString());
                                                                setActiveSubTab('calculator');
                                                            }}
                                                            className="px-3 py-1 text-xs font-medium text-blue-700 bg-blue-50 border border-blue-200 rounded hover:bg-blue-100 transition flex items-center gap-1"
                                                        >
                                                            <Edit size={12} />
                                                            계산기로 이동
                                                        </button>
                                                        <button
                                                            onClick={() => handleRemoveManual(product)}
                                                            className="px-3 py-1 text-xs font-medium text-red-700 bg-red-50 border border-red-200 rounded hover:bg-red-100 transition flex items-center gap-1"
                                                        >
                                                            <X size={12} />
                                                            제거
                                                        </button>
                                                    </div>
                                                </td>
                                            </tr>
                                        ))
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </div>

                    {/* 안내 메시지 */}
                    <div className="bg-gray-50 border border-gray-200 rounded-lg p-4 text-sm text-gray-600">
                        <h4 className="font-bold mb-1">📌 수동 계산 상품 관리</h4>
                        <p>손익 계산기를 사용하여 가격을 적용한 상품들이 자동으로 이 목록에 등록됩니다. 목록에서 상품을 선택하여 다시 계산하거나 제거할 수 있습니다.</p>
                    </div>
                </div>
            )}
        </div>
    );
};

export default OperationManager;
