import React, { useState, useEffect } from 'react';
import { apiRequest, formatDate } from '../api';
import { Student, Teacher, Staff, SchoolClass } from '../types';
import {
  CalendarCheck,
  CheckCircle,
  CheckCircle2,
  XCircle,
  Clock,
  Printer,
  Save,
  CheckCheck
} from 'lucide-react';

export const AttendanceView: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'student' | 'teacher' | 'staff' | 'report'>('student');
  const [date, setDate] = useState<string>(new Date().toISOString().split('T')[0]);
  const [classes, setClasses] = useState<SchoolClass[]>([]);
  const [selectedClass, setSelectedClass] = useState<string>('');

  const [students, setStudents] = useState<Student[]>([]);
  const [teachers, setTeachers] = useState<Teacher[]>([]);
  const [staff, setStaff] = useState<Staff[]>([]);

  // status map: id => 'Present' | 'Absent' | 'Leave'
  const [attStatus, setAttStatus] = useState<Record<number, string>>({});
  const [loading, setLoading] = useState(false);
  const [saveMsg, setSaveMsg] = useState<string | null>(null);

  // Load initial classes
  useEffect(() => {
    apiRequest<SchoolClass[]>('/api/classes').then(res => {
      setClasses(res);
      if (res.length > 0) setSelectedClass(res[0].name);
    });
  }, []);

  // Fetch roster and existing attendance when tab/date/class changes
  useEffect(() => {
    setLoading(true);
    setSaveMsg(null);

    if (activeTab === 'student') {
      Promise.all([
        apiRequest<Student[]>('/api/students'),
        apiRequest<any[]>(`/api/attendance/student?date=${date}`)
      ]).then(([studList, markedList]) => {
        setStudents(studList);
        const map: Record<number, string> = {};
        studList.forEach(s => {
          const marked = markedList.find(m => m.student_id === s.id);
          map[s.id] = marked ? marked.status : 'Present';
        });
        setAttStatus(map);
        setLoading(false);
      });
    } else if (activeTab === 'teacher') {
      Promise.all([
        apiRequest<Teacher[]>('/api/teachers'),
        apiRequest<any[]>(`/api/attendance/teacher?date=${date}`)
      ]).then(([teachList, markedList]) => {
        setTeachers(teachList);
        const map: Record<number, string> = {};
        teachList.forEach(t => {
          const marked = markedList.find(m => m.teacher_id === t.id);
          map[t.id] = marked ? marked.status : 'Present';
        });
        setAttStatus(map);
        setLoading(false);
      });
    } else if (activeTab === 'staff') {
      Promise.all([
        apiRequest<Staff[]>('/api/staff'),
        apiRequest<any[]>(`/api/attendance/staff?date=${date}`)
      ]).then(([staffList, markedList]) => {
        setStaff(staffList);
        const map: Record<number, string> = {};
        staffList.forEach(st => {
          const marked = markedList.find(m => m.staff_id === st.id);
          map[st.id] = marked ? marked.status : 'Present';
        });
        setAttStatus(map);
        setLoading(false);
      });
    } else {
      setLoading(false);
    }
  }, [activeTab, date, selectedClass]);

  const markAll = (status: string) => {
    const updated = { ...attStatus };
    Object.keys(updated).forEach(id => {
      updated[Number(id)] = status;
    });
    setAttStatus(updated);
  };

  const handleSave = async () => {
    try {
      setLoading(true);
      await apiRequest(`/api/attendance/${activeTab}`, {
        method: 'POST',
        body: JSON.stringify({ date, records: attStatus })
      });
      setSaveMsg(`Attendance successfully saved for ${formatDate(date)}!`);
      setTimeout(() => setSaveMsg(null), 4000);
    } catch (err: any) {
      alert(err.message || 'Error saving attendance');
    } finally {
      setLoading(false);
    }
  };

  const activeStudents = students.filter(s => selectedClass ? s.class_name === selectedClass : true);

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
        <div>
          <h2 className="text-xl font-bold text-slate-900 tracking-tight">Institutional Attendance Portal</h2>
          <p className="text-xs text-slate-500">
            Daily roll marking, duplicate prevention, and automated attendance ratio calculation.
          </p>
        </div>
        <button
          onClick={() => window.print()}
          className="px-3.5 py-2 rounded-xl border border-slate-200 hover:bg-slate-50 text-slate-700 text-xs font-semibold flex items-center gap-1.5 transition-colors print:hidden"
        >
          <Printer className="w-4 h-4" />
          <span>Print Sheet</span>
        </button>
      </div>

      {saveMsg && (
        <div className="p-3.5 rounded-xl bg-emerald-50 text-emerald-800 border border-emerald-200 flex items-center gap-2 text-xs font-semibold">
          <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
          <span>{saveMsg}</span>
        </div>
      )}

      {/* Tabs */}
      <div className="flex items-center gap-2 border-b border-slate-200 pb-2 print:hidden">
        <button
          onClick={() => setActiveTab('student')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
            activeTab === 'student'
              ? 'bg-amber-500 text-slate-950 shadow-xs'
              : 'text-slate-600 hover:bg-slate-100'
          }`}
        >
          Student Attendance
        </button>
        <button
          onClick={() => setActiveTab('teacher')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
            activeTab === 'teacher'
              ? 'bg-blue-600 text-white shadow-xs'
              : 'text-slate-600 hover:bg-slate-100'
          }`}
        >
          Faculty Teachers
        </button>
        <button
          onClick={() => setActiveTab('staff')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
            activeTab === 'staff'
              ? 'bg-emerald-600 text-white shadow-xs'
              : 'text-slate-600 hover:bg-slate-100'
          }`}
        >
          Support Staff
        </button>
      </div>

      {/* Date & Class Controls */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-2xs flex flex-wrap items-center justify-between gap-3 print:hidden">
        <div className="flex flex-wrap items-center gap-3">
          <div>
            <label className="block text-[11px] font-semibold text-slate-500 mb-1">Date</label>
            <input
              type="date"
              value={date}
              onChange={e => setDate(e.target.value)}
              className="px-3 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-lg text-slate-800"
            />
          </div>

          {activeTab === 'student' && (
            <div>
              <label className="block text-[11px] font-semibold text-slate-500 mb-1">Class</label>
              <select
                value={selectedClass}
                onChange={e => setSelectedClass(e.target.value)}
                className="px-3 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-lg text-slate-800"
              >
                {classes.map(c => (
                  <option key={c.id} value={c.name}>{c.name}</option>
                ))}
              </select>
            </div>
          )}
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => markAll('Present')}
            className="px-3 py-1.5 rounded-lg text-xs font-semibold text-emerald-700 bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 flex items-center gap-1"
          >
            <CheckCheck className="w-3.5 h-3.5" />
            <span>Mark All Present</span>
          </button>
          <button
            onClick={handleSave}
            disabled={loading}
            className="px-4 py-1.5 rounded-lg text-xs font-bold text-white bg-blue-600 hover:bg-blue-700 shadow-xs flex items-center gap-1.5"
          >
            <Save className="w-3.5 h-3.5" />
            <span>Save Sheet</span>
          </button>
        </div>
      </div>

      {/* Attendance Table */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-2xs overflow-hidden">
        <div className="p-3.5 bg-slate-50/80 border-b border-slate-100 flex items-center justify-between">
          <span className="font-bold text-xs text-slate-800">
            {activeTab === 'student' ? `${selectedClass} Roll Sheet` : activeTab === 'teacher' ? 'Faculty Attendance Sheet' : 'Support Staff Sheet'} — {formatDate(date)}
          </span>
          <span className="text-[11px] text-slate-500">
            {activeTab === 'student' ? `${activeStudents.length} Students` : activeTab === 'teacher' ? `${teachers.length} Teachers` : `${staff.length} Staff`}
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 text-slate-500 uppercase font-semibold border-b border-slate-100">
              <tr>
                <th className="px-4 py-3" style={{ width: '90px' }}>Roll / ID</th>
                <th className="px-4 py-3">Name & Details</th>
                <th className="px-4 py-3 text-center" style={{ width: '280px' }}>Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {activeTab === 'student' && (
                activeStudents.length === 0 ? (
                  <tr><td colSpan={3} className="text-center py-8 text-slate-400">No students enrolled in {selectedClass}.</td></tr>
                ) : (
                  activeStudents.map(s => {
                    const cur = attStatus[s.id] || 'Present';
                    return (
                      <tr key={s.id} className="hover:bg-slate-50/60">
                        <td className="px-4 py-3 font-mono font-bold text-amber-600">{s.roll_number}</td>
                        <td className="px-4 py-3">
                          <div className="font-bold text-slate-800">{s.student_name}</div>
                          <div className="text-[11px] text-slate-400">Father: {s.father_name} • Adm #{s.admission_number}</div>
                        </td>
                        <td className="px-4 py-3 text-center">
                          <div className="inline-flex rounded-lg border border-slate-200 p-0.5 bg-slate-100">
                            <button
                              type="button"
                              onClick={() => setAttStatus({ ...attStatus, [s.id]: 'Present' })}
                              className={`px-3 py-1 rounded-md text-xs font-bold transition-all ${
                                cur === 'Present' ? 'bg-emerald-600 text-white shadow-2xs' : 'text-slate-600 hover:text-emerald-700'
                              }`}
                            >
                              Present
                            </button>
                            <button
                              type="button"
                              onClick={() => setAttStatus({ ...attStatus, [s.id]: 'Absent' })}
                              className={`px-3 py-1 rounded-md text-xs font-bold transition-all ${
                                cur === 'Absent' ? 'bg-rose-600 text-white shadow-2xs' : 'text-slate-600 hover:text-rose-700'
                              }`}
                            >
                              Absent
                            </button>
                            <button
                              type="button"
                              onClick={() => setAttStatus({ ...attStatus, [s.id]: 'Leave' })}
                              className={`px-3 py-1 rounded-md text-xs font-bold transition-all ${
                                cur === 'Leave' ? 'bg-amber-500 text-slate-950 shadow-2xs' : 'text-slate-600 hover:text-amber-700'
                              }`}
                            >
                              Leave
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })
                )
              )}

              {activeTab === 'teacher' && (
                teachers.length === 0 ? (
                  <tr><td colSpan={3} className="text-center py-8 text-slate-400">No teachers found.</td></tr>
                ) : (
                  teachers.map(t => {
                    const cur = attStatus[t.id] || 'Present';
                    return (
                      <tr key={t.id} className="hover:bg-slate-50/60">
                        <td className="px-4 py-3 font-mono font-bold text-blue-700">{t.employee_id}</td>
                        <td className="px-4 py-3">
                          <div className="font-bold text-slate-800">{t.full_name}</div>
                          <div className="text-[11px] text-slate-400">{t.designation} • {t.subject}</div>
                        </td>
                        <td className="px-4 py-3 text-center">
                          <div className="inline-flex rounded-lg border border-slate-200 p-0.5 bg-slate-100">
                            <button
                              type="button"
                              onClick={() => setAttStatus({ ...attStatus, [t.id]: 'Present' })}
                              className={`px-3 py-1 rounded-md text-xs font-bold transition-all ${
                                cur === 'Present' ? 'bg-emerald-600 text-white shadow-2xs' : 'text-slate-600 hover:text-emerald-700'
                              }`}
                            >
                              Present
                            </button>
                            <button
                              type="button"
                              onClick={() => setAttStatus({ ...attStatus, [t.id]: 'Absent' })}
                              className={`px-3 py-1 rounded-md text-xs font-bold transition-all ${
                                cur === 'Absent' ? 'bg-rose-600 text-white shadow-2xs' : 'text-slate-600 hover:text-rose-700'
                              }`}
                            >
                              Absent
                            </button>
                            <button
                              type="button"
                              onClick={() => setAttStatus({ ...attStatus, [t.id]: 'Leave' })}
                              className={`px-3 py-1 rounded-md text-xs font-bold transition-all ${
                                cur === 'Leave' ? 'bg-amber-500 text-slate-950 shadow-2xs' : 'text-slate-600 hover:text-amber-700'
                              }`}
                            >
                              Leave
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })
                )
              )}

              {activeTab === 'staff' && (
                staff.length === 0 ? (
                  <tr><td colSpan={3} className="text-center py-8 text-slate-400">No staff found.</td></tr>
                ) : (
                  staff.map(st => {
                    const cur = attStatus[st.id] || 'Present';
                    return (
                      <tr key={st.id} className="hover:bg-slate-50/60">
                        <td className="px-4 py-3 font-mono font-bold text-emerald-700">{st.staff_code}</td>
                        <td className="px-4 py-3">
                          <div className="font-bold text-slate-800">{st.full_name}</div>
                          <div className="text-[11px] text-slate-400">{st.designation}</div>
                        </td>
                        <td className="px-4 py-3 text-center">
                          <div className="inline-flex rounded-lg border border-slate-200 p-0.5 bg-slate-100">
                            <button
                              type="button"
                              onClick={() => setAttStatus({ ...attStatus, [st.id]: 'Present' })}
                              className={`px-3 py-1 rounded-md text-xs font-bold transition-all ${
                                cur === 'Present' ? 'bg-emerald-600 text-white shadow-2xs' : 'text-slate-600 hover:text-emerald-700'
                              }`}
                            >
                              Present
                            </button>
                            <button
                              type="button"
                              onClick={() => setAttStatus({ ...attStatus, [st.id]: 'Absent' })}
                              className={`px-3 py-1 rounded-md text-xs font-bold transition-all ${
                                cur === 'Absent' ? 'bg-rose-600 text-white shadow-2xs' : 'text-slate-600 hover:text-rose-700'
                              }`}
                            >
                              Absent
                            </button>
                            <button
                              type="button"
                              onClick={() => setAttStatus({ ...attStatus, [st.id]: 'Leave' })}
                              className={`px-3 py-1 rounded-md text-xs font-bold transition-all ${
                                cur === 'Leave' ? 'bg-amber-500 text-slate-950 shadow-2xs' : 'text-slate-600 hover:text-amber-700'
                              }`}
                            >
                              Leave
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })
                )
              )}
            </tbody>
          </table>
        </div>

        <div className="p-4 border-t border-slate-100 flex justify-end print:hidden">
          <button
            onClick={handleSave}
            disabled={loading}
            className="px-6 py-2 rounded-xl text-xs font-bold text-white bg-blue-600 hover:bg-blue-700 shadow-md flex items-center gap-1.5"
          >
            <Save className="w-4 h-4" />
            <span>Save Attendance Sheet</span>
          </button>
        </div>
      </div>
    </div>
  );
};
