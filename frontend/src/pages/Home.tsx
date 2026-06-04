import { useStore } from '@/store/useStore';
import { ProductCard } from '@/components/ui/ProductCard';
import { HeroSlider } from '@/components/home/HeroSlider';
import { CategoryBento } from '@/components/home/CategoryBento';
import { BrandSection } from '@/components/home/BrandSection';
import { SizeSection } from '@/components/home/SizeSection';

export default function Home() {
  const products = useStore(state => state.products);
  const latestProducts = useStore(state => state.latestProducts);
  // Show first 4 products as Top Picks, and use the latestProducts from API for Latest Drops
  const topPicks = products.slice(0, 4);

  return (
    <div className="flex flex-col bg-white overflow-hidden">
      <HeroSlider />

      <CategoryBento />

      <section className="py-24 max-w-[1600px] mx-auto px-6 lg:px-12 w-full">
        <div className="flex flex-col items-center mb-14 text-center space-y-3">
          <span className="text-zinc-500 text-[11px] font-semibold tracking-[0.3em] uppercase">Our Collection</span>
          <h2 className="text-4xl md:text-6xl font-display font-bold tracking-tight text-black leading-[0.9] uppercase">
            Top Items
          </h2>
          <p className="text-xs font-medium text-zinc-500 leading-relaxed max-w-md">
            Minimal curated picks selected from our latest arrivals.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-10">
          {topPicks.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      </section>

      <BrandSection />

      <section className="py-24 max-w-[1600px] mx-auto px-6 lg:px-12 w-full">
        <div className="flex flex-col items-center mb-14 text-center space-y-3">
          <span className="text-zinc-500 text-[11px] font-semibold tracking-[0.3em] uppercase">Our Collection</span>
          <h2 className="text-4xl md:text-6xl font-display font-bold tracking-tight text-black leading-[0.9] uppercase">
            Latest Drops
          </h2>
          <p className="text-xs font-medium text-zinc-500 leading-relaxed max-w-md">
            Fresh inventory updates from the Roraan Collection archive.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-10">
          {latestProducts.slice(0, 4).map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      </section>

      <SizeSection title="ARCHIVE BY SIZE" />
    </div>
  );
}
