import React, { useState, useEffect } from 'react';
import Modal from '../../components/common/Modal';
import Button from '../../components/common/Button';
import { Plus, Trash2, Upload, Paperclip } from 'lucide-react';
import api from '../../services/api';

const enquirySources = ['Website', 'Phone', 'Email', 'WhatsApp', 'Referral', 'Direct Visit', 'Exhibition / Expo', 'Tender / Portal', 'Other'];
const priorities = ['High', 'Medium', 'Low'];

const EnquiryFormModal = ({ isOpen, onClose, enquiry, onSaved }) => {
  const [customers, setCustomers] = useState([]);
  const [productsCatalog, setProductsCatalog] = useState([]);
  const [staffUsers, setStaffUsers] = useState([]);

  const [formData, setFormData] = useState({
    enquiryDate: new Date().toISOString().split('T')[0],
    enquirySource: 'Email',
    priority: 'Medium',
    customer: '',
    companyName: '',
    contactPerson: '',
    designation: '',
    mobileNumber: '',
    email: '',
    city: 'Chennai',
    state: 'Tamil Nadu',
    billingAddress: '',
    shippingAddress: '',
    assignedTo: '',
    status: 'Submitted',
    products: [
      {
        product: '',
        productName: '',
        category: 'Ultra-Low Temperature Freezers (-86°C)',
        modelNumber: '',
        quantity: 1,
        unit: 'Nos',
        application: '',
        temperatureRequirements: '-86°C',
        technicalRequirements: '',
        sensorRequirements: 'PT-100 RTD',
        installationRequired: true,
        expectedBudget: 0,
        customerRemarks: ''
      }
    ],
    remarks: ''
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    const loadDropdownData = async () => {
      try {
        const [cRes, pRes, uRes] = await Promise.all([
          api.get('/customers'),
          api.get('/products'),
          api.get('/auth/users')
        ]);
        if (cRes.data.success) setCustomers(cRes.data.data);
        if (pRes.data.success) setProductsCatalog(pRes.data.data);
        if (uRes.data.success) setStaffUsers(uRes.data.data);
      } catch (err) {
        console.error(err);
      }
    };
    if (isOpen) {
      loadDropdownData();
    }
  }, [isOpen]);

  useEffect(() => {
    if (enquiry) {
      setFormData({
        ...enquiry,
        customer: enquiry.customer?._id || enquiry.customer || '',
        assignedTo: enquiry.assignedTo?._id || enquiry.assignedTo || '',
        enquiryDate: enquiry.enquiryDate ? new Date(enquiry.enquiryDate).toISOString().split('T')[0] : new Date().toISOString().split('T')[0]
      });
    } else {
      setFormData({
        enquiryDate: new Date().toISOString().split('T')[0],
        enquirySource: 'Email',
        priority: 'Medium',
        customer: '',
        companyName: '',
        contactPerson: '',
        designation: '',
        mobileNumber: '',
        email: '',
        city: 'Chennai',
        state: 'Tamil Nadu',
        billingAddress: '',
        shippingAddress: '',
        assignedTo: '',
        status: 'Submitted',
        products: [
          {
            product: '',
            productName: '',
            category: 'Ultra-Low Temperature Freezers (-86°C)',
            modelNumber: '',
            quantity: 1,
            unit: 'Nos',
            application: '',
            temperatureRequirements: '-86°C',
            technicalRequirements: '',
            sensorRequirements: 'PT-100 RTD',
            installationRequired: true,
            expectedBudget: 0,
            customerRemarks: ''
          }
        ],
        remarks: ''
      });
    }
    setError('');
  }, [enquiry, isOpen]);

  const handleCustomerSelect = (customerId) => {
    const selected = customers.find(c => c._id === customerId);
    if (selected) {
      const primaryContact = selected.contacts?.find(c => c.isPrimary) || selected.contacts?.[0];
      const defaultBilling = selected.billingAddresses?.[0];
      const defaultShipping = selected.shippingAddresses?.[0];

      setFormData(prev => ({
        ...prev,
        customer: selected._id,
        companyName: selected.companyName,
        contactPerson: primaryContact?.name || '',
        designation: primaryContact?.designation || '',
        mobileNumber: primaryContact?.mobile || '',
        email: primaryContact?.email || '',
        city: defaultBilling?.city || 'Chennai',
        state: defaultBilling?.state || 'Tamil Nadu',
        billingAddress: defaultBilling?.addressLine1 || '',
        shippingAddress: defaultShipping?.addressLine1 || defaultBilling?.addressLine1 || ''
      }));
    } else {
      setFormData(prev => ({ ...prev, customer: '' }));
    }
  };

  const handleProductSelect = (index, productId) => {
    const selected = productsCatalog.find(p => p._id === productId);
    const updated = [...formData.products];
    if (selected) {
      updated[index] = {
        ...updated[index],
        product: selected._id,
        productName: selected.productName,
        category: selected.category,
        modelNumber: selected.modelNumber,
        temperatureRequirements: selected.technicalSpecifications?.temperatureRange || '-86°C',
        sensorRequirements: selected.technicalSpecifications?.sensorType || 'PT-100 RTD',
        technicalRequirements: selected.description || '',
        expectedBudget: selected.sellingPrice || 0
      };
    } else {
      updated[index].product = '';
    }
    setFormData({ ...formData, products: updated });
  };

  const addProductRow = () => {
    setFormData({
      ...formData,
      products: [
        ...formData.products,
        {
          product: '',
          productName: '',
          category: 'Ultra-Low Temperature Freezers (-86°C)',
          modelNumber: '',
          quantity: 1,
          unit: 'Nos',
          application: '',
          temperatureRequirements: '-86°C',
          technicalRequirements: '',
          sensorRequirements: 'PT-100 RTD',
          installationRequired: true,
          expectedBudget: 0,
          customerRemarks: ''
        }
      ]
    });
  };

  const removeProductRow = (index) => {
    if (formData.products.length <= 1) return;
    setFormData({
      ...formData,
      products: formData.products.filter((_, i) => i !== index)
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      if (enquiry?._id) {
        await api.put(`/enquiries/${enquiry._id}`, formData);
      } else {
        await api.post('/enquiries', formData);
      }
      onSaved();
      onClose();
    } catch (err) {
      setError(err.response?.data?.message || 'Error saving enquiry');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={enquiry ? `Edit Enquiry (${enquiry.enquiryNumber})` : 'New Customer Enquiry Booking'}
      maxWidth="max-w-5xl"
    >
      <form onSubmit={handleSubmit} className="space-y-6">
        {error && (
          <div className="p-3 bg-rose-50 text-rose-700 border border-rose-200 text-xs rounded-lg font-medium">
            {error}
          </div>
        )}

        {/* Section 1: Enquiry Information */}
        <div>
          <h4 className="text-xs font-bold uppercase tracking-wider text-brand-900 mb-3 border-b border-slate-100 pb-1">
            1. Enquiry Information & Routing
          </h4>
          <div className="grid grid-cols-1 sm:grid-cols-4 gap-3 text-xs">
            <div>
              <label className="block font-semibold text-slate-700 mb-1">Enquiry Date *</label>
              <input
                type="date"
                required
                value={formData.enquiryDate}
                onChange={(e) => setFormData({ ...formData, enquiryDate: e.target.value })}
                className="w-full px-2.5 py-1.5 bg-slate-50 border border-slate-200 rounded"
              />
            </div>
            <div>
              <label className="block font-semibold text-slate-700 mb-1">Enquiry Source</label>
              <select
                value={formData.enquirySource}
                onChange={(e) => setFormData({ ...formData, enquirySource: e.target.value })}
                className="w-full px-2.5 py-1.5 bg-slate-50 border border-slate-200 rounded"
              >
                {enquirySources.map(s => <option key={s} value={s}>{s}</option>)}
              </select>
            </div>
            <div>
              <label className="block font-semibold text-slate-700 mb-1">Priority</label>
              <select
                value={formData.priority}
                onChange={(e) => setFormData({ ...formData, priority: e.target.value })}
                className="w-full px-2.5 py-1.5 bg-slate-50 border border-slate-200 rounded"
              >
                {priorities.map(p => <option key={p} value={p}>{p}</option>)}
              </select>
            </div>
            <div>
              <label className="block font-semibold text-slate-700 mb-1">Assigned Sales Officer</label>
              <select
                value={formData.assignedTo || ''}
                onChange={(e) => setFormData({ ...formData, assignedTo: e.target.value })}
                className="w-full px-2.5 py-1.5 bg-slate-50 border border-slate-200 rounded"
              >
                <option value="">Select Staff...</option>
                {staffUsers.map(u => (
                  <option key={u._id} value={u._id}>{u.name} ({u.role})</option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* Section 2: Customer Details */}
        <div>
          <div className="flex items-center justify-between mb-2 border-b border-slate-100 pb-1">
            <h4 className="text-xs font-bold uppercase tracking-wider text-brand-900">
              2. Customer Identification
            </h4>
            <span className="text-[11px] text-slate-500">Pick existing or enter new</span>
          </div>

          <div className="mb-3">
            <label className="block text-xs font-semibold text-slate-700 mb-1">Select Registered Customer</label>
            <select
              value={formData.customer}
              onChange={(e) => handleCustomerSelect(e.target.value)}
              className="w-full px-3 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded focus:bg-white"
            >
              <option value="">-- Or enter new client details below --</option>
              {customers.map(c => (
                <option key={c._id} value={c._id}>{c.companyName} ({c.customerCode || 'Registered'})</option>
              ))}
            </select>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
            <div>
              <label className="block font-semibold text-slate-700 mb-1">Company / Institution *</label>
              <input
                type="text"
                required
                value={formData.companyName}
                onChange={(e) => setFormData({ ...formData, companyName: e.target.value })}
                placeholder="Hospital / Pharma Name"
                className="w-full px-2.5 py-1.5 bg-slate-50 border border-slate-200 rounded"
              />
            </div>
            <div>
              <label className="block font-semibold text-slate-700 mb-1">Contact Person *</label>
              <input
                type="text"
                required
                value={formData.contactPerson}
                onChange={(e) => setFormData({ ...formData, contactPerson: e.target.value })}
                placeholder="Name"
                className="w-full px-2.5 py-1.5 bg-slate-50 border border-slate-200 rounded"
              />
            </div>
            <div>
              <label className="block font-semibold text-slate-700 mb-1">Designation</label>
              <input
                type="text"
                value={formData.designation || ''}
                onChange={(e) => setFormData({ ...formData, designation: e.target.value })}
                placeholder="e.g. Biomedical Head"
                className="w-full px-2.5 py-1.5 bg-slate-50 border border-slate-200 rounded"
              />
            </div>
            <div>
              <label className="block font-semibold text-slate-700 mb-1">Mobile Number *</label>
              <input
                type="tel"
                required
                value={formData.mobileNumber}
                onChange={(e) => setFormData({ ...formData, mobileNumber: e.target.value })}
                placeholder="+91..."
                className="w-full px-2.5 py-1.5 bg-slate-50 border border-slate-200 rounded"
              />
            </div>
            <div>
              <label className="block font-semibold text-slate-700 mb-1">Email Address *</label>
              <input
                type="email"
                required
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                placeholder="email@domain.com"
                className="w-full px-2.5 py-1.5 bg-slate-50 border border-slate-200 rounded"
              />
            </div>
            <div>
              <label className="block font-semibold text-slate-700 mb-1">City / Region</label>
              <input
                type="text"
                value={formData.city || ''}
                onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                placeholder="Chennai"
                className="w-full px-2.5 py-1.5 bg-slate-50 border border-slate-200 rounded"
              />
            </div>
          </div>
        </div>

        {/* Section 3: Dynamic Product Line Items */}
        <div>
          <div className="flex items-center justify-between mb-3 border-b border-slate-100 pb-1">
            <h4 className="text-xs font-bold uppercase tracking-wider text-brand-900">
              3. Equipment Requirements ({formData.products.length} Items)
            </h4>
            <Button size="sm" variant="outline" icon={Plus} onClick={addProductRow}>
              Add Product Line
            </Button>
          </div>

          <div className="space-y-4">
            {formData.products.map((item, idx) => (
              <div key={idx} className="p-3.5 bg-slate-50 border border-slate-200 rounded-xl space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-slate-700">Line Item #{idx + 1}</span>
                  {formData.products.length > 1 && (
                    <button
                      type="button"
                      onClick={() => removeProductRow(idx)}
                      className="text-rose-600 hover:text-rose-800 text-xs font-semibold flex items-center gap-1"
                    >
                      <Trash2 className="w-3.5 h-3.5" /> Remove Line
                    </button>
                  )}
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
                  <div className="sm:col-span-2">
                    <label className="block font-medium text-slate-600 mb-1">Select from Catalog</label>
                    <select
                      value={item.product || ''}
                      onChange={(e) => handleProductSelect(idx, e.target.value)}
                      className="w-full px-2.5 py-1.5 bg-white border border-slate-200 rounded"
                    >
                      <option value="">-- Custom Engineering / Manual Specification --</option>
                      {productsCatalog.map(p => (
                        <option key={p._id} value={p._id}>{p.productName} ({p.modelNumber})</option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block font-medium text-slate-600 mb-1">Equipment Name *</label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. Blood Bank Refrigerator"
                      value={item.productName}
                      onChange={(e) => {
                        const p = [...formData.products];
                        p[idx].productName = e.target.value;
                        setFormData({ ...formData, products: p });
                      }}
                      className="w-full px-2.5 py-1.5 bg-white border border-slate-200 rounded"
                    />
                  </div>

                  <div>
                    <label className="block font-medium text-slate-600 mb-1">Model / Specs Code</label>
                    <input
                      type="text"
                      placeholder="CRYO-..."
                      value={item.modelNumber || ''}
                      onChange={(e) => {
                        const p = [...formData.products];
                        p[idx].modelNumber = e.target.value;
                        setFormData({ ...formData, products: p });
                      }}
                      className="w-full px-2.5 py-1.5 bg-white border border-slate-200 rounded"
                    />
                  </div>

                  <div>
                    <label className="block font-medium text-slate-600 mb-1">Quantity *</label>
                    <input
                      type="number"
                      min={1}
                      required
                      value={item.quantity}
                      onChange={(e) => {
                        const p = [...formData.products];
                        p[idx].quantity = Number(e.target.value);
                        setFormData({ ...formData, products: p });
                      }}
                      className="w-full px-2.5 py-1.5 bg-white border border-slate-200 rounded"
                    />
                  </div>

                  <div>
                    <label className="block font-medium text-slate-600 mb-1">Operating Temperature Req</label>
                    <input
                      type="text"
                      placeholder="-86°C or 4°C"
                      value={item.temperatureRequirements || ''}
                      onChange={(e) => {
                        const p = [...formData.products];
                        p[idx].temperatureRequirements = e.target.value;
                        setFormData({ ...formData, products: p });
                      }}
                      className="w-full px-2.5 py-1.5 bg-white border border-slate-200 rounded"
                    />
                  </div>

                  <div className="sm:col-span-2">
                    <label className="block font-medium text-slate-600 mb-1">Application & Technical Remarks</label>
                    <input
                      type="text"
                      placeholder="e.g. Stem cell preservation, vaccine storage, WHO certified"
                      value={item.technicalRequirements || ''}
                      onChange={(e) => {
                        const p = [...formData.products];
                        p[idx].technicalRequirements = e.target.value;
                        setFormData({ ...formData, products: p });
                      }}
                      className="w-full px-2.5 py-1.5 bg-white border border-slate-200 rounded"
                    />
                  </div>

                  <div>
                    <label className="block font-medium text-slate-600 mb-1">Expected Budget (INR)</label>
                    <input
                      type="number"
                      value={item.expectedBudget || 0}
                      onChange={(e) => {
                        const p = [...formData.products];
                        p[idx].expectedBudget = Number(e.target.value);
                        setFormData({ ...formData, products: p });
                      }}
                      className="w-full px-2.5 py-1.5 bg-white border border-slate-200 rounded"
                    />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Section 4: General Remarks */}
        <div>
          <label className="block text-xs font-semibold text-slate-700 mb-1">General Commercial Notes / Tender Terms</label>
          <textarea
            rows={2}
            value={formData.remarks || ''}
            onChange={(e) => setFormData({ ...formData, remarks: e.target.value })}
            placeholder="Special commercial delivery periods, site challenges..."
            className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:bg-white"
          />
        </div>

        {/* Footer Actions */}
        <div className="flex justify-end gap-3 pt-4 border-t border-slate-100">
          <Button variant="secondary" onClick={onClose} disabled={loading}>
            Cancel
          </Button>
          <Button type="submit" loading={loading}>
            {enquiry ? 'Update Enquiry' : 'Submit Customer Enquiry'}
          </Button>
        </div>
      </form>
    </Modal>
  );
};

export default EnquiryFormModal;
