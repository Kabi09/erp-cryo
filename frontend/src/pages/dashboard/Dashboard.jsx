import React, { useState, useEffect } from 'react';
import {
  Inbox,
  Clock,
  CalendarX,
  Calculator,
  FileCheck,
  Send,
  Award,
  XCircle,
  MessageSquare,
  ShoppingCart,
  CreditCard,
  CheckCircle,
  IndianRupee,
  TrendingUp,
  ArrowRight
} from 'lucide-react';
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  Legend
} from 'recharts';
import api from '../../services/api';
import Card from '../../components/common/Card';
import Badge from '../../components/common/Badge';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import { Link } from 'react-router-dom';

const Dashboard = () => {
  const [summary, setSummary] = useState(null);
  const [charts, setCharts] = useState(null);
  const [activities, setActivities] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        setLoading(true);
        const [sumRes, chartRes, actRes] = await Promise.all([
          api.get('/dashboard/summary'),
          api.get('/dashboard/charts'),
          api.get('/dashboard/activities')
        ]);
        if (sumRes.data.success) setSummary(sumRes.data.data);
        if (chartRes.data.success) setCharts(chartRes.data.data);
        if (actRes.data.success) setActivities(actRes.data.data);
      } catch (err) {
        console.error('Dashboard load error', err);
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, []);

  if (loading) {
    return <LoadingSpinner text="Aggregating live ERP operational metrics..." />;
  }

  const statCards = [
    { label: 'Total Enquiries', value: summary?.totalEnquiries || 0, icon: Inbox, color: 'text-blue-600 bg-blue-50', link: '/enquiries' },
    { label: 'New Enquiries', value: summary?.newEnquiries || 0, icon: Clock, color: 'text-indigo-600 bg-indigo-50', link: '/enquiries?status=Submitted' },
    { label: "Today's Follow-ups", value: summary?.todayFollowUps || 0, icon: Clock, color: 'text-amber-600 bg-amber-50', link: '/followups?filter=today' },
    { label: 'Overdue Follow-ups', value: summary?.overdueFollowUps || 0, icon: CalendarX, color: 'text-rose-600 bg-rose-50', link: '/followups?filter=overdue' },
    { label: 'Pending Estimations', value: summary?.pendingEstimations || 0, icon: Calculator, color: 'text-purple-600 bg-purple-50', link: '/estimations' },
    { label: 'Quotations Sent', value: summary?.quotationsSent || 0, icon: Send, color: 'text-sky-600 bg-sky-50', link: '/quotations?status=Sent' },
    { label: 'Pending Quotations', value: summary?.pendingQuotations || 0, icon: FileCheck, color: 'text-orange-600 bg-orange-50', link: '/quotations?status=Pending Approval' },
    { label: 'Won Opportunities', value: summary?.wonOpportunities || 0, icon: Award, color: 'text-emerald-600 bg-emerald-50', link: '/leads?status=Won' },
    { label: 'Lost Opportunities', value: summary?.lostOpportunities || 0, icon: XCircle, color: 'text-red-600 bg-red-50', link: '/leads?status=Lost' },
    { label: 'Active Negotiations', value: summary?.activeNegotiations || 0, icon: MessageSquare, color: 'text-yellow-600 bg-yellow-50', link: '/negotiations' },
    { label: 'Pending Customer POs', value: summary?.pendingCustomerPOs || 0, icon: ShoppingCart, color: 'text-teal-600 bg-teal-50', link: '/customer-pos' },
    { label: 'Pending Payments', value: summary?.pendingPayments || 0, icon: CreditCard, color: 'text-cyan-600 bg-cyan-50', link: '/payments' },
    { label: 'Confirmed Sales Orders', value: summary?.confirmedSalesOrders || 0, icon: CheckCircle, color: 'text-emerald-700 bg-emerald-100', link: '/sales-orders' },
    {
      label: 'Total SO Order Value',
      value: `₹${((summary?.totalSalesOrderValue || 0) / 100000).toFixed(2)} L`,
      subtitle: `₹${(summary?.totalSalesOrderValue || 0).toLocaleString('en-IN')}`,
      icon: IndianRupee,
      color: 'text-brand-900 bg-brand-100',
      isHero: true,
      link: '/sales-orders'
    }
  ];

  const COLORS = ['#10b981', '#ef4444', '#f59e0b'];

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
        <div>
          <h1 className="text-xl font-bold text-slate-900">Executive Sales & Marketing Dashboard</h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Real-time pipeline monitoring from initial customer enquiry to plant release.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <div className="text-right">
            <span className="text-[11px] font-semibold uppercase tracking-wider text-slate-400 block">Enquiry Win Rate</span>
            <span className="text-base font-bold text-emerald-600">{charts?.conversionRates?.enquiryConversionRate || 0}%</span>
          </div>
          <div className="h-8 w-px bg-slate-200 mx-1"></div>
          <div className="text-right">
            <span className="text-[11px] font-semibold uppercase tracking-wider text-slate-400 block">Quote Acceptance</span>
            <span className="text-base font-bold text-brand-700">{charts?.conversionRates?.quotationConversionRate || 0}%</span>
          </div>
        </div>
      </div>

      {/* 14 Operational Metrics Cards Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-7 gap-3">
        {statCards.map((card, i) => {
          const Icon = card.icon;
          return (
            <Link
              key={i}
              to={card.link}
              className={`p-3.5 rounded-xl border transition-all hover:shadow-md flex flex-col justify-between group ${
                card.isHero
                  ? 'col-span-2 sm:col-span-1 bg-gradient-to-br from-brand-900 to-brand-950 text-white border-brand-800'
                  : 'bg-white border-slate-200/80 hover:border-brand-500'
              }`}
            >
              <div className="flex items-center justify-between mb-2">
                <span className={`text-[11px] font-medium leading-tight ${card.isHero ? 'text-slate-300' : 'text-slate-500'}`}>
                  {card.label}
                </span>
                <div className={`p-1.5 rounded-lg ${card.isHero ? 'bg-white/10 text-sky-300' : card.color}`}>
                  <Icon className="w-3.5 h-3.5" />
                </div>
              </div>
              <div>
                <span className={`text-xl font-bold block ${card.isHero ? 'text-white' : 'text-slate-900'}`}>
                  {card.value}
                </span>
                {card.subtitle && (
                  <span className="text-[10px] text-slate-400 truncate block mt-0.5">{card.subtitle}</span>
                )}
              </div>
            </Link>
          );
        })}
      </div>

      {/* Recharts Analytics Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Monthly Enquiries vs Sales Trends */}
        <div className="lg:col-span-2">
          <Card title="Monthly Enquiries & Confirmed Sales Trend" subtitle="6-month operational inflow & order closure performance">
            <div className="h-72 w-full pt-2">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={charts?.monthlyTrends || []} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
                  <defs>
                    <linearGradient id="colorSales" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#0f2d59" stopOpacity={0.4} />
                      <stop offset="95%" stopColor="#0f2d59" stopOpacity={0} />
                    </linearGradient>
                    <linearGradient id="colorEnq" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#38bdf8" stopOpacity={0.4} />
                      <stop offset="95%" stopColor="#38bdf8" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                  <XAxis dataKey="month" tick={{ fontSize: 11 }} />
                  <YAxis yAxisId="left" tick={{ fontSize: 11 }} />
                  <YAxis yAxisId="right" orientation="right" tickFormatter={(v) => `₹${v/100000}L`} tick={{ fontSize: 11 }} />
                  <Tooltip
                    formatter={(value, name) => [
                      name === 'salesAmount' ? `₹${Number(value).toLocaleString('en-IN')}` : value,
                      name === 'salesAmount' ? 'Order Value (INR)' : 'Total Enquiries'
                    ]}
                  />
                  <Legend wrapperStyle={{ fontSize: '11px', paddingTop: '10px' }} />
                  <Area yAxisId="left" type="monotone" dataKey="enquiries" stroke="#38bdf8" strokeWidth={2} fillOpacity={1} fill="url(#colorEnq)" name="Enquiries Count" />
                  <Area yAxisId="right" type="monotone" dataKey="salesAmount" stroke="#0f2d59" strokeWidth={2} fillOpacity={1} fill="url(#colorSales)" name="Sales Value (INR)" />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </Card>
        </div>

        {/* Won vs Lost Opportunities */}
        <Card title="Lead Conversion Distribution" subtitle="Won vs Lost vs Pipeline Opportunities">
          <div className="h-72 w-full flex flex-col items-center justify-center">
            <ResponsiveContainer width="100%" height="80%">
              <PieChart>
                <Pie
                  data={charts?.wonVsLost || []}
                  innerRadius={50}
                  outerRadius={75}
                  paddingAngle={5}
                  dataKey="value"
                >
                  {(charts?.wonVsLost || []).map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.fill || COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip formatter={(value) => [`${value} Leads`, 'Count']} />
              </PieChart>
            </ResponsiveContainer>
            <div className="flex items-center justify-center gap-4 text-xs mt-2">
              {(charts?.wonVsLost || []).map((item, idx) => (
                <div key={idx} className="flex items-center gap-1.5">
                  <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: item.fill || COLORS[idx] }}></span>
                  <span className="text-slate-600 font-medium">{item.name}: <b>{item.value}</b></span>
                </div>
              ))}
            </div>
          </div>
        </Card>
      </div>

      {/* Secondary Charts: Top Customers & Top Products */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card title="Top Client Accounts by Booked Revenue" subtitle="Highest value customer sales orders">
          <div className="h-64 w-full pt-2">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={charts?.customerSales || []} layout="vertical" margin={{ top: 5, right: 30, left: 40, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#e2e8f0" />
                <XAxis type="number" tickFormatter={(v) => `₹${v/100000}L`} tick={{ fontSize: 10 }} />
                <YAxis dataKey="customerName" type="category" width={110} tick={{ fontSize: 10 }} />
                <Tooltip formatter={(v) => [`₹${Number(v).toLocaleString('en-IN')}`, 'Sales Order Value']} />
                <Bar dataKey="totalValue" fill="#0f2d59" radius={[0, 4, 4, 0]} barSize={18} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </Card>

        <Card title="High Demand Equipment Models" subtitle="Product-wise confirmed orders & factory backlog">
          <div className="h-64 w-full pt-2">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={charts?.productSales || []} margin={{ top: 5, right: 20, left: 10, bottom: 25 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                <XAxis dataKey="_id" angle={-15} textAnchor="end" interval={0} tick={{ fontSize: 9 }} />
                <YAxis tickFormatter={(v) => `₹${v/100000}L`} tick={{ fontSize: 10 }} />
                <Tooltip formatter={(v) => [`₹${Number(v).toLocaleString('en-IN')}`, 'Order Revenue']} />
                <Bar dataKey="revenue" fill="#3b82f6" radius={[4, 4, 0, 0]} barSize={24} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </Card>
      </div>

      {/* Real-time Activities Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Enquiries */}
        <Card
          title="Recent Customer Enquiries"
          subtitle="Latest RFQs requiring assignment & estimation"
          action={
            <Link to="/enquiries" className="text-xs text-brand-600 hover:text-brand-800 font-semibold flex items-center gap-1">
              View all <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          }
          noPadding
        >
          <div className="divide-y divide-slate-100 overflow-x-auto">
            {activities?.recentEnquiries?.map((enq) => (
              <div key={enq._id} className="p-4 flex items-center justify-between hover:bg-slate-50/80 transition-colors">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-xs text-brand-900">{enq.enquiryNumber}</span>
                    <Badge>{enq.status}</Badge>
                  </div>
                  <p className="text-xs font-semibold text-slate-800 mt-0.5">{enq.companyName}</p>
                  <p className="text-[11px] text-slate-400">
                    {enq.products?.length || 0} Line item(s) • Priority: <span className="font-medium text-slate-600">{enq.priority}</span>
                  </p>
                </div>
                <span className="text-[11px] text-slate-400">
                  {new Date(enq.createdAt).toLocaleDateString()}
                </span>
              </div>
            ))}
          </div>
        </Card>

        {/* Pending Approvals & Clearances */}
        <Card
          title="Departmental Clearances Required"
          subtitle="Sales Orders awaiting multi-department sign-offs"
          action={
            <Link to="/sales-orders" className="text-xs text-brand-600 hover:text-brand-800 font-semibold flex items-center gap-1">
              Review SOs <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          }
          noPadding
        >
          <div className="divide-y divide-slate-100 overflow-x-auto">
            {activities?.pendingApprovals?.length === 0 ? (
              <p className="p-6 text-xs text-slate-400 text-center">All departmental clearances are up to date!</p>
            ) : (
              activities?.pendingApprovals?.map((so) => (
                <div key={so._id} className="p-4 flex items-center justify-between hover:bg-slate-50/80 transition-colors">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-xs text-brand-900">{so.soNumber}</span>
                      <Badge variant="warning">Approvals Pending</Badge>
                    </div>
                    <p className="text-xs font-semibold text-slate-800 mt-0.5">{so.customerName}</p>
                    <p className="text-[11px] text-slate-500">
                      Value: <b className="text-slate-800">₹{(so.soValue || 0).toLocaleString('en-IN')}</b> • Delivery Target: {new Date(so.deliveryDate).toLocaleDateString()}
                    </p>
                  </div>
                  <Link
                    to={`/sales-orders`}
                    className="px-2.5 py-1 text-xs bg-brand-50 text-brand-900 hover:bg-brand-100 font-semibold rounded-md border border-brand-200"
                  >
                    Action
                  </Link>
                </div>
              ))
            )}
          </div>
        </Card>
      </div>
    </div>
  );
};

export default Dashboard;
