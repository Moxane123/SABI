import React, { useState } from 'react';
import {
  ShieldAlert,
  Lock,
  ArrowRight,
  ShieldCheck,
  CheckCircle2,
  AlertOctagon,
  KeyRound,
} from 'lucide-react';
import { PlatformStatusRecord } from '../../types';

interface SuspendedScreenProps {
  statusRecord: PlatformStatusRecord;
  onOpenOperationsGate: () => void;
}

export const SuspendedScreen: React.FC<SuspendedScreenProps> = ({
  statusRecord,
  onOpenOperationsGate,
}) => {
  return (
    <div className="min-h-screen bg-[#FBF9F5] flex flex-col justify-between p-6 text-[#16222F]">
      {/* Header Bar */}
      <div className="max-w-4xl mx-auto w-full flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-[#2D4D45] text-white font-serif font-black flex items-center justify-center text-base">
            S
          </div>
          <span className="font-serif font-bold text-lg tracking-tight text-[#16222F]">
            SABI
          </span>
        </div>

        <button
          onClick={onOpenOperationsGate}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-[#D5CEC2] hover:bg-stone-100 text-xs font-bold text-[#52606D] hover:text-[#16222F] transition-colors cursor-pointer"
        >
          <Lock className="w-3.5 h-3.5 text-[#2D4D45]" />
          <span>Admin Access</span>
        </button>
      </div>

      {/* Main Notice Body */}
      <div className="max-w-xl mx-auto w-full my-auto py-12 text-center space-y-6">
        <div className="w-16 h-16 rounded-2xl bg-rose-50 border border-rose-200 text-rose-700 flex items-center justify-center mx-auto shadow-xs">
          <AlertOctagon className="w-8 h-8" />
        </div>

        <div className="space-y-2">
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-rose-50 text-rose-900 border border-rose-200 text-xs font-bold tracking-wide">
            <span className="w-2 h-2 rounded-full bg-rose-600 animate-pulse" />
            PLATFORM SUSPENDED
          </span>

          <h1 className="text-3xl font-black font-serif text-[#16222F] tracking-tight">
            Sabi Operations Temporarily Suspended
          </h1>

          <p className="text-sm text-[#52606D] leading-relaxed max-w-md mx-auto">
            {statusRecord.publicNotice ||
              'Access to Sabi platform services has been suspended by system administrative controls. Please check back shortly.'}
          </p>
        </div>

        {/* Data Safety Assurance Box */}
        <div className="p-4 rounded-2xl bg-white border border-[#E7E2D8] text-left text-xs space-y-2.5 shadow-xs max-w-md mx-auto">
          <div className="flex items-center gap-2 font-bold text-[#2D4D45]">
            <ShieldCheck className="w-4 h-4 text-[#2D4D45]" />
            <span>Cryptographic Proof Guarantee</span>
          </div>
          <p className="text-[#52606D] leading-relaxed text-[11px]">
            All self-documented records, attached media evidence, and independent client confirmation attestations remain securely preserved in cold storage. No proof data is lost.
          </p>
          <div className="pt-2 border-t border-[#E7E2D8] text-[10px] text-[#7A8690] flex items-center justify-between font-mono">
            <span>Suspended: {new Date(statusRecord.changedAt).toLocaleDateString()}</span>
            <span>Auth: {statusRecord.changedBy}</span>
          </div>
        </div>

        <div className="pt-2">
          <button
            onClick={onOpenOperationsGate}
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-[#2D4D45] hover:bg-[#223B35] text-white text-xs font-bold transition-all shadow-xs cursor-pointer active:scale-95"
          >
            <KeyRound className="w-4 h-4 text-[#A8D5C8]" />
            <span>Open Sabi Operations Center</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Footer */}
      <div className="max-w-4xl mx-auto w-full text-center text-xs text-[#7A8690]">
        <p>Sabi Verification Protocol · What you can do should count.</p>
      </div>
    </div>
  );
};
