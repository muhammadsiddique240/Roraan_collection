import { motion } from 'motion/react';
import { siteConfig } from '@/config/siteConfig';
import { MessageCircle } from 'lucide-react';

export default function WhatsAppButton() {
  return (
    <motion.a
      href={siteConfig.contact.whatsappLink}
      target="_blank"
      rel="noopener noreferrer"
      className="fixed bottom-8 right-8 z-50 flex items-center gap-2 px-5 py-3 bg-[#25D366] text-white rounded-full shadow-[0_8px_24px_rgba(37,211,102,0.35)] hover:shadow-[0_12px_32px_rgba(37,211,102,0.45)] hover:bg-[#20AC55] transition-all duration-300 group"
      initial={{ opacity: 0, y: 20, scale: 0.8 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      whileHover={{ scale: 1.08 }}
      whileTap={{ scale: 0.92 }}
      title="Chat on WhatsApp"
    >
      <MessageCircle size={20} className="flex-shrink-0" />
      <span className="text-sm font-bold whitespace-nowrap tracking-tight">WhatsApp</span>
      <span className="absolute -top-2 -right-2 w-5 h-5 bg-red-500 rounded-full border-2 border-white text-white text-xs flex items-center justify-center font-bold animate-pulse">1</span>
    </motion.a>
  );
}

