export type Language = 'javascript' | 'typescript' | 'python' | 'java' | 'cpp';

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
