import React, { useRef, useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth, useGlobalModal, useCart } from '../contexts';
import { getProducts } from '../services/productService';
import { Product } from '../types';
import LookbookSection from '../components/features/home/LookbookSection';
import NewsletterPopup from '../components/features/home/NewsletterPopup';
import PurchaseNotification from '../components/features/home/PurchaseNotification';

import MagazineSection from '../components/features/home/MagazineSection';
import TimeSale from '../components/features/home/TimeSale';
import InstagramFeed from '../components/features/home/InstagramFeed';
import { ChevronLeft, ChevronRight, Heart, ShoppingBag, Clock } from 'lucide-react';
import SEO from '../components/common/SEO';
import OptimizedImage from '../components/common/OptimizedImage';

import TrendingOOTDSection from '../components/features/home/TrendingOOTDSection';
import HeroSection from '../components/features/home/HeroSection';
import { getCache, setCache, CACHE_KEYS, DEFAULT_TTL } from '../utils/cache';
import { FadeInUp, AnimatedSection } from '../components/common/AnimatedElements';
import { getHomepageTimeSale } from '../services/homepageService';
import { HomepageTimeSale } from '../types';

const Home: React.FC = () => {
  // Initialize with cached data for instant display (productService handles main caching)
  const [newArrivals, setNewArrivals] = useState<Product[]>(() => {
    const cached = getCache<Product[]>(CACHE_KEYS.NEW_ARRIVALS);
    return cached || [];
  });
  const sliderRef = useRef<HTMLDivElement>(null);
  const { user, toggleWishlist } = useAuth();
  const { addToCart } = useCart();
  const { showConfirm, showAlert } = useGlobalModal();
  const navigate = useNavigate();
  const [timeSaleData, setTimeSaleData] = useState<HomepageTimeSale | null>(null);

  useEffect(() => {
    const fetchNewArrivals = async () => {
      try {
        // getProducts now has built-in caching
        const allProducts = await getProducts();
        const newProducts = allProducts.filter(p => p.isNew);
        setNewArrivals(newProducts);
        // Cache new arrivals specifically for faster initial load
        setCache(CACHE_KEYS.NEW_ARRIVALS, newProducts, { ttl: DEFAULT_TTL.MEDIUM });
      } catch (error) {
        console.error("Failed to fetch products:", error);
      }
    };

    fetchNewArrivals();
  }, []);

  // Fetch TimeSale data
  useEffect(() => {
    const fetchTimeSale = async () => {
      try {
        const data = await getHomepageTimeSale();
        setTimeSaleData(data);
      } catch (error) {
        console.error('Failed to fetch TimeSale:', error);
      }
    };
    fetchTimeSale();
  }, []);

  const scroll = (direction: 'left' | 'right') => {
    if (sliderRef.current) {
      const { current } = sliderRef;
      const scrollAmount = direction === 'left' ? -300 : 300;
      current.scrollBy({ left: scrollAmount, behavior: 'smooth' });
    }
  };

  return (
    <div className="bg-white">
      <SEO />
      {/* Hero Section */}
      <HeroSection />

      {/* Time Sale - only show if active */}
      {timeSaleData?.isActive && (
        <FadeInUp>
          <TimeSale previewData={timeSaleData} />
        </FadeInUp>
      )}

      {/* Featured Section (New Arrivals) */}
      <AnimatedSection className="py-16 md:py-24 bg-white overflow-hidden">
        <FadeInUp className="container mx-auto px-6 mb-12">
          <h2 className="text-3xl md:text-4xl font-serif text-primary mb-3">New Arrivals</h2>
          <p className="text-gray-500 font-light">가장 먼저 만나는 루미나의 새로운 컬렉션</p>
        </FadeInUp>

        {/* Navigation Buttons */}
        <div className="relative container mx-auto">
          <button
            onClick={() => scroll('left')}
            className="absolute left-0 top-1/2 -translate-y-1/2 z-10 bg-white/80 p-3 shadow-md hover:bg-white transition -ml-4 md:-ml-8 hidden md:block"
          >
            <ChevronLeft size={24} className="text-gray-700" />
          </button>
          <button
            onClick={() => scroll('right')}
            className="absolute right-0 top-1/2 -translate-y-1/2 z-10 bg-white/80 p-3 shadow-md hover:bg-white transition -mr-4 md:-mr-8 hidden md:block"
          >
            <ChevronRight size={24} className="text-gray-700" />
          </button>

          {/* Slider Area */}
          <div
            ref={sliderRef}
            className="flex overflow-x-auto no-scrollbar snap-x snap-mandatory px-6 pb-10 gap-4"
            style={{ scrollBehavior: 'smooth' }}
          >
            {newArrivals.length > 0 ? (
              newArrivals.map((product, index) => (
                <FadeInUp
                  key={product.id}
                  delay={index * 0.1}
                  className="flex-none w-[45%] md:w-[30%] lg:w-[22%] xl:w-[18%] snap-start group cursor-pointer"
                >
                  <Link to={`/product/${product.id}`} className="block relative">
                    {/* 1:1 Aspect Ratio (Square) */}
                    <div className="relative w-full pt-[100%] bg-gray-100 overflow-hidden">
                      <div className="absolute inset-0 w-full h-full group-hover:scale-110 transition duration-700">
                        <OptimizedImage
                          src={product.image}
                          alt={product.name}
                          className="w-full h-full object-cover"
                        />
                      </div>
                      {/* Badges Container */}
                      <div className="absolute top-2 left-2 flex flex-col gap-1 z-10">
                        {/* NEW Badge */}
                        <div className="bg-black text-white text-[10px] font-bold px-2 py-1">
                          NEW
                        </div>
                        {/* Time Sale Badge */}
                        {timeSaleData && timeSaleData.isActive && timeSaleData.productIds?.some(id => String(id) === String(product.id)) && (
                          <div
                            className="text-white text-[10px] font-bold px-2 py-1 flex items-center gap-1 animate-pulse"
                            style={{
                              backgroundColor: timeSaleData.badgeStyle?.backgroundColor || '#DC2626',
                              color: timeSaleData.badgeStyle?.color || '#FFFFFF'
                            }}
                          >
                            <Clock size={10} />
                            TIME SALE
                          </div>
                        )}
                      </div>

                      {/* Action Buttons */}
                      <div className="absolute top-2 right-2 flex flex-col gap-2 z-10">
                        {/* Wishlist Button */}
                        <button
                          className={`p-2 rounded-full shadow-sm transition ${user?.wishlist?.includes(product.id) ? 'bg-red-500 text-white' : 'bg-white/80 hover:bg-white text-gray-600 hover:text-red-500'}`}
                          onClick={async (e) => {
                            e.preventDefault();
                            if (!user) {
                              const confirmed = await showConfirm("로그인이 필요한 서비스입니다.\n로그인 페이지로 이동하시겠습니까?");
                              if (confirmed) navigate('/login');
                              return;
                            }
                            await toggleWishlist(product.id);
                          }}
                        >
                          <Heart
                            size={16}
                            className={user?.wishlist?.includes(product.id) ? 'fill-current' : ''}
                          />
                        </button>
                        {/* Cart Button */}
                        <button
                          className="p-2 rounded-full shadow-sm transition bg-white/80 hover:bg-black text-gray-600 hover:text-white"
                          onClick={async (e) => {
                            e.preventDefault();
                            addToCart(product, 1);
                            await showAlert("장바구니에 담겼습니다.", "장바구니");
                          }}
                        >
                          <ShoppingBag size={16} />
                        </button>
                      </div>
                    </div>
                    <div className="mt-4">
                      <h3 className="text-sm text-gray-900 font-medium group-hover:text-gray-600 transition truncate">
                        {product.name}
                      </h3>
                      {/* Price Display */}
                      {timeSaleData && timeSaleData.isActive && timeSaleData.productIds?.some(id => String(id) === String(product.id)) ? (
                        <div className="mt-1 flex items-center gap-2">
                          <span className="text-sm font-serif text-gray-400 line-through">
                            ₩{product.price.toLocaleString()}
                          </span>
                          <span className="text-sm font-serif text-red-600 font-bold">
                            ₩{Math.floor(product.price * (1 - timeSaleData.discountPercentage / 100)).toLocaleString()}
                          </span>
                        </div>
                      ) : (
                        <p className="mt-1 text-sm font-serif text-gray-900">
                          ₩{product.price.toLocaleString()}
                        </p>
                      )}
                    </div>
                  </Link>
                </FadeInUp>
              ))
            ) : (
              <div className="w-full text-center py-10 text-gray-400">
                신상품이 준비 중입니다.
              </div>
            )}
          </div>
        </div>
      </AnimatedSection>

      {/* Lookbook Section */}
      <FadeInUp>
        <LookbookSection />
      </FadeInUp>

      {/* Trending OOTD Section */}
      <FadeInUp>
        <TrendingOOTDSection />
      </FadeInUp>

      {/* Magazine Section */}
      <FadeInUp>
        <MagazineSection />
      </FadeInUp>

      {/* Instagram Feed */}
      <FadeInUp>
        <InstagramFeed />
      </FadeInUp>

      {/* Newsletter Popup */}
      <NewsletterPopup />
      {/* Purchase Notification */}
      <PurchaseNotification />
    </div>
  );
};

export default Home;

