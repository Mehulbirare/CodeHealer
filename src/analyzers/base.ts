import type { CodeFix, Language } from '../types';

export interface Analyzer {
  analyze(code: string): Promise<CodeFix[]>;
  fix(code: string, fixes: CodeFix[]): Promise<string>;
}

export abstract class BaseAnalyzer implements Analyzer {
  abstract language: Language;
  
  abstract analyze(code: string): Promise<CodeFix[]>;
  abstract fix(code: string, fixes: CodeFix[]): Promise<string>;
  
  protected createFix(
    line: number,
    column: number,
    message: string,
    severity: 'error' | 'warning' | 'info',
    fix: string,
    explanation: string
  ): CodeFix {
    return { line, column, message, severity, fix, explanation };
  }
}
