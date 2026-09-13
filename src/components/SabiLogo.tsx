import React from 'react';

interface SabiLogoProps {
  className?: string;
  size?: 'sm' | 'md' | 'lg' | 'xl' | 'hero';
  variant?: 'full' | 'icon';
  tagline?: boolean;
  theme?: 'light' | 'dark';
}

export const SabiLogo: React.FC<SabiLogoProps> = ({
  className = '',
  size = 'md',
  variant = 'full',
  tagline = false,
  theme = 'light',
}) => {
  const iconSize = {
    sm: 28,
    md: 36,
    lg: 48,
    xl: 64,
    hero: 280,
  }[size];

  const textSize = {
    sm: 'text-xl',
    md: 'text-2xl',
    lg: 'text-3xl',
    xl: 'text-4xl',
    hero: 'text-7xl',
  }[size];

  const textColor = theme === 'dark' ? 'text-white' : 'text-[#16222F]';

  return (
    <div className={`inline-flex items-center gap-2.5 select-none ${className}`}>
      {/* Authentic Sabi Brand Symbol */}
      <svg
        width={iconSize}
        height={iconSize}
        viewBox="0 0 100 100"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="shrink-0 transition-transform duration-200"
      >
        {/* Top Cupped Hand / Swirl in Deep Sage Green (#4E786F) */}
        <path
          d="M50 12C31.5 12 18 24 16 39C14.5 50.5 21 61.5 32 66C31 60 33 53.5 37.5 48.5C41.5 44 48 40.5 56 40C62 39.5 68 36.5 70 31C72 25.5 69 19.5 63 15.5C59 13 54.5 12 50 12Z"
          fill="#4D7A70"
        />
        {/* Top Hand Finger Indents / Arc Grooves */}
        <path
          d="M54 19C60 21 64 25.5 63 31.5"
          stroke="#FAF8F5"
          strokeWidth="3.2"
          strokeLinecap="round"
        />
        <path
          d="M50 26C55 28 58 31.5 57 36"
          stroke="#FAF8F5"
          strokeWidth="2.8"
          strokeLinecap="round"
        />

        {/* Bottom Cupped Hand / Swirl in Lavender Purple (#8C7CA7) */}
        <path
          d="M50 88C68.5 88 82 76 84 61C85.5 49.5 79 38.5 68 34C69 40 67 46.5 62.5 51.5C58.5 56 52 59.5 44 60C38 60.5 32 63.5 30 69C28 74.5 31 80.5 37 84.5C41 87 45.5 88 50 88Z"
          fill="#8C7CA7"
        />
        {/* Bottom Hand Finger Indents / Arc Grooves */}
        <path
          d="M46 81C40 79 36 74.5 37 68.5"
          stroke="#FAF8F5"
          strokeWidth="3.2"
          strokeLinecap="round"
        />
        <path
          d="M50 74C45 72 42 68.5 43 64"
          stroke="#FAF8F5"
          strokeWidth="2.8"
          strokeLinecap="round"
        />

        {/* Center Warm Gold / Ochre Core (#D4A359) */}
        <circle cx="50" cy="50" r="9.5" fill="#D4A359" />
      </svg>

      {/* Brand Wordmark & Optional Tagline */}
      {variant === 'full' && (
        <div className="flex flex-col">
          <div className="flex items-baseline leading-none">
            <span
              className={`font-display tracking-tight font-extrabold ${textSize} ${textColor}`}
              style={{ fontFamily: "'Bricolage Grotesque', 'Instrument Sans', sans-serif" }}
            >
              Sab
            </span>
            {/* 'i' with custom lavender dot */}
            <span
              className={`font-display tracking-tight font-extrabold ${textSize} ${textColor} relative inline-block`}
              style={{ fontFamily: "'Bricolage Grotesque', 'Instrument Sans', sans-serif" }}
            >
              ı
              {/* Lavender Dot above the dotless 'ı' */}
              <span
                className="absolute left-1/2 -top-[0.2em] -translate-x-1/2 rounded-full bg-[#8C7CA7]"
                style={{
                  width: size === 'sm' ? 4 : size === 'md' ? 5 : size === 'lg' ? 6 : size === 'xl' ? 8 : 14,
                  height: size === 'sm' ? 4 : size === 'md' ? 5 : size === 'lg' ? 6 : size === 'xl' ? 8 : 14,
                }}
              />
            </span>
          </div>

          {tagline && (
            <p className="text-[10px] text-[#556965] font-medium tracking-wide mt-0.5">
              What you can do should count.
            </p>
          )}
        </div>
      )}
    </div>
  );
};
