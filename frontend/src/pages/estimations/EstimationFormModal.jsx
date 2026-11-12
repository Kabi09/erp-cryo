import React, { useState, useEffect } from 'react';
import Modal from '../../components/common/Modal';
import Button from '../../components/common/Button';
import { Plus, Trash2, Calculator } from 'lucide-react';
import api from '../../services/api';

const costingCategories = [
  'Raw Materials',
  'Sensors',
  'Heating Elements',
  'Controllers',
  'Electrical Components',
  'Labour',
  'Manufacturing',
  'Testing & Calibration',
  'Packing',
  'Transportation',
  'Other Expenses'
];

const EstimationFormModal = ({ isOpen, onClose, initialEnquiry, estimation, onSaved }) => {
  const [enquiries, setEnquiries] = useState([]);
  const [selectedEnquiryId, setSelectedEnquiryId] = useState('');
  const [selectedEnquiry, setSelectedEnquiry] = useState(null);

  const [items, setItems] = useState([
    {
      productName: '',
      modelNumber: '',
      quantity: 1,
      profitMarginPercent: 25,
      gstPercent: 18,
      costingLines: [
        { category: 'Raw Materials', itemName: 'SS 304 Electro-polished Inner Chamber', quantity: 1, unit: 'Set', unitPrice: 45000 },
        { category: 'Sensors', itemName: 'Class A Dual PT-100 RTD Sensors', quantity: 2, unit: 'Nos', unitPrice: 6500 },
        { category: 'Controllers', itemName: '7-inch Touch PLC Controller with Data Logging', quantity: 1, unit: 'Nos', unitPrice: 35000 },
        { category: 'Electrical Components', itemName: 'Hermetic Compressors Stage 1 & 2', quantity: 2, unit: 'Nos', unitPrice: 48000 },
        { category: 'Labour', itemName: 'Refrigeration Brazing, Vacuum & Assembly', quantity: 1, unit: 'Job', unitPrice: 18000 },
        { category: 'Testing & Calibration', itemName: '72-Hour Temp Mapping Validation', quantity: 1, unit: 'Job', unitPrice: 15000 }
      ]
    }
  ]);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (isOpen) {
      api.get('/enquiries').then(res => {
        if (res.data.success) setEnquiries(res.data.data);
      }).catch(err => console.error(err));
    }
  }, [isOpen]);

  useEffect(() => {
    if (initialEnquiry) {
      setSelectedEnquiryId(initialEnquiry._id);
      setSelectedEnquiry(initialEnquiry);
      if (initialEnquiry.products?.length > 0) {
        setItems(initialEnquiry.products.map(p => ({
          product: p.product?._id || p.product,
          productName: p.productName,
          modelNumber: p.modelNumber || 'Standard',
          quantity: p.quantity || 1,
          profitMarginPercent: 25,
          gstPercent: 18,
          costingLines: [
            { category: 'Raw Materials', itemName: `${p.productName} Casing & Fabrication`, quantity: p.quantity || 1, unit: 'Set', unitPrice: 45000 },
            { category: 'Sensors', itemName: `${p.sensorRequirements || 'PT-100'} Sensors`, quantity: (p.quantity || 1) * 2, unit: 'Nos', unitPrice: 6500 },
            { category: 'Controllers', itemName: 'Microprocessor PLC Touch Interface', quantity: p.quantity || 1, unit: 'Nos', unitPrice: 35000 },
            { category: 'Electrical Components', itemName: 'Cascade Eco Refrigeration Units', quantity: (p.quantity || 1) * 2, unit: 'Nos', unitPrice: 48000 },
            { category: 'Labour', itemName: 'Assembly & High-Pressure Brazing', quantity: p.quantity || 1, unit: 'Job', unitPrice: 18000 },
            { category: 'Testing & Calibration', itemName: 'Factory IQ/OQ Calibration Mapping', quantity: p.quantity || 1, unit: 'Job', unitPrice: 15000 }
          ]
        })));
      }
    } else if (estimation) {
      setSelectedEnquiryId(estimation.enquiry?._id || estimation.enquiry);
      setSelectedEnquiry(estimation.enquiry);
      setItems(estimation.items || []);
    }
  }, [initialEnquiry, estimation, isOpen]);

  const handleEnquiryChange = (enqId) => {
    setSelectedEnquiryId(enqId);
    const found = enquiries.find(e => e._id === enqId);
    setSelectedEnquiry(found || null);
    if (found?.products?.length > 0) {
      setItems(found.products.map(p => ({
        product: p.product?._id || p.product,
        productName: p.productName,
        modelNumber: p.modelNumber || 'Standard',
        quantity: p.quantity || 1,
        profitMarginPercent: 25,
        gstPercent: 18,
        costingLines: [
          { category: 'Raw Materials', itemName: `${p.productName} Sheet Fabrication`, quantity: p.quantity || 1, unit: 'Set', unitPrice: 45000 },
          { category: 'Sensors', itemName: 'Dual PT-100 RTD Sensors', quantity: 2, unit: 'Nos', unitPrice: 6500 },
          { category: 'Controllers', itemName: 'Microprocessor Controller', quantity: 1, unit: 'Nos', unitPrice: 35000 },
          { category: 'Electrical Components', itemName: 'Cascade Compressors', quantity: 2, unit: 'Nos', unitPrice: 48000 },
          { category: 'Labour', itemName: 'Factory Assembly & Testing', quantity: 1, unit: 'Job', unitPrice: 20000 }
        ]
      })));
    }
  };

  const addCostingLine = (itemIdx) => {
    const updated = [...items];
    updated[itemIdx].costingLines.push({
      category: 'Raw Materials',
      itemName: '',
      quantity: 1,
      unit: 'Nos',
      unitPrice: 0
    });
    setItems(updated);
  };

  const removeCostingLine = (itemIdx, lineIdx) => {
    const updated = [...items];
    updated[itemIdx].costingLines = updated[itemIdx].costingLines.filter((_, i) => i !== lineIdx);
    setItems(updated);
  };

  // Calculations for summary display
  const calculateItemSummary = (item) => {
    const cost = (item.costingLines || []).reduce((acc, l) => acc + (Number(l.quantity || 1) * Number(l.unitPrice || 0)), 0);
    const profit = (cost * (Number(item.profitMarginPercent) || 25)) / 100;
    const selling = cost + profit;
    const gst = (selling * (Number(item.gstPercent) || 18)) / 100;
    const total = selling + gst;
    return { cost, profit, selling, gst, total };
  };

  const grandTotals = items.reduce(
    (acc, it) => {
      const calc = calculateItemSummary(it);
      return {
        cost: acc.cost + calc.cost,
        selling: acc.selling + calc.selling,
        gst: acc.gst + calc.gst,
        grand: acc.grand + calc.total
      };
    },
    { cost: 0, selling: 0, gst: 0, grand: 0 }
  );

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!selectedEnquiryId) {
      setError('Please select an enquiry to estimate');
      return;
    }
    setLoading(true);
    setError('');

    try {
      const payload = {
        enquiry: selectedEnquiryId,
        customer: selectedEnquiry?.customer?._id || selectedEnquiry?.customer,
        customerName: selectedEnquiry?.companyName,
        items
      };

      if (estimation?._id) {
        await api.put(`/estimations/${estimation._id}`, payload);
      } else {
        await api.post('/estimations', payload);
      }
      onSaved();
      onClose();
    } catch (err) {
      setError(err.response?.data?.message || 'Error saving estimation');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={estimation ? `Revise Cost Estimation (${estimation.estimateNumber})` : 'New Product Cost Estimation (BOM)'}
      maxWidth="max-w-5xl"
    >
      <form onSubmit={handleSubmit} className="space-y-6">
        {error && (
          <div className="p-3 bg-rose-50 text-rose-700 border border-rose-200 text-xs rounded-lg font-medium">
            {error}
          </div>
        )}

        {/* Enquiry Selector */}
        <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
          <div>
            <label className="block font-semibold text-slate-700 mb-1">Target Customer Enquiry *</label>
            <select
              value={selectedEnquiryId}
              onChange={(e) => handleEnquiryChange(e.target.value)}
              required
              className="w-full px-3 py-1.5 bg-white border border-slate-200 rounded focus:border-brand-600"
            >
              <option value="">-- Choose Enquiry --</option>
              {enquiries.map((enq) => (
                <option key={enq._id} value={enq._id}>
                  {enq.enquiryNumber} — {enq.companyName} ({enq.status})
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="block font-semibold text-slate-700 mb-1">Customer / Organization</label>
            <input
              type="text"
              disabled
              value={selectedEnquiry?.companyName || 'Select an enquiry'}
              className="w-full px-3 py-1.5 bg-slate-100 border border-slate-200 rounded text-slate-700"
            />
          </div>
        </div>

        {/* Costing Engine for Products */}
        <div className="space-y-6">
          {items.map((item, itemIdx) => {
            const summary = calculateItemSummary(item);
            return (
              <div key={itemIdx} className="border border-slate-200 rounded-xl overflow-hidden bg-white shadow-xs">
                {/* Item Header */}
                <div className="bg-slate-100/80 px-4 py-3 border-b border-slate-200 flex flex-wrap items-center justify-between gap-2">
                  <div>
                    <span className="font-bold text-xs text-brand-900 block">
                      Equipment: {item.productName || 'Line Item'} (Model: {item.modelNumber || 'Custom'})
                    </span>
                    <span className="text-[11px] text-slate-500">BOM Cost Breakdown</span>
                  </div>
                  <Button
                    size="sm"
                    variant="outline"
                    icon={Plus}
                    onClick={() => addCostingLine(itemIdx)}
                  >
                    Add Cost Row
                  </Button>
                </div>

                {/* Cost Rows Table */}
                <div className="overflow-x-auto p-4">
                  <table className="w-full text-left text-xs">
                    <thead>
                      <tr className="text-slate-500 border-b border-slate-200 pb-2">
                        <th className="pb-2">Cost Category</th>
                        <th className="pb-2">Item / Specification Name</th>
                        <th className="pb-2 w-20">Qty</th>
                        <th className="pb-2 w-24">Unit</th>
                        <th className="pb-2 w-28">Unit Price</th>
                        <th className="pb-2 text-right w-28">Line Total</th>
                        <th className="pb-2 w-10"></th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {item.costingLines.map((line, lineIdx) => (
                        <tr key={lineIdx} className="hover:bg-slate-50/50">
                          <td className="py-2 pr-2">
                            <select
                              value={line.category}
                              onChange={(e) => {
                                const it = [...items];
                                it[itemIdx].costingLines[lineIdx].category = e.target.value;
                                setItems(it);
                              }}
                              className="w-full px-2 py-1 bg-slate-50 border border-slate-200 rounded text-xs"
                            >
                              {costingCategories.map(cat => <option key={cat} value={cat}>{cat}</option>)}
                            </select>
                          </td>
                          <td className="py-2 pr-2">
                            <input
                              type="text"
                              value={line.itemName}
                              placeholder="Component description"
                              onChange={(e) => {
                                const it = [...items];
                                it[itemIdx].costingLines[lineIdx].itemName = e.target.value;
                                setItems(it);
                              }}
                              className="w-full px-2 py-1 bg-slate-50 border border-slate-200 rounded text-xs"
                            />
                          </td>
                          <td className="py-2 pr-2">
                            <input
                              type="number"
                              min={1}
                              value={line.quantity}
                              onChange={(e) => {
                                const it = [...items];
                                it[itemIdx].costingLines[lineIdx].quantity = Number(e.target.value);
                                setItems(it);
                              }}
                              className="w-full px-2 py-1 bg-slate-50 border border-slate-200 rounded text-xs"
                            />
                          </td>
                          <td className="py-2 pr-2">
                            <input
                              type="text"
                              value={line.unit}
                              onChange={(e) => {
                                const it = [...items];
                                it[itemIdx].costingLines[lineIdx].unit = e.target.value;
                                setItems(it);
                              }}
                              className="w-full px-2 py-1 bg-slate-50 border border-slate-200 rounded text-xs"
                            />
                          </td>
                          <td className="py-2 pr-2">
                            <input
                              type="number"
                              value={line.unitPrice}
                              onChange={(e) => {
                                const it = [...items];
                                it[itemIdx].costingLines[lineIdx].unitPrice = Number(e.target.value);
                                setItems(it);
                              }}
                              className="w-full px-2 py-1 bg-slate-50 border border-slate-200 rounded text-xs"
                            />
                          </td>
                          <td className="py-2 text-right font-semibold text-slate-800">
                            ₹{((Number(line.quantity) || 1) * (Number(line.unitPrice) || 0)).toLocaleString('en-IN')}
                          </td>
                          <td className="py-2 text-right pl-2">
                            {item.costingLines.length > 1 && (
                              <button
                                type="button"
                                onClick={() => removeCostingLine(itemIdx, lineIdx)}
                                className="text-slate-400 hover:text-rose-600 p-1"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                {/* Dynamic Calculated Margin & Final Price */}
                <div className="bg-slate-50 p-4 border-t border-slate-200 grid grid-cols-2 sm:grid-cols-5 gap-3 text-xs">
                  <div>
                    <span className="text-slate-500 block">Total Item BOM Cost:</span>
                    <span className="font-bold text-slate-800 text-sm">₹{summary.cost.toLocaleString('en-IN')}</span>
                  </div>
                  <div>
                    <label className="text-slate-500 block mb-1">Profit Margin (%)</label>
                    <input
                      type="number"
                      value={item.profitMarginPercent}
                      onChange={(e) => {
                        const it = [...items];
                        it[itemIdx].profitMarginPercent = Number(e.target.value);
                        setItems(it);
                      }}
                      className="w-20 px-2 py-1 bg-white border border-slate-200 rounded font-semibold text-xs"
                    />
                  </div>
                  <div>
                    <span className="text-slate-500 block">Selling Price:</span>
                    <span className="font-bold text-brand-900 text-sm">₹{summary.selling.toLocaleString('en-IN')}</span>
                  </div>
                  <div>
                    <span className="text-slate-500 block">GST (18%):</span>
                    <span className="font-semibold text-slate-700">₹{summary.gst.toLocaleString('en-IN')}</span>
                  </div>
                  <div className="bg-white p-2 rounded-lg border border-brand-200">
                    <span className="text-[10px] text-brand-700 font-bold uppercase block">Final Estimated Amt</span>
                    <span className="font-extrabold text-brand-900 text-sm">₹{summary.total.toLocaleString('en-IN')}</span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Grand Total Bar */}
        <div className="p-4 bg-brand-900 text-white rounded-xl flex items-center justify-between">
          <div>
            <span className="text-xs uppercase tracking-wider text-slate-300 block">Total Proposal Value (Incl. 18% GST)</span>
            <span className="text-2xl font-bold">₹{grandTotals.grand.toLocaleString('en-IN')}</span>
          </div>
          <div className="text-right text-xs space-y-1">
            <p>Total Estimated BOM Cost: <b>₹{grandTotals.cost.toLocaleString('en-IN')}</b></p>
            <p>Estimated Selling Price: <b>₹{grandTotals.selling.toLocaleString('en-IN')}</b></p>
          </div>
        </div>

        {/* Footer */}
        <div className="flex justify-end gap-3 pt-2">
          <Button variant="secondary" onClick={onClose} disabled={loading}>
            Cancel
          </Button>
          <Button type="submit" loading={loading} icon={Calculator}>
            Submit for Engineering Review
          </Button>
        </div>
      </form>
    </Modal>
  );
};

export default EstimationFormModal;
