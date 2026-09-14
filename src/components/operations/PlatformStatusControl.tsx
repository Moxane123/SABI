import React, { useState } from 'react';
import {
  ShieldAlert,
  CheckCircle2,
  AlertTriangle,
  Clock,
  User,
  History,
  ArrowRight,
  AlertOctagon,
  RefreshCw,
  Info,
  Lock,
} from 'lucide-react';
import { PlatformStatus, PlatformStatusRecord, PlatformStatusHistoryEntry, AdminUser } from '../../types';
import { operationsService } from '../../services/operationsService';

interface PlatformStatusControlProps {
  currentStatus: PlatformStatusRecord;
  history: PlatformStatusHistoryEntry[];
  adminUser: AdminUser | null;
  onStatusChanged: (newRecord: PlatformStatusRecord) => void;
}

export const PlatformStatusControl: React.FC<PlatformStatusControlProps> = ({
  currentStatus,
  history,
  adminUser,
  onStatusChanged,
}) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [targetStatus, setTargetStatus] = useState<PlatformStatus | null>(null);
  const [reason, setReason] = useState('');
  const [publicNotice, setPublicNotice] = useState('');
  const [confirmationInput, setConfirmationInput] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const openStatusModal = (status: PlatformStatus) => {
    setTargetStatus(status);
    setReason('');
    setPublicNotice(
      status === 'MAINTENANCE'
        ? 'Sabi is undergoing scheduled system optimization. Documented records remain safely verified in read-only mode.'
        : status === 'SUSPENDED'
        ? 'Sabi platform operations are temporarily suspended under administrative review.'
        : 'Sabi services are fully operational and verified.'
    );
    setConfirmationInput('');
    setError(null);
    setIsModalOpen(true);
  };

  const handleExecuteStatusChange = () => {
    if (!targetStatus) return;

    if (!reason || reason.trim().length < 5) {
      setError('A substantive operational reason (minimum 5 characters) is required.');
      return;
    }

    if (targetStatus === 'SUSPENDED' && confirmationInput.trim().toUpperCase() !== 'SUSPEND') {
      setError('You must type "SUSPEND" in all caps to confirm suspending the live platform.');
      return;
    }

    setIsSubmitting(true);
    setError(null);

    try {
      const actor = {
        id: adminUser?.id || 'admin_user',
        email: adminUser?.email || 'admin@sabi.id',
        name: adminUser?.fullName || 'Administrator',
      };

      const result = operationsService.setPlatformStatus(targetStatus, reason, actor, {
        publicNotice,
      });

      if (!result.success) {
        setError(result.error || 'Failed to update platform status.');
        setIsSubmitting(false);
        return;
      }

      onStatusChanged(result.record);
      setIsModalOpen(false);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An unexpected error occurred.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const getStatusBadge = (status: PlatformStatus) => {
    switch (status) {
      case 'OPERATIONAL':
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#EAF3EF] text-[#2D4D45] border border-[#CFE2D9] text-xs font-bold tracking-wide">
            <span className="w-2 h-2 rounded-full bg-[#2D4D45] animate-pulse" />
            OPERATIONAL
          </span>
        );
      case 'MAINTENANCE':
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-50 text-amber-900 border border-amber-200 text-xs font-bold tracking-wide">
            <span className="w-2 h-2 rounded-full bg-amber-500 animate-pulse" />
            MAINTENANCE
          </span>
        );
      case 'SUSPENDED':
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-rose-50 text-rose-900 border border-rose-200 text-xs font-bold tracking-wide">
            <span className="w-2 h-2 rounded-full bg-rose-600 animate-pulse" />
            SUSPENDED
          </span>
        );
    }
  };

  return (
    <div className="space-y-6">
      {/* Primary Platform Status Panel */}
      <div className="bg-white rounded-2xl border border-[#E7E2D8] p-6 shadow-xs">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 pb-6 border-b border-[#E7E2D8]">
          <div className="space-y-1.5">
            <div className="flex items-center gap-3">
              <h2 className="text-xl font-black text-[#16222F] tracking-tight font-serif">
                Platform State Control
              </h2>
              {getStatusBadge(currentStatus.status)}
            </div>
            <p className="text-xs text-[#52606D] max-w-xl">
              Controls live system availability, public routing, and write transaction permissions.
              Every transition is cryptographically logged to the audit ledger.
            </p>
          </div>

          {/* Action Trigger Buttons */}
          <div className="flex items-center gap-2.5 flex-wrap">
            {currentStatus.status !== 'OPERATIONAL' && (
              <button
                onClick={() => openStatusModal('OPERATIONAL')}
                className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-[#2D4D45] hover:bg-[#223B35] text-white text-xs font-bold shadow-xs transition-all cursor-pointer active:scale-95"
              >
                <CheckCircle2 className="w-4 h-4 text-[#A8D5C8]" />
                <span>Restore to Operational</span>
              </button>
            )}

            {currentStatus.status !== 'MAINTENANCE' && (
              <button
                onClick={() => openStatusModal('MAINTENANCE')}
                className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-amber-50 hover:bg-amber-100 text-amber-900 border border-amber-300 text-xs font-bold transition-all cursor-pointer active:scale-95"
              >
                <AlertTriangle className="w-4 h-4 text-amber-600" />
                <span>Enter Maintenance Mode</span>
              </button>
            )}

            {currentStatus.status !== 'SUSPENDED' && (
              <button
                onClick={() => openStatusModal('SUSPENDED')}
                className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-rose-50 hover:bg-rose-100 text-rose-800 border border-rose-200 text-xs font-bold transition-all cursor-pointer active:scale-95"
              >
                <ShieldAlert className="w-4 h-4 text-rose-600" />
                <span>Suspend Platform</span>
              </button>
            )}
          </div>
        </div>

        {/* Current State Details Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-6">
          <div className="bg-[#FAF8F5] rounded-xl p-4 border border-[#E7E2D8]/80">
            <div className="flex items-center gap-2 text-xs font-bold text-[#52606D] mb-1">
              <Clock className="w-3.5 h-3.5 text-[#2D4D45]" />
              <span>Last Transition</span>
            </div>
            <p className="text-sm font-bold text-[#16222F]">
              {new Date(currentStatus.changedAt).toLocaleString()}
            </p>
            <p className="text-[11px] text-[#7A8690] mt-0.5">
              Previous State: <span className="font-semibold text-[#16222F]">{currentStatus.previousStatus}</span>
            </p>
          </div>

          <div className="bg-[#FAF8F5] rounded-xl p-4 border border-[#E7E2D8]/80">
            <div className="flex items-center gap-2 text-xs font-bold text-[#52606D] mb-1">
              <User className="w-3.5 h-3.5 text-[#2D4D45]" />
              <span>Authorized Officer</span>
            </div>
            <p className="text-sm font-bold text-[#16222F] truncate">
              {currentStatus.changedBy}
            </p>
            <p className="text-[11px] text-[#7A8690] mt-0.5 truncate">
              {currentStatus.changedByEmail}
            </p>
          </div>

          <div className="bg-[#FAF8F5] rounded-xl p-4 border border-[#E7E2D8]/80">
            <div className="flex items-center gap-2 text-xs font-bold text-[#52606D] mb-1">
              <Info className="w-3.5 h-3.5 text-[#2D4D45]" />
              <span>Operational Justification</span>
            </div>
            <p className="text-xs text-[#16222F] line-clamp-2 leading-relaxed">
              "{currentStatus.reason}"
            </p>
          </div>
        </div>

        {/* Public Notice Banner if any */}
        {currentStatus.publicNotice && (
          <div className="mt-4 p-3.5 rounded-xl bg-[#FAF8F5] border border-[#E7E2D8] flex items-start gap-3 text-xs">
            <Info className="w-4 h-4 text-[#2D4D45] shrink-0 mt-0.5" />
            <div>
              <span className="font-bold text-[#16222F]">Active Public Notice: </span>
              <span className="text-[#52606D]">{currentStatus.publicNotice}</span>
            </div>
          </div>
        )}
      </div>

      {/* State Transition History Ledger */}
      <div className="bg-white rounded-2xl border border-[#E7E2D8] p-6 shadow-xs">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <History className="w-4 h-4 text-[#2D4D45]" />
            <h3 className="text-sm font-bold text-[#16222F] uppercase tracking-wider">
              Platform State Transition History
            </h3>
          </div>
          <span className="text-xs text-[#7A8690] font-medium">
            {history.length} state {history.length === 1 ? 'event' : 'events'} recorded
          </span>
        </div>

        <div className="divide-y divide-[#E7E2D8] border border-[#E7E2D8] rounded-xl overflow-hidden">
          {history.length === 0 ? (
            <div className="p-6 text-center text-xs text-[#7A8690]">
              No historical status transitions recorded.
            </div>
          ) : (
            history.map((entry) => (
              <div
                key={entry.id}
                className="p-4 bg-white hover:bg-[#FAF8F5] transition-colors flex flex-col md:flex-row md:items-center justify-between gap-3 text-xs"
              >
                <div className="space-y-1">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="font-bold text-[#52606D] px-2 py-0.5 rounded bg-stone-100 border border-stone-200 text-[10px]">
                      {entry.fromStatus}
                    </span>
                    <ArrowRight className="w-3 h-3 text-[#7A8690]" />
                    <span className={`font-bold px-2 py-0.5 rounded text-[10px] ${
                      entry.toStatus === 'OPERATIONAL'
                        ? 'bg-[#EAF3EF] text-[#2D4D45] border border-[#CFE2D9]'
                        : entry.toStatus === 'MAINTENANCE'
                        ? 'bg-amber-50 text-amber-900 border border-amber-200'
                        : 'bg-rose-50 text-rose-900 border border-rose-200'
                    }`}>
                      {entry.toStatus}
                    </span>
                    <span className="text-[#7A8690]">by</span>
                    <span className="font-semibold text-[#16222F]">{entry.changedBy}</span>
                    <span className="text-[#8C98A2]">({entry.changedByEmail})</span>
                  </div>
                  <p className="text-[#52606D] italic">
                    Reason: "{entry.reason}"
                  </p>
                  {entry.publicNotice && (
                    <p className="text-[11px] text-[#7A8690]">
                      Notice: {entry.publicNotice}
                    </p>
                  )}
                </div>

                <div className="text-right shrink-0">
                  <span className="text-[11px] font-mono text-[#7A8690] block">
                    {new Date(entry.changedAt).toLocaleDateString()}
                  </span>
                  <span className="text-[10px] font-mono text-[#8C98A2] block">
                    {new Date(entry.changedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </span>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Confirmation & Reason Modal */}
      {isModalOpen && targetStatus && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 border border-[#E7E2D8] shadow-xl space-y-5 animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-start gap-3">
              <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${
                targetStatus === 'SUSPENDED'
                  ? 'bg-rose-100 text-rose-700'
                  : targetStatus === 'MAINTENANCE'
                  ? 'bg-amber-100 text-amber-700'
                  : 'bg-[#EAF3EF] text-[#2D4D45]'
              }`}>
                {targetStatus === 'SUSPENDED' ? (
                  <AlertOctagon className="w-5 h-5" />
                ) : targetStatus === 'MAINTENANCE' ? (
                  <AlertTriangle className="w-5 h-5" />
                ) : (
                  <CheckCircle2 className="w-5 h-5" />
                )}
              </div>
              <div className="flex-1">
                <h3 className="text-lg font-bold text-[#16222F]">
                  Confirm Transition to {targetStatus}
                </h3>
                <p className="text-xs text-[#52606D] mt-0.5">
                  {targetStatus === 'SUSPENDED'
                    ? 'This will immediately lock out regular users and prevent new evidence or confirmation activity.'
                    : targetStatus === 'MAINTENANCE'
                    ? 'This will place Sabi into read-only mode. Write actions will be temporarily disabled.'
                    : 'This will restore live platform functionality, public discovery, and verification requests.'}
                </p>
              </div>
            </div>

            {error && (
              <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-xs flex items-start gap-2">
                <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5 text-rose-600" />
                <span>{error}</span>
              </div>
            )}

            <div className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-[#16222F] mb-1">
                  Operational Reason (Required) <span className="text-rose-600">*</span>
                </label>
                <textarea
                  value={reason}
                  onChange={(e) => setReason(e.target.value)}
                  placeholder="State the root cause or operational driver for this status change..."
                  rows={3}
                  className="w-full px-3 py-2 text-xs border border-[#D5CEC2] rounded-xl focus:border-[#2D4D45] focus:outline-none bg-[#FAF8F5]/50"
                />
                <span className="text-[10px] text-[#7A8690]">
                  This reason will be recorded in the immutable audit log and status history.
                </span>
              </div>

              <div>
                <label className="block text-xs font-bold text-[#16222F] mb-1">
                  Public Visitor Notice (Optional)
                </label>
                <input
                  type="text"
                  value={publicNotice}
                  onChange={(e) => setPublicNotice(e.target.value)}
                  placeholder="Displayed to public visitors on system pages..."
                  className="w-full px-3 py-2 text-xs border border-[#D5CEC2] rounded-xl focus:border-[#2D4D45] focus:outline-none bg-[#FAF8F5]/50"
                />
              </div>

              {targetStatus === 'SUSPENDED' && (
                <div className="p-3.5 rounded-xl bg-rose-50 border border-rose-200 space-y-2">
                  <div className="flex items-center gap-1.5 text-rose-800 text-xs font-bold">
                    <Lock className="w-3.5 h-3.5" />
                    <span>Type "SUSPEND" to confirm this high-impact action:</span>
                  </div>
                  <input
                    type="text"
                    value={confirmationInput}
                    onChange={(e) => setConfirmationInput(e.target.value)}
                    placeholder="SUSPEND"
                    className="w-full px-3 py-1.5 text-xs font-mono font-bold tracking-wider bg-white border border-rose-300 rounded-lg text-rose-900 focus:outline-none focus:ring-1 focus:ring-rose-500"
                  />
                </div>
              )}
            </div>

            <div className="flex items-center justify-end gap-2.5 pt-2 border-t border-[#E7E2D8]">
              <button
                type="button"
                onClick={() => setIsModalOpen(false)}
                disabled={isSubmitting}
                className="px-4 py-2 rounded-xl text-xs font-semibold text-[#52606D] hover:text-[#16222F] hover:bg-[#FAF8F5] transition-colors cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleExecuteStatusChange}
                disabled={isSubmitting}
                className={`inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold text-white transition-all cursor-pointer active:scale-95 ${
                  targetStatus === 'SUSPENDED'
                    ? 'bg-rose-700 hover:bg-rose-800 shadow-xs'
                    : targetStatus === 'MAINTENANCE'
                    ? 'bg-amber-600 hover:bg-amber-700 shadow-xs'
                    : 'bg-[#2D4D45] hover:bg-[#223B35] shadow-xs'
                }`}
              >
                {isSubmitting ? (
                  <>
                    <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                    <span>Executing...</span>
                  </>
                ) : (
                  <span>Confirm Transition to {targetStatus}</span>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
