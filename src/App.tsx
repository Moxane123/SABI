import React, { useState, useEffect } from 'react';
import {
  ShieldCheck,
  CheckCircle2,
  Image as ImageIcon,
  Sparkles,
  ArrowRight,
  Plus,
  ExternalLink,
  Share2,
  Briefcase,
  User,
  LogIn
} from 'lucide-react';
import {
  UserProfile,
  WorkRecord,
  ProfileMetrics,
  SkillProofMetric,
  ActiveTab,
  EvidenceType,
  VisibilityStatus,
  DiscoverProfessional,
  PlatformStatusRecord,
} from './types';
import { db } from './services/db';
import { auth } from './services/auth';
import { operationsService } from './services/operationsService';

// Components
import { Header } from './components/Header';
import { MobileBottomNav } from './components/Navigation';
import { DashboardView } from './components/DashboardView';
import { MyWorkView } from './components/MyWorkView';
import { ProfileView } from './components/ProfileView';
import { PublicProfileView } from './components/PublicProfileView';
import { DiscoverView } from './components/DiscoverView';
import { ClientConfirmView } from './components/ClientConfirmView';
import { AddWorkModal } from './components/AddWorkModal';
import { WorkDetailModal } from './components/WorkDetailModal';
import { RequestConfirmModal } from './components/RequestConfirmModal';
import { AuthModal } from './components/AuthModal';
import { ShareModal } from './components/ShareModal';
import { OnboardingModal } from './components/OnboardingModal';
import { MessagesView } from './components/MessagesView';
import { SabiLogo } from './components/SabiLogo';
import { LandingPageView } from './components/LandingPageView';
import { OperationsCenter } from './components/operations/OperationsCenter';
import { MaintenanceBanner } from './components/operations/MaintenanceBanner';
import { SuspendedScreen } from './components/operations/SuspendedScreen';

