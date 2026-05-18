import { Outlet, useLocation } from 'react-router-dom';
import Navbar from './Navbar';
import Footer from './Footer';
import WhatsAppButton from './WhatsAppButton';

export default function RootLayout() {
  const location = useLocation();
  const isHome = location.pathname === '/';

  return (
    <div className="flex flex-col min-h-screen relative bg-white overflow-x-hidden">
      <div className="relative z-10 flex flex-col min-h-screen">
        <Navbar />
        <main className={`flex-1 ${isHome ? 'pt-0' : 'pt-20'}`}>
          <Outlet />
        </main>
        <Footer />
        <WhatsAppButton />
      </div>
    </div>
  );
}
