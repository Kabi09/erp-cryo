import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import api from '../services/api';
import { useToastStore } from '../store/useToastStore';
import { Card, CardHeader, CardContent } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Badge } from '../components/ui/Badge';
import { ProductionHandoverModal } from '../components/workflow/ProductionHandoverModal';
import {
  PackageCheck,
  Factory,
  Building2,
  Calendar,
  FileCheck2,
  FileText,
  Receipt,
  Download,
  CheckCircle2,
  ChevronLeft,
  ShieldCheck
} from 'lucide-react';
import dayjs from 'dayjs';

export const SalesOrderDetailPage = () => {
  const { id } = useParams();
  const [so, setSO] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isHandoverModalOpen, setIsHandoverModalOpen] = useState(false);

  const addToast = useToastStore((state) => state.addToast);

  const fetchSODetails = async () => {
    try {
      setLoading(true);
      const res = await api.get(`/sales-orders/${id}`);
      setSO(res.data.data);
    } catch (err) {
      addToast({ type: 'error', title: 'Error', message: 'Failed to fetch Sales Order details' });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (id) {
      fetchSODetails();
    }
  }, [id]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[500px]">
        <div className="flex flex-col items-center gap-3">
          <div className="w-9 h-9 border-3 border-sky-600 border-t-transparent rounded-full animate-spin" />
          <p className="text-xs font-medium text-slate-500">Loading sales order details...</p>
        </div>
      </div>
    );
  }

  if (!so) {
    return (
      <div className="p-8 text-center text-sm text-slate-500">
        Sales Order not found.{' '}
        <Link to="/sales-orders" className="text-sky-600 hover:underline">
          Return to Sales Orders
        </Link>
      </div>
    );
  }

  const isHandedOver = so.productionHandover?.isHandedOver === true;
  const formatINR = (n) => 'Rs. ' + Number(n || 0).toLocaleString('en-IN');

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-12">
      {/* Top Breadcrumb & Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 bg-white p-5 rounded-2xl border border-slate-200 shadow-2xs">
        <div className="flex items-center gap-3">
          <Link to="/sales-orders">
            <Button variant="secondary" size="sm" icon={ChevronLeft}>
              Back
            </Button>
          </Link>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-xl font-bold text-slate-900 tracking-tight">{so.soNumber}</h1>
              <Badge size="md">{so.status}</Badge>
            </div>
            <p className="text-xs text-slate-500 mt-0.5">
              Customer: {so.customer?.companyName} ({so.customer?.customerCode})
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {!isHandedOver ? (
            <Button
              variant="success"
              icon={Factory}
              onClick={() => setIsHandoverModalOpen(true)}
            >
              Handover to Production
            </Button>
          ) : (
            <div className="bg-emerald-50 text-emerald-800 border border-emerald-300 px-3 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1.5">
              <CheckCircle2 className="w-4 h-4 text-emerald-600" />
              Handed Over to Production
            </div>
          )}
          <Link to={`/leads/${so.lead?._id}`}>
            <Button variant="secondary" size="sm">
              View Lead Workflow Hub
            </Button>
          </Link>
        </div>
      </div>

      {/* Production Handover Status Banner */}
      {isHandedOver ? (
        <Card className="border-emerald-300 bg-emerald-50/40">
          <CardContent className="p-4 flex items-start gap-3.5 text-xs text-emerald-950">
            <Factory className="w-6 h-6 text-emerald-700 flex-shrink-0 mt-0.5" />
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <span className="font-bold text-sm">Officially Handed Over to Production</span>
                <span className="text-[11px] text-emerald-700">
                  ({dayjs(so.productionHandover?.handoverDate).format('DD MMM YYYY, hh:mm A')})
                </span>
              </div>
              <p className="text-emerald-900 leading-relaxed">
                Handover authorized and signed off by{' '}
                <span className="font-semibold">{so.productionHandover?.handedOverBy?.name || 'Sales Admin'}</span>.
                Target shop floor completion:{' '}
                <span className="font-semibold">
                  {dayjs(so.productionHandover?.targetCompletionDate).format('DD MMM YYYY')}
                </span>.
              </p>
              {so.productionHandover?.handoverRemarks && (
                <p className="font-medium text-emerald-800 mt-1">
                  Handover Remarks: {so.productionHandover.handoverRemarks}
                </p>
              )}
            </div>
          </CardContent>
        </Card>
      ) : (
        <Card className="border-amber-300 bg-amber-50/40">
          <CardContent className="p-4 flex items-center justify-between text-xs text-amber-950">
            <div>
              <span className="font-bold text-sm">Action Pending: Production Handover</span>
              <p className="mt-0.5 text-amber-900">
                Sales Order is commercially verified. Please sign off and hand over this order to the shop-floor manufacturing team.
              </p>
            </div>
            <Button variant="success" icon={Factory} onClick={() => setIsHandoverModalOpen(true)}>
              Handover Now
            </Button>
          </CardContent>
        </Card>
      )}

      {/* Linked Workflow Summary Grid */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 text-xs">
        <Card className="p-4 space-y-1">
          <span className="text-slate-400 block font-medium">Customer PO Reference</span>
          <span className="font-bold text-slate-900 text-sm">{so.customerPO?.poNumber}</span>
          <span className="text-[11px] text-slate-500 block">
            Dated: {dayjs(so.customerPO?.poDate).format('DD MMM YYYY')}
          </span>
        </Card>

        <Card className="p-4 space-y-1">
          <span className="text-slate-400 block font-medium">Approved Quotation</span>
          <span className="font-bold text-slate-900 text-sm">{so.quotation?.quotationNumber}</span>
          <span className="text-[11px] text-slate-500 block">
            Winning Rev: {so.quotationRevision?.revisionLabel || 'Rev 0'}
          </span>
        </Card>

        <Card className="p-4 space-y-1">
          <span className="text-slate-400 block font-medium">Proforma Invoice</span>
          <span className="font-bold text-slate-900 text-sm">
            {so.proformaInvoice?.piNumber || 'Direct PO'}
          </span>
          <span className="text-[11px] text-slate-500 block">Commercial Release</span>
        </Card>

        <Card className="p-4 space-y-1">
          <span className="text-slate-400 block font-medium">Total Order Value</span>
          <span className="font-bold text-emerald-700 text-base">{formatINR(so.grandTotal)}</span>
          <span className="text-[11px] text-slate-500 block">Inclusive of 18% GST</span>
        </Card>
      </div>

      {/* Main Order Details Card */}
      <Card>
        <CardHeader
          title="Sales Order Line Items & Manufacturing Bill"
          subtitle="Specifications released to Cryo Scientific fabrication facility"
        />
        <CardContent className="space-y-6">
          <div className="border border-slate-200 rounded-xl overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 border-b border-slate-200 text-slate-700 font-semibold">
                <tr>
                  <th className="p-3 w-10 text-center">#</th>
                  <th className="p-3">Equipment Description & Specifications</th>
                  <th className="p-3 w-24 text-center">HSN</th>
                  <th className="p-3 w-20 text-center">Qty</th>
                  <th className="p-3 w-32 text-right">Unit Rate</th>
                  <th className="p-3 w-36 text-right">Line Total (INR)</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {so.items?.map((it, idx) => (
                  <tr key={idx}>
                    <td className="p-3 text-center text-slate-400 font-medium">{idx + 1}</td>
                    <td className="p-3">
                      <div className="font-bold text-slate-900">{it.productName}</div>
                      <div className="text-[11px] text-slate-500 mt-0.5">{it.specification}</div>
                    </td>
                    <td className="p-3 text-center text-slate-600">{it.hsnCode || '841869'}</td>
                    <td className="p-3 text-center font-bold text-slate-800">{it.quantity} {it.unit || 'Nos'}</td>
                    <td className="p-3 text-right text-slate-700">{formatINR(it.unitPrice)}</td>
                    <td className="p-3 text-right font-bold text-slate-900">{formatINR(it.totalAmount)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="flex justify-end">
            <div className="w-80 bg-slate-50 border border-slate-200 rounded-xl p-4 text-xs space-y-1.5">
              <div className="flex justify-between text-slate-600">
                <span>Sub Total:</span>
                <span className="font-semibold text-slate-900">{formatINR(so.subTotal)}</span>
              </div>
              <div className="flex justify-between text-slate-600">
                <span>Taxable Value:</span>
                <span className="font-semibold text-slate-900">{formatINR(so.taxableAmount)}</span>
              </div>
              <div className="flex justify-between text-slate-600">
                <span>GST (18%):</span>
                <span className="font-semibold text-slate-900">{formatINR(so.totalGst)}</span>
              </div>
              <div className="pt-2 border-t border-slate-200 flex justify-between text-sm font-bold text-sky-950">
                <span>Grand Total:</span>
                <span className="text-sky-700">{formatINR(so.grandTotal)}</span>
              </div>
            </div>
          </div>

          {/* Delivery & Conditions */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs bg-slate-50/50 p-4 rounded-xl border border-slate-200">
            <div>
              <span className="font-semibold text-slate-700 block">Committed Dispatch Date:</span>
              <span className="font-bold text-sky-800">
                {dayjs(so.committedDispatchDate).format('DD MMMM YYYY')}
              </span>
            </div>
            <div>
              <span className="font-semibold text-slate-700 block">Delivery Terms:</span>
              <span className="text-slate-600">{so.deliverySchedule}</span>
            </div>
            <div>
              <span className="font-semibold text-slate-700 block">Payment Terms:</span>
              <span className="text-slate-600">{so.paymentTerms}</span>
            </div>
            <div>
              <span className="font-semibold text-slate-700 block">Warranty Period:</span>
              <span className="text-slate-600">{so.warranty}</span>
            </div>
            {so.specialInstructions && (
              <div className="col-span-2">
                <span className="font-semibold text-slate-700 block">Special Instructions:</span>
                <span className="text-slate-600">{so.specialInstructions}</span>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Production Handover Modal */}
      <ProductionHandoverModal
        isOpen={isHandoverModalOpen}
        onClose={() => setIsHandoverModalOpen(false)}
        salesOrder={so}
        onUpdated={fetchSODetails}
      />
    </div>
  );
};

