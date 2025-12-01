import React, { useState, useEffect } from 'react';
import {
  Home, ShoppingCart, Package, Users, MessageCircle, FileText, Palette,
  Percent, LineChart, BarChart2, Grid, Shield, Settings, LogOut
} from 'lucide-react';
import { useAuth } from '../contexts';
import { Navigate } from 'react-router-dom';
import {
  User, UserRole, Product, Order, Customer, Banner, Promotion, UserPermissions
} from '../types';

import { getAllOrders } from '../services/orderService';

// Import extracted components
import Dashboard from '../components/Admin/Dashboard/Dashboard';
import OrderManager from '../components/Admin/Orders/OrderManager';
import ProductManager from '../components/Admin/Products/ProductManager';
import CustomerManager from '../components/Admin/Customers/CustomerManager';
import SystemManager from '../components/Admin/System/SystemManager';
import DesignManager from '../components/Admin/Design/DesignManager';

// --- Main Admin Component ---

type Tab = 'home' | 'orders' | 'products' | 'customers' | 'messages' | 'board' | 'design' | 'promotion' | 'analytics' | 'stats' | 'excel' | 'system';

const MENU_ITEMS = [
  { id: 'home', label: '홈', icon: Home, permission: null },
  { id: 'orders', label: '주문', icon: ShoppingCart, permission: 'orders' },
  { id: 'products', label: '상품', icon: Package, permission: 'products' },
  { id: 'customers', label: '고객', icon: Users, permission: 'customers' },
  { id: 'messages', label: '메시지', icon: MessageCircle, permission: null },
  { id: 'board', label: '게시판', icon: FileText, permission: null },
  { id: 'design', label: '디자인', icon: Palette, permission: null },
  { id: 'promotion', label: '프로모션', icon: Percent, permission: null },
  { id: 'analytics', label: '애널리틱스', icon: LineChart, permission: 'analytics' },
  { id: 'stats', label: '통계', icon: BarChart2, permission: 'analytics' },
  { id: 'excel', label: '통합엑셀', icon: Grid, permission: null },
  { id: 'system', label: '시스템 관리', icon: Shield, permission: 'system' },
];

