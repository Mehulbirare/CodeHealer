import { BaseAnalyzer } from './base';
import type { CodeFix } from '../types';

export class JavaScriptAnalyzer extends BaseAnalyzer {
  language = 'javascript' as const;

  async analyze(code: string): Promise<CodeFix[]> {
    const fixes: CodeFix[] = [];
    const lines = code.split('\n');

    // Check for missing semicolons
    for (let i = 0; i < lines.length; i++) {
      const line = lines[i].trim();
      if (line && !line.endsWith(';') && !line.endsWith('{') && !line.endsWith('}') && 
          !line.endsWith(',') && !line.startsWith('//') && !line.startsWith('/*') &&
          !line.match(/^(if|else|for|while|switch|function|const|let|var|return|break|continue)\s/)) {
        if (line.match(/[=+\-*/%]|\(|\[/)) {
          fixes.push(this.createFix(
            i + 1,
            line.length,
            'Missing semicolon',
            'warning',
            line + ';',
            'JavaScript statements should end with semicolons for clarity and to avoid ASI issues.'
          ));
        }
      }
    }

    // Check for unclosed brackets
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

    // Check for undefined variables (basic check)
    const varMatches = code.matchAll(/\b(var|let|const)\s+(\w+)/g);
    const declaredVars = new Set<string>();
    for (const match of varMatches) {
      declaredVars.add(match[2]);
    }

    const usedVars = code.matchAll(/\b([a-zA-Z_$][a-zA-Z0-9_$]*)\b/g);
    const undefinedVars = new Set<string>();
    for (const match of usedVars) {
      const varName = match[1];
      if (!declaredVars.has(varName) && 
          !['function', 'if', 'else', 'for', 'while', 'return', 'const', 'let', 'var', 
            'true', 'false', 'null', 'undefined', 'this', 'console', 'Math', 'Date', 
            'Array', 'Object', 'String', 'Number', 'Boolean'].includes(varName)) {
        undefinedVars.add(varName);
      }
    }

    // Note: Formatting detection is handled in the fix method

    return fixes;
  }

  async fix(code: string, fixes: CodeFix[]): Promise<string> {
    let fixedCode = code;
    const lines = fixedCode.split('\n');

    // Apply fixes in reverse order to maintain line numbers
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

    fixedCode = lines.join('\n');

    // Basic formatting: ensure consistent indentation
    const formattedLines = fixedCode.split('\n').map(line => {
      // Remove extra spaces but preserve indentation
      return line.trimEnd();
    });
    fixedCode = formattedLines.join('\n');

    return fixedCode;
  }
}
