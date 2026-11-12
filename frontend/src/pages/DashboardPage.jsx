import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../services/api';
import {
  Users2,
  Sparkles,
  CheckCircle2,
  Clock,
  Trophy,
  XCircle,
  Receipt,
  FileCheck2,
  AlertTriangle,
  PackageCheck,
  Factory,
  ArrowUpRight,
  TrendingUp,
  Activity as ActivityIcon,
  Plus
} from 'lucide-react';
import { Card, CardHeader, CardContent } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Badge } from '../components/ui/Badge';
import dayjs from 'dayjs';
import relativeTime from 'dayjs/plugin/relativeTime';

dayjs.extend(relativeTime);

export const DashboardPage = () => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchMetrics = async () => {
    try {
      setLoading(true);
      const res = await api.get('/dashboard/metrics');
      setData(res.data.data);
      setError(null);
    } catch (err) {
      setError(err.response?.data?.message || err.message || 'Failed to fetch dashboard metrics');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMetrics();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[500px]">
        <div className="flex flex-col items-center gap-3">
          <div className="w-9 h-9 border-3 border-sky-600 border-t-transparent rounded-full animate-spin" />
          <p className="text-xs font-medium text-slate-500">Loading sales dashboard metrics...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6 bg-red-50 border border-red-200 rounded-xl text-red-800 text-sm">
        <p className="font-semibold">Unable to load dashboard</p>
        <p className="text-xs mt-1">{error}</p>
        <Button variant="secondary" size="sm" className="mt-3" onClick={fetchMetrics}>
          Retry
        </Button>
      </div>
    );
  }

  const { cards, pipeline, recentActivities } = data || {};

  const statCards = [
    { title: 'Total Leads', value: cards?.totalLeads, icon: Users2, color: 'text-sky-600 bg-sky-50 border-sky-100', link: '/leads' },
    { title: 'New Enquiries', value: cards?.newEnquiries, icon: Sparkles, color: 'text-indigo-600 bg-indigo-50 border-indigo-100', link: '/leads?status=New' },
    { title: 'Qualified Leads', value: cards?.qualifiedLeads, icon: CheckCircle2, color: 'text-emerald-600 bg-emerald-50 border-emerald-100', link: '/leads?status=Qualified' },
    { title: 'Quotations Pending', value: cards?.quotationsPending, icon: Clock, color: 'text-amber-600 bg-amber-50 border-amber-100', link: '/quotations' },
    { title: 'Quotations Won', value: cards?.quotationsWon, icon: Trophy, color: 'text-emerald-700 bg-emerald-50 border-emerald-200', link: '/quotations?status=Won' },
    { title: 'Quotations Lost', value: cards?.quotationsLost, icon: XCircle, color: 'text-slate-600 bg-slate-100 border-slate-200', link: '/quotations?status=Lost' },
    { title: 'PI Generated', value: cards?.piGenerated, icon: Receipt, color: 'text-blue-600 bg-blue-50 border-blue-100', link: '/proforma-invoices' },
    { title: 'Customer PO Received', value: cards?.customerPOReceived, icon: FileCheck2, color: 'text-purple-600 bg-purple-50 border-purple-100', link: '/purchase-orders' },
    { title: 'PO Verification Pending', value: cards?.poVerificationPending, icon: AlertTriangle, color: 'text-rose-600 bg-rose-50 border-rose-200', link: '/purchase-orders?verificationStatus=Unverified' },
    { title: 'Sales Orders Created', value: cards?.salesOrdersCreated, icon: PackageCheck, color: 'text-teal-600 bg-teal-50 border-teal-100', link: '/sales-orders' },
    { title: 'Handed Over to Production', value: cards?.handedOverToProduction, icon: Factory, color: 'text-emerald-800 bg-emerald-100 border-emerald-300 font-bold', link: '/sales-orders?status=Handed Over to Production' },
  ];

  const formatINR = (val) => {
    return 'Rs. ' + Number(val || 0).toLocaleString('en-IN');
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 bg-white p-5 rounded-2xl border border-slate-200/90 shadow-2xs">
        <div>
          <h1 className="text-xl font-bold text-slate-900 tracking-tight">Sales Executive Dashboard</h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Real-time pipeline monitoring from Lead Enquiry to Production Handover
          </p>
        </div>
        <div className="flex items-center gap-3">
          <div className="bg-sky-50 border border-sky-200 rounded-xl px-4 py-2 text-right">
            <div className="text-[10px] uppercase font-bold text-sky-800 tracking-wider">Active Pipeline Value</div>
            <div className="text-base font-bold text-sky-950">{formatINR(cards?.totalPipelineValue)}</div>
          </div>
          <Link to="/leads?new=true">
            <Button size="md" icon={Plus}>New Enquiry</Button>
          </Link>
        </div>
      </div>

      {/* KPI Cards Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-3.5">
        {statCards.map((card, idx) => {
          const Icon = card.icon;
          return (
            <Link key={idx} to={card.link} className="group">
              <Card hover className="h-full border border-slate-200/80 p-3.5 flex flex-col justify-between">
                <div className="flex items-center justify-between">
                  <div className={`w-8 h-8 rounded-lg flex items-center justify-center border ${card.color}`}>
                    <Icon className="w-4 h-4" />
                  </div>
                  <ArrowUpRight className="w-3.5 h-3.5 text-slate-400 group-hover:text-sky-600 transition-colors" />
                </div>
                <div className="mt-3">
                  <div className="text-2xl font-bold text-slate-900 tracking-tight">{card.value || 0}</div>
                  <div className="text-[11px] font-medium text-slate-500 mt-0.5 line-clamp-1">{card.title}</div>
                </div>
              </Card>
            </Link>
          );
        })}
      </div>

      {/* Main Grid: Pipeline Funnel + Recent Activity Feed */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Pipeline Funnel Breakdown */}
        <div className="lg:col-span-7 space-y-6">
          <Card>
            <CardHeader
              title="Sales Workflow Pipeline Breakdown"
              subtitle="Current lead volume across the 12 workflow stages"
            />
            <CardContent className="space-y-3">
              {pipeline && pipeline.length > 0 ? (
                pipeline.map((item, idx) => {
                  const stageLabels = {
                    ENQUIRY_RECEIVED: '1. Enquiry Received',
                    QUALIFICATION: '2. Qualification',
                    CUSTOMER_MAPPED: '3. Customer Mapped',
                    QUOTATION_DRAFTED: '4. Quotation Drafted',
                    QUOTATION_SENT: '5. Quotation Sent',
                    CUSTOMER_REVIEW: '6. Customer Review',
                    QUOTATION_NEGOTIATION: '7. Negotiation & Revisions',
                    QUOTATION_WON: '8. Quotation Won',
                    PI_ISSUED: '9. Proforma Invoice Issued',
                    PO_RECEIVED: '10. Customer PO Received',
                    PO_VERIFICATION: '11. 5-Point Verification',
                    SO_CREATED: '12. Sales Order Created',
                    PRODUCTION_HANDOVER: '13. Handed Over to Production',
                  };

                  const maxCount = Math.max(...pipeline.map((p) => p.count), 1);
                  const widthPct = Math.max((item.count / maxCount) * 100, 4);

                  return (
                    <div key={idx} className="space-y-1">
                      <div className="flex items-center justify-between text-xs">
                        <span className="font-medium text-slate-700">{stageLabels[item.stage] || item.stage}</span>
                        <span className="font-bold text-slate-900 bg-slate-100 px-2 py-0.5 rounded-full text-[11px]">
                          {item.count}
                        </span>
                      </div>
                      <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                        <div
                          className={`h-full rounded-full transition-all duration-500 ${
                            item.stage === 'PRODUCTION_HANDOVER'
                              ? 'bg-emerald-600'
                              : item.stage === 'PO_VERIFICATION' || item.stage === 'PO_RECEIVED'
                              ? 'bg-purple-600'
                              : item.stage === 'QUOTATION_WON'
                              ? 'bg-teal-600'
                              : 'bg-sky-600'
                          }`}
                          style={{ width: `${widthPct}%` }}
                        />
                      </div>
                    </div>
                  );
                })
              ) : (
                <p className="text-xs text-slate-400 py-6 text-center">No pipeline records found.</p>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Recent Activity Audit Timeline */}
        <div className="lg:col-span-5 space-y-6">
          <Card>
            <CardHeader
              title="Recent Workflow Activities"
              subtitle="Audit log of commercial actions & verification checks"
              action={
                <Link to="/leads" className="text-xs font-semibold text-sky-600 hover:text-sky-700">
                  View Leads &rarr;
                </Link>
              }
            />
            <CardContent className="p-0">
              <div className="divide-y divide-slate-100 max-h-[460px] overflow-y-auto">
                {recentActivities && recentActivities.length > 0 ? (
                  recentActivities.map((act) => (
                    <div key={act._id} className="p-4 hover:bg-slate-50/70 transition flex items-start gap-3">
                      <div className="w-2 h-2 rounded-full bg-sky-600 mt-1.5 flex-shrink-0" />
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between gap-2">
                          <p className="text-xs font-semibold text-slate-900 truncate">{act.title}</p>
                          <span className="text-[10px] text-slate-400 whitespace-nowrap">
                            {dayjs(act.createdAt).fromNow()}
                          </span>
                        </div>
                        <p className="text-xs text-slate-600 mt-0.5 line-clamp-2 leading-relaxed">
                          {act.description}
                        </p>
                        <div className="flex items-center gap-2 mt-1 text-[10px] text-slate-500 font-medium">
                          {act.lead?.leadNumber && (
                            <Link to={`/leads/${act.lead._id}`} className="text-sky-700 hover:underline">
                              {act.lead.leadNumber} ({act.lead.companyName})
                            </Link>
                          )}
                          <span>•</span>
                          <span>by {act.user?.name || 'Sales Admin'}</span>
                        </div>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="p-8 text-center text-xs text-slate-400">No recent activities logged.</div>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

