import { ArrowUpRight, Package, CreditCard, TrendingUp, Truck, Loader2 } from 'lucide-react';
import { Area, AreaChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';
import { useStore } from '@/store/useStore';
import { useMemo } from 'react';
import { siteConfig } from '@/config/siteConfig';

export default function Dashboard() {
  const { products, orders, isLoading } = useStore();

  const activeProducts = useMemo(() => products.filter((p) => p.status === 'AVAILABLE').length, [products]);
  const totalRevenue = useMemo(() => orders.reduce((sum, order) => {
    if (order.status === 'DELIVERED') return sum + order.totalAmount;
    if (order.status === 'CONFIRMED_ADVANCE' || order.status === 'DISPATCHED') return sum + siteConfig.COD_FEE;
    return sum;
  }, 0), [orders]);
  const pendingOrders = useMemo(() => orders.filter((o) => o.status === 'PENDING_ADVANCE').length, [orders]);
  const soldOutItems = useMemo(() => products.filter((p) => p.status === 'SOLD').length, [products]);
  const dashboardStats = useStore((state) => state.dashboardStats);

  const chartData = useMemo(() => {
    const dailyRev: Record<string, number> = {};
    const last30Days = Array.from({ length: 30 }, (_, i) => {
      const d = new Date();
      d.setDate(d.getDate() - (29 - i));
      return d.toLocaleDateString(undefined, { day: 'numeric', month: 'short' });
    });

    orders.forEach(o => {
      const day = new Date(o.createdAt).toLocaleDateString(undefined, { day: 'numeric', month: 'short' });
      let dayVal = 0;
      if (o.status === 'DELIVERED') dayVal = o.totalAmount;
      else if (o.status === 'CONFIRMED_ADVANCE' || o.status === 'DISPATCHED') dayVal = siteConfig.COD_FEE;

      dailyRev[day] = (dailyRev[day] || 0) + dayVal;
    });

    return last30Days.map(day => ({
      day,
      revenue: dailyRev[day] || 0
    }));
  }, [orders]);

  if (isLoading && products.length === 0) {
    return (
      <div className="h-[400px] flex items-center justify-center">
        <Loader2 className="animate-spin text-muted-text" size={32} />
      </div>
    );
  }

  return (
    <div className="space-y-8 text-gray-900">
      <div>
        <h1 className="text-2xl font-black text-black uppercase tracking-tight">Executive Dashboard</h1>
        <p className="text-xs text-zinc-500 mt-1 uppercase tracking-widest font-bold">Real-time performance metrics for {siteConfig.brand.fullName}.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Stat
          title="TOTAL REVENUE"
          value={`Rs.${(dashboardStats?.total_revenue ?? totalRevenue).toLocaleString()}`}
          description={`${orders.filter(o => o.status === 'DELIVERED').length} Delivered + ${orders.filter(o => ['CONFIRMED_ADVANCE', 'DISPATCHED'].includes(o.status)).length} Advances`}
          icon={<CreditCard size={20} />}
        />
        <Stat
          title="ESTIMATED PROFIT"
          value={`Rs.${(dashboardStats?.total_profit ?? 0).toLocaleString()}`}
          description="Revenue - Buying Costs"
          icon={<TrendingUp size={20} />}
        />
        <Stat
          title="PENDING ORDERS"
          value={String(dashboardStats?.order_counts?.pending ?? pendingOrders)}
          description="Awaiting Verification / Dispatch"
          icon={<TrendingUp size={20} />}
        />
        <Stat
          title="TOTAL ITEMS SOLD"
          value={String(dashboardStats?.total_sold ?? soldOutItems)}
          description="Successfully Received by Customers"
          icon={<Truck size={20} />}
        />
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        <div className="xl:col-span-2 bg-white border border-gray-200 shadow-sm rounded-xl p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-sm font-medium text-gray-500 uppercase tracking-wide">Revenue Trajectory</h2>
            <div className="flex items-center gap-1.5 px-2 py-1 bg-green-50 text-green-600 text-xs font-medium rounded-full">
              <ArrowUpRight size={12} strokeWidth={2} />
              Live
            </div>
          </div>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={chartData} margin={{ left: 0, right: 0, top: 0, bottom: 0 }}>
                <defs>
                  <linearGradient id="revenueFill" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#000000" stopOpacity={0.1} />
                    <stop offset="95%" stopColor="#000000" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid stroke="#f3f4f6" vertical={false} strokeDasharray="3 3" />
                <XAxis dataKey="day" tick={{ fontSize: 11, fill: '#6b7280' }} axisLine={false} tickLine={false} dy={15} />
                <YAxis
                  tick={{ fontSize: 11, fill: '#6b7280' }}
                  axisLine={false}
                  tickLine={false}
                  tickFormatter={(val) => `${val / 1000}k`}
                />
                <Tooltip
                  contentStyle={{
                    backgroundColor: 'white',
                    border: '1px solid #e5e7eb',
                    borderRadius: '8px',
                    boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)',
                    fontSize: '12px',
                    fontWeight: '500'
                  }}
                  formatter={(value) => [`Rs.${value.toLocaleString()}`, 'Revenue']}
                />
                <Area type="monotone" dataKey="revenue" stroke="#000000" fill="url(#revenueFill)" strokeWidth={2} />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="bg-white border border-gray-200 shadow-sm rounded-xl p-6">
          <h2 className="text-sm font-medium text-gray-500 uppercase tracking-wide mb-6">Most Viewed Archive</h2>
          <div className="space-y-4">
            {dashboardStats?.most_viewed?.map((product) => (
              <div key={product.id} className="flex items-center gap-4">
                <div className="w-12 h-12 bg-zinc-50 border border-zinc-100 p-1 flex-shrink-0">
                  <img src={product.image} alt="" className="w-full h-full object-contain" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-bold truncate uppercase">{product.title}</p>
                  <p className="text-[10px] text-zinc-400 font-bold uppercase tracking-widest">{product.views} Views</p>
                </div>
                <div className="text-xs font-black italic">TOP</div>
              </div>
            ))}
          </div>

          <h2 className="text-sm font-medium text-gray-500 uppercase tracking-wide mb-6 mt-10">Recent Orders</h2>
          <div className="space-y-4">
            {orders.length === 0 ? (
              <div className="py-12 text-center text-gray-400 text-sm">
                No recent orders
              </div>
            ) : (
              orders.slice(0, 6).map((order) => (
                <div key={order.id} className="flex items-center gap-4 p-3 border border-gray-100 rounded-lg hover:bg-gray-50 transition-colors">
                  <div className="w-10 h-10 bg-gray-100 rounded-full flex items-center justify-center text-sm font-medium text-gray-600 shrink-0">
                    {order.customerName.charAt(0)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-900 truncate">{order.customerName}</p>
                    <p className="text-xs text-gray-500 mt-0.5">
                      {order.status.replace('_', ' ')} • {new Date(order.createdAt).toLocaleDateString()}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-medium text-gray-900">Rs.{(order.totalAmount / 1000).toFixed(1)}k</p>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

function Stat({ title, value, description, icon }: { title: string; value: string; description: string; icon: React.ReactNode }) {
  return (
    <div className="bg-white border border-gray-100 shadow-sm p-8 rounded-3xl group hover:shadow-xl hover:shadow-black/5 transition-all duration-300">
      <div className="flex items-center justify-between mb-6">
        <p className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest">{title}</p>
        <div className="w-12 h-12 bg-zinc-50 rounded-2xl flex items-center justify-center text-black group-hover:bg-black group-hover:text-white transition-colors">
          {icon}
        </div>
      </div>
      <p className="text-3xl font-black text-black tracking-tight">{value}</p>
      <p className="mt-2 text-[10px] font-medium text-zinc-400 uppercase tracking-wide">{description}</p>
    </div>
  );
}
