import React, { useState, useRef, useEffect } from 'react';
import { useStore } from '../../context/StoreContext';
import { ThemeMode } from '../../types';
import { Sun, Moon, Sparkles, Coffee, Terminal, Palette, Check, ChevronDown } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

interface ThemeSwitcherProps {
  variant?: 'compact' | 'dropdown' | 'bar' | 'settings';
  className?: string;
}

export const ThemeSwitcher: React.FC<ThemeSwitcherProps> = ({ variant = 'dropdown', className = '' }) => {
  const { themeMode, setThemeMode, themeOptions } = useStore();
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const getThemeIcon = (id: ThemeMode, iconClass = 'w-4 h-4') => {
    switch (id) {
      case 'light':
        return <Sun className={`${iconClass} text-amber-500`} />;
      case 'dark':
        return <Moon className={`${iconClass} text-indigo-400`} />;
      case 'midnight':
        return <Sparkles className={`${iconClass} text-cyan-400`} />;
      case 'warm-sepia':
        return <Coffee className={`${iconClass} text-amber-700`} />;
      case 'cyberpunk':
        return <Terminal className={`${iconClass} text-emerald-400`} />;
      default:
        return <Palette className={`${iconClass} text-indigo-500`} />;
    }
  };

  const currentTheme = themeOptions.find((t) => t.id === themeMode) || themeOptions[0];

  if (variant === 'compact') {
    // Quick toggle between light & dark or opens popover
    return (
      <div className={`relative ${className}`} ref={dropdownRef}>
        <button
          id="quick-theme-toggle-btn"
          type="button"
          onClick={() => setIsOpen(!isOpen)}
          className="p-2 rounded-xl border border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-200 transition-all cursor-pointer flex items-center justify-center"
          title={`Active Theme: ${currentTheme.name} (Click to switch)`}
          aria-label="Toggle theme appearance"
        >
          {getThemeIcon(themeMode, 'w-4 h-4')}
        </button>

        <AnimatePresence>
          {isOpen && (
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: -4 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: -4 }}
              transition={{ duration: 0.15 }}
              className="absolute right-0 mt-2 w-64 p-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-2xl shadow-xl z-50 text-slate-800 dark:text-slate-200"
            >
              <div className="px-3 py-1.5 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between mb-1">
                <span className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                  Select Theme
                </span>
                <span className="text-[10px] px-1.5 py-0.5 rounded bg-indigo-50 dark:bg-indigo-950 text-indigo-600 dark:text-indigo-400 font-semibold">
                  5 Modes
                </span>
              </div>
              <div className="space-y-1">
                {themeOptions.map((opt) => (
                  <button
                    key={opt.id}
                    id={`theme-opt-${opt.id}`}
                    type="button"
                    onClick={() => {
                      setThemeMode(opt.id);
                      setIsOpen(false);
                    }}
                    className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-left text-xs font-medium transition-colors cursor-pointer ${
                      themeMode === opt.id
                        ? 'bg-indigo-50 dark:bg-indigo-900/40 text-indigo-700 dark:text-indigo-300 font-semibold'
                        : 'hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300'
                    }`}
                  >
                    <div className="flex items-center gap-2.5">
                      <span className="p-1 rounded-lg bg-slate-100 dark:bg-slate-800">
                        {getThemeIcon(opt.id, 'w-3.5 h-3.5')}
                      </span>
                      <div>
                        <div className="flex items-center gap-1.5">
                          <span>{opt.name}</span>
                          <span className="text-[9px] px-1.5 py-0.2 rounded-full bg-slate-200 dark:bg-slate-700 text-slate-600 dark:text-slate-300">
                            {opt.badge}
                          </span>
                        </div>
                        <p className="text-[10px] text-slate-500 dark:text-slate-400 font-normal">
                          {opt.description}
                        </p>
                      </div>
                    </div>
                    {themeMode === opt.id && <Check className="w-3.5 h-3.5 text-indigo-600 dark:text-indigo-400" />}
                  </button>
                ))}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    );
  }

  if (variant === 'bar') {
    // Horizontal inline pill selector
    return (
      <div className={`flex flex-wrap items-center gap-1.5 p-1 bg-slate-100 dark:bg-slate-800/80 rounded-xl border border-slate-200 dark:border-slate-700 ${className}`}>
        {themeOptions.map((opt) => (
          <button
            key={opt.id}
            id={`theme-bar-btn-${opt.id}`}
            type="button"
            onClick={() => setThemeMode(opt.id)}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
              themeMode === opt.id
                ? 'bg-white dark:bg-slate-900 text-slate-900 dark:text-white shadow-xs'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            {getThemeIcon(opt.id, 'w-3.5 h-3.5')}
            <span>{opt.name}</span>
          </button>
        ))}
      </div>
    );
  }

  // Default dropdown
  return (
    <div className={`relative ${className}`} ref={dropdownRef}>
      <button
        id="header-theme-selector-btn"
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 px-2.5 py-1.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white/80 dark:bg-slate-800/80 hover:bg-white dark:hover:bg-slate-800 text-slate-700 dark:text-slate-200 text-xs font-semibold shadow-2xs transition-all cursor-pointer"
        title="Change Visual Theme"
      >
        <div className="flex items-center gap-1.5">
          {getThemeIcon(themeMode, 'w-3.5 h-3.5')}
          <span className="hidden md:inline">{currentTheme.name}</span>
        </div>
        <ChevronDown className="w-3 h-3 text-slate-400" />
      </button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: -4 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: -4 }}
            transition={{ duration: 0.15 }}
            className="absolute right-0 mt-2 w-72 p-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-2xl shadow-xl z-50 text-slate-800 dark:text-slate-200"
          >
            <div className="px-3 py-2 border-b border-slate-100 dark:border-slate-800 mb-1">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                  Visual Appearance
                </span>
                <span className="text-[10px] px-1.5 py-0.5 rounded bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 font-bold">
                  {themeOptions.length} Themes
                </span>
              </div>
              <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
                Switch themes to preview CartNova in different palettes.
              </p>
            </div>

            <div className="space-y-1">
              {themeOptions.map((opt) => (
                <button
                  key={opt.id}
                  id={`theme-dropdown-opt-${opt.id}`}
                  type="button"
                  onClick={() => {
                    setThemeMode(opt.id);
                    setIsOpen(false);
                  }}
                  className={`w-full flex items-center justify-between p-2.5 rounded-xl text-left transition-all cursor-pointer ${
                    themeMode === opt.id
                      ? 'bg-indigo-50 dark:bg-indigo-950/60 border border-indigo-200 dark:border-indigo-800/60 shadow-2xs'
                      : 'hover:bg-slate-100 dark:hover:bg-slate-800/80 border border-transparent'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <div
                      className="w-8 h-8 rounded-lg flex items-center justify-center shrink-0 border"
                      style={{
                        backgroundColor: opt.bgHex,
                        borderColor: `${opt.accentHex}40`,
                      }}
                    >
                      {getThemeIcon(opt.id, 'w-4 h-4')}
                    </div>
                    <div>
                      <div className="flex items-center gap-1.5">
                        <span className="text-xs font-bold text-slate-900 dark:text-white">
                          {opt.name}
                        </span>
                        <span className="text-[9px] font-semibold px-1.5 py-0.2 rounded-full bg-slate-200 dark:bg-slate-800 text-slate-600 dark:text-slate-300">
                          {opt.badge}
                        </span>
                      </div>
                      <p className="text-[10px] text-slate-500 dark:text-slate-400">
                        {opt.description}
                      </p>
                    </div>
                  </div>

                  {themeMode === opt.id && (
                    <div className="w-5 h-5 rounded-full bg-indigo-600 dark:bg-indigo-500 text-white flex items-center justify-center shrink-0">
                      <Check className="w-3 h-3" />
                    </div>
                  )}
                </button>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
