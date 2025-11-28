import React, { useState } from 'react';
import { X, Image as ImageIcon, Tag } from 'lucide-react';
import { PRODUCTS } from '../constants';
import { OOTDPost } from '../types';

interface CreatePostModalProps {
    onClose: () => void;
    onSubmit: (post: Omit<OOTDPost, 'id' | 'likes' | 'user'>) => void;
}

const CreatePostModal: React.FC<CreatePostModalProps> = ({ onClose, onSubmit }) => {
    const [caption, setCaption] = useState('');
    const [selectedProducts, setSelectedProducts] = useState<number[]>([]);
    const [imageUrl, setImageUrl] = useState('');

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

    const handleImageUpload = () => {
        // Mock image upload by setting a random image from picsum
        const randomId = Math.floor(Math.random() * 1000);
        setImageUrl(`https://picsum.photos/400/600?random=${randomId}`);
    };

    return (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
            <div className="bg-white rounded-xl w-full max-w-lg overflow-hidden animate-fade-in">
                <div className="p-4 border-b flex justify-between items-center">
                    <h3 className="font-serif text-xl">새 게시물 작성</h3>
                    <button onClick={onClose} className="p-1 hover:bg-gray-100 rounded-full transition">
                        <X size={24} />
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="p-6">
                    {/* Image Upload Area */}
                    <div className="mb-6">
                        <div
                            className={`aspect-[4/5] bg-gray-50 rounded-lg border-2 border-dashed border-gray-200 flex flex-col items-center justify-center cursor-pointer hover:bg-gray-100 transition relative overflow-hidden ${imageUrl ? 'border-none' : ''}`}
                            onClick={handleImageUpload}
                        >
                            {imageUrl ? (
                                <img src={imageUrl} alt="Preview" className="w-full h-full object-cover" />
                            ) : (
                                <>
                                    <ImageIcon size={48} className="text-gray-300 mb-2" />
                                    <p className="text-sm text-gray-500">클릭하여 사진 업로드 (랜덤 생성)</p>
                                </>
                            )}
                        </div>
                        {imageUrl && (
                            <button
                                type="button"
                                onClick={(e) => { e.stopPropagation(); setImageUrl(''); }}
                                className="text-xs text-red-500 mt-2 hover:underline"
                            >
                                사진 삭제
                            </button>
                        )}
                    </div>

                    {/* Caption */}
                    <div className="mb-6">
                        <label className="block text-sm font-medium text-gray-700 mb-2">내용</label>
                        <textarea
                            value={caption}
                            onChange={(e) => setCaption(e.target.value)}
                            placeholder="오늘의 스타일링 팁을 공유해주세요..."
                            className="w-full p-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20 resize-none h-24"
                            required
                        />
                    </div>

                    {/* Product Tagging */}
                    <div className="mb-6">
                        <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center gap-2">
                            <Tag size={16} />
                            착용 상품 태그
                        </label>
                        <div className="flex flex-wrap gap-2 max-h-32 overflow-y-auto p-2 border border-gray-100 rounded-lg">
                            {PRODUCTS.map(product => (
                                <button
                                    key={product.id}
                                    type="button"
                                    onClick={() => toggleProduct(product.id)}
                                    className={`text-xs px-3 py-1.5 rounded-full border transition ${selectedProducts.includes(product.id)
                                            ? 'bg-primary text-white border-primary'
                                            : 'bg-white text-gray-600 border-gray-200 hover:border-primary'
                                        }`}
                                >
                                    {product.name}
                                </button>
                            ))}
                        </div>
                    </div>

                    <button
                        type="submit"
                        disabled={!caption || !imageUrl}
                        className="w-full py-3 bg-primary text-white rounded-lg font-medium hover:bg-primary/90 transition disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        게시하기
                    </button>
                </form>
            </div>
        </div>
    );
};

export default CreatePostModal;
