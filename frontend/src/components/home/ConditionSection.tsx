import { Link } from 'react-router-dom';

const CATEGORY_CARDS = [
  { title: "Men's Shop", image: '/images/premium.avif', link: '/shop?category=men' },
  { title: "Women's Shop", image: '/images/excellent.avif', link: '/shop?category=women' },
  { title: "Kid's Shop", image: '/images/good.avif', link: '/shop?category=kids' },
];

export function ConditionSection() {
  return (
    <section className="py-24 bg-white overflow-hidden">
      <div className="max-w-[1600px] mx-auto px-6 lg:px-12">
        <div className="mb-14 text-center">
          <h2 className="text-4xl md:text-5xl font-display font-bold tracking-tight text-black uppercase leading-none">Shop By Category</h2>
          <p className="text-zinc-500 mt-3 text-sm">Discover curated sections designed for every style profile.</p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {CATEGORY_CARDS.map((category, idx) => (
            <Link key={idx} to={category.link} className="group">
              <div className="relative aspect-[4/5] border border-black/10 overflow-hidden bg-zinc-100">
                <img
                  src={category.image}
                  alt={category.title}
                  className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/55 via-black/15 to-transparent" />
                <div className="absolute bottom-0 left-0 right-0 p-6">
                  <h3 className="text-2xl font-semibold text-white tracking-wide uppercase">{category.title}</h3>
                  <p className="text-[11px] text-white/85 mt-1 uppercase tracking-wider">See more</p>
                </div>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}