export function App() {
  // Authentication & Profile State
  const [currentUser, setCurrentUser] = useState<UserProfile | null>(() => auth.getCurrentUser());
  const [activeTab, setActiveTab] = useState<ActiveTab>('dashboard');
  const [isPublicMode, setIsPublicMode] = useState<boolean>(false);
  const [guestExploring, setGuestExploring] = useState<boolean>(false);

  // Real-time Platform Status State
  const [platformStatus, setPlatformStatus] = useState<PlatformStatusRecord>(() =>
    operationsService.getPlatformStatus()
  );

  // Data State
  const [records, setRecords] = useState<WorkRecord[]>([]);
  const [metrics, setMetrics] = useState<ProfileMetrics>({
    totalRecords: 0,
    clientConfirmedRecords: 0,
    evidenceBackedRecords: 0,
    documentedSkillsCount: 0,
    timelineStartYear: null,
    timelineEndYear: null,
    timelineSpanText: 'No records logged yet',
    proofRatio: 0,
  });
  const [skillMetrics, setSkillMetrics] = useState<SkillProofMetric[]>([]);

  // Modals
  const [isAddWorkOpen, setIsAddWorkOpen] = useState(false);
  const [editingRecord, setEditingRecord] = useState<WorkRecord | null>(null);
  const [selectedRecord, setSelectedRecord] = useState<WorkRecord | null>(null);
  const [confirmTargetRecord, setConfirmTargetRecord] = useState<WorkRecord | null>(null);
  const [isAuthOpen, setIsAuthOpen] = useState(false);
  const [isShareOpen, setIsShareOpen] = useState(false);
  const [isOnboardingOpen, setIsOnboardingOpen] = useState(false);

  // External Portal State (Client Confirmation & Public Visitor)
  const [clientConfirmToken, setClientConfirmToken] = useState<string | null>(null);
  const [publicUserSlug, setPublicUserSlug] = useState<string | null>(null);
  const [viewingPublicUser, setViewingPublicUser] = useState<UserProfile | null>(null);
  const [discoverables, setDiscoverables] = useState<DiscoverProfessional[]>([]);

  // Messaging state
  const [selectedConversationId, setSelectedConversationId] = useState<string | null>(null);
  const [unreadMessagesCount, setUnreadMessagesCount] = useState<number>(0);
  const [authCustomPrompt, setAuthCustomPrompt] = useState<{ title?: string; subtitle?: string } | null>(null);

  // Parse URL query parameters on load
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const confirmToken = params.get('confirm');
    const uSlug = params.get('u');
    const tabParam = params.get('tab');
    const adminParam = params.get('admin');

    if (tabParam === 'operations' || adminParam === '1') {
      setActiveTab('operations');
    } else if (confirmToken) {
      setClientConfirmToken(confirmToken);
    } else if (uSlug) {
      setPublicUserSlug(uSlug);
    }
  }, []);

  // Subscribe to real-time platform status changes
  useEffect(() => {
    const unsub = operationsService.subscribeToPlatformStatus((newStatus) => {
      setPlatformStatus(newStatus);
    });
    return () => unsub();
  }, []);

  // Listen to message updates and maintain unread counter
  useEffect(() => {
    if (currentUser) {
      db.ensureStarterConversation(currentUser.id);
      setUnreadMessagesCount(db.getUnreadMessagesCount(currentUser.id));
    } else {
      setUnreadMessagesCount(0);
    }

    const unsub = db.subscribeToMessages(() => {
      if (currentUser) {
        setUnreadMessagesCount(db.getUnreadMessagesCount(currentUser.id));
      } else {
        setUnreadMessagesCount(0);
      }
    });

    return () => unsub();
  }, [currentUser]);

  // Refresh user data & metrics from DB
  const refreshData = (userOverride?: UserProfile | null) => {
    const active = userOverride !== undefined ? userOverride : auth.getCurrentUser();
    setCurrentUser(active);

    if (active) {
      const userRecords = db.getWorkRecordsByUserId(active.id);
      setRecords(userRecords);
      const { metrics: userMetrics, skillProofMetrics: sMetrics } = db.calculateMetrics(active.id);
      setMetrics(userMetrics);
      setSkillMetrics(sMetrics);
    } else {
      const allRecords = db.getAllWorkRecords();
      setRecords(allRecords);
      const { metrics: guestMetrics, skillProofMetrics: sMetrics } = db.calculateMetrics('guest');
      setMetrics(guestMetrics);
      setSkillMetrics(sMetrics);
    }

    setDiscoverables(db.getDiscoverableProfessionals());
  };

  useEffect(() => {
    refreshData();
    // Subscribe to Firebase auth state changes
    const unsubscribe = auth.onAuthStateChanged((user) => {
      refreshData(user);
    });
    return () => {
      if (typeof unsubscribe === 'function') unsubscribe();
    };
  }, []);

  // Handle Save Work Record (Add or Edit)
  const handleSaveWorkRecord = (
    data: {
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
  ) => {
    // If no user is logged in, create an open profile
    let activeUser = currentUser;
    if (!activeUser) {
      activeUser = auth.signUp({
        fullName: 'New Creator',
        username: 'creator_' + Math.floor(Math.random() * 10000),
        email: 'creator@sabi.work',
        profession: data.category,
        location: data.location || '',
        shortBio: '',
        skills: data.skillsDemonstrated,
        yearsOfExperience: 0,
      });
      setCurrentUser(activeUser);
    }

    let targetWorkId = '';

    if (editingRecord) {
      targetWorkId = editingRecord.id;
      // Edit existing
      db.updateWorkRecord(editingRecord.id, {
        ...data,
      });

      // Add newly attached evidence
      evidenceItems.forEach((item) => {
        db.addEvidence({
          workId: editingRecord.id,
          type: item.type,
          url: item.url,
          caption: item.caption,
          fileName: item.fileName,
          fileSize: item.fileSize,
        });
      });

      if (requestConfirmation && data.clientName && data.clientEmail) {
        db.requestClientConfirmation(
          editingRecord.id,
          data.clientName,
          data.clientEmail,
          data.clientNote
        );
      }
    } else {
      // Create new
      const created = db.createWorkRecord({
        userId: activeUser.id,
        title: data.title,
        category: data.category,
        description: data.description,
        skillsDemonstrated: data.skillsDemonstrated,
        completionDate: data.completionDate,
        location: data.location,
        clientName: data.clientName,
        clientEmail: data.clientEmail,
        visibility: data.visibility,
      });
      targetWorkId = created.id;

      // Attach evidence
      evidenceItems.forEach((item) => {
        db.addEvidence({
          workId: created.id,
          type: item.type,
          url: item.url,
          caption: item.caption,
          fileName: item.fileName,
          fileSize: item.fileSize,
        });
      });

      // Request confirmation if desired
      if (requestConfirmation && data.clientName && data.clientEmail) {
        db.requestClientConfirmation(
          created.id,
          data.clientName,
          data.clientEmail,
          data.clientNote
        );
      }
    }

    setEditingRecord(null);
    setIsAddWorkOpen(false);
    refreshData(activeUser);

    // Redirect the user to the completed work record
    const targetRecord = db.getWorkRecordById(targetWorkId);
    if (targetRecord) {
      setSelectedRecord(targetRecord);
    }
  };

  // Handle Delete Work Record
  const handleDeleteWorkRecord = (workId: string) => {
    db.deleteWorkRecord(workId);
    if (selectedRecord?.id === workId) {
      setSelectedRecord(null);
    }
    refreshData();
  };

  // Handle Update Profile
  const handleUpdateProfile = (updated: UserProfile) => {
    db.updateUser(updated);
    refreshData(updated);
  };

  // Handle Onboarding Complete
  const handleOnboardingComplete = (updatedProfile: UserProfile) => {
    const profileToSave = { ...updatedProfile, onboardingCompleted: true };
    db.updateUser(profileToSave);
    refreshData(profileToSave);
    setIsOnboardingOpen(false);
    setActiveTab('dashboard');
  };

  // Handle Logout
  const handleLogout = async () => {
    await auth.logout();
    refreshData(null);
    setIsPublicMode(false);
    setGuestExploring(false);
  };

  const handleLoginSuccess = (user: UserProfile, isNewSignup?: boolean) => {
    refreshData(user);
    setGuestExploring(false);
    setAuthCustomPrompt(null);
    setIsAuthOpen(false);
    if (isNewSignup || user.onboardingCompleted === false) {
      setIsOnboardingOpen(true);
    } else {
      setActiveTab('dashboard');
    }
  };

  // Primary connection journey: DISCOVER -> REVIEW PROOF -> MESSAGE -> OPPORTUNITY
  const handleStartConversation = (targetUser: UserProfile) => {
    if (!currentUser) {
      setAuthCustomPrompt({
        title: 'Sign In to Message',
        subtitle: `Connect directly with ${targetUser.fullName} after reviewing their documented work and proof.`,
      });
      setIsAuthOpen(true);
      return;
    }

    if (currentUser.id === targetUser.id) {
      return;
    }

    const conversation = db.getOrCreateConversation(
      currentUser.id,
      targetUser.id,
      'discovered_via_proof',
      targetUser.id
    );

    setSelectedConversationId(conversation.id);
    setViewingPublicUser(null);
    setPublicUserSlug(null);
    setIsPublicMode(false);
    setActiveTab('messages');
  };

  // CHECK: If admin has opened the Sabi Operations Center
  if (activeTab === 'operations') {
    return (
      <OperationsCenter
        currentUser={currentUser}
        onExitToApp={() => {
          const url = new URL(window.location.href);
          url.searchParams.delete('tab');
          url.searchParams.delete('admin');
          window.history.pushState({}, '', url.toString());
          setActiveTab('dashboard');
        }}
      />
    );
  }

  // CHECK: Is Sabi Platform in a real backend-controlled SUSPENDED state?
  if (platformStatus.status === 'SUSPENDED') {
    return (
      <SuspendedScreen
        statusRecord={platformStatus}
        onOpenOperationsGate={() => setActiveTab('operations')}
      />
    );
  }

  // CHECK: Is user visiting via client confirmation link?
  if (clientConfirmToken) {
    const confirmationData = db.getConfirmationByToken(clientConfirmToken);
    if (confirmationData) {
      return (
        <ClientConfirmView
          confirmationData={confirmationData}
          onConfirmationComplete={() => {
            refreshData();
          }}
          onReturnToApp={() => {
            // Remove confirm param from URL without reload
            const url = new URL(window.location.href);
            url.searchParams.delete('confirm');
            window.history.pushState({}, '', url.toString());
            setClientConfirmToken(null);
          }}
        />
      );
    }
  }

  // CHECK: Is visitor viewing someone else's public profile via `?u=SLUG`?
  if (publicUserSlug) {
    const targetUser = db.getUserByUsername(publicUserSlug);
    if (targetUser) {
      const targetRecords = db.getWorkRecordsByUserId(targetUser.id);
      const { metrics: targetMetrics, skillProofMetrics: targetSkills } = db.calculateMetrics(targetUser.id, true);

      return (
        <PublicProfileView
          user={targetUser}
          records={targetRecords}
          metrics={targetMetrics}
          skillMetrics={targetSkills}
          isOwner={currentUser?.id === targetUser.id}
          onMessage={handleStartConversation}
          onBackToEditor={() => {
            const url = new URL(window.location.href);
            url.searchParams.delete('u');
            window.history.pushState({}, '', url.toString());
            setPublicUserSlug(null);
            setIsPublicMode(false);
          }}
        />
      );
    }
  }

  // CHECK: If user toggled Public View mode for their own profile
  if (isPublicMode && currentUser) {
    const { metrics: publicMetrics, skillProofMetrics: publicSkills } = db.calculateMetrics(currentUser.id, true);
    return (
      <PublicProfileView
        user={currentUser}
        records={records}
        metrics={publicMetrics}
        skillMetrics={publicSkills}
        isOwner={true}
        onBackToEditor={() => setIsPublicMode(false)}
      />
    );
  }

  // CHECK: If visitor clicked to inspect a discovered professional's proof profile
  if (viewingPublicUser) {
    const targetRecords = db
      .getWorkRecordsByUserId(viewingPublicUser.id)
      .filter((r) => r.visibility === 'public');
    const { metrics: targetMetrics, skillProofMetrics: targetSkills } = db.calculateMetrics(
      viewingPublicUser.id,
      true
    );

    return (
      <PublicProfileView
        user={viewingPublicUser}
        records={targetRecords}
        metrics={targetMetrics}
        skillMetrics={targetSkills}
        isOwner={currentUser?.id === viewingPublicUser.id}
        onMessage={handleStartConversation}
        onBackToEditor={() => {
          setViewingPublicUser(null);
        }}
      />
    );
  }

  // CHECK: If user is not authenticated and not explicitly browsing as guest, render Sabi Landing Page
  if (!currentUser && !guestExploring) {
    return (
      <>
        {platformStatus.status === 'MAINTENANCE' && (
          <MaintenanceBanner
            statusRecord={platformStatus}
            onOpenOperations={() => setActiveTab('operations')}
          />
        )}
        <LandingPageView
          onLoginSuccess={handleLoginSuccess}
          onExploreGuest={() => {
            setGuestExploring(true);
            setActiveTab('discover');
          }}
          onOpenOperations={() => setActiveTab('operations')}
        />
      </>
    );
  }

  const handleTabChange = (tab: ActiveTab) => {
    setViewingPublicUser(null);
    setIsPublicMode(false);
    setActiveTab(tab);
  };

  return (
    <div className="min-h-screen bg-[#FAF8F5] text-[#16222F] flex flex-col font-sans selection:bg-[#EAF3EF] selection:text-[#2D4D45]">
      {/* Maintenance Mode Banner */}
      {platformStatus.status === 'MAINTENANCE' && (
        <MaintenanceBanner
          statusRecord={platformStatus}
          onOpenOperations={() => setActiveTab('operations')}
        />
      )}

      {/* Guest Mode Banner */}
      {!currentUser && guestExploring && (
        <div className="bg-[#152722] text-white px-4 py-2.5 text-xs flex flex-wrap items-center justify-between gap-3 border-b border-[#20362F] sticky top-0 z-50">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-[#4D7A70] animate-pulse" />
            <span className="font-medium text-[#CFE2D9]">
              You are exploring the SABI Proof Directory in guest mode.
            </span>
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={() => setGuestExploring(false)}
              className="text-xs text-[#A1B8B1] hover:text-white transition-colors cursor-pointer font-medium"
            >
              ← Back to Sign In / Sign Up
            </button>
            <button
              onClick={() => {
                setAuthCustomPrompt(null);
                setIsAuthOpen(true);
              }}
              className="px-3.5 py-1.5 rounded-full bg-[#4D7A70] hover:bg-[#3D665D] text-white font-bold text-xs shadow-xs transition-colors cursor-pointer"
            >
              Sign In with Google
            </button>
          </div>
        </div>
      )}

      {/* Header */}
      <Header
        user={currentUser}
        activeTab={activeTab}
        setActiveTab={handleTabChange}
        onOpenAuth={() => {
          setAuthCustomPrompt(null);
          setIsAuthOpen(true);
        }}
        onLogout={handleLogout}
        onOpenAddWork={() => {
          setEditingRecord(null);
          setIsAddWorkOpen(true);
        }}
        isPublicMode={isPublicMode}
        setIsPublicMode={setIsPublicMode}
        onShareProfile={() => setIsShareOpen(true)}
        unreadMessagesCount={unreadMessagesCount}
        onOpenOperations={() => setActiveTab('operations')}
      />

      {/* Main Content Area — Open interfaces ready for use */}
      <main className="flex-1 max-w-6xl w-full mx-auto px-4 sm:px-6 pt-6">
        {activeTab === 'dashboard' && (
          <DashboardView
            user={currentUser}
            metrics={metrics}
            skillMetrics={skillMetrics}
            recentRecords={records}
            onOpenAddWork={() => {
              setEditingRecord(null);
              setIsAddWorkOpen(true);
            }}
            onSelectWork={(rec) => setSelectedRecord(rec)}
            setActiveTab={handleTabChange}
            setIsPublicMode={setIsPublicMode}
            onShareProfile={() => setIsShareOpen(true)}
            onRequestConfirm={(rec) => setConfirmTargetRecord(rec)}
          />
        )}

        {activeTab === 'my-work' && (
          <MyWorkView
            records={records}
            user={currentUser}
            onSelectWork={(rec) => setSelectedRecord(rec)}
            onOpenAddWork={() => {
              setEditingRecord(null);
              setIsAddWorkOpen(true);
            }}
            onEditWork={(rec) => {
              setEditingRecord(rec);
              setIsAddWorkOpen(true);
            }}
            onDeleteWork={handleDeleteWorkRecord}
            onRequestConfirm={(rec) => setConfirmTargetRecord(rec)}
          />
        )}

        {activeTab === 'profile' && (
          <ProfileView
            user={currentUser}
            metrics={metrics}
            skillMetrics={skillMetrics}
            records={records}
            onUpdateProfile={handleUpdateProfile}
            onSelectWork={(rec) => setSelectedRecord(rec)}
            setIsPublicMode={setIsPublicMode}
            onShareProfile={() => setIsShareOpen(true)}
          />
        )}

        {activeTab === 'discover' && (
          <DiscoverView
            currentUser={currentUser}
            discoverables={discoverables}
            onViewProfessional={(profUser) => {
              setViewingPublicUser(profUser);
            }}
            onUpdateCurrentUser={(updated) => {
              handleUpdateProfile(updated);
              refreshData();
            }}
            onGoToProfile={() => handleTabChange('profile')}
            onMessageProfessional={handleStartConversation}
          />
        )}

        {activeTab === 'messages' && (
          <MessagesView
            currentUser={currentUser}
            selectedConversationId={selectedConversationId}
            onSelectConversation={(id) => setSelectedConversationId(id)}
            onViewProofProfile={(profUser) => {
              setViewingPublicUser(profUser);
            }}
            onGoToDiscover={() => handleTabChange('discover')}
            onPromptAuth={(reason) => {
              setAuthCustomPrompt({
                title: 'Sign In to Access Messages',
                subtitle:
                  reason ||
                  'Sign in or create an account to view and respond to your direct professional messages.',
              });
              setIsAuthOpen(true);
            }}
          />
        )}
      </main>

      {/* Mobile Bottom Navigation Bar */}
      <MobileBottomNav
        activeTab={activeTab}
        setActiveTab={handleTabChange}
        onOpenAddWork={() => {
          setEditingRecord(null);
          setIsAddWorkOpen(true);
        }}
        isPublicMode={isPublicMode}
        setIsPublicMode={setIsPublicMode}
        unreadMessagesCount={unreadMessagesCount}
      />

      {/* Onboarding Flow Modal */}
      {currentUser && (
        <OnboardingModal
          isOpen={isOnboardingOpen}
          user={currentUser}
          onComplete={handleOnboardingComplete}
        />
      )}

      {/* Modals */}
      <AddWorkModal
        isOpen={isAddWorkOpen}
        onClose={() => {
          setIsAddWorkOpen(false);
          setEditingRecord(null);
        }}
        onSave={handleSaveWorkRecord}
        editingRecord={editingRecord}
        userSkills={currentUser?.skills || []}
      />

      <WorkDetailModal
        work={selectedRecord}
        user={currentUser}
        onClose={() => setSelectedRecord(null)}
        onEdit={(rec) => {
          setSelectedRecord(null);
          setEditingRecord(rec);
          setIsAddWorkOpen(true);
        }}
        onDelete={handleDeleteWorkRecord}
        onUpdateWork={(updated) => {
          setSelectedRecord(updated);
          refreshData();
        }}
        onRequestConfirm={(rec) => setConfirmTargetRecord(rec)}
      />

      <RequestConfirmModal
        work={confirmTargetRecord}
        isOpen={Boolean(confirmTargetRecord)}
        onClose={() => setConfirmTargetRecord(null)}
        onSuccess={() => {
          refreshData();
          if (selectedRecord && confirmTargetRecord && selectedRecord.id === confirmTargetRecord.id) {
            const updated = db.getWorkRecordById(selectedRecord.id);
            if (updated) setSelectedRecord(updated);
          }
        }}
      />

      <AuthModal
        isOpen={isAuthOpen}
        onClose={() => {
          setIsAuthOpen(false);
          setAuthCustomPrompt(null);
        }}
        customTitle={authCustomPrompt?.title}
        customSubtitle={authCustomPrompt?.subtitle}
        onLoginSuccess={handleLoginSuccess}
      />

      {currentUser && (
        <ShareModal
          isOpen={isShareOpen}
          onClose={() => setIsShareOpen(false)}
          user={currentUser}
        />
      )}
    </div>
  );
}
export default App;
