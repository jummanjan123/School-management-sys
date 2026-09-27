import React, { useState, useEffect } from 'react';
import { apiRequest, clearSessionToken, getSessionToken } from './api';
import { School } from './types';
import { Navbar } from './components/Navbar';
import { Sidebar } from './components/Sidebar';
import { DashboardView } from './components/DashboardView';
import { UniversalAddView } from './components/UniversalAddView';
import { StudentsView } from './components/StudentsView';
import { TeachersView } from './components/TeachersView';
import { StaffView } from './components/StaffView';
import { InventoryView } from './components/InventoryView';
import { AttendanceView } from './components/AttendanceView';
import { FeesView } from './components/FeesView';
import { IdCardsView } from './components/IdCardsView';
import { CharacterCertView } from './components/CharacterCertView';
import { LeavingCertView } from './components/LeavingCertView';
import { ReportsView } from './components/ReportsView';
import { SettingsView } from './components/SettingsView';
import { HostingerHubView } from './components/HostingerHubView';
import { LoginView } from './components/LoginView';
import { RegisterView } from './components/RegisterView';

export default function App() {
  const [currentSchool, setCurrentSchool] = useState<School | null>(null);
  const [authChecking, setAuthChecking] = useState(true);
  const [authView, setAuthView] = useState<'login' | 'register'>('login');

  const [currentTab, setCurrentTab] = useState<string>('dashboard');
  const [navExtra, setNavExtra] = useState<any>(null);
  const [sidebarOpen, setSidebarOpen] = useState(false);

  // Check auth session
  useEffect(() => {
    const token = getSessionToken();
    if (!token) {
      setAuthChecking(false);
      return;
    }

    apiRequest<School>('/api/me')
      .then(school => {
        setCurrentSchool(school);
      })
      .catch(() => {
        clearSessionToken();
        setCurrentSchool(null);
      })
      .finally(() => {
        setAuthChecking(false);
      });

    const onAuthChange = () => {
      setCurrentSchool(null);
    };
    window.addEventListener('auth_state_changed', onAuthChange);
    return () => window.removeEventListener('auth_state_changed', onAuthChange);
  }, []);

  const handleLogout = async () => {
    try {
      await apiRequest('/api/logout', { method: 'POST' });
    } catch (e) {
      // ignore
    }
    clearSessionToken();
    setCurrentSchool(null);
    setCurrentTab('dashboard');
  };

  const handleNavigate = (tab: string, extra?: any) => {
    setCurrentTab(tab);
    setNavExtra(extra || null);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  if (authChecking) {
    return (
      <div className="min-h-screen bg-slate-900 flex flex-col items-center justify-center text-white">
        <div className="w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mb-4" />
        <p className="text-xs font-semibold text-slate-400">Loading Smart School System...</p>
      </div>
    );
  }

  if (!currentSchool) {
    if (authView === 'register') {
      return (
        <RegisterView
          onSuccess={() => setAuthView('login')}
          onNavigateLogin={() => setAuthView('login')}
        />
      );
    }
    return (
      <LoginView
        onLoginSuccess={school => {
          setCurrentSchool(school);
          setCurrentTab('dashboard');
        }}
        onNavigateRegister={() => setAuthView('register')}
      />
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col font-sans">
      <div className="flex flex-1">
        {/* Responsive Sidebar */}
        <Sidebar
          currentTab={currentTab}
          onSelectTab={tab => handleNavigate(tab)}
          isOpen={sidebarOpen}
          onClose={() => setSidebarOpen(false)}
          onLogout={handleLogout}
        />

        {/* Main Content Area */}
        <div className="flex-1 flex flex-col min-w-0">
          <Navbar
            school={currentSchool}
            onLogout={handleLogout}
            onNavigate={handleNavigate}
            onToggleSidebar={() => setSidebarOpen(prev => !prev)}
          />

          <main className="flex-1 p-4 sm:p-6 lg:p-8 max-w-7xl w-full mx-auto">
            {currentTab === 'dashboard' && (
              <DashboardView school={currentSchool} onNavigate={handleNavigate} />
            )}

            {currentTab === 'universal_add' && (
              <UniversalAddView
                initialType={navExtra?.type || 'student'}
                onSuccess={targetTab => handleNavigate(targetTab)}
                onCancel={() => handleNavigate('dashboard')}
              />
            )}

            {currentTab === 'students' && (
              <StudentsView onNavigate={handleNavigate} />
            )}

            {currentTab === 'teachers' && (
              <TeachersView onNavigate={handleNavigate} />
            )}

            {currentTab === 'staff' && (
              <StaffView onNavigate={handleNavigate} />
            )}

            {currentTab === 'inventory' && (
              <InventoryView onNavigate={handleNavigate} />
            )}

            {currentTab === 'attendance' && (
              <AttendanceView />
            )}

            {currentTab === 'fees' && (
              <FeesView
                school={currentSchool}
                initialTab={navExtra?.tab || 'ledger'}
                initialStudentId={navExtra?.studentId}
              />
            )}

            {currentTab === 'id_cards' && (
              <IdCardsView
                school={currentSchool}
                initialType={navExtra?.type || 'student'}
                initialId={navExtra?.id}
              />
            )}

            {currentTab === 'character_cert' && (
              <CharacterCertView
                school={currentSchool}
                initialStudentId={navExtra?.studentId}
              />
            )}

            {currentTab === 'leaving_cert' && (
              <LeavingCertView
                school={currentSchool}
                initialStudentId={navExtra?.studentId}
              />
            )}

            {currentTab === 'reports' && (
              <ReportsView school={currentSchool} onNavigate={handleNavigate} />
            )}

            {currentTab === 'settings' && (
              <SettingsView
                school={currentSchool}
                onUpdateSchool={upd => setCurrentSchool(upd)}
              />
            )}

            {currentTab === 'hostinger_hub' && (
              <HostingerHubView />
            )}
          </main>

          {/* Footer */}
          <footer className="bg-white border-t border-slate-200 py-3 px-6 text-center text-xs text-slate-500 print:hidden flex flex-col sm:flex-row items-center justify-between gap-2">
            <div>
              &copy; {new Date().getFullYear()} <strong>{currentSchool.name}</strong>. All rights reserved.
            </div>
            <div>
              Academic Session: <strong className="text-slate-700">{currentSchool.academic_session}</strong> • Multi-Device MySQL Verified
            </div>
          </footer>
        </div>
      </div>
    </div>
  );
}
