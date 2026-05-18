import { motion, AnimatePresence } from 'motion/react';
import { X, ShoppingBag, Trash2, ArrowRight } from 'lucide-react';
import { useStore } from '@/store/useStore';
import { useNavigate } from 'react-router-dom';
import { siteConfig } from '@/config/siteConfig';

export default function CartDrawer({ isOpen, onClose }: { isOpen: boolean; onClose: () => void }) {
    const { cart, removeFromCart } = useStore();
    const navigate = useNavigate();

    const total = cart.reduce((sum, item) => sum + item.price, 0);

    return (
        <AnimatePresence>
            {isOpen && (
                <>
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={onClose}
                        className="fixed inset-0 bg-black/40 backdrop-blur-sm z-[100]"
                    />
                    <motion.div
                        initial={{ x: '100%' }}
                        animate={{ x: 0 }}
                        exit={{ x: '100%' }}
                        transition={{ type: 'spring', damping: 25, stiffness: 200 }}
                        className="fixed top-0 right-0 h-full w-full max-w-md bg-main-bg z-[101] shadow-2xl flex flex-col border-l border-main-border"
                    >
                        <div className="p-6 border-b-2 border-main-border flex items-center justify-between bg-main-bg">
                            <div className="flex items-center gap-3">
                                <ShoppingBag size={20} className="text-main-text" />
                                <h2 className="text-xl font-display font-black uppercase tracking-tight text-main-text">Bag</h2>
                                <span className="badge-premium">
                                    {cart.length} PC
                                </span>
                            </div>
                            <button onClick={onClose} className="p-2 hover:bg-offset-bg border border-transparent hover:border-main-border transition-all shadow-brutalist-none hover:shadow-brutalist">
                                <X size={24} className="text-main-text" />
                            </button>
                        </div>

                        <div className="flex-1 overflow-y-auto p-6 space-y-6 no-scrollbar bg-main-bg">
                            {cart.length === 0 ? (
                                <div className="h-full flex flex-col items-center justify-center text-center pb-20">
                                    <div className="w-20 h-20 bg-offset-bg border-2 border-main-border flex items-center justify-center mb-6 shadow-brutalist">
                                        <ShoppingBag size={32} className="text-muted-text/30" />
                                    </div>
                                    <h3 className="text-xl font-display font-black uppercase tracking-tight mb-2 text-main-text">Bag is empty</h3>
                                    <p className="text-muted-text text-xs font-medium mb-8 uppercase tracking-widest italic">Archive your first selection.</p>
                                    <button onClick={() => { onClose(); navigate('/shop'); }} className="btn-secondary px-10">Browse Vault</button>
                                </div>
                            ) : (
                                cart.map((item) => (
                                    <div key={item.id} className="flex gap-4 group border-b border-subtle-border pb-6 last:border-0">
                                        <div className="w-24 h-24 bg-offset-bg border border-subtle-border flex items-center justify-center p-2 grow-0 shrink-0 grayscale group-hover:grayscale-0 transition-all">
                                            <img src={item.images[0]} alt={item.title} className="w-full h-auto object-contain" />
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <div className="flex justify-between items-start mb-1">
                                                <h4 className="font-black text-[11px] uppercase tracking-tight text-main-text line-clamp-1">{item.title}</h4>
                                                <button
                                                    onClick={() => removeFromCart(item.id)}
                                                    className="text-muted-text hover:text-red-500 transition-colors p-1"
                                                >
                                                    <Trash2 size={14} />
                                                </button>
                                            </div>
                                            <p className="text-[10px] font-black text-muted-text uppercase tracking-widest mb-2 italic border-l border-primary pl-2 leading-none">Size {item.size.eu} • {item.condition}</p>
                                            <div className="flex justify-between items-end">
                                                <p className="font-black text-sm text-main-text">Rs.{item.price.toLocaleString()}</p>
                                            </div>
                                        </div>
                                    </div>
                                ))
                            )}
                        </div>

                        {cart.length > 0 && (
                            <div className="p-6 border-t-2 border-main-border bg-offset-bg">
                                <div className="space-y-3 mb-6">
                                    <div className="flex justify-between text-[10px] font-black uppercase tracking-widest text-muted-text">
                                        <span>Subtotal</span>
                                        <span className="text-main-text">Rs.{total.toLocaleString()}</span>
                                    </div>
                                    <div className="flex justify-between text-[10px] font-black uppercase tracking-widest text-muted-text">
                                        <span>COD/Delivery Fee</span>
                                        <span className="text-main-text font-black">Rs.{siteConfig.COD_FEE}</span>
                                    </div>
                                    <div className="flex justify-between pt-3 border-t border-subtle-border">
                                        <span className="text-lg font-display font-black uppercase tracking-tight text-main-text">Total Amount</span>
                                        <span className="text-lg font-black tracking-tight text-main-text">Rs.{(total + siteConfig.COD_FEE).toLocaleString()}</span>
                                    </div>
                                </div>

                                <button
                                    onClick={() => {
                                        onClose();
                                        navigate('/checkout', { state: { fromCart: true } });
                                    }}
                                    className="btn-primary w-full h-16"
                                >
                                    Proceed to Archive <ArrowRight size={16} className="ml-2 inline" />
                                </button>
                                <p className="text-[9px] text-center text-muted-text mt-4 font-black uppercase tracking-[0.2em] italic">
                                    Checkout continues on WhatsApp (PKR {siteConfig.COD_FEE} Advance Required)
                                </p>
                            </div>
                        )}
                    </motion.div>
                </>
            )}
        </AnimatePresence>
    );
}
