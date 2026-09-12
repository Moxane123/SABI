import React, { useState } from 'react';
import {
  X,
  Send,
  CheckCircle2,
  Copy,
  Check,
  ExternalLink,
  ShieldCheck,
  Sparkles
} from 'lucide-react';
import { WorkRecord, ClientConfirmation } from '../types';
import { db } from '../services/db';

interface RequestConfirmModalProps {
  work: WorkRecord | null;
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export const RequestConfirmModal: React.FC<RequestConfirmModalProps> = ({
  work,
  isOpen,
  onClose,
  onSuccess,
}) => {
  if (!isOpen || !work) return null;

  const [clientName, setClientName] = useState(work.clientName || '');
  const [clientEmail, setClientEmail] = useState(work.clientEmail || '');
  const [clientNote, setClientNote] = useState('');
  const [confirmationRecord, setConfirmationRecord] = useState<ClientConfirmation | null>(
    work.confirmation || db.getConfirmationByWorkId(work.id) || null
  );
  const [copied, setCopied] = useState(false);

  const confirmUrl = confirmationRecord
    ? `${window.location.origin}${window.location.pathname}?confirm=${confirmationRecord.token}`
    : '';

  const handleGenerateRequest = (e: React.FormEvent) => {
    e.preventDefault();
    if (!clientName.trim() || !clientEmail.trim()) {
      alert('Please provide client name and email.');
      return;
    }

    const conf = db.requestClientConfirmation(
      work.id,
      clientName.trim(),
      clientEmail.trim(),
      clientNote.trim() || undefined
    );

    setConfirmationRecord(conf);
    onSuccess();
  };

  const handleCopy = () => {
    if (!confirmUrl) return;
    navigator.clipboard.writeText(confirmUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-stone-950/70 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in">
      <div className="bg-white rounded-2xl border border-stone-200 shadow-2xl max-w-md w-full overflow-hidden text-stone-900">
        <div className="px-6 py-4 border-b border-stone-200 flex items-center justify-between bg-stone-50">
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 text-emerald-600" />
            <h3 className="text-sm font-bold text-stone-900">
              Request Client Confirmation
            </h3>
          </div>
          <button
            onClick={onClose}
            className="p-1 text-stone-400 hover:text-stone-700 rounded-lg"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6 space-y-4">
          <div className="p-3 bg-stone-50 rounded-xl border border-stone-200 text-xs">
            <span className="text-stone-500 font-medium">Work Record:</span>
            <p className="font-bold text-stone-900 mt-0.5">{work.title}</p>
          </div>

          {confirmationRecord ? (
            <div className="space-y-3">
              <div className="p-3 rounded-xl bg-emerald-50 border border-emerald-200 text-xs text-emerald-900 flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                <span>
                  Confirmation request created for <strong>{confirmationRecord.clientName}</strong>!
                </span>
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-stone-700 mb-1">
                  Direct Verification Link:
                </label>
                <div className="flex items-center gap-1.5">
                  <input
                    type="text"
                    readOnly
                    value={confirmUrl}
                    className="flex-1 px-3 py-2 text-xs font-mono bg-stone-50 border border-stone-300 rounded-lg text-stone-700"
                  />
                  <button
                    onClick={handleCopy}
                    className="px-3 py-2 bg-stone-900 hover:bg-stone-800 text-white rounded-lg text-xs font-semibold flex items-center gap-1 shrink-0"
                  >
                    {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                    <span>{copied ? 'Copied' : 'Copy'}</span>
                  </button>
                </div>
              </div>

              <div className="pt-2">
                <a
                  href={confirmUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="w-full py-2 bg-amber-500 hover:bg-amber-400 text-stone-950 font-bold text-xs rounded-xl flex items-center justify-center gap-1.5 transition-colors"
                >
                  <ExternalLink className="w-3.5 h-3.5" />
                  <span>Test Client Confirmation Form Now</span>
                </a>
              </div>
            </div>
          ) : (
            <form onSubmit={handleGenerateRequest} className="space-y-3">
              <p className="text-xs text-stone-600">
                Provide client contact information to generate a secure confirmation link. They will be able to verify your deliverable and leave a testimonial.
              </p>

              <div>
                <label className="block text-xs font-semibold text-stone-700 mb-1">
                  Client Full Name or Business <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={clientName}
                  onChange={(e) => setClientName(e.target.value)}
                  placeholder="e.g. Rachel Adams"
                  className="w-full px-3 py-2 text-xs rounded-lg border border-stone-300"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-stone-700 mb-1">
                  Client Email Address <span className="text-red-500">*</span>
                </label>
                <input
                  type="email"
                  required
                  value={clientEmail}
                  onChange={(e) => setClientEmail(e.target.value)}
                  placeholder="rachel@domain.com"
                  className="w-full px-3 py-2 text-xs rounded-lg border border-stone-300"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-stone-700 mb-1">
                  Optional Short Note to Client
                </label>
                <textarea
                  rows={2}
                  value={clientNote}
                  onChange={(e) => setClientNote(e.target.value)}
                  placeholder="e.g. Hi Rachel, please take a moment to confirm that this project was completed to your satisfaction."
                  className="w-full px-3 py-2 text-xs rounded-lg border border-stone-300"
                />
              </div>

              <div className="pt-2 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={onClose}
                  className="px-3 py-2 text-xs text-stone-600 hover:text-stone-900"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-emerald-700 hover:bg-emerald-600 text-white font-bold text-xs rounded-xl shadow flex items-center gap-1.5"
                >
                  <Send className="w-3.5 h-3.5" />
                  <span>Create Confirmation Link</span>
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};
