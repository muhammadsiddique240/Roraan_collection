import { useMemo, useState, useRef } from 'react';
import { Plus, Search, Pencil, Trash2, X, Upload, Loader2 } from 'lucide-react';
import { useStore } from '@/store/useStore';
import { Product, ProductStatus } from '@/types';

const sizeOptions = ['40/7', '41/8', '42/8.5', '43/9', '44/10', '45/11'];
const categoryOptions = ['Men', 'Women', 'Unisex'];
const conditionOptions = ['10/10', '9/10', '8/10', '7/10', '6/10', '5/10'];

const statusClass: Record<ProductStatus, string> = {
  AVAILABLE: 'bg-green-100 text-green-800',
  RESERVED: 'bg-yellow-100 text-yellow-800',
  SOLD: 'bg-gray-100 text-gray-800',
};

export default function Inventory() {
  const {
    products,
    isLoading,
    addProduct,
    updateProductStatus,
    editProduct,
    deleteProduct: removeProduct
  } = useStore();

  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [editingProductId, setEditingProductId] = useState<string | null>(null);
  const [productToDelete, setProductToDelete] = useState<Product | null>(null);
  const [search, setSearch] = useState('');
  const [brandFilter, setBrandFilter] = useState('All');
  const [conditionFilter, setConditionFilter] = useState('All');
  const [categoryFilter, setCategoryFilter] = useState('All');
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  const fileInputRef = useRef<HTMLInputElement>(null);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [galleryFiles, setGalleryFiles] = useState<File[]>([]);
  const [galleryPreviews, setGalleryPreviews] = useState<string[]>([]);

  const [formData, setFormData] = useState({
    title: '',
    brand: '',
    description: '',
    category: 'Men',
    condition: '9/10',
    price: '',
    originalPrice: '',
    buyingPrice: '',
    size: '41/8',
    isLatest: true,
    isNewArrival: true,
    isUnisex: false,
  });

  const brands = useMemo(() => ['All', ...Array.from(new Set(products.map((p) => p.brand)))], [products]);

  const filteredProducts = useMemo(
    () =>
      products.filter((p) => {
        const q = search.toLowerCase();
        const searchMatch = p.title.toLowerCase().includes(q) || p.brand.toLowerCase().includes(q) || p.id.toLowerCase().includes(q);
        const brandMatch = brandFilter === 'All' || p.brand === brandFilter;
        const conditionMatch = conditionFilter === 'All' || p.condition === conditionFilter;
        const categoryMatch = categoryFilter === 'All' || p.category === categoryFilter;
        return searchMatch && brandMatch && conditionMatch && categoryMatch;
      }),
    [products, search, brandFilter, conditionFilter, categoryFilter]
  );

  // Pagination logic
  const totalPages = Math.ceil(filteredProducts.length / itemsPerPage);
  const currentProducts = useMemo(() => {
    const startIdx = (currentPage - 1) * itemsPerPage;
    return filteredProducts.slice(startIdx, startIdx + itemsPerPage);
  }, [filteredProducts, currentPage]);

  // Reset page when filters change
  useMemo(() => setCurrentPage(1), [search, brandFilter, conditionFilter, categoryFilter]);

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    if (files.length === 0) return;

    // Set primary image if not set, otherwise add to gallery
    if (!imageFile) {
      const primary = files[0];
      setImageFile(primary);
      const reader = new FileReader();
      reader.onloadend = () => setImagePreview(reader.result as string);
      reader.readAsDataURL(primary);

      if (files.length > 1) {
        const others = files.slice(1, 4);
        setGalleryFiles(others);
        processGalleryFiles(others);
      }
    } else {
      const remainingSlots = 4 - 1 - galleryFiles.length;
      if (remainingSlots <= 0) return;
      const newFiles = files.slice(0, remainingSlots);
      const totalGallery = [...galleryFiles, ...newFiles];
      setGalleryFiles(totalGallery);
      processGalleryFiles(totalGallery);
    }
  };

  const processGalleryFiles = (files: File[]) => {
    const previews: string[] = [];
    files.forEach(file => {
      const reader = new FileReader();
      reader.onloadend = () => {
        previews.push(reader.result as string);
        if (previews.length === files.length) {
          setGalleryPreviews(previews);
        }
      };
      reader.readAsDataURL(file);
    });
  };

  const submitProduct = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (editingProductId) {
        await editProduct(editingProductId, {
          title: formData.title,
          brand: formData.brand,
          description: formData.description,
          category: formData.category,
          sizeEu: formData.size,
          condition: formData.condition,
          price: Number(formData.price),
          originalPrice: formData.originalPrice ? Number(formData.originalPrice) : undefined,
          buyingPrice: formData.buyingPrice ? Number(formData.buyingPrice) : 0,
          isLatest: formData.isLatest,
          isNewArrival: formData.isNewArrival,
          isUnisex: formData.isUnisex,
        });
      } else {
        await addProduct({
          title: formData.title,
          brand: formData.brand,
          category: formData.category,
          sizeEu: formData.size,
          condition: formData.condition,
          price: Number(formData.price),
          originalPrice: formData.originalPrice ? Number(formData.originalPrice) : undefined,
          buyingPrice: formData.buyingPrice ? Number(formData.buyingPrice) : 0,
          description: formData.description,
          imageFile: imageFile || undefined,
          galleryFiles: galleryFiles,
          isLatest: formData.isLatest,
          isNewArrival: formData.isNewArrival,
          isUnisex: formData.isUnisex,
        });
      }
      setIsDrawerOpen(false);
      resetForm();
    } catch (err) {
      alert('Operation failed. Check console for details.');
    }
  };

  const resetForm = () => {
    setEditingProductId(null);
    setImageFile(null);
    setImagePreview(null);
    setGalleryFiles([]);
    setGalleryPreviews([]);
    setFormData({
      title: '',
      brand: '',
      description: '',
      category: 'Men',
      condition: '9/10',
      price: '',
      originalPrice: '',
      buyingPrice: '',
      size: '41/8',
      isLatest: true,
      isNewArrival: true,
      isUnisex: false,
    });
  };

  if (isDrawerOpen) {
    return (
      <div className="w-full max-w-4xl mx-auto my-4 p-6 md:p-8 bg-white rounded-2xl shadow-xl border border-zinc-100 animate-in fade-in duration-300">
        <div className="flex items-center justify-between mb-4 border-b border-zinc-100 pb-4">
          <h2 className="text-xl font-bold text-gray-900">{editingProductId ? 'Edit Product' : 'Add New Item'}</h2>
          <button
            type="button"
            onClick={() => setIsDrawerOpen(false)}
            className="h-8 w-8 rounded-full hover:bg-zinc-100 flex items-center justify-center transition-colors text-zinc-500 hover:text-black"
          >
            <X size={18} />
          </button>
        </div>

        <form onSubmit={submitProduct} className="grid grid-cols-1 lg:grid-cols-12 gap-x-8 gap-y-6">
          {/* Left Column: Photos */}
          <div className="lg:col-span-4 space-y-3">
            <label className="text-[10px] font-bold uppercase tracking-widest text-zinc-500">Product Visuals</label>
            <div
              className={`relative group cursor-pointer h-48 bg-zinc-50 border-2 ${imagePreview ? 'border-solid border-transparent' : 'border-dashed border-zinc-200 hover:border-black'} rounded-xl flex flex-col items-center justify-center text-zinc-500 transition-all overflow-hidden`}
              onClick={() => !editingProductId && fileInputRef.current?.click()}
            >
              {imagePreview ? (
                <>
                  <img src={imagePreview} className="absolute inset-0 w-full h-full object-contain bg-zinc-100" />
                  <div className="absolute top-2 left-2 bg-black/70 text-[9px] text-white px-2 py-0.5 rounded font-black uppercase backdrop-blur-md">Main Photo</div>
                  {!editingProductId && (
                    <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity z-20">
                      <p className="text-white text-[10px] font-black uppercase flex items-center gap-1"><Upload size={14} /> Update</p>
                    </div>
                  )}
                </>
              ) : (
                <div className="text-center p-4 flex flex-col items-center">
                  <Plus size={24} className="mb-2 text-zinc-400 group-hover:text-black transition-colors" />
                  <p className="text-sm font-bold text-zinc-900 mb-1">Upload Photos</p>
                  <p className="text-[9px] text-zinc-500 uppercase tracking-widest font-black opacity-60">Max 4 • High Res</p>
                </div>
              )}
              <input type="file" ref={fileInputRef} onChange={handleImageChange} accept="image/*" multiple className="hidden" />
            </div>

            {galleryPreviews.length > 0 && (
              <div className="grid grid-cols-4 gap-2">
                {galleryPreviews.map((prev, i) => (
                  <div key={i} className="aspect-square rounded-lg overflow-hidden border border-zinc-200 relative">
                    <img src={prev} className="absolute inset-0 w-full h-full object-cover" />
                  </div>
                ))}
                {galleryPreviews.length < 3 && !editingProductId && (
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    className="aspect-square rounded-lg border-2 border-dashed border-zinc-200 flex items-center justify-center text-zinc-400 hover:border-black hover:text-black transition-all bg-zinc-50"
                  >
                    <Plus size={16} />
                  </button>
                )}
              </div>
            )}
          </div>

          {/* Right Column: Details */}
          <div className="lg:col-span-8 flex flex-col">
            <div className="grid grid-cols-2 gap-x-6 gap-y-3 flex-1">
              <div className="col-span-2 space-y-1">
                <label className="text-[10px] font-bold uppercase tracking-widest text-zinc-500">Product Title</label>
                <input required placeholder="e.g., Dunk Low Black/White" value={formData.title} onChange={(e) => setFormData((p) => ({ ...p, title: e.target.value }))} className="w-full px-3 py-2 text-sm border border-zinc-200 rounded-lg bg-zinc-50 focus:ring-1 focus:ring-black focus:border-black outline-none transition-all" />
              </div>

              {!editingProductId && (
                <>
                  <div className="space-y-1">
                    <label className="text-[10px] font-bold uppercase tracking-widest text-zinc-500">Brand</label>
                    <input required placeholder="Nike" value={formData.brand} onChange={(e) => setFormData((p) => ({ ...p, brand: e.target.value }))} className="w-full px-3 py-2 text-sm border border-zinc-200 rounded-lg bg-zinc-50 focus:ring-1 focus:ring-black focus:border-black outline-none transition-all" />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[10px] font-bold uppercase tracking-widest text-zinc-500">Category</label>
                    <select value={formData.category} onChange={(e) => setFormData((p) => ({ ...p, category: e.target.value }))} className="w-full px-3 py-2 text-sm border border-zinc-200 rounded-lg bg-zinc-50 focus:ring-1 focus:ring-black focus:border-black outline-none transition-all">
                      {categoryOptions.map((category) => (
                        <option key={category} value={category}>{category}</option>
                      ))}
                    </select>
                  </div>
                </>
              )}

              <div className="col-span-2 space-y-1">
                <label className="text-[10px] font-bold uppercase tracking-widest text-zinc-500">Description</label>
                <textarea required rows={2} placeholder="Tell us about the condition and history..." value={formData.description} onChange={(e) => setFormData((p) => ({ ...p, description: e.target.value }))} className="w-full px-3 py-2 text-sm border border-zinc-200 rounded-lg bg-zinc-50 focus:ring-1 focus:ring-black focus:border-black outline-none transition-all resize-none" />
              </div>

              <div className="space-y-1">
                <label className="text-[10px] font-bold uppercase tracking-widest text-zinc-500">Condition</label>
                <select value={formData.condition} onChange={(e) => setFormData((p) => ({ ...p, condition: e.target.value }))} className="w-full px-3 py-2 text-sm border border-zinc-200 rounded-lg bg-zinc-50 focus:ring-1 focus:ring-black focus:border-black outline-none transition-all">
                  {conditionOptions.map((c) => (
                    <option key={c} value={c}>{c}</option>
                  ))}
                </select>
              </div>
              <div className="space-y-1">
                <label className="text-[10px] font-bold uppercase tracking-widest text-zinc-500">Size (EU)</label>
                <select value={formData.size} onChange={(e) => setFormData((p) => ({ ...p, size: e.target.value }))} className="w-full px-3 py-2 text-sm border border-zinc-200 rounded-lg bg-zinc-50 focus:ring-1 focus:ring-black focus:border-black outline-none transition-all">
                  {sizeOptions.map((size) => (
                    <option key={size} value={size}>{size}</option>
                  ))}
                </select>
              </div>

              <div className="space-y-1">
                <label className="text-[10px] font-bold uppercase tracking-widest text-zinc-500">Sale Price (Rs)</label>
                <input required type="number" placeholder="45000" value={formData.price} onChange={(e) => setFormData((p) => ({ ...p, price: e.target.value }))} className="w-full px-3 py-2 border border-zinc-200 rounded-lg bg-zinc-50 font-bold focus:ring-1 focus:ring-black focus:border-black outline-none transition-all" />
              </div>
              <div className="space-y-1">
                <label className="text-[10px] font-bold uppercase tracking-widest text-zinc-500">Compare Price</label>
                <input type="number" placeholder="55000" value={formData.originalPrice} onChange={(e) => setFormData((p) => ({ ...p, originalPrice: e.target.value }))} className="w-full px-3 py-2 border border-zinc-200 rounded-lg bg-zinc-50 focus:ring-1 focus:ring-black focus:border-black outline-none transition-all" />
              </div>
              <div className="space-y-1">
                <label className="text-[10px] font-bold uppercase tracking-widest text-zinc-500">Buying Cost (Rs)</label>
                <input type="number" placeholder="30000" value={formData.buyingPrice} onChange={(e) => setFormData((p) => ({ ...p, buyingPrice: e.target.value }))} className="w-full px-3 py-2 border border-blue-200 rounded-lg bg-blue-50 focus:ring-1 focus:ring-black focus:border-black outline-none transition-all" />
              </div>

              <div className="col-span-2 flex flex-wrap gap-4 pt-2">
                <label className="flex items-center gap-2 cursor-pointer group">
                  <input type="checkbox" className="w-4 h-4 accent-black rounded border-zinc-300" checked={formData.isLatest} onChange={(e) => setFormData((p) => ({ ...p, isLatest: e.target.checked }))} />
                  <span className="text-[11px] font-bold text-zinc-700 uppercase cursor-pointer">Feature on Home</span>
                </label>
                <label className="flex items-center gap-2 cursor-pointer group">
                  <input type="checkbox" className="w-4 h-4 accent-black rounded border-zinc-300" checked={formData.isNewArrival} onChange={(e) => setFormData((p) => ({ ...p, isNewArrival: e.target.checked }))} />
                  <span className="text-[11px] font-bold text-zinc-700 uppercase cursor-pointer">New Drop Badge</span>
                </label>
                <label className="flex items-center gap-2 cursor-pointer group relative">
                  <input type="checkbox" className="w-4 h-4 accent-black rounded border-zinc-300" checked={formData.isUnisex} onChange={(e) => setFormData((p) => ({ ...p, isUnisex: e.target.checked }))} />
                  <span className="text-[11px] font-bold text-zinc-700 uppercase cursor-pointer">Unisex Shoe</span>
                  <span className="group-hover:opacity-100 opacity-0 transition-opacity absolute left-0 top-full mt-1 bg-black text-white text-[9px] px-2 py-1 rounded whitespace-nowrap z-10">Displays in both Men's and Women's sections</span>
                </label>
              </div>
            </div>

            <div className="flex items-center justify-end gap-3 mt-6 border-t border-zinc-100 pt-4">
              <button
                type="button"
                onClick={() => setIsDrawerOpen(false)}
                className="px-5 py-2.5 border border-zinc-200 text-zinc-700 font-semibold rounded-lg hover:bg-zinc-50 transition-colors text-sm"
              >
                Discard
              </button>
              <button
                type="submit"
                disabled={isLoading}
                className="px-6 py-2.5 bg-black text-white font-semibold rounded-lg hover:bg-zinc-800 shadow-md transition-all flex items-center justify-center gap-2 text-sm"
              >
                {isLoading && <Loader2 className="animate-spin" size={16} />}
                {editingProductId ? 'Save Changes' : 'Confirm & Drop Product'}
              </button>
            </div>
          </div>
        </form>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-gray-900">Inventory Management</h1>
          <p className="text-sm text-gray-500">Manage products with clean filtering and quick actions.</p>
        </div>
        <button
          onClick={() => {
            resetForm();
            setIsDrawerOpen(true);
          }}
          className="inline-flex items-center gap-2 rounded-lg bg-black text-white px-4 py-2 text-sm hover:bg-zinc-800 transition-colors"
        >
          <Plus size={16} />
          Add New Product
        </button>
      </div>

      <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-4">
        <div className="flex flex-col md:flex-row gap-3 mb-4">
          <div className="relative md:w-80">
            <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search products..."
              className="w-full rounded-lg border border-gray-200 bg-gray-50 pl-9 pr-3 py-2 text-sm focus:bg-white focus:ring-1 focus:ring-black outline-none"
            />
          </div>
          <select value={brandFilter} onChange={(e) => setBrandFilter(e.target.value)} className="rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm">
            {brands.map((brand) => (
              <option key={brand}>{brand}</option>
            ))}
          </select>
          <select value={conditionFilter} onChange={(e) => setConditionFilter(e.target.value)} className="rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm">
            <option>All</option>
            {conditionOptions.map((condition) => (
              <option key={condition} value={condition}>{condition}</option>
            ))}
          </select>
          <select value={categoryFilter} onChange={(e) => setCategoryFilter(e.target.value)} className="rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm">
            <option>All</option>
            {categoryOptions.map((cat) => (
              <option key={cat}>{cat}</option>
            ))}
          </select>
        </div>

        <div className="overflow-x-auto min-h-[300px]">
          {isLoading && products.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-20 text-gray-400">
              <Loader2 className="animate-spin mb-2" />
              <p>Fetching inventory...</p>
            </div>
          ) : (
            <table className="w-full text-left text-sm">
              <thead className="text-gray-500 border-b">
                <tr className="border-b bg-gray-50/50">
                  <th className="px-3 py-4 text-left text-[10px] font-bold uppercase tracking-widest text-gray-500">ID</th>
                  <th className="px-3 py-4 text-left text-[10px] font-bold uppercase tracking-widest text-gray-500">Product</th>
                  <th className="px-3 py-4 text-left text-[10px] font-bold uppercase tracking-widest text-gray-500">Brand</th>
                  <th className="px-3 py-4 text-left text-[10px] font-bold uppercase tracking-widest text-gray-500">Size</th>
                  <th className="px-3 py-4 text-left text-[10px] font-bold uppercase tracking-widest text-gray-500">Price</th>
                  <th className="px-3 py-4 text-left text-[10px] font-bold uppercase tracking-widest text-gray-500">Buying</th>
                  <th className="px-3 py-4 text-left text-[10px] font-bold uppercase tracking-widest text-gray-500">Status</th>
                  <th className="px-3 py-4 text-right text-[10px] font-bold uppercase tracking-widest text-gray-500">Actions</th>
                </tr>
              </thead>
              <tbody>
                {currentProducts.map((product) => (
                  <tr key={product.id} className="border-b last:border-b-0 hover:bg-gray-50/50 group">
                    <td className="px-3 py-4">
                      <span className="text-[11px] font-black font-mono text-zinc-900 bg-zinc-100 px-2 py-1 rounded border border-zinc-200">
                        {product.productCode || 'N/A'}
                      </span>
                    </td>
                    <td className="px-3 py-3">
                      <div className="flex items-center gap-3">
                        <div className="h-12 w-12 rounded-xl overflow-hidden bg-zinc-100 border border-zinc-200 relative">
                          <img src={product.images[0]} alt={product.title} className="absolute inset-0 h-full w-full object-cover group-hover:scale-110 transition-transform duration-500" />
                        </div>
                        <div className="max-w-[200px]">
                          <p className="font-bold text-gray-900 text-[13px] tracking-tight truncate">{product.title}</p>
                          <p className="text-[10px] text-zinc-400 font-bold uppercase tracking-widest mt-0.5">{product.category}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-3 py-3 font-semibold text-gray-700 text-sm">{product.brand}</td>
                    <td className="px-3 py-3">
                      <span className="text-xs font-bold text-gray-900 bg-gray-50 px-2 py-1 rounded border border-gray-100">EU {product.size.eu}</span>
                    </td>
                    <td className="px-3 py-3 font-black text-gray-900 text-sm">Rs.{product.price.toLocaleString()}</td>
                    <td className="px-3 py-3 font-medium text-blue-600 text-xs">Rs.{product.buyingPrice?.toLocaleString() || '0'}</td>
                    <td className="px-3 py-3">
                      <select
                        value={product.status}
                        onChange={(e) => updateProductStatus(product.id, e.target.value as ProductStatus)}
                        className={`rounded-md border border-gray-200 px-2 py-1 text-xs font-medium focus:ring-1 focus:ring-black outline-none ${statusClass[product.status]}`}
                      >
                        <option value="AVAILABLE">Available</option>
                        <option value="RESERVED">Reserved</option>
                        <option value="SOLD">Sold Out</option>
                      </select>
                    </td>
                    <td className="px-3 py-3">
                      <div className="flex justify-end gap-2">
                        <button
                          onClick={() => {
                            setEditingProductId(product.id);
                            setFormData({
                              title: product.title,
                              brand: product.brand,
                              description: product.description,
                              category: product.category,
                              condition: product.condition,
                              price: String(product.price),
                              originalPrice: String(product.originalPrice || ''),
                              buyingPrice: String(product.buyingPrice || ''),
                              size: product.size.eu,
                              isLatest: product.isLatest || false,
                              isNewArrival: product.isNewArrival || false,
                              isUnisex: product.isUnisex || false,
                            });
                            setImagePreview(product.images[0]);
                            setIsDrawerOpen(true);
                          }}
                          className="h-8 w-8 rounded-md border border-gray-200 grid place-items-center hover:bg-gray-50 transition-colors"
                        >
                          <Pencil size={14} />
                        </button>
                        <button
                          onClick={() => setProductToDelete(product)}
                          className="h-8 w-8 rounded-md border border-red-100 text-red-600 grid place-items-center hover:bg-red-50 transition-colors"
                        >
                          <Trash2 size={14} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>

        {/* Pagination Controls */}
        {!isLoading && totalPages > 1 && (
          <div className="mt-4 flex items-center justify-between border-t border-gray-100 pt-4 px-2">
            <span className="text-sm text-gray-500">
              Showing <span className="font-medium">{(currentPage - 1) * itemsPerPage + 1}</span> to <span className="font-medium">{Math.min(currentPage * itemsPerPage, filteredProducts.length)}</span> of <span className="font-medium">{filteredProducts.length}</span> results
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

      {/* Custom Delete Confirmation Modal */}
      {productToDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div
            className="absolute inset-0 bg-black/60 backdrop-blur-md animate-in fade-in duration-300"
            onClick={() => setProductToDelete(null)}
          />
          <div className="relative w-full max-w-sm bg-white shadow-2xl rounded-2xl p-6 text-center animate-in zoom-in-95 fade-in duration-300">
            <div className="mx-auto w-16 h-16 rounded-full bg-red-50 flex items-center justify-center mb-4 border border-red-100">
              <Trash2 size={28} className="text-red-500" />
            </div>

            <h3 className="text-xl font-bold text-gray-900 mb-2">Confirm Deletion</h3>
            <p className="text-sm text-gray-500 mb-6 px-4">
              Are you sure you want to delete <span className="font-bold text-gray-900">"{productToDelete.title}"</span>? This action cannot be undone.
            </p>

            <div className="flex gap-3">
              <button
                onClick={() => setProductToDelete(null)}
                className="flex-1 rounded-xl border border-gray-200 py-3 text-sm font-bold hover:bg-gray-50 transition-colors text-gray-600"
              >
                No, Keep it
              </button>
              <button
                onClick={async () => {
                  try {
                    await removeProduct(productToDelete.id);
                    setProductToDelete(null);
                  } catch (err) {
                    alert('Failed to delete product.');
                  }
                }}
                className="flex-1 rounded-xl bg-red-600 text-white py-3 text-sm font-bold hover:bg-red-700 transition-colors shadow-lg shadow-red-200"
              >
                Yes, Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
