import {
  UserProfile,
  WorkRecord,
  EvidenceItem,
  ClientConfirmation,
  ProfileMetrics,
  SkillProofMetric,
  DiscoverProfessional,
  Conversation,
  Message,
  ReportRecord,
  PlatformStatusRecord,
  PlatformStatus,
} from '../types';
import { operationsService } from './operationsService';
import {
  SEED_DISCOVER_USERS,
  SEED_DISCOVER_WORK_RECORDS,
  SEED_DISCOVER_EVIDENCE,
  SEED_DISCOVER_CONFIRMATIONS,
} from './discoverData';

const STORAGE_KEYS = {
  USERS: 'sabi_users_v1',
  ACTIVE_USER_ID: 'sabi_active_user_id_v1',
  WORK_RECORDS: 'sabi_work_records_v1',
  EVIDENCE: 'sabi_evidence_v1',
  CONFIRMATIONS: 'sabi_confirmations_v1',
  DISCOVER_SEEDED: 'sabi_discover_seed_v7',
  CONVERSATIONS: 'sabi_conversations_v1',
  MESSAGES: 'sabi_messages_v1',
  BLOCKED_USERS: 'sabi_blocked_users_v1',
  REPORTS: 'sabi_reports_v1',
};

// Purge any legacy sample/mock data from earlier sessions to ensure a 100% clean state
function purgeLegacySampleData(): void {
  if (typeof window === 'undefined') return;
  try {
    // Remove all seeded or mock data flags
    localStorage.removeItem(STORAGE_KEYS.DISCOVER_SEEDED);
    localStorage.removeItem('sabi_discover_seed_v1');
    localStorage.removeItem('sabi_discover_seed_v2');
    localStorage.removeItem('sabi_discover_seed_v3');
    localStorage.removeItem('sabi_discover_seed_v4');
    localStorage.removeItem('sabi_discover_seed_v5');
    localStorage.removeItem('sabi_discover_seed_v6');
    localStorage.removeItem('sabi_discover_seed_v7');

    const rawUsers = localStorage.getItem(STORAGE_KEYS.USERS);
    if (rawUsers) {
      const users: UserProfile[] = JSON.parse(rawUsers);
      const filtered = users.filter(
        (u) =>
          !u.id.startsWith('usr_disc_') &&
          !u.id.includes('sample') &&
          u.id !== 'user_amara' &&
          u.id !== 'usr_client_preview' &&
          u.id !== 'usr_client_inquiry' &&
          !u.username.includes('adaeze') &&
          !u.username.includes('kwame') &&
          !u.username.includes('amara') &&
          !u.username.includes('david') &&
          !u.username.includes('zainab') &&
          !u.username.includes('kofi') &&
          !u.username.includes('tariq') &&
          !u.username.includes('folake') &&
          !u.username.includes('chidi') &&
          !u.username.includes('fatima') &&
          !u.username.includes('samuel')
      );
      localStorage.setItem(STORAGE_KEYS.USERS, JSON.stringify(filtered));
    }

    const rawActive = localStorage.getItem(STORAGE_KEYS.ACTIVE_USER_ID);
    if (rawActive && (rawActive.includes('sample') || rawActive.startsWith('usr_disc_') || rawActive === 'user_amara')) {
      localStorage.removeItem(STORAGE_KEYS.ACTIVE_USER_ID);
    }

    const rawRecords = localStorage.getItem(STORAGE_KEYS.WORK_RECORDS);
    if (rawRecords) {
      const records: WorkRecord[] = JSON.parse(rawRecords);
      const filtered = records.filter(
        (r) =>
          !r.id.startsWith('wrk_disc_') &&
          !r.id.startsWith('wrk_sample_') &&
          !r.userId.startsWith('usr_disc_') &&
          r.userId !== 'user_amara' &&
          r.id !== 'wrk_1' &&
          r.id !== 'wrk_2' &&
          r.id !== 'wrk_3'
      );
      localStorage.setItem(STORAGE_KEYS.WORK_RECORDS, JSON.stringify(filtered));
    }

    const rawEvidence = localStorage.getItem(STORAGE_KEYS.EVIDENCE);
    if (rawEvidence) {
      const ev: EvidenceItem[] = JSON.parse(rawEvidence);
      const filtered = ev.filter(
        (e) =>
          !e.id.startsWith('ev_disc_') &&
          !e.id.startsWith('ev_sample_') &&
          !e.workId.startsWith('wrk_disc_') &&
          e.id !== 'ev_1' &&
          e.id !== 'ev_2' &&
          e.id !== 'ev_3'
      );
      localStorage.setItem(STORAGE_KEYS.EVIDENCE, JSON.stringify(filtered));
    }

    const rawConf = localStorage.getItem(STORAGE_KEYS.CONFIRMATIONS);
    if (rawConf) {
      const confs: ClientConfirmation[] = JSON.parse(rawConf);
      const filtered = confs.filter(
        (c) =>
          !c.id.startsWith('cnf_disc_') &&
          !c.id.startsWith('cnf_sample_') &&
          !c.workId.startsWith('wrk_disc_') &&
          c.id !== 'cnf_1' &&
          c.id !== 'cnf_2' &&
          c.id !== 'cnf_3'
      );
      localStorage.setItem(STORAGE_KEYS.CONFIRMATIONS, JSON.stringify(filtered));
    }

    const rawConvs = localStorage.getItem(STORAGE_KEYS.CONVERSATIONS);
    if (rawConvs) {
      const convs: Conversation[] = JSON.parse(rawConvs);
      const filtered = convs.filter(
        (c) =>
          !c.id.startsWith('conv_starter_') &&
          !c.participantIds.some(
            (pid) => pid.startsWith('usr_disc_') || pid === 'user_amara'
          )
      );
      localStorage.setItem(STORAGE_KEYS.CONVERSATIONS, JSON.stringify(filtered));
    }

    const rawMsgs = localStorage.getItem(STORAGE_KEYS.MESSAGES);
    if (rawMsgs) {
      const msgs: Message[] = JSON.parse(rawMsgs);
      const filtered = msgs.filter(
        (m) =>
          !m.id.startsWith('msg_starter_') &&
          !m.senderId.startsWith('usr_disc_') &&
          m.senderId !== 'user_amara'
      );
      localStorage.setItem(STORAGE_KEYS.MESSAGES, JSON.stringify(filtered));
    }
  } catch (err) {
    console.error('Failed cleaning legacy data:', err);
  }
}
purgeLegacySampleData();

