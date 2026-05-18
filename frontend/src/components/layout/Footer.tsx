import { Link } from 'react-router-dom';
import { siteConfig } from '@/config/siteConfig';
import { Instagram, MessageCircle } from 'lucide-react';

// TikTok Icon SVG
const TikTokIcon = ({ className }: { className?: string }) => (
  <svg
    viewBox="0 0 24 24"
    fill="currentColor"
    className={className}
    xmlns="http://www.w3.org/2000/svg"
  >
    <path d="M12.525.02c1.31-.02 2.61-.01 3.91-.02.08 1.53.63 3.09 1.75 4.17 1.12 1.11 2.7 1.62 4.24 1.79v4.03c-1.44-.17-2.89-.6-4.13-1.42-.01 2.31 0 4.62-.01 6.93 0 2.77-.39 5.86-3.08 7.55-2.79 1.75-6.9 1.34-9.11-1.04C3.89 19.38 3.86 15.01 6.13 12.3c1.65-1.92 4.67-2.52 7.02-1.52.01 1.41.01 2.82.02 4.22-1.59-.44-3.53-.13-4.57 1.25-.86 1.14-.94 2.86-.06 4.02 1.27 1.66 4.16 1.57 5.16-.25.4-1.05.35-2.22.35-3.34-.01-5.63-.01-11.26-.01-16.89z" />
  </svg>
);

export default function Footer() {
  return (
    <footer className="bg-zinc-950 pt-12 pb-8 border-t border-white/5">
      <div className="max-w-[1200px] mx-auto px-6 text-white">
        <div className="flex flex-col md:flex-row justify-between items-start gap-12 border-b border-white/5 pb-10">

          <div className="space-y-6 max-w-xs">
            <div className="flex flex-col">
              <h2 className="text-5xl font-black tracking-[-0.08em] uppercase text-white leading-none">
                {siteConfig.brand.name}
              </h2>
              <div className="flex items-center gap-2 mt-2">
                <div className="h-[1px] w-4 bg-white/20"></div>
                <span className="text-[10px] tracking-[0.4em] text-zinc-500 font-bold uppercase">
                  COLLECTION
                </span>
                <div className="h-[1px] w-4 bg-white/20"></div>
              </div>
            </div>
            <p className="text-zinc-500 text-sm leading-relaxed">
              {siteConfig.footer.about}
            </p>
            <div className="flex gap-4">
              <Link
                to={siteConfig.social.instagram}
                target="_blank"
                className="w-10 h-10 border border-white/10 flex items-center justify-center hover:bg-zinc-800 transition-all"
              >
                <Instagram size={20} />
              </Link>
              <Link
                to={siteConfig.social.tiktok}
                target="_blank"
                className="w-10 h-10 border border-white/10 flex items-center justify-center hover:bg-zinc-800 transition-all"
              >
                <TikTokIcon className="w-5 h-5" />
              </Link>
              <Link
                to={siteConfig.contact.whatsappLink}
                target="_blank"
                className="w-10 h-10 border-2 border-[#25D366] flex items-center justify-center hover:bg-[#25D366] transition-all rounded-full hover:shadow-lg"
                title="Chat on WhatsApp"
              >
                <MessageCircle size={18} className="text-[#25D366] hover:text-white" />
              </Link>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-12 sm:gap-24">
            <div className="space-y-4">
              <h3 className="text-[10px] font-black uppercase tracking-[0.2em] text-zinc-600">Company</h3>
              <ul className="space-y-2 text-xs font-semibold text-zinc-400">
                {siteConfig.footer.links.map((link) => (
                  <li key={link.path}>
                    <Link to={link.path} className="hover:text-white transition-colors">{link.label}</Link>
                  </li>
                ))}
              </ul>
            </div>
            <div className="space-y-4">
              <h3 className="text-[10px] font-black uppercase tracking-[0.2em] text-zinc-600">Explore</h3>
              <ul className="space-y-2 text-xs font-semibold text-zinc-400">
                {siteConfig.navigation.map((item) => (
                  <li key={item.path}>
                    <Link to={item.path} className="hover:text-white transition-colors">{item.label}</Link>
                  </li>
                ))}
              </ul>
            </div>
          </div>

        </div>

        <div className="pt-8 flex flex-col sm:flex-row justify-between items-center gap-4 text-[10px] font-bold uppercase tracking-[0.2em] text-zinc-700">
          <p>© 2026 {siteConfig.brand.fullName}. ALL RIGHTS RESERVED.</p>
          <div className="flex gap-6">
            <span className="text-[9px] opacity-40">PAKISTAN</span>
          </div>
        </div>
      </div>
    </footer>
  );
}

