import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import type { CheckCategory, CheckIssue, OnlineCheckResult } from '../types';

interface OnlineCheckPanelProps {
  result: OnlineCheckResult | null;
  isChecking: boolean;
}

type Filter = CheckCategory | 'all';

const categoryMeta: Record<CheckCategory, { label: string; color: string; bg: string; border: string; dot: string }> = {
  syntax:       { label: 'Syntax Errors',  color: 'text-red-400',    bg: 'bg-red-500/10',    border: 'border-red-500/25',    dot: 'bg-red-400' },
  warning:      { label: 'Warnings',        color: 'text-yellow-400', bg: 'bg-yellow-500/10', border: 'border-yellow-500/25', dot: 'bg-yellow-400' },
  modernization:{ label: 'Modernization',   color: 'text-cyan-400',   bg: 'bg-cyan-500/10',   border: 'border-cyan-500/25',   dot: 'bg-cyan-400' },
  performance:  { label: 'Performance',     color: 'text-green-400',  bg: 'bg-green-500/10',  border: 'border-green-500/25',  dot: 'bg-green-400' },
  style:        { label: 'Code Style',      color: 'text-purple-400', bg: 'bg-purple-500/10', border: 'border-purple-500/25', dot: 'bg-purple-400' },
};

const severityDot: Record<CheckIssue['severity'], string> = {
  error:   'bg-red-400',
  warning: 'bg-yellow-400',
  info:    'bg-blue-400',
  hint:    'bg-gray-500',
};

const categoryOrder: CheckCategory[] = ['syntax', 'warning', 'modernization', 'performance', 'style'];

