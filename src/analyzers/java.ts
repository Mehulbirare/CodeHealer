import { BaseAnalyzer } from './base';
import type { CodeFix } from '../types';

export class JavaAnalyzer extends BaseAnalyzer {
  language = 'java' as const;

  async analyze(code: string): Promise<CodeFix[]> {
    const fixes: CodeFix[] = [];
    const lines = code.split('\n');

    // Check for missing semicolons
    for (let i = 0; i < lines.length; i++) {
      const line = lines[i].trim();
      if (line && !line.endsWith(';') && !line.endsWith('{') && !line.endsWith('}') && 
          !line.endsWith(',') && !line.startsWith('//') && !line.startsWith('/*') &&
          !line.startsWith('*') && !line.startsWith('@') &&
          !line.match(/^(if|else|for|while|switch|public|private|protected|class|interface|enum|package|import)\s/)) {
        if (line.match(/[=+\-*/%]|\(|\[/) && !line.endsWith(')') && !line.endsWith(']')) {
          fixes.push(this.createFix(
            i + 1,
            line.length,
            'Missing semicolon',
            'error',
            line + ';',
            'Java statements must end with semicolons.'
          ));
        }
      }
    }

    // Check for unclosed braces
    const bracketStack: Array<{ char: string; line: number; col: number }> = [];
    const brackets: Record<string, string> = { '(': ')', '[': ']', '{': '}' };
    
    for (let i = 0; i < lines.length; i++) {
      const line = lines[i];
      for (let j = 0; j < line.length; j++) {
        const char = line[j];
        if (char in brackets) {
          bracketStack.push({ char, line: i + 1, col: j + 1 });
        } else if (Object.values(brackets).includes(char)) {
          const last = bracketStack[bracketStack.length - 1];
          if (last && brackets[last.char] === char) {
            bracketStack.pop();
          }
        }
      }
    }

    // Add closing brackets for all unclosed brackets (in reverse order)
    if (bracketStack.length > 0) {
      const lastLineIndex = lines.length - 1;
      const lastLine = lines[lastLineIndex] || '';
      const firstUnclosed = bracketStack[0];
      
      // Build the closing brackets string (reverse order to close innermost first)
      const closingBrackets = [...bracketStack]
        .reverse()
        .map(item => brackets[item.char])
        .join('');
      
      // Add fix to append closing brackets at the end of the last line
      fixes.push(this.createFix(
        lines.length,
        lastLine.length + 1,
        `Unclosed ${firstUnclosed.char}`,
        'error',
        lastLine.trimEnd() + closingBrackets,
        `Missing closing bracket(s): ${closingBrackets}`
      ));
    }

    // Check for missing import statements (basic)
    const importMatches = code.matchAll(/import\s+[\w.]+\.([A-Z][a-zA-Z0-9]*);/g);
    const declaredClasses = new Set<string>();
    for (const match of importMatches) {
      declaredClasses.add(match[1]);
    }

    return fixes;
  }

  async fix(code: string, fixes: CodeFix[]): Promise<string> {
    let fixedCode = code;
    const lines = fixedCode.split('\n');

    const sortedFixes = [...fixes].sort((a, b) => b.line - a.line || b.column - a.column);

    for (const fix of sortedFixes) {
      if (fix.fix && fix.fix !== '') {
        const lineIndex = fix.line - 1;
        if (lineIndex >= 0 && lineIndex < lines.length) {
          const originalLine = lines[lineIndex];
          const indent = originalLine.match(/^(\s*)/)?.[1] || '';
          // Preserve indentation from original line
          lines[lineIndex] = indent + fix.fix.trim();
        }
      }
    }

    return lines.join('\n');
  }
}
