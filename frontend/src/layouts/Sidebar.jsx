import React, { useEffect } from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import { useUiStore } from '../store/useUiStore';
import {
  LayoutDashboard,
  Users2,
  Building2,
  FileSpreadsheet,
  Receipt,
  FileCheck2,
  ClipboardCheck,
  PackageCheck,
  Flame,
  ChevronRight,
  X
} from 'lucide-react';

export const Sidebar = () => {
  const { isMobileSidebarOpen, closeMobileSidebar } = useUiStore();
  const location = useLocation();

  // Close mobile sidebar on route change
  useEffect(() => {
    closeMobileSidebar();
  }, [location.pathname]);

  const navItems = [
    { name: 'Sales Dashboard', path: '/', icon: LayoutDashboard },
    { name: 'Leads & Enquiries', path: '/leads', icon: Users2 },
    { name: 'Customer Master', path: '/customers', icon: Building2 },
    { name: 'Quotations', path: '/quotations', icon: FileSpreadsheet },
    { name: 'Proforma Invoices', path: '/proforma-invoices', icon: Receipt },
    { name: 'Customer POs', path: '/purchase-orders', icon: FileCheck2 },
    { name: '5-Point PO Verification', path: '/verifications', icon: ClipboardCheck },
    { name: 'Sales Orders', path: '/sales-orders', icon: PackageCheck },
  ];

  const sidebarContent = (
    <div className="flex flex-col h-full select-none">
      {/* Brand Header */}
      <div className="h-16 flex items-center justify-between px-5 border-b border-slate-800 bg-slate-950/40">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-lg bg-sky-600 flex items-center justify-center text-white shadow-md shadow-sky-600/30 shrink-0">
            <Flame className="w-5 h-5 text-sky-100 rotate-180" />
          </div>
          <div className="min-w-0">
            <h1 className="text-sm font-bold text-white tracking-wide leading-tight truncate">CRYO SCIENTIFIC</h1>
            <p className="text-[10px] text-sky-400 font-medium tracking-wider truncate">SALES WORKFLOW ERP</p>
          </div>
        </div>

        {/* Mobile close button */}
        <button
          type="button"
          onClick={closeMobileSidebar}
          className="lg:hidden p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition"
          aria-label="Close navigation"
        >
          <X className="w-5 h-5" />
        </button>
      </div>

      {/* Navigation menu */}
      <div className="flex-1 py-4 px-3 space-y-1 overflow-y-auto">
        <div className="px-3 pb-2 text-[10px] font-semibold text-slate-400 uppercase tracking-wider">
          Sales Operations
        </div>
        {navItems.map((item) => {
          const Icon = item.icon;
          return (
            <NavLink
              key={item.path}
              to={item.path}
              end={item.path === '/'}
              onClick={closeMobileSidebar}
              className={({ isActive }) =>
                `flex items-center justify-between px-3 py-2.5 rounded-lg text-xs font-medium transition-all group ${
                  isActive
                    ? 'bg-sky-600 text-white shadow-xs font-semibold'
                    : 'text-slate-300 hover:bg-slate-800 hover:text-white'
                }`
              }
            >
              <div className="flex items-center gap-3 truncate">
                <Icon className="w-4 h-4 text-slate-400 group-hover:text-white transition-colors shrink-0" />
                <span className="truncate">{item.name}</span>
              </div>
              <ChevronRight className="w-3.5 h-3.5 opacity-0 group-hover:opacity-100 transition-opacity shrink-0" />
            </NavLink>
          );
        })}
      </div>

      {/* Bottom badge / status */}
      <div className="p-3.5 border-t border-slate-800/80 bg-slate-950/30">
        <div className="bg-slate-800/60 rounded-lg p-2.5 flex items-center gap-2.5 border border-slate-700/50">
          <div className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse shrink-0"></div>
          <div className="text-[11px] leading-tight truncate">
            <div className="text-white font-medium truncate">Production Handover</div>
            <div className="text-slate-400 text-[10px] truncate">Strict 5-Pt Check Enforced</div>
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <>
      {/* Desktop Static Sidebar */}
      <aside className="hidden lg:flex w-64 bg-slate-900 text-slate-300 flex-col flex-shrink-0 border-r border-slate-800">
        {sidebarContent}
      </aside>

      {/* Mobile Drawer Backdrop */}
      {isMobileSidebarOpen && (
        <div
          className="fixed inset-0 bg-slate-950/70 backdrop-blur-xs z-40 lg:hidden transition-opacity duration-300"
          onClick={closeMobileSidebar}
          aria-hidden="true"
        />
      )}

      {/* Mobile Slide-Over Drawer */}
      <div
        className={`fixed inset-y-0 left-0 z-50 w-72 bg-slate-900 text-slate-300 lg:hidden transform transition-transform duration-300 ease-in-out shadow-2xl ${
          isMobileSidebarOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        {sidebarContent}
      </div>
    </>
  );
};
