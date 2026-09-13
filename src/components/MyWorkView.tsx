import React, { useState, useMemo } from 'react';
import {
  Search,
  Plus,
  Filter,
  CheckCircle2,
  Clock,
  Image as ImageIcon,
  Link as LinkIcon,
  FileText,
  Video,
  ExternalLink,
  MapPin,
  Calendar,
  ShieldCheck,
  UserCheck,
  Trash2,
  Edit3,
  Sparkles,
  ArrowUpDown,
  RotateCcw,
  Globe,
  Lock,
  EyeOff
} from 'lucide-react';
import {
  WorkRecord,
  UserProfile,
  ProofStatus,
  getRecordProofStatus
} from '../types';

interface MyWorkViewProps {
  records: WorkRecord[];
  user: UserProfile | null;
  onSelectWork: (record: WorkRecord) => void;
  onOpenAddWork: () => void;
  onEditWork: (record: WorkRecord) => void;
  onDeleteWork: (workId: string) => void;
  onRequestConfirm: (record: WorkRecord) => void;
}

const CATEGORIES = [
  'All Categories',
  'Craft & Trades',
  'Digital & Tech',
  'Creative & Media',
  'Culinary & Hospitality',
  'Care & Community',
  'Construction & Repair',
  'Logistics & Transport',
  'Education & Tutoring',
  'Other',
];

