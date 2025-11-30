import React, { useState, useEffect } from 'react';
import { ImageIcon, Plus, FileText } from 'lucide-react';
import { Product } from '../../../types';

interface ProductModalProps {
    isOpen: boolean;
    onClose: () => void;
    product: Product | null;
    onSave: (product: Product) => void;
}

type DescriptionBlock = { id: string; type: 'text' | 'image'; content: string };

const ProductModal: React.FC<ProductModalProps> = ({ isOpen, onClose, product, onSave }) => {
    const [previewImage, setPreviewImage] = useState<string>('');
    const [additionalImages, setAdditionalImages] = useState<string[]>([]);
    const [descriptionBlocks, setDescriptionBlocks] = useState<DescriptionBlock[]>([]);

    useEffect(() => {
        if (isOpen) {
            setPreviewImage(product?.image || 'https://picsum.photos/600/750');
            setAdditionalImages([]);

            if (product?.description) {
                // Simple heuristic to parse existing description
                // In a real app, you'd want a more robust parser or store blocks directly
                setDescriptionBlocks([{ id: Date.now().toString(), type: 'text', content: product.description.replace(/<[^>]*>?/gm, '') }]);
            } else {
                setDescriptionBlocks([{ id: Date.now().toString(), type: 'text', content: '' }]);
            }
        }
    }, [isOpen, product]);

    const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            const url = URL.createObjectURL(file);
            setPreviewImage(url);
        }
    };

    const handleAddAdditionalImage = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            const url = URL.createObjectURL(file);
            setAdditionalImages(prev => [...prev, url]);
        }
    };

    const handleRemoveAdditionalImage = (index: number) => {
        setAdditionalImages(prev => prev.filter((_, i) => i !== index));
    };

    const addTextBlock = () => {
        setDescriptionBlocks(prev => [...prev, { id: Date.now().toString(), type: 'text', content: '' }]);
    };

    const addImageBlock = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            const url = URL.createObjectURL(file);
            setDescriptionBlocks(prev => [...prev, { id: Date.now().toString(), type: 'image', content: url }]);
        }
    };

    const updateBlock = (id: string, content: string) => {
        setDescriptionBlocks(prev => prev.map(b => b.id === id ? { ...b, content } : b));
    };

    const removeBlock = (id: string) => {
        setDescriptionBlocks(prev => prev.filter(b => b.id !== id));
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        const formData = new FormData(e.target as HTMLFormElement);

        const descriptionHtml = descriptionBlocks.map(block => {
            if (block.type === 'text') return `<p class="mb-4">${block.content}</p>`;
            if (block.type === 'image') return `<img src="${block.content}" class="w-full rounded-lg my-6" alt="Description Image" />`;
            return '';
        }).join('');

        const newProduct: Product = {
            id: product ? product.id : Date.now(), // Simple ID generation
            name: formData.get('name') as string,
            price: parseInt(formData.get('price') as string),
            image: previewImage,
            category: formData.get('category') as string,
            description: descriptionHtml,
            stock: parseInt(formData.get('stock') as string),
            isNew: formData.get('isNew') === 'on',
            tags: product ? product.tags : [],
        };

        onSave(newProduct);
        onClose();
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4 backdrop-blur-sm">
            <div className="bg-white rounded-lg shadow-2xl max-w-6xl w-full h-[90vh] flex flex-col">
                {/* Header */}
                <div className="flex justify-between items-center p-6 border-b border-gray-100">
                    <h2 className="text-xl font-bold text-gray-800 font-serif tracking-wide">
                        {product ? 'Edit Product' : 'New Product'}
                    </h2>
                    <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
                        <span className="sr-only">Close</span>
                        <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
                    </button>
                </div>

                {/* Modal Body */}
                <form onSubmit={handleSubmit} className="flex-1 flex flex-col lg:flex-row overflow-hidden">
                    {/* Left: Gallery & Image Input */}
                    <div className="lg:w-1/2 p-8 bg-gray-50 overflow-y-auto border-r border-gray-100">
                        <div className="mb-6">
                            <label className="block text-xs font-bold text-gray-600 mb-2">대표 이미지 <span className="text-red-500">*</span></label>
                            <div className="flex items-center gap-2">
                                <label className="flex-1 cursor-pointer bg-white border border-gray-300 rounded-sm px-4 py-3 flex items-center justify-center gap-2 hover:bg-gray-50 transition">
                                    <ImageIcon size={16} className="text-gray-500" />
                                    <span className="text-sm text-gray-600">이미지 파일 선택</span>
                                    <input
                                        type="file"
                                        accept="image/*"
                                        className="hidden"
                                        onChange={handleImageChange}
                                    />
                                </label>
                            </div>
                            <p className="text-[10px] text-gray-400 mt-2">* 실제 쇼핑몰과 동일한 비율(4:5)의 이미지를 권장합니다.</p>
                        </div>

                        <div className="relative aspect-[4/5] bg-white shadow-sm overflow-hidden mb-4 border border-gray-200 group">
                            <img
                                src={previewImage}
                                alt="Preview"
                                className="w-full h-full object-cover"
                                onError={(e) => e.currentTarget.src = "https://via.placeholder.com/600x750?text=No+Image"}
                            />
                            <div className="absolute top-4 left-4">
                                <span id="preview-badge" className={`text-xs font-bold tracking-widest uppercase bg-black text-white px-2 py-1 ${product?.isNew ? '' : 'hidden'}`}>New Arrival</span>
                            </div>
                        </div>

                        {/* Additional Images */}
                        <div className="flex gap-4 overflow-x-auto pb-2">
                            {additionalImages.map((img, idx) => (
                                <div key={idx} className="relative w-20 h-24 bg-white border border-gray-200 group">
                                    <img src={img} alt={`Sub ${idx}`} className="w-full h-full object-cover" />
                                    <button
                                        type="button"
                                        onClick={() => handleRemoveAdditionalImage(idx)}
                                        className="absolute top-1 right-1 bg-black/50 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition"
                                    >
                                        <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
                                    </button>
                                </div>
                            ))}
                            {additionalImages.length < 5 && (
                                <label className="w-20 h-24 bg-white border border-dashed border-gray-300 cursor-pointer hover:border-gray-400 hover:bg-gray-50 transition flex flex-col items-center justify-center gap-1">
                                    <Plus size={16} className="text-gray-400" />
                                    <span className="text-[10px] text-gray-400">Add</span>
                                    <input
                                        type="file"
                                        accept="image/*"
                                        className="hidden"
                                        onChange={handleAddAdditionalImage}
                                    />
                                </label>
                            )}
                        </div>
                    </div>

                    {/* Right: Info Inputs */}
                    <div className="lg:w-1/2 p-8 overflow-y-auto bg-white">
                        <div className="max-w-md mx-auto space-y-8">
                            {/* Breadcrumb Style Category Selector */}
                            <div className="flex items-center text-sm text-gray-500 font-light">
                                <span className="hover:text-black cursor-pointer">Home</span>
                                <span className="mx-2 text-xs">/</span>
                                <span className="hover:text-black cursor-pointer">Shop</span>
                                <span className="mx-2 text-xs">/</span>
                                <select
                                    name="category"
                                    defaultValue={product?.category || 'earring'}
                                    className="text-black font-medium border-none focus:ring-0 p-0 cursor-pointer bg-transparent outline-none hover:underline"
                                >
                                    <option value="earring">Earrings (귀걸이)</option>
                                    <option value="necklace">Necklaces (목걸이)</option>
                                    <option value="ring">Rings (반지)</option>
                                    <option value="bracelet">Bracelets (팔찌)</option>
                                </select>
                            </div>

                            {/* Product Name */}
                            <div>
                                <label className="block text-xs font-bold text-gray-400 mb-1">상품명</label>
                                <input
                                    name="name"
                                    defaultValue={product?.name}
                                    required
                                    className="w-full text-3xl md:text-4xl font-serif text-primary border-b border-gray-200 focus:border-black outline-none py-2 placeholder-gray-200 transition"
                                    placeholder="Product Name"
                                />
                            </div>

                            {/* Price & Stock */}
                            <div className="flex gap-8">
                                <div className="flex-1">
                                    <label className="block text-xs font-bold text-gray-400 mb-1">판매가 (KRW)</label>
                                    <div className="flex items-center">
                                        <span className="text-xl font-medium text-gray-900 mr-1">₩</span>
                                        <input
                                            name="price"
                                            type="number"
                                            defaultValue={product?.price}
                                            required
                                            className="w-full text-xl font-medium text-gray-900 border-b border-gray-200 focus:border-black outline-none py-1"
                                            placeholder="0"
                                        />
                                    </div>
                                </div>
                                <div className="flex-1">
                                    <label className="block text-xs font-bold text-gray-400 mb-1">재고 수량</label>
                                    <input
                                        name="stock"
                                        type="number"
                                        defaultValue={product?.stock ?? 100}
                                        className="w-full text-xl font-medium text-gray-900 border-b border-gray-200 focus:border-black outline-none py-1"
                                        placeholder="0"
                                    />
                                </div>
                            </div>

                            {/* Description (Block Editor) */}
                            <div>
                                <label className="block text-xs font-bold text-gray-400 mb-2">상품 상세 설명 (블로그형 에디터)</label>
                                <div className="border border-gray-200 rounded-sm p-4 space-y-4 bg-gray-50 min-h-[300px]">
                                    {descriptionBlocks.map((block) => (
                                        <div key={block.id} className="relative group">
                                            {block.type === 'text' ? (
                                                <textarea
                                                    value={block.content}
                                                    onChange={(e) => updateBlock(block.id, e.target.value)}
                                                    rows={3}
                                                    className="w-full text-sm text-gray-600 leading-relaxed border border-gray-200 p-3 rounded-sm focus:border-black outline-none resize-none bg-white"
                                                    placeholder="텍스트를 입력하세요..."
                                                />
                                            ) : (
                                                <div className="relative">
                                                    <img src={block.content} alt="Content" className="w-full rounded-lg border border-gray-200" />
                                                </div>
                                            )}
                                            <button
                                                type="button"
                                                onClick={() => removeBlock(block.id)}
                                                className="absolute -right-2 -top-2 bg-red-500 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition shadow-sm z-10"
                                            >
                                                <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
                                            </button>
                                        </div>
                                    ))}
                                    <div className="flex gap-2 justify-center pt-4 border-t border-gray-200 border-dashed">
                                        <button
                                            type="button"
                                            onClick={addTextBlock}
                                            className="flex items-center gap-1 px-3 py-2 bg-white border border-gray-300 rounded-sm text-xs font-medium hover:bg-gray-50 transition"
                                        >
                                            <FileText size={14} /> 텍스트 추가
                                        </button>
                                        <label className="flex items-center gap-1 px-3 py-2 bg-white border border-gray-300 rounded-sm text-xs font-medium hover:bg-gray-50 transition cursor-pointer">
                                            <ImageIcon size={14} /> 이미지 추가
                                            <input type="file" accept="image/*" className="hidden" onChange={addImageBlock} />
                                        </label>
                                    </div>
                                </div>
                            </div>

                            {/* Options */}
                            <div className="border-t border-b border-gray-100 py-6 space-y-4">
                                <div className="flex items-center justify-between">
                                    <span className="text-sm font-medium text-gray-900">신상품 뱃지 (New Arrival)</span>
                                    <label className="relative inline-flex items-center cursor-pointer">
                                        <input
                                            type="checkbox"
                                            name="isNew"
                                            defaultChecked={product?.isNew}
                                            className="sr-only peer"
                                            onChange={(e) => {
                                                const badge = document.getElementById('preview-badge');
                                                if (badge) {
                                                    if (e.target.checked) badge.classList.remove('hidden');
                                                    else badge.classList.add('hidden');
                                                }
                                            }}
                                        />
                                        <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-black"></div>
                                    </label>
                                </div>
                            </div>

                            {/* Action Buttons */}
                            <div className="flex gap-4 pt-4">
                                <button
                                    type="button"
                                    onClick={onClose}
                                    className="flex-1 py-4 border border-gray-300 text-gray-700 text-sm font-medium hover:bg-gray-50 transition uppercase tracking-widest"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    className="flex-1 py-4 bg-primary text-white text-sm font-medium hover:bg-black transition uppercase tracking-widest shadow-lg"
                                >
                                    {product ? 'Save Changes' : 'Register Product'}
                                </button>
                            </div>
                        </div>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default ProductModal;
