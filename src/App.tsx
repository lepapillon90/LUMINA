import React, { Suspense, lazy, useEffect } from 'react';
import { HashRouter, Routes, Route, useLocation } from 'react-router-dom';
import { GlobalModalProvider } from './contexts/GlobalModalContext';
import { ToastProvider } from './contexts/ToastContext';
import { Providers } from './contexts';
import { QueryProvider } from './contexts/QueryContext';
import { HelmetProvider } from 'react-helmet-async';
import ReactGA from 'react-ga4';
import hotjar from '@hotjar/browser';

import Navbar from './components/layout/Navbar';
import Footer from './components/layout/Footer';
import AIStylist from './components/features/home/AIStylist';
import ErrorBoundary from './components/common/ErrorBoundary';
import Loading from './components/common/Loading';
import RouteTracker from './components/common/RouteTracker';
import GTM from './components/common/GTM';

// Initialize GA4 (Replace with actual Measurement ID)
ReactGA.initialize("G-MEASUREMENT_ID");

// Lazy load all pages
const Home = lazy(() => import('./pages/Home'));
const Shop = lazy(() => import('./pages/Shop'));
const ProductDetail = lazy(() => import('./pages/ProductDetail'));
const OOTD = lazy(() => import('./pages/OOTD'));
const Cart = lazy(() => import('./pages/Cart'));
const MyPage = lazy(() => import('./pages/MyPage'));
const Admin = lazy(() => import('./pages/Admin'));
const DataMigration = lazy(() => import('./components/Admin/DataMigration'));
const NotFound = lazy(() => import('./pages/NotFound'));
const Login = lazy(() => import('./pages/Auth/Login'));
const Signup = lazy(() => import('./pages/Auth/Signup'));
const ForgotPassword = lazy(() => import('./pages/Auth/ForgotPassword'));
const GuestOrderTracking = lazy(() => import('./pages/GuestOrderTracking'));

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
            <Route path="/order-tracking" element={<GuestOrderTracking />} />
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
  useEffect(() => {
    // Initialize Hotjar (Replace with actual Site ID and Version)
    hotjar.init(1234567, 6);
  }, []);

  return (
    <QueryProvider>
      <GlobalModalProvider>
        <ToastProvider>
          <Providers>
            <HelmetProvider>
              <HashRouter>
                <GTM gtmId="GTM-XXXXXXX" />
                <RouteTracker />
                <ErrorBoundary>
                  <Layout />
                </ErrorBoundary>
              </HashRouter>
            </HelmetProvider>
          </Providers>
        </ToastProvider>
      </GlobalModalProvider>
    </QueryProvider>
  );
};

export default App;