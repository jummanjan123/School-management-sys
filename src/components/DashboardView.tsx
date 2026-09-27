import React, { useEffect, useState } from 'react';
import { apiRequest, formatCurrency } from '../api';
import { School, ActivityLog } from '../types';
import {
  GraduationCap,
  Users,
  UserCheck,
  Package,
  CalendarCheck,
  Wallet,
  Clock,
  PlusCircle,
  FileCheck,
  CreditCard,
  Building2,
  AlertCircle,
  ArrowRight,
  Download
} from 'lucide-react';

interface DashboardViewProps {
  school: School;
  onNavigate: (tab: string, extra?: any) => void;
}

export const DashboardView: React.FC<DashboardViewProps> = ({ school, onNavigate }) => {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  const fetchDashboard = async () => {
    try {
      setLoading(true);
      const res = await apiRequest('/api/dashboard');
      setData(res);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboard();
  }, []);

  if (loading || !data) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  const { totalStudents, totalTeachers, totalStaff, totalInventory, totalClasses, totalFeesCollected, totalPendingFees, attendanceToday, recentActivities } = data;

  const studPresent = attendanceToday?.student?.present || 0;
  const studRate = totalStudents > 0 ? Math.round((studPresent / totalStudents) * 100) : 0;

  const teachPresent = attendanceToday?.teacher?.present || 0;
  const teachRate = totalTeachers > 0 ? Math.round((teachPresent / totalTeachers) * 100) : 0;

  return (
    <div className="space-y-6">
      
      {/* Institutional Banner */}
      <div className="rounded-2xl p-6 md:p-8 bg-linear-to-r from-blue-900 via-blue-800 to-indigo-900 text-white shadow-md relative overflow-hidden">
        <div className="relative z-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-2 bg-amber-400/20 text-amber-300 border border-amber-400/30 px-3 py-1 rounded-full text-xs font-semibold mb-3">
              <span>Academic Year {school.academic_session}</span>
              <span>•</span>
              <span>Head Administrator: {school.head_name}</span>
            </div>
            <h2 className="text-2xl md:text-3xl font-extrabold tracking-tight">
              {school.name}
            </h2>
            <p className="text-slate-300 text-sm mt-1 max-w-xl">
              Centralized administrative portal: student enrollment, faculty management, class-wise tuition ledgers, PVC card generator, and attendance records.
            </p>
            <div className="font-serif text-amber-300 text-base md:text-lg font-bold mt-3" dir="rtl">
              "{school.urdu_slogan}"
            </div>
          </div>

          <div className="flex flex-col sm:flex-row gap-2.5 shrink-0">
            <button
              onClick={() => onNavigate('universal_add')}
              className="px-4 py-2.5 rounded-xl bg-amber-400 hover:bg-amber-300 text-slate-950 font-bold text-xs shadow-md flex items-center justify-center gap-2 transition-transform active:scale-95"
            >
              <PlusCircle className="w-4 h-4" />
              <span>Universal Add Record</span>
            </button>
            <button
              onClick={() => onNavigate('hostinger_hub')}
              className="px-4 py-2.5 rounded-xl bg-white/10 hover:bg-white/20 text-white font-semibold text-xs border border-white/20 flex items-center justify-center gap-2 transition-colors"
            >
              <Download className="w-4 h-4" />
              <span>Hostinger Release</span>
            </button>
          </div>
        </div>
      </div>

      {/* Quick Action Shortcuts */}
      <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-2.5">
        <button
          onClick={() => onNavigate('universal_add', { type: 'student' })}
          className="p-3 bg-white hover:bg-amber-50/50 border border-slate-200 hover:border-amber-300 rounded-xl flex items-center gap-2 text-left transition-all shadow-2xs group"
        >
          <div className="p-2 rounded-lg bg-amber-100 text-amber-700 group-hover:scale-105 transition-transform">
            <GraduationCap className="w-4 h-4" />
          </div>
          <div>
            <div className="text-xs font-bold text-slate-800 leading-tight">+ Student</div>
            <div className="text-[10px] text-slate-500">Admission</div>
          </div>
        </button>

        <button
          onClick={() => onNavigate('universal_add', { type: 'teacher' })}
          className="p-3 bg-white hover:bg-blue-50/50 border border-slate-200 hover:border-blue-300 rounded-xl flex items-center gap-2 text-left transition-all shadow-2xs group"
        >
          <div className="p-2 rounded-lg bg-blue-100 text-blue-700 group-hover:scale-105 transition-transform">
            <Users className="w-4 h-4" />
          </div>
          <div>
            <div className="text-xs font-bold text-slate-800 leading-tight">+ Teacher</div>
            <div className="text-[10px] text-slate-500">Faculty</div>
          </div>
        </button>

        <button
          onClick={() => onNavigate('universal_add', { type: 'staff' })}
          className="p-3 bg-white hover:bg-emerald-50/50 border border-slate-200 hover:border-emerald-300 rounded-xl flex items-center gap-2 text-left transition-all shadow-2xs group"
        >
          <div className="p-2 rounded-lg bg-emerald-100 text-emerald-700 group-hover:scale-105 transition-transform">
            <UserCheck className="w-4 h-4" />
          </div>
          <div>
            <div className="text-xs font-bold text-slate-800 leading-tight">+ Staff</div>
            <div className="text-[10px] text-slate-500">Support</div>
          </div>
        </button>

        <button
          onClick={() => onNavigate('universal_add', { type: 'inventory' })}
          className="p-3 bg-white hover:bg-cyan-50/50 border border-slate-200 hover:border-cyan-300 rounded-xl flex items-center gap-2 text-left transition-all shadow-2xs group"
        >
          <div className="p-2 rounded-lg bg-cyan-100 text-cyan-700 group-hover:scale-105 transition-transform">
            <Package className="w-4 h-4" />
          </div>
          <div>
            <div className="text-xs font-bold text-slate-800 leading-tight">+ Inventory</div>
            <div className="text-[10px] text-slate-500">Asset item</div>
          </div>
        </button>

        <button
          onClick={() => onNavigate('attendance')}
          className="p-3 bg-white hover:bg-rose-50/50 border border-slate-200 hover:border-rose-300 rounded-xl flex items-center gap-2 text-left transition-all shadow-2xs group"
        >
          <div className="p-2 rounded-lg bg-rose-100 text-rose-700 group-hover:scale-105 transition-transform">
            <CalendarCheck className="w-4 h-4" />
          </div>
          <div>
            <div className="text-xs font-bold text-slate-800 leading-tight">Attendance</div>
            <div className="text-[10px] text-slate-500">Daily roll</div>
          </div>
        </button>

        <button
          onClick={() => onNavigate('fees', { tab: 'collect' })}
          className="p-3 bg-white hover:bg-emerald-50/50 border border-slate-200 hover:border-emerald-300 rounded-xl flex items-center gap-2 text-left transition-all shadow-2xs group"
        >
          <div className="p-2 rounded-lg bg-emerald-100 text-emerald-700 group-hover:scale-105 transition-transform">
            <Wallet className="w-4 h-4" />
          </div>
          <div>
            <div className="text-xs font-bold text-slate-800 leading-tight">Collect Fee</div>
            <div className="text-[10px] text-slate-500">Print slip</div>
          </div>
        </button>

        <button
          onClick={() => onNavigate('id_cards')}
          className="col-span-2 sm:col-span-2 lg:col-span-1 p-3 bg-white hover:bg-amber-50/50 border border-slate-200 hover:border-amber-300 rounded-xl flex items-center gap-2 text-left transition-all shadow-2xs group"
        >
          <div className="p-2 rounded-lg bg-amber-100 text-amber-700 group-hover:scale-105 transition-transform">
            <CreditCard className="w-4 h-4" />
          </div>
          <div>
            <div className="text-xs font-bold text-slate-800 leading-tight">PVC Cards</div>
            <div className="text-[10px] text-slate-500">All themes</div>
          </div>
        </button>
      </div>

      {/* Primary Metrics Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total Students */}
        <div
          onClick={() => onNavigate('students')}
          className="bg-white p-5 rounded-2xl border border-slate-200 shadow-2xs hover:shadow-md transition-all cursor-pointer group"
        >
          <div className="flex items-center justify-between">
            <div>
              <span className="text-xs font-bold uppercase tracking-wider text-slate-500">Total Students</span>
              <h3 className="text-2xl font-black text-amber-500 my-1">{totalStudents}</h3>
              <span className="text-xs font-semibold text-amber-700 bg-amber-50 px-2 py-0.5 rounded-full border border-amber-200">
                Active Enrolled
              </span>
            </div>
            <div className="w-12 h-12 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center group-hover:scale-110 transition-transform">
              <GraduationCap className="w-6 h-6" />
            </div>
          </div>
        </div>

        {/* Total Teachers */}
        <div
          onClick={() => onNavigate('teachers')}
          className="bg-white p-5 rounded-2xl border border-slate-200 shadow-2xs hover:shadow-md transition-all cursor-pointer group"
        >
          <div className="flex items-center justify-between">
            <div>
              <span className="text-xs font-bold uppercase tracking-wider text-slate-500">Faculty Teachers</span>
              <h3 className="text-2xl font-black text-blue-600 my-1">{totalTeachers}</h3>
              <span className="text-xs font-semibold text-blue-700 bg-blue-50 px-2 py-0.5 rounded-full border border-blue-200">
                Teaching Faculty
              </span>
            </div>
            <div className="w-12 h-12 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center group-hover:scale-110 transition-transform">
              <Users className="w-6 h-6" />
            </div>
          </div>
        </div>

        {/* Other Staff */}
        <div
          onClick={() => onNavigate('staff')}
          className="bg-white p-5 rounded-2xl border border-slate-200 shadow-2xs hover:shadow-md transition-all cursor-pointer group"
        >
          <div className="flex items-center justify-between">
            <div>
              <span className="text-xs font-bold uppercase tracking-wider text-slate-500">Support Staff</span>
              <h3 className="text-2xl font-black text-emerald-600 my-1">{totalStaff}</h3>
              <span className="text-xs font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
                Non-Teaching
              </span>
            </div>
            <div className="w-12 h-12 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center group-hover:scale-110 transition-transform">
              <UserCheck className="w-6 h-6" />
            </div>
          </div>
        </div>

        {/* Inventory Assets */}
        <div
          onClick={() => onNavigate('inventory')}
          className="bg-white p-5 rounded-2xl border border-slate-200 shadow-2xs hover:shadow-md transition-all cursor-pointer group"
        >
          <div className="flex items-center justify-between">
            <div>
              <span className="text-xs font-bold uppercase tracking-wider text-slate-500">Inventory Items</span>
              <h3 className="text-2xl font-black text-cyan-600 my-1">{totalInventory}</h3>
              <span className="text-xs font-semibold text-cyan-700 bg-cyan-50 px-2 py-0.5 rounded-full border border-cyan-200">
                Campus Assets
              </span>
            </div>
            <div className="w-12 h-12 rounded-xl bg-cyan-50 text-cyan-600 flex items-center justify-center group-hover:scale-110 transition-transform">
              <Package className="w-6 h-6" />
            </div>
          </div>
        </div>
      </div>

      {/* Attendance & Finance Insights */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Student Attendance Summary */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-2xs">
          <div className="flex items-center justify-between mb-3">
            <span className="font-bold text-slate-800 text-sm">Today's Student Attendance</span>
            <span className="text-xs text-slate-500 bg-slate-100 px-2 py-0.5 rounded-md font-medium">Today</span>
          </div>

          <div className="flex items-baseline gap-2 mb-2">
            <span className="text-3xl font-extrabold text-emerald-600">{studPresent}</span>
            <span className="text-xs text-slate-500 font-medium">/ {totalStudents} Enrolled</span>
          </div>

          <div className="w-full bg-slate-100 rounded-full h-2.5 mb-3 overflow-hidden">
            <div className="bg-emerald-500 h-2.5 rounded-full transition-all" style={{ width: `${studRate}%` }} />
          </div>

          <div className="flex items-center justify-between text-xs text-slate-600 border-t border-slate-100 pt-2">
            <span>Absent: <strong className="text-rose-600">{attendanceToday?.student?.absent || 0}</strong></span>
            <span>Leave: <strong className="text-amber-600">{attendanceToday?.student?.leave || 0}</strong></span>
            <span>Rate: <strong className="text-emerald-700">{studRate}%</strong></span>
          </div>
        </div>

        {/* Teacher Attendance Summary */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-2xs">
          <div className="flex items-center justify-between mb-3">
            <span className="font-bold text-slate-800 text-sm">Faculty Attendance</span>
            <span className="text-xs text-slate-500 bg-slate-100 px-2 py-0.5 rounded-md font-medium">Today</span>
          </div>

          <div className="flex items-baseline gap-2 mb-2">
            <span className="text-3xl font-extrabold text-blue-600">{teachPresent}</span>
            <span className="text-xs text-slate-500 font-medium">/ {totalTeachers} Teachers</span>
          </div>

          <div className="w-full bg-slate-100 rounded-full h-2.5 mb-3 overflow-hidden">
            <div className="bg-blue-600 h-2.5 rounded-full transition-all" style={{ width: `${teachRate}%` }} />
          </div>

          <div className="flex items-center justify-between text-xs text-slate-600 border-t border-slate-100 pt-2">
            <span>Present Faculty: <strong>{teachPresent}</strong></span>
            <span>Rate: <strong className="text-blue-700">{teachRate}%</strong></span>
          </div>
        </div>

        {/* Financial Accounting */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-2xs">
          <span className="font-bold text-slate-800 text-sm block mb-3">Tuition Fee Accounts</span>
          
          <div className="grid grid-cols-2 gap-2 mb-3">
            <div className="p-2.5 bg-emerald-50 rounded-xl border border-emerald-100">
              <span className="text-[11px] font-semibold text-emerald-800 block">Total Received</span>
              <span className="text-base font-bold text-emerald-700">{formatCurrency(totalFeesCollected)}</span>
            </div>
            <div className="p-2.5 bg-rose-50 rounded-xl border border-rose-100">
              <span className="text-[11px] font-semibold text-rose-800 block">Pending Dues</span>
              <span className="text-base font-bold text-rose-700">{formatCurrency(totalPendingFees)}</span>
            </div>
          </div>

          <button
            onClick={() => onNavigate('fees', { tab: 'collect' })}
            className="w-full py-2 px-3 rounded-lg text-xs font-bold text-emerald-700 bg-emerald-100 hover:bg-emerald-200 flex items-center justify-center gap-1.5 transition-colors"
          >
            <Wallet className="w-3.5 h-3.5" />
            <span>Receive Payment & Slip</span>
          </button>
        </div>
      </div>

      {/* Recent Activity Audit Table */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-2xs overflow-hidden">
        <div className="p-4 border-b border-slate-100 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Clock className="w-4 h-4 text-blue-600" />
            <h4 className="font-bold text-slate-800 text-sm">System Audit & Activity Logs</h4>
          </div>
          <span className="text-[11px] font-medium text-slate-500 bg-slate-100 px-2.5 py-1 rounded-full">
            Real-time MySQL Activity
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 text-slate-500 uppercase font-semibold border-b border-slate-100">
              <tr>
                <th className="px-4 py-3">Action</th>
                <th className="px-4 py-3">Module</th>
                <th className="px-4 py-3">Details</th>
                <th className="px-4 py-3">IP Address</th>
                <th className="px-4 py-3 text-right">Timestamp</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {recentActivities?.length === 0 ? (
                <tr>
                  <td colSpan={5} className="text-center py-6 text-slate-400">
                    No recent activities logged yet.
                  </td>
                </tr>
              ) : (
                recentActivities.map((log: ActivityLog) => (
                  <tr key={log.id} className="hover:bg-slate-50/60 transition-colors">
                    <td className="px-4 py-3 font-semibold text-slate-800 flex items-center gap-1.5">
                      <FileCheck className="w-3.5 h-3.5 text-blue-600" />
                      {log.action}
                    </td>
                    <td className="px-4 py-3">
                      <span className="px-2 py-0.5 rounded-md bg-slate-100 font-medium text-slate-700 text-[11px]">
                        {log.record_type}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-slate-600 max-w-xs truncate">{log.details}</td>
                    <td className="px-4 py-3 font-mono text-slate-500 text-[11px]">{log.ip_address}</td>
                    <td className="px-4 py-3 text-right text-slate-400 font-mono text-[11px]">
                      {new Date(log.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

    </div>
  );
};
