import type { Language, OnlineCheckResult } from '../types';
import { applyRules, type CheckRule } from './base';
import { jsRules } from './javascript';
import { tsRules } from './typescript';
import { pythonRules } from './python';
import { javaRules } from './java';
import { cppRules } from './cpp';

const rulesMap: Record<Language, CheckRule[]> = {
  javascript: jsRules,
  typescript: tsRules,
  python: pythonRules,
  java: javaRules,
  cpp: cppRules,
};

export function runOnlineCheck(code: string, language: Language): OnlineCheckResult {
  const rules = rulesMap[language];
  const issues = applyRules(rules, code);
  return { issues, language, timestamp: Date.now() };
}
