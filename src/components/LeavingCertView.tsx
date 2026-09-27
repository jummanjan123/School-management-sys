import React, { useState, useEffect } from 'react';
import { apiRequest, formatDate } from '../api';
import { School, Student } from '../types';
import { FileText, Printer } from 'lucide-react';

interface LeavingCertViewProps {
  school: School;
  initialStudentId?: number;
}

export const LeavingCertView: React.FC<LeavingCertViewProps> = ({ school, initialStudentId }) => {
  const [students, setStudents] = useState<Student[]>([]);
  const [selectedStudentId, setSelectedStudentId] = useState<number | ''>(initialStudentId || '');
  const [dateOfLeaving, setDateOfLeaving] = useState(new Date().toISOString().split('T')[0]);
  const [reason, setReason] = useState('Parents Relocation / Transfer to another city');
  const [conduct, setConduct] = useState('Satisfactory & Commendable');
  const [remarks, setRemarks] = useState('All tuition fees, library books and school property cleared.');

  useEffect(() => {
    apiRequest<Student[]>('/api/students').then(res => {
      setStudents(res);
      if (!selectedStudentId && res.length > 0) {
        setSelectedStudentId(res[0].id);
      }
    });
  }, []);

  const student = students.find(s => s.id === Number(selectedStudentId));

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 print:hidden">
        <div>
          <h2 className="text-xl font-bold text-slate-900 tracking-tight">School Leaving Certificate (SLC)</h2>
          <p className="text-xs text-slate-500">Official verified transfer certificate compliant with general register norms.</p>
        </div>
        <button
          onClick={() => window.print()}
          className="px-4 py-2 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white font-bold text-xs shadow-md flex items-center gap-1.5"
        >
          <Printer className="w-4 h-4" />
          <span>Print SLC Certificate (A4)</span>
        </button>
      </div>

      {/* Control bar */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-2xs space-y-3 print:hidden">
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3 text-xs">
          <div>
            <label className="block font-semibold text-slate-700 mb-1">Select Student</label>
            <select
              value={selectedStudentId}
              onChange={e => setSelectedStudentId(Number(e.target.value))}
              className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-slate-800"
            >
              {students.map(s => (
                <option key={s.id} value={s.id}>
                  {s.student_name} (Roll #{s.roll_number}, {s.class_name})
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block font-semibold text-slate-700 mb-1">Date of Leaving</label>
            <input
              type="date"
              value={dateOfLeaving}
              onChange={e => setDateOfLeaving(e.target.value)}
              className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-slate-800"
            />
          </div>

          <div>
            <label className="block font-semibold text-slate-700 mb-1">General Conduct</label>
            <input
              type="text"
              value={conduct}
              onChange={e => setConduct(e.target.value)}
              className="w-full px-3 py-2 border border-slate-200 rounded-lg"
            />
          </div>

          <div>
            <label className="block font-semibold text-slate-700 mb-1">Reason for Leaving</label>
            <input
              type="text"
              value={reason}
              onChange={e => setReason(e.target.value)}
              className="w-full px-3 py-2 border border-slate-200 rounded-lg"
            />
          </div>
        </div>
      </div>

      {/* A4 Sheet */}
      {student && (
        <div className="max-w-[800px] mx-auto bg-white p-10 md:p-14 border-8 border-groove border-emerald-800 shadow-xl rounded-sm text-slate-900 print:shadow-none print:border-4 print:p-8">
          
          {/* Header */}
          <div className="text-center pb-4 border-b-2 border-emerald-800">
            <div className="flex items-center justify-center gap-3 mb-2">
              <div className="w-14 h-14 rounded-full bg-emerald-800 text-white font-bold flex items-center justify-center text-lg border-2 border-amber-400">
                SCH
              </div>
              <div>
                <h1 className="text-2xl font-black uppercase text-emerald-950 tracking-wider">{school.name}</h1>
                <p className="text-xs text-slate-600">{school.address || 'Campus Head Office'} • Contact: {school.phone || '0300-1234567'}</p>
              </div>
            </div>

            <div className="font-serif text-emerald-800 font-bold text-sm" dir="rtl">
              "{school.urdu_slogan}"
            </div>
          </div>

          {/* Title */}
          <div className="text-center my-6">
            <div className="inline-block border-y-2 border-slate-900 px-6 py-1">
              <h2 className="text-lg font-serif font-black uppercase tracking-widest text-slate-900">
                School Leaving Certificate
              </h2>
            </div>
          </div>

          {/* Reg Meta */}
          <div className="flex justify-between items-center text-xs font-semibold text-slate-600 mb-4">
            <div>Registration / SLC No: <span className="font-mono text-slate-900 font-bold">SLC-{new Date().getFullYear()}-{student.id.toString().padStart(4, '0')}</span></div>
            <div>Issue Date: <span className="text-slate-900 font-bold">{formatDate(new Date().toISOString())}</span></div>
          </div>

          {/* General Register Table */}
          <table className="w-full text-xs border border-slate-300 mb-6">
            <tbody className="divide-y divide-slate-200">
              <tr>
                <th className="p-2.5 bg-slate-50 text-left font-bold text-slate-700 w-1/3">1. Student Full Name</th>
                <td className="p-2.5 font-bold uppercase text-slate-900">{student.student_name}</td>
              </tr>
              <tr>
                <th className="p-2.5 bg-slate-50 text-left font-bold text-slate-700">2. Father's Name</th>
                <td className="p-2.5 font-bold uppercase text-slate-900">{student.father_name}</td>
              </tr>
              <tr>
                <th className="p-2.5 bg-slate-50 text-left font-bold text-slate-700">3. Admission Number</th>
                <td className="p-2.5 font-mono font-bold text-emerald-800">{student.admission_number}</td>
              </tr>
              <tr>
                <th className="p-2.5 bg-slate-50 text-left font-bold text-slate-700">4. Date of Birth (as per register)</th>
                <td className="p-2.5">{formatDate(student.date_of_birth)}</td>
              </tr>
              <tr>
                <th className="p-2.5 bg-slate-50 text-left font-bold text-slate-700">5. Class in which student was reading</th>
                <td className="p-2.5 font-bold">{student.class_name} (Section {student.section}) • Roll #{student.roll_number}</td>
              </tr>
              <tr>
                <th className="p-2.5 bg-slate-50 text-left font-bold text-slate-700">6. Date of Admission into School</th>
                <td className="p-2.5">{formatDate(student.admission_date)}</td>
              </tr>
              <tr>
                <th className="p-2.5 bg-slate-50 text-left font-bold text-slate-700">7. Date of Leaving Institution</th>
                <td className="p-2.5 font-bold text-slate-900">{formatDate(dateOfLeaving)}</td>
              </tr>
              <tr>
                <th className="p-2.5 bg-slate-50 text-left font-bold text-slate-700">8. Reason for Leaving School</th>
                <td className="p-2.5">{reason}</td>
              </tr>
              <tr>
                <th className="p-2.5 bg-slate-50 text-left font-bold text-slate-700">9. General Conduct & Discipline</th>
                <td className="p-2.5 font-bold text-emerald-700">{conduct}</td>
              </tr>
              <tr>
                <th className="p-2.5 bg-slate-50 text-left font-bold text-slate-700">10. Dues & Equipment Status</th>
                <td className="p-2.5">{remarks}</td>
              </tr>
            </tbody>
          </table>

          <p className="text-[11px] text-slate-500 italic text-center mb-10">
            Certified that the above mentioned information is in accordance with the official school register records.
          </p>

          {/* Signatures */}
          <div className="grid grid-cols-3 gap-4 text-center mt-12 pt-4">
            <div>
              <div className="h-10 flex items-center justify-center font-cursive text-slate-500 text-xs">Clerk Verified</div>
              <div className="border-t border-slate-900 font-bold text-xs uppercase pt-1">Prepared By</div>
            </div>

            <div>
              <div className="h-10 flex items-center justify-center">
                <div className="w-10 h-10 rounded-full border-2 border-emerald-800 text-emerald-800 font-bold flex items-center justify-center text-[9px] rotate-[-12deg]">
                  SEAL
                </div>
              </div>
              <div className="border-t border-slate-900 font-bold text-xs uppercase pt-1">School Seal</div>
            </div>

            <div>
              <div className="h-10 flex items-center justify-center font-bold text-sm text-slate-900">{school.head_name}</div>
              <div className="border-t border-slate-900 font-bold text-xs uppercase pt-1">Principal / Headmaster</div>
            </div>
          </div>

        </div>
      )}
    </div>
  );
};
