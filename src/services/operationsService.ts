import {
  PlatformStatus,
  PlatformStatusRecord,
  PlatformStatusHistoryEntry,
  AdminUser,
  AdminRole,
  AuditLogEntry,
  AuditLogCategory,
  SupportTicket,
  OperationsNotification,
  PlatformSettings,
  ReportRecord,
  UserProfile,
  WorkRecord,
} from '../types';

const OP_STORAGE_KEYS = {
  PLATFORM_STATUS: 'sabi_platform_status_v2',
  STATUS_HISTORY: 'sabi_status_history_v2',
  AUDIT_LOGS: 'sabi_audit_logs_v2',
  ADMIN_USERS: 'sabi_admin_users_v2',
  SUPPORT_TICKETS: 'sabi_support_tickets_v2',
  NOTIFICATIONS: 'sabi_notifications_v2',
  SETTINGS: 'sabi_platform_settings_v2',
  ACTIVE_ADMIN_SESSION: 'sabi_active_admin_session_v1',
};

// Registered default Root Super Admin
export const ROOT_ADMIN_EMAIL = 'oyebanjiisrael60@gmail.com';

function getStorage<T>(key: string, fallback: T): T {
  if (typeof window === 'undefined') return fallback;
  try {
    const raw = localStorage.getItem(key);
    if (!raw) return fallback;
    return JSON.parse(raw) as T;
  } catch (err) {
    console.error(`Operations Service read error for ${key}:`, err);
    return fallback;
  }
}

function setStorage<T>(key: string, data: T): void {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(key, JSON.stringify(data));
  } catch (err) {
    console.error(`Operations Service write error for ${key}:`, err);
  }
}

// Initial Platform Status State
const DEFAULT_STATUS_RECORD: PlatformStatusRecord = {
  status: 'OPERATIONAL',
  previousStatus: 'OPERATIONAL',
  reason: 'Production system healthy and fully operational',
  changedBy: 'System Architect',
  changedByEmail: ROOT_ADMIN_EMAIL,
  changedById: 'sys_root',
  changedAt: new Date().toISOString(),
  publicNotice: 'All verified work records and client confirmation protocols are operational.',
};

// Initial Platform Settings
const DEFAULT_SETTINGS: PlatformSettings = {
  allowRegistrations: true,
  allowNewWorkSubmissions: true,
  allowClientConfirmations: true,
  requireEmailVerification: false,
  maxEvidenceUploadMB: 25,
  maxEvidencePerRecord: 10,
  publicDiscoveryEnabled: true,
  messagingEnabled: true,
  maintenanceNotice: 'Sabi is undergoing scheduled system optimization. Documented records remain safely verified in read-only mode.',
  suspensionNotice: 'Sabi platform operations are currently suspended under administrative review.',
  updatedAt: new Date().toISOString(),
  updatedBy: ROOT_ADMIN_EMAIL,
};

// Initial Seed Admins
const DEFAULT_ADMINS: AdminUser[] = [
  {
    id: 'admin_root_1',
    email: ROOT_ADMIN_EMAIL,
    fullName: 'Israel Oyebanji',
    role: 'super_admin',
    active: true,
    addedAt: '2026-01-01T00:00:00.000Z',
    addedBy: 'SYSTEM_BOOTSTRAP',
    lastActiveAt: new Date().toISOString(),
    notes: 'Primary Platform Owner and Root Super Administrator',
  },
  {
    id: 'admin_mod_1',
    email: 'moderation@sabi.id',
    fullName: 'Trust & Safety Lead',
    role: 'moderator',
    active: true,
    addedAt: '2026-01-15T10:00:00.000Z',
    addedBy: ROOT_ADMIN_EMAIL,
    lastActiveAt: new Date().toISOString(),
    notes: 'Verification integrity and evidence audit coordinator',
  },
];

