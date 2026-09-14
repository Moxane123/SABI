import React, { useState } from 'react';
import {
  Search,
  Filter,
  Shield,
  ShieldAlert,
  UserCheck,
  UserX,
  Eye,
  AlertTriangle,
  RefreshCw,
  ExternalLink,
  Lock,
  Mail,
  Calendar,
  CheckCircle2,
  XCircle,
  Flag,
} from 'lucide-react';
import { UserProfile, WorkRecord, AdminUser } from '../../../types';
import { db } from '../../../services/db';

interface UsersSectionProps {
  users: UserProfile[];
  records: WorkRecord[];
  adminUser: AdminUser | null;
  onRefreshData: () => void;
}

export const UsersSection: React.FC<UsersSectionProps> = ({
  users,
  records,
  adminUser,
  onRefreshData,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'active' | 'suspended' | 'flagged'>('all');
  const [selectedUser, setSelectedUser] = useState<UserProfile | null>(null);

  // Suspension modal state
  const [suspendModalUser, setSuspendModalUser] = useState<UserProfile | null>(null);
  const [suspendReason, setSuspendReason] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [actionError, setActionError] = useState<string | null>(null);

  const filteredUsers = users.filter((u) => {
    const term = searchTerm.toLowerCase();
    const matchesSearch =
      u.fullName.toLowerCase().includes(term) ||
      (u.email && u.email.toLowerCase().includes(term)) ||
      (u.username && u.username.toLowerCase().includes(term)) ||
      (u.profession && u.profession.toLowerCase().includes(term));

    if (!matchesSearch) return false;

    if (statusFilter === 'active') return !u.isSuspended;
    if (statusFilter === 'suspended') return !!u.isSuspended;
    if (statusFilter === 'flagged') return !!u.isFlagged;

    return true;
  });

  const handleSuspendUser = () => {
    if (!suspendModalUser) return;
    if (!suspendReason || suspendReason.trim().length < 5) {
      setActionError('A substantive reason (min 5 chars) is strictly required to suspend a user.');
      return;
    }

    setIsSubmitting(true);
    setActionError(null);

    const actor = {
      id: adminUser?.id || 'admin',
      email: adminUser?.email || 'admin@sabi.id',
      name: adminUser?.fullName || 'Administrator',
    };

    const success = db.suspendUser(suspendModalUser.id, suspendReason.trim(), actor);
    setIsSubmitting(false);

    if (success) {
      setSuspendModalUser(null);
      setSuspendReason('');
      onRefreshData();
      if (selectedUser && selectedUser.id === suspendModalUser.id) {
        setSelectedUser({ ...selectedUser, isSuspended: true, suspendedReason: suspendReason.trim() });
      }
    } else {
      setActionError('Failed to suspend user.');
    }
  };

  const handleUnsuspendUser = (userId: string) => {
    const actor = {
      id: adminUser?.id || 'admin',
      email: adminUser?.email || 'admin@sabi.id',
      name: adminUser?.fullName || 'Administrator',
    };

    const success = db.unsuspendUser(userId, actor);
    if (success) {
      onRefreshData();
      if (selectedUser && selectedUser.id === userId) {
        setSelectedUser({ ...selectedUser, isSuspended: false, suspendedReason: undefined });
      }
    }
  };

  return (
    <div className="space-y-6">
      {/* Header & Controls */}
      <div className="bg-white rounded-2xl border border-[#E7E2D8] p-6 shadow-xs">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-[#E7E2D8]">
          <div>
            <h2 className="text-lg font-bold text-[#16222F]">
              User Directory & Account Oversight
            </h2>
            <p className="text-xs text-[#52606D]">
              Manage registered professional accounts, monitor safety standing, and enforce platform standards.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-xs text-[#7A8690] font-mono">
              Total: {users.length} accounts
            </span>
          </div>
        </div>

        {/* Search & Filter Bar */}
        <div className="flex flex-col sm:flex-row items-center gap-3 pt-6">
          <div className="relative flex-1 w-full">
            <Search className="w-4 h-4 text-[#7A8690] absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search by name, email, username or headline..."
              className="w-full pl-9 pr-4 py-2 text-xs border border-[#D5CEC2] rounded-xl focus:border-[#2D4D45] focus:outline-none bg-[#FAF8F5]/60"
            />
          </div>

          <div className="flex items-center gap-1.5 w-full sm:w-auto">
            {(['all', 'active', 'suspended', 'flagged'] as const).map((filter) => (
              <button
                key={filter}
                onClick={() => setStatusFilter(filter)}
                className={`px-3 py-2 rounded-xl text-xs font-bold capitalize transition-colors cursor-pointer ${
                  statusFilter === filter
                    ? 'bg-[#2D4D45] text-white shadow-xs'
                    : 'bg-[#FAF8F5] text-[#52606D] hover:bg-stone-200/60 border border-[#E7E2D8]'
                }`}
              >
                {filter}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Users Table */}
      <div className="bg-white rounded-2xl border border-[#E7E2D8] overflow-hidden shadow-xs">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="bg-[#FAF8F5] border-b border-[#E7E2D8] text-[#52606D] font-bold uppercase tracking-wider text-[10px]">
                <th className="p-4">User</th>
                <th className="p-4">Status</th>
                <th className="p-4">Documented Works</th>
                <th className="p-4">Discovery Opt-In</th>
                <th className="p-4">Location</th>
                <th className="p-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#E7E2D8]">
              {filteredUsers.length === 0 ? (
                <tr>
                  <td colSpan={6} className="p-8 text-center text-[#7A8690]">
                    No user accounts match the current query.
                  </td>
                </tr>
              ) : (
                filteredUsers.map((u) => {
                  const userWorks = records.filter((r) => r.userId === u.id);
                  const confirmedCount = userWorks.filter((r) => r.confirmationStatus === 'confirmed').length;

                  return (
                    <tr key={u.id} className="hover:bg-[#FAF8F5]/80 transition-colors">
                      <td className="p-4">
                        <div className="flex items-center gap-3">
                          <div className="w-9 h-9 rounded-full bg-[#EAF3EF] border border-[#CFE2D9] text-[#2D4D45] font-bold flex items-center justify-center shrink-0">
                            {u.fullName.charAt(0)}
                          </div>
                          <div>
                            <p className="font-bold text-[#16222F] flex items-center gap-1.5">
                              <span>{u.fullName}</span>
                              {u.isFlagged && (
                                <Flag className="w-3 h-3 text-amber-600 fill-amber-600" />
                              )}
                            </p>
                            <p className="text-[11px] text-[#7A8690]">
                              {u.email || `@${u.username}`}
                            </p>
                          </div>
                        </div>
                      </td>

                      <td className="p-4">
                        {u.isSuspended ? (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded bg-rose-50 text-rose-800 border border-rose-200 text-[10px] font-bold">
                            <ShieldAlert className="w-3 h-3" />
                            Suspended
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded bg-[#EAF3EF] text-[#2D4D45] border border-[#CFE2D9] text-[10px] font-bold">
                            <UserCheck className="w-3 h-3" />
                            Active
                          </span>
                        )}
                      </td>

                      <td className="p-4">
                        <span className="font-mono font-bold text-[#16222F]">
                          {userWorks.length}
                        </span>
                        <span className="text-[10px] text-[#7A8690] ml-1">
                          ({confirmedCount} confirmed)
                        </span>
                      </td>

                      <td className="p-4">
                        {u.appearInDiscover ? (
                          <span className="inline-flex items-center gap-1 text-[11px] text-[#2D4D45] font-semibold">
                            <CheckCircle2 className="w-3.5 h-3.5" />
                            Enabled
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 text-[11px] text-[#7A8690]">
                            <XCircle className="w-3.5 h-3.5" />
                            Private
                          </span>
                        )}
                      </td>

                      <td className="p-4 text-[#52606D]">
                        {u.location || '—'}
                      </td>

                      <td className="p-4 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <button
                            onClick={() => setSelectedUser(u)}
                            className="px-2.5 py-1 rounded-lg border border-[#D5CEC2] hover:bg-stone-100 text-[#16222F] text-[11px] font-semibold cursor-pointer"
                          >
                            Details
                          </button>

                          {u.isSuspended ? (
                            <button
                              onClick={() => handleUnsuspendUser(u.id)}
                              className="px-2.5 py-1 rounded-lg bg-[#EAF3EF] text-[#2D4D45] hover:bg-[#D7EAE1] text-[11px] font-bold cursor-pointer"
                            >
                              Unsuspend
                            </button>
                          ) : (
                            <button
                              onClick={() => {
                                setSuspendModalUser(u);
                                setSuspendReason('');
                                setActionError(null);
                              }}
                              className="px-2.5 py-1 rounded-lg bg-rose-50 text-rose-800 hover:bg-rose-100 border border-rose-200 text-[11px] font-bold cursor-pointer"
                            >
                              Suspend
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* User Details Drawer / Modal */}
      {selectedUser && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 border border-[#E7E2D8] shadow-2xl space-y-4">
            <div className="flex items-start justify-between pb-3 border-b border-[#E7E2D8]">
              <div>
                <h3 className="text-base font-bold text-[#16222F]">
                  User Profile Overview
                </h3>
                <p className="text-xs text-[#7A8690]">
                  UID: {selectedUser.id}
                </p>
              </div>
              <button
                onClick={() => setSelectedUser(null)}
                className="text-[#7A8690] hover:text-[#16222F] text-xs font-bold px-2 py-1 rounded"
              >
                Close
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-full bg-[#EAF3EF] text-[#2D4D45] flex items-center justify-center font-bold text-lg">
                  {selectedUser.fullName.charAt(0)}
                </div>
                <div>
                  <p className="font-bold text-[#16222F] text-sm">
                    {selectedUser.fullName}
                  </p>
                  <p className="text-[#52606D]">{selectedUser.email}</p>
                  <p className="text-[11px] text-[#7A8690]">@{selectedUser.username}</p>
                </div>
              </div>

              <div className="bg-[#FAF8F5] p-3 rounded-xl border border-[#E7E2D8] space-y-1.5">
                <p className="font-bold text-[#16222F]">Profession / Craft</p>
                <p className="text-[#52606D]">{selectedUser.profession || 'None provided'}</p>
                <p className="font-bold text-[#16222F] pt-1">Bio</p>
                <p className="text-[#52606D]">{selectedUser.shortBio || 'None provided'}</p>
              </div>

              {selectedUser.isSuspended && (
                <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-900 text-xs">
                  <p className="font-bold">Account Currently Suspended</p>
                  <p className="text-[11px] mt-0.5">Reason: "{selectedUser.suspendedReason}"</p>
                  {selectedUser.suspendedAt && (
                    <p className="text-[10px] text-rose-700 mt-0.5 font-mono">
                      Timestamp: {new Date(selectedUser.suspendedAt).toLocaleString()}
                    </p>
                  )}
                </div>
              )}
            </div>

            <div className="flex items-center justify-end gap-2 pt-3 border-t border-[#E7E2D8]">
              {selectedUser.isSuspended ? (
                <button
                  onClick={() => handleUnsuspendUser(selectedUser.id)}
                  className="px-4 py-2 rounded-xl bg-[#2D4D45] text-white text-xs font-bold cursor-pointer"
                >
                  Unsuspend Account
                </button>
              ) : (
                <button
                  onClick={() => {
                    setSuspendModalUser(selectedUser);
                    setSuspendReason('');
                    setActionError(null);
                  }}
                  className="px-4 py-2 rounded-xl bg-rose-50 text-rose-800 border border-rose-200 text-xs font-bold cursor-pointer"
                >
                  Suspend Account
                </button>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Suspend Confirmation Modal */}
      {suspendModalUser && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 border border-[#E7E2D8] shadow-xl space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-rose-100 text-rose-700 flex items-center justify-center shrink-0">
                <AlertTriangle className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-base font-bold text-[#16222F]">
                  Suspend {suspendModalUser.fullName}?
                </h3>
                <p className="text-xs text-[#52606D]">
                  This user will be barred from creating work, messaging, or appearing in Discovery.
                </p>
              </div>
            </div>

            {actionError && (
              <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-xs">
                {actionError}
              </div>
            )}

            <div>
              <label className="block text-xs font-bold text-[#16222F] mb-1">
                Reason for Suspension (Required)
              </label>
              <textarea
                value={suspendReason}
                onChange={(e) => setSuspendReason(e.target.value)}
                placeholder="E.g., Fraudulent work record claims, Terms of Service violation..."
                rows={3}
                className="w-full px-3 py-2 text-xs border border-[#D5CEC2] rounded-xl focus:border-[#2D4D45] focus:outline-none bg-[#FAF8F5]/50"
              />
            </div>

            <div className="flex items-center justify-end gap-2 pt-2 border-t border-[#E7E2D8]">
              <button
                type="button"
                onClick={() => setSuspendModalUser(null)}
                className="px-3 py-1.5 text-xs text-[#52606D] font-semibold cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleSuspendUser}
                disabled={isSubmitting}
                className="px-4 py-2 rounded-xl bg-rose-700 hover:bg-rose-800 text-white text-xs font-bold cursor-pointer"
              >
                {isSubmitting ? 'Suspending...' : 'Confirm Suspension'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
