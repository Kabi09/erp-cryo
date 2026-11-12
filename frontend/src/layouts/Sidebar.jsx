import React from 'react';
import { NavLink } from 'react-router-dom';
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
  ShieldAlert
} from 'lucide-react';

export const Sidebar = () => {
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

  return (
    <aside className="w-64 bg-slate-900 text-slate-300 flex flex-col flex-shrink-0 border-r border-slate-800 select-none">
      {/* Brand Header */}
      <div className="h-16 flex items-center px-5 border-b border-slate-800 bg-slate-950/40">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-lg bg-sky-600 flex items-center justify-center text-white shadow-md shadow-sky-600/30">
            <Flame className="w-5 h-5 text-sky-100 rotate-180" />
          </div>
          <div>
            <h1 className="text-sm font-bold text-white tracking-wide leading-tight">CRYO SCIENTIFIC</h1>
            <p className="text-[10px] text-sky-400 font-medium tracking-wider">SALES WORKFLOW ERP</p>
          </div>
        </div>
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
              className={({ isActive }) =>
                `flex items-center justify-between px-3 py-2.5 rounded-lg text-xs font-medium transition-all group ${
                  isActive
                    ? 'bg-sky-600 text-white shadow-xs font-semibold'
                    : 'text-slate-300 hover:bg-slate-800 hover:text-white'
                }`
              }
            >
              <div className="flex items-center gap-3">
                <Icon className="w-4 h-4 text-slate-400 group-hover:text-white transition-colors" />
                <span>{item.name}</span>
              </div>
              <ChevronRight className="w-3.5 h-3.5 opacity-0 group-hover:opacity-100 transition-opacity" />
            </NavLink>
          );
        })}
      </div>

      {/* Bottom badge / status */}
      <div className="p-3.5 border-t border-slate-800/80 bg-slate-950/30">
        <div className="bg-slate-800/60 rounded-lg p-2.5 flex items-center gap-2.5 border border-slate-700/50">
          <div className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></div>
          <div className="text-[11px] leading-tight">
            <div className="text-white font-medium">Production Handover</div>
            <div className="text-slate-400 text-[10px]">Strict 5-Pt Check Enforced</div>
          </div>
        </div>
      </div>
    </aside>
  );
};

