import React, { useState } from 'react';
import { X, User, Mail, ArrowRight, Loader2 } from 'lucide-react';
import { auth } from '../services/auth';
import { UserProfile } from '../types';
import { SabiLogo } from './SabiLogo';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  onLoginSuccess: (user: UserProfile, isNewSignup?: boolean) => void;
  customTitle?: string;
  customSubtitle?: string;
}

export const AuthModal: React.FC<AuthModalProps> = ({
  isOpen,
  onClose,
  onLoginSuccess,
  customTitle,
  customSubtitle,
}) => {
  if (!isOpen) return null;

  const [mode, setMode] = useState<'signup' | 'login'>('signup');
  const [error, setError] = useState<string | null>(null);
  const [isGoogleLoading, setIsGoogleLoading] = useState<boolean>(false);

  // Sign up minimal fields
  const [fullName, setFullName] = useState('');
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');

  // Login field
  const [loginIdentifier, setLoginIdentifier] = useState('');

  // Standard "Continue with Google" via Firebase Managed Authentication
  const handleGoogleSignIn = async () => {
    setError(null);
    setIsGoogleLoading(true);
    try {
      const { user, isNewUser } = await auth.signInWithGoogle();
      onLoginSuccess(user, isNewUser);
      onClose();
    } catch (err: any) {
      console.error('Google Sign In Error:', err);
      setError(err.message || 'Unable to complete Google sign-in. Please try again.');
    } finally {
      setIsGoogleLoading(false);
    }
  };

  const handleSignup = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!fullName.trim() || !username.trim() || !email.trim()) {
      setError('Please provide your name, username, and email to continue.');
      return;
    }

    try {
      const newUser = auth.signUp({
        fullName: fullName.trim(),
        username: username.trim(),
        email: email.trim(),
        profession: '',
        location: '',
        shortBio: '',
        skills: [],
        yearsOfExperience: 1,
      });

      // Pass flag indicating this is a brand new sign up
      onLoginSuccess(newUser, true);
      onClose();
    } catch (err: any) {
      setError(err.message || 'Error creating account. Please try again.');
    }
  };

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!loginIdentifier.trim()) {
      setError('Please enter your email or username.');
      return;
    }

    const matchedUser = auth.login(loginIdentifier);
    if (matchedUser) {
      onLoginSuccess(matchedUser, false);
      onClose();
    } else {
      setError('No account found matching that email or username.');
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-[#16222F]/75 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4 animate-in fade-in">
      <div className="bg-[#FAF8F5] rounded-3xl border border-[#E7E2D8] shadow-2xl max-w-md w-full overflow-hidden text-[#16222F]">
        {/* Header with Brand Logo */}
        <div className="bg-[#2D4D45] p-6 text-white relative">
          <div className="flex items-center justify-between mb-3">
            <SabiLogo size="sm" variant="full" theme="dark" />
            <button
              onClick={onClose}
              className="p-1 text-[#A8C7BC] hover:text-white rounded-lg transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          <h2 className="text-xl font-bold font-serif text-white">
            {customTitle || (mode === 'signup' ? 'Create Your Proof Identity' : 'Welcome Back to SABI')}
          </h2>
          <p className="text-xs text-[#CFE2D9] mt-1">
            {customSubtitle ||
              (mode === 'signup'
                ? 'Start documenting real completed work. What you can do should count.'
                : 'Sign in to access your documented work records and proof.')}
          </p>
        </div>

        {/* Tab switch */}
        <div className="grid grid-cols-2 border-b border-[#EAE6DE] bg-white text-xs font-semibold text-[#5A6872]">
          <button
            type="button"
            onClick={() => {
              setMode('signup');
              setError(null);
            }}
            className={`py-3 border-b-2 transition-all cursor-pointer ${
              mode === 'signup'
                ? 'border-[#4D7A70] text-[#2D4D45] bg-[#FAF8F5] font-bold'
                : 'border-transparent hover:text-[#16222F]'
            }`}
          >
            Create New Profile
          </button>
          <button
            type="button"
            onClick={() => {
              setMode('login');
              setError(null);
            }}
            className={`py-3 border-b-2 transition-all cursor-pointer ${
              mode === 'login'
                ? 'border-[#4D7A70] text-[#2D4D45] bg-[#FAF8F5] font-bold'
                : 'border-transparent hover:text-[#16222F]'
            }`}
          >
            Sign In Existing
          </button>
        </div>

        {/* Form Body */}
        <div className="p-6 space-y-4">
          {error && (
            <div className="p-3 rounded-xl bg-red-50 text-red-700 text-xs border border-red-200">
              {error}
            </div>
          )}

          {/* STANDARD "CONTINUE WITH GOOGLE" BUTTON (MANAGED FIREBASE AUTH) */}
          <div>
            <button
              type="button"
              disabled={isGoogleLoading}
              onClick={handleGoogleSignIn}
              className="w-full py-3 px-4 bg-white hover:bg-stone-50 border border-[#D5CEC2] hover:border-[#16222F] text-[#16222F] font-semibold text-sm rounded-xl shadow-xs transition-all flex items-center justify-center gap-3 cursor-pointer disabled:opacity-60 disabled:cursor-not-allowed group active:scale-[0.99]"
            >
              {isGoogleLoading ? (
                <Loader2 className="w-5 h-5 text-[#4D7A70] animate-spin" />
              ) : (
                <svg className="w-5 h-5 shrink-0" viewBox="0 0 24 24">
                  <path
                    fill="#4285F4"
                    d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                  />
                  <path
                    fill="#34A853"
                    d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                  />
                  <path
                    fill="#FBBC05"
                    d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
                  />
                  <path
                    fill="#EA4335"
                    d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
                  />
                </svg>
              )}
              <span>
                {isGoogleLoading
                  ? 'Connecting to Google...'
                  : 'Continue with Google'}
              </span>
            </button>
            <p className="text-[11px] text-[#7A8690] text-center mt-1.5">
              Instant sign-in powered by Firebase Authentication
            </p>
          </div>

          {/* Divider */}
          <div className="relative flex items-center justify-center my-2">
            <div className="border-t border-[#E7E2D8] w-full" />
            <span className="bg-[#FAF8F5] px-3 text-[11px] font-bold uppercase tracking-wider text-[#7A8690] absolute">
              or with username / email
            </span>
          </div>

          {mode === 'signup' ? (
            <form onSubmit={handleSignup} className="space-y-4">
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-[#4D7A70] mb-1">
                  Full Name
                </label>
                <div className="relative">
                  <User className="w-4 h-4 text-[#8C7CA7] absolute left-3.5 top-3.5" />
                  <input
                    type="text"
                    required
                    value={fullName}
                    onChange={(e) => {
                      setFullName(e.target.value);
                      if (!username) {
                        setUsername(
                          e.target.value
                            .toLowerCase()
                            .replace(/\s+/g, '-')
                            .replace(/[^a-z0-9-]/g, '')
                        );
                      }
                    }}
                    placeholder="e.g. Your Full Name"
                    className="w-full pl-10 pr-4 py-3 bg-white border border-[#D5CEC2] focus:border-[#4D7A70] focus:ring-1 focus:ring-[#4D7A70] rounded-xl text-sm font-medium text-[#16222F] outline-none shadow-2xs"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-[#4D7A70] mb-1">
                  Unique Username / URL Slug
                </label>
                <div className="flex items-center">
                  <span className="px-3 py-3 bg-[#EAE6DE] border border-r-0 border-[#D5CEC2] rounded-l-xl text-xs font-mono text-[#5A6872]">
                    sabi.proof/
                  </span>
                  <input
                    type="text"
                    required
                    value={username}
                    onChange={(e) => setUsername(e.target.value.toLowerCase().replace(/[^a-z0-9-_]/g, ''))}
                    placeholder="your-handle"
                    className="w-full px-3 py-3 bg-white border border-[#D5CEC2] focus:border-[#4D7A70] focus:ring-1 focus:ring-[#4D7A70] rounded-r-xl text-sm font-medium text-[#16222F] outline-none shadow-2xs font-mono"
                  />
                </div>
                <p className="text-[11px] text-[#7A8690] mt-1">
                  This will be your shareable professional proof link.
                </p>
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-[#4D7A70] mb-1">
                  Email Address
                </label>
                <div className="relative">
                  <Mail className="w-4 h-4 text-[#8C7CA7] absolute left-3.5 top-3.5" />
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="name@example.com"
                    className="w-full pl-10 pr-4 py-3 bg-white border border-[#D5CEC2] focus:border-[#4D7A70] focus:ring-1 focus:ring-[#4D7A70] rounded-xl text-sm font-medium text-[#16222F] outline-none shadow-2xs"
                  />
                </div>
              </div>

              <div className="pt-2">
                <button
                  type="submit"
                  className="w-full py-3.5 rounded-2xl bg-[#4D7A70] hover:bg-[#2D4D45] text-white font-bold text-sm shadow-xs transition-all flex items-center justify-center gap-2 cursor-pointer"
                >
                  <span>Continue to Setup Profile</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </form>
          ) : (
            <form onSubmit={handleLogin} className="space-y-4">
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-[#4D7A70] mb-1">
                  Email or Username
                </label>
                <input
                  type="text"
                  required
                  value={loginIdentifier}
                  onChange={(e) => setLoginIdentifier(e.target.value)}
                  placeholder="e.g. name@example.com or username"
                  className="w-full px-4 py-3 bg-white border border-[#D5CEC2] focus:border-[#4D7A70] focus:ring-1 focus:ring-[#4D7A70] rounded-xl text-sm font-medium text-[#16222F] outline-none shadow-2xs"
                />
              </div>

              <div className="pt-2">
                <button
                  type="submit"
                  className="w-full py-3.5 rounded-2xl bg-[#2D4D45] hover:bg-[#203731] text-white font-bold text-sm shadow-xs transition-all cursor-pointer"
                >
                  Sign In to Sabi
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};
