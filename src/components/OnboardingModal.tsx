import React, { useState } from 'react';
import {
  User,
  Camera,
  Scissors,
  Code2,
  Wrench,
  Palette,
  Hammer,
  Briefcase,
  GraduationCap,
  Sparkles,
  MapPin,
  Check,
  Plus,
  X,
  ArrowRight,
  ArrowLeft,
  Upload,
  Shirt
} from 'lucide-react';
import { UserProfile } from '../types';
import { SabiLogo } from './SabiLogo';

interface OnboardingModalProps {
  isOpen: boolean;
  user: UserProfile;
  onComplete: (updatedProfile: UserProfile) => void;
}

// Presets for professions as requested
const PROFESSION_OPTIONS = [
  { label: 'Fashion Designer', icon: Shirt, category: 'fashion' },
  { label: 'Photographer', icon: Camera, category: 'photo' },
  { label: 'Developer', icon: Code2, category: 'tech' },
  { label: 'Mechanic', icon: Wrench, category: 'trade' },
  { label: 'Hair Stylist', icon: Scissors, category: 'beauty' },
  { label: 'Graphic Designer', icon: Palette, category: 'creative' },
  { label: 'Carpenter', icon: Hammer, category: 'craft' },
  { label: 'Freelancer', icon: Briefcase, category: 'general' },
  { label: 'Student', icon: GraduationCap, category: 'student' },
  { label: 'Other', icon: Sparkles, category: 'other' },
];

// Contextual skill suggestions per profession
const SUGGESTED_SKILLS: Record<string, string[]> = {
  'Fashion Designer': ['Pattern Making', 'Garment Construction', 'Bespoke Tailoring', 'Fashion Sketching', 'Fabric Sourcing', 'Draping'],
  'Photographer': ['Portraiture', 'Event Coverage', 'Lighting Direction', 'Color Grading', 'Adobe Lightroom', 'Photo Retouching'],
  'Developer': ['React', 'TypeScript', 'Node.js', 'Mobile Apps', 'API Integration', 'UI Engineering'],
  'Mechanic': ['Engine Diagnostics', 'Brake Systems', 'Electrical Wiring', 'Preventative Maintenance', 'Transmission Repair'],
  'Hair Stylist': ['Bridal Styling', 'Color Treatments', 'Natural Hair Care', 'Precision Cutting', 'Extensions'],
  'Graphic Designer': ['Brand Identity', 'Logo Design', 'Typography', 'Figma', 'Vector Illustration', 'Packaging Design'],
  'Carpenter': ['Joinery', 'Cabinet Making', 'Hardwood Milling', 'On-Site Installation', 'Veneer Pressing', 'CAD Drafting'],
  'Freelancer': ['Project Management', 'Client Communication', 'Content Creation', 'Digital Strategy', 'Research'],
  'Student': ['Research Writing', 'Presentation Design', 'Data Entry', 'Organization', 'Team Collaboration'],
  'Other': ['Customer Relations', 'Quality Assurance', 'Troubleshooting', 'Planning', 'Execution'],
};

