import React, { useState, useEffect } from 'react';
import { apiRequest, formatCurrency } from '../api';
import { Staff } from '../types';
import {
  UserCheck,
  Search,
  PlusCircle,
  CreditCard,
  Trash2,
  Printer,
  Phone
} from 'lucide-react';

interface StaffViewProps {
  onNavigate: (tab: string, extra?: any) => void;
}

export const StaffView: React.FC<StaffViewProps> = ({ onNavigate }) => {
  const [staff, setStaff] = useState<Staff[]>([]);
  const [search, setSearch] = useState('');
  const [desigFilter, setDesigFilter] = useState('');
  const [loading, setLoading] = useState(true);

  const fetchStaff = async () => {
    try {
      setLoading(true);
      const res = await apiRequest<Staff[]>('/api/staff');
      setStaff(res);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStaff();
  }, []);

  const handleDelete = async (id: number, name: string) => {
    if (confirm(`Remove staff member '${name}'?`)) {
      try {
        await apiRequest(`/api/staff/${id}`, { method: 'DELETE' });
        setStaff(prev => prev.filter(s => s.id !== id));
      } catch (err: any) {
        alert(err.message || 'Error deleting staff');
      }
    }
  };

  const filtered = staff.filter(s => {
    const q = search.toLowerCase();
    const matchSearch =
      s.full_name.toLowerCase().includes(q) ||
      s.staff_code.toLowerCase().includes(q) ||
      (s.cnic && s.cnic.includes(q)) ||
      s.mobile.includes(q);

    const matchDesig = desigFilter ? s.designation === desigFilter : true;
    return matchSearch && matchDesig;
  });

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
        <div>
          <h2 className="text-xl font-bold text-slate-900 tracking-tight">Support Staff Directory</h2>
          <p className="text-xs text-slate-500">
            Non-teaching staff: administration, security guards, clerical, and facilities maintenance.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => onNavigate('universal_add', { type: 'staff' })}
            className="px-3.5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shadow-xs flex items-center gap-1.5 transition-colors"
          >
            <PlusCircle className="w-4 h-4" />
            <span>+ Add Staff Member</span>
          </button>
          <button
            onClick={() => window.print()}
            className="px-3 py-2 rounded-xl border border-slate-200 hover:bg-slate-50 text-slate-700 text-xs font-semibold flex items-center gap-1.5 transition-colors"
          >
            <Printer className="w-4 h-4" />
            <span>Print List</span>
          </button>
        </div>
      </div>

      {/* Filter bar */}
      <div className="bg-white p-3.5 rounded-2xl border border-slate-200 shadow-2xs flex flex-col sm:flex-row items-center gap-2.5 print:hidden">
        <div className="relative flex-1 w-full">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="Search by staff name, staff code, designation or mobile..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="w-full pl-9 pr-3 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:outline-hidden focus:bg-white focus:border-emerald-400"
          />
        </div>

        <select
          value={desigFilter}
          onChange={e => setDesigFilter(e.target.value)}
          className="text-xs px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-slate-700 focus:outline-hidden w-full sm:w-auto"
        >
          <option value="">All Designations</option>
          <option value="Clerk">Clerk</option>
          <option value="Computer Operator">Computer Operator</option>
          <option value="Security Guard">Security Guard</option>
          <option value="Peon">Peon</option>
          <option value="Mali">Mali</option>
          <option value="PTI">PTI</option>
          <option value="Driver">Driver</option>
        </select>
      </div>

      {/* Table */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-2xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 text-slate-500 uppercase font-semibold border-b border-slate-100">
              <tr>
                <th className="px-4 py-3">Staff ID</th>
                <th className="px-4 py-3">Staff Name</th>
                <th className="px-4 py-3">Designation</th>
                <th className="px-4 py-3">Mobile Phone</th>
                <th className="px-4 py-3">Monthly Salary</th>
                <th className="px-4 py-3">Status</th>
                <th className="px-4 py-3 text-right print:hidden">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {loading ? (
                <tr><td colSpan={7} className="text-center py-8 text-slate-400">Loading staff...</td></tr>
              ) : filtered.length === 0 ? (
                <tr>
                  <td colSpan={7} className="text-center py-10 text-slate-400">
                    <UserCheck className="w-8 h-8 mx-auto mb-2 text-slate-300" />
                    No staff records found.
                  </td>
                </tr>
              ) : (
                filtered.map(s => (
                  <tr key={s.id} className="hover:bg-slate-50/60 transition-colors">
                    <td className="px-4 py-3 font-mono font-bold text-emerald-700">
                      {s.staff_code}
                    </td>

                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2.5">
                        {s.photo_path ? (
                          <img
                            src={s.photo_path}
                            alt={s.full_name}
                            className="w-9 h-9 rounded-full object-cover border border-emerald-300"
                          />
                        ) : (
                          <div className="w-9 h-9 rounded-full bg-emerald-100 text-emerald-700 font-bold flex items-center justify-center text-xs">
                            {s.full_name[0]}
                          </div>
                        )}
                        <div>
                          <div className="font-bold text-slate-800">{s.full_name}</div>
                          <div className="text-[11px] text-slate-400">Father: {s.father_name || '-'}</div>
                        </div>
                      </div>
                    </td>

                    <td className="px-4 py-3">
                      <span className="font-semibold text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded-md border border-emerald-200">
                        {s.designation}
                      </span>
                    </td>

                    <td className="px-4 py-3 font-mono text-slate-600">
                      <div className="flex items-center gap-1">
                        <Phone className="w-3 h-3 text-slate-400" />
                        {s.mobile}
                      </div>
                    </td>

                    <td className="px-4 py-3 font-bold text-slate-700">
                      {formatCurrency(s.salary)}
                    </td>

                    <td className="px-4 py-3">
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                        {s.status}
                      </span>
                    </td>

                    <td className="px-4 py-3 text-right print:hidden">
                      <div className="flex items-center justify-end gap-1.5">
                        <button
                          onClick={() => onNavigate('id_cards', { type: 'staff', id: s.id })}
                          title="PVC Green Card"
                          className="p-1 text-emerald-600 hover:text-emerald-700 hover:bg-emerald-50 rounded-md"
                        >
                          <CreditCard className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDelete(s.id, s.full_name)}
                          title="Delete"
                          className="p-1 text-rose-600 hover:text-rose-700 hover:bg-rose-50 rounded-md"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
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
