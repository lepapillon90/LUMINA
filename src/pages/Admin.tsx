import React, { useState, useEffect } from 'react';
import {
  Home, ShoppingCart, Package, Users, MessageCircle, FileText, Palette,
  Percent, LineChart, BarChart2, Grid, Shield, Settings, LogOut,
  Plus, Edit3, Trash2, Search, MoreHorizontal, Printer,
  ExternalLink, HelpCircle, ImageIcon, Link as LinkIcon, Calendar,
  GripVertical, Maximize2, ArrowDown
} from 'lucide-react';
import { useAuth } from '../contexts';
import { Navigate } from 'react-router-dom';
import {
  User, UserRole, Product, Order, Customer, Banner, Promotion, UserPermissions
} from '../types';
import {
  getAdminUsers, toggleAdminStatus, deleteAdminUser,
  updateAdminUser, createAdminUser, promoteToAdmin, sendAdminPasswordReset, changeOwnPassword
} from '../services/adminService';

// --- Mock Data ---
const PRODUCTS: Product[] = [
  { id: 1, name: 'Premium Silk Blouse', price: 120000, category: 'clothing', image: 'https://picsum.photos/200/300?random=1', description: 'Soft silk blouse', tags: ['silk', 'blouse'], stock: 50 },
  { id: 2, name: 'Leather Crossbody Bag', price: 250000, category: 'bags', image: 'https://picsum.photos/200/300?random=2', description: 'Genuine leather bag', tags: ['leather', 'bag'], stock: 20 },
  { id: 3, name: 'Gold Plated Earrings', price: 45000, category: 'jewelry', image: 'https://picsum.photos/200/300?random=3', description: 'Elegant earrings', tags: ['gold', 'earrings'], stock: 100 },
  { id: 4, name: 'Summer Floral Dress', price: 89000, category: 'clothing', image: 'https://picsum.photos/200/300?random=4', description: 'Light summer dress', tags: ['summer', 'dress'], stock: 5 },
  { id: 5, name: 'Classic Denim Jacket', price: 110000, category: 'clothing', image: 'https://picsum.photos/200/300?random=5', description: 'Vintage style jacket', tags: ['denim', 'jacket'], stock: 30 },
];

const INITIAL_ORDERS: Order[] = [
  { id: 'ORD-2023-001', userId: 'user1', customerName: '김지수', total: 120000, status: '배송중', date: '2023-11-28', items: [] },
  { id: 'ORD-2023-002', userId: 'user2', customerName: '이민호', total: 45000, status: '결제완료', date: '2023-11-28', items: [] },
  { id: 'ORD-2023-003', userId: 'user3', customerName: '박서준', total: 250000, status: '입금대기', date: '2023-11-27', items: [] },
  { id: 'ORD-2023-004', userId: 'user4', customerName: '최유리', total: 89000, status: '배송완료', date: '2023-11-26', items: [] },
  { id: 'ORD-2023-005', userId: 'user5', customerName: '정우성', total: 110000, status: '결제완료', date: '2023-11-28', items: [] },
];

const INITIAL_CUSTOMERS: Customer[] = [
  { id: 'cust_1', name: '김지수', email: 'jisoo@example.com', phone: '010-1234-5678', joinDate: '2023-01-15', totalSpent: 1200000, grade: 'VIP', lastLoginDate: '2023-11-28', status: 'active' },
  { id: 'cust_2', name: '이민호', email: 'minho@example.com', phone: '010-2345-6789', joinDate: '2023-03-20', totalSpent: 450000, grade: 'Gold', lastLoginDate: '2023-11-25', status: 'active' },
  { id: 'cust_3', name: '박서준', email: 'seojun@example.com', phone: '010-3456-7890', joinDate: '2023-05-10', totalSpent: 150000, grade: 'Silver', lastLoginDate: '2023-10-15', status: 'inactive' },
  { id: 'cust_4', name: '최유리', email: 'yuri@example.com', phone: '010-4567-8901', joinDate: '2023-07-01', totalSpent: 89000, grade: 'Bronze', lastLoginDate: '2023-11-20', status: 'active' },
  { id: 'cust_5', name: '정우성', email: 'woosung@example.com', phone: '010-5678-9012', joinDate: '2023-09-15', totalSpent: 0, grade: 'Bronze', lastLoginDate: '2023-11-28', status: 'active' },
];

// --- Sub-Components ---

const DailySalesStats = () => (
  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
    <div className="bg-white p-4 rounded-lg border border-gray-200 shadow-sm">
      <p className="text-xs text-gray-500 mb-1">오늘 매출</p>
      <p className="text-2xl font-bold text-gray-900">₩1,250,000</p>
      <p className="text-xs text-green-500 mt-1">▲ 12% (어제 대비)</p>
    </div>
    <div className="bg-white p-4 rounded-lg border border-gray-200 shadow-sm">
      <p className="text-xs text-gray-500 mb-1">이번 주 매출</p>
      <p className="text-2xl font-bold text-gray-900">₩8,450,000</p>
      <p className="text-xs text-green-500 mt-1">▲ 5% (지난주 대비)</p>
    </div>
    <div className="bg-white p-4 rounded-lg border border-gray-200 shadow-sm">
      <p className="text-xs text-gray-500 mb-1">이번 달 매출</p>
      <p className="text-2xl font-bold text-gray-900">₩32,150,000</p>
      <p className="text-xs text-red-500 mt-1">▼ 2% (지난달 대비)</p>
    </div>
  </div>
);

const OrderProcessingStats = () => (
  <div className="bg-white p-6 rounded-lg border border-gray-200 shadow-sm mb-6">
    <h3 className="font-bold text-gray-800 mb-4">주문 처리 현황</h3>
    <div className="grid grid-cols-5 gap-4 text-center">
      <div>
        <p className="text-gray-500 text-xs mb-1">입금대기</p>
        <p className="text-xl font-bold text-gray-900">5</p>
      </div>
      <div>
        <p className="text-gray-500 text-xs mb-1">결제완료</p>
        <p className="text-xl font-bold text-gray-900">12</p>
      </div>
      <div>
        <p className="text-gray-500 text-xs mb-1">배송준비</p>
        <p className="text-xl font-bold text-gray-900">8</p>
      </div>
      <div>
        <p className="text-gray-500 text-xs mb-1">배송중</p>
        <p className="text-xl font-bold text-gray-900">15</p>
      </div>
      <div>
        <p className="text-gray-500 text-xs mb-1">배송완료</p>
        <p className="text-xl font-bold text-gray-900">42</p>
      </div>
    </div>
  </div>
);

const MemberPointsStats = () => (
  <div className="bg-white p-6 rounded-lg border border-gray-200 shadow-sm mb-6">
    <h3 className="font-bold text-gray-800 mb-4">회원 적립금 현황</h3>
    <div className="flex justify-between items-center">
      <div>
        <p className="text-gray-500 text-xs mb-1">총 지급 적립금</p>
        <p className="text-xl font-bold text-blue-600">5,240,000 P</p>
      </div>
      <div>
        <p className="text-gray-500 text-xs mb-1">사용된 적립금</p>
        <p className="text-xl font-bold text-red-600">1,120,000 P</p>
      </div>
      <div>
        <p className="text-gray-500 text-xs mb-1">잔여 적립금</p>
        <p className="text-xl font-bold text-gray-900">4,120,000 P</p>
      </div>
    </div>
  </div>
);

const InvoiceModal = ({ orders, onClose }: { orders: Order[], onClose: () => void }) => (
  <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4 backdrop-blur-sm">
    <div className="bg-white rounded-lg shadow-2xl max-w-2xl w-full p-6 max-h-[90vh] overflow-y-auto">
      <div className="flex justify-between items-center mb-6 border-b pb-4">
        <h2 className="text-xl font-bold text-gray-800">송장 출력</h2>
        <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
          <span className="sr-only">Close</span>
          <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
        </button>
      </div>
      <div className="space-y-4">
        {orders.map(order => (
          <div key={order.id} className="border p-4 rounded-sm">
            <div className="flex justify-between mb-2">
              <span className="font-bold">주문번호: {order.id}</span>
              <span className="text-gray-500">{order.date}</span>
            </div>
            <div className="text-sm text-gray-600">
              <p>받는사람: {order.customerName}</p>
              <p>금액: ₩{order.total.toLocaleString()}</p>
            </div>
          </div>
        ))}
      </div>
      <div className="mt-6 flex justify-end gap-2">
        <button onClick={onClose} className="px-4 py-2 border border-gray-300 rounded-sm hover:bg-gray-50">취소</button>
        <button onClick={() => { alert('출력되었습니다.'); onClose(); }} className="px-4 py-2 bg-blue-600 text-white rounded-sm hover:bg-blue-700">인쇄하기</button>
      </div>
    </div>
  </div>
);

