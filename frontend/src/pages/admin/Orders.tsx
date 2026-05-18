import { useMemo, useState, useEffect } from 'react';
import { X, CheckCircle, Package, Truck, XCircle, Clock, Loader2, Search, CreditCard, MessageCircle, Eye, ThumbsUp, ThumbsDown, Bell, Image as ImageIcon } from 'lucide-react';
import { useStore } from '@/store/useStore';
import { useSearchParams } from 'react-router-dom';
import { OrderStatus } from '@/types';

const statusClass: Record<string, string> = {
  PENDING_VERIFICATION: 'bg-amber-100 text-amber-800',
  CONFIRMED: 'bg-emerald-100 text-emerald-800',
  SHIPPED: 'bg-blue-100 text-blue-800',
  DELIVERED: 'bg-green-100 text-green-800',
  REJECTED: 'bg-red-100 text-red-800',
  CANCELED: 'bg-red-100 text-red-800',
  WHATSAPP_PENDING: 'bg-lime-100 text-lime-800',
  // Legacy
  PENDING: 'bg-yellow-100 text-yellow-800',
  PENDING_ADVANCE: 'bg-yellow-100 text-yellow-800',
  CONFIRMED_ADVANCE: 'bg-emerald-100 text-emerald-800',
  DISPATCHED: 'bg-blue-100 text-blue-800',
};

const StatusIcon = ({ status }: { status: string }) => {
  switch (status) {
    case 'PENDING_VERIFICATION': return <Clock size={14} />;
    case 'WHATSAPP_PENDING': return <MessageCircle size={14} />;
    case 'CONFIRMED': return <CheckCircle size={14} />;
    case 'SHIPPED': return <Truck size={14} />;
    case 'DELIVERED': return <CheckCircle size={14} />;
    case 'REJECTED': return <XCircle size={14} />;
    case 'CANCELED': return <XCircle size={14} />;
    default: return <Clock size={14} />;
  }
};

type AdminTab = 'website' | 'whatsapp' | 'all';

