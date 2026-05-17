import { useState, useRef, useEffect } from 'react';
import { createPortal } from 'react-dom';
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
  const [pos, setPos] = useState({ top: 0, left: 0 });
  const buttonRef = useRef<HTMLButtonElement>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const active = languages.find(l => l.value === language)!;

  const handleOpen = () => {
    if (buttonRef.current) {
      const r = buttonRef.current.getBoundingClientRect();
      setPos({ top: r.bottom + 6, left: r.left });
    }
    setOpen(o => !o);
  };

  useEffect(() => {
    if (!open) return;
    const handler = (e: MouseEvent) => {
      const t = e.target as Node;
      if (!buttonRef.current?.contains(t) && !dropdownRef.current?.contains(t)) {
        setOpen(false);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, [open]);

  const dropdown = (
    <div
      ref={dropdownRef}
      style={{ top: pos.top, left: pos.left }}
      className="fixed w-44 bg-gray-900 border border-white/10 rounded-xl shadow-2xl z-[9999] py-1.5"
    >
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
  );

  return (
    <>
      <button
        ref={buttonRef}
        onClick={handleOpen}
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

      {open && createPortal(dropdown, document.body)}
    </>
  );
}
