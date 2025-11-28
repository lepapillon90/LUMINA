import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { HashRouter, Routes, Route, useLocation } from 'react-router-dom';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import Home from './pages/Home';
import Shop from './pages/Shop';
import OOTD from './pages/OOTD';
import Cart from './pages/Cart';
import Login from './pages/Login';
import Admin from './pages/Admin';
import ProductDetail from './pages/ProductDetail';
import AIStylist from './components/AIStylist';
import { CartItem, Product, User, UserRole } from './types';

// --- Contexts ---

// Cart Context
interface CartContextType {
  cart: CartItem[];
  addToCart: (product: Product, quantity?: number) => void;
  removeFromCart: (id: number) => void;
  updateQuantity: (id: number, quantity: number) => void;
  clearCart: () => void;
}
const CartContext = createContext<CartContextType | undefined>(undefined);

// Auth Context
interface AuthContextType {
  user: User | null;
  login: (u: string, p: string) => boolean;
  logout: () => void;
}
const AuthContext = createContext<AuthContextType | undefined>(undefined);


// --- Providers ---

const Providers: React.FC<{ children: ReactNode }> = ({ children }) => {
  // Cart State
  const [cart, setCart] = useState<CartItem[]>([]);

  const addToCart = (product: Product, quantity: number = 1) => {
    setCart(prev => {
      const existing = prev.find(item => item.id === product.id);
      if (existing) {
        return prev.map(item => item.id === product.id ? { ...item, quantity: item.quantity + quantity } : item);
      }
      return [...prev, { ...product, quantity }];
    });
  };

  const removeFromCart = (id: number) => {
    setCart(prev => prev.filter(item => item.id !== id));
  };

  const updateQuantity = (id: number, quantity: number) => {
    setCart(prev => prev.map(item => {
      if (item.id === id) {
        // Ensure quantity doesn't drop below 1
        return { ...item, quantity: Math.max(1, quantity) };
      }
      return item;
    }));
  };

  const clearCart = () => setCart([]);

  // Auth State
  const [user, setUser] = useState<User | null>(null);

  const login = (u: string, p: string) => {
    if (u === 'admin' && p === 'admin') {
      setUser({ username: 'admin', role: UserRole.ADMIN });
      return true;
    }
    // Generic user login mock
    if (u && p) {
      setUser({ username: u, role: UserRole.GUEST });
      return true;
    }
    return false;
  };

  const logout = () => setUser(null);

  return (
    <AuthContext.Provider value={{ user, login, logout }}>
      <CartContext.Provider value={{ cart, addToCart, removeFromCart, updateQuantity, clearCart }}>
        {children}
      </CartContext.Provider>
    </AuthContext.Provider>
  );
};


// --- Hooks ---
export const useCart = () => {
  const context = useContext(CartContext);
  if (!context) throw new Error("useCart must be used within Providers");
  return context;
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error("useAuth must be used within Providers");
  return context;
};

// --- Layout Helper ---
const ScrollToTop = () => {
  const { pathname } = useLocation();
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);
  return null;
};

const Layout: React.FC = () => {
  const location = useLocation();
  // Hide Navbar/Footer on Admin dashboard for cleaner view, keep on others
  const isAdmin = location.pathname.startsWith('/admin');

  return (
    <div className="flex flex-col min-h-screen text-primary">
      <ScrollToTop />
      {!isAdmin && <Navbar />}
      <main className="flex-grow">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/shop" element={<Shop />} />
          <Route path="/product/:id" element={<ProductDetail />} />
          <Route path="/ootd" element={<OOTD />} />
          <Route path="/cart" element={<Cart />} />
          <Route path="/login" element={<Login />} />
          <Route path="/admin" element={<Admin />} />
        </Routes>
      </main>
      {!isAdmin && <AIStylist />}
      {!isAdmin && <Footer />}
    </div>
  );
};

const App: React.FC = () => {
  return (
    <Providers>
      <HashRouter>
        <Layout />
      </HashRouter>
    </Providers>
  );
};

export default App;