import React, { useState, useMemo } from 'react';
import {
  Search,
  Filter,
  X,
  MapPin,
  Briefcase,
  ShieldCheck,
  CheckCircle2,
  FileCheck2,
  ExternalLink,
  RotateCcw,
  Compass,
  ArrowRight,
  Palette,
  Code,
  Camera,
  Scissors,
  Hammer,
  Video,
  PenTool,
  SlidersHorizontal,
  ChevronDown,
  Sparkles,
  Award,
  Layers,
  FileText,
  MessageSquare,
} from 'lucide-react';
import { UserProfile, DiscoverProfessional, WorkRecord } from '../types';

interface DiscoverViewProps {
  currentUser: UserProfile | null;
  discoverables: DiscoverProfessional[];
  onViewProfessional: (user: UserProfile) => void;
  onUpdateCurrentUser?: (user: UserProfile) => void;
  onGoToProfile?: () => void;
  onMessageProfessional?: (user: UserProfile) => void;
}

// Proof filter requirement mode
type ProofRequirementFilter = 'all' | 'client-confirmed' | 'evidence-backed' | 'documented';

// Curated Discovery Categories requested by user
interface CategoryOption {
  id: string;
  label: string;
  icon: React.ElementType;
  matchFn: (prof: DiscoverProfessional) => boolean;
}

const DISCOVERY_CATEGORIES: CategoryOption[] = [
  {
    id: 'designers',
    label: 'Designers',
    icon: Palette,
    matchFn: (p) =>
      p.user.profession.toLowerCase().includes('design') ||
      p.workCategories.some((c) => c.toLowerCase().includes('design')),
  },
  {
    id: 'developers',
    label: 'Developers',
    icon: Code,
    matchFn: (p) =>
      p.user.profession.toLowerCase().includes('develop') ||
      p.user.profession.toLowerCase().includes('engineer') ||
      p.workCategories.some((c) => c.toLowerCase().includes('software') || c.toLowerCase().includes('development')),
  },
  {
    id: 'photographers',
    label: 'Photographers',
    icon: Camera,
    matchFn: (p) =>
      p.user.profession.toLowerCase().includes('photo') ||
      p.workCategories.some((c) => c.toLowerCase().includes('photograph')),
  },
  {
    id: 'fashion',
    label: 'Fashion Professionals',
    icon: Scissors,
    matchFn: (p) =>
      p.user.profession.toLowerCase().includes('clothier') ||
      p.user.profession.toLowerCase().includes('tailor') ||
      p.user.profession.toLowerCase().includes('fashion') ||
      p.workCategories.some((c) => c.toLowerCase().includes('fashion') || c.toLowerCase().includes('tailoring')),
  },
  {
    id: 'artisans',
    label: 'Artisans',
    icon: Hammer,
    matchFn: (p) =>
      p.user.profession.toLowerCase().includes('artisan') ||
      p.user.profession.toLowerCase().includes('cabinetmaker') ||
      p.user.profession.toLowerCase().includes('carpenter') ||
      p.user.profession.toLowerCase().includes('joiner') ||
      p.workCategories.some((c) => c.toLowerCase().includes('carpentry') || c.toLowerCase().includes('joinery')),
  },
  {
    id: 'creators',
    label: 'Creators',
    icon: Video,
    matchFn: (p) =>
      p.user.profession.toLowerCase().includes('creative') ||
      p.user.profession.toLowerCase().includes('animat') ||
      p.workCategories.some((c) => c.toLowerCase().includes('creative') || c.toLowerCase().includes('animat')),
  },
  {
    id: 'freelancers',
    label: 'Freelancers',
    icon: PenTool,
    matchFn: (p) =>
      p.user.profession.toLowerCase().includes('writer') ||
      p.user.profession.toLowerCase().includes('consultant') ||
      p.user.profession.toLowerCase().includes('freelancer') ||
      p.workCategories.some((c) => c.toLowerCase().includes('technical') || c.toLowerCase().includes('writing')),
  },
];

// Stemming / trade keywords helper for intelligent search relevance
function matchesTerm(target: string, term: string): boolean {
  if (!target) return false;
  const t = target.toLowerCase();
  const q = term.toLowerCase().trim();
  if (!q) return false;

  if (t.includes(q)) return true;

  // Domain stems:
  // Photography: photo, photograph, photographer, photography
  if (q.startsWith('photo') && t.includes('photo')) return true;
  // Development: dev, developer, software, engineer, coding, web dev
  if ((q.startsWith('dev') || q.includes('software') || q.includes('code') || q.includes('web')) &&
      (t.includes('dev') || t.includes('software') || t.includes('engineer') || t.includes('code') || t.includes('web'))) {
    return true;
  }
  // Design: design, designer, ui, ux, figma
  if (q.startsWith('design') && (t.includes('design') || t.includes('ui') || t.includes('ux'))) return true;
  // Tailoring: tailor, fashion, clothier, bespoke, suiting, seamstress
  if ((q.startsWith('tailor') || q.includes('fashion') || q.includes('cloth') || q.includes('suit')) &&
      (t.includes('tailor') || t.includes('fashion') || t.includes('cloth') || t.includes('suit'))) {
    return true;
  }
  // Artisan: wood, woodcraft, carpentry, cabinetmaker, artisan, joinery
  if ((q.startsWith('wood') || q.includes('artisan') || q.includes('cabinet') || q.includes('carpent') || q.includes('join')) &&
      (t.includes('wood') || t.includes('artisan') || t.includes('cabinet') || t.includes('carpent') || t.includes('join'))) {
    return true;
  }
  // Writing: writer, technical writing, documentation, docs, content
  if ((q.startsWith('writ') || q.includes('doc')) && (t.includes('writ') || t.includes('doc'))) return true;
  // Motion / Animation: animation, animat, motion, 3d, video, creative
  if ((q.includes('animat') || q.includes('motion') || q.includes('creative') || q.includes('video')) &&
      (t.includes('animat') || t.includes('motion') || t.includes('creative') || t.includes('video'))) {
    return true;
  }

  return false;
}

