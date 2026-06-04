import { Link } from 'react-router-dom';
import { motion } from 'motion/react';

export function CategoryBento() {
  return (
    <section id="categories" className="pt-8 pb-16 md:pt-12 md:pb-24 max-w-[1600px] mx-auto px-6 lg:px-12 w-full bg-white">
      <div className="flex flex-col mb-8 text-center">
        <h2 className="text-xl md:text-2xl font-bold text-gray-900 mx-auto max-w-4xl">
          Buy 100% Original Preloved Shoes Online in Pakistan - Why Pay More For The Same Pair
        </h2>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="relative rounded-2xl md:rounded-3xl overflow-hidden group h-[400px] md:h-auto md:aspect-[4/3] bg-gray-100"
        >
          <div className="absolute inset-0 bg-[url('/men-category.jpg')] bg-cover bg-center transform group-hover:scale-105 transition-transform duration-1000"></div>
          <div className="absolute inset-0 bg-black/20 z-0"></div>

          <Link to="/shop?category=men" className="absolute inset-0 flex items-center justify-center z-10 cursor-pointer">
            <h2 className="text-white text-4xl sm:text-5xl md:text-7xl font-extrabold uppercase tracking-wider sm:tracking-widest drop-shadow-sm">
              MEN
            </h2>
          </Link>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.1 }}
          className="relative rounded-2xl md:rounded-3xl overflow-hidden group h-[400px] md:h-auto md:aspect-[4/3] bg-gray-100"
        >
          <div className="absolute inset-0 bg-[url('/women-category.jpg')] bg-cover bg-center transform group-hover:scale-105 transition-transform duration-1000"></div>
          <div className="absolute inset-0 bg-black/20 z-0"></div>

          <Link to="/shop?category=women" className="absolute inset-0 flex items-center justify-center z-10 cursor-pointer">
            <h2 className="text-white text-4xl sm:text-5xl md:text-7xl font-extrabold uppercase tracking-wider sm:tracking-widest drop-shadow-sm">
              WOMEN
            </h2>
          </Link>
        </motion.div>
      </div>
    </section>
  );
}