function IssueCard({ issue, index }: { issue: CheckIssue; index: number }) {
  const [open, setOpen] = useState(false);
  const meta = categoryMeta[issue.category];

  return (
    <motion.div
      initial={{ opacity: 0, y: 6 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: Math.min(index * 0.04, 0.4) }}
      className={`rounded-lg border overflow-hidden ${meta.border} ${meta.bg}`}
    >
      <button
        onClick={() => setOpen(o => !o)}
        className="w-full text-left px-3 py-2.5 flex items-start gap-2.5 hover:bg-white/5 transition-colors"
      >
        <span className={`mt-1.5 w-1.5 h-1.5 rounded-full flex-shrink-0 ${severityDot[issue.severity]}`} />
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-xs font-mono text-gray-500">L.{issue.line}</span>
            <span className={`text-xs font-semibold font-mono ${meta.color}`}>{issue.rule}</span>
          </div>
          <p className="text-xs text-gray-300 mt-0.5 leading-snug">{issue.message}</p>
        </div>
        <motion.svg
          animate={{ rotate: open ? 180 : 0 }}
          transition={{ duration: 0.15 }}
          className="w-3.5 h-3.5 text-gray-600 flex-shrink-0 mt-1"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </motion.svg>
      </button>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.15 }}
            className="overflow-hidden"
          >
            <div className="px-3 pb-3 pt-0 space-y-2 border-t border-white/5">
              <p className="text-xs text-gray-400 leading-relaxed pt-2">{issue.description}</p>
              {issue.suggestion && (
                <div className="flex gap-2 items-start">
                  <span className="text-xs text-gray-600 flex-shrink-0 mt-0.5">→</span>
                  <p className={`text-xs leading-relaxed font-medium ${meta.color}`}>{issue.suggestion}</p>
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}

function CategoryGroup({ category, issues }: { category: CheckCategory; issues: CheckIssue[] }) {
  const [collapsed, setCollapsed] = useState(false);
  const meta = categoryMeta[category];

  return (
    <div className="space-y-1.5">
      <button
        onClick={() => setCollapsed(c => !c)}
        className="w-full flex items-center gap-2 py-1 hover:opacity-80 transition-opacity"
      >
        <span className={`w-2 h-2 rounded-full ${meta.dot}`} />
        <span className={`text-xs font-bold uppercase tracking-wider ${meta.color}`}>{meta.label}</span>
        <span className={`text-xs px-1.5 py-0.5 rounded-full font-mono ${meta.bg} ${meta.color}`}>
          {issues.length}
        </span>
        <div className="flex-1" />
        <motion.svg
          animate={{ rotate: collapsed ? -90 : 0 }}
          transition={{ duration: 0.15 }}
          className="w-3 h-3 text-gray-600"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </motion.svg>
      </button>

      <AnimatePresence>
        {!collapsed && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.15 }}
            className="overflow-hidden"
          >
            <div className="space-y-1.5 pl-0">
              {issues.map((issue, idx) => (
                <IssueCard key={issue.id} issue={issue} index={idx} />
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

export function OnlineCheckPanel({ result, isChecking }: OnlineCheckPanelProps) {
  const [filter, setFilter] = useState<Filter>('all');

  if (isChecking) {
    return (
      <div className="flex flex-col items-center justify-center h-48 gap-3">
        <div className="flex gap-1">
          {[0, 1, 2].map(i => (
            <motion.span
              key={i}
              className="w-1.5 h-1.5 rounded-full bg-cyan-400"
              animate={{ opacity: [0.3, 1, 0.3] }}
              transition={{ duration: 0.8, repeat: Infinity, delay: i * 0.2 }}
            />
          ))}
        </div>
        <p className="text-xs text-gray-600">Validating…</p>
      </div>
    );
  }

  if (!result || result.issues.length === 0) {
    return (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="flex flex-col items-center justify-center h-48 gap-3 text-center"
      >
        {!result ? (
          <>
            <div className="text-4xl opacity-10">⚡</div>
            <p className="text-xs text-gray-600 max-w-48 leading-relaxed">
              Start typing to see live syntax and best-practice validation.
            </p>
          </>
        ) : (
          <>
            <div className="text-4xl opacity-20">✓</div>
            <p className="text-sm text-gray-500 font-medium">No issues found</p>
            <p className="text-xs text-gray-700">Your code follows current best practices.</p>
          </>
        )}
      </motion.div>
    );
  }

  const { issues } = result;
  const categoryCounts = categoryOrder.reduce<Record<CheckCategory, number>>(
    (acc, cat) => ({ ...acc, [cat]: issues.filter(i => i.category === cat).length }),
    { syntax: 0, warning: 0, modernization: 0, performance: 0, style: 0 }
  );

  const filtered = filter === 'all' ? issues : issues.filter(i => i.category === filter);

  const errorCount = issues.filter(i => i.severity === 'error').length;
  const warnCount  = issues.filter(i => i.severity === 'warning').length;
  const infoCount  = issues.filter(i => i.severity === 'info' || i.severity === 'hint').length;

  return (
    <div className="space-y-3">
      {/* Summary bar */}
      <div className="glass rounded-lg px-3 py-2 flex items-center gap-3 flex-wrap text-xs">
        <span className="text-gray-400 font-semibold">{issues.length} issues</span>
        {errorCount > 0 && <span className="text-red-400">{errorCount} error{errorCount !== 1 ? 's' : ''}</span>}
        {warnCount  > 0 && <span className="text-yellow-400">{warnCount} warning{warnCount !== 1 ? 's' : ''}</span>}
        {infoCount  > 0 && <span className="text-blue-400">{infoCount} suggestion{infoCount !== 1 ? 's' : ''}</span>}
      </div>

      {/* Filter bar */}
      <div className="flex gap-1.5 flex-wrap">
        <button
          onClick={() => setFilter('all')}
          className={`px-2 py-1 rounded text-xs font-semibold transition-all ${
            filter === 'all'
              ? 'bg-white/15 text-gray-200'
              : 'text-gray-500 hover:text-gray-300 bg-white/5 hover:bg-white/10'
          }`}
        >
          All ({issues.length})
        </button>
        {categoryOrder.map(cat => {
          const count = categoryCounts[cat];
          if (count === 0) return null;
          const meta = categoryMeta[cat];
          return (
            <button
              key={cat}
              onClick={() => setFilter(cat)}
              className={`px-2 py-1 rounded text-xs font-semibold transition-all ${
                filter === cat
                  ? `${meta.bg} ${meta.color} border ${meta.border}`
                  : 'text-gray-500 hover:text-gray-300 bg-white/5 hover:bg-white/10'
              }`}
            >
              {meta.label.split(' ')[0]} ({count})
            </button>
          );
        })}
      </div>

      {/* Issue list */}
      <AnimatePresence mode="wait">
        <motion.div
          key={filter}
          initial={{ opacity: 0, y: 4 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0 }}
          className="space-y-4"
        >
          {filter === 'all' ? (
            categoryOrder
              .filter(cat => categoryCounts[cat] > 0)
              .map(cat => (
                <CategoryGroup
                  key={cat}
                  category={cat}
                  issues={issues.filter(i => i.category === cat)}
                />
              ))
          ) : (
            <div className="space-y-1.5">
              {filtered.map((issue, idx) => (
                <IssueCard key={issue.id} issue={issue} index={idx} />
              ))}
            </div>
          )}
        </motion.div>
      </AnimatePresence>
    </div>
  );
}
