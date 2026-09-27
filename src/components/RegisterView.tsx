import React, { useState } from 'react';
import { apiRequest } from '../api';
import {
  GraduationCap,
  Building,
  User,
  Phone,
  Lock,
  ArrowLeft,
  CheckCircle2,
  AlertCircle
} from 'lucide-react';

interface RegisterViewProps {
  onSuccess: () => void;
  onNavigateLogin: () => void;
}

export const RegisterView: React.FC<RegisterViewProps> = ({ onSuccess, onNavigateLogin }) => {
  const [formData, setFormData] = useState({
    school_name: '',
    username: '',
    password: '',
    confirm_password: '',
    phone: '',
    head_name: '',
    address: ''
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (formData.password !== formData.confirm_password) {
      setError('Passwords do not match. Please re-enter.');
      return;
    }

    if (formData.password.length < 6) {
      setError('Password must be at least 6 characters.');
      return;
    }

    try {
      setLoading(true);
      await apiRequest('/api/register', {
        method: 'POST',
        body: JSON.stringify(formData)
      });
      alert('School registered successfully! You can now log in.');
      onSuccess();
    } catch (err: any) {
      setError(err.message || 'Registration failed.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-linear-to-br from-slate-900 via-blue-950 to-indigo-950 flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl shadow-2xl max-w-lg w-full p-6 sm:p-8 border border-slate-100">
        
        <div className="text-center mb-6">
          <div className="w-12 h-12 rounded-2xl bg-blue-600 text-white flex items-center justify-center mx-auto mb-2 shadow-md shadow-blue-500/30">
            <GraduationCap className="w-7 h-7" />
          </div>
          <h2 className="text-xl font-black text-slate-900 uppercase tracking-tight">Register New School</h2>
          <p className="text-xs text-slate-500 mt-0.5">Multi-tenant isolation • Separate MySQL data storage</p>
        </div>

        {error && (
          <div className="mb-4 p-3 rounded-xl bg-rose-50 text-rose-800 border border-rose-200 text-xs flex items-center gap-2 font-medium">
            <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-3.5">
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Official School Name *</label>
            <input
              type="text"
              required
              placeholder="e.g. Cambridge Model School"
              value={formData.school_name}
              onChange={e => setFormData({ ...formData, school_name: e.target.value })}
              className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-hidden focus:bg-white focus:border-blue-500"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">School Login / Username *</label>
              <input
                type="text"
                required
                placeholder="e.g. cambridgeschool"
                value={formData.username}
                onChange={e => setFormData({ ...formData, username: e.target.value })}
                className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-hidden focus:bg-white focus:border-blue-500"
              />
              <span className="text-[10px] text-slate-400">Lowercase, numbers, and hyphens</span>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Head / Principal Name</label>
              <input
                type="text"
                placeholder="e.g. Prof. Tariq Mahmood"
                value={formData.head_name}
                onChange={e => setFormData({ ...formData, head_name: e.target.value })}
                className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-hidden"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Contact Phone</label>
              <input
                type="text"
                placeholder="0300-1234567"
                value={formData.phone}
                onChange={e => setFormData({ ...formData, phone: e.target.value })}
                className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-hidden"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Campus City / Address</label>
              <input
                type="text"
                placeholder="City / Location"
                value={formData.address}
                onChange={e => setFormData({ ...formData, address: e.target.value })}
                className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-hidden"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Admin Password *</label>
              <input
                type="password"
                required
                placeholder="Min 6 characters"
                value={formData.password}
                onChange={e => setFormData({ ...formData, password: e.target.value })}
                className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-hidden focus:bg-white focus:border-blue-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Confirm Password *</label>
              <input
                type="password"
                required
                placeholder="Repeat password"
                value={formData.confirm_password}
                onChange={e => setFormData({ ...formData, confirm_password: e.target.value })}
                className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-hidden focus:bg-white focus:border-blue-500"
              />
            </div>
          </div>

          <div className="pt-2">
            <button
              type="submit"
              disabled={loading}
              className="w-full py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs shadow-md shadow-blue-500/20 flex items-center justify-center gap-1.5 transition-transform active:scale-95"
            >
              {loading ? (
                <span>Registering School Database...</span>
              ) : (
                <>
                  <CheckCircle2 className="w-4 h-4" />
                  <span>Register School & Activate Account</span>
                </>
              )}
            </button>
          </div>
        </form>

        <div className="mt-5 pt-3 border-t border-slate-100 text-center">
          <button
            type="button"
            onClick={onNavigateLogin}
            className="text-xs font-semibold text-slate-600 hover:text-blue-600 inline-flex items-center gap-1"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Already have a school account? Log In</span>
          </button>
        </div>

      </div>
    </div>
  );
};
