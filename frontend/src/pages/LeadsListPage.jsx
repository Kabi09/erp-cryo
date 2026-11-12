import React, { useState, useEffect } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import api from '../services/api';
import {
  Search,
  Plus,
  Filter,
  Users2,
  Calendar,
  Phone,
  Mail,
  ChevronLeft,
  ChevronRight,
  ExternalLink,
  Flame
} from 'lucide-react';
import { Card, CardHeader, CardContent } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { Select } from '../components/ui/Select';
import { Badge } from '../components/ui/Badge';
import { Modal } from '../components/ui/Modal';
import { useToastStore } from '../store/useToastStore';
import dayjs from 'dayjs';

export const LeadsListPage = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [leads, setLeads] = useState([]);
  const [pagination, setPagination] = useState({ page: 1, pages: 1, total: 0 });
  const [loading, setLoading] = useState(true);

  // Filter states
  const [search, setSearch] = useState(searchParams.get('search') || '');
  const [stage, setStage] = useState(searchParams.get('stage') || '');
  const [status, setStatus] = useState(searchParams.get('status') || '');
  const [source, setSource] = useState(searchParams.get('source') || '');

  // New Lead Modal
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(searchParams.get('new') === 'true');
  const [creating, setCreating] = useState(false);
  const [newLeadForm, setNewLeadForm] = useState({
    companyName: '',
    contactName: '',
    email: '',
    phone: '',
    city: '',
    state: '',
    source: 'Email Enquiry',
    equipmentType: 'Liquid Nitrogen Storage Container',
    capacity: '',
    specificationDetails: '',
    estimatedBudget: '',
    expectedDeliveryTime: '4-6 Weeks',
  });

  const addToast = useToastStore((state) => state.addToast);

  const fetchLeads = async (page = 1) => {
    try {
      setLoading(true);
      const params = { page, limit: 10 };
      if (search) params.search = search;
      if (stage) params.stage = stage;
      if (status) params.status = status;
      if (source) params.source = source;

      const res = await api.get('/leads', { params });
      setLeads(res.data.data);
      setPagination(res.data.pagination);
    } catch (err) {
      addToast({
        type: 'error',
        title: 'Error',
        message: err.response?.data?.message || 'Failed to fetch leads',
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLeads(1);
  }, [stage, status, source]);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    fetchLeads(1);
  };

  const handleCreateLead = async (e) => {
    e.preventDefault();
    if (!newLeadForm.companyName || !newLeadForm.contactName || !newLeadForm.email || !newLeadForm.phone) {
      addToast({
        type: 'warning',
        title: 'Validation',
        message: 'Please fill in Company Name, Contact Person, Email, and Phone',
      });
      return;
    }

    try {
      setCreating(true);
      const payload = {
        companyName: newLeadForm.companyName,
        contactPerson: { name: newLeadForm.contactName },
        email: newLeadForm.email,
        phone: newLeadForm.phone,
        city: newLeadForm.city,
        state: newLeadForm.state,
        source: newLeadForm.source,
        requirements: {
          equipmentType: newLeadForm.equipmentType,
          capacity: newLeadForm.capacity,
          specificationDetails: newLeadForm.specificationDetails,
          estimatedBudget: Number(newLeadForm.estimatedBudget) || 0,
          expectedDeliveryTime: newLeadForm.expectedDeliveryTime,
        },
      };

      const res = await api.post('/leads', payload);
      addToast({
        type: 'success',
        title: 'Enquiry Created',
        message: `Lead ${res.data.data.leadNumber} created successfully!`,
      });
      setIsCreateModalOpen(false);
      setNewLeadForm({
        companyName: '',
        contactName: '',
        email: '',
        phone: '',
        city: '',
        state: '',
        source: 'Email Enquiry',
        equipmentType: 'Liquid Nitrogen Storage Container',
        capacity: '',
        specificationDetails: '',
        estimatedBudget: '',
        expectedDeliveryTime: '4-6 Weeks',
      });
      fetchLeads(1);
    } catch (err) {
      addToast({
        type: 'error',
        title: 'Creation Failed',
        message: err.response?.data?.message || 'Failed to create lead',
      });
    } finally {
      setCreating(false);
    }
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Top Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 bg-white p-5 rounded-2xl border border-slate-200 shadow-2xs">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl font-bold text-slate-900 tracking-tight">Leads & Enquiries</h1>
            <Badge variant="primary">{pagination.total} Records</Badge>
          </div>
          <p className="text-xs text-slate-500 mt-0.5">
            Stage 1 & 2: Record incoming requirements and qualify prospects for commercial quotations
          </p>
        </div>

        <Button icon={Plus} onClick={() => setIsCreateModalOpen(true)}>
          Create New Enquiry
        </Button>
      </div>

      {/* Filter and Search Bar */}
      <Card>
        <CardContent className="p-4">
          <form onSubmit={handleSearchSubmit} className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
            <div className="lg:col-span-2">
              <Input
                placeholder="Search lead ref, company, contact or equipment..."
                icon={Search}
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>

            <Select
              placeholder="All Workflow Stages"
              value={stage}
              onChange={(e) => setStage(e.target.value)}
            >
              <option value="ENQUIRY_RECEIVED">1. Enquiry Received</option>
              <option value="QUALIFICATION">2. Qualification</option>
              <option value="CUSTOMER_MAPPED">3. Customer Mapped</option>
              <option value="QUOTATION_DRAFTED">4. Quotation Drafted</option>
              <option value="CUSTOMER_REVIEW">5. Customer Review</option>
              <option value="QUOTATION_NEGOTIATION">6. Negotiation / Revision</option>
              <option value="QUOTATION_WON">7. Quotation Won</option>
              <option value="PI_ISSUED">8. Proforma Invoice Issued</option>
              <option value="PO_RECEIVED">9. Customer PO Received</option>
              <option value="PO_VERIFICATION">10. PO Verification</option>
              <option value="PO_AMENDMENT_PENDING">10b. PO Amendment Pending</option>
              <option value="SO_CREATED">11. Sales Order Created</option>
              <option value="PRODUCTION_HANDOVER">12. Handed Over to Production</option>
            </Select>

            <Select
              placeholder="All Statuses"
              value={status}
              onChange={(e) => setStatus(e.target.value)}
            >
              <option value="New">New</option>
              <option value="In Progress">In Progress</option>
              <option value="Qualified">Qualified</option>
              <option value="Disqualified">Disqualified</option>
              <option value="Quoted">Quoted</option>
              <option value="Won">Won</option>
              <option value="Lost">Lost</option>
              <option value="Closed">Closed</option>
            </Select>

            <div className="flex gap-2">
              <Button type="submit" variant="secondary" className="w-full">
                Apply Search
              </Button>
              {(search || stage || status || source) && (
                <Button
                  type="button"
                  variant="ghost"
                  onClick={() => {
                    setSearch('');
                    setStage('');
                    setStatus('');
                    setSource('');
                    fetchLeads(1);
                  }}
                >
                  Clear
                </Button>
              )}
            </div>
          </form>
        </CardContent>
      </Card>

      {/* Leads Table */}
      <Card>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-600">
            <thead className="bg-slate-50 border-b border-slate-200 text-[11px] font-semibold text-slate-700 uppercase tracking-wider">
              <tr>
                <th className="py-3 px-4">Lead Number</th>
                <th className="py-3 px-4">Company & Customer</th>
                <th className="py-3 px-4">Contact Person</th>
                <th className="py-3 px-4">Equipment Requirement</th>
                <th className="py-3 px-4">Source</th>
                <th className="py-3 px-4">Workflow Stage</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {loading ? (
                <tr>
                  <td colSpan="8" className="text-center py-12 text-slate-400">
                    <div className="flex justify-center items-center gap-2">
                      <div className="w-4 h-4 border-2 border-sky-600 border-t-transparent rounded-full animate-spin" />
                      <span>Loading leads...</span>
                    </div>
                  </td>
                </tr>
              ) : leads.length === 0 ? (
                <tr>
                  <td colSpan="8" className="text-center py-12 text-slate-400">
                    No leads found matching current criteria.
                  </td>
                </tr>
              ) : (
                leads.map((lead) => (
                  <tr key={lead._id} className="hover:bg-slate-50/80 transition group">
                    <td className="py-3.5 px-4 font-semibold text-slate-900">
                      <Link
                        to={`/leads/${lead._id}`}
                        className="text-sky-600 hover:text-sky-800 hover:underline flex items-center gap-1.5"
                      >
                        {lead.leadNumber}
                      </Link>
                      <div className="text-[10px] text-slate-400 font-normal">
                        {dayjs(lead.createdAt).format('DD MMM YYYY')}
                      </div>
                    </td>
                    <td className="py-3.5 px-4">
                      <div className="font-semibold text-slate-900">{lead.companyName}</div>
                      {lead.customer ? (
                        <div className="text-[10px] text-emerald-700 font-medium">
                          Mapped: {lead.customer.customerCode}
                        </div>
                      ) : (
                        <div className="text-[10px] text-amber-600">Pending Customer Mapping</div>
                      )}
                    </td>
                    <td className="py-3.5 px-4">
                      <div className="font-medium text-slate-800">{lead.contactPerson?.name || 'N/A'}</div>
                      <div className="text-[10px] text-slate-500">{lead.email}</div>
                    </td>
                    <td className="py-3.5 px-4 max-w-[200px]">
                      <div className="font-medium text-slate-900 truncate">
                        {lead.requirements?.equipmentType}
                      </div>
                      <div className="text-[10px] text-slate-500 truncate">
                        {lead.requirements?.capacity || 'Standard Spec'}
                      </div>
                    </td>
                    <td className="py-3.5 px-4">
                      <span className="text-slate-600 bg-slate-100 px-2 py-0.5 rounded text-[10px] font-medium">
                        {lead.source}
                      </span>
                    </td>
                    <td className="py-3.5 px-4">
                      <Badge variant="default" size="sm">
                        {lead.stage.replace(/_/g, ' ')}
                      </Badge>
                    </td>
                    <td className="py-3.5 px-4">
                      <Badge size="sm">{lead.status}</Badge>
                    </td>
                    <td className="py-3.5 px-4 text-right">
                      <Link to={`/leads/${lead._id}`}>
                        <Button variant="secondary" size="sm" icon={ExternalLink}>
                          Manage
                        </Button>
                      </Link>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination Footer */}
        {pagination.pages > 1 && (
          <div className="p-4 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
            <div>
              Showing page <span className="font-semibold text-slate-800">{pagination.page}</span> of{' '}
              <span className="font-semibold text-slate-800">{pagination.pages}</span> ({pagination.total} leads)
            </div>
            <div className="flex gap-2">
              <Button
                variant="secondary"
                size="sm"
                disabled={pagination.page <= 1}
                onClick={() => fetchLeads(pagination.page - 1)}
                icon={ChevronLeft}
              >
                Previous
              </Button>
              <Button
                variant="secondary"
                size="sm"
                disabled={pagination.page >= pagination.pages}
                onClick={() => fetchLeads(pagination.page + 1)}
              >
                Next <ChevronRight className="w-3.5 h-3.5 ml-1 inline" />
              </Button>
            </div>
          </div>
        )}
      </Card>

      {/* Create Enquiry Modal */}
      <Modal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        title="Create New Cryo Enquiry / Lead"
        subtitle="Stage 1: Register customer interest and equipment specification requirements"
        size="lg"
      >
        <form onSubmit={handleCreateLead} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Input
              label="Company / Institution Name"
              required
              placeholder="e.g. Indian Institute of Science (IISc)"
              value={newLeadForm.companyName}
              onChange={(e) => setNewLeadForm({ ...newLeadForm, companyName: e.target.value })}
            />

            <Input
              label="Contact Person Name"
              required
              placeholder="e.g. Dr. Rajesh Sharma"
              value={newLeadForm.contactName}
              onChange={(e) => setNewLeadForm({ ...newLeadForm, contactName: e.target.value })}
            />

            <Input
              label="Email Address"
              type="email"
              required
              placeholder="e.g. rsharma@iisc.ac.in"
              value={newLeadForm.email}
              onChange={(e) => setNewLeadForm({ ...newLeadForm, email: e.target.value })}
            />

            <Input
              label="Phone Number"
              required
              placeholder="e.g. +91 98400 12345"
              value={newLeadForm.phone}
              onChange={(e) => setNewLeadForm({ ...newLeadForm, phone: e.target.value })}
            />

            <Input
              label="City"
              placeholder="e.g. Bangalore"
              value={newLeadForm.city}
              onChange={(e) => setNewLeadForm({ ...newLeadForm, city: e.target.value })}
            />

            <Input
              label="State"
              placeholder="e.g. Karnataka"
              value={newLeadForm.state}
              onChange={(e) => setNewLeadForm({ ...newLeadForm, state: e.target.value })}
            />

            <Select
              label="Lead Source"
              value={newLeadForm.source}
              onChange={(e) => setNewLeadForm({ ...newLeadForm, source: e.target.value })}
            >
              <option value="Website">Website</option>
              <option value="Email Enquiry">Email Enquiry</option>
              <option value="Trade Show / Expo">Trade Show / Expo</option>
              <option value="Direct Referral">Direct Referral</option>
              <option value="Tender / Govt Portal">Tender / Govt Portal</option>
              <option value="Phone Call">Phone Call</option>
              <option value="Existing Customer">Existing Customer</option>
            </Select>

            <Select
              label="Equipment Type"
              value={newLeadForm.equipmentType}
              onChange={(e) => setNewLeadForm({ ...newLeadForm, equipmentType: e.target.value })}
            >
              <option value="Liquid Nitrogen Bio-Storage Container">Liquid Nitrogen Bio-Storage Container</option>
              <option value="Cryo Ultra-Low Temperature Freezer (-86°C)">Cryo Ultra-Low Temperature Freezer (-86°C)</option>
              <option value="Vacuum Jacketed Cryogenic Transfer Line">Vacuum Jacketed Cryogenic Transfer Line</option>
              <option value="Liquid Nitrogen Auto-Filling System">Liquid Nitrogen Auto-Filling System</option>
              <option value="Custom Cryogenic Tank / Cryostat">Custom Cryogenic Tank / Cryostat</option>
            </Select>

            <Input
              label="Capacity / Model Specs"
              placeholder="e.g. 50 Litres / 6 Canister Racks"
              value={newLeadForm.capacity}
              onChange={(e) => setNewLeadForm({ ...newLeadForm, capacity: e.target.value })}
            />

            <Input
              label="Estimated Budget (INR)"
              type="number"
              placeholder="e.g. 350000"
              value={newLeadForm.estimatedBudget}
              onChange={(e) => setNewLeadForm({ ...newLeadForm, estimatedBudget: e.target.value })}
            />
          </div>

          <div className="w-full">
            <label className="block text-xs font-semibold text-slate-700 mb-1.5">
              Specification Details & Special Customer Requirements
            </label>
            <textarea
              rows="3"
              className="block w-full text-sm rounded-lg border border-slate-300 p-3 focus:outline-none focus:ring-2 focus:ring-sky-500/20 focus:border-sky-500 text-slate-800"
              placeholder="Mention neck diameter, temperature tolerances, holding time requirements, or sensor specifications..."
              value={newLeadForm.specificationDetails}
              onChange={(e) => setNewLeadForm({ ...newLeadForm, specificationDetails: e.target.value })}
            />
          </div>

          <div className="flex justify-end gap-3 pt-3 border-t border-slate-100">
            <Button variant="secondary" onClick={() => setIsCreateModalOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" loading={creating}>
              Save & Create Lead
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

