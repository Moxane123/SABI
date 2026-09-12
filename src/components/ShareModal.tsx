import React, { useState } from 'react';
import { X, Copy, Check, ExternalLink, ShieldCheck, QrCode } from 'lucide-react';
import { UserProfile } from '../types';

interface ShareModalProps {
  isOpen: boolean;
  onClose: () => void;
  user: UserProfile;
}

export const ShareModal: React.FC<ShareModalProps> = ({ isOpen, onClose, user }) => {
  if (!isOpen) return null;

  const [copied, setCopied] = useState(false);
  const profileUrl = `${window.location.origin}${window.location.pathname}?u=${user.username}`;

  const handleCopy = () => {
    navigator.clipboard.writeText(profileUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  // Generate a clean QR code using Google chart API for clean visual sharing
  const qrUrl = `https://api.qrserver.com/v1/create-qr-code/?size=180x180&data=${encodeURIComponent(
    profileUrl
  )}`;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-stone-950/70 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in">
      <div className="bg-white rounded-3xl border border-stone-200 shadow-2xl max-w-sm w-full overflow-hidden text-stone-900">
        <div className="px-6 py-4 border-b border-stone-200 flex items-center justify-between bg-stone-50">
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 text-amber-600" />
            <h3 className="text-sm font-bold text-stone-900">
              Share Professional Proof ID
            </h3>
          </div>
          <button
            onClick={onClose}
            className="p-1 text-stone-400 hover:text-stone-700 rounded-lg"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6 text-center space-y-4">
          <div className="w-36 h-36 mx-auto p-2 bg-white rounded-2xl border border-stone-200 shadow-xs flex items-center justify-center">
            <img
              src={qrUrl}
              alt="Profile QR code"
              className="w-full h-full object-contain"
            />
          </div>

          <div>
            <h4 className="font-bold text-sm text-stone-900">{user.fullName}</h4>
            <p className="text-xs text-stone-500">{user.profession}</p>
          </div>

          <div>
            <label className="block text-[11px] font-semibold text-stone-700 text-left mb-1">
              Public Proof URL
            </label>
            <div className="flex items-center gap-1.5">
              <input
                type="text"
                readOnly
                value={profileUrl}
                className="flex-1 px-3 py-2 text-xs font-mono bg-stone-50 border border-stone-300 rounded-xl text-stone-700 truncate"
              />
              <button
                onClick={handleCopy}
                className="px-3 py-2 bg-stone-900 hover:bg-stone-800 text-stone-100 rounded-xl text-xs font-semibold flex items-center gap-1 shrink-0"
              >
                {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copied ? 'Copied' : 'Copy'}</span>
              </button>
            </div>
          </div>

          <p className="text-[11px] text-stone-500 text-left">
            Anyone with this link can view your completed work, examine photo/video evidence, and read client confirmations without needing to log in.
          </p>

          <div className="pt-2">
            <button
              onClick={onClose}
              className="w-full py-2.5 bg-stone-100 hover:bg-stone-200 text-stone-800 font-semibold text-xs rounded-xl"
            >
              Done
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
