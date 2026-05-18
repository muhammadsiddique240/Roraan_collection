import { Link } from 'react-router-dom';

const BRANDS = [
  { logo: '/images/brands/Nike.webp', label: 'Nike Shoes', link: '/shop?brand=nike' },
  { logo: '/images/brands/Hooka.webp', label: 'Hoka Shoes', link: '/shop?brand=hoka' },
  { logo: '/images/brands/Adidas.webp', label: 'Adidas Shoes', link: '/shop?brand=adidas' },
  { logo: '/images/brands/Reebok.webp', label: 'Reebok Shoes', link: '/shop?brand=reebok' },
  { logo: '/images/brands/Fila.webp', label: 'FILA Shoes', link: '/shop?brand=fila' },
  { logo: '/images/brands/VANS.webp', label: 'VANS Shoes', link: '/shop?brand=vans' },
];

export function BrandSection() {
  return (
    <section className="py-24 bg-white overflow-hidden">
      <div className="max-w-[1600px] mx-auto px-6 lg:px-12">
        <div className="mb-14 text-center">
          <h2 className="text-4xl md:text-5xl font-display font-bold tracking-tight text-black uppercase leading-none">Shop By Brand</h2>
          <p className="text-zinc-500 mt-3 text-sm">Discover curated brand collections designed for every style profile.</p>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-12 items-center justify-items-center">
          {BRANDS.map((brand, idx) => (
            <Link key={idx} to={brand.link} className="group flex flex-col items-center gap-4 text-center transition-all duration-300 hover:scale-105">
              <div className="relative flex h-32 w-32 items-center justify-center rounded-full border-4 border-black bg-white shadow-lg transition-all duration-300 group-hover:shadow-xl">
                <img 
                  src={brand.logo} 
                  alt={brand.label}
                  className="w-20 h-20 object-contain"
                />
              </div>
              <span className="text-xs font-bold uppercase tracking-wider text-zinc-900">
                {brand.label}
              </span>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}