export const DiscoverView: React.FC<DiscoverViewProps> = ({
  currentUser,
  discoverables,
  onViewProfessional,
  onUpdateCurrentUser,
  onGoToProfile,
  onMessageProfessional,
}) => {
  // Search query
  const [searchQuery, setSearchQuery] = useState('');

  // Proof requirement filter (Simple, friendly chips)
  const [proofFilter, setProofFilter] = useState<ProofRequirementFilter>('all');

  // Category filter
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);

  // Advanced filters state
  const [selectedLocation, setSelectedLocation] = useState<string>('all');
  const [selectedProfession, setSelectedProfession] = useState<string>('all');
  const [selectedSkill, setSelectedSkill] = useState<string>('all');
  const [selectedWorkCategory, setSelectedWorkCategory] = useState<string>('all');

  // Mobile filter drawer state
  const [showFiltersDrawer, setShowFiltersDrawer] = useState(false);

  // Extract distinct filter options across all discoverable professionals
  const availableLocations = useMemo(() => {
    const locs = new Set<string>();
    discoverables.forEach((p) => {
      if (p.user.location && p.user.location.trim()) {
        locs.add(p.user.location.trim());
      }
    });
    return Array.from(locs).sort();
  }, [discoverables]);

  const availableProfessions = useMemo(() => {
    const profs = new Set<string>();
    discoverables.forEach((p) => {
      if (p.user.profession && p.user.profession.trim()) {
        profs.add(p.user.profession.trim());
      }
    });
    return Array.from(profs).sort();
  }, [discoverables]);

  const availableSkills = useMemo(() => {
    const skills = new Set<string>();
    discoverables.forEach((p) => {
      p.demonstratedSkills.forEach((s) => {
        if (s && s.trim()) skills.add(s.trim());
      });
      (p.profileOnlySkills || []).forEach((s) => {
        if (s && s.trim()) skills.add(s.trim());
      });
    });
    return Array.from(skills).sort();
  }, [discoverables]);

  const availableWorkCategories = useMemo(() => {
    const cats = new Set<string>();
    discoverables.forEach((p) => {
      p.workCategories.forEach((c) => {
        if (c && c.trim()) cats.add(c.trim());
      });
    });
    return Array.from(cats).sort();
  }, [discoverables]);

  // Check if any filter is active
  const hasActiveFilters = useMemo(() => {
    return (
      searchQuery.trim() !== '' ||
      proofFilter !== 'all' ||
      selectedCategory !== null ||
      selectedLocation !== 'all' ||
      selectedProfession !== 'all' ||
      selectedSkill !== 'all' ||
      selectedWorkCategory !== 'all'
    );
  }, [
    searchQuery,
    proofFilter,
    selectedCategory,
    selectedLocation,
    selectedProfession,
    selectedSkill,
    selectedWorkCategory,
  ]);

  const resetAllFilters = () => {
    setSearchQuery('');
    setProofFilter('all');
    setSelectedCategory(null);
    setSelectedLocation('all');
    setSelectedProfession('all');
    setSelectedSkill('all');
    setSelectedWorkCategory('all');
  };

  // SEARCH RELEVANCE & PROOF RANKING ENGINE
  // Prioritizes:
  // 1. Profession matching
  // 2. Demonstrated Skills (weighted by count of public documented works demonstrating that skill)
  // 3. Relevant public work categories
  // 4. Client-confirmed proof volume (tie-breaker)
  const rankedProfessionals = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    const queryTokens = q ? q.split(/\s+/).filter(Boolean) : [];

    // Filter and score
    const scoredList: Array<{ prof: DiscoverProfessional; score: number }> = [];

    for (const prof of discoverables) {
      // 1. PROOF FILTER (Simple proof requirement)
      if (proofFilter === 'client-confirmed' && prof.clientConfirmedRecords === 0) {
        continue;
      }
      if (proofFilter === 'evidence-backed' && prof.evidenceBackedRecords === 0) {
        continue;
      }
      if (proofFilter === 'documented' && prof.totalPublicRecords === 0) {
        continue;
      }

      // 2. CATEGORY FILTER
      if (selectedCategory) {
        const catObj = DISCOVERY_CATEGORIES.find((c) => c.id === selectedCategory);
        if (catObj && !catObj.matchFn(prof)) {
          continue;
        }
      }

      // 3. LOCATION FILTER
      if (selectedLocation !== 'all' && prof.user.location !== selectedLocation) {
        continue;
      }

      // 4. PROFESSION FILTER
      if (selectedProfession !== 'all' && prof.user.profession !== selectedProfession) {
        continue;
      }

      // 5. SKILL FILTER
      if (selectedSkill !== 'all') {
        const hasDemSkill = prof.demonstratedSkills.some(
          (s) => s.toLowerCase() === selectedSkill.toLowerCase()
        );
        const hasProfSkill = (prof.profileOnlySkills || []).some(
          (s) => s.toLowerCase() === selectedSkill.toLowerCase()
        );
        if (!hasDemSkill && !hasProfSkill) {
          continue;
        }
      }

      // 6. WORK CATEGORY FILTER
      if (selectedWorkCategory !== 'all') {
        const hasCat = prof.workCategories.some(
          (c) => c.toLowerCase() === selectedWorkCategory.toLowerCase()
        );
        if (!hasCat) {
          continue;
        }
      }

      // If no query string, rank purely by verified public proof volume
      if (!q) {
        const baseProofScore =
          prof.clientConfirmedRecords * 15 +
          prof.evidenceBackedRecords * 8 +
          prof.totalPublicRecords * 2;
        scoredList.push({ prof, score: baseProofScore });
        continue;
      }

      // 7. INTELLIGENT RELEVANCE SCORING FOR SEARCH QUERY
      let relevanceScore = 0;
      let hasAnyMatch = false;

      const profTitle = prof.user.profession || '';
      const fullName = prof.user.fullName || '';
      const userBio = prof.user.shortBio || '';
      const userLoc = prof.user.location || '';

      // A. Profession Match (Highest Priority)
      // E.g., "Photographer" or "Web Developer"
      if (matchesTerm(profTitle, q)) {
        relevanceScore += 250;
        hasAnyMatch = true;
      } else {
        queryTokens.forEach((token) => {
          if (matchesTerm(profTitle, token)) {
            relevanceScore += 120;
            hasAnyMatch = true;
          }
        });
      }

      // B. Demonstrated Skills Match (Priority: Skills proven by documented works)
      // E.g. "Photography", "Web Development", "React"
      (prof.demonstratedSkillsWithCounts || []).forEach((skill) => {
        if (matchesTerm(skill.name, q)) {
          relevanceScore += 180 + skill.documentedWorkCount * 30 + skill.clientConfirmedCount * 25;
          hasAnyMatch = true;
        } else {
          queryTokens.forEach((token) => {
            if (matchesTerm(skill.name, token)) {
              relevanceScore += 90 + skill.documentedWorkCount * 20 + skill.clientConfirmedCount * 15;
              hasAnyMatch = true;
            }
          });
        }
      });

      // C. Relevant Public Work Categories Match
      // E.g. "Photography", "Software Engineering", "Design", "Fashion"
      (prof.workCategories || []).forEach((cat) => {
        if (matchesTerm(cat, q)) {
          relevanceScore += 150;
          hasAnyMatch = true;
        } else {
          queryTokens.forEach((token) => {
            if (matchesTerm(cat, token)) {
              relevanceScore += 70;
              hasAnyMatch = true;
            }
          });
        }
      });

      // D. Featured Public Work Deliverable Titles & Descriptions
      (prof.featuredPublicRecords || []).forEach((rec) => {
        if (matchesTerm(rec.title, q)) {
          relevanceScore += 60;
          hasAnyMatch = true;
        }
        if (matchesTerm(rec.description || '', q)) {
          relevanceScore += 30;
          hasAnyMatch = true;
        }
      });

      // E. Name Match
      if (fullName.toLowerCase().includes(q)) {
        relevanceScore += 80;
        hasAnyMatch = true;
      }

      // F. Location Match
      if (matchesTerm(userLoc, q)) {
        relevanceScore += 70;
        hasAnyMatch = true;
      }

      // G. Profile-only skills (unverified, lower boost)
      (prof.profileOnlySkills || []).forEach((sk) => {
        if (matchesTerm(sk, q)) {
          relevanceScore += 30; // significantly lower than demonstrated skills
          hasAnyMatch = true;
        }
      });

      // If user typed a search query and no field matched, exclude from results
      if (!hasAnyMatch) {
        continue;
      }

      // Add proof tie-breaker so people with more client confirmations and evidence rank higher
      relevanceScore += prof.clientConfirmedRecords * 10;
      relevanceScore += prof.evidenceBackedRecords * 5;
      relevanceScore += prof.totalPublicRecords * 2;

      scoredList.push({ prof, score: relevanceScore });
    }

    // Sort descending by calculated relevance/proof score
    scoredList.sort((a, b) => b.score - a.score);

    return scoredList.map((item) => item.prof);
  }, [
    discoverables,
    searchQuery,
    proofFilter,
    selectedCategory,
    selectedLocation,
    selectedProfession,
    selectedSkill,
    selectedWorkCategory,
  ]);

  return (
    <div className="space-y-6 pb-20 md:pb-12 max-w-6xl mx-auto px-4 sm:px-6">
      
      {/* 1. HEADER: Product Loop & Proof-First Principle Banner */}
      <section className="bg-[#1F2421] text-white rounded-3xl p-6 sm:p-8 shadow-xs relative overflow-hidden border border-[#2D3530]">
        <div className="relative z-10 max-w-3xl">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 border border-white/15 text-[#E5B869] text-xs font-bold tracking-wider uppercase mb-3">
            <Compass className="w-3.5 h-3.5 text-[#E5B869]" />
            <span>SABI Discover • Proof-Based Directory</span>
          </div>

          <h1 className="text-2xl sm:text-3xl font-serif font-extrabold text-white tracking-tight leading-tight">
            Find professionals by proven deliverables, not popularity.
          </h1>

          {/* Core Product Loop */}
          <div className="mt-3 flex flex-wrap items-center gap-1.5 text-xs text-white/80 font-medium">
            <span className="font-bold text-[#E5B869]">Core Loop:</span>
            <span className="px-2 py-0.5 rounded-md bg-white/10 text-white font-semibold">DOCUMENT</span>
            <span>→</span>
            <span className="px-2 py-0.5 rounded-md bg-white/10 text-white font-semibold">PROVE</span>
            <span>→</span>
            <span className="px-2 py-0.5 rounded-md bg-white/10 text-white font-semibold">BUILD REPUTATION</span>
            <span>→</span>
            <span className="px-2 py-0.5 rounded-md bg-[#4D7A70] text-white font-bold">GET DISCOVERED</span>
          </div>

          <p className="mt-3 text-xs sm:text-sm text-stone-300 leading-relaxed max-w-2xl">
            SABI does not use followers, likes, or social algorithms. Professional reputation is represented strictly through documented work records, evidence files, and client-confirmed deliverables.
          </p>
        </div>
      </section>

      {/* 2. SEARCH BAR & PROOF FILTERS */}
      <section className="bg-white rounded-2xl border border-[#E7E2D8] shadow-xs p-4 sm:p-5 space-y-4">
        
        {/* Search Input */}
        <div className="relative">
          <Search className="w-5 h-5 text-[#8C7CA7] absolute left-4 top-3.5" />
          <input
            id="discover-search-input"
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search by profession (e.g. Photographer, Web Developer), demonstrated skill, or category..."
            className="w-full pl-11 pr-10 py-3 bg-[#FAF8F5] border border-[#D5CEC2] focus:border-[#4D7A70] focus:ring-1 focus:ring-[#4D7A70] rounded-xl text-sm font-medium text-[#16222F] outline-none transition-all placeholder:text-[#8C98A2]"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className="absolute right-3.5 top-3.5 p-1 rounded-full text-[#8C98A2] hover:text-[#16222F] transition-colors cursor-pointer"
              title="Clear search"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>

        {/* Friendly Proof Requirement Filter (Simple & Not Intimidating) */}
        <div className="pt-1">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-bold uppercase tracking-wider text-[#2D4D45] flex items-center gap-1.5">
              <ShieldCheck className="w-3.5 h-3.5 text-[#4D7A70]" />
              <span>Proof Level Filter:</span>
            </span>
            {proofFilter !== 'all' && (
              <button
                onClick={() => setProofFilter('all')}
                className="text-xs text-[#52606D] hover:text-[#16222F] underline cursor-pointer"
              >
                Show all proof levels
              </button>
            )}
          </div>

          <div className="flex flex-wrap gap-2">
            <button
              onClick={() => setProofFilter('all')}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all border cursor-pointer ${
                proofFilter === 'all'
                  ? 'bg-[#1F2421] text-white border-[#1F2421] shadow-2xs font-bold'
                  : 'bg-white border-[#E7E2D8] text-[#52606D] hover:text-[#16222F] hover:bg-[#FAF8F5]'
              }`}
            >
              All Documented Profiles
            </button>

            <button
              onClick={() => setProofFilter(proofFilter === 'client-confirmed' ? 'all' : 'client-confirmed')}
              className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold transition-all border cursor-pointer ${
                proofFilter === 'client-confirmed'
                  ? 'bg-[#EAF3EF] border-[#2D4D45] text-[#2D4D45] shadow-2xs font-bold ring-1 ring-[#2D4D45]'
                  : 'bg-white border-[#E7E2D8] text-[#52606D] hover:text-[#2D4D45] hover:border-[#CFE2D9]'
              }`}
            >
              <CheckCircle2 className="w-3.5 h-3.5 text-[#2D4D45]" />
              <span>Has Client-Confirmed Work</span>
            </button>

            <button
              onClick={() => setProofFilter(proofFilter === 'evidence-backed' ? 'all' : 'evidence-backed')}
              className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold transition-all border cursor-pointer ${
                proofFilter === 'evidence-backed'
                  ? 'bg-[#F3EFF9] border-[#61507C] text-[#61507C] shadow-2xs font-bold ring-1 ring-[#61507C]'
                  : 'bg-white border-[#E7E2D8] text-[#52606D] hover:text-[#61507C] hover:border-[#DDD5EB]'
              }`}
            >
              <FileCheck2 className="w-3.5 h-3.5 text-[#61507C]" />
              <span>Has Evidence-Backed Work</span>
            </button>

            <button
              onClick={() => setProofFilter(proofFilter === 'documented' ? 'all' : 'documented')}
              className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold transition-all border cursor-pointer ${
                proofFilter === 'documented'
                  ? 'bg-[#FAF8F5] border-stone-800 text-stone-900 shadow-2xs font-bold ring-1 ring-stone-800'
                  : 'bg-white border-[#E7E2D8] text-[#52606D] hover:text-[#16222F]'
              }`}
            >
              <Briefcase className="w-3.5 h-3.5 text-[#52606D]" />
              <span>Has Documented Work</span>
            </button>
          </div>
        </div>

        {/* Curated Categories */}
        <div className="space-y-1.5 pt-1">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-[#7A8690]">
              Browse Trade Categories
            </span>
            {selectedCategory && (
              <button
                onClick={() => setSelectedCategory(null)}
                className="text-xs text-[#52606D] hover:text-[#16222F] underline cursor-pointer"
              >
                Clear category
              </button>
            )}
          </div>

          <div className="flex flex-wrap gap-2 pt-0.5">
            <button
              onClick={() => setSelectedCategory(null)}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                selectedCategory === null
                  ? 'bg-[#2D4D45] text-white shadow-2xs'
                  : 'bg-[#FAF8F5] text-[#52606D] hover:text-[#16222F] hover:bg-[#EAE6DE]'
              }`}
            >
              All Categories
            </button>
            {DISCOVERY_CATEGORIES.map((cat) => {
              const Icon = cat.icon;
              const isSelected = selectedCategory === cat.id;
              return (
                <button
                  key={cat.id}
                  onClick={() => setSelectedCategory(isSelected ? null : cat.id)}
                  className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold transition-all border cursor-pointer ${
                    isSelected
                      ? 'bg-[#EAF3EF] border-[#4D7A70] text-[#2D4D45] shadow-2xs font-bold'
                      : 'bg-white border-[#E7E2D8] text-[#52606D] hover:text-[#16222F] hover:border-[#4D7A70]/50'
                  }`}
                >
                  <Icon className={`w-3.5 h-3.5 ${isSelected ? 'text-[#4D7A70]' : 'text-[#8C7CA7]'}`} />
                  <span>{cat.label}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Dropdown Filters (Profession, Skill, Location, Work Category) */}
        <div className="pt-2 border-t border-[#E7E2D8]">
          <div className="flex items-center justify-between sm:hidden mb-2">
            <button
              onClick={() => setShowFiltersDrawer(!showFiltersDrawer)}
              className="inline-flex items-center gap-1.5 text-xs font-bold text-[#2D4D45] px-3 py-1.5 rounded-lg bg-[#EAF3EF] border border-[#CFE2D9] cursor-pointer"
            >
              <SlidersHorizontal className="w-3.5 h-3.5" />
              <span>{showFiltersDrawer ? 'Hide Filters' : 'Refine by Profession, Skill & Location'}</span>
              <ChevronDown className={`w-3 h-3 transition-transform ${showFiltersDrawer ? 'rotate-180' : ''}`} />
            </button>

            {hasActiveFilters && (
              <button
                onClick={resetAllFilters}
                className="text-xs text-rose-600 hover:text-rose-700 font-semibold cursor-pointer"
              >
                Reset all
              </button>
            )}
          </div>

          <div className={`grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 ${showFiltersDrawer ? 'block' : 'hidden sm:grid'}`}>
            
            {/* Profession filter */}
            <div>
              <label className="block text-[11px] font-bold text-[#52606D] mb-1">
                Profession
              </label>
              <select
                value={selectedProfession}
                onChange={(e) => setSelectedProfession(e.target.value)}
                className="w-full px-3 py-2 bg-white border border-[#D5CEC2] rounded-xl text-xs font-medium text-[#16222F] outline-none focus:border-[#4D7A70]"
              >
                <option value="all">All Professions ({availableProfessions.length})</option>
                {availableProfessions.map((prof) => (
                  <option key={prof} value={prof}>
                    {prof}
                  </option>
                ))}
              </select>
            </div>

            {/* Skill filter (Demonstrated & Profile skills) */}
            <div>
              <label className="block text-[11px] font-bold text-[#52606D] mb-1">
                Skill
              </label>
              <select
                value={selectedSkill}
                onChange={(e) => setSelectedSkill(e.target.value)}
                className="w-full px-3 py-2 bg-white border border-[#D5CEC2] rounded-xl text-xs font-medium text-[#16222F] outline-none focus:border-[#4D7A70]"
              >
                <option value="all">All Skills ({availableSkills.length})</option>
                {availableSkills.map((sk) => (
                  <option key={sk} value={sk}>
                    {sk}
                  </option>
                ))}
              </select>
            </div>

            {/* Location filter */}
            <div>
              <label className="block text-[11px] font-bold text-[#52606D] mb-1">
                Location
              </label>
              <select
                value={selectedLocation}
                onChange={(e) => setSelectedLocation(e.target.value)}
                className="w-full px-3 py-2 bg-white border border-[#D5CEC2] rounded-xl text-xs font-medium text-[#16222F] outline-none focus:border-[#4D7A70]"
              >
                <option value="all">All Locations ({availableLocations.length})</option>
                {availableLocations.map((loc) => (
                  <option key={loc} value={loc}>
                    {loc}
                  </option>
                ))}
              </select>
            </div>

            {/* Work Category filter */}
            <div>
              <label className="block text-[11px] font-bold text-[#52606D] mb-1">
                Work Category
              </label>
              <select
                value={selectedWorkCategory}
                onChange={(e) => setSelectedWorkCategory(e.target.value)}
                className="w-full px-3 py-2 bg-white border border-[#D5CEC2] rounded-xl text-xs font-medium text-[#16222F] outline-none focus:border-[#4D7A70]"
              >
                <option value="all">All Categories ({availableWorkCategories.length})</option>
                {availableWorkCategories.map((cat) => (
                  <option key={cat} value={cat}>
                    {cat}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Active Filter Tags */}
          {hasActiveFilters && (
            <div className="flex flex-wrap items-center gap-1.5 pt-3 mt-1">
              <span className="text-[11px] font-semibold text-[#52606D]">Active:</span>

              {searchQuery && (
                <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-stone-100 border border-stone-200 text-stone-800 text-[11px]">
                  <span>Query: "{searchQuery}"</span>
                  <button onClick={() => setSearchQuery('')} className="hover:text-stone-900 cursor-pointer">
                    <X className="w-3 h-3" />
                  </button>
                </span>
              )}

              {proofFilter !== 'all' && (
                <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-[#EAF3EF] border border-[#CFE2D9] text-[#2D4D45] text-[11px] font-semibold">
                  <span>Proof: {proofFilter === 'client-confirmed' ? 'Client-Confirmed' : proofFilter === 'evidence-backed' ? 'Evidence-Backed' : 'Documented Work'}</span>
                  <button onClick={() => setProofFilter('all')} className="hover:text-[#16222F] cursor-pointer">
                    <X className="w-3 h-3" />
                  </button>
                </span>
              )}

              {selectedCategory && (
                <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-[#EAF3EF] border border-[#CFE2D9] text-[#2D4D45] text-[11px] font-semibold">
                  <span>Category: {DISCOVERY_CATEGORIES.find((c) => c.id === selectedCategory)?.label}</span>
                  <button onClick={() => setSelectedCategory(null)} className="hover:text-[#16222F] cursor-pointer">
                    <X className="w-3 h-3" />
                  </button>
                </span>
              )}

              {selectedProfession !== 'all' && (
                <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-stone-100 border border-stone-200 text-stone-800 text-[11px]">
                  <span>Profession: {selectedProfession}</span>
                  <button onClick={() => setSelectedProfession('all')} className="hover:text-stone-900 cursor-pointer">
                    <X className="w-3 h-3" />
                  </button>
                </span>
              )}

              {selectedSkill !== 'all' && (
                <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-stone-100 border border-stone-200 text-stone-800 text-[11px]">
                  <span>Skill: {selectedSkill}</span>
                  <button onClick={() => setSelectedSkill('all')} className="hover:text-stone-900 cursor-pointer">
                    <X className="w-3 h-3" />
                  </button>
                </span>
              )}

              {selectedLocation !== 'all' && (
                <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-stone-100 border border-stone-200 text-stone-800 text-[11px]">
                  <span>Location: {selectedLocation}</span>
                  <button onClick={() => setSelectedLocation('all')} className="hover:text-stone-900 cursor-pointer">
                    <X className="w-3 h-3" />
                  </button>
                </span>
              )}

              {selectedWorkCategory !== 'all' && (
                <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-stone-100 border border-stone-200 text-stone-800 text-[11px]">
                  <span>Work: {selectedWorkCategory}</span>
                  <button onClick={() => setSelectedWorkCategory('all')} className="hover:text-stone-900 cursor-pointer">
                    <X className="w-3 h-3" />
                  </button>
                </span>
              )}

              <button
                onClick={resetAllFilters}
                className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-rose-600 hover:text-rose-700 text-[11px] font-semibold cursor-pointer"
              >
                <RotateCcw className="w-3 h-3" />
                <span>Reset all</span>
              </button>
            </div>
          )}
        </div>
      </section>

      {/* 3. RESULTS BAR HEADER */}
      <div className="flex items-center justify-between px-1">
        <div className="flex items-center gap-2">
          <span className="text-sm font-bold text-[#16222F]">
            {rankedProfessionals.length}{' '}
            {rankedProfessionals.length === 1 ? 'Professional' : 'Professionals'} Found
          </span>
          <span className="text-xs text-[#7A8690] hidden sm:inline">• Ranked by proof relevance & documented deliverables</span>
        </div>
        <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-[#EAF3EF] text-[#2D4D45] border border-[#CFE2D9]">
          Opt-in Public Directory
        </span>
      </div>

      {/* 4. DISCOVER RESULTS GRID */}
      {rankedProfessionals.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {rankedProfessionals.map((prof) => {
            const {
              user,
              totalPublicRecords,
              evidenceBackedRecords,
              clientConfirmedRecords,
              demonstratedSkillsWithCounts = [],
              profileOnlySkills = [],
              featuredPublicRecords,
            } = prof;

            return (
              <div
                key={user.id}
                className="bg-white rounded-2xl border border-[#E7E2D8] hover:border-[#4D7A70]/70 p-5 sm:p-6 shadow-xs hover:shadow-md transition-all flex flex-col justify-between group"
              >
                <div>
                  {/* Top: Photo, Name, Profession, Location */}
                  <div className="flex items-start gap-3.5 pb-4 border-b border-[#E7E2D8]">
                    {user.profilePhoto ? (
                      <img
                        src={user.profilePhoto}
                        alt={user.fullName}
                        className="w-14 h-14 rounded-2xl object-cover border-2 border-[#4D7A70]/20 shadow-xs shrink-0"
                      />
                    ) : (
                      <div className="w-14 h-14 rounded-2xl bg-[#4D7A70] text-white flex items-center justify-center font-bold text-lg shadow-xs shrink-0">
                        {user.fullName ? user.fullName.charAt(0).toUpperCase() : 'P'}
                      </div>
                    )}

                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-1.5 flex-wrap">
                        <h2 className="text-base font-extrabold text-[#16222F] tracking-tight truncate">
                          {user.fullName}
                        </h2>
                        {clientConfirmedRecords > 0 && (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-800 text-[10px] font-bold border border-emerald-200">
                            <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                            <span>Client-Confirmed</span>
                          </span>
                        )}
                      </div>

                      <p className="text-xs font-semibold text-[#2D4D45] mt-0.5 leading-snug">
                        {user.profession}
                      </p>

                      <div className="flex items-center gap-3 text-xs text-[#52606D] mt-1.5">
                        {user.location && (
                          <span className="flex items-center gap-1">
                            <MapPin className="w-3.5 h-3.5 text-[#8C7CA7]" />
                            <span>{user.location}</span>
                          </span>
                        )}
                        {user.yearsOfExperience ? (
                          <span className="flex items-center gap-1">
                            <Briefcase className="w-3.5 h-3.5 text-[#8C7CA7]" />
                            <span>{user.yearsOfExperience} yrs practice</span>
                          </span>
                        ) : null}
                      </div>
                    </div>
                  </div>

                  {/* Short Professional Bio */}
                  {user.shortBio && (
                    <p className="text-xs text-[#52606D] mt-3 line-clamp-2 leading-relaxed">
                      {user.shortBio}
                    </p>
                  )}

                  {/* PROOF SIGNALS: Strictly Real Public Data (No Fake Scores) */}
                  <div className="mt-4 p-3 bg-[#FAF8F5] rounded-xl border border-[#E7E2D8]">
                    <div className="text-[10px] font-bold uppercase tracking-wider text-[#7A8690] mb-2 flex items-center justify-between">
                      <span>Documented Proof Signals</span>
                      <span className="text-[#2D4D45] font-semibold">Real Public Ledger</span>
                    </div>

                    <div className="grid grid-cols-3 gap-2">
                      {/* 1. Documented Works */}
                      <div className="bg-white p-2.5 rounded-lg border border-[#E7E2D8] text-center shadow-2xs">
                        <span className="text-base font-black text-[#16222F] block leading-none">
                          {totalPublicRecords}
                        </span>
                        <span className="text-[11px] font-semibold text-[#52606D] block mt-1">
                          {totalPublicRecords === 1 ? 'documented work' : 'documented works'}
                        </span>
                      </div>

                      {/* 2. Evidence-Backed */}
                      <div className="bg-white p-2.5 rounded-lg border border-[#E7E2D8] text-center shadow-2xs">
                        <span className="text-base font-black text-[#61507C] block leading-none flex items-center justify-center gap-1">
                          <FileCheck2 className="w-3.5 h-3.5 text-[#61507C]" />
                          <span>{evidenceBackedRecords}</span>
                        </span>
                        <span className="text-[11px] font-semibold text-[#52606D] block mt-1">
                          evidence-backed
                        </span>
                      </div>

                      {/* 3. Client-Confirmed */}
                      <div className="bg-white p-2.5 rounded-lg border border-[#CFE2D9] text-center shadow-2xs bg-[#FAFDFB]">
                        <span className="text-base font-black text-[#2D4D45] block leading-none flex items-center justify-center gap-1">
                          <CheckCircle2 className="w-3.5 h-3.5 text-[#2D4D45]" />
                          <span>{clientConfirmedRecords}</span>
                        </span>
                        <span className="text-[11px] font-semibold text-[#2D4D45] block mt-1">
                          client-confirmed
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* DEMONSTRATED SKILLS (Connected to Documented Work) */}
                  {demonstratedSkillsWithCounts.length > 0 && (
                    <div className="mt-4 space-y-1.5">
                      <div className="flex items-center justify-between">
                        <span className="text-[11px] font-bold text-[#2D4D45] uppercase tracking-wider flex items-center gap-1">
                          <Sparkles className="w-3 h-3 text-[#E5B869]" />
                          <span>Demonstrated Skills ({demonstratedSkillsWithCounts.length})</span>
                        </span>
                        <span className="text-[10px] text-[#7A8690]">
                          Backed by documented work
                        </span>
                      </div>

                      <div className="flex flex-wrap gap-1.5">
                        {demonstratedSkillsWithCounts.slice(0, 4).map((sk) => (
                          <span
                            key={sk.name}
                            className={`inline-flex items-center gap-1 text-[11px] px-2.5 py-1 rounded-lg font-medium border ${
                              sk.clientConfirmedCount > 0
                                ? 'bg-[#EAF3EF] text-[#2D4D45] border-[#CFE2D9] font-semibold'
                                : sk.evidenceBackedCount > 0
                                ? 'bg-[#F3EFF9] text-[#61507C] border-[#DDD5EB]'
                                : 'bg-[#FAF8F5] text-[#52606D] border-[#E7E2D8]'
                            }`}
                            title={`Demonstrated in ${sk.documentedWorkCount} documented ${
                              sk.documentedWorkCount === 1 ? 'work' : 'works'
                            } (${sk.clientConfirmedCount} client-confirmed)`}
                          >
                            {sk.clientConfirmedCount > 0 ? (
                              <CheckCircle2 className="w-3 h-3 text-[#2D4D45] shrink-0" />
                            ) : sk.evidenceBackedCount > 0 ? (
                              <FileCheck2 className="w-3 h-3 text-[#61507C] shrink-0" />
                            ) : null}
                            <span>{sk.name}</span>
                            <span className="text-[10px] opacity-75 font-mono">
                              ({sk.documentedWorkCount})
                            </span>
                          </span>
                        ))}

                        {demonstratedSkillsWithCounts.length > 4 && (
                          <span className="text-[10px] px-2 py-1 rounded-lg bg-stone-100 text-[#52606D] font-medium self-center">
                            +{demonstratedSkillsWithCounts.length - 4} more proven
                          </span>
                        )}
                      </div>
                    </div>
                  )}

                  {/* PROFILE SKILLS (Claimed by user, 0 works documented yet) */}
                  {profileOnlySkills.length > 0 && (
                    <div className="mt-3 pt-2.5 border-t border-dashed border-[#E7E2D8]">
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-[10px] font-bold text-[#7A8690] uppercase tracking-wider">
                          Profile Skills (Claimed • 0 documented works yet)
                        </span>
                      </div>
                      <div className="flex flex-wrap gap-1">
                        {profileOnlySkills.slice(0, 3).map((sk) => (
                          <span
                            key={sk}
                            className="text-[10px] px-2 py-0.5 rounded-md bg-stone-100 text-stone-500 border border-stone-200"
                            title="Listed by user on profile, but no public work records demonstrating it yet."
                          >
                            {sk}
                          </span>
                        ))}
                        {profileOnlySkills.length > 3 && (
                          <span className="text-[10px] text-stone-400 self-center">
                            +{profileOnlySkills.length - 3}
                          </span>
                        )}
                      </div>
                    </div>
                  )}

                  {/* Verified Public Deliverables Preview */}
                  {featuredPublicRecords && featuredPublicRecords.length > 0 && (
                    <div className="mt-4 space-y-1.5">
                      <span className="text-[10px] font-bold text-[#7A8690] uppercase tracking-wider block">
                        Recent Public Deliverables ({featuredPublicRecords.length}):
                      </span>
                      <div className="space-y-1.5">
                        {featuredPublicRecords.slice(0, 2).map((rec: WorkRecord) => {
                          const isConfirmed =
                            rec.confirmationStatus === 'confirmed' ||
                            (rec.confirmation && rec.confirmation.status === 'confirmed');
                          const hasEvidence =
                            (rec.evidenceList && rec.evidenceList.length > 0) ||
                            rec.evidenceStatus === 'attached' ||
                            rec.evidenceStatus === 'verified';

                          return (
                            <div
                              key={rec.id}
                              className="p-2 rounded-lg bg-[#FAF8F5] border border-[#E7E2D8] text-xs flex items-center justify-between gap-2"
                            >
                              <span className="font-semibold text-[#16222F] truncate">
                                {rec.title}
                              </span>
                              <div className="flex items-center gap-1 shrink-0">
                                {isConfirmed && (
                                  <span className="text-[10px] px-1.5 py-0.5 rounded bg-emerald-50 text-emerald-800 font-bold border border-emerald-200">
                                    Confirmed
                                  </span>
                                )}
                                {hasEvidence && !isConfirmed && (
                                  <span className="text-[10px] px-1.5 py-0.5 rounded bg-purple-50 text-purple-800 font-bold border border-purple-200">
                                    Evidence
                                  </span>
                                )}
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  )}
                </div>

                {/* Card Action: View Proof Profile & Message */}
                <div className="mt-5 pt-4 border-t border-[#E7E2D8] flex items-center justify-between gap-2 flex-wrap">
                  <span className="text-[11px] text-[#7A8690] font-mono">
                    @{user.username}
                  </span>

                  <div className="flex items-center gap-2">
                    {currentUser?.id !== user.id && onMessageProfessional && (
                      <button
                        onClick={() => onMessageProfessional(user)}
                        className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl bg-white hover:bg-[#EAF3EF] text-[#2D4D45] text-xs font-semibold border border-[#CFE2D9] transition-colors cursor-pointer"
                        title="Send a private message to this professional"
                      >
                        <MessageSquare className="w-3.5 h-3.5" />
                        <span>Message</span>
                      </button>
                    )}

                    <button
                      onClick={() => onViewProfessional(user)}
                      className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-[#2D4D45] hover:bg-[#1F3D36] text-white text-xs font-bold shadow-2xs group-hover:bg-[#4D7A70] transition-colors cursor-pointer"
                    >
                      <span>View Proof Profile</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        /* EMPTY STATE */
        <section className="bg-white rounded-3xl border border-[#E7E2D8] p-8 sm:p-12 text-center max-w-xl mx-auto shadow-xs">
          <div className="w-14 h-14 rounded-2xl bg-[#F2EFF8] text-[#8C7CA7] mx-auto flex items-center justify-center mb-4">
            <Search className="w-7 h-7" />
          </div>

          <h2 className="text-lg font-bold text-[#16222F] mb-1 font-display">
            {discoverables.length === 0
              ? 'Directory is currently in a clean state'
              : 'No matching documented professionals found'}
          </h2>

          <p className="text-xs text-[#52606D] max-w-md mx-auto leading-relaxed mb-6">
            {discoverables.length === 0
              ? 'No professionals have opted into public listing yet. SABI only displays real profiles with documented deliverables and proof.'
              : `We couldn't find any professionals matching "${searchQuery}" with the current active filters. SABI only displays profiles that have opted in and documented public deliverables.`}
          </p>

          <div className="space-y-3">
            {hasActiveFilters ? (
              <button
                onClick={resetAllFilters}
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-[#4D7A70] hover:bg-[#3D665D] text-white text-xs font-bold transition-all shadow-xs cursor-pointer"
              >
                <RotateCcw className="w-4 h-4" />
                <span>Reset All Search & Filter Criteria</span>
              </button>
            ) : null}

            <p className="text-[11px] text-[#7A8690]">
              Every listed profile on SABI is backed by tangible completed work and verified client deliverables.
            </p>
          </div>
        </section>
      )}

      {/* DISCOVERY OPT-IN CALLOUT (For logged-in user if unlisted) */}
      {currentUser && !currentUser.appearInDiscover && (
        <section className="bg-[#FAF8F5] rounded-2xl border border-[#D5CEC2] p-5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-amber-500" />
              <h3 className="text-xs font-bold text-[#16222F]">
                Your profile is currently unlisted from Discover
              </h3>
            </div>
            <p className="text-xs text-[#52606D]">
              Want clients to find you through your verified public proof? Enable "Appear in Discover" in your profile settings anytime.
            </p>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            {onUpdateCurrentUser && (
              <button
                onClick={() => {
                  onUpdateCurrentUser({
                    ...currentUser,
                    appearInDiscover: true,
                  });
                }}
                className="px-4 py-2 rounded-xl bg-[#4D7A70] hover:bg-[#3D665D] text-white text-xs font-bold shadow-2xs transition-colors cursor-pointer"
              >
                Opt In to Discover
              </button>
            )}
            {onGoToProfile && (
              <button
                onClick={onGoToProfile}
                className="px-3.5 py-2 rounded-xl bg-white border border-[#D5CEC2] text-[#16222F] text-xs font-semibold hover:bg-stone-50 cursor-pointer"
              >
                Profile Settings
              </button>
            )}
          </div>
        </section>
      )}
    </div>
  );
};
