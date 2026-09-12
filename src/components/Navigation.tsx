import React from 'react';
import { Home, Briefcase, Plus, User } from 'lucide-react';
import { ActiveTab } from '../types';

interface NavigationProps {
  activeTab: ActiveTab;
  setActiveTab: (tab: ActiveTab) => void;
  onOpenAddWork: () => void;
  isPublicMode: boolean;
  setIsPublicMode: (isPublic: boolean) => void;
}

export const MobileBottomNav: React.FC<NavigationProps> = ({
  activeTab,
  setActiveTab,
  onOpenAddWork,
  isPublicMode,
  setIsPublicMode,
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
      className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-white/95 backdrop-blur-md border-t border-[#EAE6DE] px-3 py-1.5 shadow-lg safe-area-bottom"
    >
      <div className="grid grid-cols-4 items-center max-w-md mx-auto">
        {/* Home */}
        <button
          onClick={() => setActiveTab('dashboard')}
          className={`flex flex-col items-center justify-center py-1 px-1 transition-colors ${
            activeTab === 'dashboard'
              ? 'text-[#2D4D45] font-bold'
              : 'text-[#7A8690] hover:text-[#16222F]'
          }`}
        >
          <Home className="w-5 h-5 mb-0.5" strokeWidth={activeTab === 'dashboard' ? 2.4 : 1.8} />
          <span className="text-[11px] leading-tight">Home</span>
        </button>

        {/* Center Add Button: Deep Sage Circle with White Plus (Exactly matching brand mockup) */}
        <button
          onClick={onOpenAddWork}
          className="flex flex-col items-center justify-center py-0.5 -mt-1 active:scale-95 transition-transform"
          aria-label="Add Work"
        >
          <div className="w-11 h-11 rounded-2xl bg-[#4D7A70] hover:bg-[#2D4D45] text-white flex items-center justify-center shadow-md shadow-[#4D7A70]/30 transition-colors">
            <Plus className="w-6 h-6" strokeWidth={2.5} />
          </div>
        </button>

        {/* My Work */}
        <button
          onClick={() => setActiveTab('my-work')}
          className={`flex flex-col items-center justify-center py-1 px-1 transition-colors ${
            activeTab === 'my-work'
              ? 'text-[#2D4D45] font-bold'
              : 'text-[#7A8690] hover:text-[#16222F]'
          }`}
        >
          <Briefcase className="w-5 h-5 mb-0.5" strokeWidth={activeTab === 'my-work' ? 2.4 : 1.8} />
          <span className="text-[11px] leading-tight">My Work</span>
        </button>

        {/* Profile */}
        <button
          onClick={() => setActiveTab('profile')}
          className={`flex flex-col items-center justify-center py-1 px-1 transition-colors ${
            activeTab === 'profile'
              ? 'text-[#2D4D45] font-bold'
              : 'text-[#7A8690] hover:text-[#16222F]'
          }`}
        >
          <User className="w-5 h-5 mb-0.5" strokeWidth={activeTab === 'profile' ? 2.4 : 1.8} />
          <span className="text-[11px] leading-tight">Profile</span>
        </button>
      </div>
    </nav>
  );
};
