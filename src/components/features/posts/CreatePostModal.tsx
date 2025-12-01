import React, { useState, useRef, useEffect } from 'react';
import { X, Image as ImageIcon, Tag, Loader, Search, Trash2, ShoppingBag, Globe } from 'lucide-react';
import { PRODUCTS } from '../../../constants';
import { OOTDPost, Product } from '../../../types';
import { uploadImage } from '../../../services/storageService';
import { useAuth } from '../../../contexts';
import { getPurchasedProducts } from '../../../services/orderService';
import { useGlobalModal } from '../../../contexts/GlobalModalContext';

interface CreatePostModalProps {
    onClose: () => void;
    onSubmit: (post: Omit<OOTDPost, 'id' | 'likes' | 'user'>) => void;
}

const CreatePostModal: React.FC<CreatePostModalProps> = ({ onClose, onSubmit }) => {
    const { user } = useAuth();
    const { showAlert } = useGlobalModal();
    const [caption, setCaption] = useState('');
    const [selectedProducts, setSelectedProducts] = useState<number[]>([]);
    const [imageUrl, setImageUrl] = useState('');
    const [isUploading, setIsUploading] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');
    const [isDragging, setIsDragging] = useState(false);

    // New State for Tabs and Purchased Products
    const [activeTab, setActiveTab] = useState<'all' | 'purchased'>('all');
    const [purchasedProducts, setPurchasedProducts] = useState<Product[]>([]);
    const [isLoadingPurchases, setIsLoadingPurchases] = useState(false);

    const fileInputRef = useRef<HTMLInputElement>(null);

    // Fetch purchased products on mount if user is logged in
    useEffect(() => {
        const fetchPurchases = async () => {
            if (user) {
                setIsLoadingPurchases(true);
                try {
                    const products = await getPurchasedProducts(user.uid);
                    setPurchasedProducts(products);
                } catch (error) {
                    console.error("Failed to fetch purchased products:", error);
                } finally {
                    setIsLoadingPurchases(false);
                }
            }
        };
        fetchPurchases();
    }, [user]);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!caption || !imageUrl) return;

        onSubmit({
            image: imageUrl,
            caption,
            productsUsed: selectedProducts,
            comments: [],
            isLiked: false
        });
        onClose();
    };

    const toggleProduct = (id: number) => {
        setSelectedProducts(prev =>
            prev.includes(id) ? prev.filter(pId => pId !== id) : [...prev, id]
        );
    };

    const handleImageClick = () => {
        fileInputRef.current?.click();
    };

    const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;
        await processFile(file);
    };

    const processFile = async (file: File) => {
        if (!file.type.startsWith('image/')) {
            await showAlert('이미지 파일만 업로드 가능합니다.', '오류');
            return;
        }

        setIsUploading(true);
        try {
            const url = await uploadImage(file, 'ootd');
            setImageUrl(url);
        } catch (error) {
            console.error("Upload failed:", error);
            await showAlert("이미지 업로드에 실패했습니다.", "오류");
        } finally {
            setIsUploading(false);
        }
    };

    const handleDragOver = (e: React.DragEvent) => {
        e.preventDefault();
        setIsDragging(true);
    };

    const handleDragLeave = (e: React.DragEvent) => {
        e.preventDefault();
        setIsDragging(false);
    };

    const handleDrop = async (e: React.DragEvent) => {
        e.preventDefault();
        setIsDragging(false);
        const file = e.dataTransfer.files?.[0];
        if (file) {
            await processFile(file);
        }
    };

    // Filter logic based on active tab
    const sourceProducts = activeTab === 'all' ? PRODUCTS : purchasedProducts;
    const filteredProducts = sourceProducts.filter(product =>
        product.name.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4 backdrop-blur-sm animate-fade-in">
            <div className="bg-white rounded-2xl w-full max-w-lg overflow-hidden shadow-2xl flex flex-col max-h-[90vh]">
                <div className="p-5 border-b flex justify-between items-center bg-white sticky top-0 z-10">
                    <h3 className="font-serif text-xl font-bold text-gray-900">새 게시물 작성</h3>
                    <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-full transition text-gray-500 hover:text-gray-900">
                        <X size={24} />
                    </button>
                </div>

                <div className="overflow-y-auto p-6 custom-scrollbar">
                    <form onSubmit={handleSubmit} className="space-y-6">
                        {/* Image Upload Area */}
                        <div>
                            <input
                                type="file"
                                ref={fileInputRef}
                                onChange={handleFileChange}
                                accept="image/*"
                                className="hidden"
                            />
                            <div
                                className={`aspect-[4/5] rounded-xl border-2 border-dashed flex flex-col items-center justify-center cursor-pointer transition-all duration-300 relative overflow-hidden group
                                    ${isDragging
                                        ? 'border-primary bg-primary/5 scale-[1.02]'
                                        : imageUrl
                                            ? 'border-transparent'
                                            : 'border-gray-300 hover:border-primary hover:bg-gray-50'
                                    }`}
                                onClick={handleImageClick}
                                onDragOver={handleDragOver}
                                onDragLeave={handleDragLeave}
                                onDrop={handleDrop}
                            >
                                {isUploading ? (
                                    <div className="flex flex-col items-center text-primary animate-pulse">
                                        <Loader size={40} className="animate-spin mb-3" />
                                        <span className="text-sm font-medium">이미지 업로드 중...</span>
                                    </div>
                                ) : imageUrl ? (
                                    <>
                                        <img src={imageUrl} alt="Preview" className="w-full h-full object-cover" />
                                        <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                                            <p className="text-white font-medium flex items-center gap-2">
                                                <ImageIcon size={20} /> 사진 변경하기
                                            </p>
                                        </div>
                                    </>
                                ) : (
                                    <div className="text-center p-6">
                                        <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4 group-hover:bg-primary/10 group-hover:text-primary transition-colors text-gray-400">
                                            <ImageIcon size={32} />
                                        </div>
                                        <p className="text-gray-900 font-medium mb-1">사진을 드래그하거나 클릭하세요</p>
                                        <p className="text-xs text-gray-500">JPG, PNG, WEBP (최대 10MB)</p>
                                    </div>
                                )}
                            </div>
                            {imageUrl && !isUploading && (
                                <button
                                    type="button"
                                    onClick={(e) => { e.stopPropagation(); setImageUrl(''); }}
                                    className="text-xs text-red-500 mt-2 hover:text-red-600 flex items-center gap-1 ml-1"
                                >
                                    <Trash2 size={12} /> 사진 삭제
                                </button>
                            )}
                        </div>

                        {/* Caption */}
                        <div>
                            <label className="block text-sm font-bold text-gray-900 mb-2">내용</label>
                            <textarea
                                value={caption}
                                onChange={(e) => setCaption(e.target.value)}
                                placeholder="오늘의 스타일링 팁을 공유해주세요..."
                                className="w-full p-4 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition resize-none h-32 text-sm leading-relaxed"
                                required
                            />
                        </div>

                        {/* Product Tagging */}
                        <div>
                            <label className="block text-sm font-bold text-gray-900 mb-2 flex items-center gap-2">
                                <Tag size={16} className="text-primary" />
                                착용 상품 태그
                            </label>

                            {/* Tabs */}
                            <div className="flex gap-2 mb-3">
                                <button
                                    type="button"
                                    onClick={() => setActiveTab('all')}
                                    className={`flex-1 py-2 text-xs font-medium rounded-lg flex items-center justify-center gap-1 transition ${activeTab === 'all'
                                        ? 'bg-gray-900 text-white'
                                        : 'bg-gray-100 text-gray-500 hover:bg-gray-200'
                                        }`}
                                >
                                    <Globe size={12} /> 전체 상품
                                </button>
                                <button
                                    type="button"
                                    onClick={() => setActiveTab('purchased')}
                                    className={`flex-1 py-2 text-xs font-medium rounded-lg flex items-center justify-center gap-1 transition ${activeTab === 'purchased'
                                        ? 'bg-gray-900 text-white'
                                        : 'bg-gray-100 text-gray-500 hover:bg-gray-200'
                                        }`}
                                >
                                    <ShoppingBag size={12} /> 내 구매 내역
                                </button>
                            </div>

                            {/* Search Input */}
                            <div className="relative mb-3">
                                <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                                <input
                                    type="text"
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                    placeholder={activeTab === 'all' ? "전체 상품 검색..." : "내 구매 내역 검색..."}
                                    className="w-full pl-9 pr-4 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition"
                                />
                            </div>

                            {/* Product List */}
                            <div className="border border-gray-100 rounded-xl overflow-hidden">
                                <div className="max-h-40 overflow-y-auto p-2 custom-scrollbar bg-gray-50/50">
                                    {/* DEBUG INFO */}
                                    {activeTab === 'purchased' && (
                                        <div className="text-xs text-gray-400 p-2 text-center border-b border-gray-100">
                                            User ID: {user?.uid || 'None'} <br />
                                            Found: {purchasedProducts.length} items
                                        </div>
                                    )}

                                    {isLoadingPurchases && activeTab === 'purchased' ? (
                                        <div className="flex justify-center py-4 text-gray-400">
                                            <Loader size={16} className="animate-spin mr-2" /> 불러오는 중...
                                        </div>
                                    ) : filteredProducts.length > 0 ? (
                                        <div className="flex flex-wrap gap-2 p-2">
                                            {filteredProducts.map(product => (
                                                <button
                                                    key={product.id}
                                                    type="button"
                                                    onClick={() => toggleProduct(product.id)}
                                                    className={`text-xs px-3 py-1.5 rounded-full border transition-all duration-200 flex items-center gap-1 ${selectedProducts.includes(product.id)
                                                        ? 'bg-primary text-white border-primary shadow-sm transform scale-105'
                                                        : 'bg-white text-gray-600 border-gray-200 hover:border-primary hover:text-primary'
                                                        }`}
                                                >
                                                    {product.name}
                                                    {selectedProducts.includes(product.id) && <X size={10} className="ml-1" />}
                                                </button>
                                            ))}
                                        </div>
                                    ) : (
                                        <p className="text-center text-gray-400 text-xs py-4">
                                            {activeTab === 'purchased' ? "구매 내역이 없습니다." : "검색 결과가 없습니다."}
                                        </p>
                                    )}
                                </div>
                            </div>

                            {/* Selected Count */}
                            <div className="mt-2 text-right">
                                <span className="text-xs text-gray-500">
                                    <span className="font-medium text-primary">{selectedProducts.length}</span>개 상품 선택됨
                                </span>
                            </div>
                        </div>
                    </form>
                </div>

                <div className="p-5 border-t bg-gray-50">
                    <button
                        onClick={handleSubmit}
                        disabled={!caption || !imageUrl || isUploading}
                        className="w-full py-3.5 bg-primary text-white rounded-xl font-bold hover:bg-primary/90 transition shadow-lg shadow-primary/20 disabled:opacity-50 disabled:cursor-not-allowed disabled:shadow-none transform active:scale-[0.99] duration-200"
                    >
                        {isUploading ? '업로드 중...' : '게시하기'}
                    </button>
                </div>
            </div>
        </div>
    );
};

export default CreatePostModal;
