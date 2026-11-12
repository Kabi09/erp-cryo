import React, { useState, useEffect } from 'react';
import { Modal } from '../ui/Modal';
import { Button } from '../ui/Button';
import { Input } from '../ui/Input';
import { Select } from '../ui/Select';
import { useToastStore } from '../../store/useToastStore';
import api from '../../services/api';
import { Building2, Link2, PlusCircle, Check } from 'lucide-react';

export const CustomerMappingModal = ({ isOpen, onClose, lead, onUpdated }) => {
  const [tab, setTab] = useState('existing'); // 'existing' | 'new'
  const [customers, setCustomers] = useState([]);
  const [selectedCustomerId, setSelectedCustomerId] = useState('');
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  // New Customer Form
  const [newCustForm, setNewCustForm] = useState({
    companyName: lead?.companyName || '',
    contactName: lead?.contactPerson?.name || '',
    designation: lead?.contactPerson?.designation || 'Purchase / Lab In-Charge',
    email: lead?.email || '',
    phone: lead?.phone || '',
    gstin: '',
    pan: '',
    addressLine1: '',
    city: lead?.city || '',
    state: lead?.state || '',
    postalCode: '',
    country: 'India',
    industry: 'Cryogenics / Research & Industrial',
  });

  const addToast = useToastStore((state) => state.addToast);

  useEffect(() => {
    if (isOpen) {
      fetchExistingCustomers();
      setNewCustForm({
        companyName: lead?.companyName || '',
        contactName: lead?.contactPerson?.name || '',
        designation: lead?.contactPerson?.designation || 'Purchase / Lab In-Charge',
        email: lead?.email || '',
        phone: lead?.phone || '',
        gstin: '',
        pan: '',
        addressLine1: '',
        city: lead?.city || '',
        state: lead?.state || '',
        postalCode: '',
        country: 'India',
        industry: 'Cryogenics / Research & Industrial',
      });
    }
  }, [isOpen, lead]);

  const fetchExistingCustomers = async () => {
    try {
      setLoading(true);
      const res = await api.get('/customers', { params: { limit: 50 } });
      setCustomers(res.data.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleLinkExisting = async (e) => {
    e.preventDefault();
    if (!selectedCustomerId) {
      addToast({
        type: 'warning',
        title: 'Selection Required',
        message: 'Please choose an existing customer from the list',
      });
      return;
    }

    try {
      setSubmitting(true);
      const res = await api.post('/customers/link-lead', {
        leadId: lead._id,
        customerId: selectedCustomerId,
      });

      addToast({
        type: 'success',
        title: 'Customer Mapped',
        message: res.data.message,
      });

      onUpdated();
      onClose();
    } catch (err) {
      addToast({
        type: 'error',
        title: 'Link Failed',
        message: err.response?.data?.message || 'Failed to link customer',
      });
    } finally {
      setSubmitting(false);
    }
  };

  const handleCreateNewCustomer = async (e) => {
    e.preventDefault();
    if (!newCustForm.companyName || !newCustForm.email || !newCustForm.phone) {
      addToast({
        type: 'warning',
        title: 'Validation',
        message: 'Company Name, Email, and Phone are required',
      });
      return;
    }

    try {
      setSubmitting(true);
      const payload = {
        leadId: lead._id,
        companyName: newCustForm.companyName,
        contactPerson: {
          name: newCustForm.contactName,
          designation: newCustForm.designation,
          email: newCustForm.email,
          phone: newCustForm.phone,
        },
        email: newCustForm.email,
        phone: newCustForm.phone,
        gstin: newCustForm.gstin,
        pan: newCustForm.pan,
        billingAddress: {
          addressLine1: newCustForm.addressLine1,
          city: newCustForm.city,
          state: newCustForm.state,
          postalCode: newCustForm.postalCode,
          country: newCustForm.country,
        },
        industry: newCustForm.industry,
      };

      const res = await api.post('/customers', payload);
      addToast({
        type: 'success',
        title: 'Customer Created & Mapped',
        message: `Customer ${res.data.data.customerCode} created and mapped to lead!`,
      });

      onUpdated();
      onClose();
    } catch (err) {
      addToast({
        type: 'error',
        title: 'Creation Failed',
        message: err.response?.data?.message || 'Failed to create customer',
      });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Customer Master Mapping"
      subtitle="Stage 3: Associate enquiry with a verified customer commercial account"
      size="lg"
    >
      <div className="space-y-4">
        {/* Tab selection */}
        <div className="flex border-b border-slate-200">
          <button
            type="button"
            onClick={() => setTab('existing')}
            className={`flex items-center gap-2 py-2 px-4 text-xs font-semibold border-b-2 transition -mb-px ${
              tab === 'existing'
                ? 'border-sky-600 text-sky-700 bg-sky-50/50 rounded-t-lg'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            <Link2 className="w-4 h-4" />
            Link to Existing Customer Master
          </button>
          <button
            type="button"
            onClick={() => setTab('new')}
            className={`flex items-center gap-2 py-2 px-4 text-xs font-semibold border-b-2 transition -mb-px ${
              tab === 'new'
                ? 'border-sky-600 text-sky-700 bg-sky-50/50 rounded-t-lg'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            <PlusCircle className="w-4 h-4" />
            Create New Customer Master
          </button>
        </div>

        {tab === 'existing' ? (
          <form onSubmit={handleLinkExisting} className="space-y-4 py-2">
            <p className="text-xs text-slate-600">
              Select an approved institutional or commercial customer account from the master registry to link with lead{' '}
              <span className="font-semibold text-slate-900">{lead?.leadNumber}</span>:
            </p>

            <Select
              label="Select Customer Account"
              required
              value={selectedCustomerId}
              onChange={(e) => setSelectedCustomerId(e.target.value)}
              placeholder="Search or select existing customer..."
            >
              {customers.map((c) => (
                <option key={c._id} value={c._id}>
                  {c.customerCode} — {c.companyName} ({c.contactPerson?.name || c.email})
                </option>
              ))}
            </Select>

            <div className="flex justify-end gap-3 pt-3 border-t border-slate-100">
              <Button variant="secondary" onClick={onClose}>
                Cancel
              </Button>
              <Button type="submit" loading={submitting} icon={Link2}>
                Map Existing Customer
              </Button>
            </div>
          </form>
        ) : (
          <form onSubmit={handleCreateNewCustomer} className="space-y-4 py-2">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
              <Input
                label="Company / Institutional Name"
                required
                value={newCustForm.companyName}
                onChange={(e) => setNewCustForm({ ...newCustForm, companyName: e.target.value })}
              />

              <Input
                label="Contact Person Name"
                required
                value={newCustForm.contactName}
                onChange={(e) => setNewCustForm({ ...newCustForm, contactName: e.target.value })}
              />

              <Input
                label="Designation / Department"
                value={newCustForm.designation}
                onChange={(e) => setNewCustForm({ ...newCustForm, designation: e.target.value })}
              />

              <Input
                label="Official Email Address"
                type="email"
                required
                value={newCustForm.email}
                onChange={(e) => setNewCustForm({ ...newCustForm, email: e.target.value })}
              />

              <Input
                label="Phone Number"
                required
                value={newCustForm.phone}
                onChange={(e) => setNewCustForm({ ...newCustForm, phone: e.target.value })}
              />

              <Input
                label="GSTIN (Goods & Services Tax ID)"
                placeholder="e.g. 33AAACC1234F1Z5"
                value={newCustForm.gstin}
                onChange={(e) => setNewCustForm({ ...newCustForm, gstin: e.target.value })}
              />

              <Input
                label="PAN Number"
                placeholder="e.g. AAACC1234F"
                value={newCustForm.pan}
                onChange={(e) => setNewCustForm({ ...newCustForm, pan: e.target.value })}
              />

              <Input
                label="Industry / Sector"
                value={newCustForm.industry}
                onChange={(e) => setNewCustForm({ ...newCustForm, industry: e.target.value })}
              />

              <div className="sm:col-span-2">
                <Input
                  label="Registered Billing Address"
                  placeholder="Plot/Street Address"
                  value={newCustForm.addressLine1}
                  onChange={(e) => setNewCustForm({ ...newCustForm, addressLine1: e.target.value })}
                />
              </div>

              <Input
                label="City"
                value={newCustForm.city}
                onChange={(e) => setNewCustForm({ ...newCustForm, city: e.target.value })}
              />

              <Input
                label="State"
                value={newCustForm.state}
                onChange={(e) => setNewCustForm({ ...newCustForm, state: e.target.value })}
              />
            </div>

            <div className="flex justify-end gap-3 pt-3 border-t border-slate-100">
              <Button variant="secondary" onClick={onClose}>
                Cancel
              </Button>
              <Button type="submit" loading={submitting} icon={PlusCircle}>
                Create & Map Customer
              </Button>
            </div>
          </form>
        )}
      </div>
    </Modal>
  );
};

