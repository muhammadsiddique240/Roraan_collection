import { useMemo } from 'react';
import { motion } from 'motion/react';
import { useStore } from '@/store/useStore';
import { ProductCard } from '@/components/ui/ProductCard';

export default function Archive() {
    const products = useStore(state => state.products);

    const soldProducts = useMemo(() =>
        products.filter(p => p.status === 'SOLD').sort((a, b) =>
            new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
        ), [products]);

    return (
        <div className="max-w-[1600px] mx-auto px-6 lg:px-12 py-28 bg-white min-h-screen">
            <div className="mb-16 text-center max-w-2xl mx-auto">
                <h1 className="text-4xl md:text-5xl font-display font-bold text-black tracking-tighter uppercase mb-4">
                    The Sold Archive
                </h1>
                <p className="text-zinc-500 text-xs font-bold uppercase tracking-[0.3em]">
                    Past treasures that found their new home. Explore the history of RORAAN.
                </p>
            </div>

            {soldProducts.length === 0 ? (
                <div className="h-64 flex flex-col items-center justify-center text-center border-2 border-dashed border-zinc-100 rounded-3xl">
                    <p className="text-zinc-400 font-semibold uppercase tracking-widest text-[10px]">No items in the archive yet.</p>
                </div>
            ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-x-8 gap-y-16">
                    {soldProducts.map((product) => (
                        <motion.div
                            key={product.id}
                            initial={{ opacity: 0, filter: 'grayscale(100%)' }}
                            animate={{ opacity: 1, filter: 'grayscale(100%)' }}
                            whileHover={{ filter: 'grayscale(0%)', scale: 1.02 }}
                            className="relative group cursor-pointer"
                        >
                            <ProductCard product={product} />
                            <div className="absolute top-4 left-4 z-20">
                                <span className="bg-black text-white px-3 py-1 text-[9px] font-black uppercase tracking-widest shadow-xl">
                                    SOLD OUT
                                </span>
                            </div>
                        </motion.div>
                    ))}
                </div>
            )}
        </div>
    );
}
