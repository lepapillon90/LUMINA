import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ChevronDown, LogOut, Package, Clock, Headphones } from 'lucide-react';
import { useAuth } from '../../contexts';

const TopMenuBar: React.FC = () => {
    const { user, logout } = useAuth();
    const navigate = useNavigate();
    const [isCsDropdownOpen, setIsCsDropdownOpen] = useState(false);

    const handleLogout = async () => {
        await logout();
        navigate('/');
    };

    if (!user) return null;

    return (
        <div className="">
            <div className="container mx-auto px-6">
                <div className="flex items-center justify-end gap-4 py-3 text-[11px] font-serif font-medium tracking-widest text-inherit opacity-80">
                    <button
                        onClick={handleLogout}
                        className="hover:text-accent transition flex items-center gap-1.5"
                    >
                        <LogOut size={13} />
                        로그아웃
                    </button>
                    <Link
                        to="/mypage?tab=orders"
                        className="hover:text-accent transition flex items-center gap-1.5"
                    >
                        <Package size={13} />
                        주문조회
                    </Link>
                    <Link
                        to="/mypage?tab=recent"
                        className="hover:text-accent transition flex items-center gap-1.5"
                    >
                        <Clock size={13} />
                        최근본상품
                    </Link>
                    <div
                        className="relative"
                        onMouseEnter={() => setIsCsDropdownOpen(true)}
                        onMouseLeave={() => setIsCsDropdownOpen(false)}
                    >
                        <Link
                            to="/cs"
                            className="hover:text-accent transition flex items-center gap-1.5"
                        >
                            <Headphones size={13} />
                            고객센터
                            <ChevronDown size={10} />
                        </Link>
                        {isCsDropdownOpen && (
                            <div className="absolute right-0 top-full mt-1 bg-white border border-gray-100 rounded-sm shadow-sm py-1 min-w-[140px] z-50">
                                <Link
                                    to="/cs"
                                    className="block px-4 py-2 text-[11px] text-gray-500 hover:bg-gray-50 hover:text-accent transition"
                                    onClick={() => setIsCsDropdownOpen(false)}
                                >
                                    자주 묻는 질문
                                </Link>
                                <Link
                                    to="/cs#inquiry"
                                    className="block px-4 py-2 text-[11px] text-gray-500 hover:bg-gray-50 hover:text-accent transition"
                                    onClick={() => setIsCsDropdownOpen(false)}
                                >
                                    1:1 문의하기
                                </Link>
                                <Link
                                    to="/cs#my-inquiries"
                                    className="block px-4 py-2 text-[11px] text-gray-500 hover:bg-gray-50 hover:text-accent transition"
                                    onClick={() => setIsCsDropdownOpen(false)}
                                >
                                    내 문의 내역
                                </Link>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default TopMenuBar;

