import React, { useState } from 'react';
import {
  ShieldCheck,
  CheckCircle2,
  Calendar,
  MapPin,
  FileCheck2,
  Check,
  Award,
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

  const [clientName, setClientName] = useState(confirmation.clientName || '');
  const [clientRole, setClientRole] = useState(confirmation.clientRole || '');
  const [testimonial, setTestimonial] = useState(confirmation.testimonial || '');
  const [agreed, setAgreed] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [success, setSuccess] = useState(isAlreadyConfirmed);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!agreed) {
      alert('Please confirm the verification checkbox.');
      return;
    }

    setIsSubmitting(true);
    const confirmed = db.confirmWorkRecord(
      confirmation.token,
      clientName.trim() || 'Verified Client',
      testimonial.trim(),
      clientRole.trim() || undefined
    );

    if (confirmed) {
      setSuccess(true);
      onConfirmationComplete();
    } else {
      alert('Failed to submit confirmation. Please try again.');
    }
    setIsSubmitting(false);
  };

  const evidence = work.evidenceList || db.getEvidenceByWorkId(work.id);

  return (
    <div className="min-h-screen bg-stone-100 flex items-center justify-center p-4 sm:p-6 text-stone-900">
      <div className="max-w-xl w-full bg-white rounded-3xl border border-stone-200 shadow-xl overflow-hidden">
        {/* Top Header */}
        <div className="bg-stone-900 p-6 text-stone-100 border-b border-stone-800">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 rounded-lg bg-amber-500 text-stone-950 font-black flex items-center justify-center text-sm">
                S
              </div>
              <span className="font-bold text-sm tracking-tight text-white">SABI</span>
              <span className="text-[10px] uppercase font-mono px-2 py-0.5 rounded bg-stone-800 text-amber-400 border border-stone-700">
                Client Verification Portal
              </span>
            </div>
            <button
              onClick={onReturnToApp}
              className="text-xs text-stone-400 hover:text-white"
            >
              Back to SABI
            </button>
          </div>

          <h1 className="text-xl sm:text-2xl font-bold text-white">
            Client Proof Verification
          </h1>
          <p className="text-xs sm:text-sm text-stone-400 mt-1">
            You were requested by <strong className="text-amber-400">{user.fullName}</strong> to verify completed work for their professional proof profile.
          </p>
        </div>

        {/* Success Screen */}
        {success ? (
          <div className="p-8 text-center space-y-4">
            <div className="w-16 h-16 rounded-2xl bg-emerald-100 text-emerald-700 flex items-center justify-center mx-auto shadow-sm">
              <CheckCircle2 className="w-8 h-8" />
            </div>

            <div>
              <h2 className="text-xl font-extrabold text-stone-900">
                Verification Recorded!
              </h2>
              <p className="text-xs sm:text-sm text-stone-600 mt-1 max-w-md mx-auto">
                Thank you! Your confirmation and testimonial have been cryptographically linked to <strong>{user.fullName}</strong>’s portable proof profile.
              </p>
            </div>

            <div className="bg-emerald-50/60 p-4 rounded-xl border border-emerald-200/70 text-left text-xs space-y-1.5 max-w-md mx-auto">
              <p className="font-semibold text-emerald-950">
                Verified Job: {work.title}
              </p>
              <p className="text-emerald-800">
                Confirmed by: {clientName || confirmation.clientName}
                {clientRole ? ` (${clientRole})` : ''}
              </p>
              {testimonial && (
                <p className="italic text-stone-700 pt-1 border-t border-emerald-200/40">
                  “{testimonial}”
                </p>
              )}
            </div>

            <div className="pt-4 flex flex-col sm:flex-row items-center justify-center gap-3">
              <button
                onClick={onReturnToApp}
                className="w-full sm:w-auto px-5 py-2.5 bg-stone-900 hover:bg-stone-800 text-stone-100 text-xs font-bold rounded-xl transition-colors"
              >
                View {user.fullName}’s Proof Profile
              </button>
            </div>
          </div>
        ) : (
          /* Confirmation Form */
          <div className="p-6 space-y-6">
            {/* Work Record Deliverable Summary */}
            <div className="p-4 rounded-2xl bg-stone-50 border border-stone-200 space-y-2.5">
              <div className="flex items-center justify-between text-xs text-stone-500">
                <span className="font-semibold uppercase tracking-wider text-stone-700">
                  {work.category}
                </span>
                <span className="flex items-center gap-1">
                  <Calendar className="w-3.5 h-3.5" />
                  {work.completionDate}
                </span>
              </div>

              <h3 className="text-base font-bold text-stone-900">
                {work.title}
              </h3>

              <p className="text-xs text-stone-700 leading-relaxed whitespace-pre-line">
                {work.description}
              </p>

              {confirmation.note && (
                <div className="p-3 bg-amber-50/70 border border-amber-200 rounded-xl text-xs text-amber-950">
                  <p className="font-semibold text-amber-900 mb-0.5">Note from {user.fullName}:</p>
                  <p className="italic">“{confirmation.note}”</p>
                </div>
              )}

              {/* Skills */}
              <div className="flex flex-wrap gap-1 pt-1">
                {work.skillsDemonstrated.map((sk, i) => (
                  <span
                    key={i}
                    className="text-[11px] px-2 py-0.5 rounded bg-white text-stone-700 border border-stone-200"
                  >
                    {sk}
                  </span>
                ))}
              </div>

              {/* Evidence preview */}
              {evidence.length > 0 && (
                <div className="pt-2 border-t border-stone-200/60">
                  <p className="text-[11px] font-semibold text-stone-500 mb-1.5">
                    Attached Evidence ({evidence.length}):
                  </p>
                  <div className="flex gap-2 overflow-x-auto pb-1">
                    {evidence.map((ev) => (
                      <div
                        key={ev.id}
                        className="w-14 h-14 rounded-lg border border-stone-300 overflow-hidden shrink-0 bg-stone-100 flex items-center justify-center text-xs"
                      >
                        {ev.type === 'image' ? (
                          <img src={ev.url} alt="" className="w-full h-full object-cover" />
                        ) : (
                          <FileCheck2 className="w-5 h-5 text-stone-500" />
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Verification Form */}
            <form onSubmit={handleSubmit} className="space-y-4">
              <h4 className="text-xs font-bold uppercase tracking-wider text-stone-900 flex items-center gap-1.5">
                <ShieldCheck className="w-4 h-4 text-emerald-600" />
                <span>Your Verification & Feedback</span>
              </h4>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-stone-700 mb-1">
                    Your Full Name <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={clientName}
                    onChange={(e) => setClientName(e.target.value)}
                    placeholder="e.g. Marcus Cole"
                    className="w-full px-3 py-2 text-xs rounded-xl border border-stone-300"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-stone-700 mb-1">
                    Your Role / Relationship
                  </label>
                  <input
                    type="text"
                    value={clientRole}
                    onChange={(e) => setClientRole(e.target.value)}
                    placeholder="e.g. Client, Managing Director, General Contractor"
                    className="w-full px-3 py-2 text-xs rounded-xl border border-stone-300"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-stone-700 mb-1">
                  Client Testimonial & Notes
                </label>
                <textarea
                  rows={3}
                  value={testimonial}
                  onChange={(e) => setTestimonial(e.target.value)}
                  placeholder="Share details regarding the quality of work, adherence to deadlines, craftsmanship, or outcome..."
                  className="w-full px-3 py-2 text-xs rounded-xl border border-stone-300"
                />
              </div>

              {/* Checkbox agreement */}
              <label className="flex items-start gap-2.5 p-3 rounded-xl bg-amber-50/70 border border-amber-200 cursor-pointer">
                <input
                  type="checkbox"
                  required
                  checked={agreed}
                  onChange={(e) => setAgreed(e.target.checked)}
                  className="w-4 h-4 text-amber-600 rounded border-stone-300 mt-0.5"
                />
                <span className="text-xs text-stone-800 leading-snug">
                  I confirm that <strong>{user.fullName}</strong> completed this deliverable as described, and I approve adding this confirmation to their verified work history.
                </span>
              </label>

              <button
                type="submit"
                disabled={isSubmitting || !agreed}
                className="w-full py-3 bg-emerald-700 hover:bg-emerald-600 disabled:opacity-40 text-white font-bold text-xs rounded-xl shadow transition-colors flex items-center justify-center gap-2"
              >
                <CheckCircle2 className="w-4 h-4" />
                <span>Confirm & Sign Proof Record</span>
              </button>
            </form>
          </div>
        )}
      </div>
    </div>
  );
};
