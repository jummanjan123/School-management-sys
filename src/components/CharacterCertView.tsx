import React, { useState, useEffect } from 'react';
import { apiRequest, formatDate } from '../api';
import { School, Student } from '../types';
import { Award, Printer, ArrowLeft } from 'lucide-react';

interface CharacterCertViewProps {
  school: School;
  initialStudentId?: number;
}

export const CharacterCertView: React.FC<CharacterCertViewProps> = ({ school, initialStudentId }) => {
  const [students, setStudents] = useState<Student[]>([]);
  const [selectedStudentId, setSelectedStudentId] = useState<number | ''>(initialStudentId || '');
  const [statement, setStatement] = useState(
    'This is to certify that the above mentioned student has been a bona fide student of this institution. During the academic tenure, their conduct, character, morals, and discipline have been found to be exemplary and satisfactory. They actively participated in academic activities and co-curricular programs.'
  );
  const [issueDate, setIssueDate] = useState(new Date().toISOString().split('T')[0]);

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
          <h2 className="text-xl font-bold text-slate-900 tracking-tight">Character Certificate Studio</h2>
          <p className="text-xs text-slate-500">Official printable A4 institutional character certificate with security watermark.</p>
        </div>
        <button
          onClick={() => window.print()}
          className="px-4 py-2 rounded-xl bg-sky-600 hover:bg-sky-700 text-white font-bold text-xs shadow-md flex items-center gap-1.5"
        >
          <Printer className="w-4 h-4" />
          <span>Print A4 Certificate</span>
        </button>
      </div>

      {/* Control bar */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-2xs space-y-3 print:hidden">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Select Student</label>
            <select
              value={selectedStudentId}
              onChange={e => setSelectedStudentId(Number(e.target.value))}
              className="w-full text-xs px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-slate-800"
            >
              {students.map(s => (
                <option key={s.id} value={s.id}>
                  {s.student_name} (Roll #{s.roll_number}, {s.class_name}) - Father: {s.father_name}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Date of Issue</label>
            <input
              type="date"
              value={issueDate}
              onChange={e => setIssueDate(e.target.value)}
              className="w-full text-xs px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-slate-800"
            />
          </div>
        </div>

        <div>
          <label className="block text-xs font-semibold text-slate-700 mb-1">Editable Statement Text</label>
          <textarea
            rows={2}
            value={statement}
            onChange={e => setStatement(e.target.value)}
            className="w-full text-xs p-2.5 border border-slate-200 rounded-lg"
          />
        </div>
      </div>

      {/* A4 Printable Sheet */}
      {student && (
        <div className="max-w-[800px] mx-auto bg-white p-10 md:p-14 border-8 border-double border-blue-900 shadow-xl rounded-sm relative text-slate-900 print:shadow-none print:border-4 print:p-8">
          
          {/* Watermark */}
          <div className="absolute inset-0 flex items-center justify-center opacity-5 pointer-events-none select-none">
            <span className="text-9xl font-black uppercase text-blue-900 tracking-widest">{school.name.split(' ')[0]}</span>
          </div>

          {/* School Header */}
          <div className="text-center pb-4 border-b-2 border-blue-900">
            <div className="flex items-center justify-center gap-3 mb-2">
              <div className="w-14 h-14 rounded-full bg-blue-900 text-white font-bold flex items-center justify-center text-lg border-2 border-amber-400">
                SCH
              </div>
              <div>
                <h1 className="text-2xl font-black uppercase text-blue-950 tracking-wider">{school.name}</h1>
                <p className="text-xs text-slate-600">{school.address || 'Campus Head Office'} • Contact: {school.phone || '0300-1234567'}</p>
              </div>
            </div>

            <div className="font-serif text-blue-800 font-bold text-sm" dir="rtl">
              "{school.urdu_slogan}"
            </div>
          </div>

          {/* Certificate Title */}
          <div className="text-center my-6">
            <div className="inline-block border-y-2 border-slate-900 px-6 py-1">
              <h2 className="text-lg font-serif font-black uppercase tracking-widest text-slate-900">
                Character Certificate
              </h2>
            </div>
          </div>

          {/* Metadata Row */}
          <div className="flex justify-between items-center text-xs font-semibold text-slate-600 mb-6">
            <div>Reg No: <span className="font-mono text-slate-900 font-bold">CC-{new Date().getFullYear()}-{student.id.toString().padStart(4, '0')}</span></div>
            <div>Date of Issue: <span className="text-slate-900 font-bold">{formatDate(issueDate)}</span></div>
          </div>

          {/* Narrative Content */}
          <div className="text-base leading-relaxed font-serif text-justify space-y-4 text-slate-800">
            <p>
              This is to solemnly certify that{' '}
              <strong className="border-b border-slate-900 px-1 font-sans text-slate-950">{student.student_name}</strong>,{' '}
              Son / Daughter of{' '}
              <strong className="border-b border-slate-900 px-1 font-sans text-slate-950">{student.father_name}</strong>,{' '}
              bearing Admission Number{' '}
              <strong className="border-b border-slate-900 px-1 font-mono text-blue-900">{student.admission_number}</strong>{' '}
              and Roll Number{' '}
              <strong className="border-b border-slate-900 px-1 font-sans text-slate-950">{student.roll_number}</strong>,{' '}
              has been a regular enrolled student in{' '}
              <strong className="border-b border-slate-900 px-1 font-sans text-slate-950">{student.class_name} (Section {student.section})</strong>{' '}
              at this educational institution since{' '}
              <strong className="border-b border-slate-900 px-1 font-sans text-slate-950">{formatDate(student.admission_date)}</strong>.
            </p>

            <p>
              According to the school official admission register, their recorded Date of Birth is{' '}
              <strong className="border-b border-slate-900 px-1 font-sans text-slate-950">{formatDate(student.date_of_birth)}</strong>.
            </p>

            <div className="p-4 bg-slate-50 border border-slate-200 rounded-lg italic">
              {statement}
            </div>

            <p>
              To the best of our institutional knowledge, they bear an unblemished moral character and conduct. We wish them success and brilliance in all their future pursuits.
            </p>
          </div>

          {/* Signature and Seal Section */}
          <div className="grid grid-cols-3 gap-4 text-center mt-14 pt-6">
            <div>
              <div className="h-12 flex items-center justify-center font-cursive text-slate-500 text-xs">Record Verified</div>
              <div className="border-t border-slate-900 font-bold text-xs uppercase pt-1">Class Teacher</div>
            </div>

            <div>
              <div className="h-12 flex items-center justify-center">
                <div className="w-10 h-10 rounded-full border-2 border-blue-900 text-blue-900 font-bold flex items-center justify-center text-[9px] rotate-[-12deg]">
                  SEAL
                </div>
              </div>
              <div className="border-t border-slate-900 font-bold text-xs uppercase pt-1">School Stamp</div>
            </div>

            <div>
              <div className="h-12 flex items-center justify-center font-bold text-sm text-slate-900">{school.head_name}</div>
              <div className="border-t border-slate-900 font-bold text-xs uppercase pt-1">Headmaster / Principal</div>
            </div>
          </div>

        </div>
      )}
    </div>
  );
};
