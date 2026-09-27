import React from 'react';
import { School } from '../types';
import { LogOut, Settings, Calendar, ShieldCheck, Download, Menu } from 'lucide-react';

interface NavbarProps {
  school: School;
  onLogout: () => void;
  onNavigate: (tab: string) => void;
  onToggleSidebar: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({ school, onLogout, onNavigate, onToggleSidebar }) => {
  // Generate circular initials
  const initials = school.name
    .split(' ')
    .filter(Boolean)
    .slice(0, 3)
    .map(w => w[0].toUpperCase())
    .join('');

  return (
    <header className="sticky top-0 z-30 bg-white border-b border-slate-200 px-4 py-2.5 shadow-xs print:hidden">
      <div className="flex items-center justify-between">
        
        {/* Left: Mobile Toggle & School Branding */}
        <div className="flex items-center gap-3">
          <button
            onClick={onToggleSidebar}
            className="lg:hidden p-2 rounded-lg text-slate-600 hover:bg-slate-100 hover:text-slate-900 focus:outline-hidden"
          >
            <Menu className="w-5 h-5" />
          </button>

          <div className="flex items-center gap-3">
            {school.logo_path ? (
              <img
                src={school.logo_path}
                alt={school.name}
                className="w-11 h-11 rounded-full object-cover border-2 border-blue-600 shadow-sm"
              />
            ) : (
              <div className="relative w-11 h-11 rounded-full bg-linear-to-br from-blue-900 to-blue-600 flex items-center justify-center text-white border-2 border-amber-400 shadow-md">
                <span className="font-bold text-xs tracking-wider">{initials || 'SCH'}</span>
                <span className="absolute -top-1 -right-1 text-[10px]">★</span>
              </div>
            )}

            <div>
              <div className="flex items-center gap-2">
                <h1 className="font-bold text-slate-900 uppercase tracking-tight text-sm sm:text-base leading-tight">
                  {school.name}
                </h1>
                <span className="hidden sm:inline-flex items-center gap-1 text-[11px] font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
                  <ShieldCheck className="w-3 h-3 text-emerald-600" /> Multi-Tenant MySQL
                </span>
              </div>
              <div className="font-serif text-blue-700 font-bold text-xs sm:text-sm tracking-wide leading-tight" dir="rtl">
                "{school.urdu_slogan || 'تعلیم روشنی ہے، کردار کامیابی کی پہچان ہے'}"
              </div>
            </div>
          </div>
        </div>

        {/* Right: Academic Session, Hostinger Zip button & User Profile */}
        <div className="flex items-center gap-2 sm:gap-3">
          <button
            onClick={() => onNavigate('hostinger_hub')}
            className="hidden md:inline-flex items-center gap-1.5 text-xs font-semibold bg-blue-50 text-blue-700 hover:bg-blue-100 border border-blue-200 px-3 py-1.5 rounded-lg transition-colors"
            title="Download Hostinger PHP/MySQL Package"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Hostinger Files (.ZIP)</span>
          </button>

          <div className="hidden sm:flex items-center gap-1 text-xs text-slate-600 bg-slate-100 border border-slate-200 px-2.5 py-1 rounded-lg">
            <Calendar className="w-3.5 h-3.5 text-slate-500" />
            <span>Session: <strong className="text-slate-800">{school.academic_session}</strong></span>
          </div>

          <div className="flex items-center gap-1 border-l border-slate-200 pl-2 sm:pl-3">
            <button
              onClick={() => onNavigate('settings')}
              className="p-1.5 rounded-lg text-slate-600 hover:text-slate-900 hover:bg-slate-100 transition-colors"
              title="Settings"
            >
              <Settings className="w-4 h-4" />
            </button>
            <button
              onClick={onLogout}
              className="flex items-center gap-1 text-xs font-semibold text-rose-600 hover:text-rose-700 bg-rose-50 hover:bg-rose-100 border border-rose-200 px-2.5 py-1.5 rounded-lg transition-colors"
              title="Log Out"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Logout</span>
            </button>
          </div>

        </div>

      </div>
    </header>
  );
};
