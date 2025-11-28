import React from 'react';
import { OOTDPost } from '../../types';
import { Heart, MessageCircle, Camera } from 'lucide-react';

interface MyOOTDProps {
    posts: OOTDPost[];
    loading: boolean;
}

const MyOOTD: React.FC<MyOOTDProps> = ({ posts, loading }) => {
    if (loading) {
        return <div className="text-center py-10 text-gray-500">게시물을 불러오는 중...</div>;
    }

    if (posts.length === 0) {
        return (
            <div className="text-center py-16 bg-gray-50 rounded-lg border border-gray-100">
                <Camera className="mx-auto h-12 w-12 text-gray-300 mb-4" />
                <p className="text-gray-500">작성한 OOTD 게시물이 없습니다.</p>
                <p className="text-sm text-gray-400 mt-2">나만의 스타일을 공유해보세요!</p>
            </div>
        );
    }

    return (
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            {posts.map((post) => (
                <div key={post.id} className="group relative aspect-[4/5] bg-gray-100 rounded-lg overflow-hidden cursor-pointer">
                    <img
                        src={post.image}
                        alt="My OOTD"
                        className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                    />
                    <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-center text-white space-y-2">
                        <div className="flex items-center space-x-1">
                            <Heart className="fill-white" size={20} />
                            <span className="font-bold">{post.likes}</span>
                        </div>
                        <div className="flex items-center space-x-1">
                            <MessageCircle className="fill-white" size={20} />
                            <span className="font-bold">{post.comments?.length || 0}</span>
                        </div>
                    </div>
                </div>
            ))}
        </div>
    );
};

export default MyOOTD;
