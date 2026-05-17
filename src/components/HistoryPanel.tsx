import { motion } from 'framer-motion';
import { useStore } from '../store/useStore';
import type { HistoryItem, Language } from '../types';

const langLabel: Record<Language, string> = {
  javascript: 'JS',
  typescript: 'TS',
  python: 'PY',
  java: 'JA',
  cpp: 'C++',
};

interface HistoryPanelProps {
  onRestore: (item: HistoryItem) => void;
  onClose: () => void;
}

export function HistoryPanel({ onRestore, onClose }: HistoryPanelProps) {
  const { history, clearHistory } = useStore();

  return (
    <>
      {/* backdrop */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onClose}
        className="fixed inset-0 z-30 bg-black/30"
      />

      {/* panel */}
      <motion.aside
        initial={{ x: '100%' }}
        animate={{ x: 0 }}
        exit={{ x: '100%' }}
        transition={{ type: 'spring', damping: 28, stiffness: 260 }}
        className="fixed right-0 top-0 h-full w-72 z-40 flex flex-col bg-gray-900 border-l border-white/10"
      >
        <div className="flex items-center justify-between px-4 py-3 border-b border-white/10">
          <h2 className="font-semibold text-gray-200 text-sm">Analysis History</h2>
          <div className="flex items-center gap-3">
            {history.length > 0 && (
              <button
                onClick={clearHistory}
                className="text-xs text-gray-500 hover:text-red-400 transition-colors"
              >
                Clear all
              </button>
            )}
            <button onClick={onClose} className="text-gray-500 hover:text-gray-200 text-lg leading-none">
              ×
            </button>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto p-3 space-y-2">
          {history.length === 0 ? (
            <p className="text-gray-600 text-sm text-center mt-10">No history yet</p>
          ) : (
            history.map((item) => (
              <button
                key={item.id}
                onClick={() => { onRestore(item); onClose(); }}
                className="w-full text-left bg-white/5 hover:bg-white/10 border border-white/10 rounded-lg p-3 transition-colors"
              >
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-xs font-bold bg-neon-cyan/15 text-neon-cyan px-1.5 py-0.5 rounded">
                    {langLabel[item.language]}
                  </span>
                  <span className="text-xs text-gray-500">
                    {new Date(item.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </span>
                </div>
                <p className="text-xs text-gray-400 font-mono truncate">
                  {item.originalCode.split('\n')[0] || '(empty)'}
                </p>
              </button>
            ))
          )}
        </div>
      </motion.aside>
    </>
  );
}
