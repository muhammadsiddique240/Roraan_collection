import { Link } from 'react-router-dom';
import { Product } from '@/types';
import { cn } from '@/lib/utils';

interface ProductCardProps {
  product: Product;
  className?: string;
}

export function ProductCard({ product, className }: ProductCardProps) {
  const isAvailable = product.status === 'AVAILABLE';
  const hasSecondaryImage = product.images.length > 1 && Boolean(product.images[1]);

  return (
    <Link to={`/shop/${product.id}`} className={cn("group block", !isAvailable && "opacity-70", className)}>
      <div className="aspect-[4/5] flex items-center justify-center relative overflow-hidden bg-white border border-black/10 transition-all duration-500">
        {product.images[0] && (
          <img
            src={product.images[0]}
            alt={product.title}
            className={cn(
              "w-full h-full object-contain mix-blend-multiply p-8 transition-all duration-700 group-hover:scale-105",
              hasSecondaryImage && "group-hover:opacity-0"
            )}
          />
        )}
        {hasSecondaryImage && (
          <img
            src={product.images[1]}
            alt={`${product.title} alternate`}
            className="absolute inset-0 w-full h-full object-contain mix-blend-multiply p-8 opacity-0 transition-all duration-700 group-hover:opacity-100 group-hover:scale-105"
          />
        )}

        <div className="absolute top-4 left-4 z-10 flex flex-col gap-2">
          {product.isNew && isAvailable && (
            <span className="border border-black bg-white text-black text-[9px] font-semibold px-2.5 py-1 uppercase tracking-[0.14em]">New Arrival</span>
          )}
          {isAvailable && (
            <span className="border border-black bg-white text-black text-[9px] font-semibold px-2.5 py-1 uppercase tracking-[0.12em]">Only 1 Available</span>
          )}
          {!isAvailable && (
            <span className="border border-black bg-white text-black text-[9px] font-semibold px-2.5 py-1 uppercase tracking-[0.14em]">Sold Out</span>
          )}
        </div>

        <div className="absolute bottom-6 left-6 right-6 opacity-0 translate-y-2 group-hover:translate-y-0 group-hover:opacity-100 transition-all duration-300">
          <button className="w-full py-3 text-[11px] font-semibold uppercase tracking-[0.15em] border border-black bg-black text-white hover:bg-zinc-800 transition-colors">
            View Piece
          </button>
        </div>
      </div>

      {/* Text Container - Refined Typography & Layout */}
      <div className="flex flex-col gap-1 pt-4">
        {/* Brand Name - Subtle & Premium */}
        <p className="text-[10px] text-gray-500 uppercase tracking-widest font-semibold">
          {product.brand}
        </p>
        
        {/* Product Title - Bold & Clean */}
        <h3 className="text-sm font-bold text-gray-900 uppercase truncate">
          {product.title}
        </h3>

        {/* Bottom Row - Tags vs Price */}
        <div className="flex justify-between items-end mt-2">
          {/* Left Side - Tags */}
          <div className="flex gap-2">
            <span className="px-2 py-1 text-[10px] border border-gray-300 text-gray-600 font-medium uppercase tracking-wide">
              Size EU {product.size.eu}
            </span>
            <span className="px-2 py-1 text-[10px] border border-gray-300 text-gray-600 font-medium uppercase tracking-wide">
              {product.condition}
            </span>
          </div>
          
          {/* Right Side - Price */}
          <div className="text-right flex flex-col items-end">
            {product.originalPrice && isAvailable && (
              <p className="text-[10px] text-gray-400 line-through font-medium">
                Rs.{product.originalPrice.toLocaleString()}
              </p>
            )}
            <p className="text-sm font-bold text-gray-900">
              Rs.{product.price.toLocaleString()}
            </p>
          </div>
        </div>
      </div>
    </Link>
  );
}
