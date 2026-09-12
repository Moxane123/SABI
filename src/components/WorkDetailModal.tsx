import React, { useState, useRef } from 'react';
import {
  X,
  Calendar,
  MapPin,
  CheckCircle2,
  Clock,
  ShieldCheck,
  Plus,
  Trash2,
  ExternalLink,
  Video,
  FileText,
  Link as LinkIcon,
  Copy,
  Check,
  UserCheck,
  Globe,
  Lock,
  EyeOff,
  Edit3,
  Image as ImageIcon,
  Share2,
  FileCheck2,
  Sparkles
} from 'lucide-react';
import {
  WorkRecord,
  EvidenceItem,
  EvidenceType,
  UserProfile,
  VisibilityStatus,
  getRecordProofStatus,
  ProofStatus
} from '../types';
import { db } from '../services/db';

interface WorkDetailModalProps {
  work: WorkRecord | null;
  user: UserProfile | null;
  onClose: () => void;
  onEdit: (work: WorkRecord) => void;
  onDelete: (workId: string) => void;
  onUpdateWork: (updatedWork: WorkRecord) => void;
  onRequestConfirm: (work: WorkRecord) => void;
}

export const WorkDetailModal: React.FC<WorkDetailModalProps> = ({
  work,
  user,
  onClose,
  onEdit,
  onDelete,
  onUpdateWork,
  onRequestConfirm,
}) => {
  if (!work) return null;

  const [evidenceList, setEvidenceList] = useState<EvidenceItem[]>(
    work.evidenceList || db.getEvidenceByWorkId(work.id)
  );
  const [selectedImage, setSelectedImage] = useState<string | null>(null);

  // New evidence sub-form inside detail page
  const [showAddEvidence, setShowAddEvidence] = useState(false);
  const [newType, setNewType] = useState<EvidenceType>('image');
  const [newUrl, setNewUrl] = useState('');
  const [newCaption, setNewCaption] = useState('');
  const [uploadedFileName, setUploadedFileName] = useState('');
  const [uploadedFileSize, setUploadedFileSize] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Copy link state
  const [copiedToken, setCopiedToken] = useState(false);

  // Change visibility state
  const [visibility, setVisibility] = useState<VisibilityStatus>(work.visibility || 'public');

  // Handle local file upload
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 5 * 1024 * 1024) {
      alert('File size exceeds 5MB limit.');
      return;
    }

    const formattedSize =
      file.size > 1024 * 1024
        ? `${(file.size / (1024 * 1024)).toFixed(1)} MB`
        : `${Math.round(file.size / 1024)} KB`;

    const reader = new FileReader();
    reader.onload = (event) => {
      const dataUrl = event.target?.result as string;
      setNewUrl(dataUrl);
      setUploadedFileName(file.name);
      setUploadedFileSize(formattedSize);
      if (!newCaption) {
        setNewCaption(file.name.replace(/\.[^/.]+$/, ''));
      }
    };
    reader.readAsDataURL(file);
  };

  const handleAddEvidence = () => {
    if (!newUrl.trim()) return;

    let defaultName = 'Proof Artifact';
    if (newType === 'image') defaultName = uploadedFileName || 'Photo proof';
    if (newType === 'document') defaultName = uploadedFileName || 'Document artifact';
    if (newType === 'video') defaultName = 'Video demonstration';
    if (newType === 'link') defaultName = 'Web project link';

    const added = db.addEvidence({
      workId: work.id,
      type: newType,
      url: newUrl.trim(),
      caption: newCaption.trim() || 'Work Evidence',
      fileName: defaultName,
      fileSize: uploadedFileSize || undefined,
    });

    const updatedList = [...evidenceList, added];
    setEvidenceList(updatedList);

    // Update parent state
    const refreshed = db.getWorkRecordById(work.id);
    if (refreshed) onUpdateWork(refreshed);

    // Reset sub-form
    setNewUrl('');
    setNewCaption('');
    setUploadedFileName('');
    setUploadedFileSize('');
    setShowAddEvidence(false);
  };

  const handleDeleteEvidence = (evidenceId: string) => {
    if (!confirm('Are you sure you want to remove this proof item?')) return;
    db.deleteEvidence(evidenceId);
    const updated = evidenceList.filter((e) => e.id !== evidenceId);
    setEvidenceList(updated);

    const refreshed = db.getWorkRecordById(work.id);
    if (refreshed) onUpdateWork(refreshed);
  };

  // Change visibility directly from the detail view
  const handleVisibilityChange = (newVisibility: VisibilityStatus) => {
    setVisibility(newVisibility);
    db.updateWorkRecord(work.id, { visibility: newVisibility });
    const refreshed = db.getWorkRecordById(work.id);
    if (refreshed) onUpdateWork(refreshed);
  };

  const confirmation = work.confirmation || db.getConfirmationByWorkId(work.id);
  const proofStatus: ProofStatus = getRecordProofStatus({
    ...work,
    confirmation,
    evidenceList,
  });

  const confirmationUrl = confirmation?.token
    ? `${window.location.origin}${window.location.pathname}?confirm=${confirmation.token}`
    : '';

  const handleCopyConfirmationLink = () => {
    if (!confirmationUrl) return;
    navigator.clipboard.writeText(confirmationUrl);
    setCopiedToken(true);
    setTimeout(() => setCopiedToken(false), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-stone-950/75 backdrop-blur-xs flex items-center justify-center p-3 sm:p-6 animate-in fade-in duration-150">
      <div className="bg-white rounded-2xl border border-stone-200 shadow-2xl max-w-3xl w-full max-h-[92vh] flex flex-col overflow-hidden text-stone-900">
        
        {/* Record Top Bar (Audit Header) */}
        <div className="px-6 py-3.5 border-b border-stone-200 flex flex-wrap items-center justify-between gap-3 bg-stone-50">
          <div className="flex items-center gap-2 text-xs">
            <span className="font-mono text-[11px] font-bold text-stone-500 bg-stone-200/80 px-2 py-0.5 rounded">
              SABI-{work.id.substring(4, 12).toUpperCase()}
            </span>
            <span className="text-stone-300">•</span>
            <span className="font-semibold text-stone-700 uppercase tracking-wider text-[11px]">
              {work.category}
            </span>
            <span className="text-stone-300">•</span>
            <span className="text-stone-500 flex items-center gap-1">
              <Calendar className="w-3.5 h-3.5 text-stone-400" />
              {work.completionDate}
            </span>
            {work.location && (
              <>
                <span className="text-stone-300 hidden sm:inline">•</span>
                <span className="text-stone-500 hidden sm:flex items-center gap-1">
                  <MapPin className="w-3.5 h-3.5 text-stone-400" />
                  {work.location}
                </span>
              </>
            )}
          </div>

          <div className="flex items-center gap-2">
            {/* Visibility Selector */}
            <div className="flex items-center gap-1 bg-white border border-stone-200 rounded-lg px-2 py-1 text-xs">
              {visibility === 'public' && <Globe className="w-3.5 h-3.5 text-emerald-600" />}
              {visibility === 'unlisted' && <EyeOff className="w-3.5 h-3.5 text-amber-600" />}
              {visibility === 'private' && <Lock className="w-3.5 h-3.5 text-stone-500" />}
              <select
                value={visibility}
                onChange={(e) => handleVisibilityChange(e.target.value as VisibilityStatus)}
                className="bg-transparent text-xs font-semibold text-stone-700 focus:outline-none cursor-pointer"
                title="Change visibility of this work record"
              >
                <option value="public">Public Record</option>
                <option value="unlisted">Unlisted Link</option>
                <option value="private">Private (Only You)</option>
              </select>
            </div>

            {/* Edit Button */}
            <button
              onClick={() => onEdit(work)}
              className="px-2.5 py-1 text-xs font-semibold text-stone-700 hover:text-stone-950 hover:bg-stone-200/70 rounded-lg transition-colors flex items-center gap-1"
            >
              <Edit3 className="w-3.5 h-3.5" />
              <span>Edit</span>
            </button>

            {/* Close Button */}
            <button
              onClick={onClose}
              className="p-1 text-stone-400 hover:text-stone-700 hover:bg-stone-200/70 rounded-lg transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Scrollable Proof Record Content */}
        <div className="p-6 overflow-y-auto space-y-6">
          
          {/* Main Work Title & Status Header */}
          <div className="space-y-2">
            <div className="flex flex-wrap items-start justify-between gap-3">
              <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-stone-900 leading-snug">
                {work.title}
              </h1>

              {/* Verified Proof Status Badge */}
              <div>
                {proofStatus === 'Client confirmed' && (
                  <span className="inline-flex items-center gap-1.5 text-xs font-bold px-3 py-1 rounded-full bg-emerald-50 text-emerald-800 border border-emerald-300 shadow-xs">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                    <span>Client confirmed</span>
                  </span>
                )}

                {proofStatus === 'Confirmation pending' && (
                  <span className="inline-flex items-center gap-1.5 text-xs font-bold px-3 py-1 rounded-full bg-amber-50 text-amber-900 border border-amber-300 shadow-xs">
                    <Clock className="w-4 h-4 text-amber-600" />
                    <span>Confirmation pending</span>
                  </span>
                )}

                {proofStatus === 'Evidence attached' && (
                  <span className="inline-flex items-center gap-1.5 text-xs font-bold px-3 py-1 rounded-full bg-blue-50 text-blue-900 border border-blue-300 shadow-xs">
                    <ShieldCheck className="w-4 h-4 text-blue-600" />
                    <span>Evidence attached</span>
                  </span>
                )}

                {proofStatus === 'Self-documented' && (
                  <span className="inline-flex items-center gap-1.5 text-xs font-medium px-3 py-1 rounded-full bg-stone-100 text-stone-700 border border-stone-200">
                    <FileText className="w-4 h-4 text-stone-500" />
                    <span>Self-documented</span>
                  </span>
                )}
              </div>
            </div>

            {/* Description & Problem Solved */}
            <div className="p-4 rounded-xl bg-stone-50 border border-stone-200">
              <h4 className="text-[11px] font-bold uppercase tracking-wider text-stone-500 mb-1">
                Delivered Work & Outcome
              </h4>
              <p className="text-sm text-stone-800 leading-relaxed whitespace-pre-line">
                {work.description}
              </p>
            </div>
          </div>

          {/* Skills Demonstrated & Proven */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <h4 className="text-xs font-bold uppercase tracking-wider text-stone-600 flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-amber-600" />
                <span>Skills Demonstrated ({work.skillsDemonstrated.length})</span>
              </h4>
              <span className="text-[11px] text-stone-400">
                Backed by this deliverable
              </span>
            </div>

            <div className="flex flex-wrap gap-1.5">
              {work.skillsDemonstrated.map((skill, i) => (
                <span
                  key={i}
                  className="text-xs font-semibold px-2.5 py-1 rounded-lg bg-white text-stone-800 border border-stone-200 flex items-center gap-1 shadow-2xs"
                >
                  <Check className="w-3 h-3 text-emerald-600" />
                  <span>{skill}</span>
                </span>
              ))}
            </div>
          </div>

          {/* CLIENT CONFIRMATION LEDGER BLOCK */}
          <div className="p-5 rounded-2xl border border-stone-200 bg-stone-50/70 space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-emerald-700" />
                <h4 className="text-xs font-bold text-stone-900 uppercase tracking-wider">
                  Client / Witness Confirmation Status
                </h4>
              </div>

              {proofStatus !== 'Client confirmed' && (
                <button
                  onClick={() => onRequestConfirm(work)}
                  className="inline-flex items-center gap-1 text-xs font-bold text-emerald-800 hover:text-emerald-950 transition-colors"
                >
                  <UserCheck className="w-3.5 h-3.5" />
                  <span>{proofStatus === 'Confirmation pending' ? 'Update Confirmation' : 'Request Confirmation'}</span>
                </button>
              )}
            </div>

            {/* Confirmed State with Testimonial */}
            {proofStatus === 'Client confirmed' && confirmation && (
              <div className="bg-white p-4 rounded-xl border border-emerald-200 shadow-xs space-y-2.5">
                <div className="flex items-center justify-between text-xs">
                  <div className="flex items-center gap-1.5 font-bold text-emerald-950">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                    <span>Verified by {confirmation.clientName}</span>
                    {confirmation.clientRole && (
                      <span className="font-normal text-stone-500">
                        • {confirmation.clientRole}
                      </span>
                    )}
                  </div>
                  {confirmation.confirmedAt && (
                    <span className="text-[11px] text-stone-400">
                      Confirmed on {new Date(confirmation.confirmedAt).toLocaleDateString()}
                    </span>
                  )}
                </div>

                {confirmation.testimonial ? (
                  <div className="bg-emerald-50/50 p-3.5 rounded-xl border border-emerald-100 text-stone-800 text-xs sm:text-sm italic leading-relaxed">
                    “{confirmation.testimonial}”
                  </div>
                ) : (
                  <p className="text-xs text-stone-600">
                    The client has formally verified that this work deliverable was completed as described.
                  </p>
                )}
              </div>
            )}

            {/* Pending State with Copyable Link */}
            {proofStatus === 'Confirmation pending' && confirmation && (
              <div className="bg-white p-4 rounded-xl border border-amber-200 shadow-xs space-y-3">
                <div className="flex items-center justify-between text-xs">
                  <div className="flex items-center gap-1.5 font-bold text-amber-900">
                    <Clock className="w-4 h-4 text-amber-600" />
                    <span>Awaiting confirmation from {confirmation.clientName}</span>
                  </div>
                  <span className="text-[10px] uppercase font-bold text-amber-800 bg-amber-100 px-2 py-0.5 rounded">
                    Link Active
                  </span>
                </div>

                {confirmation.note && (
                  <p className="text-xs text-stone-600 italic bg-amber-50/50 p-2.5 rounded-lg border border-amber-100">
                    Note sent: “{confirmation.note}”
                  </p>
                )}

                <p className="text-xs text-stone-600">
                  Share this dedicated review link with your client. They can review your deliverables and submit their verification with one click:
                </p>

                <div className="flex items-center gap-2">
                  <input
                    type="text"
                    readOnly
                    value={confirmationUrl}
                    className="flex-1 text-xs font-mono bg-stone-50 border border-stone-300 px-3 py-2 rounded-lg text-stone-700 truncate"
                  />
                  <button
                    onClick={handleCopyConfirmationLink}
                    className="inline-flex items-center gap-1.5 px-3 py-2 bg-stone-900 text-stone-100 text-xs font-bold rounded-lg hover:bg-stone-800 transition-colors shrink-0"
                  >
                    {copiedToken ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                    <span>{copiedToken ? 'Copied' : 'Copy Link'}</span>
                  </button>

                  <a
                    href={confirmationUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="p-2 text-stone-600 hover:text-stone-950 border border-stone-300 rounded-lg hover:bg-stone-100 transition-colors shrink-0"
                    title="Open confirmation review portal"
                  >
                    <ExternalLink className="w-4 h-4" />
                  </a>
                </div>
              </div>
            )}

            {/* Unconfirmed State */}
            {proofStatus !== 'Client confirmed' && proofStatus !== 'Confirmation pending' && (
              <div className="bg-white p-3.5 rounded-xl border border-stone-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
                <p className="text-stone-600">
                  {work.clientName
                    ? `Client listed as ${work.clientName}. Generate a one-click verification link to confirm this deliverable.`
                    : 'Request confirmation from your client or commissioning supervisor to upgrade this to "Client confirmed".'}
                </p>
                <button
                  onClick={() => onRequestConfirm(work)}
                  className="px-3 py-1.5 bg-emerald-700 text-white rounded-lg text-xs font-bold hover:bg-emerald-600 transition-colors shrink-0"
                >
                  Request Client Sign-off
                </button>
              </div>
            )}
          </div>

          {/* EVIDENCE GALLERY & ARTIFACTS SECTION */}
          <div>
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-amber-600" />
                <h4 className="text-xs font-bold uppercase tracking-wider text-stone-900">
                  Documented Evidence Gallery ({evidenceList.length})
                </h4>
              </div>

              <button
                onClick={() => setShowAddEvidence(!showAddEvidence)}
                className="inline-flex items-center gap-1 text-xs font-bold text-amber-800 hover:text-amber-950 transition-colors"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>{showAddEvidence ? 'Close Adder' : 'Add More Evidence'}</span>
              </button>
            </div>

            {/* Inline Evidence Adder Box */}
            {showAddEvidence && (
              <div className="mb-4 p-4 rounded-xl border border-amber-300 bg-amber-50/60 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-stone-900">Attach New Proof Asset</span>
                  <button
                    onClick={() => setShowAddEvidence(false)}
                    className="text-stone-400 hover:text-stone-700 text-xs"
                  >
                    Cancel
                  </button>
                </div>

                <div className="flex items-center gap-1.5">
                  {(['image', 'document', 'video', 'link'] as EvidenceType[]).map((t) => (
                    <button
                      key={t}
                      type="button"
                      onClick={() => {
                        setNewType(t);
                        setNewUrl('');
                      }}
                      className={`px-3 py-1 rounded-lg text-xs font-semibold capitalize transition-colors ${
                        newType === t
                          ? 'bg-amber-500 text-stone-950 font-bold'
                          : 'bg-white text-stone-600 border border-stone-200 hover:bg-stone-100'
                      }`}
                    >
                      {t === 'image' ? 'Photo' : t}
                    </button>
                  ))}
                </div>

                {newType === 'image' || newType === 'document' ? (
                  <div className="space-y-2">
                    <input
                      type="file"
                      ref={fileInputRef}
                      accept={newType === 'image' ? 'image/*' : '.pdf,.doc,.docx,.txt'}
                      onChange={handleFileUpload}
                      className="text-xs text-stone-600 file:mr-2 file:py-1 file:px-2.5 file:rounded-lg file:border-0 file:text-xs file:bg-stone-900 file:text-white"
                    />
                    <div className="flex items-center gap-2">
                      <span className="text-xs text-stone-400">or URL:</span>
                      <input
                        type="url"
                        placeholder="https://..."
                        value={newUrl.startsWith('data:') ? '' : newUrl}
                        onChange={(e) => setNewUrl(e.target.value)}
                        className="flex-1 px-3 py-1.5 text-xs rounded-lg border border-stone-300 bg-white"
                      />
                    </div>
                  </div>
                ) : (
                  <input
                    type="url"
                    placeholder={
                      newType === 'video'
                        ? 'YouTube, Vimeo, Loom link (https://...)'
                        : 'Live website, GitHub, Figma link (https://...)'
                    }
                    value={newUrl}
                    onChange={(e) => setNewUrl(e.target.value)}
                    className="w-full px-3 py-1.5 text-xs rounded-lg border border-stone-300 bg-white"
                  />
                )}

                <div className="flex gap-2">
                  <input
                    type="text"
                    placeholder="Caption describing this proof..."
                    value={newCaption}
                    onChange={(e) => setNewCaption(e.target.value)}
                    className="flex-1 px-3 py-1.5 text-xs rounded-lg border border-stone-300 bg-white"
                  />
                  <button
                    onClick={handleAddEvidence}
                    disabled={!newUrl}
                    className="px-4 py-1.5 bg-stone-900 hover:bg-stone-800 disabled:opacity-40 text-stone-100 font-bold text-xs rounded-lg transition-colors"
                  >
                    Save Evidence
                  </button>
                </div>
              </div>
            )}

            {/* Evidence Gallery Grid */}
            {evidenceList.length === 0 ? (
              <div className="p-6 rounded-xl border border-dashed border-stone-300 text-center text-xs text-stone-500 bg-stone-50/50">
                No evidence attached to this work record yet. Click &ldquo;Add More Evidence&rdquo; to attach photos, blueprints, videos, or project links.
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {evidenceList.map((item) => (
                  <div
                    key={item.id}
                    className="bg-white rounded-xl border border-stone-200 overflow-hidden flex flex-col justify-between group/card shadow-2xs"
                  >
                    {/* Media Display */}
                    {item.type === 'image' ? (
                      <div
                        onClick={() => setSelectedImage(item.url)}
                        className="h-44 bg-stone-100 overflow-hidden cursor-zoom-in relative"
                      >
                        <img
                          src={item.url}
                          alt={item.caption}
                          className="w-full h-full object-cover group-hover/card:scale-105 transition-transform duration-200"
                        />
                        <div className="absolute inset-0 bg-black/25 opacity-0 group-hover/card:opacity-100 transition-opacity flex items-center justify-center text-white text-xs font-semibold">
                          Click to enlarge
                        </div>
                      </div>
                    ) : (
                      <div className="h-32 bg-stone-100 flex flex-col items-center justify-center p-4 text-center">
                        {item.type === 'video' ? (
                          <Video className="w-8 h-8 text-stone-600 mb-1" />
                        ) : item.type === 'document' ? (
                          <FileText className="w-8 h-8 text-stone-600 mb-1" />
                        ) : (
                          <LinkIcon className="w-8 h-8 text-stone-600 mb-1" />
                        )}
                        <a
                          href={item.url}
                          target="_blank"
                          rel="noreferrer"
                          className="text-xs font-bold text-amber-800 hover:underline flex items-center gap-1 mt-1 truncate max-w-[220px]"
                        >
                          <span>Open {item.type}</span>
                          <ExternalLink className="w-3 h-3 shrink-0" />
                        </a>
                      </div>
                    )}

                    {/* Meta info & deletion */}
                    <div className="p-3 border-t border-stone-100 flex items-start justify-between gap-2">
                      <div className="truncate">
                        <p className="text-xs font-semibold text-stone-800 truncate">
                          {item.caption}
                        </p>
                        <p className="text-[10px] text-stone-400 capitalize">
                          {item.type} • {item.fileName || 'Verified Upload'}
                        </p>
                      </div>

                      <button
                        onClick={() => handleDeleteEvidence(item.id)}
                        className="p-1 text-stone-400 hover:text-red-600 rounded"
                        title="Remove evidence"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

        </div>

        {/* Footer Actions */}
        <div className="px-6 py-3.5 border-t border-stone-200 bg-stone-50 flex items-center justify-between">
          <button
            onClick={() => {
              if (confirm(`Delete "${work.title}" permanently? This cannot be undone.`)) {
                onDelete(work.id);
                onClose();
              }
            }}
            className="text-xs font-semibold text-red-600 hover:text-red-700 flex items-center gap-1 transition-colors"
          >
            <Trash2 className="w-3.5 h-3.5" />
            <span>Delete Work Record</span>
          </button>

          <div className="flex items-center gap-2">
            <button
              onClick={() => onEdit(work)}
              className="px-4 py-2 bg-stone-100 hover:bg-stone-200 text-stone-800 text-xs font-semibold rounded-xl transition-colors"
            >
              Edit Work
            </button>
            <button
              onClick={onClose}
              className="px-5 py-2 bg-stone-900 text-stone-100 text-xs font-bold rounded-xl hover:bg-stone-800 transition-colors"
            >
              Done
            </button>
          </div>
        </div>

      </div>

      {/* Lightbox for Zoomed Image */}
      {selectedImage && (
        <div
          onClick={() => setSelectedImage(null)}
          className="fixed inset-0 z-60 bg-black/90 flex items-center justify-center p-4 cursor-zoom-out animate-in fade-in"
        >
          <img
            src={selectedImage}
            alt="Evidence preview"
            className="max-w-full max-h-[90vh] object-contain rounded-lg shadow-2xl"
          />
        </div>
      )}
    </div>
  );
};
