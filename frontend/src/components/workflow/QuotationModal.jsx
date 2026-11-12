import React, { useState, useEffect } from 'react';
import { Modal } from '../ui/Modal';
import { Button } from '../ui/Button';
import { Input } from '../ui/Input';
import { Select } from '../ui/Select';
import { useToastStore } from '../../store/useToastStore';
import api from '../../services/api';
import { Plus, Trash2, Calculator } from 'lucide-react';

export const QuotationModal = ({
  isOpen,
  onClose,
  lead,
  preselectedCustomerId = null,
  existingQuotation = null,
  isRevision = false,
  onSuccess,
}) => {
  const [customers, setCustomers] = useState([]);
  const [selectedCustomerId, setSelectedCustomerId] = useState(preselectedCustomerId || '');
  const [revisionReason, setRevisionReason] = useState('');
  const [paymentTerms, setPaymentTerms] = useState(
    '30% Advance with PO, 70% against Proforma Invoice prior to dispatch'
  );
  const [deliveryPeriod, setDeliveryPeriod] = useState(
    '4 to 6 Weeks from receipt of technically and commercially clear PO'
  );
  const [validityDays, setValidityDays] = useState(30);
  const [warranty, setWarranty] = useState(
    '12 Months warranty from date of commissioning against manufacturing defects'
  );
  const [freightTerms, setFreightTerms] = useState(
    'Ex-works Chennai / Packing, Forwarding & Freight extra at actuals'
  );
  const [specialTerms, setSpecialTerms] = useState(
    'Standard factory inspection and vacuum retention certification included.'
  );

  const [items, setItems] = useState([
    {
      productName: '',
      specification: '',
      hsnCode: '841869',
      quantity: 1,
      unit: 'Nos',
      unitPrice: '',
      discountPercent: 0,
      gstRate: 18,
    },
  ]);

  const [submitting, setSubmitting] = useState(false);
  const addToast = useToastStore((state) => state.addToast);

  useEffect(() => {
    if (isOpen) {
      if (preselectedCustomerId) {
        setSelectedCustomerId(preselectedCustomerId);
      }
      if (!lead && !isRevision) {
        // Fetch customers list for standalone quotation creation
        api.get('/customers', { params: { limit: 100 } })
          .then((res) => {
            setCustomers(res.data.data);
            if (preselectedCustomerId) {
              setSelectedCustomerId(preselectedCustomerId);
            } else if (res.data.data.length > 0) {
              setSelectedCustomerId(res.data.data[0]._id);
            }
          })
          .catch(console.error);
      }

      if (isRevision && existingQuotation?.activeRevision) {
        const rev = existingQuotation.activeRevision;
        setRevisionReason('');
        setPaymentTerms(rev.paymentTerms || '');
        setDeliveryPeriod(rev.deliveryPeriod || '');
        setValidityDays(rev.validityDays || 30);
        setWarranty(rev.warranty || '');
        setFreightTerms(rev.freightTerms || '');
        setSpecialTerms(rev.specialTerms || '');
        setItems(
          rev.items?.map((it) => ({
            productName: it.productName,
            specification: it.specification,
            hsnCode: it.hsnCode || '841869',
            quantity: it.quantity,
            unit: it.unit || 'Nos',
            unitPrice: it.unitPrice,
            discountPercent: it.discountPercent || 0,
            gstRate: it.gstRate !== undefined ? it.gstRate : 18,
          })) || []
        );
      } else if (lead?.requirements) {
        // Pre-fill initial item from lead requirements
        setItems([
          {
            productName: lead.requirements.equipmentType || 'Cryogenic Equipment',
            specification: `${lead.requirements.capacity || ''} ${lead.requirements.specificationDetails || ''}`.trim(),
            hsnCode: '841869',
            quantity: 1,
            unit: 'Nos',
            unitPrice: lead.requirements.estimatedBudget ? Math.round(lead.requirements.estimatedBudget / 1.18) : '',
            discountPercent: 0,
            gstRate: 18,
          },
        ]);
      }
    }
  }, [isOpen, isRevision, existingQuotation, lead]);

  const handleAddItem = () => {
    setItems([
      ...items,
      {
        productName: '',
        specification: '',
        hsnCode: '841869',
        quantity: 1,
        unit: 'Nos',
        unitPrice: '',
        discountPercent: 0,
        gstRate: 18,
      },
    ]);
  };

  const handleRemoveItem = (index) => {
    if (items.length <= 1) {
      addToast({ type: 'warning', title: 'Line Items', message: 'At least one line item is required' });
      return;
    }
    setItems(items.filter((_, idx) => idx !== index));
  };

  const handleItemChange = (index, field, value) => {
    const updated = [...items];
    updated[index][field] = value;
    setItems(updated);
  };

  // Live total calculations
  const calculateTotals = () => {
    let subTotal = 0;
    let totalDiscount = 0;
    let taxable = 0;
    let totalGst = 0;

    items.forEach((it) => {
      const qty = Number(it.quantity) || 0;
      const rate = Number(it.unitPrice) || 0;
      const discPct = Number(it.discountPercent) || 0;
      const gstR = Number(it.gstRate) !== undefined ? Number(it.gstRate) : 18;

      const gross = qty * rate;
      const disc = (gross * discPct) / 100;
      const lineTaxable = gross - disc;
      const gst = (lineTaxable * gstR) / 100;

      subTotal += gross;
      totalDiscount += disc;
      taxable += lineTaxable;
      totalGst += gst;
    });

    return {
      subTotal: Math.round(subTotal),
      totalDiscount: Math.round(totalDiscount),
      taxable: Math.round(taxable),
      totalGst: Math.round(totalGst),
      grandTotal: Math.round(taxable + totalGst),
    };
  };

  const totals = calculateTotals();

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Validate items
    for (let i = 0; i < items.length; i++) {
      if (!items[i].productName.trim() || !items[i].unitPrice || Number(items[i].unitPrice) <= 0) {
        addToast({
          type: 'warning',
          title: 'Line Item Required',
          message: `Please provide product name and valid unit price for item #${i + 1}`,
        });
        return;
      }
    }

    if (isRevision && !revisionReason.trim()) {
      addToast({
        type: 'warning',
        title: 'Revision Reason',
        message: 'Please provide the commercial reason for creating this revision (e.g. Negotiation discount)',
      });
      return;
    }

    try {
      setSubmitting(true);
      if (isRevision) {
        // Create Revision (Rev 1, Rev 2...)
        const res = await api.post(`/quotations/${existingQuotation._id}/revise`, {
          revisionReason,
          items,
          paymentTerms,
          deliveryPeriod,
          validityDays: Number(validityDays),
          warranty,
          freightTerms,
          specialTerms,
        });

        addToast({
          type: 'success',
          title: 'Quotation Revised',
          message: res.data.message,
        });
        onSuccess(res.data.data);
      } else {
        // Create initial Rev 0
        const res = await api.post('/quotations', {
          leadId: lead?._id || null,
          customerId: selectedCustomerId || lead?.customer?._id || lead?.customer,
          items,
          paymentTerms,
          deliveryPeriod,
          validityDays: Number(validityDays),
          warranty,
          freightTerms,
          specialTerms,
        });

        addToast({
          type: 'success',
          title: 'Quotation Rev 0 Generated',
          message: res.data.message,
        });
        onSuccess(res.data.data);
      }
      onClose();
    } catch (err) {
      addToast({
        type: 'error',
        title: 'Submission Failed',
        message: err.response?.data?.message || 'Failed to submit quotation',
      });
    } finally {
      setSubmitting(false);
    }
  };

  const formatINR = (n) => 'Rs. ' + Number(n || 0).toLocaleString('en-IN');

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={isRevision ? `Create Quotation Revision (Rev ${(existingQuotation?.currentRevisionNumber || 0) + 1})` : 'Create Commercial Quotation (Rev 0)'}
      subtitle={isRevision ? 'Preserve previous quotation versions and issue a newly negotiated revision' : 'Draft initial commercial and technical proposal for this qualified lead'}
      size="xl"
    >
      <form onSubmit={handleSubmit} className="space-y-5">
        {!lead && !isRevision && (
          <div className="bg-sky-50 p-3.5 rounded-xl border border-sky-200">
            <label className="block text-xs font-bold text-sky-950 mb-1.5">
              Select Customer Account <span className="text-red-500">*</span>
            </label>
            <select
              className="w-full text-xs rounded-lg border border-sky-300 bg-white p-2.5 text-slate-800 focus:outline-none focus:ring-2 focus:ring-sky-500/20"
              value={selectedCustomerId}
              onChange={(e) => setSelectedCustomerId(e.target.value)}
              required
            >
              <option value="">-- Choose Customer Master Account --</option>
              {customers.map((c) => (
                <option key={c._id} value={c._id}>
                  {c.customerCode} — {c.companyName} ({c.contactPerson?.name || c.email})
                </option>
              ))}
            </select>
          </div>
        )}

        {isRevision && (
          <div className="bg-amber-50 p-3.5 rounded-xl border border-amber-200">
            <label className="block text-xs font-bold text-amber-900 mb-1">
              Revision Reason / Negotiation Change Summary <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              required
              placeholder="e.g. 5% discount applied after commercial review with customer"
              value={revisionReason}
              onChange={(e) => setRevisionReason(e.target.value)}
              className="w-full text-sm rounded-lg border border-amber-300 bg-white p-2 text-slate-800 focus:outline-none focus:ring-2 focus:ring-amber-500/20"
            />
          </div>
        )}

        {/* Line Items Table */}
        <div>
          <div className="flex items-center justify-between mb-2">
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-700">
              Quotation Line Items & Cryogenic Equipment
            </h4>
            <Button size="sm" variant="outline" icon={Plus} onClick={handleAddItem}>
              Add Product Line
            </Button>
          </div>

          <div className="border border-slate-200 rounded-xl overflow-x-auto">
            <table className="w-full text-left text-xs min-w-[700px]">
              <thead className="bg-slate-50 border-b border-slate-200 text-slate-600 font-semibold">
                <tr>
                  <th className="p-2.5 w-10 text-center">#</th>
                  <th className="p-2.5 min-w-[220px]">Product & Specification</th>
                  <th className="p-2.5 w-24">HSN</th>
                  <th className="p-2.5 w-20 text-center">Qty</th>
                  <th className="p-2.5 w-28 text-right">Unit Rate (INR)</th>
                  <th className="p-2.5 w-20 text-center">Disc %</th>
                  <th className="p-2.5 w-20 text-center">GST %</th>
                  <th className="p-2.5 w-28 text-right">Line Total</th>
                  <th className="p-2.5 w-12 text-center"></th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {items.map((item, index) => {
                  const qty = Number(item.quantity) || 0;
                  const rate = Number(item.unitPrice) || 0;
                  const disc = Number(item.discountPercent) || 0;
                  const gst = Number(item.gstRate) !== undefined ? Number(item.gstRate) : 18;
                  const taxable = qty * rate * (1 - disc / 100);
                  const total = taxable * (1 + gst / 100);

                  return (
                    <tr key={index} className="hover:bg-slate-50/50">
                      <td className="p-2 text-center font-medium text-slate-400">{index + 1}</td>
                      <td className="p-2 space-y-1">
                        <input
                          type="text"
                          required
                          placeholder="Equipment Name (e.g. CryoBio 50)"
                          value={item.productName}
                          onChange={(e) => handleItemChange(index, 'productName', e.target.value)}
                          className="w-full border border-slate-300 rounded px-2 py-1 text-xs focus:ring-1 focus:ring-sky-500"
                        />
                        <textarea
                          rows="1"
                          placeholder="Detailed technical specifications..."
                          value={item.specification}
                          onChange={(e) => handleItemChange(index, 'specification', e.target.value)}
                          className="w-full border border-slate-200 rounded px-2 py-1 text-[11px] text-slate-600 focus:ring-1 focus:ring-sky-500"
                        />
                      </td>
                      <td className="p-2">
                        <input
                          type="text"
                          value={item.hsnCode}
                          onChange={(e) => handleItemChange(index, 'hsnCode', e.target.value)}
                          className="w-full border border-slate-300 rounded px-2 py-1 text-xs"
                        />
                      </td>
                      <td className="p-2">
                        <input
                          type="number"
                          min="1"
                          required
                          value={item.quantity}
                          onChange={(e) => handleItemChange(index, 'quantity', e.target.value)}
                          className="w-full border border-slate-300 rounded px-2 py-1 text-xs text-center"
                        />
                      </td>
                      <td className="p-2">
                        <input
                          type="number"
                          min="0"
                          required
                          placeholder="Rate"
                          value={item.unitPrice}
                          onChange={(e) => handleItemChange(index, 'unitPrice', e.target.value)}
                          className="w-full border border-slate-300 rounded px-2 py-1 text-xs text-right font-medium"
                        />
                      </td>
                      <td className="p-2">
                        <input
                          type="number"
                          min="0"
                          max="100"
                          value={item.discountPercent}
                          onChange={(e) => handleItemChange(index, 'discountPercent', e.target.value)}
                          className="w-full border border-slate-300 rounded px-2 py-1 text-xs text-center"
                        />
                      </td>
                      <td className="p-2">
                        <select
                          value={item.gstRate}
                          onChange={(e) => handleItemChange(index, 'gstRate', e.target.value)}
                          className="w-full border border-slate-300 rounded px-1 py-1 text-xs text-center"
                        >
                          <option value="18">18%</option>
                          <option value="12">12%</option>
                          <option value="5">5%</option>
                          <option value="0">0%</option>
                        </select>
                      </td>
                      <td className="p-2 text-right font-bold text-slate-800">
                        {formatINR(total)}
                      </td>
                      <td className="p-2 text-center">
                        <button
                          type="button"
                          onClick={() => handleRemoveItem(index)}
                          className="text-slate-400 hover:text-red-600 transition p-1"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>

        {/* Totals Summary Box */}
        <div className="flex justify-end">
          <div className="w-full sm:w-72 bg-slate-50 border border-slate-200 rounded-xl p-3.5 text-xs space-y-1.5">
            <div className="flex justify-between text-slate-600">
              <span>Gross Sub-Total:</span>
              <span className="font-semibold text-slate-900">{formatINR(totals.subTotal)}</span>
            </div>
            {totals.totalDiscount > 0 && (
              <div className="flex justify-between text-emerald-700">
                <span>Total Discount:</span>
                <span className="font-semibold">- {formatINR(totals.totalDiscount)}</span>
              </div>
            )}
            <div className="flex justify-between text-slate-600">
              <span>Taxable Value:</span>
              <span className="font-semibold text-slate-900">{formatINR(totals.taxable)}</span>
            </div>
            <div className="flex justify-between text-slate-600">
              <span>GST Total:</span>
              <span className="font-semibold text-slate-900">{formatINR(totals.totalGst)}</span>
            </div>
            <div className="pt-2 border-t border-slate-200 flex justify-between text-sm font-bold text-sky-950">
              <span>Grand Total:</span>
              <span className="text-sky-700">{formatINR(totals.grandTotal)}</span>
            </div>
          </div>
        </div>

        {/* Commercial Terms */}
        <div className="bg-slate-50/70 p-4 rounded-xl border border-slate-200 space-y-3">
          <h4 className="text-xs font-bold uppercase tracking-wider text-slate-700">Commercial Terms & Conditions</h4>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <Input
              label="Payment Terms"
              value={paymentTerms}
              onChange={(e) => setPaymentTerms(e.target.value)}
            />

            <Input
              label="Delivery Timeline"
              value={deliveryPeriod}
              onChange={(e) => setDeliveryPeriod(e.target.value)}
            />

            <Input
              label="Standard Warranty"
              value={warranty}
              onChange={(e) => setWarranty(e.target.value)}
            />

            <Input
              label="Freight & Dispatch Terms"
              value={freightTerms}
              onChange={(e) => setFreightTerms(e.target.value)}
            />
          </div>
        </div>

        <div className="flex justify-end gap-3 pt-3 border-t border-slate-100">
          <Button variant="secondary" onClick={onClose}>
            Cancel
          </Button>
          <Button type="submit" loading={submitting}>
            {isRevision ? 'Generate Revised Quotation' : 'Save & Issue Rev 0 Quotation'}
          </Button>
        </div>
      </form>
    </Modal>
  );
};

