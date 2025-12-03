import React, { useState, useEffect } from 'react';
import { ImageIcon, Plus, FileText, Loader2, X } from 'lucide-react';
import { Product } from '../../../types';
import { uploadImage } from '../../../services/storageService';
import { compressImage } from '../../../utils/imageOptimizer';
import { useGlobalModal } from '../../../contexts/GlobalModalContext';

interface ProductModalProps {
    isOpen: boolean;
    onClose: () => void;
    product: Product | null;
    onSave: (product: Product) => void;
}

type DescriptionBlock = { id: string; type: 'text' | 'image'; content: string };

const ProductModal: React.FC<ProductModalProps> = ({ isOpen, onClose, product, onSave }) => {
    const { showAlert } = useGlobalModal();
    const [previewImage, setPreviewImage] = useState<string>('');
    const [additionalImages, setAdditionalImages] = useState<string[]>([]);
    const [descriptionBlocks, setDescriptionBlocks] = useState<DescriptionBlock[]>([]);
    const [uploading, setUploading] = useState(false);
    const [mainImageFile, setMainImageFile] = useState<File | null>(null);
    const [sizes, setSizes] = useState<string[]>([]);
    const [colors, setColors] = useState<string[]>([]);
    const [sizeStock, setSizeStock] = useState<{ [size: string]: number }>({});
    const [sizeColorStocks, setSizeColorStocks] = useState<Array<{ id: string; size: string; color: string; quantity: number }>>([]);
    const [selectedCategory, setSelectedCategory] = useState<string>(product?.category || 'earring');

    // 카테고리별 사이즈 옵션
    const getSizeOptionsByCategory = (category: string): string[] => {
        switch (category) {
            case 'ring':
                return ['9호', '10호', '11호', '12호', '13호', '14호', '15호', '16호', '17호'];
            case 'necklace':
                return ['40cm', '45cm', '50cm', '55cm'];
            case 'bracelet':
                return ['16cm', '17cm', '18cm', '19cm', '20cm'];
            case 'earring':
            default:
                return ['Free'];
        }
    };

    useEffect(() => {
        if (isOpen) {
            setPreviewImage(product?.image || '');
            setAdditionalImages(product?.images || []);
            setMainImageFile(null);
            setSizes(product?.sizes || []);
            setColors(product?.colors || []);
            setSizeStock(product?.sizeStock || {});
            setSelectedCategory(product?.category || 'earring');
            // sizeColorStock이 있으면 사용, 없으면 기본 카테고리 사이즈로 초기화 (신규 등록 시)
            if (product?.sizeColorStock && product.sizeColorStock.length > 0) {
                setSizeColorStocks(product.sizeColorStock.map((item, index) => ({
                    id: `${item.size}-${item.color}-${index}`,
                    ...item
                })));
            } else if (!product) {
                // 신규 등록인 경우 현재 선택된 카테고리(기본값)의 사이즈로 자동 생성
                const initialCategory = 'earring'; // Default category
                const initialSizes = getSizeOptionsByCategory(initialCategory);
                setSizeColorStocks(initialSizes.map((size, index) => ({
                    id: Date.now().toString() + index,
                    size: size,
                    color: '',
                    quantity: 0
                })));
            } else {
                setSizeColorStocks([]);
            }

            if (product?.description) {
                const parsedBlocks = parseDescription(product.description);
                setDescriptionBlocks(parsedBlocks);
            } else {
                setDescriptionBlocks([{ id: Date.now().toString(), type: 'text', content: '' }]);
            }
        }
    }, [isOpen, product]);

    const parseDescription = (html: string): DescriptionBlock[] => {
        const blocks: DescriptionBlock[] = [];
        const imgRegex = /<img[^>]+src="([^">]+)"[^>]*>/g;
        let lastIndex = 0;
        let match;

        while ((match = imgRegex.exec(html)) !== null) {
            // Text before image
            const textContent = html.substring(lastIndex, match.index).replace(/<[^>]*>?/gm, '').trim();
            if (textContent) {
                blocks.push({ id: Date.now().toString() + Math.random(), type: 'text', content: textContent });
            }

            // Image
            const imgSrc = match[1];
            if (imgSrc) {
                blocks.push({ id: Date.now().toString() + Math.random(), type: 'image', content: imgSrc });
            }

            lastIndex = match.index + match[0].length;
        }

        // Remaining text
        const remainingText = html.substring(lastIndex).replace(/<[^>]*>?/gm, '').trim();
        if (remainingText) {
            blocks.push({ id: Date.now().toString() + Math.random(), type: 'text', content: remainingText });
        }

        if (blocks.length === 0) {
            return [{ id: Date.now().toString(), type: 'text', content: '' }];
        }

        return blocks;
    };

    const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            setMainImageFile(file);
            const url = URL.createObjectURL(file);
            setPreviewImage(url);
        }
    };

    const handleAddAdditionalImage = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file && additionalImages.length < 5) {
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

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setUploading(true);

        try {
            const formData = new FormData(e.target as HTMLFormElement);

            // 1. Upload main image if a new file was selected
            let mainImageUrl = previewImage;
            if (mainImageFile) {
                const compressedFile = await compressImage(mainImageFile);
                mainImageUrl = await uploadImage(compressedFile, 'products');
            }

            // 2. Upload additional images
            // Filter out blob URLs and upload them, keep existing URLs
            const finalAdditionalImages = await Promise.all(
                additionalImages.map(async (url) => {
                    if (url.startsWith('blob:')) {
                        const response = await fetch(url);
                        const blob = await response.blob();
                        const file = new File([blob], 'additional-image.jpg', { type: blob.type });
                        const compressedFile = await compressImage(file);
                        return await uploadImage(compressedFile, 'products/additional');
                    }
                    return url;
                })
            );

            // 3. Upload description block images if they are new
            const uploadedDescriptionBlocks = await Promise.all(
                descriptionBlocks.map(async (block) => {
                    if (block.type === 'image' && block.content.startsWith('blob:')) {
                        const response = await fetch(block.content);
                        const blob = await response.blob();
                        const file = new File([blob], 'description-image.jpg', { type: blob.type });
                        const compressedFile = await compressImage(file);
                        const uploadedUrl = await uploadImage(compressedFile, 'products/descriptions');
                        return { ...block, content: uploadedUrl };
                    }
                    return block;
                })
            );

            const descriptionHtml = uploadedDescriptionBlocks.map(block => {
                if (block.type === 'text') return `<p class="mb-4">${block.content}</p>`;
                if (block.type === 'image') return `<img src="${block.content}" class="w-full rounded-lg my-6" alt="Description Image" />`;
                return '';
            }).join('');

            // sizeColorStocks에서 사이즈와 색상 목록 추출
            const uniqueSizes = Array.from(new Set(sizeColorStocks.map(item => item.size).filter(s => s)));
            const uniqueColors = Array.from(new Set(sizeColorStocks.map(item => item.color).filter(c => c)));
            const finalSizes = uniqueSizes.length > 0 ? uniqueSizes : undefined;
            const finalColors = uniqueColors.length > 0 ? uniqueColors : undefined;

            // sizeColorStocks를 정리 (id 제거하고 필요한 데이터만)
            const cleanedSizeColorStocks = sizeColorStocks
                .filter(item => item.size && item.color && item.quantity >= 0)
                .map(item => ({
                    size: item.size,
                    color: item.color,
                    quantity: item.quantity
                }));

            // 필수 필드 검증
            const productName = formData.get('name') as string;
            const productPrice = formData.get('price') as string;
            const productCategory = selectedCategory; // 상태에서 직접 가져오기

            if (!productName || !productName.trim()) {
                await showAlert('상품명을 입력해주세요.', '오류');
                setUploading(false);
                return;
            }

            if (!productPrice || isNaN(parseInt(productPrice))) {
                await showAlert('올바른 가격을 입력해주세요.', '오류');
                setUploading(false);
                return;
            }

            if (!productCategory) {
                await showAlert('카테고리를 선택해주세요.', '오류');
                setUploading(false);
                return;
            }

            if (!mainImageUrl) {
                await showAlert('대표 이미지를 등록해주세요.', '오류');
                setUploading(false);
                return;
            }

            const newProduct: Product = {
                id: product ? product.id : Date.now(),
                name: productName.trim(),
                price: parseInt(productPrice) || 0,
                image: mainImageUrl,
                images: finalAdditionalImages,
                category: productCategory,
                description: descriptionHtml,
                stock: 0, // 사이즈-색상 조합으로 관리하므로 일반 재고는 0
                isNew: formData.get('isNew') === 'on',
                tags: product ? product.tags : [],
                shortDescription: (formData.get('shortDescription') as string) || '',
                sizes: finalSizes,
                colors: finalColors,
                sizeColorStock: cleanedSizeColorStocks.length > 0 ? cleanedSizeColorStocks : undefined,
            };

            await onSave(newProduct);
            onClose();
        } catch (error: any) {
            console.error('[MY_LOG] Error saving product:', error);
            const errorMessage = error?.message || '상품 저장에 실패했습니다. 다시 시도해주세요.';
            await showAlert(errorMessage, '오류');
        } finally {
            setUploading(false);
        }
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
                    <div className="lg:w-1/2 p-4 lg:p-8 bg-gray-50 overflow-y-auto border-r border-gray-100">
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
                            <p className="text-[10px] text-gray-400 mt-2">* 950 x 950 사이즈의 이미지를 권장합니다.</p>
                        </div>

                        <div className="relative aspect-square bg-gray-50 shadow-sm overflow-hidden mb-4 border border-gray-200 group">
                            {previewImage ? (
                                <img
                                    src={previewImage}
                                    alt="Preview"
                                    className="w-full h-full object-contain"
                                    onError={(e) => e.currentTarget.src = "https://via.placeholder.com/600x750?text=No+Image"}
                                />
                            ) : (
                                <div className="w-full h-full flex items-center justify-center text-gray-400">
                                    <div className="text-center">
                                        <ImageIcon size={48} className="mx-auto mb-2 text-gray-300" />
                                        <p className="text-sm font-medium">메인 이미지를 추가해 주세요</p>
                                    </div>
                                </div>
                            )}
                            <div className="absolute top-4 left-4">
                                <span id="preview-badge" className={`text-xs font-bold tracking-widest uppercase bg-black text-white px-2 py-1 ${product?.isNew ? '' : 'hidden'}`}>New Arrival</span>
                            </div>
                        </div>

                        {/* Additional Images */}
                        <label className="block text-xs font-bold text-gray-600 mb-2">추가 이미지 (최대 5장)</label>
                        <div className="flex gap-4 overflow-x-auto pb-2">
                            {additionalImages.map((img, idx) => (
                                <div key={idx} className="relative w-20 h-24 bg-white border border-gray-200 group flex-shrink-0">
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
                                <label className="w-20 h-24 bg-white border border-dashed border-gray-300 cursor-pointer hover:border-gray-400 hover:bg-gray-50 transition flex flex-col items-center justify-center gap-1 flex-shrink-0">
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
                    <div className="lg:w-1/2 p-4 lg:p-8 overflow-y-auto bg-white">
                        <div className="max-w-md mx-auto space-y-8">
                            {/* Breadcrumb Style Category Selector */}
                            <div className="flex items-center text-sm text-gray-500 font-light">
                                <span className="hover:text-black cursor-pointer">Home</span>
                                <span className="mx-2 text-xs">/</span>
                                <span className="hover:text-black cursor-pointer">Shop</span>
                                <span className="mx-2 text-xs">/</span>
                                <select
                                    name="category"
                                    value={selectedCategory}
                                    onChange={(e) => {
                                        const newCategory = e.target.value;
                                        setSelectedCategory(newCategory);

                                        // 카테고리 변경 시 해당 카테고리의 모든 사이즈로 리스트 자동 생성
                                        const newSizeOptions = getSizeOptionsByCategory(newCategory);
                                        const newStocks = newSizeOptions.map((size, index) => ({
                                            id: Date.now().toString() + index,
                                            size: size,
                                            color: '', // 색상은 사용자가 선택
                                            quantity: 0
                                        }));
                                        setSizeColorStocks(newStocks);
                                    }}
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

                            {/* Short Description */}
                            <div>
                                <label className="block text-xs font-bold text-gray-400 mb-1">간단한 소개 (리스트 형태 권장)</label>
                                <textarea
                                    name="shortDescription"
                                    defaultValue={product?.shortDescription}
                                    rows={3}
                                    className="w-full text-sm text-gray-600 border-b border-gray-200 focus:border-black outline-none py-2 placeholder-gray-300 transition resize-none"
                                    placeholder="• 모던하고 심플한 디자인&#13;&#10;• 데일리 아이템으로 추천&#13;&#10;• 알러지 방지 처리 완료"
                                />
                            </div>

                            {/* Price */}
                            <div>
                                <label className="block text-xs font-bold text-gray-400 mb-1">판매가 (KRW)</label>
                                <div className="flex items-center">
                                    <span className="text-xl font-medium text-gray-900 mr-1">₩</span>
                                    <input
                                        name="price"
                                        type="number"
                                        min="0"
                                        defaultValue={product?.price}
                                        required
                                        className="w-full text-xl font-medium text-gray-900 border-b border-gray-200 focus:border-black outline-none py-1"
                                        placeholder="0"
                                    />
                                </div>
                            </div>

                            {/* Size-Color-Quantity Combinations */}
                            <div className="space-y-4">
                                <div className="flex items-center justify-between">
                                    <label className="block text-xs font-bold text-gray-400">사이즈/색상/수량 조합</label>
                                    {/* 추가하기 버튼 제거됨 (자동 생성 사용) */}
                                </div>

                                {sizeColorStocks.length > 0 && (
                                    <div className="space-y-3 border border-gray-200 rounded-sm p-4 bg-gray-50">
                                        {sizeColorStocks.map((item, index) => (
                                            <div key={item.id} className="flex items-center gap-2">
                                                <div className="flex-1 grid grid-cols-3 gap-2">
                                                    <select
                                                        value={item.size}
                                                        onChange={(e) => {
                                                            const updated = [...sizeColorStocks];
                                                            updated[index].size = e.target.value;
                                                            setSizeColorStocks(updated);
                                                        }}
                                                        className="text-sm text-gray-900 border-b border-gray-300 focus:border-black outline-none py-1 bg-gray-100 text-gray-500 cursor-not-allowed"
                                                        disabled={true} // 사이즈는 항상 자동생성된 값 사용
                                                    >
                                                        <option value="">사이즈 선택</option>
                                                        {getSizeOptionsByCategory(selectedCategory).map(size => (
                                                            <option key={size} value={size}>{size}</option>
                                                        ))}
                                                    </select>
                                                    <input
                                                        type="number"
                                                        min="0"
                                                        value={item.quantity}
                                                        onChange={(e) => {
                                                            const updated = [...sizeColorStocks];
                                                            updated[index].quantity = parseInt(e.target.value) || 0;
                                                            setSizeColorStocks(updated);
                                                        }}
                                                        placeholder="수량"
                                                        className={`text-sm text-gray-900 border-b border-gray-300 focus:border-black outline-none py-1 ${product ? 'bg-gray-100 text-gray-500 cursor-not-allowed' : ''}`}
                                                        disabled={!!product}
                                                        title={product ? "재고 수량은 '재고 관리' 메뉴에서 변경해주세요." : "초기 재고 수량"}
                                                    />
                                                    <select
                                                        value={item.color}
                                                        onChange={(e) => {
                                                            const updated = [...sizeColorStocks];
                                                            updated[index].color = e.target.value;
                                                            setSizeColorStocks(updated);
                                                        }}
                                                        className={`text-sm text-gray-900 border-b border-gray-300 focus:border-black outline-none py-1 ${product ? 'bg-gray-100 text-gray-500 cursor-not-allowed' : 'bg-white'}`}
                                                        disabled={!!product} // 상품 수정 시 색상 변경 불가
                                                    >
                                                        <option value="">색상 선택</option>
                                                        <option value="Gold">Gold</option>
                                                        <option value="Silver">Silver</option>
                                                        <option value="Rose Gold">Rose Gold</option>
                                                        <option value="White">White</option>
                                                        <option value="Black">Black</option>
                                                        <option value="Red">Red</option>
                                                        <option value="Blue">Blue</option>
                                                        <option value="Green">Green</option>
                                                        <option value="Pink">Pink</option>
                                                    </select>
                                                </div>
                                                {!product && (
                                                    <button
                                                        type="button"
                                                        onClick={() => {
                                                            setSizeColorStocks(prev => prev.filter(i => i.id !== item.id));
                                                        }}
                                                        className="text-gray-400 hover:text-red-600 transition p-1"
                                                        title="삭제"
                                                    >
                                                        <X size={16} />
                                                    </button>
                                                )}
                                            </div>
                                        ))}
                                    </div>
                                )}

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
                                    disabled={uploading}
                                    className="flex-1 py-4 bg-primary text-white text-sm font-medium hover:bg-black transition uppercase tracking-widest shadow-lg disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                                >
                                    {uploading && <Loader2 size={16} className="animate-spin" />}
                                    {uploading ? 'Uploading...' : (product ? 'Save Changes' : 'Register Product')}
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
