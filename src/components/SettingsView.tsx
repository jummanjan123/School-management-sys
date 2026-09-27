import React, { useState, useEffect } from 'react';
import { apiRequest, formatCurrency } from '../api';
import { School, SchoolClass } from '../types';
import {
  Settings,
  Building,
  Save,
  Plus,
  Trash2,
  Lock,
  Download,
  CheckCircle2,
  AlertCircle
} from 'lucide-react';

interface SettingsViewProps {
  school: School;
  onUpdateSchool: (updated: School) => void;
}

export const SettingsView: React.FC<SettingsViewProps> = ({ school, onUpdateSchool }) => {
  const [profileForm, setProfileForm] = useState({
    name: school.name,
    phone: school.phone || '',
    email: school.email || '',
    address: school.address || '',
    head_name: school.head_name || 'Principal',
    academic_session: school.academic_session || '2025-2026',
    urdu_slogan: school.urdu_slogan || 'تعلیم روشنی ہے، کردار کامیابی کی پہچان ہے',
    logo_path: school.logo_path || '',
    signature_path: school.signature_path || '',
    stamp_path: school.stamp_path || ''
  });

  const [classes, setClasses] = useState<SchoolClass[]>([]);
  const [newClassName, setNewClassName] = useState('');
  const [newClassFee, setNewClassFee] = useState(2500);

  const [passwords, setPasswords] = useState({ current: '', new: '', confirm: '' });
  const [msg, setMsg] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [loading, setLoading] = useState(false);

  const loadClasses = () => {
    apiRequest<SchoolClass[]>('/api/classes').then(setClasses);
  };

  useEffect(() => {
    loadClasses();
  }, []);

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>, field: string) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setProfileForm(prev => ({ ...prev, [field]: reader.result as string }));
      };
      reader.readAsDataURL(file);
    }
  };

  const handleProfileSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setMsg(null);
    try {
      const res = await apiRequest('/api/settings', {
        method: 'POST',
        body: JSON.stringify(profileForm)
      });
      onUpdateSchool(res.school);
      setMsg({ type: 'success', text: 'School profile, branding and Urdu slogan successfully saved!' });
    } catch (err: any) {
      setMsg({ type: 'error', text: err.message || 'Error updating settings' });
    } finally {
      setLoading(false);
    }
  };

  const handleAddClass = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newClassName.trim()) return;
    try {
      await apiRequest('/api/classes', {
        method: 'POST',
        body: JSON.stringify({
          name: newClassName.trim(),
          numeric_order: classes.length + 1,
          monthly_fee: newClassFee
        })
      });
      setNewClassName('');
      loadClasses();
    } catch (err: any) {
      alert(err.message || 'Error adding class');
    }
  };

  const handleDownloadBackup = async () => {
    try {
      const [teachers, students, staff, inventory, fees, attendance] = await Promise.all([
        apiRequest('/api/teachers'),
        apiRequest('/api/students'),
        apiRequest('/api/staff'),
        apiRequest('/api/inventory'),
        apiRequest('/api/fees'),
        apiRequest('/api/attendance/student')
      ]);

      const backup = {
        exported_at: new Date().toISOString(),
        school,
        classes,
        teachers,
        students,
        staff,
        inventory,
        fees,
        attendance
      };

      const blob = new Blob([JSON.stringify(backup, null, 2)], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `school_backup_${school.username}_${new Date().toISOString().slice(0, 10)}.json`;
      a.click();
      URL.revokeObjectURL(url);
    } catch (err: any) {
      alert(err.message || 'Error creating backup');
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-xl font-bold text-slate-900 tracking-tight">Institutional Profile & Settings</h2>
        <p className="text-xs text-slate-500">Configure school branding, Urdu educational slogan, classes, and system backups.</p>
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

      {/* Profile & Branding Form */}
      <div className="bg-white rounded-2xl border border-slate-200 p-6 md:p-8 shadow-xs">
        <h3 className="font-bold text-slate-900 text-sm mb-4 border-b border-slate-100 pb-2 flex items-center gap-2">
          <Building className="w-4 h-4 text-blue-600" />
          Official School Branding & Credentials
        </h3>

        <form onSubmit={handleProfileSubmit} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="sm:col-span-2">
              <label className="block text-xs font-semibold text-slate-700 mb-1">Official School Name *</label>
              <input
                type="text"
                required
                value={profileForm.name}
                onChange={e => setProfileForm({ ...profileForm, name: e.target.value })}
                className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-400 focus:outline-hidden"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Academic Session</label>
              <input
                type="text"
                value={profileForm.academic_session}
                onChange={e => setProfileForm({ ...profileForm, academic_session: e.target.value })}
                className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg"
              />
            </div>
          </div>

          {/* Urdu Educational Slogan */}
          <div>
            <div className="flex items-center justify-between mb-1">
              <label className="block text-xs font-semibold text-slate-700">Urdu Educational Slogan (Certificates, Cards, Top Bar)</label>
              <span className="font-serif text-blue-700 text-xs font-bold" dir="rtl">تعلیمی سلوگن</span>
            </div>
            <input
              type="text"
              value={profileForm.urdu_slogan}
              onChange={e => setProfileForm({ ...profileForm, urdu_slogan: e.target.value })}
              className="w-full px-3 py-2 text-sm font-serif font-bold text-blue-900 border border-slate-300 rounded-lg text-right"
              dir="rtl"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Headmaster / Principal Name</label>
              <input
                type="text"
                value={profileForm.head_name}
                onChange={e => setProfileForm({ ...profileForm, head_name: e.target.value })}
                className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Official Phone Contact</label>
              <input
                type="text"
                value={profileForm.phone}
                onChange={e => setProfileForm({ ...profileForm, phone: e.target.value })}
                className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Campus Physical Address</label>
            <input
              type="text"
              value={profileForm.address}
              onChange={e => setProfileForm({ ...profileForm, address: e.target.value })}
              className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg"
            />
          </div>

          {/* File Uploads */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-2">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Custom School Logo</label>
              <input
                type="file"
                accept="image/*"
                onChange={e => handleFileUpload(e, 'logo_path')}
                className="w-full text-[11px] text-slate-500 file:mr-2 file:py-1 file:px-2 file:rounded-md file:border-0 file:text-[11px] file:bg-blue-50 file:text-blue-700"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Head Signature</label>
              <input
                type="file"
                accept="image/*"
                onChange={e => handleFileUpload(e, 'signature_path')}
                className="w-full text-[11px] text-slate-500 file:mr-2 file:py-1 file:px-2 file:rounded-md file:border-0 file:text-[11px] file:bg-blue-50 file:text-blue-700"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">School Seal Stamp</label>
              <input
                type="file"
                accept="image/*"
                onChange={e => handleFileUpload(e, 'stamp_path')}
                className="w-full text-[11px] text-slate-500 file:mr-2 file:py-1 file:px-2 file:rounded-md file:border-0 file:text-[11px] file:bg-blue-50 file:text-blue-700"
              />
            </div>
          </div>

          <div className="pt-3 border-t border-slate-100 flex justify-end">
            <button
              type="submit"
              disabled={loading}
              className="px-6 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs shadow-xs flex items-center gap-1.5"
            >
              <Save className="w-4 h-4" />
              <span>Save Institutional Profile</span>
            </button>
          </div>
        </form>
      </div>

      {/* Class Configuration */}
      <div className="bg-white rounded-2xl border border-slate-200 p-6 md:p-8 shadow-xs">
        <h3 className="font-bold text-slate-900 text-sm mb-4 border-b border-slate-100 pb-2">
          Academic Classes & Tuition Fee Structure
        </h3>

        {/* Add Class Form */}
        <form onSubmit={handleAddClass} className="flex flex-wrap items-end gap-3 mb-4">
          <div className="flex-1 min-w-[180px]">
            <label className="block text-xs font-semibold text-slate-700 mb-1">Class Name</label>
            <input
              type="text"
              required
              placeholder="e.g. Class 11 (F.Sc)"
              value={newClassName}
              onChange={e => setNewClassName(e.target.value)}
              className="w-full px-3 py-1.5 text-xs border border-slate-300 rounded-lg"
            />
          </div>

          <div className="w-36">
            <label className="block text-xs font-semibold text-slate-700 mb-1">Monthly Fee (Rs.)</label>
            <input
              type="number"
              required
              value={newClassFee}
              onChange={e => setNewClassFee(Number(e.target.value))}
              className="w-full px-3 py-1.5 text-xs border border-slate-300 rounded-lg"
            />
          </div>

          <button
            type="submit"
            className="px-4 py-2 rounded-lg bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold text-xs flex items-center gap-1 shadow-xs"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Add Class</span>
          </button>
        </form>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
          {classes.map(c => (
            <div key={c.id} className="p-3 bg-slate-50 border border-slate-200 rounded-xl flex items-center justify-between">
              <div>
                <div className="font-bold text-slate-900 text-xs">{c.name}</div>
                <div className="text-[11px] text-emerald-700 font-semibold">{formatCurrency(c.monthly_fee)}/mo</div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Backup and Data Export */}
      <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs flex items-center justify-between">
        <div>
          <h4 className="font-bold text-slate-800 text-sm flex items-center gap-2">
            <Download className="w-4 h-4 text-emerald-600" />
            Institutional Backup Archive
          </h4>
          <p className="text-xs text-slate-500">
            Export a full JSON backup of all registered students, faculty, staff, fee ledgers, and attendance records.
          </p>
        </div>
        <button
          onClick={handleDownloadBackup}
          className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shadow-xs flex items-center gap-1.5"
        >
          <Download className="w-4 h-4" />
          <span>Download Backup JSON</span>
        </button>
      </div>

    </div>
  );
};
