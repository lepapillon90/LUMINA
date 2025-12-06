import React, { useRef, useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth, useGlobalModal } from '../contexts';
import { getProducts } from '../services/productService';
import { Product } from '../types';
import LookbookSection from '../components/features/home/LookbookSection';
import NewsletterPopup from '../components/features/home/NewsletterPopup';
import PurchaseNotification from '../components/features/home/PurchaseNotification';

import MagazineSection from '../components/features/home/MagazineSection';
import TimeSale from '../components/features/home/TimeSale';
import InstagramFeed from '../components/features/home/InstagramFeed';
import { ChevronLeft, ChevronRight, Heart } from 'lucide-react';
import SEO from '../components/common/SEO';
import OptimizedImage from '../components/common/OptimizedImage';

import TrendingOOTDSection from '../components/features/home/TrendingOOTDSection';

const Home: React.FC = () => {
  const [newArrivals, setNewArrivals] = useState<Product[]>([]);
  const sliderRef = useRef<HTMLDivElement>(null);
  const { user, toggleWishlist } = useAuth();
  const { showConfirm } = useGlobalModal();
  const navigate = useNavigate();

  useEffect(() => {
    const fetchNewArrivals = async () => {
      try {
        const allProducts = await getProducts();
        // Filter for new products. If none, maybe show latest 5? 
        // For now, strictly following "isNew" as requested.
        const newProducts = allProducts.filter(p => p.isNew);
        setNewArrivals(newProducts);
      } catch (error) {
        console.error("Failed to fetch products:", error);
      }
    };

    fetchNewArrivals();
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
      <section className="relative h-[100dvh] w-full flex items-center justify-center overflow-hidden">
        {/* Background Video */}
        <div className="absolute inset-0 z-0">
          <video
            autoPlay
            loop
            muted
            playsInline
            poster="/hero_poster.png"
            className="w-full h-full object-cover"
          >
            <source src="https://videos.pexels.com/video-files/5359634/5359634-uhd_2560_1440_25fps.mp4" type="video/mp4" />
            {/* Fallback Image */}
            <OptimizedImage
              src="/hero_poster.png"
              alt="Hero Background"
              className="w-full h-full object-cover"
              loading="eager"
              // @ts-ignore
              fetchPriority="high"
            />
          </video>
          {/* Overlay */}
          <div className="absolute inset-0 bg-black/30"></div>
        </div>

        {/* Content */}
        <div className="relative z-10 text-center text-white px-4 pt-20">
          <p className="text-sm md:text-base tracking-[0.3em] mb-4 uppercase text-[#FFD700] font-bold drop-shadow-[0_2px_2px_rgba(0,0,0,0.8)] animate-fade-in-up">
            Timeless Elegance
          </p>
          <h1
            className="text-4xl md:text-[64px] font-serif font-bold mb-6 drop-shadow-md animate-fade-in-up delay-100"
            style={{ fontFamily: "'Cinzel', serif" }}
          >
            LUMINA
          </h1>
          <p className="text-lg font-light mb-8 max-w-lg mx-auto opacity-95 text-shadow animate-fade-in-up delay-200">
            내면의 빛을 발견하세요. 당신을 위해 수작업으로 완성된 모던 악세서리.
          </p>
          <Link
            to="/shop"
            className="inline-block px-10 py-4 border border-white text-white hover:bg-white hover:text-black transition duration-300 uppercase tracking-widest text-sm backdrop-blur-sm animate-fade-in-up delay-300"
          >
            컬렉션 보기
          </Link>
        </div>
      </section>

      {/* Time Sale */}
      <TimeSale />

      {/* Featured Section (New Arrivals) */}
      {/* Featured Section (New Arrivals) */}
      <section className="py-16 md:py-24 bg-white overflow-hidden">
        <div className="container mx-auto px-6 mb-12">
          <h2 className="text-3xl md:text-4xl font-serif text-primary mb-3">New Arrivals</h2>
          <p className="text-gray-500 font-light">가장 먼저 만나는 루미나의 새로운 컬렉션</p>
        </div>

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
              newArrivals.map((product) => (
                <div
                  key={product.id}
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
                      {/* NEW Badge */}
                      <div className="absolute top-2 left-2 bg-black text-white text-[10px] font-bold px-2 py-1 z-10">
                        NEW
                      </div>
                      {/* Wishlist Button */}
                      <button
                        className="absolute top-2 right-2 p-2 bg-white/80 rounded-full hover:bg-white transition shadow-sm z-10"
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
                          className={`transition ${user?.wishlist?.includes(product.id) ? 'fill-red-500 text-red-500' : 'text-gray-600 hover:fill-red-500 hover:text-red-500'}`}
                        />
                      </button>
                    </div>
                    <div className="mt-4">
                      <h3 className="text-sm text-gray-900 font-medium group-hover:text-gray-600 transition truncate">
                        {product.name}
                      </h3>
                      <p className="mt-1 text-sm font-serif text-gray-900">
                        ₩{product.price.toLocaleString()}
                      </p>
                    </div>
                  </Link>
                </div>
              ))
            ) : (
              <div className="w-full text-center py-10 text-gray-400">
                신상품이 준비 중입니다.
              </div>
            )}
          </div>
        </div>
      </section>

      {/* Lookbook Section */}
      <LookbookSection />







      {/* Trending OOTD Section */}
      <TrendingOOTDSection />



      {/* Magazine Section */}
      <MagazineSection />

      {/* Instagram Feed */}
      <InstagramFeed />



      {/* Newsletter Popup */}
      <NewsletterPopup />
      {/* Purchase Notification */}
      <PurchaseNotification />
    </div>
  );
};

export default Home;
