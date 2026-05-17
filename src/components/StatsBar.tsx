import { motion } from 'framer-motion';
import type { AnalysisResult } from '../types';

interface StatsBarProps {
  result: AnalysisResult;
}

export function StatsBar({ result }: StatsBarProps) {
  const errors = result.errors.length;
  const warnings = result.fixes.filter(f => f.severity === 'warning').length;
  const info = result.fixes.filter(f => f.severity === 'info').length;
  const total = errors + warnings + info;

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      className="flex items-center gap-3 text-xs font-semibold"
    >
      {total === 0 ? (
        <span className="text-neon-green">No issues found</span>
      ) : (
        <>
          {errors > 0 && (
            <span className="flex items-center gap-1 text-red-400">
              <span className="w-1.5 h-1.5 rounded-full bg-red-400 inline-block" />
              {errors} error{errors !== 1 ? 's' : ''}
            </span>
          )}
          {warnings > 0 && (
            <span className="flex items-center gap-1 text-yellow-400">
              <span className="w-1.5 h-1.5 rounded-full bg-yellow-400 inline-block" />
              {warnings} warning{warnings !== 1 ? 's' : ''}
            </span>
          )}
          {info > 0 && (
            <span className="flex items-center gap-1 text-blue-400">
              <span className="w-1.5 h-1.5 rounded-full bg-blue-400 inline-block" />
              {info} suggestion{info !== 1 ? 's' : ''}
            </span>
          )}
        </>
      )}
    </motion.div>
  );
}
