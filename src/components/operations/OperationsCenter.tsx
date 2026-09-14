import React, { useState, useEffect } from 'react';
import {
  Shield,
  LayoutDashboard,
  Users,
  ShieldCheck,
  AlertOctagon,
  FileCheck,
  LifeBuoy,
  Bell,
  Sliders,
  UserCheck,
  FileText,
  TrendingUp,
  Activity,
  LogOut,
  ArrowLeft,
  Lock,
  CheckCircle2,
  AlertTriangle,
  RefreshCw,
  KeyRound,
  ShieldAlert,
} from 'lucide-react';
import {
  OperationsSection,
  PlatformStatus,
  PlatformStatusRecord,
  PlatformStatusHistoryEntry,
  AdminUser,
  AuditLogEntry,
  ReportRecord,
  SupportTicket,
  OperationsNotification,
  PlatformSettings,
  UserProfile,
  WorkRecord,
} from '../../types';
import { operationsService, ROOT_ADMIN_EMAIL } from '../../services/operationsService';
import { db } from '../../services/db';

// Import Section Components
import { OverviewSection } from './sections/OverviewSection';
import { UsersSection } from './sections/UsersSection';
import { ModerationSection } from './sections/ModerationSection';
import { ReportsSection } from './sections/ReportsSection';
import { ContentSection } from './sections/ContentSection';
import { SupportSection } from './sections/SupportSection';
import { NotificationsSection } from './sections/NotificationsSection';
import { SettingsSection } from './sections/SettingsSection';
import { RolesSection } from './sections/RolesSection';
import { AuditLogsSection } from './sections/AuditLogsSection';
import { AnalyticsSection } from './sections/AnalyticsSection';
import { HealthSection } from './sections/HealthSection';

interface OperationsCenterProps {
  currentUser: UserProfile | null;
  onExitToApp: () => void;
}

