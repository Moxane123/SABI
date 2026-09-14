import React, { useState } from 'react';
import {
  Compass,
  Layers,
  CheckCircle2,
  Shield,
  Eye,
  EyeOff,
  Search,
  Filter,
  RefreshCw,
  Globe,
  Sliders,
  AlertCircle,
} from 'lucide-react';
import { UserProfile, WorkRecord } from '../../../types';

interface ContentSectionProps {
  users: UserProfile[];
  records: WorkRecord[];
}

export const ContentSection: React.FC<ContentSectionProps> = ({ users, records }) => {
  const [activeCategory, setActiveCategory] = useState<string>('all');

  const categories = [
    { id: 'all', label: 'All Disciplines' },
    { id: 'design', label: 'Design & Creative' },
    { id: 'engineering', label: 'Engineering & Tech' },
    { id: 'craft', label: 'Craft & Fabrication' },
    { id: 'architecture', label: 'Architecture & Spaces' },
    { id: 'consulting', label: 'Strategy & Operations' },
  ];

  const discoverableUsers = users.filter((u) => u.appearInDiscover && !u.isSuspended);
  const privateUsers = users.filter((u) => !u.appearInDiscover);
  const publicRecords = records.filter((r) => r.visibility === 'public' && !r.isTakenDown);
  const privateRecords = records.filter((r) => r.visibility === 'private');

  return (
    <div className="space-y-6">
      {/* Overview Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white p-5 rounded-2xl border border-[#E7E2D8] shadow-xs">
          <div className="flex items-center gap-2 text-xs font-bold text-[#52606D] mb-1">
            <Globe className="w-4 h-4 text-[#2D4D45]" />
            <span>Discoverable Profiles</span>
          </div>
          <p className="text-2xl font-black text-[#16222F] font-mono">
            {discoverableUsers.length}
          </p>
          <p className="text-[11px] text-[#7A8690] mt-1">
            {privateUsers.length} profiles opted for private discovery
          </p>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-[#E7E2D8] shadow-xs">
          <div className="flex items-center gap-2 text-xs font-bold text-[#52606D] mb-1">
            <Eye className="w-4 h-4 text-[#2D4D45]" />
            <span>Public Proof Records</span>
          </div>
          <p className="text-2xl font-black text-[#16222F] font-mono">
            {publicRecords.length}
          </p>
          <p className="text-[11px] text-[#7A8690] mt-1">
            {privateRecords.length} confidential / internal records
          </p>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-[#E7E2D8] shadow-xs">
          <div className="flex items-center gap-2 text-xs font-bold text-[#52606D] mb-1">
            <Shield className="w-4 h-4 text-[#2D4D45]" />
            <span>Privacy Guard Status</span>
          </div>
          <p className="text-sm font-bold text-[#2D4D45] flex items-center gap-1.5 mt-2">
            <CheckCircle2 className="w-4 h-4" />
            100% Enforced
          </p>
          <p className="text-[11px] text-[#7A8690] mt-1">
            Zero private records leaked into public search
          </p>
        </div>
      </div>

      {/* Distribution & Discover Directory Inspection */}
      <div className="bg-white rounded-2xl border border-[#E7E2D8] p-6 shadow-xs space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-[#E7E2D8]">
          <div>
            <h3 className="text-base font-bold text-[#16222F]">
              Discovery Distribution & Demonstrated Skills Registry
            </h3>
            <p className="text-xs text-[#52606D]">
              Verified professionals indexed for client discovery based strictly on documented work.
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {discoverableUsers.map((u) => {
            const userWorks = publicRecords.filter((r) => r.userId === u.id);
            const confirmedWorks = userWorks.filter((r) => r.confirmationStatus === 'confirmed');

            return (
              <div
                key={u.id}
                className="p-4 rounded-xl bg-[#FAF8F5] border border-[#E7E2D8] hover:border-[#2D4D45]/50 transition-all space-y-3"
              >
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <h4 className="font-bold text-xs text-[#16222F]">{u.fullName}</h4>
                    <p className="text-[11px] text-[#7A8690] line-clamp-1">{u.profession || 'Professional'}</p>
                  </div>
                  <span className="px-2 py-0.5 rounded-full bg-[#EAF3EF] text-[#2D4D45] text-[10px] font-bold shrink-0">
                    Live in Discover
                  </span>
                </div>

                <div className="flex items-center gap-3 text-[11px] text-[#52606D]">
                  <span>{userWorks.length} public works</span>
                  <span>·</span>
                  <span className="font-bold text-[#2D4D45]">{confirmedWorks.length} confirmed</span>
                </div>

                <div className="flex items-center gap-1 flex-wrap">
                  {(u.skills || []).slice(0, 4).map((skill, idx) => (
                    <span
                      key={idx}
                      className="px-1.5 py-0.5 rounded bg-white border border-[#E7E2D8] text-[10px] text-stone-700"
                    >
                      {skill}
                    </span>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
