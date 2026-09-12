import {
  UserProfile,
  WorkRecord,
  EvidenceItem,
  ClientConfirmation,
  ProfileMetrics,
  SkillProofMetric,
} from '../types';

const STORAGE_KEYS = {
  USERS: 'sabi_users_v1',
  ACTIVE_USER_ID: 'sabi_active_user_id_v1',
  WORK_RECORDS: 'sabi_work_records_v1',
  EVIDENCE: 'sabi_evidence_v1',
  CONFIRMATIONS: 'sabi_confirmations_v1',
};

// Purge any legacy sample data from earlier sessions to ensure a clean slate
function purgeLegacySampleData(): void {
  if (typeof window === 'undefined') return;
  try {
    const rawUsers = localStorage.getItem(STORAGE_KEYS.USERS);
    if (rawUsers) {
      const users: UserProfile[] = JSON.parse(rawUsers);
      const filtered = users.filter(
        (u) => !u.id.includes('sample') && !u.username.includes('adaeze') && !u.username.includes('kwame')
      );
      if (filtered.length !== users.length) {
        localStorage.setItem(STORAGE_KEYS.USERS, JSON.stringify(filtered));
      }
    }
    const rawActive = localStorage.getItem(STORAGE_KEYS.ACTIVE_USER_ID);
    if (rawActive && (rawActive.includes('sample') || rawActive.includes('adaeze') || rawActive.includes('kwame'))) {
      localStorage.removeItem(STORAGE_KEYS.ACTIVE_USER_ID);
    }
    const rawRecords = localStorage.getItem(STORAGE_KEYS.WORK_RECORDS);
    if (rawRecords) {
      const records: WorkRecord[] = JSON.parse(rawRecords);
      const filtered = records.filter(
        (r) => !r.userId.includes('sample') && !r.id.includes('sample') && r.id !== 'wrk_1' && r.id !== 'wrk_2' && r.id !== 'wrk_3'
      );
      if (filtered.length !== records.length) {
        localStorage.setItem(STORAGE_KEYS.WORK_RECORDS, JSON.stringify(filtered));
      }
    }
    const rawEvidence = localStorage.getItem(STORAGE_KEYS.EVIDENCE);
    if (rawEvidence) {
      const ev: EvidenceItem[] = JSON.parse(rawEvidence);
      const filtered = ev.filter(
        (e) => !e.id.includes('sample') && e.id !== 'ev_1' && e.id !== 'ev_2' && e.id !== 'ev_3'
      );
      if (filtered.length !== ev.length) {
        localStorage.setItem(STORAGE_KEYS.EVIDENCE, JSON.stringify(filtered));
      }
    }
    const rawConf = localStorage.getItem(STORAGE_KEYS.CONFIRMATIONS);
    if (rawConf) {
      const confs: ClientConfirmation[] = JSON.parse(rawConf);
      const filtered = confs.filter((c) => c.id !== 'cnf_1' && c.id !== 'cnf_2' && c.id !== 'cnf_3');
      if (filtered.length !== confs.length) {
        localStorage.setItem(STORAGE_KEYS.CONFIRMATIONS, JSON.stringify(filtered));
      }
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
    if (typeof recordOrId === 'string') {
      const idx = all.findIndex((r) => r.id === recordOrId);
      if (idx !== -1) {
        all[idx] = { ...all[idx], ...(partial || {}) };
        setStorage(STORAGE_KEYS.WORK_RECORDS, all);
        return all[idx];
      }
      return null;
    } else {
      const idx = all.findIndex((r) => r.id === recordOrId.id);
      if (idx !== -1) {
        all[idx] = recordOrId;
        setStorage(STORAGE_KEYS.WORK_RECORDS, all);
        return all[idx];
      }
      return recordOrId;
    }
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

  // === METRICS CALCULATION ===
  calculateMetrics(userId: string): { metrics: ProfileMetrics; skillProofMetrics: SkillProofMetric[] } {
    const records = this.getUserWorkRecords(userId);
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

    // Count skills that have at least 1 proof item
    const documentedSkillsCount = skillProofMetrics.filter((s) => s.isProven).length;

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

  clearAllData(): void {
    if (typeof window === 'undefined') return;
    localStorage.removeItem(STORAGE_KEYS.USERS);
    localStorage.removeItem(STORAGE_KEYS.ACTIVE_USER_ID);
    localStorage.removeItem(STORAGE_KEYS.WORK_RECORDS);
    localStorage.removeItem(STORAGE_KEYS.EVIDENCE);
    localStorage.removeItem(STORAGE_KEYS.CONFIRMATIONS);
  },
};
