import React, { useState, useEffect } from 'react';
import Card from '../../components/common/Card';
import Button from '../../components/common/Button';
import Badge from '../../components/common/Badge';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import EmptyState from '../../components/common/EmptyState';
import ConfirmDialog from '../../components/common/ConfirmDialog';
import ProductFormModal from './ProductFormModal';
import { Plus, Search, Edit2, Trash2, Box, Thermometer, ShieldCheck } from 'lucide-react';
import api from '../../services/api';

const ProductList = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('');

  const [formModalOpen, setFormModalOpen] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
  const [productToDelete, setProductToDelete] = useState(null);
  const [deleteLoading, setDeleteLoading] = useState(false);

  const fetchProducts = async () => {
    try {
      setLoading(true);
      const params = {};
      if (search) params.search = search;
      if (categoryFilter) params.category = categoryFilter;

      const res = await api.get('/products', { params });
      if (res.data.success) {
        setProducts(res.data.data);
      }
    } catch (err) {
      console.error('Failed to load products', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProducts();
  }, [categoryFilter]);

  const handleEdit = (prod) => {
    setSelectedProduct(prod);
    setFormModalOpen(true);
  };

  const handleCreate = () => {
    setSelectedProduct(null);
    setFormModalOpen(true);
  };

  const confirmDelete = (prod) => {
    setProductToDelete(prod);
    setDeleteConfirmOpen(true);
  };

  const executeDelete = async () => {
    if (!productToDelete) return;
    setDeleteLoading(true);
    try {
      await api.delete(`/products/${productToDelete._id}`);
      setDeleteConfirmOpen(false);
      setProductToDelete(null);
      fetchProducts();
    } catch (err) {
      alert(err.response?.data?.message || 'Error discontinuing product');
    } finally {
      setDeleteLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-slate-900">Equipment Catalog & Specifications Master</h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Cryogenic refrigeration equipment, blood bank systems, ULT deep freezers, and standard pricing.
          </p>
        </div>
        <Button variant="primary" icon={Plus} onClick={handleCreate}>
          New Product / Model
        </Button>
      </div>

      {/* Filters */}
      <Card noPadding>
        <div className="p-4 flex flex-col sm:flex-row items-center justify-between gap-3 bg-white rounded-xl">
          <div className="relative w-full sm:w-80">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search product name, model number, code..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && fetchProducts()}
              className="w-full pl-9 pr-3 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:bg-white focus:outline-none focus:border-brand-600"
            />
          </div>

          <div className="flex items-center gap-2 w-full sm:w-auto">
            <select
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
              className="text-xs px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:border-brand-600"
            >
              <option value="">All Categories</option>
              <option>Ultra-Low Temperature Freezers (-86°C)</option>
              <option>Blood Bank Refrigerators (4°C)</option>
              <option>Plasma Freezers (-40°C)</option>
              <option>Liquid Nitrogen Containers & Dewars</option>
              <option>Laboratory Freeze Dryers / Lyophilizers</option>
            </select>
            <Button size="sm" variant="secondary" onClick={fetchProducts}>
              Search
            </Button>
          </div>
        </div>
      </Card>

      {/* Products Grid / Table */}
      <Card noPadding>
        {loading ? (
          <LoadingSpinner text="Loading equipment catalog..." />
        ) : products.length === 0 ? (
          <EmptyState
            title="No equipment models found"
            description="Add your company's refrigeration or scientific equipment lines."
            actionLabel="Add Product"
            onAction={handleCreate}
          />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-200 text-[11px] font-bold text-slate-600 uppercase tracking-wider">
                  <th className="py-3 px-4">Code / Equipment Name</th>
                  <th className="py-3 px-4">Category & Model</th>
                  <th className="py-3 px-4">Technical Specs</th>
                  <th className="py-3 px-4">Selling Price</th>
                  <th className="py-3 px-4">Warranty</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-xs">
                {products.map((prod) => (
                  <tr key={prod._id} className="hover:bg-slate-50/80 transition-colors">
                    <td className="py-3.5 px-4">
                      <span className="font-bold text-brand-900 block">{prod.productId || 'CRY-PRD'}</span>
                      <span className="font-semibold text-slate-800">{prod.productName}</span>
                    </td>
                    <td className="py-3.5 px-4">
                      <span className="font-medium text-slate-700 block">{prod.category}</span>
                      <span className="text-[11px] font-mono text-slate-400">Model: {prod.modelNumber}</span>
                    </td>
                    <td className="py-3.5 px-4">
                      <div className="space-y-0.5 max-w-xs">
                        <span className="text-[11px] text-slate-600 flex items-center gap-1 font-medium">
                          <Thermometer className="w-3.5 h-3.5 text-blue-500" />
                          {prod.technicalSpecifications?.temperatureRange || 'Standard Temp'}
                        </span>
                        <span className="text-[11px] text-slate-400 block truncate">
                          {prod.technicalSpecifications?.controllerType || 'PLC Controller'}
                        </span>
                      </div>
                    </td>
                    <td className="py-3.5 px-4">
                      <span className="font-bold text-slate-900 block">
                        ₹{(prod.sellingPrice || 0).toLocaleString('en-IN')}
                      </span>
                      <span className="text-[10px] text-slate-400">Std Cost: ₹{(prod.standardCost || 0).toLocaleString('en-IN')}</span>
                    </td>
                    <td className="py-3.5 px-4">
                      <span className="text-slate-600 flex items-center gap-1">
                        <ShieldCheck className="w-3.5 h-3.5 text-emerald-500" /> {prod.warrantyMonths || 12} Months
                      </span>
                    </td>
                    <td className="py-3.5 px-4">
                      <Badge variant={prod.status === 'Active' ? 'success' : 'danger'}>
                        {prod.status}
                      </Badge>
                    </td>
                    <td className="py-3.5 px-4 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        <button
                          onClick={() => handleEdit(prod)}
                          title="Edit Equipment"
                          className="p-1.5 text-slate-500 hover:text-blue-600 hover:bg-slate-100 rounded-md transition-colors"
                        >
                          <Edit2 className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => confirmDelete(prod)}
                          title="Discontinue"
                          className="p-1.5 text-slate-500 hover:text-rose-600 hover:bg-slate-100 rounded-md transition-colors"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Card>

      <ProductFormModal
        isOpen={formModalOpen}
        onClose={() => setFormModalOpen(false)}
        product={selectedProduct}
        onSaved={fetchProducts}
      />

      <ConfirmDialog
        isOpen={deleteConfirmOpen}
        onClose={() => setDeleteConfirmOpen(false)}
        onConfirm={executeDelete}
        loading={deleteLoading}
        title="Discontinue Equipment Model"
        message={`Are you sure you want to discontinue model ${productToDelete?.modelNumber}? Existing quotes and orders will maintain their historical specifications.`}
      />
    </div>
  );
};

export default ProductList;
