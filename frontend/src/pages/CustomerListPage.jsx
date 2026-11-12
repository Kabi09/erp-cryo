import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../services/api';
import { useToastStore } from '../store/useToastStore';
import { Card, CardHeader, CardContent } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { Badge } from '../components/ui/Badge';
import { Modal } from '../components/ui/Modal';
import { QuotationModal } from '../components/workflow/QuotationModal';
import { PdfPreviewModal } from '../components/ui/PdfPreviewModal';
import {
  Building2,
  Search,
  Plus,
  Mail,
  Phone,
  ChevronLeft,
  ChevronRight,
  Edit2,
  Eye,
  FileSpreadsheet,
  FileCheck2,
  PackageCheck,
  Calendar,
  ExternalLink,
  MapPin,
  FileText
} from 'lucide-react';
import dayjs from 'dayjs';

export const CustomerListPage = () => {
  const [customers, setCustomers] = useState([]);
  const [pagination, setPagination] = useState({ page: 1, pages: 1, total: 0 });
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  // Create / Edit Modal
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

  // Customer 360° Drawer / Modal
  const [selected360Customer, setSelected360Customer] = useState(null);
  const [customerQuotes, setCustomerQuotes] = useState([]);
  const [customerPOs, setCustomerPOs] = useState([]);
  const [customerSOs, setCustomerSOs] = useState([]);
  const [loading360, setLoading360] = useState(false);

  // Create Quote directly for this customer
  const [createQuoteForCustomerId, setCreateQuoteForCustomerId] = useState(null);

  // PDF Preview
  const [previewPdfData, setPreviewPdfData] = useState(null);

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

  const handleOpen360 = async (cust) => {
    setSelected360Customer(cust);
    setLoading360(true);
    try {
      const [quotesRes, posRes, sosRes] = await Promise.all([
        api.get('/quotations', { params: { customerId: cust._id, limit: 20 } }),
        api.get('/purchase-orders', { params: { customerId: cust._id, limit: 20 } }),
        api.get('/sales-orders', { params: { customerId: cust._id, limit: 20 } }),
      ]);
      setCustomerQuotes(quotesRes.data.data || []);
      setCustomerPOs(posRes.data.data || []);
      setCustomerSOs(sosRes.data.data || []);
    } catch (err) {
      console.error(err);
      addToast({ type: 'warning', title: 'Notice', message: 'Could not load complete customer activity history' });
    } finally {
      setLoading360(false);
    }
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

  const formatINR = (n) => 'Rs. ' + Number(n || 0).toLocaleString('en-IN');

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 sm:gap-4 bg-white p-4 sm:p-5 rounded-2xl border border-slate-200 shadow-2xs">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-lg sm:text-xl font-bold text-slate-900 tracking-tight">Customer Master Registry</h1>
            <Badge variant="primary">{pagination.total} Accounts</Badge>
          </div>
          <p className="text-xs text-slate-500 mt-0.5">
            Stage 3: Approved commercial client directory, GSTIN profiles, registered facilities, and customer portfolios
          </p>
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto">
          <Button icon={Plus} onClick={handleOpenCreate} className="w-full sm:w-auto self-start sm:self-auto">
            New Customer Account
          </Button>
        </div>
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
        <div className="overflow-x-auto min-w-full">
          <table className="w-full text-left text-xs text-slate-600 min-w-[720px]">
            <thead className="bg-slate-50 border-b border-slate-200 text-slate-700 font-semibold text-[11px] uppercase tracking-wider">
              <tr>
                <th className="py-3 px-4">Customer Code</th>
                <th className="py-3 px-4">Company Name</th>
                <th className="py-3 px-4">Contact Officer</th>
                <th className="py-3 px-4">GSTIN & PAN</th>
                <th className="py-3 px-4">Registered Location</th>
                <th className="py-3 px-4">Sector / Industry</th>
                <th className="py-3 px-4 text-right">Direct Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {loading ? (
                <tr>
                  <td colSpan="7" className="text-center py-12 text-slate-400">
                    <div className="flex justify-center items-center gap-2">
                      <div className="w-4 h-4 border-2 border-sky-600 border-t-transparent rounded-full animate-spin" />
                      <span>Loading customer master accounts...</span>
                    </div>
                  </td>
                </tr>
              ) : customers.length === 0 ? (
                <tr>
                  <td colSpan="7" className="text-center py-12 text-slate-400">
                    No customer accounts found matching your query.
                  </td>
                </tr>
              ) : (
                customers.map((c) => (
                  <tr
                    key={c._id}
                    className="hover:bg-sky-50/40 transition cursor-pointer"
                    onClick={() => handleOpen360(c)}
                  >
                    <td className="py-3.5 px-4 font-mono font-bold text-sky-700">
                      <span className="hover:underline">{c.customerCode}</span>
                    </td>
                    <td className="py-3.5 px-4 font-bold text-slate-900">
                      <div>{c.companyName}</div>
                      <span className="text-[10px] text-slate-400 font-normal">
                        Added: {dayjs(c.createdAt).format('DD MMM YYYY')}
                      </span>
                    </td>
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
                    <td className="py-3.5 px-4 text-right" onClick={(e) => e.stopPropagation()}>
                      <div className="flex justify-end items-center gap-1.5">
                        {/* Direct Create Quotation button */}
                        <Button
                          variant="secondary"
                          size="sm"
                          icon={Plus}
                          className="text-sky-700 hover:text-sky-800 hover:bg-sky-50 border-sky-200"
                          onClick={() => setCreateQuoteForCustomerId(c._id)}
                          title="Generate New Quotation for this Customer"
                        >
                          Quote
                        </Button>

                        {/* Customer 360 View */}
                        <Button
                          variant="ghost"
                          size="sm"
                          icon={Eye}
                          onClick={() => handleOpen360(c)}
                          title="Open Customer 360° Portfolio"
                        >
                          360°
                        </Button>

                        {/* Edit Record */}
                        <Button
                          variant="secondary"
                          size="sm"
                          icon={Edit2}
                          onClick={() => handleOpenEdit(c)}
                          title="Edit Customer Profile"
                        />
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {pagination.pages > 1 && (
          <div className="p-4 border-t border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs text-slate-500">
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

      {/* Customer 360° Portfolio Modal */}
      {selected360Customer && (
        <Modal
          isOpen={!!selected360Customer}
          onClose={() => setSelected360Customer(null)}
          title={`Customer 360°: ${selected360Customer.companyName}`}
          subtitle={`Account Code: ${selected360Customer.customerCode} | Sector: ${selected360Customer.industry || 'Cryogenics'}`}
          size="xl"
        >
          <div className="space-y-6">
            {/* Header info cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              <div className="bg-slate-50 border border-slate-200 rounded-xl p-3.5 text-xs">
                <span className="text-slate-400 block font-medium">Primary Contact:</span>
                <span className="font-bold text-slate-900 text-sm mt-0.5 block">
                  {selected360Customer.contactPerson?.name || 'Authorized Officer'}
                </span>
                <span className="text-slate-500 block text-[11px]">
                  {selected360Customer.contactPerson?.designation || 'Purchase / Procurement'}
                </span>
                <div className="mt-2 text-slate-600 space-y-0.5 text-[11px]">
                  <div className="flex items-center gap-1.5">
                    <Mail className="w-3.5 h-3.5 text-slate-400" />
                    <span>{selected360Customer.email}</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <Phone className="w-3.5 h-3.5 text-slate-400" />
                    <span>{selected360Customer.phone}</span>
                  </div>
                </div>
              </div>

              <div className="bg-slate-50 border border-slate-200 rounded-xl p-3.5 text-xs">
                <span className="text-slate-400 block font-medium">Tax & Commercial Identity:</span>
                <div className="mt-1 space-y-1">
                  <div>
                    <span className="text-slate-400 text-[10px] block">GSTIN Number:</span>
                    <span className="font-mono font-bold text-slate-800">
                      {selected360Customer.gstin || 'Unregistered / Exempt'}
                    </span>
                  </div>
                  <div>
                    <span className="text-slate-400 text-[10px] block">PAN Number:</span>
                    <span className="font-mono font-medium text-slate-800">
                      {selected360Customer.pan || 'On Record'}
                    </span>
                  </div>
                </div>
              </div>

              <div className="bg-slate-50 border border-slate-200 rounded-xl p-3.5 text-xs">
                <div className="flex justify-between items-start">
                  <span className="text-slate-400 block font-medium">Registered Address:</span>
                  <MapPin className="w-3.5 h-3.5 text-slate-400" />
                </div>
                <p className="mt-1 text-slate-700 leading-relaxed text-[11px]">
                  {selected360Customer.billingAddress?.addressLine1 || 'Facility address on file'}
                  <br />
                  {selected360Customer.billingAddress?.city && `${selected360Customer.billingAddress.city}, `}
                  {selected360Customer.billingAddress?.state} {selected360Customer.billingAddress?.postalCode}
                </p>
                <div className="mt-3 flex justify-end">
                  <Button
                    size="sm"
                    icon={Plus}
                    onClick={() => {
                      setCreateQuoteForCustomerId(selected360Customer._id);
                    }}
                  >
                    Create Quotation
                  </Button>
                </div>
              </div>
            </div>

            {/* Linked Documents Tabs/Sections */}
            <div className="space-y-4">
              {/* Quotations Section */}
              <div className="border border-slate-200 rounded-xl overflow-hidden">
                <div className="bg-slate-50 px-4 py-2.5 border-b border-slate-200 flex justify-between items-center">
                  <div className="flex items-center gap-2">
                    <FileSpreadsheet className="w-4 h-4 text-sky-600" />
                    <span className="text-xs font-bold text-slate-800">
                      Commercial Quotations ({customerQuotes.length})
                    </span>
                  </div>
                  <Button
                    size="sm"
                    variant="ghost"
                    icon={Plus}
                    onClick={() => setCreateQuoteForCustomerId(selected360Customer._id)}
                  >
                    New Quote
                  </Button>
                </div>

                {loading360 ? (
                  <div className="p-6 text-center text-xs text-slate-400">Loading quotations...</div>
                ) : customerQuotes.length === 0 ? (
                  <div className="p-6 text-center text-xs text-slate-400">
                    No quotations generated for this customer account yet.
                  </div>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="w-full text-left text-xs text-slate-600">
                      <thead className="bg-slate-50/50 text-slate-700 font-semibold text-[10px] uppercase">
                        <tr>
                          <th className="py-2.5 px-3">Quotation No.</th>
                          <th className="py-2.5 px-3">Date</th>
                          <th className="py-2.5 px-3">Active Revision</th>
                          <th className="py-2.5 px-3 text-right">Grand Total (INR)</th>
                          <th className="py-2.5 px-3">Status</th>
                          <th className="py-2.5 px-3 text-right">PDF</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100">
                        {customerQuotes.map((q) => {
                          const rev = q.activeRevision || q.revisions?.[0];
                          return (
                            <tr key={q._id} className="hover:bg-slate-50/60">
                              <td className="py-2.5 px-3 font-mono font-bold text-sky-700">
                                {q.quotationNumber}
                              </td>
                              <td className="py-2.5 px-3 text-slate-500">
                                {dayjs(q.quotationDate).format('DD MMM YYYY')}
                              </td>
                              <td className="py-2.5 px-3">
                                <span className="bg-slate-100 px-2 py-0.5 rounded font-mono text-[10px]">
                                  {rev?.revisionLabel || 'Rev 0'}
                                </span>
                              </td>
                              <td className="py-2.5 px-3 text-right font-bold text-slate-900">
                                {formatINR(rev?.grandTotal)}
                              </td>
                              <td className="py-2.5 px-3">
                                <Badge size="sm">{q.status}</Badge>
                              </td>
                              <td className="py-2.5 px-3 text-right">
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  icon={Eye}
                                  onClick={() =>
                                    setPreviewPdfData({
                                      endpoint: `/quotations/${q._id}/pdf`,
                                      title: `Quotation ${q.quotationNumber}`,
                                      filename: `${q.quotationNumber}.pdf`,
                                    })
                                  }
                                >
                                  View PDF
                                </Button>
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>

              {/* Purchase Orders & Sales Orders Row */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                {/* POs */}
                <div className="border border-slate-200 rounded-xl overflow-hidden">
                  <div className="bg-slate-50 px-4 py-2.5 border-b border-slate-200 flex items-center gap-2">
                    <FileCheck2 className="w-4 h-4 text-emerald-600" />
                    <span className="text-xs font-bold text-slate-800">
                      Customer Purchase Orders ({customerPOs.length})
                    </span>
                  </div>
                  {customerPOs.length === 0 ? (
                    <div className="p-4 text-center text-xs text-slate-400">No POs received yet</div>
                  ) : (
                    <div className="divide-y divide-slate-100 text-xs">
                      {customerPOs.map((po) => (
                        <div key={po._id} className="p-3 flex items-center justify-between hover:bg-slate-50/50">
                          <div>
                            <span className="font-mono font-bold text-sky-700">{po.poNumber}</span>
                            <span className="text-[10px] text-slate-400 block">
                              Date: {dayjs(po.poDate).format('DD MMM YYYY')} | {po.itemSummary}
                            </span>
                          </div>
                          <div className="text-right">
                            <span className="font-bold text-slate-900 block">{formatINR(po.poValue)}</span>
                            <Badge size="sm">{po.verificationStatus}</Badge>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* SOs */}
                <div className="border border-slate-200 rounded-xl overflow-hidden">
                  <div className="bg-slate-50 px-4 py-2.5 border-b border-slate-200 flex items-center gap-2">
                    <PackageCheck className="w-4 h-4 text-sky-600" />
                    <span className="text-xs font-bold text-slate-800">
                      Confirmed Sales Orders ({customerSOs.length})
                    </span>
                  </div>
                  {customerSOs.length === 0 ? (
                    <div className="p-4 text-center text-xs text-slate-400">No sales orders confirmed yet</div>
                  ) : (
                    <div className="divide-y divide-slate-100 text-xs">
                      {customerSOs.map((so) => (
                        <div key={so._id} className="p-3 flex items-center justify-between hover:bg-slate-50/50">
                          <div>
                            <span className="font-mono font-bold text-sky-700">{so.soNumber}</span>
                            <span className="text-[10px] text-slate-400 block">
                              Dispatch: {dayjs(so.committedDispatchDate).format('DD MMM YYYY')}
                            </span>
                          </div>
                          <div className="text-right">
                            <span className="font-bold text-slate-900 block">{formatINR(so.grandTotal)}</span>
                            <Badge size="sm">{so.status}</Badge>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Footer */}
            <div className="flex justify-end gap-3 pt-3 border-t border-slate-100">
              <Button variant="secondary" onClick={() => setSelected360Customer(null)}>
                Close
              </Button>
            </div>
          </div>
        </Modal>
      )}

      {/* Create / Edit Customer Master Record Modal */}
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
              label="Industry / Domain"
              value={formData.industry}
              onChange={(e) => setFormData({ ...formData, industry: e.target.value })}
            />

            <Input
              label="Contact Person Name"
              value={formData.contactName}
              onChange={(e) => setFormData({ ...formData, contactName: e.target.value })}
            />

            <Input
              label="Designation / Department"
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
              label="Contact Phone"
              required
              value={formData.phone}
              onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
            />

            <Input
              label="GSTIN Number"
              placeholder="e.g. 33AABCC1234F1Z5"
              value={formData.gstin}
              onChange={(e) => setFormData({ ...formData, gstin: e.target.value })}
            />

            <Input
              label="PAN Number"
              placeholder="e.g. AABCC1234F"
              value={formData.pan}
              onChange={(e) => setFormData({ ...formData, pan: e.target.value })}
            />

            <div className="sm:col-span-2">
              <Input
                label="Registered Facility / Billing Address"
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

            <Input
              label="PIN Code"
              value={formData.postalCode}
              onChange={(e) => setFormData({ ...formData, postalCode: e.target.value })}
            />

            <div className="sm:col-span-2">
              <Input
                label="Special Commercial / Facility Notes"
                value={formData.notes}
                onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
              />
            </div>
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

      {/* Standalone Quotation Modal with Pre-selected Customer */}
      {createQuoteForCustomerId && (
        <QuotationModal
          isOpen={!!createQuoteForCustomerId}
          preselectedCustomerId={createQuoteForCustomerId}
          onClose={() => setCreateQuoteForCustomerId(null)}
          onSuccess={() => {
            setCreateQuoteForCustomerId(null);
            if (selected360Customer) {
              handleOpen360(selected360Customer);
            }
          }}
        />
      )}

      {/* PDF Preview Modal */}
      {previewPdfData && (
        <PdfPreviewModal
          isOpen={!!previewPdfData}
          onClose={() => setPreviewPdfData(null)}
          endpoint={previewPdfData.endpoint}
          title={previewPdfData.title}
          filename={previewPdfData.filename}
        />
      )}
    </div>
  );
};
