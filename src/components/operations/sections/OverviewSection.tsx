import React from 'react';
import {
  Users,
  Award,
  ShieldCheck,
  AlertCircle,
  Activity,
  ArrowUpRight,
  Clock,
  Shield,
  FileCheck,
  Zap,
} from 'lucide-react';
import {
  PlatformStatusRecord,
  PlatformStatusHistoryEntry,
  AdminUser,
  OperationsSection,
  AuditLogEntry,
  ReportRecord,
  SupportTicket,
  UserProfile,
  WorkRecord,
} from '../../../types';
import { PlatformStatusControl } from '../PlatformStatusControl';

interface OverviewSectionProps {
  currentStatus: PlatformStatusRecord;
  history: PlatformStatusHistoryEntry[];
  adminUser: AdminUser | null;
  users: UserProfile[];
  records: WorkRecord[];
  reports: ReportRecord[];
  tickets: SupportTicket[];
  auditLogs: AuditLogEntry[];
  onNavigateSection: (section: OperationsSection) => void;
  onStatusChanged: (newRecord: PlatformStatusRecord) => void;
}

export const OverviewSection: React.FC<OverviewSectionProps> = ({
  currentStatus,
  history,
  adminUser,
  users,
  records,
  reports,
  tickets,
  auditLogs,
  onNavigateSection,
  onStatusChanged,
}) => {
  const confirmedRecords = records.filter((r) => r.confirmationStatus === 'confirmed').length;
  const evidenceRecords = records.filter(
    (r) => r.evidenceStatus === 'attached' || r.evidenceStatus === 'verified'
  ).length;
  const openReports = reports.filter((r) => !r.status || r.status === 'pending' || r.status === 'under_review').length;
  const openTickets = tickets.filter((t) => t.status === 'open' || t.status === 'in_progress').length;
  const suspendedUsers = users.filter((u) => u.isSuspended).length;
  const takenDownRecords = records.filter((r) => r.isTakenDown).length;

  return (
    <div className="space-y-8">
      {/* KPI Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Card 1: Users */}
        <div
          onClick={() => onNavigateSection('users')}
          className="bg-white p-5 rounded-2xl border border-[#E7E2D8] hover:border-[#2D4D45]/40 transition-all shadow-xs cursor-pointer group"
        >
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-bold text-[#52606D] uppercase tracking-wider">
              Registered Accounts
            </span>
            <div className="w-8 h-8 rounded-lg bg-[#FAF8F5] flex items-center justify-center text-[#2D4D45] group-hover:bg-[#EAF3EF] transition-colors">
              <Users className="w-4 h-4" />
            </div>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-black text-[#16222F] font-mono">
              {users.length}
            </span>
            <span className="text-xs text-[#2D4D45] font-semibold">
              {users.length - suspendedUsers} active
            </span>
          </div>
          <p className="text-[11px] text-[#7A8690] mt-1 flex items-center justify-between">
            <span>{suspendedUsers} suspended</span>
            <ArrowUpRight className="w-3.5 h-3.5 text-[#7A8690] group-hover:text-[#2D4D45] transition-colors" />
          </p>
        </div>

        {/* Card 2: Documented Work */}
        <div
          onClick={() => onNavigateSection('content')}
          className="bg-white p-5 rounded-2xl border border-[#E7E2D8] hover:border-[#2D4D45]/40 transition-all shadow-xs cursor-pointer group"
        >
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-bold text-[#52606D] uppercase tracking-wider">
              Documented Works
            </span>
            <div className="w-8 h-8 rounded-lg bg-[#FAF8F5] flex items-center justify-center text-[#2D4D45] group-hover:bg-[#EAF3EF] transition-colors">
              <FileCheck className="w-4 h-4" />
            </div>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-black text-[#16222F] font-mono">
              {records.length}
            </span>
            <span className="text-xs text-[#2D4D45] font-semibold">
              {evidenceRecords} proven
            </span>
          </div>
          <p className="text-[11px] text-[#7A8690] mt-1 flex items-center justify-between">
            <span>{takenDownRecords} moderated/hidden</span>
            <ArrowUpRight className="w-3.5 h-3.5 text-[#7A8690] group-hover:text-[#2D4D45] transition-colors" />
          </p>
        </div>

        {/* Card 3: Verified Proof Density */}
        <div
          onClick={() => onNavigateSection('analytics')}
          className="bg-white p-5 rounded-2xl border border-[#E7E2D8] hover:border-[#2D4D45]/40 transition-all shadow-xs cursor-pointer group"
        >
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-bold text-[#52606D] uppercase tracking-wider">
              Client Confirmed
            </span>
            <div className="w-8 h-8 rounded-lg bg-[#FAF8F5] flex items-center justify-center text-[#2D4D45] group-hover:bg-[#EAF3EF] transition-colors">
              <ShieldCheck className="w-4 h-4" />
            </div>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-black text-[#16222F] font-mono">
              {confirmedRecords}
            </span>
            <span className="text-xs text-[#2D4D45] font-semibold">
              {records.length > 0 ? Math.round((confirmedRecords / records.length) * 100) : 0}% ratio
            </span>
          </div>
          <p className="text-[11px] text-[#7A8690] mt-1 flex items-center justify-between">
            <span>Highest proof tier</span>
            <ArrowUpRight className="w-3.5 h-3.5 text-[#7A8690] group-hover:text-[#2D4D45] transition-colors" />
          </p>
        </div>

        {/* Card 4: Action Queue */}
        <div
          onClick={() => onNavigateSection('reports')}
          className="bg-white p-5 rounded-2xl border border-[#E7E2D8] hover:border-[#2D4D45]/40 transition-all shadow-xs cursor-pointer group"
        >
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-bold text-[#52606D] uppercase tracking-wider">
              Action Queue
            </span>
            <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${
              openReports + openTickets > 0 ? 'bg-amber-100 text-amber-800' : 'bg-[#FAF8F5] text-[#2D4D45]'
            }`}>
              <AlertCircle className="w-4 h-4" />
            </div>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-black text-[#16222F] font-mono">
              {openReports + openTickets}
            </span>
            <span className="text-xs text-amber-800 font-semibold">
              pending review
            </span>
          </div>
          <p className="text-[11px] text-[#7A8690] mt-1 flex items-center justify-between">
            <span>{openReports} reports, {openTickets} tickets</span>
            <ArrowUpRight className="w-3.5 h-3.5 text-[#7A8690] group-hover:text-[#2D4D45] transition-colors" />
          </p>
        </div>
      </div>

      {/* PRIORITY 1: Platform State Control Component */}
      <PlatformStatusControl
        currentStatus={currentStatus}
        history={history}
        adminUser={adminUser}
        onStatusChanged={onStatusChanged}
      />

      {/* Dual Activity Panels: Recent Audit Feed & Operational Quick Actions */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left 2 Cols: Live Audit Event Stream */}
        <div className="lg:col-span-2 bg-white rounded-2xl border border-[#E7E2D8] p-6 shadow-xs">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <Activity className="w-4 h-4 text-[#2D4D45]" />
              <h3 className="text-sm font-bold text-[#16222F] uppercase tracking-wider">
                Live Audit Activity Stream
              </h3>
            </div>
            <button
              onClick={() => onNavigateSection('audit-logs')}
              className="text-xs font-bold text-[#2D4D45] hover:underline cursor-pointer"
            >
              View All Logs →
            </button>
          </div>

          <div className="space-y-3">
            {auditLogs.slice(0, 5).map((log) => (
              <div
                key={log.id}
                className="p-3.5 rounded-xl bg-[#FAF8F5] border border-[#E7E2D8]/70 flex items-start gap-3 text-xs"
              >
                <div className="w-2 h-2 rounded-full bg-[#2D4D45] mt-1.5 shrink-0" />
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between gap-2">
                    <span className="font-bold text-[#16222F] truncate">
                      {log.action.replace(/_/g, ' ')}
                    </span>
                    <span className="text-[10px] font-mono text-[#7A8690] shrink-0">
                      {new Date(log.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </span>
                  </div>
                  <p className="text-[#52606D] text-[11px] mt-0.5 line-clamp-1">
                    {log.details}
                  </p>
                  <p className="text-[10px] text-[#7A8690] mt-0.5">
                    Officer: <span className="font-medium text-[#16222F]">{log.actorName}</span> ({log.actorEmail})
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Right 1 Col: Operations Quick Actions */}
        <div className="bg-white rounded-2xl border border-[#E7E2D8] p-6 shadow-xs space-y-4">
          <div className="flex items-center gap-2">
            <Zap className="w-4 h-4 text-[#2D4D45]" />
            <h3 className="text-sm font-bold text-[#16222F] uppercase tracking-wider">
              Quick Operations
            </h3>
          </div>

          <div className="space-y-2.5">
            <button
              onClick={() => onNavigateSection('moderation')}
              className="w-full text-left p-3 rounded-xl border border-[#E7E2D8] hover:border-[#2D4D45] hover:bg-[#FAF8F5] transition-all flex items-center justify-between text-xs cursor-pointer group"
            >
              <div>
                <p className="font-bold text-[#16222F] group-hover:text-[#2D4D45]">
                  Review Work Records
                </p>
                <p className="text-[11px] text-[#7A8690]">
                  Inspect submitted evidence & confirmations
                </p>
              </div>
              <ArrowUpRight className="w-4 h-4 text-[#7A8690] group-hover:text-[#2D4D45]" />
            </button>

            <button
              onClick={() => onNavigateSection('reports')}
              className="w-full text-left p-3 rounded-xl border border-[#E7E2D8] hover:border-[#2D4D45] hover:bg-[#FAF8F5] transition-all flex items-center justify-between text-xs cursor-pointer group"
            >
              <div>
                <p className="font-bold text-[#16222F] group-hover:text-[#2D4D45]">
                  Resolve Incident Reports
                </p>
                <p className="text-[11px] text-[#7A8690]">
                  {openReports} user report{openReports === 1 ? '' : 's'} pending
                </p>
              </div>
              <ArrowUpRight className="w-4 h-4 text-[#7A8690] group-hover:text-[#2D4D45]" />
            </button>

            <button
              onClick={() => onNavigateSection('notifications')}
              className="w-full text-left p-3 rounded-xl border border-[#E7E2D8] hover:border-[#2D4D45] hover:bg-[#FAF8F5] transition-all flex items-center justify-between text-xs cursor-pointer group"
            >
              <div>
                <p className="font-bold text-[#16222F] group-hover:text-[#2D4D45]">
                  Broadcast Notice
                </p>
                <p className="text-[11px] text-[#7A8690]">
                  Publish banner to active platform users
                </p>
              </div>
              <ArrowUpRight className="w-4 h-4 text-[#7A8690] group-hover:text-[#2D4D45]" />
            </button>

            <button
              onClick={() => onNavigateSection('system-health')}
              className="w-full text-left p-3 rounded-xl border border-[#E7E2D8] hover:border-[#2D4D45] hover:bg-[#FAF8F5] transition-all flex items-center justify-between text-xs cursor-pointer group"
            >
              <div>
                <p className="font-bold text-[#16222F] group-hover:text-[#2D4D45]">
                  Telemetry & Health
                </p>
                <p className="text-[11px] text-[#7A8690]">
                  Database latency, storage & ping tests
                </p>
              </div>
              <ArrowUpRight className="w-4 h-4 text-[#7A8690] group-hover:text-[#2D4D45]" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
