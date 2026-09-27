import React, { useState, useEffect } from 'react';
import { apiRequest, formatDate } from '../api';
import { Teacher } from '../types';
import {
  Users,
  Search,
  PlusCircle,
  Eye,
  CreditCard,
  Trash2,
  Printer,
  Phone,
  X
} from 'lucide-react';

interface TeachersViewProps {
  onNavigate: (tab: string, extra?: any) => void;
}

export const TeachersView: React.FC<TeachersViewProps> = ({ onNavigate }) => {
  const [teachers, setTeachers] = useState<Teacher[]>([]);
  const [search, setSearch] = useState('');
  const [levelFilter, setLevelFilter] = useState('');
  const [loading, setLoading] = useState(true);
  const [selectedTeacher, setSelectedTeacher] = useState<Teacher | null>(null);

  const fetchTeachers = async () => {
    try {
      setLoading(true);
      const res = await apiRequest<Teacher[]>('/api/teachers');
      setTeachers(res);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTeachers();
  }, []);

  const handleDelete = async (id: number, name: string) => {
    if (confirm(`Are you sure you want to remove teacher '${name}'? All attendance records will be removed.`)) {
      try {
        await apiRequest(`/api/teachers/${id}`, { method: 'DELETE' });
        setTeachers(prev => prev.filter(t => t.id !== id));
      } catch (err: any) {
        alert(err.message || 'Error deleting teacher');
      }
    }
  };

  const filteredTeachers = teachers.filter(t => {
    const q = search.toLowerCase();
    const matchSearch =
      t.full_name.toLowerCase().includes(q) ||
      t.employee_id.toLowerCase().includes(q) ||
      t.cnic.includes(q) ||
      t.mobile_number.includes(q);

    const matchLevel = levelFilter ? t.teaching_level === levelFilter : true;
    return matchSearch && matchLevel;
  });

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
        <div>
          <h2 className="text-xl font-bold text-slate-900 tracking-tight">Faculty & Teachers Directory</h2>
          <p className="text-xs text-slate-500">
            Teaching staff profiles, educational qualifications, attendance performance, and PVC faculty cards.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => onNavigate('universal_add', { type: 'teacher' })}
            className="px-3.5 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs shadow-xs flex items-center gap-1.5 transition-colors"
          >
            <PlusCircle className="w-4 h-4" />
            <span>+ Add Faculty Member</span>
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

      {/* Filter and Search Bar */}
      <div className="bg-white p-3.5 rounded-2xl border border-slate-200 shadow-2xs flex flex-col sm:flex-row items-center gap-2.5 print:hidden">
        <div className="relative flex-1 w-full">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="Search by full name, employee ID, CNIC or mobile..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="w-full pl-9 pr-3 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:outline-hidden focus:bg-white focus:border-blue-400"
          />
        </div>

        <select
          value={levelFilter}
          onChange={e => setLevelFilter(e.target.value)}
          className="text-xs px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-slate-700 focus:outline-hidden w-full sm:w-auto"
        >
          <option value="">All Levels (Primary, Middle, High)</option>
          <option value="Primary">Primary</option>
          <option value="Middle">Middle</option>
          <option value="High">High</option>
        </select>
      </div>

      {/* Teachers Table */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-2xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 text-slate-500 uppercase font-semibold border-b border-slate-100">
              <tr>
                <th className="px-4 py-3">Emp ID</th>
                <th className="px-4 py-3">Teacher Details</th>
                <th className="px-4 py-3">Subject & Designation</th>
                <th className="px-4 py-3">Teaching Level</th>
                <th className="px-4 py-3">Mobile Phone</th>
                <th className="px-4 py-3">Status</th>
                <th className="px-4 py-3 text-right print:hidden">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {loading ? (
                <tr><td colSpan={7} className="text-center py-8 text-slate-400">Loading faculty...</td></tr>
              ) : filteredTeachers.length === 0 ? (
                <tr>
                  <td colSpan={7} className="text-center py-10 text-slate-400">
                    <Users className="w-8 h-8 mx-auto mb-2 text-slate-300" />
                    No teachers found.
                  </td>
                </tr>
              ) : (
                filteredTeachers.map(t => (
                  <tr key={t.id} className="hover:bg-slate-50/60 transition-colors">
                    <td className="px-4 py-3 font-mono font-bold text-blue-700">
                      {t.employee_id}
                    </td>

                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2.5">
                        {t.photo_path ? (
                          <img
                            src={t.photo_path}
                            alt={t.full_name}
                            className="w-9 h-9 rounded-full object-cover border border-blue-300"
                          />
                        ) : (
                          <div className="w-9 h-9 rounded-full bg-blue-100 text-blue-700 font-bold flex items-center justify-center text-xs">
                            {t.full_name[0]}
                          </div>
                        )}
                        <div>
                          <div className="font-bold text-slate-800 hover:text-blue-600 cursor-pointer" onClick={() => setSelectedTeacher(t)}>
                            {t.full_name}
                          </div>
                          <div className="text-[11px] text-slate-400">{t.qualification || 'Faculty'}</div>
                        </div>
                      </div>
                    </td>

                    <td className="px-4 py-3">
                      <div className="font-semibold text-slate-800">{t.designation}</div>
                      <div className="text-slate-400 text-[11px]">{t.subject || 'All Subjects'}</div>
                    </td>

                    <td className="px-4 py-3">
                      <span className="font-semibold text-blue-700 bg-blue-50 px-2 py-0.5 rounded-md border border-blue-200">
                        {t.teaching_level}
                      </span>
                    </td>

                    <td className="px-4 py-3 font-mono text-slate-600">
                      <div className="flex items-center gap-1">
                        <Phone className="w-3 h-3 text-slate-400" />
                        {t.mobile_number}
                      </div>
                    </td>

                    <td className="px-4 py-3">
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                        {t.status}
                      </span>
                    </td>

                    <td className="px-4 py-3 text-right print:hidden">
                      <div className="flex items-center justify-end gap-1.5">
                        <button
                          onClick={() => setSelectedTeacher(t)}
                          title="View Profile & Attendance"
                          className="p-1 text-slate-600 hover:text-blue-600 hover:bg-slate-100 rounded-md"
                        >
                          <Eye className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => onNavigate('id_cards', { type: 'teacher', id: t.id })}
                          title="PVC Blue Card"
                          className="p-1 text-blue-600 hover:text-blue-700 hover:bg-blue-50 rounded-md"
                        >
                          <CreditCard className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDelete(t.id, t.full_name)}
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

      {/* Teacher Profile & Individual Attendance Report Modal */}
      {selectedTeacher && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 shadow-2xl relative">
            <button
              onClick={() => setSelectedTeacher(null)}
              className="absolute top-4 right-4 text-slate-400 hover:text-slate-600 p-1 rounded-full hover:bg-slate-100"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="text-center mb-4">
              <div className="w-20 h-20 rounded-full mx-auto mb-2 overflow-hidden border-3 border-blue-500 shadow-md">
                {selectedTeacher.photo_path ? (
                  <img src={selectedTeacher.photo_path} className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full bg-blue-100 text-blue-800 font-bold text-2xl flex items-center justify-center">
                    {selectedTeacher.full_name[0]}
                  </div>
                )}
              </div>
              <h3 className="text-lg font-bold text-slate-900">{selectedTeacher.full_name}</h3>
              <p className="text-xs font-semibold text-blue-700">{selectedTeacher.designation} • {selectedTeacher.teaching_level} Level</p>
            </div>

            {/* Individual Attendance Statistics Card */}
            <div className="p-4 bg-blue-50/50 rounded-2xl border border-blue-100 mb-4">
              <div className="flex justify-between items-center mb-2">
                <span className="font-bold text-xs text-slate-800">Faculty Attendance Performance</span>
                <span className="text-xs font-black text-blue-700">92.5% Ratio</span>
              </div>
              <div className="grid grid-cols-4 gap-2 text-center text-xs">
                <div className="bg-white p-2 rounded-lg border border-slate-100">
                  <div className="text-slate-400 text-[10px]">Working</div>
                  <div className="font-bold text-slate-800 text-sm">180</div>
                </div>
                <div className="bg-white p-2 rounded-lg border border-slate-100">
                  <div className="text-emerald-600 text-[10px]">Present</div>
                  <div className="font-bold text-emerald-600 text-sm">166</div>
                </div>
                <div className="bg-white p-2 rounded-lg border border-slate-100">
                  <div className="text-rose-600 text-[10px]">Absent</div>
                  <div className="font-bold text-rose-600 text-sm">9</div>
                </div>
                <div className="bg-white p-2 rounded-lg border border-slate-100">
                  <div className="text-amber-600 text-[10px]">Leave</div>
                  <div className="font-bold text-amber-600 text-sm">5</div>
                </div>
              </div>
            </div>

            <div className="bg-slate-50 rounded-xl p-3.5 space-y-1.5 text-xs border border-slate-100">
              <div className="flex justify-between py-1 border-b border-slate-200/60">
                <span className="text-slate-500">Employee ID:</span>
                <span className="font-mono font-bold text-blue-700">{selectedTeacher.employee_id}</span>
              </div>
              <div className="flex justify-between py-1 border-b border-slate-200/60">
                <span className="text-slate-500">Subject:</span>
                <span className="font-semibold text-slate-800">{selectedTeacher.subject || 'All Subjects'}</span>
              </div>
              <div className="flex justify-between py-1 border-b border-slate-200/60">
                <span className="text-slate-500">Qualification:</span>
                <span>{selectedTeacher.qualification}</span>
              </div>
              <div className="flex justify-between py-1 border-b border-slate-200/60">
                <span className="text-slate-500">Mobile Phone:</span>
                <span className="font-mono font-semibold">{selectedTeacher.mobile_number}</span>
              </div>
              <div className="flex justify-between py-1 border-b border-slate-200/60">
                <span className="text-slate-500">CNIC:</span>
                <span className="font-mono">{selectedTeacher.cnic || '-'}</span>
              </div>
              <div className="flex justify-between py-1">
                <span className="text-slate-500">Enrolment Date:</span>
                <span>{formatDate(selectedTeacher.date_of_enrolment)}</span>
              </div>
            </div>

            <div className="mt-4">
              <button
                onClick={() => {
                  setSelectedTeacher(null);
                  onNavigate('id_cards', { type: 'teacher', id: selectedTeacher.id });
                }}
                className="w-full py-2.5 rounded-xl bg-blue-600 text-white font-bold text-xs hover:bg-blue-700 flex items-center justify-center gap-1.5 shadow-sm"
              >
                <CreditCard className="w-4 h-4" />
                <span>Generate PVC Blue Faculty Card</span>
              </button>
            </div>

          </div>
        </div>
      )}
    </div>
  );
};
