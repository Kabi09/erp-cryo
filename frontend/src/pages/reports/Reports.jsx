import React, { useState, useEffect } from 'react';
import Card from '../../components/common/Card';
import Button from '../../components/common/Button';
import Badge from '../../components/common/Badge';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import { Download, Printer, BarChart3, Filter } from 'lucide-react';
import api from '../../services/api';

const reportTypes = [
  { id: 'enquiry-register', name: 'Enquiry Register' },
  { id: 'customer-register', name: 'Customer Register' },
  { id: 'quotation-register', name: 'Quotation Register' },
  { id: 'sales-order-register', name: 'Sales Order Register' },
  { id: 'follow-up-report', name: 'Follow-up Activity Report' },
  { id: 'won-lost-report', name: 'Lead Won / Lost Report' },
  { id: 'payment-receipt-report', name: 'Payment Receipt Register' },
  { id: 'outstanding-payment-report', name: 'Outstanding Receivables Report' }
];

const Reports = () => {
  const [activeReport, setActiveReport] = useState('enquiry-register');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [reportData, setReportData] = useState(null);
  const [loading, setLoading] = useState(true);

  const fetchReport = async () => {
    try {
      setLoading(true);
      const params = {};
      if (startDate) params.startDate = startDate;
      if (endDate) params.endDate = endDate;

      const res = await api.get(`/reports/${activeReport}`, { params });
      if (res.data.success) {
        setReportData(res.data);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReport();
  }, [activeReport]);

  const handlePrint = () => {
    window.print();
  };

  const exportCSV = () => {
    if (!reportData?.data || reportData.data.length === 0) return;
    const items = reportData.data;
    const replacer = (key, value) => (value === null ? '' : value);
    const header = Object.keys(items[0]).filter(k => !['_id', '__v'].includes(k));
    const csv = [
      header.join(','),
      ...items.map(row =>
        header.map(fieldName => JSON.stringify(row[fieldName], replacer)).join(',')
      )
    ].join('\r\n');

    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `${activeReport}-${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-slate-900">ERP Operational Reports & Registers</h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Audit registers, financial reconciliations, funnel reporting, and data exports.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" icon={Printer} onClick={handlePrint}>
            Print Report
          </Button>
          <Button variant="primary" size="sm" icon={Download} onClick={exportCSV}>
            Export CSV
          </Button>
        </div>
      </div>

      {/* Report Selector Pills */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1">
        {reportTypes.map((r) => (
          <button
            key={r.id}
            onClick={() => setActiveReport(r.id)}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-all ${
              activeReport === r.id
                ? 'bg-brand-900 text-white shadow-xs'
                : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-50'
            }`}
          >
            {r.name}
          </button>
        ))}
      </div>

      {/* Date Filter Bar */}
      <Card noPadding>
        <div className="p-4 flex flex-wrap items-center justify-between gap-3 bg-white rounded-xl text-xs">
          <div className="flex flex-wrap items-center gap-3">
            <div>
              <span className="font-semibold text-slate-600 mr-2">From Date:</span>
              <input
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                className="px-2.5 py-1 bg-slate-50 border border-slate-200 rounded"
              />
            </div>
            <div>
              <span className="font-semibold text-slate-600 mr-2">To Date:</span>
              <input
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                className="px-2.5 py-1 bg-slate-50 border border-slate-200 rounded"
              />
            </div>
            <Button size="sm" variant="secondary" onClick={fetchReport}>
              Apply Filters
            </Button>
          </div>

          <div className="text-xs font-bold text-brand-900">
            Total Records: {reportData?.count || 0}
          </div>
        </div>
      </Card>

      {/* Report Summary Cards (if available) */}
      {reportData?.summary && (
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          {Object.entries(reportData.summary).map(([key, value]) => (
            <div key={key} className="p-4 bg-white border border-slate-200 rounded-xl">
              <span className="text-[10px] uppercase font-bold text-slate-400 block">
                {key.replace(/([A-Z])/g, ' $1')}
              </span>
              <span className="text-lg font-bold text-slate-900 block mt-1">
                {typeof value === 'number' && key.toLowerCase().includes('value') || key.toLowerCase().includes('received') || key.toLowerCase().includes('outstanding')
                  ? `₹${value.toLocaleString('en-IN')}`
                  : value}
              </span>
            </div>
          ))}
        </div>
      )}

      {/* Data Table */}
      <Card noPadding>
        {loading ? (
          <LoadingSpinner text="Generating report view..." />
        ) : !reportData?.data || reportData.data.length === 0 ? (
          <p className="p-8 text-center text-xs text-slate-400">No records found for selected date parameters.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-200 text-[11px] font-bold text-slate-600 uppercase tracking-wider">
                  {Object.keys(reportData.data[0])
                    .filter(k => !['_id', '__v'].includes(k))
                    .map((header) => (
                      <th key={header} className="py-3 px-4 capitalize">
                        {header.replace(/([A-Z])/g, ' $1')}
                      </th>
                    ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {reportData.data.map((row, idx) => (
                  <tr key={idx} className="hover:bg-slate-50/70">
                    {Object.keys(row)
                      .filter(k => !['_id', '__v'].includes(k))
                      .map((k) => {
                        const val = row[k];
                        const isDate = typeof val === 'string' && val.includes('T') && !isNaN(Date.parse(val));
                        const isNum = typeof val === 'number';

                        return (
                          <td key={k} className="py-3 px-4">
                            {isDate ? (
                              new Date(val).toLocaleDateString()
                            ) : isNum && (k.toLowerCase().includes('amount') || k.toLowerCase().includes('value') || k.toLowerCase().includes('price')) ? (
                              `₹${val.toLocaleString('en-IN')}`
                            ) : typeof val === 'object' && val !== null ? (
                              val.name || val.companyName || JSON.stringify(val)
                            ) : (
                              String(val || '-')
                            )}
                          </td>
                        );
                      })}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Card>
    </div>
  );
};

export default Reports;
