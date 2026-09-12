import React, { useState, useRef } from 'react';
import {
  X,
  Plus,
  Image as ImageIcon,
  Video,
  FileText,
  Link as LinkIcon,
  Trash2,
  Calendar,
  MapPin,
  User,
  Mail,
  ShieldCheck,
  Check,
  AlertCircle,
  Clock,
  ArrowRight,
  ArrowLeft,
  CheckCircle2,
  Briefcase,
  ExternalLink,
  MessageSquare
} from 'lucide-react';
import {
  WorkRecord,
  EvidenceType,
  VisibilityStatus,
  ProofStatus
} from '../types';

interface AddWorkModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (
    recordData: {
      title: string;
      category: string;
      description: string;
      skillsDemonstrated: string[];
      completionDate: string;
      location?: string;
      clientName?: string;
      clientEmail?: string;
      clientNote?: string;
      visibility: VisibilityStatus;
    },
    evidenceItems: Array<{
      type: EvidenceType;
      url: string;
      caption: string;
      fileName?: string;
      fileSize?: string;
    }>,
    requestConfirmation: boolean
  ) => void;
  editingRecord?: WorkRecord | null;
  userSkills?: string[];
}

const CATEGORIES = [
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

export const AddWorkModal: React.FC<AddWorkModalProps> = ({
  isOpen,
  onClose,
  onSave,
  editingRecord,
  userSkills = [],
}) => {
  if (!isOpen) return null;

  // Step state: 1 = Work Details, 2 = Add Proof, 3 = Client Confirmation
  const [currentStep, setCurrentStep] = useState<1 | 2 | 3>(1);

  // STEP 1 Form State: Work Details
  const [title, setTitle] = useState(editingRecord?.title || '');
  const [category, setCategory] = useState(editingRecord?.category || 'Craft & Trades');
  const [description, setDescription] = useState(editingRecord?.description || '');
  const [completionDate, setCompletionDate] = useState(
    editingRecord?.completionDate || new Date().toISOString().substring(0, 10)
  );
  const [location, setLocation] = useState(editingRecord?.location || '');
  const [visibility, setVisibility] = useState<VisibilityStatus>(editingRecord?.visibility || 'public');

  // Skills tag state
  const [skills, setSkills] = useState<string[]>(
    editingRecord?.skillsDemonstrated || []
  );
  const [skillInput, setSkillInput] = useState('');

  // STEP 2 Form State: Add Proof / Evidence
  const [evidenceList, setEvidenceList] = useState<
    Array<{
      type: EvidenceType;
      url: string;
      caption: string;
      fileName?: string;
      fileSize?: string;
    }>
  >([]);

  const [evidenceType, setEvidenceType] = useState<EvidenceType>('image');
  const [evidenceUrl, setEvidenceUrl] = useState('');
  const [evidenceCaption, setEvidenceCaption] = useState('');
  const [uploadedFileName, setUploadedFileName] = useState('');
  const [uploadedFileSize, setUploadedFileSize] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  // STEP 3 Form State: Client or Witness Confirmation
  const [enableConfirmation, setEnableConfirmation] = useState(
    Boolean(editingRecord?.clientName || editingRecord?.clientEmail)
  );
  const [clientName, setClientName] = useState(editingRecord?.clientName || '');
  const [clientEmail, setClientEmail] = useState(editingRecord?.clientEmail || '');
  const [clientNote, setClientNote] = useState('');

  const [errors, setErrors] = useState<{ [key: string]: string }>({});

  // Skill management
  const handleAddSkill = (skillToAdd: string) => {
    const trimmed = skillToAdd.trim();
    if (!trimmed) return;
    if (!skills.includes(trimmed)) {
      setSkills([...skills, trimmed]);
    }
    setSkillInput('');
    if (errors.skills) {
      setErrors((prev) => {
        const next = { ...prev };
        delete next.skills;
        return next;
      });
    }
  };

  const handleRemoveSkill = (skillToRemove: string) => {
    setSkills(skills.filter((s) => s !== skillToRemove));
  };

  // Local file upload handling for images and documents
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 5 * 1024 * 1024) {
      alert('File size exceeds 5MB. Please choose a smaller file.');
      return;
    }

    const formattedSize =
      file.size > 1024 * 1024
        ? `${(file.size / (1024 * 1024)).toFixed(1)} MB`
        : `${Math.round(file.size / 1024)} KB`;

    const reader = new FileReader();
    reader.onload = (event) => {
      const dataUrl = event.target?.result as string;
      setEvidenceUrl(dataUrl);
      setUploadedFileName(file.name);
      setUploadedFileSize(formattedSize);
      if (!evidenceCaption) {
        setEvidenceCaption(file.name.replace(/\.[^/.]+$/, ''));
      }
    };
    reader.readAsDataURL(file);
  };

  // Add evidence item to list
  const handleAddEvidenceItem = () => {
    if (!evidenceUrl.trim()) {
      alert('Please select a file or provide a valid link URL.');
      return;
    }

    let defaultFileName = 'Attached Asset';
    if (evidenceType === 'image') defaultFileName = uploadedFileName || 'Photo proof';
    if (evidenceType === 'document') defaultFileName = uploadedFileName || 'Document proof';
    if (evidenceType === 'video') defaultFileName = 'Video Demonstration';
    if (evidenceType === 'link') defaultFileName = 'Project / Website URL';

    setEvidenceList([
      ...evidenceList,
      {
        type: evidenceType,
        url: evidenceUrl.trim(),
        caption: evidenceCaption.trim() || 'Work Evidence',
        fileName: defaultFileName,
        fileSize: uploadedFileSize || undefined,
      },
    ]);

    // Reset sub-form
    setEvidenceUrl('');
    setEvidenceCaption('');
    setUploadedFileName('');
    setUploadedFileSize('');
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const handleRemoveEvidence = (index: number) => {
    setEvidenceList(evidenceList.filter((_, idx) => idx !== index));
  };

  // Validate Step 1
  const validateStep1 = (): boolean => {
    const newErrors: { [key: string]: string } = {};
    if (!title.trim()) newErrors.title = 'Please enter what you worked on (work title)';
    if (!description.trim()) newErrors.description = 'Please describe the work delivered and outcome';
    if (!completionDate.trim()) newErrors.completionDate = 'Please specify when the work was completed';
    if (skills.length === 0) newErrors.skills = 'Add at least one skill used or demonstrated in this work';

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Validate Step 3 if confirmation enabled
  const validateStep3 = (): boolean => {
    const newErrors: { [key: string]: string } = {};
    if (enableConfirmation) {
      if (!clientName.trim()) newErrors.clientName = "Client or reviewer's name is required";
      if (!clientEmail.trim()) {
        newErrors.clientEmail = 'Client email address is required';
      } else if (!clientEmail.includes('@')) {
        newErrors.clientEmail = 'Please enter a valid email address';
      }
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleNextFromStep1 = () => {
    if (validateStep1()) {
      setCurrentStep(2);
    }
  };

  const handleNextFromStep2 = () => {
    setCurrentStep(3);
  };

  // Calculate resulting proof status preview
  const getProjectedStatus = (): ProofStatus => {
    if (enableConfirmation && clientEmail.trim()) {
      return 'Confirmation pending';
    }
    if (evidenceList.length > 0 || (editingRecord?.evidenceList && editingRecord.evidenceList.length > 0)) {
      return 'Evidence attached';
    }
    return 'Self-documented';
  };

  // Final submit
  const handleSubmit = (e?: React.FormEvent) => {
    if (e) e.preventDefault();

    if (!validateStep1()) {
      setCurrentStep(1);
      return;
    }

    if (enableConfirmation && !validateStep3()) {
      setCurrentStep(3);
      return;
    }

    onSave(
      {
        title: title.trim(),
        category,
        description: description.trim(),
        skillsDemonstrated: skills,
        completionDate,
        location: location.trim() || undefined,
        clientName: enableConfirmation ? clientName.trim() || undefined : undefined,
        clientEmail: enableConfirmation ? clientEmail.trim() || undefined : undefined,
        clientNote: enableConfirmation ? clientNote.trim() || undefined : undefined,
        visibility,
      },
      evidenceList,
      enableConfirmation && Boolean(clientEmail.trim())
    );

    onClose();
  };

  const projectedStatus = getProjectedStatus();

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-stone-950/70 backdrop-blur-xs flex items-center justify-center p-3 sm:p-6 animate-in fade-in duration-150">
      <div className="bg-white rounded-2xl border border-stone-200 shadow-2xl max-w-2xl w-full max-h-[92vh] flex flex-col overflow-hidden text-stone-900">
        
        {/* Modal Header */}
        <div className="px-6 py-4 border-b border-stone-200 bg-stone-50/90 flex items-center justify-between">
          <div>
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-amber-500" />
              <h2 className="text-base sm:text-lg font-bold text-stone-900">
                {editingRecord ? 'Edit Work Record' : 'Document Completed Work'}
              </h2>
            </div>
            <p className="text-xs text-stone-500 mt-0.5">
              Document real deliverables you completed — not just what you say you can do.
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-stone-400 hover:text-stone-700 hover:bg-stone-200 rounded-lg transition-colors"
            title="Close"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Stepper Header */}
        <div className="px-6 py-3 bg-white border-b border-stone-200 grid grid-cols-3 gap-2 text-xs">
          <button
            type="button"
            onClick={() => setCurrentStep(1)}
            className={`flex items-center gap-2 py-1.5 px-2 rounded-lg text-left transition-colors ${
              currentStep === 1
                ? 'bg-amber-50 text-amber-950 font-bold border border-amber-200'
                : 'text-stone-500 hover:text-stone-900'
            }`}
          >
            <div
              className={`w-5 h-5 rounded-full text-[11px] flex items-center justify-center font-bold shrink-0 ${
                currentStep === 1
                  ? 'bg-amber-500 text-stone-950'
                  : 'bg-stone-200 text-stone-700'
              }`}
            >
              1
            </div>
            <span className="truncate">Work Details</span>
          </button>

          <button
            type="button"
            onClick={() => {
              if (validateStep1()) setCurrentStep(2);
            }}
            className={`flex items-center gap-2 py-1.5 px-2 rounded-lg text-left transition-colors ${
              currentStep === 2
                ? 'bg-amber-50 text-amber-950 font-bold border border-amber-200'
                : 'text-stone-500 hover:text-stone-900'
            }`}
          >
            <div
              className={`w-5 h-5 rounded-full text-[11px] flex items-center justify-center font-bold shrink-0 ${
                currentStep === 2
                  ? 'bg-amber-500 text-stone-950'
                  : evidenceList.length > 0
                  ? 'bg-emerald-600 text-white'
                  : 'bg-stone-200 text-stone-700'
              }`}
            >
              {evidenceList.length > 0 ? '✓' : '2'}
            </div>
            <span className="truncate">Add Proof {evidenceList.length > 0 && `(${evidenceList.length})`}</span>
          </button>

          <button
            type="button"
            onClick={() => {
              if (validateStep1()) setCurrentStep(3);
            }}
            className={`flex items-center gap-2 py-1.5 px-2 rounded-lg text-left transition-colors ${
              currentStep === 3
                ? 'bg-amber-50 text-amber-950 font-bold border border-amber-200'
                : 'text-stone-500 hover:text-stone-900'
            }`}
          >
            <div
              className={`w-5 h-5 rounded-full text-[11px] flex items-center justify-center font-bold shrink-0 ${
                currentStep === 3
                  ? 'bg-amber-500 text-stone-950'
                  : enableConfirmation && clientEmail
                  ? 'bg-emerald-600 text-white'
                  : 'bg-stone-200 text-stone-700'
              }`}
            >
              3
            </div>
            <span className="truncate">Confirmation</span>
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 overflow-y-auto flex-1 space-y-5">
          
          {/* ======================================================== */}
          {/* STEP 1: WORK DETAILS */}
          {/* ======================================================== */}
          {currentStep === 1 && (
            <div className="space-y-4 animate-in fade-in duration-100">
              
              {/* Concept reminder banner */}
              <div className="p-3.5 rounded-xl bg-amber-500/10 border border-amber-300/60 text-xs text-amber-950 flex items-start gap-2.5">
                <Briefcase className="w-4 h-4 text-amber-700 shrink-0 mt-0.5" />
                <div>
                  <p className="font-semibold text-amber-900">
                    Document Completed Work
                  </p>
                  <p className="text-amber-800 text-[11px] mt-0.5 leading-relaxed">
                    SABI records what you have actually built or delivered, not theoretical skills. Document a finished project, commission, product, or job with real outcomes.
                  </p>
                </div>
              </div>

              {/* Title / What did you work on */}
              <div>
                <label className="block text-xs font-semibold text-stone-800 mb-1">
                  What did you work on? (Work Title) <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={title}
                  onChange={(e) => {
                    setTitle(e.target.value);
                    if (errors.title) setErrors((prev) => ({ ...prev, title: '' }));
                  }}
                  placeholder="e.g. Bespoke Walnut Dining Table, Mobile Banking App, Bridal Gown..."
                  className={`w-full px-3.5 py-2.5 text-sm rounded-xl border ${
                    errors.title ? 'border-red-400 bg-red-50/30' : 'border-stone-300 bg-white'
                  } focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500`}
                />
                {errors.title && <p className="text-xs text-red-500 mt-1">{errors.title}</p>}
              </div>

              {/* Category & Completion Date */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-stone-800 mb-1">
                    Category <span className="text-red-500">*</span>
                  </label>
                  <select
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                    className="w-full px-3.5 py-2.5 text-sm rounded-xl border border-stone-300 bg-white focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500"
                  >
                    {CATEGORIES.map((c) => (
                      <option key={c} value={c}>
                        {c}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-stone-800 mb-1">
                    When was it completed? <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="date"
                    value={completionDate}
                    onChange={(e) => {
                      setCompletionDate(e.target.value);
                      if (errors.completionDate) setErrors((prev) => ({ ...prev, completionDate: '' }));
                    }}
                    className={`w-full px-3.5 py-2.5 text-sm rounded-xl border ${
                      errors.completionDate ? 'border-red-400 bg-red-50/30' : 'border-stone-300 bg-white'
                    } focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500`}
                  />
                  {errors.completionDate && (
                    <p className="text-xs text-red-500 mt-1">{errors.completionDate}</p>
                  )}
                </div>
              </div>

              {/* Location & Visibility */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-stone-800 mb-1">
                    Location or Setting (optional)
                  </label>
                  <div className="relative">
                    <MapPin className="w-4 h-4 text-stone-400 absolute left-3 top-1/2 -translate-y-1/2" />
                    <input
                      type="text"
                      value={location}
                      onChange={(e) => setLocation(e.target.value)}
                      placeholder="e.g. Lagos, On-site Client, Remote..."
                      className="w-full pl-9 pr-3.5 py-2.5 text-sm rounded-xl border border-stone-300 bg-white focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-stone-800 mb-1">
                    Visibility
                  </label>
                  <select
                    value={visibility}
                    onChange={(e) => setVisibility(e.target.value as VisibilityStatus)}
                    className="w-full px-3.5 py-2.5 text-sm rounded-xl border border-stone-300 bg-white focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500"
                  >
                    <option value="public">Public (Shown on your proof profile)</option>
                    <option value="unlisted">Unlisted (Accessible via direct link only)</option>
                    <option value="private">Private (Only visible to you)</option>
                  </select>
                </div>
              </div>

              {/* Description */}
              <div>
                <label className="block text-xs font-semibold text-stone-800 mb-1">
                  Brief Description & Deliverables <span className="text-red-500">*</span>
                </label>
                <textarea
                  rows={3}
                  value={description}
                  onChange={(e) => {
                    setDescription(e.target.value);
                    if (errors.description) setErrors((prev) => ({ ...prev, description: '' }));
                  }}
                  placeholder="Describe what was built or delivered, the specific problem solved, techniques/materials used, and the final outcome..."
                  className={`w-full px-3.5 py-2.5 text-sm rounded-xl border ${
                    errors.description ? 'border-red-400 bg-red-50/30' : 'border-stone-300 bg-white'
                  } focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500`}
                />
                {errors.description && (
                  <p className="text-xs text-red-500 mt-1">{errors.description}</p>
                )}
              </div>

              {/* Skills Used or Demonstrated */}
              <div className="space-y-2 pt-2 border-t border-stone-100">
                <div>
                  <label className="block text-xs font-semibold text-stone-800">
                    Which skills did you use or demonstrate? <span className="text-red-500">*</span>
                  </label>
                  <p className="text-[11px] text-stone-500 mt-0.5">
                    Link specific competencies to this deliverable. SABI uses this to calculate which of your skills have verified proof.
                  </p>
                </div>

                <div className="flex gap-2">
                  <input
                    type="text"
                    value={skillInput}
                    onChange={(e) => setSkillInput(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        e.preventDefault();
                        handleAddSkill(skillInput);
                      }
                    }}
                    placeholder="Enter skill (e.g. Joinery, React, Tailoring, UI Design)..."
                    className="flex-1 px-3.5 py-2 text-sm rounded-xl border border-stone-300 focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500"
                  />
                  <button
                    type="button"
                    onClick={() => handleAddSkill(skillInput)}
                    className="px-4 py-2 bg-stone-900 text-stone-100 text-xs font-semibold rounded-xl hover:bg-stone-800 transition-colors"
                  >
                    + Add Skill
                  </button>
                </div>

                {/* Profile skill suggestions */}
                {userSkills.length > 0 && (
                  <div className="flex flex-wrap items-center gap-1.5 pt-1">
                    <span className="text-[11px] text-stone-400">Suggestions:</span>
                    {userSkills.map((sk) => (
                      <button
                        key={sk}
                        type="button"
                        onClick={() => handleAddSkill(sk)}
                        className={`text-[11px] px-2 py-0.5 rounded-md border transition-colors ${
                          skills.includes(sk)
                            ? 'bg-amber-100 text-amber-900 border-amber-300 font-semibold'
                            : 'bg-stone-50 text-stone-600 border-stone-200 hover:bg-stone-100'
                        }`}
                      >
                        + {sk}
                      </button>
                    ))}
                  </div>
                )}

                {/* Active Skill Badges */}
                <div className="flex flex-wrap gap-1.5 pt-1">
                  {skills.map((skill) => (
                    <span
                      key={skill}
                      className="inline-flex items-center gap-1.5 text-xs font-semibold px-2.5 py-1 rounded-lg bg-stone-100 text-stone-800 border border-stone-300"
                    >
                      <Check className="w-3 h-3 text-amber-600" />
                      <span>{skill}</span>
                      <button
                        type="button"
                        onClick={() => handleRemoveSkill(skill)}
                        className="text-stone-400 hover:text-stone-700 ml-0.5"
                      >
                        <X className="w-3 h-3" />
                      </button>
                    </span>
                  ))}
                </div>
                {errors.skills && <p className="text-xs text-red-500 mt-1">{errors.skills}</p>}
              </div>

            </div>
          )}

          {/* ======================================================== */}
          {/* STEP 2: ADD PROOF */}
          {/* ======================================================== */}
          {currentStep === 2 && (
            <div className="space-y-4 animate-in fade-in duration-100">
              
              {/* Evidence banner */}
              <div className="p-3.5 rounded-xl bg-amber-500/10 border border-amber-300/60 text-xs text-amber-950 flex items-start gap-2.5">
                <ShieldCheck className="w-4 h-4 text-amber-700 shrink-0 mt-0.5" />
                <div>
                  <p className="font-semibold text-amber-900">
                    Proof Sets You Apart
                  </p>
                  <p className="text-amber-800 text-[11px] mt-0.5 leading-relaxed">
                    Attach photos, documents, videos, or project links to support this work record. You can attach multiple evidence items.
                  </p>
                </div>
              </div>

              {/* Attached Evidence List */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <label className="text-xs font-bold uppercase tracking-wider text-stone-700">
                    Attached Evidence ({evidenceList.length})
                  </label>
                  <span
                    className={`text-xs px-2.5 py-0.5 rounded-full font-semibold ${
                      evidenceList.length > 0
                        ? 'bg-emerald-50 text-emerald-800 border border-emerald-200'
                        : 'bg-stone-100 text-stone-500'
                    }`}
                  >
                    {evidenceList.length > 0 ? 'Evidence Attached' : 'No Proof Attached Yet'}
                  </span>
                </div>

                {evidenceList.length > 0 ? (
                  <div className="space-y-2 max-h-48 overflow-y-auto pr-1">
                    {evidenceList.map((item, idx) => (
                      <div
                        key={idx}
                        className="flex items-center justify-between p-2.5 rounded-xl border border-stone-200 bg-stone-50 text-xs hover:bg-stone-100/70 transition-colors"
                      >
                        <div className="flex items-center gap-2.5 truncate mr-2">
                          {item.type === 'image' ? (
                            <img
                              src={item.url}
                              alt=""
                              className="w-10 h-10 rounded-lg object-cover border border-stone-300 shrink-0"
                            />
                          ) : (
                            <div className="w-10 h-10 rounded-lg bg-stone-200 flex items-center justify-center shrink-0 text-stone-700">
                              {item.type === 'video' && <Video className="w-4 h-4" />}
                              {item.type === 'document' && <FileText className="w-4 h-4" />}
                              {item.type === 'link' && <LinkIcon className="w-4 h-4" />}
                            </div>
                          )}
                          <div className="truncate">
                            <p className="font-semibold text-stone-800 truncate">{item.caption}</p>
                            <p className="text-[10px] text-stone-500 capitalize">
                              {item.type} • {item.fileName} {item.fileSize ? `(${item.fileSize})` : ''}
                            </p>
                          </div>
                        </div>

                        <button
                          type="button"
                          onClick={() => handleRemoveEvidence(idx)}
                          className="p-1 text-stone-400 hover:text-red-600 rounded"
                          title="Remove evidence item"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="p-4 rounded-xl border border-dashed border-stone-300 text-center text-xs text-stone-500 bg-stone-50/50">
                    No evidence items added yet. Use the tool below to attach photos, documents, videos, or links.
                  </div>
                )}
              </div>

              {/* Evidence Input Builder */}
              <div className="p-4 rounded-xl border border-stone-200 bg-stone-50 space-y-3">
                <span className="text-xs font-bold text-stone-900 block">
                  Add Evidence Item
                </span>

                {/* Evidence Type Tabs */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                  <button
                    type="button"
                    onClick={() => {
                      setEvidenceType('image');
                      setEvidenceUrl('');
                    }}
                    className={`p-2 rounded-xl border text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors ${
                      evidenceType === 'image'
                        ? 'bg-amber-500 text-stone-950 border-amber-500 shadow-xs'
                        : 'bg-white text-stone-700 border-stone-200 hover:bg-stone-100'
                    }`}
                  >
                    <ImageIcon className="w-3.5 h-3.5" />
                    <span>Photos</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      setEvidenceType('document');
                      setEvidenceUrl('');
                    }}
                    className={`p-2 rounded-xl border text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors ${
                      evidenceType === 'document'
                        ? 'bg-amber-500 text-stone-950 border-amber-500 shadow-xs'
                        : 'bg-white text-stone-700 border-stone-200 hover:bg-stone-100'
                    }`}
                  >
                    <FileText className="w-3.5 h-3.5" />
                    <span>Documents</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      setEvidenceType('video');
                      setEvidenceUrl('');
                    }}
                    className={`p-2 rounded-xl border text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors ${
                      evidenceType === 'video'
                        ? 'bg-amber-500 text-stone-950 border-amber-500 shadow-xs'
                        : 'bg-white text-stone-700 border-stone-200 hover:bg-stone-100'
                    }`}
                  >
                    <Video className="w-3.5 h-3.5" />
                    <span>Video Link</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      setEvidenceType('link');
                      setEvidenceUrl('');
                    }}
                    className={`p-2 rounded-xl border text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors ${
                      evidenceType === 'link'
                        ? 'bg-amber-500 text-stone-950 border-amber-500 shadow-xs'
                        : 'bg-white text-stone-700 border-stone-200 hover:bg-stone-100'
                    }`}
                  >
                    <LinkIcon className="w-3.5 h-3.5" />
                    <span>Project Link</span>
                  </button>
                </div>

                {/* Evidence Input Fields */}
                {evidenceType === 'image' && (
                  <div className="space-y-2">
                    <label className="block text-[11px] font-semibold text-stone-700">
                      Upload photo of completed craft or deliverable:
                    </label>
                    <div className="flex flex-col sm:flex-row gap-2">
                      <input
                        type="file"
                        ref={fileInputRef}
                        accept="image/*"
                        onChange={handleFileUpload}
                        className="text-xs text-stone-600 file:mr-2 file:py-1.5 file:px-3 file:rounded-lg file:border-0 file:text-xs file:font-semibold file:bg-stone-900 file:text-stone-100 hover:file:bg-stone-800 cursor-pointer"
                      />
                      <span className="text-xs text-stone-400 self-center">or image URL:</span>
                      <input
                        type="url"
                        placeholder="https://..."
                        value={evidenceUrl.startsWith('data:') ? '' : evidenceUrl}
                        onChange={(e) => setEvidenceUrl(e.target.value)}
                        className="flex-1 px-3 py-1.5 text-xs rounded-lg border border-stone-300 bg-white focus:outline-none"
                      />
                    </div>
                    {evidenceUrl.startsWith('data:image') && (
                      <div className="flex items-center gap-2 text-xs text-emerald-700 font-medium">
                        <Check className="w-3.5 h-3.5" />
                        <span>Image loaded: {uploadedFileName} ({uploadedFileSize})</span>
                      </div>
                    )}
                  </div>
                )}

                {evidenceType === 'document' && (
                  <div className="space-y-2">
                    <label className="block text-[11px] font-semibold text-stone-700">
                      Upload PDF, blueprint, contract, invoice, or certificate:
                    </label>
                    <div className="flex flex-col sm:flex-row gap-2">
                      <input
                        type="file"
                        ref={fileInputRef}
                        accept=".pdf,.doc,.docx,.txt,.csv"
                        onChange={handleFileUpload}
                        className="text-xs text-stone-600 file:mr-2 file:py-1.5 file:px-3 file:rounded-lg file:border-0 file:text-xs file:font-semibold file:bg-stone-900 file:text-stone-100 hover:file:bg-stone-800 cursor-pointer"
                      />
                      <span className="text-xs text-stone-400 self-center">or document URL:</span>
                      <input
                        type="url"
                        placeholder="https://..."
                        value={evidenceUrl.startsWith('data:') ? '' : evidenceUrl}
                        onChange={(e) => setEvidenceUrl(e.target.value)}
                        className="flex-1 px-3 py-1.5 text-xs rounded-lg border border-stone-300 bg-white focus:outline-none"
                      />
                    </div>
                    {uploadedFileName && (
                      <div className="flex items-center gap-2 text-xs text-emerald-700 font-medium">
                        <Check className="w-3.5 h-3.5" />
                        <span>Document loaded: {uploadedFileName} ({uploadedFileSize})</span>
                      </div>
                    )}
                  </div>
                )}

                {evidenceType === 'video' && (
                  <div className="space-y-1">
                    <label className="block text-[11px] font-semibold text-stone-700">
                      Video Demonstration URL (YouTube, Vimeo, Loom, Google Drive):
                    </label>
                    <input
                      type="url"
                      placeholder="https://www.youtube.com/watch?v=... or https://loom.com/share/..."
                      value={evidenceUrl}
                      onChange={(e) => setEvidenceUrl(e.target.value)}
                      className="w-full px-3 py-2 text-xs rounded-lg border border-stone-300 bg-white focus:outline-none focus:ring-1 focus:ring-amber-500"
                    />
                  </div>
                )}

                {evidenceType === 'link' && (
                  <div className="space-y-1">
                    <label className="block text-[11px] font-semibold text-stone-700">
                      Website or Project Link (Live site, GitHub, Figma, App Store):
                    </label>
                    <input
                      type="url"
                      placeholder="https://myproject.com or https://github.com/..."
                      value={evidenceUrl}
                      onChange={(e) => setEvidenceUrl(e.target.value)}
                      className="w-full px-3 py-2 text-xs rounded-lg border border-stone-300 bg-white focus:outline-none focus:ring-1 focus:ring-amber-500"
                    />
                  </div>
                )}

                {/* Caption input & Attach button */}
                <div className="flex flex-col sm:flex-row gap-2 pt-1">
                  <input
                    type="text"
                    placeholder="Short caption describing what this proves (optional)..."
                    value={evidenceCaption}
                    onChange={(e) => setEvidenceCaption(e.target.value)}
                    className="flex-1 px-3 py-1.5 text-xs rounded-lg border border-stone-300 bg-white focus:outline-none"
                  />
                  <button
                    type="button"
                    onClick={handleAddEvidenceItem}
                    disabled={!evidenceUrl}
                    className="px-4 py-1.5 bg-stone-900 hover:bg-stone-800 disabled:opacity-40 text-stone-100 text-xs font-semibold rounded-lg transition-colors shrink-0"
                  >
                    + Attach Item
                  </button>
                </div>
              </div>

            </div>
          )}

          {/* ======================================================== */}
          {/* STEP 3: CLIENT OR WITNESS CONFIRMATION */}
          {/* ======================================================== */}
          {currentStep === 3 && (
            <div className="space-y-5 animate-in fade-in duration-100">
              
              {/* Client confirmation intro banner */}
              <div className="p-3.5 rounded-xl bg-amber-500/10 border border-amber-300/60 text-xs text-amber-950 flex items-start gap-2.5">
                <User className="w-4 h-4 text-amber-700 shrink-0 mt-0.5" />
                <div>
                  <p className="font-semibold text-amber-900">
                    Client or Witness Confirmation (Optional)
                  </p>
                  <p className="text-amber-800 text-[11px] mt-0.5 leading-relaxed">
                    Have the buyer, supervisor, or client verify that this deliverable was finished. SABI creates an official confirmation link where they can confirm and leave a verified testimonial.
                  </p>
                </div>
              </div>

              {/* Optional Toggle */}
              <div className="p-4 rounded-xl border border-stone-200 bg-stone-50 space-y-3">
                <label className="flex items-center gap-2.5 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={enableConfirmation}
                    onChange={(e) => setEnableConfirmation(e.target.checked)}
                    className="w-4 h-4 text-amber-600 rounded border-stone-300 focus:ring-amber-500"
                  />
                  <span className="text-xs font-bold text-stone-900">
                    Request client or witness confirmation for this work
                  </span>
                </label>

                {enableConfirmation && (
                  <div className="space-y-3 pt-2 border-t border-stone-200/70">
                    <div>
                      <label className="block text-xs font-semibold text-stone-700 mb-1">
                        Client or Person&apos;s Name <span className="text-red-500">*</span>
                      </label>
                      <div className="relative">
                        <User className="w-4 h-4 text-stone-400 absolute left-3 top-1/2 -translate-y-1/2" />
                        <input
                          type="text"
                          value={clientName}
                          onChange={(e) => {
                            setClientName(e.target.value);
                            if (errors.clientName) setErrors((prev) => ({ ...prev, clientName: '' }));
                          }}
                          placeholder="e.g. David Mensah or Apex Studio"
                          className={`w-full pl-9 pr-3 py-2 text-xs rounded-xl border ${
                            errors.clientName ? 'border-red-400 bg-red-50/30' : 'border-stone-300 bg-white'
                          } focus:outline-none`}
                        />
                      </div>
                      {errors.clientName && (
                        <p className="text-xs text-red-500 mt-1">{errors.clientName}</p>
                      )}
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-stone-700 mb-1">
                        Client Email Address <span className="text-red-500">*</span>
                      </label>
                      <div className="relative">
                        <Mail className="w-4 h-4 text-stone-400 absolute left-3 top-1/2 -translate-y-1/2" />
                        <input
                          type="email"
                          value={clientEmail}
                          onChange={(e) => {
                            setClientEmail(e.target.value);
                            if (errors.clientEmail) setErrors((prev) => ({ ...prev, clientEmail: '' }));
                          }}
                          placeholder="client@example.com"
                          className={`w-full pl-9 pr-3 py-2 text-xs rounded-xl border ${
                            errors.clientEmail ? 'border-red-400 bg-red-50/30' : 'border-stone-300 bg-white'
                          } focus:outline-none`}
                        />
                      </div>
                      {errors.clientEmail && (
                        <p className="text-xs text-red-500 mt-1">{errors.clientEmail}</p>
                      )}
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-stone-700 mb-1">
                        Optional Short Note to Client
                      </label>
                      <div className="relative">
                        <textarea
                          rows={2}
                          value={clientNote}
                          onChange={(e) => setClientNote(e.target.value)}
                          placeholder="e.g. Hi David, thank you for trusting me with this project. Please take a moment to verify the delivered work for my SABI record."
                          className="w-full px-3 py-2 text-xs rounded-xl border border-stone-300 bg-white focus:outline-none"
                        />
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* Status Outcome Explanation Card */}
              <div className="p-4 rounded-xl border border-stone-200 bg-stone-50/80 space-y-2">
                <span className="text-[11px] font-bold uppercase tracking-wider text-stone-500 block">
                  Resulting Proof Status
                </span>

                <div className="flex items-center gap-2">
                  {projectedStatus === 'Confirmation pending' && (
                    <span className="inline-flex items-center gap-1.5 text-xs font-semibold px-2.5 py-1 rounded-full bg-amber-50 text-amber-800 border border-amber-200">
                      <Clock className="w-3.5 h-3.5 text-amber-600" />
                      <span>Confirmation pending</span>
                    </span>
                  )}

                  {projectedStatus === 'Evidence attached' && (
                    <span className="inline-flex items-center gap-1.5 text-xs font-semibold px-2.5 py-1 rounded-full bg-blue-50 text-blue-800 border border-blue-200">
                      <ShieldCheck className="w-3.5 h-3.5 text-blue-600" />
                      <span>Evidence attached ({evidenceList.length} items)</span>
                    </span>
                  )}

                  {projectedStatus === 'Self-documented' && (
                    <span className="inline-flex items-center gap-1.5 text-xs font-medium px-2.5 py-1 rounded-full bg-stone-100 text-stone-700 border border-stone-200">
                      <FileText className="w-3.5 h-3.5 text-stone-500" />
                      <span>Self-documented</span>
                    </span>
                  )}
                </div>

                <p className="text-[11px] text-stone-500 leading-relaxed">
                  {projectedStatus === 'Confirmation pending'
                    ? 'A verification link will be generated upon saving. Once your client reviews and approves it, this record will advance to "Client confirmed". SABI never marks work as confirmed automatically.'
                    : projectedStatus === 'Evidence attached'
                    ? 'Your attached artifacts will provide proof of delivery. You can request client verification anytime later.'
                    : 'Saved as self-reported work. You can attach proof photos, documents, or request client verification at any time.'}
                </p>
              </div>

            </div>
          )}

        </div>

        {/* Modal Footer Controls */}
        <div className="px-6 py-3.5 border-t border-stone-200 bg-stone-50 flex items-center justify-between">
          <div>
            {currentStep > 1 ? (
              <button
                type="button"
                onClick={() => setCurrentStep((prev) => (prev - 1) as 1 | 2)}
                className="px-3 py-1.5 text-xs font-medium text-stone-600 hover:text-stone-900 flex items-center gap-1"
              >
                <ArrowLeft className="w-3.5 h-3.5" />
                <span>Back</span>
              </button>
            ) : (
              <button
                type="button"
                onClick={onClose}
                className="px-3 py-1.5 text-xs font-medium text-stone-500 hover:text-stone-800"
              >
                Cancel
              </button>
            )}
          </div>

          <div className="flex items-center gap-2">
            {currentStep === 1 && (
              <button
                type="button"
                onClick={handleNextFromStep1}
                className="px-4 py-2 bg-amber-500 hover:bg-amber-400 text-stone-950 text-xs font-bold rounded-xl shadow-xs flex items-center gap-1.5 transition-colors"
              >
                <span>Continue to Step 2: Add Proof</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            )}

            {currentStep === 2 && (
              <>
                <button
                  type="button"
                  onClick={() => handleSubmit()}
                  className="px-3 py-2 text-xs font-medium text-stone-600 hover:text-stone-900 transition-colors"
                >
                  Skip to Save
                </button>
                <button
                  type="button"
                  onClick={handleNextFromStep2}
                  className="px-4 py-2 bg-amber-500 hover:bg-amber-400 text-stone-950 text-xs font-bold rounded-xl shadow-xs flex items-center gap-1.5 transition-colors"
                >
                  <span>Continue to Step 3: Confirmation</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </>
            )}

            {currentStep === 3 && (
              <button
                type="button"
                onClick={() => handleSubmit()}
                className="px-5 py-2.5 bg-amber-500 hover:bg-amber-400 text-stone-950 text-xs font-bold rounded-xl shadow flex items-center gap-1.5 transition-colors active:scale-95"
              >
                <CheckCircle2 className="w-4 h-4" />
                <span>{editingRecord ? 'Save Changes' : 'Complete & Save Work Record'}</span>
              </button>
            )}
          </div>
        </div>

      </div>
    </div>
  );
};
