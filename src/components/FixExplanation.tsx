import { motion } from 'framer-motion';
import { useState } from 'react';
import type { CodeFix } from '../types';

interface FixExplanationProps {
  fixes: CodeFix[];
}

export function FixExplanation({ fixes }: FixExplanationProps) {
  const [expanded, setExpanded] = useState<Set<number>>(new Set());

  const toggleExpand = (index: number) => {
    const newExpanded = new Set(expanded);
    if (newExpanded.has(index)) {
      newExpanded.delete(index);
    } else {
      newExpanded.add(index);
    }
    setExpanded(newExpanded);
  };

  const getSeverityColor = (severity: CodeFix['severity']) => {
    switch (severity) {
      case 'error':
        return 'text-red-400 border-red-400';
      case 'warning':
        return 'text-yellow-400 border-yellow-400';
      case 'info':
        return 'text-blue-400 border-blue-400';
    }
  };

  if (fixes.length === 0) {
    return (
      <div className="glass rounded-lg p-6 text-center">
        <p className="text-gray-400">No fixes needed! Your code looks good.</p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {fixes.map((fix, index) => (
        <motion.div
          key={index}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: index * 0.1 }}
          className="glass rounded-lg overflow-hidden"
        >
          <button
            onClick={() => toggleExpand(index)}
            className="w-full p-4 text-left flex items-center justify-between hover:bg-white/5 transition-colors"
          >
            <div className="flex items-center gap-3">
              <span className={`px-2 py-1 rounded text-xs font-semibold border ${getSeverityColor(fix.severity)}`}>
                {fix.severity.toUpperCase()}
              </span>
              <span className="text-sm text-gray-300">
                Line {fix.line}: {fix.message}
              </span>
            </div>
            <motion.svg
              animate={{ rotate: expanded.has(index) ? 180 : 0 }}
              className="w-5 h-5 text-gray-400"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </motion.svg>
          </button>
          
          {expanded.has(index) && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              className="px-4 pb-4"
            >
              <p className="text-sm text-gray-400 mb-2">{fix.explanation}</p>
              {fix.fix && (
                <div className="mt-2 p-2 bg-gray-800 rounded font-mono text-xs text-green-400">
                  {fix.fix}
                </div>
              )}
            </motion.div>
          )}
        </motion.div>
      ))}
    </div>
  );
}
