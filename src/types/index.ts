export type EvidenceType = 'image' | 'video' | 'document' | 'link';
export type VisibilityStatus = 'public' | 'private' | 'unlisted';
export type EvidenceStatus = 'none' | 'attached' | 'verified';
export type ConfirmationStatus = 'unconfirmed' | 'pending' | 'confirmed';

export interface UserProfile {
  id: string;
  fullName: string;
  username: string; // unique slug e.g. "kwame-mensah"
  email: string;
  profilePhoto: string;
  profession: string; // e.g. "Master Carpenter & Joiner" or "Independent Mobile Dev"
  location: string;
  shortBio: string;
  skills: string[];
  yearsOfExperience: number;
  createdAt: string;
  phone?: string;
  onboardingCompleted?: boolean;
}

export interface EvidenceItem {
  id: string;
  workId: string;
  type: EvidenceType;
  url: string; // base64 data URL or external URL
  caption: string;
  fileName?: string;
  fileSize?: string;
  createdAt: string;
}

export interface ClientConfirmation {
  id: string;
  workId: string;
  clientName: string;
  clientEmail: string;
  clientRole?: string; // e.g. "Homeowner", "Project Director", "Retail Client"
  note?: string; // Optional short message from the creator to the client
  testimonial?: string;
  status: 'pending' | 'confirmed';
  confirmedAt?: string;
  token: string; // token for public direct confirmation url
}

export type ProofStatus =
  | 'Self-documented'
  | 'Evidence attached'
  | 'Confirmation pending'
  | 'Client confirmed';

export function getRecordProofStatus(record: WorkRecord): ProofStatus {
  if (record.confirmationStatus === 'confirmed' || record.confirmation?.status === 'confirmed') {
    return 'Client confirmed';
  }
  if (record.confirmationStatus === 'pending' || record.confirmation?.status === 'pending') {
    return 'Confirmation pending';
  }
  const hasEvidence =
    record.evidenceStatus === 'attached' ||
    (record.evidenceList && record.evidenceList.length > 0);
  if (hasEvidence) {
    return 'Evidence attached';
  }
  return 'Self-documented';
}

export interface WorkRecord {
  id: string;
  userId: string;
  title: string;
  category: string;
  description: string;
  skillsDemonstrated: string[];
  completionDate: string; // YYYY-MM or YYYY-MM-DD
  location?: string;
  clientName?: string;
  clientEmail?: string;
  visibility: VisibilityStatus;
  createdAt: string;
  evidenceStatus: EvidenceStatus;
  confirmationStatus: ConfirmationStatus;
  evidenceList?: EvidenceItem[];
  confirmation?: ClientConfirmation;
}

export interface SkillProofMetric {
  name: string;
  workRecordsCount: number;
  evidenceBackedCount: number;
  confirmedCount: number;
  isProven: boolean; // has at least 1 evidence or confirmation
}

export interface ProfileMetrics {
  totalRecords: number;
  clientConfirmedRecords: number;
  evidenceBackedRecords: number;
  documentedSkillsCount: number;
  timelineStartYear: number | null;
  timelineEndYear: number | null;
  timelineSpanText: string;
  proofRatio: number; // percentage 0-100 of records with proof or confirmation
}

export type ActiveTab = 'dashboard' | 'my-work' | 'add-work' | 'profile' | 'public-preview';
