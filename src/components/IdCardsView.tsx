import React, { useState, useEffect } from 'react';
import { apiRequest } from '../api';
import { School, Student, Teacher, Staff } from '../types';
import {
  CreditCard,
  Printer,
  Users,
  GraduationCap,
  UserCheck
} from 'lucide-react';

interface IdCardsViewProps {
  school: School;
  initialType?: string;
  initialId?: number;
}

export const IdCardsView: React.FC<IdCardsViewProps> = ({
  school,
  initialType = 'student',
  initialId
}) => {
  const [role, setRole] = useState<'student' | 'teacher' | 'staff'>(
    (initialType as any) || 'student'
  );

  const [students, setStudents] = useState<Student[]>([]);
  const [teachers, setTeachers] = useState<Teacher[]>([]);
  const [staff, setStaff] = useState<Staff[]>([]);
  const [selectedId, setSelectedId] = useState<number | ''>(initialId || '');

  useEffect(() => {
    apiRequest<Student[]>('/api/students').then(setStudents);
    apiRequest<Teacher[]>('/api/teachers').then(setTeachers);
    apiRequest<Staff[]>('/api/staff').then(setStaff);
  }, []);

  const displayedCards = () => {
    if (role === 'student') {
      if (selectedId) return students.filter(s => s.id === Number(selectedId));
      return students.slice(0, 12);
    } else if (role === 'teacher') {
      if (selectedId) return teachers.filter(t => t.id === Number(selectedId));
      return teachers.slice(0, 12);
    } else {
      if (selectedId) return staff.filter(s => s.id === Number(selectedId));
      return staff.slice(0, 12);
    }
  };

  const cards = displayedCards();

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
        <div>
          <h2 className="text-xl font-bold text-slate-900 tracking-tight">Smart PVC Identity Card Studio</h2>
          <p className="text-xs text-slate-500">
            Professional ISO CR80 PVC school cards with role-specific theme styling (Blue, Yellow, Green).
          </p>
        </div>
        <button
          onClick={() => window.print()}
          className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs shadow-md flex items-center gap-1.5 print:hidden"
        >
          <Printer className="w-4 h-4" />
          <span>Print PVC Cards</span>
        </button>
      </div>

      {/* Role Selection & Filter Bar */}
      <div className="bg-white p-3.5 rounded-2xl border border-slate-200 shadow-2xs flex flex-wrap items-center justify-between gap-3 print:hidden">
        <div className="flex items-center gap-2">
          <button
            onClick={() => { setRole('student'); setSelectedId(''); }}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 ${
              role === 'student' ? 'bg-amber-400 text-slate-950 shadow-xs' : 'text-slate-600 hover:bg-slate-100'
            }`}
          >
            <GraduationCap className="w-4 h-4 text-amber-600" />
            <span>Students (Yellow Theme)</span>
          </button>
          <button
            onClick={() => { setRole('teacher'); setSelectedId(''); }}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 ${
              role === 'teacher' ? 'bg-blue-600 text-white shadow-xs' : 'text-slate-600 hover:bg-slate-100'
            }`}
          >
            <Users className="w-4 h-4" />
            <span>Teachers (Blue Theme)</span>
          </button>
          <button
            onClick={() => { setRole('staff'); setSelectedId(''); }}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 ${
              role === 'staff' ? 'bg-emerald-600 text-white shadow-xs' : 'text-slate-600 hover:bg-slate-100'
            }`}
          >
            <UserCheck className="w-4 h-4" />
            <span>Staff (Green Theme)</span>
          </button>
        </div>

        {/* Filter Single Person */}
        <div>
          <select
            value={selectedId}
            onChange={e => setSelectedId(e.target.value ? Number(e.target.value) : '')}
            className="text-xs px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-slate-700"
          >
            <option value="">-- All Cards (Batch View) --</option>
            {role === 'student' && students.map(s => (
              <option key={s.id} value={s.id}>{s.student_name} ({s.class_name} - Roll #{s.roll_number})</option>
            ))}
            {role === 'teacher' && teachers.map(t => (
              <option key={t.id} value={t.id}>{t.full_name} ({t.designation})</option>
            ))}
            {role === 'staff' && staff.map(st => (
              <option key={st.id} value={st.id}>{st.full_name} ({st.designation})</option>
            ))}
          </select>
        </div>
      </div>

      {/* PVC Cards Render Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6 justify-center">
        {cards.length === 0 ? (
          <div className="col-span-full text-center py-12 text-slate-400">
            No cards found for this selection.
          </div>
        ) : (
          cards.map((item: any) => {
            if (role === 'student') {
              return (
                <div
                  key={item.id}
                  className="w-[280px] h-[430px] rounded-2xl bg-white border border-amber-300 shadow-xl overflow-hidden flex flex-col justify-between mx-auto relative hover:-translate-y-1 transition-transform"
                >
                  <div>
                    {/* Punch Hole */}
                    <div className="w-10 h-2.5 rounded-full bg-slate-200 mx-auto mt-2 border border-slate-300" />
                    
                    {/* Card Header (Yellow/Gold Theme) */}
                    <div className="bg-linear-to-r from-amber-500 via-amber-400 to-yellow-500 p-3 text-center text-slate-950 mt-1 shadow-xs">
                      <div className="font-extrabold text-xs uppercase tracking-tight leading-tight">{school.name}</div>
                      <div className="font-serif text-[10px] font-bold text-amber-950" dir="rtl">"{school.urdu_slogan}"</div>
                      <div className="inline-block px-2 py-0.5 mt-1 bg-slate-950 text-amber-400 text-[9px] font-bold rounded-full uppercase tracking-wider">
                        Student Identity Card
                      </div>
                    </div>

                    {/* Photo & Details */}
                    <div className="p-3 text-center">
                      <div className="w-20 h-22 rounded-xl mx-auto mb-2 overflow-hidden border-2 border-amber-400 shadow-xs bg-slate-100 flex items-center justify-center">
                        {item.photo_path ? (
                          <img src={item.photo_path} alt={item.student_name} className="w-full h-full object-cover" />
                        ) : (
                          <span className="text-2xl font-bold text-amber-700">{item.student_name[0]}</span>
                        )}
                      </div>

                      <h4 className="font-extrabold text-slate-900 text-sm uppercase leading-tight">{item.student_name}</h4>
                      <p className="text-[11px] font-bold text-amber-800 mb-2">{item.class_name} (Section {item.section})</p>

                      <div className="bg-slate-50 border border-slate-200/80 rounded-xl p-2 text-left text-[11px] space-y-1">
                        <div><span className="text-slate-400">Father:</span> <strong className="text-slate-800">{item.father_name}</strong></div>
                        <div><span className="text-slate-400">Roll No:</span> <strong className="text-amber-800">{item.roll_number}</strong></div>
                        <div><span className="text-slate-400">Adm No:</span> <strong className="font-mono">{item.admission_number}</strong></div>
                        <div><span className="text-slate-400">Phone:</span> <strong className="font-mono text-slate-700">{item.father_mobile}</strong></div>
                        <div><span className="text-slate-400">Session:</span> <strong>{school.academic_session}</strong></div>
                      </div>
                    </div>
                  </div>

                  {/* Card Bottom Signature */}
                  <div className="p-2 border-t border-slate-200 bg-slate-50 flex items-center justify-between px-3">
                    <span className="text-[9px] text-slate-400 font-mono">ID: {item.student_code}</span>
                    <div className="text-center">
                      <span className="text-[9px] font-bold text-slate-800 block leading-tight">{school.head_name}</span>
                      <span className="text-[8px] text-slate-400 border-t border-slate-300 block">Principal</span>
                    </div>
                  </div>
                </div>
              );
            } else if (role === 'teacher') {
              return (
                <div
                  key={item.id}
                  className="w-[280px] h-[430px] rounded-2xl bg-white border border-blue-300 shadow-xl overflow-hidden flex flex-col justify-between mx-auto relative hover:-translate-y-1 transition-transform"
                >
                  <div>
                    {/* Punch Hole */}
                    <div className="w-10 h-2.5 rounded-full bg-slate-200 mx-auto mt-2 border border-slate-300" />
                    
                    {/* Card Header (Blue Theme) */}
                    <div className="bg-linear-to-r from-blue-900 to-blue-600 p-3 text-center text-white mt-1 shadow-xs">
                      <div className="font-extrabold text-xs uppercase tracking-tight leading-tight">{school.name}</div>
                      <div className="font-serif text-[10px] text-amber-300 font-bold" dir="rtl">"{school.urdu_slogan}"</div>
                      <div className="inline-block px-2 py-0.5 mt-1 bg-white text-blue-800 text-[9px] font-bold rounded-full uppercase tracking-wider">
                        Faculty Identity Card
                      </div>
                    </div>

                    {/* Photo & Details */}
                    <div className="p-3 text-center">
                      <div className="w-20 h-22 rounded-xl mx-auto mb-2 overflow-hidden border-2 border-blue-500 shadow-xs bg-slate-100 flex items-center justify-center">
                        {item.photo_path ? (
                          <img src={item.photo_path} alt={item.full_name} className="w-full h-full object-cover" />
                        ) : (
                          <span className="text-2xl font-bold text-blue-700">{item.full_name[0]}</span>
                        )}
                      </div>

                      <h4 className="font-extrabold text-slate-900 text-sm uppercase leading-tight">{item.full_name}</h4>
                      <p className="text-[11px] font-bold text-blue-700 mb-2">{item.designation}</p>

                      <div className="bg-slate-50 border border-slate-200/80 rounded-xl p-2 text-left text-[11px] space-y-1">
                        <div><span className="text-slate-400">Emp ID:</span> <strong className="font-mono text-blue-700">{item.employee_id}</strong></div>
                        <div><span className="text-slate-400">Level:</span> <strong>{item.teaching_level} Level</strong></div>
                        <div><span className="text-slate-400">Subject:</span> <strong>{item.subject || 'All'}</strong></div>
                        <div><span className="text-slate-400">CNIC:</span> <strong className="font-mono">{item.cnic || '-'}</strong></div>
                        <div><span className="text-slate-400">Mobile:</span> <strong className="font-mono">{item.mobile_number}</strong></div>
                      </div>
                    </div>
                  </div>

                  {/* Card Bottom Signature */}
                  <div className="p-2 border-t border-slate-200 bg-slate-50 flex items-center justify-between px-3">
                    <span className="text-[9px] text-slate-400 font-mono">{item.teacher_code}</span>
                    <div className="text-center">
                      <span className="text-[9px] font-bold text-slate-800 block leading-tight">{school.head_name}</span>
                      <span className="text-[8px] text-slate-400 border-t border-slate-300 block">Principal</span>
                    </div>
                  </div>
                </div>
              );
            } else {
              return (
                <div
                  key={item.id}
                  className="w-[280px] h-[430px] rounded-2xl bg-white border border-emerald-300 shadow-xl overflow-hidden flex flex-col justify-between mx-auto relative hover:-translate-y-1 transition-transform"
                >
                  <div>
                    {/* Punch Hole */}
                    <div className="w-10 h-2.5 rounded-full bg-slate-200 mx-auto mt-2 border border-slate-300" />
                    
                    {/* Card Header (Green Theme) */}
                    <div className="bg-linear-to-r from-emerald-800 to-emerald-600 p-3 text-center text-white mt-1 shadow-xs">
                      <div className="font-extrabold text-xs uppercase tracking-tight leading-tight">{school.name}</div>
                      <div className="font-serif text-[10px] text-emerald-200 font-bold" dir="rtl">"{school.urdu_slogan}"</div>
                      <div className="inline-block px-2 py-0.5 mt-1 bg-white text-emerald-800 text-[9px] font-bold rounded-full uppercase tracking-wider">
                        Staff Identity Card
                      </div>
                    </div>

                    {/* Photo & Details */}
                    <div className="p-3 text-center">
                      <div className="w-20 h-22 rounded-xl mx-auto mb-2 overflow-hidden border-2 border-emerald-500 shadow-xs bg-slate-100 flex items-center justify-center">
                        {item.photo_path ? (
                          <img src={item.photo_path} alt={item.full_name} className="w-full h-full object-cover" />
                        ) : (
                          <span className="text-2xl font-bold text-emerald-700">{item.full_name[0]}</span>
                        )}
                      </div>

                      <h4 className="font-extrabold text-slate-900 text-sm uppercase leading-tight">{item.full_name}</h4>
                      <p className="text-[11px] font-bold text-emerald-700 mb-2">{item.designation}</p>

                      <div className="bg-slate-50 border border-slate-200/80 rounded-xl p-2 text-left text-[11px] space-y-1">
                        <div><span className="text-slate-400">Staff ID:</span> <strong className="font-mono text-emerald-800">{item.staff_code}</strong></div>
                        <div><span className="text-slate-400">Father:</span> <strong>{item.father_name || '-'}</strong></div>
                        <div><span className="text-slate-400">Mobile:</span> <strong className="font-mono">{item.mobile}</strong></div>
                        <div><span className="text-slate-400">CNIC:</span> <strong className="font-mono">{item.cnic || '-'}</strong></div>
                        <div><span className="text-slate-400">Valid Until:</span> <strong>Dec 2026</strong></div>
                      </div>
                    </div>
                  </div>

                  {/* Card Bottom Signature */}
                  <div className="p-2 border-t border-slate-200 bg-slate-50 flex items-center justify-between px-3">
                    <span className="text-[9px] text-slate-400 font-mono">STAFF</span>
                    <div className="text-center">
                      <span className="text-[9px] font-bold text-slate-800 block leading-tight">{school.head_name}</span>
                      <span className="text-[8px] text-slate-400 border-t border-slate-300 block">Principal</span>
                    </div>
                  </div>
                </div>
              );
            }
          })
        )}
      </div>
    </div>
  );
};
