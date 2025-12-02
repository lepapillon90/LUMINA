import React, { useState, useEffect } from 'react';
import { PRODUCTS } from '../constants';
import { Heart, MessageCircle, Plus, Send, Share2, Bookmark, ShoppingBag, UserPlus, Trophy } from 'lucide-react';
import { Link } from 'react-router-dom';
import SEO from '../components/common/SEO';
import CreatePostModal from '../components/features/posts/CreatePostModal';
import { OOTDPost } from '../types';
import { getOOTDPosts, createOOTDPost, toggleLikeOOTDPost, addCommentToOOTDPost } from '../services/ootdService';
import { useAuth, useCart } from '../contexts';
import Loading from '../components/common/Loading';
import { useGlobalModal } from '../contexts/GlobalModalContext';

const OOTD: React.FC = () => {
  const [posts, setPosts] = useState<OOTDPost[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [activeCommentId, setActiveCommentId] = useState<number | null>(null);
  const [commentText, setCommentText] = useState('');
  const [activeFilter, setActiveFilter] = useState('Latest');
  const { user } = useAuth();
  const { addToCart } = useCart();
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
    const newLikes = post.isLiked ? post.likes - 1 : post.likes + 1;
    const newIsLiked = !post.isLiked;

    setPosts(posts.map(p => p.id === post.id ? { ...p, likes: newLikes, isLiked: newIsLiked } : p));

    try {
      await toggleLikeOOTDPost(String(post.id), post.likes, post.isLiked);
    } catch (error) {
      console.error("Failed to like post:", error);
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
    }
  };

  const handleShare = (postId: number) => {
    navigator.clipboard.writeText(`${window.location.origin}/ootd/${postId}`);
    showAlert("링크가 복사되었습니다.", "공유하기");
  };

  const handleBookmark = () => {
    if (!user) return showAlert("로그인이 필요합니다.", "알림");
    showAlert("마이페이지에 저장되었습니다.", "저장 완료");
  };

  const handleFollow = (username: string) => {
    if (!user) return showAlert("로그인이 필요합니다.", "알림");
    showAlert(`${username}님을 팔로우합니다.`, "팔로우");
  };

  const handleShopAll = (products: any[]) => {
    products.forEach(p => addToCart(p, 1));
    showAlert(`${products.length}개 상품이 장바구니에 담겼습니다.`, "장바구니");
  };

  if (loading) return <Loading />;

  // Filter Logic (Mock)
  const filteredPosts = activeFilter === 'Latest' ? posts : posts; // Add real filtering logic later

  // Masonry Columns
  const leftColumn = filteredPosts.filter((_, i) => i % 2 === 0);
  const rightColumn = filteredPosts.filter((_, i) => i % 2 === 1);

  const PostCard = ({ post }: { post: OOTDPost }) => {
    const featuredProducts = PRODUCTS.filter(p => post.productsUsed.includes(p.id));
    const isBest = post.likes > 10; // Mock logic for Best Reviewer

    return (
      <div className="bg-white border border-gray-100 rounded-lg overflow-hidden shadow-sm hover:shadow-md transition flex flex-col mb-6 break-inside-avoid">
        {/* Header */}
        <div className="p-4 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 rounded-full bg-gray-200 flex items-center justify-center text-xs font-bold text-gray-500 relative">
              {post.user.substring(0, 2).toUpperCase()}
              {isBest && <div className="absolute -top-1 -right-1 bg-yellow-400 rounded-full p-0.5"><Trophy size={8} className="text-white" /></div>}
            </div>
            <div>
              <span className="text-sm font-medium block leading-none">{post.user}</span>
              <button onClick={() => handleFollow(post.user)} className="text-[10px] text-primary font-medium hover:underline flex items-center gap-0.5 mt-1">
                <UserPlus size={10} /> Follow
              </button>
            </div>
          </div>
          <div className="flex gap-2">
            <button onClick={() => handleShare(post.id)} className="text-gray-400 hover:text-black"><Share2 size={18} /></button>
            <button onClick={handleBookmark} className="text-gray-400 hover:text-black"><Bookmark size={18} /></button>
          </div>
        </div>

        {/* Image */}
        <div className="relative group">
          <img
            src={post.image}
            alt="OOTD"
            onError={handleImageError}
            className="w-full h-auto object-cover"
          />
          {isBest && (
            <div className="absolute top-4 left-4 bg-yellow-400 text-white text-xs font-bold px-2 py-1 rounded shadow-sm flex items-center gap-1">
              <Trophy size={12} /> BEST
            </div>
          )}
        </div>

        {/* Actions */}
        <div className="p-4 flex-grow flex flex-col">
          <div className="flex items-center space-x-4 mb-3">
            <button
              onClick={() => handleLike(post)}
              className="transition-transform active:scale-90 flex items-center gap-1"
            >
              <Heart
                size={24}
                className={`transition ${post.isLiked ? 'fill-red-500 text-red-500' : 'text-gray-700 hover:text-gray-900'}`}
              />
              <span className="text-sm font-medium">{post.likes}</span>
            </button>
            <button
              onClick={() => toggleCommentSection(post.id)}
              className="text-gray-700 hover:text-gray-900 flex items-center gap-1"
            >
              <MessageCircle size={24} />
              <span className="text-sm font-medium">{post.comments?.length || 0}</span>
            </button>
          </div>

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
              <div className="flex justify-between items-center mb-2">
                <p className="text-xs text-gray-400 uppercase tracking-wide">Shop the Look</p>
                {featuredProducts.length > 1 && (
                  <button
                    onClick={() => handleShopAll(featuredProducts)}
                    className="text-[10px] bg-black text-white px-2 py-1 rounded flex items-center gap-1 hover:bg-gray-800 transition"
                  >
                    <ShoppingBag size={10} /> All
                  </button>
                )}
              </div>
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
  };

  return (
    <div className="pt-24 pb-20 bg-white min-h-screen">
      <SEO title="OOTD" description="LUMINA와 함께한 고객님들의 스타일링을 확인해보세요." />

      {/* Floating Action Button */}
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

      <div className="container mx-auto px-6 max-w-6xl">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-serif mb-4">#LuminaOOTD</h1>
          <p className="text-gray-500 mb-8">당신의 빛나는 순간을 공유해주세요. @lumina_official 태그와 함께.</p>

          {/* Filter Bar */}
          <div className="flex justify-center flex-wrap gap-2">
            {['Latest', 'Popular', 'Summer', 'Winter', 'Casual', 'Formal'].map(filter => (
              <button
                key={filter}
                onClick={() => setActiveFilter(filter)}
                className={`px-4 py-2 rounded-full text-sm font-medium transition ${activeFilter === filter
                    ? 'bg-black text-white'
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                  }`}
              >
                {filter}
              </button>
            ))}
          </div>
        </div>

        {/* Masonry Grid */}
        <div className="flex flex-col md:flex-row gap-6">
          <div className="flex-1 flex flex-col gap-6">
            {leftColumn.map(post => <PostCard key={post.id} post={post} />)}
          </div>
          <div className="flex-1 flex flex-col gap-6">
            {rightColumn.map(post => <PostCard key={post.id} post={post} />)}
          </div>
        </div>

        {/* Infinite Scroll Trigger (Mock) */}
        <div className="text-center mt-12">
          <button className="px-6 py-3 border border-gray-300 rounded-full text-sm font-medium hover:bg-gray-50 transition">
            Load More
          </button>
        </div>
      </div>
    </div>
  );
};

export default OOTD;
