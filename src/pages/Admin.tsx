import React, { useState, useEffect } from 'react';
import {
  Home, ShoppingCart, Package, Users, MessageCircle, FileText,
  LineChart, BarChart2, Grid, Shield, Settings, LogOut, Menu, X, Layout, Warehouse, Calculator
} from 'lucide-react';
import { useAuth } from '../contexts';
import { Navigate, useNavigate } from 'react-router-dom';
import {
  User, UserRole, Product, Order, Customer, UserPermissions
} from '../types';

import { getAllOrders } from '../services/orderService';
import { getCustomers } from '../services/customerService';

// Import extracted components
import Dashboard from '../components/Admin/Dashboard/Dashboard';
import OrderManager from '../components/Admin/Orders/OrderManager';
import ProductManager from '../components/Admin/Products/ProductManager';
import CustomerManager from '../components/Admin/Customers/CustomerManager';

import AnalyticsManager from '../components/Admin/Analytics/AnalyticsManager';
import HomepageManager from '../components/Admin/Homepage/HomepageManager';
import AdminAccountManager from '../components/Admin/Accounts/AdminAccountManager';
import InventoryManager from '../components/Admin/Inventory/InventoryManager';
import OperationManager from '../components/Admin/Operations/OperationManager';

// --- Main Admin Component ---

type Tab = 'home' | 'orders' | 'products' | 'customers' | 'analytics' | 'excel' | 'homepage' | 'accounts' | 'inventory' | 'operations';

const MENU_ITEMS = [
  { id: 'home', label: '홈', icon: Home, permission: null },
  { id: 'homepage', label: '홈페이지 관리', icon: Layout, permission: null },
  { id: 'customers', label: '고객', icon: Users, permission: 'customers' },
  { id: 'orders', label: '주문', icon: ShoppingCart, permission: 'orders' },
  { id: 'products', label: '상품', icon: Package, permission: 'products' },
  { id: 'inventory', label: '재고', icon: Warehouse, permission: 'products' },
  { id: 'operations', label: '쇼핑몰 운영관리', icon: Calculator, permission: 'products' },
  { id: 'analytics', label: '데이터 분석', icon: LineChart, permission: 'analytics' },
  { id: 'excel', label: '통합엑셀', icon: Grid, permission: null },
  { id: 'accounts', label: '관리자 계정', icon: Shield, permission: 'system' },
];

const Admin: React.FC = () => {
  const { user, logout, loading } = useAuth();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<Tab>('home');
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const handleLogout = async () => {
    await logout();
    navigate('/');
  };

  // Data State - ProductManager will fetch from Firestore
  const [products, setProducts] = useState<Product[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [customers, setCustomers] = useState<Customer[]>([]);

  useEffect(() => {
    if (activeTab === 'home') {
      const fetchDashboardData = async () => {
        try {
          const [ordersData, customersData] = await Promise.all([
            getAllOrders(),
            getCustomers()
          ]);
          setOrders(ordersData);
          setCustomers(customersData);

          const { getProducts } = await import('../services/productService');
          const productsData = await getProducts();
          setProducts(productsData);
        } catch (error) {
          console.error("Failed to fetch dashboard data:", error);
        }
      };
      fetchDashboardData();
    } else if (activeTab === 'orders') {
      const fetchOrders = async () => {
        try {
          const data = await getAllOrders();
          setOrders(data);
        } catch (error) {
          console.error("Failed to fetch orders:", error);
        }
      };
      fetchOrders();
    } else if (activeTab === 'products') {
      const fetchProducts = async () => {
        try {
          const { getProducts } = await import('../services/productService');
          const data = await getProducts();
          setProducts(data);
        } catch (error) {
          console.error("Failed to fetch products:", error);
        }
      };
      fetchProducts();
    } else if (activeTab === 'customers') {
      const fetchCustomers = async () => {
        try {
          const data = await getCustomers();
          setCustomers(data);
        } catch (error) {
          console.error("Failed to fetch customers:", error);
        }
      };
      fetchCustomers();
    }
  }, [activeTab]);

  // Access Control for Inactive Admins
  if (user && user.role === UserRole.ADMIN && user.isActive === false) {
    return (
      <div className="flex items-center justify-center h-screen bg-gray-100">
        <div className="bg-white p-8 rounded-lg shadow-md text-center">
          <Shield size={48} className="mx-auto text-red-500 mb-4" />
          <h1 className="text-2xl font-bold text-gray-800 mb-2">계정 비활성화</h1>
          <p className="text-gray-600 mb-6">관리자 계정이 비활성화되었습니다. 관리자에게 문의하세요.</p>
          <button onClick={handleLogout} className="px-4 py-2 bg-gray-800 text-white rounded hover:bg-gray-700">
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
    <div className="flex flex-col md:flex-row h-screen bg-gray-50 font-sans text-gray-900">
      {/* Mobile Header */}
      <div className="md:hidden bg-white border-b border-gray-200 p-4 flex items-center justify-between z-30 sticky top-0">
        <h1 className="text-xl font-serif font-bold tracking-wider">LUMINA ADMIN</h1>
        <button onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)} className="text-gray-600">
          {isMobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
        </button>
      </div>

      {/* Sidebar */}
      <aside className={`
        fixed inset-y-0 left-0 z-40 w-64 bg-white border-r border-gray-200 flex flex-col transition-transform duration-300 ease-in-out md:translate-x-0 md:static md:h-screen
        ${isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full'}
      `}>
        <div className="h-16 flex items-center px-6 border-b border-gray-100 hidden md:flex">
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
                    onClick={() => {
                      setActiveTab(item.id as Tab);
                      setIsMobileMenuOpen(false);
                    }}
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
            onClick={handleLogout}
            className="w-full flex items-center justify-center space-x-2 px-4 py-2 border border-gray-200 rounded-sm text-sm text-gray-600 hover:bg-gray-50 transition"
          >
            <LogOut size={16} />
            <span>로그아웃</span>
          </button>
        </div>
      </aside>

      {/* Overlay for mobile */}
      {isMobileMenuOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-30 md:hidden"
          onClick={() => setIsMobileMenuOpen(false)}
        />
      )}

      {/* Main Content */}
      <main className="flex-1 overflow-y-auto">
        <div className="p-4 md:p-8">
          {activeTab === 'home' && <Dashboard orders={orders} products={products} customers={customers} />}
          {activeTab === 'orders' && <OrderManager orders={orders} setOrders={setOrders} user={user} />}
          {activeTab === 'products' && <ProductManager products={products} setProducts={setProducts} user={user} />}
          {activeTab === 'inventory' && <InventoryManager user={user} />}
          {activeTab === 'operations' && <OperationManager user={user} />}
          {activeTab === 'customers' && <CustomerManager user={user} customers={customers} setCustomers={setCustomers} />}
          {activeTab === 'homepage' && <HomepageManager user={user} />}
          {activeTab === 'accounts' && <AdminAccountManager user={user} />}
          {activeTab === 'analytics' && <AnalyticsManager />}
          {activeTab === 'excel' && renderPlaceholder('통합엑셀')}
        </div>
      </main>
    </div>
  );
};

export default Admin;
