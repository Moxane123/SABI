import React, { useState } from 'react';
import {
  Shield,
  UserPlus,
  Lock,
  CheckCircle2,
  Trash2,
  Key,
  ShieldAlert,
  AlertTriangle,
  UserCheck,
} from 'lucide-react';
import { AdminUser, AdminRole } from '../../../types';
import { operationsService, ROOT_ADMIN_EMAIL } from '../../../services/operationsService';

interface RolesSectionProps {
  adminUsers: AdminUser[];
  currentAdmin: AdminUser | null;
  onRefreshData: () => void;
}

export const RolesSection: React.FC<RolesSectionProps> = ({
  adminUsers,
  currentAdmin,
  onRefreshData,
}) => {
  const [isAdding, setIsAdding] = useState(false);
  const [email, setEmail] = useState('');
  const [fullName, setFullName] = useState('');
  const [role, setRole] = useState<AdminRole>('moderator');
  const [notes, setNotes] = useState('');
  const [error, setError] = useState<string | null>(null);

  const handleAddAdmin = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    const actor = {
      id: currentAdmin?.id || 'admin',
      email: currentAdmin?.email || 'admin@sabi.id',
      name: currentAdmin?.fullName || 'Administrator',
    };

    const result = operationsService.addAdminUser(
      { email, fullName, role, notes },
      actor
    );

    if (!result.success) {
      setError(result.error || 'Failed to add administrator.');
      return;
    }

    setEmail('');
    setFullName('');
    setNotes('');
    setIsAdding(false);
    onRefreshData();
  };

  const handleToggleActive = (admin: AdminUser) => {
    const actor = {
      id: currentAdmin?.id || 'admin',
      email: currentAdmin?.email || 'admin@sabi.id',
      name: currentAdmin?.fullName || 'Administrator',
    };

    const result = operationsService.updateAdminUser(
      admin.id,
      { active: !admin.active },
      actor
    );

    if (!result.success) {
      alert(result.error);
    } else {
      onRefreshData();
    }
  };

  const handleDeleteAdmin = (admin: AdminUser) => {
    if (!confirm(`Are you sure you want to remove administrator ${admin.fullName}?`)) return;

    const actor = {
      id: currentAdmin?.id || 'admin',
      email: currentAdmin?.email || 'admin@sabi.id',
      name: currentAdmin?.fullName || 'Administrator',
    };

    const result = operationsService.removeAdminUser(admin.id, actor);
    if (!result.success) {
      alert(result.error);
    } else {
      onRefreshData();
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white rounded-2xl border border-[#E7E2D8] p-6 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-lg font-bold text-[#16222F]">
            Administrative Roles & Access Governance
          </h2>
          <p className="text-xs text-[#52606D]">
            Manage authorized staff credentials, assign operational privileges, and review RBAC matrices.
          </p>
        </div>

        <button
          onClick={() => setIsAdding(!isAdding)}
          className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-[#2D4D45] text-white text-xs font-bold hover:bg-[#223B35] transition-colors cursor-pointer shadow-xs self-start sm:self-auto"
        >
          <UserPlus className="w-4 h-4" />
          <span>Add Administrator</span>
        </button>
      </div>

      {/* Add Admin Form */}
      {isAdding && (
        <form
          onSubmit={handleAddAdmin}
          className="bg-white rounded-2xl border border-[#E7E2D8] p-6 shadow-xs space-y-4 animate-in fade-in duration-150"
        >
          <h3 className="text-sm font-bold text-[#16222F]">
            Grant Administrative Access
          </h3>

          {error && (
            <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-xs">
              {error}
            </div>
          )}

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-bold text-[#16222F] mb-1">
                Official Google Email
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="staff@sabi.id"
                className="w-full px-3 py-2 text-xs border border-[#D5CEC2] rounded-xl focus:border-[#2D4D45] focus:outline-none bg-[#FAF8F5]/50"
                required
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-[#16222F] mb-1">
                Full Name
              </label>
              <input
                type="text"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                placeholder="Officer Name"
                className="w-full px-3 py-2 text-xs border border-[#D5CEC2] rounded-xl focus:border-[#2D4D45] focus:outline-none bg-[#FAF8F5]/50"
                required
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-[#16222F] mb-1">
                RBAC Security Role
              </label>
              <select
                value={role}
                onChange={(e) => setRole(e.target.value as AdminRole)}
                className="w-full px-3 py-2 text-xs border border-[#D5CEC2] rounded-xl focus:border-[#2D4D45] focus:outline-none bg-[#FAF8F5]/50 font-medium"
              >
                <option value="super_admin">Super Administrator (Full Platform Power)</option>
                <option value="platform_admin">Platform Administrator (Ops & Settings)</option>
                <option value="moderator">Trust & Safety Moderator (Triage & Takedowns)</option>
                <option value="support">Support Specialist (Inquiries & Tickets)</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-[#16222F] mb-1">
              Internal Authorization Notes
            </label>
            <input
              type="text"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="E.g., Head of Verification, onboarded Q1 2026"
              className="w-full px-3 py-2 text-xs border border-[#D5CEC2] rounded-xl focus:border-[#2D4D45] focus:outline-none bg-[#FAF8F5]/50"
            />
          </div>

          <div className="flex items-center justify-end gap-2 pt-2 border-t border-[#E7E2D8]">
            <button
              type="button"
              onClick={() => setIsAdding(false)}
              className="px-3 py-1.5 text-xs text-[#52606D] font-semibold cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 rounded-xl bg-[#2D4D45] text-white text-xs font-bold hover:bg-[#223B35] cursor-pointer shadow-xs"
            >
              Authorize Administrator
            </button>
          </div>
        </form>
      )}

      {/* Administrators List Table */}
      <div className="bg-white rounded-2xl border border-[#E7E2D8] overflow-hidden shadow-xs">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="bg-[#FAF8F5] border-b border-[#E7E2D8] text-[#52606D] font-bold uppercase tracking-wider text-[10px]">
                <th className="p-4">Administrator</th>
                <th className="p-4">Role</th>
                <th className="p-4">Status</th>
                <th className="p-4">Added By</th>
                <th className="p-4">Notes</th>
                <th className="p-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#E7E2D8]">
              {adminUsers.map((admin) => {
                const isRoot = admin.email.toLowerCase() === ROOT_ADMIN_EMAIL.toLowerCase();

                return (
                  <tr key={admin.id} className="hover:bg-[#FAF8F5]/80 transition-colors">
                    <td className="p-4">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-[#EAF3EF] text-[#2D4D45] font-bold flex items-center justify-center">
                          {admin.fullName.charAt(0)}
                        </div>
                        <div>
                          <p className="font-bold text-[#16222F] flex items-center gap-1.5">
                            <span>{admin.fullName}</span>
                            {isRoot && (
                              <span className="px-1.5 py-0.2 rounded bg-amber-100 text-amber-900 border border-amber-300 text-[9px] font-bold">
                                ROOT
                              </span>
                            )}
                          </p>
                          <p className="text-[11px] text-[#7A8690]">{admin.email}</p>
                        </div>
                      </div>
                    </td>

                    <td className="p-4">
                      <span className="font-bold px-2 py-0.5 rounded bg-stone-100 border border-stone-200 text-stone-800 text-[10px] uppercase">
                        {admin.role.replace('_', ' ')}
                      </span>
                    </td>

                    <td className="p-4">
                      {admin.active ? (
                        <span className="inline-flex items-center gap-1 text-[#2D4D45] font-bold text-[11px]">
                          <CheckCircle2 className="w-3.5 h-3.5" />
                          Active
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 text-rose-700 font-bold text-[11px]">
                          Disabled
                        </span>
                      )}
                    </td>

                    <td className="p-4 text-[#7A8690]">
                      {admin.addedBy}
                    </td>

                    <td className="p-4 text-[#52606D] max-w-xs truncate">
                      {admin.notes || '—'}
                    </td>

                    <td className="p-4 text-right">
                      {!isRoot && (
                        <div className="flex items-center justify-end gap-2">
                          <button
                            onClick={() => handleToggleActive(admin)}
                            className="px-2 py-1 rounded border border-[#D5CEC2] hover:bg-stone-100 text-[11px] font-semibold cursor-pointer"
                          >
                            {admin.active ? 'Deactivate' : 'Activate'}
                          </button>
                          <button
                            onClick={() => handleDeleteAdmin(admin)}
                            className="p-1 rounded text-rose-700 hover:bg-rose-50 cursor-pointer"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Permissions Matrix */}
      <div className="bg-white rounded-2xl border border-[#E7E2D8] p-6 shadow-xs space-y-4">
        <h3 className="text-sm font-bold text-[#16222F] uppercase tracking-wider">
          Role-Based Access Control (RBAC) Matrix
        </h3>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="bg-[#FAF8F5] border-b border-[#E7E2D8] text-[#52606D] font-bold text-[10px] uppercase">
                <th className="p-3">Platform Capability</th>
                <th className="p-3 text-center">Super Admin</th>
                <th className="p-3 text-center">Platform Admin</th>
                <th className="p-3 text-center">Moderator</th>
                <th className="p-3 text-center">Support</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#E7E2D8] text-[11px]">
              <tr>
                <td className="p-3 font-semibold text-[#16222F]">Change Platform Status (Operational / Suspended / Maintenance)</td>
                <td className="p-3 text-center text-[#2D4D45] font-bold">✓</td>
                <td className="p-3 text-center text-stone-400">—</td>
                <td className="p-3 text-center text-stone-400">—</td>
                <td className="p-3 text-center text-stone-400">—</td>
              </tr>
              <tr>
                <td className="p-3 font-semibold text-[#16222F]">Manage Global Settings & Feature Switches</td>
                <td className="p-3 text-center text-[#2D4D45] font-bold">✓</td>
                <td className="p-3 text-center text-[#2D4D45] font-bold">✓</td>
                <td className="p-3 text-center text-stone-400">—</td>
                <td className="p-3 text-center text-stone-400">—</td>
              </tr>
              <tr>
                <td className="p-3 font-semibold text-[#16222F]">Suspend / Unsuspend User Accounts</td>
                <td className="p-3 text-center text-[#2D4D45] font-bold">✓</td>
                <td className="p-3 text-center text-[#2D4D45] font-bold">✓</td>
                <td className="p-3 text-center text-[#2D4D45] font-bold">✓</td>
                <td className="p-3 text-center text-stone-400">—</td>
              </tr>
              <tr>
                <td className="p-3 font-semibold text-[#16222F]">Take Down / Restore Work Records & Evidence</td>
                <td className="p-3 text-center text-[#2D4D45] font-bold">✓</td>
                <td className="p-3 text-center text-[#2D4D45] font-bold">✓</td>
                <td className="p-3 text-center text-[#2D4D45] font-bold">✓</td>
                <td className="p-3 text-center text-stone-400">—</td>
              </tr>
              <tr>
                <td className="p-3 font-semibold text-[#16222F]">Resolve Reports & Issue Warnings</td>
                <td className="p-3 text-center text-[#2D4D45] font-bold">✓</td>
                <td className="p-3 text-center text-[#2D4D45] font-bold">✓</td>
                <td className="p-3 text-center text-[#2D4D45] font-bold">✓</td>
                <td className="p-3 text-center text-stone-400">—</td>
              </tr>
              <tr>
                <td className="p-3 font-semibold text-[#16222F]">Manage Inquiries & Support Tickets</td>
                <td className="p-3 text-center text-[#2D4D45] font-bold">✓</td>
                <td className="p-3 text-center text-[#2D4D45] font-bold">✓</td>
                <td className="p-3 text-center text-[#2D4D45] font-bold">✓</td>
                <td className="p-3 text-center text-[#2D4D45] font-bold">✓</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
