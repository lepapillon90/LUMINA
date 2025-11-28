import React, { useState } from 'react';
import { OOTD_POSTS, PRODUCTS } from '../constants';
import { Heart, MessageCircle, Plus, Send, X } from 'lucide-react';
import { Link } from 'react-router-dom';
import SEO from '../components/SEO';
import CreatePostModal from '../components/CreatePostModal';
import { OOTDPost } from '../types';

const OOTD: React.FC = () => {
  const [posts, setPosts] = useState<OOTDPost[]>(
    OOTD_POSTS.map(post => ({ ...post, comments: [], isLiked: false }))
  );
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [activeCommentId, setActiveCommentId] = useState<number | null>(null);
  const [commentText, setCommentText] = useState('');

  const handleImageError = (e: React.SyntheticEvent<HTMLImageElement, Event>) => {
    e.currentTarget.src = 'https://via.placeholder.com/400x500?text=No+Image';
  };

  const handleCreatePost = (newPostData: Omit<OOTDPost, 'id' | 'likes' | 'user'>) => {
    const newPost: OOTDPost = {
      ...newPostData,
      id: Date.now(),
      user: '@guest_user', // Default user for now
      likes: 0,
      comments: [],
      isLiked: false
    };
    setPosts([newPost, ...posts]);
  };

  const handleLike = (postId: number) => {
    setPosts(posts.map(post => {
      if (post.id === postId) {
        return {
          ...post,
          likes: post.isLiked ? post.likes - 1 : post.likes + 1,
          isLiked: !post.isLiked
        };
      }
      return post;
    }));
  };

  const toggleCommentSection = (postId: number) => {
    if (activeCommentId === postId) {
      setActiveCommentId(null);
    } else {
      setActiveCommentId(postId);
      setCommentText('');
    }
  };

  const handleAddComment = (postId: number) => {
    if (!commentText.trim()) return;

    setPosts(posts.map(post => {
      if (post.id === postId) {
        return {
          ...post,
          comments: [...(post.comments || []), { user: '@guest_user', text: commentText }]
        };
      }
      return post;
    }));
    setCommentText('');
  };

  return (
    <div className="pt-24 pb-20 bg-white min-h-screen">
      <SEO title="OOTD" description="LUMINA와 함께한 고객님들의 스타일링을 확인해보세요." />

      {/* Floating Action Button for Mobile / Desktop */}
      <button
        onClick={() => setIsModalOpen(true)}
        className="fixed bottom-24 right-8 z-40 bg-primary text-white p-4 rounded-full shadow-lg hover:bg-primary/90 transition-transform hover:scale-105 flex items-center gap-2"
      >
        <Plus size={24} />
        <span className="font-medium hidden md:inline">글쓰기</span>
      </button>

      {isModalOpen && (
        <CreatePostModal
          onClose={() => setIsModalOpen(false)}
          onSubmit={handleCreatePost}
        />
      )}

      <div className="container mx-auto px-6 max-w-4xl">
        <div className="text-center mb-16">
          <h1 className="text-4xl font-serif mb-4">#LuminaOOTD</h1>
          <p className="text-gray-500">당신의 빛나는 순간을 공유해주세요. @lumina_official 태그와 함께.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {posts.map(post => {
            const featuredProducts = PRODUCTS.filter(p => post.productsUsed.includes(p.id));

            return (
              <div key={post.id} className="bg-white border border-gray-100 rounded-lg overflow-hidden shadow-sm hover:shadow-md transition flex flex-col">
                {/* Header */}
                <div className="p-4 flex items-center space-x-3">
                  <div className="w-8 h-8 rounded-full bg-gray-200 flex items-center justify-center text-xs font-bold text-gray-500">
                    {post.user.substring(1, 3).toUpperCase()}
                  </div>
                  <span className="text-sm font-medium">{post.user}</span>
                </div>

                {/* Image */}
                <div className="aspect-[4/5] bg-gray-100 relative group">
                  <img
                    src={post.image}
                    alt="OOTD"
                    onError={handleImageError}
                    className="w-full h-full object-cover"
                  />
                  {/* Quick Like Overlay (Double tap simulation could go here) */}
                </div>

                {/* Actions */}
                <div className="p-4 flex-grow flex flex-col">
                  <div className="flex items-center space-x-4 mb-3">
                    <button
                      onClick={() => handleLike(post.id)}
                      className="transition-transform active:scale-90"
                    >
                      <Heart
                        size={24}
                        className={`transition ${post.isLiked ? 'fill-red-500 text-red-500' : 'text-gray-700 hover:text-gray-900'}`}
                      />
                    </button>
                    <button
                      onClick={() => toggleCommentSection(post.id)}
                      className="text-gray-700 hover:text-gray-900"
                    >
                      <MessageCircle size={24} />
                    </button>
                  </div>

                  <div className="text-sm font-bold mb-2">좋아요 {post.likes}개</div>

                  <div className="mb-4">
                    <p className="text-sm text-gray-700">
                      <span className="font-bold mr-2">{post.user}</span>
                      {post.caption}
                    </p>
                  </div>

                  {/* Comments Section */}
                  {activeCommentId === post.id && (
                    <div className="mt-2 mb-4 animate-fade-in">
                      <div className="bg-gray-50 p-3 rounded-lg mb-3 max-h-40 overflow-y-auto">
                        {post.comments && post.comments.length > 0 ? (
                          post.comments.map((comment, idx) => (
                            <div key={idx} className="text-xs mb-2 last:mb-0">
                              <span className="font-bold mr-2">{comment.user}</span>
                              <span className="text-gray-700">{comment.text}</span>
                            </div>
                          ))
                        ) : (
                          <p className="text-xs text-gray-400 text-center py-2">첫 번째 댓글을 남겨보세요!</p>
                        )}
                      </div>
                      <div className="flex gap-2">
                        <input
                          type="text"
                          value={commentText}
                          onChange={(e) => setCommentText(e.target.value)}
                          placeholder="댓글 달기..."
                          className="flex-grow text-sm border border-gray-200 rounded px-3 py-2 focus:outline-none focus:border-primary"
                          onKeyPress={(e) => e.key === 'Enter' && handleAddComment(post.id)}
                        />
                        <button
                          onClick={() => handleAddComment(post.id)}
                          disabled={!commentText.trim()}
                          className="text-primary disabled:text-gray-300"
                        >
                          <Send size={20} />
                        </button>
                      </div>
                    </div>
                  )}

                  {/* Tagged Products */}
                  {featuredProducts.length > 0 && (
                    <div className="border-t border-gray-100 pt-3 mt-auto">
                      <p className="text-xs text-gray-400 mb-2 uppercase tracking-wide">함께 착용한 아이템</p>
                      <div className="space-y-2">
                        {featuredProducts.map(fp => (
                          <Link
                            to={`/product/${fp.id}`}
                            key={fp.id}
                            className="flex items-center space-x-3 p-1 rounded hover:bg-gray-50 transition group"
                          >
                            <img
                              src={fp.image}
                              alt={fp.name}
                              onError={handleImageError}
                              className="w-8 h-8 object-cover rounded"
                            />
                            <div className="text-xs flex-grow">
                              <p className="font-medium text-gray-900 group-hover:text-primary truncate">{fp.name}</p>
                              <p className="text-gray-500">₩{fp.price.toLocaleString()}</p>
                            </div>
                          </Link>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default OOTD;
