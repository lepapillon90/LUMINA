import React, { useState, useEffect, useMemo } from 'react';
import { getProducts } from '../services/productService';
import { Product } from '../types';
import ProductCard from '../components/features/products/ProductCard';
import SEO from '../components/common/SEO';
import Loading from '../components/common/Loading';
import Fuse from 'fuse.js';
import SearchBar from '../components/common/SearchBar';
import QuickViewModal from '../components/features/products/QuickViewModal';
import { useLocation } from 'react-router-dom';

const Shop: React.FC = () => {
  const [category, setCategory] = useState<'all' | 'earring' | 'necklace' | 'ring' | 'bracelet'>('all');
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const location = useLocation();

  // Detailed Filters
  const [maxPrice, setMaxPrice] = useState<number>(100000);
  const [selectedMaterials, setSelectedMaterials] = useState<string[]>([]);
  // Color filter removed
  const [selectedColors, setSelectedColors] = useState<string[]>([]);
  const [selectedSizes, setSelectedSizes] = useState<string[]>([]);

  // Search & Sort
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState<'newest' | 'popularity' | 'priceLow' | 'priceHigh' | 'reviews'>('newest');

  // Quick View
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);

  useEffect(() => {
    if (location.state?.category) {
      setCategory(location.state.category);
    }
  }, [location.state]);

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const data = await getProducts();
        setProducts(data);
      } catch (error) {
        console.error("Failed to fetch products:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();
  }, []);

  const fuse = useMemo(() => new Fuse(products, {
    // Removed 'colors' from search keys if desired, but keeping it might be useful. 
    // User asked to remove filter, usually implies removing UI control. 
    // I'll keep 'colors' in search keys just in case they type "Gold".
    keys: ['name', 'description', 'tags', 'category', 'material', 'colors'],
    threshold: 0.3,
  }), [products]);

  const toggleFilter = (item: string, current: string[], setter: React.Dispatch<React.SetStateAction<string[]>>) => {
    if (current.includes(item)) {
      setter(current.filter(i => i !== item));
    } else {
      setter([...current, item]);
    }
  };

  const getFilteredProducts = () => {
    let result = products;

    // 1. Search
    if (searchQuery) {
      result = fuse.search(searchQuery).map(res => res.item);
    }

    // 2. Category
    if (category !== 'all') {
      result = result.filter(p => p.category === category);
    }

    // 3. Detailed Filters
    result = result.filter(p => p.price <= maxPrice)
      .filter(p => selectedMaterials.length === 0 || (p.material && selectedMaterials.includes(p.material)))
      .filter(p => selectedMaterials.length === 0 || (p.material && selectedMaterials.includes(p.material)))
      .filter(p => selectedColors.length === 0 || (p.colors && p.colors.some(c => selectedColors.includes(c))))
      .filter(p => selectedSizes.length === 0 || (p.sizes && p.sizes.some(s => selectedSizes.includes(s))));

    // 4. Sort
    switch (sortBy) {
      case 'priceLow':
        return result.sort((a, b) => a.price - b.price);
      case 'priceHigh':
        return result.sort((a, b) => b.price - a.price);
      case 'popularity':
        return result.sort((a, b) => (b.sales || 0) - (a.sales || 0));
      case 'reviews':
        return result.sort((a, b) => (b.reviewCount || 0) - (a.reviewCount || 0));
      case 'newest':
      default:
        return result.sort((a, b) => (a.isNew === b.isNew ? 0 : a.isNew ? -1 : 1));
    }
  };

  const filteredProducts = getFilteredProducts();

  // Suggestions for Autocomplete
  const searchSuggestions = useMemo(() => {
    const allTags = products.flatMap(p => p.tags || []);
    const allNames = products.map(p => p.name);
    return Array.from(new Set([...allTags, ...allNames]));
  }, [products]);

  const categories = [
    { id: 'all', label: '전체' },
    { id: 'earring', label: '귀걸이' },
    { id: 'necklace', label: '목걸이' },
    { id: 'ring', label: '반지' },
    { id: 'bracelet', label: '팔찌' }
  ];

  const materials = ["Gold", "Silver", "Rose Gold", "Pearl", "Gemstone", "Beads", "Crystal"];
  // Colors array removed
  const sizes = ["Free", "11호", "13호", "15호", "40cm", "45cm", "16cm", "18cm"];

  if (loading) return <Loading />;

  return (
    <div className="pt-24 pb-20 bg-white min-h-screen">
      <SEO title="Shop" description="LUMINA의 모든 컬렉션을 만나보세요." />
      <div className="container mx-auto px-6">
        <h1 className="text-4xl font-serif text-center mb-8">Collection</h1>

        {/* Search Bar */}
        <SearchBar
          onSearch={setSearchQuery}
          suggestions={searchSuggestions}
          placeholder="상품명, 태그, 소재 등으로 검색해보세요"
        />

        <div className="flex flex-col lg:flex-row gap-12 mt-12">
          {/* Sidebar Filters */}
          <aside className="lg:w-1/4 space-y-8">
            {/* Category */}
            <div>
              <h3 className="font-serif font-bold text-lg mb-4">Category</h3>
              <div className="flex flex-wrap gap-2">
                {categories.map(cat => (
                  <button
                    key={cat.id}
                    onClick={() => setCategory(cat.id as any)}
                    className={`px-4 py-2 text-xs uppercase tracking-wide border rounded-full transition-all ${category === cat.id
                      ? 'bg-primary text-white border-primary'
                      : 'bg-white text-gray-500 border-gray-200 hover:border-gray-800 hover:text-black'
                      }`}
                  >
                    {cat.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Price Range */}
            <div>
              <h3 className="font-serif font-bold text-lg mb-4">Price</h3>
              <input
                type="range"
                min="0"
                max="100000"
                step="5000"
                value={maxPrice}
                onChange={(e) => setMaxPrice(Number(e.target.value))}
                className="w-full accent-primary"
              />
              <div className="flex justify-between text-sm text-gray-500 mt-2">
                <span>0원</span>
                <span>{maxPrice.toLocaleString()}원 이하</span>
              </div>
            </div>

            {/* Material */}
            <div>
              <h3 className="font-serif font-bold text-lg mb-4">Material</h3>
              <div className="space-y-2">
                {materials.map(mat => (
                  <label key={mat} className="flex items-center space-x-2 cursor-pointer group">
                    <div className={`w-4 h-4 border rounded flex items-center justify-center transition ${selectedMaterials.includes(mat) ? 'bg-primary border-primary' : 'border-gray-300 group-hover:border-primary'}`}>
                      {selectedMaterials.includes(mat) && <div className="w-2 h-2 bg-white rounded-full" />}
                    </div>
                    <input
                      type="checkbox"
                      className="hidden"
                      checked={selectedMaterials.includes(mat)}
                      onChange={() => toggleFilter(mat, selectedMaterials, setSelectedMaterials)}
                    />
                    <span className={`text-sm ${selectedMaterials.includes(mat) ? 'text-gray-900 font-medium' : 'text-gray-500 group-hover:text-gray-800'}`}>{mat}</span>
                  </label>
                ))}
              </div>
            </div>

            {/* Color */}
            <div>
              <h3 className="font-serif font-bold text-lg mb-4">Color</h3>
              <div className="flex flex-wrap gap-2">
                {["Gold", "Silver", "Rose Gold", "White", "Black", "Red", "Blue", "Green", "Pink"].map(color => (
                  <button
                    key={color}
                    onClick={() => toggleFilter(color, selectedColors, setSelectedColors)}
                    className={`w-6 h-6 rounded-full border transition-all ${selectedColors.includes(color) ? 'ring-2 ring-offset-2 ring-primary border-transparent' : 'border-gray-300 hover:border-gray-400'}`}
                    style={{ backgroundColor: color.toLowerCase().replace(' ', '') === 'rose gold' ? '#B76E79' : color.toLowerCase() }}
                    title={color}
                  >
                    {/* Checkmark for selected */}
                    {selectedColors.includes(color) && (
                      <span className="flex items-center justify-center h-full text-white text-[10px]">✓</span>
                    )}
                  </button>
                ))}
              </div>
            </div>

            {/* Size */}
            <div>
              <h3 className="font-serif font-bold text-lg mb-4">Size</h3>
              <div className="flex flex-wrap gap-2">
                {sizes.map(size => (
                  <button
                    key={size}
                    onClick={() => toggleFilter(size, selectedSizes, setSelectedSizes)}
                    className={`px-3 py-1 text-xs border rounded transition-colors ${selectedSizes.includes(size)
                      ? 'bg-gray-900 text-white border-gray-900'
                      : 'bg-white text-gray-500 border-gray-200 hover:border-gray-400'
                      }`}
                  >
                    {size}
                  </button>
                ))}
              </div>
            </div>
          </aside>

          {/* Product Grid */}
          <div className="lg:w-3/4">
            <div className="mb-6 flex justify-between items-center">
              <span className="text-gray-500 text-sm">Showing {filteredProducts.length} results</span>

              {/* Sort Dropdown */}
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as any)}
                className="border border-gray-300 rounded-md px-3 py-1 text-sm focus:outline-none focus:border-primary"
              >
                <option value="newest">신상품순</option>
                <option value="popularity">인기순</option>
                <option value="priceLow">낮은 가격순</option>
                <option value="priceHigh">높은 가격순</option>
                <option value="reviews">리뷰 많은순</option>
              </select>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
              {filteredProducts.map(product => (
                <ProductCard
                  key={product.id}
                  product={product}
                  onQuickView={setSelectedProduct}
                />
              ))}
            </div>

            {filteredProducts.length === 0 && (
              <div className="text-center text-gray-400 py-20 border border-dashed border-gray-200 rounded-lg">
                <p>선택한 조건에 맞는 상품이 없습니다.</p>
                <button
                  onClick={() => {
                    setCategory('all');
                    setMaxPrice(100000);
                    setSelectedMaterials([]);
                    setSelectedMaterials([]);
                    setSelectedColors([]);
                    setSelectedSizes([]);
                    setSearchQuery('');
                  }}
                  className="mt-4 text-primary underline hover:text-black"
                >
                  필터 초기화
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Quick View Modal */}
      {selectedProduct && (
        <QuickViewModal
          product={selectedProduct}
          onClose={() => setSelectedProduct(null)}
        />
      )}
    </div>
  );
};

export default Shop;