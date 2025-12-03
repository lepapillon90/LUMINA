import React from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { BANK_INFO } from '../constants';
import { Check } from 'lucide-react';

const CheckoutSuccess: React.FC = () => {
    const [searchParams] = useSearchParams();
    const orderId = searchParams.get('orderId');
    const total = searchParams.get('total');

    return (
        <div className="pt-32 pb-20 min-h-screen bg-[#FDFBF7] flex items-center justify-center px-4">
            <div className="max-w-2xl w-full bg-white p-10 md:p-16 shadow-xl border border-stone-100 text-center relative overflow-hidden">
                {/* Decorative Top Border */}
                <div className="absolute top-0 left-0 w-full h-1 bg-black"></div>

                <div className="mb-8 flex justify-center">
                    <div className="w-16 h-16 border-2 border-black rounded-full flex items-center justify-center">
                        <Check size={32} className="text-black" strokeWidth={1.5} />
                    </div>
                </div>

                <h1 className="text-4xl font-serif mb-4 tracking-tight text-gray-900">주문이 완료되었습니다</h1>
                <p className="text-lg text-gray-600 mb-10 font-light">
                    고객님의 주문이 성공적으로 접수되었습니다.
                </p>

                <div className="space-y-2 mb-12">
                    <p className="text-sm text-gray-500 uppercase tracking-widest">주문번호 (Order No.)</p>
                    <p className="text-xl font-mono text-gray-900">{orderId}</p>
                </div>

                <div className="bg-stone-50 p-8 mb-12 border border-stone-200 text-left relative">
                    {/* Receipt jagged edge effect (simulated with border/shadow or just clean box) */}
                    <div className="absolute top-0 left-1/2 transform -translate-x-1/2 -translate-y-1/2 bg-white px-4 text-sm text-gray-400 tracking-widest uppercase">
                        Payment Info
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                        <div>
                            <p className="text-xs text-gray-400 uppercase tracking-wider mb-2">은행명</p>
                            <p className="font-serif text-lg">{BANK_INFO.bankName}</p>
                        </div>
                        <div>
                            <p className="text-xs text-gray-400 uppercase tracking-wider mb-2">예금주</p>
                            <p className="font-serif text-lg">{BANK_INFO.holder}</p>
                        </div>
                        <div className="md:col-span-2">
                            <p className="text-xs text-gray-400 uppercase tracking-wider mb-2">계좌번호</p>
                            <p className="font-mono text-xl tracking-wider text-gray-800">{BANK_INFO.accountNumber}</p>
                        </div>
                        <div className="md:col-span-2 pt-4 border-t border-stone-200 flex justify-between items-end">
                            <span className="text-sm text-gray-500">총 결제금액</span>
                            <span className="text-2xl font-serif font-bold">₩{total ? parseInt(total).toLocaleString() : '0'}</span>
                        </div>
                    </div>
                </div>

                <p className="text-sm text-gray-500 mb-10 leading-relaxed">
                    24시간 이내에 위 계좌로 입금해 주시면 주문이 최종 확정됩니다.<br />
                    입금 확인 후 배송이 시작됩니다.
                </p>

                <div className="flex flex-col md:flex-row gap-4 justify-center">
                    <Link
                        to="/mypage"
                        className="px-8 py-4 bg-black text-white text-sm uppercase tracking-widest hover:bg-gray-800 transition duration-300 min-w-[200px]"
                    >
                        주문 내역 확인
                    </Link>
                    <Link
                        to="/"
                        className="px-8 py-4 bg-white border border-gray-300 text-gray-900 text-sm uppercase tracking-widest hover:bg-gray-50 transition duration-300 min-w-[200px]"
                    >
                        쇼핑 계속하기
                    </Link>
                </div>
            </div>
        </div>
    );
};

export default CheckoutSuccess;
