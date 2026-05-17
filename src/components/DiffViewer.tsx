import { useMemo } from 'react';
import { motion } from 'framer-motion';

interface DiffViewerProps {
  original: string;
  fixed: string;
}

type RowType = 'equal' | 'delete' | 'insert';
interface DiffRow {
  type: RowType;
  text: string;
  leftLine: number | null;
  rightLine: number | null;
}

function computeLineDiff(original: string, fixed: string): DiffRow[] {
  const origLines = original.split('\n');
  const fixedLines = fixed.split('\n');
  const m = origLines.length;
  const n = fixedLines.length;

  // LCS table
  const dp: number[][] = Array.from({ length: m + 1 }, () => new Array(n + 1).fill(0));
  for (let i = m - 1; i >= 0; i--) {
    for (let j = n - 1; j >= 0; j--) {
      dp[i][j] = origLines[i] === fixedLines[j]
        ? dp[i + 1][j + 1] + 1
        : Math.max(dp[i + 1][j], dp[i][j + 1]);
    }
  }

  // Backtrack to build edit sequence
  type EditOp = ['equal' | 'delete' | 'insert', string];
  const ops: EditOp[] = [];
  let i = 0, j = 0;
  while (i < m && j < n) {
    if (origLines[i] === fixedLines[j]) {
      ops.push(['equal', origLines[i]]);
      i++; j++;
    } else if (dp[i + 1][j] >= dp[i][j + 1]) {
      ops.push(['delete', origLines[i]]);
      i++;
    } else {
      ops.push(['insert', fixedLines[j]]);
      j++;
    }
  }
  while (i < m) { ops.push(['delete', origLines[i++]]); }
  while (j < n) { ops.push(['insert', fixedLines[j++]]); }

  // Assign line numbers
  const rows: DiffRow[] = [];
  let leftLine = 1, rightLine = 1;
  for (const [type, text] of ops) {
    rows.push({
      type,
      text,
      leftLine: type !== 'insert' ? leftLine : null,
      rightLine: type !== 'delete' ? rightLine : null,
    });
    if (type !== 'insert') leftLine++;
    if (type !== 'delete') rightLine++;
  }
  return rows;
}

const rowStyle: Record<RowType, string> = {
  equal:  '',
  delete: 'bg-red-500/10 border-l-2 border-red-500/60',
  insert: 'bg-green-500/10 border-l-2 border-green-500/60',
};

const symbolStyle: Record<RowType, string> = {
  equal:  'text-gray-700',
  delete: 'text-red-400',
  insert: 'text-green-400',
};

const textStyle: Record<RowType, string> = {
  equal:  'text-gray-300',
  delete: 'text-red-200',
  insert: 'text-green-200',
};

const symbol: Record<RowType, string> = { equal: ' ', delete: '−', insert: '+' };

export function DiffViewer({ original, fixed }: DiffViewerProps) {
  const rows = useMemo(() => computeLineDiff(original, fixed), [original, fixed]);
  const hasChanges = rows.some(r => r.type !== 'equal');

  if (!hasChanges) {
    return (
      <div className="h-full flex items-center justify-center text-gray-500 text-sm">
        No changes — code was already correct.
      </div>
    );
  }

  return (
    <div className="h-full overflow-auto">
      <div className="flex items-center gap-3 mb-3 text-xs text-gray-600">
        <span className="flex items-center gap-1">
          <span className="w-2.5 h-2.5 rounded-sm bg-red-500/40 border border-red-500/60 inline-block" />
          Removed
        </span>
        <span className="flex items-center gap-1">
          <span className="w-2.5 h-2.5 rounded-sm bg-green-500/40 border border-green-500/60 inline-block" />
          Added
        </span>
      </div>

      <div className="font-mono text-xs">
        {rows.map((row, idx) => (
          <motion.div
            key={idx}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: Math.min(idx * 0.004, 0.25) }}
            className={`flex items-stretch ${rowStyle[row.type]}`}
          >
            {/* left line number */}
            <span className="w-9 flex-shrink-0 text-right pr-2 py-0.5 text-gray-600 select-none">
              {row.leftLine ?? ''}
            </span>
            {/* right line number */}
            <span className="w-9 flex-shrink-0 text-right pr-2 py-0.5 text-gray-600 select-none border-l border-white/5">
              {row.rightLine ?? ''}
            </span>
            {/* +/- symbol */}
            <span className={`w-5 flex-shrink-0 text-center py-0.5 select-none ${symbolStyle[row.type]}`}>
              {symbol[row.type]}
            </span>
            {/* line content */}
            <span className={`flex-1 py-0.5 px-1 whitespace-pre ${textStyle[row.type]}`}>
              {row.text || ' '}
            </span>
          </motion.div>
        ))}
      </div>
    </div>
  );
}
