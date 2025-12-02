import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { ShoppingBag, Menu, X, User as UserIcon, LogOut } from 'lucide-react';
import { useCart, useAuth } from '../../contexts';
import { UserRole } from '../../types';
import CartDrawer from './CartDrawer';
import AnnouncementBar from './AnnouncementBar';

const Navbar: React.FC = () => {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const location = useLocation();
  const { cart, isCartOpen, openCart, closeCart } = useCart();
  const { user, logout } = useAuth();
  const isHome = location.pathname === '/';

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const cartCount = cart.reduce((acc, item) => acc + item.quantity, 0);

  // Determine navbar style based on scroll and page
  const navClass = `fixed top-0 left-0 w-full z-50 transition-all duration-300 flex flex-col ${isScrolled || !isHome
    ? 'bg-white text-primary shadow-sm'
    : 'bg-transparent text-white'
    }`;

  return (
    <>
      <nav className={navClass}>
        <AnnouncementBar />
        <div className={`w-full transition-all duration-300 ${isScrolled || !isHome ? 'py-4' : 'py-6'}`}>
          <div className="container mx-auto px-6 flex justify-between items-center">
            {/* Logo */}
            <Link to="/" className="text-2xl font-serif font-bold tracking-widest" aria-label="LUMINA 홈으로 이동">
              LUMINA
            </Link>

            {/* Desktop Menu */}
            <div className="hidden md:flex space-x-8 text-sm uppercase tracking-wider font-medium">
              <Link to="/" className="hover:text-accent transition">홈</Link>
              <Link to="/shop" className="hover:text-accent transition">쇼핑</Link>
              <Link to="/cart" className="hover:text-accent transition">장바구니</Link>
              <Link to="/magazine" className="hover:text-accent transition">매거진</Link>
              <Link to="/ootd" className="hover:text-accent transition">OOTD</Link>
            </div>

            {/* Icons */}
            <div className="flex items-center space-x-6">
              {user ? (
                <div className="flex items-center space-x-3 group relative">
                  <span className="text-sm font-medium hidden md:block cursor-default">
                    {user.displayName || user.username}
                  </span>
                  <Link to="/mypage" className="hover:text-accent transition" aria-label="마이페이지">
                    <UserIcon size={20} />
                  </Link>
                  <button onClick={logout} className="hover:text-accent transition" aria-label="로그아웃">
                    <LogOut size={20} />
                  </button>
                </div>
              ) : (
                <Link to="/login" className="hover:text-accent transition" aria-label="로그인">
                  <UserIcon size={20} />
                </Link>
              )}

              <button
                onClick={openCart}
                className="relative hover:text-accent transition"
                aria-label={`장바구니, ${cartCount}개 항목`}
              >
                <ShoppingBag size={20} />
                {cartCount > 0 && (
                  <span className="absolute -top-2 -right-2 bg-accent text-white text-[10px] w-4 h-4 flex items-center justify-center rounded-full" aria-hidden="true">
                    {cartCount}
                  </span>
                )}
              </button>
              <button
                className="md:hidden focus:outline-none"
                onClick={() => setIsMenuOpen(!isMenuOpen)}
                aria-label={isMenuOpen ? "메뉴 닫기" : "메뉴 열기"}
                aria-expanded={isMenuOpen}
              >
                {isMenuOpen ? <X size={24} /> : <Menu size={24} />}
              </button>
            </div>
          </div>
        </div>

        {/* Mobile Menu */}
        {isMenuOpen && (
          <div className="md:hidden absolute top-full left-0 w-full bg-white text-primary shadow-lg py-4 flex flex-col space-y-4 px-6">
            <Link to="/" onClick={() => setIsMenuOpen(false)} className="block py-2 border-b border-gray-100">홈</Link>
            <Link to="/shop" onClick={() => setIsMenuOpen(false)} className="block py-2 border-b border-gray-100">쇼핑</Link>
            <Link to="/cart" onClick={() => setIsMenuOpen(false)} className="block py-2 border-b border-gray-100">장바구니</Link>
            <Link to="/magazine" onClick={() => setIsMenuOpen(false)} className="block py-2 border-b border-gray-100">매거진</Link>
            <Link to="/ootd" onClick={() => setIsMenuOpen(false)} className="block py-2 border-b border-gray-100">OOTD</Link>
          </div>
        )}
      </nav>

      {/* Cart Drawer */}
      <CartDrawer isOpen={isCartOpen} onClose={closeCart} />
    </>
  );
};

export default Navbar;