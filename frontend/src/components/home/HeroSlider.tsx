import { motion } from 'motion/react';
import { ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';

export function HeroSlider() {
  return (
    <section className="relative h-[100svh] min-h-screen flex items-center justify-center overflow-hidden w-full">
      {/* Layer 1: Single Background Image (z-0) */}
      <div
        className="absolute inset-0 bg-cover bg-center z-0"
        style={{ backgroundImage: `url('/images/hero_main.png')` }}
      />

      {/* Layer 2: Professional Smoke/Fog Effect - Rising from Bottom */}

      {/* Fog Base Layer - Dense bottom fog that stays low */}
      <div
        className="absolute inset-x-0 bottom-0 z-10 pointer-events-none"
        style={{
          height: '70%',
          background: 'linear-gradient(to top, rgba(180,140,100,0.85) 0%, rgba(160,120,80,0.5) 30%, rgba(140,100,60,0.2) 60%, transparent 100%)',
          animation: 'smoke-pulse 6s ease-in-out infinite',
          filter: 'blur(30px)',
        }}
      />

      {/* Smoke Cloud 1 - Large left cloud rising */}
      <div
        className="absolute z-10 pointer-events-none"
        style={{
          bottom: '-10%',
          left: '0%',
          width: '55%',
          height: '80%',
          background: 'radial-gradient(ellipse at center, rgba(200,165,120,0.7) 0%, rgba(180,140,90,0.4) 35%, rgba(160,120,70,0.15) 60%, transparent 75%)',
          animation: 'smoke-rise-1 12s ease-in-out infinite',
          filter: 'blur(40px)',
        }}
      />

      {/* Smoke Cloud 2 - Large right cloud rising */}
      <div
        className="absolute z-10 pointer-events-none"
        style={{
          bottom: '-15%',
          right: '0%',
          width: '55%',
          height: '85%',
          background: 'radial-gradient(ellipse at center, rgba(190,150,100,0.65) 0%, rgba(170,130,85,0.35) 35%, rgba(150,110,65,0.12) 60%, transparent 75%)',
          animation: 'smoke-rise-2 15s ease-in-out infinite',
          filter: 'blur(45px)',
          animationDelay: '2s',
        }}
      />

      {/* Smoke Cloud 3 - Center cloud */}
      <div
        className="absolute z-10 pointer-events-none"
        style={{
          bottom: '-5%',
          left: '20%',
          width: '55%',
          height: '75%',
          background: 'radial-gradient(ellipse at center, rgba(210,175,130,0.6) 0%, rgba(190,155,110,0.3) 40%, rgba(170,135,90,0.1) 65%, transparent 80%)',
          animation: 'smoke-rise-3 10s ease-in-out infinite',
          filter: 'blur(35px)',
          animationDelay: '4s',
        }}
      />

      {/* Smoke Cloud 4 - Extra fog wisps left */}
      <div
        className="absolute z-10 pointer-events-none"
        style={{
          bottom: '0%',
          left: '5%',
          width: '45%',
          height: '60%',
          background: 'radial-gradient(ellipse at center, rgba(220,185,140,0.5) 0%, rgba(200,165,120,0.25) 40%, transparent 70%)',
          animation: 'smoke-rise-1 18s ease-in-out infinite',
          filter: 'blur(50px)',
          animationDelay: '6s',
        }}
      />

      {/* Smoke Cloud 5 - Extra fog wisps right */}
      <div
        className="absolute z-10 pointer-events-none"
        style={{
          bottom: '-8%',
          right: '5%',
          width: '50%',
          height: '65%',
          background: 'radial-gradient(ellipse at center, rgba(215,180,135,0.55) 0%, rgba(195,160,115,0.28) 38%, transparent 72%)',
          animation: 'smoke-rise-2 14s ease-in-out infinite',
          filter: 'blur(42px)',
          animationDelay: '3s',
        }}
      />

      {/* Smoke Cloud 6 - Top wisps that drift */}
      <div
        className="absolute z-10 pointer-events-none"
        style={{
          bottom: '20%',
          left: '10%',
          width: '80%',
          height: '50%',
          background: 'radial-gradient(ellipse at center, rgba(200,170,130,0.3) 0%, rgba(180,150,110,0.12) 45%, transparent 70%)',
          animation: 'smoke-drift 20s ease-in-out infinite, smoke-spread 8s ease-in-out infinite',
          filter: 'blur(55px)',
        }}
      />

      {/* Dense bottom edge glow - warm amber fog pooling at bottom */}
      <div
        className="absolute inset-x-0 bottom-0 z-10 pointer-events-none"
        style={{
          height: '35%',
          background: 'linear-gradient(to top, rgba(200,160,110,0.9) 0%, rgba(180,140,90,0.6) 25%, rgba(160,120,70,0.25) 55%, transparent 100%)',
          filter: 'blur(20px)',
          animation: 'smoke-pulse 5s ease-in-out infinite alternate',
        }}
      />

      {/* Dark gradient overlay to maintain text readability */}
      <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/30 to-black/15 z-10" />

      {/* Layer 3: Content (z-20) */}
      <div className="relative z-20 max-w-[1600px] mx-auto px-6 lg:px-12 w-full flex flex-col items-center justify-center h-full text-center">
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.9, ease: [0.23, 1, 0.32, 1] }}
          className="max-w-5xl w-full flex flex-col items-center"
        >
          {/* Luxury Tagline */}
          <div className="flex items-center gap-3 px-6 py-2.5 border border-white/40 backdrop-blur-md bg-white/5 w-fit mb-10 md:mb-12 rounded-full shadow-2xl">
            <span className="text-[10px] font-bold tracking-[0.35em] text-white uppercase">
              Curated Excellence
            </span>
          </div>

          {/* Premium Headline with Elegant Font */}
          <h1 className="text-3xl sm:text-5xl md:text-7xl lg:text-8xl leading-[0.95] font-serif font-light tracking-tight mb-6 md:mb-8 text-white uppercase overflow-hidden px-2">
            <motion.span
              initial={{ y: '100%' }}
              animate={{ y: 0 }}
              transition={{ duration: 0.8, delay: 0.3, ease: [0.23, 1, 0.32, 1] }}
              className="block"
              style={{
                fontFamily: '"Playfair Display", "Cormorant Garamond", Georgia, serif',
                fontWeight: 300,
                letterSpacing: '0.02em'
              }}
            >
              PREMIUM<br className="sm:hidden" /> THRIFTED<br className="sm:hidden" /> BRANDED<br className="sm:hidden" /> SHOES
            </motion.span>
          </h1>

          {/* Premium Sub-headline */}
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.7 }}
            className="text-gray-100 mb-8 md:mb-10 text-base md:text-lg font-light tracking-wide max-w-3xl leading-relaxed"
            style={{ fontFamily: '"Cormorant Garamond", Georgia, serif' }}
          >
            Find your perfect pair — one-of-a-kind pieces at unbeatable prices.
          </motion.p>

          {/* Elegant CTA Buttons */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.9 }}
            className="flex flex-wrap items-center justify-center gap-6"
          >
            <Link to="/shop" className="w-full sm:w-auto group">
              <button className="w-full sm:w-auto h-14 md:h-16 px-10 text-[11px] uppercase font-semibold tracking-[0.25em] bg-white text-black hover:bg-gray-50 transition-all duration-500 inline-flex items-center justify-center shadow-2xl hover:shadow-white/20 hover:scale-[1.02]">
                SHOP NOW <ArrowRight className="ml-3 w-4 h-4 transition-transform group-hover:translate-x-1" strokeWidth={2.5} />
              </button>
            </Link>
            <Link to="/shop" className="w-full sm:w-auto group">
              <button className="w-full sm:w-auto h-14 md:h-16 px-10 text-[11px] uppercase font-semibold tracking-[0.25em] border-2 border-white/80 bg-transparent text-white hover:bg-white hover:text-black transition-all duration-500 shadow-2xl hover:scale-[1.02]">
                BROWSE CATEGORIES
              </button>
            </Link>
          </motion.div>
        </motion.div>
      </div>
    </section>
  );
}
