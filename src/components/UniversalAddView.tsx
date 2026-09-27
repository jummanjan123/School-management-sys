import React, { useState, useEffect } from 'react';
import { apiRequest } from '../api';
import { SchoolClass } from '../types';
import {
  GraduationCap,
  Users,
  UserCheck,
  Package,
  CheckCircle2,
  AlertCircle,
  Upload,
  ArrowLeft
} from 'lucide-react';

interface UniversalAddViewProps {
  initialType?: string;
  onSuccess: (type: string) => void;
  onCancel: () => void;
}

export const UniversalAddView: React.FC<UniversalAddViewProps> = ({
  initialType = 'student',
  onSuccess,
  onCancel
}) => {
  const [selectedCategory, setSelectedCategory] = useState<'student' | 'teacher' | 'staff' | 'inventory'>(
    (initialType as any) || 'student'
  );
  const [classes, setClasses] = useState<SchoolClass[]>([]);
  const [loading, setLoading] = useState(false);
  const [msg, setMsg] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  // Forms states
  const [studentForm, setStudentForm] = useState({
    student_name: '',
    father_name: '',
    mother_name: '',
    father_mobile: '',
    roll_number: '01',
    class_name: 'Class 1',
    section: 'A',
    admission_number: '',
    admission_date: new Date().toISOString().split('T')[0],
    date_of_birth: '2015-01-01',
    gender: 'Male',
    address: '',
    previous_school: '',
    monthly_fee: 2000,
    photo_path: ''
  });

  const [teacherForm, setTeacherForm] = useState({
    full_name: '',
    father_name: '',
    mobile_number: '',
    cnic: '',
    gender: 'Male',
    qualification: 'M.Sc / B.Ed',
    teaching_level: 'Primary',
    subject: 'General Science & Math',
    designation: 'Senior Teacher',
    marital_status: 'Married',
    date_of_enrolment: new Date().toISOString().split('T')[0],
    date_of_birth: '1990-01-01',
    salary: 45000,
    address: '',
    emergency_contact: '',
    photo_path: ''
  });

  const [staffForm, setStaffForm] = useState({
    full_name: '',
    father_name: '',
    mobile: '',
    cnic: '',
    designation: 'Security Guard',
    salary: 28000,
    date_of_joining: new Date().toISOString().split('T')[0],
    date_of_birth: '1988-01-01',
    address: '',
    emergency_contact: '',
    photo_path: ''
  });

  const [inventoryForm, setInventoryForm] = useState({
    item_name: '',
    item_category: 'Furniture',
    quantity: 10,
    unit: 'Pcs',
    purchase_price: 3500,
    purchase_date: new Date().toISOString().split('T')[0],
    supplier: 'National School Supplies',
    item_condition: 'Good',
    location: 'Main Block Storage',
    description: ''
  });

  useEffect(() => {
    apiRequest<SchoolClass[]>('/api/classes')
      .then(res => {
        setClasses(res);
        if (res.length > 0) {
          setStudentForm(prev => ({ ...prev, class_name: res[0].name, monthly_fee: res[0].monthly_fee }));
        }
      })
      .catch(console.error);
  }, []);

  const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>, setter: any) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setter((prev: any) => ({ ...prev, photo_path: reader.result as string }));
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setMsg(null);

    try {
      if (selectedCategory === 'student') {
        const res = await apiRequest('/api/students', {
          method: 'POST',
          body: JSON.stringify(studentForm)
        });
        setMsg({ type: 'success', text: `Student '${res.student_name}' (${res.student_code}) admitted successfully!` });
        setTimeout(() => onSuccess('students'), 1200);

      } else if (selectedCategory === 'teacher') {
        const res = await apiRequest('/api/teachers', {
          method: 'POST',
          body: JSON.stringify(teacherForm)
        });
        setMsg({ type: 'success', text: `Teacher '${res.full_name}' (${res.teacher_code}) registered successfully!` });
        setTimeout(() => onSuccess('teachers'), 1200);

      } else if (selectedCategory === 'staff') {
        const res = await apiRequest('/api/staff', {
          method: 'POST',
          body: JSON.stringify(staffForm)
        });
        setMsg({ type: 'success', text: `Staff member '${res.full_name}' (${res.staff_code}) added successfully!` });
        setTimeout(() => onSuccess('staff'), 1200);

      } else if (selectedCategory === 'inventory') {
        const res = await apiRequest('/api/inventory', {
          method: 'POST',
          body: JSON.stringify(inventoryForm)
        });
        setMsg({ type: 'success', text: `Inventory asset '${res.item_name}' (${res.item_code}) added successfully!` });
        setTimeout(() => onSuccess('inventory'), 1200);
      }
    } catch (err: any) {
      setMsg({ type: 'error', text: err.message || 'Error creating record.' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold text-slate-900 tracking-tight">Universal Add Record</h2>
          <p className="text-xs text-slate-500">
            Select one of the four categories to add a new record directly into MySQL storage.
          </p>
        </div>
        <button
          onClick={onCancel}
          className="text-xs font-semibold text-slate-600 hover:text-slate-900 flex items-center gap-1 p-2 rounded-lg hover:bg-slate-100"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Dashboard</span>
        </button>
      </div>

      {msg && (
        <div
          className={`p-4 rounded-xl flex items-center gap-3 text-xs font-semibold ${
            msg.type === 'success'
              ? 'bg-emerald-50 text-emerald-800 border border-emerald-200'
              : 'bg-rose-50 text-rose-800 border border-rose-200'
          }`}
        >
          {msg.type === 'success' ? (
            <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
          ) : (
            <AlertCircle className="w-5 h-5 text-rose-600 shrink-0" />
          )}
          <span>{msg.text}</span>
        </div>
      )}

      {/* 4 Large Selection Buttons */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <button
          type="button"
          onClick={() => setSelectedCategory('student')}
          className={`p-4 rounded-2xl border-2 text-left transition-all ${
            selectedCategory === 'student'
              ? 'border-amber-500 bg-amber-50/50 shadow-md ring-2 ring-amber-400/20'
              : 'border-slate-200 bg-white hover:border-slate-300'
          }`}
        >
          <div className="w-10 h-10 rounded-xl bg-amber-100 text-amber-700 flex items-center justify-center mb-2">
            <GraduationCap className="w-6 h-6" />
          </div>
          <div className="font-extrabold text-sm text-slate-900">[ STUDENT ]</div>
          <div className="text-[11px] text-slate-500">Admit Student</div>
        </button>

        <button
          type="button"
          onClick={() => setSelectedCategory('teacher')}
          className={`p-4 rounded-2xl border-2 text-left transition-all ${
            selectedCategory === 'teacher'
              ? 'border-blue-600 bg-blue-50/50 shadow-md ring-2 ring-blue-500/20'
              : 'border-slate-200 bg-white hover:border-slate-300'
          }`}
        >
          <div className="w-10 h-10 rounded-xl bg-blue-100 text-blue-700 flex items-center justify-center mb-2">
            <Users className="w-6 h-6" />
          </div>
          <div className="font-extrabold text-sm text-slate-900">[ TEACHER ]</div>
          <div className="text-[11px] text-slate-500">Register Faculty</div>
        </button>

        <button
          type="button"
          onClick={() => setSelectedCategory('staff')}
          className={`p-4 rounded-2xl border-2 text-left transition-all ${
            selectedCategory === 'staff'
              ? 'border-emerald-600 bg-emerald-50/50 shadow-md ring-2 ring-emerald-500/20'
              : 'border-slate-200 bg-white hover:border-slate-300'
          }`}
        >
          <div className="w-10 h-10 rounded-xl bg-emerald-100 text-emerald-700 flex items-center justify-center mb-2">
            <UserCheck className="w-6 h-6" />
          </div>
          <div className="font-extrabold text-sm text-slate-900">[ OTHER STAFF ]</div>
          <div className="text-[11px] text-slate-500">Support Staff</div>
        </button>

        <button
          type="button"
          onClick={() => setSelectedCategory('inventory')}
          className={`p-4 rounded-2xl border-2 text-left transition-all ${
            selectedCategory === 'inventory'
              ? 'border-cyan-600 bg-cyan-50/50 shadow-md ring-2 ring-cyan-500/20'
              : 'border-slate-200 bg-white hover:border-slate-300'
          }`}
        >
          <div className="w-10 h-10 rounded-xl bg-cyan-100 text-cyan-700 flex items-center justify-center mb-2">
            <Package className="w-6 h-6" />
          </div>
          <div className="font-extrabold text-sm text-slate-900">[ INVENTORY ]</div>
          <div className="text-[11px] text-slate-500">School Equipment</div>
        </button>
      </div>

      {/* Dynamic Form Container */}
      <div className="bg-white rounded-2xl border border-slate-200 p-6 md:p-8 shadow-xs">
        <form onSubmit={handleSubmit} className="space-y-6">

          {/* 1. STUDENT FORM */}
          {selectedCategory === 'student' && (
            <div>
              <div className="border-b border-slate-100 pb-3 mb-5 flex items-center justify-between">
                <h3 className="font-bold text-slate-900 text-base flex items-center gap-2">
                  <GraduationCap className="w-5 h-5 text-amber-500" />
                  Student Admission Form
                </h3>
                <span className="text-xs text-amber-700 bg-amber-50 px-2.5 py-1 rounded-full font-semibold border border-amber-200">
                  Yellow Card PVC
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Student Full Name *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Ali Ahmed"
                    value={studentForm.student_name}
                    onChange={e => setStudentForm({ ...studentForm, student_name: e.target.value })}
                    className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:ring-2 focus:ring-amber-400 focus:outline-hidden"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Father's Name *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Muhammad Ahmed"
                    value={studentForm.father_name}
                    onChange={e => setStudentForm({ ...studentForm, father_name: e.target.value })}
                    className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:ring-2 focus:ring-amber-400 focus:outline-hidden"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Father Mobile Number *</label>
                  <input
                    type="text"
                    required
                    placeholder="0300-1234567"
                    value={studentForm.father_mobile}
                    onChange={e => setStudentForm({ ...studentForm, father_mobile: e.target.value })}
                    className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:ring-2 focus:ring-amber-400 focus:outline-hidden"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Class *</label>
                  <select
                    value={studentForm.class_name}
                    onChange={e => {
                      const sel = classes.find(c => c.name === e.target.value);
                      setStudentForm({
                        ...studentForm,
                        class_name: e.target.value,
                        monthly_fee: sel ? sel.monthly_fee : studentForm.monthly_fee
                      });
                    }}
                    className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:ring-2 focus:ring-amber-400 focus:outline-hidden"
                  >
                    {classes.map(c => (
                      <option key={c.id} value={c.name}>{c.name}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Section</label>
                  <input
                    type="text"
                    value={studentForm.section}
                    onChange={e => setStudentForm({ ...studentForm, section: e.target.value })}
                    className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Roll Number</label>
                  <input
                    type="text"
                    value={studentForm.roll_number}
                    onChange={e => setStudentForm({ ...studentForm, roll_number: e.target.value })}
                    className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Monthly Tuition Fee (Rs.)</label>
                  <input
                    type="number"
                    value={studentForm.monthly_fee}
                    onChange={e => setStudentForm({ ...studentForm, monthly_fee: Number(e.target.value) })}
                    className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg font-semibold text-emerald-700"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Date of Birth</label>
                  <input
                    type="date"
                    value={studentForm.date_of_birth}
                    onChange={e => setStudentForm({ ...studentForm, date_of_birth: e.target.value })}
                    className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Gender</label>
                  <select
                    value={studentForm.gender}
                    onChange={e => setStudentForm({ ...studentForm, gender: e.target.value as any })}
                    className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg"
                  >
                    <option value="Male">Male</option>
                    <option value="Female">Female</option>
                  </select>
                </div>

                <div className="sm:col-span-2">
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Home Address</label>
                  <input
                    type="text"
                    placeholder="House / Street / Sector"
                    value={studentForm.address}
                    onChange={e => setStudentForm({ ...studentForm, address: e.target.value })}
                    className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Student Photo</label>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={e => handlePhotoUpload(e, setStudentForm)}
                    className="w-full text-xs text-slate-500 file:mr-2 file:py-1.5 file:px-3 file:rounded-lg file:border-0 file:text-xs file:font-semibold file:bg-amber-100 file:text-amber-700 hover:file:bg-amber-200"
                  />
                </div>
              </div>
            </div>
          )}

          {/* 2. TEACHER FORM */}
          {selectedCategory === 'teacher' && (
            <div>
              <div className="border-b border-slate-100 pb-3 mb-5 flex items-center justify-between">
                <h3 className="font-bold text-slate-900 text-base flex items-center gap-2">
                  <Users className="w-5 h-5 text-blue-600" />
                  Teacher & Faculty Registration Form
                </h3>
                <span className="text-xs text-blue-700 bg-blue-50 px-2.5 py-1 rounded-full font-semibold border border-blue-200">
                  Blue Card PVC
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Full Name *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Asad Malik"
                    value={teacherForm.full_name}
                    onChange={e => setTeacherForm({ ...teacherForm, full_name: e.target.value })}
                    className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-400 focus:outline-hidden"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Father / Husband Name</label>
                  <input
                    type="text"
                    placeholder="e.g. Malik Qasim"
                    value={teacherForm.father_name}
                    onChange={e => setTeacherForm({ ...teacherForm, father_name: e.target.value })}
                    className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Mobile Phone *</label>
                  <input
                    type="text"
                    required
                    placeholder="0300-1234567"
                    value={teacherForm.mobile_number}
                    onChange={e => setTeacherForm({ ...teacherForm, mobile_number: e.target.value })}
                    className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-400 focus:outline-hidden"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Teaching Level *</label>
                  <select
                    value={teacherForm.teaching_level}
                    onChange={e => setTeacherForm({ ...teacherForm, teaching_level: e.target.value as any })}
                    className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg"
                  >
                    <option value="Primary">Primary</option>
                    <option value="Middle">Middle</option>
                    <option value="High">High</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Subject Specialization</label>
                  <input
                    type="text"
                    placeholder="e.g. Mathematics, Science"
                    value={teacherForm.subject}
                    onChange={e => setTeacherForm({ ...teacherForm, subject: e.target.value })}
                    className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Designation</label>
                  <input
                    type="text"
                    value={teacherForm.designation}
                    onChange={e => setTeacherForm({ ...teacherForm, designation: e.target.value })}
                    className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Qualification</label>
                  <input
                    type="text"
                    placeholder="e.g. M.Sc Math, B.Ed"
                    value={teacherForm.qualification}
                    onChange={e => setTeacherForm({ ...teacherForm, qualification: e.target.value })}
                    className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">CNIC Number</label>
                  <input
                    type="text"
                    placeholder="35201-1234567-1"
                    value={teacherForm.cnic}
                    onChange={e => setTeacherForm({ ...teacherForm, cnic: e.target.value })}
                    className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg font-mono"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Monthly Salary (Rs.)</label>
                  <input
                    type="number"
                    value={teacherForm.salary}
                    onChange={e => setTeacherForm({ ...teacherForm, salary: Number(e.target.value) })}
                    className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg"
                  />
                </div>

                <div className="sm:col-span-2">
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Address</label>
                  <input
                    type="text"
                    value={teacherForm.address}
                    onChange={e => setTeacherForm({ ...teacherForm, address: e.target.value })}
                    className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Teacher Photo</label>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={e => handlePhotoUpload(e, setTeacherForm)}
                    className="w-full text-xs text-slate-500 file:mr-2 file:py-1.5 file:px-3 file:rounded-lg file:border-0 file:text-xs file:font-semibold file:bg-blue-100 file:text-blue-700 hover:file:bg-blue-200"
                  />
                </div>
              </div>
            </div>
          )}

          {/* 3. OTHER STAFF FORM */}
          {selectedCategory === 'staff' && (
            <div>
              <div className="border-b border-slate-100 pb-3 mb-5 flex items-center justify-between">
                <h3 className="font-bold text-slate-900 text-base flex items-center gap-2">
                  <UserCheck className="w-5 h-5 text-emerald-600" />
                  Support Staff Registration Form
                </h3>
                <span className="text-xs text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-full font-semibold border border-emerald-200">
                  Green Card PVC
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Staff Full Name *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Bashir Ahmed"
                    value={staffForm.full_name}
                    onChange={e => setStaffForm({ ...staffForm, full_name: e.target.value })}
                    className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-400 focus:outline-hidden"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Father's Name</label>
                  <input
                    type="text"
                    value={staffForm.father_name}
                    onChange={e => setStaffForm({ ...staffForm, father_name: e.target.value })}
                    className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Designation *</label>
                  <select
                    value={staffForm.designation}
                    onChange={e => setStaffForm({ ...staffForm, designation: e.target.value })}
                    className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg"
                  >
                    <option value="Clerk">Clerk</option>
                    <option value="Computer Operator">Computer Operator</option>
                    <option value="Security Guard">Security Guard</option>
                    <option value="Peon">Peon</option>
                    <option value="Mali">Mali</option>
                    <option value="PTI">PTI</option>
                    <option value="Driver">Driver</option>
                    <option value="Canteen Worker">Canteen Worker</option>
                    <option value="Sweeper">Sweeper</option>
                    <option value="Other">Other</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Mobile Number *</label>
                  <input
                    type="text"
                    required
                    placeholder="0300-1234567"
                    value={staffForm.mobile}
                    onChange={e => setStaffForm({ ...staffForm, mobile: e.target.value })}
                    className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">CNIC Number</label>
                  <input
                    type="text"
                    placeholder="35201-0000000-0"
                    value={staffForm.cnic}
                    onChange={e => setStaffForm({ ...staffForm, cnic: e.target.value })}
                    className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg font-mono"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Salary (Rs.)</label>
                  <input
                    type="number"
                    value={staffForm.salary}
                    onChange={e => setStaffForm({ ...staffForm, salary: Number(e.target.value) })}
                    className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg"
                  />
                </div>

                <div className="sm:col-span-2">
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Address</label>
                  <input
                    type="text"
                    value={staffForm.address}
                    onChange={e => setStaffForm({ ...staffForm, address: e.target.value })}
                    className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Staff Photo</label>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={e => handlePhotoUpload(e, setStaffForm)}
                    className="w-full text-xs text-slate-500 file:mr-2 file:py-1.5 file:px-3 file:rounded-lg file:border-0 file:text-xs file:font-semibold file:bg-emerald-100 file:text-emerald-700 hover:file:bg-emerald-200"
                  />
                </div>
              </div>
            </div>
          )}

          {/* 4. INVENTORY FORM */}
          {selectedCategory === 'inventory' && (
            <div>
              <div className="border-b border-slate-100 pb-3 mb-5 flex items-center justify-between">
                <h3 className="font-bold text-slate-900 text-base flex items-center gap-2">
                  <Package className="w-5 h-5 text-cyan-600" />
                  School Inventory & Asset Form
                </h3>
                <span className="text-xs text-cyan-700 bg-cyan-50 px-2.5 py-1 rounded-full font-semibold border border-cyan-200">
                  Fixed Asset
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Item Name *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Science Lab Microscope"
                    value={inventoryForm.item_name}
                    onChange={e => setInventoryForm({ ...inventoryForm, item_name: e.target.value })}
                    className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:ring-2 focus:ring-cyan-400 focus:outline-hidden"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Category</label>
                  <select
                    value={inventoryForm.item_category}
                    onChange={e => setInventoryForm({ ...inventoryForm, item_category: e.target.value })}
                    className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg"
                  >
                    <option value="Furniture">Furniture</option>
                    <option value="Electronics">Electronics / IT</option>
                    <option value="Lab Equipment">Lab Equipment</option>
                    <option value="Sports">Sports Equipment</option>
                    <option value="Books / Library">Books / Library</option>
                    <option value="Stationery">Stationery</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Quantity *</label>
                  <input
                    type="number"
                    min="1"
                    required
                    value={inventoryForm.quantity}
                    onChange={e => setInventoryForm({ ...inventoryForm, quantity: Number(e.target.value) })}
                    className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Unit Price (Rs.)</label>
                  <input
                    type="number"
                    value={inventoryForm.purchase_price}
                    onChange={e => setInventoryForm({ ...inventoryForm, purchase_price: Number(e.target.value) })}
                    className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Condition</label>
                  <select
                    value={inventoryForm.item_condition}
                    onChange={e => setInventoryForm({ ...inventoryForm, item_condition: e.target.value as any })}
                    className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg"
                  >
                    <option value="New">New</option>
                    <option value="Good">Good</option>
                    <option value="Damaged">Damaged</option>
                    <option value="Repair Required">Repair Required</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Storage Location</label>
                  <input
                    type="text"
                    value={inventoryForm.location}
                    onChange={e => setInventoryForm({ ...inventoryForm, location: e.target.value })}
                    className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg"
                  />
                </div>

                <div className="sm:col-span-3">
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Description / Supplier Details</label>
                  <textarea
                    rows={2}
                    value={inventoryForm.description}
                    onChange={e => setInventoryForm({ ...inventoryForm, description: e.target.value })}
                    className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg"
                    placeholder="Specifications, warranty, supplier remarks..."
                  />
                </div>
              </div>
            </div>
          )}

          {/* Action Buttons */}
          <div className="pt-4 border-t border-slate-100 flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={onCancel}
              className="px-4 py-2 text-xs font-semibold text-slate-600 hover:text-slate-800 bg-slate-100 hover:bg-slate-200 rounded-xl transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className={`px-6 py-2.5 rounded-xl font-bold text-xs shadow-md transition-all flex items-center gap-2 ${
                selectedCategory === 'student'
                  ? 'bg-amber-500 hover:bg-amber-600 text-slate-950'
                  : selectedCategory === 'teacher'
                  ? 'bg-blue-600 hover:bg-blue-700 text-white'
                  : selectedCategory === 'staff'
                  ? 'bg-emerald-600 hover:bg-emerald-700 text-white'
                  : 'bg-cyan-600 hover:bg-cyan-700 text-white'
              }`}
            >
              {loading ? (
                <span>Saving to Database...</span>
              ) : (
                <>
                  <CheckCircle2 className="w-4 h-4" />
                  <span>Save & Record into System</span>
                </>
              )}
            </button>
          </div>

        </form>
      </div>

    </div>
  );
};
