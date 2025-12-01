import React, { Suspense, lazy, useEffect } from 'react';
import { HashRouter, Routes, Route, useLocation } from 'react-router-dom';
import { GlobalModalProvider } from './contexts/GlobalModalContext';
import { ToastProvider } from './contexts/ToastContext';
import { Providers } from './contexts'; // Correct import for Auth and Cart providers
// import { HelmetProvider } from 'react-helmet-async';

import Navbar from './components/layout/Navbar';
import Footer from './components/layout/Footer';
import AIStylist from './components/features/home/AIStylist';
import ErrorBoundary from './components/common/ErrorBoundary';
import Loading from './components/common/Loading';

import Home from './pages/Home';
import Shop from './pages/Shop';
import ProductDetail from './pages/ProductDetail';
import OOTD from './pages/OOTD';
import Cart from './pages/Cart';
import MyPage from './pages/MyPage';
import Admin from './pages/Admin';
import DataMigration from './components/Admin/DataMigration';
import NotFound from './pages/NotFound';

import Login from './pages/Auth/Login';
import Signup from './pages/Auth/Signup';
const ForgotPassword = lazy(() => import('./pages/Auth/ForgotPassword'));

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
        <Suspense fallback={<Loading />}>
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/shop" element={<Shop />} />
            <Route path="/product/:id" element={<ProductDetail />} />
            <Route path="/ootd" element={<OOTD />} />
            <Route path="/cart" element={<Cart />} />
            <Route path="/login" element={<Login />} />
            <Route path="/signup" element={<Signup />} />
            <Route path="/forgot-password" element={<ForgotPassword />} />
            <Route path="/mypage" element={<MyPage />} />
            <Route path="/admin" element={<Admin />} />
            <Route path="/admin/migrate" element={<DataMigration />} />
            <Route path="*" element={<NotFound />} />
          </Routes>
        </Suspense>
      </main>
      {!isAdmin && <AIStylist />}
      {!isAdmin && <Footer />}
    </div>
  );
};

const App: React.FC = () => {
  return (
    <GlobalModalProvider>
      <ToastProvider>
        <Providers>
          {/* <HelmetProvider> */}
          <HashRouter>
            <ErrorBoundary>
              <Layout />
            </ErrorBoundary>
          </HashRouter>
          {/* </HelmetProvider> */}
        </Providers>
      </ToastProvider>
    </GlobalModalProvider>
  );
};

export default App;