const Admin: React.FC = () => {
  const { user, logout, loading } = useAuth();
  const [activeTab, setActiveTab] = useState<Tab>('home');

  // Data State - ProductManager will fetch from Firestore
  const [products, setProducts] = useState<Product[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [customers, setCustomers] = useState<Customer[]>([]);

  useEffect(() => {
    if (activeTab === 'orders') {
      const fetchOrders = async () => {
        try {
          const data = await getAllOrders();
          setOrders(data);
        } catch (error) {
          console.error("Failed to fetch orders:", error);
        }
      };
      fetchOrders();
    }
  }, [activeTab]);

  // Design & Promotion State
  const [banners, setBanners] = useState<Banner[]>([
    { id: 1, imageUrl: 'https://picsum.photos/1200/400?random=1', link: '/promotion/winter', startDate: '2023-11-01', endDate: '2023-12-31', isActive: true, position: 'main_hero', title: 'Winter Collection' },
    { id: 2, imageUrl: 'https://picsum.photos/1200/400?random=2', link: '/new-arrivals', startDate: '2023-11-15', endDate: '2023-12-15', isActive: true, position: 'main_hero', title: 'New Arrivals' },
  ]);
  const [promotions, setPromotions] = useState<Promotion[]>([
    { id: 1, title: '겨울 시즌 오프', description: '최대 50% 할인', bannerImage: 'https://picsum.photos/800/400?random=3', productIds: [1, 3, 5], startDate: '2023-12-01', endDate: '2023-12-31', isActive: true }
  ]);

  // Drag & Drop State
  const [draggedItemIndex, setDraggedItemIndex] = useState<number | null>(null);

  const handleDragStart = (index: number) => {
    setDraggedItemIndex(index);
  };

  const handleDragOver = (e: React.DragEvent, index: number) => {
    e.preventDefault();
    if (draggedItemIndex === null || draggedItemIndex === index) return;

    const newProducts = [...products];
    const draggedItem = newProducts[draggedItemIndex];
    newProducts.splice(draggedItemIndex, 1);
    newProducts.splice(index, 0, draggedItem);

    setProducts(newProducts);
    setDraggedItemIndex(index);
  };

  const handleDragEnd = () => {
    setDraggedItemIndex(null);
  };



  // Access Control for Inactive Admins
  if (user && user.role === UserRole.ADMIN && user.isActive === false) {
    return (
      <div className="flex items-center justify-center h-screen bg-gray-100">
        <div className="bg-white p-8 rounded-lg shadow-md text-center">
          <Shield size={48} className="mx-auto text-red-500 mb-4" />
          <h1 className="text-2xl font-bold text-gray-800 mb-2">계정 비활성화</h1>
          <p className="text-gray-600 mb-6">관리자 계정이 비활성화되었습니다. 관리자에게 문의하세요.</p>
          <button onClick={logout} className="px-4 py-2 bg-gray-800 text-white rounded hover:bg-gray-700">
            로그아웃
          </button>
        </div>
      </div>
    );
  }

  if (loading) {
    return <div className="flex items-center justify-center min-h-screen"><div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-gray-900"></div></div>;
  }

  if (!user || user.role !== UserRole.ADMIN) {
    return <Navigate to="/login" replace />;
  }

  // Render Placeholder
  const renderPlaceholder = (title: string) => (
    <div className="h-[60vh] flex flex-col items-center justify-center text-gray-400">
      <Settings size={48} className="mb-4 text-gray-300" />
      <h2 className="text-xl font-bold text-gray-600 mb-2">{title}</h2>
      <p>해당 기능은 현재 준비 중입니다.</p>
    </div>
  );

  // Filter menu items based on permissions
  const filteredMenuItems = MENU_ITEMS.filter(item => {
    if (!item.permission) return true;
    if (!user?.permissions) return true;
    return user.permissions[item.permission as keyof UserPermissions];
  });

  return (
    <div className="flex h-screen bg-gray-50 font-sans text-gray-900">
      {/* Sidebar */}
      <aside className="w-64 bg-white border-r border-gray-200 flex flex-col z-20">
        <div className="h-16 flex items-center px-6 border-b border-gray-100">
          <h1 className="text-xl font-serif font-bold tracking-wider">LUMINA ADMIN</h1>
        </div>

        <nav className="flex-1 overflow-y-auto py-4">
          <ul className="space-y-1 px-3">
            {filteredMenuItems.map((item) => {
              const Icon = item.icon;
              const isActive = activeTab === item.id;
              return (
                <li key={item.id}>
                  <button
                    onClick={() => setActiveTab(item.id as Tab)}
                    className={`w-full flex items-center space-x-3 px-3 py-2.5 rounded-sm transition-all duration-200
                      ${isActive
                        ? 'bg-gray-50 text-black font-bold border-l-2 border-black'
                        : 'text-gray-500 hover:bg-gray-50 hover:text-gray-900'}`}
                  >
                    <Icon size={18} strokeWidth={isActive ? 2.5 : 2} />
                    <span>{item.label}</span>
                  </button>
                </li>
              );
            })}
          </ul>
        </nav>

        <div className="p-4 border-t border-gray-100">
          <div className="flex items-center gap-3 mb-4 px-2">
            <div className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center text-gray-600 font-bold">
              {user?.username?.[0] || 'A'}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-gray-900 truncate">{user?.username}</p>
              <p className="text-xs text-gray-500 truncate">{user?.email}</p>
            </div>
          </div>
          <button
            onClick={logout}
            className="w-full flex items-center justify-center space-x-2 px-4 py-2 border border-gray-200 rounded-sm text-sm text-gray-600 hover:bg-gray-50 transition"
          >
            <LogOut size={16} />
            <span>로그아웃</span>
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 overflow-y-auto">
        <div className="p-8">
          {activeTab === 'home' && <Dashboard orders={orders} products={products} />}
          {activeTab === 'orders' && <OrderManager orders={orders} setOrders={setOrders} />}
          {activeTab === 'products' && <ProductManager products={products} setProducts={setProducts} />}
          {activeTab === 'customers' && <CustomerManager customers={customers} setCustomers={setCustomers} />}
          {activeTab === 'system' && <SystemManager user={user} />}
          {activeTab === 'design' && (
            <DesignManager
              banners={banners}
              setBanners={setBanners}
              promotions={promotions}
              setPromotions={setPromotions}
              products={products}
              onDragStart={handleDragStart}
              onDragOver={handleDragOver}
              onDragEnd={handleDragEnd}
              draggedItemIndex={draggedItemIndex}
            />
          )}
          {activeTab === 'messages' && renderPlaceholder('메시지 관리')}
          {activeTab === 'board' && renderPlaceholder('게시판 관리')}
          {activeTab === 'promotion' && renderPlaceholder('프로모션 관리')}
          {activeTab === 'analytics' && renderPlaceholder('애널리틱스')}
          {activeTab === 'stats' && renderPlaceholder('통계')}
          {activeTab === 'excel' && renderPlaceholder('통합엑셀')}
        </div>
      </main>


    </div>
  );
};

export default Admin;