export const MyWorkView: React.FC<MyWorkViewProps> = ({
  records,
  user,
  onSelectWork,
  onOpenAddWork,
  onEditWork,
  onDeleteWork,
  onRequestConfirm,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All Categories');
  const [selectedProofStatus, setSelectedProofStatus] = useState<string>('all');
  const [selectedEvidenceStatus, setSelectedEvidenceStatus] = useState<string>('all');
  const [sortOrder, setSortOrder] = useState<'newest' | 'oldest'>('newest');

  // Filter & sort records
  const filteredRecords = useMemo(() => {
    const list = records.filter((rec) => {
      // 1. Search term
      if (searchQuery.trim()) {
        const query = searchQuery.toLowerCase();
        const matchesTitle = rec.title.toLowerCase().includes(query);
        const matchesDesc = rec.description.toLowerCase().includes(query);
        const matchesSkills = rec.skillsDemonstrated.some((s) => s.toLowerCase().includes(query));
        const matchesClient = rec.clientName?.toLowerCase().includes(query);
        if (!matchesTitle && !matchesDesc && !matchesSkills && !matchesClient) {
          return false;
        }
      }

      // 2. Category filter
      if (selectedCategory !== 'All Categories' && rec.category !== selectedCategory) {
        return false;
      }

      // 3. Derived Proof Status filter
      const derivedStatus: ProofStatus = getRecordProofStatus(rec);
      if (selectedProofStatus !== 'all' && derivedStatus !== selectedProofStatus) {
        return false;
      }

      // 4. Evidence status filter
      const hasEvidence = (rec.evidenceList && rec.evidenceList.length > 0) || rec.evidenceStatus === 'attached';
      if (selectedEvidenceStatus === 'with_evidence' && !hasEvidence) {
        return false;
      }
      if (selectedEvidenceStatus === 'without_evidence' && hasEvidence) {
        return false;
      }

      return true;
    });

    // 5. Sorting by completionDate / createdAt
    return list.sort((a, b) => {
      const dateA = new Date(a.completionDate || a.createdAt).getTime();
      const dateB = new Date(b.completionDate || b.createdAt).getTime();
      return sortOrder === 'newest' ? dateB - dateA : dateA - dateB;
    });
  }, [
    records,
    searchQuery,
    selectedCategory,
    selectedProofStatus,
    selectedEvidenceStatus,
    sortOrder,
  ]);

  // Overall statistics
  const stats = useMemo(() => {
    let clientConfirmedCount = 0;
    let confirmationPendingCount = 0;
    let evidenceAttachedCount = 0;
    let selfDocumentedCount = 0;

    records.forEach((r) => {
      const status = getRecordProofStatus(r);
      if (status === 'Client-confirmed') clientConfirmedCount++;
      else if (status === 'Confirmation pending') confirmationPendingCount++;
      else if (status === 'Evidence-backed') evidenceAttachedCount++;
      else selfDocumentedCount++;
    });

    return {
      total: records.length,
      clientConfirmedCount,
      confirmationPendingCount,
      evidenceAttachedCount,
      selfDocumentedCount,
    };
  }, [records]);

  const hasActiveFilters =
    searchQuery.trim() !== '' ||
    selectedCategory !== 'All Categories' ||
    selectedProofStatus !== 'all' ||
    selectedEvidenceStatus !== 'all' ||
    sortOrder !== 'newest';

  const handleResetFilters = () => {
    setSearchQuery('');
    setSelectedCategory('All Categories');
    setSelectedProofStatus('all');
    setSelectedEvidenceStatus('all');
    setSortOrder('newest');
  };

  return (
    <div className="space-y-6 pb-20 md:pb-12 animate-in fade-in">
      
      {/* Central SABI Philosophy Banner */}
      <div className="p-5 rounded-2xl bg-stone-900 text-stone-100 border border-stone-800 shadow-sm relative overflow-hidden">
        <div className="max-w-2xl relative z-10 space-y-1.5">
          <div className="flex items-center gap-2 text-amber-400 text-xs font-bold uppercase tracking-wider">
            <ShieldCheck className="w-4 h-4" />
            <span>The SABI Philosophy</span>
          </div>
          <h2 className="text-lg sm:text-xl font-bold tracking-tight text-white">
            Document what you have actually done.
          </h2>
          <p className="text-xs sm:text-sm text-stone-300 leading-relaxed">
            In SABI, you are not simply claiming what you can do. Every entry here is an evidence-backed record of completed work, verified deliverables, and client testimonials.
          </p>
        </div>

        <div className="mt-4 pt-3 border-t border-stone-800 flex flex-wrap items-center gap-3 text-xs text-stone-400">
          <span>{stats.total} Total Records</span>
          <span>•</span>
          <span className="text-emerald-400 font-semibold">{stats.clientConfirmedCount} Client Confirmed</span>
          <span>•</span>
          <span className="text-amber-400 font-semibold">{stats.confirmationPendingCount} Confirmation Pending</span>
          <span>•</span>
          <span className="text-blue-400 font-semibold">{stats.evidenceAttachedCount} Evidence Attached</span>
          <span>•</span>
          <span>{stats.selfDocumentedCount} Self-documented</span>
        </div>
      </div>

      {/* Top Header & Add Work Action */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-stone-900">
            My Work Ledger
          </h1>
          <p className="text-xs text-stone-500 mt-0.5">
            Audit history of your verified craft, technical deliverables, and completed projects.
          </p>
        </div>

        <button
          onClick={onOpenAddWork}
          className="px-4 py-2.5 bg-amber-500 hover:bg-amber-400 text-stone-950 text-xs font-bold rounded-xl shadow-xs flex items-center justify-center gap-1.5 transition-colors self-start sm:self-auto active:scale-95"
        >
          <Plus className="w-4 h-4" />
          <span>Document New Work</span>
        </button>
      </div>

      {/* Comprehensive Filter & Sort Bar */}
      <div className="bg-white rounded-2xl border border-stone-200 p-4 shadow-2xs space-y-3">
        
        {/* Search Input */}
        <div className="relative">
          <Search className="w-4 h-4 text-stone-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search documented work by title, skills, description, or client name..."
            className="w-full pl-9.5 pr-4 py-2 text-xs rounded-xl border border-stone-300 bg-stone-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 transition-colors"
          />
        </div>

        {/* Filter Controls Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2.5 pt-1">
          
          {/* Category Filter */}
          <div>
            <label className="block text-[11px] font-semibold text-stone-500 mb-1">
              Category
            </label>
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="w-full px-3 py-1.5 text-xs rounded-lg border border-stone-300 bg-white text-stone-800 focus:outline-none focus:ring-1 focus:ring-amber-500 cursor-pointer"
            >
              {CATEGORIES.map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </select>
          </div>

          {/* Confirmation Status Filter */}
          <div>
            <label className="block text-[11px] font-semibold text-stone-500 mb-1">
              Confirmation Status
            </label>
            <select
              value={selectedProofStatus}
              onChange={(e) => setSelectedProofStatus(e.target.value)}
              className="w-full px-3 py-1.5 text-xs rounded-lg border border-stone-300 bg-white text-stone-800 focus:outline-none focus:ring-1 focus:ring-amber-500 cursor-pointer"
            >
              <option value="all">All Statuses ({records.length})</option>
              <option value="Client-confirmed">Client-confirmed ({stats.clientConfirmedCount})</option>
              <option value="Confirmation pending">Confirmation pending ({stats.confirmationPendingCount})</option>
              <option value="Evidence-backed">Evidence-backed ({stats.evidenceAttachedCount})</option>
              <option value="Self-documented">Self-documented ({stats.selfDocumentedCount})</option>
            </select>
          </div>

          {/* Evidence Status Filter */}
          <div>
            <label className="block text-[11px] font-semibold text-stone-500 mb-1">
              Evidence Status
            </label>
            <select
              value={selectedEvidenceStatus}
              onChange={(e) => setSelectedEvidenceStatus(e.target.value)}
              className="w-full px-3 py-1.5 text-xs rounded-lg border border-stone-300 bg-white text-stone-800 focus:outline-none focus:ring-1 focus:ring-amber-500 cursor-pointer"
            >
              <option value="all">All Evidence</option>
              <option value="with_evidence">With Evidence Items</option>
              <option value="without_evidence">Without Evidence Items</option>
            </select>
          </div>

          {/* Sort Order */}
          <div>
            <label className="block text-[11px] font-semibold text-stone-500 mb-1">
              Sort By
            </label>
            <div className="flex items-center gap-1.5">
              <select
                value={sortOrder}
                onChange={(e) => setSortOrder(e.target.value as 'newest' | 'oldest')}
                className="flex-1 px-3 py-1.5 text-xs rounded-lg border border-stone-300 bg-white text-stone-800 focus:outline-none focus:ring-1 focus:ring-amber-500 cursor-pointer"
              >
                <option value="newest">Newest Completion Date</option>
                <option value="oldest">Oldest Completion Date</option>
              </select>

              {hasActiveFilters && (
                <button
                  type="button"
                  onClick={handleResetFilters}
                  className="p-1.5 text-stone-500 hover:text-stone-900 border border-stone-300 rounded-lg hover:bg-stone-100 transition-colors"
                  title="Reset all filters"
                >
                  <RotateCcw className="w-4 h-4" />
                </button>
              )}
            </div>
          </div>

        </div>

        {/* Results count & active tags */}
        <div className="flex items-center justify-between pt-2 border-t border-stone-100 text-xs text-stone-500">
          <span>
            Showing <strong className="text-stone-900">{filteredRecords.length}</strong> of{' '}
            <strong>{records.length}</strong> work records
          </span>
          {hasActiveFilters && (
            <button
              onClick={handleResetFilters}
              className="text-amber-800 hover:underline text-xs font-semibold"
            >
              Clear filters
            </button>
          )}
        </div>

      </div>

      {/* Work Records List */}
      {filteredRecords.length === 0 ? (
        <div className="p-12 text-center bg-white rounded-2xl border border-dashed border-stone-300 space-y-3">
          <div className="w-12 h-12 rounded-full bg-amber-50 text-amber-700 flex items-center justify-center mx-auto">
            <FileText className="w-6 h-6" />
          </div>
          <h3 className="text-base font-bold text-stone-900">
            {records.length === 0 ? 'No Work Recorded Yet' : 'No matching records found'}
          </h3>
          <p className="text-xs text-stone-500 max-w-sm mx-auto">
            {records.length === 0
              ? 'Start building your SABI ledger by documenting completed work, attaching evidence, and requesting client confirmations.'
              : 'Try changing your category, confirmation status, or search terms to view other work records.'}
          </p>
          {records.length === 0 ? (
            <button
              onClick={onOpenAddWork}
              className="px-4 py-2 bg-amber-500 text-stone-950 font-bold text-xs rounded-xl shadow-xs hover:bg-amber-400 transition-colors mt-2"
            >
              + Document Your First Work
            </button>
          ) : (
            <button
              onClick={handleResetFilters}
              className="px-4 py-1.5 bg-stone-100 text-stone-700 text-xs font-semibold rounded-lg hover:bg-stone-200 transition-colors"
            >
              Reset Filters
            </button>
          )}
        </div>
      ) : (
        <div className="space-y-4">
          {filteredRecords.map((record) => {
            const proofStatus: ProofStatus = getRecordProofStatus(record);
            const evidenceCount = record.evidenceList ? record.evidenceList.length : 0;
            const confirmation = record.confirmation;

            return (
              <div
                key={record.id}
                className="bg-white rounded-2xl border border-stone-200 p-5 shadow-2xs hover:border-stone-300 hover:shadow-xs transition-all space-y-4 text-stone-900"
              >
                {/* Card Meta & Proof Status Header */}
                <div className="flex flex-wrap items-center justify-between gap-2 border-b border-stone-100 pb-3">
                  <div className="flex items-center gap-2 text-xs">
                    <span className="font-semibold text-stone-700 uppercase tracking-wider text-[11px] bg-stone-100 px-2 py-0.5 rounded">
                      {record.category}
                    </span>
                    <span className="text-stone-300">•</span>
                    <span className="text-stone-500 flex items-center gap-1">
                      <Calendar className="w-3.5 h-3.5 text-stone-400" />
                      {record.completionDate}
                    </span>
                    {record.location && (
                      <>
                        <span className="text-stone-300 hidden sm:inline">•</span>
                        <span className="text-stone-500 hidden sm:flex items-center gap-1">
                          <MapPin className="w-3.5 h-3.5 text-stone-400" />
                          {record.location}
                        </span>
                      </>
                    )}
                  </div>

                  {/* Exact Status Badges */}
                  <div className="flex items-center gap-2">
                    {/* Visibility icon */}
                    {record.visibility === 'public' && (
                      <span className="text-[11px] text-stone-400 flex items-center gap-0.5" title="Public record">
                        <Globe className="w-3 h-3 text-emerald-600" />
                      </span>
                    )}
                    {record.visibility === 'unlisted' && (
                      <span className="text-[11px] text-stone-400 flex items-center gap-0.5" title="Unlisted link">
                        <EyeOff className="w-3 h-3 text-amber-600" />
                      </span>
                    )}
                    {record.visibility === 'private' && (
                      <span className="text-[11px] text-stone-400 flex items-center gap-0.5" title="Private">
                        <Lock className="w-3 h-3 text-stone-500" />
                      </span>
                    )}

                    {proofStatus === 'Client-confirmed' && (
                      <span className="inline-flex items-center gap-1 text-[11px] font-bold px-2.5 py-0.5 rounded-full bg-[#EAF3EF] text-[#2D4D45] border border-[#CFE2D9]">
                        <CheckCircle2 className="w-3.5 h-3.5 text-[#4D7A70]" strokeWidth={2.5} />
                        <span>Client-confirmed</span>
                      </span>
                    )}

                    {proofStatus === 'Confirmation pending' && (
                      <span className="inline-flex items-center gap-1 text-[11px] font-bold px-2.5 py-0.5 rounded-full bg-[#FDF5EA] text-[#93652E] border border-[#F3DFC3]">
                        <Clock className="w-3.5 h-3.5 text-[#D4A359]" />
                        <span>Confirmation pending</span>
                      </span>
                    )}

                    {proofStatus === 'Evidence-backed' && (
                      <span className="inline-flex items-center gap-1 text-[11px] font-bold px-2.5 py-0.5 rounded-full bg-[#F3EFF9] text-[#61507C] border border-[#DDD5EB]">
                        <ShieldCheck className="w-3.5 h-3.5 text-[#8C7CA7]" />
                        <span>Evidence-backed</span>
                      </span>
                    )}

                    {proofStatus === 'Self-documented' && (
                      <span className="inline-flex items-center gap-1 text-[11px] font-medium px-2.5 py-0.5 rounded-full bg-[#FAF8F5] text-[#7A8690] border border-[#E7E2D8]">
                        <FileText className="w-3.5 h-3.5 text-[#A7B1AB]" />
                        <span>Self-documented</span>
                      </span>
                    )}
                  </div>
                </div>

                {/* Main Info */}
                <div className="space-y-2">
                  <h3
                    onClick={() => onSelectWork(record)}
                    className="text-base sm:text-lg font-bold text-stone-900 hover:text-amber-800 cursor-pointer transition-colors"
                  >
                    {record.title}
                  </h3>

                  <p className="text-xs text-stone-600 line-clamp-2 leading-relaxed">
                    {record.description}
                  </p>
                </div>

                {/* Testimonial Quote if Confirmed */}
                {proofStatus === 'Client-confirmed' && confirmation?.testimonial && (
                  <div className="p-3 bg-emerald-50/70 border border-emerald-200/70 rounded-xl text-xs text-stone-800 italic">
                    “{confirmation.testimonial}”
                    <span className="block mt-1 font-semibold text-emerald-950 not-italic text-[11px]">
                      — {confirmation.clientName}
                      {confirmation.clientRole ? `, ${confirmation.clientRole}` : ''}
                    </span>
                  </div>
                )}

                {/* Skills Chips */}
                <div className="flex flex-wrap gap-1.5 pt-1">
                  {record.skillsDemonstrated.map((sk, idx) => (
                    <span
                      key={idx}
                      className="text-[11px] font-semibold px-2 py-0.5 rounded-md bg-stone-100 text-stone-700 border border-stone-200"
                    >
                      {sk}
                    </span>
                  ))}
                </div>

                {/* Evidence Artifacts Thumbnails Strip */}
                {record.evidenceList && record.evidenceList.length > 0 && (
                  <div className="pt-2 border-t border-stone-100 flex items-center gap-2 overflow-x-auto pb-1">
                    <span className="text-[11px] font-semibold text-stone-400 shrink-0">
                      Proof ({evidenceCount}):
                    </span>
                    {record.evidenceList.slice(0, 4).map((ev) => (
                      <div
                        key={ev.id}
                        onClick={() => onSelectWork(record)}
                        className="w-12 h-12 rounded-lg border border-stone-200 overflow-hidden shrink-0 bg-stone-100 flex items-center justify-center cursor-pointer hover:border-amber-400 transition-colors"
                        title={ev.caption}
                      >
                        {ev.type === 'image' ? (
                          <img src={ev.url} alt="" className="w-full h-full object-cover" />
                        ) : ev.type === 'video' ? (
                          <Video className="w-4 h-4 text-stone-600" />
                        ) : ev.type === 'document' ? (
                          <FileText className="w-4 h-4 text-stone-600" />
                        ) : (
                          <LinkIcon className="w-4 h-4 text-stone-600" />
                        )}
                      </div>
                    ))}
                    {record.evidenceList.length > 4 && (
                      <span
                        onClick={() => onSelectWork(record)}
                        className="text-[11px] text-stone-500 font-semibold cursor-pointer hover:text-stone-900"
                      >
                        +{record.evidenceList.length - 4} more
                      </span>
                    )}
                  </div>
                )}

                {/* Card Actions Footer */}
                <div className="pt-3 border-t border-stone-100 flex flex-wrap items-center justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => onSelectWork(record)}
                      className="px-3.5 py-1.5 bg-stone-900 hover:bg-stone-800 text-stone-100 text-xs font-bold rounded-lg transition-colors"
                    >
                      View Proof Record
                    </button>
                    <button
                      onClick={() => onEditWork(record)}
                      className="px-2.5 py-1.5 text-stone-600 hover:text-stone-900 text-xs font-semibold rounded-lg hover:bg-stone-100 transition-colors flex items-center gap-1"
                    >
                      <Edit3 className="w-3.5 h-3.5" />
                      <span>Edit</span>
                    </button>
                  </div>

                  <div className="flex items-center gap-2">
                    {proofStatus !== 'Client-confirmed' && (
                      <button
                        onClick={() => onRequestConfirm(record)}
                        className="px-2.5 py-1.5 text-emerald-800 hover:text-emerald-950 text-xs font-semibold rounded-lg hover:bg-emerald-50 transition-colors flex items-center gap-1"
                      >
                        <UserCheck className="w-3.5 h-3.5" />
                        <span>{proofStatus === 'Confirmation pending' ? 'Update Review Link' : 'Request Confirmation'}</span>
                      </button>
                    )}

                    <button
                      onClick={() => {
                        if (confirm(`Delete "${record.title}"?`)) {
                          onDeleteWork(record.id);
                        }
                      }}
                      className="p-1.5 text-stone-400 hover:text-red-600 rounded-lg hover:bg-red-50 transition-colors"
                      title="Delete record"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>

              </div>
            );
          })}
        </div>
      )}

    </div>
  );
};
