export type EvidenceType = 'image' | 'video' | 'document' | 'link';
export type VisibilityStatus = 'public' | 'private' | 'unlisted';
export type EvidenceStatus = 'none' | 'attached' | 'verified';
export type ConfirmationStatus = 'unconfirmed' | 'pending' | 'confirmed' | 'declined';

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
  appearInDiscover?: boolean; // Profile privacy setting: Opt-in to appear in Discover
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
  status: 'pending' | 'confirmed' | 'declined';
  confirmedAt?: string;
  declinedAt?: string;
  declinedReason?: string;
  token: string; // token for public direct confirmation url
}

export type ProofStatus =
  | 'Self-documented'
  | 'Evidence-backed'
  | 'Confirmation pending'
  | 'Client-confirmed';

export const PROOF_STATUS_DEFINITIONS: Record<
  ProofStatus,
  { label: string; meaning: string; description: string }
> = {
  'Self-documented': {
    label: 'Self-documented',
    meaning: 'Added by the professional.',
    description: 'Documented by the professional directly without attached evidence or client confirmation.'
  },
  'Evidence-backed': {
    label: 'Evidence-backed',
    meaning: 'Supporting evidence has been attached.',
    description: 'Supported by uploaded photos, blueprints, documents, video walkthroughs, or live links.'
  },
  'Confirmation pending': {
    label: 'Confirmation pending',
    meaning: 'Awaiting independent client confirmation.',
    description: 'A confirmation request has been sent to the client and is awaiting their independent review.'
  },
  'Client-confirmed': {
    label: 'Client-confirmed',
    meaning: 'A client or relevant person has independently confirmed the work.',
    description: 'Independently verified by the commissioning client or witness with confirmation date and feedback.'
  }
};

export function getRecordProofStatus(record: WorkRecord): ProofStatus {
  if (record.confirmationStatus === 'confirmed' || record.confirmation?.status === 'confirmed') {
    return 'Client-confirmed';
  }
  if (record.confirmationStatus === 'pending' || record.confirmation?.status === 'pending') {
    return 'Confirmation pending';
  }
  const hasEvidence =
    record.evidenceStatus === 'attached' ||
    record.evidenceStatus === 'verified' ||
    (record.evidenceList && record.evidenceList.length > 0);
  if (hasEvidence) {
    return 'Evidence-backed';
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

export type ActiveTab = 'dashboard' | 'my-work' | 'discover' | 'messages' | 'add-work' | 'profile' | 'public-preview';

export interface DemonstratedSkillInfo {
  name: string;
  documentedWorkCount: number;
  evidenceBackedCount: number;
  clientConfirmedCount: number;
  isProven: boolean;
}

export interface DiscoverProfessional {
  user: UserProfile;
  totalPublicRecords: number;
  evidenceBackedRecords: number;
  clientConfirmedRecords: number;
  demonstratedSkills: string[];
  demonstratedSkillsWithCounts: DemonstratedSkillInfo[];
  profileOnlySkills: string[];
  workCategories: string[];
  featuredPublicRecords: WorkRecord[];
}

export interface Conversation {
  id: string;
  participantOneId: string;
  participantTwoId: string;
  participantIds: [string, string];
  createdAt: string;
  lastMessageDate: string;
  lastMessageContent: string;
  lastMessageSenderId: string;
  lastMessageIsRead: boolean;
  context?: 'discovered_via_proof' | 'profile_inquiry' | 'direct';
  contextProfessionalId?: string; // which professional's profile was the genesis
  hiddenForUserIds?: string[]; // allows either user to delete/hide conversation from their inbox
  blockedByUserIds?: string[]; // tracks which user(s) initiated block
}

export interface Message {
  id: string;
  conversationId: string;
  senderId: string;
  content: string;
  sentDate: string;
  readStatus: boolean;
  readAt?: string;
}

export interface ReportRecord {
  id: string;
  reporterId: string;
  reportedUserId: string;
  conversationId: string;
  reason: string;
  details: string;
  createdAt: string;
}
