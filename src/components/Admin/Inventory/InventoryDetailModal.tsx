import React, { useState, useEffect } from 'react';
import { X, PackagePlus, History, ArrowUpCircle, ArrowDownCircle, Package } from 'lucide-react';
import { Product, InventoryLog } from '../../../types';
import { getProductById } from '../../../services/productService';
import { useGlobalModal } from '../../../contexts/GlobalModalContext';
import { processStockIn, processStockOut, getInventoryLogsByProduct } from '../../../services/inventoryService';

interface InventoryDetailModalProps {
    product: Product;
    onClose: () => void;
    onUpdate: () => void;
    user: { uid: string; username: string } | null;
}

type TabType = 'stock' | 'transaction' | 'logs';

const InventoryDetailModal: React.FC<InventoryDetailModalProps> = ({ product, onClose, onUpdate, user }) => {
    const { showAlert } = useGlobalModal();
    const [activeTab, setActiveTab] = useState<TabType>('stock');
    const [sizeColorStocks, setSizeColorStocks] = useState(product.sizeColorStock || []);
    const [currentProduct, setCurrentProduct] = useState<Product>(product);

    // 입고/출고 상태
    const [transactionType, setTransactionType] = useState<'입고' | '출고'>('입고');
    const [transactionSize, setTransactionSize] = useState('');
    const [transactionColor, setTransactionColor] = useState('');
    const [transactionQuantity, setTransactionQuantity] = useState(0);
    const [transactionReason, setTransactionReason] = useState('');
    const [processingTransaction, setProcessingTransaction] = useState(false);

    // 로그 기록
    const [logs, setLogs] = useState<InventoryLog[]>([]);
    const [loadingLogs, setLoadingLogs] = useState(false);

    useEffect(() => {
        fetchProductData();
        if (activeTab === 'logs') {
            fetchLogs();
        }
    }, [activeTab]);

    const fetchProductData = async () => {
        try {
            const updated = await getProductById(product.id);
            if (updated) {
                setCurrentProduct(updated);
                setSizeColorStocks(updated.sizeColorStock || []);
            }
        } catch (error) {
            console.error('Error fetching product:', error);
        }
    };

    const fetchLogs = async () => {
        setLoadingLogs(true);
        try {
            const fetchedLogs = await getInventoryLogsByProduct(product.id);
            setLogs(fetchedLogs);
        } catch (error) {
            console.error('Error fetching logs:', error);
            await showAlert('로그를 불러오는데 실패했습니다.', '오류');
        } finally {
            setLoadingLogs(false);
        }
    };

    const getTotalStock = (): number => {
        if (sizeColorStocks.length > 0) {
            return sizeColorStocks.reduce((sum, item) => sum + item.quantity, 0);
        }
        return currentProduct.stock || 0;
    };

    const getSizeOptionsByCategory = (category: string): string[] => {
        const cat = category.toLowerCase();
        switch (cat) {
            case 'ring':
                // Generate sizes 1 to 30, plus Free
                return ['Free', ...Array.from({ length: 30 }, (_, i) => `${i + 1}호`)];
            case 'necklace':
                return ['Free', '35cm', '38cm', '40cm', '42cm', '45cm', '48cm', '50cm', '55cm', '60cm', '70cm'];
            case 'bracelet':
                return ['Free', '13cm', '14cm', '15cm', '16cm', '16.5cm', '17cm', '17.5cm', '18cm', '19cm', '20cm', '21cm'];
            case 'earring':
            default:
                return ['Free', 'XS', 'S', 'M', 'L', 'XL', 'XXL'];
        }
    };

    const handleProcessTransaction = async () => {
        if (!user) {
            await showAlert('사용자 정보를 찾을 수 없습니다.', '오류');
            return;
        }

        if (!transactionSize || !transactionColor) {
            await showAlert('사이즈와 색상을 모두 선택해주세요.', '오류');
            return;
        }

        if (transactionQuantity <= 0) {
            await showAlert('수량을 입력해주세요.', '오류');
            return;
        }

        if (!transactionReason.trim()) {
            await showAlert('사유를 입력해주세요.', '오류');
            return;
        }

        setProcessingTransaction(true);
        try {
            if (transactionType === '입고') {
                await processStockIn(
                    product.id,
                    transactionSize,
                    transactionColor,
                    transactionQuantity,
                    transactionReason,
                    user,
                    sizeColorStocks
                );
                await showAlert('입고가 완료되었습니다.', '알림');
            } else {
                await processStockOut(
                    product.id,
                    transactionSize,
                    transactionColor,
                    transactionQuantity,
                    transactionReason,
                    user,
                    sizeColorStocks
                );
                await showAlert('출고가 완료되었습니다.', '알림');
            }

            // 재고 및 로그 새로고침
            await fetchProductData();
            if (activeTab === 'logs') {
                await fetchLogs();
            }

            // 입력 필드 초기화
            setTransactionQuantity(0);
            setTransactionReason('');

            onUpdate();
        } catch (error: any) {
            console.error('Error processing transaction:', error);
            await showAlert(error.message || '처리 중 오류가 발생했습니다.', '오류');
        } finally {
            setProcessingTransaction(false);
        }
    };

    const sizeOptions = getSizeOptionsByCategory(product.category);
    const colorOptions = ['Gold', 'Silver', 'Rose Gold', 'White', 'Black', 'Red', 'Blue', 'Green', 'Pink'];

    // 입고/출고 사유 옵션
    const stockInReasons = ['신규 입고', '반품 입고', '재입고', '재고 조정', '기타'];
    const stockOutReasons = ['판매', '폐기', '반품', '재고 조정', '기타'];

    const handleStockAction = (item: { size: string; color: string; quantity: number }, type: '입고' | '출고') => {
        setTransactionType(type);
        setTransactionSize(item.size);
        setTransactionColor(item.color);
        setTransactionQuantity(0);
        setTransactionReason('');
        setActiveTab('transaction');
    };

    return (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4 backdrop-blur-sm">
            <div className="bg-white rounded-lg shadow-xl max-w-5xl w-full max-h-[90vh] overflow-hidden flex flex-col">
                {/* Header */}
                <div className="flex justify-between items-center p-6 border-b border-gray-100">
                    <div className="flex items-center gap-4">
                        <img
                            src={currentProduct.image}
                            alt={currentProduct.name}
                            className="w-16 h-16 rounded object-cover border border-gray-200"
                            onError={(e) => {
                                e.currentTarget.src = 'https://via.placeholder.com/64?text=No+Image';
                            }}
                        />
                        <div>
                            <h2 className="text-xl font-bold text-gray-800">{currentProduct.name}</h2>
                            <p className="text-sm text-gray-500 capitalize">{currentProduct.category}</p>
                        </div>
                    </div>
                    <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
                        <X size={24} />
                    </button>
                </div>

                {/* Tabs */}
                <div className="flex border-b border-gray-200 bg-gray-50 overflow-x-auto whitespace-nowrap">
                    <button
                        onClick={() => setActiveTab('stock')}
                        className={`flex items-center gap-2 px-6 py-3 text-sm font-medium transition ${activeTab === 'stock'
                            ? 'text-black border-b-2 border-black bg-white'
                            : 'text-gray-500 hover:text-gray-700'
                            }`}
                    >
                        <Package size={16} />
                        재고 관리
                    </button>
                    <button
                        onClick={() => setActiveTab('transaction')}
                        className={`flex items-center gap-2 px-6 py-3 text-sm font-medium transition ${activeTab === 'transaction'
                            ? 'text-black border-b-2 border-black bg-white'
                            : 'text-gray-500 hover:text-gray-700'
                            }`}
                    >
                        <PackagePlus size={16} />
                        입고/출고
                    </button>
                    <button
                        onClick={() => {
                            setActiveTab('logs');
                            fetchLogs();
                        }}
                        className={`flex items-center gap-2 px-6 py-3 text-sm font-medium transition ${activeTab === 'logs'
                            ? 'text-black border-b-2 border-black bg-white'
                            : 'text-gray-500 hover:text-gray-700'
                            }`}
                    >
                        <History size={16} />
                        로그 기록
                    </button>
                </div>

                {/* Body */}
                <div className="flex-1 overflow-y-auto p-6">
                    {activeTab === 'stock' && (
                        <div className="space-y-6">
                            {/* 총 재고 정보 */}
                            <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
                                <div className="flex justify-between items-center">
                                    <span className="text-sm font-medium text-gray-700">총 재고 수량</span>
                                    <span className="text-2xl font-bold text-gray-900">{getTotalStock()}개</span>
                                </div>
                            </div>

                            {/* 사이즈-색상별 재고 관리 */}
                            <div>
                                <div className="flex justify-between items-center mb-4">
                                    <h3 className="text-lg font-bold text-gray-800">사이즈/색상별 재고</h3>
                                </div>

                                <div className="space-y-3 border border-gray-200 rounded-lg p-4 bg-gray-50">
                                    {sizeColorStocks.length === 0 ? (
                                        <p className="text-center text-gray-400 py-8">등록된 재고가 없습니다. 입고/출고 탭에서 재고를 추가하세요.</p>
                                    ) : (
                                        sizeColorStocks.map((item, index) => {
                                            return (
                                                <div key={index} className="flex flex-col md:flex-row items-start md:items-center gap-2 bg-white p-3 rounded-md border border-gray-200">
                                                    <div className="flex-1 grid grid-cols-3 gap-2 w-full md:w-auto">
                                                        <span className="text-sm font-medium text-gray-700">{item.size}</span>
                                                        <span className="text-sm text-gray-600">{item.quantity}개</span>
                                                        <span className="text-sm text-gray-600">{item.color}</span>
                                                    </div>
                                                    <div className="flex gap-2">
                                                        <button
                                                            onClick={() => handleStockAction(item, '입고')}
                                                            className="px-2 py-1 text-xs font-medium text-green-700 bg-green-50 border border-green-200 rounded hover:bg-green-100 transition"
                                                        >
                                                            입고
                                                        </button>
                                                        <button
                                                            onClick={() => handleStockAction(item, '출고')}
                                                            className="px-2 py-1 text-xs font-medium text-red-700 bg-red-50 border border-red-200 rounded hover:bg-red-100 transition"
                                                        >
                                                            출고
                                                        </button>
                                                    </div>
                                                </div>
                                            );
                                        })
                                    )}
                                </div>
                            </div>

                            {/* 일반 재고 (sizeColorStock이 없는 경우) */}
                            {sizeColorStocks.length === 0 && (
                                <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
                                    <p className="text-sm text-gray-600">
                                        현재 일반 재고로 관리되고 있습니다. (재고: {currentProduct.stock || 0}개)
                                    </p>
                                    <p className="text-xs text-gray-500 mt-1">
                                        사이즈-색상별 재고로 전환하려면 입고/출고 탭을 사용하세요.
                                    </p>
                                </div>
                            )}
                        </div>
                    )}

                    {activeTab === 'transaction' && (
                        <div className="space-y-6 max-w-2xl mx-auto">
                            <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
                                <div className="flex justify-between items-center mb-4">
                                    <span className="text-sm font-medium text-gray-700">총 재고 수량</span>
                                    <span className="text-2xl font-bold text-gray-900">{getTotalStock()}개</span>
                                </div>
                            </div>

                            <div className="bg-white border border-gray-200 rounded-lg p-6 space-y-4">
                                <h3 className="text-lg font-bold text-gray-800">입고/출고 처리</h3>

                                {/* 타입 선택 */}
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">유형</label>
                                    <div className="flex gap-4">
                                        <button
                                            onClick={() => setTransactionType('입고')}
                                            className={`flex-1 flex items-center justify-center gap-2 px-4 py-3 rounded-md border-2 transition ${transactionType === '입고'
                                                ? 'border-green-500 bg-green-50 text-green-700'
                                                : 'border-gray-200 text-gray-600 hover:border-gray-300'
                                                }`}
                                        >
                                            <ArrowDownCircle size={20} />
                                            <span className="font-medium">입고</span>
                                        </button>
                                        <button
                                            onClick={() => setTransactionType('출고')}
                                            className={`flex-1 flex items-center justify-center gap-2 px-4 py-3 rounded-md border-2 transition ${transactionType === '출고'
                                                ? 'border-red-500 bg-red-50 text-red-700'
                                                : 'border-gray-200 text-gray-600 hover:border-gray-300'
                                                }`}
                                        >
                                            <ArrowUpCircle size={20} />
                                            <span className="font-medium">출고</span>
                                        </button>
                                    </div>
                                </div>

                                {/* 사이즈 선택 */}
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">사이즈</label>
                                    <select
                                        value={transactionSize}
                                        onChange={(e) => setTransactionSize(e.target.value)}
                                        className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-black"
                                    >
                                        <option value="">사이즈 선택</option>
                                        {sizeOptions.map(size => (
                                            <option key={size} value={size}>{size}</option>
                                        ))}
                                    </select>
                                </div>

                                {/* 색상 선택 */}
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">색상</label>
                                    <select
                                        value={transactionColor}
                                        onChange={(e) => setTransactionColor(e.target.value)}
                                        className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-black"
                                    >
                                        <option value="">색상 선택</option>
                                        {colorOptions.map(color => (
                                            <option key={color} value={color}>{color}</option>
                                        ))}
                                    </select>
                                </div>

                                {/* 현재 재고 표시 */}
                                {transactionSize && transactionColor && (
                                    <div className="bg-blue-50 border border-blue-200 rounded-md p-3">
                                        <p className="text-sm text-blue-800">
                                            현재 재고: {sizeColorStocks.find(
                                                item => item.size === transactionSize && item.color === transactionColor
                                            )?.quantity || 0}개
                                        </p>
                                    </div>
                                )}

                                {/* 수량 */}
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">수량</label>
                                    <input
                                        type="number"
                                        min="1"
                                        value={transactionQuantity || ''}
                                        onChange={(e) => setTransactionQuantity(parseInt(e.target.value) || 0)}
                                        className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-black"
                                        placeholder="수량 입력"
                                    />
                                </div>

                                {/* 사유 */}
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">사유</label>
                                    <select
                                        value={transactionReason}
                                        onChange={(e) => setTransactionReason(e.target.value)}
                                        className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-black mb-2"
                                    >
                                        <option value="">사유 선택</option>
                                        {(transactionType === '입고' ? stockInReasons : stockOutReasons).map(reason => (
                                            <option key={reason} value={reason}>{reason}</option>
                                        ))}
                                    </select>
                                    {transactionReason === '기타' && (
                                        <input
                                            type="text"
                                            value={transactionReason}
                                            onChange={(e) => setTransactionReason(e.target.value)}
                                            className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-black mt-2"
                                            placeholder="사유를 입력하세요"
                                        />
                                    )}
                                </div>

                                {/* 처리 버튼 */}
                                <button
                                    onClick={handleProcessTransaction}
                                    disabled={processingTransaction || !transactionSize || !transactionColor || transactionQuantity <= 0 || !transactionReason}
                                    className={`w-full py-3 rounded-md font-medium transition ${transactionType === '입고'
                                        ? 'bg-green-600 text-white hover:bg-green-700'
                                        : 'bg-red-600 text-white hover:bg-red-700'
                                        } disabled:opacity-50 disabled:cursor-not-allowed`}
                                >
                                    {processingTransaction ? '처리 중...' : `${transactionType} 처리`}
                                </button>
                            </div>
                        </div>
                    )}

                    {activeTab === 'logs' && (
                        <div className="space-y-4">
                            <div className="flex justify-between items-center">
                                <h3 className="text-lg font-bold text-gray-800">입고/출고 로그 기록</h3>
                                <button
                                    onClick={fetchLogs}
                                    className="text-sm text-gray-600 hover:text-gray-800"
                                >
                                    새로고침
                                </button>
                            </div>

                            {loadingLogs ? (
                                <div className="flex justify-center items-center py-12">
                                    <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-gray-900"></div>
                                </div>
                            ) : logs.length === 0 ? (
                                <div className="text-center py-12 text-gray-400">
                                    로그 기록이 없습니다.
                                </div>
                            ) : (
                                <div className="space-y-2">
                                    {logs.map((log) => (
                                        <div
                                            key={log.id}
                                            className={`border rounded-lg p-4 ${log.type === '입고'
                                                ? 'border-green-200 bg-green-50'
                                                : 'border-red-200 bg-red-50'
                                                }`}
                                        >
                                            <div className="flex justify-between items-start">
                                                <div className="flex-1">
                                                    <div className="flex items-center gap-2 mb-2">
                                                        <span className={`inline-flex items-center gap-1 px-2 py-1 rounded text-xs font-medium ${log.type === '입고'
                                                            ? 'bg-green-200 text-green-800'
                                                            : 'bg-red-200 text-red-800'
                                                            }`}>
                                                            {log.type === '입고' ? <ArrowDownCircle size={14} /> : <ArrowUpCircle size={14} />}
                                                            {log.type}
                                                        </span>
                                                        <span className="text-sm text-gray-600">
                                                            {log.size && log.color ? `${log.size} / ${log.color}` : '일반'}
                                                        </span>
                                                        <span className="text-sm font-bold text-gray-800">
                                                            {log.quantity}개
                                                        </span>
                                                    </div>
                                                    <p className="text-sm text-gray-600 mb-1">
                                                        사유: {log.reason || '-'}
                                                    </p>
                                                    <p className="text-xs text-gray-500">
                                                        {log.beforeQuantity}개 → {log.afterQuantity}개
                                                    </p>
                                                </div>
                                                <div className="text-right">
                                                    <p className="text-xs text-gray-500 mb-1">
                                                        {log.adminUsername}
                                                    </p>
                                                    <p className="text-xs text-gray-400">
                                                        {log.createdAt instanceof Date
                                                            ? log.createdAt.toLocaleString('ko-KR')
                                                            : new Date(log.createdAt).toLocaleString('ko-KR')}
                                                    </p>
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    )}
                </div>

                {/* Footer */}
                <div className="p-6 border-t border-gray-100 bg-gray-50 flex justify-end">
                    <button
                        onClick={onClose}
                        className="px-6 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-white transition"
                    >
                        닫기
                    </button>
                </div>
            </div>
        </div>
    );
};

export default InventoryDetailModal;