// Helper to get from localStorage safely
function getStorage<T>(key: string, fallback: T): T {
  if (typeof window === 'undefined') return fallback;
  try {
    const raw = localStorage.getItem(key);
    if (!raw) return fallback;
    return JSON.parse(raw) as T;
  } catch (err) {
    console.error(`Failed to read ${key} from storage:`, err);
    return fallback;
  }
}

function setStorage<T>(key: string, data: T): void {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(key, JSON.stringify(data));
  } catch (err) {
    console.error(`Failed to write ${key} to storage:`, err);
  }
}

// Clean state: No artificial discover seeds initialized
function initDiscoverSeed(): void {
  // Purely clean state: professionals populate dynamically as real users register and document proof.
}
initDiscoverSeed();

// Database Service Implementation
export const db = {
  // === AUTH & PROFILES ===
  getUsers(): UserProfile[] {
    return getStorage<UserProfile[]>(STORAGE_KEYS.USERS, []);
  },

  getActiveUserId(): string | null {
    return getStorage<string | null>(STORAGE_KEYS.ACTIVE_USER_ID, null);
  },

  setActiveUserId(userId: string | null): void {
    setStorage(STORAGE_KEYS.ACTIVE_USER_ID, userId);
  },

  getCurrentUser(): UserProfile | null {
    const activeId = this.getActiveUserId();
    if (!activeId) return null;
    const users = this.getUsers();
    return users.find((u) => u.id === activeId) || null;
  },

  createUser(profile: Omit<UserProfile, 'id' | 'createdAt'>): UserProfile {
    const users = this.getUsers();
    const newUser: UserProfile = {
      ...profile,
      id: `usr_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
      createdAt: new Date().toISOString(),
    };
    users.push(newUser);
    setStorage(STORAGE_KEYS.USERS, users);
    this.setActiveUserId(newUser.id);
    return newUser;
  },

  updateUser(profile: UserProfile): void {
    const users = this.getUsers();
    const idx = users.findIndex((u) => u.id === profile.id);
    if (idx !== -1) {
      users[idx] = profile;
      setStorage(STORAGE_KEYS.USERS, users);
    }
  },

  getUserByUsername(username: string): UserProfile | null {
    const users = this.getUsers();
    return (
      users.find(
        (u) => u.username.toLowerCase() === username.toLowerCase().trim()
      ) || null
    );
  },

  getUserById(id: string): UserProfile | null {
    const users = this.getUsers();
    return users.find((u) => u.id === id) || null;
  },

  // === WORK RECORDS ===
  getAllWorkRecords(): WorkRecord[] {
    return getStorage<WorkRecord[]>(STORAGE_KEYS.WORK_RECORDS, []);
  },

  getUserWorkRecords(userId: string): WorkRecord[] {
    const all = this.getAllWorkRecords();
    return all.filter((r) => r.userId === userId);
  },

  getWorkRecordsByUserId(userId: string): WorkRecord[] {
    return this.getUserWorkRecords(userId);
  },

  getWorkRecordById(workId: string): WorkRecord | null {
    const all = this.getAllWorkRecords();
    const found = all.find((r) => r.id === workId);
    if (found) {
      // populate evidence and confirmation
      found.evidenceList = this.getEvidenceByWorkId(found.id);
      found.confirmation = this.getConfirmationByWorkId(found.id);
      return found;
    }
    return null;
  },

  createWorkRecord(
    data: Omit<WorkRecord, 'id' | 'createdAt' | 'evidenceStatus' | 'confirmationStatus' | 'userId'> & {
      userId?: string;
      ownerUserId?: string;
    }
  ): WorkRecord {
    const all = this.getAllWorkRecords();
    const targetUserId = data.userId || data.ownerUserId || '';
    const newRecord: WorkRecord = {
      title: data.title,
      category: data.category,
      description: data.description,
      skillsDemonstrated: data.skillsDemonstrated,
      completionDate: data.completionDate,
      location: data.location,
      clientName: data.clientName,
      clientEmail: data.clientEmail,
      visibility: data.visibility,
      userId: targetUserId,
      id: `wrk_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
      createdAt: new Date().toISOString(),
      evidenceStatus: 'none',
      confirmationStatus: 'unconfirmed',
    };
    all.unshift(newRecord);
    setStorage(STORAGE_KEYS.WORK_RECORDS, all);
    return newRecord;
  },

  updateWorkRecord(
    recordOrId: WorkRecord | string,
    partial?: Partial<WorkRecord>
  ): WorkRecord | null {
    const all = this.getAllWorkRecords();
    const targetId = typeof recordOrId === 'string' ? recordOrId : recordOrId.id;
    const idx = all.findIndex((r) => r.id === targetId);
    if (idx === -1) return null;

    const existingRecord = all[idx];
    const incomingData: Partial<WorkRecord> =
      typeof recordOrId === 'string' ? partial || {} : recordOrId;

    const updatedRecord: WorkRecord = {
      ...existingRecord,
      ...incomingData,
      id: targetId,
      userId: existingRecord.userId,
    };

    // SECURITY ENFORCEMENT:
    // A user must never be able to manually change their own work record to "Client Confirmed".
    // Only the verified confirmation handler (confirmWorkRecord) with a valid token can confirm.
    if (incomingData.confirmationStatus === 'confirmed') {
      const existingConf = this.getConfirmationByWorkId(targetId);
      const isLegitimatelyConfirmed = existingConf && existingConf.status === 'confirmed';
      if (!isLegitimatelyConfirmed) {
        updatedRecord.confirmationStatus = existingRecord.confirmationStatus;
      }
    }

    all[idx] = updatedRecord;
    setStorage(STORAGE_KEYS.WORK_RECORDS, all);
    return all[idx];
  },

  deleteWorkRecord(workId: string): void {
    const all = this.getAllWorkRecords();
    const filtered = all.filter((r) => r.id !== workId);
    setStorage(STORAGE_KEYS.WORK_RECORDS, filtered);

    // Also delete associated evidence and confirmation
    const allEv = this.getAllEvidence().filter((e) => e.workId !== workId);
    setStorage(STORAGE_KEYS.EVIDENCE, allEv);

    const allConf = this.getAllConfirmations().filter((c) => c.workId !== workId);
    setStorage(STORAGE_KEYS.CONFIRMATIONS, allConf);
  },

  // === EVIDENCE ===
  getAllEvidence(): EvidenceItem[] {
    return getStorage<EvidenceItem[]>(STORAGE_KEYS.EVIDENCE, []);
  },

  getEvidenceByWorkId(workId: string): EvidenceItem[] {
    const all = this.getAllEvidence();
    return all.filter((e) => e.workId === workId);
  },

  addEvidence(item: Omit<EvidenceItem, 'id' | 'createdAt'>): EvidenceItem {
    const all = this.getAllEvidence();
    const newItem: EvidenceItem = {
      ...item,
      id: `ev_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
      createdAt: new Date().toISOString(),
    };
    all.push(newItem);
    setStorage(STORAGE_KEYS.EVIDENCE, all);

    // Update the work record evidenceStatus to 'attached'
    const record = this.getWorkRecordById(item.workId);
    if (record) {
      record.evidenceStatus = 'attached';
      this.updateWorkRecord(record);
    }

    return newItem;
  },

  deleteEvidence(evidenceId: string): void {
    const all = this.getAllEvidence();
    const item = all.find((e) => e.id === evidenceId);
    const filtered = all.filter((e) => e.id !== evidenceId);
    setStorage(STORAGE_KEYS.EVIDENCE, filtered);

    if (item) {
      const remaining = this.getEvidenceByWorkId(item.workId);
      const record = this.getWorkRecordById(item.workId);
      if (record) {
        record.evidenceStatus = remaining.length > 0 ? 'attached' : 'none';
        this.updateWorkRecord(record);
      }
    }
  },

  // === CLIENT CONFIRMATIONS ===
  getAllConfirmations(): ClientConfirmation[] {
    return getStorage<ClientConfirmation[]>(STORAGE_KEYS.CONFIRMATIONS, []);
  },

  getConfirmationByWorkId(workId: string): ClientConfirmation | undefined {
    const all = this.getAllConfirmations();
    return all.find((c) => c.workId === workId);
  },

  getConfirmationByToken(token: string): { confirmation: ClientConfirmation; work: WorkRecord; user: UserProfile } | null {
    const all = this.getAllConfirmations();
    const match = all.find((c) => c.token === token);
    if (!match) return null;

    const work = this.getWorkRecordById(match.workId);
    if (!work) return null;

    const user = this.getUserById(work.userId);
    if (!user) return null;

    return { confirmation: match, work, user };
  },

  createConfirmationRequest(
    workId: string,
    clientName: string,
    clientEmail: string,
    note?: string
  ): ClientConfirmation {
    const all = this.getAllConfirmations();
    const token = `cnf_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
    const newConf: ClientConfirmation = {
      id: `cnf_${Date.now()}`,
      workId,
      clientName,
      clientEmail,
      note,
      status: 'pending',
      token,
    };
    all.push(newConf);
    setStorage(STORAGE_KEYS.CONFIRMATIONS, all);

    // Update work record confirmationStatus
    const record = this.getWorkRecordById(workId);
    if (record) {
      record.confirmationStatus = 'pending';
      record.clientName = clientName;
      record.clientEmail = clientEmail;
      this.updateWorkRecord(record);
    }

    return newConf;
  },

  requestClientConfirmation(
    workId: string,
    clientName: string,
    clientEmail: string,
    note?: string
  ): ClientConfirmation {
    return this.createConfirmationRequest(workId, clientName, clientEmail, note);
  },

  confirmWorkRecord(
    token: string,
    clientName: string,
    testimonial: string,
    clientRole?: string
  ): boolean {
    const all = this.getAllConfirmations();
    const idx = all.findIndex((c) => c.token === token);

    let workId = '';
    if (idx !== -1) {
      all[idx].status = 'confirmed';
      all[idx].clientName = clientName;
      all[idx].testimonial = testimonial;
      all[idx].clientRole = clientRole;
      all[idx].confirmedAt = new Date().toISOString();
      workId = all[idx].workId;
      setStorage(STORAGE_KEYS.CONFIRMATIONS, all);
    }

    if (workId) {
      const record = this.getWorkRecordById(workId);
      if (record) {
        record.confirmationStatus = 'confirmed';
        this.updateWorkRecord(record);
      }
      return true;
    }
    return false;
  },

  declineWorkRecord(
    token: string,
    clientName?: string,
    reason?: string
  ): boolean {
    const all = this.getAllConfirmations();
    const idx = all.findIndex((c) => c.token === token);

    let workId = '';
    if (idx !== -1) {
      all[idx].status = 'declined';
      if (clientName) all[idx].clientName = clientName;
      all[idx].declinedReason = reason;
      all[idx].declinedAt = new Date().toISOString();
      workId = all[idx].workId;
      setStorage(STORAGE_KEYS.CONFIRMATIONS, all);
    }

    if (workId) {
      const record = this.getWorkRecordById(workId);
      if (record) {
        record.confirmationStatus = 'declined';
        // Direct storage update to preserve decline status
        const allRecords = this.getAllWorkRecords();
        const rIdx = allRecords.findIndex((r) => r.id === workId);
        if (rIdx !== -1) {
          allRecords[rIdx] = record;
          setStorage(STORAGE_KEYS.WORK_RECORDS, allRecords);
        }
      }
      return true;
    }
    return false;
  },

  // === METRICS CALCULATION ===
  calculateMetrics(userId: string, publicOnly: boolean = false): { metrics: ProfileMetrics; skillProofMetrics: SkillProofMetric[] } {
    const rawRecords = this.getUserWorkRecords(userId);
    const records = publicOnly ? rawRecords.filter((r) => r.visibility === 'public') : rawRecords;
    const user = this.getUserById(userId);

    let clientConfirmedRecords = 0;
    let evidenceBackedRecords = 0;
    const skillMap = new Map<string, { total: number; evidence: number; confirmed: number }>();

    // Register all claimed skills
    if (user?.skills) {
      for (const sk of user.skills) {
        skillMap.set(sk.toLowerCase(), { total: 0, evidence: 0, confirmed: 0 });
      }
    }

    const years: number[] = [];

    records.forEach((rec) => {
      const evidenceList = this.getEvidenceByWorkId(rec.id);
      const conf = this.getConfirmationByWorkId(rec.id);

      const hasEvidence = (rec.evidenceStatus === 'attached' || rec.evidenceStatus === 'verified') || evidenceList.length > 0;
      const isConfirmed = rec.confirmationStatus === 'confirmed' || conf?.status === 'confirmed';

      if (hasEvidence) evidenceBackedRecords++;
      if (isConfirmed) clientConfirmedRecords++;

      if (rec.completionDate) {
        const year = parseInt(rec.completionDate.substring(0, 4), 10);
        if (!isNaN(year)) years.push(year);
      }

      rec.skillsDemonstrated.forEach((skill) => {
        const norm = skill.trim();
        if (!norm) return;
        const key = norm.toLowerCase();
        const current = skillMap.get(key) || { total: 0, evidence: 0, confirmed: 0 };
        current.total += 1;
        if (hasEvidence) current.evidence += 1;
        if (isConfirmed) current.confirmed += 1;
        skillMap.set(key, current);
      });
    });

    const totalRecords = records.length;
    const proofCount = records.filter((rec) => {
      const ev = this.getEvidenceByWorkId(rec.id);
      const conf = this.getConfirmationByWorkId(rec.id);
      return ev.length > 0 || rec.confirmationStatus === 'confirmed' || conf?.status === 'confirmed';
    }).length;

    const proofRatio = totalRecords > 0 ? Math.round((proofCount / totalRecords) * 100) : 0;

    let timelineStartYear: number | null = null;
    let timelineEndYear: number | null = null;
    let timelineSpanText = 'No documented timeline yet';

    if (years.length > 0) {
      timelineStartYear = Math.min(...years);
      timelineEndYear = Math.max(...years);
      if (timelineStartYear === timelineEndYear) {
        timelineSpanText = `${timelineStartYear} (1 yr documented)`;
      } else {
        const span = timelineEndYear - timelineStartYear + 1;
        timelineSpanText = `${timelineStartYear} – ${timelineEndYear} (${span} yrs documented)`;
      }
    }

    // Transform skills
    const skillProofMetrics: SkillProofMetric[] = [];
    skillMap.forEach((val, key) => {
      // Find original casing
      let originalName = key;
      if (user?.skills) {
        const match = user.skills.find((s) => s.toLowerCase() === key);
        if (match) originalName = match;
      }
      skillProofMetrics.push({
        name: originalName,
        workRecordsCount: val.total,
        evidenceBackedCount: val.evidence,
        confirmedCount: val.confirmed,
        isProven: val.evidence > 0 || val.confirmed > 0,
      });
    });

    // Also include user profile skills that have not yet been demonstrated in work records
    if (user?.skills) {
      user.skills.forEach((skill) => {
        const norm = skill.trim();
        if (!norm) return;
        const key = norm.toLowerCase();
        if (!skillMap.has(key)) {
          skillProofMetrics.push({
            name: norm,
            workRecordsCount: 0,
            evidenceBackedCount: 0,
            confirmedCount: 0,
            isProven: false,
          });
        }
      });
    }

    // Sort: Demonstrated skills first (by work count descending), then profile-only skills
    skillProofMetrics.sort((a, b) => {
      if (b.workRecordsCount !== a.workRecordsCount) {
        return b.workRecordsCount - a.workRecordsCount;
      }
      return a.name.localeCompare(b.name);
    });

    // Count skills that have at least 1 documented work record
    const documentedSkillsCount = skillProofMetrics.filter((s) => s.workRecordsCount > 0).length;

    return {
      metrics: {
        totalRecords,
        clientConfirmedRecords,
        evidenceBackedRecords,
        documentedSkillsCount,
        timelineStartYear,
        timelineEndYear,
        timelineSpanText,
        proofRatio,
      },
      skillProofMetrics,
    };
  },

  getSkillProofMetrics(userId: string): SkillProofMetric[] {
    return this.calculateMetrics(userId).skillProofMetrics;
  },

  // === DISCOVER (PROOF-BASED DIRECTORY) ===
  getDiscoverableProfessionals(): DiscoverProfessional[] {
    initDiscoverSeed();
    const allUsers = this.getUsers();
    // Only active profiles that have explicitly opted in to appear in Discover
    const eligibleUsers = allUsers.filter(
      (u) => u.appearInDiscover === true && !u.isSuspended
    );

    const allRecords = this.getAllWorkRecords();
    const allEvidence = this.getAllEvidence();
    const allConfirmations = this.getAllConfirmations();

    const results: DiscoverProfessional[] = [];

    for (const user of eligibleUsers) {
      // STRICT PRIVACY & MODERATION ENFORCEMENT:
      // Only display information that is already marked public and not taken down.
      // Private work records must NEVER be exposed through Discover.
      const userPublicRecords = allRecords.filter(
        (r) => r.userId === user.id && r.visibility === 'public' && !r.isTakenDown
      );

      const evidenceBackedRecords = userPublicRecords.filter((rec) => {
        const hasAttached = rec.evidenceStatus === 'attached' || rec.evidenceStatus === 'verified';
        const hasEvidenceItems = allEvidence.some((e) => e.workId === rec.id);
        return hasAttached || hasEvidenceItems;
      }).length;

      const clientConfirmedRecords = userPublicRecords.filter((rec) => {
        const isDirectConfirmed = rec.confirmationStatus === 'confirmed';
        const isConfDoc = allConfirmations.some((c) => c.workId === rec.id && c.status === 'confirmed');
        return isDirectConfirmed || isConfDoc;
      }).length;

      // Track demonstrated skills strictly from public documented work
      const demonstratedSkillsMap = new Map<
        string,
        { name: string; count: number; evidenceCount: number; confirmedCount: number }
      >();

      userPublicRecords.forEach((r) => {
        const hasEvidence =
          r.evidenceStatus === 'attached' ||
          r.evidenceStatus === 'verified' ||
          allEvidence.some((e) => e.workId === r.id);
        const isConfirmed =
          r.confirmationStatus === 'confirmed' ||
          allConfirmations.some((c) => c.workId === r.id && c.status === 'confirmed');

        (r.skillsDemonstrated || []).forEach((s) => {
          if (!s || !s.trim()) return;
          const trimmed = s.trim();
          const key = trimmed.toLowerCase();
          const existing = demonstratedSkillsMap.get(key);
          if (existing) {
            existing.count += 1;
            if (hasEvidence) existing.evidenceCount += 1;
            if (isConfirmed) existing.confirmedCount += 1;
          } else {
            demonstratedSkillsMap.set(key, {
              name: trimmed,
              count: 1,
              evidenceCount: hasEvidence ? 1 : 0,
              confirmedCount: isConfirmed ? 1 : 0,
            });
          }
        });
      });

      const demonstratedSkillsWithCounts = Array.from(demonstratedSkillsMap.values())
        .map((item) => ({
          name: item.name,
          documentedWorkCount: item.count,
          evidenceBackedCount: item.evidenceCount,
          clientConfirmedCount: item.confirmedCount,
          isProven: item.evidenceCount > 0 || item.confirmedCount > 0,
        }))
        .sort((a, b) => b.documentedWorkCount - a.documentedWorkCount);

      const demonstratedSkills = demonstratedSkillsWithCounts.map((s) => s.name);

      // Profile-only skills: Listed by user on their profile, but 0 public works documenting it
      const profileOnlySkills: string[] = [];
      if (user.skills && user.skills.length > 0) {
        user.skills.forEach((s) => {
          if (s && s.trim()) {
            const key = s.trim().toLowerCase();
            if (!demonstratedSkillsMap.has(key)) {
              profileOnlySkills.push(s.trim());
            }
          }
        });
      }

      const categoriesSet = new Set<string>();
      userPublicRecords.forEach((r) => {
        if (r.category && r.category.trim()) categoriesSet.add(r.category.trim());
      });

      results.push({
        user,
        totalPublicRecords: userPublicRecords.length,
        evidenceBackedRecords,
        clientConfirmedRecords,
        demonstratedSkills,
        demonstratedSkillsWithCounts,
        profileOnlySkills,
        workCategories: Array.from(categoriesSet),
        featuredPublicRecords: userPublicRecords.slice(0, 3),
      });
    }

    return results;
  },

  setAppearInDiscover(userId: string, appear: boolean): UserProfile | null {
    const user = this.getUserById(userId);
    if (!user) return null;
    const updated = { ...user, appearInDiscover: appear };
    this.updateUser(updated);
    return updated;
  },

  // === SECURE PROFESSIONAL MESSAGING SYSTEM ===

  /**
   * Dispatches real-time update event so any mounted messaging or navigation components
   * refresh instantly without needing full browser reload.
   */
  notifyMessagesChanged(): void {
    if (typeof window !== 'undefined') {
      window.dispatchEvent(new CustomEvent('sabi_messages_updated'));
    }
  },

  /**
   * Real-time subscription hook for components.
   */
  subscribeToMessages(callback: () => void): () => void {
    if (typeof window === 'undefined') return () => {};
    const handler = () => callback();
    window.addEventListener('sabi_messages_updated', handler);
    window.addEventListener('storage', handler);
    return () => {
      window.removeEventListener('sabi_messages_updated', handler);
      window.removeEventListener('storage', handler);
    };
  },

  getAllConversations(): Conversation[] {
    return getStorage<Conversation[]>(STORAGE_KEYS.CONVERSATIONS, []);
  },

  saveConversations(conversations: Conversation[]): void {
    setStorage(STORAGE_KEYS.CONVERSATIONS, conversations);
    this.notifyMessagesChanged();
  },

  getAllMessages(): Message[] {
    return getStorage<Message[]>(STORAGE_KEYS.MESSAGES, []);
  },

  saveMessages(messages: Message[]): void {
    setStorage(STORAGE_KEYS.MESSAGES, messages);
    this.notifyMessagesChanged();
  },

  /**
   * Blocked user mapping: { [blockerUserId: string]: string[] (blockedUserIds) }
   */
  getBlockedUsersMap(): Record<string, string[]> {
    return getStorage<Record<string, string[]>>(STORAGE_KEYS.BLOCKED_USERS, {});
  },

  saveBlockedUsersMap(map: Record<string, string[]>): void {
    setStorage(STORAGE_KEYS.BLOCKED_USERS, map);
    this.notifyMessagesChanged();
  },

  /**
   * Maintained for API compatibility. Clean state: no mock starter conversations.
   */
  ensureStarterConversation(_currentUserId: string): void {
    // Clean state: No starter mock conversations. User starts with a fresh inbox.
  },

  /**
   * Returns conversations for a user where they are a participant and haven't hidden the chat.
   * STRICT PERMISSIONS: Only returns conversations involving userId.
   */
  getConversationsForUser(userId: string): Conversation[] {
    if (!userId) return [];
    const all = this.getAllConversations();
    return all
      .filter((c) => {
        const isParticipant = c.participantIds && c.participantIds.includes(userId);
        const isHidden = (c.hiddenForUserIds || []).includes(userId);
        return isParticipant && !isHidden;
      })
      .sort((a, b) => {
        const timeA = new Date(a.lastMessageDate || a.createdAt).getTime();
        const timeB = new Date(b.lastMessageDate || b.createdAt).getTime();
        return timeB - timeA;
      });
  },

  /**
   * Retrieves single conversation with STRICT PERMISSION verification.
   * Non-participants cannot view the conversation.
   */
  getConversationById(conversationId: string, requestingUserId: string): Conversation | null {
    if (!conversationId || !requestingUserId) return null;
    const all = this.getAllConversations();
    const conv = all.find((c) => c.id === conversationId);
    if (!conv) return null;
    if (!conv.participantIds.includes(requestingUserId)) {
      console.warn(`Unauthorized conversation access attempt by user ${requestingUserId}`);
      return null;
    }
    return conv;
  },

  /**
   * Retrieves or creates a private one-to-one conversation between two users.
   */
  getOrCreateConversation(
    userId1: string,
    userId2: string,
    context: 'discovered_via_proof' | 'profile_inquiry' | 'direct' = 'discovered_via_proof',
    contextProfessionalId?: string
  ): Conversation {
    if (!userId1 || !userId2 || userId1 === userId2) {
      throw new Error('Valid, distinct participants are required to create a conversation.');
    }

    const all = this.getAllConversations();
    const existing = all.find(
      (c) =>
        c.participantIds.includes(userId1) &&
        c.participantIds.includes(userId2)
    );

    if (existing) {
      // If conversation was hidden by either user, unhide it for userId1
      let updated = false;
      if (existing.hiddenForUserIds && existing.hiddenForUserIds.includes(userId1)) {
        existing.hiddenForUserIds = existing.hiddenForUserIds.filter((id) => id !== userId1);
        updated = true;
      }
      if (updated) {
        this.saveConversations(all);
      }
      return existing;
    }

    const newConv: Conversation = {
      id: `conv_${Date.now()}_${Math.random().toString(36).substring(2, 8)}`,
      participantOneId: userId1,
      participantTwoId: userId2,
      participantIds: [userId1, userId2],
      createdAt: new Date().toISOString(),
      lastMessageDate: new Date().toISOString(),
      lastMessageContent: '',
      lastMessageSenderId: '',
      lastMessageIsRead: true,
      context,
      contextProfessionalId: contextProfessionalId || userId2,
      hiddenForUserIds: [],
      blockedByUserIds: [],
    };

    all.unshift(newConv);
    this.saveConversations(all);
    return newConv;
  },

  /**
   * Retrieves messages for a conversation with STRICT PERMISSION verification.
   * Only conversation participants can view messages.
   */
  getMessages(conversationId: string, requestingUserId: string): Message[] {
    if (!conversationId || !requestingUserId) return [];
    const conv = this.getConversationById(conversationId, requestingUserId);
    if (!conv) return [];

    const allMsgs = this.getAllMessages();
    return allMsgs
      .filter((m) => m.conversationId === conversationId)
      .sort((a, b) => new Date(a.sentDate).getTime() - new Date(b.sentDate).getTime());
  },

  /**
   * Sends a message in a conversation.
   * STRICT PERMISSIONS:
   * 1. Sender must be a participant.
   * 2. Sender must not be blocked by recipient, nor have blocked recipient.
   */
  sendMessage(conversationId: string, senderId: string, content: string): Message {
    const cleanContent = (content || '').trim();
    if (!cleanContent) {
      throw new Error('Message content cannot be empty.');
    }

    const allConvs = this.getAllConversations();
    const convIndex = allConvs.findIndex((c) => c.id === conversationId);
    if (convIndex === -1) {
      throw new Error('Conversation not found.');
    }

    const conv = allConvs[convIndex];
    if (!conv.participantIds.includes(senderId)) {
      throw new Error('Unauthorized: You are not a participant in this conversation.');
    }

    const recipientId = conv.participantIds.find((id) => id !== senderId);
    if (recipientId && this.isUserBlocked(senderId, recipientId)) {
      throw new Error('Cannot send message. Messaging is blocked between participants.');
    }

    const now = new Date().toISOString();
    const newMessage: Message = {
      id: `msg_${Date.now()}_${Math.random().toString(36).substring(2, 8)}`,
      conversationId,
      senderId,
      content: cleanContent,
      sentDate: now,
      readStatus: false,
    };

    // Update conversation metadata
    conv.lastMessageDate = now;
    conv.lastMessageContent = cleanContent;
    conv.lastMessageSenderId = senderId;
    conv.lastMessageIsRead = false;
    // Unhide for recipient if it was hidden
    if (conv.hiddenForUserIds && conv.hiddenForUserIds.length > 0) {
      conv.hiddenForUserIds = [];
    }

    allConvs[convIndex] = conv;
    this.saveConversations(allConvs);

    const allMsgs = this.getAllMessages();
    allMsgs.push(newMessage);
    this.saveMessages(allMsgs);

    return newMessage;
  },

  /**
   * Marks unread messages in a conversation as read by the current user.
   */
  markConversationAsRead(conversationId: string, currentUserId: string): void {
    if (!conversationId || !currentUserId) return;
    const conv = this.getConversationById(conversationId, currentUserId);
    if (!conv) return;

    let msgsModified = false;
    const allMsgs = this.getAllMessages();
    const updatedMsgs = allMsgs.map((m) => {
      if (m.conversationId === conversationId && m.senderId !== currentUserId && !m.readStatus) {
        msgsModified = true;
        return {
          ...m,
          readStatus: true,
          readAt: new Date().toISOString(),
        };
      }
      return m;
    });

    if (msgsModified) {
      this.saveMessages(updatedMsgs);
    }

    // Update conversation flag if the last message was unread
    if (conv.lastMessageSenderId !== currentUserId && !conv.lastMessageIsRead) {
      const allConvs = this.getAllConversations();
      const index = allConvs.findIndex((c) => c.id === conversationId);
      if (index !== -1) {
        allConvs[index] = { ...conv, lastMessageIsRead: true };
        this.saveConversations(allConvs);
      }
    }
  },

  /**
   * Computes the total unread messages count for a user across all their non-hidden conversations.
   */
  getUnreadMessagesCount(userId: string): number {
    if (!userId) return 0;
    const userConvs = this.getConversationsForUser(userId);
    if (userConvs.length === 0) return 0;

    const convIdSet = new Set(userConvs.map((c) => c.id));
    const allMsgs = this.getAllMessages();

    let unreadCount = 0;
    for (const m of allMsgs) {
      if (convIdSet.has(m.conversationId) && m.senderId !== userId && !m.readStatus) {
        unreadCount += 1;
      }
    }
    return unreadCount;
  },

  /**
   * Hides or deletes a conversation from a user's inbox without affecting the other participant.
   */
  hideOrDeleteConversation(conversationId: string, userId: string): void {
    if (!conversationId || !userId) return;
    const allConvs = this.getAllConversations();
    const index = allConvs.findIndex((c) => c.id === conversationId);
    if (index === -1) return;

    const conv = allConvs[index];
    if (!conv.participantIds.includes(userId)) return;

    const hidden = new Set(conv.hiddenForUserIds || []);
    hidden.add(userId);
    conv.hiddenForUserIds = Array.from(hidden);

    allConvs[index] = conv;
    this.saveConversations(allConvs);
  },

  /**
   * Block another user. Blocked users cannot send new messages to the person who blocked them.
   */
  blockUser(blockerId: string, targetUserId: string): void {
    if (!blockerId || !targetUserId || blockerId === targetUserId) return;
    const map = this.getBlockedUsersMap();
    const userBlocked = new Set(map[blockerId] || []);
    userBlocked.add(targetUserId);
    map[blockerId] = Array.from(userBlocked);
    this.saveBlockedUsersMap(map);

    // Also update any active conversation between them
    const allConvs = this.getAllConversations();
    let convsUpdated = false;
    allConvs.forEach((c) => {
      if (c.participantIds.includes(blockerId) && c.participantIds.includes(targetUserId)) {
        const blockedSet = new Set(c.blockedByUserIds || []);
        blockedSet.add(blockerId);
        c.blockedByUserIds = Array.from(blockedSet);
        convsUpdated = true;
      }
    });
    if (convsUpdated) {
      this.saveConversations(allConvs);
    }
  },

  /**
   * Unblocks a user.
   */
  unblockUser(blockerId: string, targetUserId: string): void {
    if (!blockerId || !targetUserId) return;
    const map = this.getBlockedUsersMap();
    if (map[blockerId]) {
      map[blockerId] = map[blockerId].filter((id) => id !== targetUserId);
      this.saveBlockedUsersMap(map);
    }

    const allConvs = this.getAllConversations();
    let convsUpdated = false;
    allConvs.forEach((c) => {
      if (c.participantIds.includes(blockerId) && c.participantIds.includes(targetUserId)) {
        if (c.blockedByUserIds) {
          c.blockedByUserIds = c.blockedByUserIds.filter((id) => id !== blockerId);
          convsUpdated = true;
        }
      }
    });
    if (convsUpdated) {
      this.saveConversations(allConvs);
    }
  },

  /**
   * Returns true if userA has blocked userB OR userB has blocked userA.
   */
  isUserBlocked(userAId: string, userBId: string): boolean {
    if (!userAId || !userBId) return false;
    const map = this.getBlockedUsersMap();
    const aBlockedB = (map[userAId] || []).includes(userBId);
    const bBlockedA = (map[userBId] || []).includes(userAId);
    return aBlockedB || bBlockedA;
  },

  /**
   * Returns true if blockerId specifically has blocked targetUserId.
   */
  isBlockedBy(blockerId: string, targetUserId: string): boolean {
    if (!blockerId || !targetUserId) return false;
    const map = this.getBlockedUsersMap();
    return (map[blockerId] || []).includes(targetUserId);
  },

  /**
   * Submits a report for moderation.
   */
  reportUser(
    reporterId: string,
    reportedUserId: string,
    conversationId: string,
    reason: string,
    details: string
  ): ReportRecord {
    const reports = getStorage<ReportRecord[]>(STORAGE_KEYS.REPORTS, []);
    const newReport: ReportRecord = {
      id: `rep_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
      reporterId,
      reportedUserId,
      conversationId,
      reason: (reason || 'Inappropriate behavior').trim(),
      details: (details || '').trim(),
      createdAt: new Date().toISOString(),
      status: 'pending',
    };
    reports.push(newReport);
    setStorage(STORAGE_KEYS.REPORTS, reports);

    operationsService.logAuditEvent({
      action: 'USER_REPORT_SUBMITTED',
      category: 'reports',
      actorEmail: reporterId,
      actorName: 'User',
      actorId: reporterId,
      targetType: 'USER',
      targetId: reportedUserId,
      details: `User report filed against ${reportedUserId}: "${newReport.reason}"`,
    });

    return newReport;
  },

  getAllReports(): ReportRecord[] {
    return getStorage<ReportRecord[]>(STORAGE_KEYS.REPORTS, []);
  },

  updateReport(
    reportId: string,
    updates: Partial<Pick<ReportRecord, 'status' | 'resolutionNotes' | 'actionTaken'>>,
    actor: { id: string; email: string; name: string }
  ): boolean {
    const reports = this.getAllReports();
    const idx = reports.findIndex((r) => r.id === reportId);
    if (idx === -1) return false;

    reports[idx] = {
      ...reports[idx],
      ...updates,
      resolvedBy: actor.email,
      resolvedAt: new Date().toISOString(),
    };
    setStorage(STORAGE_KEYS.REPORTS, reports);

    operationsService.logAuditEvent({
      action: 'REPORT_RESOLVED',
      category: 'reports',
      actorEmail: actor.email,
      actorName: actor.name,
      actorId: actor.id,
      targetType: 'REPORT',
      targetId: reportId,
      details: `Report ${reportId} marked as ${updates.status || 'resolved'}. Action: ${updates.actionTaken || 'none'}. Notes: ${updates.resolutionNotes || 'None'}`,
    });

    return true;
  },

  suspendUser(
    userId: string,
    reason: string,
    actor: { id: string; email: string; name: string }
  ): boolean {
    const users = this.getUsers();
    const user = users.find((u) => u.id === userId);
    if (!user) return false;

    user.isSuspended = true;
    user.suspendedReason = reason.trim();
    user.suspendedAt = new Date().toISOString();
    this.updateUser(user);

    operationsService.logAuditEvent({
      action: 'USER_SUSPEND',
      category: 'moderation',
      actorEmail: actor.email,
      actorName: actor.name,
      actorId: actor.id,
      targetType: 'USER',
      targetId: userId,
      details: `Suspended user ${user.fullName} (${user.email || user.username}). Reason: ${reason}`,
    });

    return true;
  },

  unsuspendUser(
    userId: string,
    actor: { id: string; email: string; name: string }
  ): boolean {
    const users = this.getUsers();
    const user = users.find((u) => u.id === userId);
    if (!user) return false;

    user.isSuspended = false;
    user.suspendedReason = undefined;
    user.suspendedAt = undefined;
    this.updateUser(user);

    operationsService.logAuditEvent({
      action: 'USER_UNSUSPEND',
      category: 'moderation',
      actorEmail: actor.email,
      actorName: actor.name,
      actorId: actor.id,
      targetType: 'USER',
      targetId: userId,
      details: `Unsuspended user ${user.fullName} (${user.email || user.username}). User restored to active status.`,
    });

    return true;
  },

  takeDownWorkRecord(
    workId: string,
    reason: string,
    actor: { id: string; email: string; name: string }
  ): boolean {
    const record = this.getWorkRecordById(workId);
    if (!record) return false;

    record.isTakenDown = true;
    record.takeDownReason = reason.trim();
    record.moderatedAt = new Date().toISOString();
    record.moderatedBy = actor.email;
    this.updateWorkRecord(record);

    operationsService.logAuditEvent({
      action: 'WORK_RECORD_TAKEDOWN',
      category: 'moderation',
      actorEmail: actor.email,
      actorName: actor.name,
      actorId: actor.id,
      targetType: 'WORK_RECORD',
      targetId: workId,
      details: `Took down work record "${record.title}". Reason: ${reason}`,
    });

    return true;
  },

  restoreWorkRecord(
    workId: string,
    actor: { id: string; email: string; name: string }
  ): boolean {
    const record = this.getWorkRecordById(workId);
    if (!record) return false;

    record.isTakenDown = false;
    record.takeDownReason = undefined;
    record.moderatedAt = new Date().toISOString();
    record.moderatedBy = actor.email;
    this.updateWorkRecord(record);

    operationsService.logAuditEvent({
      action: 'WORK_RECORD_RESTORE',
      category: 'moderation',
      actorEmail: actor.email,
      actorName: actor.name,
      actorId: actor.id,
      targetType: 'WORK_RECORD',
      targetId: workId,
      details: `Restored taken-down work record "${record.title}" to active listing.`,
    });

    return true;
  },

  clearAllData(): void {
    if (typeof window === 'undefined') return;
    localStorage.removeItem(STORAGE_KEYS.USERS);
    localStorage.removeItem(STORAGE_KEYS.ACTIVE_USER_ID);
    localStorage.removeItem(STORAGE_KEYS.WORK_RECORDS);
    localStorage.removeItem(STORAGE_KEYS.EVIDENCE);
    localStorage.removeItem(STORAGE_KEYS.CONFIRMATIONS);
    localStorage.removeItem(STORAGE_KEYS.CONVERSATIONS);
    localStorage.removeItem(STORAGE_KEYS.MESSAGES);
    localStorage.removeItem(STORAGE_KEYS.BLOCKED_USERS);
    localStorage.removeItem(STORAGE_KEYS.REPORTS);
  },
};
