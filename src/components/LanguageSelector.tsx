import { motion } from 'framer-motion';
import type { Language } from '../types';

interface LanguageSelectorProps {
  language: Language;
  onChange: (language: Language) => void;
}

const languages: { value: Language; label: string; icon: string }[] = [
  { value: 'javascript', label: 'JavaScript', icon: 'JS' },
  { value: 'typescript', label: 'TypeScript', icon: 'TS' },
  { value: 'python', label: 'Python', icon: 'PY' },
  { value: 'java', label: 'Java', icon: 'JA' },
  { value: 'cpp', label: 'C++', icon: 'C++' },
];

export function LanguageSelector({ language, onChange }: LanguageSelectorProps) {
  return (
    <div className="flex gap-2">
      {languages.map((lang) => (
        <motion.button
          key={lang.value}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => onChange(lang.value)}
          className={`px-4 py-2 rounded-lg font-semibold text-sm transition-all ${
            language === lang.value
              ? 'bg-neon-cyan text-gray-900 neon-glow'
              : 'glass text-gray-300 hover:bg-white/10'
          }`}
        >
          {lang.label}
        </motion.button>
      ))}
    </div>
  );
}
