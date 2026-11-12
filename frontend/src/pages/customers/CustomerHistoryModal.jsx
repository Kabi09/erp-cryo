import React, { useState, useEffect } from 'react';
import Modal from '../../components/common/Modal';
import Badge from '../../components/common/Badge';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import api from '../../services/api';
import { History, FileText, CheckCircle2, Inbox } from 'lucide-react';

const CustomerHistoryModal = ({ isOpen, onClose, customer }) => {
  const [history, setHistory] = useState(null);
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState('enquiries');

  useEffect(() => {
    if (customer?._id && isOpen) {
      const fetchHistory = async () => {
        setLoading(true);
        try {
          const res = await api.get(`/customers/${customer._id}/history`);
          if (res.data.success) {
            setHistory(res.data.data);
          }
        } catch (err) {
          console.error('Failed to load customer history', err);
        } finally {
          setLoading(false);
        }
      };
      fetchHistory();
    }
  }, [customer, isOpen]);

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={`Transaction History — ${customer?.companyName || ''}`}
      maxWidth="max-w-4xl"
    >
      {loading ? (
        <LoadingSpinner text="Retrieving transaction records..." />
      ) : (
        <div className="space-y-4">
          {/* Tabs */}
          <div className="flex border-b border-slate-200">
            <button
              onClick={() => setActiveTab('enquiries')}
              className={`px-4 py-2 text-xs font-semibold border-b-2 flex items-center gap-1.5 ${
                activeTab === 'enquiries'
                  ? 'border-brand-600 text-brand-900'
                  : 'border-transparent text-slate-500 hover:text-slate-800'
              }`}
            >
              <Inbox className="w-3.5 h-3.5" /> Enquiries ({history?.enquiries?.length || 0})
            </button>
            <button
              onClick={() => setActiveTab('quotations')}
              className={`px-4 py-2 text-xs font-semibold border-b-2 flex items-center gap-1.5 ${
                activeTab === 'quotations'
                  ? 'border-brand-600 text-brand-900'
                  : 'border-transparent text-slate-500 hover:text-slate-800'
              }`}
            >
              <FileText className="w-3.5 h-3.5" /> Quotations ({history?.quotations?.length || 0})
            </button>
            <button
              onClick={() => setActiveTab('salesOrders')}
              className={`px-4 py-2 text-xs font-semibold border-b-2 flex items-center gap-1.5 ${
                activeTab === 'salesOrders'
                  ? 'border-brand-600 text-brand-900'
                  : 'border-transparent text-slate-500 hover:text-slate-800'
              }`}
            >
              <CheckCircle2 className="w-3.5 h-3.5" /> Confirmed Sales Orders ({history?.salesOrders?.length || 0})
            </button>
          </div>

          {/* Tab Contents */}
          <div className="min-h-[220px]">
            {activeTab === 'enquiries' && (
              <div className="space-y-2">
                {history?.enquiries?.length === 0 ? (
                  <p className="text-xs text-slate-400 text-center py-8">No previous enquiries recorded.</p>
                ) : (
                  history?.enquiries?.map((enq) => (
                    <div key={enq._id} className="p-3 bg-slate-50 border border-slate-200/80 rounded-xl flex items-center justify-between">
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-xs text-brand-900">{enq.enquiryNumber}</span>
                          <Badge>{enq.status}</Badge>
                        </div>
                        <p className="text-xs text-slate-600 mt-1">
                          Source: {enq.enquirySource} • Contact: {enq.contactPerson} ({enq.mobileNumber})
                        </p>
                      </div>
                      <span className="text-xs text-slate-400">{new Date(enq.enquiryDate).toLocaleDateString()}</span>
                    </div>
                  ))
                )}
              </div>
            )}

            {activeTab === 'quotations' && (
              <div className="space-y-2">
                {history?.quotations?.length === 0 ? (
                  <p className="text-xs text-slate-400 text-center py-8">No quotations generated for this customer.</p>
                ) : (
                  history?.quotations?.map((q) => (
                    <div key={q._id} className="p-3 bg-slate-50 border border-slate-200/80 rounded-xl flex items-center justify-between">
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-xs text-brand-900">{q.quotationNumber} ({q.versionLabel})</span>
                          <Badge>{q.status}</Badge>
                        </div>
                        <p className="text-xs text-slate-700 font-semibold mt-1">
                          Grand Total: ₹{(q.grandTotal || 0).toLocaleString('en-IN')}
                        </p>
                      </div>
                      <span className="text-xs text-slate-400">{new Date(q.quotationDate).toLocaleDateString()}</span>
                    </div>
                  ))
                )}
              </div>
            )}

            {activeTab === 'salesOrders' && (
              <div className="space-y-2">
                {history?.salesOrders?.length === 0 ? (
                  <p className="text-xs text-slate-400 text-center py-8">No sales orders closed with this customer yet.</p>
                ) : (
                  history?.salesOrders?.map((so) => (
                    <div key={so._id} className="p-3 bg-slate-50 border border-slate-200/80 rounded-xl flex items-center justify-between">
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-xs text-brand-900">{so.soNumber}</span>
                          <Badge variant="success">{so.soStatus}</Badge>
                        </div>
                        <p className="text-xs text-slate-700 font-semibold mt-1">
                          SO Value: ₹{(so.soValue || 0).toLocaleString('en-IN')} • PO Ref: {so.customerPoNumber}
                        </p>
                      </div>
                      <span className="text-xs text-slate-400">{new Date(so.soDate).toLocaleDateString()}</span>
                    </div>
                  ))
                )}
              </div>
            )}
          </div>
        </div>
      )}
    </Modal>
  );
};

export default CustomerHistoryModal;
