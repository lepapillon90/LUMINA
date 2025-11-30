import React, { useState } from 'react';
import { Package, Plus, Edit3, Trash2 } from 'lucide-react';
import { Product } from '../../../types';
import ProductModal from './ProductModal';

interface ProductManagerProps {
    products: Product[];
    setProducts: React.Dispatch<React.SetStateAction<Product[]>>;
}

const ProductManager: React.FC<ProductManagerProps> = ({ products, setProducts }) => {
    const [isProductModalOpen, setIsProductModalOpen] = useState(false);
    const [editingProduct, setEditingProduct] = useState<Product | null>(null);

    const handleSaveProduct = (product: Product) => {
        if (editingProduct) {
            setProducts(prev => prev.map(p => p.id === product.id ? product : p));
            alert('상품이 수정되었습니다.');
        } else {
            setProducts(prev => [...prev, product]);
            alert('상품이 등록되었습니다.');
        }
        setIsProductModalOpen(false);
    };

    const handleDeleteProduct = (id: number) => {
        if (window.confirm('정말 이 상품을 삭제하시겠습니까?')) {
            setProducts(prev => prev.filter(p => p.id !== id));
        }
    };

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <h2 className="text-xl font-bold text-gray-800 flex items-center gap-2">
                    <Package size={20} /> 상품 관리
                </h2>
                <button
                    onClick={() => { setEditingProduct(null); setIsProductModalOpen(true); }}
                    className="bg-black text-white px-4 py-2 rounded-sm text-sm hover:bg-gray-800 transition flex items-center gap-2"
                >
                    <Plus size={16} /> 상품 등록
                </button>
            </div>

            <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
                <table className="w-full text-left text-sm">
                    <thead className="bg-white text-gray-600 border-b border-gray-200">
                        <tr>
                            <th className="px-6 py-3 font-medium">상품명</th>
                            <th className="px-6 py-3 font-medium">판매가</th>
                            <th className="px-6 py-3 font-medium">카테고리</th>
                            <th className="px-6 py-3 font-medium">재고</th>
                            <th className="px-6 py-3 font-medium text-right">관리</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-50">
                        {products.map(product => (
                            <tr key={product.id} className="hover:bg-gray-50 transition group">
                                <td className="px-6 py-4 font-medium text-gray-800">
                                    <div className="flex items-center gap-3">
                                        <img src={product.image} alt={product.name} className="w-10 h-10 rounded object-cover border border-gray-100" />
                                        {product.name}
                                    </div>
                                </td>
                                <td className="px-6 py-4 text-gray-600">₩{product.price.toLocaleString()}</td>
                                <td className="px-6 py-4 text-gray-500">{product.category}</td>
                                <td className="px-6 py-4 text-gray-600">{product.stock}</td>
                                <td className="px-6 py-4 text-right">
                                    <button
                                        onClick={() => { setEditingProduct(product); setIsProductModalOpen(true); }}
                                        className="text-gray-400 hover:text-blue-600 mr-2"
                                    >
                                        <Edit3 size={18} />
                                    </button>
                                    <button
                                        onClick={() => handleDeleteProduct(product.id)}
                                        className="text-gray-400 hover:text-red-600"
                                    >
                                        <Trash2 size={18} />
                                    </button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            <ProductModal
                isOpen={isProductModalOpen}
                onClose={() => setIsProductModalOpen(false)}
                product={editingProduct}
                onSave={handleSaveProduct}
            />
        </div>
    );
};

export default ProductManager;
