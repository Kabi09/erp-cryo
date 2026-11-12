import React, { useState } from 'react';
import { Modal } from '../ui/Modal';
import { Button } from '../ui/Button';
import { Input } from '../ui/Input';
import { useToastStore } from '../../store/useToastStore';
import api from '../../services/api';
import { Share2, Mail, Copy, Check, Download, FileText, Send } from 'lucide-react';
import { downloadPdfBlob } from '../../utils/pdfDownloader';

export const ShareModal = ({
  isOpen,
  onClose,
  type = 'quotation', // 'quotation' | 'pi'
  documentId,
  documentNumber,
  customer,
  revisionLabel = '',
  grandTotal = 0,
}) => {
  const [recipientEmail, setRecipientEmail] = useState(customer?.email || '');
  const [subject, setSubject] = useState(
    `Cryo Scientific Systems: Commercial ${type === 'quotation' ? 'Quotation' : 'Proforma Invoice'} - ${documentNumber}`
  );
  const [message, setMessage] = useState(
    `Dear ${customer?.contactPerson?.name || customer?.companyName || 'Sir/Madam'},\n\nPlease find attached the official ${type === 'quotation' ? `Quotation (${revisionLabel || 'Rev 0'})` : 'Proforma Invoice'} ref: ${documentNumber} for your review and processing.\n\nTotal Value: Rs. ${Number(grandTotal).toLocaleString('en-IN')}\n\nWarm regards,\nCryo Scientific Systems Pvt Ltd\nGuindy Industrial Estate, Chennai`
  );
  const [copied, setCopied] = useState(false);
  const [sending, setSending] = useState(false);

  const addToast = useToastStore((state) => state.addToast);

  const shareUrl = `${window.location.origin}/${type === 'quotation' ? 'quotations' : 'proforma-invoices'}`;

  const handleCopyLink = () => {
    navigator.clipboard.writeText(shareUrl);
    setCopied(true);
    addToast({ type: 'success', title: 'Link Copied', message: 'Document access link copied to clipboard' });
    setTimeout(() => setCopied(false), 2000);
  };

  const handleCopySummary = () => {
    const summaryText = `*CRYO SCIENTIFIC SYSTEMS PVT LTD*\nDocument: ${type === 'quotation' ? 'Quotation' : 'Proforma Invoice'} (${documentNumber})\nCustomer: ${customer?.companyName || 'N/A'}\nTotal Amount: Rs. ${Number(grandTotal).toLocaleString('en-IN')}\nStatus: Active\nPortal Ref: ${shareUrl}`;
    navigator.clipboard.writeText(summaryText);
    addToast({ type: 'success', title: 'Summary Copied', message: 'Formatted commercial details copied to clipboard' });
  };

  const handleSendEmail = async (e) => {
    e.preventDefault();
    if (!recipientEmail) {
      addToast({ type: 'warning', title: 'Email Required', message: 'Please provide recipient email address' });
      return;
    }

    try {
      setSending(true);
      const endpoint = type === 'quotation' ? `/quotations/${documentId}/share` : `/proforma-invoices/${documentId}/share`;
      await api.post(endpoint, {
        recipientEmail,
        subject,
        message,
        shareMethod: 'Email',
      });

      addToast({
        type: 'success',
        title: 'Document Shared',
        message: `Official ${type.toUpperCase()} shared with ${recipientEmail}`,
      });
      onClose();
    } catch (err) {
      addToast({
        type: 'error',
        title: 'Share Failed',
        message: err.response?.data?.message || 'Could not send document',
      });
    } finally {
      setSending(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={`Share ${type === 'quotation' ? 'Quotation' : 'Proforma Invoice'}: ${documentNumber}`}
      subtitle="Email official proposal to customer, copy link, or export commercial details"
      size="md"
    >
      <div className="space-y-4">
        {/* Quick Copy Link & Summary */}
        <div className="bg-slate-50 border border-slate-200 rounded-xl p-3 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
          <div className="min-w-0">
            <span className="text-slate-400 block text-[10px] font-semibold uppercase">Quick Commercial Share</span>
            <span className="font-medium text-slate-800 truncate block">{documentNumber} • {customer?.companyName}</span>
          </div>
          <div className="flex gap-2 flex-wrap sm:flex-nowrap w-full sm:w-auto">
            <Button size="sm" variant="secondary" className="flex-1 sm:flex-none justify-center" icon={copied ? Check : Copy} onClick={handleCopyLink}>
              {copied ? 'Copied' : 'Copy Link'}
            </Button>
            <Button size="sm" variant="secondary" className="flex-1 sm:flex-none justify-center" onClick={handleCopySummary}>
              Copy Summary
            </Button>
          </div>
        </div>

        {/* Email Form */}
        <form onSubmit={handleSendEmail} className="space-y-3.5">
          <Input
            label="Recipient Email Address"
            type="email"
            required
            value={recipientEmail}
            onChange={(e) => setRecipientEmail(e.target.value)}
            placeholder="purchaser@institution.ac.in"
          />

          <Input
            label="Email Subject"
            required
            value={subject}
            onChange={(e) => setSubject(e.target.value)}
          />

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1.5">
              Email Body & Message
            </label>
            <textarea
              rows="5"
              required
              className="block w-full text-xs rounded-lg border border-slate-300 p-2.5 focus:outline-none focus:ring-2 focus:ring-sky-500/20 focus:border-sky-500 text-slate-800"
              value={message}
              onChange={(e) => setMessage(e.target.value)}
            />
          </div>

          <div className="flex justify-between items-center pt-3 border-t border-slate-100">
            <Button
              type="button"
              variant="outline"
              size="sm"
              icon={Download}
              onClick={() => {
                const endpoint = type === 'quotation' ? `/quotations/${documentId}/pdf` : `/proforma-invoices/${documentId}/pdf`;
                downloadPdfBlob(endpoint, `${documentNumber}.pdf`);
              }}
            >
              Save PDF
            </Button>

            <div className="flex gap-2">
              <Button variant="secondary" onClick={onClose}>
                Cancel
              </Button>
              <Button type="submit" loading={sending} icon={Send}>
                Send to Customer
              </Button>
            </div>
          </div>
        </form>
      </div>
    </Modal>
  );
};

