import { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useStore } from '@/store/useStore';
import { CheckCircle, Loader2, ArrowRight, Upload, CreditCard, MessageCircle, Copy, Image as ImageIcon } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { siteConfig } from '@/config/siteConfig';
import type { CheckoutMethod } from '@/types';

export default function Checkout() {
  const location = useLocation();
  const navigate = useNavigate();
  const { addOrderWebsite, addOrderWhatsapp, cart, clearCart } = useStore();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [orderComplete, setOrderComplete] = useState(false);
  const [createdOrders, setCreatedOrders] = useState<Array<{ orderCode?: string; productTitle: string; productCode?: string }>>([]);
  const [whatsappMsg, setWhatsappMsg] = useState('');
  const [timeLeft, setTimeLeft] = useState(900);
  const [checkoutMethod, setCheckoutMethod] = useState<CheckoutMethod>('website');

  // Website payment fields
  const [paymentScreenshot, setPaymentScreenshot] = useState<File | null>(null);
  const [screenshotPreview, setScreenshotPreview] = useState<string>('');
  const [transactionId, setTransactionId] = useState('');

  useEffect(() => {
    if (timeLeft <= 0) return;
    const timer = setInterval(() => setTimeLeft(t => t - 1), 1000);
    return () => clearInterval(timer);
  }, [timeLeft]);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const directProduct = location.state?.product;
  const checkoutItems = directProduct ? [directProduct] : cart;

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    address: '',
    city: '',
  });

  const subtotal = checkoutItems.reduce((sum, item) => sum + item.price, 0);
  const grandTotal = subtotal + siteConfig.COD_FEE;

  const handleScreenshotChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setPaymentScreenshot(file);
      setScreenshotPreview(URL.createObjectURL(file));
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
  };

  if (checkoutItems.length === 0 && !orderComplete) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center p-4">
        <h2 className="text-2xl font-semibold uppercase mb-4 text-black">Nothing to checkout</h2>
        <button onClick={() => navigate('/shop')} className="btn-secondary">Back to Vault</button>
      </div>
    );
  }

  // --- Website Payment Handler ---
  const handleWebsitePayment = async (e: React.FormEvent) => {
    e.preventDefault();
    const phoneDigits = formData.phone.replace(/\D/g, '');
    if (phoneDigits.length < 10) { alert('Please enter a valid phone number.'); return; }
    if (!paymentScreenshot) { alert('Please upload payment screenshot.'); return; }
    if (!transactionId.trim()) { alert('Please enter transaction ID.'); return; }

    setIsSubmitting(true);
    try {
      const placedOrders: Array<{ orderCode?: string; productTitle: string; productCode?: string }> = [];
      for (const item of checkoutItems) {
        const created = await addOrderWebsite({
          productId: item.id,
          customerName: formData.name,
          customerEmail: formData.email,
          customerContact: formData.phone,
          customerAddress: formData.address,
          city: formData.city,
          transactionId: transactionId,
          paymentScreenshot: paymentScreenshot,
        });
        placedOrders.push({
          orderCode: created.orderCode,
          productTitle: item.title || 'Product',
          productCode: item.productCode,
        });
      }
      setCreatedOrders(placedOrders);
      setOrderComplete(true);
      if (!directProduct) clearCart();
    } catch {
      alert('Order failed. Refresh and try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  // --- WhatsApp Payment Handler ---
  const handleWhatsappOrder = async (e: React.FormEvent) => {
    e.preventDefault();
    const phoneDigits = formData.phone.replace(/\D/g, '');
    if (phoneDigits.length < 10) { alert('Please enter a valid phone number.'); return; }

    setIsSubmitting(true);
    try {
      const placedOrders: Array<{ orderCode?: string; productTitle: string; productCode?: string }> = [];
      for (const item of checkoutItems) {
        const created = await addOrderWhatsapp({
          productId: item.id,
          customerName: formData.name,
          customerEmail: formData.email,
          customerContact: formData.phone,
          customerAddress: formData.address,
          city: formData.city,
        });
        placedOrders.push({
          orderCode: created.orderCode,
          productTitle: item.title || 'Product',
          productCode: item.productCode,
        });
      }
      setCreatedOrders(placedOrders);
      setOrderComplete(true);
      if (!directProduct) clearCart();

      const orderIds = placedOrders.map(o => o.orderCode || 'Pending').join(', ');
      const itemsList = checkoutItems
        .map(
          (item, idx) =>
            `${idx + 1}. ${item.title || 'Unknown Product'}%0A   SKU: ${item.productCode || item.id || 'N/A'}%0A   Size: EU ${item?.size?.eu ?? 'N/A'}%0A   Price: Rs.${(item.price ?? 0).toLocaleString()}`
        )
        .join('%0A%0A');
      const whatsappText =
        `Assalam-o-Alaikum Roraan Collection,%0A%0AI want to place this order:%0A%0A${itemsList}` +
        `%0A%0ASubtotal: Rs.${subtotal.toLocaleString()}` +
        `%0ACOD/Delivery Fee: Rs.${siteConfig.COD_FEE.toLocaleString()}` +
        `%0AGrand Total: Rs.${grandTotal.toLocaleString()}` +
        `%0A%0AOrder ID: ${orderIds}` +
        `%0A%0ACustomer Details:%0A- Name: ${formData.name}%0A- Contact: ${formData.phone}` +
        `%0A- Address: ${formData.address}, ${formData.city}` +
        `%0A%0APlease confirm my order. I am sending PKR 400 as a delivery advance. Remaining RS. ${subtotal.toLocaleString()} will be paid as Cash on Delivery.`;

      setWhatsappMsg(whatsappText);
      setTimeout(() => {
        window.open(`${siteConfig.contact.whatsappLink}?text=${whatsappText}`, '_blank');
      }, 1000);
    } catch {
      alert('Order failed. Some items might have been sold. Please refresh.');
    } finally {
      setIsSubmitting(false);
    }
  };

  // --- Success Screen ---
  if (orderComplete) {
    return (
      <div className="max-w-[1400px] mx-auto px-6 lg:px-12 py-24 min-h-screen bg-white">
        <div className="max-w-xl mx-auto text-center">
          <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="mb-12 flex justify-center">
            <div className="w-20 h-20 bg-black flex items-center justify-center text-white rounded-none shadow-brutalist">
              <CheckCircle size={32} strokeWidth={1.5} />
            </div>
          </motion.div>

          <h2 className="text-4xl md:text-5xl font-display font-bold uppercase tracking-tight mb-6 text-black leading-none">
            {checkoutMethod === 'website' ? 'PAYMENT SUBMITTED' : 'ORDER INITIATED'}
          </h2>
          <p className="text-[10px] text-zinc-500 font-bold mb-12 uppercase tracking-[0.2em] animate-pulse italic">
            {checkoutMethod === 'website'
              ? 'We are verifying your payment. You will be notified once confirmed.'
              : 'Redirecting to WhatsApp for final confirmation...'}
          </p>

          <div className="text-left border border-black p-10 mb-12 bg-white shadow-2xl relative overflow-hidden">
            <div className="absolute top-0 left-0 w-full h-1 bg-black"></div>
            <div className="flex justify-between items-start mb-10">
              <div>
                <p className="text-[10px] font-black uppercase tracking-[0.4em] text-zinc-400 mb-2">ORDER RECEIPT</p>
                <p className="text-lg font-black tracking-tighter uppercase italic">{formData.name}</p>
              </div>
              <div className="text-right">
                <p className="text-[10px] font-black uppercase tracking-[0.4em] text-zinc-400 mb-2">DATE</p>
                <p className="text-sm font-bold">{new Date().toLocaleDateString()}</p>
              </div>
            </div>

            <div className="space-y-6 mb-10">
              {createdOrders.map((order, idx) => (
                <div key={`${order.orderCode}-${idx}`} className="flex justify-between items-end border-b border-zinc-100 pb-4">
                  <div>
                    <p className="font-bold uppercase text-xs tracking-widest text-black">{order.productTitle}</p>
                    <p className="text-[9px] text-zinc-400 font-bold uppercase tracking-widest mt-1">CODE: {order.orderCode}</p>
                  </div>
                  <p className="text-sm font-black italic">PKR {checkoutItems[idx]?.price.toLocaleString()}</p>
                </div>
              ))}
            </div>

            <div className="space-y-4 pt-6">
              <div className="flex justify-between items-center text-zinc-400 font-bold text-[10px] uppercase tracking-widest">
                <span>Platform Delivery Charge</span>
                <span>Rs. 400</span>
              </div>
              <div className="flex justify-between items-center pt-4 border-t border-black">
                <span className="text-sm font-black uppercase tracking-tighter italic text-black">Total Payable</span>
                <span className="text-2xl font-black text-black">Rs. {grandTotal.toLocaleString()}</span>
              </div>
              {checkoutMethod === 'website' && (
                <div className="bg-emerald-900 text-white p-4 mt-6">
                  <p className="text-[9px] font-black uppercase tracking-[0.3em] leading-relaxed">
                    ✅ Payment screenshot & TID received. Our team will verify within 30 minutes.
                  </p>
                </div>
              )}
              {checkoutMethod === 'whatsapp' && (
                <div className="bg-zinc-900 text-white p-4 mt-6">
                  <p className="text-[9px] font-black uppercase tracking-[0.3em] leading-relaxed">
                    Send Rs. 400 Advance to JazzCash/EasyPaisa. Remaining Rs. {subtotal.toLocaleString()} will be Cash on Delivery.
                  </p>
                </div>
              )}
            </div>
          </div>

          <div className="flex flex-col gap-4">
            {checkoutMethod === 'whatsapp' && (
              <button
                onClick={() => window.open(`${siteConfig.contact.whatsappLink}?text=${whatsappMsg}`, '_blank')}
                className="w-full h-16 bg-[#25D366] text-white text-xs font-bold uppercase tracking-[0.3em] hover:bg-[#20bd5a] transition-all shadow-brutalist flex items-center justify-center gap-3"
              >
                <MessageCircle size={18} /> Open WhatsApp
              </button>
            )}
            <button
              onClick={() => navigate('/shop')}
              className="w-full h-16 border border-black bg-white text-black text-xs font-bold uppercase tracking-[0.3em] hover:bg-zinc-50 transition-all"
            >
              Return to Vault
            </button>
          </div>
        </div>
      </div>
    );
  }

  // --- Main Checkout UI ---
  return (
    <div className="max-w-[1400px] mx-auto px-6 lg:px-12 py-20 bg-white min-h-screen">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-16">
        {/* Left: Checkout Form */}
        <div className="order-2 lg:order-1">
          <div className="flex items-center justify-between mb-8">
            <h1 className="text-3xl md:text-4xl font-display font-bold uppercase tracking-tighter text-black leading-none italic">SECURE ORDER</h1>
            <div className="bg-black text-white px-3 py-1.5 flex flex-col items-end">
              <p className="text-[8px] font-bold opacity-50 uppercase tracking-widest">Reserved for</p>
              <p className="text-sm font-black font-mono tracking-tighter">{formatTime(timeLeft)}</p>
            </div>
          </div>

          {/* --- Dual Payment Toggle --- */}
          <div className="grid grid-cols-2 gap-3 mb-8">
            <button
              type="button"
              onClick={() => setCheckoutMethod('website')}
              className={`relative flex flex-col items-center justify-center gap-2 py-5 px-4 border-2 transition-all duration-300 ${checkoutMethod === 'website'
                  ? 'border-black bg-black text-white shadow-lg'
                  : 'border-zinc-200 bg-white text-zinc-500 hover:border-zinc-400'
                }`}
            >
              <CreditCard size={22} strokeWidth={1.5} />
              <span className="text-[10px] font-bold uppercase tracking-[0.2em]">Pay on Website</span>
              {checkoutMethod === 'website' && (
                <motion.div layoutId="checkoutIndicator" className="absolute -bottom-[2px] left-1/2 -translate-x-1/2 w-8 h-[3px] bg-black" />
              )}
            </button>
            <button
              type="button"
              onClick={() => setCheckoutMethod('whatsapp')}
              className={`relative flex flex-col items-center justify-center gap-2 py-5 px-4 border-2 transition-all duration-300 ${checkoutMethod === 'whatsapp'
                  ? 'border-[#25D366] bg-[#25D366] text-white shadow-lg'
                  : 'border-zinc-200 bg-white text-zinc-500 hover:border-zinc-400'
                }`}
            >
              <MessageCircle size={22} strokeWidth={1.5} />
              <span className="text-[10px] font-bold uppercase tracking-[0.2em]">Order via WhatsApp</span>
              {checkoutMethod === 'whatsapp' && (
                <motion.div layoutId="checkoutIndicator" className="absolute -bottom-[2px] left-1/2 -translate-x-1/2 w-8 h-[3px] bg-[#25D366]" />
              )}
            </button>
          </div>

          <form onSubmit={checkoutMethod === 'website' ? handleWebsitePayment : handleWhatsappOrder} className="space-y-6">
            {/* Common Fields */}
            <div className="space-y-3">
              <label className="text-[10px] font-semibold uppercase tracking-[0.2em] text-zinc-500">FULL NAME</label>
              <input
                required
                className="w-full bg-white border border-black/20 px-5 py-4 text-sm font-medium focus:border-black outline-none transition-all tracking-wide"
                value={formData.name}
                onChange={e => setFormData(f => ({ ...f, name: e.target.value }))}
                placeholder="Muhammad Siddique"
              />
            </div>

            <div className="space-y-3">
              <label className="text-[10px] font-semibold uppercase tracking-[0.2em] text-zinc-500">WHATSAPP NUMBER</label>
              <input
                required
                type="tel"
                className="w-full bg-white border border-black/20 px-5 py-4 text-sm font-medium focus:border-black outline-none transition-all tracking-wide"
                value={formData.phone}
                onChange={e => setFormData(f => ({ ...f, phone: e.target.value }))}
                placeholder="+92 300 0000000"
              />
            </div>

            <div className="space-y-3">
              <label className="text-[10px] font-semibold uppercase tracking-[0.2em] text-zinc-500">EMAIL ADDRESS (OPTIONAL)</label>
              <input
                type="email"
                className="w-full bg-white border border-black/20 px-5 py-4 text-sm font-medium focus:border-black outline-none transition-all tracking-wide"
                value={formData.email}
                onChange={e => setFormData(f => ({ ...f, email: e.target.value }))}
                placeholder="siddique@example.com"
              />
            </div>

            <div className="space-y-3">
              <label className="text-[10px] font-semibold uppercase tracking-[0.2em] text-zinc-500">SHIPPING ADDRESS</label>
              <textarea
                required
                rows={3}
                className="w-full bg-white border border-black/20 px-5 py-4 text-sm font-medium focus:border-black outline-none transition-all resize-none tracking-wide leading-relaxed"
                value={formData.address}
                onChange={e => setFormData(f => ({ ...f, address: e.target.value }))}
                placeholder="House # Street, Sector..."
              />
            </div>

            <div className="space-y-3">
              <label className="text-[10px] font-semibold uppercase tracking-[0.2em] text-zinc-500">CITY</label>
              <input
                required
                className="w-full bg-white border border-black/20 px-5 py-4 text-sm font-medium focus:border-black outline-none transition-all tracking-wide"
                value={formData.city}
                onChange={e => setFormData(f => ({ ...f, city: e.target.value }))}
                placeholder="Islamabad"
              />
            </div>

            {/* --- Website Payment Section --- */}
            <AnimatePresence mode="wait">
              {checkoutMethod === 'website' && (
                <motion.div
                  key="website-payment"
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  transition={{ duration: 0.3 }}
                  className="overflow-hidden"
                >
                  {/* Bank Details Info Box */}
                  <div className="border border-zinc-200 bg-zinc-50 p-6 mb-6">
                    <p className="text-[10px] font-bold uppercase tracking-[0.3em] text-zinc-400 mb-4">PAYMENT DETAILS</p>

                    <div className="space-y-4">
                      {/* Meezan Bank */}
                      <div className="flex items-start justify-between p-4 bg-white border border-zinc-100 rounded">
                        <div>
                          <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-emerald-700 mb-1">🏦 MEEZAN BANK</p>
                          <p className="text-sm font-semibold text-black">Roraan Archive</p>
                          <div className="flex items-center gap-2 mt-1">
                            <p className="text-sm font-mono text-zinc-600">0123456789</p>
                            <button type="button" onClick={() => copyToClipboard('0123456789')} className="text-zinc-400 hover:text-black transition-colors">
                              <Copy size={12} />
                            </button>
                          </div>
                        </div>
                      </div>

                      {/* EasyPaisa */}
                      <div className="flex items-start justify-between p-4 bg-white border border-zinc-100 rounded">
                        <div>
                          <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-green-700 mb-1">📱 EASYPAISA</p>
                          <p className="text-sm font-semibold text-black">Siddique</p>
                          <div className="flex items-center gap-2 mt-1">
                            <p className="text-sm font-mono text-zinc-600">0300-0000000</p>
                            <button type="button" onClick={() => copyToClipboard('03000000000')} className="text-zinc-400 hover:text-black transition-colors">
                              <Copy size={12} />
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Screenshot Upload */}
                  <div className="space-y-3 mb-6">
                    <label className="text-[10px] font-semibold uppercase tracking-[0.2em] text-zinc-500">PAYMENT SCREENSHOT *</label>
                    <div className="relative">
                      {screenshotPreview ? (
                        <div className="relative border border-black/20 p-2">
                          <img src={screenshotPreview} alt="Payment proof" className="w-full h-48 object-contain bg-zinc-50" />
                          <button
                            type="button"
                            onClick={() => { setPaymentScreenshot(null); setScreenshotPreview(''); }}
                            className="absolute top-3 right-3 bg-red-500 text-white w-6 h-6 rounded-full flex items-center justify-center text-xs hover:bg-red-600"
                          >
                            ×
                          </button>
                        </div>
                      ) : (
                        <label className="flex flex-col items-center justify-center w-full h-40 border-2 border-dashed border-zinc-300 bg-zinc-50 cursor-pointer hover:border-black hover:bg-zinc-100 transition-all">
                          <Upload size={24} className="text-zinc-400 mb-2" />
                          <span className="text-xs font-semibold text-zinc-500 uppercase tracking-wider">Upload Screenshot</span>
                          <span className="text-[9px] text-zinc-400 mt-1">PNG, JPG up to 5MB</span>
                          <input
                            type="file"
                            accept="image/*"
                            onChange={handleScreenshotChange}
                            className="hidden"
                          />
                        </label>
                      )}
                    </div>
                  </div>

                  {/* Transaction ID */}
                  <div className="space-y-3">
                    <label className="text-[10px] font-semibold uppercase tracking-[0.2em] text-zinc-500">TRANSACTION ID (TID) *</label>
                    <input
                      className="w-full bg-white border border-black/20 px-5 py-4 text-sm font-medium focus:border-black outline-none transition-all tracking-wide font-mono"
                      value={transactionId}
                      onChange={e => setTransactionId(e.target.value)}
                      placeholder="e.g. TRX1234567890"
                    />
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Submit Button */}
            {checkoutMethod === 'website' ? (
              <button
                disabled={isSubmitting}
                className="w-full h-14 text-sm border border-black bg-black text-white hover:bg-zinc-800 flex items-center justify-center gap-3 transition-all uppercase tracking-wide font-semibold"
              >
                {isSubmitting ? (
                  <>Processing... <Loader2 className="animate-spin" size={20} /></>
                ) : (
                  <>SUBMIT ORDER & PAYMENT <ArrowRight size={20} /></>
                )}
              </button>
            ) : (
              <button
                disabled={isSubmitting}
                className="w-full h-14 text-sm bg-[#25D366] text-white hover:bg-[#20bd5a] flex items-center justify-center gap-3 transition-all uppercase tracking-wide font-semibold shadow-lg"
              >
                {isSubmitting ? (
                  <>Processing... <Loader2 className="animate-spin" size={20} /></>
                ) : (
                  <><MessageCircle size={20} /> SEND DETAILS TO WHATSAPP</>
                )}
              </button>
            )}
          </form>
        </div>

        {/* Right: Order Summary */}
        <div className="order-1 lg:order-2">
          <div className="bg-white border border-black/15 p-8 md:p-10 sticky top-20">
            <h2 className="text-2xl font-display font-bold uppercase tracking-tight mb-8 text-black flex justify-between items-center">
              ORDER SUMMARY
              <span className="text-[10px] font-semibold text-zinc-500 uppercase tracking-wider">{checkoutItems.length}PCS</span>
            </h2>

            <div className="space-y-6 mb-8">
              {checkoutItems.map((item) => (
                <div key={item.id} className="flex gap-5 items-start">
                  <div className="w-24 h-24 bg-white border border-black/10 flex items-center justify-center p-3 flex-shrink-0">
                    <img src={item.images[0]} alt={item.title} className="w-full h-auto object-contain" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="font-semibold text-sm uppercase tracking-tight text-black mb-1">{item.title}</h3>
                    <p className="text-[10px] text-zinc-500 uppercase tracking-[0.15em] font-medium mb-2">SIZE {item.size.eu} - {item.condition}</p>
                    <p className="font-semibold text-black text-lg">Rs.{item.price.toLocaleString()}</p>
                  </div>
                </div>
              ))}
            </div>

            <div className="space-y-4 border-t border-black/10 pt-6 mb-6">
              <div className="flex justify-between text-[10px] font-semibold uppercase tracking-widest text-zinc-500">
                <span>Subtotal (Item Price)</span>
                <span className="text-black">Rs.{subtotal.toLocaleString()}</span>
              </div>
              <div className="flex justify-between text-[10px] font-semibold uppercase tracking-widest text-zinc-500">
                <span>COD/Delivery Fee</span>
                <span className="text-black">Rs.{siteConfig.COD_FEE.toLocaleString()}</span>
              </div>
              <div className="flex justify-between items-end pt-4 border-t border-black/10 mt-4">
                <div>
                  <p className="text-[10px] font-bold uppercase tracking-widest text-zinc-500 mb-1">Grand Total</p>
                  <p className="text-3xl font-display font-bold text-black">Rs.{grandTotal.toLocaleString()}</p>
                </div>
              </div>
            </div>

            <div className="flex items-center gap-3 text-[10px] font-semibold uppercase tracking-widest text-zinc-600">
              <div className="w-8 h-8 bg-black rounded-full flex items-center justify-center">
                <CheckCircle size={16} className="text-white" />
              </div>
              <span>Next-Day Delivery in Islamabad</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