export const operationsService = {
  // ==========================================================================
  // 1. PLATFORM STATUS MANAGEMENT (CORE CONTROLLER)
  // ==========================================================================

  getPlatformStatus(): PlatformStatusRecord {
    return getStorage<PlatformStatusRecord>(OP_STORAGE_KEYS.PLATFORM_STATUS, DEFAULT_STATUS_RECORD);
  },

  getStatusHistory(): PlatformStatusHistoryEntry[] {
    const history = getStorage<PlatformStatusHistoryEntry[]>(OP_STORAGE_KEYS.STATUS_HISTORY, []);
    if (history.length === 0) {
      // Seed initial history record
      const initialEntry: PlatformStatusHistoryEntry = {
        id: 'hist_init_001',
        fromStatus: 'OPERATIONAL',
        toStatus: 'OPERATIONAL',
        reason: 'Initial production system deployment',
        changedBy: 'System Architect',
        changedByEmail: ROOT_ADMIN_EMAIL,
        changedById: 'sys_root',
        changedAt: new Date(Date.now() - 86400000 * 3).toISOString(),
        publicNotice: 'System online.',
      };
      setStorage(OP_STORAGE_KEYS.STATUS_HISTORY, [initialEntry]);
      return [initialEntry];
    }
    return history;
  },

  /**
   * Transition Platform Status with mandatory justification, state history, and audit log.
   * Workflows supported:
   * OPERATIONAL -> SUSPENDED -> OPERATIONAL
   * OPERATIONAL -> MAINTENANCE -> OPERATIONAL
   */
  setPlatformStatus(
    newStatus: PlatformStatus,
    reason: string,
    actor: { id: string; email: string; name: string },
    options?: { publicNotice?: string; estimatedResolution?: string }
  ): { success: boolean; record: PlatformStatusRecord; error?: string } {
    if (!reason || reason.trim().length < 5) {
      return {
        success: false,
        record: this.getPlatformStatus(),
        error: 'A detailed operational reason (minimum 5 characters) is strictly required to change platform status.',
      };
    }

    const currentRecord = this.getPlatformStatus();
    const previousStatus = currentRecord.status;

    if (previousStatus === newStatus) {
      return {
        success: false,
        record: currentRecord,
        error: `Platform is already in ${newStatus} status.`,
      };
    }

    const now = new Date().toISOString();
    const newRecord: PlatformStatusRecord = {
      status: newStatus,
      previousStatus,
      reason: reason.trim(),
      changedBy: actor.name || actor.email,
      changedByEmail: actor.email,
      changedById: actor.id,
      changedAt: now,
      publicNotice: options?.publicNotice?.trim() || (
        newStatus === 'MAINTENANCE'
          ? this.getSettings().maintenanceNotice
          : newStatus === 'SUSPENDED'
          ? this.getSettings().suspensionNotice
          : 'Sabi services are fully operational.'
      ),
      estimatedResolution: options?.estimatedResolution?.trim(),
    };

    // Save current status
    setStorage(OP_STORAGE_KEYS.PLATFORM_STATUS, newRecord);

    // Append to status history
    const history = this.getStatusHistory();
    const historyEntry: PlatformStatusHistoryEntry = {
      id: `hist_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
      fromStatus: previousStatus,
      toStatus: newStatus,
      reason: reason.trim(),
      changedBy: actor.name || actor.email,
      changedByEmail: actor.email,
      changedById: actor.id,
      changedAt: now,
      publicNotice: newRecord.publicNotice,
    };
    history.unshift(historyEntry);
    setStorage(OP_STORAGE_KEYS.STATUS_HISTORY, history);

    // Log to Audit Ledger
    this.logAuditEvent({
      action: `PLATFORM_STATUS_CHANGE_${previousStatus}_TO_${newStatus}`,
      category: 'platform',
      actorEmail: actor.email,
      actorName: actor.name || actor.email,
      actorId: actor.id,
      targetType: 'PLATFORM_STATE',
      targetId: 'platform_core',
      details: `Platform transitioned from ${previousStatus} to ${newStatus}. Reason: "${reason.trim()}". Public Notice: "${newRecord.publicNotice}"`,
      previousValue: previousStatus,
      newValue: newStatus,
      metadata: {
        estimatedResolution: options?.estimatedResolution,
      },
    });

    // Notify all active listeners across tabs / components
    this.broadcastPlatformStatusChange(newRecord);

    return { success: true, record: newRecord };
  },

  subscribeToPlatformStatus(callback: (status: PlatformStatusRecord) => void): () => void {
    const handler = (e: Event) => {
      const customEvent = e as CustomEvent<PlatformStatusRecord>;
      callback(customEvent.detail || this.getPlatformStatus());
    };

    const storageHandler = (e: StorageEvent) => {
      if (e.key === OP_STORAGE_KEYS.PLATFORM_STATUS) {
        callback(this.getPlatformStatus());
      }
    };

    if (typeof window !== 'undefined') {
      window.addEventListener('sabi_platform_status_changed', handler);
      window.addEventListener('storage', storageHandler);
    }

    return () => {
      if (typeof window !== 'undefined') {
        window.removeEventListener('sabi_platform_status_changed', handler);
        window.removeEventListener('storage', storageHandler);
      }
    };
  },

  broadcastPlatformStatusChange(record: PlatformStatusRecord) {
    if (typeof window !== 'undefined') {
      window.dispatchEvent(
        new CustomEvent<PlatformStatusRecord>('sabi_platform_status_changed', {
          detail: record,
        })
      );
    }
  },

  // ==========================================================================
  // 2. AUDIT LOGS LEDGER (IMMUTABLE OPERATIONAL RECORDS)
  // ==========================================================================

  getAuditLogs(): AuditLogEntry[] {
    const logs = getStorage<AuditLogEntry[]>(OP_STORAGE_KEYS.AUDIT_LOGS, []);
    if (logs.length === 0) {
      // Seed default baseline audit log entry
      const baseline: AuditLogEntry = {
        id: 'audit_base_001',
        action: 'PLATFORM_INITIALIZATION',
        category: 'platform',
        actorEmail: ROOT_ADMIN_EMAIL,
        actorName: 'Israel Oyebanji',
        actorId: 'sys_root',
        targetType: 'SYSTEM',
        targetId: 'sabi_core',
        details: 'Operations Center initialized with Zero-Trust Security Protocol',
        timestamp: new Date(Date.now() - 86400000 * 2).toISOString(),
      };
      setStorage(OP_STORAGE_KEYS.AUDIT_LOGS, [baseline]);
      return [baseline];
    }
    return logs;
  },

  logAuditEvent(entry: Omit<AuditLogEntry, 'id' | 'timestamp'>): AuditLogEntry {
    const logs = this.getAuditLogs();
    const newEntry: AuditLogEntry = {
      ...entry,
      id: `audit_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
      timestamp: new Date().toISOString(),
    };
    logs.unshift(newEntry);
    setStorage(OP_STORAGE_KEYS.AUDIT_LOGS, logs);

    if (typeof window !== 'undefined') {
      window.dispatchEvent(new CustomEvent('sabi_audit_logs_changed'));
    }
    return newEntry;
  },

  subscribeToAuditLogs(callback: () => void): () => void {
    const handler = () => callback();
    if (typeof window !== 'undefined') {
      window.addEventListener('sabi_audit_logs_changed', handler);
    }
    return () => {
      if (typeof window !== 'undefined') {
        window.removeEventListener('sabi_audit_logs_changed', handler);
      }
    };
  },

  // ==========================================================================
  // 3. ADMIN ROLES & ACCESS CONTROL
  // ==========================================================================

  getAdminUsers(): AdminUser[] {
    const admins = getStorage<AdminUser[]>(OP_STORAGE_KEYS.ADMIN_USERS, []);
    if (admins.length === 0) {
      setStorage(OP_STORAGE_KEYS.ADMIN_USERS, DEFAULT_ADMINS);
      return DEFAULT_ADMINS;
    }
    // Ensure root email always has super_admin entry
    if (!admins.some((a) => a.email.toLowerCase() === ROOT_ADMIN_EMAIL.toLowerCase())) {
      admins.unshift(DEFAULT_ADMINS[0]);
      setStorage(OP_STORAGE_KEYS.ADMIN_USERS, admins);
    }
    return admins;
  },

  checkAdminAuthorization(
    user: UserProfile | null | { email?: string; id?: string }
  ): { isAuthorized: boolean; role?: AdminRole; adminProfile?: AdminUser } {
    if (!user || !user.email) {
      // Check active elevated admin session if any
      const elevatedSession = getStorage<{ email: string; role: AdminRole; timestamp: number } | null>(
        OP_STORAGE_KEYS.ACTIVE_ADMIN_SESSION,
        null
      );
      if (elevatedSession && Date.now() - elevatedSession.timestamp < 86400000) {
        const adminUsers = this.getAdminUsers();
        const matched = adminUsers.find(
          (a) => a.email.toLowerCase() === elevatedSession.email.toLowerCase() && a.active
        );
        if (matched) {
          return { isAuthorized: true, role: matched.role, adminProfile: matched };
        }
      }
      return { isAuthorized: false };
    }

    const email = user.email.toLowerCase().trim();

    // The primary app owner / super admin is always authorized
    if (email === ROOT_ADMIN_EMAIL.toLowerCase()) {
      const rootAdmin = this.getAdminUsers().find((a) => a.email.toLowerCase() === ROOT_ADMIN_EMAIL.toLowerCase()) || DEFAULT_ADMINS[0];
      return { isAuthorized: true, role: 'super_admin', adminProfile: rootAdmin };
    }

    const adminUsers = this.getAdminUsers();
    const matched = adminUsers.find((a) => a.email.toLowerCase() === email && a.active);

    if (matched) {
      return { isAuthorized: true, role: matched.role, adminProfile: matched };
    }

    return { isAuthorized: false };
  },

  setElevatedAdminSession(email: string, role: AdminRole): void {
    setStorage(OP_STORAGE_KEYS.ACTIVE_ADMIN_SESSION, {
      email: email.toLowerCase().trim(),
      role,
      timestamp: Date.now(),
    });
  },

  clearElevatedAdminSession(): void {
    if (typeof window !== 'undefined') {
      localStorage.removeItem(OP_STORAGE_KEYS.ACTIVE_ADMIN_SESSION);
    }
  },

  addAdminUser(
    adminData: { email: string; fullName: string; role: AdminRole; notes?: string },
    actor: { id: string; email: string; name: string }
  ): { success: boolean; admin?: AdminUser; error?: string } {
    const email = adminData.email.toLowerCase().trim();
    if (!email || !email.includes('@')) {
      return { success: false, error: 'A valid email address is required.' };
    }

    const admins = this.getAdminUsers();
    if (admins.some((a) => a.email.toLowerCase() === email)) {
      return { success: false, error: 'An administrator with this email already exists.' };
    }

    const newAdmin: AdminUser = {
      id: `adm_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
      email,
      fullName: adminData.fullName.trim() || email.split('@')[0],
      role: adminData.role,
      active: true,
      addedAt: new Date().toISOString(),
      addedBy: actor.email,
      notes: adminData.notes?.trim(),
      lastActiveAt: new Date().toISOString(),
    };

    admins.push(newAdmin);
    setStorage(OP_STORAGE_KEYS.ADMIN_USERS, admins);

    this.logAuditEvent({
      action: 'ADMIN_USER_ADD',
      category: 'roles',
      actorEmail: actor.email,
      actorName: actor.name,
      actorId: actor.id,
      targetType: 'ADMIN_USER',
      targetId: newAdmin.id,
      details: `Added new administrator: ${newAdmin.fullName} (${newAdmin.email}) with role: ${newAdmin.role}`,
      newValue: newAdmin.role,
    });

    return { success: true, admin: newAdmin };
  },

  updateAdminUser(
    adminId: string,
    updates: Partial<Pick<AdminUser, 'role' | 'active' | 'fullName' | 'notes'>>,
    actor: { id: string; email: string; name: string }
  ): { success: boolean; error?: string } {
    const admins = this.getAdminUsers();
    const index = admins.findIndex((a) => a.id === adminId);
    if (index === -1) {
      return { success: false, error: 'Administrator record not found.' };
    }

    const existing = admins[index];
    if (existing.email.toLowerCase() === ROOT_ADMIN_EMAIL.toLowerCase() && updates.active === false) {
      return { success: false, error: 'Cannot deactivate the root platform super administrator.' };
    }

    admins[index] = { ...existing, ...updates };
    setStorage(OP_STORAGE_KEYS.ADMIN_USERS, admins);

    this.logAuditEvent({
      action: 'ADMIN_USER_UPDATE',
      category: 'roles',
      actorEmail: actor.email,
      actorName: actor.name,
      actorId: actor.id,
      targetType: 'ADMIN_USER',
      targetId: adminId,
      details: `Updated administrator ${existing.email}. Role: ${updates.role ?? existing.role}, Active: ${updates.active ?? existing.active}`,
      previousValue: existing.role,
      newValue: updates.role,
    });

    return { success: true };
  },

  removeAdminUser(
    adminId: string,
    actor: { id: string; email: string; name: string }
  ): { success: boolean; error?: string } {
    const admins = this.getAdminUsers();
    const target = admins.find((a) => a.id === adminId);
    if (!target) {
      return { success: false, error: 'Administrator record not found.' };
    }

    if (target.email.toLowerCase() === ROOT_ADMIN_EMAIL.toLowerCase()) {
      return { success: false, error: 'Cannot delete the root platform super administrator.' };
    }

    const filtered = admins.filter((a) => a.id !== adminId);
    setStorage(OP_STORAGE_KEYS.ADMIN_USERS, filtered);

    this.logAuditEvent({
      action: 'ADMIN_USER_DELETE',
      category: 'roles',
      actorEmail: actor.email,
      actorName: actor.name,
      actorId: actor.id,
      targetType: 'ADMIN_USER',
      targetId: adminId,
      details: `Deleted administrator: ${target.fullName} (${target.email})`,
      previousValue: target.role,
    });

    return { success: true };
  },

  // ==========================================================================
  // 4. PLATFORM SETTINGS
  // ==========================================================================

  getSettings(): PlatformSettings {
    return getStorage<PlatformSettings>(OP_STORAGE_KEYS.SETTINGS, DEFAULT_SETTINGS);
  },

  updateSettings(
    newSettings: Partial<PlatformSettings>,
    actor: { id: string; email: string; name: string }
  ): PlatformSettings {
    const current = this.getSettings();
    const updated: PlatformSettings = {
      ...current,
      ...newSettings,
      updatedAt: new Date().toISOString(),
      updatedBy: actor.email,
    };
    setStorage(OP_STORAGE_KEYS.SETTINGS, updated);

    this.logAuditEvent({
      action: 'PLATFORM_SETTINGS_UPDATE',
      category: 'settings',
      actorEmail: actor.email,
      actorName: actor.name,
      actorId: actor.id,
      targetType: 'SETTINGS',
      targetId: 'global_config',
      details: `Updated platform settings. Registrations: ${updated.allowRegistrations}, Work submissions: ${updated.allowNewWorkSubmissions}, Client confirmations: ${updated.allowClientConfirmations}`,
    });

    return updated;
  },

  // ==========================================================================
  // 5. SUPPORT TICKETS
  // ==========================================================================

  getSupportTickets(): SupportTicket[] {
    const tickets = getStorage<SupportTicket[]>(OP_STORAGE_KEYS.SUPPORT_TICKETS, []);
    if (tickets.length === 0) {
      // Seed initial sample inquiries for triage demonstration
      const initialTickets: SupportTicket[] = [
        {
          id: 'tkt_001',
          ticketNumber: 'SABI-8291',
          userEmail: 'kofi.boateng@example.com',
          userName: 'Kofi Boateng',
          subject: 'Client did not receive confirmation email link',
          category: 'confirmation_issue',
          status: 'open',
          priority: 'high',
          createdAt: new Date(Date.now() - 3600000 * 5).toISOString(),
          updatedAt: new Date(Date.now() - 3600000 * 2).toISOString(),
          assignedTo: 'moderation@sabi.id',
          messages: [
            {
              id: 'msg_tkt_1',
              senderName: 'Kofi Boateng',
              senderEmail: 'kofi.boateng@example.com',
              isStaff: false,
              content: 'Hello, I requested independent client confirmation for my Custom Walnut Dining Table project yesterday. The client says they checked spam and haven’t seen the email yet. Can you check the token delivery status?',
              timestamp: new Date(Date.now() - 3600000 * 5).toISOString(),
            },
          ],
        },
        {
          id: 'tkt_002',
          ticketNumber: 'SABI-8292',
          userEmail: 'sarah.adler@example.com',
          userName: 'Sarah Adler',
          subject: 'Clarification on video file upload limits for architectural walkthroughs',
          category: 'general',
          status: 'in_progress',
          priority: 'normal',
          createdAt: new Date(Date.now() - 3600000 * 18).toISOString(),
          updatedAt: new Date(Date.now() - 3600000 * 10).toISOString(),
          assignedTo: ROOT_ADMIN_EMAIL,
          messages: [
            {
              id: 'msg_tkt_2',
              senderName: 'Sarah Adler',
              senderEmail: 'sarah.adler@example.com',
              isStaff: false,
              content: 'What is the maximum allowed resolution or file size for video walkthrough evidence in the architecture category?',
              timestamp: new Date(Date.now() - 3600000 * 18).toISOString(),
            },
            {
              id: 'msg_tkt_3',
              senderName: 'Israel Oyebanji',
              senderEmail: ROOT_ADMIN_EMAIL,
              isStaff: true,
              content: 'Hi Sarah, currently direct video evidence supports up to 25MB walkthrough clips. For long-format 4K walkthroughs, we recommend hosting on YouTube/Vimeo unlisted and attaching the direct verified link.',
              timestamp: new Date(Date.now() - 3600000 * 10).toISOString(),
            },
          ],
        },
      ];
      setStorage(OP_STORAGE_KEYS.SUPPORT_TICKETS, initialTickets);
      return initialTickets;
    }
    return tickets;
  },

  createSupportTicket(
    ticketData: Omit<SupportTicket, 'id' | 'ticketNumber' | 'createdAt' | 'updatedAt' | 'messages'>,
    initialMessage: string
  ): SupportTicket {
    const tickets = this.getSupportTickets();
    const newTicket: SupportTicket = {
      ...ticketData,
      id: `tkt_${Date.now()}`,
      ticketNumber: `SABI-${Math.floor(1000 + Math.random() * 9000)}`,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      messages: [
        {
          id: `msg_${Date.now()}`,
          senderName: ticketData.userName,
          senderEmail: ticketData.userEmail,
          isStaff: false,
          content: initialMessage.trim(),
          timestamp: new Date().toISOString(),
        },
      ],
    };
    tickets.unshift(newTicket);
    setStorage(OP_STORAGE_KEYS.SUPPORT_TICKETS, tickets);
    return newTicket;
  },

  replyToSupportTicket(
    ticketId: string,
    message: { senderName: string; senderEmail: string; isStaff: boolean; content: string },
    actor: { id: string; email: string; name: string }
  ): boolean {
    const tickets = this.getSupportTickets();
    const ticket = tickets.find((t) => t.id === ticketId);
    if (!ticket) return false;

    ticket.messages.push({
      id: `msg_${Date.now()}`,
      senderName: message.senderName,
      senderEmail: message.senderEmail,
      isStaff: message.isStaff,
      content: message.content.trim(),
      timestamp: new Date().toISOString(),
    });
    ticket.updatedAt = new Date().toISOString();
    setStorage(OP_STORAGE_KEYS.SUPPORT_TICKETS, tickets);

    this.logAuditEvent({
      action: 'SUPPORT_TICKET_REPLY',
      category: 'support',
      actorEmail: actor.email,
      actorName: actor.name,
      actorId: actor.id,
      targetType: 'SUPPORT_TICKET',
      targetId: ticketId,
      details: `Replied to support ticket ${ticket.ticketNumber} (${ticket.subject})`,
    });

    return true;
  },

  updateSupportTicketStatus(
    ticketId: string,
    status: SupportTicket['status'],
    actor: { id: string; email: string; name: string }
  ): boolean {
    const tickets = this.getSupportTickets();
    const ticket = tickets.find((t) => t.id === ticketId);
    if (!ticket) return false;

    const oldStatus = ticket.status;
    ticket.status = status;
    ticket.updatedAt = new Date().toISOString();
    setStorage(OP_STORAGE_KEYS.SUPPORT_TICKETS, tickets);

    this.logAuditEvent({
      action: 'SUPPORT_TICKET_STATUS_CHANGE',
      category: 'support',
      actorEmail: actor.email,
      actorName: actor.name,
      actorId: actor.id,
      targetType: 'SUPPORT_TICKET',
      targetId: ticketId,
      details: `Updated ticket ${ticket.ticketNumber} status from ${oldStatus} to ${status}`,
      previousValue: oldStatus,
      newValue: status,
    });

    return true;
  },

  // ==========================================================================
  // 6. PLATFORM NOTIFICATIONS & BROADCASTS
  // ==========================================================================

  getNotifications(): OperationsNotification[] {
    const notifs = getStorage<OperationsNotification[]>(OP_STORAGE_KEYS.NOTIFICATIONS, []);
    if (notifs.length === 0) {
      const initial: OperationsNotification = {
        id: 'notif_init_1',
        title: 'Platform Proof Engine Operating Normative',
        message: 'All cryptographic client confirmation signatures and evidence uploads are operating normally.',
        type: 'operational',
        active: true,
        broadcastToAll: false,
        createdAt: new Date().toISOString(),
        createdBy: ROOT_ADMIN_EMAIL,
      };
      setStorage(OP_STORAGE_KEYS.NOTIFICATIONS, [initial]);
      return [initial];
    }
    return notifs;
  },

  createNotification(
    data: { title: string; message: string; type: OperationsNotification['type']; broadcastToAll: boolean },
    actor: { id: string; email: string; name: string }
  ): OperationsNotification {
    const notifs = this.getNotifications();
    const newNotif: OperationsNotification = {
      id: `notif_${Date.now()}`,
      title: data.title.trim(),
      message: data.message.trim(),
      type: data.type,
      active: true,
      broadcastToAll: data.broadcastToAll,
      createdAt: new Date().toISOString(),
      createdBy: actor.email,
    };
    notifs.unshift(newNotif);
    setStorage(OP_STORAGE_KEYS.NOTIFICATIONS, notifs);

    this.logAuditEvent({
      action: 'NOTIFICATION_BROADCAST_CREATE',
      category: 'notifications',
      actorEmail: actor.email,
      actorName: actor.name,
      actorId: actor.id,
      targetType: 'NOTIFICATION',
      targetId: newNotif.id,
      details: `Created platform announcement: "${newNotif.title}" (Type: ${newNotif.type})`,
    });

    return newNotif;
  },

  toggleNotification(
    id: string,
    active: boolean,
    actor: { id: string; email: string; name: string }
  ): boolean {
    const notifs = this.getNotifications();
    const notif = notifs.find((n) => n.id === id);
    if (!notif) return false;

    notif.active = active;
    setStorage(OP_STORAGE_KEYS.NOTIFICATIONS, notifs);

    this.logAuditEvent({
      action: 'NOTIFICATION_STATUS_TOGGLE',
      category: 'notifications',
      actorEmail: actor.email,
      actorName: actor.name,
      actorId: actor.id,
      targetType: 'NOTIFICATION',
      targetId: id,
      details: `${active ? 'Activated' : 'Deactivated'} platform notification: "${notif.title}"`,
    });

    return true;
  },

  deleteNotification(
    id: string,
    actor: { id: string; email: string; name: string }
  ): boolean {
    const notifs = this.getNotifications();
    const target = notifs.find((n) => n.id === id);
    if (!target) return false;

    const filtered = notifs.filter((n) => n.id !== id);
    setStorage(OP_STORAGE_KEYS.NOTIFICATIONS, filtered);

    this.logAuditEvent({
      action: 'NOTIFICATION_DELETE',
      category: 'notifications',
      actorEmail: actor.email,
      actorName: actor.name,
      actorId: actor.id,
      targetType: 'NOTIFICATION',
      targetId: id,
      details: `Deleted platform notification: "${target.title}"`,
    });

    return true;
  },
};
