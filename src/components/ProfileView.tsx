import React, { useState } from 'react';
import {
  User,
  MapPin,
  Briefcase,
  Award,
  Calendar,
  ShieldCheck,
  CheckCircle2,
  ExternalLink,
  Share2,
  Edit3,
  Plus,
  X,
  Sparkles,
  Check,
  Clock,
  FileCheck2
} from 'lucide-react';
import {
  UserProfile,
  ProfileMetrics,
  SkillProofMetric,
  WorkRecord,
  getRecordProofStatus,
  ProofStatus
} from '../types';

interface ProfileViewProps {
  user: UserProfile | null;
  metrics: ProfileMetrics;
  skillMetrics: SkillProofMetric[];
  records: WorkRecord[];
  onUpdateProfile: (updated: UserProfile) => void;
  onSelectWork: (record: WorkRecord) => void;
  setIsPublicMode: (isPublic: boolean) => void;
  onShareProfile: () => void;
}

export const ProfileView: React.FC<ProfileViewProps> = ({
  user,
  metrics,
  skillMetrics,
  records,
  onUpdateProfile,
  onSelectWork,
  setIsPublicMode,
  onShareProfile,
}) => {
  const [isEditing, setIsEditing] = useState(!user);

  // Form State
  const [fullName, setFullName] = useState(user?.fullName || '');
  const [profession, setProfession] = useState(user?.profession || '');
  const [location, setLocation] = useState(user?.location || '');
  const [bio, setBio] = useState(user?.shortBio || '');
  const [yearsOfExperience, setYearsOfExperience] = useState(user?.yearsOfExperience || 0);
  const [profilePhoto, setProfilePhoto] = useState(user?.profilePhoto || '');
  const [appearInDiscover, setAppearInDiscover] = useState<boolean>(user?.appearInDiscover === true);

  // Skills tag manager
  const [newSkillInput, setNewSkillInput] = useState('');

  const handleSaveProfile = (e: React.FormEvent) => {
    e.preventDefault();
    const baseUser: UserProfile = user || {
      id: `usr_${Date.now()}`,
      username: (fullName.trim().toLowerCase().replace(/\s+/g, '_') || 'user') + `_${Math.floor(Math.random() * 1000)}`,
      fullName: '',
      email: '',
      profilePhoto: '',
      profession: '',
      location: '',
      shortBio: '',
      yearsOfExperience: 0,
      skills: [],
      onboardingCompleted: true,
      createdAt: new Date().toISOString(),
      appearInDiscover: false,
    };

    onUpdateProfile({
      ...baseUser,
      fullName: fullName.trim(),
      profession: profession.trim(),
      location: location.trim(),
      shortBio: bio.trim(),
      yearsOfExperience: Number(yearsOfExperience) || 0,
      profilePhoto: profilePhoto.trim(),
      appearInDiscover,
      onboardingCompleted: true,
    });
    setIsEditing(false);
  };

  const handleAddSkill = () => {
    const trimmed = newSkillInput.trim();
    if (!trimmed) return;
    const currentSkills = user?.skills || [];
    if (!currentSkills.includes(trimmed)) {
      const updatedSkills = [...currentSkills, trimmed];
      if (user) {
        onUpdateProfile({ ...user, skills: updatedSkills });
      }
    }
    setNewSkillInput('');
  };

  const handleRemoveSkill = (skillName: string) => {
    if (!user) return;
    const updatedSkills = user.skills.filter((s) => s !== skillName);
    onUpdateProfile({ ...user, skills: updatedSkills });
  };

  // Chronological timeline sorting (newest first)
  const sortedRecords = [...records].sort((a, b) => {
    return (b.completionDate || '').localeCompare(a.completionDate || '');
  });

  return (
    <div className="space-y-8 pb-20 md:pb-12 max-w-4xl mx-auto">
      {/* Header Profile Card */}
      <div className="bg-white rounded-2xl border border-stone-200 shadow-xs p-6 sm:p-8 relative">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-6 border-b border-stone-100">
          <div className="flex items-center gap-4">
            {user?.profilePhoto ? (
              <img
                src={user.profilePhoto}
                alt={user.fullName || 'User'}
                className="w-16 h-16 sm:w-20 sm:h-20 rounded-2xl object-cover border-2 border-amber-500/20 shadow-xs"
              />
            ) : (
              <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-2xl bg-[#4D7A70] text-white flex items-center justify-center font-bold text-xl sm:text-2xl shadow-xs">
                {user?.fullName ? user.fullName.charAt(0).toUpperCase() : 'U'}
              </div>
            )}
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-xl sm:text-2xl font-extrabold text-stone-900">
                  {user?.fullName || 'Your Proof Profile'}
                </h1>
                <span className="text-xs px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-800 font-semibold border border-emerald-200 inline-flex items-center gap-1">
                  <ShieldCheck className="w-3 h-3 text-emerald-600" />
                  <span>SABI Proof ID</span>
                </span>
              </div>
              <p className="text-sm font-semibold text-stone-700 mt-0.5">
                {user?.profession || 'Set your profession or trade'}
              </p>
              <div className="flex flex-wrap items-center gap-3 text-xs text-stone-500 mt-1.5">
                <span className="flex items-center gap-1">
                  <MapPin className="w-3.5 h-3.5 text-stone-400" />
                  {user?.location || 'Location not set'}
                </span>
                <span>•</span>
                <span className="flex items-center gap-1">
                  <Briefcase className="w-3.5 h-3.5 text-stone-400" />
                  {user?.yearsOfExperience || 0} years active practice
                </span>
                {user?.username && (
                  <>
                    <span>•</span>
                    <span className="font-mono text-stone-400">@{user.username}</span>
                  </>
                )}
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2 self-stretch sm:self-auto justify-end">
            <button
              onClick={() => setIsEditing(!isEditing)}
              className="px-3.5 py-2 rounded-xl text-xs font-semibold bg-stone-100 hover:bg-stone-200 text-stone-800 transition-colors inline-flex items-center gap-1.5"
            >
              <Edit3 className="w-3.5 h-3.5" />
              <span>{isEditing ? 'Cancel Edit' : 'Edit Profile'}</span>
            </button>
            <button
              onClick={() => setIsPublicMode(true)}
              className="px-3.5 py-2 rounded-xl text-xs font-semibold bg-stone-900 hover:bg-stone-800 text-stone-100 transition-colors inline-flex items-center gap-1.5"
            >
              <ExternalLink className="w-3.5 h-3.5" />
              <span>Public View</span>
            </button>
          </div>
        </div>

        {/* Bio */}
        {!isEditing && (
          <div className="pt-5 space-y-4">
            <p className="text-sm text-stone-600 leading-relaxed max-w-3xl">
              {user?.shortBio || 'No biography added yet.'}
            </p>

            {/* Discover Privacy Status Banner */}
            <div className="p-4 rounded-xl border border-stone-200 bg-[#F9F8F5] flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div className="flex items-start sm:items-center gap-3">
                <div className={`w-3 h-3 rounded-full mt-0.5 sm:mt-0 shrink-0 ${
                  user?.appearInDiscover ? 'bg-emerald-500 ring-4 ring-emerald-100' : 'bg-stone-300'
                }`} />
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold text-stone-900">
                      Discover Status: {user?.appearInDiscover ? 'Listed in SABI Discover' : 'Unlisted (Private Discovery)'}
                    </span>
                    <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${
                      user?.appearInDiscover ? 'bg-emerald-100 text-emerald-800' : 'bg-stone-200 text-stone-700'
                    }`}>
                      {user?.appearInDiscover ? 'Opted In' : 'Private'}
                    </span>
                  </div>
                  <p className="text-xs text-stone-500 mt-0.5">
                    {user?.appearInDiscover
                      ? 'Your public work records and verified deliverables can be found by clients searching SABI Discover.'
                      : 'You are currently not listed in public search. Only direct link recipients can see your public proof.'}
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => {
                  if (user) {
                    const next = !user.appearInDiscover;
                    onUpdateProfile({ ...user, appearInDiscover: next });
                    setAppearInDiscover(next);
                  }
                }}
                className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all shrink-0 border ${
                  user?.appearInDiscover
                    ? 'bg-white border-stone-300 text-stone-700 hover:bg-stone-50'
                    : 'bg-[#4D7A70] border-[#4D7A70] text-white hover:bg-[#3D665D] shadow-xs'
                }`}
              >
                {user?.appearInDiscover ? 'Switch to Unlisted' : 'Appear in Discover'}
              </button>
            </div>
          </div>
        )}

        {/* Edit Profile Form */}
        {isEditing && (
          <form onSubmit={handleSaveProfile} className="pt-6 space-y-4 border-t border-stone-100 mt-4">
            <h3 className="text-sm font-bold text-stone-900">Edit Professional Info</h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-stone-700 mb-1">Full Name</label>
                <input
                  type="text"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  className="w-full px-3 py-2 text-xs rounded-lg border border-stone-300"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-stone-700 mb-1">Primary Profession / Title</label>
                <input
                  type="text"
                  value={profession}
                  onChange={(e) => setProfession(e.target.value)}
                  className="w-full px-3 py-2 text-xs rounded-lg border border-stone-300"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-stone-700 mb-1">Location</label>
                <input
                  type="text"
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                  className="w-full px-3 py-2 text-xs rounded-lg border border-stone-300"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-stone-700 mb-1">Years of Experience</label>
                <input
                  type="number"
                  value={yearsOfExperience}
                  onChange={(e) => setYearsOfExperience(Number(e.target.value))}
                  className="w-full px-3 py-2 text-xs rounded-lg border border-stone-300"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-stone-700 mb-1">Profile Photo URL</label>
              <input
                type="text"
                value={profilePhoto}
                onChange={(e) => setProfilePhoto(e.target.value)}
                placeholder="https://..."
                className="w-full px-3 py-2 text-xs rounded-lg border border-stone-300"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-stone-700 mb-1">Short Professional Bio</label>
              <textarea
                rows={3}
                value={bio}
                onChange={(e) => setBio(e.target.value)}
                className="w-full px-3 py-2 text-xs rounded-lg border border-stone-300"
              />
            </div>

            {/* Discovery Privacy Setting */}
            <div className="p-4 rounded-xl border border-stone-200 bg-stone-50/80 space-y-2.5">
              <div className="flex items-center justify-between">
                <div>
                  <label className="block text-xs font-bold text-stone-900">
                    Appear in Discover
                  </label>
                  <p className="text-[11px] text-stone-500">
                    Choose whether your documented proof profile is searchable by prospective clients in SABI Discover.
                  </p>
                </div>
                <span className={`text-[11px] font-bold px-2 py-0.5 rounded-full ${
                  appearInDiscover ? 'bg-emerald-100 text-emerald-800' : 'bg-stone-200 text-stone-700'
                }`}>
                  {appearInDiscover ? 'Yes (Opted In)' : 'No (Unlisted)'}
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-1">
                <button
                  type="button"
                  onClick={() => setAppearInDiscover(true)}
                  className={`p-3 rounded-xl border text-left flex items-start gap-2.5 transition-all ${
                    appearInDiscover
                      ? 'bg-emerald-50/80 border-emerald-500 text-emerald-950 shadow-2xs'
                      : 'bg-white border-stone-200 text-stone-700 hover:border-stone-300'
                  }`}
                >
                  <div className={`w-4 h-4 rounded-full border flex items-center justify-center mt-0.5 shrink-0 ${
                    appearInDiscover ? 'border-emerald-600 bg-emerald-600 text-white' : 'border-stone-300 bg-white'
                  }`}>
                    {appearInDiscover && <Check className="w-2.5 h-2.5 stroke-[3]" />}
                  </div>
                  <div>
                    <span className="text-xs font-bold block">Yes — Appear in Discover</span>
                    <span className="text-[11px] text-stone-500 block leading-tight mt-0.5">
                      Allow clients to search and find your verified public proof.
                    </span>
                  </div>
                </button>

                <button
                  type="button"
                  onClick={() => setAppearInDiscover(false)}
                  className={`p-3 rounded-xl border text-left flex items-start gap-2.5 transition-all ${
                    !appearInDiscover
                      ? 'bg-stone-100 border-stone-500 text-stone-950 shadow-2xs'
                      : 'bg-white border-stone-200 text-stone-700 hover:border-stone-300'
                  }`}
                >
                  <div className={`w-4 h-4 rounded-full border flex items-center justify-center mt-0.5 shrink-0 ${
                    !appearInDiscover ? 'border-stone-600 bg-stone-600 text-white' : 'border-stone-300 bg-white'
                  }`}>
                    {!appearInDiscover && <Check className="w-2.5 h-2.5 stroke-[3]" />}
                  </div>
                  <div>
                    <span className="text-xs font-bold block">No — Keep Unlisted</span>
                    <span className="text-[11px] text-stone-500 block leading-tight mt-0.5">
                      Only people with your direct profile link or QR code can view you.
                    </span>
                  </div>
                </button>
              </div>

              <p className="text-[10px] text-stone-400 italic">
                * Strict privacy guarantee: Only public work records are ever displayed. Private work records are strictly kept confidential and never exposed.
              </p>
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setIsEditing(false)}
                className="px-3 py-1.5 text-xs text-stone-600 hover:text-stone-900"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-4 py-1.5 bg-amber-500 hover:bg-amber-400 text-stone-950 font-bold text-xs rounded-lg shadow"
              >
                Save Profile
              </button>
            </div>
          </form>
        )}
      </div>

      {/* SKILLS EVIDENCE VERIFICATION MATRIX */}
      <section className="bg-white rounded-2xl border border-stone-200 shadow-xs p-6">
        <div className="flex items-center justify-between mb-2">
          <div>
            <h2 className="text-base font-bold text-stone-900">
              Skills & Documented Evidence
            </h2>
            <p className="text-xs text-stone-500">
              SABI differentiates between self-claimed skills and skills with concrete evidence and confirmations.
            </p>
          </div>
          <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-blue-50 text-blue-800 border border-blue-200">
            {metrics.documentedSkillsCount} of {skillMetrics.length} Proven
          </span>
        </div>

        {/* Add new skill input */}
        <div className="flex gap-2 my-4">
          <input
            type="text"
            placeholder="Add new skill to profile..."
            value={newSkillInput}
            onChange={(e) => setNewSkillInput(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                e.preventDefault();
                handleAddSkill();
              }
            }}
            className="flex-1 px-3 py-1.5 text-xs rounded-lg border border-stone-300 focus:outline-none focus:ring-1 focus:ring-amber-500"
          />
          <button
            onClick={handleAddSkill}
            className="px-3.5 py-1.5 bg-stone-900 hover:bg-stone-800 text-stone-100 text-xs font-semibold rounded-lg"
          >
            + Add Skill
          </button>
        </div>

        {/* Skills grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {skillMetrics.map((sm) => {
            const isDemonstrated = sm.workRecordsCount > 0;
            return (
              <div
                key={sm.name}
                className={`p-3 rounded-xl border transition-all flex flex-col justify-between ${
                  isDemonstrated
                    ? sm.isProven
                      ? 'bg-emerald-50/40 border-emerald-200'
                      : 'bg-stone-50 border-stone-200'
                    : 'bg-[#FAF8F5] border-stone-200/70 border-dashed'
                }`}
              >
                <div>
                  <div className="flex items-start justify-between gap-1 mb-1">
                    <span className="font-bold text-xs text-stone-900">{sm.name}</span>
                    {user?.skills?.includes(sm.name) && (
                      <button
                        onClick={() => handleRemoveSkill(sm.name)}
                        className="text-stone-300 hover:text-stone-600 p-0.5 cursor-pointer"
                        title="Remove skill"
                      >
                        <X className="w-3 h-3" />
                      </button>
                    )}
                  </div>

                  <p className="text-[11px] text-stone-600 mb-2">
                    {isDemonstrated ? (
                      <span className="font-semibold text-[#2D4D45]">
                        Demonstrated in {sm.workRecordsCount} {sm.workRecordsCount === 1 ? 'documented work' : 'documented works'}
                      </span>
                    ) : (
                      <span className="text-stone-400 italic">
                        Profile Skill (0 documented works yet)
                      </span>
                    )}
                  </p>
                </div>

                <div className="pt-2 border-t border-stone-200/40 flex items-center justify-between text-[11px]">
                  {isDemonstrated ? (
                    <span className="text-emerald-800 font-semibold flex items-center gap-1">
                      {sm.confirmedCount > 0 ? (
                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                      ) : (
                        <FileCheck2 className="w-3.5 h-3.5 text-stone-500 shrink-0" />
                      )}
                      <span>
                        {sm.confirmedCount > 0
                          ? `${sm.confirmedCount} confirmed • ${sm.evidenceBackedCount} evidence`
                          : sm.evidenceBackedCount > 0
                          ? `${sm.evidenceBackedCount} evidence backed`
                          : 'Logged in work ledger'}
                      </span>
                    </span>
                  ) : (
                    <span className="text-stone-400">Claimed on profile • Unverified</span>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* DOCUMENTED EXPERIENCE TIMELINE */}
      <section className="bg-white rounded-2xl border border-stone-200 shadow-xs p-6">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-base font-bold text-stone-900">
              Documented Experience Timeline
            </h2>
            <p className="text-xs text-stone-500">
              Chronological proof history: {metrics.timelineSpanText}
            </p>
          </div>
          <span className="text-xs font-mono font-semibold px-2.5 py-1 rounded bg-stone-100 text-stone-700">
            {records.length} jobs logged
          </span>
        </div>

        {sortedRecords.length === 0 ? (
          <p className="text-xs text-stone-400 italic py-4">
            No work records on timeline yet.
          </p>
        ) : (
          <div className="relative pl-6 border-l-2 border-stone-200 space-y-6 my-2">
            {sortedRecords.map((rec) => {
              const status: ProofStatus = getRecordProofStatus(rec);

              return (
                <div key={rec.id} className="relative group">
                  {/* Timeline dot */}
                  <div
                    className={`absolute -left-[31px] top-1 w-4 h-4 rounded-full border-2 bg-white flex items-center justify-center ${
                      status === 'Client-confirmed'
                        ? 'border-emerald-500 text-emerald-500'
                        : status === 'Confirmation pending'
                        ? 'border-amber-500 text-amber-500'
                        : status === 'Evidence-backed'
                        ? 'border-purple-500 text-purple-500'
                        : 'border-stone-400 text-stone-400'
                    }`}
                  >
                    <div
                      className={`w-1.5 h-1.5 rounded-full ${
                        status === 'Client-confirmed'
                          ? 'bg-emerald-500'
                          : status === 'Confirmation pending'
                          ? 'bg-amber-500'
                          : status === 'Evidence-backed'
                          ? 'bg-purple-500'
                          : 'bg-stone-300'
                      }`}
                    />
                  </div>

                  <div
                    onClick={() => onSelectWork(rec)}
                    className="p-3.5 rounded-xl border border-stone-200 hover:border-amber-400/80 bg-stone-50/50 hover:bg-white cursor-pointer transition-all"
                  >
                    <div className="flex items-center justify-between gap-2 text-xs mb-1">
                      <span className="font-mono text-stone-500 font-semibold">
                        {rec.completionDate}
                      </span>
                      {status === 'Client-confirmed' && (
                        <span className="text-[10px] text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded-full font-semibold border border-emerald-200">
                          Client-confirmed
                        </span>
                      )}
                      {status === 'Confirmation pending' && (
                        <span className="text-[10px] text-amber-800 bg-amber-50 px-2 py-0.5 rounded-full font-semibold border border-amber-200">
                          Confirmation pending
                        </span>
                      )}
                      {status === 'Evidence-backed' && (
                        <span className="text-[10px] text-purple-800 bg-purple-50 px-2 py-0.5 rounded-full font-semibold border border-purple-200">
                          Evidence-backed
                        </span>
                      )}
                      {status === 'Self-documented' && (
                        <span className="text-[10px] text-stone-600 bg-stone-100 px-2 py-0.5 rounded-full font-medium border border-stone-200">
                          Self-documented
                        </span>
                      )}
                    </div>

                    <h4 className="font-bold text-sm text-stone-900 group-hover:text-amber-900">
                      {rec.title}
                    </h4>
                    <p className="text-xs text-stone-600 line-clamp-2 mt-0.5">
                      {rec.description}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </section>

      {/* Share Profile Action */}
      <div className="text-center pt-2">
        <button
          onClick={onShareProfile}
          className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-stone-950 font-bold text-xs shadow"
        >
          <Share2 className="w-4 h-4" />
          <span>Share Portable Proof Profile</span>
        </button>
      </div>
    </div>
  );
};
