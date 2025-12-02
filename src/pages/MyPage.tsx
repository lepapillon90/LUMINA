import React, { useState, useEffect } from 'react';
import { useAuth, useGlobalModal } from '../contexts';
import { useNavigate } from 'react-router-dom';
import OrderHistory from '../components/MyPage/OrderHistory';
import Wishlist from '../components/MyPage/Wishlist';
import MyOOTD from '../components/MyPage/MyOOTD';
import RecentlyViewed from '../components/MyPage/RecentlyViewed';
import Membership from '../components/MyPage/Membership';
import Settings from '../components/MyPage/Settings';
import SEO from '../components/common/SEO';
import { User, Package, Heart, Camera, Clock, LogOut, Settings as SettingsIcon, LayoutDashboard, Gift } from 'lucide-react';
import { Order, OOTDPost, Product } from '../types';
import { PRODUCTS } from '../constants'; // Keep for fallback or other uses if needed, but we'll use real data for wishlist

import { getOrders, updateOrderStatuses } from '../services/orderService';
import { getUserOOTDPosts } from '../services/ootdService';
import { getProducts } from '../services/productService';
import { storage, db } from '../firebase';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { doc, updateDoc } from 'firebase/firestore';



const MyPage: React.FC = () => {
    const { user, logout } = useAuth();
    const navigate = useNavigate();
    const { showAlert } = useGlobalModal();
    const [activeTab, setActiveTab] = useState<'orders' | 'wishlist' | 'ootd' | 'recent' | 'membership' | 'settings'>('orders');
    const [loading, setLoading] = useState(false);
    const [orders, setOrders] = useState<Order[]>([]);
    const [ootdPosts, setOotdPosts] = useState<OOTDPost[]>([]);
    const [wishlistItems, setWishlistItems] = useState<Product[]>([]);

    useEffect(() => {
        const fetchOrders = async () => {
            if (user) {
                setLoading(true);
                try {
                    const userOrders = await getOrders(user.uid);
                    setOrders(userOrders);
                } catch (error) {
                    console.error("Failed to fetch orders:", error);
                } finally {
                    setLoading(false);
                }
            }
        };

        if (activeTab === 'orders') {
            fetchOrders();
        }
    }, [user, activeTab]);

    // Fetch OOTD Posts
    useEffect(() => {
        const fetchOOTD = async () => {
            if (user && user.username) {
                setLoading(true);
                try {
                    const posts = await getUserOOTDPosts(user.username);
                    setOotdPosts(posts);
                } catch (error) {
                    console.error("Failed to fetch OOTD posts:", error);
                } finally {
                    setLoading(false);
                }
            }
        };

        if (activeTab === 'ootd') {
            fetchOOTD();
        }
    }, [user, activeTab]);

    // Fetch Wishlist Items
    useEffect(() => {
        const fetchWishlist = async () => {
            if (user && user.wishlist && user.wishlist.length > 0) {
                setLoading(true);
                try {
                    // In a real app with many products, we should have a 'getProductsByIds' endpoint.
                    // For now, we'll fetch all and filter.
                    const allProducts = await getProducts();
                    const wished = allProducts.filter(p => user.wishlist?.includes(p.id));
                    setWishlistItems(wished);
                } catch (error) {
                    console.error("Failed to fetch wishlist items:", error);
                } finally {
                    setLoading(false);
                }
            } else {
                setWishlistItems([]);
            }
        };

        if (activeTab === 'wishlist') {
            fetchWishlist();
        }
    }, [user, activeTab]);

    // Redirect if not logged in
    useEffect(() => {
        if (!user) {
            // navigate('/login'); // Commented out for demo purposes to allow viewing layout
        }
    }, [user, navigate]);

    const handleLogout = async () => {
        await logout();
        navigate('/');
    };

    const handleCancelOrder = async (orderId: string) => {
        const order = orders.find(o => o.id === orderId);
        if (!order) return;

        try {
            let newStatus = '';
            if (order.status === '입금대기') {
                newStatus = '주문취소';
            } else if (order.status === '결제완료') {
                newStatus = '취소요청';
            } else {
                return;
            }

            await updateOrderStatuses([orderId], newStatus);
            setOrders(prev => prev.map(o => o.id === orderId ? { ...o, status: newStatus } : o));

            if (newStatus === '주문취소') {
                await showAlert('주문이 취소되었습니다.', '주문 취소');
            } else {
                await showAlert('취소 요청이 접수되었습니다. 관리자 승인 후 처리됩니다.', '취소 요청');
            }
        } catch (error) {
            console.error("Failed to cancel order:", error);
            await showAlert('주문 취소에 실패했습니다.', '오류');
        }
    };

    const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file || !user) return;

        try {
            setLoading(true);
            const storageRef = ref(storage, `profile_images/${user.uid}`);
            await uploadBytes(storageRef, file);
            const downloadURL = await getDownloadURL(storageRef);

            await updateDoc(doc(db, 'users', user.uid), {
                profileImage: downloadURL
            });

            await showAlert("프로필 이미지가 변경되었습니다. 새로고침 후 반영됩니다.", "알림");
            window.location.reload();
        } catch (error) {
            console.error("Error uploading image:", error);
            await showAlert("이미지 업로드 중 오류가 발생했습니다.", "오류");
        } finally {
            setLoading(false);
        }
    };



    return (
        <div className="pt-24 pb-20 bg-gray-50 min-h-screen">
            <SEO title="My Page" description="마이페이지" />

            <div className="container mx-auto px-6">
                <div className="flex flex-col lg:flex-row gap-8">
                    {/* Sidebar */}
                    <div className="lg:w-1/4">
                        <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
                            <div className="flex items-center space-x-4 mb-6">
                                <div className="relative group">
                                    <div className="w-16 h-16 bg-gray-200 rounded-full flex items-center justify-center overflow-hidden border border-gray-100">
                                        {user?.profileImage ? (
                                            <img src={user.profileImage} alt="Profile" className="w-full h-full object-cover" />
                                        ) : (
                                            <User size={32} className="text-gray-400" />
                                        )}
                                    </div>
                                    <label className="absolute bottom-0 right-0 bg-white rounded-full p-1.5 shadow-md cursor-pointer border border-gray-200 hover:bg-gray-50 transition-colors">
                                        <Camera size={14} className="text-gray-600" />
                                        <input type="file" className="hidden" accept="image/*" onChange={handleImageUpload} />
                                    </label>
                                </div>
                                <div>
                                    <h2 className="text-lg font-serif font-bold text-primary">{user?.displayName || user?.username || 'Guest User'}</h2>
                                    <p className="text-sm text-gray-500">{user?.role === 'ADMIN' ? 'Administrator' : 'Member'}</p>
                                </div>
                            </div>

                            <nav className="space-y-1">
                                {user?.role === 'ADMIN' && (
                                    <button
                                        onClick={() => navigate('/admin')}
                                        className="w-full flex items-center space-x-3 px-4 py-3 rounded-md transition-colors text-blue-600 hover:bg-blue-50 mb-2 border border-blue-100"
                                    >
                                        <LayoutDashboard size={18} />
                                        <span className="font-bold">관리자 대시보드</span>
                                    </button>
                                )}
                                <button
                                    onClick={() => setActiveTab('orders')}
                                    className={`w-full flex items-center space-x-3 px-4 py-3 rounded-md transition-colors ${activeTab === 'orders' ? 'bg-primary text-white' : 'text-gray-600 hover:bg-gray-50'}`}
                                >
                                    <Package size={18} />
                                    <span className="font-medium">주문 내역</span>
                                </button>
                                <button
                                    onClick={() => setActiveTab('membership')}
                                    className={`w-full flex items-center space-x-3 px-4 py-3 rounded-md transition-colors ${activeTab === 'membership' ? 'bg-primary text-white' : 'text-gray-600 hover:bg-gray-50'}`}
                                >
                                    <Gift size={18} />
                                    <span className="font-medium">멤버십 & 혜택</span>
                                </button>
                                <button
                                    onClick={() => setActiveTab('wishlist')}
                                    className={`w-full flex items-center space-x-3 px-4 py-3 rounded-md transition-colors ${activeTab === 'wishlist' ? 'bg-primary text-white' : 'text-gray-600 hover:bg-gray-50'}`}
                                >
                                    <Heart size={18} />
                                    <span className="font-medium">위시리스트</span>
                                </button>
                                <button
                                    onClick={() => setActiveTab('ootd')}
                                    className={`w-full flex items-center space-x-3 px-4 py-3 rounded-md transition-colors ${activeTab === 'ootd' ? 'bg-primary text-white' : 'text-gray-600 hover:bg-gray-50'}`}
                                >
                                    <Camera size={18} />
                                    <span className="font-medium">My OOTD</span>
                                </button>
                                <button
                                    onClick={() => setActiveTab('recent')}
                                    className={`w-full flex items-center space-x-3 px-4 py-3 rounded-md transition-colors ${activeTab === 'recent' ? 'bg-primary text-white' : 'text-gray-600 hover:bg-gray-50'}`}
                                >
                                    <Clock size={18} />
                                    <span className="font-medium">최근 본 상품</span>
                                </button>
                            </nav>

                            <div className="border-t border-gray-100 mt-6 pt-6 space-y-1">
                                <button
                                    onClick={() => setActiveTab('settings')}
                                    className={`w-full flex items-center space-x-3 px-4 py-3 rounded-md transition-colors ${activeTab === 'settings' ? 'bg-primary text-white' : 'text-gray-600 hover:bg-gray-50'}`}
                                >
                                    <SettingsIcon size={18} />
                                    <span className="font-medium">계정 설정</span>
                                </button>
                                <button
                                    onClick={handleLogout}
                                    className="w-full flex items-center space-x-3 px-4 py-3 text-red-500 hover:bg-red-50 rounded-md transition-colors"
                                >
                                    <LogOut size={18} />
                                    <span className="font-medium">로그아웃</span>
                                </button>
                            </div>
                        </div>
                    </div>

                    {/* Main Content */}
                    <div className="lg:w-3/4">
                        <div className="bg-white rounded-lg shadow-sm p-8 min-h-[600px]">
                            <h2 className="text-2xl font-serif text-primary mb-8 pb-4 border-b border-gray-100">
                                {activeTab === 'orders' && '주문 내역'}
                                {activeTab === 'membership' && '멤버십 & 혜택'}
                                {activeTab === 'wishlist' && '위시리스트'}
                                {activeTab === 'ootd' && 'My OOTD'}
                                {activeTab === 'recent' && '최근 본 상품'}
                                {activeTab === 'settings' && '계정 설정'}
                            </h2>

                            {activeTab === 'orders' && <OrderHistory orders={orders.filter(o => o.status !== '주문취소')} loading={loading} onCancelOrder={handleCancelOrder} />}
                            {activeTab === 'membership' && <Membership />}
                            {activeTab === 'wishlist' && <Wishlist items={wishlistItems} loading={loading} />}
                            {activeTab === 'ootd' && <MyOOTD posts={ootdPosts} loading={loading} />}
                            {activeTab === 'recent' && <RecentlyViewed />}
                            {activeTab === 'settings' && <Settings />}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default MyPage;
