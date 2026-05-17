export type Language = 'javascript' | 'typescript' | 'python' | 'java' | 'cpp';

export type CheckCategory = 'syntax' | 'warning' | 'modernization' | 'performance' | 'style';

export interface CheckIssue {
  id: string;
  line: number;
  column?: number;
  message: string;
  description: string;
  category: CheckCategory;
  severity: 'error' | 'warning' | 'info' | 'hint';
  suggestion?: string;
  rule: string;
}

export interface OnlineCheckResult {
  issues: CheckIssue[];
  language: Language;
  timestamp: number;
}

export interface CodeFix {
  line: number;
  column: number;
  message: string;
  severity: 'error' | 'warning' | 'info';
  fix: string;
  explanation: string;
}

export interface AnalysisResult {
  originalCode: string;
  fixedCode: string;
  fixes: CodeFix[];
  errors: CodeFix[];
  language: Language;
  timestamp: number;
}

export interface HistoryItem {
  id: string;
  language: Language;
  originalCode: string;
  fixedCode: string;
  timestamp: number;
}

export interface Project {
  id: string;
  name: string;
  language: Language;
  code: string;
  history: HistoryItem[];
  createdAt: number;
}