export const OperationsCenter: React.FC<OperationsCenterProps> = ({
  currentUser,
  onExitToApp,
}) => {
  const [activeSection, setActiveSection] = useState<OperationsSection>('overview');

  // State
  const [platformStatus, setPlatformStatus] = useState<PlatformStatusRecord>(
    operationsService.getPlatformStatus()
  );
  const [statusHistory, setStatusHistory] = useState<PlatformStatusHistoryEntry[]>(
    operationsService.getStatusHistory()
  );
  const [adminUsers, setAdminUsers] = useState<AdminUser[]>(operationsService.getAdminUsers());
  const [auditLogs, setAuditLogs] = useState<AuditLogEntry[]>(operationsService.getAuditLogs());
  const [supportTickets, setSupportTickets] = useState<SupportTicket[]>(
    operationsService.getSupportTickets()
  );
  const [notifications, setNotifications] = useState<OperationsNotification[]>(
    operationsService.getNotifications()
  );
  const [platformSettings, setPlatformSettings] = useState<PlatformSettings>(
    operationsService.getSettings()
  );

  const [allUsers, setAllUsers] = useState<UserProfile[]>([]);
  const [allRecords, setAllRecords] = useState<WorkRecord[]>([]);
  const [allReports, setAllReports] = useState<ReportRecord[]>([]);

  // Elevation / Access Gate State
  const [isAuthorized, setIsAuthorized] = useState<boolean>(false);
  const [activeAdminProfile, setActiveAdminProfile] = useState<AdminUser | null>(null);
  const [elevationInput, setElevationInput] = useState('');
  const [elevationError, setElevationError] = useState<string | null>(null);
  const [isElevating, setIsElevating] = useState(false);

  // Load and refresh core data
  const loadData = () => {
    setPlatformStatus(operationsService.getPlatformStatus());
    setStatusHistory(operationsService.getStatusHistory());
    setAdminUsers(operationsService.getAdminUsers());
    setAuditLogs(operationsService.getAuditLogs());
    setSupportTickets(operationsService.getSupportTickets());
    setNotifications(operationsService.getNotifications());
    setPlatformSettings(operationsService.getSettings());
    setAllUsers(db.getUsers());
    setAllRecords(db.getAllWorkRecords());
    setAllReports(db.getAllReports());

    // Check authorization
    const authResult = operationsService.checkAdminAuthorization(currentUser);
    if (authResult.isAuthorized) {
      setIsAuthorized(true);
      setActiveAdminProfile(authResult.adminProfile || null);
    } else {
      setIsAuthorized(false);
      setActiveAdminProfile(null);
    }
  };

  useEffect(() => {
    loadData();

    // Subscribe to real-time events
    const unsubStatus = operationsService.subscribeToPlatformStatus((newRecord) => {
      setPlatformStatus(newRecord);
      setStatusHistory(operationsService.getStatusHistory());
    });

    const unsubLogs = operationsService.subscribeToAuditLogs(() => {
      setAuditLogs(operationsService.getAuditLogs());
    });

    return () => {
      unsubStatus();
      unsubLogs();
    };
  }, [currentUser]);

  // Elevation Handler for Root Super Admin (oyebanjiisrael60@gmail.com)
  const handleElevateAsRoot = () => {
    setIsElevating(true);
    setElevationError(null);

    try {
      operationsService.setElevatedAdminSession(ROOT_ADMIN_EMAIL, 'super_admin');
      const rootAdmin = operationsService.getAdminUsers().find(
        (a) => a.email.toLowerCase() === ROOT_ADMIN_EMAIL.toLowerCase()
      ) || {
        id: 'admin_root_1',
        email: ROOT_ADMIN_EMAIL,
        fullName: 'Israel Oyebanji',
        role: 'super_admin',
        active: true,
        addedAt: new Date().toISOString(),
        addedBy: 'SYSTEM',
      };

      operationsService.logAuditEvent({
        action: 'ADMIN_ELEVATED_SESSION_START',
        category: 'security',
        actorEmail: ROOT_ADMIN_EMAIL,
        actorName: 'Israel Oyebanji',
        actorId: rootAdmin.id,
        targetType: 'SESSION',
        targetId: 'admin_elevation',
        details: 'Root Super Admin access session established for Operations Center',
      });

      setIsAuthorized(true);
      setActiveAdminProfile(rootAdmin);
      loadData();
    } catch (err) {
      setElevationError('Elevation failed.');
    } finally {
      setIsElevating(false);
    }
  };

  const handleCustomAdminLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setElevationError(null);
    const email = elevationInput.trim().toLowerCase();

    if (!email || !email.includes('@')) {
      setElevationError('Please enter a valid administrator email address.');
      return;
    }

    const matched = adminUsers.find((a) => a.email.toLowerCase() === email && a.active);
    if (!matched && email !== ROOT_ADMIN_EMAIL.toLowerCase()) {
      setElevationError(`Access denied: "${email}" is not an authorized administrator on Sabi.`);
      return;
    }

    const role = matched?.role || 'super_admin';
    operationsService.setElevatedAdminSession(email, role);

    const adminProfile = matched || {
      id: 'admin_root_1',
      email: ROOT_ADMIN_EMAIL,
      fullName: 'Israel Oyebanji',
      role: 'super_admin',
      active: true,
      addedAt: new Date().toISOString(),
      addedBy: 'SYSTEM',
    };

    operationsService.logAuditEvent({
      action: 'ADMIN_SESSION_LOGIN',
      category: 'security',
      actorEmail: email,
      actorName: adminProfile.fullName,
      actorId: adminProfile.id,
      targetType: 'SESSION',
      targetId: 'admin_login',
      details: `Administrator logged into Sabi Operations Center with role: ${role}`,
    });

    setIsAuthorized(true);
    setActiveAdminProfile(adminProfile);
    loadData();
  };

  const handleDeElevate = () => {
    operationsService.clearElevatedAdminSession();
    setIsAuthorized(false);
    setActiveAdminProfile(null);
    onExitToApp();
  };

  // Sections navigation config
  const navSections: { id: OperationsSection; label: string; icon: React.ComponentType<{ className?: string }> }[] = [
    { id: 'overview', label: 'Overview', icon: LayoutDashboard },
    { id: 'users', label: 'Users', icon: Users },
    { id: 'moderation', label: 'Moderation', icon: ShieldCheck },
    { id: 'reports', label: 'Reports', icon: AlertOctagon },
    { id: 'content', label: 'Content & Distribution', icon: FileCheck },
    { id: 'support', label: 'Support', icon: LifeBuoy },
    { id: 'notifications', label: 'Notifications', icon: Bell },
    { id: 'settings', label: 'Platform Settings', icon: Sliders },
    { id: 'roles', label: 'Admin Roles', icon: UserCheck },
    { id: 'audit-logs', label: 'Audit Logs', icon: FileText },
    { id: 'analytics', label: 'Analytics', icon: TrendingUp },
    { id: 'system-health', label: 'System Health', icon: Activity },
  ];

  // --------------------------------------------------------------------------
  // ACCESS RESTRICTED GATE SCREEN
  // --------------------------------------------------------------------------
  if (!isAuthorized) {
    return (
      <div className="min-h-screen bg-[#FBF9F5] flex flex-col justify-between p-6 text-[#16222F]">
        <div className="max-w-4xl mx-auto w-full flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-[#2D4D45] text-white font-serif font-black flex items-center justify-center text-base">
              S
            </div>
            <span className="font-serif font-bold text-lg tracking-tight text-[#16222F]">
              SABI
            </span>
          </div>

          <button
            onClick={onExitToApp}
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#52606D] hover:text-[#16222F] cursor-pointer"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Return to Sabi App</span>
          </button>
        </div>

        <div className="max-w-md mx-auto w-full my-auto py-12 space-y-6">
          <div className="bg-white rounded-2xl border border-[#E7E2D8] p-8 shadow-xl space-y-6 text-center">
            <div className="w-14 h-14 rounded-2xl bg-[#EAF3EF] border border-[#CFE2D9] text-[#2D4D45] flex items-center justify-center mx-auto shadow-xs">
              <Lock className="w-7 h-7" />
            </div>

            <div className="space-y-1.5">
              <h2 className="text-2xl font-black font-serif text-[#16222F] tracking-tight">
                Operations Center
              </h2>
              <p className="text-xs text-[#52606D] leading-relaxed">
                Restricted administrative zone. Access is strictly logged and reserved for authorized Sabi operations personnel.
              </p>
            </div>

            {elevationError && (
              <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-xs flex items-start gap-2 text-left">
                <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5 text-rose-600" />
                <span>{elevationError}</span>
              </div>
            )}

            {/* Quick Elevation for Primary Owner */}
            <div className="p-4 rounded-xl bg-[#FAF8F5] border border-[#E7E2D8] space-y-2 text-left">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-[#16222F]">Root Super Administrator</span>
                <span className="text-[10px] font-mono font-bold text-[#2D4D45] bg-[#EAF3EF] px-1.5 py-0.5 rounded">
                  OWNER
                </span>
              </div>
              <p className="text-[11px] text-[#7A8690] truncate">
                {ROOT_ADMIN_EMAIL} (Israel Oyebanji)
              </p>
              <button
                onClick={handleElevateAsRoot}
                disabled={isElevating}
                className="w-full mt-2 py-2 px-3 rounded-xl bg-[#2D4D45] hover:bg-[#223B35] text-white text-xs font-bold transition-all flex items-center justify-center gap-2 cursor-pointer shadow-xs active:scale-95"
              >
                <KeyRound className="w-3.5 h-3.5 text-[#A8D5C8]" />
                <span>Authenticate as System Owner</span>
              </button>
            </div>

            {/* Staff Email Login */}
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-[#E7E2D8]" />
              </div>
              <div className="relative flex justify-center text-[10px] uppercase font-bold text-[#7A8690]">
                <span className="bg-white px-2">Or Staff Email Access</span>
              </div>
            </div>

            <form onSubmit={handleCustomAdminLogin} className="space-y-3 text-left">
              <div>
                <label className="block text-xs font-bold text-[#16222F] mb-1">
                  Authorized Admin Email
                </label>
                <input
                  type="email"
                  value={elevationInput}
                  onChange={(e) => setElevationInput(e.target.value)}
                  placeholder="admin@sabi.id"
                  className="w-full px-3 py-2 text-xs border border-[#D5CEC2] rounded-xl focus:border-[#2D4D45] focus:outline-none bg-[#FAF8F5]/50"
                  required
                />
              </div>

              <button
                type="submit"
                className="w-full py-2 px-3 rounded-xl border border-[#D5CEC2] hover:bg-stone-100 text-[#16222F] text-xs font-bold transition-colors cursor-pointer"
              >
                Verify & Enter
              </button>
            </form>
          </div>
        </div>

        <div className="max-w-4xl mx-auto w-full text-center text-xs text-[#7A8690]">
          <p>Sabi Security & Operational Integrity Infrastructure</p>
        </div>
      </div>
    );
  }

  // --------------------------------------------------------------------------
  // AUTHENTICATED MASTER OPERATIONS CENTER SHELL
  // --------------------------------------------------------------------------
  return (
    <div className="min-h-screen bg-[#FBF9F5] text-[#16222F] flex flex-col antialiased">
      {/* Top Operations Header */}
      <header className="bg-white border-b border-[#E7E2D8] sticky top-0 z-30 shadow-2xs">
        <div className="px-4 sm:px-6 py-3 flex items-center justify-between gap-4">
          {/* Logo & Section Title */}
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-[#2D4D45] text-white font-serif font-black flex items-center justify-center text-base shadow-xs">
              S
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-serif font-bold text-sm tracking-tight text-[#16222F]">
                  SABI
                </span>
                <span className="px-2 py-0.5 rounded-md bg-[#FAF8F5] border border-[#E7E2D8] text-[10px] font-bold text-[#52606D] uppercase tracking-wider">
                  Operations Center
                </span>
              </div>
            </div>
          </div>

          {/* Right Action Group: Platform Status Pill, Officer Identity, Return App */}
          <div className="flex items-center gap-3">
            {/* Live Platform Status Pill */}
            <div
              onClick={() => setActiveSection('overview')}
              className={`px-3 py-1 rounded-full text-xs font-bold border flex items-center gap-1.5 cursor-pointer transition-all hover:scale-102 ${
                platformStatus.status === 'OPERATIONAL'
                  ? 'bg-[#EAF3EF] text-[#2D4D45] border-[#CFE2D9]'
                  : platformStatus.status === 'MAINTENANCE'
                  ? 'bg-amber-50 text-amber-900 border-amber-300'
                  : 'bg-rose-50 text-rose-900 border-rose-300'
              }`}
              title="Click to manage Platform Status"
            >
              <span className={`w-2 h-2 rounded-full animate-pulse ${
                platformStatus.status === 'OPERATIONAL'
                  ? 'bg-[#2D4D45]'
                  : platformStatus.status === 'MAINTENANCE'
                  ? 'bg-amber-500'
                  : 'bg-rose-600'
              }`} />
              <span className="font-mono">{platformStatus.status}</span>
            </div>

            {/* Officer Profile Badge */}
            <div className="hidden sm:flex items-center gap-2 pl-2 border-l border-[#E7E2D8] text-xs">
              <div className="w-7 h-7 rounded-full bg-[#FAF8F5] border border-[#E7E2D8] text-[#2D4D45] font-bold flex items-center justify-center text-xs">
                {activeAdminProfile?.fullName.charAt(0) || 'A'}
              </div>
              <div className="text-left">
                <p className="font-bold text-[#16222F] text-[11px] leading-tight">
                  {activeAdminProfile?.fullName}
                </p>
                <p className="text-[10px] text-[#7A8690] capitalize">
                  {activeAdminProfile?.role.replace('_', ' ')}
                </p>
              </div>
            </div>

            {/* Refresh Button */}
            <button
              onClick={loadData}
              title="Refresh Operations Data"
              className="p-2 rounded-xl text-[#52606D] hover:text-[#16222F] hover:bg-[#FAF8F5] transition-colors cursor-pointer"
            >
              <RefreshCw className="w-4 h-4" />
            </button>

            {/* Exit to Sabi App */}
            <button
              onClick={onExitToApp}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-[#D5CEC2] hover:bg-[#FAF8F5] text-xs font-bold text-[#16222F] transition-colors cursor-pointer"
            >
              <ArrowLeft className="w-3.5 h-3.5 text-[#2D4D45]" />
              <span className="hidden md:inline">Exit to</span>
              <span>Sabi App</span>
            </button>
          </div>
        </div>
      </header>

      {/* Main Workspace Layout (Sidebar + Content Stage) */}
      <div className="flex-1 flex flex-col md:flex-row">
        {/* Operations Sidebar Navigation */}
        <aside className="w-full md:w-64 bg-white border-r border-[#E7E2D8] shrink-0 p-4 space-y-6">
          <div className="space-y-1">
            <span className="px-3 text-[10px] font-bold uppercase tracking-wider text-[#7A8690] block mb-2">
              Operations Control
            </span>

            {navSections.map((section) => {
              const Icon = section.icon;
              const isActive = activeSection === section.id;

              return (
                <button
                  key={section.id}
                  onClick={() => setActiveSection(section.id)}
                  className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-bold transition-all text-left cursor-pointer ${
                    isActive
                      ? 'bg-[#2D4D45] text-white shadow-xs'
                      : 'text-[#52606D] hover:bg-[#FAF8F5] hover:text-[#16222F]'
                  }`}
                >
                  <Icon className={`w-4 h-4 shrink-0 ${isActive ? 'text-[#A8D5C8]' : 'text-[#7A8690]'}`} />
                  <span className="truncate">{section.label}</span>
                </button>
              );
            })}
          </div>

          {/* Session Footer */}
          <div className="pt-4 border-t border-[#E7E2D8] text-[11px] text-[#7A8690] space-y-2">
            <div className="flex items-center justify-between">
              <span>Security Level:</span>
              <span className="font-mono font-bold text-[#2D4D45]">ZERO-TRUST</span>
            </div>
            <button
              onClick={handleDeElevate}
              className="w-full py-1.5 text-center text-xs font-semibold text-rose-700 hover:bg-rose-50 rounded-lg transition-colors cursor-pointer"
            >
              End Admin Session
            </button>
          </div>
        </aside>

        {/* Section Content View Stage */}
        <main className="flex-1 p-4 sm:p-6 lg:p-8 overflow-y-auto max-w-7xl mx-auto w-full">
          {activeSection === 'overview' && (
            <OverviewSection
              currentStatus={platformStatus}
              history={statusHistory}
              adminUser={activeAdminProfile}
              users={allUsers}
              records={allRecords}
              reports={allReports}
              tickets={supportTickets}
              auditLogs={auditLogs}
              onNavigateSection={(s) => setActiveSection(s)}
              onStatusChanged={(newRec) => {
                setPlatformStatus(newRec);
                loadData();
              }}
            />
          )}

          {activeSection === 'users' && (
            <UsersSection
              users={allUsers}
              records={allRecords}
              adminUser={activeAdminProfile}
              onRefreshData={loadData}
            />
          )}

          {activeSection === 'moderation' && (
            <ModerationSection
              records={allRecords}
              users={allUsers}
              adminUser={activeAdminProfile}
              onRefreshData={loadData}
            />
          )}

          {activeSection === 'reports' && (
            <ReportsSection
              reports={allReports}
              users={allUsers}
              adminUser={activeAdminProfile}
              onRefreshData={loadData}
            />
          )}

          {activeSection === 'content' && (
            <ContentSection
              users={allUsers}
              records={allRecords}
            />
          )}

          {activeSection === 'support' && (
            <SupportSection
              tickets={supportTickets}
              adminUser={activeAdminProfile}
              onRefreshData={loadData}
            />
          )}

          {activeSection === 'notifications' && (
            <NotificationsSection
              notifications={notifications}
              adminUser={activeAdminProfile}
              onRefreshData={loadData}
            />
          )}

          {activeSection === 'settings' && (
            <SettingsSection
              settings={platformSettings}
              adminUser={activeAdminProfile}
              onRefreshData={loadData}
            />
          )}

          {activeSection === 'roles' && (
            <RolesSection
              adminUsers={adminUsers}
              currentAdmin={activeAdminProfile}
              onRefreshData={loadData}
            />
          )}

          {activeSection === 'audit-logs' && (
            <AuditLogsSection auditLogs={auditLogs} />
          )}

          {activeSection === 'analytics' && (
            <AnalyticsSection
              users={allUsers}
              records={allRecords}
            />
          )}

          {activeSection === 'system-health' && (
            <HealthSection />
          )}
        </main>
      </div>
    </div>
  );
};
