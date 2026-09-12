import React, { useState, useMemo } from 'react';
import {
  ShieldCheck,
  CheckCircle2,
  Calendar,
  MapPin,
  Briefcase,
  ExternalLink,
  Mail,
  Phone,
  FileCheck2,
  Video,
  FileText,
  Link as LinkIcon,
  X,
  Share2,
  Copy,
  Check,
  Filter
} from 'lucide-react';
import { UserProfile, WorkRecord, ProfileMetrics, SkillProofMetric, EvidenceItem } from '../types';

interface PublicProfileViewProps {
  user: UserProfile;
  records: WorkRecord[];
  metrics: ProfileMetrics;
  skillMetrics: SkillProofMetric[];
  onBackToEditor?: () => void;
  isOwner?: boolean;
}

export const PublicProfileView: React.FC<PublicProfileViewProps> = ({
  user,
  records,
  metrics,
  skillMetrics,
  onBackToEditor,
  isOwner = false,
}) => {
  const [selectedSkill, setSelectedSkill] = useState<string | null>(null);
  const [activeEvidenceLightbox, setActiveEvidenceLightbox] = useState<EvidenceItem | null>(null);
  const [showContactModal, setShowContactModal] = useState(false);
  const [contactSent, setContactSent] = useState(false);
  const [copiedLink, setCopiedLink] = useState(false);

  // Only public records are visible to public visitors
  const publicRecords = useMemo(() => {
    return records.filter((r) => r.visibility === 'public');
  }, [records]);

  // Filter records by selected skill if active
  const filteredRecords = useMemo(() => {
    if (!selectedSkill) return publicRecords;
    return publicRecords.filter((r) =>
      r.skillsDemonstrated.some((s) => s.toLowerCase() === selectedSkill.toLowerCase())
    );
  }, [publicRecords, selectedSkill]);

  const handleCopyLink = () => {
    navigator.clipboard.writeText(window.location.href);
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 2000);
  };

  return (
    <div className="min-h-screen bg-stone-100 text-stone-900 pb-24 selection:bg-amber-100">
      {/* Top Notification Bar for Owner */}
      {isOwner && (
        <div className="bg-stone-900 border-b border-stone-800 text-stone-200 py-2.5 px-4 text-xs">
          <div className="max-w-4xl mx-auto flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              <span>
                <strong>Public Visitor Preview:</strong> This is how clients, employers, and partners see your profile.
              </span>
            </div>
            {onBackToEditor && (
              <button
                onClick={onBackToEditor}
                className="font-bold text-amber-400 hover:text-amber-300 underline text-xs"
              >
                Return to Editor →
              </button>
            )}
          </div>
        </div>
      )}

      {/* Main Profile Header Container */}
      <div className="max-w-4xl mx-auto px-4 pt-8">
        <div className="bg-white rounded-3xl border border-stone-200/90 shadow-sm overflow-hidden mb-8">
          {/* Subtle Top Accent Banner */}
          <div className="h-28 bg-linear-to-r from-stone-900 via-stone-850 to-stone-900 relative">
            <div className="absolute right-6 bottom-3 flex items-center gap-2">
              <span className="text-[11px] font-mono uppercase tracking-wider text-stone-400 bg-stone-950/60 px-2.5 py-1 rounded-md border border-stone-700 backdrop-blur-xs">
                SABI Proof ID • Verified Record
              </span>
            </div>
          </div>

          {/* Profile Header Info */}
          <div className="px-6 sm:px-10 pb-8 relative pt-0">
            {/* Avatar positioned over banner */}
            <div className="flex flex-col sm:flex-row items-start sm:items-end justify-between gap-4 -mt-14 mb-6">
              <div className="flex flex-col sm:flex-row items-start sm:items-end gap-4">
                {user.profilePhoto ? (
                  <img
                    src={user.profilePhoto}
                    alt={user.fullName}
                    className="w-24 h-24 sm:w-28 sm:h-28 rounded-2xl object-cover border-4 border-white shadow-md bg-[#2D4D45]"
                  />
                ) : (
                  <div className="w-24 h-24 sm:w-28 sm:h-28 rounded-2xl border-4 border-white shadow-md bg-[#2D4D45] text-[#FAF8F5] flex items-center justify-center font-serif text-3xl font-bold">
                    {user.fullName ? user.fullName.charAt(0).toUpperCase() : 'S'}
                  </div>
                )}
                <div className="sm:pb-1">
                  <div className="flex items-center gap-2">
                    <h1 className="text-2xl sm:text-3xl font-extrabold text-stone-900 tracking-tight">
                      {user.fullName}
                    </h1>
                    <div className="w-5 h-5 rounded-full bg-emerald-500 text-white flex items-center justify-center" title="Verified Proof Identity">
                      <ShieldCheck className="w-3.5 h-3.5" />
                    </div>
                  </div>
                  <p className="text-sm sm:text-base font-semibold text-stone-700 mt-0.5">
                    {user.profession}
                  </p>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex items-center gap-2 w-full sm:w-auto pt-2 sm:pt-0">
                <button
                  onClick={() => setShowContactModal(true)}
                  className="flex-1 sm:flex-none px-4 py-2 bg-stone-900 hover:bg-stone-800 text-stone-100 text-xs font-bold rounded-xl shadow transition-colors flex items-center justify-center gap-1.5"
                >
                  <Mail className="w-3.5 h-3.5" />
                  <span>Contact {user.fullName.split(' ')[0]}</span>
                </button>
                <button
                  onClick={handleCopyLink}
                  className="p-2 rounded-xl border border-stone-300 hover:bg-stone-50 text-stone-700 transition-colors"
                  title="Copy Profile Link"
                >
                  {copiedLink ? <Check className="w-4 h-4 text-emerald-600" /> : <Share2 className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {/* Location & Experience meta */}
            <div className="flex flex-wrap items-center gap-4 text-xs text-stone-500 mb-4 pb-4 border-b border-stone-100">
              <span className="flex items-center gap-1.5">
                <MapPin className="w-4 h-4 text-stone-400" />
                <span>{user.location}</span>
              </span>
              <span>•</span>
              <span className="flex items-center gap-1.5">
                <Briefcase className="w-4 h-4 text-stone-400" />
                <span>{user.yearsOfExperience} years active practice</span>
              </span>
              <span>•</span>
              <span className="flex items-center gap-1.5 font-mono text-stone-400">
                @{user.username}
              </span>
            </div>

            {/* Bio */}
            <p className="text-stone-700 text-sm leading-relaxed mb-6 whitespace-pre-line max-w-3xl">
              {user.shortBio}
            </p>

            {/* VERIFICATION SUMMARY BANNER */}
            <div className="bg-stone-50 rounded-2xl p-4 sm:p-5 border border-stone-200/80">
              <div className="flex items-center gap-2 mb-3">
                <ShieldCheck className="w-4 h-4 text-emerald-600" />
                <span className="text-xs font-bold uppercase tracking-wider text-stone-900">
                  Verified Proof Summary
                </span>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-center">
                <div className="bg-white p-3 rounded-xl border border-stone-200/60 shadow-2xs">
                  <span className="text-xl sm:text-2xl font-black text-stone-900">
                    {publicRecords.length}
                  </span>
                  <p className="text-[11px] text-stone-500 mt-0.5">Completed Jobs</p>
                </div>

                <div className="bg-white p-3 rounded-xl border border-stone-200/60 shadow-2xs">
                  <span className="text-xl sm:text-2xl font-black text-emerald-700">
                    {metrics.clientConfirmedRecords}
                  </span>
                  <p className="text-[11px] text-stone-500 mt-0.5">Client Confirmed</p>
                </div>

                <div className="bg-white p-3 rounded-xl border border-stone-200/60 shadow-2xs">
                  <span className="text-xl sm:text-2xl font-black text-amber-700">
                    {metrics.evidenceBackedRecords}
                  </span>
                  <p className="text-[11px] text-stone-500 mt-0.5">Evidence Backed</p>
                </div>

                <div className="bg-white p-3 rounded-xl border border-stone-200/60 shadow-2xs">
                  <span className="text-xl sm:text-2xl font-black text-stone-900">
                    {metrics.documentedSkillsCount}
                  </span>
                  <p className="text-[11px] text-stone-500 mt-0.5">Proven Skills</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* SKILLS PROOF FILTER CLOUD */}
        <div className="bg-white rounded-2xl border border-stone-200/80 p-5 mb-8 shadow-xs">
          <div className="flex items-center justify-between mb-3">
            <div>
              <h3 className="text-sm font-bold text-stone-900">Documented Skills</h3>
              <p className="text-xs text-stone-500">
                Click any skill to view the exact completed work demonstrating it.
              </p>
            </div>
            {selectedSkill && (
              <button
                onClick={() => setSelectedSkill(null)}
                className="text-xs text-amber-800 font-semibold hover:underline"
              >
                Clear filter
              </button>
            )}
          </div>

          <div className="flex flex-wrap gap-1.5">
            {skillMetrics.map((sm) => {
              const isSelected = selectedSkill?.toLowerCase() === sm.name.toLowerCase();
              return (
                <button
                  key={sm.name}
                  onClick={() => setSelectedSkill(isSelected ? null : sm.name)}
                  className={`inline-flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-xl border transition-all ${
                    isSelected
                      ? 'bg-stone-900 text-stone-100 border-stone-900 shadow-xs'
                      : sm.isProven
                      ? 'bg-emerald-50/70 hover:bg-emerald-100 text-emerald-900 border-emerald-200'
                      : 'bg-stone-50 hover:bg-stone-100 text-stone-600 border-stone-200'
                  }`}
                >
                  {sm.isProven && (
                    <CheckCircle2 className={`w-3 h-3 ${isSelected ? 'text-amber-400' : 'text-emerald-600'}`} />
                  )}
                  <span className="font-medium">{sm.name}</span>
                  {sm.workRecordsCount > 0 && (
                    <span className={`text-[10px] px-1.5 py-0.2 rounded-full ${isSelected ? 'bg-stone-800 text-stone-300' : 'bg-stone-200/70 text-stone-600'}`}>
                      {sm.workRecordsCount}
                    </span>
                  )}
                </button>
              );
            })}
          </div>
        </div>

        {/* WORK EVIDENCE FEED */}
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-bold text-stone-900 tracking-tight flex items-center gap-2">
              <span>Documented Work Deliverables</span>
              <span className="text-xs font-mono font-semibold px-2 py-0.5 rounded-full bg-stone-200 text-stone-700">
                {filteredRecords.length}
              </span>
            </h2>
            {selectedSkill && (
              <span className="text-xs text-stone-500">
                Showing work demonstrating <strong>{selectedSkill}</strong>
              </span>
            )}
          </div>

          {filteredRecords.length === 0 ? (
            <div className="bg-white rounded-2xl border border-stone-200 p-8 text-center text-xs text-stone-500">
              No public work records found for this filter.
            </div>
          ) : (
            filteredRecords.map((record) => {
              const isConfirmed = record.confirmationStatus === 'confirmed';
              const evidence = record.evidenceList || [];

              return (
                <article
                  key={record.id}
                  className="bg-white rounded-2xl border border-stone-200/90 shadow-xs overflow-hidden transition-all hover:border-stone-300 p-6 space-y-4"
                >
                  {/* Category & Status */}
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <div className="flex items-center gap-2">
                      <span className="text-[11px] font-semibold tracking-wider uppercase px-2.5 py-0.5 rounded bg-stone-100 text-stone-700">
                        {record.category}
                      </span>
                      <span className="text-xs text-stone-400">•</span>
                      <span className="text-xs text-stone-500 flex items-center gap-1">
                        <Calendar className="w-3.5 h-3.5 text-stone-400" />
                        {record.completionDate}
                      </span>
                      {record.location && (
                        <>
                          <span className="text-xs text-stone-400">•</span>
                          <span className="text-xs text-stone-500 flex items-center gap-1">
                            <MapPin className="w-3.5 h-3.5 text-stone-400" />
                            {record.location}
                          </span>
                        </>
                      )}
                    </div>

                    {isConfirmed && (
                      <span className="inline-flex items-center gap-1 text-xs font-semibold px-2.5 py-1 rounded-full bg-emerald-50 text-emerald-800 border border-emerald-200">
                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                        <span>Client Verified</span>
                      </span>
                    )}
                  </div>

                  {/* Title & Description */}
                  <div>
                    <h3 className="text-lg font-bold text-stone-900 mb-1.5">
                      {record.title}
                    </h3>
                    <p className="text-xs sm:text-sm text-stone-700 leading-relaxed whitespace-pre-line">
                      {record.description}
                    </p>
                  </div>

                  {/* Client Testimonial Card */}
                  {isConfirmed && record.confirmation?.testimonial && (
                    <div className="p-4 rounded-xl bg-emerald-50/70 border border-emerald-200/70 text-xs sm:text-sm text-stone-800 italic flex items-start gap-2.5">
                      <span className="text-emerald-700 font-serif text-2xl leading-none">“</span>
                      <div>
                        <p className="leading-snug">{record.confirmation.testimonial}</p>
                        <p className="not-italic text-xs font-bold text-emerald-950 mt-1.5">
                          — {record.confirmation.clientName}
                          {record.confirmation.clientRole ? `, ${record.confirmation.clientRole}` : ''}
                        </p>
                      </div>
                    </div>
                  )}

                  {/* Skills tags */}
                  <div className="flex flex-wrap gap-1.5">
                    {record.skillsDemonstrated.map((skill, i) => (
                      <span
                        key={i}
                        className="text-xs px-2.5 py-0.5 rounded-lg bg-stone-100 text-stone-800 font-medium"
                      >
                        {skill}
                      </span>
                    ))}
                  </div>

                  {/* Evidence Gallery Strip */}
                  {evidence.length > 0 && (
                    <div className="pt-3 border-t border-stone-100">
                      <h4 className="text-xs font-semibold text-stone-500 mb-2 flex items-center gap-1">
                        <FileCheck2 className="w-3.5 h-3.5 text-stone-400" />
                        <span>Attached Proof ({evidence.length} items)</span>
                      </h4>

                      <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                        {evidence.map((item) => (
                          <div
                            key={item.id}
                            className="rounded-xl border border-stone-200 overflow-hidden bg-stone-50 group/ev shadow-2xs"
                          >
                            {item.type === 'image' ? (
                              <div
                                onClick={() => setActiveEvidenceLightbox(item)}
                                className="h-36 overflow-hidden cursor-zoom-in relative"
                              >
                                <img
                                  src={item.url}
                                  alt={item.caption}
                                  className="w-full h-full object-cover group-hover/ev:scale-105 transition-transform"
                                />
                                <div className="absolute inset-0 bg-black/20 opacity-0 group-hover/ev:opacity-100 transition-opacity flex items-center justify-center text-white text-xs font-semibold">
                                  Enlarge Photo
                                </div>
                              </div>
                            ) : (
                              <div className="h-28 flex flex-col items-center justify-center p-3 text-center">
                                {item.type === 'video' ? (
                                  <Video className="w-7 h-7 text-stone-600 mb-1" />
                                ) : item.type === 'document' ? (
                                  <FileText className="w-7 h-7 text-stone-600 mb-1" />
                                ) : (
                                  <LinkIcon className="w-7 h-7 text-stone-600 mb-1" />
                                )}
                                <a
                                  href={item.url}
                                  target="_blank"
                                  rel="noreferrer"
                                  className="text-xs font-bold text-amber-900 hover:underline flex items-center gap-1"
                                >
                                  <span>View {item.type}</span>
                                  <ExternalLink className="w-3 h-3" />
                                </a>
                              </div>
                            )}

                            <div className="p-2.5 bg-white border-t border-stone-100">
                              <p className="text-[11px] font-medium text-stone-800 truncate">
                                {item.caption}
                              </p>
                              <p className="text-[10px] text-stone-400 capitalize">
                                {item.type} • Verified
                              </p>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </article>
              );
            })
          )}
        </div>

        {/* Footer info */}
        <footer className="mt-16 pt-8 border-t border-stone-200 text-center text-xs text-stone-400">
          <p className="font-bold text-stone-600">SABI Professional Proof Identity</p>
          <p className="mt-0.5">What you can do should count • Evidence-based identity for real work</p>
        </footer>
      </div>

      {/* Lightbox for Image Evidence */}
      {activeEvidenceLightbox && (
        <div
          onClick={() => setActiveEvidenceLightbox(null)}
          className="fixed inset-0 z-60 bg-black/90 flex flex-col items-center justify-center p-4 cursor-zoom-out animate-in fade-in"
        >
          <img
            src={activeEvidenceLightbox.url}
            alt={activeEvidenceLightbox.caption}
            className="max-w-full max-h-[85vh] object-contain rounded-lg shadow-2xl"
          />
          <p className="text-white text-xs mt-3 bg-stone-900/80 px-4 py-1.5 rounded-full">
            {activeEvidenceLightbox.caption}
          </p>
        </div>
      )}

      {/* Contact Modal */}
      {showContactModal && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-black/60 flex items-center justify-center p-4 animate-in fade-in">
          <div className="bg-white rounded-2xl border border-stone-200 p-6 max-w-md w-full shadow-2xl text-stone-900">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-base font-bold text-stone-900">
                Contact {user.fullName}
              </h3>
              <button
                onClick={() => setShowContactModal(false)}
                className="p-1 text-stone-400 hover:text-stone-700 rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {contactSent ? (
              <div className="text-center py-6 space-y-2">
                <div className="w-12 h-12 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center mx-auto">
                  <Check className="w-6 h-6" />
                </div>
                <h4 className="font-bold text-sm text-stone-900">Inquiry Received</h4>
                <p className="text-xs text-stone-500">
                  Your message has been sent to {user.fullName}. They will receive your details at their registered email.
                </p>
                <button
                  onClick={() => {
                    setShowContactModal(false);
                    setContactSent(false);
                  }}
                  className="mt-4 px-4 py-2 bg-stone-900 text-white rounded-xl text-xs font-semibold"
                >
                  Close
                </button>
              </div>
            ) : (
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  setContactSent(true);
                }}
                className="space-y-3"
              >
                <p className="text-xs text-stone-600 mb-2">
                  Inquire about commissioning work, consulting, or hiring {user.fullName}.
                </p>

                <div>
                  <label className="block text-[11px] font-semibold text-stone-700 mb-1">
                    Your Name
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="Jane Smith"
                    className="w-full px-3 py-2 text-xs rounded-lg border border-stone-300"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-semibold text-stone-700 mb-1">
                    Your Email or Phone
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="jane@company.com or +44..."
                    className="w-full px-3 py-2 text-xs rounded-lg border border-stone-300"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-semibold text-stone-700 mb-1">
                    Message / Project Inquiry
                  </label>
                  <textarea
                    rows={4}
                    required
                    placeholder="Describe your project, timeline, or inquiry..."
                    className="w-full px-3 py-2 text-xs rounded-lg border border-stone-300"
                  />
                </div>

                <div className="flex justify-end gap-2 pt-2">
                  <button
                    type="button"
                    onClick={() => setShowContactModal(false)}
                    className="px-3 py-2 text-xs text-stone-600 hover:text-stone-900"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 bg-amber-500 hover:bg-amber-400 text-stone-950 font-bold text-xs rounded-xl shadow"
                  >
                    Send Inquiry
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
