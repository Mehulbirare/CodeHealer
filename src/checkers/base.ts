import type { CheckCategory, CheckIssue } from '../types';

export interface CheckRule {
  id: string;
  category: CheckCategory;
  severity: CheckIssue['severity'];
  description: string;
  suggestion: string;
  check: (code: string, lines: string[]) => Array<{ line: number; column?: number; message: string }>;
}

export function stripComments(line: string): string {
  let result = line;
  // Strip // single-line comments (JS/TS/Java/C++)
  result = result.replace(/\/\/.*$/, '');
  // Strip string content to reduce false positives
  result = result
    .replace(/'(?:[^'\\]|\\.)*'/g, "''")
    .replace(/"(?:[^"\\]|\\.)*"/g, '""')
    .replace(/`(?:[^`\\]|\\.)*`/g, '``');
  return result;
}

export function stripPythonComments(line: string): string {
  let result = line;
  // Strip # comments
  result = result.replace(/#.*$/, '');
  // Strip string content
  result = result
    .replace(/'''[\s\S]*?'''/g, "''")
    .replace(/"""[\s\S]*?"""/g, '""')
    .replace(/'(?:[^'\\]|\\.)*'/g, "''")
    .replace(/"(?:[^"\\]|\\.)*"/g, '""');
  return result;
}

export function applyRules(rules: CheckRule[], code: string): CheckIssue[] {
  if (!code.trim()) return [];

  const lines = code.split('\n');
  const issues: CheckIssue[] = [];
  let counter = 0;

  for (const rule of rules) {
    try {
      const matches = rule.check(code, lines);
      for (const match of matches) {
        issues.push({
          id: `${rule.id}-${counter++}`,
          line: match.line,
          column: match.column,
          message: match.message,
          description: rule.description,
          category: rule.category,
          severity: rule.severity,
          suggestion: rule.suggestion,
          rule: rule.id,
        });
      }
    } catch {
      // Silently skip broken rules
    }
  }

  return issues.sort((a, b) => a.line - b.line);
}
