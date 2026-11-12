import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../services/api';
import { Card, CardHeader, CardContent } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Badge } from '../components/ui/Badge';
import {
  ClipboardCheck,
  ShieldCheck,
  ShieldAlert,
  CheckCircle2,
  XCircle,
  ExternalLink,
  ChevronRight
} from 'lucide-react';
import dayjs from 'dayjs';

export const POVerificationsListPage = () => {
  const [pos, setPos] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchPOs = async () => {
    try {
      setLoading(true);
      const res = await api.get('/purchase-orders', { params: { limit: 50 } });
      setPos(res.data.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPOs();
  }, []);

  const formatINR = (n) => 'Rs. ' + Number(n || 0).toLocaleString('en-IN');

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 bg-white p-5 rounded-2xl border border-slate-200 shadow-2xs">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl font-bold text-slate-900 tracking-tight">Five-Point PO Verification Hub</h1>
            <Badge variant="primary">Quality & Commercial Gate</Badge>
          </div>
          <p className="text-xs text-slate-500 mt-0.5">
            Stage 10: Mandatory compliance checkpoint enforcing exact match across Product, Qty, Pricing, Delivery, and Terms
          </p>
        </div>
      </div>

      {/* Rules Notice */}
      <div className="bg-slate-900 text-slate-200 p-5 rounded-2xl shadow-md border border-slate-800 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="space-y-1">
          <div className="flex items-center gap-2 text-white font-bold text-sm">
            <ShieldCheck className="w-5 h-5 text-sky-400" />
            <span>Commercial Governance Policy (Cryo Scientific Systems)</span>
          </div>
          <p className="text-xs text-slate-400 max-w-2xl leading-relaxed">
            A Sales Order cannot be generated under any circumstances if any of the five verification points is marked as MISMATCH. If mismatches exist, a Customer PO Amendment must be requested and verified.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <div className="bg-slate-800 px-3 py-2 rounded-xl text-center border border-slate-700">
            <div className="text-[10px] text-slate-400 font-medium">Verification Points</div>
            <div className="text-sm font-bold text-white">5 Mandatory</div>
          </div>
          <div className="bg-slate-800 px-3 py-2 rounded-xl text-center border border-slate-700">
            <div className="text-[10px] text-slate-400 font-medium">SO Authorization</div>
            <div className="text-sm font-bold text-emerald-400">100% Match Only</div>
          </div>
        </div>
      </div>

      {/* Active Purchase Orders Verification Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {loading ? (
          <div className="col-span-2 py-12 text-center text-xs text-slate-400">
            Loading verification status records...
          </div>
        ) : pos.length === 0 ? (
          <div className="col-span-2 py-12 text-center text-xs text-slate-400">
            No customer purchase orders found in the system.
          </div>
        ) : (
          pos.map((po) => {
            const isPassed = po.verificationStatus === 'Passed';
            const isFailed = po.verificationStatus === 'Failed_Mismatch';

            return (
              <Card
                key={po._id}
                className={`border transition ${
                  isPassed
                    ? 'border-emerald-200 bg-emerald-50/20'
                    : isFailed
                    ? 'border-red-200 bg-red-50/20'
                    : 'border-slate-200'
                }`}
              >
                <CardHeader
                  title={po.poNumber}
                  subtitle={`Customer: ${po.customer?.companyName || 'N/A'} (v${po.amendmentVersion || 1})`}
                  action={<Badge size="md">{po.verificationStatus}</Badge>}
                />
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-2 gap-3 text-xs bg-white p-3 rounded-lg border border-slate-200/80">
                    <div>
                      <span className="text-slate-400 block">PO Value:</span>
                      <span className="font-bold text-slate-900">{formatINR(po.poValue)}</span>
                    </div>
                    <div>
                      <span className="text-slate-400 block">Delivery Date:</span>
                      <span className="font-semibold text-slate-800">
                        {dayjs(po.deliveryDate).format('DD MMM YYYY')}
                      </span>
                    </div>
                    <div className="col-span-2">
                      <span className="text-slate-400 block">Equipment Summary:</span>
                      <span className="font-medium text-slate-800 line-clamp-1">{po.itemSummary}</span>
                    </div>
                    <div className="col-span-2">
                      <span className="text-slate-400 block">Commercial Terms:</span>
                      <span className="font-medium text-slate-800 line-clamp-1">{po.paymentTerms}</span>
                    </div>
                  </div>

                  <div className="flex items-center justify-between pt-2 border-t border-slate-100">
                    <div className="flex items-center gap-1.5 text-xs font-semibold">
                      {isPassed ? (
                        <span className="text-emerald-700 flex items-center gap-1">
                          <CheckCircle2 className="w-4 h-4" /> Cleared for Sales Order
                        </span>
                      ) : isFailed ? (
                        <span className="text-red-700 flex items-center gap-1">
                          <ShieldAlert className="w-4 h-4" /> SO Creation Strictly Blocked
                        </span>
                      ) : (
                        <span className="text-amber-700 flex items-center gap-1">
                          <ClipboardCheck className="w-4 h-4" /> Verification Required
                        </span>
                      )}
                    </div>

                    <Link to={`/leads/${po.lead?._id}`}>
                      <Button size="sm" variant={isPassed ? 'secondary' : 'primary'}>
                        Open 5-Point Checklist &rarr;
                      </Button>
                    </Link>
                  </div>
                </CardContent>
              </Card>
            );
          })
        )}
      </div>
    </div>
  );
};