const ConfirmModal = ({ isOpen, onClose, onConfirm, title, message, isDestructive, confirmLabel = '확인', cancelLabel = '취소' }: any) => {
  if (!isOpen) return null;
  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4 backdrop-blur-sm">
      <div className="bg-white rounded-lg shadow-xl max-w-sm w-full p-6">
        <h3 className={`text-lg font-bold mb-2 ${isDestructive ? 'text-red-600' : 'text-gray-900'}`}>{title}</h3>
        <p className="text-gray-600 mb-6 text-sm">{message}</p>
        <div className="flex justify-end gap-2">
          <button onClick={onClose} className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-sm text-sm">{cancelLabel}</button>
          <button
            onClick={onConfirm}
            className={`px-4 py-2 text-white rounded-sm text-sm ${isDestructive ? 'bg-red-600 hover:bg-red-700' : 'bg-blue-600 hover:bg-blue-700'}`}
          >
            {confirmLabel}
          </button>
        </div>
      </div>
    </div>
  );
};

const PostStats = () => {
  const categories = [
    '공지사항', '상품 사용후기', '상품 Q&A', '자유게시판',
    '갤러리', '뉴스/이벤트', '이용안내 FAQ', '자료실'
  ];

  const dates = [
    { label: '11월 28일', isToday: true, values: [0, 0, 0, 0, 0, 0, 0, 0] },
    { label: '11월 27일', values: [0, 0, 0, 0, 0, 0, 0, 0] },
    { label: '11월 26일', values: [0, 0, 0, 0, 0, 0, 0, 0] },
    { label: '11월 25일', values: [0, 0, 0, 0, 0, 0, 0, 0] },
    { label: '11월 24일', values: [0, 0, 0, 0, 0, 0, 0, 0] },
    { label: '11월 23일', values: [0, 0, 0, 0, 0, 0, 0, 0] },
    { label: '11월 22일', values: [1, 0, 0, 0, 0, 0, 0, 0] },
  ];

  // Calculate totals
  const totals = categories.map((_, idx) =>
    dates.reduce((acc, curr) => acc + curr.values[idx], 0)
  );

  return (
    <div className="mt-4">
      <div className="overflow-x-auto">
        <table className="w-full text-sm text-center min-w-[1000px]">
          <thead className="text-gray-500 border-b border-gray-100">
            <tr>
              <th className="py-3 font-normal text-left pl-4 flex items-center gap-1 cursor-pointer w-32 whitespace-nowrap">
                날짜 <ArrowDown size={12} />
              </th>
              {categories.map((cat, idx) => (
                <th key={idx} className="py-3 font-normal whitespace-nowrap px-2">{cat}</th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-50">
            {/* Summary Row */}
            <tr className="bg-[#f0f9ff]/50 font-bold text-gray-800">
              <td className="py-4 text-left pl-4">합계</td>
              {totals.map((t, idx) => (
                <td key={idx}>{t}</td>
              ))}
            </tr>

            {/* Date Rows */}
            {dates.map((row, idx) => (
              <tr key={idx} className="hover:bg-gray-50 transition group">
                <td className="py-4 text-left pl-4 font-medium text-gray-600 flex items-center whitespace-nowrap">
                  {row.label}
                  {row.isToday && <span className="ml-2 bg-blue-500 text-white text-[10px] px-1.5 py-0.5 rounded-sm font-light">오늘</span>}
                </td>
                {row.values.map((val, vIdx) => (
                  <td key={vIdx} className={val > 0 ? "font-bold text-gray-800" : "text-gray-400"}>
                    {val}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="flex justify-end mt-4">
        <button className="flex items-center gap-1 px-3 py-1.5 border border-gray-300 rounded bg-white text-xs font-medium hover:bg-gray-50 text-gray-700">
          <Settings size={12} />
          게시물 현황 설정
        </button>
      </div>
    </div>
  );
};

// Real-time Visitor Chart (Mixed Bar & Line)
const RealTimeChart = () => {
  const categories = ['메인', '상품목록', '상품상세', '장바구니', '주문작성', '결제완료', '게시판', '기타'];
  const data = [
    { page: '메인', total: 45, mobile: 30, pc: 15 },
    { page: '상품목록', total: 12, mobile: 8, pc: 4 },
    { page: '상품상세', total: 28, mobile: 20, pc: 8 },
    { page: '장바구니', total: 5, mobile: 3, pc: 2 },
    { page: '주문작성', total: 2, mobile: 1, pc: 1 },
    { page: '결제완료', total: 1, mobile: 1, pc: 0 },
    { page: '게시판', total: 3, mobile: 2, pc: 1 },
    { page: '기타', total: 4, mobile: 3, pc: 1 },
  ];
  const maxVal = 50;

  return (
    <div className="w-full h-64 relative mt-4">
      <div className="absolute inset-0 flex flex-col justify-between text-xs text-gray-300 pointer-events-none z-0">
        {[...Array(5)].map((_, i) => (
          <div key={i} className="w-full border-b border-gray-100 h-0 flex items-center">
            <span className="ml-[-20px] absolute">{maxVal - (i * (maxVal / 4))}</span>
          </div>
        ))}
        <div className="w-full border-b border-gray-200 h-0">
          <span className="ml-[-20px] absolute">0</span>
        </div>
      </div>

      <div className="absolute inset-0 flex items-end justify-around pl-4 z-10">
        {data.map((item, idx) => (
          <div key={idx} className="flex flex-col items-center w-full h-full justify-end group">
            {/* Tooltip */}
            <div className="hidden group-hover:block absolute bottom-full mb-2 bg-gray-800 text-white text-xs p-2 rounded z-50">
              {item.page}: {item.total}명 (M:{item.mobile}/PC:{item.pc})
            </div>

            {/* Total Bar */}
            <div
              className="w-4 bg-sky-400 rounded-t-sm opacity-80 hover:opacity-100 transition-all relative"
              style={{ height: `${(item.total / maxVal) * 100}%` }}
            >
              {/* PC Line Point (Simulated) */}
              <div
                className="absolute w-2 h-2 bg-purple-500 rounded-full border-2 border-white -ml-3"
                style={{ bottom: `${(item.pc / item.total) * 100}%`, left: '50%' }}
              />
              {/* Mobile Line Point (Simulated) */}
              <div
                className="absolute w-2 h-2 bg-pink-500 rounded-full border-2 border-white ml-1"
                style={{ bottom: `${(item.mobile / item.total) * 100}%`, left: '50%' }}
              />
            </div>
            <span className="text-[10px] text-gray-500 mt-2">{item.page}</span>
          </div>
        ))}
      </div>

      {/* Legend */}
      <div className="absolute -bottom-8 left-0 right-0 flex justify-center space-x-4 text-xs">
        <div className="flex items-center"><span className="w-2 h-2 bg-sky-400 mr-1"></span>전체</div>
        <div className="flex items-center"><span className="w-2 h-2 bg-pink-500 rounded-full mr-1"></span>Mobile</div>
        <div className="flex items-center"><span className="w-2 h-2 bg-purple-500 rounded-full mr-1"></span>PC</div>
      </div>
    </div>
  );
};

// Daily Visitor Bar Chart
const DailyVisitorChart = () => {
  const dates = ['11-21', '11-22', '11-23', '11-24', '11-25', '11-26', '11-27'];
  const data = [120, 150, 180, 140, 160, 210, 350];
  const maxVal = 400;

  return (
    <div className="w-full h-64 relative mt-4">
      <div className="absolute inset-0 flex flex-col justify-between text-xs text-gray-300 pointer-events-none">
        {[...Array(5)].map((_, i) => (
          <div key={i} className="w-full border-b border-gray-100 h-0 flex items-center">
            <span className="ml-[-25px] absolute">{maxVal - (i * 100)}</span>
          </div>
        ))}
        <div className="w-full border-b border-gray-200 h-0">
          <span className="ml-[-25px] absolute">0</span>
        </div>
      </div>

      <div className="absolute inset-0 flex items-end justify-around pl-4 z-10">
        {data.map((val, idx) => (
          <div key={idx} className="flex flex-col items-center w-full group">
            <div
              className="w-6 bg-[#6cdad8] rounded-t-sm hover:bg-[#5bcac8] transition-all relative group"
              style={{ height: `${(val / maxVal) * 100}%` }}
            >
              <div className="opacity-0 group-hover:opacity-100 absolute -top-6 left-1/2 -translate-x-1/2 text-xs font-bold text-[#6cdad8]">
                {val}
              </div>
            </div>
            <span className="text-[10px] text-gray-500 mt-2">{dates[idx]}</span>
          </div>
        ))}
      </div>

      {/* Legend */}
      <div className="absolute -bottom-8 left-0 right-0 flex justify-center text-xs">
        <div className="flex items-center"><span className="w-2 h-2 bg-[#6cdad8] mr-1"></span>방문자 수</div>
      </div>
    </div>
  );
};


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
  const [dashboardSubTab, setDashboardSubTab] = useState('daily');

  // System Tab State
  const [adminUsers, setAdminUsers] = useState<User[]>([]);
  const [isUserModalOpen, setIsUserModalOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<User | null>(null);

  // Data State
  const [products, setProducts] = useState<Product[]>(PRODUCTS);
  const [orders, setOrders] = useState<Order[]>(INITIAL_ORDERS);
  const [customers, setCustomers] = useState<Customer[]>(INITIAL_CUSTOMERS);
  const [customerFilter, setCustomerFilter] = useState<'all' | 'vip' | 'at_risk' | 'potential'>('all');

  // Design & Promotion State
  const [banners, setBanners] = useState<Banner[]>([
    { id: 1, imageUrl: 'https://picsum.photos/1200/400?random=1', link: '/promotion/winter', startDate: '2023-11-01', endDate: '2023-12-31', isActive: true, position: 'main_hero', title: 'Winter Collection' },
    { id: 2, imageUrl: 'https://picsum.photos/1200/400?random=2', link: '/new-arrivals', startDate: '2023-11-15', endDate: '2023-12-15', isActive: true, position: 'main_hero', title: 'New Arrivals' },
  ]);
  const [promotions, setPromotions] = useState<Promotion[]>([
    { id: 1, title: '겨울 시즌 오프', description: '최대 50% 할인', bannerImage: 'https://picsum.photos/800/400?random=3', productIds: [1, 3, 5], startDate: '2023-12-01', endDate: '2023-12-31', isActive: true }
  ]);
  const [isBannerModalOpen, setIsBannerModalOpen] = useState(false);
  const [isPromotionModalOpen, setIsPromotionModalOpen] = useState(false);
  const [editingBanner, setEditingBanner] = useState<Banner | null>(null);
  const [editingPromotion, setEditingPromotion] = useState<Promotion | null>(null);

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

  // Modal State
  const [isProductModalOpen, setIsProductModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [previewImage, setPreviewImage] = useState<string>('');
  const [additionalImages, setAdditionalImages] = useState<string[]>([]);

  // Description Block Editor State
  type DescriptionBlock = { id: string; type: 'text' | 'image'; content: string };
  const [descriptionBlocks, setDescriptionBlocks] = useState<DescriptionBlock[]>([]);

  useEffect(() => {
    if (isProductModalOpen) {
      setPreviewImage(editingProduct?.image || 'https://picsum.photos/600/750');
      // In a real app, we would load existing additional images here
      setAdditionalImages([]);

      // Parse existing description into blocks (Simple heuristic)
      if (editingProduct?.description) {
        // If it looks like our HTML format (contains <p> or <img), try to parse
        // For now, simple fallback: one text block
        setDescriptionBlocks([{ id: Date.now().toString(), type: 'text', content: editingProduct.description }]);
      } else {
        setDescriptionBlocks([{ id: Date.now().toString(), type: 'text', content: '' }]);
      }
    }
  }, [isProductModalOpen, editingProduct]);

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const url = URL.createObjectURL(file);
      setPreviewImage(url);
    }
  };

  const handleAddAdditionalImage = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const url = URL.createObjectURL(file);
      setAdditionalImages(prev => [...prev, url]);
    }
  };

  const handleRemoveAdditionalImage = (index: number) => {
    setAdditionalImages(prev => prev.filter((_, i) => i !== index));
  };

  // Block Editor Handlers
  const addTextBlock = () => {
    setDescriptionBlocks(prev => [...prev, { id: Date.now().toString(), type: 'text', content: '' }]);
  };

  const addImageBlock = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const url = URL.createObjectURL(file);
      setDescriptionBlocks(prev => [...prev, { id: Date.now().toString(), type: 'image', content: url }]);
    }
  };

  const updateBlock = (id: string, content: string) => {
    setDescriptionBlocks(prev => prev.map(b => b.id === id ? { ...b, content } : b));
  };

  const removeBlock = (id: string) => {
    setDescriptionBlocks(prev => prev.filter(b => b.id !== id));
  };

  const handleSaveProduct = (e: React.FormEvent) => {
    e.preventDefault();
    const formData = new FormData(e.target as HTMLFormElement);

    // Serialize blocks to HTML
    const descriptionHtml = descriptionBlocks.map(block => {
      if (block.type === 'text') return `<p class="mb-4">${block.content}</p>`;
      if (block.type === 'image') return `<img src="${block.content}" class="w-full rounded-lg my-6" alt="Description Image" />`;
      return '';
    }).join('');

    const newProduct: Product = {
      id: editingProduct ? editingProduct.id : PRODUCTS.length + 1,
      name: formData.get('name') as string,
      price: parseInt(formData.get('price') as string),
      image: formData.get('image') as string, // This will be the blob URL
      category: formData.get('category') as string,
      description: descriptionHtml, // Use the serialized HTML
      stock: parseInt(formData.get('stock') as string),
      isNew: formData.get('isNew') === 'on',
      tags: editingProduct ? editingProduct.tags : [], // Preserve tags or initialize empty
    };

    if (editingProduct) {
      // Update existing
      // setProducts(prev => prev.map(p => p.id === newProduct.id ? newProduct : p));
      alert('상품이 수정되었습니다.');
    } else {
      // Add new
      // setProducts(prev => [...prev, newProduct]);
      alert('상품이 등록되었습니다.');
    }
    setIsProductModalOpen(false);
  };

  // Batch Selection State
  const [selectedOrderIds, setSelectedOrderIds] = useState<string[]>([]);
  const [isInvoiceModalOpen, setIsInvoiceModalOpen] = useState(false);

  // Confirm Modal State
  const [confirmModal, setConfirmModal] = useState<{
    isOpen: boolean;
    title: string;
    message: string;
    onConfirm: () => void;
    isDestructive?: boolean;
    confirmLabel?: string;
    cancelLabel?: string;
  }>({
    isOpen: false,
    title: '',
    message: '',
    onConfirm: () => { },
    isDestructive: false,
    confirmLabel: '확인',
    cancelLabel: '취소',
  });

  const closeConfirmModal = () => {
    setConfirmModal(prev => ({ ...prev, isOpen: false }));
  };

  useEffect(() => {
    fetchAdminUsers();
  }, [activeTab]);

  const fetchAdminUsers = async () => {
    if (activeTab === 'system') {
      const users = await getAdminUsers();
      setAdminUsers(users);
    }
  };

  if (loading) {
    return <div className="flex items-center justify-center min-h-screen"><div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-gray-900"></div></div>;
  }

  if (!user || user.role !== UserRole.ADMIN) {
    return <Navigate to="/login" replace />;
  }

  // --- Handlers ---

  const handleSaveUser = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const email = formData.get('email') as string;
    const username = formData.get('username') as string;
    const password = formData.get('password') as string;
    const displayId = formData.get('displayId') as string;
    const phoneNumber = formData.get('phoneNumber') as string;
    const jobTitle = formData.get('jobTitle') as string;

    const permissions: UserPermissions = {
      orders: formData.get('perm_orders') === 'on',
      products: formData.get('perm_products') === 'on',
      customers: formData.get('perm_customers') === 'on',
      analytics: formData.get('perm_analytics') === 'on',
      system: formData.get('perm_system') === 'on',
    };

    try {
      if (editingUser) {
        await updateAdminUser(editingUser.uid, permissions, displayId, phoneNumber, jobTitle);
        alert('관리자 정보가 수정되었습니다.');
      } else {
        if (password) {
          await createAdminUser(email, password, username, permissions, displayId, phoneNumber, jobTitle);
          alert('새로운 관리자 계정이 생성되었습니다.');
        } else {
          await promoteToAdmin(email, username, permissions, displayId, phoneNumber, jobTitle);
          alert('기존 사용자가 관리자로 승격되었습니다.');
        }
      }
      setIsUserModalOpen(false);
      fetchAdminUsers();
    } catch (error: any) {
      alert(error.message);
    }
  };

  const handleToggleStatus = (uid: string, currentStatus: boolean) => {
    setConfirmModal({
      isOpen: true,
      title: '관리자 상태 변경',
      message: `이 관리자 계정을 ${currentStatus ? '비활성화' : '활성화'} 하시겠습니까?`,
      onConfirm: async () => {
        try {
          await toggleAdminStatus(uid, !currentStatus);
          await fetchAdminUsers();
        } catch (error) {
          console.error(error);
          alert('상태 변경 중 오류가 발생했습니다.');
        }
      },
      isDestructive: currentStatus // Deactivating is considered destructive/warning
    });
  };

  const handleChangePassword = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const newPassword = formData.get('newPassword') as string;

    if (newPassword.length < 6) {
      alert('비밀번호는 6자 이상이어야 합니다.');
      return;
    }

    try {
      await changeOwnPassword(newPassword);
      alert('비밀번호가 변경되었습니다.');
      setIsUserModalOpen(false);
    } catch (error: any) {
      alert('비밀번호 변경 실패: ' + error.message);
    }
  };

  const handleSendResetEmail = (email: string) => {
    setConfirmModal({
      isOpen: true,
      title: '비밀번호 재설정',
      message: `${email} 주소로 비밀번호 재설정 이메일을 발송하시겠습니까?`,
      onConfirm: async () => {
        try {
          await sendAdminPasswordReset(email);
          alert('비밀번호 재설정 이메일이 발송되었습니다.');
        } catch (error: any) {
          alert('이메일 발송 실패: ' + error.message);
        }
      },
    });
  };

  const handleRemoveAdmin = (uid: string) => {
    setConfirmModal({
      isOpen: true,
      title: '관리자 삭제',
      message: '정말로 이 관리자를 삭제하시겠습니까? 이 작업은 되돌릴 수 없으며, 해당 사용자의 모든 데이터가 영구적으로 삭제됩니다.',
      confirmLabel: '삭제',
      cancelLabel: '취소',
      isDestructive: true,
      onConfirm: async () => {
        try {
          await deleteAdminUser(uid);
          setAdminUsers(prev => prev.filter(user => user.uid !== uid));
          setConfirmModal(prev => ({ ...prev, isOpen: false }));
          alert('관리자가 삭제되었습니다.');
        } catch (error) {
          console.error('Error deleting admin:', error);
          alert('관리자 삭제 중 오류가 발생했습니다.');
        }
      },
    });
  };



  const handleDeleteProduct = (id: number) => {
    if (window.confirm('정말 이 상품을 삭제하시겠습니까?')) {
      setProducts(prev => prev.filter(p => p.id !== id));
    }
  };

  const handleUpdateOrderStatus = (id: string, newStatus: string) => {
    setOrders(prev => prev.map(o => o.id === id ? { ...o, status: newStatus } : o));
  };

  const handleSelectAll = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.checked) {
      setSelectedOrderIds(orders.map(o => o.id));
    } else {
      setSelectedOrderIds([]);
    }
  };

  const handleSelectOrder = (id: string) => {
    setSelectedOrderIds(prev =>
      prev.includes(id) ? prev.filter(oid => oid !== id) : [...prev, id]
    );
  };

  const handleBatchStatusChange = (newStatus: string) => {
    if (selectedOrderIds.length === 0) return;
    if (window.confirm(`선택한 ${selectedOrderIds.length}개의 주문 상태를 '${newStatus}'(으)로 변경하시겠습니까?`)) {
      setOrders(prev => prev.map(o => selectedOrderIds.includes(o.id) ? { ...o, status: newStatus } : o));
      setSelectedOrderIds([]); // Clear selection after update
      // TODO: Call API/Service here
    }
  };

  const handlePrintInvoice = () => {
    if (selectedOrderIds.length === 0) return;
    setIsInvoiceModalOpen(true);
  };

  // --- Render Sections ---

  const renderHome = () => {
    // Current date logic
    const today = new Date();
    const dateString = `${today.getMonth() + 1}월 ${today.getDate()}일 ${['일', '월', '화', '수', '목', '금', '토'][today.getDay()]}요일`;

    // Counts logic
    const getCount = (status: string) => orders.filter(o => o.status === status).length;

    const StatusBox = ({ title, count, type }: { title: string, count: number, type: 'order' | 'claim' | 'normal' }) => (
      <div className={`flex flex-col justify-center p-4 border-r border-gray-100 last:border-r-0 h-24 
        ${type === 'order' ? 'bg-[#f0f9ff]' : type === 'claim' ? 'bg-[#fff0f6]' : 'bg-white'}`}>
        <span className="text-xs text-gray-500 mb-1">{title}</span>
        <div className="flex items-center space-x-1">
          <span className={`text-lg font-bold ${count > 0 ? (type === 'claim' ? 'text-red-500' : 'text-blue-500') : 'text-gray-800'}`}>
            {count}
          </span>
          {count > 0 && type === 'claim' && <span className="text-[10px] text-red-400">처리중</span>}
        </div>
      </div>
    );

    const tabs = [
      { id: 'daily', label: '일별 매출 현황' },
      { id: 'realtime', label: '실시간 접속 현황' },
      { id: 'order_proc', label: '주문처리 현황' },
      { id: 'member', label: '회원/적립금 현황' },
      { id: 'posts', label: '게시물 현황' }
    ];

    return (
      <div className="space-y-6">
        {/* Top Section: Today's To-Do */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
          <div className="px-5 py-3 border-b border-gray-100 flex items-center space-x-2">
            <h3 className="font-bold text-gray-800 text-sm">오늘의 할 일</h3>
            <span className="text-xs text-gray-400">{dateString}</span>
            <HelpCircle size={14} className="text-gray-300 cursor-pointer" />
          </div>

          <div className="grid grid-cols-2 md:grid-cols-5 divide-x divide-gray-100 text-sm">
            {/* Order Flow - Blue Tones */}
            <StatusBox title="입금전" count={getCount('입금전')} type="order" />
            <StatusBox title="배송준비중" count={getCount('입금대기')} type="order" />
            <StatusBox title="배송보류중" count={0} type="order" />
            <StatusBox title="배송대기" count={0} type="order" />
            <StatusBox title="배송중" count={getCount('배송중')} type="order" />
          </div>
          <div className="grid grid-cols-2 md:grid-cols-5 divide-x divide-gray-100 border-t border-gray-100 text-sm">
            {/* Claim Flow - Pink Tones */}
            <StatusBox title="취소신청" count={0} type="claim" />
            <StatusBox title="교환신청" count={0} type="claim" />
            <StatusBox title="반품신청" count={0} type="claim" />
            <StatusBox title="환불전" count={0} type="normal" />
            <div className="flex flex-col justify-center p-4 h-24 bg-white">
              <span className="text-xs text-gray-500 mb-1">재고부족 알림</span>
              <span className="text-lg font-bold text-red-500">
                {products.filter(p => (p.stock || 0) <= 10).length}
              </span>
            </div>
          </div>
        </div>

        {/* Middle Section: Dashboard Tabs */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 min-h-[400px]">
          <div className="flex border-b border-gray-200 overflow-x-auto no-scrollbar">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setDashboardSubTab(tab.id)}
                className={`flex-1 py-4 text-sm font-medium transition-colors relative whitespace-nowrap px-4
                  ${dashboardSubTab === tab.id
                    ? 'text-blue-600 font-bold'
                    : 'text-gray-500 hover:text-gray-700 bg-gray-50 hover:bg-gray-100'}`}
              >
                {tab.label}
                {dashboardSubTab === tab.id &&
                  <div className="absolute bottom-0 left-0 w-full h-0.5 bg-blue-600"></div>
                }
              </button>
            ))}
          </div>

          <div className="p-6">
            {dashboardSubTab === 'daily' && <DailySalesStats />}
            {dashboardSubTab === 'order_proc' && <OrderProcessingStats />}
            {dashboardSubTab === 'member' && <MemberPointsStats />}
            {dashboardSubTab === 'posts' && <PostStats />}

            {dashboardSubTab === 'realtime' && (
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
                {/* Left Chart */}
                <div>
                  <div className="flex items-center space-x-2 mb-2">
                    <h4 className="text-sm font-bold text-gray-800">실시간 접속자</h4>
                    <HelpCircle size={14} className="text-gray-400" />
                    <span className="text-xs text-blue-500 flex items-center cursor-pointer ml-auto">
                      자세히 보기 <ExternalLink size={10} className="ml-1" />
                    </span>
                  </div>
                  <div className="text-[10px] text-gray-400 mb-2">단위/명</div>
                  <RealTimeChart />
                </div>

                {/* Right Chart */}
                <div>
                  <div className="flex items-center space-x-2 mb-2">
                    <h4 className="text-sm font-bold text-gray-800">일별 방문자 수</h4>
                    <HelpCircle size={14} className="text-gray-400" />
                    <span className="text-xs text-blue-500 flex items-center cursor-pointer ml-auto">
                      자세히 보기 <ExternalLink size={10} className="ml-1" />
                    </span>
                  </div>
                  <div className="text-[10px] text-gray-400 mb-2">단위/명</div>
                  <DailyVisitorChart />
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    );
  };

  const statusColors: Record<string, string> = {
    '입금대기': 'bg-yellow-50 border border-yellow-100 text-yellow-700',
    '결제완료': 'bg-blue-50 border border-blue-100 text-blue-600',
    '배송중': 'bg-indigo-50 border border-indigo-100 text-indigo-600',
    '배송완료': 'bg-gray-100 border border-gray-200 text-gray-500'
  };

  const renderOrders = () => {
    return (
      <div className="space-y-6">
        <h2 className="text-xl font-bold text-gray-800 flex items-center gap-2">
          <ShoppingCart size={20} /> 주문 관리
        </h2>

        <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
          <div className="p-4 border-b border-gray-200 flex items-center bg-gray-50 justify-between">
            <div className="flex items-center gap-4">
              <div className="flex items-center bg-white border border-gray-300 px-3 py-1.5 rounded-sm w-80">
                <Search size={16} className="text-gray-400 mr-2" />
                <input
                  type="text"
                  placeholder="주문자명, 주문번호 검색"
                  className="bg-transparent border-none focus:outline-none text-sm w-full"
                />
              </div>
              {selectedOrderIds.length > 0 && (
                <div className="flex items-center gap-2 animate-fadeIn">
                  <span className="text-sm text-blue-600 font-bold">{selectedOrderIds.length}개 선택됨</span>
                  <div className="h-4 w-px bg-gray-300 mx-2"></div>
                  <select
                    onChange={(e) => handleBatchStatusChange(e.target.value)}
                    className="px-3 py-1.5 border border-blue-200 rounded-sm text-xs font-medium text-blue-700 bg-blue-50 hover:bg-blue-100 cursor-pointer outline-none"
                    value=""
                  >
                    <option value="" disabled>상태 일괄 변경</option>
                    <option value="입금대기">입금대기</option>
                    <option value="결제완료">결제완료</option>
                    <option value="배송중">배송중</option>
                    <option value="배송완료">배송완료</option>
                  </select>
                  <button
                    onClick={handlePrintInvoice}
                    className="flex items-center gap-1 px-3 py-1.5 border border-gray-300 rounded-sm text-xs font-medium hover:bg-white text-gray-700"
                  >
                    <Printer size={14} />
                    <span>송장 출력</span>
                  </button>
                </div>
              )}
            </div>
            <div className="space-x-2">
              <button className="px-3 py-1.5 bg-white border border-gray-300 text-xs rounded-sm hover:bg-gray-50">엑셀 다운로드</button>
            </div>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-white text-gray-600 border-b border-gray-200">
                <tr>
                  <th className="px-6 py-3 font-medium w-10">
                    <input
                      type="checkbox"
                      onChange={handleSelectAll}
                      checked={orders.length > 0 && selectedOrderIds.length === orders.length}
                      className="rounded text-blue-500 focus:ring-blue-500"
                    />
                  </th>
                  <th className="px-6 py-3 font-medium">주문번호</th>
                  <th className="px-6 py-3 font-medium">주문일자</th>
                  <th className="px-6 py-3 font-medium">고객명</th>
                  <th className="px-6 py-3 font-medium">결제금액</th>
                  <th className="px-6 py-3 font-medium">상태</th>
                  <th className="px-6 py-3 font-medium text-right">상세</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {orders.map(order => (
                  <tr key={order.id} className="hover:bg-gray-50 transition group">
                    <td className="px-6 py-4">
                      <input
                        type="checkbox"
                        checked={selectedOrderIds.includes(order.id)}
                        onChange={() => handleSelectOrder(order.id)}
                        className="rounded text-blue-500 focus:ring-blue-500"
                      />
                    </td>
                    <td className="px-6 py-4 font-medium text-gray-900">{order.id}</td>
                    <td className="px-6 py-4 text-gray-500">{order.date}</td>
                    <td className="px-6 py-4 font-medium text-gray-800">{order.customerName}</td>
                    <td className="px-6 py-4 text-gray-600">₩{order.total.toLocaleString()}</td>
                    <td className="px-6 py-4">
                      <span className={`px-2 py-1 rounded-sm text-xs font-medium ${statusColors[order.status] || 'bg-gray-100 text-gray-600'}`}>
                        {order.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <button className="text-gray-400 hover:text-blue-600 transition">
                        <MoreHorizontal size={18} />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    );
  };

  const renderProducts = () => {
    return (
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <h2 className="text-xl font-bold text-gray-800 flex items-center gap-2">
            <Package size={20} /> 상품 관리
          </h2>
          <button
            onClick={() => { setEditingProduct(null); setIsProductModalOpen(true); }}
            className="bg-black text-white px-4 py-2 rounded-sm text-sm hover:bg-gray-800 transition flex items-center gap-2"
          >
            <Plus size={16} /> 상품 등록
          </button>
        </div>

        <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
          <table className="w-full text-left text-sm">
            <thead className="bg-white text-gray-600 border-b border-gray-200">
              <tr>
                <th className="px-6 py-3 font-medium">상품명</th>
                <th className="px-6 py-3 font-medium">판매가</th>
                <th className="px-6 py-3 font-medium">카테고리</th>
                <th className="px-6 py-3 font-medium">재고</th>
                <th className="px-6 py-3 font-medium text-right">관리</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {products.map(product => (
                <tr key={product.id} className="hover:bg-gray-50 transition group">
                  <td className="px-6 py-4 font-medium text-gray-800">
                    <div className="flex items-center gap-3">
                      <img src={product.image} alt={product.name} className="w-10 h-10 rounded object-cover border border-gray-100" />
                      {product.name}
                    </div>
                  </td>
                  <td className="px-6 py-4 text-gray-600">₩{product.price.toLocaleString()}</td>
                  <td className="px-6 py-4 text-gray-500">{product.category}</td>
                  <td className="px-6 py-4 text-gray-600">{product.stock}</td>
                  <td className="px-6 py-4 text-right">
                    <button
                      onClick={() => { setEditingProduct(product); setIsProductModalOpen(true); }}
                      className="text-gray-400 hover:text-blue-600 mr-2"
                    >
                      <Edit3 size={18} />
                    </button>
                    <button
                      onClick={() => handleDeleteProduct(product.id)}
                      className="text-gray-400 hover:text-red-600"
                    >
                      <Trash2 size={18} />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    );
  };

  const renderCustomers = () => {
    // CRM Logic: Calculate Stats
    const totalCustomers = customers.length;
    const newCustomers = customers.filter(c => {
      const join = new Date(c.joinDate);
      const now = new Date();
      return join.getMonth() === now.getMonth() && join.getFullYear() === now.getFullYear();
    }).length;
    const vipCustomers = customers.filter(c => c.grade === 'VIP').length;
    const atRiskCustomers = customers.filter(c => c.status === 'inactive' || !c.lastLoginDate).length;

    // Filter Logic
    const filteredCustomers = customers.filter(c => {
      if (customerFilter === 'all') return true;
      if (customerFilter === 'vip') return c.grade === 'VIP';
      if (customerFilter === 'at_risk') return c.status === 'inactive';
      if (customerFilter === 'potential') return c.totalSpent === 0;
      return true;
    });

    return (
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <h2 className="text-xl font-bold text-gray-800 flex items-center gap-2">
            <Users size={20} /> 고객 관리 (CRM)
          </h2>
          <button className="bg-black text-white px-4 py-2 rounded-sm text-sm hover:bg-gray-800 transition flex items-center gap-2">
            <Plus size={16} /> 고객 수동 등록
          </button>
        </div>

        {/* CRM Stats Cards */}
        <div className="grid grid-cols-4 gap-4">
          <div className="bg-white p-4 rounded-lg border border-gray-200 shadow-sm">
            <p className="text-xs text-gray-500 mb-1">총 회원수</p>
            <p className="text-2xl font-bold text-gray-900">{totalCustomers.toLocaleString()}</p>
          </div>
          <div className="bg-white p-4 rounded-lg border border-gray-200 shadow-sm">
            <p className="text-xs text-gray-500 mb-1">신규 회원 (이번달)</p>
            <p className="text-2xl font-bold text-blue-600">+{newCustomers}</p>
          </div>
          <div className="bg-white p-4 rounded-lg border border-gray-200 shadow-sm">
            <p className="text-xs text-gray-500 mb-1">VIP 회원</p>
            <p className="text-2xl font-bold text-purple-600">{vipCustomers}</p>
          </div>
          <div className="bg-white p-4 rounded-lg border border-gray-200 shadow-sm">
            <p className="text-xs text-gray-500 mb-1">이탈 위험</p>
            <p className="text-2xl font-bold text-red-500">{atRiskCustomers}</p>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
          {/* Filters & Search */}
          <div className="p-4 border-b border-gray-200 flex flex-col md:flex-row justify-between items-center gap-4 bg-gray-50">
            <div className="flex space-x-2">
              {[
                { id: 'all', label: '전체' },
                { id: 'vip', label: 'VIP' },
                { id: 'at_risk', label: '이탈위험' },
                { id: 'potential', label: '잠재고객' }
              ].map(tab => (
                <button
                  key={tab.id}
                  onClick={() => setCustomerFilter(tab.id as any)}
                  className={`px-3 py-1.5 text-sm rounded-sm transition ${customerFilter === tab.id
                    ? 'bg-black text-white font-medium'
                    : 'bg-white text-gray-600 border border-gray-300 hover:bg-gray-50'
                    }`}
                >
                  {tab.label}
                </button>
              ))}
            </div>
            <div className="flex items-center w-full md:w-auto bg-white border border-gray-300 rounded-sm px-3 py-1.5">
              <Search size={16} className="text-gray-400 mr-2" />
              <input type="text" placeholder="회원명, 아이디, 전화번호" className="text-sm w-full focus:outline-none" />
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-white text-gray-600 border-b border-gray-200">
                <tr>
                  <th className="px-6 py-3 font-medium">고객명</th>
                  <th className="px-6 py-3 font-medium">연락처/이메일</th>
                  <th className="px-6 py-3 font-medium">최근 접속</th>
                  <th className="px-6 py-3 font-medium">총 구매액</th>
                  <th className="px-6 py-3 font-medium">등급/상태</th>
                  <th className="px-6 py-3 font-medium text-right">관리</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {filteredCustomers.map(customer => (
                  <tr key={customer.id} className="hover:bg-gray-50 transition group">
                    <td className="px-6 py-4 font-medium text-gray-800">
                      <div className="flex items-center gap-2">
                        <div className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center text-xs font-bold text-gray-500">
                          {customer.name[0]}
                        </div>
                        {customer.name}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <p className="text-gray-900">{customer.phone}</p>
                      <p className="text-xs text-gray-400">{customer.email}</p>
                    </td>
                    <td className="px-6 py-4 text-gray-600">
                      {customer.lastLoginDate || '-'}
                      {customer.status === 'inactive' && <span className="ml-2 text-[10px] text-red-500 font-bold">휴면</span>}
                    </td>
                    <td className="px-6 py-4 text-slate-700">₩{customer.totalSpent.toLocaleString()}</td>
                    <td className="px-6 py-4">
                      <span className={`px-2 py-0.5 rounded-sm text-xs font-medium border
                        ${customer.grade === 'VIP' ? 'bg-purple-50 text-purple-700 border-purple-100' :
                          customer.grade === 'Gold' ? 'bg-yellow-50 text-yellow-700 border-yellow-100' :
                            customer.grade === 'Silver' ? 'bg-gray-50 text-gray-700 border-gray-200' : 'bg-orange-50 text-orange-700 border-orange-100'}`}>
                        {customer.grade}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <button className="text-gray-400 hover:text-blue-600 mr-2" title="상세보기">
                        <Maximize2 size={16} />
                      </button>
                      <button className="text-gray-400 hover:text-gray-800" title="메모">
                        <FileText size={16} />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    );
  };

  const renderSystem = () => {
    return (
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <h2 className="text-xl font-bold text-gray-800 flex items-center gap-2">
            <Shield size={20} /> 시스템 관리
          </h2>
          <button
            onClick={() => { setEditingUser(null); setIsUserModalOpen(true); }}
            className="bg-primary text-white px-4 py-2 rounded-sm text-sm hover:bg-black transition flex items-center gap-2"
          >
            <Plus size={16} /> 관리자 추가
          </button>
        </div>

        <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
          <table className="w-full text-left text-sm">
            <thead className="bg-white text-gray-600 border-b border-gray-200">
              <tr>
                <th className="px-6 py-3 font-medium">이름</th>
                <th className="px-6 py-3 font-medium">아이디</th>
                <th className="px-6 py-3 font-medium">직급</th>
                <th className="px-6 py-3 font-medium">이메일</th>
                <th className="px-6 py-3 font-medium">연락처</th>
                <th className="px-6 py-3 font-medium">상태</th>
                <th className="px-6 py-3 font-medium">권한</th>
                <th className="px-6 py-3 font-medium text-right">관리</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {adminUsers.map(admin => (
                <tr key={admin.uid} className="hover:bg-gray-50 transition">
                  <td className="px-6 py-4 font-medium">{admin.username}</td>
                  <td className="px-6 py-4 text-gray-600">{admin.displayId || '-'}</td>
                  <td className="px-6 py-4 text-gray-600">{admin.jobTitle || '-'}</td>
                  <td className="px-6 py-4 text-gray-500">{admin.email}</td>
                  <td className="px-6 py-4 text-gray-600">{admin.phoneNumber || '-'}</td>
                  <td className="px-6 py-4">
                    <button
                      onClick={() => handleToggleStatus(admin.uid, !!admin.isActive)}
                      className={`px-2 py-1 text-xs rounded-full transition hover:opacity-80 ${admin.isActive ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'}`}
                      title={admin.isActive ? '클릭하여 비활성화' : '클릭하여 활성화'}
                    >
                      {admin.isActive ? '활성' : '비활성'}
                    </button>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex gap-2 flex-wrap">
                      {admin.permissions?.orders && <span className="px-2 py-1 bg-blue-50 text-blue-600 text-xs rounded-full">주문</span>}
                      {admin.permissions?.products && <span className="px-2 py-1 bg-green-50 text-green-600 text-xs rounded-full">상품</span>}
                      {admin.permissions?.customers && <span className="px-2 py-1 bg-purple-50 text-purple-600 text-xs rounded-full">고객</span>}
                      {admin.permissions?.system && <span className="px-2 py-1 bg-red-50 text-red-600 text-xs rounded-full">시스템</span>}
                    </div>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <button
                      onClick={() => { setEditingUser(admin); setIsUserModalOpen(true); }}
                      className="text-gray-400 hover:text-slate-700 mr-2"
                      title="수정"
                    >
                      <Settings size={18} />
                    </button>
                    {admin.uid !== user?.uid && (
                      <button
                        onClick={() => handleRemoveAdmin(admin.uid)}
                        className="text-red-400 hover:text-red-600"
                        title="삭제"
                      >
                        <Trash2 size={18} />
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    );
  };

  const renderDesign = () => {
    return (
      <div className="space-y-8">
        {/* Banner Management */}
        <div className="space-y-4">
          <div className="flex justify-between items-center">
            <h2 className="text-xl font-bold text-gray-800 flex items-center gap-2">
              <ImageIcon size={20} /> 배너 관리
            </h2>
            <button
              onClick={() => { setEditingBanner(null); setIsBannerModalOpen(true); }}
              className="flex items-center space-x-2 bg-slate-700 text-white px-4 py-2 rounded-sm text-sm hover:bg-slate-800 transition"
            >
              <Plus size={16} />
              <span>배너 등록</span>
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {banners.map(banner => (
              <div key={banner.id} className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden group">
                <div className="relative h-40 bg-gray-100">
                  <img src={banner.imageUrl} alt={banner.title} className="w-full h-full object-cover" />
                  <div className="absolute top-2 right-2 flex space-x-1 opacity-0 group-hover:opacity-100 transition">
                    <button className="p-1.5 bg-white rounded-full shadow-sm hover:text-blue-600"><Edit3 size={14} /></button>
                    <button className="p-1.5 bg-white rounded-full shadow-sm hover:text-red-600"><Trash2 size={14} /></button>
                  </div>
                  <div className="absolute bottom-2 left-2 bg-black/50 text-white text-xs px-2 py-1 rounded">
                    {banner.position === 'main_hero' ? '메인 히어로' : '팝업'}
                  </div>
                </div>
                <div className="p-4">
                  <h3 className="font-bold text-gray-800 mb-1">{banner.title || '제목 없음'}</h3>
                  <div className="flex items-center text-xs text-gray-500 gap-4">
                    <span className="flex items-center gap-1"><LinkIcon size={12} /> {banner.link}</span>
                    <span className="flex items-center gap-1"><Calendar size={12} /> {banner.startDate} ~ {banner.endDate}</span>
                  </div>
                  <div className="mt-3 flex items-center justify-between">
                    <span className={`text-xs px-2 py-0.5 rounded-full ${banner.isActive ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-600'}`}>
                      {banner.isActive ? '게시중' : '비활성'}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Display Management (DnD) */}
        <div className="space-y-4">
          <div className="flex justify-between items-center">
            <h2 className="text-xl font-bold text-gray-800 flex items-center gap-2">
              <GripVertical size={20} /> 진열 관리 (추천 상품 순서)
            </h2>
            <button className="text-sm text-blue-600 hover:underline">순서 저장</button>
          </div>

          <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
            <div className="p-4 bg-gray-50 border-b border-gray-200 text-xs text-gray-500">
              * 드래그하여 순서를 변경할 수 있습니다.
            </div>
            <ul className="divide-y divide-gray-100">
              {products.slice(0, 5).map((product, index) => (
                <li
                  key={product.id}
                  draggable
                  onDragStart={() => handleDragStart(index)}
                  onDragOver={(e) => handleDragOver(e, index)}
                  onDragEnd={handleDragEnd}
                  className={`flex items-center p-4 hover:bg-gray-50 transition cursor-move ${draggedItemIndex === index ? 'bg-blue-50 opacity-50' : ''}`}
                >
                  <div className="text-gray-400 mr-4"><GripVertical size={20} /></div>
                  <div className="w-8 text-center font-bold text-gray-400 mr-4">{index + 1}</div>
                  <img src={product.image} alt={product.name} className="w-12 h-12 object-cover rounded border border-gray-100 mr-4" />
                  <div className="flex-1">
                    <p className="font-bold text-gray-800">{product.name}</p>
                    <p className="text-xs text-gray-500">₩{product.price.toLocaleString()}</p>
                  </div>
                  <div className="text-xs text-gray-400">ID: {product.id}</div>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    );
  };

  const renderPromotion = () => (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-bold text-gray-800 flex items-center gap-2">
          <Percent size={20} /> 기획전 관리
        </h2>
        <button
          onClick={() => { setEditingPromotion(null); setIsPromotionModalOpen(true); }}
          className="flex items-center space-x-2 bg-slate-700 text-white px-4 py-2 rounded-sm text-sm hover:bg-slate-800 transition"
        >
          <Plus size={16} />
          <span>기획전 생성</span>
        </button>
      </div>

      <div className="grid grid-cols-1 gap-6">
        {promotions.map(promo => (
          <div key={promo.id} className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 flex gap-6">
            <div className="w-48 h-32 bg-gray-100 rounded-lg overflow-hidden shrink-0">
              <img src={promo.bannerImage} alt={promo.title} className="w-full h-full object-cover" />
            </div>
            <div className="flex-1">
              <div className="flex justify-between items-start">
                <div>
                  <h3 className="text-lg font-bold text-gray-800 mb-1">{promo.title}</h3>
                  <p className="text-gray-600 text-sm mb-3">{promo.description}</p>
                </div>
                <div className="flex space-x-2">
                  <button className="text-gray-400 hover:text-blue-600"><Edit3 size={18} /></button>
                  <button className="text-gray-400 hover:text-red-600"><Trash2 size={18} /></button>
                </div>
              </div>
              <div className="flex items-center gap-4 text-sm text-gray-500 mb-4">
                <span className="flex items-center gap-1"><Calendar size={14} /> {promo.startDate} ~ {promo.endDate}</span>
                <span className="flex items-center gap-1"><Package size={14} /> 상품 {promo.productIds.length}개</span>
              </div>
              <div className="flex items-center gap-2">
                <span className={`text-xs px-2 py-1 rounded-full ${promo.isActive ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-600'}`}>
                  {promo.isActive ? '진행중' : '종료'}
                </span>
                <button className="text-xs text-blue-600 hover:underline flex items-center gap-1">
                  페이지 미리보기 <ExternalLink size={10} />
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );

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
    // For demo, allow everything if permissions are undefined (super admin fallback)
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
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Header */}
        <header className="h-16 bg-white border-b border-gray-200 flex justify-between items-center px-6 z-10">
          <h2 className="text-lg font-bold text-gray-800">
            {MENU_ITEMS.find(item => item.id === activeTab)?.label}
          </h2>
          <div className="flex items-center space-x-4">
            <button className="p-2 text-gray-400 hover:text-gray-600 relative">
              <MessageCircle size={20} />
              <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-red-500 rounded-full border border-white"></span>
            </button>
            <button className="p-2 text-gray-400 hover:text-gray-600">
              <HelpCircle size={20} />
            </button>
          </div>
        </header>

        {/* Dashboard Content */}
        <main className="flex-1 overflow-x-hidden overflow-y-auto bg-gray-50 p-6">
          {activeTab === 'home' && renderHome()}
          {activeTab === 'orders' && renderOrders()}
          {activeTab === 'products' && renderProducts()}
          {activeTab === 'customers' && renderCustomers()}
          {activeTab === 'system' && renderSystem()}
          {activeTab === 'design' && renderDesign()}
          {activeTab === 'promotion' && renderPromotion()}
          {['messages', 'board', 'analytics', 'stats', 'excel'].includes(activeTab) && renderPlaceholder(MENU_ITEMS.find(i => i.id === activeTab)?.label || '')}
        </main>
      </div>

      {/* Modals */}
      {isProductModalOpen && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4 backdrop-blur-sm">
          <div className="bg-white rounded-lg shadow-2xl max-w-5xl w-full h-[90vh] overflow-y-auto flex flex-col">
            {/* Modal Header */}
            <div className="flex justify-between items-center p-6 border-b border-gray-100">
              <h2 className="text-xl font-bold text-gray-800">
                {editingProduct ? '상품 정보 수정' : '신규 상품 등록'}
              </h2>
              <button onClick={() => setIsProductModalOpen(false)} className="text-gray-400 hover:text-gray-600">
                <span className="sr-only">Close</span>
                <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
              </button>
            </div>

            {/* Modal Body (Two Column Layout) */}
            <form onSubmit={handleSaveProduct} className="flex-1 flex flex-col lg:flex-row overflow-hidden">
              {/* Left: Gallery & Image Input */}
              <div className="lg:w-1/2 p-8 bg-gray-50 overflow-y-auto border-r border-gray-100">
                <div className="mb-6">
                  <label className="block text-xs font-bold text-gray-600 mb-2">대표 이미지 <span className="text-red-500">*</span></label>
                  <div className="flex items-center gap-2">
                    <label className="flex-1 cursor-pointer bg-white border border-gray-300 rounded-sm px-4 py-3 flex items-center justify-center gap-2 hover:bg-gray-50 transition">
                      <ImageIcon size={16} className="text-gray-500" />
                      <span className="text-sm text-gray-600">이미지 파일 선택</span>
                      <input
                        type="file"
                        accept="image/*"
                        className="hidden"
                        onChange={handleImageChange}
                      />
                    </label>
                    {/* Hidden input to store the URL for form submission */}
                    <input type="hidden" name="image" value={previewImage} />
                  </div>
                  <p className="text-[10px] text-gray-400 mt-2">* 실제 쇼핑몰과 동일한 비율(4:5)의 이미지를 권장합니다.</p>
                </div>

                <div className="relative aspect-[4/5] bg-white shadow-sm overflow-hidden mb-4 border border-gray-200 group">
                  <img
                    src={previewImage}
                    alt="Preview"
                    className="w-full h-full object-cover"
                    onError={(e) => e.currentTarget.src = "https://via.placeholder.com/600x750?text=No+Image"}
                  />
                  <div className="absolute top-4 left-4">
                    {/* New Badge Preview */}
                    <span id="preview-badge" className={`text-xs font-bold tracking-widest uppercase bg-black text-white px-2 py-1 ${editingProduct?.isNew ? '' : 'hidden'}`}>New Arrival</span>
                  </div>
                </div>

                {/* Additional Images (Thumbnails) */}
                <div className="flex gap-4 overflow-x-auto pb-2">
                  {/* Render existing additional images */}
                  {additionalImages.map((img, idx) => (
                    <div key={idx} className="relative w-20 h-24 bg-white border border-gray-200 group">
                      <img src={img} alt={`Sub ${idx}`} className="w-full h-full object-cover" />
                      <button
                        type="button"
                        onClick={() => handleRemoveAdditionalImage(idx)}
                        className="absolute top-1 right-1 bg-black/50 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition"
                      >
                        <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
                      </button>
                    </div>
                  ))}

                  {/* Add Button (Show if less than 5 images) */}
                  {additionalImages.length < 5 && (
                    <label className="w-20 h-24 bg-white border border-dashed border-gray-300 cursor-pointer hover:border-gray-400 hover:bg-gray-50 transition flex flex-col items-center justify-center gap-1">
                      <Plus size={16} className="text-gray-400" />
                      <span className="text-[10px] text-gray-400">Add</span>
                      <input
                        type="file"
                        accept="image/*"
                        className="hidden"
                        onChange={handleAddAdditionalImage}
                      />
                    </label>
                  )}
                </div>
              </div>

              {/* Right: Info Inputs */}
              <div className="lg:w-1/2 p-8 overflow-y-auto bg-white">
                <div className="max-w-md mx-auto space-y-8">
                  {/* Breadcrumb Style Category Selector */}
                  <div className="flex items-center text-sm text-gray-500 font-light">
                    <span className="hover:text-black cursor-pointer">Home</span>
                    <span className="mx-2 text-xs">/</span>
                    <span className="hover:text-black cursor-pointer">Shop</span>
                    <span className="mx-2 text-xs">/</span>
                    <select
                      name="category"
                      defaultValue={editingProduct?.category || 'earring'}
                      className="text-black font-medium border-none focus:ring-0 p-0 cursor-pointer bg-transparent outline-none hover:underline"
                    >
                      <option value="earring">Earrings (귀걸이)</option>
                      <option value="necklace">Necklaces (목걸이)</option>
                      <option value="ring">Rings (반지)</option>
                      <option value="bracelet">Bracelets (팔찌)</option>
                    </select>
                  </div>

                  {/* Product Name */}
                  <div>
                    <label className="block text-xs font-bold text-gray-400 mb-1">상품명</label>
                    <input
                      name="name"
                      defaultValue={editingProduct?.name}
                      required
                      className="w-full text-3xl md:text-4xl font-serif text-primary border-b border-gray-200 focus:border-black outline-none py-2 placeholder-gray-200 transition"
                      placeholder="Product Name"
                    />
                  </div>

                  {/* Price & Stock */}
                  <div className="flex gap-8">
                    <div className="flex-1">
                      <label className="block text-xs font-bold text-gray-400 mb-1">판매가 (KRW)</label>
                      <div className="flex items-center">
                        <span className="text-xl font-medium text-gray-900 mr-1">₩</span>
                        <input
                          name="price"
                          type="number"
                          defaultValue={editingProduct?.price}
                          required
                          className="w-full text-xl font-medium text-gray-900 border-b border-gray-200 focus:border-black outline-none py-1"
                          placeholder="0"
                        />
                      </div>
                    </div>
                    <div className="flex-1">
                      <label className="block text-xs font-bold text-gray-400 mb-1">재고 수량</label>
                      <input
                        name="stock"
                        type="number"
                        defaultValue={editingProduct?.stock ?? 100}
                        className="w-full text-xl font-medium text-gray-900 border-b border-gray-200 focus:border-black outline-none py-1"
                        placeholder="0"
                      />
                    </div>
                  </div>

                  {/* Description (Block Editor) */}
                  <div>
                    <label className="block text-xs font-bold text-gray-400 mb-2">상품 상세 설명 (블로그형 에디터)</label>
                    <div className="border border-gray-200 rounded-sm p-4 space-y-4 bg-gray-50 min-h-[300px]">
                      {descriptionBlocks.map((block, index) => (
                        <div key={block.id} className="relative group">
                          {block.type === 'text' ? (
                            <textarea
                              value={block.content}
                              onChange={(e) => updateBlock(block.id, e.target.value)}
                              rows={3}
                              className="w-full text-sm text-gray-600 leading-relaxed border border-gray-200 p-3 rounded-sm focus:border-black outline-none resize-none bg-white"
                              placeholder="텍스트를 입력하세요..."
                            />
                          ) : (
                            <div className="relative">
                              <img src={block.content} alt="Content" className="w-full rounded-lg border border-gray-200" />
                            </div>
                          )}

                          {/* Remove Block Button */}
                          <button
                            type="button"
                            onClick={() => removeBlock(block.id)}
                            className="absolute -right-2 -top-2 bg-red-500 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition shadow-sm z-10"
                          >
                            <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
                          </button>
                        </div>
                      ))}

                      {/* Add Block Buttons */}
                      <div className="flex gap-2 justify-center pt-4 border-t border-gray-200 border-dashed">
                        <button
                          type="button"
                          onClick={addTextBlock}
                          className="flex items-center gap-1 px-3 py-2 bg-white border border-gray-300 rounded-sm text-xs font-medium hover:bg-gray-50 transition"
                        >
                          <FileText size={14} /> 텍스트 추가
                        </button>
                        <label className="flex items-center gap-1 px-3 py-2 bg-white border border-gray-300 rounded-sm text-xs font-medium hover:bg-gray-50 transition cursor-pointer">
                          <ImageIcon size={14} /> 이미지 추가
                          <input type="file" accept="image/*" className="hidden" onChange={addImageBlock} />
                        </label>
                      </div>
                    </div>
                  </div>

                  {/* Options (New/Best) */}
                  <div className="border-t border-b border-gray-100 py-6 space-y-4">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium text-gray-900">신상품 뱃지 (New Arrival)</span>
                      <label className="relative inline-flex items-center cursor-pointer">
                        <input
                          type="checkbox"
                          name="isNew"
                          defaultChecked={editingProduct?.isNew}
                          className="sr-only peer"
                          onChange={(e) => {
                            const badge = document.getElementById('preview-badge');
                            if (badge) {
                              if (e.target.checked) badge.classList.remove('hidden');
                              else badge.classList.add('hidden');
                            }
                          }}
                        />
                        <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-black"></div>
                      </label>
                    </div>
                  </div>

                  {/* Action Buttons */}
                  <div className="flex gap-4 pt-4">
                    <button
                      type="button"
                      onClick={() => setIsProductModalOpen(false)}
                      className="flex-1 py-4 border border-gray-300 text-gray-700 text-sm font-medium hover:bg-gray-50 transition uppercase tracking-widest"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      className="flex-1 py-4 bg-primary text-white text-sm font-medium hover:bg-black transition uppercase tracking-widest shadow-lg"
                    >
                      {editingProduct ? 'Save Changes' : 'Register Product'}
                    </button>
                  </div>

                  <div className="text-center">
                    <p className="text-xs text-gray-400">
                      * 이 화면은 실제 상품 상세 페이지와 동일한 레이아웃을 사용합니다.
                    </p>
                  </div>
                </div>
              </div>
            </form>
          </div>
        </div>
      )}

      {isInvoiceModalOpen && (
        <InvoiceModal
          orders={orders.filter(o => selectedOrderIds.includes(o.id))}
          onClose={() => setIsInvoiceModalOpen(false)}
        />
      )}

      {isBannerModalOpen && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4 backdrop-blur-sm">
          <div className="bg-white rounded-lg shadow-2xl max-w-lg w-full p-6">
            <h2 className="text-lg font-bold mb-6 text-gray-800 border-b pb-2">
              {editingBanner ? '배너 수정' : '배너 등록'}
            </h2>
            <form onSubmit={(e) => { e.preventDefault(); setIsBannerModalOpen(false); }} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-gray-600 mb-1">제목</label>
                <input defaultValue={editingBanner?.title} className="w-full border border-gray-300 p-2 text-sm rounded-sm outline-none" />
              </div>
              <div>
                <label className="block text-xs font-bold text-gray-600 mb-1">이미지 URL</label>
                <input defaultValue={editingBanner?.imageUrl} className="w-full border border-gray-300 p-2 text-sm rounded-sm outline-none" />
              </div>
              <div>
                <label className="block text-xs font-bold text-gray-600 mb-1">링크</label>
                <input defaultValue={editingBanner?.link} className="w-full border border-gray-300 p-2 text-sm rounded-sm outline-none" />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-gray-600 mb-1">시작일</label>
                  <input type="date" defaultValue={editingBanner?.startDate} className="w-full border border-gray-300 p-2 text-sm rounded-sm outline-none" />
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-600 mb-1">종료일</label>
                  <input type="date" defaultValue={editingBanner?.endDate} className="w-full border border-gray-300 p-2 text-sm rounded-sm outline-none" />
                </div>
              </div>
              <div className="flex space-x-2 pt-4">
                <button type="button" onClick={() => setIsBannerModalOpen(false)} className="flex-1 py-2.5 border border-gray-300 text-gray-700 text-sm font-medium hover:bg-gray-50 transition rounded-sm">취소</button>
                <button type="submit" className="flex-1 py-2.5 bg-blue-600 text-white text-sm font-medium hover:bg-blue-700 transition rounded-sm shadow-sm">저장</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {isPromotionModalOpen && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4 backdrop-blur-sm">
          <div className="bg-white rounded-lg shadow-2xl max-w-2xl w-full p-6 max-h-[90vh] overflow-y-auto">
            <h2 className="text-lg font-bold mb-6 text-gray-800 border-b pb-2">
              {editingPromotion ? '기획전 수정' : '기획전 생성'}
            </h2>
            <form onSubmit={(e) => { e.preventDefault(); setIsPromotionModalOpen(false); }} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-gray-600 mb-1">기획전명</label>
                <input defaultValue={editingPromotion?.title} className="w-full border border-gray-300 p-2 text-sm rounded-sm outline-none" />
              </div>
              <div>
                <label className="block text-xs font-bold text-gray-600 mb-1">설명</label>
                <textarea defaultValue={editingPromotion?.description} rows={2} className="w-full border border-gray-300 p-2 text-sm rounded-sm outline-none resize-none" />
              </div>
              <div>
                <label className="block text-xs font-bold text-gray-600 mb-1">배너 이미지 URL</label>
                <input defaultValue={editingPromotion?.bannerImage} className="w-full border border-gray-300 p-2 text-sm rounded-sm outline-none" />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-gray-600 mb-1">시작일</label>
                  <input type="date" defaultValue={editingPromotion?.startDate} className="w-full border border-gray-300 p-2 text-sm rounded-sm outline-none" />
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-600 mb-1">종료일</label>
                  <input type="date" defaultValue={editingPromotion?.endDate} className="w-full border border-gray-300 p-2 text-sm rounded-sm outline-none" />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-600 mb-1">상품 선택</label>
                <div className="border border-gray-300 rounded-sm p-2 max-h-40 overflow-y-auto bg-gray-50">
                  {products.map(product => (
                    <label key={product.id} className="flex items-center space-x-2 p-1 hover:bg-white rounded cursor-pointer">
                      <input type="checkbox" className="rounded text-blue-500" defaultChecked={editingPromotion?.productIds.includes(product.id)} />
                      <img src={product.image} alt="" className="w-6 h-6 rounded object-cover" />
                      <span className="text-sm text-gray-700">{product.name}</span>
                    </label>
                  ))}
                </div>
              </div>

              <div className="flex space-x-2 pt-4">
                <button type="button" onClick={() => setIsPromotionModalOpen(false)} className="flex-1 py-2.5 border border-gray-300 text-gray-700 text-sm font-medium hover:bg-gray-50 transition rounded-sm">취소</button>
                <button type="submit" className="flex-1 py-2.5 bg-blue-600 text-white text-sm font-medium hover:bg-blue-700 transition rounded-sm shadow-sm">저장</button>
              </div>
            </form>
          </div>
        </div>
      )}

      <ConfirmModal
        isOpen={confirmModal.isOpen}
        onClose={closeConfirmModal}
        onConfirm={confirmModal.onConfirm}
        title={confirmModal.title}
        message={confirmModal.message}
        isDestructive={confirmModal.isDestructive}
        confirmLabel={confirmModal.confirmLabel}
        cancelLabel={confirmModal.cancelLabel}
      />
    </div>
  );
};

export default Admin;


