import React, { useState, useEffect } from 'react';
import api from '../services/api';
import { useToastStore } from '../store/useToastStore';
import { Card, CardHeader, CardContent } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { Badge } from '../components/ui/Badge';
import { Modal } from '../components/ui/Modal';
import { Building2, Search, Plus, Mail, Phone, ChevronLeft, ChevronRight, Edit2 } from 'lucide-react';
import dayjs from 'dayjs';

export const CustomerListPage = () => {
  const [customers, setCustomers] = useState([]);
  const [pagination, setPagination] = useState({ page: 1, pages: 1, total: 0 });
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  // Modal
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingCustomer, setEditingCustomer] = useState(null);
  const [formData, setFormData] = useState({
    companyName: '',
    contactName: '',
    designation: '',
    email: '',
    phone: '',
    gstin: '',
    pan: '',
    industry: 'Cryogenics / Research & Industrial',
    addressLine1: '',
    city: '',
    state: '',
    postalCode: '',
    notes: '',
  });
  const [submitting, setSubmitting] = useState(false);

  const addToast = useToastStore((state) => state.addToast);

  const fetchCustomers = async (page = 1) => {
    try {
      setLoading(true);
      const params = { page, limit: 10 };
      if (search) params.search = search;
      const res = await api.get('/customers', { params });
      setCustomers(res.data.data);
      setPagination(res.data.pagination);
    } catch (err) {
      addToast({ type: 'error', title: 'Error', message: 'Failed to fetch customer master records' });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCustomers(1);
  }, []);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    fetchCustomers(1);
  };

  const handleOpenCreate = () => {
    setEditingCustomer(null);
    setFormData({
      companyName: '',
      contactName: '',
      designation: '',
      email: '',
      phone: '',
      gstin: '',
      pan: '',
      industry: 'Cryogenics / Research & Industrial',
      addressLine1: '',
      city: '',
      state: '',
      postalCode: '',
      notes: '',
    });
    setIsModalOpen(true);
  };

  const handleOpenEdit = (cust) => {
    setEditingCustomer(cust);
    setFormData({
      companyName: cust.companyName || '',
      contactName: cust.contactPerson?.name || '',
      designation: cust.contactPerson?.designation || '',
      email: cust.email || '',
      phone: cust.phone || '',
      gstin: cust.gstin || '',
      pan: cust.pan || '',
      industry: cust.industry || 'Cryogenics / Research & Industrial',
      addressLine1: cust.billingAddress?.addressLine1 || '',
      city: cust.billingAddress?.city || '',
      state: cust.billingAddress?.state || '',
      postalCode: cust.billingAddress?.postalCode || '',
      notes: cust.notes || '',
    });
    setIsModalOpen(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.companyName || !formData.email || !formData.phone) {
      addToast({ type: 'warning', title: 'Validation', message: 'Company Name, Email, and Phone are required' });
      return;
    }

    try {
      setSubmitting(true);
      const payload = {
        companyName: formData.companyName,
        contactPerson: {
          name: formData.contactName,
          designation: formData.designation,
          email: formData.email,
          phone: formData.phone,
        },
        email: formData.email,
        phone: formData.phone,
        gstin: formData.gstin,
        pan: formData.pan,
        industry: formData.industry,
        billingAddress: {
          addressLine1: formData.addressLine1,
          city: formData.city,
          state: formData.state,
          postalCode: formData.postalCode,
          country: 'India',
        },
        notes: formData.notes,
      };

      if (editingCustomer) {
        await api.put(`/customers/${editingCustomer._id}`, payload);
        addToast({ type: 'success', title: 'Updated', message: 'Customer record updated successfully' });
      } else {
        await api.post('/customers', payload);
        addToast({ type: 'success', title: 'Created', message: 'New Customer Master record created' });
      }

      setIsModalOpen(false);
      fetchCustomers(1);
    } catch (err) {
      addToast({
        type: 'error',
        title: 'Error',
        message: err.response?.data?.message || 'Failed to save customer record',
      });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 bg-white p-5 rounded-2xl border border-slate-200 shadow-2xs">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl font-bold text-slate-900 tracking-tight">Customer Master Registry</h1>
            <Badge variant="primary">{pagination.total} Accounts</Badge>
          </div>
          <p className="text-xs text-slate-500 mt-0.5">
            Stage 3: Approved commercial client directory, GSTIN profiles, and registered facilities
          </p>
        </div>

        <Button icon={Plus} onClick={handleOpenCreate}>
          New Customer Record
        </Button>
      </div>

      {/* Search Bar */}
      <Card>
        <CardContent className="p-4">
          <form onSubmit={handleSearchSubmit} className="flex gap-3">
            <div className="flex-1">
              <Input
                placeholder="Search customer code, company name, contact, email or GSTIN..."
                icon={Search}
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>
            <Button type="submit" variant="secondary">
              Search
            </Button>
            {search && (
              <Button
                variant="ghost"
                onClick={() => {
                  setSearch('');
                  fetchCustomers(1);
                }}
              >
                Clear
              </Button>
            )}
          </form>
        </CardContent>
      </Card>

      {/* Table */}
      <Card>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-600">
            <thead className="bg-slate-50 border-b border-slate-200 text-slate-700 font-semibold text-[11px] uppercase tracking-wider">
              <tr>
                <th className="py-3 px-4">Customer Code</th>
                <th className="py-3 px-4">Company Name</th>
                <th className="py-3 px-4">Contact Officer</th>
                <th className="py-3 px-4">GSTIN & PAN</th>
                <th className="py-3 px-4">Registered Location</th>
                <th className="py-3 px-4">Sector / Industry</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {loading ? (
                <tr>
                  <td colSpan="7" className="text-center py-12 text-slate-400">
                    <div className="flex justify-center items-center gap-2">
                      <div className="w-4 h-4 border-2 border-sky-600 border-t-transparent rounded-full animate-spin" />
                      <span>Loading customers...</span>
                    </div>
                  </td>
                </tr>
              ) : customers.length === 0 ? (
                <tr>
                  <td colSpan="7" className="text-center py-12 text-slate-400">
                    No customer accounts found.
                  </td>
                </tr>
              ) : (
                customers.map((c) => (
                  <tr key={c._id} className="hover:bg-slate-50/80 transition">
                    <td className="py-3.5 px-4 font-mono font-bold text-sky-700">{c.customerCode}</td>
                    <td className="py-3.5 px-4 font-bold text-slate-900">{c.companyName}</td>
                    <td className="py-3.5 px-4">
                      <div className="font-semibold text-slate-800">{c.contactPerson?.name || 'N/A'}</div>
                      <div className="text-[10px] text-slate-400">{c.email} • {c.phone}</div>
                    </td>
                    <td className="py-3.5 px-4">
                      <div className="font-mono text-slate-800 font-medium">{c.gstin || 'Unregistered'}</div>
                      {c.pan && <div className="text-[10px] text-slate-400 font-mono">PAN: {c.pan}</div>}
                    </td>
                    <td className="py-3.5 px-4 text-slate-700">
                      {c.billingAddress?.city ? `${c.billingAddress.city}, ${c.billingAddress.state}` : 'On File'}
                    </td>
                    <td className="py-3.5 px-4">
                      <span className="bg-slate-100 text-slate-700 px-2 py-0.5 rounded text-[10px] font-medium">
                        {c.industry || 'Cryogenics'}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 text-right">
                      <Button
                        variant="secondary"
                        size="sm"
                        icon={Edit2}
                        onClick={() => handleOpenEdit(c)}
                      >
                        Edit
                      </Button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {pagination.pages > 1 && (
          <div className="p-4 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
            <div>
              Page <span className="font-semibold text-slate-800">{pagination.page}</span> of{' '}
              <span className="font-semibold text-slate-800">{pagination.pages}</span>
            </div>
            <div className="flex gap-2">
              <Button
                variant="secondary"
                size="sm"
                disabled={pagination.page <= 1}
                onClick={() => fetchCustomers(pagination.page - 1)}
                icon={ChevronLeft}
              >
                Previous
              </Button>
              <Button
                variant="secondary"
                size="sm"
                disabled={pagination.page >= pagination.pages}
                onClick={() => fetchCustomers(pagination.page + 1)}
              >
                Next <ChevronRight className="w-3.5 h-3.5 ml-1 inline" />
              </Button>
            </div>
          </div>
        )}
      </Card>

      {/* Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={editingCustomer ? `Edit Customer (${editingCustomer.customerCode})` : 'Create Customer Master Record'}
        subtitle="Maintain accurate company profile, GSTIN credentials, and billing address"
        size="lg"
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
            <Input
              label="Company / Institutional Name"
              required
              value={formData.companyName}
              onChange={(e) => setFormData({ ...formData, companyName: e.target.value })}
            />

            <Input
              label="Contact Person Name"
              required
              value={formData.contactName}
              onChange={(e) => setFormData({ ...formData, contactName: e.target.value })}
            />

            <Input
              label="Designation / Dept"
              value={formData.designation}
              onChange={(e) => setFormData({ ...formData, designation: e.target.value })}
            />

            <Input
              label="Official Email"
              type="email"
              required
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
            />

            <Input
              label="Phone Number"
              required
              value={formData.phone}
              onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
            />

            <Input
              label="GSTIN"
              placeholder="e.g. 33AAACC1234F1Z5"
              value={formData.gstin}
              onChange={(e) => setFormData({ ...formData, gstin: e.target.value })}
            />

            <Input
              label="PAN Number"
              placeholder="e.g. AAACC1234F"
              value={formData.pan}
              onChange={(e) => setFormData({ ...formData, pan: e.target.value })}
            />

            <Input
              label="Industry"
              value={formData.industry}
              onChange={(e) => setFormData({ ...formData, industry: e.target.value })}
            />

            <div className="sm:col-span-2">
              <Input
                label="Billing Address"
                value={formData.addressLine1}
                onChange={(e) => setFormData({ ...formData, addressLine1: e.target.value })}
              />
            </div>

            <Input
              label="City"
              value={formData.city}
              onChange={(e) => setFormData({ ...formData, city: e.target.value })}
            />

            <Input
              label="State"
              value={formData.state}
              onChange={(e) => setFormData({ ...formData, state: e.target.value })}
            />
          </div>

          <div className="flex justify-end gap-3 pt-3 border-t border-slate-100">
            <Button variant="secondary" onClick={() => setIsModalOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" loading={submitting}>
              {editingCustomer ? 'Update Customer Record' : 'Save Customer Master'}
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

