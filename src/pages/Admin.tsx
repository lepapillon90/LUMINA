
import React, { useState, useMemo, useEffect } from 'react';
import { useAuth } from '../contexts';
import { Navigate } from 'react-router-dom';
import { InvoiceModal } from '../components/Admin/InvoiceModal';
import { UserRole, Product, Order, Customer, User, UserPermissions } from '../types';
import { PRODUCTS } from '../constants';
import { getAdminUsers, promoteToAdmin, updateAdminUser, deleteAdminUser, createAdminUser, sendAdminPasswordReset, changeOwnPassword, toggleAdminStatus } from '../services/adminService';
import {
  Home,
  ShoppingCart,
  Package,
  Users,
  MessageCircle,
  FileText,
  Palette,
  Percent,
  LineChart,
  BarChart2,
  Grid,
  Settings,
  LogOut,
  Plus,
  Edit3,
  Trash2,
  Search,
  MoreHorizontal,
  RefreshCw,
  ExternalLink,
  HelpCircle,
  Pause,
  Maximize2,
  ArrowDown,
  Printer,
  Shield,
  Power
} from 'lucide-react';
import ConfirmModal from '../components/ConfirmModal';

const INITIAL_ORDERS: Order[] = [
  { id: 'ORD-2023-001', userId: 'mock-user-1', items: [], customerName: '김민지', date: '2023-10-24', total: 150000, status: '배송준비중' },
  { id: 'ORD-2023-002', userId: 'mock-user-2', items: [], customerName: '이수진', date: '2023-10-25', total: 45000, status: '입금대기' },
  { id: 'ORD-2023-003', userId: 'mock-user-3', items: [], customerName: '박지훈', date: '2023-10-25', total: 120000, status: '배송중' },
  { id: 'ORD-2023-004', userId: 'mock-user-4', items: [], customerName: '최유나', date: '2023-10-26', total: 32000, status: '배송완료' },
  { id: 'ORD-2023-005', userId: 'mock-user-5', items: [], customerName: '정우성', date: '2023-10-26', total: 89000, status: '결제완료' },
];

const INITIAL_CUSTOMERS: Customer[] = [
  { id: 'CUST-001', name: '김민지', email: 'minji@example.com', phone: '010-1234-5678', joinDate: '2023-01-15', totalSpent: 450000, grade: 'Gold' },
  { id: 'CUST-002', name: '이수진', email: 'sujin@example.com', phone: '010-2345-6789', joinDate: '2023-02-20', totalSpent: 120000, grade: 'Silver' },
  { id: 'CUST-003', name: '박지훈', email: 'jihoon@example.com', phone: '010-3456-7890', joinDate: '2023-03-10', totalSpent: 890000, grade: 'VIP' },
  { id: 'CUST-004', name: '최유나', email: 'yuna@example.com', phone: '010-4567-8901', joinDate: '2023-05-05', totalSpent: 50000, grade: 'Bronze' },
  { id: 'CUST-005', name: '정우성', email: 'woosung@example.com', phone: '010-5678-9012', joinDate: '2023-06-12', totalSpent: 230000, grade: 'Silver' },
];

// --- Complex Chart Components (Custom SVG) ---

