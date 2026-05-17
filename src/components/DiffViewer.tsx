import { motion } from 'framer-motion';
import { diff_match_patch } from 'diff-match-patch';
import type { CodeFix } from '../types';

interface DiffViewerProps {
  original: string;
  fixed: string;
  fixes: CodeFix[];
}

export function DiffViewer({ original, fixed, fixes }: DiffViewerProps) {
  const dmp = new diff_match_patch();
  const diffs = dmp.diff_main(original, fixed);
  dmp.diff_cleanupSemantic(diffs);

  const originalLines = original.split('\n');
  const fixedLines = fixed.split('\n');

  const getLineClass = (lineNum: number, isFixed: boolean) => {
    const fix = fixes.find(f => f.line === lineNum);
    if (fix) {
      return isFixed 
        ? 'bg-green-500/20 border-l-2 border-green-500 neon-glow-green'
        : 'bg-red-500/20 border-l-2 border-red-500 neon-glow-red';
    }
    return '';
  };

  return (
    <div className="grid grid-cols-2 gap-4 h-full">
      <div className="glass rounded-lg p-4 overflow-auto">
        <h3 className="text-sm font-semibold text-gray-400 mb-2">Before</h3>
        <div className="font-mono text-sm">
          {originalLines.map((line, idx) => (
            <motion.div
              key={idx}
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: idx * 0.01 }}
              className={`p-1 ${getLineClass(idx + 1, false)}`}
            >
              <span className="text-gray-500 mr-2 select-none">{idx + 1}</span>
              <span className="text-gray-300">{line || '\u00A0'}</span>
            </motion.div>
          ))}
        </div>
      </div>
      
      <div className="glass rounded-lg p-4 overflow-auto">
        <h3 className="text-sm font-semibold text-gray-400 mb-2">After</h3>
        <div className="font-mono text-sm">
          {fixedLines.map((line, idx) => (
            <motion.div
              key={idx}
              initial={{ opacity: 0, x: 10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: idx * 0.01 }}
              className={`p-1 ${getLineClass(idx + 1, true)}`}
            >
              <span className="text-gray-500 mr-2 select-none">{idx + 1}</span>
              <span className="text-gray-300">{line || '\u00A0'}</span>
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  );
}
