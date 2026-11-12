import React from 'react';
import Modal from '../../components/common/Modal';
import Badge from '../../components/common/Badge';
import Button from '../../components/common/Button';
import { Calculator, CalendarCheck, Award, Mail, Phone, MapPin, CheckSquare } from 'lucide-react';

const EnquiryDetailModal = ({ isOpen, onClose, enquiry, onConvertToEstimation, onAddFollowUp, onLeadDecision }) => {
  if (!enquiry) return null;

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={`Enquiry Dossier — ${enquiry.enquiryNumber}`}
      maxWidth="max-w-4xl"
    >
      <div className="space-y-6 text-xs">
        {/* Quick Header Banner */}
        <div className="p-4 bg-slate-50 border border-slate-200/80 rounded-xl flex flex-wrap items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-base font-bold text-brand-900">{enquiry.companyName}</span>
              <Badge>{enquiry.status}</Badge>
              <Badge variant="primary">{enquiry.priority} Priority</Badge>
            </div>
            <p className="text-slate-500 mt-1">
              Logged on {new Date(enquiry.enquiryDate).toLocaleDateString()} via {enquiry.enquirySource}
            </p>
          </div>

          {/* Direct Workflow Conversion Buttons */}
          <div className="flex items-center gap-2">
            <Button
              size="sm"
              variant="outline"
              icon={Calculator}
              onClick={() => {
                onClose();
                onConvertToEstimation(enquiry);
              }}
            >
              Cost Estimation
            </Button>
            <Button
              size="sm"
              variant="secondary"
              icon={CalendarCheck}
              onClick={() => {
                onClose();
                onAddFollowUp(enquiry);
              }}
            >
              Add Follow-up
            </Button>
            <Button
              size="sm"
              variant="primary"
              icon={Award}
              onClick={() => {
                onClose();
                onLeadDecision(enquiry);
              }}
            >
              Lead Won / Lost
            </Button>
          </div>
        </div>

        {/* Customer & Contact Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="p-4 bg-white border border-slate-200 rounded-xl space-y-2">
            <h4 className="font-bold uppercase tracking-wider text-slate-700 text-[11px] border-b border-slate-100 pb-1">
              Contact Person Information
            </h4>
            <p className="font-semibold text-slate-800 text-sm">{enquiry.contactPerson}</p>
            {enquiry.designation && <p className="text-slate-500">{enquiry.designation}</p>}
            <p className="text-slate-700 flex items-center gap-1.5 pt-1">
              <Phone className="w-3.5 h-3.5 text-slate-400" /> {enquiry.mobileNumber}
            </p>
            <p className="text-slate-700 flex items-center gap-1.5">
              <Mail className="w-3.5 h-3.5 text-slate-400" /> {enquiry.email}
            </p>
          </div>

          <div className="p-4 bg-white border border-slate-200 rounded-xl space-y-2">
            <h4 className="font-bold uppercase tracking-wider text-slate-700 text-[11px] border-b border-slate-100 pb-1">
              Location & Commercial Registration
            </h4>
            <p className="text-slate-700 flex items-start gap-1.5">
              <MapPin className="w-3.5 h-3.5 text-slate-400 mt-0.5" />
              <span>{enquiry.billingAddress || `${enquiry.city}, ${enquiry.state || 'Tamil Nadu'}`}</span>
            </p>
            <p className="text-slate-600">
              GSTIN: <span className="font-mono text-slate-800">{enquiry.gstin || 'Not Provided'}</span>
            </p>
            <p className="text-slate-600">
              Assigned Sales Officer: <span className="font-semibold text-brand-900">{enquiry.assignedTo?.name || 'Unassigned'}</span>
            </p>
          </div>
        </div>

        {/* Products Table */}
        <div className="border border-slate-200 rounded-xl overflow-hidden">
          <div className="px-4 py-2.5 bg-slate-100 border-b border-slate-200 font-bold uppercase tracking-wider text-[11px] text-slate-700">
            Requested Equipment Line Items ({enquiry.products?.length || 0})
          </div>
          <table className="w-full text-left">
            <thead className="bg-slate-50 border-b border-slate-200 text-[11px] text-slate-500">
              <tr>
                <th className="py-2.5 px-4">#</th>
                <th className="py-2.5 px-4">Equipment & Model</th>
                <th className="py-2.5 px-4">Operating Temp / Specs</th>
                <th className="py-2.5 px-4">Qty</th>
                <th className="py-2.5 px-4">Expected Budget</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {enquiry.products?.map((prod, idx) => (
                <tr key={idx} className="hover:bg-slate-50/60">
                  <td className="py-3 px-4 font-semibold text-slate-400">{idx + 1}</td>
                  <td className="py-3 px-4">
                    <span className="font-bold text-slate-800 block">{prod.productName}</span>
                    <span className="text-[11px] text-slate-500 font-mono">Model: {prod.modelNumber || 'Custom Spec'}</span>
                    {prod.application && (
                      <p className="text-[11px] text-slate-500 mt-0.5 italic">App: {prod.application}</p>
                    )}
                  </td>
                  <td className="py-3 px-4">
                    <span className="font-semibold text-blue-700 block">{prod.temperatureRequirements || 'Standard'}</span>
                    <span className="text-[11px] text-slate-500">{prod.sensorRequirements || 'PT-100 RTD'}</span>
                  </td>
                  <td className="py-3 px-4 font-bold text-slate-800">
                    {prod.quantity} {prod.unit || 'Nos'}
                  </td>
                  <td className="py-3 px-4 font-semibold text-slate-800">
                    {prod.expectedBudget ? `₹${prod.expectedBudget.toLocaleString('en-IN')}` : 'To be estimated'}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {enquiry.remarks && (
          <div className="p-3 bg-amber-50/60 border border-amber-200 rounded-lg">
            <span className="font-semibold text-amber-900 block mb-0.5">Remarks / Customer Notes:</span>
            <p className="text-amber-800">{enquiry.remarks}</p>
          </div>
        )}
      </div>
    </Modal>
  );
};

export default EnquiryDetailModal;
