import { getAnalyzer } from '../analyzers';
import type { Language, AnalysisResult } from '../types';

export async function analyzeCode(code: string, language: Language): Promise<AnalysisResult> {
  const analyzer = getAnalyzer(language);
  
  // Detect errors and get fixes
  const allFixes = await analyzer.analyze(code);
  const errors = allFixes.filter(f => f.severity === 'error');
  const warnings = allFixes.filter(f => f.severity === 'warning');
  const info = allFixes.filter(f => f.severity === 'info');
  
  // Apply fixes
  const fixedCode = await analyzer.fix(code, allFixes);
  
  return {
    originalCode: code,
    fixedCode,
    fixes: [...warnings, ...info],
    errors,
    language,
    timestamp: Date.now(),
  };
}
