import React, { useState } from 'react';
import { Star } from 'lucide-react';

interface ReviewFormProps {
    onSubmit: (rating: number, comment: string) => void;
    onCancel: () => void;
}

const ReviewForm: React.FC<ReviewFormProps> = ({ onSubmit, onCancel }) => {
    const [rating, setRating] = useState(5);
    const [comment, setComment] = useState('');

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        onSubmit(rating, comment);
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-4">
            <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">별점</label>
                <div className="flex space-x-1">
                    {[1, 2, 3, 4, 5].map((star) => (
                        <button
                            key={star}
                            type="button"
                            onClick={() => setRating(star)}
                            className="focus:outline-none"
                        >
                            <Star
                                size={24}
                                className={`${star <= rating ? 'fill-yellow-400 text-yellow-400' : 'text-gray-300'}`}
                            />
                        </button>
                    ))}
                </div>
            </div>
            <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">리뷰 내용</label>
                <textarea
                    value={comment}
                    onChange={(e) => setComment(e.target.value)}
                    className="w-full border border-gray-300 rounded-md p-2 focus:ring-primary focus:border-primary"
                    rows={4}
                    placeholder="상품에 대한 솔직한 리뷰를 남겨주세요."
                    required
                />
            </div>
            <div className="flex justify-end space-x-2">
                <button
                    type="button"
                    onClick={onCancel}
                    className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
                >
                    취소
                </button>
                <button
                    type="submit"
                    className="px-4 py-2 bg-primary text-white rounded-md hover:bg-primary/90"
                >
                    등록
                </button>
            </div>
        </form>
    );
};

export default ReviewForm;
