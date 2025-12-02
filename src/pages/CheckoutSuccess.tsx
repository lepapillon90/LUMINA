import React from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { BANK_INFO } from '../constants';
import { CheckCircle2 } from 'lucide-react';

const CheckoutSuccess: React.FC = () => {
    const [searchParams] = useSearchParams();
    const orderId = searchParams.get('orderId');
    const total = searchParams.get('total');

    return (
        <div className="pt-32 pb-20 min-h-screen bg-gray-50 flex items-center justify-center px-4">
            <div className="bg-white p-8 md:p-12 rounded-lg shadow-lg max-w-lg w-full text-center">
                <div className="w-16 h-16 bg-green-100 text-green-600 rounded-full flex items-center justify-center mx-auto mb-6">
                    <CheckCircle2 size={32} />
                </div>
                <h2 className="text-2xl font-serif mb-4">주문이 완료되었습니다!</h2>
                <p className="text-gray-600 mb-8">
                    감사합니다. 주문이 정상적으로 접수되었습니다.<br />
                    24시간 이내에 아래 계좌로 입금해주시면 주문이 확정됩니다.
                </p>

                {orderId && (
                    <div className="mb-6 text-sm text-gray-500">
                        주문번호: <span className="font-mono">{orderId}</span>
                    </div>
                )}

                <div className="bg-gray-50 p-6 rounded border border-gray-200 text-left mb-8">
                    <p className="text-sm text-gray-500 mb-1">은행명</p>
                    <p className="font-medium mb-3">{BANK_INFO.bankName}</p>
                    <p className="text-sm text-gray-500 mb-1">계좌번호</p>
                    <p className="font-medium mb-3 tracking-widest">{BANK_INFO.accountNumber}</p>
                    <p className="text-sm text-gray-500 mb-1">예금주</p>
                    <p className="font-medium mb-3">{BANK_INFO.holder}</p>
                    <p className="text-sm text-gray-500 mb-1">입금하실 금액</p>
                    <p className="font-bold text-lg text-primary">
                        ₩{total ? parseInt(total).toLocaleString() : '0'}
                    </p>
                </div>

                <div className="space-y-3">
                    <Link 
                        to="/mypage" 
                        className="block w-full px-8 py-3 bg-primary text-white hover:bg-black transition text-center"
                    >
                        주문 내역 확인
                    </Link>
                    <Link 
                        to="/" 
                        className="block w-full px-8 py-3 border border-gray-300 text-gray-700 hover:bg-gray-50 transition text-center"
                    >
                        쇼핑 계속하기
                    </Link>
                </div>
            </div>
        </div>
    );
};

export default CheckoutSuccess;

