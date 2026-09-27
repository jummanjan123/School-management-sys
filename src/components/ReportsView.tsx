import React, { useState, useEffect } from 'react';
import { apiRequest, formatCurrency } from '../api';
import { School, Student, InventoryItem } from '../types';
import { BarChart3, Printer, Users, Wallet, Package, ArrowRight } from 'lucide-react';

interface ReportsViewProps {
  school: School;
  onNavigate: (tab: string, extra?: any) => void;
}

export const ReportsView: React.FC<ReportsViewProps> = ({ school, onNavigate }) => {
  const [students, setStudents] = useState<Student[]>([]);
  const [inventory, setInventory] = useState<InventoryItem[]>([]);
  const [activeReport, setActiveReport] = useState<'class_distribution' | 'financial_summary' | 'asset_audit'>('class_distribution');

  useEffect(() => {
    apiRequest<Student[]>('/api/students').then(setStudents);
    apiRequest<InventoryItem[]>('/api/inventory').then(setInventory);
  }, []);

  // Class distribution calculation
  const classMap: Record<string, { count: number; revenue: number }> = {};
  students.forEach(s => {
    if (!classMap[s.class_name]) {
      classMap[s.class_name] = { count: 0, revenue: 0 };
    }
    classMap[s.class_name].count += 1;
    classMap[s.class_name].revenue += Number(s.monthly_fee) || 0;
  });

  // Inventory category calculation
  const catMap: Record<string, { count: number; units: number; val: number }> = {};
  inventory.forEach(i => {
    if (!catMap[i.item_category]) {
      catMap[i.item_category] = { count: 0, units: 0, val: 0 };
    }
    catMap[i.item_category].count += 1;
    catMap[i.item_category].units += Number(i.quantity) || 0;
    catMap[i.item_category].val += Number(i.total_value) || 0;
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
        <div>
          <h2 className="text-xl font-bold text-slate-900 tracking-tight">Institutional Analytical Reports</h2>
          <p className="text-xs text-slate-500">Comprehensive statistical summaries for executive decision making.</p>
        </div>
        <button
          onClick={() => window.print()}
          className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs shadow-md flex items-center gap-1.5 print:hidden"
        >
          <Printer className="w-4 h-4" />
          <span>Print Official Report</span>
        </button>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-2 border-b border-slate-200 pb-2 print:hidden">
        <button
          onClick={() => setActiveReport('class_distribution')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
            activeReport === 'class_distribution' ? 'bg-blue-600 text-white shadow-xs' : 'text-slate-600 hover:bg-slate-100'
          }`}
        >
          Class Distribution & Revenue
        </button>
        <button
          onClick={() => setActiveReport('financial_summary')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
            activeReport === 'financial_summary' ? 'bg-emerald-600 text-white shadow-xs' : 'text-slate-600 hover:bg-slate-100'
          }`}
        >
          Fee Accounts Overview
        </button>
        <button
          onClick={() => setActiveReport('asset_audit')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
            activeReport === 'asset_audit' ? 'bg-cyan-600 text-white shadow-xs' : 'text-slate-600 hover:bg-slate-100'
          }`}
        >
          Inventory Asset Audit
        </button>
      </div>

      {/* 1. Class Distribution */}
      {activeReport === 'class_distribution' && (
        <div className="bg-white rounded-2xl border border-slate-200 shadow-2xs overflow-hidden">
          <div className="p-4 border-b border-slate-100 flex items-center justify-between">
            <h3 className="font-bold text-slate-800 text-sm">Class-wise Enrollment & Expected Monthly Fee</h3>
            <span className="text-xs text-slate-500">{students.length} Total Enrolled</span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 text-slate-500 uppercase font-semibold border-b border-slate-100">
                <tr>
                  <th className="px-4 py-3">Class Name</th>
                  <th className="px-4 py-3 text-center">Enrolled Students</th>
                  <th className="px-4 py-3 text-right">Expected Revenue</th>
                  <th className="px-4 py-3 text-right print:hidden">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {Object.keys(classMap).length === 0 ? (
                  <tr><td colSpan={4} className="text-center py-6 text-slate-400">No student enrollment recorded yet.</td></tr>
                ) : (
                  Object.entries(classMap).map(([cName, data]) => (
                    <tr key={cName} className="hover:bg-slate-50/60">
                      <td className="px-4 py-3 font-bold text-slate-900">{cName}</td>
                      <td className="px-4 py-3 text-center">
                        <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-blue-50 text-blue-700 border border-blue-200">
                          {data.count} Students
                        </span>
                      </td>
                      <td className="px-4 py-3 text-right font-bold text-emerald-700">{formatCurrency(data.revenue)}</td>
                      <td className="px-4 py-3 text-right print:hidden">
                        <button
                          onClick={() => onNavigate('students')}
                          className="text-blue-600 hover:text-blue-800 font-semibold inline-flex items-center gap-1 text-[11px]"
                        >
                          <span>Roster</span>
                          <ArrowRight className="w-3 h-3" />
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* 2. Financial Summary */}
      {activeReport === 'financial_summary' && (
        <div className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="bg-emerald-50 border border-emerald-200 p-6 rounded-2xl text-center">
              <span className="text-xs font-bold text-emerald-800 uppercase tracking-wider">Tuition Fees Collected</span>
              <h3 className="text-3xl font-black text-emerald-700 my-2">{formatCurrency(4500)}</h3>
              <p className="text-xs text-emerald-600">Recorded receipts in system</p>
            </div>

            <div className="bg-rose-50 border border-rose-200 p-6 rounded-2xl text-center">
              <span className="text-xs font-bold text-rose-800 uppercase tracking-wider">Outstanding Dues</span>
              <h3 className="text-3xl font-black text-rose-700 my-2">{formatCurrency(3500)}</h3>
              <p className="text-xs text-rose-600">Uncollected arrears</p>
            </div>
          </div>

          <div className="p-4 bg-white rounded-2xl border border-slate-200 shadow-2xs flex items-center justify-between">
            <div>
              <h4 className="font-bold text-slate-800 text-sm">Need to review pending fees?</h4>
              <p className="text-xs text-slate-500">Generate fee reminders and collect cash payments at the counter.</p>
            </div>
            <button
              onClick={() => onNavigate('fees', { tab: 'collect' })}
              className="px-4 py-2 rounded-xl bg-emerald-600 text-white font-bold text-xs hover:bg-emerald-700"
            >
              Collect Fee &rarr;
            </button>
          </div>
        </div>
      )}

      {/* 3. Asset Audit */}
      {activeReport === 'asset_audit' && (
        <div className="bg-white rounded-2xl border border-slate-200 shadow-2xs overflow-hidden">
          <div className="p-4 border-b border-slate-100 flex items-center justify-between">
            <h3 className="font-bold text-slate-800 text-sm">Category-wise Asset Valuation & Audit</h3>
            <span className="text-xs text-slate-500">{inventory.length} Asset Records</span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 text-slate-500 uppercase font-semibold border-b border-slate-100">
                <tr>
                  <th className="px-4 py-3">Category</th>
                  <th className="px-4 py-3 text-center">Unique Items</th>
                  <th className="px-4 py-3 text-center">Physical Units</th>
                  <th className="px-4 py-3 text-right">Total Valuation</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {Object.entries(catMap).map(([cat, data]) => (
                  <tr key={cat} className="hover:bg-slate-50/60">
                    <td className="px-4 py-3 font-bold text-slate-900">{cat}</td>
                    <td className="px-4 py-3 text-center">{data.count} types</td>
                    <td className="px-4 py-3 text-center font-semibold">{data.units} units</td>
                    <td className="px-4 py-3 text-right font-bold text-cyan-700">{formatCurrency(data.val)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};
