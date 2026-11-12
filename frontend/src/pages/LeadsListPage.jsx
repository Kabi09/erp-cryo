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
  Edit2,
  PhoneCall,
  Pencil,
  CheckCircle2,
  MapPin,
  Clock,
  RotateCcw
} from 'lucide-react';
import { Card, CardContent } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { Select } from '../components/ui/Select';
import { Badge } from '../components/ui/Badge';
import { Modal } from '../components/ui/Modal';
import { FollowUpModal } from '../components/workflow/FollowUpModal';
import { EditLeadModal } from '../components/workflow/EditLeadModal';
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

  // New Lead Modal state
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(searchParams.get('new') === 'true');
  const [creating, setCreating] = useState(false);
  const [newLeadForm, setNewLeadForm] = useState({
    companyName: '',
    contactName: '',
    designation: '',
    email: '',
    phone: '',
    city: '',
    state: '',
    source: 'Website',
    priority: 'MEDIUM',
    equipmentType: 'Blood Bank Refrigerator (+4°C) with automatic chart logging',
    capacity: '',
    specificationDetails: '',
    quantity: 1,
    estimatedBudget: '',
    expectedDeliveryTime: '4-6 Weeks',
  });

  // Action Modals
  const [activeLeadForFollowUp, setActiveLeadForFollowUp] = useState(null);
  const [followUpToModify, setFollowUpToModify] = useState(null);
  const [isFollowUpModalOpen, setIsFollowUpModalOpen] = useState(false);

  const [activeLeadForEdit, setActiveLeadForEdit] = useState(null);
  const [isEditLeadModalOpen, setIsEditLeadModalOpen] = useState(false);

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
        companyName: newLeadForm.companyName.trim(),
        contactPerson: {
          name: newLeadForm.contactName.trim(),
          designation: newLeadForm.designation.trim(),
        },
        email: newLeadForm.email.trim(),
        phone: newLeadForm.phone.trim(),
        city: newLeadForm.city.trim(),
        state: newLeadForm.state.trim(),
        source: newLeadForm.source.trim(),
        priority: newLeadForm.priority,
        requirements: {
          equipmentType: newLeadForm.equipmentType.trim(),
          capacity: newLeadForm.capacity.trim(),
          specificationDetails: newLeadForm.specificationDetails.trim(),
          quantity: Number(newLeadForm.quantity) || 1,
          estimatedBudget: Number(newLeadForm.estimatedBudget) || 0,
          expectedDeliveryTime: newLeadForm.expectedDeliveryTime,
        },
      };

      const res = await api.post('/leads', payload);
      addToast({
        type: 'success',
        title: 'Enquiry Created',
        message: `Lead ${res.data.data.leadNumber} captured successfully!`,
      });
      setIsCreateModalOpen(false);
      setNewLeadForm({
        companyName: '',
        contactName: '',
        designation: '',
        email: '',
        phone: '',
        city: '',
        state: '',
        source: 'Website',
        priority: 'MEDIUM',
        equipmentType: 'Blood Bank Refrigerator (+4°C) with automatic chart logging',
        capacity: '',
        specificationDetails: '',
        quantity: 1,
        estimatedBudget: '',
        expectedDeliveryTime: '4-6 Weeks',
      });
      fetchLeads(1);
    } catch (err) {
      addToast({
        type: 'error',
        title: 'Creation Failed',
        message: err.response?.data?.message || 'Failed to capture lead',
      });
    } finally {
      setCreating(false);
    }
  };

  // Helper for currency format
  const formatINR = (val) => {
    if (!val && val !== 0) return '₹0';
    return '₹' + Number(val).toLocaleString('en-IN');
  };

  // Helper for priority badge styling
  const getPriorityBadge = (priority) => {
    const p = (priority || 'MEDIUM').toUpperCase();
    switch (p) {
      case 'URGENT':
        return (
          <span className="bg-rose-50 text-rose-600 border border-rose-200 font-semibold text-[10px] px-2.5 py-0.5 rounded-full inline-block">
            URGENT
          </span>
        );
      case 'HIGH':
        return (
          <span className="bg-orange-50 text-orange-600 border border-orange-200 font-semibold text-[10px] px-2.5 py-0.5 rounded-full inline-block">
            HIGH
          </span>
        );
      case 'LOW':
        return (
          <span className="bg-slate-50 text-slate-600 border border-slate-200 font-semibold text-[10px] px-2.5 py-0.5 rounded-full inline-block">
            LOW
          </span>
        );
      case 'MEDIUM':
      default:
        return (
          <span className="bg-sky-50 text-sky-600 border border-sky-300 font-semibold text-[10px] px-2.5 py-0.5 rounded-full inline-block">
            MEDIUM
          </span>
        );
    }
  };

  // Helper for status badge styling
  const getStatusBadge = (status) => {
    const s = (status || 'New').toUpperCase();
    switch (s) {
      case 'LOST':
        return (
          <span className="bg-red-50 text-red-600 border border-red-200 font-semibold text-[11px] px-3 py-1 rounded-full inline-block tracking-wide">
            LOST
          </span>
        );
      case 'WON':
        return (
          <span className="bg-emerald-50 text-emerald-700 border border-emerald-200 font-semibold text-[11px] px-3 py-1 rounded-full inline-block tracking-wide">
            WON
          </span>
        );
      case 'QUALIFIED':
        return (
          <span className="bg-sky-50 text-sky-700 border border-sky-200 font-semibold text-[11px] px-3 py-1 rounded-full inline-block tracking-wide">
            QUALIFIED
          </span>
        );
      case 'QUOTED':
        return (
          <span className="bg-indigo-50 text-indigo-700 border border-indigo-200 font-semibold text-[11px] px-3 py-1 rounded-full inline-block tracking-wide">
            QUOTED
          </span>
        );
      case 'IN PROGRESS':
        return (
          <span className="bg-amber-50 text-amber-700 border border-amber-200 font-semibold text-[11px] px-3 py-1 rounded-full inline-block tracking-wide">
            IN PROGRESS
          </span>
        );
      default:
        return (
          <span className="bg-slate-50 text-slate-700 border border-slate-200 font-semibold text-[11px] px-3 py-1 rounded-full inline-block tracking-wide">
            {s}
          </span>
        );
    }
  };

  // Helper for follow-up outcome pill styling
  const getOutcomeBadgeClass = (status) => {
    const st = (status || 'INTERESTED').toUpperCase();
    switch (st) {
      case 'INTERESTED':
        return 'border-sky-400 text-sky-600 bg-sky-50/60';
      case 'NOT INTERESTED':
        return 'border-rose-300 text-rose-600 bg-rose-50/60';
      case 'NO RESPONSE':
        return 'border-amber-400 text-amber-700 bg-amber-50/60';
      case 'FOLLOW UP LATER':
        return 'border-purple-300 text-purple-700 bg-purple-50/60';
      case 'BUSY':
        return 'border-slate-300 text-slate-700 bg-slate-50/60';
      case 'MEETING SCHEDULED':
        return 'border-emerald-300 text-emerald-700 bg-emerald-50/60';
      default:
        return 'border-slate-300 text-slate-600 bg-slate-50/60';
    }
  };

  // Open modal handlers
  const handleAddNewFollowUp = (lead) => {
    setActiveLeadForFollowUp(lead);
    setFollowUpToModify(null);
    setIsFollowUpModalOpen(true);
  };

  const handleModifyFollowUp = (lead, followUp) => {
    setActiveLeadForFollowUp(lead);
    setFollowUpToModify(followUp);
    setIsFollowUpModalOpen(true);
  };

  const handleEditLead = (lead) => {
    setActiveLeadForEdit(lead);
    setIsEditLeadModalOpen(true);
  };

  const handleLeadSaved = (updatedLead) => {
    setLeads((prev) =>
      prev.map((l) => (l._id === updatedLead._id ? updatedLead : l))
    );
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Top Header - Matches Screenshot */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 bg-white p-4 sm:p-5 rounded-2xl border border-slate-200 shadow-2xs">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight">
              Commercial Leads & Enquiries
            </h1>
            <Badge variant="primary">{pagination.total} Leads</Badge>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Inquiry capture, lead editing, qualification, and automated Customer Master conversion.
          </p>
        </div>

        <button
          onClick={() => setIsCreateModalOpen(true)}
          className="bg-[#0f172a] hover:bg-slate-800 text-white text-sm font-medium px-4 py-2.5 rounded-lg flex items-center justify-center gap-2 transition shadow-xs self-start sm:self-auto w-full sm:w-auto"
        >
          <Plus className="w-4 h-4" />
          Capture Lead
        </button>
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
                Filter
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

      {/* Main Table - Exact Column Architecture Matching Screenshot */}
      <Card className="overflow-hidden">
        <div className="overflow-x-auto min-w-full">
          <table className="w-full text-left text-xs text-slate-600 min-w-[1050px]">
            <thead className="bg-slate-50/80 border-b border-slate-200 text-slate-700 font-semibold text-[11px] uppercase tracking-wider">
              <tr>
                <th className="py-3 px-4 w-[180px]">EMAIL / CONTACT</th>
                <th className="py-3 px-4 w-[240px]">REQUIREMENT</th>
                <th className="py-3 px-4 w-[120px]">EST. VALUE</th>
                <th className="py-3 px-4 w-[150px]">SOURCE / TYPE</th>
                <th className="py-3 px-4 w-[100px]">PRIORITY</th>
                <th className="py-3 px-4 w-[130px]">STATUS / CUSTOMER LINK</th>
                <th className="py-3 px-4 w-[110px]">ACTIONS</th>
                <th className="py-3 px-4 w-[340px]">ALL FOLLOW-UPS & NEXT DATE</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {loading ? (
                <tr>
                  <td colSpan="8" className="text-center py-12 text-slate-400">
                    <div className="flex justify-center items-center gap-2">
                      <div className="w-4 h-4 border-2 border-sky-600 border-t-transparent rounded-full animate-spin" />
                      <span>Loading leads registry...</span>
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
                leads.map((lead) => {
                  const followUpsList = lead.followUps || [];

                  return (
                    <tr key={lead._id} className="hover:bg-slate-50/60 transition group items-start">
                      {/* 1. EMAIL / CONTACT */}
                      <td className="py-4 px-4 align-top">
                        <div className="font-bold text-slate-900 leading-tight">
                          {lead.contactPerson?.name || lead.companyName}
                        </div>
                        <div className="text-[11px] text-slate-600 font-mono mt-0.5">
                          {lead.phone}
                        </div>
                        <div className="text-[11px] text-sky-700 hover:underline truncate max-w-[170px] mt-0.5">
                          {lead.email}
                        </div>
                        <div className="text-[10px] text-slate-400 mt-1 flex items-center gap-1">
                          <span className="font-medium text-slate-500">{lead.companyName}</span>
                          {lead.city && <span>• {lead.city}</span>}
                        </div>
                        <div className="text-[10px] text-slate-400 mt-0.5">
                          Ref: <Link to={`/leads/${lead._id}`} className="text-slate-600 hover:text-sky-600 font-mono underline">{lead.leadNumber}</Link>
                        </div>
                      </td>

                      {/* 2. REQUIREMENT */}
                      <td className="py-4 px-4 align-top">
                        <div className="font-medium text-slate-900 leading-snug">
                          {lead.requirements?.equipmentType || 'Cryogenic Equipment'}
                        </div>
                        <div className="text-[11px] text-slate-500 font-semibold mt-1">
                          Qty: <span className="text-slate-800">{lead.requirements?.quantity || 1}</span>
                        </div>
                        {lead.requirements?.capacity && (
                          <div className="text-[10px] text-slate-400 mt-0.5 truncate max-w-[220px]">
                            Spec: {lead.requirements.capacity}
                          </div>
                        )}
                      </td>

                      {/* 3. EST. VALUE */}
                      <td className="py-4 px-4 align-top">
                        <div className="font-bold text-slate-900 text-sm">
                          {formatINR(lead.requirements?.estimatedBudget)}
                        </div>
                      </td>

                      {/* 4. SOURCE / TYPE */}
                      <td className="py-4 px-4 align-top">
                        <div className="font-medium text-slate-800 text-xs">
                          {lead.source || 'Website'}
                        </div>
                        <div className="mt-1">
                          {lead.customer ? (
                            <span className="inline-block bg-slate-100 text-slate-700 border border-slate-300 text-[10px] font-semibold px-2 py-0.5 rounded-full uppercase tracking-wider">
                              EXISTING CUSTOMER
                            </span>
                          ) : (
                            <span className="inline-block bg-slate-100 text-slate-600 border border-slate-300 text-[10px] font-semibold px-2 py-0.5 rounded-full uppercase tracking-wider">
                              NEW CUSTOMER
                            </span>
                          )}
                        </div>
                      </td>

                      {/* 5. PRIORITY */}
                      <td className="py-4 px-4 align-top">
                        {getPriorityBadge(lead.priority)}
                      </td>

                      {/* 6. STATUS / CUSTOMER LINK */}
                      <td className="py-4 px-4 align-top">
                        <div>{getStatusBadge(lead.status)}</div>
                        {lead.customer ? (
                          <div className="text-[10px] text-emerald-700 font-medium mt-1.5 flex items-center gap-1">
                            <span>Mapped:</span>
                            <span className="font-mono underline">{lead.customer.customerCode || 'CU'}</span>
                          </div>
                        ) : (
                          <div className="text-[10px] text-slate-400 mt-1.5">
                            Customer Unmapped
                          </div>
                        )}
                        <div className="text-[10px] text-slate-400 mt-0.5">
                          Stage: {lead.stage?.replace(/_/g, ' ')}
                        </div>
                      </td>

                      {/* 7. ACTIONS */}
                      <td className="py-4 px-4 align-top">
                        <div className="flex flex-col gap-1.5 w-24">
                          <button
                            type="button"
                            onClick={() => handleEditLead(lead)}
                            className="w-full inline-flex items-center justify-center gap-1.5 px-2.5 py-1 text-xs font-medium text-slate-700 bg-white border border-slate-200 rounded-md hover:bg-slate-50 hover:border-slate-300 shadow-2xs transition"
                          >
                            <Pencil className="w-3.5 h-3.5 text-slate-500" />
                            Edit
                          </button>

                          <button
                            type="button"
                            onClick={() => handleAddNewFollowUp(lead)}
                            className="w-full inline-flex items-center justify-center gap-1.5 px-2.5 py-1 text-xs font-medium text-slate-700 bg-white border border-slate-200 rounded-md hover:bg-slate-50 hover:border-slate-300 shadow-2xs transition"
                          >
                            <Phone className="w-3.5 h-3.5 text-slate-500" />
                            Follow-up
                          </button>

                          <Link
                            to={`/leads/${lead._id}`}
                            className="text-[10px] text-sky-600 hover:text-sky-800 text-center font-medium hover:underline mt-0.5 flex items-center justify-center gap-0.5"
                          >
                            Hub <ExternalLink className="w-2.5 h-2.5" />
                          </Link>
                        </div>
                      </td>

                      {/* 8. ALL FOLLOW-UPS & NEXT DATE - Matches Screenshot */}
                      <td className="py-4 px-4 align-top">
                        {followUpsList.length === 0 ? (
                          <div className="bg-slate-50/70 border border-dashed border-slate-200 rounded-lg p-3 text-center text-slate-400 text-xs">
                            <p>No follow-ups recorded yet</p>
                            <button
                              type="button"
                              onClick={() => handleAddNewFollowUp(lead)}
                              className="mt-1 text-sky-600 font-medium hover:underline text-[11px] inline-flex items-center gap-1"
                            >
                              <Plus className="w-3 h-3" /> Log first interaction
                            </button>
                          </div>
                        ) : (
                          <div className="max-h-56 overflow-y-auto pr-1 space-y-2 scrollbar-thin scrollbar-thumb-slate-300">
                            {followUpsList.map((fu, idx) => (
                              <div
                                key={fu._id || idx}
                                className="bg-white rounded-lg border border-slate-200/90 p-2.5 shadow-2xs hover:border-slate-300 transition"
                              >
                                {/* Top Row: Date, Outcome Pill, Modify Button */}
                                <div className="flex items-center justify-between gap-1 mb-1.5">
                                  <div className="flex items-center gap-1.5 flex-wrap">
                                    <span className="text-xs font-bold text-slate-900">
                                      {dayjs(fu.followUpDate).format('DD MMM YYYY')}
                                    </span>
                                    <span
                                      className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${getOutcomeBadgeClass(
                                        fu.status
                                      )}`}
                                    >
                                      {fu.status}
                                    </span>
                                  </div>

                                  <button
                                    type="button"
                                    onClick={() => handleModifyFollowUp(lead, fu)}
                                    className="text-[11px] font-medium text-slate-700 hover:text-sky-700 border border-slate-200 hover:border-slate-300 bg-slate-50/60 hover:bg-slate-100 px-2 py-0.5 rounded flex items-center gap-1 shadow-2xs transition"
                                  >
                                    <Pencil className="w-3 h-3 text-sky-600" />
                                    Modify
                                  </button>
                                </div>

                                {/* Comment Bubble */}
                                <div className="bg-slate-50/90 rounded border border-slate-100 px-2.5 py-1 text-xs text-slate-800 mb-1.5 font-medium flex items-start gap-1.5">
                                  <span className="text-slate-400">💬</span>
                                  <span className="italic font-normal text-slate-800">"{fu.notes}"</span>
                                </div>

                                {/* Bottom Row: Next Follow-up & By */}
                                <div className="flex items-center justify-between gap-2 text-[11px] pt-0.5">
                                  {fu.nextFollowUpDate ? (
                                    <span className="bg-sky-50 text-sky-700 border border-sky-100 font-medium px-2 py-0.5 rounded text-[10px] inline-flex items-center gap-1">
                                      Next Follow-up: {dayjs(fu.nextFollowUpDate).format('DD MMM YYYY')}
                                    </span>
                                  ) : (
                                    <span className="text-slate-400 italic text-[11px]">
                                      No next follow-up date
                                    </span>
                                  )}

                                  <span className="text-slate-500 font-medium text-[11px] whitespace-nowrap">
                                    By: {fu.conductedByName || 'Sales Rep'}
                                  </span>
                                </div>
                              </div>
                            ))}
                          </div>
                        )}
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination Footer */}
        {pagination.pages > 1 && (
          <div className="p-4 border-t border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs text-slate-500">
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

      {/* Capture Lead Modal */}
      <Modal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        title="Capture Commercial Lead / Enquiry"
        subtitle="Stage 1: Register customer interest and equipment specification requirements"
        size="lg"
      >
        <form onSubmit={handleCreateLead} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Input
              label="Company / Institution Name"
              required
              placeholder="e.g. Manipal Academy of Higher Education (MAHE)"
              value={newLeadForm.companyName}
              onChange={(e) => setNewLeadForm({ ...newLeadForm, companyName: e.target.value })}
            />

            <Input
              label="Contact Person Name"
              required
              placeholder="e.g. Dr. Vikram Raman"
              value={newLeadForm.contactName}
              onChange={(e) => setNewLeadForm({ ...newLeadForm, contactName: e.target.value })}
            />

            <Input
              label="Email Address"
              type="email"
              required
              placeholder="e.g. vraman@manipaluniv.res.in"
              value={newLeadForm.email}
              onChange={(e) => setNewLeadForm({ ...newLeadForm, email: e.target.value })}
            />

            <Input
              label="Phone Number"
              required
              placeholder="e.g. +91 98765 43210"
              value={newLeadForm.phone}
              onChange={(e) => setNewLeadForm({ ...newLeadForm, phone: e.target.value })}
            />

            <Input
              label="Source / Channel"
              placeholder="e.g. Exhibition Bangalore, Website, Trade Show"
              value={newLeadForm.source}
              onChange={(e) => setNewLeadForm({ ...newLeadForm, source: e.target.value })}
            />

            <Select
              label="Priority Level"
              value={newLeadForm.priority}
              onChange={(e) => setNewLeadForm({ ...newLeadForm, priority: e.target.value })}
            >
              <option value="LOW">LOW</option>
              <option value="MEDIUM">MEDIUM</option>
              <option value="HIGH">HIGH</option>
              <option value="URGENT">URGENT</option>
            </Select>

            <Input
              label="City"
              placeholder="e.g. Bangalore, Manipal"
              value={newLeadForm.city}
              onChange={(e) => setNewLeadForm({ ...newLeadForm, city: e.target.value })}
            />

            <Input
              label="State"
              placeholder="e.g. Karnataka"
              value={newLeadForm.state}
              onChange={(e) => setNewLeadForm({ ...newLeadForm, state: e.target.value })}
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-2 border-t border-slate-100">
            <div className="sm:col-span-2">
              <Input
                label="Product / Equipment Requirement"
                required
                placeholder="e.g. Blood Bank Refrigerator (+4°C) with automatic chart logging"
                value={newLeadForm.equipmentType}
                onChange={(e) => setNewLeadForm({ ...newLeadForm, equipmentType: e.target.value })}
              />
            </div>

            <Input
              label="Quantity"
              type="number"
              min="1"
              required
              value={newLeadForm.quantity}
              onChange={(e) => setNewLeadForm({ ...newLeadForm, quantity: e.target.value })}
            />

            <div className="sm:col-span-1">
              <Input
                label="Estimated Value (INR)"
                type="number"
                placeholder="e.g. 180000"
                value={newLeadForm.estimatedBudget}
                onChange={(e) => setNewLeadForm({ ...newLeadForm, estimatedBudget: e.target.value })}
              />
            </div>

            <div className="sm:col-span-2">
              <Input
                label="Expected Delivery Time"
                value={newLeadForm.expectedDeliveryTime}
                onChange={(e) => setNewLeadForm({ ...newLeadForm, expectedDeliveryTime: e.target.value })}
              />
            </div>
          </div>

          <div className="w-full">
            <label className="block text-xs font-semibold text-slate-700 mb-1.5">
              Specification Details & Technical Requirements
            </label>
            <textarea
              rows="2"
              className="block w-full text-sm rounded-lg border border-slate-300 p-2.5 focus:outline-none focus:ring-2 focus:ring-sky-500/20 focus:border-sky-500 text-slate-800"
              placeholder="Mention temperature tolerances, holding time requirements, or sensor specifications..."
              value={newLeadForm.specificationDetails}
              onChange={(e) => setNewLeadForm({ ...newLeadForm, specificationDetails: e.target.value })}
            />
          </div>

          <div className="flex justify-end gap-3 pt-3 border-t border-slate-100">
            <Button variant="secondary" onClick={() => setIsCreateModalOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" loading={creating}>
              Save & Capture Lead
            </Button>
          </div>
        </form>
      </Modal>

      {/* Follow-Up Modal (Add & Modify) */}
      <FollowUpModal
        isOpen={isFollowUpModalOpen}
        onClose={() => {
          setIsFollowUpModalOpen(false);
          setActiveLeadForFollowUp(null);
          setFollowUpToModify(null);
        }}
        lead={activeLeadForFollowUp}
        followUpToEdit={followUpToModify}
        onSaved={handleLeadSaved}
      />

      {/* Edit Lead Modal */}
      <EditLeadModal
        isOpen={isEditLeadModalOpen}
        onClose={() => {
          setIsEditLeadModalOpen(false);
          setActiveLeadForEdit(null);
        }}
        lead={activeLeadForEdit}
        onSaved={handleLeadSaved}
      />
    </div>
  );
};
