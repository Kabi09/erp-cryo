import React from 'react';
import { useAuthStore } from '../store/useAuthStore';
import { LogOut, User, Shield, Bell } from 'lucide-react';
import { Button } from '../components/ui/Button';

export const Header = () => {
  const { user, logout } = useAuthStore();

  return (
    <header className="h-16 bg-white border-b border-slate-200 px-6 flex items-center justify-between sticky top-0 z-30 shadow-xs">
      {/* Title / breadcrumb note */}
      <div className="flex items-center gap-3">
        <span className="text-xs font-semibold uppercase tracking-wider text-sky-800 bg-sky-50 px-2.5 py-1 rounded-md border border-sky-200">
          Cryo Scientific Systems Pvt Ltd
        </span>
        <span className="text-slate-300">|</span>
        <span className="text-xs text-slate-500 font-medium">
          Commercial Lead-to-Production Workflow Management
        </span>
      </div>

      {/* Right controls */}
      <div className="flex items-center gap-4">
        {/* User profile capsule */}
        <div className="flex items-center gap-3 bg-slate-50 border border-slate-200 rounded-full px-3 py-1.5 shadow-2xs">
          <div className="w-7 h-7 rounded-full bg-sky-600 text-white flex items-center justify-center font-bold text-xs uppercase shadow-xs">
            {user?.name ? user.name.charAt(0) : 'A'}
          </div>
          <div className="text-left hidden sm:block">
            <div className="text-xs font-semibold text-slate-800 leading-tight">
              {user?.name || 'Sales Administrator'}
            </div>
            <div className="text-[10px] text-slate-500 font-medium capitalize">
              {user?.role?.replace('_', ' ') || 'Sales Admin'}
            </div>
          </div>
        </div>

        {/* Logout button */}
        <Button
          variant="secondary"
          size="sm"
          onClick={logout}
          icon={LogOut}
          title="Sign out of system"
        >
          Logout
        </Button>
      </div>
    </header>
  );
};

