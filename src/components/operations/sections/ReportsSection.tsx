import React, { useState } from 'react';
import {
  AlertCircle,
  CheckCircle2,
  Clock,
  UserX,
  Eye,
  MessageSquare,
  Shield,
  FileText,
  Search,
  Filter,
  Check,
  X,
} from 'lucide-react';
import { ReportRecord, UserProfile, AdminUser } from '../../../types';
import { db } from '../../../services/db';

interface ReportsSectionProps {
  reports: ReportRecord[];
  users: UserProfile[];
  adminUser: AdminUser | null;
  onRefreshData: () => void;
}

export const ReportsSection: React.FC<ReportsSectionProps> = ({
  reports,
  users,
  adminUser,
  onRefreshData,
}) => {
  const [selectedReport, setSelectedReport] = useState<ReportRecord | null>(null);
  const [statusFilter, setStatusFilter] = useState<'all' | 'pending' | 'under_review' | 'resolved' | 'dismissed'>('all');
  const [resolutionNotes, setResolutionNotes] = useState('');
  const [actionTaken, setActionTaken] = useState<ReportRecord['actionTaken']>('none');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const getUser = (id: string) => users.find((u) => u.id === id);

  const filteredReports = reports.filter((r) => {
    if (statusFilter === 'all') return true;
    const currentStatus = r.status || 'pending';
    return currentStatus === statusFilter;
  });

  const handleResolveReport = (status: 'resolved' | 'dismissed' | 'under_review') => {
    if (!selectedReport) return;
    setIsSubmitting(true);

    const actor = {
      id: adminUser?.id || 'admin',
      email: adminUser?.email || 'admin@sabi.id',
      name: adminUser?.fullName || 'Administrator',
    };

    const success = db.updateReport(
      selectedReport.id,
      {
        status,
        resolutionNotes: resolutionNotes.trim() || undefined,
        actionTaken: status === 'resolved' ? actionTaken : 'none',
      },
      actor
    );

    setIsSubmitting(false);
    if (success) {
      setSelectedReport(null);
      setResolutionNotes('');
      onRefreshData();
    }
  };

  const handleSuspendReportedUser = (userId: string) => {
    const actor = {
      id: adminUser?.id || 'admin',
      email: adminUser?.email || 'admin@sabi.id',
      name: adminUser?.fullName || 'Administrator',
    };

    db.suspendUser(userId, `Suspended following investigation of report ${selectedReport?.id}`, actor);
    if (selectedReport) {
      db.updateReport(
        selectedReport.id,
        {
          status: 'resolved',
          resolutionNotes: `Reported user was suspended from the platform.`,
          actionTaken: 'user_suspended',
        },
        actor
      );
    }
    setSelectedReport(null);
    onRefreshData();
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white rounded-2xl border border-[#E7E2D8] p-6 shadow-xs">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-[#E7E2D8]">
          <div>
            <h2 className="text-lg font-bold text-[#16222F]">
              Incident & Abuse Reports Triage
            </h2>
            <p className="text-xs text-[#52606D]">
              Review reports submitted by users regarding conduct, fraudulent proof claims, or harassment.
            </p>
          </div>

          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0">
            {(['all', 'pending', 'under_review', 'resolved', 'dismissed'] as const).map((filter) => (
              <button
                key={filter}
                onClick={() => setStatusFilter(filter)}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold capitalize transition-colors whitespace-nowrap cursor-pointer ${
                  statusFilter === filter
                    ? 'bg-[#2D4D45] text-white shadow-xs'
                    : 'bg-[#FAF8F5] text-[#52606D] hover:bg-stone-200/60 border border-[#E7E2D8]'
                }`}
              >
                {filter.replace('_', ' ')}
              </button>
            ))}
          </div>
        </div>

        {/* Reports List */}
        <div className="divide-y divide-[#E7E2D8] pt-2">
          {filteredReports.length === 0 ? (
            <div className="p-8 text-center text-xs text-[#7A8690]">
              No reports found in this category.
            </div>
          ) : (
            filteredReports.map((r) => {
              const reporter = getUser(r.reporterId);
              const reported = getUser(r.reportedUserId);
              const status = r.status || 'pending';

              return (
                <div
                  key={r.id}
                  className="p-4 hover:bg-[#FAF8F5]/80 transition-colors flex flex-col md:flex-row md:items-center justify-between gap-4 text-xs"
                >
                  <div className="space-y-1.5 flex-1">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                        status === 'pending'
                          ? 'bg-rose-50 text-rose-800 border border-rose-200'
                          : status === 'under_review'
                          ? 'bg-amber-50 text-amber-800 border border-amber-200'
                          : status === 'resolved'
                          ? 'bg-[#EAF3EF] text-[#2D4D45] border border-[#CFE2D9]'
                          : 'bg-stone-100 text-stone-600 border border-stone-200'
                      }`}>
                        {status.replace('_', ' ').toUpperCase()}
                      </span>
                      <span className="font-bold text-[#16222F]">
                        {r.reason}
                      </span>
                      <span className="text-[#7A8690]">·</span>
                      <span className="text-[#7A8690]">
                        {new Date(r.createdAt).toLocaleDateString()}
                      </span>
                    </div>

                    <div className="flex items-center gap-2 text-[#52606D] text-[11px]">
                      <span>Reporter: <strong>{reporter?.fullName || r.reporterId}</strong></span>
                      <span>→</span>
                      <span>Reported Party: <strong className="text-[#16222F]">{reported?.fullName || r.reportedUserId}</strong></span>
                      {reported?.isSuspended && (
                        <span className="text-[10px] text-rose-700 font-bold">(Currently Suspended)</span>
                      )}
                    </div>

                    <p className="text-[#52606D] italic bg-[#FAF8F5] p-2.5 rounded-lg border border-[#E7E2D8] mt-1">
                      "{r.details || 'No additional commentary provided.'}"
                    </p>

                    {r.resolutionNotes && (
                      <p className="text-[11px] text-[#2D4D45] font-medium mt-1">
                        Resolution ({r.resolvedBy}): {r.resolutionNotes}
                      </p>
                    )}
                  </div>

                  <div className="shrink-0 flex items-center gap-2">
                    <button
                      onClick={() => {
                        setSelectedReport(r);
                        setResolutionNotes(r.resolutionNotes || '');
                        setActionTaken(r.actionTaken || 'none');
                      }}
                      className="px-3 py-1.5 rounded-xl bg-[#2D4D45] text-white text-xs font-bold hover:bg-[#223B35] transition-colors cursor-pointer"
                    >
                      Triage Report
                    </button>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>

      {/* Report Triage Modal */}
      {selectedReport && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 border border-[#E7E2D8] shadow-2xl space-y-4">
            <div className="flex items-start justify-between pb-3 border-b border-[#E7E2D8]">
              <div>
                <h3 className="text-base font-bold text-[#16222F]">
                  Triage Report {selectedReport.id}
                </h3>
                <p className="text-xs text-[#7A8690]">
                  Reason: {selectedReport.reason}
                </p>
              </div>
              <button
                onClick={() => setSelectedReport(null)}
                className="text-[#7A8690] hover:text-[#16222F] text-xs font-bold px-2 py-1 rounded"
              >
                Close
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div className="bg-[#FAF8F5] p-3 rounded-xl border border-[#E7E2D8] space-y-2">
                <p className="text-[11px] text-[#7A8690]">Details from Reporter:</p>
                <p className="text-xs text-[#16222F] italic">"{selectedReport.details}"</p>
              </div>

              <div>
                <label className="block text-xs font-bold text-[#16222F] mb-1">
                  Enforcement Action
                </label>
                <select
                  value={actionTaken}
                  onChange={(e) => setActionTaken(e.target.value as ReportRecord['actionTaken'])}
                  className="w-full px-3 py-2 text-xs border border-[#D5CEC2] rounded-xl focus:border-[#2D4D45] focus:outline-none bg-[#FAF8F5]/50"
                >
                  <option value="none">No Penalty / Advisory Only</option>
                  <option value="user_warned">Issue Formal Warning</option>
                  <option value="user_suspended">Suspend Reported User Account</option>
                  <option value="work_taken_down">Take Down Flagged Proof Record</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-[#16222F] mb-1">
                  Investigation & Resolution Notes
                </label>
                <textarea
                  value={resolutionNotes}
                  onChange={(e) => setResolutionNotes(e.target.value)}
                  placeholder="Record summary of evidence reviewed and reason for decision..."
                  rows={3}
                  className="w-full px-3 py-2 text-xs border border-[#D5CEC2] rounded-xl focus:border-[#2D4D45] focus:outline-none bg-[#FAF8F5]/50"
                />
              </div>
            </div>

            <div className="flex items-center justify-between pt-3 border-t border-[#E7E2D8]">
              <button
                type="button"
                onClick={() => handleSuspendReportedUser(selectedReport.reportedUserId)}
                className="px-3 py-1.5 rounded-lg bg-rose-50 text-rose-800 border border-rose-200 text-xs font-bold cursor-pointer"
              >
                Suspend Reported User
              </button>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => handleResolveReport('dismissed')}
                  className="px-3 py-1.5 rounded-xl border border-[#D5CEC2] text-[#52606D] hover:text-[#16222F] text-xs font-semibold cursor-pointer"
                >
                  Dismiss
                </button>
                <button
                  type="button"
                  onClick={() => handleResolveReport('resolved')}
                  disabled={isSubmitting}
                  className="px-4 py-2 rounded-xl bg-[#2D4D45] hover:bg-[#223B35] text-white text-xs font-bold cursor-pointer shadow-xs"
                >
                  Mark Resolved
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
