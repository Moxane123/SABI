import React, { useState } from 'react';
import {
  ShieldCheck,
  ArrowRight,
  Loader2,
  Lock,
  FileCheck2,
  Fingerprint,
  Sparkles,
  ChevronLeft,
} from 'lucide-react';
import { SabiLogo } from './SabiLogo';
import { auth } from '../services/auth';
import { UserProfile } from '../types';

interface LandingPageViewProps {
  onLoginSuccess: (user: UserProfile, isNewSignup?: boolean) => void;
  onExploreGuest: () => void;
  onOpenOperations?: () => void;
}

export const LandingPageView: React.FC<LandingPageViewProps> = ({
  onLoginSuccess,
  onExploreGuest,
  onOpenOperations,
}) => {
  const [isGoogleLoading, setIsGoogleLoading] = useState(false);
  const [inlineMode, setInlineMode] = useState<'none' | 'signup' | 'login'>('none');
  const [error, setError] = useState<string | null>(null);

  // Form states
  const [fullName, setFullName] = useState('');
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [loginIdentifier, setLoginIdentifier] = useState('');

  // Google Sign In (Firebase Managed Auth)
  const handleGoogleSignIn = async () => {
    setError(null);
    setIsGoogleLoading(true);
    try {
      const { user, isNewUser } = await auth.signInWithGoogle();
      onLoginSuccess(user, isNewUser);
    } catch (err: any) {
      console.error('Google Sign In Error:', err);
      setError(err.message || 'Unable to complete Google sign-in. Please try again.');
    } finally {
      setIsGoogleLoading(false);
    }
  };

  const handleSignupSubmit = (e: React.FormEvent) => {
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

      onLoginSuccess(newUser, true);
    } catch (err: any) {
      setError(err.message || 'Error creating account. Please try again.');
    }
  };

  const handleLoginSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!loginIdentifier.trim()) {
      setError('Please enter your email or username.');
      return;
    }

    const matchedUser = auth.login(loginIdentifier);
    if (matchedUser) {
      onLoginSuccess(matchedUser, false);
    } else {
      setError('No account found matching that email or username.');
    }
  };

  return (
    <div className="min-h-screen flex flex-col justify-between bg-[#FAF8F5] text-[#16222F]">
      {/* Main Split Section: X/Twitter style hero layout tailored for SABI */}
      <div className="flex-1 grid grid-cols-1 lg:grid-cols-12 min-h-[calc(100vh-60px)]">
        {/* Left Column: Atmospheric Brand Identity & Massive Symbol */}
        <div className="hidden lg:flex lg:col-span-6 xl:col-span-7 bg-[#152722] text-white relative overflow-hidden flex-col justify-between p-12 xl:p-16 select-none border-r border-[#20362F]">
          {/* Subtle fintech ledger background texture */}
          <div
            className="absolute inset-0 opacity-[0.04] pointer-events-none"
            style={{
              backgroundImage: `radial-gradient(#ffffff 1px, transparent 1px)`,
              backgroundSize: '24px 24px',
            }}
          />

          {/* Ambient soft glow */}
          <div className="absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-[#4D7A70]/20 rounded-full blur-3xl pointer-events-none" />

          {/* Top subtle brand pill */}
          <div className="relative z-10">
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#20362F]/80 border border-[#2D4D43] text-xs font-semibold text-[#A3C8BE] tracking-wide">
              <ShieldCheck className="w-3.5 h-3.5 text-[#4D7A70]" />
              <span>THE EVIDENCE-FIRST PROFESSIONAL LEDGER</span>
            </div>
          </div>

          {/* Center: Massive Iconic Sabi Brand Mark */}
          <div className="relative z-10 my-auto flex flex-col items-center justify-center text-center">
            <div className="transform hover:scale-[1.02] transition-transform duration-500 cursor-default">
              <SabiLogo size="hero" variant="icon" />
            </div>
            <div className="mt-8 max-w-md">
              <h2 className="text-2xl xl:text-3xl font-display font-bold tracking-tight text-white/95">
                What you can do should count.
              </h2>
              <p className="text-sm xl:text-base text-[#A1B8B1] mt-2.5 leading-relaxed">
                A clean, tamper-evident record of documented work deliverables, verified trade skills, and authenticated client confirmations.
              </p>
            </div>
          </div>

          {/* Bottom Trust Indicators */}
          <div className="relative z-10 flex items-center justify-between border-t border-[#233C34] pt-6 text-xs text-[#829E96]">
            <div className="flex items-center gap-2">
              <Lock className="w-3.5 h-3.5 text-[#A1B8B1]" />
              <span>Cryptographic Proof Hashes</span>
            </div>
            <div className="flex items-center gap-2">
              <Fingerprint className="w-3.5 h-3.5 text-[#A1B8B1]" />
              <span>One-Click Verification</span>
            </div>
            <div className="flex items-center gap-2">
              <FileCheck2 className="w-3.5 h-3.5 text-[#A1B8B1]" />
              <span>No Formulated Metrics</span>
            </div>
          </div>
        </div>

        {/* Right Column: High-Impact Action & Authentication Stage */}
        <div className="col-span-1 lg:col-span-6 xl:col-span-5 flex flex-col justify-center px-6 sm:px-12 md:px-16 xl:px-20 py-12 lg:py-16">
          <div className="w-full max-w-[420px] mx-auto lg:mx-0">
            {/* Sabi Brand Header */}
            <div className="mb-8 lg:mb-12">
              <SabiLogo size="lg" variant="full" tagline={false} />
            </div>

            {/* Giant Bold Headline */}
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-display font-extrabold tracking-tight text-[#16222F] leading-[1.05]">
              Proof over promises.
            </h1>

            <h2 className="text-2xl sm:text-3xl font-display font-bold text-[#16222F] mt-6 lg:mt-8 tracking-tight">
              Join today.
            </h2>

            {/* Error Message */}
            {error && (
              <div className="mt-4 p-3.5 rounded-xl bg-red-50 border border-red-200 text-red-700 text-xs font-medium leading-relaxed animate-in fade-in">
                {error}
              </div>
            )}

            {/* DEFAULT VIEW: Google Auth + Create Account Button */}
            {inlineMode === 'none' && (
              <div className="mt-8 space-y-4">
                {/* PRIMARY ACTION: Sign in with Google (Firebase Managed Auth) */}
                <button
                  type="button"
                  id="landing-google-btn"
                  disabled={isGoogleLoading}
                  onClick={handleGoogleSignIn}
                  className="w-full h-12 px-5 bg-white hover:bg-stone-50 border border-[#D5CEC2] hover:border-[#16222F] text-[#16222F] font-semibold text-sm rounded-full shadow-xs transition-all flex items-center justify-center gap-3 cursor-pointer disabled:opacity-60 disabled:cursor-not-allowed group active:scale-[0.99]"
                >
                  {isGoogleLoading ? (
                    <Loader2 className="w-4 h-4 text-[#4D7A70] animate-spin" />
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
                  <span>{isGoogleLoading ? 'Connecting...' : 'Sign in with Google'}</span>
                </button>

                {/* Divider */}
                <div className="relative flex items-center justify-center my-4">
                  <div className="w-full border-t border-[#E5E0D6]" />
                  <span className="absolute px-3 bg-[#FAF8F5] text-xs uppercase tracking-wider text-[#768480] font-medium">
                    or
                  </span>
                </div>

                {/* Secondary Action: Create Account Button */}
                <button
                  type="button"
                  id="landing-create-btn"
                  onClick={() => {
                    setError(null);
                    setInlineMode('signup');
                  }}
                  className="w-full h-12 px-5 bg-[#2D4D45] hover:bg-[#233E37] text-white font-bold text-sm rounded-full shadow-sm transition-all flex items-center justify-center gap-2 cursor-pointer active:scale-[0.99]"
                >
                  <span>Create account</span>
                </button>

                {/* Legal & Standards Disclaimer */}
                <p className="text-[11px] text-[#71807C] leading-relaxed pt-1">
                  By signing up, you agree to the{' '}
                  <span className="text-[#2D4D45] hover:underline cursor-pointer">Terms of Service</span> and{' '}
                  <span className="text-[#2D4D45] hover:underline cursor-pointer">Privacy Policy</span>, including{' '}
                  <span className="text-[#2D4D45] hover:underline cursor-pointer">Proof Verification standards</span>.
                </p>

                {/* Already have an account Section */}
                <div className="pt-10 lg:pt-12">
                  <h3 className="text-base font-bold text-[#16222F] mb-3.5">
                    Already have an account?
                  </h3>
                  <button
                    type="button"
                    id="landing-signin-btn"
                    onClick={() => {
                      setError(null);
                      setInlineMode('login');
                    }}
                    className="w-full h-12 px-5 bg-transparent hover:bg-[#4D7A70]/8 border border-[#4D7A70]/60 text-[#2D4D45] font-bold text-sm rounded-full transition-all flex items-center justify-center gap-2 cursor-pointer active:scale-[0.99]"
                  >
                    <span>Sign in</span>
                  </button>
                </div>

                {/* Guest exploration option */}
                <div className="pt-6 text-center">
                  <button
                    type="button"
                    id="landing-guest-explore-btn"
                    onClick={onExploreGuest}
                    className="text-xs font-semibold text-[#5A6D67] hover:text-[#2D4D45] transition-colors inline-flex items-center gap-1.5 cursor-pointer group"
                  >
                    <span>Browse verified proof directory without an account</span>
                    <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
                  </button>
                </div>
              </div>
            )}

            {/* INLINE SIGN UP FORM */}
            {inlineMode === 'signup' && (
              <form onSubmit={handleSignupSubmit} className="mt-6 space-y-4 animate-in fade-in">
                <div className="flex items-center justify-between pb-2 border-b border-[#EAE5DC]">
                  <h3 className="text-lg font-bold font-display text-[#16222F]">
                    Create your account
                  </h3>
                  <button
                    type="button"
                    onClick={() => setInlineMode('none')}
                    className="text-xs font-semibold text-[#5A6D67] hover:text-[#16222F] inline-flex items-center gap-1 cursor-pointer"
                  >
                    <ChevronLeft className="w-3.5 h-3.5" />
                    <span>Back</span>
                  </button>
                </div>

                <div>
                  <label className="block text-xs font-bold text-[#2A3B37] uppercase tracking-wider mb-1.5">
                    Full Name
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Elena Rostova"
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    className="w-full h-11 px-3.5 bg-white border border-[#D5CEC2] rounded-xl text-sm text-[#16222F] placeholder-[#9E9B95] focus:outline-none focus:border-[#4D7A70] focus:ring-1 focus:ring-[#4D7A70]"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-[#2A3B37] uppercase tracking-wider mb-1.5">
                    Email Address
                  </label>
                  <input
                    type="email"
                    required
                    placeholder="name@domain.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full h-11 px-3.5 bg-white border border-[#D5CEC2] rounded-xl text-sm text-[#16222F] placeholder-[#9E9B95] focus:outline-none focus:border-[#4D7A70] focus:ring-1 focus:ring-[#4D7A70]"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-[#2A3B37] uppercase tracking-wider mb-1.5">
                    Username (Profile URL Slug)
                  </label>
                  <div className="relative">
                    <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-xs font-medium text-[#7D8F8A]">
                      sabi.app/
                    </span>
                    <input
                      type="text"
                      required
                      placeholder="username"
                      value={username}
                      onChange={(e) => setUsername(e.target.value)}
                      className="w-full h-11 pl-20 pr-3.5 bg-white border border-[#D5CEC2] rounded-xl text-sm text-[#16222F] placeholder-[#9E9B95] focus:outline-none focus:border-[#4D7A70] focus:ring-1 focus:ring-[#4D7A70]"
                    />
                  </div>
                </div>

                <div className="pt-2">
                  <button
                    type="submit"
                    className="w-full h-12 bg-[#2D4D45] hover:bg-[#233E37] text-white font-bold text-sm rounded-full shadow-sm transition-all flex items-center justify-center gap-2 cursor-pointer active:scale-[0.99]"
                  >
                    <span>Agree & Create Account</span>
                    <ArrowRight className="w-4 h-4" />
                  </button>
                </div>

                <div className="text-center pt-2">
                  <button
                    type="button"
                    onClick={() => setInlineMode('login')}
                    className="text-xs text-[#5A6D67] hover:text-[#2D4D45] font-semibold cursor-pointer"
                  >
                    Already have an account? Sign in
                  </button>
                </div>
              </form>
            )}

            {/* INLINE SIGN IN FORM */}
            {inlineMode === 'login' && (
              <form onSubmit={handleLoginSubmit} className="mt-6 space-y-4 animate-in fade-in">
                <div className="flex items-center justify-between pb-2 border-b border-[#EAE5DC]">
                  <h3 className="text-lg font-bold font-display text-[#16222F]">
                    Sign in to SABI
                  </h3>
                  <button
                    type="button"
                    onClick={() => setInlineMode('none')}
                    className="text-xs font-semibold text-[#5A6D67] hover:text-[#16222F] inline-flex items-center gap-1 cursor-pointer"
                  >
                    <ChevronLeft className="w-3.5 h-3.5" />
                    <span>Back</span>
                  </button>
                </div>

                <div>
                  <label className="block text-xs font-bold text-[#2A3B37] uppercase tracking-wider mb-1.5">
                    Email or Username
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="Enter your email or username"
                    value={loginIdentifier}
                    onChange={(e) => setLoginIdentifier(e.target.value)}
                    className="w-full h-11 px-3.5 bg-white border border-[#D5CEC2] rounded-xl text-sm text-[#16222F] placeholder-[#9E9B95] focus:outline-none focus:border-[#4D7A70] focus:ring-1 focus:ring-[#4D7A70]"
                  />
                </div>

                <div className="pt-2">
                  <button
                    type="submit"
                    className="w-full h-12 bg-[#2D4D45] hover:bg-[#233E37] text-white font-bold text-sm rounded-full shadow-sm transition-all flex items-center justify-center gap-2 cursor-pointer active:scale-[0.99]"
                  >
                    <span>Sign In</span>
                    <ArrowRight className="w-4 h-4" />
                  </button>
                </div>

                <div className="text-center pt-2">
                  <button
                    type="button"
                    onClick={() => setInlineMode('signup')}
                    className="text-xs text-[#5A6D67] hover:text-[#2D4D45] font-semibold cursor-pointer"
                  >
                    Don't have an account yet? Create one
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      </div>

      {/* Footer Navigation: X-Style minimal horizontal legal links */}
      <footer className="w-full py-5 px-6 border-t border-[#E7E2D8] bg-[#FAF8F5] text-xs text-[#7B8B87]">
        <div className="max-w-7xl mx-auto flex flex-wrap items-center justify-center gap-x-6 gap-y-2 text-center">
          <button
            onClick={onExploreGuest}
            className="hover:text-[#16222F] transition-colors cursor-pointer"
          >
            Proof Directory
          </button>
          <span className="hover:text-[#16222F] transition-colors cursor-pointer">
            About SABI
          </span>
          <span className="hover:text-[#16222F] transition-colors cursor-pointer">
            Proof Ledger Protocol
          </span>
          <span className="hover:text-[#16222F] transition-colors cursor-pointer">
            Client Confirmation Standards
          </span>
          <span className="hover:text-[#16222F] transition-colors cursor-pointer">
            Verification Rules
          </span>
          <span className="hover:text-[#16222F] transition-colors cursor-pointer">
            Privacy Policy
          </span>
          <span className="hover:text-[#16222F] transition-colors cursor-pointer">
            Terms of Service
          </span>
          <span className="hover:text-[#16222F] transition-colors cursor-pointer">
            Integrity Status
          </span>
          {onOpenOperations && (
            <button
              onClick={onOpenOperations}
              className="text-[#2D4D45] hover:text-[#16222F] font-semibold transition-colors cursor-pointer flex items-center gap-1"
            >
              <span>Operations Center</span>
            </button>
          )}
          <span className="text-[#99A8A4]">
            © {new Date().getFullYear()} SABI Technologies Inc.
          </span>
        </div>
      </footer>
    </div>
  );
};
