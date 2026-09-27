import React, { useState } from 'react';
import { apiRequest, setSessionToken } from '../api';
import { School } from '../types';
import {
  GraduationCap,
  Building,
  Lock,
  ArrowRight,
  ShieldCheck,
  AlertCircle,
  Sparkles
} from 'lucide-react';

interface LoginViewProps {
  onLoginSuccess: (school: School) => void;
  onNavigateRegister: () => void;
}

export const LoginView: React.FC<LoginViewProps> = ({ onLoginSuccess, onNavigateRegister }) => {
  const [username, setUsername] = useState('hjamiaschool');
  const [password, setPassword] = useState('admin123');
  const [rememberMe, setRememberMe] = useState(true);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const res = await apiRequest<{ token: string; school: School }>('/api/login', {
        method: 'POST',
        body: JSON.stringify({ username, password })
      });

      setSessionToken(res.token);
      onLoginSuccess(res.school);
    } catch (err: any) {
      setError(err.message || 'Invalid username or password.');
    } finally {
      setLoading(false);
    }
  };

  const handleQuickDemo = async () => {
    setUsername('hjamiaschool');
    setPassword('admin123');
    setLoading(true);
    setError(null);

    try {
      const res = await apiRequest<{ token: string; school: School }>('/api/login', {
        method: 'POST',
        body: JSON.stringify({ username: 'hjamiaschool', password: 'admin123' })
      });

      setSessionToken(res.token);
      onLoginSuccess(res.school);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-linear-to-br from-slate-900 via-blue-950 to-indigo-950 flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl shadow-2xl max-w-md w-full overflow-hidden border border-slate-100">
        
        {/* Urdu Educational Slogan Banner */}
        <div className="bg-blue-50 border-b border-blue-100 p-3 text-center" dir="rtl">
          <span className="font-serif text-blue-900 font-bold text-sm">
            "تعلیم روشنی ہے، کردار کامیابی کی پہچان ہے"
          </span>
        </div>

        <div className="p-6 sm:p-8">
          {/* Logo and Title */}
          <div className="text-center mb-6">
            <div className="w-14 h-14 rounded-2xl bg-blue-600 text-white flex items-center justify-center mx-auto mb-3 shadow-md shadow-blue-500/30">
              <GraduationCap className="w-8 h-8" />
            </div>
            <h2 className="text-xl font-black text-slate-900 uppercase tracking-tight">SMART SCHOOL</h2>
            <p className="text-xs text-slate-500 mt-0.5">Multi-Tenant Management System • Multi-Device Access</p>
          </div>

          {error && (
            <div className="mb-4 p-3 rounded-xl bg-rose-50 text-rose-800 border border-rose-200 text-xs flex items-center gap-2 font-medium">
              <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {/* Quick Demo Login Preset Button */}
          <div className="mb-4">
            <button
              type="button"
              onClick={handleQuickDemo}
              className="w-full py-2 px-3 rounded-xl bg-amber-50 hover:bg-amber-100 border border-amber-300 text-amber-900 text-xs font-bold flex items-center justify-center gap-2 transition-colors shadow-2xs"
            >
              <Sparkles className="w-4 h-4 text-amber-600" />
              <span>1-Click Head Admin Login (Hjamia Model School)</span>
            </button>
          </div>

          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">School Name / Username *</label>
              <div className="relative">
                <Building className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  required
                  placeholder="e.g. hjamiaschool"
                  value={username}
                  onChange={e => setUsername(e.target.value)}
                  className="w-full pl-9 pr-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-hidden focus:bg-white focus:border-blue-500"
                />
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="block text-xs font-semibold text-slate-700">Password *</label>
                <button
                  type="button"
                  onClick={() => alert('Default demo password is: admin123\nIn production, password reset is handled via hosting phpMyAdmin or email.')}
                  className="text-[11px] text-blue-600 hover:text-blue-800 font-medium"
                >
                  Forgot Password?
                </button>
              </div>
              <div className="relative">
                <Lock className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="password"
                  required
                  placeholder="••••••••"
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  className="w-full pl-9 pr-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-hidden focus:bg-white focus:border-blue-500"
                />
              </div>
            </div>

            <div className="flex items-center">
              <input
                type="checkbox"
                id="rememberMe"
                checked={rememberMe}
                onChange={e => setRememberMe(e.target.checked)}
                className="w-3.5 h-3.5 rounded-sm text-blue-600 focus:ring-blue-500 border-slate-300"
              />
              <label htmlFor="rememberMe" className="ml-2 text-xs text-slate-600">
                Remember Me on this device
              </label>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs shadow-md shadow-blue-500/20 flex items-center justify-center gap-1.5 transition-transform active:scale-95"
            >
              {loading ? (
                <span>Authenticating with MySQL...</span>
              ) : (
                <>
                  <span>Log In to School Dashboard</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>

          {/* Footer Registration Link */}
          <div className="mt-6 pt-4 border-t border-slate-100 text-center">
            <p className="text-xs text-slate-500">
              Need to register a new school?{' '}
              <button
                type="button"
                onClick={onNavigateRegister}
                className="font-bold text-blue-600 hover:text-blue-800 hover:underline"
              >
                Create School Account
              </button>
            </p>
          </div>

        </div>

      </div>
    </div>
  );
};
