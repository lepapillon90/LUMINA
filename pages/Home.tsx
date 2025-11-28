import React, { useRef } from 'react';
import { Link } from 'react-router-dom';
import { PRODUCTS } from '../constants';
import RecommendedSection from '../components/RecommendedSection';
import { ChevronLeft, ChevronRight } from 'lucide-react';

const Home: React.FC = () => {
  // Assuming all products are new based on previous request for the slider
  const newArrivals = PRODUCTS.filter(p => p.isNew);
  const sliderRef = useRef<HTMLDivElement>(null);

  const scroll = (direction: 'left' | 'right') => {
    if (sliderRef.current) {
      const { current } = sliderRef;
      const scrollAmount = direction === 'left' ? -300 : 300;
      current.scrollBy({ left: scrollAmount, behavior: 'smooth' });
    }
  };

  return (
    <div className="bg-white">
      {/* Hero Section */}
      <section className="relative h-screen w-full flex items-center justify-center overflow-hidden">
        {/* Background Image - Updated to match the user request (Woman in white knit, cafe vibe) */}
        <div
          className="absolute inset-0 z-0 bg-cover bg-center bg-no-repeat"
          style={{ backgroundImage: 'url("/hero_banner.png")' }}
        >
          {/* Overlay - Slightly darkened for text readability */}
          <div className="absolute inset-0 bg-black/30"></div>
        </div>

        {/* Content */}
        <div className="relative z-10 text-center text-white px-4">
          <p className="text-sm md:text-base tracking-[0.3em] mb-4 uppercase text-accent font-medium shadow-sm">
            Timeless Elegance
          </p>
          <h1
            className="text-5xl md:text-[64px] font-serif font-bold mb-6 drop-shadow-md"
            style={{ fontFamily: "'Cinzel', serif" }}
          >
            LUMINA
          </h1>
          <p className="text-lg font-light mb-8 max-w-lg mx-auto opacity-95 text-shadow">
            내면의 빛을 발견하세요. 당신을 위해 수작업으로 완성된 모던 악세서리.
          </p>
          <Link
            to="/shop"
            className="inline-block px-10 py-4 border border-white text-white hover:bg-white hover:text-black transition duration-300 uppercase tracking-widest text-sm backdrop-blur-sm"
          >
            컬렉션 보기
          </Link>
        </div>
      </section>

      {/* Featured Section (New Arrivals) */}
      <section className="py-24 bg-white overflow-hidden">
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
            {newArrivals.map((product) => (
              <div
                key={product.id}
                className="flex-none w-[45%] md:w-[30%] lg:w-[22%] xl:w-[18%] snap-start group cursor-pointer"
              >
                <Link to={`/product/${product.id}`} className="block relative">
                  {/* Using Padding Hack (pt-[125%]) to enforce strict 4:5 Aspect Ratio */}
                  <div className="relative w-full pt-[125%] bg-gray-100 overflow-hidden">
                    <img
                      src={product.image}
                      alt={product.name}
                      className="absolute top-0 left-0 w-full h-full object-cover transition duration-700 group-hover:scale-110"
                    />
                    {/* Overlay Text */}
                    <div className="absolute bottom-4 right-4 text-[10px] text-white/70 font-light tracking-wider opacity-80">
                      실제 판매되지 않는 상품입니다
                    </div>
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
            ))}
          </div>
        </div>
      </section>

      {/* Mid Banner */}
      <section className="w-full">
        <img
          src="/mid_banner.png"
          alt="Lumina Lifestyle"
          className="w-full h-[300px] md:h-[400px] object-cover object-center"
        />
      </section>

      {/* Recommended Section */}
      <RecommendedSection />

      {/* Brand Story Snippet */}
      <section className="bg-secondary py-20">
        <div className="container mx-auto px-6 text-center max-w-2xl">
          <h2 className="text-3xl font-serif mb-6">Lumina Philosophy</h2>
          <p className="text-gray-600 leading-loose mb-8">
            라틴어 "Luminósus"에서 유래한 루미나(LUMINA)는 쥬얼리가 단순한 장식이 아닌, 당신만의 스타일을 명확하게 해주는 매개체라고 믿습니다. 각각의 조각들은 빛을 머금고 당신의 내면의 광채를 반사하도록 디자인되었습니다.
          </p>
          <img src="/sub_banner.png" alt="Jewelry Detail" className="w-full h-64 object-cover object-center mt-8 grayscale opacity-80 hover:grayscale-0 transition duration-700" />
        </div>
      </section>
    </div>
  );
};

export default Home;
