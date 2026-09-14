import React, { useState } from 'react';
import {
  Bell,
  Plus,
  AlertTriangle,
  Info,
  CheckCircle2,
  Trash2,
  ToggleLeft,
  ToggleRight,
  Megaphone,
} from 'lucide-react';
import { OperationsNotification, AdminUser } from '../../../types';
import { operationsService } from '../../../services/operationsService';

interface NotificationsSectionProps {
  notifications: OperationsNotification[];
  adminUser: AdminUser | null;
  onRefreshData: () => void;
}

export const NotificationsSection: React.FC<NotificationsSectionProps> = ({
  notifications,
  adminUser,
  onRefreshData,
}) => {
  const [isCreating, setIsCreating] = useState(false);
  const [title, setTitle] = useState('');
  const [message, setMessage] = useState('');
  const [type, setType] = useState<OperationsNotification['type']>('operational');
  const [broadcastToAll, setBroadcastToAll] = useState(true);

  const handleCreate = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !message.trim()) return;

    const actor = {
      id: adminUser?.id || 'admin',
      email: adminUser?.email || 'admin@sabi.id',
      name: adminUser?.fullName || 'Administrator',
    };

    operationsService.createNotification(
      {
        title: title.trim(),
        message: message.trim(),
        type,
        broadcastToAll,
      },
      actor
    );

    setTitle('');
    setMessage('');
    setIsCreating(false);
    onRefreshData();
  };

  const handleToggle = (id: string, active: boolean) => {
    const actor = {
      id: adminUser?.id || 'admin',
      email: adminUser?.email || 'admin@sabi.id',
      name: adminUser?.fullName || 'Administrator',
    };
    operationsService.toggleNotification(id, active, actor);
    onRefreshData();
  };

  const handleDelete = (id: string) => {
    const actor = {
      id: adminUser?.id || 'admin',
      email: adminUser?.email || 'admin@sabi.id',
      name: adminUser?.fullName || 'Administrator',
    };
    operationsService.deleteNotification(id, actor);
    onRefreshData();
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white rounded-2xl border border-[#E7E2D8] p-6 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-lg font-bold text-[#16222F]">
            Platform Broadcasts & System Notices
          </h2>
          <p className="text-xs text-[#52606D]">
            Broadcast system updates, operational alerts, and maintenance advisories to active users.
          </p>
        </div>

        <button
          onClick={() => setIsCreating(!isCreating)}
          className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-[#2D4D45] text-white text-xs font-bold hover:bg-[#223B35] transition-colors cursor-pointer shadow-xs self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" />
          <span>New Broadcast</span>
        </button>
      </div>

      {/* Create Broadcast Form */}
      {isCreating && (
        <form
          onSubmit={handleCreate}
          className="bg-white rounded-2xl border border-[#E7E2D8] p-6 shadow-xs space-y-4 animate-in fade-in duration-150"
        >
          <h3 className="text-sm font-bold text-[#16222F]">
            Draft Platform Announcement
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-[#16222F] mb-1">
                Notice Title
              </label>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="E.g., Client Confirmation Engine Upgrade Complete"
                className="w-full px-3 py-2 text-xs border border-[#D5CEC2] rounded-xl focus:border-[#2D4D45] focus:outline-none bg-[#FAF8F5]/50"
                required
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-[#16222F] mb-1">
                Notice Category
              </label>
              <select
                value={type}
                onChange={(e) => setType(e.target.value as OperationsNotification['type'])}
                className="w-full px-3 py-2 text-xs border border-[#D5CEC2] rounded-xl focus:border-[#2D4D45] focus:outline-none bg-[#FAF8F5]/50"
              >
                <option value="operational">Operational Update (Green)</option>
                <option value="advisory">Advisory Notice (Blue)</option>
                <option value="maintenance">Maintenance Warning (Amber)</option>
                <option value="update">Feature Release (Neutral)</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-[#16222F] mb-1">
              Notice Body
            </label>
            <textarea
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder="Full copy to display to platform visitors..."
              rows={3}
              className="w-full px-3 py-2 text-xs border border-[#D5CEC2] rounded-xl focus:border-[#2D4D45] focus:outline-none bg-[#FAF8F5]/50"
              required
            />
          </div>

          <div className="flex items-center justify-end gap-2 pt-2 border-t border-[#E7E2D8]">
            <button
              type="button"
              onClick={() => setIsCreating(false)}
              className="px-3 py-1.5 text-xs text-[#52606D] font-semibold cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 rounded-xl bg-[#2D4D45] text-white text-xs font-bold hover:bg-[#223B35] cursor-pointer shadow-xs"
            >
              Publish Broadcast
            </button>
          </div>
        </form>
      )}

      {/* Notifications List */}
      <div className="space-y-3">
        {notifications.length === 0 ? (
          <div className="bg-white rounded-2xl border border-[#E7E2D8] p-8 text-center text-xs text-[#7A8690]">
            No announcements currently in ledger.
          </div>
        ) : (
          notifications.map((n) => (
            <div
              key={n.id}
              className={`bg-white rounded-2xl border p-5 shadow-xs transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-4 ${
                n.active ? 'border-[#2D4D45]/40' : 'border-[#E7E2D8] opacity-60'
              }`}
            >
              <div className="space-y-1">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
                    n.type === 'operational'
                      ? 'bg-[#EAF3EF] text-[#2D4D45] border border-[#CFE2D9]'
                      : n.type === 'maintenance'
                      ? 'bg-amber-50 text-amber-900 border border-amber-200'
                      : 'bg-blue-50 text-blue-900 border border-blue-200'
                  }`}>
                    {n.type}
                  </span>
                  <h4 className="font-bold text-xs text-[#16222F]">{n.title}</h4>
                  <span className="text-[10px] text-[#7A8690]">· {new Date(n.createdAt).toLocaleDateString()}</span>
                </div>
                <p className="text-xs text-[#52606D]">{n.message}</p>
              </div>

              <div className="flex items-center gap-3 shrink-0">
                <button
                  onClick={() => handleToggle(n.id, !n.active)}
                  className="flex items-center gap-1.5 text-xs font-bold text-[#52606D] hover:text-[#16222F] cursor-pointer"
                >
                  {n.active ? (
                    <>
                      <ToggleRight className="w-5 h-5 text-[#2D4D45]" />
                      <span className="text-[#2D4D45]">Live</span>
                    </>
                  ) : (
                    <>
                      <ToggleLeft className="w-5 h-5 text-[#7A8690]" />
                      <span>Inactive</span>
                    </>
                  )}
                </button>

                <button
                  onClick={() => handleDelete(n.id)}
                  className="p-1.5 rounded-lg text-rose-700 hover:bg-rose-50 transition-colors cursor-pointer"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};
