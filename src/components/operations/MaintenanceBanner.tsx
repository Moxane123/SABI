import React from 'react';
import { AlertTriangle, ArrowRight, Wrench } from 'lucide-react';
import { PlatformStatusRecord } from '../../types';

interface MaintenanceBannerProps {
  statusRecord: PlatformStatusRecord;
  onOpenOperations: () => void;
}

export const MaintenanceBanner: React.FC<MaintenanceBannerProps> = ({
  statusRecord,
  onOpenOperations,
}) => {
  return (
    <aside
      aria-label="System maintenance notice"
      className="bg-amber-500 text-amber-950 px-4 py-2.5 text-xs border-b border-amber-600/40 relative z-40"
    >
      <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-2">
        <div className="flex items-center gap-2 text-center sm:text-left">
          <Wrench className="w-4 h-4 shrink-0 text-amber-950 animate-pulse" />
          <p className="font-medium">
            <span className="font-bold uppercase tracking-wider text-[11px] mr-1.5 bg-amber-600/30 px-1.5 py-0.5 rounded">
              Maintenance Mode
            </span>
            <span>
              {statusRecord.publicNotice || 'Sabi is currently undergoing scheduled platform optimization. Read-only mode active.'}
            </span>
          </p>
        </div>

        <button
          onClick={onOpenOperations}
          className="inline-flex items-center gap-1 text-[11px] font-bold bg-amber-950 text-amber-50 hover:bg-black px-2.5 py-1 rounded-lg transition-colors cursor-pointer shrink-0"
        >
          <span>Operations Center</span>
          <ArrowRight className="w-3 h-3" />
        </button>
      </div>
    </aside>
  );
};
