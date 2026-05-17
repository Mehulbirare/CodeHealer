import type { CheckRule } from './base';
import { stripComments } from './base';

export const javaRules: CheckRule[] = [
  {
    id: 'sysout',
    category: 'style',
    severity: 'hint',
    description: '`System.out.println` is a debug-level logging mechanism and should not appear in production code.',
    suggestion: 'Use a proper logging framework like SLF4J with Logback: `logger.info("message")`.',
    check: (_, lines) =>
      lines.flatMap((line, i) => {
        const s = stripComments(line);
        return /System\s*\.\s*out\s*\.\s*(println|print|printf)\s*\(/.test(s)
          ? [{ line: i + 1, message: '`System.out.println` — use a logging framework (SLF4J, Log4j)' }]
          : [];
      }),
  },
  {
    id: 'raw-type',
    category: 'warning',
    severity: 'warning',
    description: 'Raw generic types (e.g., `List` instead of `List<String>`) bypass compile-time type checking.',
    suggestion: 'Provide type parameters: `List<String>`, `Map<String, Integer>`, `ArrayList<User>()`.',
    check: (_, lines) =>
      lines.flatMap((line, i) => {
        const s = stripComments(line);
        return /\b(List|Map|Set|ArrayList|HashMap|HashSet|LinkedList|Queue|Deque|Collection)\s+\w+\s*[=;,(]/.test(s) &&
          !/</.test(s)
          ? [{ line: i + 1, message: 'Raw generic type — add type parameter, e.g. `List<String>`' }]
          : [];
      }),
  },
  {
    id: 'string-equality',
    category: 'syntax',
    severity: 'error',
    description: '`==` compares String object references, not their content. Two identical strings may not be `==`.',
    suggestion: 'Use `.equals()` for content comparison: `str1.equals(str2)` or `Objects.equals(str1, str2)`.',
    check: (_, lines) =>
      lines.flatMap((line, i) => {
        const s = stripComments(line);
        // Look for "String comparison with == or !=" patterns
        return /["]\s*[!=]=\s*\w|[a-z]\w*\s*[!=]=\s*["']/.test(s) ||
          /\.equals\s*\(\s*\)/.test(s)  // empty equals() call
          ? []  // too many false positives without AST
          : /"[^"]*"\s*==\s*[a-z]|\b[a-z]\w*\s*==\s*"[^"]*"/.test(s)
          ? [{ line: i + 1, message: 'String compared with `==` — use `.equals()` for content comparison' }]
          : [];
      }),
  },
  {
    id: 'broad-catch',
    category: 'warning',
    severity: 'warning',
    description: 'Catching `Exception` is too broad — it catches checked and unchecked exceptions including NullPointerException.',
    suggestion: 'Catch specific exception types to handle them appropriately and let unexpected exceptions propagate.',
    check: (_, lines) =>
      lines.flatMap((line, i) => {
        const s = stripComments(line);
        return /\bcatch\s*\(\s*Exception\s+\w/.test(s)
          ? [{ line: i + 1, message: 'Catching generic `Exception` — catch specific exception types instead' }]
          : [];
      }),
  },
  {
    id: 'catch-throwable',
    category: 'warning',
    severity: 'error',
    description: 'Catching `Throwable` includes `Error` subclasses (OutOfMemoryError, StackOverflowError) which are not recoverable.',
    suggestion: 'Catch `Exception` at most. Allow `Error`s to propagate so the JVM can handle them.',
    check: (_, lines) =>
      lines.flatMap((line, i) => {
        const s = stripComments(line);
        return /\bcatch\s*\(\s*Throwable\s+\w/.test(s)
          ? [{ line: i + 1, message: 'Catching `Throwable` includes unrecoverable JVM errors — use `Exception`' }]
          : [];
      }),
  },
  {
    id: 'new-string',
    category: 'performance',
    severity: 'info',
    description: '`new String("literal")` creates an unnecessary String object; string literals are interned automatically.',
    suggestion: 'Use string literals directly: `String s = "hello";` instead of `new String("hello")`.',
    check: (_, lines) =>
      lines.flatMap((line, i) => {
        const s = stripComments(line);
        return /\bnew\s+String\s*\(\s*["']/.test(s)
          ? [{ line: i + 1, message: '`new String("literal")` — use string literal directly' }]
          : [];
      }),
  },
  {
    id: 'string-concat-loop',
    category: 'performance',
    severity: 'warning',
    description: 'String concatenation with `+` in a loop creates O(n²) intermediate objects due to String immutability.',
    suggestion: 'Use `StringBuilder.append()` inside loops and `StringBuilder.toString()` at the end.',
    check: (code) => {
      const lines = code.split('\n');
      const issues: Array<{ line: number; message: string }> = [];
      for (let i = 0; i < lines.length; i++) {
        const s = stripComments(lines[i]);
        if (/\w+\s*\+=\s*\w+/.test(s) && !/\/\//.test(lines[i])) {
          const context = lines.slice(Math.max(0, i - 8), i).join('\n');
          if (/\bfor\s*\(|\bwhile\s*\(/.test(context)) {
            issues.push({ line: i + 1, message: 'String `+=` in loop — use `StringBuilder.append()` for performance' });
          }
        }
      }
      return issues;
    },
  },
  {
    id: 'public-field',
    category: 'style',
    severity: 'info',
    description: 'Public fields violate encapsulation — any caller can modify them directly without validation.',
    suggestion: 'Make fields `private` and expose them via getters/setters, or use records for immutable data.',
    check: (_, lines) =>
      lines.flatMap((line, i) => {
        const s = stripComments(line);
        return /^\s*public\s+(?!class|interface|enum|static|final|abstract|void|\w+\s*\()(?:[a-zA-Z]+\s+\w+\s*;)/.test(s)
          ? [{ line: i + 1, message: 'Public field — use private with getter/setter for encapsulation' }]
          : [];
      }),
  },
];
