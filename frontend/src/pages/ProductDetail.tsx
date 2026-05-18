import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useStore } from '@/store/useStore';
import api from '@/services/api';
import { motion } from 'motion/react';
import { ArrowLeft, Truck, CheckCircle2, Bell, MessageCircle } from 'lucide-react';
import { cn } from '@/lib/utils';
import { siteConfig } from '@/config/siteConfig';

export default function ProductDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const product = useStore(state => state.products.find(p => p.id === id));
  const addToCart = useStore(state => state.addToCart);

  const [isAdded, setIsAdded] = useState(false);
  const [activeImage, setActiveImage] = useState(0);
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });
  const [isZooming, setIsZooming] = useState(false);

  // Reset active image and increment view count when product changes
  useEffect(() => {
    setActiveImage(0);
    if (id) {
      // Increment view count on backend
      api.post(`/products/${id}/increment_views/`).catch(() => {
        // Silently ignore errors - view count is non-critical
      });
    }
  }, [id]);

  if (!product) {
    return (
      <div className="h-[70vh] flex flex-col items-center justify-center text-center px-4">
        <h2 className="text-3xl md:text-4xl font-black text-main-text tracking-tighter uppercase mb-4 italic">Piece Not Found</h2>
        <button onClick={() => navigate('/shop')} className="btn-secondary">Return to Vault</button>
      </div>
    );
  }

  const isAvailable = product.status === 'AVAILABLE';

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const { left, top, width, height } = e.currentTarget.getBoundingClientRect();
    const x = ((e.pageX - left) / width) * 100;
    const y = ((e.pageY - top) / height) * 100;
    setMousePos({ x, y });
  };

  const handleAddToBag = () => {
    addToCart(product);
    setIsAdded(true);
    setTimeout(() => setIsAdded(false), 2000);
  };

  return (
    <div className="max-w-[1400px] mx-auto px-4 lg:px-8 py-16 bg-white min-h-screen">
      <button
        onClick={() => navigate(-1)}
        className="flex items-center gap-2 text-[10px] uppercase tracking-[0.3em] text-zinc-500 hover:text-black transition-colors mb-12 font-semibold group"
      >
        <ArrowLeft size={16} className="group-hover:-translate-x-1 transition-transform" /> Back to Archive
      </button>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 lg:gap-10">
        {/* Images - Much Smaller */}
        <div className="space-y-2 max-w-[400px]">
          {/* Main Image - Delayed Zoom after 1 second */}
          <div
            className="relative aspect-square bg-white border border-black/10 flex items-center justify-center overflow-hidden cursor-zoom-in group max-h-[350px]"
            onMouseMove={handleMouseMove}
          >
            <div
              className="absolute inset-0 bg-no-repeat opacity-0 group-hover:opacity-100 transition-opacity duration-200 z-10 bg-white"
              style={{
                backgroundImage: `url(${product.images[activeImage]})`,
                backgroundSize: '300%',
                backgroundPosition: `${mousePos.x}% ${mousePos.y}%`,
              }}
            />
            <img
              src={product.images[activeImage]}
              alt={`${product.title} main view`}
              className="w-full h-full object-contain mix-blend-multiply"
            />
          </div>

          {/* Thumbnails - Smaller */}
          <div className="grid grid-cols-4 gap-1.5 max-w-[350px]">
            {product.images.map((img, idx) => (
              <div
                key={idx}
                className={cn(
                  "aspect-square bg-white border flex items-center justify-center overflow-hidden cursor-pointer transition-all",
                  activeImage === idx ? "border-black shadow-sm" : "border-black/10 hover:border-black/20"
                )}
                onClick={() => setActiveImage(idx)}
              >
                <img
                  src={img}
                  alt={`${product.title} view ${idx + 1}`}
                  className="w-full h-full object-contain mix-blend-multiply"
                />
              </div>
            ))}
          </div>
        </div>

        {/* Details - Much Smaller */}
        <div className="flex flex-col justify-start">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
          >
            <div className="flex items-center gap-2 mb-3">
              <span className="border border-black text-black px-2 py-0.5 text-[9px] font-semibold uppercase tracking-[0.15em]">
                {product.brand}
              </span>
              {product.isUnisex && (
                <span className="bg-zinc-800 text-white px-2 py-0.5 text-[9px] font-semibold uppercase tracking-[0.15em]">
                  Unisex
                </span>
              )}
              <span className="text-zinc-500 text-[9px] font-semibold uppercase tracking-[0.2em]">
                {product.condition}/10
              </span>
            </div>

            <h1 className="text-xl md:text-2xl font-display font-bold text-black tracking-tight uppercase leading-tight mb-4">
              {product.title}
            </h1>

            <div className="mb-4">
              <p className="text-[9px] font-semibold uppercase tracking-[0.2em] text-zinc-500 mb-2">Price</p>
              <div className="flex items-center gap-2 flex-wrap">
                {product.originalPrice && isAvailable && (
                  <span className="text-xs text-zinc-500 line-through font-medium">Rs.{product.originalPrice.toLocaleString()}</span>
                )}
                <span className="text-base font-semibold text-black">Rs.{product.price.toLocaleString()}</span>
                {product.originalPrice && isAvailable && (
                  <span className="text-xs text-red-500 font-semibold">-{((1 - product.price / product.originalPrice) * 100).toFixed(0)}%</span>
                )}
                <span className="text-[10px] font-medium text-zinc-500 ml-1 italic">(+ Rs. {siteConfig.COD_FEE} Delivery/COD Charges)</span>
              </div>
            </div>

            {isAvailable ? (
              <div className="flex flex-col gap-2 mb-4">
                <button
                  onClick={handleAddToBag}
                  className={cn(
                    "w-full h-10 text-xs uppercase font-semibold tracking-[0.1em] transition-all",
                    isAdded ? "bg-black text-white" : "bg-black text-white hover:bg-zinc-800"
                  )}
                >
                  {isAdded ? "Added" : "Add to Cart"}
                </button>
                <button
                  className="w-full h-10 text-xs bg-[#25D366] text-white transition-all font-semibold uppercase tracking-[0.1em] flex items-center justify-center gap-1"
                  onClick={() => navigate('/checkout', { state: { product } })}
                >
                  <MessageCircle size={14} /> Buy Now
                </button>
              </div>
            ) : (
              <button className="w-full h-10 text-xs mb-4 opacity-40 cursor-not-allowed bg-zinc-100 text-zinc-500 font-semibold uppercase tracking-wider" disabled>
                SOLD OUT
              </button>
            )}

            <div className="bg-white border border-black/10 p-3 mb-4">
              <p className="text-[9px] font-semibold uppercase tracking-[0.15em] text-zinc-500 mb-2">Delivery Method</p>
              <div className="space-y-1 mb-2 text-xs">
                <p className="text-black font-semibold uppercase tracking-wider">Cash on Delivery (COD)</p>
                <p className="text-zinc-500 text-[10px]">Standard Logistics Partner</p>
                <p className="text-black mt-2 font-medium">Charge: Rs. {siteConfig.COD_FEE}</p>
              </div>
              <p className="text-[8px] text-zinc-500 uppercase tracking-[0.1em] font-medium leading-relaxed">
                Send PKR 400 advance to confirm order. The item price will be collected at the time of delivery.
              </p>
            </div>

            <div className="space-y-3 pt-4 border-t border-black/10">
              <div className="flex items-center gap-2">
                <CheckCircle2 className="text-black" size={14} strokeWidth={2} />
                <span className="text-[9px] font-semibold uppercase tracking-wide text-zinc-500">100% Authentic</span>
              </div>
              <div className="flex items-center gap-2">
                <Truck className="text-black" size={14} strokeWidth={2} />
                <span className="text-[9px] font-semibold uppercase tracking-wide text-zinc-500">Fast Delivery</span>
              </div>
            </div>

          </motion.div>
        </div>
      </div>

    </div>
  );
}
