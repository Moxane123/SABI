import React, { useState } from 'react';
import {
  FileText,
  Search,
  Filter,
  Download,
  Clock,
  User,
  Shield,
  ArrowRight,
  ExternalLink,
} from 'lucide-react';
import { AuditLogEntry, AuditLogCategory } from '../../../types';

interface AuditLogsSectionProps {
  auditLogs: AuditLogEntry[];
}

export const AuditLogsSection: React.FC<AuditLogsSectionProps> = ({ auditLogs }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState<string>('all');
  const [selectedLog, setSelectedLog] = useState<AuditLogEntry | null>(null);

  const categories: { id: string; label: string }[] = [
    { id: 'all', label: 'All Operations' },
    { id: 'platform', label: 'Platform State' },
    { id: 'moderation', label: 'Moderation' },
    { id: 'users', label: 'Users' },
    { id: 'reports', label: 'Reports' },
    { id: 'settings', label: 'Settings' },
    { id: 'roles', label: 'Roles' },
    { id: 'support', label: 'Support' },
    { id: 'notifications', label: 'Broadcasts' },
  ];

  const filteredLogs = auditLogs.filter((log) => {
    const term = searchTerm.toLowerCase();
    const matches =
      log.action.toLowerCase().includes(term) ||
      log.details.toLowerCase().includes(term) ||
      log.actorEmail.toLowerCase().includes(term) ||
      log.actorName.toLowerCase().includes(term);

    if (!matches) return false;
    if (categoryFilter !== 'all' && log.category !== categoryFilter) return false;
    return true;
  });

  const handleExportJSON = () => {
    const dataStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(auditLogs, null, 2));
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute('href', dataStr);
    downloadAnchor.setAttribute('download', `sabi_audit_logs_${Date.now()}.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white rounded-2xl border border-[#E7E2D8] p-6 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-lg font-bold text-[#16222F]">
            Cryptographic Audit Ledger & Activity Log
          </h2>
          <p className="text-xs text-[#52606D]">
            Immutable record of all administrative state transitions, takedowns, suspensions, and configuration changes.
          </p>
        </div>

        <button
          onClick={handleExportJSON}
          className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl border border-[#D5CEC2] hover:bg-[#FAF8F5] text-[#16222F] text-xs font-bold transition-colors cursor-pointer self-start sm:self-auto"
        >
          <Download className="w-4 h-4 text-[#2D4D45]" />
          <span>Export Ledger (JSON)</span>
        </button>
      </div>

      {/* Filter & Search Bar */}
      <div className="bg-white rounded-2xl border border-[#E7E2D8] p-4 shadow-xs space-y-3">
        <div className="relative">
          <Search className="w-4 h-4 text-[#7A8690] absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search by action, details, or officer email..."
            className="w-full pl-9 pr-4 py-2 text-xs border border-[#D5CEC2] rounded-xl focus:border-[#2D4D45] focus:outline-none bg-[#FAF8F5]/60"
          />
        </div>

        <div className="flex items-center gap-1.5 overflow-x-auto pb-1">
          {categories.map((c) => (
            <button
              key={c.id}
              onClick={() => setCategoryFilter(c.id)}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition-colors cursor-pointer ${
                categoryFilter === c.id
                  ? 'bg-[#2D4D45] text-white shadow-xs'
                  : 'bg-[#FAF8F5] text-[#52606D] hover:bg-stone-200/60 border border-[#E7E2D8]'
              }`}
            >
              {c.label}
            </button>
          ))}
        </div>
      </div>

      {/* Audit Log Entries List */}
      <div className="bg-white rounded-2xl border border-[#E7E2D8] overflow-hidden shadow-xs divide-y divide-[#E7E2D8]">
        {filteredLogs.length === 0 ? (
          <div className="p-8 text-center text-xs text-[#7A8690]">
            No audit log records match the search filter.
          </div>
        ) : (
          filteredLogs.map((log) => (
            <div
              key={log.id}
              onClick={() => setSelectedLog(log)}
              className="p-4 hover:bg-[#FAF8F5]/80 transition-colors flex flex-col md:flex-row md:items-center justify-between gap-3 text-xs cursor-pointer group"
            >
              <div className="space-y-1 flex-1">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="font-mono px-2 py-0.5 rounded bg-stone-100 border border-stone-200 text-[#16222F] text-[10px] font-bold">
                    {log.action}
                  </span>
                  <span className="px-2 py-0.5 rounded bg-[#EAF3EF] text-[#2D4D45] text-[10px] font-bold uppercase">
                    {log.category}
                  </span>
                  <span className="text-[#7A8690]">by</span>
                  <span className="font-semibold text-[#16222F]">{log.actorName}</span>
                  <span className="text-[#8C98A2]">({log.actorEmail})</span>
                </div>

                <p className="text-[#52606D] text-[11px] line-clamp-2">
                  {log.details}
                </p>
              </div>

              <div className="text-right shrink-0">
                <span className="text-[11px] font-mono text-[#7A8690] block">
                  {new Date(log.timestamp).toLocaleDateString()}
                </span>
                <span className="text-[10px] font-mono text-[#8C98A2] block">
                  {new Date(log.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
                </span>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Log Detail Modal */}
      {selectedLog && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 border border-[#E7E2D8] shadow-2xl space-y-4">
            <div className="flex items-start justify-between pb-3 border-b border-[#E7E2D8]">
              <div>
                <span className="text-[10px] font-mono text-[#2D4D45] uppercase font-bold">
                  Audit Log Entry
                </span>
                <h3 className="text-sm font-bold text-[#16222F] mt-0.5">
                  {selectedLog.action}
                </h3>
              </div>
              <button
                onClick={() => setSelectedLog(null)}
                className="text-[#7A8690] hover:text-[#16222F] text-xs font-bold px-2 py-1 rounded"
              >
                Close
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div className="bg-[#FAF8F5] p-3 rounded-xl border border-[#E7E2D8] space-y-1">
                <p className="font-bold text-[#16222F]">Action Summary</p>
                <p className="text-[#52606D] leading-relaxed">{selectedLog.details}</p>
              </div>

              <div className="grid grid-cols-2 gap-2 text-[11px]">
                <div className="p-2.5 rounded-lg bg-[#FAF8F5] border border-[#E7E2D8]">
                  <span className="font-bold text-[#16222F] block">Officer Name</span>
                  <span className="text-[#52606D]">{selectedLog.actorName}</span>
                </div>
                <div className="p-2.5 rounded-lg bg-[#FAF8F5] border border-[#E7E2D8]">
                  <span className="font-bold text-[#16222F] block">Officer Email</span>
                  <span className="text-[#52606D] truncate block">{selectedLog.actorEmail}</span>
                </div>
                <div className="p-2.5 rounded-lg bg-[#FAF8F5] border border-[#E7E2D8]">
                  <span className="font-bold text-[#16222F] block">Target Type / ID</span>
                  <span className="text-[#52606D] font-mono truncate block">
                    {selectedLog.targetType || 'SYSTEM'}:{selectedLog.targetId || 'N/A'}
                  </span>
                </div>
                <div className="p-2.5 rounded-lg bg-[#FAF8F5] border border-[#E7E2D8]">
                  <span className="font-bold text-[#16222F] block">ISO Timestamp</span>
                  <span className="text-[#52606D] font-mono text-[10px] block">
                    {selectedLog.timestamp}
                  </span>
                </div>
              </div>

              {(selectedLog.previousValue || selectedLog.newValue) && (
                <div className="p-3 rounded-xl bg-stone-50 border border-stone-200 flex items-center justify-between text-xs font-mono">
                  <div>
                    <span className="text-[10px] text-[#7A8690] block">Previous</span>
                    <span className="text-rose-800 font-bold">{selectedLog.previousValue || 'N/A'}</span>
                  </div>
                  <ArrowRight className="w-4 h-4 text-[#7A8690]" />
                  <div className="text-right">
                    <span className="text-[10px] text-[#7A8690] block">New</span>
                    <span className="text-[#2D4D45] font-bold">{selectedLog.newValue || 'N/A'}</span>
                  </div>
                </div>
              )}
            </div>

            <div className="flex justify-end pt-3 border-t border-[#E7E2D8]">
              <button
                onClick={() => setSelectedLog(null)}
                className="px-4 py-1.5 rounded-xl bg-[#2D4D45] text-white text-xs font-bold cursor-pointer"
              >
                Done
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
