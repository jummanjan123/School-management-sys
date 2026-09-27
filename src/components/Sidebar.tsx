import React from 'react';
import {
  LayoutDashboard,
  PlusSquare,
  GraduationCap,
  Users,
  UserCheck,
  Package,
  CalendarCheck,
  Wallet,
  CreditCard,
  Award,
  FileText,
  BarChart3,
  Settings,
  Server,
  LogOut,
  X
} from 'lucide-react';

interface SidebarProps {
  currentTab: string;
  onSelectTab: (tab: string) => void;
  isOpen: boolean;
  onClose: () => void;
  onLogout: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  currentTab,
  onSelectTab,
  isOpen,
  onClose,
  onLogout
}) => {
  const navItems = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard, badge: null },
    { id: 'universal_add', label: 'Universal Add', icon: PlusSquare, highlight: true },
    { type: 'header', label: 'People & Records' },
    { id: 'students', label: 'Students', icon: GraduationCap, color: 'text-amber-400' },
    { id: 'teachers', label: 'Teachers', icon: Users, color: 'text-blue-400' },
    { id: 'staff', label: 'Other Staff', icon: UserCheck, color: 'text-emerald-400' },
    { id: 'inventory', label: 'Inventory Assets', icon: Package, color: 'text-cyan-400' },
    { type: 'header', label: 'Operations & Finance' },
    { id: 'attendance', label: 'Daily Attendance', icon: CalendarCheck, color: 'text-rose-400' },
    { id: 'fees', label: 'Fee Management', icon: Wallet, color: 'text-emerald-400' },
    { type: 'header', label: 'PVC Cards & Certificates' },
    { id: 'id_cards', label: 'PVC ID Cards', icon: CreditCard, color: 'text-amber-400' },
    { id: 'character_cert', label: 'Character Certificate', icon: Award, color: 'text-sky-400' },
    { id: 'leaving_cert', label: 'Leaving Certificate', icon: FileText, color: 'text-rose-400' },
    { type: 'header', label: 'Administration' },
    { id: 'reports', label: 'Analytical Reports', icon: BarChart3 },
    { id: 'settings', label: 'Settings & Backup', icon: Settings },
    { id: 'hostinger_hub', label: 'Hostinger PHP Package', icon: Server, badge: 'PHP 8+' }
  ];

  return (
    <>
      {/* Mobile Backdrop */}
      {isOpen && (
        <div
          className="fixed inset-0 z-40 bg-slate-900/60 backdrop-blur-xs lg:hidden"
          onClick={onClose}
        />
      )}

      {/* Sidebar Panel */}
      <aside
        className={`fixed top-0 bottom-0 left-0 z-50 w-64 bg-slate-900 text-slate-300 flex flex-col transition-transform duration-300 ease-in-out lg:static lg:translate-x-0 ${
          isOpen ? 'translate-x-0' : '-translate-x-full'
        } print:hidden`}
      >
        {/* Brand Top Header */}
        <div className="flex items-center justify-between p-4 border-b border-slate-800">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-blue-600 flex items-center justify-center text-white shadow-md">
              <GraduationCap className="w-5 h-5" />
            </div>
            <div>
              <div className="font-bold text-white text-sm tracking-tight leading-tight">SMART SCHOOL</div>
              <div className="text-[10px] text-slate-400 tracking-wider uppercase font-semibold">Management System</div>
            </div>
          </div>
          <button
            onClick={onClose}
            className="lg:hidden text-slate-400 hover:text-white p-1 rounded-md"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Navigation List */}
        <nav className="flex-1 overflow-y-auto px-3 py-3 space-y-1">
          {navItems.map((item, idx) => {
            if (item.type === 'header') {
              return (
                <div
                  key={idx}
                  className="px-3 pt-3 pb-1 text-[11px] font-bold text-slate-400 uppercase tracking-wider"
                >
                  {item.label}
                </div>
              );
            }

            const Icon = item.icon!;
            const isActive = currentTab === item.id;

            return (
              <button
                key={item.id}
                onClick={() => {
                  onSelectTab(item.id!);
                  onClose();
                }}
                className={`w-full flex items-center justify-between px-3 py-2 rounded-lg text-xs font-medium transition-all ${
                  isActive
                    ? 'bg-blue-600 text-white font-semibold shadow-sm'
                    : item.highlight
                    ? 'bg-slate-800 text-amber-300 hover:bg-slate-700 hover:text-white border border-amber-500/20'
                    : 'text-slate-300 hover:bg-slate-800 hover:text-white'
                }`}
              >
                <div className="flex items-center gap-3">
                  <Icon
                    className={`w-4 h-4 ${
                      isActive ? 'text-white' : item.color || 'text-slate-400'
                    }`}
                  />
                  <span>{item.label}</span>
                </div>

                {item.badge && (
                  <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 font-semibold border border-emerald-500/30">
                    {item.badge}
                  </span>
                )}
              </button>
            );
          })}
        </nav>

        {/* Logout Footer */}
        <div className="p-3 border-t border-slate-800">
          <button
            onClick={onLogout}
            className="w-full flex items-center justify-center gap-2 px-3 py-2 rounded-lg text-xs font-semibold text-rose-400 hover:text-rose-300 hover:bg-rose-950/40 border border-rose-900/30 transition-colors"
          >
            <LogOut className="w-4 h-4" />
            <span>Sign Out Session</span>
          </button>
        </div>
      </aside>
    </>
  );
};