export default function Orders() {
  const { orders, updateOrderStatus, acceptOrder, rejectOrder, isLoading, products, notifications, dismissNotification } = useStore();
  const [searchParams] = useSearchParams();
  const highlightOrderId = searchParams.get('highlight');
  const [selected, setSelected] = useState<string | null>(null);
  const [mailNotice, setMailNotice] = useState('');
  const [activeTab, setActiveTab] = useState<AdminTab>('website');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedOrderIds, setSelectedOrderIds] = useState<string[]>([]);
  const [screenshotModal, setScreenshotModal] = useState<string | null>(null);
  const { bulkUpdateOrders } = useStore();
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  const selectedOrder = useMemo(() => orders.find(o => o.id === selected), [orders, selected]);

  useEffect(() => {
    if (highlightOrderId && orders.find(o => o.id === highlightOrderId)) {
      setSelected(highlightOrderId);
    }
  }, [highlightOrderId, orders]);

  // Separate orders by checkout method
  const websiteOrders = useMemo(() => orders.filter(o => o.checkoutMethod === 'website'), [orders]);
  const whatsappOrders = useMemo(() => orders.filter(o => o.checkoutMethod === 'whatsapp'), [orders]);

  const displayOrders = useMemo(() => {
    let base = activeTab === 'website' ? websiteOrders : activeTab === 'whatsapp' ? whatsappOrders : orders;
    if (searchQuery) {
      base = base.filter(order =>
        order.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
        order.orderCode?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        order.customerName?.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }
    return base;
  }, [activeTab, websiteOrders, whatsappOrders, orders, searchQuery]);

  // Pagination logic
  const totalPages = Math.ceil(displayOrders.length / itemsPerPage);
  const currentOrders = useMemo(() => {
    const startIdx = (currentPage - 1) * itemsPerPage;
    return displayOrders.slice(startIdx, startIdx + itemsPerPage);
  }, [displayOrders, currentPage]);

  // Reset page when tab or search changes
  useEffect(() => {
    setCurrentPage(1);
  }, [activeTab, searchQuery]);

  const handleAccept = async (orderId: string) => {
    if (!confirm('Confirm this order? This will finalize the sale.')) return;
    await acceptOrder(orderId);
    setMailNotice('Order Confirmed ✅');
    setTimeout(() => setMailNotice(''), 3000);
  };

  const handleReject = async (orderId: string) => {
    if (!confirm('Reject this order? The item will be made available again.')) return;
    await rejectOrder(orderId);
    setMailNotice('Order Rejected. Item back in stock.');
    setTimeout(() => setMailNotice(''), 3000);
  };

  const handleBulkUpdate = async (nextStatus: OrderStatus) => {
    if (selectedOrderIds.length === 0) return;
    try {
      await bulkUpdateOrders(selectedOrderIds, nextStatus);
      setSelectedOrderIds([]);
      setMailNotice('Bulk update successful');
      window.setTimeout(() => setMailNotice(''), 3000);
    } catch {
      alert('Bulk update failed');
    }
  };

  const toggleSelectOrder = (id: string) => {
    setSelectedOrderIds(prev => prev.includes(id) ? prev.filter(oid => oid !== id) : [...prev, id]);
  };

  const toggleSelectAll = () => {
    if (selectedOrderIds.length === displayOrders.length) setSelectedOrderIds([]);
    else setSelectedOrderIds(displayOrders.map(o => o.id));
  };

  const getProductTitle = (productId: string) => {
    return products.find(p => p.id === productId)?.title || 'Unknown Product';
  };

  // Count pending in each tab for badges
  const websitePending = websiteOrders.filter(o => o.status === 'PENDING_VERIFICATION').length;
  const whatsappPending = whatsappOrders.filter(o => o.status === 'WHATSAPP_PENDING').length;

  return (
    <div className="space-y-6">
      {/* Notification Bar */}
      {notifications.length > 0 && (
        <div className="space-y-2">
          {notifications.slice(0, 3).map(n => (
            <div
              key={n.id}
              className={`flex items-center justify-between p-4 rounded-lg border shadow-sm animate-in slide-in-from-top duration-300 ${n.type === 'website_payment'
                ? 'bg-amber-50 border-amber-200 text-amber-900'
                : 'bg-green-50 border-green-200 text-green-900'
                }`}
            >
              <div className="flex items-center gap-3">
                <Bell size={16} className="animate-bounce" />
                <span className="text-sm font-semibold">{n.message}</span>
                <span className="text-[10px] text-zinc-400 font-mono">{new Date(n.timestamp).toLocaleTimeString()}</span>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => { setSelected(n.orderId); dismissNotification(n.id); }}
                  className="text-xs font-bold uppercase tracking-wider px-3 py-1 bg-white border rounded hover:bg-zinc-50 transition-colors"
                >
                  View
                </button>
                <button onClick={() => dismissNotification(n.id)} className="text-zinc-400 hover:text-zinc-600">
                  <X size={14} />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      <div>
        <h1 className="text-2xl font-semibold text-gray-900">Orders</h1>
        <p className="text-sm text-gray-500 mt-1">Manage and track customer orders</p>
      </div>

      {/* Dual Order Tabs */}
      <div className="bg-white border border-gray-200 shadow-sm rounded-lg overflow-hidden">
        <div className="border-b border-gray-200">
          <div className="flex">
            <button
              onClick={() => { setActiveTab('website'); setSelectedOrderIds([]); }}
              className={`flex items-center gap-2 px-6 py-4 text-sm font-semibold border-b-2 transition-all ${activeTab === 'website'
                ? 'border-black text-black'
                : 'border-transparent text-zinc-400 hover:text-zinc-600'
                }`}
            >
              <CreditCard size={16} />
              Website Paid Orders
              {websitePending > 0 && (
                <span className="ml-1 bg-amber-500 text-white text-[10px] font-bold rounded-full w-5 h-5 flex items-center justify-center animate-pulse">
                  {websitePending}
                </span>
              )}
            </button>
            <button
              onClick={() => { setActiveTab('whatsapp'); setSelectedOrderIds([]); }}
              className={`flex items-center gap-2 px-6 py-4 text-sm font-semibold border-b-2 transition-all ${activeTab === 'whatsapp'
                ? 'border-[#25D366] text-[#25D366]'
                : 'border-transparent text-zinc-400 hover:text-zinc-600'
                }`}
            >
              <MessageCircle size={16} />
              WhatsApp Inquiries
              {whatsappPending > 0 && (
                <span className="ml-1 bg-[#25D366] text-white text-[10px] font-bold rounded-full w-5 h-5 flex items-center justify-center animate-pulse">
                  {whatsappPending}
                </span>
              )}
            </button>
            <button
              onClick={() => { setActiveTab('all'); setSelectedOrderIds([]); }}
              className={`flex items-center gap-2 px-6 py-4 text-sm font-semibold border-b-2 transition-all ${activeTab === 'all'
                ? 'border-zinc-600 text-zinc-900'
                : 'border-transparent text-zinc-400 hover:text-zinc-600'
                }`}
            >
              All Orders
              <span className="text-[10px] font-mono text-zinc-400">({orders.length})</span>
            </button>
          </div>
        </div>

        {/* Search Bar */}
        <div className="p-4 border-b border-gray-200 flex flex-wrap gap-3 items-center justify-between">
          <div className="flex-1 max-w-xs relative">
            <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="Search by Order ID, name..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full rounded-lg border border-gray-300 pl-9 pr-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
        </div>

        {/* Orders Table */}
        <div className="overflow-x-auto min-h-[400px]">
          {isLoading && orders.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-20 text-gray-400">
              <Loader2 className="animate-spin mb-2" />
              <p>Loading orders...</p>
            </div>
          ) : (
            <table className="w-full text-left text-sm">
              <thead className="bg-gray-50 text-gray-600 border-b border-gray-200">
                <tr>
                  <th className="px-4 py-3">
                    <input
                      type="checkbox"
                      onChange={toggleSelectAll}
                      checked={selectedOrderIds.length === displayOrders.length && displayOrders.length > 0}
                      className="accent-black"
                    />
                  </th>
                  <th className="px-4 py-3 font-medium text-xs uppercase tracking-wide">Order ID</th>
                  <th className="px-4 py-3 font-medium text-xs uppercase tracking-wide">Customer</th>
                  <th className="px-4 py-3 font-medium text-xs uppercase tracking-wide">Product</th>
                  <th className="px-4 py-3 font-medium text-xs uppercase tracking-wide">Amount</th>
                  {activeTab === 'website' && (
                    <th className="px-4 py-3 font-medium text-xs uppercase tracking-wide">Payment Proof</th>
                  )}
                  <th className="px-4 py-3 font-medium text-xs uppercase tracking-wide">Status</th>
                  <th className="px-4 py-3 text-right font-medium text-xs uppercase tracking-wide">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {selectedOrderIds.length > 0 && (
                  <tr className="bg-zinc-50 border-b border-black/5">
                    <td colSpan={activeTab === 'website' ? 8 : 7} className="px-4 py-2">
                      <div className="flex items-center gap-4">
                        <span className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest">{selectedOrderIds.length} Selected</span>
                        <div className="h-4 w-[1px] bg-zinc-200"></div>
                        <select
                          onChange={(e) => handleBulkUpdate(e.target.value as OrderStatus)}
                          className="bg-transparent border-none text-[10px] font-black uppercase tracking-widest cursor-pointer focus:ring-0"
                        >
                          <option value="">Bulk Action</option>
                          <option value="confirmed">Confirm All</option>
                          <option value="shipped">Mark Shipped</option>
                          <option value="delivered">Mark Delivered</option>
                          <option value="canceled">Cancel All</option>
                        </select>
                      </div>
                    </td>
                  </tr>
                )}
                {displayOrders.length === 0 ? (
                  <tr>
                    <td colSpan={activeTab === 'website' ? 8 : 7} className="px-4 py-20 text-center text-gray-400">
                      {activeTab === 'website' ? 'No website payment orders found.' : activeTab === 'whatsapp' ? 'No WhatsApp inquiries found.' : 'No orders found.'}
                    </td>
                  </tr>
                ) : (
                  currentOrders.map((order) => (
                    <tr
                      key={order.id}
                      className={`hover:bg-gray-50 transition-colors ${selectedOrderIds.includes(order.id) ? 'bg-zinc-50' : ''
                        } ${highlightOrderId === order.id ? 'bg-zinc-800/5 ring-1 ring-inset ring-zinc-300' : ''}`}
                    >
                      <td className="px-4 py-4">
                        <input
                          type="checkbox"
                          checked={selectedOrderIds.includes(order.id)}
                          onChange={() => toggleSelectOrder(order.id)}
                          className="accent-black"
                        />
                      </td>
                      <td className="px-4 py-4">
                        <p className="font-mono text-xs font-semibold text-gray-700">{order.orderCode || order.id.slice(0, 8)}</p>
                        <p className="text-xs text-gray-400">{new Date(order.createdAt).toLocaleDateString()}</p>
                      </td>
                      <td className="px-4 py-4">
                        <p className="font-medium text-gray-900">{order.customerName}</p>
                        <p className="text-xs text-gray-500">{order.customerContact}</p>
                      </td>
                      <td className="px-4 py-4">
                        <p className="font-medium text-gray-900 max-w-[200px] truncate">{order.productTitle || getProductTitle(order.productId)}</p>
                      </td>
                      <td className="px-4 py-4 font-medium text-gray-900">
                        Rs.{order.totalAmount.toLocaleString()}
                      </td>
                      {activeTab === 'website' && (
                        <td className="px-4 py-4">
                          <div className="flex items-center gap-2">
                            {order.paymentScreenshotUrl ? (
                              <button
                                onClick={() => setScreenshotModal(order.paymentScreenshotUrl!)}
                                className="w-10 h-10 bg-zinc-100 border border-zinc-200 rounded overflow-hidden hover:ring-2 hover:ring-black transition-all cursor-pointer"
                              >
                                <img src={order.paymentScreenshotUrl} alt="proof" className="w-full h-full object-cover" />
                              </button>
                            ) : (
                              <span className="text-zinc-300"><ImageIcon size={16} /></span>
                            )}
                            {order.transactionId && (
                              <span className="text-[10px] font-mono text-zinc-500 bg-zinc-100 px-2 py-1 rounded">{order.transactionId}</span>
                            )}
                          </div>
                        </td>
                      )}
                      <td className="px-4 py-4">
                        <span className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-medium ${statusClass[order.status] || 'bg-gray-100 text-gray-800'}`}>
                          <StatusIcon status={order.status} />
                          {order.status.replace(/_/g, ' ')}
                        </span>
                      </td>
                      <td className="px-4 py-4 text-right">
                        <div className="flex justify-end gap-2">
                          {/* Accept / Reject buttons for pending orders */}
                          {(order.status === 'PENDING_VERIFICATION' || order.status === 'WHATSAPP_PENDING') && (
                            <>
                              <button
                                onClick={() => handleAccept(order.id)}
                                className="inline-flex items-center gap-1 px-3 py-1.5 text-[10px] font-bold uppercase tracking-wider bg-emerald-600 text-white rounded hover:bg-emerald-700 transition-colors"
                              >
                                <ThumbsUp size={12} /> Accept
                              </button>
                              <button
                                onClick={() => handleReject(order.id)}
                                className="inline-flex items-center gap-1 px-3 py-1.5 text-[10px] font-bold uppercase tracking-wider bg-red-600 text-white rounded hover:bg-red-700 transition-colors"
                              >
                                <ThumbsDown size={12} /> Reject
                              </button>
                            </>
                          )}
                          <button
                            onClick={() => setSelected(order.id)}
                            className="rounded-lg border border-gray-300 px-3 py-1.5 text-xs font-medium hover:bg-gray-50 transition-colors"
                          >
                            Details
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          )}
        </div>

        {/* Pagination Controls */}
        {!isLoading && totalPages > 1 && (
          <div className="mt-4 flex items-center justify-between border-t border-gray-100 p-4">
            <span className="text-sm text-gray-500">
              Showing <span className="font-medium">{(currentPage - 1) * itemsPerPage + 1}</span> to <span className="font-medium">{Math.min(currentPage * itemsPerPage, displayOrders.length)}</span> of <span className="font-medium">{displayOrders.length}</span> entries
            </span>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                disabled={currentPage === 1}
                className="px-3 py-1 text-sm border border-gray-200 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Previous
              </button>
              <button
                onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                disabled={currentPage === totalPages}
                className="px-3 py-1 text-sm border border-gray-200 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Next
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Screenshot Full-Screen Modal */}
      {screenshotModal && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/80 backdrop-blur-sm" onClick={() => setScreenshotModal(null)} />
          <div className="relative max-w-2xl max-h-[85vh] bg-white border border-gray-200 shadow-2xl rounded-lg overflow-hidden">
            <div className="p-4 border-b border-gray-200 flex justify-between items-center">
              <p className="text-sm font-semibold text-gray-900">Payment Screenshot</p>
              <button onClick={() => setScreenshotModal(null)} className="hover:bg-gray-100 rounded-lg p-1"><X size={18} /></button>
            </div>
            <div className="p-4">
              <img src={screenshotModal} alt="Payment proof full" className="w-full max-h-[70vh] object-contain" />
            </div>
          </div>
        </div>
      )}

      {/* Toast notice */}
      {mailNotice && (
        <div className="fixed bottom-6 right-6 z-50 bg-gray-900 text-white px-5 py-3 text-sm rounded-lg shadow-lg flex items-center gap-3">
          <CheckCircle size={16} className="text-green-400" />
          {mailNotice}
        </div>
      )}

      {/* Order Details Modal */}
      {selectedOrder && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-gray-900/50 backdrop-blur-sm" onClick={() => setSelected(null)} />
          <div className="relative w-full max-w-xl bg-white border border-gray-200 shadow-lg rounded-lg overflow-hidden animate-in zoom-in-95 duration-200 max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-gray-200 flex items-center justify-between">
              <div>
                <h2 className="text-lg font-semibold text-gray-900">Order Details</h2>
                <div className="flex items-center gap-2 mt-1">
                  <p className="text-xs text-gray-500 font-mono">{selectedOrder.orderCode || selectedOrder.id.slice(0, 8)}</p>
                  <span className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-medium ${selectedOrder.checkoutMethod === 'website' ? 'bg-amber-100 text-amber-700' : 'bg-green-100 text-green-700'
                    }`}>
                    {selectedOrder.checkoutMethod === 'website' ? '💳 Website' : '📱 WhatsApp'}
                  </span>
                </div>
              </div>
              <button
                onClick={() => setSelected(null)}
                className="h-8 w-8 rounded-lg hover:bg-gray-100 grid place-items-center transition-colors"
              >
                <X size={18} />
              </button>
            </div>

            <div className="p-6 space-y-6">
              <div className="grid grid-cols-2 gap-6">
                <div className="space-y-4">
                  <div>
                    <label className="text-xs font-medium text-gray-500 uppercase tracking-wide">Customer Details</label>
                    <p className="text-sm font-medium text-gray-900 mt-1">{selectedOrder.customerName}</p>
                    <p className="text-xs text-gray-500">{selectedOrder.customerEmail}</p>
                    <p className="text-xs text-gray-500 mt-1">{selectedOrder.customerContact}</p>

                    <div className="mt-4 p-4 border border-zinc-100 bg-zinc-50/50 rounded-xl">
                      <p className="text-[10px] font-black uppercase tracking-widest text-zinc-400 mb-3">Customer Trust History</p>
                      <div className="flex gap-4">
                        <div className="flex-1">
                          <p className="text-xl font-black">{selectedOrder.trustMetrics?.trust_score ?? 0}%</p>
                          <p className="text-[8px] font-bold text-zinc-400 uppercase tracking-widest">Trust Score</p>
                        </div>
                        <div className="flex-1 border-l border-zinc-200 pl-4">
                          <p className="text-xl font-black">{selectedOrder.trustMetrics?.total_orders ?? 0}</p>
                          <p className="text-[8px] font-bold text-zinc-400 uppercase tracking-widest">Total Orders</p>
                        </div>
                      </div>
                    </div>
                  </div>
                  <div>
                    <label className="text-xs font-medium text-gray-500 uppercase tracking-wide">Shipping Address</label>
                    <p className="text-sm text-gray-700 mt-1 leading-relaxed">
                      {selectedOrder.customerAddress}<br />
                      {selectedOrder.city}
                    </p>
                  </div>
                </div>

                <div className="space-y-4">
                  <div>
                    <label className="text-xs font-medium text-gray-500 uppercase tracking-wide">Product Details</label>
                    <p className="text-sm font-medium text-gray-900 mt-1">{selectedOrder.productTitle || getProductTitle(selectedOrder.productId)}</p>
                  </div>
                  <div>
                    <label className="text-xs font-medium text-gray-500 uppercase tracking-wide">Payment Summary</label>
                    <div className="mt-1 p-3 bg-gray-50 rounded-lg">
                      <div className="flex justify-between text-xs text-gray-500 mb-1">
                        <span>Shoes Price</span>
                        <span>Rs.{(selectedOrder.totalAmount - 400).toLocaleString()}</span>
                      </div>
                      <div className="flex justify-between text-xs text-gray-500 mb-1">
                        <span>COD Charges (Advance)</span>
                        <span>Rs.400</span>
                      </div>
                      <div className="flex justify-between text-sm font-semibold text-gray-900 mt-2 border-t border-gray-100 pt-2">
                        <span>Total Pay</span>
                        <span>Rs.{selectedOrder.totalAmount.toLocaleString()}</span>
                      </div>
                    </div>
                  </div>

                  {/* Payment Proof section for website orders */}
                  {selectedOrder.checkoutMethod === 'website' && (
                    <div>
                      <label className="text-xs font-medium text-gray-500 uppercase tracking-wide">Payment Proof</label>
                      {selectedOrder.transactionId && (
                        <p className="text-sm font-mono text-gray-700 mt-1">TID: {selectedOrder.transactionId}</p>
                      )}
                      {selectedOrder.paymentScreenshotUrl && (
                        <button
                          onClick={() => setScreenshotModal(selectedOrder.paymentScreenshotUrl!)}
                          className="mt-2 w-full h-32 bg-zinc-100 border border-zinc-200 rounded-lg overflow-hidden hover:ring-2 hover:ring-black transition-all cursor-pointer"
                        >
                          <img src={selectedOrder.paymentScreenshotUrl} alt="proof" className="w-full h-full object-contain" />
                        </button>
                      )}
                    </div>
                  )}
                </div>
              </div>
            </div>

            <div className="p-6 bg-gray-50 flex justify-between items-center gap-3">
              {(selectedOrder.status === 'PENDING_VERIFICATION' || selectedOrder.status === 'WHATSAPP_PENDING') && (
                <div className="flex gap-2">
                  <button
                    onClick={() => { handleAccept(selectedOrder.id); setSelected(null); }}
                    className="inline-flex items-center gap-2 px-4 py-2 text-sm font-semibold bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition-colors"
                  >
                    <ThumbsUp size={16} /> Confirm Order
                  </button>
                  <button
                    onClick={() => { handleReject(selectedOrder.id); setSelected(null); }}
                    className="inline-flex items-center gap-2 px-4 py-2 text-sm font-semibold bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
                  >
                    <ThumbsDown size={16} /> Reject
                  </button>
                </div>
              )}
              <button
                onClick={() => setSelected(null)}
                className="ml-auto px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-200 rounded-lg transition-colors"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
