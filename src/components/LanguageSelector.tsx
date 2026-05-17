import { useState, useRef, useEffect } from 'react';
import type { Language } from '../types';

interface LanguageSelectorProps {
  language: Language;
  onChange: (language: Language) => void;
}

const languages: { value: Language; label: string; badge: string }[] = [
  { value: 'javascript', label: 'JavaScript', badge: 'JS' },
  { value: 'typescript', label: 'TypeScript', badge: 'TS' },
  { value: 'python', label: 'Python', badge: 'PY' },
  { value: 'java', label: 'Java', badge: 'JA' },
  { value: 'cpp', label: 'C++', badge: 'C++' },
];

export function LanguageSelector({ language, onChange }: LanguageSelectorProps) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const active = languages.find(l => l.value === language)!;

  useEffect(() => {
    if (!open) return;
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, [open]);

  return (
    <div ref={ref} className="relative">
      <button
        onClick={() => setOpen(o => !o)}
        className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-semibold transition-all border ${
          open
            ? 'bg-white/10 border-neon-cyan/30 text-gray-200'
            : 'bg-white/5 border-white/10 hover:bg-white/10 text-gray-300'
        }`}
      >
        <span className="text-[10px] font-bold bg-neon-cyan/15 text-neon-cyan px-1 py-0.5 rounded">
          {active.badge}
        </span>
        <span>{active.label}</span>
        <svg
          className={`w-3 h-3 text-gray-500 flex-shrink-0 transition-transform ${open ? 'rotate-180' : ''}`}
          fill="none" stroke="currentColor" viewBox="0 0 24 24"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      {open && (
        <div className="absolute top-full left-0 mt-1.5 w-44 bg-gray-900 border border-white/10 rounded-xl shadow-2xl z-50 py-1.5 overflow-hidden">
          {languages.map((lang) => (
            <button
              key={lang.value}
              onClick={() => { onChange(lang.value); setOpen(false); }}
              className={`w-full flex items-center gap-2.5 px-3 py-2 text-xs transition-colors ${
                lang.value === language
                  ? 'bg-white/5 text-gray-200'
                  : 'text-gray-400 hover:bg-white/5 hover:text-gray-200'
              }`}
            >
              {lang.value === language
                ? <span className="text-neon-cyan text-[11px] flex-shrink-0">✓</span>
                : <span className="w-3 flex-shrink-0" />
              }
              <span className="text-[10px] font-bold bg-neon-cyan/10 text-neon-cyan/80 px-1 py-0.5 rounded w-7 text-center flex-shrink-0">
                {lang.badge}
              </span>
              {lang.label}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