export const OnboardingModal: React.FC<OnboardingModalProps> = ({
  isOpen,
  user,
  onComplete,
}) => {
  if (!isOpen) return null;

  const [step, setStep] = useState<number>(1);

  // Form State - Starts clean with whatever was passed or empty
  const [profilePhoto, setProfilePhoto] = useState<string>(user.profilePhoto || '');
  const [fullName, setFullName] = useState<string>(user.fullName || '');
  const [profession, setProfession] = useState<string>(user.profession || '');
  const [customProfession, setCustomProfession] = useState<string>('');
  const [isOtherSelected, setIsOtherSelected] = useState<boolean>(false);
  const [location, setLocation] = useState<string>(user.location || '');
  const [shortBio, setShortBio] = useState<string>(user.shortBio || '');
  const [skills, setSkills] = useState<string[]>(user.skills || []);
  const [skillInput, setSkillInput] = useState<string>('');

  // Handle image upload from computer / phone
  const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (uploadEvent) => {
        if (uploadEvent.target?.result) {
          setProfilePhoto(uploadEvent.target.result as string);
        }
      };
      reader.readAsDataURL(file);
    }
  };

  // Add skill tag
  const handleAddSkill = (skillToAdd?: string) => {
    const target = (skillToAdd || skillInput).trim();
    if (!target) return;
    if (!skills.some((s) => s.toLowerCase() === target.toLowerCase())) {
      setSkills([...skills, target]);
    }
    setSkillInput('');
  };

  // Remove skill
  const handleRemoveSkill = (skillToRemove: string) => {
    setSkills(skills.filter((s) => s !== skillToRemove));
  };

  // Complete Onboarding
  const handleFinish = () => {
    const finalProfession = isOtherSelected
      ? customProfession.trim() || 'Independent Professional'
      : profession.trim() || user.profession || 'Independent Professional';

    const finalBio =
      shortBio.trim() ||
      `${finalProfession} documenting completed projects and verified client work.`;

    const updatedProfile: UserProfile = {
      ...user,
      fullName: fullName.trim() || user.fullName,
      profilePhoto,
      profession: finalProfession,
      location: location.trim() || 'Location not specified',
      shortBio: finalBio,
      skills: skills.length > 0 ? skills : [finalProfession],
      onboardingCompleted: true,
    };

    onComplete(updatedProfile);
  };

  // Active suggestions based on current profession
  const currentSkillSuggestions =
    SUGGESTED_SKILLS[profession] || SUGGESTED_SKILLS['Other'];

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-[#16222F]/75 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4 animate-in fade-in">
      <div className="bg-[#FAF8F5] rounded-3xl border border-[#E7E2D8] shadow-2xl max-w-lg w-full overflow-hidden text-[#16222F] flex flex-col max-h-[92vh]">
        {/* Header with Sabi Logo & Progress */}
        <div className="px-6 py-5 bg-white border-b border-[#EAE6DE]">
          <div className="flex items-center justify-between mb-4">
            <SabiLogo size="sm" variant="full" />
            <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-[#EAF3EF] text-[#2D4D45]">
              Step {step} of 4
            </span>
          </div>

          {/* Stepped progress bar */}
          <div className="w-full bg-[#EAE6DE] h-1.5 rounded-full overflow-hidden">
            <div
              className="bg-[#4D7A70] h-full transition-all duration-300 rounded-full"
              style={{ width: `${(step / 4) * 100}%` }}
            />
          </div>
        </div>

        {/* Step Content */}
        <div className="p-6 overflow-y-auto flex-1 space-y-6">
          {/* STEP 1: Profile Photo & Full Name */}
          {step === 1 && (
            <div className="space-y-5 animate-in fade-in">
              <div>
                <h2 className="text-2xl font-bold font-serif text-[#16222F]">
                  Let's set up your profile
                </h2>
                <p className="text-sm text-[#5A6872] mt-1">
                  Clients and collaborators trust profiles with a real face and name.
                </p>
              </div>

              {/* Profile Photo Selection */}
              <div className="space-y-3">
                <label className="block text-xs font-bold uppercase tracking-wider text-[#4D7A70]">
                  Profile Photo
                </label>
                <div className="flex items-center gap-4">
                  <div className="relative w-20 h-20 rounded-full overflow-hidden border-2 border-[#4D7A70] shadow-sm shrink-0 bg-[#EAF3EF] flex items-center justify-center">
                    {profilePhoto ? (
                      <img
                        src={profilePhoto}
                        alt="Profile preview"
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="flex flex-col items-center justify-center text-[#4D7A70]">
                        <Camera className="w-7 h-7" />
                      </div>
                    )}
                  </div>

                  <div className="space-y-2">
                    <label className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-white border border-[#D5CEC2] hover:border-[#4D7A70] text-xs font-semibold text-[#16222F] cursor-pointer shadow-2xs transition-colors">
                      <Upload className="w-3.5 h-3.5 text-[#4D7A70]" />
                      <span>{profilePhoto ? 'Change photo' : 'Upload your photo'}</span>
                      <input
                        type="file"
                        accept="image/*"
                        onChange={handlePhotoUpload}
                        className="hidden"
                      />
                    </label>
                    <p className="text-[11px] text-[#7A8690]">
                      PNG, JPG or WEBP from your phone or device
                    </p>
                  </div>
                </div>
              </div>

              {/* Full Name Input */}
              <div className="space-y-1.5">
                <label className="block text-xs font-bold uppercase tracking-wider text-[#4D7A70]">
                  Full Name
                </label>
                <input
                  type="text"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  placeholder="e.g. Your Full Name"
                  className="w-full px-4 py-3 bg-white border border-[#D5CEC2] focus:border-[#4D7A70] focus:ring-1 focus:ring-[#4D7A70] rounded-xl text-sm font-medium text-[#16222F] outline-none transition-all shadow-2xs"
                />
              </div>
            </div>
          )}

          {/* STEP 2: "What do you do?" - Profession or Primary Work */}
          {step === 2 && (
            <div className="space-y-4 animate-in fade-in">
              <div>
                <h2 className="text-2xl font-bold font-serif text-[#16222F]">
                  What do you do?
                </h2>
                <p className="text-sm text-[#5A6872] mt-1">
                  Select your primary trade, craft, or profession.
                </p>
              </div>

              {/* Profession Grid */}
              <div className="grid grid-cols-2 gap-2.5 pt-1">
                {PROFESSION_OPTIONS.map((opt) => {
                  const Icon = opt.icon;
                  const isSelected =
                    opt.label === 'Other'
                      ? isOtherSelected
                      : profession === opt.label && !isOtherSelected;

                  return (
                    <button
                      key={opt.label}
                      type="button"
                      onClick={() => {
                        if (opt.label === 'Other') {
                          setIsOtherSelected(true);
                          setProfession('Other');
                        } else {
                          setIsOtherSelected(false);
                          setProfession(opt.label);
                        }
                      }}
                      className={`p-3 rounded-2xl border text-left flex items-center gap-2.5 transition-all ${
                        isSelected
                          ? 'border-[#4D7A70] bg-[#EAF3EF] shadow-2xs text-[#2D4D45] font-bold'
                          : 'border-[#E7E2D8] bg-white hover:border-[#4D7A70]/50 text-[#16222F] font-medium'
                      }`}
                    >
                      <div
                        className={`w-8 h-8 rounded-xl flex items-center justify-center shrink-0 ${
                          isSelected
                            ? 'bg-[#4D7A70] text-white'
                            : 'bg-[#F2EFF8] text-[#8C7CA7]'
                        }`}
                      >
                        <Icon className="w-4 h-4" />
                      </div>
                      <span className="text-xs truncate">{opt.label}</span>
                    </button>
                  );
                })}
              </div>

              {/* Custom input if "Other" is chosen */}
              {isOtherSelected && (
                <div className="space-y-1.5 pt-2 animate-in fade-in">
                  <label className="block text-xs font-bold text-[#4D7A70]">
                    Specify your profession
                  </label>
                  <input
                    type="text"
                    value={customProfession}
                    onChange={(e) => setCustomProfession(e.target.value)}
                    placeholder="e.g. Caterer & Event Chef, Solar Installer, Sound Engineer..."
                    className="w-full px-4 py-3 bg-white border border-[#D5CEC2] focus:border-[#4D7A70] focus:ring-1 focus:ring-[#4D7A70] rounded-xl text-sm font-medium text-[#16222F] outline-none transition-all shadow-2xs"
                    autoFocus
                  />
                </div>
              )}
            </div>
          )}

          {/* STEP 3: Location & Short Bio */}
          {step === 3 && (
            <div className="space-y-4 animate-in fade-in">
              <div>
                <h2 className="text-2xl font-bold font-serif text-[#16222F]">
                  Where do you work?
                </h2>
                <p className="text-sm text-[#5A6872] mt-1">
                  Help local clients and remote teams know where you operate.
                </p>
              </div>

              {/* Location Input */}
              <div className="space-y-2">
                <label className="block text-xs font-bold uppercase tracking-wider text-[#4D7A70]">
                  Location / City
                </label>
                <div className="relative">
                  <MapPin className="w-4 h-4 text-[#8C7CA7] absolute left-3.5 top-3.5" />
                  <input
                    type="text"
                    value={location}
                    onChange={(e) => setLocation(e.target.value)}
                    placeholder="e.g. Lagos, Nigeria or Manchester, UK"
                    className="w-full pl-10 pr-4 py-3 bg-white border border-[#D5CEC2] focus:border-[#4D7A70] focus:ring-1 focus:ring-[#4D7A70] rounded-xl text-sm font-medium text-[#16222F] outline-none shadow-2xs"
                  />
                </div>

                {/* Quick location chips */}
                <div className="flex flex-wrap gap-1.5 pt-1">
                  {['Lagos', 'Accra', 'Nairobi', 'London', 'Johannesburg', 'Remote'].map(
                    (loc) => (
                      <button
                        key={loc}
                        type="button"
                        onClick={() => setLocation(loc)}
                        className="px-2.5 py-1 text-[11px] rounded-lg bg-white border border-[#E7E2D8] hover:border-[#4D7A70] text-[#5A6872]"
                      >
                        + {loc}
                      </button>
                    )
                  )}
                </div>
              </div>

              {/* Short Bio */}
              <div className="space-y-1.5 pt-2">
                <label className="block text-xs font-bold uppercase tracking-wider text-[#4D7A70]">
                  Short Bio
                </label>
                <textarea
                  rows={3}
                  value={shortBio}
                  onChange={(e) => setShortBio(e.target.value)}
                  placeholder="In 1 or 2 sentences, what kind of work do you specialize in?"
                  className="w-full p-3.5 bg-white border border-[#D5CEC2] focus:border-[#4D7A70] focus:ring-1 focus:ring-[#4D7A70] rounded-xl text-sm font-medium text-[#16222F] outline-none shadow-2xs resize-none"
                />
                <p className="text-[11px] text-[#7A8690]">
                  Keep it simple and direct. You can always update this anytime.
                </p>
              </div>
            </div>
          )}

          {/* STEP 4: Skills Selection & Custom Add */}
          {step === 4 && (
            <div className="space-y-4 animate-in fade-in">
              <div>
                <h2 className="text-2xl font-bold font-serif text-[#16222F]">
                  What are your key skills?
                </h2>
                <p className="text-sm text-[#5A6872] mt-1">
                  Add skills you've used on real jobs. You will back these up with proof.
                </p>
              </div>

              {/* Custom Skill Input */}
              <div className="flex gap-2">
                <input
                  type="text"
                  value={skillInput}
                  onChange={(e) => setSkillInput(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault();
                      handleAddSkill();
                    }
                  }}
                  placeholder="Type a skill and press Enter..."
                  className="flex-1 px-4 py-2.5 bg-white border border-[#D5CEC2] focus:border-[#4D7A70] rounded-xl text-sm font-medium text-[#16222F] outline-none shadow-2xs"
                />
                <button
                  type="button"
                  onClick={() => handleAddSkill()}
                  className="px-4 py-2.5 bg-[#4D7A70] hover:bg-[#3D665D] text-white font-semibold text-xs rounded-xl flex items-center gap-1 transition-colors shrink-0"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Add</span>
                </button>
              </div>

              {/* Selected Skills List */}
              <div className="space-y-1.5">
                <label className="block text-xs font-bold uppercase tracking-wider text-[#4D7A70]">
                  Your Skills ({skills.length})
                </label>
                {skills.length === 0 ? (
                  <p className="text-xs text-[#7A8690] italic py-2">
                    No skills added yet. Tap suggestions below or type your own.
                  </p>
                ) : (
                  <div className="flex flex-wrap gap-1.5 p-3 bg-white rounded-2xl border border-[#E7E2D8] min-h-[50px]">
                    {skills.map((s) => (
                      <span
                        key={s}
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-[#EAF3EF] border border-[#CFE2D9] text-[#2D4D45] text-xs font-semibold animate-in zoom-in-95"
                      >
                        <span>{s}</span>
                        <button
                          type="button"
                          onClick={() => handleRemoveSkill(s)}
                          className="text-[#4D7A70] hover:text-[#1F3D36] p-0.5 rounded-full"
                        >
                          <X className="w-3 h-3" />
                        </button>
                      </span>
                    ))}
                  </div>
                )}
              </div>

              {/* Quick Suggestions */}
              <div className="space-y-1.5 pt-1">
                <p className="text-xs font-semibold text-[#5A6872]">
                  Suggested for {profession || 'your work'}:
                </p>
                <div className="flex flex-wrap gap-1.5">
                  {currentSkillSuggestions.map((suggestion) => {
                    const isAdded = skills.includes(suggestion);
                    return (
                      <button
                        key={suggestion}
                        type="button"
                        disabled={isAdded}
                        onClick={() => handleAddSkill(suggestion)}
                        className={`px-3 py-1.5 rounded-xl text-xs font-medium transition-all ${
                          isAdded
                            ? 'bg-[#EAE6DE] text-[#8C98A2] cursor-not-allowed opacity-60'
                            : 'bg-white border border-[#D5CEC2] hover:border-[#4D7A70] text-[#16222F] hover:bg-[#F2EFF8]'
                        }`}
                      >
                        {isAdded ? (
                          <span className="inline-flex items-center gap-1">
                            <Check className="w-3 h-3 text-[#4D7A70]" />
                            {suggestion}
                          </span>
                        ) : (
                          `+ ${suggestion}`
                        )}
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Footer Navigation */}
        <div className="px-6 py-4 bg-white border-t border-[#EAE6DE] flex items-center justify-between">
          {step > 1 ? (
            <button
              type="button"
              onClick={() => setStep(step - 1)}
              className="px-4 py-2.5 rounded-xl border border-[#D5CEC2] text-xs font-semibold text-[#5A6872] hover:text-[#16222F] flex items-center gap-1.5 transition-colors"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Back</span>
            </button>
          ) : (
            <div />
          )}

          {step < 4 ? (
            <button
              type="button"
              onClick={() => {
                // simple validations before proceeding
                if (step === 1 && !fullName.trim()) {
                  setFullName(user.fullName || 'Adaeze Okafor');
                }
                if (step === 2 && !profession && !isOtherSelected) {
                  setProfession('Freelancer');
                }
                setStep(step + 1);
              }}
              className="px-6 py-2.5 rounded-xl bg-[#4D7A70] hover:bg-[#3D665D] text-white text-xs font-bold flex items-center gap-2 shadow-xs transition-colors"
            >
              <span>Continue</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          ) : (
            <button
              type="button"
              onClick={handleFinish}
              className="px-6 py-2.5 rounded-xl bg-[#2D4D45] hover:bg-[#203731] text-white text-xs font-bold flex items-center gap-2 shadow-xs transition-all"
            >
              <Check className="w-4 h-4 text-[#D4A359]" />
              <span>Complete Setup & View Dashboard</span>
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
