import React from 'react';
import {
  Plus,
  ExternalLink,
  CheckCircle2,
  Image as ImageIcon,
  Clock,
  ArrowRight,
  ShieldCheck,
  Award,
  Calendar,
  Sparkles,
  Share2,
  FileText,
  Smartphone,
  MessageSquare,
  Check
} from 'lucide-react';
import { UserProfile, WorkRecord, ProfileMetrics, SkillProofMetric, ActiveTab } from '../types';

interface DashboardViewProps {
  user: UserProfile | null;
  metrics: ProfileMetrics;
  skillMetrics: SkillProofMetric[];
  recentRecords: WorkRecord[];
  onOpenAddWork: () => void;
  onSelectWork: (record: WorkRecord) => void;
  setActiveTab: (tab: ActiveTab) => void;
  setIsPublicMode: (isPublic: boolean) => void;
  onShareProfile: () => void;
  onRequestConfirm: (record: WorkRecord) => void;
}

export const DashboardView: React.FC<DashboardViewProps> = ({
  user,
  metrics,
  skillMetrics,
  recentRecords,
  onOpenAddWork,
  onSelectWork,
  setActiveTab,
  setIsPublicMode,
  onShareProfile,
  onRequestConfirm,
}) => {
  // Calculate Profile Completion State
  const calculateProfileCompletion = () => {
    if (!user) {
      return {
        score: 0,
        nextStepMessage: 'Set up your profile and document your first work',
        checks: {
          photo: { label: 'Profile photo added', passed: false },
          bio: { label: 'Bio & location complete', passed: false },
          skills: { label: 'Key skills declared', passed: false },
          work: { label: 'First completed work documented', passed: false },
          evidence: {
            label: 'Evidence or client verification attached',
            passed: false,
          },
        },
      };
    }

    let score = 0;
    const checks: Record<string, { label: string; passed: boolean; action?: () => void }> = {
      photo: { label: 'Profile photo added', passed: Boolean(user.profilePhoto) },
      bio: { label: 'Bio & location complete', passed: Boolean(user.shortBio && user.location) },
      skills: { label: 'Key skills declared', passed: user.skills && user.skills.length >= 3 },
      work: { label: 'First completed work documented', passed: metrics.totalRecords > 0 },
      evidence: {
        label: 'Evidence or client verification attached',
        passed: metrics.evidenceBackedRecords > 0 || metrics.clientConfirmedRecords > 0,
      },
    };

    if (checks.photo.passed) score += 20;
    if (checks.bio.passed) score += 20;
    if (checks.skills.passed) score += 20;
    if (checks.work.passed) score += 20;
    if (checks.evidence.passed) score += 20;

    let nextStepMessage = 'Your profile is fully verified with evidence!';
    if (!checks.work.passed) {
      nextStepMessage = 'Document your first completed work to reach 80%';
    } else if (!checks.evidence.passed) {
      nextStepMessage = 'Attach photo evidence or request confirmation to reach 100%';
    } else if (!checks.skills.passed) {
      nextStepMessage = 'Add more skills demonstrated in your work';
    }

    return { score, nextStepMessage, checks };
  };

  const completion = calculateProfileCompletion();

  // Skills supported by actual work records
  const provenSkills = skillMetrics.filter((s) => s.isProven || s.workRecordsCount > 0);
  const otherSkills = (user?.skills || []).filter(
    (skillName) => !provenSkills.some((ps) => ps.name.toLowerCase() === skillName.toLowerCase())
  );

  // Format date nicely (e.g. "June 2024")
  const formatRecordDate = (dateString?: string) => {
    if (!dateString) return 'Recent';
    try {
      const parts = dateString.split('-');
      if (parts.length >= 2) {
        const year = parts[0];
        const monthIndex = parseInt(parts[1], 10) - 1;
        const months = [
          'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
          'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'
        ];
        return `${months[monthIndex] || ''} ${year}`;
      }
      return dateString;
    } catch {
      return dateString;
    }
  };

  return (
    <div className="space-y-6 pb-24 md:pb-12 animate-in fade-in">
      {/* 1. HERO WELCOME CARD (Exact mobile & desktop visual hierarchy from brand kit mockup) */}
      <section className="bg-[#2D4D45] text-white rounded-3xl p-6 sm:p-7 shadow-lg shadow-[#2D4D45]/15 relative overflow-hidden">
        {/* Subtle decorative wave lines in background */}
        <svg
          className="absolute -right-8 -bottom-10 w-64 h-64 opacity-10 pointer-events-none text-white"
          viewBox="0 0 100 100"
          fill="currentColor"
        >
          <path d="M50 12C31.5 12 18 24 16 39C14.5 50.5 21 61.5 32 66C31 60 33 53.5 37.5 48.5C41.5 44 48 40.5 56 40C62 39.5 68 36.5 70 31C72 25.5 69 19.5 63 15.5C59 13 54.5 12 50 12Z" />
        </svg>

        <div className="flex items-center justify-between gap-4 relative z-10">
          <div className="space-y-1">
            <span className="text-xs sm:text-sm font-medium text-[#CFE2D9] tracking-wide block">
              {user ? 'Welcome back,' : 'Welcome to SABI,'}
            </span>
            <h1 className="text-2xl sm:text-3xl font-bold font-serif text-white tracking-tight leading-tight">
              {user ? (user.fullName || 'Professional') : 'Your Portable Proof'}
            </h1>
            <p className="text-xs sm:text-sm text-[#A8C7BC] font-medium pt-0.5">
              {user ? 'Keep building your legacy.' : 'Document what you can do. Let real work count.'}
            </p>
          </div>

          {/* User Profile Avatar / Initial with Gold Border */}
          <div className="shrink-0 relative">
            <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-full overflow-hidden border-2 border-[#D4A359] shadow-md bg-[#254039] flex items-center justify-center text-white">
              {user?.profilePhoto ? (
                <img
                  src={user.profilePhoto}
                  alt={user.fullName}
                  className="w-full h-full object-cover"
                />
              ) : (
                <span className="font-serif font-bold text-xl sm:text-2xl text-[#FAF8F5]">
                  {user?.fullName ? user.fullName.charAt(0).toUpperCase() : 'S'}
                </span>
              )}
            </div>
          </div>
        </div>

        {/* Primary Call-to-Action Bar inside Header for Fast Mobile Flow */}
        <div className="mt-5 pt-4 border-t border-white/10 flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <button
              onClick={onOpenAddWork}
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-2xl bg-white hover:bg-[#FAF8F5] text-[#2D4D45] font-bold text-xs sm:text-sm shadow-sm transition-transform active:scale-95 cursor-pointer"
            >
              <Plus className="w-4 h-4 text-[#4D7A70]" strokeWidth={2.5} />
              <span>+ Add Work</span>
            </button>

            <button
              onClick={() => setIsPublicMode(true)}
              className="inline-flex items-center gap-1.5 px-3.5 py-2.5 rounded-2xl bg-white/10 hover:bg-white/20 text-white font-medium text-xs border border-white/15 transition-colors cursor-pointer"
            >
              <ExternalLink className="w-3.5 h-3.5 text-[#D4A359]" />
              <span>View Public Profile</span>
            </button>
          </div>

          <span className="text-[11px] text-[#A8C7BC] hidden sm:block">
            {user ? `${user.profession || ''} ${user.location ? `• ${user.location}` : ''}` : 'Document real work with evidence'}
          </span>
        </div>
      </section>

      {/* 2. "WHAT HAVE I DOCUMENTED?" — PROFESSIONAL SUMMARY */}
      <section className="space-y-3">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-base sm:text-lg font-bold font-serif text-[#16222F]">
              What have I documented?
            </h2>
            <p className="text-xs text-[#5A6872]">
              Professional evidence summary based on real completed work
            </p>
          </div>

          {/* Profile Completion Indicator */}
          <div className="text-right">
            <div className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-[#EAF3EF] text-[#2D4D45] text-xs font-bold border border-[#CFE2D9]">
              <ShieldCheck className="w-3.5 h-3.5 text-[#4D7A70]" />
              <span>{completion.score}% Complete</span>
            </div>
          </div>
        </div>

        {/* 3 Prominent Stat Cards (Matching brand kit mobile layout: Work Records / Confirmed / Skills) */}
        <div className="grid grid-cols-3 gap-2.5 sm:gap-4">
          {/* Work Records */}
          <div className="bg-white p-3.5 sm:p-4 rounded-2xl border border-[#E7E2D8] shadow-2xs text-center flex flex-col justify-center transition-all hover:border-[#4D7A70]">
            <span className="text-2xl sm:text-3xl font-extrabold text-[#16222F] tracking-tight">
              {metrics.totalRecords}
            </span>
            <span className="text-[11px] sm:text-xs font-medium text-[#5A6872] mt-0.5">
              Work Records
            </span>
          </div>

          {/* Confirmed */}
          <div className="bg-white p-3.5 sm:p-4 rounded-2xl border border-[#E7E2D8] shadow-2xs text-center flex flex-col justify-center transition-all hover:border-[#4D7A70]">
            <span className="text-2xl sm:text-3xl font-extrabold text-[#2D4D45] tracking-tight">
              {metrics.clientConfirmedRecords}
            </span>
            <span className="text-[11px] sm:text-xs font-medium text-[#5A6872] mt-0.5">
              Confirmed
            </span>
          </div>

          {/* Skills */}
          <div className="bg-white p-3.5 sm:p-4 rounded-2xl border border-[#E7E2D8] shadow-2xs text-center flex flex-col justify-center transition-all hover:border-[#4D7A70]">
            <span className="text-2xl sm:text-3xl font-extrabold text-[#8C7CA7] tracking-tight">
              {metrics.documentedSkillsCount}
            </span>
            <span className="text-[11px] sm:text-xs font-medium text-[#5A6872] mt-0.5">
              Skills Proven
            </span>
          </div>
        </div>

        {/* Detailed Evidence-Backed Indicator & Next Step Guidance */}
        <div className="bg-white p-3.5 sm:p-4 rounded-2xl border border-[#E7E2D8] shadow-2xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-xs">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-[#F2EFF8] text-[#8C7CA7] flex items-center justify-center shrink-0">
              <ImageIcon className="w-4 h-4" />
            </div>
            <div>
              <p className="font-bold text-[#16222F]">
                {metrics.evidenceBackedRecords} of {metrics.totalRecords || 1} work records backed by proof photos or files
              </p>
              <p className="text-[#5A6872] text-[11px] mt-0.5">
                {completion.nextStepMessage}
              </p>
            </div>
          </div>

          {completion.score < 100 && (
            <button
              onClick={onOpenAddWork}
              className="px-3 py-1.5 rounded-xl bg-[#EAF3EF] hover:bg-[#D5E8DF] text-[#2D4D45] font-semibold text-xs shrink-0 transition-colors"
            >
              Add Proof Now →
            </button>
          )}
        </div>
      </section>

      {/* 3. RECENT WORK (Matching Mockup with thumbnail, title, date, and pill status) */}
      <section className="space-y-3">
        <div className="flex items-center justify-between">
          <h2 className="text-base sm:text-lg font-bold font-serif text-[#16222F]">
            Recent Work
          </h2>
          {recentRecords.length > 0 && (
            <button
              onClick={() => setActiveTab('my-work')}
              className="text-xs font-semibold text-[#4D7A70] hover:text-[#2D4D45] transition-colors"
            >
              View all ({recentRecords.length})
            </button>
          )}
        </div>

        {/* EMPTY STATE: "Your experience may already exist in your phone, messages and completed work. Start documenting it." */}
        {recentRecords.length === 0 ? (
          <div className="bg-white rounded-3xl border border-[#E7E2D8] p-6 sm:p-8 text-center space-y-4 shadow-2xs">
            <div className="w-14 h-14 rounded-2xl bg-[#EAF3EF] text-[#4D7A70] flex items-center justify-center mx-auto shadow-2xs">
              <Smartphone className="w-7 h-7" />
            </div>

            <div className="max-w-md mx-auto space-y-1.5">
              <h3 className="text-lg font-bold font-serif text-[#16222F]">
                No completed work documented yet
              </h3>
              <p className="text-xs sm:text-sm text-[#5A6872] leading-relaxed">
                Your experience may already exist in your phone, messages and completed work. Start documenting it.
              </p>
            </div>

            {/* Practical Onboarding Cues */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 max-w-lg mx-auto text-left pt-2">
              <div className="p-3 rounded-xl bg-[#FAF8F5] border border-[#EAE6DE] flex items-start gap-2">
                <div className="w-6 h-6 rounded-lg bg-white flex items-center justify-center text-[#4D7A70] shrink-0 mt-0.5">
                  <ImageIcon className="w-3.5 h-3.5" />
                </div>
                <div>
                  <p className="font-semibold text-xs text-[#16222F]">Camera roll</p>
                  <p className="text-[11px] text-[#7A8690]">Photos of jobs, fabrics, sites, or setups</p>
                </div>
              </div>

              <div className="p-3 rounded-xl bg-[#FAF8F5] border border-[#EAE6DE] flex items-start gap-2">
                <div className="w-6 h-6 rounded-lg bg-white flex items-center justify-center text-[#8C7CA7] shrink-0 mt-0.5">
                  <MessageSquare className="w-3.5 h-3.5" />
                </div>
                <div>
                  <p className="font-semibold text-xs text-[#16222F]">Client chats</p>
                  <p className="text-[11px] text-[#7A8690]">WhatsApp or email thank you feedback</p>
                </div>
              </div>

              <div className="p-3 rounded-xl bg-[#FAF8F5] border border-[#EAE6DE] flex items-start gap-2">
                <div className="w-6 h-6 rounded-lg bg-white flex items-center justify-center text-[#D4A359] shrink-0 mt-0.5">
                  <FileText className="w-3.5 h-3.5" />
                </div>
                <div>
                  <p className="font-semibold text-xs text-[#16222F]">Deliverables</p>
                  <p className="text-[11px] text-[#7A8690]">Links to live work, code, or receipts</p>
                </div>
              </div>
            </div>

            {/* Primary Button as requested */}
            <div className="pt-2">
              <button
                onClick={onOpenAddWork}
                className="inline-flex items-center gap-2 px-6 py-3 rounded-2xl bg-[#4D7A70] hover:bg-[#2D4D45] text-white font-bold text-xs sm:text-sm shadow-md transition-all active:scale-95"
              >
                <Plus className="w-4 h-4" />
                <span>Document your first work</span>
              </button>
            </div>
          </div>
        ) : (
          /* List of Recent Work Records (Styled directly matching brand kit phone mockup) */
          <div className="space-y-2.5">
            {recentRecords.slice(0, 4).map((rec) => {
              const isConfirmed = rec.confirmationStatus === 'confirmed';
              const isPending = rec.confirmationStatus === 'pending';
              const hasEvidence =
                rec.evidenceStatus === 'attached' ||
                (rec.evidenceList && rec.evidenceList.length > 0);

              // Find first image thumbnail if available
              const firstImage =
                rec.evidenceList?.find((e) => e.type === 'image')?.url ||
                (rec.category === 'Fashion'
                  ? 'https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?auto=format&fit=crop&q=80&w=200'
                  : rec.category === 'Photo'
                  ? 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=200'
                  : null);

              return (
                <div
                  key={rec.id}
                  onClick={() => onSelectWork(rec)}
                  className="bg-white p-3.5 sm:p-4 rounded-2xl border border-[#E7E2D8] hover:border-[#4D7A70] transition-all shadow-2xs hover:shadow-sm cursor-pointer flex items-center justify-between gap-3 group"
                >
                  {/* Left: Thumbnail & Title/Date */}
                  <div className="flex items-center gap-3.5 min-w-0">
                    <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-xl overflow-hidden bg-[#FAF8F5] border border-[#E7E2D8] shrink-0 flex items-center justify-center">
                      {firstImage ? (
                        <img
                          src={firstImage}
                          alt={rec.title}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                        />
                      ) : (
                        <ImageIcon className="w-5 h-5 text-[#8C7CA7]" />
                      )}
                    </div>

                    <div className="min-w-0 space-y-0.5">
                      <h4 className="font-bold text-xs sm:text-sm text-[#16222F] truncate group-hover:text-[#4D7A70] transition-colors">
                        {rec.title}
                      </h4>
                      <p className="text-[11px] text-[#7A8690] flex items-center gap-2">
                        <span>{formatRecordDate(rec.completionDate)}</span>
                        {rec.location && (
                          <span className="hidden sm:inline text-[#98A3AC]">• {rec.location}</span>
                        )}
                      </p>
                    </div>
                  </div>

                  {/* Right: Status Badges matching brand kit */}
                  <div className="shrink-0 flex items-center gap-2">
                    {isConfirmed ? (
                      <span className="inline-flex items-center gap-1 text-[11px] font-semibold px-2.5 py-1 rounded-full bg-[#EAF3EF] text-[#2D4D45] border border-[#CFE2D9]">
                        <Check className="w-3 h-3 text-[#4D7A70]" strokeWidth={2.5} />
                        <span>Confirmed</span>
                      </span>
                    ) : hasEvidence ? (
                      <span className="inline-flex items-center gap-1 text-[11px] font-semibold px-2.5 py-1 rounded-full bg-[#F3EFF9] text-[#61507C] border border-[#DDD5EB]">
                        <span>Evidence Added</span>
                      </span>
                    ) : isPending ? (
                      <span className="inline-flex items-center gap-1 text-[11px] font-semibold px-2.5 py-1 rounded-full bg-[#FDF5EA] text-[#93652E] border border-[#F3DFC3]">
                        <Clock className="w-3 h-3 text-[#D4A359]" />
                        <span>Pending Confirmation</span>
                      </span>
                    ) : (
                      <span className="text-[11px] text-[#7A8690] px-2 py-0.5 rounded-md bg-[#FAF8F5]">
                        Documented
                      </span>
                    )}

                    <ArrowRight className="w-4 h-4 text-[#C2BDB2] group-hover:text-[#4D7A70] transition-colors hidden sm:block" />
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </section>

      {/* 4. MY PROOF SUMMARY & DOCUMENTED SKILLS (2-column layout on desktop) */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* MY PROOF SUMMARY */}
        <div className="bg-white p-5 sm:p-6 rounded-3xl border border-[#E7E2D8] shadow-2xs space-y-3">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-[#EAF3EF] text-[#2D4D45] flex items-center justify-center">
              <ShieldCheck className="w-4 h-4 text-[#4D7A70]" />
            </div>
            <h3 className="font-bold font-serif text-sm sm:text-base text-[#16222F]">
              My Proof Summary
            </h3>
          </div>

          <blockquote className="text-xs sm:text-sm text-[#2D4D45] font-semibold italic bg-[#FAF8F5] p-3 rounded-xl border border-[#EAE6DE]">
            "Your work history grows every time you document real work."
          </blockquote>

          <p className="text-xs text-[#5A6872] leading-relaxed">
            Unlike static CVs or corporate social networks filled with claims, SABI turns every finished dress, code repository, photo session, furniture build, or client repair into a portable, undeniable record backed by photos, files, and direct client verification.
          </p>

          <div className="pt-2 flex items-center justify-between border-t border-[#EAE6DE] text-xs">
            <span className="text-[#7A8690]">Timeline history:</span>
            <span className="font-bold text-[#16222F]">
              {metrics.timelineSpanText || 'Starting now'}
            </span>
          </div>
        </div>

        {/* DOCUMENTED SKILLS: Skills supported by actual work records */}
        <div className="bg-white p-5 sm:p-6 rounded-3xl border border-[#E7E2D8] shadow-2xs space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-xl bg-[#F3EFF9] text-[#8C7CA7] flex items-center justify-center">
                <Award className="w-4 h-4 text-[#8C7CA7]" />
              </div>
              <h3 className="font-bold font-serif text-sm sm:text-base text-[#16222F]">
                Documented Skills
              </h3>
            </div>
            <span className="text-[11px] font-semibold px-2 py-0.5 rounded-full bg-[#EAF3EF] text-[#2D4D45]">
              {provenSkills.length} Proven
            </span>
          </div>

          <p className="text-xs text-[#5A6872]">
            Skills backed by actual work deliverables and client confirmations:
          </p>

          <div className="flex flex-wrap gap-1.5 pt-1">
            {provenSkills.length > 0 ? (
              provenSkills.map((sk) => (
                <div
                  key={sk.name}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-[#EAF3EF] border border-[#CFE2D9] text-xs font-semibold text-[#2D4D45]"
                >
                  <Check className="w-3 h-3 text-[#4D7A70]" strokeWidth={2.5} />
                  <span>{sk.name}</span>
                  <span className="text-[10px] px-1 rounded-md bg-[#CFE2D9]/70 text-[#203D35]">
                    {sk.workRecordsCount} {sk.workRecordsCount === 1 ? 'job' : 'jobs'}
                  </span>
                </div>
              ))
            ) : (
              <p className="text-xs text-[#7A8690] italic py-1">
                Document work to attach evidence to your declared skills.
              </p>
            )}

            {/* Declared but unproven skills shown with subtle style */}
            {otherSkills.slice(0, 4).map((sk) => (
              <span
                key={sk}
                className="inline-flex items-center gap-1 px-2.5 py-1 rounded-xl bg-[#FAF8F5] border border-[#E7E2D8] text-xs text-[#7A8690]"
                title="Declared in profile; add work to prove this skill"
              >
                <span>{sk}</span>
                <span className="text-[10px] text-[#A8B2BA]">(needs proof)</span>
              </span>
            ))}
          </div>

          <div className="pt-2 border-t border-[#EAE6DE]">
            <button
              onClick={() => setActiveTab('profile')}
              className="text-xs font-semibold text-[#4D7A70] hover:text-[#2D4D45] flex items-center gap-1 transition-colors"
            >
              <span>Manage all profile skills</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>

      {/* 5. QUICK ACTIONS & PUBLIC PROFILE SHARE */}
      <section className="bg-white rounded-3xl p-5 sm:p-6 border border-[#E7E2D8] shadow-2xs space-y-4">
        <h3 className="font-bold font-serif text-sm sm:text-base text-[#16222F]">
          Quick Actions
        </h3>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {/* Action 1: Add Work */}
          <button
            onClick={onOpenAddWork}
            className="p-4 rounded-2xl bg-[#EAF3EF] hover:bg-[#D8ECE2] border border-[#CFE2D9] text-left flex items-start gap-3 transition-all group"
          >
            <div className="w-10 h-10 rounded-xl bg-[#4D7A70] text-white flex items-center justify-center shrink-0 shadow-2xs">
              <Plus className="w-5 h-5" />
            </div>
            <div>
              <h4 className="font-bold text-xs sm:text-sm text-[#2D4D45] group-hover:text-[#16222F] transition-colors">
                Add New Work Record
              </h4>
              <p className="text-[11px] text-[#5A6872] mt-0.5">
                Attach photos, project links, or client contact for confirmation.
              </p>
            </div>
          </button>

          {/* Action 2: View Public Profile */}
          <button
            onClick={() => setIsPublicMode(true)}
            className="p-4 rounded-2xl bg-[#F3EFF9] hover:bg-[#E9E3F3] border border-[#DDD5EB] text-left flex items-start gap-3 transition-all group"
          >
            <div className="w-10 h-10 rounded-xl bg-[#8C7CA7] text-white flex items-center justify-center shrink-0 shadow-2xs">
              <ExternalLink className="w-5 h-5" />
            </div>
            <div>
              <h4 className="font-bold text-xs sm:text-sm text-[#61507C] group-hover:text-[#16222F] transition-colors">
                View Public Profile
              </h4>
              <p className="text-[11px] text-[#5A6872] mt-0.5">
                See exactly what prospective clients and collaborators see.
              </p>
            </div>
          </button>
        </div>

        {/* Portable Share Bar */}
        <div className="p-3.5 rounded-2xl bg-[#FAF8F5] border border-[#EAE6DE] flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-xs">
          <div className="flex items-center gap-2">
            <span className="font-semibold text-[#16222F]">Your Proof URL:</span>
            <code className="px-2 py-0.5 bg-white border border-[#E7E2D8] rounded-md text-[11px] text-[#4D7A70] font-mono font-bold">
              sabi.proof/{user?.username || 'your-handle'}
            </code>
          </div>

          <button
            onClick={onShareProfile}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white border border-[#D5CEC2] hover:border-[#4D7A70] text-[#16222F] font-semibold text-xs transition-colors"
          >
            <Share2 className="w-3.5 h-3.5 text-[#4D7A70]" />
            <span>Share or QR Code</span>
          </button>
        </div>
      </section>
    </div>
  );
};
