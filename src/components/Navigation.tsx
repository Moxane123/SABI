import React from 'react';
import { Home, Briefcase, User, Compass, MessageSquare } from 'lucide-react';
import { ActiveTab } from '../types';

interface NavigationProps {
  activeTab: ActiveTab;
  setActiveTab: (tab: ActiveTab) => void;
  onOpenAddWork: () => void;
  isPublicMode: boolean;
  setIsPublicMode: (isPublic: boolean) => void;
  unreadMessagesCount?: number;
}

export const MobileBottomNav: React.FC<NavigationProps> = ({
  activeTab,
  setActiveTab,
  isPublicMode,
  setIsPublicMode,
  unreadMessagesCount = 0,
}) => {
  if (isPublicMode) {
    return (
      <div className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-[#16222F] border-t border-[#233446] px-4 py-2.5 flex items-center justify-between shadow-2xl safe-area-bottom">
        <div className="flex items-center gap-2 text-stone-200 text-xs">
          <span className="w-2 h-2 rounded-full bg-[#D4A359] animate-pulse"></span>
          <span>Viewing Public Proof Profile</span>
        </div>
        <button
          onClick={() => setIsPublicMode(false)}
          className="px-3 py-1.5 rounded-xl bg-[#4D7A70] hover:bg-[#3D665D] text-white font-semibold text-xs transition-colors"
        >
          Return to Editor
        </button>
      </div>
    );
  }

  return (
    <nav
      id="mobile-bottom-nav"
      className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-white/95 backdrop-blur-md border-t border-[#EAE6DE] px-2 py-1.5 shadow-lg safe-area-bottom"
    >
      <div className="grid grid-cols-5 items-center max-w-md mx-auto">
        {/* Home */}
        <button
          onClick={() => setActiveTab('dashboard')}
          className={`flex flex-col items-center justify-center py-1 px-0.5 transition-colors ${
            activeTab === 'dashboard'
              ? 'text-[#2D4D45] font-bold'
              : 'text-[#7A8690] hover:text-[#16222F]'
          }`}
        >
          <Home className="w-5 h-5 mb-0.5" strokeWidth={activeTab === 'dashboard' ? 2.4 : 1.8} />
          <span className="text-[10px] leading-tight">Home</span>
        </button>

        {/* My Work */}
        <button
          onClick={() => setActiveTab('my-work')}
          className={`flex flex-col items-center justify-center py-1 px-0.5 transition-colors ${
            activeTab === 'my-work'
              ? 'text-[#2D4D45] font-bold'
              : 'text-[#7A8690] hover:text-[#16222F]'
          }`}
        >
          <Briefcase className="w-5 h-5 mb-0.5" strokeWidth={activeTab === 'my-work' ? 2.4 : 1.8} />
          <span className="text-[10px] leading-tight">My Work</span>
        </button>

        {/* Discover */}
        <button
          onClick={() => setActiveTab('discover')}
          className={`flex flex-col items-center justify-center py-1 px-0.5 transition-colors ${
            activeTab === 'discover'
              ? 'text-[#2D4D45] font-bold'
              : 'text-[#7A8690] hover:text-[#16222F]'
          }`}
        >
          <Compass className="w-5 h-5 mb-0.5" strokeWidth={activeTab === 'discover' ? 2.4 : 1.8} />
          <span className="text-[10px] leading-tight">Discover</span>
        </button>

        {/* Messages */}
        <button
          onClick={() => setActiveTab('messages')}
          className={`flex flex-col items-center justify-center py-1 px-0.5 transition-colors relative ${
            activeTab === 'messages'
              ? 'text-[#2D4D45] font-bold'
              : 'text-[#7A8690] hover:text-[#16222F]'
          }`}
        >
          <div className="relative">
            <MessageSquare className="w-5 h-5 mb-0.5" strokeWidth={activeTab === 'messages' ? 2.4 : 1.8} />
            {unreadMessagesCount > 0 && (
              <span className="absolute -top-1 -right-2 min-w-3.5 h-3.5 px-0.5 rounded-full bg-[#D4A359] text-[#16222F] text-[9px] font-black flex items-center justify-center">
                {unreadMessagesCount > 9 ? '9+' : unreadMessagesCount}
              </span>
            )}
          </div>
          <span className="text-[10px] leading-tight">Messages</span>
        </button>

        {/* Profile */}
        <button
          onClick={() => setActiveTab('profile')}
          className={`flex flex-col items-center justify-center py-1 px-0.5 transition-colors ${
            activeTab === 'profile'
              ? 'text-[#2D4D45] font-bold'
              : 'text-[#7A8690] hover:text-[#16222F]'
          }`}
        >
          <User className="w-5 h-5 mb-0.5" strokeWidth={activeTab === 'profile' ? 2.4 : 1.8} />
          <span className="text-[10px] leading-tight">Profile</span>
        </button>
      </div>
    </nav>
  );
};


