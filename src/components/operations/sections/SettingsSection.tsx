import React, { useState } from 'react';
import {
  Sliders,
  CheckCircle2,
  AlertTriangle,
  Save,
  Lock,
  RefreshCw,
  Shield,
  FileCheck,
  Users,
} from 'lucide-react';
import { PlatformSettings, AdminUser } from '../../../types';
import { operationsService } from '../../../services/operationsService';

interface SettingsSectionProps {
  settings: PlatformSettings;
  adminUser: AdminUser | null;
  onRefreshData: () => void;
}

export const SettingsSection: React.FC<SettingsSectionProps> = ({
  settings,
  adminUser,
  onRefreshData,
}) => {
  const [formData, setFormData] = useState<PlatformSettings>(settings);
  const [savedSuccess, setSavedSuccess] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setSavedSuccess(false);

    const actor = {
      id: adminUser?.id || 'admin',
      email: adminUser?.email || 'admin@sabi.id',
      name: adminUser?.fullName || 'Administrator',
    };

    operationsService.updateSettings(formData, actor);
    setIsSubmitting(false);
    setSavedSuccess(true);
    onRefreshData();

    setTimeout(() => setSavedSuccess(false), 3000);
  };

  return (
    <form onSubmit={handleSave} className="space-y-6">
      {/* Header */}
      <div className="bg-white rounded-2xl border border-[#E7E2D8] p-6 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-lg font-bold text-[#16222F]">
            Platform Global Controls & Parameters
          </h2>
          <p className="text-xs text-[#52606D]">
            Configure write permissions, registration policies, verification thresholds, and notice copies.
          </p>
        </div>

        <button
          type="submit"
          disabled={isSubmitting}
          className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-[#2D4D45] hover:bg-[#223B35] text-white text-xs font-bold transition-all shadow-xs cursor-pointer self-start sm:self-auto active:scale-95"
        >
          <Save className="w-4 h-4" />
          <span>Save Changes</span>
        </button>
      </div>

      {savedSuccess && (
        <div className="p-3.5 rounded-xl bg-[#EAF3EF] border border-[#CFE2D9] text-[#2D4D45] text-xs font-bold flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4" />
          <span>Platform settings successfully persisted and audit logged.</span>
        </div>
      )}

      {/* Toggles Grid */}
      <div className="bg-white rounded-2xl border border-[#E7E2D8] p-6 shadow-xs space-y-6">
        <h3 className="text-sm font-bold text-[#16222F] uppercase tracking-wider">
          Feature Switches & Write Controls
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <label className="p-4 rounded-xl border border-[#E7E2D8] bg-[#FAF8F5]/60 flex items-center justify-between cursor-pointer hover:bg-[#FAF8F5] transition-colors">
            <div>
              <p className="text-xs font-bold text-[#16222F]">Allow New Registrations</p>
              <p className="text-[11px] text-[#7A8690]">Permit new professionals to create Sabi accounts</p>
            </div>
            <input
              type="checkbox"
              checked={formData.allowRegistrations}
              onChange={(e) => setFormData({ ...formData, allowRegistrations: e.target.checked })}
              className="w-4 h-4 rounded text-[#2D4D45] focus:ring-[#2D4D45] cursor-pointer"
            />
          </label>

          <label className="p-4 rounded-xl border border-[#E7E2D8] bg-[#FAF8F5]/60 flex items-center justify-between cursor-pointer hover:bg-[#FAF8F5] transition-colors">
            <div>
              <p className="text-xs font-bold text-[#16222F]">Allow Work Submissions</p>
              <p className="text-[11px] text-[#7A8690]">Permit users to document new completed work records</p>
            </div>
            <input
              type="checkbox"
              checked={formData.allowNewWorkSubmissions}
              onChange={(e) => setFormData({ ...formData, allowNewWorkSubmissions: e.target.checked })}
              className="w-4 h-4 rounded text-[#2D4D45] focus:ring-[#2D4D45] cursor-pointer"
            />
          </label>

          <label className="p-4 rounded-xl border border-[#E7E2D8] bg-[#FAF8F5]/60 flex items-center justify-between cursor-pointer hover:bg-[#FAF8F5] transition-colors">
            <div>
              <p className="text-xs font-bold text-[#16222F]">Client Confirmation Requests</p>
              <p className="text-[11px] text-[#7A8690]">Permit users to request independent client attestations</p>
            </div>
            <input
              type="checkbox"
              checked={formData.allowClientConfirmations}
              onChange={(e) => setFormData({ ...formData, allowClientConfirmations: e.target.checked })}
              className="w-4 h-4 rounded text-[#2D4D45] focus:ring-[#2D4D45] cursor-pointer"
            />
          </label>

          <label className="p-4 rounded-xl border border-[#E7E2D8] bg-[#FAF8F5]/60 flex items-center justify-between cursor-pointer hover:bg-[#FAF8F5] transition-colors">
            <div>
              <p className="text-xs font-bold text-[#16222F]">Direct Messaging Engine</p>
              <p className="text-[11px] text-[#7A8690]">Enable peer inquiry and proof-context conversations</p>
            </div>
            <input
              type="checkbox"
              checked={formData.messagingEnabled}
              onChange={(e) => setFormData({ ...formData, messagingEnabled: e.target.checked })}
              className="w-4 h-4 rounded text-[#2D4D45] focus:ring-[#2D4D45] cursor-pointer"
            />
          </label>
        </div>
      </div>

      {/* Notices Copy */}
      <div className="bg-white rounded-2xl border border-[#E7E2D8] p-6 shadow-xs space-y-4">
        <h3 className="text-sm font-bold text-[#16222F] uppercase tracking-wider">
          System Broadcast Texts
        </h3>

        <div>
          <label className="block text-xs font-bold text-[#16222F] mb-1">
            Maintenance Mode Notice Copy
          </label>
          <textarea
            value={formData.maintenanceNotice}
            onChange={(e) => setFormData({ ...formData, maintenanceNotice: e.target.value })}
            rows={2}
            className="w-full px-3 py-2 text-xs border border-[#D5CEC2] rounded-xl focus:border-[#2D4D45] focus:outline-none bg-[#FAF8F5]/50"
          />
        </div>

        <div>
          <label className="block text-xs font-bold text-[#16222F] mb-1">
            Suspension Screen Notice Copy
          </label>
          <textarea
            value={formData.suspensionNotice}
            onChange={(e) => setFormData({ ...formData, suspensionNotice: e.target.value })}
            rows={2}
            className="w-full px-3 py-2 text-xs border border-[#D5CEC2] rounded-xl focus:border-[#2D4D45] focus:outline-none bg-[#FAF8F5]/50"
          />
        </div>
      </div>
    </form>
  );
};