// Daily Sales Status Component
const DailySalesStats = () => {
  const dates = ['11-22', '11-23', '11-24', '11-25', '11-26', '11-27', '11-28'];
  // Mocking 0 values as per the requested image design
  const data = dates.map(() => ({ order: 0, payment: 0, refund: 0 }));

  const tableData = [
    { date: '11월 26일', orderPrice: 0, orderCount: 0, payPrice: 0, payCount: 0, refundPrice: 0, refundCount: 0 },
    { date: '11월 27일', orderPrice: 0, orderCount: 0, payPrice: 0, payCount: 0, refundPrice: 0, refundCount: 0 },
    { date: '11월 28일', isToday: true, orderPrice: 0, orderCount: 0, payPrice: 0, payCount: 0, refundPrice: 0, refundCount: 0 },
  ];

  const statsData = [
    { label: '최근 7일 평균', orderPrice: 0, orderCount: 0, payPrice: 0, payCount: 0, refundPrice: 0, refundCount: 0 },
    { label: '최근 7일 합계', orderPrice: 0, orderCount: 0, payPrice: 0, payCount: 0, refundPrice: 0, refundCount: 0 },
    { label: '최근 30일 평균', orderPrice: 0, orderCount: 0, payPrice: 0, payCount: 0, refundPrice: 0, refundCount: 0 },
    { label: '최근 30일 합계', orderPrice: 0, orderCount: 0, payPrice: 0, payCount: 0, refundPrice: 0, refundCount: 0 },
  ];

  return (
    <div className="flex flex-col xl:flex-row gap-8 mt-2">
      {/* Chart Section */}
      <div className="flex-1 min-w-[300px]">
        <div className="flex justify-between items-center mb-6 text-xs text-gray-500">
          <span>단위/만원</span>
          <span>2025-11-28 07:00 기준</span>
        </div>

        {/* Chart Area */}
        <div className="relative h-64 w-full mb-4">
          {/* Grid Lines */}
          <div className="absolute inset-0 flex flex-col justify-between pointer-events-none">
            {[0, 1].map((_, i) => (
              <div key={i} className={`w-full border-b ${i === 1 ? 'border-gray-300' : 'border-gray-100'} h-0 flex items-center`}>
                <span className="absolute -left-6 text-xs text-gray-400">{i === 1 ? 0 : ''}</span>
              </div>
            ))}
          </div>

          {/* Lines (Simulated Flat Lines at 0) */}
          <div className="absolute bottom-0 left-0 w-full h-full flex items-end">
            <div className="w-full h-[1px] bg-gray-300 relative">
              {/* Markers */}
              {dates.map((d, i) => (
                <div key={i} className="absolute transform -translate-x-1/2 flex flex-col items-center" style={{ left: `${(i / (dates.length - 1)) * 100}%`, bottom: '-6px' }}>
                  <div className="w-2 h-2 rounded-full border-2 border-purple-400 bg-white z-20 mb-[-6px]"></div>
                  <div className="w-2 h-2 rounded-full border-2 border-pink-400 bg-white z-20 mb-[-6px]"></div>
                  <div className="w-2 h-2 rounded-full border-2 border-blue-400 bg-white z-20"></div>
                </div>
              ))}
            </div>
          </div>

          {/* X Axis Labels */}
          <div className="absolute top-full w-full flex justify-between mt-2 text-xs text-gray-500">
            {dates.map((d, i) => <span key={i}>{d}</span>)}
          </div>
        </div>

        {/* Custom Range Slider UI */}
        <div className="mt-12 bg-blue-50 h-10 rounded-sm relative border border-blue-100 flex items-center px-2">
          <div className="absolute left-0 top-0 bottom-0 bg-blue-400 w-2 rounded-l-sm"></div>
          <div className="absolute right-0 top-0 bottom-0 bg-blue-400 w-2 rounded-r-sm"></div>
          <div className="absolute left-0 right-0 h-full border-t-2 border-b-2 border-blue-200 mx-2"></div>
          <div className="w-full flex justify-between px-1 z-10">
            <div className="w-6 h-6 bg-blue-500 rounded flex items-center justify-center text-white shadow-sm cursor-pointer">
              <Pause size={12} fill="white" />
            </div>
            <div className="w-6 h-6 bg-blue-500 rounded flex items-center justify-center text-white shadow-sm cursor-pointer">
              <Pause size={12} fill="white" />
            </div>
          </div>
        </div>

        {/* Legend */}
        <div className="flex justify-center space-x-6 mt-4 text-xs font-medium text-gray-600">
          <div className="flex items-center"><span className="w-2 h-2 bg-blue-400 mr-2 rounded-sm"></span>주문</div>
          <div className="flex items-center"><span className="w-2 h-2 border-2 border-pink-400 rounded-full mr-2"></span>결제</div>
          <div className="flex items-center"><span className="w-2 h-2 border-2 border-purple-400 rounded-full mr-2"></span>환불(취소/반품)</div>
        </div>
      </div>

      {/* Table Section */}
      <div className="flex-1 min-w-[300px] border-l border-gray-100 pl-0 xl:pl-8">
        <table className="w-full text-sm">
          <thead className="border-b border-gray-200">
            <tr>
              <th className="font-normal text-gray-500 py-2 text-left w-1/4">기간별 매출</th>
              <th className="font-normal text-blue-500 py-2 text-right w-1/4 flex items-center justify-end gap-1"><span className="w-1.5 h-1.5 bg-blue-500 rounded-sm"></span> 주문</th>
              <th className="font-normal text-pink-500 py-2 text-right w-1/4 flex items-center justify-end gap-1"><span className="w-1.5 h-1.5 border border-pink-500 rounded-full"></span> 결제</th>
              <th className="font-normal text-purple-500 py-2 text-right w-1/4 flex items-center justify-end gap-1"><span className="w-1.5 h-1.5 border border-purple-500 rounded-full"></span> 환불</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {/* Daily Rows */}
            {tableData.map((row, idx) => (
              <tr key={idx} className="group hover:bg-gray-50">
                <td className="py-4 align-top">
                  <div className="flex items-center">
                    <span className={`font-medium ${row.isToday ? 'text-gray-900' : 'text-gray-600'}`}>{row.date}</span>
                    {row.isToday && <span className="ml-2 bg-blue-500 text-white text-[10px] px-1.5 py-0.5 rounded-sm font-light">오늘</span>}
                  </div>
                </td>
                <td className="py-4 text-right align-top">
                  <div className="text-gray-800 font-medium">{row.orderPrice}원</div>
                  <div className="text-gray-400 text-xs mt-1">{row.orderCount}건</div>
                </td>
                <td className="py-4 text-right align-top">
                  <div className="text-gray-800 font-medium">{row.payPrice}원</div>
                  <div className="text-gray-400 text-xs mt-1">{row.payCount}건</div>
                </td>
                <td className="py-4 text-right align-top">
                  <div className="text-gray-800 font-medium">{row.refundPrice}원</div>
                  <div className="text-gray-400 text-xs mt-1">{row.refundCount}건</div>
                </td>
              </tr>
            ))}

            {/* Separator Row */}
            <tr><td colSpan={4} className="py-2 border-b border-gray-100"></td></tr>

            {/* Stats Rows */}
            {statsData.map((row, idx) => (
              <tr key={`stat-${idx}`} className={`group hover:bg-gray-50 ${idx % 2 === 1 ? 'bg-blue-50/30' : ''}`}>
                <td className="py-4 align-top font-medium text-gray-700">{row.label}</td>
                <td className="py-4 text-right align-top">
                  <div className="text-gray-800 font-medium">{row.orderPrice}원</div>
                  <div className="text-gray-400 text-xs mt-1">{row.orderCount}건</div>
                </td>
                <td className="py-4 text-right align-top">
                  <div className="text-gray-800 font-medium">{row.payPrice}원</div>
                  <div className="text-gray-400 text-xs mt-1">{row.payCount}건</div>
                </td>
                <td className="py-4 text-right align-top">
                  <div className="text-gray-800 font-medium">{row.refundPrice}원</div>
                  <div className="text-gray-400 text-xs mt-1">{row.refundCount}건</div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

// Member/Points Status Component
const MemberPointsStats = () => {
  const dates = [
    { label: '11월 28일', isToday: true, short: '11-28' },
    { label: '11월 27일', short: '11-27' },
    { label: '11월 26일', short: '11-26' },
    { label: '11월 25일', short: '11-25' },
    { label: '11월 24일', short: '11-24' },
    { label: '11월 23일', short: '11-23' },
    { label: '11월 22일', short: '11-22' },
  ];

  // Reverse for chart (oldest to newest)
  const chartDates = [...dates].reverse();

  return (
    <div className="space-y-6 mt-4">
      {/* Top Cards */}
      <div className="grid grid-cols-2 gap-4">
        <div className="bg-[#f8faff] p-5 rounded-lg border border-blue-50">
          <h4 className="text-gray-500 text-xs mb-2">총 신규 회원 가입 현황</h4>
          <p className="text-2xl font-bold text-gray-800">0 <span className="text-base font-normal text-gray-500">명</span></p>
        </div>
        <div className="bg-[#f8faff] p-5 rounded-lg border border-blue-50">
          <h4 className="text-gray-500 text-xs mb-2">총 적립금 적용 현황</h4>
          <p className="text-2xl font-bold text-gray-800">0 <span className="text-base font-normal text-gray-500">원</span></p>
        </div>
      </div>

      <div className="flex flex-col xl:flex-row gap-8">
        {/* Chart Section */}
        <div className="flex-1 min-w-[300px]">
          <div className="flex justify-between items-center mb-6 text-xs text-gray-500">
            <span>단위/명</span>
          </div>

          <div className="relative h-64 w-full mb-4">
            {/* Grid Lines */}
            <div className="absolute inset-0 flex flex-col justify-between pointer-events-none">
              {[0, 1].map((_, i) => (
                <div key={i} className={`w-full border-b ${i === 1 ? 'border-gray-300' : 'border-gray-100'} h-0 flex items-center`}>
                  <span className="absolute -left-6 text-xs text-gray-400">{i === 1 ? 0 : ''}</span>
                </div>
              ))}
            </div>

            {/* Line Chart */}
            <div className="absolute bottom-0 left-0 w-full h-full flex items-end">
              <div className="w-full h-[1px] bg-orange-400 relative">
                {/* Points */}
                {chartDates.map((d, i) => (
                  <div key={i} className="absolute transform -translate-x-1/2 flex flex-col items-center"
                    style={{ left: `${(i / (chartDates.length - 1)) * 100}%`, bottom: '-1px' }}>
                  </div>
                ))}
              </div>
            </div>

            {/* X Axis Labels */}
            <div className="absolute top-full w-full flex justify-between mt-2 text-xs text-gray-500">
              {chartDates.map((d, i) => <span key={i}>{d.short}</span>)}
            </div>
          </div>

          {/* Slider UI */}
          <div className="mt-12 bg-red-50 h-10 rounded-sm relative border border-red-100 flex items-center px-2">
            <div className="absolute left-0 top-0 bottom-0 bg-red-300 w-2 rounded-l-sm"></div>
            <div className="absolute right-0 top-0 bottom-0 bg-red-300 w-2 rounded-r-sm"></div>
            <div className="absolute left-0 right-0 h-full border-t-2 border-b-2 border-red-100 mx-2"></div>
            <div className="w-full flex justify-between px-1 z-10">
              <div className="w-6 h-6 bg-red-400 rounded flex items-center justify-center text-white shadow-sm cursor-pointer">
                <Pause size={12} fill="white" />
              </div>
              <div className="w-6 h-6 bg-red-400 rounded flex items-center justify-center text-white shadow-sm cursor-pointer">
                <Pause size={12} fill="white" />
              </div>
            </div>
          </div>

          {/* Legend */}
          <div className="flex justify-center mt-4 text-xs font-medium text-gray-600">
            <div className="flex items-center"><span className="w-2 h-2 border-2 border-orange-400 rounded-full mr-2"></span>신규 회원 가입 현황</div>
          </div>
        </div>

        {/* Table Section */}
        <div className="flex-1 min-w-[300px] border-l border-gray-100 pl-0 xl:pl-8">
          <table className="w-full text-sm">
            <thead className="border-b border-gray-200">
              <tr>
                <th className="font-normal text-gray-500 py-2 text-left flex items-center gap-1">날짜 <ArrowDown size={12} /></th>
                <th className="font-normal text-gray-500 py-2 text-right">
                  <span className="flex items-center justify-end gap-1">
                    <span className="w-1.5 h-1.5 border border-orange-500 rounded-full"></span> 신규 회원 가입 현황
                  </span>
                </th>
                <th className="font-normal text-gray-500 py-2 text-right">적립금 적용 현황</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {dates.map((row, idx) => (
                <tr key={idx} className="group hover:bg-gray-50">
                  <td className="py-4 align-top">
                    <div className="flex items-center">
                      <span className={`font-medium ${row.isToday ? 'text-gray-900' : 'text-gray-600'}`}>{row.label}</span>
                      {row.isToday && <span className="ml-2 bg-blue-500 text-white text-[10px] px-1.5 py-0.5 rounded-sm font-light">오늘</span>}
                    </div>
                  </td>
                  <td className="py-4 text-right align-top text-gray-800 font-medium">0명</td>
                  <td className="py-4 text-right align-top text-gray-800 font-medium">0원</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

// Order Processing Status Component
const OrderProcessingStats = () => {
  const dates = [
    { label: '11월 28일', isToday: true },
    { label: '11월 27일' },
    { label: '11월 26일' },
    { label: '11월 25일' },
    { label: '11월 24일' },
    { label: '11월 23일' },
    { label: '11월 22일' },
  ];

  // Initialize all with 0 to match design
  const data = dates.map(d => ({
    ...d,
    preDeposit: 0,
    prep: 0,
    hold: 0,
    shipping: 0,
    completed: 0,
    cancel: 0,
    exchange: 0,
    return: 0,
    total: 0
  }));

  // Summary Row Data
  const summary = {
    preDeposit: 0, prep: 0, hold: 0, shipping: 0, completed: 0, cancel: 0, exchange: 0, return: 0, total: 0
  };

  return (
    <div className="mt-4 overflow-x-auto">
      <table className="w-full text-sm text-center">
        <thead className="text-gray-500 border-b border-gray-100">
          <tr>
            <th className="py-3 font-normal text-left pl-4 flex items-center gap-1 cursor-pointer">
              날짜 <ArrowDown size={12} />
            </th>
            <th className="py-3 font-normal">입금전</th>
            <th className="py-3 font-normal">배송준비중</th>
            <th className="py-3 font-normal">배송대기중</th>
            <th className="py-3 font-normal">배송중</th>
            <th className="py-3 font-normal">배송완료</th>
            <th className="py-3 font-normal">취소</th>
            <th className="py-3 font-normal">교환</th>
            <th className="py-3 font-normal">반품</th>
            <th className="py-3 font-normal pr-4">주문합계</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-50">
          {/* Summary Row */}
          <tr className="bg-[#f0f9ff]/50 font-bold text-gray-800">
            <td className="py-4 text-left pl-4 text-gray-800">합계</td>
            <td>{summary.preDeposit}</td>
            <td>{summary.prep}</td>
            <td>0</td>
            <td>{summary.shipping}</td>
            <td>{summary.completed}</td>
            <td>{summary.cancel}</td>
            <td>{summary.exchange}</td>
            <td>{summary.return}</td>
            <td className="pr-4">{summary.total}</td>
          </tr>

          {/* Daily Rows */}
          {data.map((row, idx) => (
            <tr key={idx} className="hover:bg-gray-50 transition">
              <td className="py-4 text-left pl-4 font-medium text-gray-600 flex items-center">
                {row.label}
                {row.isToday && <span className="ml-2 bg-blue-500 text-white text-[10px] px-1.5 py-0.5 rounded-sm font-light">오늘</span>}
              </td>
              <td className="text-gray-900">{row.preDeposit}</td>
              <td className="text-gray-900">{row.prep}</td>
              <td className="text-gray-900">{row.hold}</td>
              <td className="text-gray-900">{row.shipping}</td>
              <td className="text-gray-900">{row.completed}</td>
              <td className="text-gray-900">{row.cancel}</td>
              <td className="text-gray-900">{row.exchange}</td>
              <td className="text-gray-900">{row.return}</td>
              <td className="pr-4 font-medium text-gray-900">{row.total}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

// Post Status Component
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

  const handleSaveProduct = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);

    // Validation
    const name = formData.get('name') as string;
    const price = Number(formData.get('price'));
    const image = formData.get('image') as string;

    if (!name || price === 0 || !image) {
      alert('필수 정보를 모두 입력해주세요.');
      return;
    }

    if (price < 0) {
      alert('상품 가격은 0원 이상이어야 합니다.');
      return;
    }

    const newProduct: any = {
      name: name,
      price: price,
      category: formData.get('category'),
      image: image,
      description: formData.get('description'),
      isNew: formData.get('isNew') === 'on'
    };

    if (editingProduct) {
      setProducts(prev => prev.map(p => p.id === editingProduct.id ? { ...newProduct, id: editingProduct.id } : p));
    } else {
      const newId = Math.max(...products.map(p => p.id), 0) + 1;
      setProducts(prev => [...prev, { ...newProduct, id: newId }]);
    }
    setIsProductModalOpen(false);
    setEditingProduct(null);
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
              <span className="text-xs text-gray-500 mb-1">게시물관리</span>
              <span className="text-lg font-bold text-gray-800">2</span>
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

  const renderProducts = () => (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-bold text-gray-800 flex items-center gap-2">
          <Package size={20} /> 상품 관리
        </h2>
        <button
          onClick={() => { setEditingProduct(null); setIsProductModalOpen(true); }}
          className="flex items-center space-x-2 bg-slate-700 text-white px-4 py-2 rounded-sm text-sm hover:bg-slate-800 transition"
        >
          <Plus size={16} />
          <span>상품 등록</span>
        </button>
      </div>

      <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-gray-50 text-gray-600 border-b border-gray-200">
              <tr>
                <th className="px-6 py-3 font-medium">상품 정보</th>
                <th className="px-6 py-3 font-medium">카테고리</th>
                <th className="px-6 py-3 font-medium">가격</th>
                <th className="px-6 py-3 font-medium text-right">관리</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {products.map(product => (
                <tr key={product.id} className="hover:bg-gray-50 transition">
                  <td className="px-6 py-4">
                    <div className="flex items-center space-x-4">
                      <img src={product.image} alt={product.name} className="w-12 h-12 object-cover rounded border border-gray-100" />
                      <div>
                        <p className="font-bold text-gray-800">{product.name}</p>
                        <p className="text-xs text-gray-400 truncate max-w-[200px]">{product.description}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-gray-600 capitalize">
                    {product.category === 'earring' ? '귀걸이' : product.category === 'necklace' ? '목걸이' : product.category === 'ring' ? '반지' : '팔찌'}
                  </td>
                  <td className="px-6 py-4 font-medium text-slate-700">₩{product.price.toLocaleString()}</td>
                  <td className="px-6 py-4 text-right space-x-2">
                    <button
                      onClick={() => { setEditingProduct(product); setIsProductModalOpen(true); }}
                      className="p-1.5 border border-gray-200 rounded text-gray-500 hover:text-blue-600 hover:border-blue-300 transition"
                    >
                      <Edit3 size={16} />
                    </button>
                    <button
                      onClick={() => handleDeleteProduct(product.id)}
                      className="p-1.5 border border-gray-200 rounded text-gray-500 hover:text-red-600 hover:border-red-300 transition"
                    >
                      <Trash2 size={16} />
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

  const renderOrders = () => {
    const statusColors: any = {
      '입금대기': 'bg-white border border-gray-200 text-gray-600',
      '결제완료': 'bg-blue-50 border border-blue-100 text-blue-600',
      '배송중': 'bg-indigo-50 border border-indigo-100 text-indigo-600',
      '배송완료': 'bg-gray-100 border border-gray-200 text-gray-500'
    };

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
                  <tr key={order.id} className={`hover:bg-gray-50 transition ${selectedOrderIds.includes(order.id) ? 'bg-blue-50/30' : ''}`}>
                    <td className="px-6 py-4">
                      <input
                        type="checkbox"
                        checked={selectedOrderIds.includes(order.id)}
                        onChange={() => handleSelectOrder(order.id)}
                        className="rounded text-blue-500 focus:ring-blue-500"
                      />
                    </td>
                    <td className="px-6 py-4 font-mono text-xs text-gray-500">{order.id}</td>
                    <td className="px-6 py-4 text-gray-600">{order.date}</td>
                    <td className="px-6 py-4 font-medium">{order.customerName}</td>
                    <td className="px-6 py-4 font-medium">₩{order.total.toLocaleString()}</td>
                    <td className="px-6 py-4">
                      <select
                        value={order.status}
                        onChange={(e) => handleUpdateOrderStatus(order.id, e.target.value)}
                        className={`px-3 py-1 rounded-sm text-xs font-medium focus:ring-0 cursor-pointer outline-none ${statusColors[order.status]}`}
                      >
                        <option value="입금대기">입금대기</option>
                        <option value="결제완료">결제완료</option>
                        <option value="배송중">배송중</option>
                        <option value="배송완료">배송완료</option>
                      </select>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <button className="text-gray-400 hover:text-slate-700">
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

  const renderCustomers = () => (
    <div className="space-y-6">
      <h2 className="text-xl font-bold text-gray-800 flex items-center gap-2">
        <Users size={20} /> 고객 관리
      </h2>

      <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
        <div className="p-4 border-b border-gray-200 flex justify-between items-center bg-gray-50">
          <div className="flex items-center flex-1 max-w-sm bg-white border border-gray-300 rounded-sm px-3 py-1.5">
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
                <th className="px-6 py-3 font-medium">가입일</th>
                <th className="px-6 py-3 font-medium">총 구매액</th>
                <th className="px-6 py-3 font-medium">등급</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {customers.map(customer => (
                <tr key={customer.id} className="hover:bg-gray-50 transition">
                  <td className="px-6 py-4 font-medium text-gray-800">{customer.name}</td>
                  <td className="px-6 py-4">
                    <p className="text-gray-900">{customer.phone}</p>
                    <p className="text-xs text-gray-400">{customer.email}</p>
                  </td>
                  <td className="px-6 py-4 text-gray-600">{customer.joinDate}</td>
                  <td className="px-6 py-4 text-slate-700">₩{customer.totalSpent.toLocaleString()}</td>
                  <td className="px-6 py-4">
                    <span className={`px-2 py-0.5 rounded-sm text-xs font-medium border
                      ${customer.grade === 'VIP' ? 'bg-purple-50 text-purple-700 border-purple-100' :
                        customer.grade === 'Gold' ? 'bg-yellow-50 text-yellow-700 border-yellow-100' :
                          customer.grade === 'Silver' ? 'bg-gray-50 text-gray-700 border-gray-200' : 'bg-orange-50 text-orange-700 border-orange-100'}`}>
                      {customer.grade}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );

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

        {/* User Modal */}
        {isUserModalOpen && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white p-6 rounded-lg w-full max-w-md">
              <h3 className="text-lg font-bold mb-4">{editingUser ? '관리자 수정' : '관리자 추가'}</h3>
              <form onSubmit={handleSaveUser} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-1">이메일</label>
                  <input
                    type="email"
                    name="email"
                    defaultValue={editingUser?.email}
                    disabled={!!editingUser}
                    className="w-full border p-2 rounded-sm disabled:bg-gray-100"
                    placeholder="email@lumina.com"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">이름</label>
                  <input
                    type="text"
                    name="username"
                    defaultValue={editingUser?.username}
                    className="w-full border p-2 rounded-sm"
                    placeholder="이름"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">아이디</label>
                  <input
                    type="text"
                    name="displayId"
                    defaultValue={editingUser?.displayId}
                    className="w-full border p-2 rounded-sm"
                    placeholder="관리자 아이디"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">직급</label>
                  <input
                    type="text"
                    name="jobTitle"
                    defaultValue={editingUser?.jobTitle}
                    className="w-full border p-2 rounded-sm"
                    placeholder="예: 매니저, 팀장"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">연락처</label>
                  <input
                    type="tel"
                    name="phoneNumber"
                    defaultValue={editingUser?.phoneNumber}
                    className="w-full border p-2 rounded-sm"
                    placeholder="010-0000-0000"
                  />
                </div>

                {!editingUser && (
                  <div>
                    <label className="block text-sm font-medium mb-1">비밀번호 (신규 생성 시)</label>
                    <input
                      type="password"
                      name="password"
                      className="w-full border p-2 rounded-sm"
                      placeholder="비밀번호 (입력 시 신규 계정 생성)"
                      minLength={6}
                    />
                    <p className="text-xs text-gray-500 mt-1">* 비워두면 기존 가입자를 이메일로 찾아 관리자로 승격합니다.</p>
                  </div>
                )}

                <div>
                  <label className="block text-sm font-medium mb-2">권한 설정</label>
                  <div className="space-y-2">
                    <label className="flex items-center gap-2">
                      <input type="checkbox" name="perm_orders" defaultChecked={editingUser?.permissions?.orders} /> 주문 관리
                    </label>
                    <label className="flex items-center gap-2">
                      <input type="checkbox" name="perm_products" defaultChecked={editingUser?.permissions?.products} /> 상품 관리
                    </label>
                    <label className="flex items-center gap-2">
                      <input type="checkbox" name="perm_customers" defaultChecked={editingUser?.permissions?.customers} /> 고객 관리
                    </label>
                    <label className="flex items-center gap-2">
                      <input type="checkbox" name="perm_analytics" defaultChecked={editingUser?.permissions?.analytics} /> 애널리틱스
                    </label>
                    <label className="flex items-center gap-2">
                      <input type="checkbox" name="perm_system" defaultChecked={editingUser?.permissions?.system} /> 시스템 관리
                    </label>
                  </div>
                </div>

                {editingUser && editingUser.uid !== user?.uid && (
                  <div className="pt-4 border-t">
                    <button
                      type="button"
                      onClick={() => handleSendResetEmail(editingUser.email)}
                      className="text-sm text-blue-600 hover:underline"
                    >
                      비밀번호 재설정 이메일 발송
                    </button>
                  </div>
                )}

                <div className="flex justify-end gap-2 mt-6">
                  <button type="button" onClick={() => setIsUserModalOpen(false)} className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-sm">취소</button>
                  <button type="submit" className="px-4 py-2 bg-primary text-white rounded-sm hover:bg-black">저장</button>
                </div>
              </form>

              {editingUser && editingUser.uid === user?.uid && (
                <div className="mt-8 pt-6 border-t">
                  <h4 className="font-bold mb-4">내 비밀번호 변경</h4>
                  <form onSubmit={handleChangePassword} className="space-y-3">
                    <input
                      type="password"
                      name="newPassword"
                      className="w-full border p-2 rounded-sm"
                      placeholder="새 비밀번호 (6자 이상)"
                      minLength={6}
                      required
                    />
                    <button type="submit" className="w-full px-4 py-2 bg-gray-800 text-white rounded-sm hover:bg-black text-sm">
                      비밀번호 변경
                    </button>
                  </form>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    );
  };

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
    <div className="flex h-screen bg-[#f1f5f9] font-sans">
      {/* Sidebar */}
      <aside className="w-60 bg-[#1e293b] text-slate-300 flex flex-col shrink-0">
        <div className="p-5 border-b border-slate-700/50">
          <h1 className="text-lg font-bold text-white tracking-wider flex items-center gap-2">
            <div className="w-5 h-5 bg-blue-500 rounded-sm"></div>
            LUMINA
          </h1>
          <p className="text-[10px] text-slate-500 mt-1 uppercase tracking-widest">Administrator</p>
        </div>

        <nav className="flex-1 overflow-y-auto py-2">
          <ul className="space-y-0.5">
            {filteredMenuItems.map((item) => {
              const Icon = item.icon;
              const isActive = activeTab === item.id;
              return (
                <li key={item.id}>
                  <button
                    onClick={() => setActiveTab(item.id as Tab)}
                    className={`w-full flex items-center space-x-3 px-5 py-3 text-sm transition-all duration-200 group relative
                      ${isActive
                        ? 'bg-[#0f172a] text-white'
                        : 'hover:bg-[#334155] hover:text-white'
                      }`}
                  >
                    {isActive && <div className="absolute left-0 top-0 bottom-0 w-1 bg-blue-500"></div>}
                    <Icon size={18} className={isActive ? 'text-blue-400' : 'text-slate-400 group-hover:text-white'} />
                    <span className="font-medium">{item.label}</span>
                  </button>
                </li>
              );
            })}
          </ul>
        </nav>

        <div className="p-4 border-t border-slate-700/50 bg-[#1e293b]">
          <button
            onClick={logout}
            className="flex items-center justify-center w-full space-x-2 text-slate-400 hover:text-white transition text-xs py-2 border border-slate-600 rounded hover:border-slate-500"
          >
            <LogOut size={14} />
            <span>로그아웃</span>
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 overflow-y-auto">
        {/* Header Bar */}
        <header className="bg-white h-14 shadow-sm flex items-center justify-between px-6 sticky top-0 z-20 border-b border-gray-200">
          <h2 className="font-bold text-gray-700 text-sm">
            {MENU_ITEMS.find(m => m.id === activeTab)?.label}
          </h2>
          <div className="flex items-center space-x-4">
            <div className="text-right hidden sm:block">
              <p className="text-sm font-bold text-gray-700">{user?.username || 'Admin'}</p>
              <p className="text-[10px] text-gray-400">{user?.email}</p>
            </div>
            <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center border border-blue-200 text-blue-600 font-bold text-xs">
              {user?.username?.[0] || 'A'}
            </div>
          </div>
        </header>

        <div className="p-6 max-w-[1600px] mx-auto">
          {activeTab === 'home' && renderHome()}
          {activeTab === 'products' && renderProducts()}
          {activeTab === 'orders' && renderOrders()}
          {activeTab === 'customers' && renderCustomers()}
          {activeTab === 'system' && renderSystem()}
          {activeTab === 'analytics' && renderHome()}
          {activeTab === 'stats' && renderHome()}
          {['messages', 'board', 'design', 'promotion', 'excel'].includes(activeTab) && renderPlaceholder(MENU_ITEMS.find(m => m.id === activeTab)?.label || '')}
        </div>
      </main>

      {/* Product Modal */}
      {isProductModalOpen && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4 backdrop-blur-sm">
          <div className="bg-white rounded-lg shadow-2xl max-w-lg w-full p-6 max-h-[90vh] overflow-y-auto">
            <h2 className="text-lg font-bold mb-6 text-gray-800 border-b pb-2">
              {editingProduct ? '상품 정보 수정' : '신규 상품 등록'}
            </h2>
            <form onSubmit={handleSaveProduct} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-gray-600 mb-1">상품명 <span className="text-red-500">*</span></label>
                <input name="name" defaultValue={editingProduct?.name} required className="w-full border border-gray-300 p-2 text-sm rounded-sm focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none transition" />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-gray-600 mb-1">카테고리</label>
                  <select name="category" defaultValue={editingProduct?.category || 'earring'} className="w-full border border-gray-300 p-2 text-sm rounded-sm outline-none bg-white">
                    <option value="earring">귀걸이</option>
                    <option value="necklace">목걸이</option>
                    <option value="ring">반지</option>
                    <option value="bracelet">팔찌</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-600 mb-1">판매가 <span className="text-red-500">*</span></label>
                  <input name="price" type="number" defaultValue={editingProduct?.price} required className="w-full border border-gray-300 p-2 text-sm rounded-sm outline-none" />
                </div>
              </div>
              <div>
                <label className="block text-xs font-bold text-gray-600 mb-1">이미지 URL <span className="text-red-500">*</span></label>
                <input name="image" defaultValue={editingProduct?.image || 'https://picsum.photos/400/500'} required className="w-full border border-gray-300 p-2 text-sm rounded-sm outline-none" />
              </div>
              <div>
                <label className="block text-xs font-bold text-gray-600 mb-1">상품 설명</label>
                <textarea name="description" defaultValue={editingProduct?.description} rows={3} required className="w-full border border-gray-300 p-2 text-sm rounded-sm outline-none resize-none" />
              </div>
              <div className="flex items-center space-x-2 bg-gray-50 p-2 rounded-sm border border-gray-100">
                <input type="checkbox" name="isNew" id="isNew" defaultChecked={editingProduct?.isNew} className="rounded text-blue-500 focus:ring-blue-500" />
                <label htmlFor="isNew" className="text-sm text-gray-700">신상품 (NEW) 뱃지 노출</label>
              </div>

              <div className="flex space-x-2 pt-4">
                <button type="button" onClick={() => setIsProductModalOpen(false)} className="flex-1 py-2.5 border border-gray-300 text-gray-700 text-sm font-medium hover:bg-gray-50 transition rounded-sm">취소</button>
                <button type="submit" className="flex-1 py-2.5 bg-blue-600 text-white text-sm font-medium hover:bg-blue-700 transition rounded-sm shadow-sm">
                  {editingProduct ? '저장하기' : '등록하기'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Invoice Modal */}
      {isInvoiceModalOpen && (
        <InvoiceModal
          orders={orders.filter(o => selectedOrderIds.includes(o.id))}
          onClose={() => setIsInvoiceModalOpen(false)}
        />
      )}

      {/* Confirm Modal */}
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
