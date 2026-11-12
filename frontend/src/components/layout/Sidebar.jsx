import React from 'react';
import { NavLink } from 'react-router-dom';
import {
  LayoutDashboard,
  Inbox,
  Users,
  Box,
  Calculator,
  CalendarCheck,
  Award,
  FileText,
  MessageSquare,
  Receipt,
  ShoppingCart,
  CreditCard,
  CheckCircle2,
  BarChart3,
  UserCog,
  Snowflake,
  X
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

const navigationGroups = [
  {
    group: 'Main',
    items: [
      { name: 'Dashboard', path: '/', icon: LayoutDashboard },
      { name: 'Enquiries', path: '/enquiries', icon: Inbox }
    ]
  },
  {
    group: 'Master Data',
    items: [
      { name: 'Customers', path: '/customers', icon: Users },
      { name: 'Products & Specs', path: '/products', icon: Box }
    ]
  },
  {
    group: 'Sales Engineering',
    items: [
      { name: 'Estimations', path: '/estimations', icon: Calculator },
      { name: 'Follow-ups', path: '/followups', icon: CalendarCheck },
      { name: 'Leads (Won / Lost)', path: '/leads', icon: Award },
      { name: 'Quotations', path: '/quotations', icon: FileText },
      { name: 'Negotiations', path: '/negotiations', icon: MessageSquare }
    ]
  },
  {
    group: 'Order Execution',
    items: [
      { name: 'Proforma Invoices', path: '/proforma-invoices', icon: Receipt },
      { name: 'Customer POs', path: '/customer-pos', icon: ShoppingCart },
      { name: 'Payment Receipts', path: '/payments', icon: CreditCard },
      { name: 'Sales Orders', path: '/sales-orders', icon: CheckCircle2 }
    ]
  },
  {
    group: 'Administration',
    items: [
      { name: 'Reports & Register', path: '/reports', icon: BarChart3 },
      { name: 'User Management', path: '/users', icon: UserCog, roles: ['Super Admin', 'MD / Director'] }
    ]
  }
];

const Sidebar = ({ isOpen, onClose }) => {
  const { user } = useAuth();

  return (
    <>
      {/* Mobile Backdrop */}
      {isOpen && (
        <div
          className="fixed inset-0 z-40 bg-slate-900/50 backdrop-blur-sm lg:hidden"
          onClick={onClose}
        />
      )}

      {/* Sidebar Container */}
      <aside
        className={`fixed inset-y-0 left-0 z-50 w-64 bg-slate-900 text-white transform transition-transform duration-200 ease-in-out lg:static lg:translate-x-0 flex flex-col ${
          isOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        {/* Company Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-slate-800 bg-slate-950/40">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-lg bg-gradient-to-tr from-brand-500 to-sky-400 flex items-center justify-center shadow-md">
              <Snowflake className="w-5 h-5 text-white animate-pulse" />
            </div>
            <div>
              <h1 className="font-bold text-sm tracking-wide text-white leading-tight">CRYO SCIENTIFIC</h1>
              <p className="text-[10px] text-slate-400 font-medium tracking-wider">SYSTEMS PVT. LTD. — ERP</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-md text-slate-400 hover:text-white hover:bg-slate-800 lg:hidden"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Scrollable Navigation List */}
        <div className="flex-1 overflow-y-auto px-3 py-4 space-y-6">
          {navigationGroups.map((group) => {
            const visibleItems = group.items.filter((item) => {
              if (!item.roles) return true;
              return user?.role === 'Super Admin' || item.roles.includes(user?.role);
            });

            if (visibleItems.length === 0) return null;

            return (
              <div key={group.group}>
                <div className="px-3 mb-2 text-[10px] font-bold uppercase tracking-wider text-slate-400/80">
                  {group.group}
                </div>
                <div className="space-y-1">
                  {visibleItems.map((item) => {
                    const Icon = item.icon;
                    return (
                      <NavLink
                        key={item.path}
                        to={item.path}
                        end={item.path === '/'}
                        onClick={() => {
                          if (window.innerWidth < 1024) onClose();
                        }}
                        className={({ isActive }) =>
                          `flex items-center gap-3 px-3 py-2 rounded-lg text-xs font-medium transition-all group ${
                            isActive
                              ? 'bg-brand-600 text-white shadow-sm font-semibold'
                              : 'text-slate-300 hover:bg-slate-800/80 hover:text-white'
                          }`
                        }
                      >
                        <Icon className="w-4 h-4 text-slate-400 group-hover:text-white transition-colors" />
                        <span>{item.name}</span>
                      </NavLink>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>

        {/* System Version Footer */}
        <div className="p-3 border-t border-slate-800/60 bg-slate-950/20 text-center">
          <p className="text-[10px] text-slate-400">Cryo Scientific ERP v2.6 Enterprise</p>
        </div>
      </aside>
    </>
  );
};

export default Sidebar;
