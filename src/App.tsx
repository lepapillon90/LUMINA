import React, { Suspense, lazy, useEffect } from 'react';
import { HashRouter, Routes, Route, useLocation } from 'react-router-dom';
// import { HelmetProvider } from 'react-helmet-async';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import AIStylist from './components/AIStylist';
import ErrorBoundary from './components/ErrorBoundary';
import Loading from './components/Loading';
import { Providers } from './contexts';
import { ToastProvider } from './contexts/ToastContext';
import { GlobalModalProvider } from './contexts/GlobalModalContext';

// Static Import for Login to debug
import Login from './pages/Login';
// Static Import for Signup to debug
import Signup from './pages/Signup';

// Lazy Imports
const Home = lazy(() => import('./pages/Home'));
const Shop = lazy(() => import('./pages/Shop'));
const OOTD = lazy(() => import('./pages/OOTD'));
const Cart = lazy(() => import('./pages/Cart'));
// const Login = lazy(() => import('./pages/Login'));
// const Signup = lazy(() => import('./pages/Signup'));
const ForgotPassword = lazy(() => import('./pages/ForgotPassword'));
const Admin = lazy(() => import('./pages/Admin'));
const MyPage = lazy(() => import('./pages/MyPage'));
const DataMigration = lazy(() => import('./components/Admin/DataMigration'));
const ProductDetail = lazy(() => import('./pages/ProductDetail'));
const NotFound = lazy(() => import('./pages/NotFound'));

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
    <Providers>
      <GlobalModalProvider>
        <ToastProvider>
          {/* <HelmetProvider> */}
          <HashRouter>
            <ErrorBoundary>
              <Layout />
            </ErrorBoundary>
          </HashRouter>
          {/* </HelmetProvider> */}
        </ToastProvider>
      </GlobalModalProvider>
    </Providers>
  );
};

export default App;