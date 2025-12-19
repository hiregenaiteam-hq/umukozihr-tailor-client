import React from 'react';
import Image from 'next/image';

interface LogoProps {
  size?: 'sm' | 'md' | 'lg';
  showText?: boolean;
  className?: string;
}

/**
 * UmukoziHR Tailor Logo Component
 * - Circular logo image
 * - "UmukoziHR" text
 * - "Tailor" in gold below
 */
export default function Logo({ size = 'md', showText = true, className = '' }: LogoProps) {
  const sizes = {
    sm: {
      container: 'w-8 h-8',
      image: 32,
      title: 'text-sm',
      subtitle: 'text-[10px]'
    },
    md: {
      container: 'w-10 h-10',
      image: 40,
      title: 'text-base',
      subtitle: 'text-xs'
    },
    lg: {
      container: 'w-12 h-12',
      image: 48,
      title: 'text-xl',
      subtitle: 'text-sm'
    }
  };

  const s = sizes[size];

  return (
    <div className={`flex items-center gap-3 ${className}`}>
      {/* Circular Logo Container */}
      <div className={`relative ${s.container} rounded-full overflow-hidden bg-white shadow-lg shadow-orange-500/20 ring-2 ring-orange-500/30 flex-shrink-0`}>
        <Image
          src="/media/umukozi-logo.png"
          alt="UmukoziHR Logo"
          width={s.image}
          height={s.image}
          className="object-cover"
          priority
        />
      </div>

      {/* Text */}
      {showText && (
        <div className="flex flex-col">
          <span className={`font-bold text-white ${s.title} leading-tight`}>
            UmukoziHR
          </span>
          <span className={`font-semibold text-amber-400 ${s.subtitle} leading-tight tracking-wide`}>
            Tailor
          </span>
        </div>
      )}
    </div>
  );
}

/**
 * Logo for headers with responsive text hiding
 */
export function HeaderLogo({ size = 'md', className = '' }: Omit<LogoProps, 'showText'>) {
  const sizes = {
    sm: {
      container: 'w-8 h-8 sm:w-9 sm:h-9',
      image: 36,
      title: 'text-sm sm:text-base',
      subtitle: 'text-[10px] sm:text-xs'
    },
    md: {
      container: 'w-9 h-9 sm:w-10 sm:h-10',
      image: 40,
      title: 'text-base sm:text-lg',
      subtitle: 'text-xs'
    },
    lg: {
      container: 'w-10 h-10 sm:w-12 sm:h-12',
      image: 48,
      title: 'text-lg sm:text-xl',
      subtitle: 'text-xs sm:text-sm'
    }
  };

  const s = sizes[size];

  return (
    <div className={`flex items-center gap-2 sm:gap-3 ${className}`}>
      {/* Circular Logo Container */}
      <div className={`relative ${s.container} rounded-full overflow-hidden bg-white shadow-lg shadow-orange-500/20 ring-2 ring-orange-500/30 flex-shrink-0`}>
        <Image
          src="/media/umukozi-logo.png"
          alt="UmukoziHR Logo"
          width={s.image}
          height={s.image}
          className="object-cover w-full h-full"
          priority
        />
      </div>

      {/* Text - hidden on very small screens */}
      <div className="hidden xs:flex flex-col">
        <span className={`font-bold text-white ${s.title} leading-tight`}>
          UmukoziHR
        </span>
        <span className={`font-semibold text-amber-400 ${s.subtitle} leading-tight tracking-wide`}>
          Tailor
        </span>
      </div>
    </div>
  );
}

/**
 * Large hero logo for landing page
 */
export function HeroLogo({ className = '' }: { className?: string }) {
  return (
    <div className={`flex items-center gap-4 ${className}`}>
      {/* Circular Logo with glow */}
      <div className="relative">
        <div className="absolute inset-0 bg-orange-500/30 rounded-full blur-lg" />
        <div className="relative w-12 h-12 rounded-full overflow-hidden bg-white shadow-lg shadow-orange-500/30 ring-2 ring-orange-500/40">
          <Image
            src="/media/umukozi-logo.png"
            alt="UmukoziHR Logo"
            width={48}
            height={48}
            className="object-cover w-full h-full"
            priority
          />
        </div>
      </div>

      {/* Text */}
      <div className="flex flex-col">
        <span className="text-xl font-bold text-white leading-tight">
          UmukoziHR
        </span>
        <span className="text-sm font-semibold text-amber-400 leading-tight tracking-wide">
          Tailor
        </span>
      </div>
    </div>
  );
}
