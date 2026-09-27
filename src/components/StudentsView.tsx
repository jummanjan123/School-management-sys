import React, { useState, useEffect } from 'react';
import { apiRequest, formatCurrency, formatDate } from '../api';
import { Student } from '../types';
import {
  GraduationCap,
  Search,
  Filter,
  Eye,
  CreditCard,
  Award,
  FileText,
  Wallet,
  Trash2,
  PlusCircle,
  Phone,
  Printer,
  X
} from 'lucide-react';

interface StudentsViewProps {
  onNavigate: (tab: string, extra?: any) => void;
}

export const StudentsView: React.FC<StudentsViewProps> = ({ onNavigate }) => {
  const [students, setStudents] = useState<Student[]>([]);
  const [classes, setClasses] = useState<string[]>([]);
  const [search, setSearch] = useState('');
  const [selectedClass, setSelectedClass] = useState('');
  const [selectedStatus, setSelectedStatus] = useState('');
  const [loading, setLoading] = useState(true);
  const [selectedStudent, setSelectedStudent] = useState<Student | null>(null);

  const fetchStudents = async () => {
    try {
      setLoading(true);
      const res = await apiRequest<Student[]>('/api/students');
      setStudents(res);
      const uniqueClasses = Array.from(new Set(res.map(s => s.class_name))).filter(Boolean);
      setClasses(uniqueClasses);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStudents();
  }, []);

  const handleDelete = async (id: number, name: string) => {
    if (confirm(`Are you sure you want to permanently delete student '${name}'? All fee and attendance logs will be removed.`)) {
      try {
        await apiRequest(`/api/students/${id}`, { method: 'DELETE' });
        setStudents(prev => prev.filter(s => s.id !== id));
      } catch (err: any) {
        alert(err.message || 'Error deleting student');
      }
    }
  };

  const filteredStudents = students.filter(s => {
    const q = search.toLowerCase();
    const matchSearch =
      s.student_name.toLowerCase().includes(q) ||
      s.father_name.toLowerCase().includes(q) ||
      s.roll_number.toLowerCase().includes(q) ||
      s.admission_number.toLowerCase().includes(q) ||
      s.father_mobile.includes(q);

    const matchClass = selectedClass ? s.class_name === selectedClass : true;
    const matchStatus = selectedStatus ? s.status === selectedStatus : true;

    return matchSearch && matchClass && matchStatus;
  });

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
        <div>
          <h2 className="text-xl font-bold text-slate-900 tracking-tight">Student Information Directory</h2>
          <p className="text-xs text-slate-500">
            Admissions roster, student PVC cards, certificates, and academic tracking.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => onNavigate('universal_add', { type: 'student' })}
            className="px-3.5 py-2 rounded-xl bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold text-xs shadow-xs flex items-center gap-1.5 transition-colors"
          >
            <PlusCircle className="w-4 h-4" />
            <span>+ New Admission</span>
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
      <div className="bg-white p-3.5 rounded-2xl border border-slate-200 shadow-2xs flex flex-col md:flex-row items-center gap-2.5 print:hidden">
        <div className="relative flex-1 w-full">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="Search by student name, father name, roll number, admission number..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="w-full pl-9 pr-3 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:outline-hidden focus:bg-white focus:border-amber-400"
          />
        </div>

        <div className="flex items-center gap-2 w-full md:w-auto">
          <select
            value={selectedClass}
            onChange={e => setSelectedClass(e.target.value)}
            className="text-xs px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-slate-700 focus:outline-hidden"
          >
            <option value="">All Classes</option>
            {classes.map(c => (
              <option key={c} value={c}>{c}</option>
            ))}
          </select>

          <select
            value={selectedStatus}
            onChange={e => setSelectedStatus(e.target.value)}
            className="text-xs px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-slate-700 focus:outline-hidden"
          >
            <option value="">All Statuses</option>
            <option value="Active">Active</option>
            <option value="Inactive">Inactive</option>
            <option value="Left">Left</option>
          </select>
        </div>
      </div>

      {/* Students Table */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-2xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 text-slate-500 uppercase font-semibold border-b border-slate-100">
              <tr>
                <th className="px-4 py-3">Adm # / Roll</th>
                <th className="px-4 py-3">Student Details</th>
                <th className="px-4 py-3">Class & Section</th>
                <th className="px-4 py-3">Father & Contact</th>
                <th className="px-4 py-3">Monthly Fee</th>
                <th className="px-4 py-3">Status</th>
                <th className="px-4 py-3 text-right print:hidden">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {loading ? (
                <tr>
                  <td colSpan={7} className="text-center py-8 text-slate-400">Loading students...</td>
                </tr>
              ) : filteredStudents.length === 0 ? (
                <tr>
                  <td colSpan={7} className="text-center py-10 text-slate-400">
                    <GraduationCap className="w-8 h-8 mx-auto mb-2 text-slate-300" />
                    No students match the criteria.
                  </td>
                </tr>
              ) : (
                filteredStudents.map(s => (
                  <tr key={s.id} className="hover:bg-slate-50/60 transition-colors">
                    <td className="px-4 py-3">
                      <div className="font-mono font-bold text-slate-800">{s.admission_number}</div>
                      <span className="text-[10px] text-slate-500 bg-slate-100 px-1.5 py-0.5 rounded-sm">
                        Roll: {s.roll_number}
                      </span>
                    </td>

                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2.5">
                        {s.photo_path ? (
                          <img
                            src={s.photo_path}
                            alt={s.student_name}
                            className="w-9 h-9 rounded-full object-cover border border-amber-300"
                          />
                        ) : (
                          <div className="w-9 h-9 rounded-full bg-amber-100 text-amber-700 font-bold flex items-center justify-center text-xs">
                            {s.student_name[0]}
                          </div>
                        )}
                        <div>
                          <div className="font-bold text-slate-800 hover:text-blue-600 cursor-pointer" onClick={() => setSelectedStudent(s)}>
                            {s.student_name}
                          </div>
                          <div className="text-[11px] text-slate-400">{s.gender} • Adm: {formatDate(s.admission_date)}</div>
                        </div>
                      </div>
                    </td>

                    <td className="px-4 py-3">
                      <span className="font-semibold text-blue-700 bg-blue-50 px-2 py-0.5 rounded-md border border-blue-200">
                        {s.class_name} ({s.section})
                      </span>
                    </td>

                    <td className="px-4 py-3">
                      <div className="font-semibold text-slate-800">{s.father_name}</div>
                      <div className="text-slate-500 font-mono text-[11px] flex items-center gap-1">
                        <Phone className="w-3 h-3 text-slate-400" />
                        {s.father_mobile}
                      </div>
                    </td>

                    <td className="px-4 py-3 font-semibold text-emerald-700">
                      {formatCurrency(s.monthly_fee)}
                    </td>

                    <td className="px-4 py-3">
                      <span
                        className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                          s.status === 'Active'
                            ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                            : 'bg-slate-100 text-slate-600'
                        }`}
                      >
                        {s.status}
                      </span>
                    </td>

                    <td className="px-4 py-3 text-right print:hidden">
                      <div className="flex items-center justify-end gap-1">
                        <button
                          onClick={() => setSelectedStudent(s)}
                          title="View Profile"
                          className="p-1 text-slate-600 hover:text-blue-600 hover:bg-slate-100 rounded-md"
                        >
                          <Eye className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => onNavigate('id_cards', { type: 'student', id: s.id })}
                          title="PVC Yellow Card"
                          className="p-1 text-amber-600 hover:text-amber-700 hover:bg-amber-50 rounded-md"
                        >
                          <CreditCard className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => onNavigate('fees', { tab: 'collect', studentId: s.id })}
                          title="Collect Fee"
                          className="p-1 text-emerald-600 hover:text-emerald-700 hover:bg-emerald-50 rounded-md"
                        >
                          <Wallet className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => onNavigate('character_cert', { studentId: s.id })}
                          title="Character Certificate"
                          className="p-1 text-sky-600 hover:text-sky-700 hover:bg-sky-50 rounded-md"
                        >
                          <Award className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => onNavigate('leaving_cert', { studentId: s.id })}
                          title="School Leaving Certificate"
                          className="p-1 text-rose-600 hover:text-rose-700 hover:bg-rose-50 rounded-md"
                        >
                          <FileText className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => handleDelete(s.id, s.student_name)}
                          title="Delete Student"
                          className="p-1 text-rose-600 hover:text-rose-700 hover:bg-rose-50 rounded-md"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
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

      {/* Student Details Modal */}
      {selectedStudent && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 shadow-2xl relative">
            <button
              onClick={() => setSelectedStudent(null)}
              className="absolute top-4 right-4 text-slate-400 hover:text-slate-600 p-1 rounded-full hover:bg-slate-100"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="text-center mb-4">
              <div className="w-20 h-20 rounded-full mx-auto mb-2 overflow-hidden border-3 border-amber-400 shadow-md">
                {selectedStudent.photo_path ? (
                  <img src={selectedStudent.photo_path} className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full bg-amber-100 text-amber-800 font-bold text-2xl flex items-center justify-center">
                    {selectedStudent.student_name[0]}
                  </div>
                )}
              </div>
              <h3 className="text-lg font-bold text-slate-900">{selectedStudent.student_name}</h3>
              <p className="text-xs font-semibold text-amber-700">{selectedStudent.class_name} • Roll #{selectedStudent.roll_number}</p>
            </div>

            <div className="bg-slate-50 rounded-xl p-4 space-y-2 text-xs border border-slate-100">
              <div className="flex justify-between py-1 border-b border-slate-200/60">
                <span className="text-slate-500">Admission No:</span>
                <span className="font-mono font-bold text-slate-800">{selectedStudent.admission_number}</span>
              </div>
              <div className="flex justify-between py-1 border-b border-slate-200/60">
                <span className="text-slate-500">Father's Name:</span>
                <span className="font-semibold text-slate-800">{selectedStudent.father_name}</span>
              </div>
              <div className="flex justify-between py-1 border-b border-slate-200/60">
                <span className="text-slate-500">Father Mobile:</span>
                <span className="font-mono font-semibold text-slate-800">{selectedStudent.father_mobile}</span>
              </div>
              <div className="flex justify-between py-1 border-b border-slate-200/60">
                <span className="text-slate-500">Gender & DOB:</span>
                <span>{selectedStudent.gender} • {formatDate(selectedStudent.date_of_birth)}</span>
              </div>
              <div className="flex justify-between py-1 border-b border-slate-200/60">
                <span className="text-slate-500">Monthly Tuition Fee:</span>
                <span className="font-bold text-emerald-700">{formatCurrency(selectedStudent.monthly_fee)}</span>
              </div>
              <div className="flex justify-between py-1">
                <span className="text-slate-500">Address:</span>
                <span className="text-right text-slate-700 max-w-[200px] truncate">{selectedStudent.address || '-'}</span>
              </div>
            </div>

            <div className="mt-5 grid grid-cols-2 gap-2">
              <button
                onClick={() => {
                  setSelectedStudent(null);
                  onNavigate('id_cards', { type: 'student', id: selectedStudent.id });
                }}
                className="py-2 px-3 rounded-xl bg-amber-500 text-slate-950 font-bold text-xs hover:bg-amber-600 text-center flex items-center justify-center gap-1.5"
              >
                <CreditCard className="w-3.5 h-3.5" />
                <span>Print PVC Card</span>
              </button>
              <button
                onClick={() => {
                  setSelectedStudent(null);
                  onNavigate('character_cert', { studentId: selectedStudent.id });
                }}
                className="py-2 px-3 rounded-xl bg-sky-600 text-white font-bold text-xs hover:bg-sky-700 text-center flex items-center justify-center gap-1.5"
              >
                <Award className="w-3.5 h-3.5" />
                <span>Character Cert</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
