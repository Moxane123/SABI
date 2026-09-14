import React, { useState } from 'react';
import {
  LifeBuoy,
  MessageSquare,
  Clock,
  CheckCircle2,
  AlertTriangle,
  User,
  Send,
  Filter,
  Search,
  Plus,
} from 'lucide-react';
import { SupportTicket, AdminUser } from '../../../types';
import { operationsService } from '../../../services/operationsService';

interface SupportSectionProps {
  tickets: SupportTicket[];
  adminUser: AdminUser | null;
  onRefreshData: () => void;
}

export const SupportSection: React.FC<SupportSectionProps> = ({
  tickets,
  adminUser,
  onRefreshData,
}) => {
  const [selectedTicket, setSelectedTicket] = useState<SupportTicket | null>(tickets[0] || null);
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [replyText, setReplyText] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const filteredTickets = tickets.filter((t) => {
    if (statusFilter === 'all') return true;
    return t.status === statusFilter;
  });

  const handleSendReply = () => {
    if (!selectedTicket || !replyText.trim()) return;
    setIsSubmitting(true);

    const actor = {
      id: adminUser?.id || 'admin',
      email: adminUser?.email || 'admin@sabi.id',
      name: adminUser?.fullName || 'Sabi Support Staff',
    };

    operationsService.replyToSupportTicket(
      selectedTicket.id,
      {
        senderName: actor.name,
        senderEmail: actor.email,
        isStaff: true,
        content: replyText.trim(),
      },
      actor
    );

    // Also auto transition to in_progress if open
    if (selectedTicket.status === 'open') {
      operationsService.updateSupportTicketStatus(selectedTicket.id, 'in_progress', actor);
    }

    setReplyText('');
    setIsSubmitting(false);
    onRefreshData();

    // Update locally
    const updated = operationsService.getSupportTickets().find((t) => t.id === selectedTicket.id);
    if (updated) setSelectedTicket(updated);
  };

  const handleStatusChange = (status: SupportTicket['status']) => {
    if (!selectedTicket) return;
    const actor = {
      id: adminUser?.id || 'admin',
      email: adminUser?.email || 'admin@sabi.id',
      name: adminUser?.fullName || 'Administrator',
    };

    operationsService.updateSupportTicketStatus(selectedTicket.id, status, actor);
    onRefreshData();
    const updated = operationsService.getSupportTickets().find((t) => t.id === selectedTicket.id);
    if (updated) setSelectedTicket(updated);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white rounded-2xl border border-[#E7E2D8] p-6 shadow-xs">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h2 className="text-lg font-bold text-[#16222F]">
              Platform Support Desk & User Inquiries
            </h2>
            <p className="text-xs text-[#52606D]">
              Handle client confirmation inquiries, evidence troubleshooting, and platform guidance.
            </p>
          </div>

          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0">
            {(['all', 'open', 'in_progress', 'resolved', 'closed'] as const).map((status) => (
              <button
                key={status}
                onClick={() => setStatusFilter(status)}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold capitalize transition-colors whitespace-nowrap cursor-pointer ${
                  statusFilter === status
                    ? 'bg-[#2D4D45] text-white shadow-xs'
                    : 'bg-[#FAF8F5] text-[#52606D] hover:bg-stone-200/60 border border-[#E7E2D8]'
                }`}
              >
                {status.replace('_', ' ')}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Dual Pane Layout: Ticket List & Conversation Thread */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Ticket List (5 Cols) */}
        <div className="lg:col-span-5 bg-white rounded-2xl border border-[#E7E2D8] overflow-hidden shadow-xs divide-y divide-[#E7E2D8] max-h-[600px] overflow-y-auto">
          {filteredTickets.length === 0 ? (
            <div className="p-8 text-center text-xs text-[#7A8690]">
              No tickets found in this queue.
            </div>
          ) : (
            filteredTickets.map((t) => {
              const isSelected = selectedTicket?.id === t.id;
              return (
                <div
                  key={t.id}
                  onClick={() => setSelectedTicket(t)}
                  className={`p-4 transition-colors cursor-pointer text-xs space-y-1.5 ${
                    isSelected ? 'bg-[#FAF8F5] border-l-4 border-l-[#2D4D45]' : 'hover:bg-[#FAF8F5]/60'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="font-mono text-[10px] font-bold text-[#7A8690]">
                      {t.ticketNumber}
                    </span>
                    <span className={`px-2 py-0.5 rounded text-[10px] font-bold capitalize ${
                      t.status === 'open'
                        ? 'bg-rose-50 text-rose-800 border border-rose-200'
                        : t.status === 'in_progress'
                        ? 'bg-amber-50 text-amber-800 border border-amber-200'
                        : 'bg-[#EAF3EF] text-[#2D4D45] border border-[#CFE2D9]'
                    }`}>
                      {t.status.replace('_', ' ')}
                    </span>
                  </div>

                  <h4 className="font-bold text-[#16222F] line-clamp-1">
                    {t.subject}
                  </h4>

                  <p className="text-[11px] text-[#7A8690] truncate">
                    {t.userName} · {t.userEmail}
                  </p>
                </div>
              );
            })
          )}
        </div>

        {/* Conversation Thread (7 Cols) */}
        <div className="lg:col-span-7 bg-white rounded-2xl border border-[#E7E2D8] p-6 shadow-xs flex flex-col h-[600px]">
          {selectedTicket ? (
            <>
              {/* Thread Header */}
              <div className="pb-4 border-b border-[#E7E2D8] flex items-start justify-between gap-4">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-mono font-bold text-xs text-[#2D4D45]">
                      {selectedTicket.ticketNumber}
                    </span>
                    <span className="text-xs text-[#7A8690]">·</span>
                    <span className="text-xs font-bold text-[#16222F] capitalize">
                      Category: {selectedTicket.category.replace('_', ' ')}
                    </span>
                  </div>
                  <h3 className="font-bold text-sm text-[#16222F] mt-1">
                    {selectedTicket.subject}
                  </h3>
                  <p className="text-[11px] text-[#7A8690]">
                    From: {selectedTicket.userName} ({selectedTicket.userEmail})
                  </p>
                </div>

                {/* Status Switcher */}
                <select
                  value={selectedTicket.status}
                  onChange={(e) => handleStatusChange(e.target.value as SupportTicket['status'])}
                  className="text-xs font-bold px-3 py-1.5 rounded-xl border border-[#D5CEC2] bg-[#FAF8F5] focus:outline-none focus:border-[#2D4D45]"
                >
                  <option value="open">Open</option>
                  <option value="in_progress">In Progress</option>
                  <option value="resolved">Resolved</option>
                  <option value="closed">Closed</option>
                </select>
              </div>

              {/* Message History */}
              <div className="flex-1 overflow-y-auto py-4 space-y-3">
                {selectedTicket.messages.map((m) => (
                  <div
                    key={m.id}
                    className={`p-3.5 rounded-xl max-w-[85%] text-xs space-y-1 ${
                      m.isStaff
                        ? 'ml-auto bg-[#EAF3EF] border border-[#CFE2D9] text-[#16222F]'
                        : 'bg-[#FAF8F5] border border-[#E7E2D8] text-[#16222F]'
                    }`}
                  >
                    <div className="flex items-center justify-between gap-2 text-[10px]">
                      <span className="font-bold">
                        {m.isStaff ? `Staff (${m.senderName})` : m.senderName}
                      </span>
                      <span className="text-[#7A8690]">
                        {new Date(m.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </span>
                    </div>
                    <p className="whitespace-pre-wrap leading-relaxed">{m.content}</p>
                  </div>
                ))}
              </div>

              {/* Reply Box */}
              <div className="pt-3 border-t border-[#E7E2D8] flex items-center gap-2">
                <input
                  type="text"
                  value={replyText}
                  onChange={(e) => setReplyText(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleSendReply()}
                  placeholder="Type an official response to the user..."
                  className="flex-1 px-3 py-2 text-xs border border-[#D5CEC2] rounded-xl focus:border-[#2D4D45] focus:outline-none bg-[#FAF8F5]/50"
                />
                <button
                  onClick={handleSendReply}
                  disabled={isSubmitting || !replyText.trim()}
                  className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-[#2D4D45] hover:bg-[#223B35] text-white text-xs font-bold cursor-pointer disabled:opacity-50 shadow-xs"
                >
                  <Send className="w-3.5 h-3.5" />
                  <span>Reply</span>
                </button>
              </div>
            </>
          ) : (
            <div className="flex items-center justify-center h-full text-xs text-[#7A8690]">
              Select a support inquiry to review conversation thread.
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
