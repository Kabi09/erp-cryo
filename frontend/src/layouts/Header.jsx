import React from 'react';
import { useAuthStore } from '../store/useAuthStore';
import { useUiStore } from '../store/useUiStore';
import { LogOut, Menu, Flame } from 'lucide-react';
import { Button } from '../components/ui/Button';

export const Header = () => {
  const { user, logout } = useAuthStore();
  const { toggleMobileSidebar } = useUiStore();

  return (
    <header className="h-16 bg-white border-b border-slate-200 px-3 sm:px-6 flex items-center justify-between sticky top-0 z-30 shadow-xs">
      {/* Left controls: Hamburger menu on mobile + Title */}
      <div className="flex items-center gap-2.5 sm:gap-3 min-w-0">
        <button
          type="button"
          onClick={toggleMobileSidebar}
          className="lg:hidden p-2 rounded-xl text-slate-600 hover:text-slate-900 hover:bg-slate-100 transition focus:outline-none focus:ring-2 focus:ring-sky-500/20"
          aria-label="Open navigation menu"
        >
          <Menu className="w-5 h-5" />
        </button>

        {/* Mobile quick brand mark */}
        <div className="flex items-center gap-2 lg:hidden">
          <div className="w-7 h-7 rounded-lg bg-sky-600 flex items-center justify-center text-white shadow-xs shrink-0">
            <Flame className="w-4 h-4 text-sky-100 rotate-180" />
          </div>
          <span className="text-xs font-bold text-slate-900 tracking-tight truncate sm:hidden">
            Cryo Scientific
          </span>
        </div>

        {/* Desktop / Tablet Brand Title */}
        <div className="hidden sm:flex items-center gap-2.5 truncate">
          <span className="text-xs font-semibold uppercase tracking-wider text-sky-800 bg-sky-50 px-2.5 py-1 rounded-md border border-sky-200 shrink-0">
            Cryo Scientific Systems
          </span>
          <span className="text-slate-300 hidden md:inline">|</span>
          <span className="text-xs text-slate-500 font-medium truncate hidden md:inline">
            Commercial Lead-to-Production Workflow Management
          </span>
        </div>
      </div>

      {/* Right controls */}
      <div className="flex items-center gap-2 sm:gap-4 shrink-0">
        {/* User profile capsule */}
        <div className="flex items-center gap-2 sm:gap-2.5 bg-slate-50 border border-slate-200 rounded-full px-2 py-1 sm:px-3 sm:py-1.5 shadow-2xs">
          <div className="w-7 h-7 rounded-full bg-sky-600 text-white flex items-center justify-center font-bold text-xs uppercase shadow-xs shrink-0">
            {user?.name ? user.name.charAt(0) : 'A'}
          </div>
          <div className="text-left hidden md:block">
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
          className="px-2.5 sm:px-3 text-xs"
        >
          <span className="hidden sm:inline">Logout</span>
        </Button>
      </div>
    </header>
  );
};
