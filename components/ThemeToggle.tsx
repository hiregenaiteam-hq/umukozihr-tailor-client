import React from 'react';
import { Moon, Sun, Sparkles } from 'lucide-react';
import { useTheme } from '@/contexts/ThemeContext';

export default function ThemeToggle() {
  const { theme, toggleTheme } = useTheme();

  return (
    <button
      onClick={toggleTheme}
      className="relative group btn-icon overflow-hidden"
      aria-label="Toggle theme"
      title={`Switch to ${theme === 'light' ? 'dark' : 'light'} mode`}
    >
      {/* Glow effect */}
      <div className="absolute inset-0 bg-gradient-to-r from-orange-500/20 to-amber-500/20 opacity-0 group-hover:opacity-100 transition-opacity rounded-lg" />
      
      {/* Icon */}
      <div className="relative transition-transform duration-300 group-hover:scale-110">
        {theme === 'light' ? (
          <Moon className="h-5 w-5 text-stone-400 group-hover:text-orange-400 transition-colors" />
        ) : (
          <Sun className="h-5 w-5 text-orange-400 group-hover:text-amber-300 transition-colors" />
        )}
      </div>
    </button>
  );
}
