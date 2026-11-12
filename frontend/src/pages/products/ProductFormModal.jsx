import React, { useState, useEffect } from 'react';
import Modal from '../../components/common/Modal';
import Button from '../../components/common/Button';
import api from '../../services/api';

const categories = [
  'Ultra-Low Temperature Freezers (-86°C)',
  'Blood Bank Refrigerators (4°C)',
  'Plasma Freezers (-40°C)',
  'Cryo Chambers & Storage',
  'Liquid Nitrogen Containers & Dewars',
  'Laboratory Freeze Dryers / Lyophilizers',
  'Mortuary Chambers & Cabinets',
  'Biological & BOD Incubators',
  'Walk-in Cold Rooms',
  'Custom Cryogenic Systems'
];

const ProductFormModal = ({ isOpen, onClose, product, onSaved }) => {
  const [formData, setFormData] = useState({
    productName: '',
    category: 'Ultra-Low Temperature Freezers (-86°C)',
    modelNumber: '',
    description: '',
    unit: 'Nos',
    standardCost: 0,
    sellingPrice: 0,
    gstRate: 18,
    warrantyMonths: 24,
    technicalSpecifications: {
      temperatureRange: '-50°C to -86°C',
      capacityLitres: 400,
      chamberDimensions: '',
      externalDimensions: '',
      powerSupply: '230V AC, 50Hz, 1 Phase',
      refrigerant: 'CFC-Free Eco Friendly Cascade',
      sensorType: 'PT-100 RTD Class A',
      controllerType: 'Microprocessor with 7" Touchscreen PLC'
    }
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (product) {
      setFormData({
        ...product,
        technicalSpecifications: {
          ...product.technicalSpecifications
        }
      });
    } else {
      setFormData({
        productName: '',
        category: 'Ultra-Low Temperature Freezers (-86°C)',
        modelNumber: '',
        description: '',
        unit: 'Nos',
        standardCost: 0,
        sellingPrice: 0,
        gstRate: 18,
        warrantyMonths: 24,
        technicalSpecifications: {
          temperatureRange: '-50°C to -86°C',
          capacityLitres: 400,
          chamberDimensions: '',
          externalDimensions: '',
          powerSupply: '230V AC, 50Hz, 1 Phase',
          refrigerant: 'CFC-Free Eco Friendly Cascade',
          sensorType: 'PT-100 RTD Class A',
          controllerType: 'Microprocessor with 7" Touchscreen PLC'
        }
      });
    }
    setError('');
  }, [product, isOpen]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      if (product?._id) {
        await api.put(`/products/${product._id}`, formData);
      } else {
        await api.post('/products', formData);
      }
      onSaved();
      onClose();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to save product');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={product ? `Edit Equipment (${product.productId || product.modelNumber})` : 'New Equipment Master'}
      maxWidth="max-w-3xl"
    >
      <form onSubmit={handleSubmit} className="space-y-5">
        {error && (
          <div className="p-3 bg-rose-50 text-rose-700 border border-rose-200 text-xs rounded-lg font-medium">
            {error}
          </div>
        )}

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="sm:col-span-2">
            <label className="block text-xs font-semibold text-slate-700 mb-1">Product / Equipment Name *</label>
            <input
              type="text"
              required
              value={formData.productName}
              onChange={(e) => setFormData({ ...formData, productName: e.target.value })}
              className="w-full px-3 py-2 text-sm bg-slate-50 border border-slate-200 rounded-lg focus:bg-white focus:outline-none focus:border-brand-600"
              placeholder="e.g. Ultra-Low Temperature Freezer (-86°C) 400L"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Product Category *</label>
            <select
              value={formData.category}
              onChange={(e) => setFormData({ ...formData, category: e.target.value })}
              className="w-full px-3 py-2 text-sm bg-slate-50 border border-slate-200 rounded-lg focus:bg-white focus:outline-none focus:border-brand-600"
            >
              {categories.map((cat) => (
                <option key={cat} value={cat}>{cat}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Model Number *</label>
            <input
              type="text"
              required
              value={formData.modelNumber}
              onChange={(e) => setFormData({ ...formData, modelNumber: e.target.value })}
              className="w-full px-3 py-2 text-sm bg-slate-50 border border-slate-200 rounded-lg focus:bg-white focus:outline-none focus:border-brand-600"
              placeholder="e.g. CRYO-ULT-400V"
            />
          </div>

          <div className="sm:col-span-2">
            <label className="block text-xs font-semibold text-slate-700 mb-1">Equipment Description</label>
            <textarea
              rows={2}
              value={formData.description || ''}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              className="w-full px-3 py-2 text-sm bg-slate-50 border border-slate-200 rounded-lg focus:bg-white focus:outline-none focus:border-brand-600"
              placeholder="Key design details, applications, and certifications..."
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Selling Price (INR) *</label>
            <input
              type="number"
              required
              value={formData.sellingPrice}
              onChange={(e) => setFormData({ ...formData, sellingPrice: Number(e.target.value) })}
              className="w-full px-3 py-2 text-sm bg-slate-50 border border-slate-200 rounded-lg focus:bg-white focus:outline-none focus:border-brand-600"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Standard Cost Baseline (INR)</label>
            <input
              type="number"
              value={formData.standardCost}
              onChange={(e) => setFormData({ ...formData, standardCost: Number(e.target.value) })}
              className="w-full px-3 py-2 text-sm bg-slate-50 border border-slate-200 rounded-lg focus:bg-white focus:outline-none focus:border-brand-600"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Warranty (Months)</label>
            <input
              type="number"
              value={formData.warrantyMonths}
              onChange={(e) => setFormData({ ...formData, warrantyMonths: Number(e.target.value) })}
              className="w-full px-3 py-2 text-sm bg-slate-50 border border-slate-200 rounded-lg focus:bg-white focus:outline-none focus:border-brand-600"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">GST Rate (%)</label>
            <input
              type="number"
              value={formData.gstRate}
              onChange={(e) => setFormData({ ...formData, gstRate: Number(e.target.value) })}
              className="w-full px-3 py-2 text-sm bg-slate-50 border border-slate-200 rounded-lg focus:bg-white focus:outline-none focus:border-brand-600"
            />
          </div>
        </div>

        {/* Technical Specs */}
        <div className="border-t border-slate-200 pt-4">
          <h4 className="text-xs font-bold uppercase tracking-wider text-slate-700 mb-3">Technical Specifications</h4>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
            <div>
              <label className="block font-medium text-slate-600 mb-1">Temperature Operating Range</label>
              <input
                type="text"
                value={formData.technicalSpecifications.temperatureRange || ''}
                onChange={(e) => setFormData({
                  ...formData,
                  technicalSpecifications: { ...formData.technicalSpecifications, temperatureRange: e.target.value }
                })}
                placeholder="-50°C to -86°C"
                className="w-full px-2.5 py-1.5 bg-slate-50 border border-slate-200 rounded"
              />
            </div>
            <div>
              <label className="block font-medium text-slate-600 mb-1">Capacity (Litres)</label>
              <input
                type="number"
                value={formData.technicalSpecifications.capacityLitres || ''}
                onChange={(e) => setFormData({
                  ...formData,
                  technicalSpecifications: { ...formData.technicalSpecifications, capacityLitres: Number(e.target.value) }
                })}
                className="w-full px-2.5 py-1.5 bg-slate-50 border border-slate-200 rounded"
              />
            </div>
            <div>
              <label className="block font-medium text-slate-600 mb-1">Sensor Specifications</label>
              <input
                type="text"
                value={formData.technicalSpecifications.sensorType || ''}
                onChange={(e) => setFormData({
                  ...formData,
                  technicalSpecifications: { ...formData.technicalSpecifications, sensorType: e.target.value }
                })}
                placeholder="PT-100 RTD Class A"
                className="w-full px-2.5 py-1.5 bg-slate-50 border border-slate-200 rounded"
              />
            </div>
            <div>
              <label className="block font-medium text-slate-600 mb-1">Controller / Display</label>
              <input
                type="text"
                value={formData.technicalSpecifications.controllerType || ''}
                onChange={(e) => setFormData({
                  ...formData,
                  technicalSpecifications: { ...formData.technicalSpecifications, controllerType: e.target.value }
                })}
                placeholder="7-inch Colour Touchscreen PLC"
                className="w-full px-2.5 py-1.5 bg-slate-50 border border-slate-200 rounded"
              />
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="flex justify-end gap-3 pt-4 border-t border-slate-100">
          <Button variant="secondary" onClick={onClose} disabled={loading}>
            Cancel
          </Button>
          <Button type="submit" loading={loading}>
            {product ? 'Update Equipment' : 'Add to Catalog'}
          </Button>
        </div>
      </form>
    </Modal>
  );
};

export default ProductFormModal;
