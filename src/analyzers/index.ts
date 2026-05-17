import { JavaScriptAnalyzer } from './javascript';
import { TypeScriptAnalyzer } from './typescript';
import { PythonAnalyzer } from './python';
import { JavaAnalyzer } from './java';
import { CppAnalyzer } from './cpp';
import type { Language } from '../types';
import type { Analyzer } from './base';

const analyzers: Record<Language, Analyzer> = {
  javascript: new JavaScriptAnalyzer(),
  typescript: new TypeScriptAnalyzer(),
  python: new PythonAnalyzer(),
  java: new JavaAnalyzer(),
  cpp: new CppAnalyzer(),
};

export function getAnalyzer(language: Language): Analyzer {
  return analyzers[language];
}

export { JavaScriptAnalyzer, TypeScriptAnalyzer, PythonAnalyzer, JavaAnalyzer, CppAnalyzer };
