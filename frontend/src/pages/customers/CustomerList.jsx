import React, { useState, useEffect } from 'react';
import Card from '../../components/common/Card';
import Button from '../../components/common/Button';
import Badge from '../../components/common/Badge';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import EmptyState from '../../components/common/EmptyState';
import ConfirmDialog from '../../components/common/ConfirmDialog';
import CustomerFormModal from './CustomerFormModal';
import CustomerHistoryModal from './CustomerHistoryModal';
import { Plus, Search, Edit2, Trash2, History, Building2, Phone, Mail, MapPin } from 'lucide-react';
import api from '../../services/api';

const CustomerList = () => {
  const [customers, setCustomers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('');

  // Modals state
  const [formModalOpen, setFormModalOpen] = useState(false);
  const [selectedCustomer, setSelectedCustomer] = useState(null);
  const [historyModalOpen, setHistoryModalOpen] = useState(false);
  const [customerForHistory, setCustomerForHistory] = useState(null);
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
  const [customerToDelete, setCustomerToDelete] = useState(null);
  const [deleteLoading, setDeleteLoading] = useState(false);

  const fetchCustomers = async () => {
    try {
      setLoading(true);
      const params = {};
      if (search) params.search = search;
      if (categoryFilter) params.category = categoryFilter;

      const res = await api.get('/customers', { params });
      if (res.data.success) {
        setCustomers(res.data.data);
      }
    } catch (err) {
      console.error('Failed to load customers', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCustomers();
  }, [categoryFilter]);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    fetchCustomers();
  };

  const handleEdit = (cust) => {
    setSelectedCustomer(cust);
    setFormModalOpen(true);
  };

  const handleCreate = () => {
    setSelectedCustomer(null);
    setFormModalOpen(true);
  };

  const handleHistory = (cust) => {
    setCustomerForHistory(cust);
    setHistoryModalOpen(true);
  };

  const confirmDelete = (cust) => {
    setCustomerToDelete(cust);
    setDeleteConfirmOpen(true);
  };

  const executeDelete = async () => {
    if (!customerToDelete) return;
    setDeleteLoading(true);
    try {
      await api.delete(`/customers/${customerToDelete._id}`);
      setDeleteConfirmOpen(false);
      setCustomerToDelete(null);
      fetchCustomers();
    } catch (err) {
      alert(err.response?.data?.message || 'Error deleting customer');
    } finally {
      setDeleteLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-slate-900">Customer Master Management</h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Maintain institutional clients, hospital networks, contact registries & transaction history.
          </p>
        </div>
        <Button variant="primary" icon={Plus} onClick={handleCreate}>
          New Customer
        </Button>
      </div>

      {/* Filters & Search */}
      <Card noPadding>
        <div className="p-4 flex flex-col sm:flex-row items-center justify-between gap-3 bg-white rounded-xl">
          <form onSubmit={handleSearchSubmit} className="relative w-full sm:w-80">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search by company, code, GSTIN, phone..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-9 pr-3 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:bg-white focus:outline-none focus:border-brand-600"
            />
          </form>

          <div className="flex items-center gap-2 w-full sm:w-auto">
            <select
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
              className="text-xs px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:border-brand-600"
            >
              <option value="">All Categories</option>
              <option>Hospital & Healthcare</option>
              <option>Pharmaceutical</option>
              <option>Research & Biotech</option>
              <option>Blood Bank</option>
              <option>Government</option>
              <option>OEM / Dealer</option>
            </select>
            <Button size="sm" variant="secondary" onClick={fetchCustomers}>
              Refresh
            </Button>
          </div>
        </div>
      </Card>

      {/* Table / Content */}
      <Card noPadding>
        {loading ? (
          <LoadingSpinner text="Loading customer directory..." />
        ) : customers.length === 0 ? (
          <EmptyState
            title="No customers registered"
            description="Start building your client directory by creating your first corporate account."
            actionLabel="Add Customer"
            onAction={handleCreate}
          />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-200 text-[11px] font-bold text-slate-600 uppercase tracking-wider">
                  <th className="py-3 px-4">Code / Company</th>
                  <th className="py-3 px-4">Category / Industry</th>
                  <th className="py-3 px-4">Primary Contact</th>
                  <th className="py-3 px-4">GSTIN & Location</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-xs">
                {customers.map((cust) => {
                  const primaryContact = cust.contacts?.find((c) => c.isPrimary) || cust.contacts?.[0];
                  const defaultAddress = cust.billingAddresses?.[0];

                  return (
                    <tr key={cust._id} className="hover:bg-slate-50/80 transition-colors">
                      <td className="py-3.5 px-4">
                        <span className="font-bold text-brand-900 block">{cust.customerCode || 'CUST-AUTO'}</span>
                        <span className="font-semibold text-slate-800">{cust.companyName}</span>
                      </td>
                      <td className="py-3.5 px-4">
                        <span className="font-medium text-slate-700 block">{cust.customerCategory}</span>
                        <span className="text-[11px] text-slate-400">{cust.industry || 'General Science'}</span>
                      </td>
                      <td className="py-3.5 px-4">
                        <div className="space-y-0.5">
                          <p className="font-semibold text-slate-800">{primaryContact?.name || 'N/A'}</p>
                          <p className="text-slate-500 text-[11px] flex items-center gap-1">
                            <Phone className="w-3 h-3 text-slate-400" /> {primaryContact?.mobile || '-'}
                          </p>
                          {primaryContact?.email && (
                            <p className="text-slate-400 text-[11px] flex items-center gap-1">
                              <Mail className="w-3 h-3 text-slate-400" /> {primaryContact?.email}
                            </p>
                          )}
                        </div>
                      </td>
                      <td className="py-3.5 px-4">
                        <span className="font-mono text-slate-700 block text-[11px]">{cust.gstin || 'Unregistered'}</span>
                        <span className="text-[11px] text-slate-400 flex items-center gap-1 mt-0.5">
                          <MapPin className="w-3 h-3" /> {defaultAddress?.city || 'Chennai'}, {defaultAddress?.state || 'TN'}
                        </span>
                      </td>
                      <td className="py-3.5 px-4">
                        <Badge variant={cust.status === 'Active' ? 'success' : 'danger'}>
                          {cust.status}
                        </Badge>
                      </td>
                      <td className="py-3.5 px-4 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          <button
                            onClick={() => handleHistory(cust)}
                            title="Transaction History"
                            className="p-1.5 text-slate-500 hover:text-brand-900 hover:bg-slate-100 rounded-md transition-colors"
                          >
                            <History className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleEdit(cust)}
                            title="Edit Customer"
                            className="p-1.5 text-slate-500 hover:text-blue-600 hover:bg-slate-100 rounded-md transition-colors"
                          >
                            <Edit2 className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => confirmDelete(cust)}
                            title="Delete / Deactivate"
                            className="p-1.5 text-slate-500 hover:text-rose-600 hover:bg-slate-100 rounded-md transition-colors"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </Card>

      {/* Form Modal */}
      <CustomerFormModal
        isOpen={formModalOpen}
        onClose={() => setFormModalOpen(false)}
        customer={selectedCustomer}
        onSaved={fetchCustomers}
      />

      {/* History Modal */}
      <CustomerHistoryModal
        isOpen={historyModalOpen}
        onClose={() => setHistoryModalOpen(false)}
        customer={customerForHistory}
      />

      {/* Confirm Deletion */}
      <ConfirmDialog
        isOpen={deleteConfirmOpen}
        onClose={() => setDeleteConfirmOpen(false)}
        onConfirm={executeDelete}
        loading={deleteLoading}
        title="Delete Customer Account"
        message={`Are you sure you want to remove or deactivate ${customerToDelete?.companyName}? If transaction history exists, it will be marked Inactive.`}
      />
    </div>
  );
};

export default CustomerList;
