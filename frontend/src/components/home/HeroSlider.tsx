import { motion } from 'motion/react';
import { ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';

export function HeroSlider() {
  return (
    <section className="relative h-[100svh] min-h-screen flex items-center justify-center overflow-hidden w-full">
      {/* Layer 1: Background Image */}
      <div
        className="absolute inset-0 bg-cover bg-center z-0 scale-110"
        style={{ backgroundImage: `url('/images/hero_main.png')` }}
      />

      {/* Layer 2: Heavy dark overlay to hide background text & create cinematic mood */}
      <div className="absolute inset-0 z-[1] bg-black/70" />

      {/* Layer 3: Strong Top vignette to fully kill the ROORAN text in image */}
      <div
        className="absolute inset-x-0 top-0 z-[2] pointer-events-none"
        style={{
          height: '65%',
          background: 'linear-gradient(to bottom, rgba(5,5,5,1) 0%, rgba(5,5,5,1) 30%, rgba(5,5,5,0.8) 55%, transparent 100%)',
        }}
      />

      {/* Layer 3.5: Corrected Watermark Text (Replaces the hidden image text) */}
      <div className="absolute top-[12%] lg:top-[8%] left-0 w-full flex justify-center z-[2] pointer-events-none select-none overflow-hidden mix-blend-overlay">
        <span className="text-[18vw] md:text-[12vw] font-black tracking-[0.15em] text-white/[0.03] uppercase">
          RORAAN
        </span>
      </div>

      {/* Layer 4: Warm golden ambient glow from bottom */}
      <div
        className="absolute inset-x-0 bottom-0 z-[2] pointer-events-none"
        style={{
          height: '60%',
          background: 'linear-gradient(to top, rgba(180,140,80,0.4) 0%, rgba(160,120,60,0.2) 30%, rgba(140,100,40,0.08) 55%, transparent 100%)',
          animation: 'smoke-pulse 6s ease-in-out infinite',
          filter: 'blur(25px)',
        }}
      />

      {/* Layer 5: Subtle warm fog wisps */}
      <div
        className="absolute z-[2] pointer-events-none"
        style={{
          bottom: '-10%',
          left: '0%',
          width: '55%',
          height: '70%',
          background: 'radial-gradient(ellipse at center, rgba(200,165,120,0.35) 0%, rgba(180,140,90,0.15) 40%, transparent 70%)',
          animation: 'smoke-rise-1 12s ease-in-out infinite',
          filter: 'blur(40px)',
        }}
      />
      <div
        className="absolute z-[2] pointer-events-none"
        style={{
          bottom: '-15%',
          right: '0%',
          width: '55%',
          height: '75%',
          background: 'radial-gradient(ellipse at center, rgba(190,150,100,0.3) 0%, rgba(170,130,85,0.12) 40%, transparent 70%)',
          animation: 'smoke-rise-2 15s ease-in-out infinite',
          filter: 'blur(45px)',
          animationDelay: '2s',
        }}
      />

      {/* Layer 6: Golden edge light effects */}
      <div
        className="absolute inset-0 z-[3] pointer-events-none"
        style={{
          background: 'radial-gradient(ellipse at 50% 80%, rgba(212,175,55,0.08) 0%, transparent 60%)',
        }}
      />

      {/* Layer 7: Content */}
      <div className="relative z-20 max-w-[1600px] mx-auto px-6 lg:px-12 w-full flex flex-col items-center justify-center h-full text-center">
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.9, ease: [0.23, 1, 0.32, 1] }}
          className="max-w-5xl w-full flex flex-col items-center"
        >
          {/* Elegant Gold Line Divider */}
          <motion.div
            initial={{ scaleX: 0 }}
            animate={{ scaleX: 1 }}
            transition={{ duration: 1.2, delay: 0.2, ease: [0.23, 1, 0.32, 1] }}
            className="w-16 h-[1px] bg-gradient-to-r from-transparent via-[#d4af37] to-transparent mb-8 md:mb-10"
          />

          {/* Brand Name Accent */}
          <motion.span
            initial={{ opacity: 0, letterSpacing: '0.8em' }}
            animate={{ opacity: 1, letterSpacing: '0.5em' }}
            transition={{ duration: 1, delay: 0.3 }}
            className="text-[10px] md:text-xs font-semibold tracking-[0.5em] text-[#d4af37] uppercase mb-6 md:mb-8"
          >
            Roraan Collection
          </motion.span>

          {/* Premium Headline */}
          <h1 className="text-4xl sm:text-5xl md:text-7xl lg:text-8xl leading-[0.92] font-serif font-light tracking-tight mb-6 md:mb-8 text-white uppercase overflow-hidden px-2">
            <motion.span
              initial={{ y: '100%' }}
              animate={{ y: 0 }}
              transition={{ duration: 0.8, delay: 0.5, ease: [0.23, 1, 0.32, 1] }}
              className="block"
              style={{
                fontFamily: '"Playfair Display", "Cormorant Garamond", Georgia, serif',
                fontWeight: 300,
                letterSpacing: '0.04em',
                textShadow: '0 4px 30px rgba(0,0,0,0.5)',
              }}
            >
              PREMIUM<br className="sm:hidden" /> THRIFTED<br className="sm:hidden" /> BRANDED<br className="sm:hidden" /> SHOES
            </motion.span>
          </h1>

          {/* Gold Divider Below Title */}
          <motion.div
            initial={{ scaleX: 0 }}
            animate={{ scaleX: 1 }}
            transition={{ duration: 1.2, delay: 0.7, ease: [0.23, 1, 0.32, 1] }}
            className="w-24 h-[1px] bg-gradient-to-r from-transparent via-[#d4af37] to-transparent mb-6 md:mb-8"
          />

          {/* Sub-headline */}
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.8 }}
            className="text-gray-300 mb-10 md:mb-12 text-sm md:text-lg font-light tracking-wider max-w-xl leading-relaxed"
            style={{ fontFamily: '"Cormorant Garamond", Georgia, serif', fontSize: 'clamp(14px, 2.5vw, 20px)' }}
          >
            Find your perfect pair — one-of-a-kind pieces at unbeatable prices.
          </motion.p>

          {/* CTA Buttons */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 1 }}
            className="flex flex-col sm:flex-row items-center justify-center gap-4 sm:gap-6 w-full max-w-md sm:max-w-none"
          >
            <Link to="/shop" className="w-full sm:w-auto group">
              <button className="w-full sm:w-auto h-14 md:h-16 px-10 text-[11px] uppercase font-semibold tracking-[0.25em] bg-white text-black hover:bg-[#d4af37] hover:text-black transition-all duration-500 inline-flex items-center justify-center shadow-[0_0_40px_rgba(255,255,255,0.1)] hover:shadow-[0_0_50px_rgba(212,175,55,0.3)] hover:scale-[1.02]">
                SHOP NOW <ArrowRight className="ml-3 w-4 h-4 transition-transform group-hover:translate-x-1" strokeWidth={2.5} />
              </button>
            </Link>
            <button
              onClick={() => document.getElementById('categories')?.scrollIntoView({ behavior: 'smooth', block: 'start' })}
              className="w-full sm:w-auto h-14 md:h-16 px-10 text-[11px] uppercase font-semibold tracking-[0.25em] border border-[#d4af37]/50 bg-transparent text-[#d4af37] hover:bg-[#d4af37] hover:text-black transition-all duration-500 shadow-[0_0_30px_rgba(212,175,55,0.05)] hover:shadow-[0_0_50px_rgba(212,175,55,0.2)] hover:scale-[1.02]"
            >
              BROWSE CATEGORIES
            </button>
          </motion.div>

          {/* Scroll Indicator */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 1, delay: 1.5 }}
            className="absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2"
          >
            <span className="text-[9px] uppercase tracking-[0.4em] text-white/40 font-medium">Scroll</span>
            <motion.div
              animate={{ y: [0, 8, 0] }}
              transition={{ duration: 1.5, repeat: Infinity, ease: 'easeInOut' }}
              className="w-[1px] h-8 bg-gradient-to-b from-[#d4af37]/60 to-transparent"
            />
          </motion.div>
        </motion.div>
      </div>
    </section>
  );
}
