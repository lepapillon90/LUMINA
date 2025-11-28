import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { ShoppingBag, Menu, X, User as UserIcon } from 'lucide-react';
import { useCart } from '../App';

const Navbar: React.FC = () => {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const location = useLocation();
  const { cart } = useCart();
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
  const navClass = `fixed top-0 left-0 w-full z-50 transition-all duration-300 ${
    isScrolled || !isHome 
      ? 'bg-white text-primary shadow-sm py-4' 
      : 'bg-transparent text-white py-6'
  }`;

  return (
    <nav className={navClass}>
      <div className="container mx-auto px-6 flex justify-between items-center">
        {/* Logo */}
        <Link to="/" className="text-2xl font-serif font-bold tracking-widest">
          LUMINA
        </Link>

        {/* Desktop Menu */}
        <div className="hidden md:flex space-x-8 text-sm uppercase tracking-wider font-medium">
          <Link to="/" className="hover:text-accent transition">홈</Link>
          <Link to="/shop" className="hover:text-accent transition">쇼핑</Link>
          <Link to="/ootd" className="hover:text-accent transition">OOTD</Link>
        </div>

        {/* Icons */}
        <div className="flex items-center space-x-6">
          <Link to="/login" className="hover:text-accent transition" title="로그인">
            <UserIcon size={20} />
          </Link>
          <Link to="/cart" className="relative hover:text-accent transition" title="장바구니">
            <ShoppingBag size={20} />
            {cartCount > 0 && (
              <span className="absolute -top-2 -right-2 bg-accent text-white text-[10px] w-4 h-4 flex items-center justify-center rounded-full">
                {cartCount}
              </span>
            )}
          </Link>
          <button 
            className="md:hidden focus:outline-none"
            onClick={() => setIsMenuOpen(!isMenuOpen)}
          >
            {isMenuOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>
      </div>

      {/* Mobile Menu */}
      {isMenuOpen && (
        <div className="md:hidden absolute top-full left-0 w-full bg-white text-primary shadow-lg py-4 flex flex-col space-y-4 px-6">
          <Link to="/" onClick={() => setIsMenuOpen(false)} className="block py-2 border-b border-gray-100">홈</Link>
          <Link to="/shop" onClick={() => setIsMenuOpen(false)} className="block py-2 border-b border-gray-100">쇼핑</Link>
          <Link to="/ootd" onClick={() => setIsMenuOpen(false)} className="block py-2 border-b border-gray-100">OOTD</Link>
        </div>
      )}
    </nav>
  );
};

export default Navbar;