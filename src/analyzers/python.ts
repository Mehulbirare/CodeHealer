import { BaseAnalyzer } from './base';
import type { CodeFix } from '../types';

export class PythonAnalyzer extends BaseAnalyzer {
  language = 'python' as const;

  async analyze(code: string): Promise<CodeFix[]> {
    const fixes: CodeFix[] = [];
    const lines = code.split('\n');

    // Check for missing colons after control structures
    for (let i = 0; i < lines.length; i++) {
      const line = lines[i].trim();
      if (line.match(/^(if|elif|else|for|while|def|class|try|except|finally)\s/)) {
        if (!line.endsWith(':')) {
          fixes.push(this.createFix(
            i + 1,
            line.length,
            'Missing colon',
            'error',
            line + ':',
            'Python control structures and function definitions must end with a colon.'
          ));
        }
      }
    }

    // Check for indentation issues (basic)
    let expectedIndent = 0;
    for (let i = 0; i < lines.length; i++) {
      const line = lines[i];
      if (line.trim() === '') continue;
      
      const indent = line.match(/^(\s*)/)?.[1].length || 0;
      const trimmed = line.trim();
      
      if (trimmed.match(/^(if|elif|else|for|while|def|class|try|except|finally)\s/)) {
        if (trimmed.endsWith(':')) {
          expectedIndent = indent + 4; // Next line should be indented
        }
      } else if (indent !== expectedIndent && expectedIndent > 0) {
        if (trimmed.match(/^(return|break|continue|pass|raise|yield)/)) {
          // These should be at expectedIndent
          if (indent !== expectedIndent) {
            fixes.push(this.createFix(
              i + 1,
              1,
              'Incorrect indentation',
              'error',
              ' '.repeat(expectedIndent) + trimmed,
              'Python uses indentation to define code blocks. This line should be indented correctly.'
            ));
          }
        }
      }
    }

    // Check for syntax errors (basic)
    const bracketStack: Array<{ char: string; line: number }> = [];
    const brackets: Record<string, string> = { '(': ')', '[': ']', '{': '}' };
    
    for (let i = 0; i < lines.length; i++) {
      const line = lines[i];
      for (let j = 0; j < line.length; j++) {
        const char = line[j];
        if (char in brackets && !(line.substring(j).match(/^['"]/))) {
          bracketStack.push({ char, line: i + 1 });
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
          // If fix.fix already has indentation (starts with whitespace), use it as-is
          // Otherwise, preserve indentation from original line
          if (/^\s/.test(fix.fix)) {
            lines[lineIndex] = fix.fix;
          } else {
            lines[lineIndex] = indent + fix.fix.trim();
          }
        }
      }
    }

    return lines.join('\n');
  }
}
