import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import api from '../services/api';
import { useToastStore } from '../store/useToastStore';
import { StageProgress } from '../components/ui/StageProgress';
import { Card, CardHeader, CardContent } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Badge } from '../components/ui/Badge';
import { QualifyModal } from '../components/workflow/QualifyModal';
import { CustomerMappingModal } from '../components/workflow/CustomerMappingModal';
import { QuotationModal } from '../components/workflow/QuotationModal';
import { CustomerFeedbackModal } from '../components/workflow/CustomerFeedbackModal';
import { MarkWonModal } from '../components/workflow/MarkWonModal';
import { ProformaInvoiceModal } from '../components/workflow/ProformaInvoiceModal';
import { CustomerPOModal } from '../components/workflow/CustomerPOModal';
import { POVerificationModal } from '../components/workflow/POVerificationModal';
import { POAmendmentModal } from '../components/workflow/POAmendmentModal';
import { SalesOrderModal } from '../components/workflow/SalesOrderModal';
import { ProductionHandoverModal } from '../components/workflow/ProductionHandoverModal';
import { LeadTimeline } from '../components/workflow/LeadTimeline';
import {
  Building2,
  Phone,
  Mail,
  MapPin,
  Calendar,
  FileText,
  Receipt,
  FileCheck2,
  ClipboardCheck,
  PackageCheck,
  Factory,
  Trophy,
  Download,
  AlertTriangle,
  CheckCircle2,
  PlusCircle,
  ExternalLink,
  Edit,
  ArrowRight
} from 'lucide-react';
import dayjs from 'dayjs';

