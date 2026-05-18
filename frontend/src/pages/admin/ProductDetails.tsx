import { useState } from 'react';
import { 
  Edit3, 
  History, 
  Power, 
  Plus, 
  Minus, 
  Package,
  DollarSign,
  Layers,
  Home,
  ShoppingBag,
  Users,
  BarChart3,
  Settings as SettingsIcon,
  Bell,
  Search,
  ChevronLeft
} from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';

export default function ProductDetails() {
  const navigate = useNavigate();
  const [quantity, setQuantity] = useState(1);
  const [selectedSizes, setSelectedSizes] = useState(['Medium']);

  const sizes = ['XS', 'Small', 'Medium', 'Large', 'XL'];

  const toggleSize = (size: string) => {
    setSelectedSizes(prev => 
      prev.includes(size) 
        ? prev.filter(s => s !== size)
        : [...prev, size]
    );
  };

  return (
    <div className="min-h-screen bg-gray-50 flex">
      {/* Sidebar Navigation */}
      <aside className="w-64 bg-white shadow-lg border-r border-gray-200 flex flex-col fixed h-full z-30">
        <div className="p-6 border-b border-gray-200">
          <h1 className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
            ROHAAN
          </h1>
          <p className="text-xs text-gray-500 mt-1">Admin Dashboard</p>
        </div>
        
        <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
          <NavItem icon={Home} label="Dashboard" to="/admin/dashboard" />
          <NavItem icon={ShoppingBag} label="Products" to="/admin/inventory" active />
          <NavItem icon={Users} label="Customers" to="/admin/customers" />
          <NavItem icon={Package} label="Orders" to="/admin/orders" />
          <NavItem icon={BarChart3} label="Analytics" to="/admin/analytics" />
          <NavItem icon={SettingsIcon} label="Settings" to="/admin/settings" />
        </nav>

        <div className="p-4 border-t border-gray-200">
          <div className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg">
            <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-500 rounded-full flex items-center justify-center">
              <span className="text-white text-sm font-bold">AD</span>
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold text-gray-900 truncate">Admin User</p>
              <p className="text-xs text-gray-500 truncate">admin@rohaan.com</p>
            </div>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <div className="flex-1 ml-64">
        {/* Header */}
        <header className="bg-white shadow-sm border-b border-gray-200 px-8 py-4 sticky top-0 z-20">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <button 
                onClick={() => navigate(-1)}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <ChevronLeft className="w-5 h-5 text-gray-600" />
              </button>
              <div>
                <h2 className="text-2xl font-bold text-gray-900">Product Details</h2>
                <p className="text-sm text-gray-600 mt-0.5">Manage product information and settings</p>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <div className="relative">
                <Search className="w-5 h-5 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input 
                  type="text" 
                  placeholder="Search products..."
                  className="pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent w-64"
                />
              </div>
              <button className="relative p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors">
                <Bell className="w-5 h-5" />
                <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full"></span>
              </button>
            </div>
          </div>
        </header>

        {/* Content Area */}
        <main className="p-8">
          <div className="max-w-7xl mx-auto">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              
              {/* Left Side - Product Card */}
              <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-8 hover:shadow-md transition-shadow">
                <div className="aspect-square bg-gradient-to-br from-gray-50 to-gray-100 rounded-xl mb-6 overflow-hidden relative group">
                  <img 
                    src="/images/download.jpeg" 
                    alt="Product"
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                  <div className="absolute top-4 right-4 bg-green-500 text-white px-3 py-1 rounded-full text-xs font-semibold">
                    In Stock
                  </div>
                </div>
                <div className="text-center space-y-3">
                  <h3 className="text-2xl font-bold text-gray-900">
                    Premium Nike Air Max 270
                  </h3>
                  <p className="text-gray-500 font-mono text-sm bg-gray-50 inline-block px-4 py-2 rounded-lg">
                    Product ID: #NK270-2024-001
                  </p>
                  <div className="flex items-center justify-center space-x-2 pt-2">
                    <span className="px-3 py-1 bg-blue-50 text-blue-600 rounded-full text-xs font-semibold">
                      Sneakers
                    </span>
                    <span className="px-3 py-1 bg-purple-50 text-purple-600 rounded-full text-xs font-semibold">
                      Premium
                    </span>
                  </div>
                </div>
              </div>

              {/* Right Side - Control Panels */}
              <div className="space-y-6">
                
                {/* Pricing Panel */}
                <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow">
                  <div className="flex items-center mb-5">
                    <div className="w-10 h-10 bg-blue-50 rounded-lg flex items-center justify-center mr-3">
                      <DollarSign className="w-5 h-5 text-blue-500" />
                    </div>
                    <h4 className="text-lg font-bold text-gray-900">Pricing</h4>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-6 mb-6">
                    <div className="bg-gray-50 rounded-xl p-4">
                      <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2 block">
                        Original Price
                      </label>
                      <div className="text-2xl font-bold text-gray-400 line-through">
                        Rs. 12,000
                      </div>
                    </div>
                    <div className="bg-green-50 rounded-xl p-4">
                      <label className="text-xs font-semibold text-green-600 uppercase tracking-wider mb-2 block">
                        Selling Price
                      </label>
                      <div className="text-2xl font-bold text-green-600">
                        Rs. 10,000
                      </div>
                    </div>
                  </div>

                  <div className="bg-amber-50 border border-amber-200 rounded-lg p-3 mb-6">
                    <p className="text-sm text-amber-800">
                      <span className="font-semibold">Discount:</span> 16.67% off (Save Rs. 2,000)
                    </p>
                  </div>

                  <div className="grid grid-cols-1 gap-3">
                    <button className="flex items-center justify-center px-4 py-3 bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-xl hover:from-blue-600 hover:to-blue-700 transition-all shadow-sm hover:shadow-md font-semibold">
                      <Edit3 className="w-4 h-4 mr-2" />
                      Edit Product
                    </button>
                    <div className="grid grid-cols-2 gap-3">
                      <button className="flex items-center justify-center px-4 py-3 bg-gray-100 text-gray-700 rounded-xl hover:bg-gray-200 transition-colors font-medium">
                        <History className="w-4 h-4 mr-2" />
                        View History
                      </button>
                      <button className="flex items-center justify-center px-4 py-3 bg-red-50 text-red-600 rounded-xl hover:bg-red-100 transition-colors font-medium">
                        <Power className="w-4 h-4 mr-2" />
                        Deactivate
                      </button>
                    </div>
                  </div>
                </div>

                {/* Stock Status Panel */}
                <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow">
                  <div className="flex items-center mb-5">
                    <div className="w-10 h-10 bg-green-50 rounded-lg flex items-center justify-center mr-3">
                      <Package className="w-5 h-5 text-green-500" />
                    </div>
                    <h4 className="text-lg font-bold text-gray-900">Stock Status</h4>
                  </div>
                  
                  <div className="bg-gray-50 rounded-xl p-5 mb-5">
                    <div className="flex items-center justify-between mb-3">
                      <span className="text-sm font-semibold text-gray-600">Adjust Quantity</span>
                      <div className="flex items-center space-x-4">
                        <button 
                          onClick={() => setQuantity(Math.max(0, quantity - 1))}
                          className="w-10 h-10 bg-white border-2 border-gray-200 rounded-xl flex items-center justify-center hover:border-blue-500 hover:bg-blue-50 transition-all shadow-sm"
                        >
                          <Minus className="w-4 h-4 text-gray-600" />
                        </button>
                        <span className="w-16 text-center font-bold text-2xl text-gray-900">
                          {quantity}
                        </span>
                        <button 
                          onClick={() => setQuantity(quantity + 1)}
                          className="w-10 h-10 bg-white border-2 border-gray-200 rounded-xl flex items-center justify-center hover:border-blue-500 hover:bg-blue-50 transition-all shadow-sm"
                        >
                          <Plus className="w-4 h-4 text-gray-600" />
                        </button>
                      </div>
                    </div>
                  </div>

                  <div className="bg-gradient-to-r from-green-50 to-emerald-50 border border-green-200 rounded-xl p-5">
                    <div className="flex justify-between items-center">
                      <div>
                        <span className="text-sm font-semibold text-green-700 block mb-1">Total Available</span>
                        <span className="text-xs text-green-600">Across all sizes</span>
                      </div>
                      <span className="text-3xl font-bold text-green-700">247</span>
                    </div>
                  </div>
                </div>

                {/* Size Variations Panel */}
                <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow">
                  <div className="flex items-center mb-5">
                    <div className="w-10 h-10 bg-purple-50 rounded-lg flex items-center justify-center mr-3">
                      <Layers className="w-5 h-5 text-purple-500" />
                    </div>
                    <h4 className="text-lg font-bold text-gray-900">Size Variations</h4>
                  </div>
                  
                  <div className="flex flex-wrap gap-3 mb-5">
                    {sizes.map((size) => (
                      <button
                        key={size}
                        onClick={() => toggleSize(size)}
                        className={`px-6 py-3 rounded-xl font-semibold transition-all ${
                          selectedSizes.includes(size)
                            ? 'bg-gradient-to-r from-purple-500 to-purple-600 text-white shadow-lg shadow-purple-200 scale-105'
                            : 'bg-gray-100 text-gray-700 hover:bg-gray-200 hover:scale-105'
                        }`}
                      >
                        {size}
                      </button>
                    ))}
                  </div>

                  <div className="bg-purple-50 border border-purple-200 rounded-xl p-4">
                    <p className="text-sm text-purple-900">
                      <span className="font-semibold">Selected Sizes:</span> {selectedSizes.join(', ')}
                    </p>
                  </div>
                </div>

              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}

// Navigation Item Component
function NavItem({ 
  icon: Icon, 
  label, 
  to,
  active = false 
}: { 
  icon: React.ElementType; 
  label: string; 
  to: string;
  active?: boolean; 
}) {
  return (
    <Link
      to={to}
      className={`w-full flex items-center px-4 py-3 rounded-xl text-left transition-all ${
        active 
          ? 'bg-gradient-to-r from-blue-50 to-purple-50 text-blue-600 border border-blue-200 shadow-sm' 
          : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
      }`}
    >
      <Icon className="w-5 h-5 mr-3" />
      <span className="font-semibold text-sm">{label}</span>
    </Link>
  );
}
