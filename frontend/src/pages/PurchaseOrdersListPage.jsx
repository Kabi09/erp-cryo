import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../services/api';
import { useToastStore } from '../store/useToastStore';
import { Card, CardHeader, CardContent } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { Select } from '../components/ui/Select';
import { Badge } from '../components/ui/Badge';
import { Modal } from '../components/ui/Modal';
import { POVerificationModal } from '../components/workflow/POVerificationModal';
import { POAmendmentModal } from '../components/workflow/POAmendmentModal';
import { SalesOrderModal } from '../components/workflow/SalesOrderModal';
import {
  FileCheck2,
  Search,
  Download,
  ChevronLeft,
  ChevronRight,
  ExternalLink,
  ClipboardCheck,
  ShieldCheck,
  ShieldAlert,
  AlertTriangle,
  Edit3,
  PackageCheck,
  Eye,
  CheckCircle2,
  XCircle,
  FileText,
  Clock,
  History
} from 'lucide-react';
import dayjs from 'dayjs';

export const PurchaseOrdersListPage = () => {
  const [pos, setPos] = useState([]);
  const [pagination, setPagination] = useState({ page: 1, pages: 1, total: 0 });
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [verificationStatus, setVerificationStatus] = useState('');

  // Selected PO detailed object for workflows
  const [selectedPoData, setSelectedPoData] = useState(null); // full populated PO
  const [isVerifying, setIsVerifying] = useState(false);
  const [isAmending, setIsAmending] = useState(false);
  const [isCreatingSO, setIsCreatingSO] = useState(false);
  const [isDetailOpen, setIsDetailOpen] = useState(false);
  const [actionLoadingId, setActionLoadingId] = useState(null);

  const addToast = useToastStore((state) => state.addToast);

  const fetchPOs = async (page = 1) => {
    try {
      setLoading(true);
      const params = { page, limit: 10 };
      if (search) params.search = search;
      if (verificationStatus) params.verificationStatus = verificationStatus;

      const res = await api.get('/purchase-orders', { params });
      setPos(res.data.data);
      setPagination(res.data.pagination);
    } catch (err) {
      addToast({ type: 'error', title: 'Error', message: 'Failed to fetch Purchase Orders' });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPOs(1);
  }, [verificationStatus]);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    fetchPOs(1);
  };

  // Helper to fetch full PO details before opening workflow modals
  const loadPoAndExecute = async (poId, callback) => {
    try {
      setActionLoadingId(poId);
      const res = await api.get(`/purchase-orders/${poId}`);
      setSelectedPoData(res.data.data);
      callback(res.data.data);
    } catch (err) {
      addToast({
        type: 'error',
        title: 'Error',
        message: err.response?.data?.message || 'Failed to load purchase order details',
      });
    } finally {
      setActionLoadingId(null);
    }
  };

  const handleOpenVerify = (poId) => {
    loadPoAndExecute(poId, () => setIsVerifying(true));
  };

  const handleOpenAmend = (poId) => {
    loadPoAndExecute(poId, () => setIsAmending(true));
  };

  const handleOpenCreateSO = (poId) => {
    loadPoAndExecute(poId, (po) => {
      if (po.verificationStatus !== 'Passed' || !po.latestVerification?.allMatched) {
        addToast({
          type: 'error',
          title: 'Action Strictly Blocked',
          message: 'All 5 points must pass verification before creating a Sales Order!',
        });
        return;
      }
      setIsCreatingSO(true);
    });
  };

  const handleOpenDetail = (poId) => {
    loadPoAndExecute(poId, () => setIsDetailOpen(true));
  };

  const formatINR = (n) => 'Rs. ' + Number(n || 0).toLocaleString('en-IN');

  const getVerificationBadge = (st) => {
    switch (st) {
      case 'Passed':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
            Passed (SO Cleared)
          </span>
        );
      case 'Failed_Mismatch':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-red-50 text-red-700 border border-red-200">
            <ShieldAlert className="w-3.5 h-3.5 text-red-600" />
            Mismatch (SO Blocked)
          </span>
        );
      case 'Amendment_Requested':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-amber-50 text-amber-800 border border-amber-200">
            <Clock className="w-3.5 h-3.5 text-amber-600" />
            Amendment Requested
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-slate-100 text-slate-700 border border-slate-200">
            <Clock className="w-3.5 h-3.5 text-slate-500" />
            Unverified
          </span>
        );
    }
  };

  // Stats calculation
  const totalPassed = pos.filter((p) => p.verificationStatus === 'Passed').length;
  const totalMismatches = pos.filter((p) => p.verificationStatus === 'Failed_Mismatch').length;
  const totalPending = pos.filter((p) => p.verificationStatus === 'Unverified').length;

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 sm:gap-4 bg-white p-4 sm:p-5 rounded-2xl border border-slate-200 shadow-2xs">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-lg sm:text-xl font-bold text-slate-900 tracking-tight">Customer Purchase Orders (PO)</h1>
            <Badge variant="primary">{pagination.total} Total</Badge>
          </div>
          <p className="text-xs text-slate-500 mt-0.5">
            Stage 9 & 10: Official customer orders, mandatory Five-Point verification audit, and SO clearance
          </p>
        </div>

        {/* Quick status summary cards */}
        <div className="flex items-center gap-2 sm:gap-3 flex-wrap">
          <div className="bg-emerald-50 border border-emerald-100 px-3 py-1.5 rounded-xl text-center flex-1 sm:flex-initial">
            <span className="block text-[11px] font-semibold text-emerald-800">Cleared for SO</span>
            <span className="text-sm font-bold text-emerald-700">{totalPassed}</span>
          </div>
          <div className="bg-red-50 border border-red-100 px-3 py-1.5 rounded-xl text-center flex-1 sm:flex-initial">
            <span className="block text-[11px] font-semibold text-red-800">Mismatches</span>
            <span className="text-sm font-bold text-red-700">{totalMismatches}</span>
          </div>
          <div className="bg-slate-50 border border-slate-200 px-3 py-1.5 rounded-xl text-center flex-1 sm:flex-initial">
            <span className="block text-[11px] font-semibold text-slate-700">Pending Check</span>
            <span className="text-sm font-bold text-slate-800">{totalPending}</span>
          </div>
        </div>
      </div>

      {/* Filter and Search */}
      <Card>
        <CardContent className="p-4">
          <form onSubmit={handleSearchSubmit} className="flex flex-col sm:flex-row gap-3">
            <div className="flex-1">
              <Input
                placeholder="Search PO number or item summary..."
                icon={Search}
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>

            <div className="w-full sm:w-64">
              <Select
                placeholder="All Verification Statuses"
                value={verificationStatus}
                onChange={(e) => setVerificationStatus(e.target.value)}
              >
                <option value="Unverified">Unverified (Pending Check)</option>
                <option value="Passed">Passed (Cleared for SO)</option>
                <option value="Failed_Mismatch">Failed Mismatch (SO Blocked)</option>
                <option value="Amendment_Requested">Amendment Requested</option>
              </Select>
            </div>

            <Button type="submit" variant="secondary">
              Filter
            </Button>
            {(search || verificationStatus) && (
              <Button
                variant="ghost"
                onClick={() => {
                  setSearch('');
                  setVerificationStatus('');
                  fetchPOs(1);
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
          <table className="w-full text-left text-xs text-slate-600 min-w-[760px]">
            <thead className="bg-slate-50 border-b border-slate-200 text-slate-700 font-semibold text-[11px] uppercase tracking-wider">
              <tr>
                <th className="py-3 px-4">Customer PO Number</th>
                <th className="py-3 px-4">Customer Account</th>
                <th className="py-3 px-4">Item & Specification</th>
                <th className="py-3 px-4">Delivery Date</th>
                <th className="py-3 px-4 text-right">PO Value (INR)</th>
                <th className="py-3 px-4 text-center">Version</th>
                <th className="py-3 px-4">5-Point Verification</th>
                <th className="py-3 px-4 text-right">Direct Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {loading ? (
                <tr>
                  <td colSpan="8" className="text-center py-12 text-slate-400">
                    <div className="flex justify-center items-center gap-2">
                      <div className="w-4 h-4 border-2 border-sky-600 border-t-transparent rounded-full animate-spin" />
                      <span>Loading purchase orders...</span>
                    </div>
                  </td>
                </tr>
              ) : pos.length === 0 ? (
                <tr>
                  <td colSpan="8" className="text-center py-12 text-slate-400">
                    No customer purchase orders found matching your criteria.
                  </td>
                </tr>
              ) : (
                pos.map((po) => {
                  const isActionLoading = actionLoadingId === po._id;
                  const isPassed = po.verificationStatus === 'Passed';
                  const isMismatch = po.verificationStatus === 'Failed_Mismatch';

                  return (
                    <tr
                      key={po._id}
                      className="hover:bg-sky-50/40 transition cursor-pointer"
                      onClick={() => handleOpenDetail(po._id)}
                    >
                      <td className="py-3.5 px-4 font-mono font-bold text-sky-700">
                        <span className="hover:underline">{po.poNumber}</span>
                        <div className="text-[10px] text-slate-400 font-normal">
                          PO Date: {dayjs(po.poDate).format('DD MMM YYYY')}
                        </div>
                      </td>
                      <td className="py-3.5 px-4" onClick={(e) => e.stopPropagation()}>
                        <div className="font-bold text-slate-900">{po.customer?.companyName || 'N/A'}</div>
                        <div className="text-[10px] text-slate-400">{po.customer?.customerCode}</div>
                      </td>
                      <td className="py-3.5 px-4 max-w-[220px]">
                        <div className="truncate font-medium text-slate-800">{po.itemSummary}</div>
                        <div className="text-[10px] text-slate-400">Qty: {po.quantity} Nos</div>
                      </td>
                      <td className="py-3.5 px-4 text-slate-700">
                        {dayjs(po.deliveryDate).format('DD MMM YYYY')}
                      </td>
                      <td className="py-3.5 px-4 text-right font-bold text-slate-900">
                        {formatINR(po.poValue)}
                      </td>
                      <td className="py-3.5 px-4 text-center">
                        <span className="font-mono text-xs font-semibold bg-slate-100 text-slate-700 px-2 py-0.5 rounded">
                          v{po.amendmentVersion || 1}
                        </span>
                      </td>
                      <td className="py-3.5 px-4">
                        {getVerificationBadge(po.verificationStatus)}
                      </td>
                      <td className="py-3.5 px-4 text-right" onClick={(e) => e.stopPropagation()}>
                        <div className="flex justify-end items-center gap-1.5 flex-wrap">
                          {/* 5-Point Verify button */}
                          <Button
                            variant={isPassed ? 'ghost' : isMismatch ? 'danger' : 'primary'}
                            size="sm"
                            loading={isActionLoading}
                            icon={isPassed ? CheckCircle2 : ShieldCheck}
                            onClick={() => handleOpenVerify(po._id)}
                            title={isPassed ? 'Review Verification Details' : 'Execute 5-Point Verification'}
                          >
                            {isPassed ? 'Verified' : 'Verify'}
                          </Button>

                          {/* Amend Button */}
                          <Button
                            variant="secondary"
                            size="sm"
                            icon={Edit3}
                            onClick={() => handleOpenAmend(po._id)}
                            title="Submit Amendment if PO has mismatches"
                          >
                            Amend
                          </Button>

                          {/* Create Sales Order button if Passed */}
                          {isPassed && (
                            <Button
                              variant="secondary"
                              size="sm"
                              className="text-emerald-700 hover:text-emerald-800 hover:bg-emerald-50 border-emerald-200"
                              icon={PackageCheck}
                              onClick={() => handleOpenCreateSO(po._id)}
                              title="Create Sales Order (All 5 Checks Passed)"
                            >
                              Create SO
                            </Button>
                          )}

                          {/* PO Document Link */}
                          {po.documentPath && (
                            <a
                              href={po.documentPath}
                              target="_blank"
                              rel="noreferrer"
                              className="inline-flex items-center gap-1 px-2.5 py-1 text-xs font-medium rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 transition"
                              title="Download uploaded customer PO file"
                            >
                              <Download className="w-3.5 h-3.5" />
                            </a>
                          )}

                          {/* Link to Lead Workflow */}
                          <Link to={`/leads/${po.lead?._id || po.lead}`} title="Go to Lead Detail Timeline">
                            <Button variant="ghost" size="sm" icon={ExternalLink} />
                          </Link>
                        </div>
                      </td>
                    </tr>
                  );
                })
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
                onClick={() => fetchPOs(pagination.page - 1)}
                icon={ChevronLeft}
              >
                Previous
              </Button>
              <Button
                variant="secondary"
                size="sm"
                disabled={pagination.page >= pagination.pages}
                onClick={() => fetchPOs(pagination.page + 1)}
              >
                Next <ChevronRight className="w-3.5 h-3.5 ml-1 inline" />
              </Button>
            </div>
          </div>
        )}
      </Card>

      {/* PO Detail / Audit Modal */}
      {isDetailOpen && selectedPoData && (
        <Modal
          isOpen={isDetailOpen}
          onClose={() => setIsDetailOpen(false)}
          title={`Customer PO: ${selectedPoData.poNumber} (v${selectedPoData.amendmentVersion || 1})`}
          subtitle={`Account: ${selectedPoData.customer?.companyName || 'N/A'} | Lead Ref: ${selectedPoData.lead?.leadNumber || 'N/A'}`}
          size="lg"
        >
          <div className="space-y-5">
            {/* Summary Banner */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center bg-slate-50 p-4 rounded-xl border border-slate-200 gap-3">
              <div>
                <span className="text-xs text-slate-400 block">Five-Point Verification Status:</span>
                <div className="mt-1">{getVerificationBadge(selectedPoData.verificationStatus)}</div>
              </div>
              <div className="text-left sm:text-right">
                <span className="text-xs text-slate-400 block">Total PO Value:</span>
                <span className="text-lg font-bold text-slate-900">{formatINR(selectedPoData.poValue)}</span>
              </div>
            </div>

            {/* PO Specifications Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs bg-white p-4 rounded-xl border border-slate-100 shadow-2xs">
              <div>
                <span className="text-slate-400 block">Item Summary & Spec:</span>
                <span className="font-semibold text-slate-800 text-sm mt-0.5 block">{selectedPoData.itemSummary}</span>
              </div>
              <div>
                <span className="text-slate-400 block">Ordered Quantity:</span>
                <span className="font-semibold text-slate-800 text-sm mt-0.5 block">{selectedPoData.quantity} Nos</span>
              </div>
              <div>
                <span className="text-slate-400 block">Committed Delivery Date:</span>
                <span className="font-semibold text-slate-800 mt-0.5 block">
                  {dayjs(selectedPoData.deliveryDate).format('DD MMM YYYY')} {selectedPoData.deliveryPeriodText && `(${selectedPoData.deliveryPeriodText})`}
                </span>
              </div>
              <div>
                <span className="text-slate-400 block">Payment Terms:</span>
                <span className="font-semibold text-slate-800 mt-0.5 block">{selectedPoData.paymentTerms}</span>
              </div>
            </div>

            {/* Verification Checks Audit */}
            {selectedPoData.latestVerification ? (
              <div className="border border-slate-200 rounded-xl overflow-hidden">
                <div className="bg-slate-50 px-4 py-2.5 border-b border-slate-200 flex justify-between items-center">
                  <div className="flex items-center gap-2">
                    <ShieldCheck className="w-4 h-4 text-sky-600" />
                    <span className="text-xs font-bold text-slate-800">
                      Latest 5-Point Verification Audit (Round {selectedPoData.latestVerification.verificationRound || 1})
                    </span>
                  </div>
                  <span className="text-[11px] text-slate-400">
                    Verified on {dayjs(selectedPoData.latestVerification.createdAt).format('DD MMM YYYY, hh:mm A')}
                  </span>
                </div>
                <div className="p-4 space-y-3">
                  {Object.entries(selectedPoData.latestVerification.checks || {}).map(([key, check]) => {
                    const isMatch = check.status === 'MATCH';
                    return (
                      <div
                        key={key}
                        className={`p-3 rounded-lg border text-xs flex items-start justify-between gap-3 ${
                          isMatch ? 'bg-emerald-50/50 border-emerald-100' : 'bg-red-50/60 border-red-200'
                        }`}
                      >
                        <div>
                          <span className="font-bold text-slate-800">{check.pointName || key}</span>
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 mt-1 text-[11px]">
                            <div>
                              <span className="text-slate-400">Expected: </span>
                              <span className="font-medium text-slate-700">{check.expectedValue}</span>
                            </div>
                            <div>
                              <span className="text-slate-400">Actual: </span>
                              <span className="font-medium text-slate-700">{check.actualValue}</span>
                            </div>
                          </div>
                          {check.remarks && (
                            <p className="mt-1 text-[11px] text-slate-500 italic">Remark: {check.remarks}</p>
                          )}
                        </div>
                        <span
                          className={`px-2 py-0.5 rounded text-[10px] font-bold shrink-0 ${
                            isMatch ? 'bg-emerald-100 text-emerald-800' : 'bg-red-100 text-red-800'
                          }`}
                        >
                          {isMatch ? 'MATCH' : 'MISMATCH'}
                        </span>
                      </div>
                    );
                  })}
                </div>
              </div>
            ) : (
              <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 text-xs text-amber-900 flex items-start gap-3">
                <AlertTriangle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
                <div>
                  <span className="font-bold">No 5-Point Verification Recorded Yet</span>
                  <p className="mt-0.5">
                    Before a Sales Order can be generated, the Sales Admin must execute and pass all 5 verification points.
                  </p>
                </div>
              </div>
            )}

            {/* Amendment History Audit */}
            {selectedPoData.amendmentHistory && selectedPoData.amendmentHistory.length > 0 && (
              <div className="border border-slate-200 rounded-xl overflow-hidden">
                <div className="bg-slate-50 px-4 py-2.5 border-b border-slate-200 flex items-center gap-2">
                  <History className="w-4 h-4 text-slate-600" />
                  <span className="text-xs font-bold text-slate-800">
                    PO Amendment Audit Trail ({selectedPoData.amendmentHistory.length} amendments)
                  </span>
                </div>
                <div className="p-4 space-y-3">
                  {selectedPoData.amendmentHistory.map((hist, i) => (
                    <div key={i} className="bg-slate-50 border border-slate-200 rounded-lg p-3 text-xs">
                      <div className="flex justify-between items-center mb-1">
                        <span className="font-bold text-slate-900">Version v{hist.amendmentVersion}</span>
                        <span className="text-[10px] text-slate-400">
                          {dayjs(hist.createdAt).format('DD MMM YYYY, hh:mm A')}
                        </span>
                      </div>
                      <p className="text-slate-600 font-medium">Reason: {hist.reasonForAmendment}</p>
                      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 mt-2 text-[11px] text-slate-500">
                        <div>Value: {formatINR(hist.poValue)}</div>
                        <div>Qty: {hist.quantity}</div>
                        <div>Delivery: {dayjs(hist.deliveryDate).format('DD MMM YYYY')}</div>
                        <div>Terms: {hist.paymentTerms}</div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Actions Toolbar */}
            <div className="flex justify-end gap-3 pt-3 border-t border-slate-100 flex-wrap">
              {selectedPoData.documentPath && (
                <a
                  href={selectedPoData.documentPath}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-semibold rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700"
                >
                  <Download className="w-3.5 h-3.5" />
                  Download Customer PO File
                </a>
              )}

              <Button
                variant="secondary"
                icon={Edit3}
                onClick={() => {
                  setIsDetailOpen(false);
                  setIsAmending(true);
                }}
              >
                Submit Amendment
              </Button>

              <Button
                variant="primary"
                icon={ShieldCheck}
                onClick={() => {
                  setIsDetailOpen(false);
                  setIsVerifying(true);
                }}
              >
                Execute 5-Point Check
              </Button>

              {selectedPoData.verificationStatus === 'Passed' && (
                <Button
                  className="bg-emerald-600 hover:bg-emerald-700 text-white"
                  icon={PackageCheck}
                  onClick={() => {
                    setIsDetailOpen(false);
                    setIsCreatingSO(true);
                  }}
                >
                  Create Sales Order
                </Button>
              )}
            </div>
          </div>
        </Modal>
      )}

      {/* Workflow Modals */}
      {isVerifying && selectedPoData && (
        <POVerificationModal
          isOpen={isVerifying}
          onClose={() => setIsVerifying(false)}
          lead={selectedPoData.lead}
          customerPO={selectedPoData}
          quotation={selectedPoData.quotation}
          onSuccess={() => {
            fetchPOs(pagination.page);
            setIsVerifying(false);
          }}
        />
      )}

      {isAmending && selectedPoData && (
        <POAmendmentModal
          isOpen={isAmending}
          onClose={() => setIsAmending(false)}
          customerPO={selectedPoData}
          onUpdated={() => {
            fetchPOs(pagination.page);
            setIsAmending(false);
          }}
        />
      )}

      {isCreatingSO && selectedPoData && (
        <SalesOrderModal
          isOpen={isCreatingSO}
          onClose={() => setIsCreatingSO(false)}
          lead={selectedPoData.lead}
          customerPO={selectedPoData}
          latestVerification={selectedPoData.latestVerification}
          onSuccess={() => {
            fetchPOs(pagination.page);
            setIsCreatingSO(false);
          }}
        />
      )}
    </div>
  );
};
