import { Link, useLocation, useNavigate } from 'react-router-dom';
import { Search, Menu, X, ArrowRight, ShoppingBag } from 'lucide-react';
import { useState, useEffect } from 'react';
import { cn } from '@/lib/utils';
import { motion, AnimatePresence } from 'motion/react';
import { useStore } from '@/store/useStore';
import { siteConfig } from '@/config/siteConfig';
import CartDrawer from '../cart/CartDrawer';

export default function Navbar() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [cartOpen, setCartOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [isScrolled, setIsScrolled] = useState(false);
  const cart = useStore(state => state.cart);
  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    setMobileMenuOpen(false);
    setSearchOpen(false);
    setSearchQuery('');
  }, [location.pathname]);

  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 64);
    handleScroll();
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/shop?q=${encodeURIComponent(searchQuery.trim())}`);
      setSearchOpen(false);
    }
  };

  const trendingSearches = ['Jordan 1 Chicago', 'Yeezy 700', 'Nike Dunk Panda', 'Off-White Presto'];

  return (
    <>
      <header
        className={cn(
          "fixed top-0 w-full z-40 transition-all duration-500 overflow-x-hidden",
          isScrolled
            ? "bg-white/95 backdrop-blur-md shadow-lg border-b border-zinc-200"
            : "bg-white border-b border-zinc-200"
        )}
      >
        {/* Top Banner */}
        <div className="bg-zinc-900 text-white text-center py-2 text-[10px] md:text-xs tracking-wider uppercase font-bold">
          RS. 400 DELIVERY CHARGES IN ADVANCE. REST WILL BE CASH ON DELIVERY (COD).
        </div>

        {/* Main Navbar */}
        <div className="max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-12 py-4 md:py-7 relative h-16 md:h-24 flex items-center">
          {/* Mobile & Tablet: Centered Logo with Search Left, Cart/Menu Right */}
          <div className="flex lg:hidden items-center justify-between w-full relative">
            {/* Left: Search Icon */}
            <button
              className="text-zinc-700 hover:text-black transition-all p-1 flex-shrink-0"
              onClick={() => setSearchOpen(true)}
            >
              <Search size={20} />
            </button>

            {/* Center: Logo (always centered) */}
            <Link to="/" className="absolute left-1/2 -translate-x-1/2 z-20">
              <div className="flex flex-col items-center">
                <span className="text-2xl sm:text-3xl font-black tracking-[-0.08em] text-black">
                  {siteConfig.brand.name}
                </span>
                <div className="flex items-center gap-1 mt-0.5">
                  <div className="h-[1px] w-2 sm:w-3 bg-black/10"></div>
                  <span className="text-[7px] sm:text-[8px] tracking-[0.3em] text-zinc-500 font-bold uppercase">
                    COLLECTION
                  </span>
                  <div className="h-[1px] w-2 sm:w-3 bg-black/10"></div>
                </div>
              </div>
            </Link>

            {/* Right: Cart + Menu */}
            <div className="flex items-center gap-3 flex-shrink-0">
              <button
                onClick={() => setCartOpen(true)}
                className="relative text-zinc-700 hover:text-black transition-all p-1"
              >
                <ShoppingBag size={20} />
                {cart.length > 0 && (
                  <span className="absolute -top-1 -right-1 bg-black text-white text-[7px] font-black w-3.5 h-3.5 flex items-center justify-center">
                    {cart.length}
                  </span>
                )}
              </button>

              <button className="text-zinc-700 hover:text-black p-1" onClick={() => setMobileMenuOpen(true)}>
                <Menu size={22} />
              </button>
            </div>
          </div>

          {/* Desktop: Full Layout */}
          <div className="hidden lg:flex items-center justify-between w-full">
            {/* Left Navigation */}
            <nav className="flex gap-10 items-center flex-1">
              <NavLink to="/shop?filter=new">New Arrivals</NavLink>
              <NavLink to="/shop?category=sneakers">Sneakers</NavLink>
              <NavLink to="/archive">Archive</NavLink>
            </nav>

            {/* Desktop Logo - Centered */}
            <Link to="/" className="absolute left-1/2 -translate-x-1/2 z-20 group">
              <div className="flex flex-col items-center">
                <span className="text-4xl font-black tracking-[-0.08em] text-black transition-transform group-hover:scale-105 duration-300">
                  {siteConfig.brand.name}
                </span>
                <div className="flex items-center gap-2 mt-1">
                  <div className="h-[1px] w-4 bg-black/10"></div>
                  <span className="text-[9px] tracking-[0.4em] text-zinc-500 font-bold uppercase">
                    COLLECTION
                  </span>
                  <div className="h-[1px] w-4 bg-black/10"></div>
                </div>
              </div>
            </Link>

            {/* Right Navigation + Icons */}
            <div className="flex items-center gap-10 flex-1 justify-end">
              <nav className="flex gap-10 items-center">
                <NavLink to="/shop?category=apparel">Apparel</NavLink>
                <NavLink to="/contact">Contact</NavLink>
              </nav>

              <div className="flex items-center gap-6 border-l border-zinc-100 pl-10 h-6">
                <button
                  className="text-zinc-700 hover:text-black transition-all"
                  onClick={() => setSearchOpen(true)}
                >
                  <Search size={20} />
                </button>

                <button
                  onClick={() => setCartOpen(true)}
                  className="relative text-zinc-700 hover:text-black transition-all"
                >
                  <ShoppingBag size={20} />
                  {cart.length > 0 && (
                    <span className="absolute -top-1.5 -right-1.5 bg-black text-white text-[8px] font-black w-4 h-4 flex items-center justify-center">
                      {cart.length}
                    </span>
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      </header>

      <CartDrawer isOpen={cartOpen} onClose={() => setCartOpen(false)} />

      {/* Search Overlay */}
      <AnimatePresence>
        {searchOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-[#050505]/95 backdrop-blur-xl flex flex-col pt-32 px-6 lg:px-24"
          >
            <button
              onClick={() => setSearchOpen(false)}
              className="absolute top-8 right-8 text-white/30 hover:text-white transition-colors"
            >
              <X size={36} />
            </button>

            <div className="w-full max-w-4xl mx-auto">
              <form onSubmit={handleSearch} className="relative mb-12">
                <input
                  type="text"
                  autoFocus
                  placeholder="SEARCH THE ARCHIVE..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full bg-transparent border-b-2 border-white/20 text-4xl md:text-6xl font-black uppercase tracking-[0.08em] text-white pb-4 focus:outline-none focus:border-white transition-colors placeholder:text-white/20"
                />
                <button type="submit" className="absolute right-0 bottom-6 text-white/30 hover:text-white transition-colors">
                  <ArrowRight size={36} />
                </button>
              </form>

              <div>
                <p className="text-zinc-400 text-[10px] font-black uppercase tracking-[0.25em] mb-6">Trending Searches</p>
                <div className="flex flex-wrap gap-4">
                  {trendingSearches.map((term, i) => (
                    <Link
                      key={i}
                      to={`/shop?q=${encodeURIComponent(term)}`}
                      className="px-6 py-3 border border-white/20 text-sm uppercase tracking-[0.15em] hover:border-white hover:bg-white hover:text-black transition-all font-medium text-white/70"
                    >
                      {term}
                    </Link>
                  ))}
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Mobile Menu */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, x: '100%' }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: '100%' }}
            transition={{ type: 'spring', damping: 25, stiffness: 200 }}
            className="fixed inset-0 z-50 bg-[#050505] flex flex-col pt-24 px-8"
          >
            <button
              onClick={() => setMobileMenuOpen(false)}
              className="absolute top-6 right-6 text-white/40 hover:text-white"
            >
              <X size={32} />
            </button>

            <Link to="/" className="mb-12" onClick={() => setMobileMenuOpen(false)}>
              <div className="flex flex-col">
                <span className="text-5xl font-black tracking-[-0.08em] text-white">
                  {siteConfig.brand.name}
                </span>
                <div className="flex items-center gap-2 mt-2">
                  <div className="h-[1px] w-4 bg-white/20"></div>
                  <span className="text-[9px] tracking-[0.4em] text-zinc-400 font-bold uppercase">
                    COLLECTION
                  </span>
                </div>
              </div>
            </Link>
            <nav className="flex flex-col gap-6 text-2xl font-black uppercase tracking-[0.08em] text-white/70">
              {siteConfig.navigation.map((item) => (
                <Link key={item.path} to={item.path} className="hover:text-white" onClick={() => setMobileMenuOpen(false)}>{item.label}</Link>
              ))}

              <button
                onClick={() => { setMobileMenuOpen(false); setCartOpen(true); }}
                className="hover:text-white flex items-center gap-3 text-left w-fit"
              >
                Your Bag
                <span className="bg-white text-black text-[10px] px-2 py-0.5 font-black">
                  {cart.length}
                </span>
              </button>

              <div className="flex flex-col gap-4 mt-4">
                <span className="text-white/25 text-xs font-bold uppercase tracking-[0.2em]">Shop By Condition</span>
                <div className="flex flex-col gap-3 pl-4 border-l-2 border-white/15 text-xl">
                  <Link to="/shop?condition=Premium" className="hover:text-white">Premium</Link>
                  <Link to="/shop?condition=Excellent" className="hover:text-white">Excellent</Link>
                  <Link to="/shop?condition=Very Good" className="hover:text-white">Very Good</Link>
                  <Link to="/shop?condition=Good" className="hover:text-white">Good</Link>
                </div>
              </div>
            </nav>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}

function NavLink({ to, children }: { to: string; children: React.ReactNode }) {
  return (
    <Link
      to={to}
      className="text-[11px] uppercase tracking-[0.2em] font-semibold text-zinc-700 hover:text-black transition-colors"
    >
      {children}
    </Link>
  );
}
