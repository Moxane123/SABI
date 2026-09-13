import React, { useState } from 'react';
import {
  ShieldCheck,
  CheckCircle2,
  Calendar,
  MapPin,
  FileCheck2,
  Check,
  XCircle,
  AlertCircle,
  ExternalLink,
  MessageSquare,
  ArrowRight
} from 'lucide-react';
import { ClientConfirmation, WorkRecord, UserProfile } from '../types';
import { db } from '../services/db';

interface ClientConfirmViewProps {
  confirmationData: {
    confirmation: ClientConfirmation;
    work: WorkRecord;
    user: UserProfile;
  };
  onConfirmationComplete: () => void;
  onReturnToApp: () => void;
}

export const ClientConfirmView: React.FC<ClientConfirmViewProps> = ({
  confirmationData,
  onConfirmationComplete,
  onReturnToApp,
}) => {
  const { confirmation, work, user } = confirmationData;

  const isAlreadyConfirmed = confirmation.status === 'confirmed';
  const isAlreadyDeclined = confirmation.status === 'declined';

  const [activeAction, setActiveAction] = useState<'confirm' | 'decline'>('confirm');
  const [clientName, setClientName] = useState(confirmation.clientName || '');
  const [clientRole, setClientRole] = useState(confirmation.clientRole || '');
  const [testimonial, setTestimonial] = useState(confirmation.testimonial || '');
  const [declineReason, setDeclineReason] = useState(confirmation.declinedReason || '');
  const [agreed, setAgreed] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [statusResult, setStatusResult] = useState<'idle' | 'confirmed' | 'declined'>(
    isAlreadyConfirmed ? 'confirmed' : isAlreadyDeclined ? 'declined' : 'idle'
  );

  const handleConfirmSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!agreed) {
      alert('Please check the confirmation box to confirm this work.');
      return;
    }

    setIsSubmitting(true);
    const confirmed = db.confirmWorkRecord(
      confirmation.token,
      clientName.trim() || 'Verified Client',
      testimonial.trim(),
      clientRole.trim() || undefined
    );

    setIsSubmitting(false);
    if (confirmed) {
      setStatusResult('confirmed');
      onConfirmationComplete();
    } else {
      alert('Unable to submit confirmation. Please refresh and try again.');
    }
  };

  const handleDeclineSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    const declined = db.declineWorkRecord(
      confirmation.token,
      clientName.trim() || undefined,
      declineReason.trim() || undefined
    );

    setIsSubmitting(false);
    if (declined) {
      setStatusResult('declined');
      onConfirmationComplete();
    } else {
      alert('Unable to process response. Please try again.');
    }
  };

  const evidence = work.evidenceList || db.getEvidenceByWorkId(work.id);

  return (
    <div className="min-h-screen bg-[#FAF8F5] flex flex-col justify-between text-[#1F2421]">
      {/* Brand Navigation Bar */}
      <header className="w-full bg-[#1F2421] border-b border-[#2D3530] px-4 sm:px-8 py-3.5 flex items-center justify-between sticky top-0 z-20">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-[#D4A359] text-[#1F2421] font-black flex items-center justify-center text-base tracking-wider shadow-sm">
            S
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-bold text-sm tracking-tight text-[#FAF8F5]">SABI</span>
              <span className="text-[10px] tracking-wide uppercase font-semibold px-2 py-0.5 rounded bg-[#2D3530] text-[#D4A359] border border-[#3A453F]">
                Work Confirmation
              </span>
            </div>
          </div>
        </div>

        <button
          onClick={onReturnToApp}
          className="text-xs text-[#A7B1AB] hover:text-white transition-colors"
        >
          View Public Profile
        </button>
      </header>

      {/* Main Content Area */}
      <main className="flex-1 flex items-center justify-center p-4 sm:p-6 md:p-8">
        <div className="max-w-xl w-full bg-white rounded-3xl border border-[#E7E2D8] shadow-sm overflow-hidden">
          {/* Header Banner */}
          <div className="bg-[#FAF8F5] p-5 sm:p-6 border-b border-[#E7E2D8]">
            <div className="flex items-center gap-3.5">
              <img
                src={user.profilePhoto || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=200'}
                alt={user.fullName}
                className="w-12 h-12 rounded-2xl object-cover border border-[#D5CFC2] shadow-xs"
              />
              <div className="min-w-0 flex-1">
                <p className="text-[11px] font-semibold uppercase tracking-wider text-[#7A8690]">
                  Confirmation Request from
                </p>
                <h1 className="text-base sm:text-lg font-bold text-[#1F2421] truncate">
                  {user.fullName}
                </h1>
                <p className="text-xs text-[#52606D] truncate">
                  {user.profession} {user.location ? `• ${user.location}` : ''}
                </p>
              </div>
            </div>
          </div>

          {/* STATE 1: Already Confirmed or Just Confirmed */}
          {statusResult === 'confirmed' ? (
            <div className="p-6 sm:p-8 text-center space-y-5">
              <div className="w-16 h-16 rounded-2xl bg-[#EAF3EF] text-[#2D4D45] flex items-center justify-center mx-auto border border-[#CFE2D9] shadow-xs">
                <CheckCircle2 className="w-8 h-8" />
              </div>

              <div>
                <span className="text-[11px] font-semibold uppercase tracking-wider px-2.5 py-1 rounded-full bg-[#EAF3EF] text-[#2D4D45] border border-[#CFE2D9]">
                  Client Confirmed
                </span>
                <h2 className="text-xl font-bold text-[#1F2421] mt-3">
                  Work Record Confirmed
                </h2>
                <p className="text-xs sm:text-sm text-[#52606D] mt-1.5 max-w-md mx-auto leading-relaxed">
                  Thank you! Your independent confirmation has been permanently attached to <strong>{user.fullName}</strong>'s proof record.
                </p>
              </div>

              <div className="bg-[#FAF8F5] p-4 rounded-2xl border border-[#E7E2D8] text-left text-xs space-y-2 max-w-md mx-auto">
                <div>
                  <span className="text-[10px] font-semibold text-[#7A8690] uppercase tracking-wider block">
                    Confirmed Deliverable
                  </span>
                  <p className="font-bold text-[#1F2421] text-sm">{work.title}</p>
                </div>
                <div className="grid grid-cols-2 gap-2 pt-1 border-t border-[#E7E2D8]">
                  <div>
                    <span className="text-[10px] text-[#7A8690] block">Confirmed by</span>
                    <span className="font-semibold text-[#1F2421]">
                      {clientName || confirmation.clientName || 'Independent Client'}
                      {clientRole ? ` (${clientRole})` : ''}
                    </span>
                  </div>
                  <div>
                    <span className="text-[10px] text-[#7A8690] block">Completion Date</span>
                    <span className="font-semibold text-[#1F2421]">
                      {work.completionDate || 'Recorded on file'}
                    </span>
                  </div>
                </div>

                {testimonial && (
                  <div className="pt-2 border-t border-[#E7E2D8]">
                    <span className="text-[10px] text-[#7A8690] block mb-1">Your Testimonial</span>
                    <p className="italic text-[#2D3530] bg-white p-3 rounded-xl border border-[#E7E2D8]">
                      “{testimonial}”
                    </p>
                  </div>
                )}
              </div>

              <div className="pt-3">
                <button
                  onClick={onReturnToApp}
                  className="w-full sm:w-auto px-6 py-2.5 bg-[#1F2421] hover:bg-[#2D3530] text-[#FAF8F5] text-xs font-bold rounded-xl transition-colors inline-flex items-center justify-center gap-2"
                >
                  <span>View Verified Profile</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          ) : statusResult === 'declined' ? (
            /* STATE 2: Declined */
            <div className="p-6 sm:p-8 text-center space-y-5">
              <div className="w-16 h-16 rounded-2xl bg-[#FDF5EA] text-[#93652E] flex items-center justify-center mx-auto border border-[#F3DFC3] shadow-xs">
                <AlertCircle className="w-8 h-8" />
              </div>

              <div>
                <h2 className="text-xl font-bold text-[#1F2421]">
                  Response Recorded
                </h2>
                <p className="text-xs sm:text-sm text-[#52606D] mt-1.5 max-w-md mx-auto leading-relaxed">
                  Thank you for your response. We have recorded that this work deliverable could not be confirmed.
                </p>
              </div>

              <div className="bg-[#FAF8F5] p-4 rounded-2xl border border-[#E7E2D8] text-left text-xs max-w-md mx-auto text-[#52606D]">
                <p>
                  SABI relies on genuine client confirmations to guarantee transparency and trust. The record will remain self-documented or evidence-backed rather than client-confirmed.
                </p>
              </div>

              <div className="pt-2">
                <button
                  onClick={onReturnToApp}
                  className="px-5 py-2.5 bg-[#1F2421] text-[#FAF8F5] text-xs font-bold rounded-xl"
                >
                  Back to SABI
                </button>
              </div>
            </div>
          ) : (
            /* STATE 3: Active Confirmation Flow */
            <div className="p-5 sm:p-7 space-y-6">
              {/* Work Details Document Card */}
              <div className="p-4 sm:p-5 rounded-2xl bg-[#FAF8F5] border border-[#E7E2D8] space-y-3">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-semibold uppercase tracking-wider text-[#4D7A70] text-[11px]">
                    {work.category}
                  </span>
                  {work.completionDate && (
                    <span className="flex items-center gap-1 text-[#7A8690] text-[11px] font-medium">
                      <Calendar className="w-3.5 h-3.5 text-[#A7B1AB]" />
                      Completed: {work.completionDate}
                    </span>
                  )}
                </div>

                <div>
                  <h3 className="text-base sm:text-lg font-bold text-[#1F2421] leading-snug">
                    {work.title}
                  </h3>
                  <p className="text-xs text-[#4A5560] leading-relaxed whitespace-pre-line mt-1.5">
                    {work.description}
                  </p>
                </div>

                {/* Optional Creator Note */}
                {confirmation.note && (
                  <div className="p-3 bg-[#FFFDF9] border border-[#F3DFC3] rounded-xl text-xs text-[#93652E]">
                    <span className="font-bold block mb-0.5 text-[#93652E]">
                      Note from {user.fullName}:
                    </span>
                    <p className="italic">“{confirmation.note}”</p>
                  </div>
                )}

                {/* Skills Demonstrated */}
                {work.skillsDemonstrated && work.skillsDemonstrated.length > 0 && (
                  <div className="pt-2 border-t border-[#E7E2D8]">
                    <span className="text-[10px] font-semibold uppercase tracking-wider text-[#7A8690] block mb-1.5">
                      Skills Demonstrated
                    </span>
                    <div className="flex flex-wrap gap-1.5">
                      {work.skillsDemonstrated.map((sk, i) => (
                        <span
                          key={i}
                          className="text-[11px] px-2.5 py-0.5 rounded-md bg-white text-[#2D3530] border border-[#DDD7CD] font-medium"
                        >
                          {sk}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                {/* Evidence items preview if present */}
                {evidence.length > 0 && (
                  <div className="pt-2 border-t border-[#E7E2D8]">
                    <span className="text-[10px] font-semibold uppercase tracking-wider text-[#7A8690] block mb-1.5">
                      Attached Evidence ({evidence.length})
                    </span>
                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                      {evidence.map((ev) => (
                        <div
                          key={ev.id}
                          className="p-2 rounded-xl bg-white border border-[#E7E2D8] flex items-center gap-2 overflow-hidden"
                        >
                          {ev.type === 'image' ? (
                            <img
                              src={ev.url}
                              alt=""
                              className="w-9 h-9 rounded-lg object-cover shrink-0 border border-[#E7E2D8]"
                            />
                          ) : (
                            <div className="w-9 h-9 rounded-lg bg-[#FAF8F5] border border-[#E7E2D8] flex items-center justify-center shrink-0">
                              <FileCheck2 className="w-4 h-4 text-[#4D7A70]" />
                            </div>
                          )}
                          <div className="min-w-0 flex-1">
                            <p className="text-[11px] font-semibold text-[#1F2421] truncate">
                              {ev.caption || ev.fileName || ev.type}
                            </p>
                            <span className="text-[9px] uppercase tracking-wider text-[#7A8690]">
                              {ev.type}
                            </span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* The Core Question */}
              <div className="p-4 rounded-2xl bg-[#EAF3EF]/70 border border-[#CFE2D9] text-center">
                <p className="text-xs sm:text-sm font-semibold text-[#2D4D45]">
                  Was this work completed for you, or can you confirm this deliverable was finished as described?
                </p>
              </div>

              {/* Choice Action Selector */}
              <div className="grid grid-cols-2 gap-2 p-1 bg-[#FAF8F5] rounded-2xl border border-[#E7E2D8]">
                <button
                  type="button"
                  onClick={() => setActiveAction('confirm')}
                  className={`py-2.5 px-3 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-2 ${
                    activeAction === 'confirm'
                      ? 'bg-white text-[#2D4D45] shadow-xs border border-[#CFE2D9]'
                      : 'text-[#7A8690] hover:text-[#1F2421]'
                  }`}
                >
                  <Check className="w-4 h-4 text-[#4D7A70]" />
                  <span>Confirm Work</span>
                </button>

                <button
                  type="button"
                  onClick={() => setActiveAction('decline')}
                  className={`py-2.5 px-3 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-2 ${
                    activeAction === 'decline'
                      ? 'bg-white text-[#93652E] shadow-xs border border-[#F3DFC3]'
                      : 'text-[#7A8690] hover:text-[#1F2421]'
                  }`}
                >
                  <XCircle className="w-4 h-4 text-[#D4A359]" />
                  <span>Decline / Cannot Confirm</span>
                </button>
              </div>

              {/* FORM: Confirm Work */}
              {activeAction === 'confirm' && (
                <form onSubmit={handleConfirmSubmit} className="space-y-4 pt-1">
                  <div>
                    <label className="block text-xs font-semibold text-[#1F2421] mb-1">
                      Your Full Name <span className="text-[#C84B31]">*</span>
                    </label>
                    <input
                      type="text"
                      required
                      value={clientName}
                      onChange={(e) => setClientName(e.target.value)}
                      placeholder="e.g. Sarah Jenkins"
                      className="w-full px-3.5 py-2.5 text-xs rounded-xl border border-[#D5CFC2] focus:outline-hidden focus:border-[#4D7A70] bg-white"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-[#1F2421] mb-1">
                      Your Relationship / Role (Optional)
                    </label>
                    <input
                      type="text"
                      value={clientRole}
                      onChange={(e) => setClientRole(e.target.value)}
                      placeholder="e.g. Client, Property Owner, Project Manager"
                      className="w-full px-3.5 py-2.5 text-xs rounded-xl border border-[#D5CFC2] focus:outline-hidden focus:border-[#4D7A70] bg-white"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-[#1F2421] mb-1">
                      Testimonial or Brief Remarks (Optional)
                    </label>
                    <textarea
                      rows={3}
                      value={testimonial}
                      onChange={(e) => setTestimonial(e.target.value)}
                      placeholder="Share brief remarks on delivery quality, timeliness, craftsmanship, or your overall experience..."
                      className="w-full px-3.5 py-2.5 text-xs rounded-xl border border-[#D5CFC2] focus:outline-hidden focus:border-[#4D7A70] bg-white"
                    />
                  </div>

                  {/* Trust Agreement Checkbox */}
                  <label className="flex items-start gap-3 p-3.5 rounded-xl bg-[#FAF8F5] border border-[#E7E2D8] cursor-pointer hover:bg-white transition-colors">
                    <input
                      type="checkbox"
                      required
                      checked={agreed}
                      onChange={(e) => setAgreed(e.target.checked)}
                      className="w-4 h-4 text-[#4D7A70] rounded border-[#D5CFC2] mt-0.5 focus:ring-[#4D7A70]"
                    />
                    <span className="text-xs text-[#2D3530] leading-snug">
                      I confirm that <strong>{user.fullName}</strong> completed this deliverable as described, and I approve adding this confirmation to their professional proof record.
                    </span>
                  </label>

                  <button
                    type="submit"
                    disabled={isSubmitting || !agreed}
                    className="w-full py-3.5 bg-[#4D7A70] hover:bg-[#3D635B] disabled:opacity-40 text-[#FAF8F5] font-bold text-xs rounded-xl shadow-xs transition-colors flex items-center justify-center gap-2 cursor-pointer"
                  >
                    <CheckCircle2 className="w-4 h-4" />
                    <span>Confirm & Sign Proof Record</span>
                  </button>
                </form>
              )}

              {/* FORM: Decline Work */}
              {activeAction === 'decline' && (
                <form onSubmit={handleDeclineSubmit} className="space-y-4 pt-1">
                  <div className="p-3.5 rounded-xl bg-[#FAF8F5] border border-[#E7E2D8] text-xs text-[#52606D] leading-relaxed">
                    If you are not the person who received or supervised this work, or if the deliverable was not completed as described, please decline. This helps keep SABI records honest and verifiable.
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-[#1F2421] mb-1">
                      Reason for Declining (Optional)
                    </label>
                    <select
                      value={declineReason}
                      onChange={(e) => setDeclineReason(e.target.value)}
                      className="w-full px-3.5 py-2.5 text-xs rounded-xl border border-[#D5CFC2] focus:outline-hidden focus:border-[#4D7A70] bg-white"
                    >
                      <option value="">Select a reason...</option>
                      <option value="I am not the client for this deliverable">
                        I am not the client for this deliverable
                      </option>
                      <option value="The work was not completed as described">
                        The work was not completed as described
                      </option>
                      <option value="Work details or dates are inaccurate">
                        Work details or dates are inaccurate
                      </option>
                      <option value="Other">Other</option>
                    </select>
                  </div>

                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="w-full py-3 bg-[#FAF8F5] hover:bg-[#F3EFE6] text-[#93652E] border border-[#F3DFC3] font-bold text-xs rounded-xl shadow-xs transition-colors flex items-center justify-center gap-2 cursor-pointer"
                  >
                    <XCircle className="w-4 h-4 text-[#D4A359]" />
                    <span>Submit Decline</span>
                  </button>
                </form>
              )}
            </div>
          )}
        </div>
      </main>

      {/* Footer */}
      <footer className="py-4 text-center text-xs text-[#7A8690] border-t border-[#E7E2D8] bg-white">
        <p>SABI • Independent Proof & Verification Ledger</p>
      </footer>
    </div>
  );
};
