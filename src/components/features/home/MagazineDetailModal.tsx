import React, { useEffect } from 'react';
import { X, Calendar, User, Share2, Heart } from 'lucide-react';

interface Article {
    id: number;
    category: string;
    title: string;
    excerpt: string;
    image: string;
    content: React.ReactNode;
    date?: string;
    author?: string;
}

interface MagazineDetailModalProps {
    article: Article | null;
    isOpen: boolean;
    onClose: () => void;
}

const MagazineDetailModal: React.FC<MagazineDetailModalProps> = ({ article, isOpen, onClose }) => {
    useEffect(() => {
        if (isOpen) {
            document.body.style.overflow = 'hidden';
        } else {
            document.body.style.overflow = 'unset';
        }
        return () => {
            document.body.style.overflow = 'unset';
        };
    }, [isOpen]);

    if (!isOpen || !article) return null;

    return (
        <div className="fixed inset-0 z-50 flex justify-end">
            {/* Backdrop */}
            <div
                className="absolute inset-0 bg-black/30 backdrop-blur-sm transition-opacity"
                onClick={onClose}
            />

            {/* Slide-over Panel */}
            <div className="relative w-full max-w-2xl bg-white h-full shadow-2xl overflow-y-auto animate-slide-in-right">
                {/* Close Button */}
                <button
                    onClick={onClose}
                    className="absolute top-6 right-6 z-10 p-2 bg-white/80 rounded-full hover:bg-white transition shadow-sm"
                >
                    <X size={24} />
                </button>

                {/* Hero Image */}
                <div className="relative h-80 w-full">
                    <img
                        src={article.image}
                        alt={article.title}
                        className="w-full h-full object-cover"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                    <div className="absolute bottom-6 left-8 text-white">
                        <span className="inline-block px-3 py-1 bg-white/20 backdrop-blur-md text-xs font-bold tracking-wider mb-3 rounded-sm border border-white/30">
                            {article.category}
                        </span>
                        <h2 className="text-3xl md:text-4xl font-serif font-bold leading-tight mb-2">
                            {article.title}
                        </h2>
                    </div>
                </div>

                {/* Content */}
                <div className="p-8 md:p-12">
                    {/* Meta Data */}
                    <div className="flex items-center justify-between border-b border-gray-100 pb-6 mb-8 text-sm text-gray-500">
                        <div className="flex items-center gap-4">
                            <div className="flex items-center gap-1">
                                <Calendar size={14} />
                                <span>{article.date || '2025.03.15'}</span>
                            </div>
                            <div className="flex items-center gap-1">
                                <User size={14} />
                                <span>{article.author || 'Lumina Editor'}</span>
                            </div>
                        </div>
                        <div className="flex gap-3">
                            <button className="hover:text-red-500 transition"><Heart size={18} /></button>
                            <button className="hover:text-blue-500 transition"><Share2 size={18} /></button>
                        </div>
                    </div>

                    {/* Article Body */}
                    <div className="prose prose-lg max-w-none prose-headings:font-serif prose-headings:font-medium prose-p:text-gray-600 prose-img:rounded-lg prose-a:text-black hover:prose-a:underline">
                        <p className="lead text-xl text-gray-800 font-light italic mb-8 border-l-4 border-black pl-4">
                            {article.excerpt}
                        </p>
                        {article.content}
                    </div>

                    {/* Footer */}
                    <div className="mt-12 pt-8 border-t border-gray-100 text-center">
                        <p className="text-sm text-gray-400 mb-4">Did you enjoy this article?</p>
                        <button
                            onClick={onClose}
                            className="px-8 py-3 bg-black text-white text-sm font-medium hover:bg-gray-800 transition rounded-sm"
                        >
                            Back to Magazine
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default MagazineDetailModal;
