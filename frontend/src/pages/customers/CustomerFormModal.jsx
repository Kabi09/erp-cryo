import React, { useState, useEffect } from 'react';
import Modal from '../../components/common/Modal';
import Button from '../../components/common/Button';
import { Plus, Trash2 } from 'lucide-react';
import api from '../../services/api';

const CustomerFormModal = ({ isOpen, onClose, customer, onSaved }) => {
  const [formData, setFormData] = useState({
    companyName: '',
    customerCategory: 'Hospital & Healthcare',
    industry: '',
    website: '',
    gstin: '',
    pan: '',
    paymentTerms: '30% Advance, 70% against delivery/PI',
    contacts: [{ name: '', designation: '', email: '', mobile: '', isPrimary: true }],
    billingAddresses: [{ addressLine1: '', city: '', state: 'Tamil Nadu', pinCode: '', country: 'India', isDefault: true }],
    shippingAddresses: [{ addressLine1: '', city: '', state: 'Tamil Nadu', pinCode: '', country: 'India', isDefault: true }]
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (customer) {
      setFormData({
        ...customer,
        contacts: customer.contacts?.length ? customer.contacts : [{ name: '', designation: '', email: '', mobile: '', isPrimary: true }],
        billingAddresses: customer.billingAddresses?.length ? customer.billingAddresses : [{ addressLine1: '', city: '', state: '', pinCode: '', isDefault: true }],
        shippingAddresses: customer.shippingAddresses?.length ? customer.shippingAddresses : [{ addressLine1: '', city: '', state: '', pinCode: '', isDefault: true }]
      });
    } else {
      setFormData({
        companyName: '',
        customerCategory: 'Hospital & Healthcare',
        industry: '',
        website: '',
        gstin: '',
        pan: '',
        paymentTerms: '30% Advance, 70% against delivery/PI',
        contacts: [{ name: '', designation: '', email: '', mobile: '', isPrimary: true }],
        billingAddresses: [{ addressLine1: '', city: '', state: 'Tamil Nadu', pinCode: '', country: 'India', isDefault: true }],
        shippingAddresses: [{ addressLine1: '', city: '', state: 'Tamil Nadu', pinCode: '', country: 'India', isDefault: true }]
      });
    }
    setError('');
  }, [customer, isOpen]);

  const addContact = () => {
    setFormData({
      ...formData,
      contacts: [...formData.contacts, { name: '', designation: '', email: '', mobile: '', isPrimary: false }]
    });
  };

  const removeContact = (index) => {
    setFormData({
      ...formData,
      contacts: formData.contacts.filter((_, i) => i !== index)
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      if (customer?._id) {
        await api.put(`/customers/${customer._id}`, formData);
      } else {
        await api.post('/customers', formData);
      }
      onSaved();
      onClose();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to save customer');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={customer ? `Edit Customer (${customer.customerCode || customer.companyName})` : 'New Customer Master Entry'}
      maxWidth="max-w-4xl"
    >
      <form onSubmit={handleSubmit} className="space-y-6">
        {error && (
          <div className="p-3 bg-rose-50 text-rose-700 border border-rose-200 text-xs rounded-lg font-medium">
            {error}
          </div>
        )}

        {/* Basic Info */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="md:col-span-2">
            <label className="block text-xs font-semibold text-slate-700 mb-1">Company / Institution Name *</label>
            <input
              type="text"
              required
              value={formData.companyName}
              onChange={(e) => setFormData({ ...formData, companyName: e.target.value })}
              className="w-full px-3 py-2 text-sm bg-slate-50 border border-slate-200 rounded-lg focus:bg-white focus:outline-none focus:border-brand-600"
              placeholder="e.g. Apollo Hospitals / Biogen Labs"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Customer Category</label>
            <select
              value={formData.customerCategory}
              onChange={(e) => setFormData({ ...formData, customerCategory: e.target.value })}
              className="w-full px-3 py-2 text-sm bg-slate-50 border border-slate-200 rounded-lg focus:bg-white focus:outline-none focus:border-brand-600"
            >
              <option>Hospital & Healthcare</option>
              <option>Pharmaceutical</option>
              <option>Research & Biotech</option>
              <option>Blood Bank</option>
              <option>Educational / University</option>
              <option>Industrial</option>
              <option>Government</option>
              <option>OEM / Dealer</option>
              <option>Other</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Industry Segment</label>
            <input
              type="text"
              value={formData.industry || ''}
              onChange={(e) => setFormData({ ...formData, industry: e.target.value })}
              className="w-full px-3 py-2 text-sm bg-slate-50 border border-slate-200 rounded-lg focus:bg-white focus:outline-none focus:border-brand-600"
              placeholder="e.g. Clinical Research / Vaccine Storage"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">GSTIN Number</label>
            <input
              type="text"
              value={formData.gstin || ''}
              onChange={(e) => setFormData({ ...formData, gstin: e.target.value.toUpperCase() })}
              className="w-full px-3 py-2 text-sm uppercase bg-slate-50 border border-slate-200 rounded-lg focus:bg-white focus:outline-none focus:border-brand-600"
              placeholder="33AAACA1122B1Z8"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">PAN Card Number</label>
            <input
              type="text"
              value={formData.pan || ''}
              onChange={(e) => setFormData({ ...formData, pan: e.target.value.toUpperCase() })}
              className="w-full px-3 py-2 text-sm uppercase bg-slate-50 border border-slate-200 rounded-lg focus:bg-white focus:outline-none focus:border-brand-600"
              placeholder="AAACA1122B"
            />
          </div>

          <div className="md:col-span-2">
            <label className="block text-xs font-semibold text-slate-700 mb-1">Standard Payment Terms</label>
            <input
              type="text"
              value={formData.paymentTerms || ''}
              onChange={(e) => setFormData({ ...formData, paymentTerms: e.target.value })}
              className="w-full px-3 py-2 text-sm bg-slate-50 border border-slate-200 rounded-lg focus:bg-white focus:outline-none focus:border-brand-600"
              placeholder="30% Advance with PO, 70% before dispatch"
            />
          </div>
        </div>

        {/* Contact Persons */}
        <div className="border-t border-slate-200 pt-4">
          <div className="flex items-center justify-between mb-3">
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-700">Contact Persons</h4>
            <Button size="sm" variant="outline" icon={Plus} onClick={addContact}>
              Add Contact
            </Button>
          </div>

          <div className="space-y-3">
            {formData.contacts.map((contact, idx) => (
              <div key={idx} className="p-3 bg-slate-50 border border-slate-200 rounded-xl grid grid-cols-1 sm:grid-cols-4 gap-2 items-center">
                <input
                  type="text"
                  required
                  placeholder="Contact Name *"
                  value={contact.name}
                  onChange={(e) => {
                    const c = [...formData.contacts];
                    c[idx].name = e.target.value;
                    setFormData({ ...formData, contacts: c });
                  }}
                  className="px-2.5 py-1.5 text-xs bg-white border border-slate-200 rounded"
                />
                <input
                  type="text"
                  placeholder="Designation"
                  value={contact.designation || ''}
                  onChange={(e) => {
                    const c = [...formData.contacts];
                    c[idx].designation = e.target.value;
                    setFormData({ ...formData, contacts: c });
                  }}
                  className="px-2.5 py-1.5 text-xs bg-white border border-slate-200 rounded"
                />
                <input
                  type="email"
                  placeholder="Email"
                  value={contact.email || ''}
                  onChange={(e) => {
                    const c = [...formData.contacts];
                    c[idx].email = e.target.value;
                    setFormData({ ...formData, contacts: c });
                  }}
                  className="px-2.5 py-1.5 text-xs bg-white border border-slate-200 rounded"
                />
                <div className="flex items-center gap-2">
                  <input
                    type="tel"
                    required
                    placeholder="Mobile *"
                    value={contact.mobile}
                    onChange={(e) => {
                      const c = [...formData.contacts];
                      c[idx].mobile = e.target.value;
                      setFormData({ ...formData, contacts: c });
                    }}
                    className="w-full px-2.5 py-1.5 text-xs bg-white border border-slate-200 rounded"
                  />
                  {formData.contacts.length > 1 && (
                    <button
                      type="button"
                      onClick={() => removeContact(idx)}
                      className="p-1.5 text-slate-400 hover:text-rose-600 rounded"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Address Fields */}
        <div className="border-t border-slate-200 pt-4 grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-700 mb-2">Billing Address</h4>
            <textarea
              rows={3}
              value={formData.billingAddresses[0]?.addressLine1 || ''}
              onChange={(e) => {
                const b = [...formData.billingAddresses];
                b[0] = { ...b[0], addressLine1: e.target.value };
                setFormData({ ...formData, billingAddresses: b });
              }}
              placeholder="Street / Unit / Building address"
              className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-lg mb-2"
            />
            <div className="grid grid-cols-2 gap-2">
              <input
                type="text"
                placeholder="City"
                value={formData.billingAddresses[0]?.city || ''}
                onChange={(e) => {
                  const b = [...formData.billingAddresses];
                  b[0] = { ...b[0], city: e.target.value };
                  setFormData({ ...formData, billingAddresses: b });
                }}
                className="px-2.5 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded"
              />
              <input
                type="text"
                placeholder="PIN Code"
                value={formData.billingAddresses[0]?.pinCode || ''}
                onChange={(e) => {
                  const b = [...formData.billingAddresses];
                  b[0] = { ...b[0], pinCode: e.target.value };
                  setFormData({ ...formData, billingAddresses: b });
                }}
                className="px-2.5 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded"
              />
            </div>
          </div>

          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-700 mb-2">Shipping / Delivery Address</h4>
            <textarea
              rows={3}
              value={formData.shippingAddresses[0]?.addressLine1 || ''}
              onChange={(e) => {
                const s = [...formData.shippingAddresses];
                s[0] = { ...s[0], addressLine1: e.target.value };
                setFormData({ ...formData, shippingAddresses: s });
              }}
              placeholder="Factory / Lab site delivery address"
              className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-lg mb-2"
            />
            <div className="grid grid-cols-2 gap-2">
              <input
                type="text"
                placeholder="City"
                value={formData.shippingAddresses[0]?.city || ''}
                onChange={(e) => {
                  const s = [...formData.shippingAddresses];
                  s[0] = { ...s[0], city: e.target.value };
                  setFormData({ ...formData, shippingAddresses: s });
                }}
                className="px-2.5 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded"
              />
              <input
                type="text"
                placeholder="PIN Code"
                value={formData.shippingAddresses[0]?.pinCode || ''}
                onChange={(e) => {
                  const s = [...formData.shippingAddresses];
                  s[0] = { ...s[0], pinCode: e.target.value };
                  setFormData({ ...formData, shippingAddresses: s });
                }}
                className="px-2.5 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded"
              />
            </div>
          </div>
        </div>

        {/* Footer Actions */}
        <div className="flex justify-end gap-3 pt-4 border-t border-slate-100">
          <Button variant="secondary" onClick={onClose} disabled={loading}>
            Cancel
          </Button>
          <Button type="submit" loading={loading}>
            {customer ? 'Update Customer' : 'Save Customer Master'}
          </Button>
        </div>
      </form>
    </Modal>
  );
};

export default CustomerFormModal;