export const LeadDetailPage = () => {
  const { id } = useParams();
  const [lead, setLead] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('hub');
  const [verifications, setVerifications] = useState([]);

  // Modals state
  const [isQualifyOpen, setIsQualifyOpen] = useState(false);
  const [isCustomerModalOpen, setIsCustomerModalOpen] = useState(false);
  const [isQuoteModalOpen, setIsQuoteModalOpen] = useState(false);
  const [isQuoteRevision, setIsQuoteRevision] = useState(false);
  const [isFeedbackModalOpen, setIsFeedbackModalOpen] = useState(false);
  const [isMarkWonOpen, setIsMarkWonOpen] = useState(false);
  const [isPIOpan, setIsPIOpen] = useState(false);
  const [isPOModalOpen, setIsPOModalOpen] = useState(false);
  const [isVerificationModalOpen, setIsVerificationModalOpen] = useState(false);
  const [isAmendmentModalOpen, setIsAmendmentModalOpen] = useState(false);
  const [isSOModalOpen, setIsSOModalOpen] = useState(false);
  const [isHandoverModalOpen, setIsHandoverModalOpen] = useState(false);

  // Selected revision for quote view
  const [selectedRevisionId, setSelectedRevisionId] = useState(null);

  const addToast = useToastStore((state) => state.addToast);

  const fetchLeadData = async () => {
    try {
      setLoading(true);
      const res = await api.get(`/leads/${id}`);
      setLead(res.data.data);

      // Fetch verifications for this lead
      const verifRes = await api.get(`/verifications/lead/${id}`);
      setVerifications(verifRes.data.data);
    } catch (err) {
      addToast({
        type: 'error',
        title: 'Error',
        message: err.response?.data?.message || 'Failed to fetch lead details',
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (id) {
      fetchLeadData();
    }
  }, [id]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[500px]">
        <div className="flex flex-col items-center gap-3">
          <div className="w-9 h-9 border-3 border-sky-600 border-t-transparent rounded-full animate-spin" />
          <p className="text-xs font-medium text-slate-500">Loading sales workflow record...</p>
        </div>
      </div>
    );
  }

  if (!lead) {
    return (
      <div className="p-8 text-center text-sm text-slate-500">
        Lead not found.{' '}
        <Link to="/leads" className="text-sky-600 hover:underline">
          Return to Leads
        </Link>
      </div>
    );
  }

  const quotation = lead.currentQuotation;
  const activeRev = quotation?.revisions?.find((r) => r._id === selectedRevisionId) || quotation?.activeRevision || quotation?.winningRevision;
  const pi = lead.currentPI;
  const po = lead.currentPO;
  const latestVerification = verifications[0] || null;
  const so = lead.currentSO;

  const isQualified = lead.qualification?.isQualified === true;
  const isCustomerMapped = !!lead.customer;
  const isQuoted = !!quotation;
  const isWon = quotation?.status === 'Won';
  const isPIIssued = !!pi;
  const isPOReceived = !!po;
  const isPOVerified = latestVerification?.allMatched === true && latestVerification?.overallStatus === 'PASSED';
  const isSOCreated = !!so;
  const isHandedOver = so?.productionHandover?.isHandedOver === true;

  const formatINR = (n) => 'Rs. ' + Number(n || 0).toLocaleString('en-IN');

  const downloadQuotationPDF = (quoteId, revId) => {
    const url = `/api/quotations/${quoteId}/pdf${revId ? `?revisionId=${revId}` : ''}`;
    window.open(url, '_blank');
  };

  const downloadPIPDF = (piId) => {
    const url = `/api/proforma-invoices/${piId}/pdf`;
    window.open(url, '_blank');
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-12">
      {/* 12-Stage Visual Progress Banner */}
      <StageProgress currentStage={lead.stage} status={lead.status} />

      {/* Lead Commercial Header Card */}
      <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-2xs">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
          <div>
            <div className="flex items-center gap-2.5 flex-wrap">
              <span className="font-mono text-sm font-bold text-sky-700 bg-sky-50 px-2.5 py-0.5 rounded border border-sky-200">
                {lead.leadNumber}
              </span>
              <h1 className="text-xl font-bold text-slate-900 tracking-tight">{lead.companyName}</h1>
              <Badge>{lead.status}</Badge>
              <Badge variant="primary">{lead.stage.replace(/_/g, ' ')}</Badge>
            </div>
            <div className="flex items-center gap-4 text-xs text-slate-500 mt-2 flex-wrap">
              <span className="flex items-center gap-1">
                <Building2 className="w-3.5 h-3.5 text-slate-400" />
                {lead.contactPerson?.name || 'Contact N/A'} {lead.contactPerson?.designation && `(${lead.contactPerson.designation})`}
              </span>
              <span className="flex items-center gap-1">
                <Mail className="w-3.5 h-3.5 text-slate-400" />
                {lead.email}
              </span>
              <span className="flex items-center gap-1">
                <Phone className="w-3.5 h-3.5 text-slate-400" />
                {lead.phone}
              </span>
              {(lead.city || lead.state) && (
                <span className="flex items-center gap-1">
                  <MapPin className="w-3.5 h-3.5 text-slate-400" />
                  {lead.city}{lead.city && lead.state && ', '}{lead.state}
                </span>
              )}
            </div>
          </div>

          {/* Quick Workflow Action Shortcuts */}
          <div className="flex items-center gap-2 flex-wrap">
            {!isQualified && (
              <Button size="sm" onClick={() => setIsQualifyOpen(true)}>
                Qualify Lead
              </Button>
            )}

            {isQualified && !isCustomerMapped && (
              <Button size="sm" onClick={() => setIsCustomerModalOpen(true)}>
                Map Customer Master
              </Button>
            )}

            {isQualified && isCustomerMapped && !isQuoted && (
              <Button
                size="sm"
                onClick={() => {
                  setIsQuoteRevision(false);
                  setIsQuoteModalOpen(true);
                }}
              >
                Create Quotation (Rev 0)
              </Button>
            )}

            {isQuoted && !isWon && (
              <Button size="sm" variant="success" icon={Trophy} onClick={() => setIsMarkWonOpen(true)}>
                Mark Won
              </Button>
            )}

            {isWon && !isPIIssued && (
              <Button size="sm" icon={Receipt} onClick={() => setIsPIOpen(true)}>
                Issue Proforma Invoice
              </Button>
            )}

            {isWon && !isPOReceived && (
              <Button size="sm" icon={FileCheck2} onClick={() => setIsPOModalOpen(true)}>
                Upload Customer PO
              </Button>
            )}

            {isPOReceived && !isPOVerified && (
              <Button size="sm" variant="primary" icon={ClipboardCheck} onClick={() => setIsVerificationModalOpen(true)}>
                5-Point PO Verification
              </Button>
            )}

            {isPOVerified && !isSOCreated && (
              <Button size="sm" variant="success" icon={PackageCheck} onClick={() => setIsSOModalOpen(true)}>
                Generate Sales Order
              </Button>
            )}

            {isSOCreated && !isHandedOver && (
              <Button size="sm" variant="success" icon={Factory} onClick={() => setIsHandoverModalOpen(true)}>
                Handover to Production
              </Button>
            )}
          </div>
        </div>
      </div>

      {/* Workflow Navigation Tabs */}
      <div className="flex border-b border-slate-200 overflow-x-auto text-xs font-semibold">
        {[
          { id: 'hub', label: '1. Workflow Hub & Milestones' },
          { id: 'quotes', label: `2. Quotations (${quotation?.revisions?.length || 0} Revisions)` },
          { id: 'pi', label: `3. Proforma Invoice ${pi ? '✓' : ''}` },
          { id: 'po', label: `4. Customer PO & Verification (${verifications.length} Checks)` },
          { id: 'so', label: `5. Sales Order ${so ? '✓' : ''}` },
          { id: 'timeline', label: '6. Full Audit Timeline' },
        ].map((t) => (
          <button
            key={t.id}
            onClick={() => setActiveTab(t.id)}
            className={`py-3 px-4 border-b-2 transition whitespace-nowrap -mb-px flex items-center gap-1.5 ${
              activeTab === t.id
                ? 'border-sky-600 text-sky-700 bg-white font-bold'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            {t.label}
          </button>
        ))}
      </div>

      {/* TAB 1: WORKFLOW HUB */}
      {activeTab === 'hub' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-6">
            {/* Requirement Summary Card */}
            <Card>
              <CardHeader
                title="Customer Cryogenic Requirements"
                subtitle="Equipment details received during initial enquiry"
              />
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 text-xs">
                  <div>
                    <span className="text-slate-400 block mb-0.5">Equipment Type:</span>
                    <span className="font-semibold text-slate-900">{lead.requirements?.equipmentType}</span>
                  </div>
                  <div>
                    <span className="text-slate-400 block mb-0.5">Capacity / Model:</span>
                    <span className="font-semibold text-slate-900">{lead.requirements?.capacity || 'Standard'}</span>
                  </div>
                  <div>
                    <span className="text-slate-400 block mb-0.5">Estimated Budget:</span>
                    <span className="font-semibold text-slate-900">{formatINR(lead.requirements?.estimatedBudget)}</span>
                  </div>
                  <div>
                    <span className="text-slate-400 block mb-0.5">Expected Delivery:</span>
                    <span className="font-semibold text-slate-900">{lead.requirements?.expectedDeliveryTime}</span>
                  </div>
                  <div>
                    <span className="text-slate-400 block mb-0.5">Source:</span>
                    <span className="font-semibold text-slate-900">{lead.source}</span>
                  </div>
                  <div>
                    <span className="text-slate-400 block mb-0.5">Date Received:</span>
                    <span className="font-semibold text-slate-900">{dayjs(lead.createdAt).format('DD MMM YYYY')}</span>
                  </div>
                </div>

                {lead.requirements?.specificationDetails && (
                  <div className="bg-slate-50 p-3 rounded-lg border border-slate-200 text-xs">
                    <span className="font-bold text-slate-700 block mb-1">Technical Specification Details:</span>
                    <p className="text-slate-600 leading-relaxed">{lead.requirements.specificationDetails}</p>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Next Recommended Workflow Action */}
            <Card className="border-sky-200 bg-sky-50/40">
              <CardHeader
                title="Next Required Action in Sales Lifecycle"
                subtitle="Governed by Cryo Scientific Systems commercial protocol"
              />
              <CardContent>
                {!isQualified ? (
                  <div className="flex items-center justify-between gap-4">
                    <div>
                      <h4 className="text-sm font-bold text-slate-900">Stage 2: Lead Qualification</h4>
                      <p className="text-xs text-slate-600 mt-1">
                        Assess budget availability, decision-making authority, and specification clarity.
                      </p>
                    </div>
                    <Button onClick={() => setIsQualifyOpen(true)}>Qualify Lead Now</Button>
                  </div>
                ) : !isCustomerMapped ? (
                  <div className="flex items-center justify-between gap-4">
                    <div>
                      <h4 className="text-sm font-bold text-slate-900">Stage 3: Customer Master Linkage</h4>
                      <p className="text-xs text-slate-600 mt-1">
                        Link this qualified enquiry to an approved customer code or register a new customer master.
                      </p>
                    </div>
                    <Button onClick={() => setIsCustomerModalOpen(true)}>Map Customer</Button>
                  </div>
                ) : !isQuoted ? (
                  <div className="flex items-center justify-between gap-4">
                    <div>
                      <h4 className="text-sm font-bold text-slate-900">Stage 4: Create Initial Quotation (Rev 0)</h4>
                      <p className="text-xs text-slate-600 mt-1">
                        Draft line items, unit rates, discount, GST, delivery period, and standard warranty.
                      </p>
                    </div>
                    <Button
                      onClick={() => {
                        setIsQuoteRevision(false);
                        setIsQuoteModalOpen(true);
                      }}
                    >
                      Draft Rev 0 Quote
                    </Button>
                  </div>
                ) : !isWon ? (
                  <div className="flex items-center justify-between gap-4">
                    <div>
                      <h4 className="text-sm font-bold text-slate-900">Stage 5-7: Customer Review & Negotiation</h4>
                      <p className="text-xs text-slate-600 mt-1">
                        Quotation {quotation.quotationNumber} is currently {quotation.status}. Record review notes, revise to Rev {quotation.currentRevisionNumber + 1}, or mark Won.
                      </p>
                    </div>
                    <div className="flex gap-2">
                      <Button variant="secondary" onClick={() => setIsFeedbackModalOpen(true)}>
                        Log Feedback
                      </Button>
                      <Button
                        variant="secondary"
                        onClick={() => {
                          setIsQuoteRevision(true);
                          setIsQuoteModalOpen(true);
                        }}
                      >
                        Revise Quote
                      </Button>
                      <Button variant="success" onClick={() => setIsMarkWonOpen(true)}>
                        Mark Won
                      </Button>
                    </div>
                  </div>
                ) : !isPIIssued ? (
                  <div className="flex items-center justify-between gap-4">
                    <div>
                      <h4 className="text-sm font-bold text-slate-900">Stage 8: Issue Proforma Invoice</h4>
                      <p className="text-xs text-slate-600 mt-1">
                        Deal is marked Won! Issue formal Proforma Invoice to request advance payment and customer PO.
                      </p>
                    </div>
                    <Button icon={Receipt} onClick={() => setIsPIOpen(true)}>
                      Issue PI Now
                    </Button>
                  </div>
                ) : !isPOReceived ? (
                  <div className="flex items-center justify-between gap-4">
                    <div>
                      <h4 className="text-sm font-bold text-slate-900">Stage 9: Customer PO Receipt</h4>
                      <p className="text-xs text-slate-600 mt-1">
                        Upload received Customer Purchase Order document and enter PO particulars.
                      </p>
                    </div>
                    <Button icon={FileCheck2} onClick={() => setIsPOModalOpen(true)}>
                      Upload Customer PO
                    </Button>
                  </div>
                ) : !isPOVerified ? (
                  <div className="flex items-center justify-between gap-4">
                    <div>
                      <h4 className="text-sm font-bold text-slate-900">Stage 10: Mandatory 5-Point PO Verification</h4>
                      <p className="text-xs text-slate-600 mt-1">
                        Compare PO items, quantity, price, delivery, and payment terms against approved quote.
                      </p>
                    </div>
                    <div className="flex gap-2">
                      <Button icon={ClipboardCheck} onClick={() => setIsVerificationModalOpen(true)}>
                        Perform 5-Pt Verification
                      </Button>
                      {latestVerification?.overallStatus === 'FAILED_MISMATCH' && (
                        <Button variant="secondary" onClick={() => setIsAmendmentModalOpen(true)}>
                          Submit PO Amendment
                        </Button>
                      )}
                    </div>
                  </div>
                ) : !isSOCreated ? (
                  <div className="flex items-center justify-between gap-4">
                    <div>
                      <h4 className="text-sm font-bold text-slate-900">Stage 11: Sales Order Creation</h4>
                      <p className="text-xs text-slate-600 mt-1">
                        Verification passed! Generate formal Sales Order linked to verified Customer PO.
                      </p>
                    </div>
                    <Button variant="success" icon={PackageCheck} onClick={() => setIsSOModalOpen(true)}>
                      Generate Sales Order
                    </Button>
                  </div>
                ) : !isHandedOver ? (
                  <div className="flex items-center justify-between gap-4">
                    <div>
                      <h4 className="text-sm font-bold text-slate-900">Stage 12: Production Handover</h4>
                      <p className="text-xs text-slate-600 mt-1">
                        Sales Order {so.soNumber} is generated. Formally sign off and hand over to production.
                      </p>
                    </div>
                    <Button variant="success" icon={Factory} onClick={() => setIsHandoverModalOpen(true)}>
                      Handover to Production
                    </Button>
                  </div>
                ) : (
                  <div className="flex items-center gap-3 text-emerald-900 bg-emerald-50 p-4 rounded-xl border border-emerald-200">
                    <CheckCircle2 className="w-6 h-6 text-emerald-600 flex-shrink-0" />
                    <div>
                      <h4 className="text-sm font-bold">Workflow Successfully Completed!</h4>
                      <p className="text-xs mt-0.5">
                        Order {so.soNumber} has been officially handed over to Production on{' '}
                        {dayjs(so.productionHandover?.handoverDate).format('DD MMM YYYY')}.
                      </p>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Linked Documents Commercial Summary Sidebar */}
          <div className="space-y-4">
            <Card>
              <CardHeader title="Commercial Document Status" />
              <CardContent className="space-y-3.5 text-xs">
                {/* Customer */}
                <div className="p-3 rounded-lg border border-slate-200 bg-slate-50 flex items-center justify-between">
                  <div>
                    <span className="font-semibold text-slate-700 block">Customer Account</span>
                    <span className="text-[11px] text-slate-500">
                      {lead.customer ? `${lead.customer.customerCode} - ${lead.customer.companyName}` : 'Not linked'}
                    </span>
                  </div>
                  {lead.customer ? (
                    <Badge variant="success" size="sm">Mapped</Badge>
                  ) : (
                    <Badge variant="warning" size="sm">Pending</Badge>
                  )}
                </div>

                {/* Quotation */}
                <div className="p-3 rounded-lg border border-slate-200 bg-slate-50 flex items-center justify-between">
                  <div>
                    <span className="font-semibold text-slate-700 block">Quotation</span>
                    <span className="text-[11px] text-slate-500">
                      {quotation ? `${quotation.quotationNumber} (${quotation.activeRevision?.revisionLabel || 'Rev 0'})` : 'Not created'}
                    </span>
                  </div>
                  {quotation ? (
                    <Badge size="sm">{quotation.status}</Badge>
                  ) : (
                    <Badge variant="default" size="sm">None</Badge>
                  )}
                </div>

                {/* PI */}
                <div className="p-3 rounded-lg border border-slate-200 bg-slate-50 flex items-center justify-between">
                  <div>
                    <span className="font-semibold text-slate-700 block">Proforma Invoice</span>
                    <span className="text-[11px] text-slate-500">
                      {pi ? pi.piNumber : 'Not issued'}
                    </span>
                  </div>
                  {pi ? (
                    <Badge variant="primary" size="sm">Issued</Badge>
                  ) : (
                    <Badge variant="default" size="sm">None</Badge>
                  )}
                </div>

                {/* Customer PO */}
                <div className="p-3 rounded-lg border border-slate-200 bg-slate-50 flex items-center justify-between">
                  <div>
                    <span className="font-semibold text-slate-700 block">Customer PO</span>
                    <span className="text-[11px] text-slate-500">
                      {po ? `${po.poNumber} (v${po.amendmentVersion || 1})` : 'Not received'}
                    </span>
                  </div>
                  {po ? (
                    <Badge size="sm">{po.verificationStatus}</Badge>
                  ) : (
                    <Badge variant="default" size="sm">Pending</Badge>
                  )}
                </div>

                {/* Sales Order */}
                <div className="p-3 rounded-lg border border-slate-200 bg-slate-50 flex items-center justify-between">
                  <div>
                    <span className="font-semibold text-slate-700 block">Sales Order</span>
                    <span className="text-[11px] text-slate-500">
                      {so ? so.soNumber : 'Not created'}
                    </span>
                  </div>
                  {so ? (
                    <Badge variant="success" size="sm">{so.status}</Badge>
                  ) : (
                    <Badge variant="default" size="sm">None</Badge>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      )}

      {/* TAB 2: QUOTATIONS & REVISIONS */}
      {activeTab === 'quotes' && (
        <div className="space-y-6">
          {!quotation ? (
            <Card className="p-12 text-center text-slate-500">
              <FileText className="w-12 h-12 text-slate-300 mx-auto mb-3" />
              <h3 className="text-base font-bold text-slate-800">No Quotation Created Yet</h3>
              <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto">
                {isQualified
                  ? 'This lead has been qualified. You can now draft the initial commercial proposal (Rev 0).'
                  : 'Lead must be qualified before creating a quotation.'}
              </p>
              {isQualified && (
                <Button
                  className="mt-4"
                  onClick={() => {
                    setIsQuoteRevision(false);
                    setIsQuoteModalOpen(true);
                  }}
                >
                  Create Quotation Rev 0
                </Button>
              )}
            </Card>
          ) : (
            <>
              {/* Revision Selector Bar */}
              <div className="bg-white p-4 rounded-xl border border-slate-200 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="text-xs font-bold text-slate-700 uppercase tracking-wider">
                    Revision History:
                  </span>
                  {quotation.revisions?.map((rev) => (
                    <button
                      key={rev._id}
                      onClick={() => setSelectedRevisionId(rev._id)}
                      className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition ${
                        (selectedRevisionId ? selectedRevisionId === rev._id : quotation.activeRevision?._id === rev._id)
                          ? 'bg-sky-600 text-white shadow-xs'
                          : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                      }`}
                    >
                      {rev.revisionLabel}
                      {quotation.winningRevision?._id === rev._id && ' (Won)'}
                    </button>
                  ))}
                </div>

                <div className="flex items-center gap-2">
                  <Button
                    variant="secondary"
                    size="sm"
                    icon={Download}
                    onClick={() => downloadQuotationPDF(quotation._id, activeRev?._id)}
                  >
                    Quotation PDF
                  </Button>
                  {!isWon && (
                    <>
                      <Button
                        variant="secondary"
                        size="sm"
                        onClick={() => setIsFeedbackModalOpen(true)}
                      >
                        Add Feedback
                      </Button>
                      <Button
                        variant="secondary"
                        size="sm"
                        onClick={() => {
                          setIsQuoteRevision(true);
                          setIsQuoteModalOpen(true);
                        }}
                      >
                        Revise ({`Rev ${quotation.currentRevisionNumber + 1}`})
                      </Button>
                      <Button
                        variant="success"
                        size="sm"
                        icon={Trophy}
                        onClick={() => setIsMarkWonOpen(true)}
                      >
                        Mark Won
                      </Button>
                    </>
                  )}
                </div>
              </div>

              {/* Revision Details Box */}
              {activeRev && (
                <Card>
                  <CardHeader
                    title={`${quotation.quotationNumber} — ${activeRev.revisionLabel}`}
                    subtitle={`Reason: ${activeRev.revisionReason || 'Commercial proposal'} | Date: ${dayjs(activeRev.createdAt).format('DD MMM YYYY')}`}
                    action={<Badge size="md">{quotation.status}</Badge>}
                  />
                  <CardContent className="space-y-6">
                    {/* Line Items Table */}
                    <div className="border border-slate-200 rounded-xl overflow-x-auto">
                      <table className="w-full text-left text-xs">
                        <thead className="bg-slate-50 border-b border-slate-200 text-slate-700 font-semibold">
                          <tr>
                            <th className="p-3 w-10 text-center">#</th>
                            <th className="p-3">Item Description & Specifications</th>
                            <th className="p-3 w-20 text-center">HSN</th>
                            <th className="p-3 w-16 text-center">Qty</th>
                            <th className="p-3 w-28 text-right">Unit Rate</th>
                            <th className="p-3 w-20 text-center">GST</th>
                            <th className="p-3 w-32 text-right">Total Amount</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                          {activeRev.items?.map((it, idx) => (
                            <tr key={idx} className="hover:bg-slate-50/50">
                              <td className="p-3 text-center text-slate-400 font-medium">{idx + 1}</td>
                              <td className="p-3">
                                <div className="font-bold text-slate-900">{it.productName}</div>
                                <div className="text-[11px] text-slate-500 mt-0.5">{it.specification}</div>
                              </td>
                              <td className="p-3 text-center text-slate-600">{it.hsnCode || '841869'}</td>
                              <td className="p-3 text-center font-semibold text-slate-800">
                                {it.quantity} {it.unit || 'Nos'}
                              </td>
                              <td className="p-3 text-right text-slate-700">{formatINR(it.unitPrice)}</td>
                              <td className="p-3 text-center text-slate-600">{it.gstRate || 18}%</td>
                              <td className="p-3 text-right font-bold text-slate-900">
                                {formatINR(it.totalAmount)}
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>

                    {/* Totals Breakdown */}
                    <div className="flex justify-end">
                      <div className="w-80 bg-slate-50 border border-slate-200 rounded-xl p-4 text-xs space-y-1.5">
                        <div className="flex justify-between text-slate-600">
                          <span>Sub Total:</span>
                          <span className="font-semibold text-slate-900">{formatINR(activeRev.subTotal)}</span>
                        </div>
                        {activeRev.totalDiscount > 0 && (
                          <div className="flex justify-between text-emerald-700 font-medium">
                            <span>Discount:</span>
                            <span>- {formatINR(activeRev.totalDiscount)}</span>
                          </div>
                        )}
                        <div className="flex justify-between text-slate-600">
                          <span>Taxable Value:</span>
                          <span className="font-semibold text-slate-900">{formatINR(activeRev.taxableAmount)}</span>
                        </div>
                        <div className="flex justify-between text-slate-600">
                          <span>GST Total:</span>
                          <span className="font-semibold text-slate-900">{formatINR(activeRev.totalGst)}</span>
                        </div>
                        <div className="pt-2 border-t border-slate-200 flex justify-between text-sm font-bold text-sky-950">
                          <span>Grand Total:</span>
                          <span className="text-sky-700">{formatINR(activeRev.grandTotal)}</span>
                        </div>
                      </div>
                    </div>

                    {/* Terms */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs bg-slate-50/50 p-4 rounded-xl border border-slate-200">
                      <div>
                        <span className="font-semibold text-slate-700 block">Payment Terms:</span>
                        <span className="text-slate-600">{activeRev.paymentTerms}</span>
                      </div>
                      <div>
                        <span className="font-semibold text-slate-700 block">Delivery Timeline:</span>
                        <span className="text-slate-600">{activeRev.deliveryPeriod}</span>
                      </div>
                      <div>
                        <span className="font-semibold text-slate-700 block">Warranty Period:</span>
                        <span className="text-slate-600">{activeRev.warranty}</span>
                      </div>
                      <div>
                        <span className="font-semibold text-slate-700 block">Freight / Dispatch:</span>
                        <span className="text-slate-600">{activeRev.freightTerms}</span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )}
            </>
          )}
        </div>
      )}

      {/* TAB 3: PROFORMA INVOICE */}
      {activeTab === 'pi' && (
        <div>
          {!pi ? (
            <Card className="p-12 text-center text-slate-500">
              <Receipt className="w-12 h-12 text-slate-300 mx-auto mb-3" />
              <h3 className="text-base font-bold text-slate-800">No Proforma Invoice Issued</h3>
              <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto">
                {isWon
                  ? 'Quotation is marked Won. You can now issue the formal Proforma Invoice.'
                  : 'Proforma Invoice can ONLY be issued after the quotation is marked Won.'}
              </p>
              {isWon && (
                <Button className="mt-4" icon={Receipt} onClick={() => setIsPIOpen(true)}>
                  Issue Proforma Invoice
                </Button>
              )}
            </Card>
          ) : (
            <Card>
              <CardHeader
                title={`Proforma Invoice: ${pi.piNumber}`}
                subtitle={`Date: ${dayjs(pi.piDate).format('DD MMM YYYY')} | Status: ${pi.status}`}
                action={
                  <Button size="sm" icon={Download} onClick={() => downloadPIPDF(pi._id)}>
                    Download PI PDF
                  </Button>
                }
              />
              <CardContent className="space-y-6">
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-xs bg-slate-50 p-4 rounded-xl border border-slate-200">
                  <div>
                    <span className="text-slate-400 block">PI Reference:</span>
                    <span className="font-semibold text-slate-900">{pi.piNumber}</span>
                  </div>
                  <div>
                    <span className="text-slate-400 block">Grand Total:</span>
                    <span className="font-bold text-emerald-700">{formatINR(pi.grandTotal)}</span>
                  </div>
                  <div>
                    <span className="text-slate-400 block">Quotation Ref:</span>
                    <span className="font-semibold text-slate-900">{quotation?.quotationNumber}</span>
                  </div>
                  <div>
                    <span className="text-slate-400 block">Bank Account:</span>
                    <span className="font-semibold text-slate-900">{pi.bankDetails?.bankName}</span>
                  </div>
                </div>

                {/* Line Items */}
                <div className="border border-slate-200 rounded-xl overflow-x-auto">
                  <table className="w-full text-left text-xs">
                    <thead className="bg-slate-50 border-b border-slate-200 text-slate-700 font-semibold">
                      <tr>
                        <th className="p-3 w-10 text-center">#</th>
                        <th className="p-3">Equipment</th>
                        <th className="p-3 w-20 text-center">HSN</th>
                        <th className="p-3 w-16 text-center">Qty</th>
                        <th className="p-3 w-28 text-right">Rate</th>
                        <th className="p-3 w-32 text-right">Line Total</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {pi.items?.map((it, idx) => (
                        <tr key={idx}>
                          <td className="p-3 text-center text-slate-400 font-medium">{idx + 1}</td>
                          <td className="p-3 font-semibold text-slate-900">{it.productName}</td>
                          <td className="p-3 text-center text-slate-600">{it.hsnCode}</td>
                          <td className="p-3 text-center font-bold text-slate-800">{it.quantity} Nos</td>
                          <td className="p-3 text-right text-slate-700">{formatINR(it.unitPrice)}</td>
                          <td className="p-3 text-right font-bold text-slate-900">{formatINR(it.totalAmount)}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      )}

      {/* TAB 4: CUSTOMER PO & 5-POINT VERIFICATION */}
      {activeTab === 'po' && (
        <div className="space-y-6">
          {!po ? (
            <Card className="p-12 text-center text-slate-500">
              <FileCheck2 className="w-12 h-12 text-slate-300 mx-auto mb-3" />
              <h3 className="text-base font-bold text-slate-800">No Customer PO Uploaded Yet</h3>
              <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto">
                Once the customer submits their official purchase order document, upload and enter its particulars here.
              </p>
              <Button className="mt-4" icon={FileCheck2} onClick={() => setIsPOModalOpen(true)}>
                Upload Customer PO
              </Button>
            </Card>
          ) : (
            <>
              {/* PO Summary Card */}
              <Card>
                <CardHeader
                  title={`Customer PO: ${po.poNumber} (Version ${po.amendmentVersion || 1})`}
                  subtitle={`Received on ${dayjs(po.poDate).format('DD MMM YYYY')} | Total Value: ${formatINR(po.poValue)}`}
                  action={
                    <div className="flex gap-2">
                      {po.documentPath && (
                        <a
                          href={po.documentPath}
                          target="_blank"
                          rel="noreferrer"
                          className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 transition"
                        >
                          <Download className="w-3.5 h-3.5" />
                          View PO Document
                        </a>
                      )}
                      <Button
                        size="sm"
                        variant={latestVerification?.overallStatus === 'PASSED' ? 'success' : 'primary'}
                        icon={ClipboardCheck}
                        onClick={() => setIsVerificationModalOpen(true)}
                      >
                        {latestVerification ? 'Re-verify 5 Points' : 'Start 5-Point Verification'}
                      </Button>
                      <Button
                        size="sm"
                        variant="secondary"
                        onClick={() => setIsAmendmentModalOpen(true)}
                      >
                        Submit Amendment
                      </Button>
                    </div>
                  }
                />
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-xs bg-slate-50 p-4 rounded-xl border border-slate-200">
                    <div>
                      <span className="text-slate-400 block">PO Number:</span>
                      <span className="font-semibold text-slate-900">{po.poNumber}</span>
                    </div>
                    <div>
                      <span className="text-slate-400 block">PO Value:</span>
                      <span className="font-bold text-sky-700">{formatINR(po.poValue)}</span>
                    </div>
                    <div>
                      <span className="text-slate-400 block">Delivery Date:</span>
                      <span className="font-semibold text-slate-900">
                        {dayjs(po.deliveryDate).format('DD MMM YYYY')}
                      </span>
                    </div>
                    <div>
                      <span className="text-slate-400 block">Verification Status:</span>
                      <Badge size="sm">{po.verificationStatus}</Badge>
                    </div>
                    <div className="col-span-2">
                      <span className="text-slate-400 block">Item Summary on PO:</span>
                      <span className="font-medium text-slate-800">{po.itemSummary}</span>
                    </div>
                    <div className="col-span-2">
                      <span className="text-slate-400 block">Payment Terms on PO:</span>
                      <span className="font-medium text-slate-800">{po.paymentTerms}</span>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* 5-Point Verification Results Card */}
              {latestVerification && (
                <Card className={latestVerification.allMatched ? 'border-emerald-300' : 'border-red-300'}>
                  <CardHeader
                    title={`5-Point PO Verification Status (Round ${latestVerification.verificationRound})`}
                    subtitle={`Verified by ${latestVerification.verifiedBy?.name || 'Sales Admin'} on ${dayjs(latestVerification.verifiedAt).format('DD MMM YYYY, hh:mm A')}`}
                    action={
                      latestVerification.allMatched ? (
                        <Badge variant="success" size="lg">5/5 MATCHED — PASSED</Badge>
                      ) : (
                        <Badge variant="danger" size="lg">MISMATCH DETECTED — SO BLOCKED</Badge>
                      )
                    }
                  />
                  <CardContent className="space-y-4">
                    <div className="border border-slate-200 rounded-xl overflow-hidden">
                      <table className="w-full text-left text-xs">
                        <thead className="bg-slate-50 border-b border-slate-200 text-slate-700 font-semibold">
                          <tr>
                            <th className="p-3 w-10 text-center">#</th>
                            <th className="p-3 w-48">Point Parameter</th>
                            <th className="p-3">Expected (Approved Quote)</th>
                            <th className="p-3">Actual (Customer PO)</th>
                            <th className="p-3 w-28 text-center">Result</th>
                            <th className="p-3">Remarks</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                          {Object.values(latestVerification.checks || {}).map((chk) => (
                            <tr key={chk.pointNumber} className={chk.status === 'MISMATCH' ? 'bg-red-50/50' : ''}>
                              <td className="p-3 text-center font-bold text-slate-400">{chk.pointNumber}</td>
                              <td className="p-3 font-semibold text-slate-900">{chk.pointName}</td>
                              <td className="p-3 text-slate-600 text-[11px]">{chk.expectedValue}</td>
                              <td className="p-3 font-medium text-slate-800 text-[11px]">{chk.actualValue}</td>
                              <td className="p-3 text-center">
                                <Badge size="sm">{chk.status}</Badge>
                              </td>
                              <td className="p-3 text-slate-500 text-[11px]">{chk.remarks || '—'}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>

                    {/* Mandatory Blocking Alert or Proceed CTA */}
                    {latestVerification.allMatched ? (
                      <div className="bg-emerald-50 border border-emerald-300 p-4 rounded-xl flex items-center justify-between">
                        <div className="text-xs text-emerald-950">
                          <span className="font-bold">Sales Order Creation Unlocked</span>
                          <p className="mt-0.5 text-emerald-800">
                            All five points match. The Sales Admin can now generate Sales Order.
                          </p>
                        </div>
                        {!so && (
                          <Button variant="success" icon={PackageCheck} onClick={() => setIsSOModalOpen(true)}>
                            Generate Sales Order Now
                          </Button>
                        )}
                      </div>
                    ) : (
                      <div className="bg-red-50 border border-red-300 p-4 rounded-xl flex items-center justify-between">
                        <div className="text-xs text-red-950">
                          <span className="font-bold">Sales Order Creation Blocked</span>
                          <p className="mt-0.5 text-red-800">
                            Mismatches exist. A PO Amendment must be obtained and re-verified.
                          </p>
                        </div>
                        <Button variant="secondary" onClick={() => setIsAmendmentModalOpen(true)}>
                          Submit Amended PO
                        </Button>
                      </div>
                    )}
                  </CardContent>
                </Card>
              )}
            </>
          )}
        </div>
      )}

      {/* TAB 5: SALES ORDER & HANDOVER */}
      {activeTab === 'so' && (
        <div>
          {!so ? (
            <Card className="p-12 text-center text-slate-500">
              <PackageCheck className="w-12 h-12 text-slate-300 mx-auto mb-3" />
              <h3 className="text-base font-bold text-slate-800">No Sales Order Generated</h3>
              <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto">
                {isPOVerified
                  ? 'Five-point PO verification has passed! You can now generate the Sales Order.'
                  : 'Sales Order creation is locked until all 5 PO Verification points MATCH.'}
              </p>
              {isPOVerified && (
                <Button className="mt-4" variant="success" icon={PackageCheck} onClick={() => setIsSOModalOpen(true)}>
                  Generate Sales Order
                </Button>
              )}
            </Card>
          ) : (
            <div className="space-y-6">
              <Card>
                <CardHeader
                  title={`Sales Order: ${so.soNumber}`}
                  subtitle={`Created on ${dayjs(so.soDate).format('DD MMM YYYY')} | Order Value: ${formatINR(so.grandTotal)}`}
                  action={
                    !isHandedOver ? (
                      <Button variant="success" icon={Factory} onClick={() => setIsHandoverModalOpen(true)}>
                        Handover to Production
                      </Button>
                    ) : (
                      <Badge variant="success" size="lg">Handed Over to Production</Badge>
                    )
                  }
                />
                <CardContent className="space-y-6">
                  {/* Status Banner */}
                  {isHandedOver ? (
                    <div className="bg-emerald-50 border border-emerald-300 p-4 rounded-xl flex items-start gap-3 text-xs text-emerald-950">
                      <Factory className="w-5 h-5 text-emerald-700 flex-shrink-0 mt-0.5" />
                      <div>
                        <span className="font-bold">Handed Over to Production</span>
                        <p className="mt-0.5 text-emerald-900 leading-relaxed">
                          Handed over by {so.productionHandover?.handedOverBy?.name || 'Sales Admin'} on{' '}
                          {dayjs(so.productionHandover?.handoverDate).format('DD MMM YYYY, hh:mm A')}. Target completion: {dayjs(so.productionHandover?.targetCompletionDate).format('DD MMM YYYY')}.
                        </p>
                        {so.productionHandover?.handoverRemarks && (
                          <p className="mt-1 font-medium text-emerald-800">Remarks: {so.productionHandover.handoverRemarks}</p>
                        )}
                      </div>
                    </div>
                  ) : (
                    <div className="bg-amber-50 border border-amber-300 p-4 rounded-xl flex items-center justify-between text-xs text-amber-950">
                      <div>
                        <span className="font-bold">Pending Production Handover</span>
                        <p className="mt-0.5 text-amber-900">
                          Order is confirmed. Sign-off and release this Sales Order to the shop-floor manufacturing team.
                        </p>
                      </div>
                      <Button size="sm" variant="success" icon={Factory} onClick={() => setIsHandoverModalOpen(true)}>
                        Handover to Production
                      </Button>
                    </div>
                  )}

                  {/* Summary Grid */}
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-xs bg-slate-50 p-4 rounded-xl border border-slate-200">
                    <div>
                      <span className="text-slate-400 block">SO Number:</span>
                      <span className="font-semibold text-slate-900">{so.soNumber}</span>
                    </div>
                    <div>
                      <span className="text-slate-400 block">Committed Dispatch:</span>
                      <span className="font-bold text-sky-700">
                        {dayjs(so.committedDispatchDate).format('DD MMM YYYY')}
                      </span>
                    </div>
                    <div>
                      <span className="text-slate-400 block">Delivery Schedule:</span>
                      <span className="font-semibold text-slate-900">{so.deliverySchedule}</span>
                    </div>
                    <div>
                      <span className="text-slate-400 block">Status:</span>
                      <Badge size="sm">{so.status}</Badge>
                    </div>
                  </div>

                  {/* Line Items */}
                  <div className="border border-slate-200 rounded-xl overflow-x-auto">
                    <table className="w-full text-left text-xs">
                      <thead className="bg-slate-50 border-b border-slate-200 text-slate-700 font-semibold">
                        <tr>
                          <th className="p-3 w-10 text-center">#</th>
                          <th className="p-3">Equipment / Item Description</th>
                          <th className="p-3 w-20 text-center">HSN</th>
                          <th className="p-3 w-20 text-center">Qty</th>
                          <th className="p-3 w-28 text-right">Unit Rate</th>
                          <th className="p-3 w-32 text-right">Total (INR)</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100">
                        {so.items?.map((it, idx) => (
                          <tr key={idx}>
                            <td className="p-3 text-center text-slate-400 font-medium">{idx + 1}</td>
                            <td className="p-3 font-semibold text-slate-900">{it.productName}</td>
                            <td className="p-3 text-center text-slate-600">{it.hsnCode}</td>
                            <td className="p-3 text-center font-bold text-slate-800">{it.quantity} Nos</td>
                            <td className="p-3 text-right text-slate-700">{formatINR(it.unitPrice)}</td>
                            <td className="p-3 text-right font-bold text-slate-900">{formatINR(it.totalAmount)}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </CardContent>
              </Card>
            </div>
          )}
        </div>
      )}

      {/* TAB 6: COMPLETE ACTIVITY TIMELINE */}
      {activeTab === 'timeline' && (
        <Card>
          <CardHeader
            title="Complete Lead Audit Timeline"
            subtitle="Every status change, revision, verification check, and production milestone"
          />
          <CardContent>
            <LeadTimeline leadId={lead._id} />
          </CardContent>
        </Card>
      )}

      {/* WORKFLOW MODALS */}
      <QualifyModal
        isOpen={isQualifyOpen}
        onClose={() => setIsQualifyOpen(false)}
        lead={lead}
        onUpdated={fetchLeadData}
      />

      <CustomerMappingModal
        isOpen={isCustomerModalOpen}
        onClose={() => setIsCustomerModalOpen(false)}
        lead={lead}
        onUpdated={fetchLeadData}
      />

      <QuotationModal
        isOpen={isQuoteModalOpen}
        onClose={() => setIsQuoteModalOpen(false)}
        lead={lead}
        existingQuotation={quotation}
        isRevision={isQuoteRevision}
        onSuccess={fetchLeadData}
      />

      <CustomerFeedbackModal
        isOpen={isFeedbackModalOpen}
        onClose={() => setIsFeedbackModalOpen(false)}
        quotation={quotation}
        onUpdated={fetchLeadData}
      />

      <MarkWonModal
        isOpen={isMarkWonOpen}
        onClose={() => setIsMarkWonOpen(false)}
        quotation={quotation}
        onUpdated={fetchLeadData}
      />

      <ProformaInvoiceModal
        isOpen={isPIOpan}
        onClose={() => setIsPIOpen(false)}
        quotation={quotation}
        lead={lead}
        onUpdated={fetchLeadData}
      />

      <CustomerPOModal
        isOpen={isPOModalOpen}
        onClose={() => setIsPOModalOpen(false)}
        lead={lead}
        quotation={quotation}
        pi={pi}
        onUpdated={fetchLeadData}
      />

      <POVerificationModal
        isOpen={isVerificationModalOpen}
        onClose={() => setIsVerificationModalOpen(false)}
        lead={lead}
        customerPO={po}
        quotation={quotation}
        onSuccess={fetchLeadData}
      />

      <POAmendmentModal
        isOpen={isAmendmentModalOpen}
        onClose={() => setIsAmendmentModalOpen(false)}
        customerPO={po}
        onUpdated={fetchLeadData}
      />

      <SalesOrderModal
        isOpen={isSOModalOpen}
        onClose={() => setIsSOModalOpen(false)}
        lead={lead}
        customerPO={po}
        latestVerification={latestVerification}
        onSuccess={fetchLeadData}
      />

      <ProductionHandoverModal
        isOpen={isHandoverModalOpen}
        onClose={() => setIsHandoverModalOpen(false)}
        salesOrder={so}
        onUpdated={fetchLeadData}
      />
    </div>
  );
};
