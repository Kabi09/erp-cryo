import React, { useState, useEffect } from 'react';
import Card from '../../components/common/Card';
import Button from '../../components/common/Button';
import Badge from '../../components/common/Badge';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import EmptyState from '../../components/common/EmptyState';
import ConfirmDialog from '../../components/common/ConfirmDialog';
import EnquiryFormModal from './EnquiryFormModal';
import EnquiryDetailModal from './EnquiryDetailModal';
import EstimationFormModal from '../estimations/EstimationFormModal';
import FollowUpFormModal from '../followups/FollowUpFormModal';
import LeadDecisionModal from '../leads/LeadDecisionModal';
import { Plus, Search, Eye, Edit2, Trash2, Calculator, CalendarCheck, Award } from 'lucide-react';
import api from '../../services/api';

const EnquiryList = () => {
  const [enquiries, setEnquiries] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [priorityFilter, setPriorityFilter] = useState('');

  // Modals state
  const [formModalOpen, setFormModalOpen] = useState(false);
  const [detailModalOpen, setDetailModalOpen] = useState(false);
  const [selectedEnquiry, setSelectedEnquiry] = useState(null);
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
  const [enquiryToDelete, setEnquiryToDelete] = useState(null);

  // Workflow Quick Conversion Modals
  const [estimationModalOpen, setEstimationModalOpen] = useState(false);
  const [followUpModalOpen, setFollowUpModalOpen] = useState(false);
  const [leadModalOpen, setLeadModalOpen] = useState(false);

  const fetchEnquiries = async () => {
    try {
      setLoading(true);
      const params = {};
      if (search) params.search = search;
      if (statusFilter) params.status = statusFilter;
      if (priorityFilter) params.priority = priorityFilter;

      const res = await api.get('/enquiries', { params });
      if (res.data.success) {
        setEnquiries(res.data.data);
      }
    } catch (err) {
      console.error('Failed to load enquiries', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchEnquiries();
  }, [statusFilter, priorityFilter]);

  const handleCreate = () => {
    setSelectedEnquiry(null);
    setFormModalOpen(true);
  };

  const handleView = (enq) => {
    setSelectedEnquiry(enq);
    setDetailModalOpen(true);
  };

  const handleEdit = (enq) => {
    setSelectedEnquiry(enq);
    setFormModalOpen(true);
  };

  const handleConvertToEstimation = (enq) => {
    setSelectedEnquiry(enq);
    setEstimationModalOpen(true);
  };

  const handleAddFollowUp = (enq) => {
    setSelectedEnquiry(enq);
    setFollowUpModalOpen(true);
  };

  const handleLeadDecision = (enq) => {
    setSelectedEnquiry(enq);
    setLeadModalOpen(true);
  };

  const confirmDelete = (enq) => {
    setEnquiryToDelete(enq);
    setDeleteConfirmOpen(true);
  };

  const executeDelete = async () => {
    if (!enquiryToDelete) return;
    try {
      await api.delete(`/enquiries/${enquiryToDelete._id}`);
      setDeleteConfirmOpen(false);
      setEnquiryToDelete(null);
      fetchEnquiries();
    } catch (err) {
      alert(err.response?.data?.message || 'Error deleting enquiry');
    }
  };

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-slate-900">Customer Enquiry Management</h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Log incoming RFQs, capture technical refrigeration specifications, and track conversion funnel.
          </p>
        </div>
        <Button variant="primary" icon={Plus} onClick={handleCreate}>
          New Customer Enquiry
        </Button>
      </div>

      {/* Filters & Search */}
      <Card noPadding>
        <div className="p-4 flex flex-col sm:flex-row items-center justify-between gap-3 bg-white rounded-xl">
          <div className="relative w-full sm:w-80">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search enquiry no, customer, contact..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && fetchEnquiries()}
              className="w-full pl-9 pr-3 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:bg-white focus:outline-none focus:border-brand-600"
            />
          </div>

          <div className="flex flex-wrap items-center gap-2 w-full sm:w-auto">
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="text-xs px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:border-brand-600"
            >
              <option value="">All Statuses</option>
              <option>Submitted</option>
              <option>Under Estimation</option>
              <option>Estimation Completed</option>
              <option>Follow-up</option>
              <option>Won</option>
              <option>Lost</option>
              <option>Quotation Sent</option>
              <option>Sales Order Created</option>
              <option>Closed</option>
            </select>

            <select
              value={priorityFilter}
              onChange={(e) => setPriorityFilter(e.target.value)}
              className="text-xs px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:border-brand-600"
            >
              <option value="">All Priorities</option>
              <option>High</option>
              <option>Medium</option>
              <option>Low</option>
            </select>

            <Button size="sm" variant="secondary" onClick={fetchEnquiries}>
              Filter
            </Button>
          </div>
        </div>
      </Card>

      {/* Table */}
      <Card noPadding>
        {loading ? (
          <LoadingSpinner text="Retrieving enquiries..." />
        ) : enquiries.length === 0 ? (
          <EmptyState
            title="No enquiries recorded"
            description="Submit an enquiry from a prospective hospital, research center, or distributor."
            actionLabel="Book Enquiry"
            onAction={handleCreate}
          />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-200 text-[11px] font-bold text-slate-600 uppercase tracking-wider">
                  <th className="py-3 px-4">Enquiry # / Date</th>
                  <th className="py-3 px-4">Customer & Contact</th>
                  <th className="py-3 px-4">Equipment Specs Required</th>
                  <th className="py-3 px-4">Assigned To</th>
                  <th className="py-3 px-4">Status & Priority</th>
                  <th className="py-3 px-4 text-right">Workflow Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-xs">
                {enquiries.map((enq) => (
                  <tr key={enq._id} className="hover:bg-slate-50/80 transition-colors">
                    <td className="py-3.5 px-4">
                      <span className="font-bold text-brand-900 block">{enq.enquiryNumber}</span>
                      <span className="text-[11px] text-slate-400">
                        {new Date(enq.enquiryDate).toLocaleDateString()} • {enq.enquirySource}
                      </span>
                    </td>
                    <td className="py-3.5 px-4">
                      <span className="font-semibold text-slate-800 block">{enq.companyName}</span>
                      <span className="text-[11px] text-slate-500">
                        {enq.contactPerson} ({enq.mobileNumber})
                      </span>
                    </td>
                    <td className="py-3.5 px-4">
                      <div className="space-y-0.5">
                        <span className="font-medium text-slate-700 block">
                          {enq.products?.[0]?.productName || 'Equipment Item'}
                          {enq.products?.length > 1 && ` (+${enq.products.length - 1} more)`}
                        </span>
                        <span className="text-[11px] text-blue-600">
                          {enq.products?.[0]?.temperatureRequirements || 'Standard Spec'} • Qty: {enq.products?.[0]?.quantity || 1}
                        </span>
                      </div>
                    </td>
                    <td className="py-3.5 px-4">
                      <span className="font-medium text-slate-700 block">{enq.assignedTo?.name || 'Unassigned'}</span>
                      <span className="text-[10px] text-slate-400">{enq.department}</span>
                    </td>
                    <td className="py-3.5 px-4">
                      <div className="flex flex-col gap-1 items-start">
                        <Badge>{enq.status}</Badge>
                        <span className={`text-[10px] font-semibold px-1.5 py-0.5 rounded ${
                          enq.priority === 'High' ? 'bg-rose-50 text-rose-700' : enq.priority === 'Medium' ? 'bg-amber-50 text-amber-700' : 'bg-slate-100 text-slate-600'
                        }`}>
                          {enq.priority} Priority
                        </span>
                      </div>
                    </td>
                    <td className="py-3.5 px-4 text-right">
                      <div className="flex items-center justify-end gap-1">
                        <button
                          onClick={() => handleView(enq)}
                          title="View Enquiry Dossier"
                          className="p-1.5 text-slate-500 hover:text-brand-900 hover:bg-slate-100 rounded-md transition-colors"
                        >
                          <Eye className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleConvertToEstimation(enq)}
                          title="Convert to Cost Estimation"
                          className="p-1.5 text-slate-500 hover:text-purple-600 hover:bg-purple-50 rounded-md transition-colors"
                        >
                          <Calculator className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleAddFollowUp(enq)}
                          title="Add Follow-up"
                          className="p-1.5 text-slate-500 hover:text-amber-600 hover:bg-amber-50 rounded-md transition-colors"
                        >
                          <CalendarCheck className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleLeadDecision(enq)}
                          title="Lead Decision (Won / Lost)"
                          className="p-1.5 text-slate-500 hover:text-emerald-600 hover:bg-emerald-50 rounded-md transition-colors"
                        >
                          <Award className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleEdit(enq)}
                          title="Edit Enquiry"
                          className="p-1.5 text-slate-500 hover:text-blue-600 hover:bg-slate-100 rounded-md transition-colors"
                        >
                          <Edit2 className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => confirmDelete(enq)}
                          title="Delete Enquiry"
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

      {/* Modals */}
      <EnquiryFormModal
        isOpen={formModalOpen}
        onClose={() => setFormModalOpen(false)}
        enquiry={selectedEnquiry}
        onSaved={fetchEnquiries}
      />

      <EnquiryDetailModal
        isOpen={detailModalOpen}
        onClose={() => setDetailModalOpen(false)}
        enquiry={selectedEnquiry}
        onConvertToEstimation={handleConvertToEstimation}
        onAddFollowUp={handleAddFollowUp}
        onLeadDecision={handleLeadDecision}
      />

      <EstimationFormModal
        isOpen={estimationModalOpen}
        onClose={() => setEstimationModalOpen(false)}
        initialEnquiry={selectedEnquiry}
        onSaved={fetchEnquiries}
      />

      <FollowUpFormModal
        isOpen={followUpModalOpen}
        onClose={() => setFollowUpModalOpen(false)}
        initialEnquiry={selectedEnquiry}
        onSaved={fetchEnquiries}
      />

      <LeadDecisionModal
        isOpen={leadModalOpen}
        onClose={() => setLeadModalOpen(false)}
        initialEnquiry={selectedEnquiry}
        onSaved={fetchEnquiries}
      />

      <ConfirmDialog
        isOpen={deleteConfirmOpen}
        onClose={() => setDeleteConfirmOpen(false)}
        onConfirm={executeDelete}
        title="Delete Customer Enquiry"
        message={`Are you sure you want to delete ${enquiryToDelete?.enquiryNumber}?`}
      />
    </div>
  );
};

export default EnquiryList;
