import React, { useState, useEffect } from 'react';
import { Package, Search, AlertTriangle, CheckCircle, RefreshCw } from 'lucide-react';
import { Product } from '../../../types';
import { getProducts } from '../../../services/productService';
import { useGlobalModal } from '../../../contexts/GlobalModalContext';
import InventoryDetailModal from './InventoryDetailModal';
import { syncAllProductsStock } from '../../../services/inventoryService';

interface InventoryManagerProps {
    user: { uid: string; username: string } | null;
}

const InventoryManager: React.FC<InventoryManagerProps> = ({ user }) => {
    const { showAlert, showConfirm } = useGlobalModal();
    const [products, setProducts] = useState<Product[]>([]);
    const [loading, setLoading] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');
    const [filterCategory, setFilterCategory] = useState<string>('all');
    const [filterLowStock, setFilterLowStock] = useState(false);
    const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
    const [syncing, setSyncing] = useState(false);

    useEffect(() => {
        fetchProducts();
    }, []);

    const fetchProducts = async () => {
        setLoading(true);
        try {
            const fetchedProducts = await getProducts();
            setProducts(fetchedProducts);
        } catch (error) {
            console.error('Error fetching products:', error);
            await showAlert('상품 목록을 불러오는데 실패했습니다.', '오류');
        } finally {
            setLoading(false);
        }
    };

    const handleSyncStock = async () => {
        if (!user) {
            await showAlert('관리자 권한이 필요합니다.', '오류');
            return;
        }

        const confirmed = await showConfirm('모든 상품의 총 재고를 동기화하시겠습니까?\n이 작업은 sizeColorStock의 합계를 stock 필드에 반영합니다.');
        if (!confirmed) return;

        setSyncing(true);
        try {
            const result = await syncAllProductsStock(user);
            await showAlert(`동기화 완료!\n성공: ${result.success}개, 실패: ${result.failed}개`, '재고 동기화');
            await fetchProducts(); // 목록 새로고침
        } catch (error) {
            console.error('Error syncing stock:', error);
            await showAlert('재고 동기화 중 오류가 발생했습니다.', '오류');
        } finally {
            setSyncing(false);
        }
    };


    const getTotalStock = (product: Product): number => {
        if (product.sizeColorStock && product.sizeColorStock.length > 0) {
            return product.sizeColorStock.reduce((sum, item) => sum + item.quantity, 0);
        }
        return product.stock || 0;
    };

    const hasLowStock = (product: Product, threshold: number = 5): boolean => {
        if (product.sizeColorStock && product.sizeColorStock.length > 0) {
            return product.sizeColorStock.some(item => item.quantity <= threshold);
        }
        return (product.stock || 0) <= threshold;
    };

    const filteredProducts = products.filter(product => {
        const matchesSearch = product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            product.category.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesCategory = filterCategory === 'all' || product.category === filterCategory;
        const matchesLowStock = !filterLowStock || hasLowStock(product);
        return matchesSearch && matchesCategory && matchesLowStock;
    });

    if (loading) {
        return (
            <div className="flex items-center justify-center py-20">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-gray-900"></div>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <h2 className="text-xl font-bold text-gray-800 flex items-center gap-2">
                    <Package size={20} /> 재고 관리
                </h2>
                <button
                    onClick={handleSyncStock}
                    disabled={syncing}
                    className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition disabled:opacity-50 disabled:cursor-not-allowed text-sm font-medium"
                >
                    <RefreshCw size={16} className={syncing ? 'animate-spin' : ''} />
                    {syncing ? '동기화 중...' : '재고 동기화'}
                </button>
            </div>

            {/* Filters */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
                <div className="flex flex-wrap gap-4 items-center">
                    <div className="flex items-center gap-2 flex-1 min-w-[200px]">
                        <Search size={16} className="text-gray-400" />
                        <input
                            type="text"
                            placeholder="상품명, 카테고리로 검색..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="flex-1 border-none focus:outline-none text-sm"
                        />
                    </div>
                    <select
                        value={filterCategory}
                        onChange={(e) => setFilterCategory(e.target.value)}
                        className="border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-black"
                    >
                        <option value="all">전체 카테고리</option>
                        <option value="earring">귀걸이</option>
                        <option value="necklace">목걸이</option>
                        <option value="ring">반지</option>
                        <option value="bracelet">팔찌</option>
                    </select>
                    <label className="flex items-center space-x-2 text-sm text-gray-700 cursor-pointer">
                        <input
                            type="checkbox"
                            checked={filterLowStock}
                            onChange={(e) => setFilterLowStock(e.target.checked)}
                            className="rounded text-red-500 focus:ring-red-500"
                        />
                        <span>재고 부족만 보기 (5개 이하)</span>
                    </label>
                </div>
            </div>

            {/* Inventory Table */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-left text-sm">
                        <thead className="bg-white text-gray-600 border-b border-gray-200">
                            <tr>
                                <th className="px-6 py-3 font-medium">상품명</th>
                                <th className="px-6 py-3 font-medium">카테고리</th>
                                <th className="px-6 py-3 font-medium">재고 종류</th>
                                <th className="px-6 py-3 font-medium">총 재고</th>
                                <th className="px-6 py-3 font-medium">상태</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-50">
                            {filteredProducts.length === 0 ? (
                                <tr>
                                    <td colSpan={5} className="px-6 py-12 text-center text-gray-400">
                                        {searchTerm || filterCategory !== 'all' || filterLowStock
                                            ? '검색 결과가 없습니다.'
                                            : '등록된 상품이 없습니다.'}
                                    </td>
                                </tr>
                            ) : (
                                filteredProducts.map((product) => {
                                    const totalStock = getTotalStock(product);
                                    const isLowStock = hasLowStock(product);
                                    const hasSizeColorStock = product.sizeColorStock && product.sizeColorStock.length > 0;

                                    return (
                                        <tr
                                            key={product.id}
                                            onClick={() => setSelectedProduct(product)}
                                            className={`hover:bg-gray-50 transition cursor-pointer ${isLowStock ? 'bg-red-50' : ''}`}
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
                                            <td className="px-6 py-4 text-gray-600 text-xs">
                                                {hasSizeColorStock ? '사이즈-색상별' : '일반 재고'}
                                            </td>
                                            <td className="px-6 py-4">
                                                <span className={`font-bold ${totalStock <= 5 ? 'text-red-600' : 'text-gray-900'}`}>
                                                    {totalStock}개
                                                </span>
                                            </td>
                                            <td className="px-6 py-4">
                                                {isLowStock ? (
                                                    <span className="inline-flex items-center gap-1 px-2 py-1 rounded-sm text-xs font-medium bg-red-50 text-red-700 border border-red-200">
                                                        <AlertTriangle size={12} />
                                                        재고 부족
                                                    </span>
                                                ) : (
                                                    <span className="inline-flex items-center gap-1 px-2 py-1 rounded-sm text-xs font-medium bg-green-50 text-green-700 border border-green-200">
                                                        <CheckCircle size={12} />
                                                        정상
                                                    </span>
                                                )}
                                            </td>
                                        </tr>
                                    );
                                })
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Summary Stats */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
                    <p className="text-sm text-gray-500 mb-1">전체 상품 수</p>
                    <p className="text-2xl font-bold text-gray-900">{products.length}</p>
                </div>
                <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
                    <p className="text-sm text-gray-500 mb-1">재고 부족 상품</p>
                    <p className="text-2xl font-bold text-red-600">
                        {products.filter(p => hasLowStock(p)).length}
                    </p>
                </div>
                <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
                    <p className="text-sm text-gray-500 mb-1">총 재고 수량</p>
                    <p className="text-2xl font-bold text-gray-900">
                        {products.reduce((sum, p) => sum + getTotalStock(p), 0).toLocaleString()}
                    </p>
                </div>
                <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
                    <p className="text-sm text-gray-500 mb-1">사이즈-색상별 재고 상품</p>
                    <p className="text-2xl font-bold text-gray-900">
                        {products.filter(p => p.sizeColorStock && p.sizeColorStock.length > 0).length}
                    </p>
                </div>
            </div>

            {/* 재고 디테일 모달 */}
            {selectedProduct && (
                <InventoryDetailModal
                    product={selectedProduct}
                    onClose={() => setSelectedProduct(null)}
                    onUpdate={fetchProducts}
                    user={user}
                />
            )}
        </div>
    );
};

export default InventoryManager;

