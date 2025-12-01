import React, { useState, useEffect } from 'react';
import { PRODUCTS } from '../constants';
import { Heart, MessageCircle, Plus, Send } from 'lucide-react';
import { Link } from 'react-router-dom';
import SEO from '../components/common/SEO';
import CreatePostModal from '../components/features/posts/CreatePostModal';
import { OOTDPost } from '../types';
import { getOOTDPosts, createOOTDPost, toggleLikeOOTDPost, addCommentToOOTDPost } from '../services/ootdService';
import { useAuth } from '../contexts';
import Loading from '../components/common/Loading';
import { useGlobalModal } from '../contexts/GlobalModalContext';

const OOTD: React.FC = () => {
  const [posts, setPosts] = useState<OOTDPost[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [activeCommentId, setActiveCommentId] = useState<number | null>(null);
  const [commentText, setCommentText] = useState('');
  const { user } = useAuth();
  const { showAlert } = useGlobalModal();

  useEffect(() => {
    fetchPosts();
  }, []);

  const fetchPosts = async () => {
    try {
      const data = await getOOTDPosts();
      // Sort by ID desc (newest first)
      const sorted = data.sort((a, b) => b.id - a.id);
      setPosts(sorted);
    } catch (error) {
      console.error("Failed to fetch OOTD posts:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleImageError = (e: React.SyntheticEvent<HTMLImageElement, Event>) => {
    e.currentTarget.src = 'https://via.placeholder.com/400x500?text=No+Image';
  };

  const handleCreatePost = async (newPostData: Omit<OOTDPost, 'id' | 'likes' | 'user'>) => {
    if (!user) {
      await showAlert("로그인이 필요합니다.", "알림");
      return;
    }

    try {
      const postToCreate = {
        ...newPostData,
        user: user.username,
        userId: user.uid,
        likes: 0,
        comments: [],
        isLiked: false,
        productsUsed: newPostData.productsUsed || []
      };
      await createOOTDPost(postToCreate);
      await fetchPosts(); // Refresh list
      setIsModalOpen(false);
    } catch (error) {
      console.error("Failed to create post:", error);
      await showAlert("게시물 작성에 실패했습니다.", "오류");
    }
  };

  const handleLike = async (post: OOTDPost) => {
    // Optimistic update
    const newLikes = post.isLiked ? post.likes - 1 : post.likes + 1;
    const newIsLiked = !post.isLiked;

    setPosts(posts.map(p => p.id === post.id ? { ...p, likes: newLikes, isLiked: newIsLiked } : p));

    try {
      // We need the Firestore ID (string), but our type has number ID.
      // In migration, we might have mixed types or need to find the doc ID.
      // For this implementation, we assume getOOTDPosts returns objects that include the Firestore document ID if we modified the type.
      // However, our type 'OOTDPost' has 'id: number'.
      // The 'getAll' service returns '{ id: doc.id, ...data }'.
      // If we cast it to OOTDPost, 'id' becomes the string doc ID, but TS thinks it is number.
      // This is a type mismatch issue we need to solve.
      // For now, let's assume we can cast 'post.id' to string for the service call if it was fetched from DB.

      await toggleLikeOOTDPost(String(post.id), post.likes, post.isLiked);
    } catch (error) {
      console.error("Failed to like post:", error);
      // Revert on error
      setPosts(posts.map(p => p.id === post.id ? post : p));
    }
  };

  const toggleCommentSection = (postId: number) => {
    if (activeCommentId === postId) {
      setActiveCommentId(null);
    } else {
      setActiveCommentId(postId);
      setCommentText('');
    }
  };

  const handleAddComment = async (postId: number) => {
    if (!commentText.trim()) return;
    if (!user) {
      await showAlert("로그인이 필요합니다.", "알림");
      return;
    }

    const newComment = { user: user.username, text: commentText };

    // Optimistic update
    setPosts(posts.map(post => {
      if (post.id === postId) {
        return {
          ...post,
          comments: [...(post.comments || []), newComment]
        };
      }
      return post;
    }));
    setCommentText('');

    try {
      await addCommentToOOTDPost(String(postId), newComment);
    } catch (error) {
      console.error("Failed to add comment:", error);
      // We might want to revert here, but for comments it's less critical visually
    }
  };

  if (loading) return <Loading />;

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
                    {post.user.substring(0, 2).toUpperCase()}
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
                </div>

                {/* Actions */}
                <div className="p-4 flex-grow flex flex-col">
                  <div className="flex items-center space-x-4 mb-3">
                    <button
                      onClick={() => handleLike(post)}
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
