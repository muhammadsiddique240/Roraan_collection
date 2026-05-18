import { Outlet, NavLink, useNavigate, useLocation, Navigate } from 'react-router-dom';
import { LayoutDashboard, Package, ShoppingCart, LogOut, Search, Bell, Settings, Menu, X } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useStore } from '@/store/useStore';
import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { siteConfig } from '@/config/siteConfig';

export default function AdminLayout() {
  const { isAuthenticated, logout, orders, products, notifications, dismissNotification, user } = useStore();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [notificationsOpen, setNotificationsOpen] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();

  const isLoginPage = location.pathname === '/admin/login';

  useEffect(() => {
    setIsSidebarOpen(false);
  }, [location.pathname]);

  if (!isAuthenticated && !isLoginPage) {
    return <Navigate to="/admin/login" replace />;
  }

  if (isAuthenticated && isLoginPage) {
    return <Navigate to="/admin/dashboard" replace />;
  }

  const handleLogout = () => {
    logout();
    navigate('/admin/login');
  };

  const getProductTitle = (productId: string) => {
    return products.find(p => p.id === productId)?.title || 'Unknown Product';
  };

  const handleNotificationClick = (orderId: string, notifId: string) => {
    setNotificationsOpen(false);
    dismissNotification(notifId);
    navigate(`/admin/orders?highlight=${orderId}`);
  };

  const clearAllNotifications = () => {
    notifications.forEach(n => dismissNotification(n.id));
    setNotificationsOpen(false);
  };

  const SidebarContent = () => (
    <div className="flex flex-col h-full bg-white">
      <div className="px-6 py-10 flex items-center justify-between border-b border-gray-100">
        <div className="flex flex-col">
          <h2 className="text-2xl font-black text-black tracking-tighter uppercase leading-none">
            {siteConfig.brand.name}
          </h2>
          <p className="text-[9px] tracking-[0.3em] text-zinc-400 font-bold uppercase mt-1">
            Archive Control
          </p>
        </div>
        <button onClick={() => setIsSidebarOpen(false)} className="lg:hidden p-2 hover:bg-gray-100 rounded-lg transition-colors">
          <X size={20} className="text-gray-600" />
        </button>
      </div>

      <nav className="flex-1 px-4 py-6 space-y-2">
        <NavItem to="/admin/dashboard" icon={<LayoutDashboard size={18} />} label="Overview" />
        <NavItem to="/admin/inventory" icon={<Package size={18} />} label="Inventory" />
        <NavItem to="/admin/orders" icon={<ShoppingCart size={18} />} label="Orders" />
        <div className="pt-6 mt-6 border-t border-gray-200">
          <NavItem to="/admin/settings" icon={<Settings size={18} />} label="Settings" />
        </div>
      </nav>

      <div className="p-6 border-t border-gray-200 mt-auto bg-gray-50">
        <div className="flex flex-col gap-1 mb-4 px-2">
          <span className="text-xs text-gray-500 font-medium">Authorized Operator</span>
          <span className="text-sm font-semibold text-gray-900">Siddique / Admin</span>
        </div>
        <button
          onClick={handleLogout}
          className="flex items-center justify-center gap-2 w-full px-4 py-3 text-sm text-red-600 bg-white border border-gray-200 hover:bg-red-50 hover:border-red-200 transition-all font-medium rounded-lg"
        >
          <LogOut size={16} />
          Sign Out
        </button>
      </div>
    </div>
  );

  return (
    <div className="flex h-screen bg-gray-50 overflow-hidden text-gray-900 font-sans">
      {/* Desktop Sidebar */}
      {!isLoginPage && (
        <aside className="hidden lg:flex w-72 border-r border-gray-200 bg-white shadow-sm flex-col z-20 shrink-0">
          <SidebarContent />
        </aside>
      )}

      {/* Mobile Sidebar Overlay */}
      <AnimatePresence>
        {isSidebarOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsSidebarOpen(false)}
              className="fixed inset-0 bg-gray-900/40 backdrop-blur-sm z-[100] lg:hidden"
            />
            <motion.aside
              initial={{ x: '-100%' }}
              animate={{ x: 0 }}
              exit={{ x: '-100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 200 }}
              className="fixed top-0 left-0 bottom-0 w-[300px] bg-white z-[101] lg:hidden shadow-2xl border-r border-gray-200"
            >
              <SidebarContent />
            </motion.aside>
          </>
        )}
      </AnimatePresence>

      {/* Main Content Area */}
      <main className="flex-1 overflow-y-auto w-full relative">
        {!isLoginPage && (
          <div className="sticky top-0 z-40 border-b border-gray-200 bg-white/80 backdrop-blur-xl">
            <div className="max-w-[1600px] mx-auto px-6 lg:px-10 py-4 flex items-center justify-between gap-4">
              <div className="flex items-center gap-4">
                <button
                  onClick={() => setIsSidebarOpen(true)}
                  className="lg:hidden p-2 -ml-2 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  <Menu size={20} className="text-gray-700" />
                </button>
                <div className="relative hidden md:block w-72 lg:w-[400px]">
                  <Search size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-400" />
                  <input
                    placeholder="SEARCH THE ARCHIVE..."
                    className="w-full border border-gray-100 bg-gray-50 rounded-2xl pl-12 pr-6 py-3 text-[10px] font-bold uppercase tracking-[0.1em] outline-none focus:bg-white focus:border-black/10 transition-all text-black placeholder:text-zinc-300"
                  />
                </div>
              </div>

              <div className="flex items-center gap-4">
                <div className="relative">
                  <button
                    onClick={() => setNotificationsOpen(!notificationsOpen)}
                    className="h-10 w-10 border border-gray-300 rounded-lg bg-white flex items-center justify-center text-gray-700 hover:bg-gray-50 transition-all relative"
                  >
                    <Bell size={18} />
                    {notifications.length > 0 && (
                      <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs font-medium rounded-full h-5 w-5 flex items-center justify-center">
                        {notifications.length}
                      </span>
                    )}
                  </button>

                  {/* Notifications Dropdown */}
                  <AnimatePresence>
                    {notificationsOpen && (
                      <>
                        <motion.div
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                          exit={{ opacity: 0 }}
                          onClick={() => setNotificationsOpen(false)}
                          className="fixed inset-0 z-[90]"
                        />
                        <motion.div
                          initial={{ opacity: 0, scale: 0.95, y: -10 }}
                          animate={{ opacity: 1, scale: 1, y: 0 }}
                          exit={{ opacity: 0, scale: 0.95, y: -10 }}
                          className="absolute right-0 top-12 w-80 bg-white border border-gray-200 rounded-lg shadow-lg z-[91]"
                        >
                          <div className="p-4 border-b border-gray-200 flex items-center justify-between">
                            <h3 className="text-sm font-semibold text-gray-900">Notifications</h3>
                            {notifications.length > 0 && (
                              <button
                                onClick={clearAllNotifications}
                                className="text-xs text-blue-600 hover:text-blue-800 font-medium"
                              >
                                Clear All
                              </button>
                            )}
                          </div>

                          <div className="max-h-80 overflow-y-auto">
                            {notifications.length === 0 ? (
                              <div className="p-4 text-center text-gray-500 text-sm">
                                No new notifications
                              </div>
                            ) : (
                              <div className="divide-y divide-gray-100">
                                {notifications.map((notif) => (
                                  <div
                                    key={notif.id}
                                    className="p-4 hover:bg-gray-50 cursor-pointer transition-colors group"
                                    onClick={() => handleNotificationClick(notif.orderId, notif.id)}
                                  >
                                    <div className="flex items-start justify-between gap-3">
                                      <div className="flex-1 min-w-0">
                                        <p className="text-sm text-gray-900 font-medium truncate">
                                          {notif.message}
                                        </p>
                                        <p className="text-xs text-gray-500 mt-1">
                                          Order ID: {notif.orderId.slice(0, 8)}
                                        </p>
                                        <p className="text-xs text-gray-400 mt-1">
                                          {new Date(notif.timestamp).toLocaleString()}
                                        </p>
                                      </div>
                                      <button
                                        onClick={(e) => {
                                          e.stopPropagation();
                                          dismissNotification(notif.id);
                                        }}
                                        className="opacity-0 group-hover:opacity-100 transition-opacity p-1 hover:bg-gray-200 rounded"
                                      >
                                        <X size={14} className="text-gray-400" />
                                      </button>
                                    </div>
                                  </div>
                                ))}
                              </div>
                            )}
                          </div>
                        </motion.div>
                      </>
                    )}
                  </AnimatePresence>
                </div>
                <div className="flex items-center gap-3 pl-4 border-l border-gray-200">
                  <div className="hidden sm:block text-right">
                    <p className="text-[10px] font-medium text-gray-500 uppercase tracking-wider leading-none mb-0.5">System Admin</p>
                    <p className="text-sm font-semibold text-gray-900">
                      {user ? `${user.first_name || ''} ${user.last_name || ''}`.trim() || user.username : 'Siddique'}
                    </p>
                  </div>
                  <div className="h-10 w-10 rounded-full bg-gray-900 text-white flex items-center justify-center text-sm font-semibold overflow-hidden border border-gray-200">
                    {user?.profile?.avatar ? (
                      <img src={user.profile.avatar} alt="" className="h-full w-full object-cover" />
                    ) : (
                      user?.username?.slice(0, 2).toUpperCase() || 'AD'
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
        <div className={cn("relative z-10 w-full min-h-full", !isLoginPage && "p-6 lg:p-12 max-w-[1600px] mx-auto")}>
          <Outlet />
        </div>
      </main>
    </div>
  );
}

function NavItem({ to, icon, label }: { to: string; icon: React.ReactNode; label: string }) {
  return (
    <NavLink
      to={to}
      className={({ isActive }) => cn(
        'flex items-center gap-3 px-4 py-3 transition-all duration-200 group rounded-lg',
        'text-sm font-medium w-full',
        isActive
          ? 'bg-black text-white shadow-sm'
          : 'text-gray-500 hover:bg-gray-100 hover:text-gray-900'
      )}
    >
      {({ isActive }) => (
        <>
          <span className={cn("transition-transform", !isActive && "group-hover:scale-110")}>{icon}</span>
          <span>{label}</span>
        </>
      )}
    </NavLink>
  );
}
