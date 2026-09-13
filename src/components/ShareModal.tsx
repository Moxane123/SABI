import React, { useState, useEffect } from 'react';
import { X, Copy, Check, ExternalLink, ShieldCheck, QrCode, Share2, Download } from 'lucide-react';
import QRCode from 'qrcode';
import { UserProfile } from '../types';

interface ShareModalProps {
  isOpen: boolean;
  onClose: () => void;
  user: UserProfile;
}

export const ShareModal: React.FC<ShareModalProps> = ({ isOpen, onClose, user }) => {
  if (!isOpen) return null;

  const [copied, setCopied] = useState(false);
  const [qrUrl, setQrUrl] = useState<string>('');
  const profileUrl = `${window.location.origin}${window.location.pathname}?u=${user.username}`;

  useEffect(() => {
    QRCode.toDataURL(profileUrl, {
      width: 240,
      margin: 2,
      color: {
        dark: '#1F2421',
        light: '#FFFFFF',
      },
    })
      .then((url) => setQrUrl(url))
      .catch((err) => console.error('Error generating QR code:', err));
  }, [profileUrl]);

  const handleCopy = () => {
    navigator.clipboard.writeText(profileUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleNativeShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: `${user.fullName} — Professional Proof Profile`,
          text: `Explore documented work, evidence, and client confirmations for ${user.fullName} on SABI.`,
          url: profileUrl,
        });
      } catch {
        // User cancelled or share dismissed
      }
    } else {
      handleCopy();
    }
  };

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
            className="p-1 text-stone-400 hover:text-stone-700 rounded-lg transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6 text-center space-y-4">
          <div className="w-44 h-44 mx-auto p-2 bg-white rounded-2xl border border-stone-200 shadow-xs flex items-center justify-center">
            {qrUrl ? (
              <img
                src={qrUrl}
                alt="Profile QR code"
                className="w-full h-full object-contain"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center text-stone-400 text-xs font-mono">
                Generating QR...
              </div>
            )}
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
                className="px-3 py-2 bg-stone-900 hover:bg-stone-800 text-stone-100 rounded-xl text-xs font-semibold flex items-center gap-1 shrink-0 transition-colors cursor-pointer"
              >
                {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copied ? 'Copied' : 'Copy'}</span>
              </button>
            </div>
          </div>

          <div className="flex items-center gap-2 pt-1">
            {qrUrl && (
              <a
                href={qrUrl}
                download={`${user.username || 'sabi'}-proof-qr.png`}
                className="flex-1 py-2 px-3 bg-stone-100 hover:bg-stone-200 text-stone-800 text-xs font-semibold rounded-xl flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
              >
                <Download className="w-3.5 h-3.5" />
                <span>Save QR Code</span>
              </a>
            )}

            {typeof navigator !== 'undefined' && 'share' in navigator && (
              <button
                onClick={handleNativeShare}
                className="flex-1 py-2 px-3 bg-[#4D7A70] hover:bg-[#3D635B] text-white text-xs font-semibold rounded-xl flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
              >
                <Share2 className="w-3.5 h-3.5" />
                <span>Share Link</span>
              </button>
            )}
          </div>

          <p className="text-[11px] text-stone-500 text-left leading-relaxed">
            Anyone with this link can view your completed work, examine photo/document evidence, and read client confirmations without needing to log in. Private records remain hidden.
          </p>

          <div className="pt-2">
            <button
              onClick={onClose}
              className="w-full py-2.5 bg-stone-100 hover:bg-stone-200 text-stone-800 font-semibold text-xs rounded-xl transition-colors cursor-pointer"
            >
              Done
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
