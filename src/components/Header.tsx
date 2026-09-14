import React from 'react';
import {
  Plus,
  Share2,
  ExternalLink,
  LogOut,
  Sparkles,
  Bell,
  Menu,
  CheckCircle2,
  Compass,
  MessageSquare,
  Shield,
} from 'lucide-react';
import { UserProfile, ActiveTab } from '../types';
import { SabiLogo } from './SabiLogo';

interface HeaderProps {
  user: UserProfile | null;
  activeTab: ActiveTab;
  setActiveTab: (tab: ActiveTab) => void;
  onOpenAuth: () => void;
  onLogout: () => void;
  onOpenAddWork: () => void;
  isPublicMode: boolean;
  setIsPublicMode: (isPublic: boolean) => void;
  onShareProfile: () => void;
  unreadMessagesCount?: number;
  onOpenOperations?: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  user,
  activeTab,
  setActiveTab,
  onOpenAuth,
  onLogout,
  onOpenAddWork,
  isPublicMode,
  setIsPublicMode,
  onShareProfile,
  unreadMessagesCount = 0,
  onOpenOperations,
}) => {
  return (
    <header className="sticky top-0 z-40 bg-[#FAF8F5]/90 backdrop-blur-md border-b border-[#EAE6DE] text-[#16222F]">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
        {/* Brand with authentic Sabi logo and tagline */}
        <div className="flex items-center gap-4">
          <button
            onClick={() => {
              setIsPublicMode(false);
              setActiveTab('dashboard');
            }}
            className="flex items-center text-left focus:outline-none group"
          >
            <SabiLogo size="md" variant="full" />
          </button>

          {/* Micro Tagline Pill */}
          <span className="hidden lg:inline-flex items-center text-[11px] font-medium px-2.5 py-0.5 rounded-full bg-[#EAF3EF] text-[#2D4D45] border border-[#CFE2D9]">
            What you can do should count.
          </span>
        </div>

        {/* Desktop Navigation Links — open so interfaces are directly accessible */}
        <div className="hidden md:flex items-center gap-1.5">
          <button
            onClick={() => {
              setIsPublicMode(false);
              setActiveTab('dashboard');
            }}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold transition-all ${
              !isPublicMode && activeTab === 'dashboard'
                ? 'bg-[#2D4D45] text-white shadow-2xs'
                : 'text-[#5A6872] hover:text-[#16222F] hover:bg-[#EAE6DE]/60'
            }`}
          >
            Dashboard
          </button>
          <button
            onClick={() => {
              setIsPublicMode(false);
              setActiveTab('my-work');
            }}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold transition-all ${
              !isPublicMode && activeTab === 'my-work'
                ? 'bg-[#2D4D45] text-white shadow-2xs'
                : 'text-[#5A6872] hover:text-[#16222F] hover:bg-[#EAE6DE]/60'
            }`}
          >
            My Work
          </button>
          <button
            onClick={() => {
              setIsPublicMode(false);
              setActiveTab('discover');
            }}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold transition-all flex items-center gap-1.5 ${
              !isPublicMode && activeTab === 'discover'
                ? 'bg-[#2D4D45] text-white shadow-2xs'
                : 'text-[#5A6872] hover:text-[#16222F] hover:bg-[#EAE6DE]/60'
            }`}
          >
            <Compass className="w-3.5 h-3.5 text-[#D4A359]" />
            <span>Discover</span>
          </button>
          <button
            onClick={() => {
              setIsPublicMode(false);
              setActiveTab('messages');
            }}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold transition-all flex items-center gap-1.5 relative ${
              !isPublicMode && activeTab === 'messages'
                ? 'bg-[#2D4D45] text-white shadow-2xs'
                : 'text-[#5A6872] hover:text-[#16222F] hover:bg-[#EAE6DE]/60'
            }`}
          >
            <MessageSquare className="w-3.5 h-3.5" />
            <span>Messages</span>
            {unreadMessagesCount > 0 && (
              <span className="min-w-4 h-4 px-1 rounded-full bg-[#D4A359] text-[#16222F] text-[10px] font-black flex items-center justify-center -ml-0.5">
                {unreadMessagesCount > 9 ? '9+' : unreadMessagesCount}
              </span>
            )}
          </button>
          <button
            onClick={() => {
              setIsPublicMode(false);
              setActiveTab('profile');
            }}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold transition-all ${
              !isPublicMode && activeTab === 'profile'
                ? 'bg-[#2D4D45] text-white shadow-2xs'
                : 'text-[#5A6872] hover:text-[#16222F] hover:bg-[#EAE6DE]/60'
            }`}
          >
            Profile & Skills
          </button>
        </div>

        {/* Right Header Actions */}
        <div className="flex items-center gap-2">
          {/* Primary Add Work CTA (Desktop) */}
          <button
            onClick={onOpenAddWork}
            className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-[#4D7A70] hover:bg-[#3D665D] text-white text-xs font-bold shadow-2xs transition-all active:scale-95"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Add Work</span>
          </button>

          {user ? (
            <>
              {/* Public Preview Button */}
              <button
                onClick={() => setIsPublicMode(!isPublicMode)}
                className={`hidden md:inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-medium border transition-colors ${
                  isPublicMode
                    ? 'bg-[#8C7CA7] text-white border-[#7B6A97]'
                    : 'bg-white border-[#D5CEC2] hover:border-[#4D7A70] text-[#16222F]'
                }`}
              >
                <ExternalLink className="w-3.5 h-3.5 text-[#8C7CA7]" />
                <span>{isPublicMode ? 'Back to Editor' : 'Public Profile'}</span>
              </button>

              {/* Share Profile */}
              <button
                onClick={onShareProfile}
                title="Share your proof profile"
                className="p-2 rounded-xl bg-white border border-[#D5CEC2] hover:border-[#4D7A70] text-[#5A6872] hover:text-[#16222F] transition-colors"
              >
                <Share2 className="w-4 h-4 text-[#4D7A70]" />
              </button>

              {/* Operations Center Access */}
              {onOpenOperations && (
                <button
                  onClick={onOpenOperations}
                  title="Sabi Operations Center"
                  className="p-2 rounded-xl bg-white border border-[#D5CEC2] hover:border-[#2D4D45] text-[#5A6872] hover:text-[#2D4D45] transition-colors cursor-pointer"
                >
                  <Shield className="w-4 h-4 text-[#2D4D45]" />
                </button>
              )}

              {/* Profile Avatar / Quick Details */}
              <div className="flex items-center gap-2 pl-1 border-l border-[#EAE6DE]">
                <button
                  onClick={() => {
                    setIsPublicMode(false);
                    setActiveTab('profile');
                  }}
                  className="flex items-center gap-2 p-1 rounded-xl hover:bg-white transition-colors text-left"
                >
                  {user.profilePhoto ? (
                    <img
                      src={user.profilePhoto}
                      alt={user.fullName || 'User'}
                      className="w-8 h-8 rounded-full object-cover border border-[#4D7A70]/30 shadow-2xs"
                    />
                  ) : (
                    <div className="w-8 h-8 rounded-full bg-[#4D7A70] text-white font-bold text-xs flex items-center justify-center border border-[#4D7A70]/30 shadow-2xs">
                      {user.fullName ? user.fullName.charAt(0).toUpperCase() : 'U'}
                    </div>
                  )}
                  <div className="hidden xl:block">
                    <p className="text-xs font-bold text-[#16222F] leading-tight truncate max-w-[120px]">
                      {user.fullName || 'My Account'}
                    </p>
                    <p className="text-[10px] text-[#5A6872] leading-tight truncate max-w-[120px]">
                      {user.profession || 'Profile'}
                    </p>
                  </div>
                </button>

                <button
                  onClick={onLogout}
                  title="Sign Out"
                  className="p-1.5 text-[#8C98A2] hover:text-rose-600 rounded-lg transition-colors"
                >
                  <LogOut className="w-4 h-4" />
                </button>
              </div>
            </>
          ) : (
            <div className="flex items-center gap-2">
              <button
                onClick={onOpenAuth}
                className="px-4 py-2 rounded-xl bg-[#2D4D45] hover:bg-[#203731] text-white text-xs font-bold shadow-2xs transition-colors"
              >
                Sign In
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};
