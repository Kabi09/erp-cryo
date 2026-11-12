import React, { useState, useEffect } from 'react';
import Modal from '../../components/common/Modal';
import Button from '../../components/common/Button';
import { Plus, Trash2, FileText } from 'lucide-react';
import api from '../../services/api';

const QuotationFormModal = ({ isOpen, onClose, reviseSourceQuotation, onSaved }) => {
  const [estimations, setEstimations] = useState([]);
  const [selectedEstId, setSelectedEstId] = useState('');
  const [selectedEst, setSelectedEst] = useState(null);

  const [formData, setFormData] = useState({
    validUntil: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    products: [
      {
        productCode: 'CRY-0001',
        productName: '',
        model: '',
        description: '',
        technicalSpecifications: '',
        quantity: 1,
        unit: 'Nos',
        unitPrice: 0,
        discountPercent: 0,
        gstPercent: 18
      }
    ],
    commercialTerms: {
      paymentTerms: '30% advance with Purchase Order, 70% before dispatch against Proforma Invoice.',
      deliveryPeriod: '4 to 6 weeks from receipt of clear PO with advance.',
      warranty: '24 Months comprehensive on-site warranty from date of installation.',
      installationCharges: 'Free of charge commissioning by Cryo certified service engineers.',
      freightTerms: 'Ex-Works Chennai Factory'
    }
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (isOpen) {
      api.get('/estimations?status=Approved').then(res => {
        if (res.data.success) setEstimations(res.data.data);
      });
    }
  }, [isOpen]);

  useEffect(() => {
    if (reviseSourceQuotation) {
      setSelectedEstId(reviseSourceQuotation.estimateReference?._id || reviseSourceQuotation.estimateReference || '');
      setFormData({
        validUntil: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        products: reviseSourceQuotation.products.map(p => ({
          product: p.product?._id || p.product,
          productCode: p.productCode,
          productName: p.productName,
          model: p.model,
          description: p.description,
          technicalSpecifications: p.technicalSpecifications,
          quantity: p.quantity,
          unit: p.unit,
          unitPrice: p.unitPrice,
          discountPercent: p.discountPercent || 0,
          gstPercent: p.gstPercent || 18
        })),
        commercialTerms: reviseSourceQuotation.commercialTerms || {
          paymentTerms: '30% advance with Purchase Order, 70% before dispatch against Proforma Invoice.',
          deliveryPeriod: '4 to 6 weeks from receipt of clear PO with advance.',
          warranty: '24 Months comprehensive on-site warranty from date of installation.',
          installationCharges: 'Free of charge commissioning by Cryo certified service engineers.',
          freightTerms: 'Ex-Works Chennai Factory'
        }
      });
    } else {
      setSelectedEstId('');
      setSelectedEst(null);
    }
    setError('');
  }, [reviseSourceQuotation, isOpen]);

  const handleEstimationSelect = (estId) => {
    setSelectedEstId(estId);
    const est = estimations.find(e => e._id === estId);
    setSelectedEst(est || null);

    if (est?.items?.length > 0) {
      setFormData(prev => ({
        ...prev,
        products: est.items.map(it => ({
          product: it.product?._id || it.product,
          productCode: 'CRY-EQUIP',
          productName: it.productName,
          model: it.modelNumber,
          description: 'Specialist Medical / Scientific Cryo Storage Equipment',
          technicalSpecifications: 'Ultra-low refrigeration assembly with PT-100 RTD sensor and touchscreen controller',
          quantity: it.quantity || 1,
          unit: 'Nos',
          unitPrice: Math.round(it.sellingPrice / (it.quantity || 1)) || it.sellingPrice,
          discountPercent: 0,
          gstPercent: 18
        }))
      }));
    }
  };

  const addProductRow = () => {
    setFormData({
      ...formData,
      products: [
        ...formData.products,
        {
          productCode: 'CRY-ITEM',
          productName: '',
          model: '',
          description: '',
          technicalSpecifications: '',
          quantity: 1,
          unit: 'Nos',
          unitPrice: 0,
          discountPercent: 0,
          gstPercent: 18
        }
      ]
    });
  };

  const removeProductRow = (index) => {
    if (formData.products.length <= 1) return;
    setFormData({
      ...formData,
      products: formData.products.filter((_, i) => i !== index)
    });
  };

  // Live Totals
  const calculateTotals = () => {
    let subtotal = 0;
    let discountTotal = 0;
    let taxable = 0;
    let gstTotal = 0;
    let grandTotal = 0;

    formData.products.forEach(p => {
      const gross = (Number(p.quantity) || 1) * (Number(p.unitPrice) || 0);
      const disc = (gross * (Number(p.discountPercent) || 0)) / 100;
      const tax = gross - disc;
      const gst = (tax * (Number(p.gstPercent) || 18)) / 100;

      subtotal += gross;
      discountTotal += disc;
      taxable += tax;
      gstTotal += gst;
      grandTotal += (tax + gst);
    });

    return { subtotal, discountTotal, taxable, gstTotal, grandTotal };
  };

  const totals = calculateTotals();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      if (reviseSourceQuotation?._id) {
        // Revision endpoint
        await api.post(`/quotations/${reviseSourceQuotation._id}/revise`, {
          products: formData.products,
          commercialTerms: formData.commercialTerms,
          validUntil: formData.validUntil
        });
      } else {
        if (!selectedEst) {
          setError('Please select an approved engineering estimation');
          setLoading(false);
          return;
        }

        await api.post('/quotations', {
          enquiry: selectedEst.enquiry?._id || selectedEst.enquiry,
          customer: selectedEst.customer?._id || selectedEst.customer,
          customerName: selectedEst.customerName,
          estimateReference: selectedEst._id,
          estimateNumber: selectedEst.estimateNumber,
          products: formData.products,
          commercialTerms: formData.commercialTerms,
          validUntil: formData.validUntil
        });
      }

      onSaved();
      onClose();
    } catch (err) {
      setError(err.response?.data?.message || 'Error generating quotation');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={reviseSourceQuotation ? `Create Revised Quotation Version (From ${reviseSourceQuotation.quotationNumber} ${reviseSourceQuotation.versionLabel})` : 'Generate Formal Commercial Quotation (V1)'}
      maxWidth="max-w-5xl"
    >
      <form onSubmit={handleSubmit} className="space-y-6 text-xs">
        {error && (
          <div className="p-3 bg-rose-50 text-rose-700 border border-rose-200 rounded font-medium">
            {error}
          </div>
        )}

        {/* Source Estimation */}
        {!reviseSourceQuotation && (
          <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block font-semibold text-slate-700 mb-1">Approved Cost Estimation Reference *</label>
              <select
                value={selectedEstId}
                onChange={(e) => handleEstimationSelect(e.target.value)}
                required
                className="w-full px-3 py-2 bg-white border border-slate-200 rounded focus:border-brand-600"
              >
                <option value="">-- Select Approved Estimation --</option>
                {estimations.map(est => (
                  <option key={est._id} value={est._id}>
                    {est.estimateNumber} — {est.customerName} (₹{(est.grandTotal || 0).toLocaleString('en-IN')})
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block font-semibold text-slate-700 mb-1">Quotation Validity Until</label>
              <input
                type="date"
                required
                value={formData.validUntil}
                onChange={(e) => setFormData({ ...formData, validUntil: e.target.value })}
                className="w-full px-3 py-2 bg-white border border-slate-200 rounded"
              />
            </div>
          </div>
        )}

        {/* Dynamic Products Table */}
        <div>
          <div className="flex items-center justify-between mb-3 border-b border-slate-100 pb-1">
            <h4 className="text-xs font-bold uppercase tracking-wider text-brand-900">
              Quotation Product Line Items ({formData.products.length})
            </h4>
            <Button size="sm" variant="outline" icon={Plus} onClick={addProductRow}>
              Add Line Item
            </Button>
          </div>

          <div className="space-y-3">
            {formData.products.map((p, idx) => (
              <div key={idx} className="p-3.5 bg-slate-50 border border-slate-200 rounded-xl space-y-2">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-slate-700">Line #{idx + 1}</span>
                  {formData.products.length > 1 && (
                    <button
                      type="button"
                      onClick={() => removeProductRow(idx)}
                      className="text-rose-600 hover:text-rose-800 text-xs font-semibold flex items-center gap-1"
                    >
                      <Trash2 className="w-3.5 h-3.5" /> Remove
                    </button>
                  )}
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-4 gap-2">
                  <div className="sm:col-span-2">
                    <label className="block font-medium text-slate-600 mb-1">Equipment Name *</label>
                    <input
                      type="text"
                      required
                      value={p.productName}
                      onChange={(e) => {
                        const prods = [...formData.products];
                        prods[idx].productName = e.target.value;
                        setFormData({ ...formData, products: prods });
                      }}
                      className="w-full px-2 py-1.5 bg-white border border-slate-200 rounded"
                    />
                  </div>
                  <div>
                    <label className="block font-medium text-slate-600 mb-1">Model Code</label>
                    <input
                      type="text"
                      value={p.model || ''}
                      onChange={(e) => {
                        const prods = [...formData.products];
                        prods[idx].model = e.target.value;
                        setFormData({ ...formData, products: prods });
                      }}
                      className="w-full px-2 py-1.5 bg-white border border-slate-200 rounded"
                    />
                  </div>
                  <div>
                    <label className="block font-medium text-slate-600 mb-1">Quantity *</label>
                    <input
                      type="number"
                      min={1}
                      required
                      value={p.quantity}
                      onChange={(e) => {
                        const prods = [...formData.products];
                        prods[idx].quantity = Number(e.target.value);
                        setFormData({ ...formData, products: prods });
                      }}
                      className="w-full px-2 py-1.5 bg-white border border-slate-200 rounded"
                    />
                  </div>

                  <div className="sm:col-span-2">
                    <label className="block font-medium text-slate-600 mb-1">Technical Specifications (Printed on PDF)</label>
                    <input
                      type="text"
                      value={p.technicalSpecifications || ''}
                      onChange={(e) => {
                        const prods = [...formData.products];
                        prods[idx].technicalSpecifications = e.target.value;
                        setFormData({ ...formData, products: prods });
                      }}
                      placeholder="Cascade hermetic refrigeration, PT-100 sensor, 7-inch touch PLC..."
                      className="w-full px-2 py-1.5 bg-white border border-slate-200 rounded"
                    />
                  </div>

                  <div>
                    <label className="block font-medium text-slate-600 mb-1">Unit Price (INR) *</label>
                    <input
                      type="number"
                      required
                      value={p.unitPrice}
                      onChange={(e) => {
                        const prods = [...formData.products];
                        prods[idx].unitPrice = Number(e.target.value);
                        setFormData({ ...formData, products: prods });
                      }}
                      className="w-full px-2 py-1.5 bg-white border border-slate-200 rounded"
                    />
                  </div>

                  <div>
                    <label className="block font-medium text-slate-600 mb-1">Discount (%)</label>
                    <input
                      type="number"
                      value={p.discountPercent}
                      onChange={(e) => {
                        const prods = [...formData.products];
                        prods[idx].discountPercent = Number(e.target.value);
                        setFormData({ ...formData, products: prods });
                      }}
                      className="w-full px-2 py-1.5 bg-white border border-slate-200 rounded"
                    />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Commercial Terms Accordion */}
        <div className="border border-slate-200 rounded-xl p-4 bg-white space-y-3">
          <h4 className="text-xs font-bold uppercase tracking-wider text-slate-700">Commercial Terms & Warranty</h4>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block font-medium text-slate-600 mb-1">Payment Terms</label>
              <input
                type="text"
                value={formData.commercialTerms.paymentTerms}
                onChange={(e) => setFormData({
                  ...formData,
                  commercialTerms: { ...formData.commercialTerms, paymentTerms: e.target.value }
                })}
                className="w-full px-2.5 py-1.5 bg-slate-50 border border-slate-200 rounded"
              />
            </div>
            <div>
              <label className="block font-medium text-slate-600 mb-1">Delivery Period</label>
              <input
                type="text"
                value={formData.commercialTerms.deliveryPeriod}
                onChange={(e) => setFormData({
                  ...formData,
                  commercialTerms: { ...formData.commercialTerms, deliveryPeriod: e.target.value }
                })}
                className="w-full px-2.5 py-1.5 bg-slate-50 border border-slate-200 rounded"
              />
            </div>
            <div>
              <label className="block font-medium text-slate-600 mb-1">Warranty Period</label>
              <input
                type="text"
                value={formData.commercialTerms.warranty}
                onChange={(e) => setFormData({
                  ...formData,
                  commercialTerms: { ...formData.commercialTerms, warranty: e.target.value }
                })}
                className="w-full px-2.5 py-1.5 bg-slate-50 border border-slate-200 rounded"
              />
            </div>
            <div>
              <label className="block font-medium text-slate-600 mb-1">Freight / Transit Terms</label>
              <input
                type="text"
                value={formData.commercialTerms.freightTerms}
                onChange={(e) => setFormData({
                  ...formData,
                  commercialTerms: { ...formData.commercialTerms, freightTerms: e.target.value }
                })}
                className="w-full px-2.5 py-1.5 bg-slate-50 border border-slate-200 rounded"
              />
            </div>
          </div>
        </div>

        {/* Pricing Summary Box */}
        <div className="p-4 bg-slate-900 text-white rounded-xl flex items-center justify-between">
          <div>
            <span className="text-[10px] uppercase font-bold text-slate-400 block">Quotation Grand Total (Incl. 18% GST)</span>
            <span className="text-2xl font-bold">₹{totals.grandTotal.toLocaleString('en-IN')}</span>
          </div>
          <div className="text-right text-xs space-y-1">
            <p>Subtotal: <b>₹{totals.subtotal.toLocaleString('en-IN')}</b></p>
            <p>Discount: <b className="text-amber-400">-₹{totals.discountTotal.toLocaleString('en-IN')}</b></p>
            <p>GST Total: <b>₹{totals.gstTotal.toLocaleString('en-IN')}</b></p>
          </div>
        </div>

        {/* Actions */}
        <div className="flex justify-end gap-3 pt-2">
          <Button variant="secondary" onClick={onClose} disabled={loading}>
            Cancel
          </Button>
          <Button type="submit" loading={loading} icon={FileText}>
            {reviseSourceQuotation ? 'Issue Revised Quotation' : 'Generate Quotation & PDF'}
          </Button>
        </div>
      </form>
    </Modal>
  );
};

export default QuotationFormModal;
