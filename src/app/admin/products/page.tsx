'use client';

import React, { useState, useEffect } from 'react';
import {
  Package,
  Plus,
  Search,
  Filter,
  Eye,
  Edit,
  Trash2,
  Archive,
  CheckCircle,
  AlertCircle,
  Loader2,
  X,
  Image as ImageIcon,
  Upload,
  DollarSign,
  Barcode,
} from 'lucide-react';

export default function AdminProductsPage() {
  const [products, setProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalCount, setTotalCount] = useState(0);

  // Product Modal State (Create / Edit)
  const [showModal, setShowModal] = useState(false);
  const [editingProductId, setEditingProductId] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [modalError, setModalError] = useState<string | null>(null);
  const [categories, setCategories] = useState<any[]>([]);

  // Delete Confirmation Modal State
  const [deletingProduct, setDeletingProduct] = useState<any | null>(null);
  const [deleting, setDeleting] = useState(false);
  const [deleteError, setDeleteError] = useState<string | null>(null);

  const [formData, setFormData] = useState({
    name: '',
    slug: '',
    shortDesc: '',
    fullDesc: '',
    price: '',
    compareAtPrice: '',
    costPrice: '',
    sku: '',
    stockQuantity: '25',
    categoryId: '',
    status: 'ACTIVE',
    mediaUrl: '',
  });

  const fetchProducts = () => {
    setLoading(true);
    const query = new URLSearchParams();
    if (search) query.set('search', search);
    if (statusFilter) query.set('status', statusFilter);
    query.set('page', page.toString());
    query.set('limit', '15');

    fetch(`/api/admin/products?${query.toString()}`)
      .then((res) => res.json())
      .then((data) => {
        if (data.success) {
          setProducts(data.products);
          setTotalPages(data.totalPages);
          setTotalCount(data.total);
        }
        setLoading(false);
      })
      .catch(() => setLoading(false));
  };

  useEffect(() => {
    fetchProducts();
  }, [search, statusFilter, page]);

  useEffect(() => {
    fetch('/api/admin/categories')
      .then((res) => res.json())
      .then((data) => {
        if (data.success) {
          setCategories(data.categories);
        }
      });
  }, []);

  const resetForm = () => {
    setFormData({
      name: '',
      slug: '',
      shortDesc: '',
      fullDesc: '',
      price: '',
      compareAtPrice: '',
      costPrice: '',
      sku: '',
      stockQuantity: '25',
      categoryId: '',
      status: 'ACTIVE',
      mediaUrl: '',
    });
    setEditingProductId(null);
    setModalError(null);
  };

  const handleOpenCreateModal = () => {
    resetForm();
    setShowModal(true);
  };

  const handleOpenEditModal = (p: any) => {
    setModalError(null);
    setEditingProductId(p.id);
    setShowModal(true);

    // Fetch full product details
    fetch(`/api/admin/products/${p.id}`)
      .then((res) => res.json())
      .then((data) => {
        if (data.success && data.product) {
          const detail = data.product;
          setFormData({
            name: detail.name || '',
            slug: detail.slug || '',
            shortDesc: detail.shortDesc || '',
            fullDesc: detail.fullDesc || '',
            price: detail.price ? detail.price.toString() : '',
            compareAtPrice: detail.compareAtPrice ? detail.compareAtPrice.toString() : '',
            costPrice: '',
            sku: detail.sku || '',
            stockQuantity: detail.stockQuantity ? detail.stockQuantity.toString() : '0',
            categoryId: detail.categoryId || '',
            status: detail.status || 'ACTIVE',
            mediaUrl: detail.primaryImage || (detail.mediaUrls && detail.mediaUrls[0]) || '',
          });
        }
      })
      .catch(() => {
        setModalError('Failed to load product details.');
      });
  };

  const handleNameChange = (nameVal: string) => {
    const slugVal = nameVal
      .toLowerCase()
      .trim()
      .replace(/[^a-z0-9\s-]/g, '')
      .replace(/\s+/g, '-');
    setFormData((prev) => ({
      ...prev,
      name: nameVal,
      slug: slugVal,
      sku: prev.sku || `MQV-${Math.floor(100000 + Math.random() * 900000)}`,
    }));
  };

  // Image File Upload Handler (Converts file to base64 Data URL for instant preview & storage)
  const handleImageFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      setModalError('Please select a valid image file (PNG, JPG, WEBP, GIF).');
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      setModalError('Image size exceeds 5MB limit.');
      return;
    }

    const reader = new FileReader();
    reader.onload = (uploadEvent) => {
      const base64Data = uploadEvent.target?.result as string;
      if (base64Data) {
        setFormData((prev) => ({ ...prev, mediaUrl: base64Data }));
        setModalError(null);
      }
    };
    reader.readAsDataURL(file);
  };

  const handleSaveProduct = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setModalError(null);

    const isEdit = !!editingProductId;
    const endpoint = isEdit ? `/api/admin/products/${editingProductId}` : '/api/admin/products';
    const method = isEdit ? 'PUT' : 'POST';

    try {
      const res = await fetch(endpoint, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: formData.name,
          slug: formData.slug,
          shortDesc: formData.shortDesc,
          fullDesc: formData.fullDesc,
          price: parseFloat(formData.price),
          compareAtPrice: formData.compareAtPrice ? parseFloat(formData.compareAtPrice) : undefined,
          costPrice: formData.costPrice ? parseFloat(formData.costPrice) : undefined,
          sku: formData.sku,
          stockQuantity: parseInt(formData.stockQuantity, 10),
          categoryId: formData.categoryId || undefined,
          status: formData.status,
          mediaUrls: formData.mediaUrl ? [formData.mediaUrl] : [],
        }),
      });

      const data = await res.json();
      if (!data.success) {
        throw new Error(data.error || `Failed to ${isEdit ? 'update' : 'create'} product.`);
      }

      setShowModal(false);
      resetForm();
      fetchProducts();
    } catch (err: any) {
      setModalError(err.message || 'Operation failed.');
    } finally {
      setSaving(false);
    }
  };

  const handleStatusToggle = async (productId: string, newStatus: string) => {
    try {
      const res = await fetch(`/api/admin/products/${productId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus }),
      });
      const data = await res.json();
      if (data.success) {
        fetchProducts();
      }
    } catch (err) {
      // Error handling
    }
  };

  const handleDeleteProduct = async () => {
    if (!deletingProduct) return;
    setDeleting(true);
    setDeleteError(null);

    try {
      const res = await fetch(`/api/admin/products/${deletingProduct.id}`, {
        method: 'DELETE',
      });
      const data = await res.json();

      if (!data.success) {
        throw new Error(data.error || 'Failed to delete product.');
      }

      setDeletingProduct(null);
      fetchProducts();
    } catch (err: any) {
      setDeleteError(err.message || 'Deletion failed.');
    } finally {
      setDeleting(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header & Main CTA */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-white tracking-tight">Product Catalog Management</h1>
          <p className="text-sm text-slate-400">
            Create, update, upload images, and manage inventory statuses for store products.
          </p>
        </div>

        <button
          onClick={handleOpenCreateModal}
          className="py-2.5 px-4 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-400 hover:from-emerald-400 hover:to-teal-300 text-slate-950 font-bold text-xs shadow-lg shadow-emerald-500/20 flex items-center gap-2 self-start sm:self-auto transition-all cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          <span>Create New Product</span>
        </button>
      </div>

      {/* Filter Bar & Search */}
      <div className="bg-slate-900/80 border border-slate-800 p-4 rounded-2xl flex flex-col md:flex-row gap-4 items-center justify-between">
        <div className="relative w-full md:w-80">
          <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500" />
          <input
            type="text"
            placeholder="Search name or SKU..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-slate-100 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/50"
          />
        </div>

        <div className="flex items-center gap-2 w-full md:w-auto overflow-x-auto">
          {[
            { label: 'All Products', value: '' },
            { label: 'Active', value: 'ACTIVE' },
            { label: 'Draft', value: 'DRAFT' },
            { label: 'Archived', value: 'ARCHIVED' },
          ].map((st) => (
            <button
              key={st.value}
              onClick={() => {
                setStatusFilter(st.value);
                setPage(1);
              }}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all cursor-pointer ${
                statusFilter === st.value
                  ? 'bg-slate-800 text-emerald-400 border border-emerald-500/30'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              {st.label}
            </button>
          ))}
        </div>
      </div>

      {/* Products Table */}
      <div className="bg-slate-900/80 border border-slate-800 rounded-2xl overflow-hidden shadow-xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="text-slate-400 uppercase bg-slate-950/80 border-b border-slate-800">
              <tr>
                <th className="py-3.5 px-4">Product</th>
                <th className="py-3.5 px-4">SKU</th>
                <th className="py-3.5 px-4">Price</th>
                <th className="py-3.5 px-4">Total Stock</th>
                <th className="py-3.5 px-4">Status</th>
                <th className="py-3.5 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60">
              {loading ? (
                <tr>
                  <td colSpan={6} className="py-12 text-center text-slate-400">
                    <Loader2 className="w-6 h-6 animate-spin mx-auto text-emerald-400 mb-2" />
                    <span>Loading catalog...</span>
                  </td>
                </tr>
              ) : products.length > 0 ? (
                products.map((p) => (
                  <tr key={p.id} className="hover:bg-slate-800/40 transition-colors">
                    <td className="py-3.5 px-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-slate-950 border border-slate-800 overflow-hidden shrink-0 flex items-center justify-center text-slate-600">
                          {p.primaryImage ? (
                            <img src={p.primaryImage} alt={p.name} className="w-full h-full object-cover" />
                          ) : (
                            <ImageIcon className="w-5 h-5" />
                          )}
                        </div>
                        <div className="truncate">
                          <p className="font-bold text-slate-200 text-xs truncate">{p.name}</p>
                          <p className="text-[10px] text-slate-500">{p.categories.join(', ') || 'Uncategorized'}</p>
                        </div>
                      </div>
                    </td>
                    <td className="py-3.5 px-4 font-mono font-medium text-slate-300">{p.sku}</td>
                    <td className="py-3.5 px-4 font-bold text-white">৳{p.price.toFixed(2)}</td>
                    <td className="py-3.5 px-4">
                      <span
                        className={`font-semibold ${
                          p.totalStock === 0 ? 'text-rose-400' : p.totalStock <= 5 ? 'text-amber-400' : 'text-slate-300'
                        }`}
                      >
                        {p.totalStock} units
                      </span>
                    </td>
                    <td className="py-3.5 px-4">
                      <span
                        className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                          p.status === 'ACTIVE'
                            ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                            : p.status === 'DRAFT'
                            ? 'bg-amber-500/10 text-amber-400 border border-amber-500/20'
                            : 'bg-slate-800 text-slate-400'
                        }`}
                      >
                        {p.status}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        {/* Edit Button */}
                        <button
                          onClick={() => handleOpenEditModal(p)}
                          title="Edit Product"
                          className="p-1.5 text-slate-300 hover:text-emerald-400 hover:bg-slate-800 rounded-lg transition-colors cursor-pointer"
                        >
                          <Edit className="w-4 h-4" />
                        </button>

                        {/* Toggle Status Buttons */}
                        {p.status !== 'ACTIVE' && (
                          <button
                            onClick={() => handleStatusToggle(p.id, 'ACTIVE')}
                            title="Activate Product"
                            className="p-1.5 text-emerald-400 hover:bg-emerald-500/10 rounded-lg transition-colors cursor-pointer"
                          >
                            <CheckCircle className="w-4 h-4" />
                          </button>
                        )}
                        {p.status !== 'ARCHIVED' && (
                          <button
                            onClick={() => handleStatusToggle(p.id, 'ARCHIVED')}
                            title="Archive Product"
                            className="p-1.5 text-slate-400 hover:text-amber-400 hover:bg-amber-500/10 rounded-lg transition-colors cursor-pointer"
                          >
                            <Archive className="w-4 h-4" />
                          </button>
                        )}

                        {/* Delete Button */}
                        <button
                          onClick={() => setDeletingProduct(p)}
                          title="Delete Product"
                          className="p-1.5 text-slate-400 hover:text-rose-400 hover:bg-rose-500/10 rounded-lg transition-colors cursor-pointer"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={6} className="py-12 text-center text-slate-500 italic">
                    No products matching current filter criteria.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination Footer */}
        {totalPages > 1 && (
          <div className="p-4 border-t border-slate-800 flex items-center justify-between text-xs text-slate-400">
            <span>
              Showing Page {page} of {totalPages} ({totalCount} items)
            </span>
            <div className="flex gap-2">
              <button
                disabled={page === 1}
                onClick={() => setPage((p) => p - 1)}
                className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 disabled:opacity-40"
              >
                Previous
              </button>
              <button
                disabled={page === totalPages}
                onClick={() => setPage((p) => p + 1)}
                className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 disabled:opacity-40"
              >
                Next
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Create / Edit Product Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-slate-950/80 z-50 flex items-center justify-center p-4 backdrop-blur-sm">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl max-w-xl w-full max-h-[90vh] overflow-y-auto p-6 relative shadow-2xl">
            <button
              onClick={() => {
                setShowModal(false);
                resetForm();
              }}
              className="absolute top-4 right-4 text-slate-400 hover:text-white p-1"
            >
              <X className="w-5 h-5" />
            </button>

            <h2 className="text-xl font-bold text-white mb-1">
              {editingProductId ? 'Edit Product Details' : 'Create New Catalog Product'}
            </h2>
            <p className="text-xs text-slate-400 mb-6">
              {editingProductId
                ? 'Modify pricing, stock, category assignment, or product images.'
                : 'Add product details, variant SKU, price, category, and image.'}
            </p>

            {modalError && (
              <div className="mb-4 p-3 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-400 text-xs flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{modalError}</span>
              </div>
            )}

            <form onSubmit={handleSaveProduct} className="space-y-4 text-xs">
              <div>
                <label className="block font-semibold text-slate-300 uppercase tracking-wider mb-1">
                  Product Name *
                </label>
                <input
                  type="text"
                  required
                  value={formData.name}
                  onChange={(e) => handleNameChange(e.target.value)}
                  placeholder="e.g. MARQIVO Ultra Wireless Headset"
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-slate-100 focus:outline-none focus:ring-2 focus:ring-emerald-500/50"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block font-semibold text-slate-300 uppercase tracking-wider mb-1">
                    Slug *
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.slug}
                    onChange={(e) => setFormData({ ...formData, slug: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-slate-100 focus:outline-none focus:ring-2 focus:ring-emerald-500/50 font-mono text-[11px]"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-300 uppercase tracking-wider mb-1">
                    SKU *
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.sku}
                    onChange={(e) => setFormData({ ...formData, sku: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-slate-100 focus:outline-none focus:ring-2 focus:ring-emerald-500/50 font-mono text-[11px]"
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-4">
                <div>
                  <label className="block font-semibold text-slate-300 uppercase tracking-wider mb-1">
                    Selling Price (৳) *
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    required
                    value={formData.price}
                    onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                    placeholder="2500"
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-slate-100 focus:outline-none focus:ring-2 focus:ring-emerald-500/50"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-300 uppercase tracking-wider mb-1">
                    Compare Price (৳)
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    value={formData.compareAtPrice}
                    onChange={(e) => setFormData({ ...formData, compareAtPrice: e.target.value })}
                    placeholder="3000"
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-slate-100 focus:outline-none focus:ring-2 focus:ring-emerald-500/50"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-300 uppercase tracking-wider mb-1">
                    Initial Stock *
                  </label>
                  <input
                    type="number"
                    required
                    value={formData.stockQuantity}
                    onChange={(e) => setFormData({ ...formData, stockQuantity: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-slate-100 focus:outline-none focus:ring-2 focus:ring-emerald-500/50"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block font-semibold text-slate-300 uppercase tracking-wider mb-1">
                    Category *
                  </label>
                  <select
                    value={formData.categoryId}
                    onChange={(e) => setFormData({ ...formData, categoryId: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-slate-100 focus:outline-none focus:ring-2 focus:ring-emerald-500/50"
                  >
                    <option value="">Select Storefront Category...</option>
                    {categories.map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.name}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block font-semibold text-slate-300 uppercase tracking-wider mb-1">
                    Status
                  </label>
                  <select
                    value={formData.status}
                    onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-slate-100 focus:outline-none focus:ring-2 focus:ring-emerald-500/50"
                  >
                    <option value="ACTIVE">ACTIVE (Visible in Storefront)</option>
                    <option value="DRAFT">DRAFT (Hidden)</option>
                    <option value="ARCHIVED">ARCHIVED</option>
                  </select>
                </div>
              </div>

              {/* Product Image File Upload & Live Preview Section */}
              <div className="space-y-2 pt-2 border-t border-slate-800/80">
                <label className="block font-semibold text-slate-300 uppercase tracking-wider mb-1">
                  Product Image (File Upload or Image URL)
                </label>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 items-center">
                  {/* File Pick Area */}
                  <label className="flex flex-col items-center justify-center p-3 border-2 border-dashed border-slate-700 hover:border-emerald-500 rounded-xl cursor-pointer bg-slate-950/60 transition-colors group text-center">
                    <Upload className="w-5 h-5 text-slate-400 group-hover:text-emerald-400 mb-1" />
                    <span className="text-[11px] font-bold text-slate-300 group-hover:text-white">
                      Upload Local Image File
                    </span>
                    <span className="text-[9px] text-slate-500">PNG, JPG, WEBP up to 5MB</span>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleImageFileUpload}
                      className="hidden"
                    />
                  </label>

                  {/* Image Preview & Clear */}
                  <div className="flex items-center gap-3 p-2 bg-slate-950 border border-slate-800 rounded-xl min-h-[64px]">
                    {formData.mediaUrl ? (
                      <div className="relative w-12 h-12 rounded-lg bg-slate-900 overflow-hidden shrink-0 border border-slate-800">
                        <img src={formData.mediaUrl} alt="Preview" className="w-full h-full object-cover" />
                        <button
                          type="button"
                          onClick={() => setFormData({ ...formData, mediaUrl: '' })}
                          className="absolute top-0 right-0 bg-rose-600 text-white rounded-bl p-0.5"
                          title="Remove Image"
                        >
                          <X className="w-3 h-3" />
                        </button>
                      </div>
                    ) : (
                      <div className="w-12 h-12 rounded-lg bg-slate-900 border border-slate-800 flex items-center justify-center text-slate-600 shrink-0">
                        <ImageIcon className="w-6 h-6" />
                      </div>
                    )}
                    <div className="flex-1 overflow-hidden">
                      <p className="text-[11px] font-semibold text-slate-300 truncate">
                        {formData.mediaUrl ? 'Image Loaded' : 'No Image Selected'}
                      </p>
                      <p className="text-[9px] text-slate-500 truncate">
                        {formData.mediaUrl.startsWith('data:')
                          ? 'Local uploaded file (Base64)'
                          : formData.mediaUrl || 'Choose file or enter URL below'}
                      </p>
                    </div>
                  </div>
                </div>

                <input
                  type="url"
                  value={formData.mediaUrl.startsWith('data:') ? '' : formData.mediaUrl}
                  onChange={(e) => setFormData({ ...formData, mediaUrl: e.target.value })}
                  placeholder="Or paste external image URL (https://...)"
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-slate-100 focus:outline-none focus:ring-2 focus:ring-emerald-500/50 mt-1"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-300 uppercase tracking-wider mb-1">
                  Short Description
                </label>
                <textarea
                  rows={2}
                  value={formData.shortDesc}
                  onChange={(e) => setFormData({ ...formData, shortDesc: e.target.value })}
                  placeholder="Brief summary displayed on product cards..."
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-slate-100 focus:outline-none focus:ring-2 focus:ring-emerald-500/50"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-300 uppercase tracking-wider mb-1">
                  Full Detailed Description
                </label>
                <textarea
                  rows={3}
                  value={formData.fullDesc}
                  onChange={(e) => setFormData({ ...formData, fullDesc: e.target.value })}
                  placeholder="Comprehensive product specifications, features, and details..."
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-slate-100 focus:outline-none focus:ring-2 focus:ring-emerald-500/50"
                />
              </div>

              <div className="pt-4 flex justify-end gap-3 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => {
                    setShowModal(false);
                    resetForm();
                  }}
                  className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 font-semibold cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="px-5 py-2 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold flex items-center gap-2 disabled:opacity-50 cursor-pointer shadow-lg shadow-emerald-500/20"
                >
                  {saving && <Loader2 className="w-4 h-4 animate-spin" />}
                  <span>{editingProductId ? 'Update Product' : 'Save Product'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {deletingProduct && (
        <div className="fixed inset-0 bg-slate-950/80 z-50 flex items-center justify-center p-4 backdrop-blur-sm">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl max-w-md w-full p-6 relative shadow-2xl">
            <button
              onClick={() => setDeletingProduct(null)}
              className="absolute top-4 right-4 text-slate-400 hover:text-white p-1"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="flex items-center gap-3 text-rose-400 mb-4">
              <div className="p-3 rounded-full bg-rose-500/10 border border-rose-500/20">
                <Trash2 className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-white">Delete Product</h3>
                <p className="text-xs text-slate-400">This action cannot be undone.</p>
              </div>
            </div>

            <p className="text-xs text-slate-300 mb-6">
              Are you sure you want to permanently delete <strong className="text-white">"{deletingProduct.name}"</strong> (SKU: {deletingProduct.sku})?
            </p>

            {deleteError && (
              <div className="mb-4 p-3 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-400 text-xs">
                {deleteError}
              </div>
            )}

            <div className="flex justify-end gap-3">
              <button
                type="button"
                onClick={() => setDeletingProduct(null)}
                className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                disabled={deleting}
                onClick={handleDeleteProduct}
                className="px-5 py-2 rounded-xl bg-rose-600 hover:bg-rose-500 text-white text-xs font-bold flex items-center gap-2 disabled:opacity-50 cursor-pointer shadow-lg shadow-rose-600/20"
              >
                {deleting && <Loader2 className="w-4 h-4 animate-spin" />}
                <span>Delete Product</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
