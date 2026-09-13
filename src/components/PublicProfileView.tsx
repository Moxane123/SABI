import React, { useState, useMemo, useEffect } from 'react';
import {
  ShieldCheck,
  CheckCircle2,
  Calendar,
  MapPin,
  Briefcase,
  ExternalLink,
  Mail,
  FileCheck2,
  Video,
  FileText,
  Link as LinkIcon,
  X,
  Share2,
  Copy,
  Check,
  Filter,
  QrCode,
  Download,
  Clock,
  Sparkles,
  RotateCcw,
  Eye,
  Lock,
  MessageSquareQuote,
  Layers,
  Award,
  MessageSquare,
} from 'lucide-react';
import QRCode from 'qrcode';
import {
  UserProfile,
  WorkRecord,
  ProfileMetrics,
  SkillProofMetric,
  EvidenceItem,
  getRecordProofStatus,
  ProofStatus
} from '../types';

interface PublicProfileViewProps {
  user: UserProfile;
  records: WorkRecord[];
  metrics: ProfileMetrics;
  skillMetrics: SkillProofMetric[];
  onBackToEditor?: () => void;
  isOwner?: boolean;
  onMessage?: (user: UserProfile) => void;
}

export const PublicProfileView: React.FC<PublicProfileViewProps> = ({
  user,
  records,
  metrics,
  skillMetrics,
  onBackToEditor,
  isOwner = false,
  onMessage,
}) => {
  const [selectedSkill, setSelectedSkill] = useState<string | null>(null);
  const [activeEvidenceLightbox, setActiveEvidenceLightbox] = useState<EvidenceItem | null>(null);
  const [showContactModal, setShowContactModal] = useState(false);
  const [showShareModal, setShowShareModal] = useState(false);
  const [contactSent, setContactSent] = useState(false);
  const [copiedLink, setCopiedLink] = useState(false);
  const [qrCodeDataUrl, setQrCodeDataUrl] = useState<string>('');

  const profileUrl = typeof window !== 'undefined'
    ? `${window.location.origin}${window.location.pathname}?u=${user.username}`
    : `https://sabi.work/?u=${user.username}`;

  // Generate crisp QR code on mount / URL change
  useEffect(() => {
    QRCode.toDataURL(profileUrl, {
      width: 320,
      margin: 2,
      color: {
        dark: '#1F2421',
        light: '#FFFFFF',
      },
    })
      .then((url) => setQrCodeDataUrl(url))
      .catch((err) => console.error('Error generating QR code:', err));
  }, [profileUrl]);

  // STRICT PRIVACY: Only public records are accessible on the public profile
  const publicRecords = useMemo(() => {
    return records.filter((r) => r.visibility === 'public');
  }, [records]);

  const privateRecordsCount = records.length - publicRecords.length;

  // Chronological sort: newest completion date first
  const sortedPublicRecords = useMemo(() => {
    return [...publicRecords].sort((a, b) => {
      const dateA = new Date(a.completionDate || a.createdAt).getTime();
      const dateB = new Date(b.completionDate || b.createdAt).getTime();
      return dateB - dateA;
    });
  }, [publicRecords]);

  // Filter records by selected skill if active
  const filteredRecords = useMemo(() => {
    if (!selectedSkill) return sortedPublicRecords;
    return sortedPublicRecords.filter((r) =>
      r.skillsDemonstrated.some((s) => s.toLowerCase() === selectedSkill.toLowerCase())
    );
  }, [sortedPublicRecords, selectedSkill]);

  // Compute public proof metrics directly from public records for 100% integrity
  const publicProofSummary = useMemo(() => {
    let clientConfirmed = 0;
    let evidenceBacked = 0;
    const skillsSet = new Set<string>();

    publicRecords.forEach((r) => {
      const status = getRecordProofStatus(r);
      if (status === 'Client-confirmed') {
        clientConfirmed++;
      }
      const hasEvidence = (r.evidenceList && r.evidenceList.length > 0) || r.evidenceStatus === 'attached' || r.evidenceStatus === 'verified';
      if (hasEvidence) {
        evidenceBacked++;
      }
      r.skillsDemonstrated.forEach((s) => {
        if (s.trim()) skillsSet.add(s.trim());
      });
    });

    return {
      totalPublicWork: publicRecords.length,
      clientConfirmed,
      evidenceBacked,
      skillsDemonstratedCount: skillsSet.size,
    };
  }, [publicRecords]);

  // DEMONSTRATED SKILLS: Skills connected to 1 or more public documented works
  const demonstratedSkillsWithCounts = useMemo(() => {
    const map = new Map<string, { total: number; evidence: number; confirmed: number }>();

    publicRecords.forEach((r) => {
      const status = getRecordProofStatus(r);
      const isConfirmed = status === 'Client-confirmed';
      const hasEvidence = (r.evidenceList && r.evidenceList.length > 0) || r.evidenceStatus === 'attached' || r.evidenceStatus === 'verified';

      r.skillsDemonstrated.forEach((s) => {
        const key = s.trim();
        if (!key) return;
        const current = map.get(key) || { total: 0, evidence: 0, confirmed: 0 };
        current.total += 1;
        if (hasEvidence) current.evidence += 1;
        if (isConfirmed) current.confirmed += 1;
        map.set(key, current);
      });
    });

    const result: Array<{
      name: string;
      workCount: number;
      evidenceCount: number;
      confirmedCount: number;
      isProven: boolean;
      isConfirmed: boolean;
    }> = [];

    map.forEach((val, name) => {
      result.push({
        name,
        workCount: val.total,
        evidenceCount: val.evidence,
        confirmedCount: val.confirmed,
        isProven: val.evidence > 0 || val.confirmed > 0,
        isConfirmed: val.confirmed > 0,
      });
    });

    // Sort by work count descending
    return result.sort((a, b) => b.workCount - a.workCount || a.name.localeCompare(b.name));
  }, [publicRecords]);

  // PROFILE SKILLS: Listed by user on profile, but not connected to any public documented work
  const profileOnlySkills = useMemo(() => {
    if (!user.skills || user.skills.length === 0) return [];
    const demLower = new Set(demonstratedSkillsWithCounts.map((s) => s.name.toLowerCase()));
    return user.skills.filter((sk) => !demLower.has(sk.toLowerCase().trim()));
  }, [user.skills, demonstratedSkillsWithCounts]);

  const handleCopyLink = () => {
    navigator.clipboard.writeText(profileUrl);
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 2000);
  };

  const handleNativeShare = async () => {
    if (typeof navigator !== 'undefined' && 'share' in navigator) {
      try {
        await navigator.share({
          title: `${user.fullName} — Professional Proof Profile`,
          text: `Explore documented work, evidence, and client confirmations for ${user.fullName} on SABI.`,
          url: profileUrl,
        });
        return;
      } catch {
        // User dismissed share dialog
      }
    }
    setShowShareModal(true);
  };

  return (
    <div className="min-h-screen bg-[#FAF8F5] text-[#16222F] pb-28 selection:bg-[#EAF3EF] selection:text-[#2D4D45]">
      
      {/* Top Banner for Profile Owner */}
      {isOwner && (
        <div className="bg-[#1F2421] border-b border-[#2D3530] text-[#FAF8F5] py-2.5 px-4 text-xs sticky top-0 z-30 shadow-xs">
          <div className="max-w-4xl mx-auto flex items-center justify-between gap-4">
            <div className="flex items-center gap-2">
              <Eye className="w-3.5 h-3.5 text-[#E5B869]" />
              <span>
                <strong>Public Visitor Preview:</strong> Showing {publicRecords.length} public work deliverables.
                {privateRecordsCount > 0 && (
                  <span className="text-stone-400 ml-1">
                    ({privateRecordsCount} private/unlisted records are hidden from public view).
                  </span>
                )}
              </span>
            </div>
            {onBackToEditor && (
              <button
                onClick={onBackToEditor}
                className="font-bold text-[#E5B869] hover:text-[#F3DFC3] underline text-xs cursor-pointer transition-colors"
              >
                Return to Editor / Dashboard →
              </button>
            )}
          </div>
        </div>
      )}

      {/* Main Container */}
      <div className="max-w-4xl mx-auto px-4 sm:px-6 pt-6 sm:pt-8">
        
        {/* 1. PROFILE HEADER CARD */}
        <header className="bg-white rounded-3xl border border-[#E7E2D8] shadow-xs overflow-hidden mb-8">
          
          {/* Subtle Accent Banner */}
          <div className="h-28 sm:h-32 bg-[#1F2421] relative overflow-hidden flex items-end justify-end p-4">
            <div className="flex items-center gap-2">
              <span className="text-[11px] font-mono tracking-wider uppercase text-stone-300 bg-black/40 px-2.5 py-1 rounded-md border border-white/10 backdrop-blur-xs">
                SABI Proof Profile • Public Record
              </span>
            </div>
          </div>

          <div className="px-6 sm:px-10 pb-8 pt-0 relative">
            
            {/* Avatar & Action Row */}
            <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 -mt-14 sm:-mt-16 mb-6">
              
              {/* Photo & Identity */}
              <div className="flex flex-col sm:flex-row sm:items-end gap-4">
                {user.profilePhoto ? (
                  <img
                    src={user.profilePhoto}
                    alt={user.fullName}
                    className="w-24 h-24 sm:w-28 sm:h-28 rounded-2xl object-cover border-4 border-white shadow-md bg-[#2D4D45] shrink-0"
                  />
                ) : (
                  <div className="w-24 h-24 sm:w-28 sm:h-28 rounded-2xl border-4 border-white shadow-md bg-[#2D4D45] text-[#FAF8F5] flex items-center justify-center font-serif text-3xl font-bold shrink-0">
                    {user.fullName ? user.fullName.charAt(0).toUpperCase() : 'S'}
                  </div>
                )}

                <div className="sm:pb-1 space-y-0.5">
                  <div className="flex items-center gap-2">
                    <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-[#16222F]">
                      {user.fullName}
                    </h1>
                    <span
                      title="SABI Proof Profile"
                      className="w-5 h-5 rounded-full bg-[#4D7A70] text-white flex items-center justify-center shrink-0"
                    >
                      <ShieldCheck className="w-3.5 h-3.5" />
                    </span>
                  </div>

                  <p className="text-base font-semibold text-[#2D4D45]">
                    {user.profession}
                  </p>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex flex-wrap items-center gap-2 pt-2 sm:pt-0">
                {!isOwner && onMessage && (
                  <button
                    id={`btn-message-profile-${user.id}`}
                    onClick={() => onMessage(user)}
                    className="px-4 py-2 bg-[#2D4D45] hover:bg-[#203731] text-white text-xs font-bold rounded-xl shadow-xs transition-colors flex items-center justify-center gap-1.5 cursor-pointer active:scale-95"
                  >
                    <MessageSquare className="w-3.5 h-3.5" />
                    <span>Message</span>
                  </button>
                )}

                <button
                  onClick={() => setShowContactModal(true)}
                  className="px-3.5 py-2 bg-[#1F2421] hover:bg-[#2D3530] text-[#FAF8F5] text-xs font-bold rounded-xl shadow-xs transition-colors flex items-center justify-center gap-1.5 cursor-pointer active:scale-95"
                >
                  <Mail className="w-3.5 h-3.5" />
                  <span>Contact</span>
                </button>

                <button
                  onClick={handleNativeShare}
                  className="px-3.5 py-2 rounded-xl bg-stone-100 hover:bg-stone-200 text-[#16222F] text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer border border-stone-200"
                  title="Share or scan QR code"
                >
                  <QrCode className="w-3.5 h-3.5 text-[#4D7A70]" />
                  <span>Share / QR</span>
                </button>

                <button
                  onClick={handleCopyLink}
                  className="p-2 rounded-xl border border-stone-200 bg-white hover:bg-stone-100 text-[#52606D] hover:text-[#16222F] transition-colors cursor-pointer"
                  title="Copy Profile Link"
                >
                  {copiedLink ? <Check className="w-4 h-4 text-[#4D7A70]" /> : <Copy className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {/* Location & Experience meta */}
            <div className="flex flex-wrap items-center gap-3 sm:gap-4 text-xs text-[#7A8690] mb-5 pb-4 border-b border-[#E7E2D8]">
              {user.location && (
                <>
                  <span className="flex items-center gap-1.5 text-[#52606D]">
                    <MapPin className="w-3.5 h-3.5 text-stone-400 shrink-0" />
                    <span>{user.location}</span>
                  </span>
                  <span>•</span>
                </>
              )}

              {user.yearsOfExperience > 0 && (
                <>
                  <span className="flex items-center gap-1.5 text-[#52606D]">
                    <Briefcase className="w-3.5 h-3.5 text-stone-400 shrink-0" />
                    <span>{user.yearsOfExperience} years active practice</span>
                  </span>
                  <span>•</span>
                </>
              )}

              <span className="font-mono text-[#7A8690]">
                @{user.username}
              </span>

              {copiedLink && (
                <span className="text-[11px] font-semibold text-[#2D4D45] bg-[#EAF3EF] px-2 py-0.5 rounded ml-auto">
                  Profile link copied to clipboard!
                </span>
              )}
            </div>

            {/* Short Bio */}
            {user.shortBio ? (
              <p className="text-[#36414E] text-xs sm:text-sm leading-relaxed mb-6 whitespace-pre-line max-w-3xl">
                {user.shortBio}
              </p>
            ) : (
              <p className="text-[#7A8690] text-xs italic mb-6">
                Professional portfolio and work ledger documented on SABI.
              </p>
            )}

            {/* PROFESSIONAL PROOF SUMMARY METRICS */}
            <div className="bg-[#FAF8F5] rounded-2xl p-4 sm:p-5 border border-[#E7E2D8]">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <ShieldCheck className="w-4 h-4 text-[#4D7A70]" />
                  <span className="text-xs font-bold uppercase tracking-wider text-[#16222F]">
                    Professional Proof Summary
                  </span>
                </div>
                <span className="text-[11px] text-[#7A8690] hidden sm:inline">
                  Verified deliverables & confirmations
                </span>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 sm:gap-3 text-center">
                
                {/* Documented Work */}
                <div className="bg-white p-3 sm:p-4 rounded-xl border border-[#E7E2D8] shadow-2xs">
                  <span className="text-xl sm:text-2xl font-black text-[#16222F]">
                    {publicProofSummary.totalPublicWork}
                  </span>
                  <p className="text-[11px] font-semibold text-[#52606D] mt-0.5">
                    Documented Work
                  </p>
                  <span className="text-[10px] text-[#7A8690] block mt-0.5">
                    Completed jobs
                  </span>
                </div>

                {/* Evidence Backed */}
                <div className="bg-white p-3 sm:p-4 rounded-xl border border-[#E7E2D8] shadow-2xs">
                  <span className="text-xl sm:text-2xl font-black text-[#61507C]">
                    {publicProofSummary.evidenceBacked}
                  </span>
                  <p className="text-[11px] font-semibold text-[#52606D] mt-0.5">
                    Evidence-Backed
                  </p>
                  <span className="text-[10px] text-[#7A8690] block mt-0.5">
                    With proof items
                  </span>
                </div>

                {/* Client Confirmed */}
                <div className="bg-white p-3 sm:p-4 rounded-xl border border-[#CFE2D9] shadow-2xs bg-[#FAFDFB]">
                  <span className="text-xl sm:text-2xl font-black text-[#2D4D45]">
                    {publicProofSummary.clientConfirmed}
                  </span>
                  <p className="text-[11px] font-semibold text-[#2D4D45] mt-0.5">
                    Client-Confirmed
                  </p>
                  <span className="text-[10px] text-[#4D7A70] block mt-0.5">
                    Independently signed
                  </span>
                </div>

                {/* Skills Demonstrated */}
                <div className="bg-white p-3 sm:p-4 rounded-xl border border-[#E7E2D8] shadow-2xs">
                  <span className="text-xl sm:text-2xl font-black text-[#93652E]">
                    {publicProofSummary.skillsDemonstratedCount}
                  </span>
                  <p className="text-[11px] font-semibold text-[#52606D] mt-0.5">
                    Demonstrated Skills
                  </p>
                  <span className="text-[10px] text-[#7A8690] block mt-0.5">
                    In public works
                  </span>
                </div>

              </div>

              <p className="text-[11px] text-[#7A8690] text-center mt-3">
                Every metric in this ledger is tied directly to documented deliverables, attached work evidence, or independent client verifications.
              </p>
            </div>

          </div>
        </header>

        {/* 2. PRIORITIZED SECTION: "WHAT THIS PERSON HAS DOCUMENTED" (WORK LEDGER) */}
        <section className="space-y-5 mb-10">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white p-5 rounded-2xl border border-[#E7E2D8] shadow-xs">
            <div>
              <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-md bg-[#EAF3EF] text-[#2D4D45] text-[11px] font-bold uppercase tracking-wider mb-1">
                <FileCheck2 className="w-3.5 h-3.5 text-[#4D7A70]" />
                <span>Primary Proof • Documented Work</span>
              </div>
              <h2 className="text-lg font-bold text-[#16222F] tracking-tight flex items-center gap-2">
                <span>Documented Work History</span>
                <span className="text-xs font-mono font-semibold px-2 py-0.5 rounded-full bg-stone-200 text-stone-700">
                  {filteredRecords.length}
                </span>
              </h2>
              <p className="text-xs text-[#7A8690]">
                Chronological ledger of completed deliverables, attached evidence, and independent client verifications.
              </p>
            </div>

            {selectedSkill && (
              <div className="flex items-center gap-2 bg-[#FAF8F5] border border-[#E7E2D8] px-3 py-1.5 rounded-xl text-xs self-start sm:self-auto">
                <span className="text-[#52606D]">Filtering by:</span>
                <strong className="text-[#16222F]">{selectedSkill}</strong>
                <button
                  onClick={() => setSelectedSkill(null)}
                  className="text-stone-400 hover:text-stone-700 p-0.5 cursor-pointer"
                  title="Clear filter"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              </div>
            )}
          </div>

          {filteredRecords.length === 0 ? (
            <div className="bg-white rounded-2xl border border-dashed border-[#E7E2D8] p-10 text-center space-y-2">
              <p className="text-sm font-semibold text-[#16222F]">
                {publicRecords.length === 0
                  ? 'No public work records documented yet.'
                  : `No public deliverables found demonstrating "${selectedSkill}".`}
              </p>
              <p className="text-xs text-[#7A8690] max-w-sm mx-auto">
                {publicRecords.length === 0
                  ? 'When the professional adds public work deliverables with evidence and client confirmations, they will appear here.'
                  : 'Try selecting another skill filter or click "Show all work" to view the full ledger.'}
              </p>
              {selectedSkill && (
                <button
                  onClick={() => setSelectedSkill(null)}
                  className="mt-2 px-3.5 py-1.5 bg-stone-100 hover:bg-stone-200 text-stone-700 rounded-xl text-xs font-semibold cursor-pointer"
                >
                  View All Deliverables
                </button>
              )}
            </div>
          ) : (
            <div className="space-y-4">
              {filteredRecords.map((record) => {
                const proofStatus: ProofStatus = getRecordProofStatus(record);
                const isConfirmed = proofStatus === 'Client-confirmed';
                const evidence = record.evidenceList || [];
                const confirmation = record.confirmation;

                return (
                  <article
                    key={record.id}
                    className="bg-white rounded-2xl border border-[#E7E2D8] p-5 sm:p-6 shadow-2xs hover:border-[#D5CFC2] transition-all space-y-4 text-[#16222F]"
                  >
                    {/* Record Meta Header */}
                    <div className="flex flex-wrap items-center justify-between gap-2 border-b border-stone-100 pb-3">
                      <div className="flex items-center gap-2 text-xs">
                        <span className="text-[11px] font-bold tracking-wider uppercase px-2 py-0.5 rounded bg-stone-100 text-[#52606D]">
                          {record.category}
                        </span>
                        <span className="text-stone-300">•</span>
                        <span className="text-[#52606D] flex items-center gap-1">
                          <Calendar className="w-3.5 h-3.5 text-stone-400" />
                          {record.completionDate}
                        </span>
                        {record.location && (
                          <>
                            <span className="text-stone-300 hidden sm:inline">•</span>
                            <span className="text-[#52606D] hidden sm:flex items-center gap-1">
                              <MapPin className="w-3.5 h-3.5 text-stone-400" />
                              {record.location}
                            </span>
                          </>
                        )}
                      </div>

                      {/* Unified Trust Indicator Badge with Explicit Meaning */}
                      <div className="flex items-center gap-2">
                        {proofStatus === 'Client-confirmed' && (
                          <span
                            title="Meaning: A client or relevant person has independently confirmed the work."
                            className="inline-flex items-center gap-1 text-[11px] font-bold px-2.5 py-0.5 rounded-full bg-[#EAF3EF] text-[#2D4D45] border border-[#CFE2D9]"
                          >
                            <CheckCircle2 className="w-3.5 h-3.5 text-[#4D7A70]" strokeWidth={2.5} />
                            <span>Client-confirmed</span>
                          </span>
                        )}

                        {proofStatus === 'Confirmation pending' && (
                          <span
                            title="Meaning: Confirmation requested and awaiting independent client review."
                            className="inline-flex items-center gap-1 text-[11px] font-bold px-2.5 py-0.5 rounded-full bg-[#FDF5EA] text-[#93652E] border border-[#F3DFC3]"
                          >
                            <Clock className="w-3.5 h-3.5 text-[#D4A359]" />
                            <span>Confirmation pending</span>
                          </span>
                        )}

                        {proofStatus === 'Evidence-backed' && (
                          <span
                            title="Meaning: Supporting evidence has been attached."
                            className="inline-flex items-center gap-1 text-[11px] font-bold px-2.5 py-0.5 rounded-full bg-[#F3EFF9] text-[#61507C] border border-[#DDD5EB]"
                          >
                            <ShieldCheck className="w-3.5 h-3.5 text-[#8C7CA7]" />
                            <span>Evidence-backed</span>
                          </span>
                        )}

                        {proofStatus === 'Self-documented' && (
                          <span
                            title="Meaning: Added by the professional."
                            className="inline-flex items-center gap-1 text-[11px] font-medium px-2.5 py-0.5 rounded-full bg-[#FAF8F5] text-[#7A8690] border border-[#E7E2D8]"
                          >
                            <FileText className="w-3.5 h-3.5 text-[#A7B1AB]" />
                            <span>Self-documented</span>
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Work Title & Outcome Description */}
                    <div className="space-y-1.5">
                      <h3 className="text-base sm:text-lg font-bold text-[#16222F]">
                        {record.title}
                      </h3>
                      <p className="text-xs sm:text-sm text-[#36414E] leading-relaxed whitespace-pre-line">
                        {record.description}
                      </p>
                    </div>

                    {/* CLIENT TESTIMONIAL DISPLAY (STRICT: ONLY FOR CLIENT-CONFIRMED RECORDS) */}
                    {isConfirmed && confirmation?.testimonial && (
                      <div className="p-4 rounded-xl bg-[#EAF3EF]/80 border border-[#CFE2D9] text-xs sm:text-sm space-y-2">
                        <div className="flex items-center gap-1.5 text-xs font-bold text-[#2D4D45]">
                          <MessageSquareQuote className="w-4 h-4 text-[#4D7A70]" />
                          <span>Client Testimonial & Confirmation</span>
                        </div>
                        <p className="italic text-[#1F2421] leading-relaxed">
                          “{confirmation.testimonial}”
                        </p>
                        <div className="flex flex-wrap items-center justify-between text-[11px] text-[#4D7A70] pt-1">
                          <span className="font-bold not-italic">
                            — {confirmation.clientName}
                            {confirmation.clientRole ? `, ${confirmation.clientRole}` : ''}
                          </span>
                          {confirmation.confirmedAt && (
                            <span className="text-[#7A8690]">
                              Confirmed on {new Date(confirmation.confirmedAt).toLocaleDateString()}
                            </span>
                          )}
                        </div>
                      </div>
                    )}

                    {/* Skills Demonstrated Chips */}
                    <div className="flex flex-wrap gap-1.5 pt-1">
                      {record.skillsDemonstrated.map((skill, i) => (
                        <span
                          key={i}
                          onClick={() => setSelectedSkill(skill)}
                          className="text-[11px] font-medium px-2.5 py-0.5 rounded-lg bg-[#FAF8F5] hover:bg-stone-100 text-[#52606D] border border-[#E7E2D8] cursor-pointer transition-colors"
                          title={`Click to filter by ${skill}`}
                        >
                          {skill}
                        </span>
                      ))}
                    </div>

                    {/* Evidence Gallery Strip */}
                    {evidence.length > 0 && (
                      <div className="pt-3 border-t border-stone-100 space-y-2">
                        <h4 className="text-[11px] font-bold uppercase tracking-wider text-[#7A8690] flex items-center gap-1.5">
                          <FileCheck2 className="w-3.5 h-3.5 text-[#4D7A70]" />
                          <span>Documented Evidence ({evidence.length})</span>
                        </h4>

                        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                          {evidence.map((item) => (
                            <div
                              key={item.id}
                              className="rounded-xl border border-[#E7E2D8] overflow-hidden bg-[#FAF8F5] group/ev shadow-2xs"
                            >
                              {item.type === 'image' ? (
                                <div
                                  onClick={() => setActiveEvidenceLightbox(item)}
                                  className="h-32 sm:h-36 overflow-hidden cursor-zoom-in relative bg-stone-100"
                                >
                                  <img
                                    src={item.url}
                                    alt={item.caption}
                                    className="w-full h-full object-cover group-hover/ev:scale-105 transition-transform duration-200"
                                  />
                                  <div className="absolute inset-0 bg-black/25 opacity-0 group-hover/ev:opacity-100 transition-opacity flex items-center justify-center text-white text-[11px] font-semibold">
                                    Click to Enlarge
                                  </div>
                                </div>
                              ) : (
                                <div className="h-28 flex flex-col items-center justify-center p-3 text-center bg-stone-50">
                                  {item.type === 'video' ? (
                                    <Video className="w-6 h-6 text-stone-600 mb-1" />
                                  ) : item.type === 'document' ? (
                                    <FileText className="w-6 h-6 text-stone-600 mb-1" />
                                  ) : (
                                    <LinkIcon className="w-6 h-6 text-stone-600 mb-1" />
                                  )}
                                  <a
                                    href={item.url}
                                    target="_blank"
                                    rel="noreferrer"
                                    className="text-xs font-bold text-[#2D4D45] hover:underline flex items-center gap-1 truncate max-w-[140px]"
                                  >
                                    <span>View {item.type}</span>
                                    <ExternalLink className="w-3 h-3 shrink-0" />
                                  </a>
                                </div>
                              )}

                              <div className="p-2.5 bg-white border-t border-stone-100">
                                <p className="text-[11px] font-medium text-[#16222F] truncate">
                                  {item.caption || 'Verified Evidence Item'}
                                </p>
                                <p className="text-[10px] text-[#7A8690] capitalize">
                                  {item.type} • {item.fileName || 'Documented'}
                                </p>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                  </article>
                );
              })}
            </div>
          )}
        </section>

        {/* 3. SKILLS DEMONSTRATION & PROOF CLASSIFICATION */}
        {/* Strictly distinguishes Demonstrated Skills (from public work) vs Profile Skills (claims) */}
        <section className="bg-white rounded-3xl border border-[#E7E2D8] p-6 sm:p-7 shadow-xs space-y-6 mb-10">
          
          <div className="border-b border-[#E7E2D8] pb-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <div>
                <h3 className="text-base font-bold text-[#16222F] flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-[#D4A359]" />
                  <span>Skills & Verification Matrix</span>
                </h3>
                <p className="text-xs text-[#52606D] mt-0.5">
                  SABI classifies skills based on documented deliverables versus self-reported claims.
                </p>
              </div>

              {selectedSkill && (
                <button
                  onClick={() => setSelectedSkill(null)}
                  className="text-xs text-[#2D4D45] font-semibold hover:underline flex items-center gap-1 self-start sm:self-auto cursor-pointer"
                >
                  <RotateCcw className="w-3 h-3" />
                  <span>Clear skill filter</span>
                </button>
              )}
            </div>
          </div>

          {/* A. DEMONSTRATED SKILLS */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <div>
                <span className="text-xs font-bold uppercase tracking-wider text-[#2D4D45] flex items-center gap-1.5">
                  <CheckCircle2 className="w-4 h-4 text-[#4D7A70]" />
                  <span>1. Demonstrated Skills ({demonstratedSkillsWithCounts.length})</span>
                </span>
                <p className="text-[11px] text-[#7A8690]">
                  Connected to completed work records in the public ledger above. Click any skill to inspect the exact deliverables.
                </p>
              </div>
            </div>

            {demonstratedSkillsWithCounts.length === 0 ? (
              <p className="text-xs text-[#7A8690] py-2 italic">
                No skills demonstrated through public work records yet.
              </p>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                {demonstratedSkillsWithCounts.map((sm) => {
                  const isSelected = selectedSkill?.toLowerCase() === sm.name.toLowerCase();
                  return (
                    <button
                      key={sm.name}
                      onClick={() => setSelectedSkill(isSelected ? null : sm.name)}
                      className={`text-left p-3 rounded-xl border transition-all cursor-pointer flex items-center justify-between gap-3 ${
                        isSelected
                          ? 'bg-[#1F2421] text-white border-[#1F2421] shadow-xs'
                          : sm.isConfirmed
                          ? 'bg-[#EAF3EF]/80 hover:bg-[#EAF3EF] border-[#CFE2D9] text-[#16222F]'
                          : sm.isProven
                          ? 'bg-[#F3EFF9]/70 hover:bg-[#F3EFF9] border-[#DDD5EB] text-[#16222F]'
                          : 'bg-[#FAF8F5] hover:bg-stone-100 border-[#E7E2D8] text-[#16222F]'
                      }`}
                    >
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-1.5">
                          {sm.isConfirmed ? (
                            <CheckCircle2 className={`w-3.5 h-3.5 shrink-0 ${isSelected ? 'text-[#E5B869]' : 'text-[#4D7A70]'}`} />
                          ) : sm.isProven ? (
                            <FileCheck2 className={`w-3.5 h-3.5 shrink-0 ${isSelected ? 'text-[#E5B869]' : 'text-[#8C7CA7]'}`} />
                          ) : null}
                          <span className="font-bold text-xs truncate">{sm.name}</span>
                        </div>
                        <span className={`text-[11px] block mt-0.5 ${isSelected ? 'text-stone-300' : 'text-[#52606D]'}`}>
                          Demonstrated in {sm.workCount} {sm.workCount === 1 ? 'documented work' : 'documented works'}
                        </span>
                      </div>

                      <div className="flex flex-col items-end gap-0.5 shrink-0">
                        {sm.confirmedCount > 0 && (
                          <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded ${
                            isSelected ? 'bg-white/20 text-[#E5B869]' : 'bg-emerald-100 text-emerald-900'
                          }`}>
                            {sm.confirmedCount} confirmed
                          </span>
                        )}
                        {sm.evidenceCount > 0 && (
                          <span className={`text-[10px] font-medium px-1.5 py-0.5 rounded ${
                            isSelected ? 'bg-white/10 text-stone-300' : 'bg-purple-100 text-purple-900'
                          }`}>
                            {sm.evidenceCount} evidence
                          </span>
                        )}
                      </div>
                    </button>
                  );
                })}
              </div>
            )}
          </div>

          {/* B. PROFILE SKILLS (Claimed by user • 0 works documented yet) */}
          {profileOnlySkills.length > 0 && (
            <div className="pt-4 border-t border-dashed border-[#E7E2D8] space-y-2">
              <div>
                <span className="text-xs font-bold uppercase tracking-wider text-[#7A8690] flex items-center gap-1.5">
                  <Briefcase className="w-3.5 h-3.5 text-stone-400" />
                  <span>2. Profile Skills (Claimed • 0 documented works yet)</span>
                </span>
                <p className="text-[11px] text-[#7A8690]">
                  Listed by the user on their profile, but not yet linked to public documented deliverables.
                </p>
              </div>

              <div className="flex flex-wrap gap-2 pt-1">
                {profileOnlySkills.map((sk) => (
                  <span
                    key={sk}
                    className="inline-flex items-center gap-1 text-xs px-2.5 py-1 rounded-lg bg-stone-100 border border-stone-200 text-stone-600 font-medium"
                    title="Self-claimed skill with 0 public documented works."
                  >
                    <span>{sk}</span>
                    <span className="text-[10px] text-stone-400">(Claimed)</span>
                  </span>
                ))}
              </div>
            </div>
          )}

        </section>

        {/* Footer */}
        <footer className="mt-16 pt-8 border-t border-[#E7E2D8] text-center text-xs text-[#7A8690] space-y-1">
          <p className="font-bold text-[#16222F]">
            SABI Professional Proof Identity • What you can do should count
          </p>
          <p>
            An evidence-based professional ledger proving real work through deliverables and independent client confirmations.
          </p>
        </footer>

      </div>

      {/* EVIDENCE LIGHTBOX */}
      {activeEvidenceLightbox && (
        <div className="fixed inset-0 z-50 bg-black/90 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in">
          <div className="relative max-w-3xl w-full max-h-[90vh] flex flex-col items-center">
            <button
              onClick={() => setActiveEvidenceLightbox(null)}
              className="absolute -top-10 right-0 text-white hover:text-stone-300 p-2 cursor-pointer"
            >
              <X className="w-6 h-6" />
            </button>
            <img
              src={activeEvidenceLightbox.url}
              alt={activeEvidenceLightbox.caption}
              className="max-w-full max-h-[75vh] object-contain rounded-xl shadow-2xl border border-white/10"
            />
            {activeEvidenceLightbox.caption && (
              <p className="text-white text-xs mt-3 text-center bg-black/60 px-4 py-1.5 rounded-full border border-white/15">
                {activeEvidenceLightbox.caption}
              </p>
            )}
          </div>
        </div>
      )}

      {/* SHARE / QR MODAL */}
      {showShareModal && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-stone-950/70 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in">
          <div className="bg-white rounded-3xl border border-[#E7E2D8] p-6 max-w-sm w-full shadow-2xl text-[#16222F] text-center">
            
            <div className="flex items-center justify-between mb-3 pb-2 border-b border-[#E7E2D8]">
              <span className="text-xs font-bold uppercase tracking-wider text-[#7A8690]">
                Proof Profile Share & Scan
              </span>
              <button
                onClick={() => setShowShareModal(false)}
                className="p-1 text-stone-400 hover:text-stone-700 rounded-lg cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-4 pt-1">
              
              {/* Crisp QR Code Container */}
              <div className="p-4 bg-[#FAF8F5] rounded-2xl border border-[#E7E2D8] inline-flex items-center justify-center shadow-inner mx-auto">
                {qrCodeDataUrl ? (
                  <img
                    src={qrCodeDataUrl}
                    alt={`${user.fullName} Public Proof QR Code`}
                    className="w-48 h-48 rounded-lg"
                  />
                ) : (
                  <div className="text-xs text-stone-400 font-mono">Generating QR...</div>
                )}
              </div>

              <div>
                <h4 className="font-bold text-sm text-[#16222F]">{user.fullName}</h4>
                <p className="text-xs text-[#52606D]">{user.profession}</p>
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-[#52606D] text-left mb-1">
                  Public Proof URL
                </label>
                <div className="flex items-center gap-1.5">
                  <input
                    type="text"
                    readOnly
                    value={profileUrl}
                    className="flex-1 px-3 py-2 text-xs font-mono bg-[#FAF8F5] border border-[#D5CFC2] rounded-xl text-[#16222F] truncate"
                  />
                  <button
                    onClick={handleCopyLink}
                    className="px-3 py-2 bg-[#1F2421] hover:bg-[#2D3530] text-[#FAF8F5] rounded-xl text-xs font-semibold flex items-center gap-1 shrink-0 cursor-pointer"
                  >
                    {copiedLink ? <Check className="w-3.5 h-3.5 text-[#4D7A70]" /> : <Copy className="w-3.5 h-3.5" />}
                    <span>{copiedLink ? 'Copied' : 'Copy'}</span>
                  </button>
                </div>
              </div>

              <div className="flex items-center gap-2 pt-1">
                {qrCodeDataUrl && (
                  <a
                    href={qrCodeDataUrl}
                    download={`${user.username || 'sabi'}-proof-qr.png`}
                    className="flex-1 py-2 px-3 bg-[#FAF8F5] hover:bg-stone-100 text-[#16222F] text-xs font-semibold rounded-xl flex items-center justify-center gap-1.5 transition-colors cursor-pointer border border-[#E7E2D8]"
                  >
                    <Download className="w-3.5 h-3.5 text-[#4D7A70]" />
                    <span>Save QR Code</span>
                  </a>
                )}

                {typeof navigator !== 'undefined' && 'share' in navigator && (
                  <button
                    onClick={handleNativeShare}
                    className="flex-1 py-2 px-3 bg-[#4D7A70] hover:bg-[#3D635B] text-[#FAF8F5] text-xs font-semibold rounded-xl flex items-center justify-center gap-1.5 transition-colors cursor-pointer shadow-2xs"
                  >
                    <Share2 className="w-3.5 h-3.5" />
                    <span>Share via App</span>
                  </button>
                )}
              </div>

              <p className="text-[11px] text-[#7A8690] text-left leading-relaxed">
                Scan this QR code or share the link to let clients, hiring teams, and partners examine your documented deliverables, photo/video evidence, and independent client confirmations without an account.
              </p>

              <div className="pt-2">
                <button
                  onClick={() => setShowShareModal(false)}
                  className="w-full py-2.5 bg-stone-100 hover:bg-stone-200 text-[#16222F] font-semibold text-xs rounded-xl cursor-pointer"
                >
                  Done
                </button>
              </div>
            </div>

          </div>
        </div>
      )}

      {/* CONTACT MODAL */}
      {showContactModal && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-stone-950/70 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in">
          <div className="bg-white rounded-3xl border border-[#E7E2D8] p-6 max-w-md w-full shadow-2xl text-[#16222F]">
            
            <div className="flex items-center justify-between mb-4 pb-3 border-b border-[#E7E2D8]">
              <div>
                <h3 className="text-base font-bold text-[#16222F]">
                  Contact {user.fullName}
                </h3>
                <p className="text-xs text-[#7A8690]">
                  Direct inquiry for commissioning, consulting, or project delivery
                </p>
              </div>
              <button
                onClick={() => setShowContactModal(false)}
                className="p-1 text-stone-400 hover:text-stone-700 rounded-lg cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {contactSent ? (
              <div className="text-center py-6 space-y-3">
                <div className="w-12 h-12 rounded-full bg-[#EAF3EF] text-[#2D4D45] flex items-center justify-center mx-auto">
                  <Check className="w-6 h-6" />
                </div>
                <h4 className="font-bold text-sm text-[#16222F]">Inquiry Sent Successfully</h4>
                <p className="text-xs text-[#52606D] max-w-xs mx-auto">
                  Your project message has been dispatched to {user.fullName}. They will receive your details at their registered professional contact.
                </p>
                <button
                  onClick={() => {
                    setShowContactModal(false);
                    setContactSent(false);
                  }}
                  className="mt-4 px-5 py-2 bg-[#1F2421] text-[#FAF8F5] rounded-xl text-xs font-bold cursor-pointer"
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
                <div>
                  <label className="block text-[11px] font-semibold text-[#52606D] mb-1">
                    Your Full Name
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Sarah Jenkins"
                    className="w-full px-3 py-2 text-xs rounded-xl border border-[#D5CFC2] bg-[#FAF8F5] focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#4D7A70]/20 focus:border-[#4D7A70]"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-semibold text-[#52606D] mb-1">
                    Your Email or Phone
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="sarah@example.com or +1..."
                    className="w-full px-3 py-2 text-xs rounded-xl border border-[#D5CFC2] bg-[#FAF8F5] focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#4D7A70]/20 focus:border-[#4D7A70]"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-semibold text-[#52606D] mb-1">
                    Project Scope / Deliverable Details
                  </label>
                  <textarea
                    rows={4}
                    required
                    placeholder="Briefly describe the work deliverable, timeline, or engagement you wish to discuss..."
                    className="w-full px-3 py-2 text-xs rounded-xl border border-[#D5CFC2] bg-[#FAF8F5] focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#4D7A70]/20 focus:border-[#4D7A70]"
                  />
                </div>

                <div className="flex justify-end gap-2 pt-2">
                  <button
                    type="button"
                    onClick={() => setShowContactModal(false)}
                    className="px-3.5 py-2 text-xs text-[#52606D] hover:text-[#16222F] cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-5 py-2 bg-[#4D7A70] hover:bg-[#3D635B] text-[#FAF8F5] font-bold text-xs rounded-xl shadow-2xs cursor-pointer transition-colors"
                  >
                    Send Project Inquiry
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
