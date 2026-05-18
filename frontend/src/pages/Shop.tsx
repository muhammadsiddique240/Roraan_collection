import { useState, useMemo } from 'react';
import { useSearchParams } from 'react-router-dom';
import { motion, AnimatePresence } from 'motion/react';
import { useStore } from '@/store/useStore';
import { Filter, X, Search } from 'lucide-react';
import { cn } from '@/lib/utils';
import { ProductCard } from '@/components/ui/ProductCard';

export default function Shop() {
  const products = useStore(state => state.products);
  const [searchParams, setSearchParams] = useSearchParams();
  const [isMobileFilterOpen, setIsMobileFilterOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  // Filters
  const selectedBrand = searchParams.get('brand');
  const selectedSize = searchParams.get('size');

  const brands = useMemo(() => Array.from(new Set(products.map(p => p.brand))), [products]);
  const sizes = useMemo(() => Array.from(new Set(products.map(p => p.size.eu).filter(Boolean))).sort((a, b) => parseFloat(a) - parseFloat(b)), [products]);
  const conditions = useMemo(() => Array.from(new Set(products.map(p => p.condition))), [products]);

  const selectedCategory = searchParams.get('category');
  const selectedCondition = searchParams.get('condition');

  const getBrandCount = (brand: string) => products.filter(p => p.brand.toLowerCase() === brand.toLowerCase()).length;

  const toggleParam = (key: string, value: string) => {
    const current = searchParams.get(key);
    if (current === value) {
      searchParams.delete(key);
    } else {
      searchParams.set(key, value);
    }
    setSearchParams(searchParams);
  };

  const clearFilters = () => {
    setSearchParams(new URLSearchParams());
    setSearchQuery('');
  };

  const filteredProducts = useMemo(() => {
    return products.filter(p => {
      const matchBrand = selectedBrand ? p.brand.toLowerCase() === selectedBrand.toLowerCase() : true;
      const matchSize = selectedSize ? p.size.eu === selectedSize : true;
      const matchCat = selectedCategory 
        ? p.category.toLowerCase() === selectedCategory.toLowerCase() || p.isUnisex === true 
        : true;
      const matchCond = selectedCondition ? p.condition === selectedCondition : true;
      const matchSearch = searchQuery ? p.title.toLowerCase().includes(searchQuery.toLowerCase()) || p.brand.toLowerCase().includes(searchQuery.toLowerCase()) : true;
      return matchBrand && matchSize && matchCat && matchCond && matchSearch;
    });
  }, [products, selectedBrand, selectedSize, selectedCategory, selectedCondition, searchQuery]);

  const activeFilterCount = (selectedBrand ? 1 : 0) + (selectedSize ? 1 : 0) + (selectedCategory ? 1 : 0) + (selectedCondition ? 1 : 0) + (searchQuery ? 1 : 0);

  return (
    <div className="max-w-[1600px] mx-auto px-6 lg:px-12 py-28 flex flex-col md:flex-row gap-12 bg-white text-black">

      {/* Mobile Filter Toggle */}
      <div className="md:hidden flex justify-between items-center mb-6">
        <h1 className="text-3xl font-display font-bold text-black tracking-tight uppercase">Shop</h1>
        <button
          onClick={() => setIsMobileFilterOpen(true)}
          className="flex items-center gap-2 text-xs uppercase tracking-widest bg-white border border-black/20 px-4 py-2"
        >
          <Filter size={16} /> Filters {activeFilterCount > 0 && `(${activeFilterCount})`}
        </button>
      </div>

      {/* Sidebar Filters */}
      <aside className={cn(
        "w-72 flex-shrink-0 md:sticky md:top-32 md:max-h-[calc(100vh-8rem)] md:overflow-y-auto no-scrollbar",
        "md:block",
        isMobileFilterOpen ? "fixed inset-0 z-50 bg-white p-6 overflow-y-auto block pt-24" : "hidden"
      )}>
        <div className="flex justify-between items-center mb-10 md:hidden">
          <h2 className="text-xl font-display font-bold text-black uppercase tracking-tight">Filters</h2>
          <button onClick={() => setIsMobileFilterOpen(false)} className="p-2 bg-white border border-black/20"><X size={24} /></button>
        </div>

        <div className="hidden md:block mb-10">
          <h1 className="text-4xl font-display font-bold text-black tracking-tight uppercase mb-2">Our Collection</h1>
          <p className="text-zinc-500 text-[11px] font-medium uppercase tracking-widest">Showing {filteredProducts.length} items.</p>
        </div>

        <div className="mb-8">
          <div className="relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-400" size={16} />
            <input
              type="text"
              placeholder="SEARCH THE ARCHIVE..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-white border border-black/20 py-4 pl-12 pr-4 text-[11px] font-semibold uppercase tracking-[0.15em] text-black placeholder:text-zinc-400 focus:outline-none focus:border-black transition-all"
            />
          </div>
        </div>

        {activeFilterCount > 0 && (
          <button
            onClick={clearFilters}
            className="text-[10px] font-semibold uppercase tracking-widest text-zinc-500 mb-8 hover:text-black transition-colors flex items-center gap-2 group"
          >
            Clear All Filters <X size={12} className="group-hover:rotate-90 transition-transform" />
          </button>
        )}

        <div className="space-y-12">
          {/* Size Filter */}
          <div>
            <h3 className="text-[10px] font-semibold uppercase tracking-[0.3em] text-zinc-500 mb-6 flex items-center gap-2">
              <span className="w-1.5 h-1.5 bg-black"></span>
              Size Matrix (EU)
            </h3>
            <div className="grid grid-cols-4 gap-3">
              {sizes.map(size => (
                <button
                  key={size}
                  onClick={() => toggleParam('size', size)}
                  className={cn(
                    "py-2.5 px-1 text-[10px] transition-all font-semibold border uppercase tracking-tighter",
                    selectedSize === size
                      ? "bg-black text-white border-black scale-105"
                      : "bg-white border-black/20 text-zinc-500 hover:border-black"
                  )}
                >
                  {size}
                </button>
              ))}
            </div>
          </div>

          {/* Brand Filter */}
          <div>
            <h3 className="text-[10px] font-semibold uppercase tracking-[0.3em] text-zinc-500 mb-6 flex items-center gap-2">
              <span className="w-1.5 h-1.5 bg-black"></span>
              Brand
            </h3>
            <div className="flex flex-col gap-4">
              {brands.map(brand => (
                <label key={brand} className="flex items-center gap-4 cursor-pointer group">
                  <div className={cn(
                    "w-5 h-5 border flex items-center justify-center transition-all shrink-0 group-hover:bg-zinc-100",
                    selectedBrand?.toLowerCase() === brand.toLowerCase()
                      ? "bg-black border-black text-white"
                      : "border-black/20 bg-white"
                  )}>
                    {selectedBrand?.toLowerCase() === brand.toLowerCase() && (
                      <svg width="10" height="8" viewBox="0 0 10 8" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path d="M1 4.5L3.5 7L9 1" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
                      </svg>
                    )}
                  </div>
                  <span className={cn(
                    "text-[11px] font-semibold uppercase tracking-widest transition-colors",
                    selectedBrand?.toLowerCase() === brand.toLowerCase() ? "text-black" : "text-zinc-500 group-hover:text-black"
                  )}>{brand}</span>
                  <span className="text-[9px] font-semibold text-zinc-400 ml-auto">[{getBrandCount(brand)}]</span>
                  <input type="checkbox" className="hidden" checked={selectedBrand?.toLowerCase() === brand.toLowerCase()} onChange={() => toggleParam('brand', brand.toLowerCase())} />
                </label>
              ))}
            </div>
          </div>

          {/* Condition Filter */}
          <div>
            <h3 className="text-[10px] font-semibold uppercase tracking-[0.3em] text-zinc-500 mb-6 flex items-center gap-2">
              <span className="w-1.5 h-1.5 bg-black"></span>
              Condition
            </h3>
            <div className="flex flex-col gap-4">
              {conditions.map(cond => (
                <label key={cond} className="flex items-center gap-4 cursor-pointer group">
                  <div className={cn(
                    "w-5 h-5 border flex items-center justify-center transition-all shrink-0 group-hover:bg-zinc-100",
                    selectedCondition === cond
                      ? "bg-black border-black text-white"
                      : "border-black/20 bg-white"
                  )}>
                    {selectedCondition === cond && (
                      <svg width="10" height="8" viewBox="0 0 10 8" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path d="M1 4.5L3.5 7L9 1" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
                      </svg>
                    )}
                  </div>
                  <span className={cn(
                    "text-[11px] font-semibold uppercase tracking-widest transition-colors",
                    selectedCondition === cond ? "text-black" : "text-zinc-500 group-hover:text-black"
                  )}>{cond}</span>
                  <input type="checkbox" className="hidden" checked={selectedCondition === cond} onChange={() => toggleParam('condition', cond)} />
                </label>
              ))}
            </div>
          </div>
        </div>

        <div className="mt-12 md:hidden">
          <button
            onClick={() => setIsMobileFilterOpen(false)}
            className="w-full py-4 border border-black bg-black text-white uppercase text-sm font-semibold"
          >
            Apply Filters
          </button>
        </div>
      </aside>

      {/* Product Grid */}
      <main className="flex-1">
        {filteredProducts.length === 0 ? (
          <div className="h-96 flex flex-col items-center justify-center text-center bg-zinc-50 border border-black/15">
            <h3 className="text-3xl font-display font-bold text-black tracking-tight uppercase mb-2">No Matching Products</h3>
            <p className="text-zinc-500 text-sm font-medium">Refine your search parameters to explore the collection.</p>
            <button onClick={clearFilters} className="btn-secondary mt-10">Reset Filters</button>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-2 xl:grid-cols-3 gap-y-14 gap-x-8">
            <AnimatePresence mode="popLayout">
              {filteredProducts.map((product) => (
                <motion.div
                  key={product.id}
                  layout
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.9 }}
                  transition={{ duration: 0.4, ease: [0.23, 1, 0.32, 1] }}
                >
                  <ProductCard product={product} />
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        )}
      </main>
    </div>
  );
}
