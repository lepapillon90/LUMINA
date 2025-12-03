import React, { useState, useEffect } from 'react';
import { Package, Plus, Edit3, Trash2 } from 'lucide-react';
import { Product, User } from '../../../types';
import ProductModal from './ProductModal';
import ConfirmDeleteModal from './ConfirmDeleteModal';
import { getProducts, createProduct, updateProduct, deleteProduct } from '../../../services/productService';
import { logInventoryChange } from '../../../services/inventoryService';
import { deleteImage } from '../../../services/storageService';
import { useToast } from '../../../contexts/ToastContext';

interface ProductManagerProps {
    products: Product[];
    setProducts: React.Dispatch<React.SetStateAction<Product[]>>;
    user: User | null;
}

const ProductManager: React.FC<ProductManagerProps> = ({ products, setProducts, user }) => {
    const [isProductModalOpen, setIsProductModalOpen] = useState(false);
    const [editingProduct, setEditingProduct] = useState<Product | null>(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
    const [deletingProductId, setDeletingProductId] = useState<number | null>(null);
    const { showToast } = useToast();


    // Fetch products from Firestore on component mount
    useEffect(() => {
        fetchProducts();
    }, []);

    const fetchProducts = async () => {
        setLoading(true);
        setError(null);
        try {
            const fetchedProducts = await getProducts();
            setProducts(fetchedProducts);
        } catch (err) {
            setError('상품 목록을 불러오는데 실패했습니다.');
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    const handleSaveProduct = async (product: Product) => {
        if (!user) {
            showToast('사용자 정보를 찾을 수 없습니다.', 'error');
            return;
        }
        try {
            if (editingProduct) {
                // Update existing product

                // If image URL changed, delete old image from Storage
                if (editingProduct.image !== product.image && editingProduct.image) {
                    try {
                        await deleteImage(editingProduct.image);
                    } catch (imgError) {
                        console.warn('Failed to delete old product image:', imgError);
                        // Continue even if deletion fails
                    }
                }

                await updateProduct(product.id, product, { uid: user.uid, username: user.username });
                setProducts(prev => prev.map(p => p.id === product.id ? product : p));
                showToast('상품이 수정되었습니다.', 'success');
            } else {
                // Create new product
                const { id, ...productData } = product;
                const newProduct = await createProduct(productData, { uid: user.uid, username: user.username });

                // Log initial stock if any
                if (newProduct.sizeColorStock && newProduct.sizeColorStock.length > 0) {
                    for (const stockItem of newProduct.sizeColorStock) {
                        if (stockItem.quantity > 0) {
                            await logInventoryChange(
                                newProduct.id,
                                newProduct.name,
                                '입고',
                                stockItem.size,
                                stockItem.color,
                                stockItem.quantity,
                                0, // Before
                                stockItem.quantity, // After
                                'Initial Stock Registration',
                                { uid: user.uid, username: user.username }
                            );
                        }
                    }
                }

                setProducts(prev => [...prev, newProduct]);
                showToast('상품이 등록되었습니다.', 'success');
            }
            setIsProductModalOpen(false);
            setEditingProduct(null);
        } catch (err) {
            console.error('Error saving product:', err);
            showToast('상품 저장에 실패했습니다. 다시 시도해주세요.', 'error');
        }
    };

    const handleDeleteProduct = (id: number) => {
        setDeletingProductId(id);
        setIsDeleteModalOpen(true);
    };

    // Extract image URLs from description HTML
    const extractImageUrls = (html: string): string[] => {
        const imgRegex = /<img[^>]+src="([^"]+)"/g;
        const urls: string[] = [];
        let match;
        while ((match = imgRegex.exec(html)) !== null) {
            urls.push(match[1]);
        }
        return urls;
    };

    const confirmDelete = async () => {
        if (deletingProductId === null) return;
        if (!user) {
            showToast('사용자 정보를 찾을 수 없습니다.', 'error');
            return;
        }

        try {
            // Find the product to get its image URLs
            const productToDelete = products.find(p => p.id === deletingProductId);

            // Delete from Firestore first
            await deleteProduct(deletingProductId, { uid: user.uid, username: user.username });

            // Delete main image from Storage
            if (productToDelete?.image) {
                try {
                    await deleteImage(productToDelete.image);
                } catch (imgError) {
                    console.warn('Failed to delete main product image:', imgError);
                }
            }

            // Delete additional images from Storage
            if (productToDelete?.images && productToDelete.images.length > 0) {
                for (const imageUrl of productToDelete.images) {
                    try {
                        await deleteImage(imageUrl);
                    } catch (imgError) {
                        console.warn('Failed to delete additional image:', imgError);
                    }
                }
            }

            // Delete description images from Storage
            if (productToDelete?.description) {
                const descriptionImageUrls = extractImageUrls(productToDelete.description);
                for (const imageUrl of descriptionImageUrls) {
                    try {
                        await deleteImage(imageUrl);
                    } catch (imgError) {
                        console.warn('Failed to delete description image:', imgError);
                    }
                }
            }

            setProducts(prev => prev.filter(p => p.id !== deletingProductId));
            showToast('상품이 삭제되었습니다.', 'success');
        } catch (err) {
            console.error('Error deleting product:', err);
            showToast('상품 삭제에 실패했습니다. 다시 시도해주세요.', 'error');
        }

        setDeletingProductId(null);
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center py-20">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-gray-900"></div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-red-700">
                <p className="font-medium">오류 발생</p>
                <p className="text-sm">{error}</p>
                <button
                    onClick={fetchProducts}
                    className="mt-2 text-sm underline hover:no-underline"
                >
                    다시 시도
                </button>
            </div>
        );
    }

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

            <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden overflow-x-auto">
                <table className="w-full text-left text-sm">
                    <thead className="bg-white text-gray-600 border-b border-gray-200">
                        <tr>
                            <th className="px-6 py-3 font-medium">상품명</th>
                            <th className="px-6 py-3 font-medium">판매가</th>
                            <th className="px-6 py-3 font-medium">카테고리</th>
                            <th className="px-6 py-3 font-medium text-right">관리</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-50">
                        {products.length === 0 ? (
                            <tr>
                                <td colSpan={4} className="px-6 py-12 text-center text-gray-400">
                                    등록된 상품이 없습니다. 첫 상품을 등록해보세요!
                                </td>
                            </tr>
                        ) : (
                            products.map(product => (
                                <tr key={product.id} className="hover:bg-gray-50 transition group">
                                    <td className="px-6 py-4 font-medium text-gray-800">
                                        <div className="flex items-center gap-3">
                                            <img
                                                src={product.image}
                                                alt={product.name}
                                                className="w-10 h-10 rounded object-cover border border-gray-100"
                                                onError={(e) => {
                                                    e.currentTarget.src = 'https://via.placeholder.com/40?text=No+Image';
                                                }}
                                            />
                                            {product.name}
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 text-gray-600">₩{product.price.toLocaleString()}</td>
                                    <td className="px-6 py-4 text-gray-500">{product.category}</td>
                                    <td className="px-6 py-4 text-right">
                                        <button
                                            onClick={() => { setEditingProduct(product); setIsProductModalOpen(true); }}
                                            className="text-gray-400 hover:text-blue-600 mr-2"
                                            title="수정"
                                        >
                                            <Edit3 size={18} />
                                        </button>
                                        <button
                                            onClick={() => handleDeleteProduct(product.id)}
                                            className="text-gray-400 hover:text-red-600"
                                            title="삭제"
                                        >
                                            <Trash2 size={18} />
                                        </button>
                                    </td>
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>
            </div>

            <ProductModal
                isOpen={isProductModalOpen}
                onClose={() => {
                    setIsProductModalOpen(false);
                    setEditingProduct(null);
                }}
                product={editingProduct}
                onSave={handleSaveProduct}
            />

            <ConfirmDeleteModal
                isOpen={isDeleteModalOpen}
                title="상품 삭제"
                message="정말 이 상품을 삭제하시겠습니까? 이 작업은 되돌릴 수 없습니다."
                onConfirm={confirmDelete}
                onCancel={() => setIsDeleteModalOpen(false)}
            />
        </div>
    );
};

export default ProductManager;
