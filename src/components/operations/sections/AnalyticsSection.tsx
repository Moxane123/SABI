import React from 'react';
import {
  TrendingUp,
  Award,
  CheckCircle2,
  FileCheck,
  ShieldCheck,
  BarChart2,
  PieChart,
  Layers,
} from 'lucide-react';
import { UserProfile, WorkRecord } from '../../../types';

interface AnalyticsSectionProps {
  users: UserProfile[];
  records: WorkRecord[];
}

export const AnalyticsSection: React.FC<AnalyticsSectionProps> = ({ users, records }) => {
  const totalRecords = records.length;
  const confirmedCount = records.filter((r) => r.confirmationStatus === 'confirmed').length;
  const evidenceCount = records.filter(
    (r) => r.evidenceStatus === 'attached' || r.evidenceStatus === 'verified'
  ).length;
  const selfDocCount = totalRecords - evidenceCount;

  const confirmedPct = totalRecords > 0 ? Math.round((confirmedCount / totalRecords) * 100) : 0;
  const evidencePct = totalRecords > 0 ? Math.round((evidenceCount / totalRecords) * 100) : 0;
  const selfDocPct = totalRecords > 0 ? Math.round((selfDocCount / totalRecords) * 100) : 0;

  // Aggregate demonstrated skills
  const skillCounts = new Map<string, { total: number; confirmed: number }>();
  records.forEach((r) => {
    const isConf = r.confirmationStatus === 'confirmed';
    (r.skillsDemonstrated || []).forEach((s) => {
      const trimmed = s.trim();
      if (!trimmed) return;
      const key = trimmed.toLowerCase();
      const existing = skillCounts.get(key) || { total: 0, confirmed: 0 };
      existing.total += 1;
      if (isConf) existing.confirmed += 1;
      skillCounts.set(key, existing);
    });
  });

  const sortedSkills = Array.from(skillCounts.entries())
    .map(([name, data]) => ({ name, ...data }))
    .sort((a, b) => b.total - a.total)
    .slice(0, 10);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white rounded-2xl border border-[#E7E2D8] p-6 shadow-xs">
        <h2 className="text-lg font-bold text-[#16222F]">
          Proof Integrity & Platform Verification Analytics
        </h2>
        <p className="text-xs text-[#52606D]">
          Statistical breakdown of proof-backed claims, confirmation conversion rates, and demonstrated skill distribution.
        </p>
      </div>

      {/* Proof Hierarchy Breakdown Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Tier 1 */}
        <div className="bg-white p-5 rounded-2xl border border-[#E7E2D8] shadow-xs">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-bold text-[#52606D] uppercase tracking-wider">
              Self-Documented
            </span>
            <span className="text-xs font-mono font-bold text-stone-500">{selfDocPct}%</span>
          </div>
          <p className="text-2xl font-black text-[#16222F] font-mono">
            {selfDocCount}
          </p>
          <p className="text-[11px] text-[#7A8690] mt-1">
            Baseline author-attested records
          </p>
          <div className="w-full h-2 bg-stone-100 rounded-full mt-3 overflow-hidden">
            <div className="h-full bg-stone-400 rounded-full" style={{ width: `${selfDocPct}%` }} />
          </div>
        </div>

        {/* Tier 2 */}
        <div className="bg-white p-5 rounded-2xl border border-[#E7E2D8] shadow-xs">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-bold text-[#52606D] uppercase tracking-wider">
              Evidence-Backed
            </span>
            <span className="text-xs font-mono font-bold text-blue-600">{evidencePct}%</span>
          </div>
          <p className="text-2xl font-black text-[#16222F] font-mono">
            {evidenceCount}
          </p>
          <p className="text-[11px] text-[#7A8690] mt-1">
            Accompanied by verified files or URLs
          </p>
          <div className="w-full h-2 bg-stone-100 rounded-full mt-3 overflow-hidden">
            <div className="h-full bg-blue-500 rounded-full" style={{ width: `${evidencePct}%` }} />
          </div>
        </div>

        {/* Tier 3 */}
        <div className="bg-white p-5 rounded-2xl border border-[#E7E2D8] shadow-xs">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-bold text-[#52606D] uppercase tracking-wider">
              Client-Confirmed
            </span>
            <span className="text-xs font-mono font-bold text-[#2D4D45]">{confirmedPct}%</span>
          </div>
          <p className="text-2xl font-black text-[#16222F] font-mono">
            {confirmedCount}
          </p>
          <p className="text-[11px] text-[#7A8690] mt-1">
            Independently signed by external clients
          </p>
          <div className="w-full h-2 bg-stone-100 rounded-full mt-3 overflow-hidden">
            <div className="h-full bg-[#2D4D45] rounded-full" style={{ width: `${confirmedPct}%` }} />
          </div>
        </div>
      </div>

      {/* Top Demonstrated Skills Table */}
      <div className="bg-white rounded-2xl border border-[#E7E2D8] p-6 shadow-xs space-y-4">
        <h3 className="text-sm font-bold text-[#16222F] uppercase tracking-wider">
          Top Demonstrated Skills in Network
        </h3>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="bg-[#FAF8F5] border-b border-[#E7E2D8] text-[#52606D] font-bold uppercase text-[10px]">
                <th className="p-3">Skill / Capability</th>
                <th className="p-3">Documented Work Records</th>
                <th className="p-3">Client-Confirmed Records</th>
                <th className="p-3">Confirmation Rate</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#E7E2D8]">
              {sortedSkills.map((s) => {
                const rate = s.total > 0 ? Math.round((s.confirmed / s.total) * 100) : 0;
                return (
                  <tr key={s.name} className="hover:bg-[#FAF8F5]/80">
                    <td className="p-3 font-bold text-[#16222F] capitalize">
                      {s.name}
                    </td>
                    <td className="p-3 font-mono font-bold text-[#16222F]">
                      {s.total}
                    </td>
                    <td className="p-3 font-mono text-[#2D4D45] font-bold">
                      {s.confirmed}
                    </td>
                    <td className="p-3">
                      <div className="flex items-center gap-2">
                        <div className="w-24 h-2 bg-stone-100 rounded-full overflow-hidden">
                          <div className="h-full bg-[#2D4D45] rounded-full" style={{ width: `${rate}%` }} />
                        </div>
                        <span className="font-mono text-[10px] text-[#7A8690]">{rate}%</span>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
