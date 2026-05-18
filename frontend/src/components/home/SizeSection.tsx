import { Link } from 'react-router-dom';

const MENS_SIZES = [
  { eu: '38', uk: '5', label: 'EU 38' },
  { eu: '39', uk: '5.5', label: 'EU 39' },
  { eu: '40', uk: '6', label: 'EU 40' },
  { eu: '41', uk: '7', label: 'EU 41' },
  { eu: '42', uk: '8', label: 'EU 42' },
  { eu: '43', uk: '9', label: 'EU 43' },
];

const WOMENS_SIZES = [
  { eu: '36', uk: '3.5', label: 'EU 36' },
  { eu: '37', uk: '4.5', label: 'EU 37' },
  { eu: '38', uk: '5.5', label: 'EU 38' },
  { eu: '39', uk: '6.5', label: 'EU 39' },
  { eu: '40', uk: '7', label: 'EU 40' },
  { eu: '41', uk: '8', label: 'EU 41' },
];

interface SizeSectionProps {
  title?: string;
}

export function SizeSection({ title }: SizeSectionProps) {
  return (
    <section className="py-16 bg-white">
      <div className="max-w-[1400px] mx-auto px-6 lg:px-12">

        {/* Men's Sizes */}
        <div className="mb-16">
          <h3 className="text-center text-xl md:text-2xl font-bold uppercase tracking-tight text-black mb-12">
            Shop By Men's Size
          </h3>
          <div className="flex flex-wrap justify-center gap-8 md:gap-12">
            {MENS_SIZES.map((size, idx) => (
              <Link
                key={idx}
                to={`/shop?size=${size.eu}`}
                className="group flex flex-col items-center gap-3"
              >
                <div className="relative flex h-24 w-24 rounded-full border-4 border-black flex items-center justify-center bg-white text-lg font-bold text-black transition-all duration-300 group-hover:bg-[#CBD504] group-hover:scale-110">
                  <span>{size.eu}/{size.uk}</span>
                </div>
                <span className="text-xs font-semibold uppercase tracking-wider text-zinc-600 text-center">
                  {size.label}
                </span>
              </Link>
            ))}
          </div>
        </div>

        {/* Women's Sizes */}
        <div>
          <h3 className="text-center text-xl md:text-2xl font-bold uppercase tracking-tight text-black mb-12">
            Shop By Women's Size
          </h3>
          <div className="flex flex-wrap justify-center gap-8 md:gap-12">
            {WOMENS_SIZES.map((size, idx) => (
              <Link
                key={idx}
                to={`/shop?size=${size.eu}`}
                className="group flex flex-col items-center gap-3"
              >
                <div className="relative flex h-24 w-24 rounded-full border-4 border-black flex items-center justify-center bg-white text-lg font-bold text-black transition-all duration-300 group-hover:bg-[#420C43] group-hover:text-white group-hover:scale-110">
                  <span>{size.eu}/{size.uk}</span>
                </div>
                <span className="text-xs font-semibold uppercase tracking-wider text-zinc-600 text-center">
                  {size.label}
                </span>
              </Link>
            ))}
          </div>
        </div>

      </div>
    </section>
  );
}





