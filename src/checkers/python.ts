import type { CheckRule } from './base';
import { stripPythonComments } from './base';

export const pythonRules: CheckRule[] = [
  {
    id: 'bare-except',
    category: 'warning',
    severity: 'warning',
    description: 'Bare `except:` catches all exceptions including `KeyboardInterrupt` and `SystemExit`, masking real errors.',
    suggestion: 'Catch specific exceptions: `except ValueError:` or at minimum `except Exception:`.',
    check: (_, lines) =>
      lines.flatMap((line, i) => {
        const s = stripPythonComments(line);
        return /^\s*except\s*:/.test(s)
          ? [{ line: i + 1, message: 'Bare `except:` catches all exceptions — specify exception types' }]
          : [];
      }),
  },
  {
    id: 'range-len',
    category: 'modernization',
    severity: 'info',
    description: '`range(len(iterable))` is a C-style pattern. Python provides `enumerate()` for index+value iteration.',
    suggestion: 'Use `enumerate(items)` to get both index and value: `for i, item in enumerate(items):`.',
    check: (_, lines) =>
      lines.flatMap((line, i) => {
        const s = stripPythonComments(line);
        return /\brange\s*\(\s*len\s*\(/.test(s)
          ? [{ line: i + 1, message: '`range(len(...))` — use `enumerate()` for idiomatic Python' }]
          : [];
      }),
  },
  {
    id: 'type-comparison',
    category: 'modernization',
    severity: 'warning',
    description: '`type(x) == SomeType` does not account for subclasses and is not the recommended pattern.',
    suggestion: 'Use `isinstance(x, SomeType)` which correctly handles inheritance.',
    check: (_, lines) =>
      lines.flatMap((line, i) => {
        const s = stripPythonComments(line);
        return /\btype\s*\(\s*\w+\s*\)\s*[!=]=/.test(s)
          ? [{ line: i + 1, message: '`type(x) ==` comparison — use `isinstance(x, Type)` instead' }]
          : [];
      }),
  },
  {
    id: 'global-keyword',
    category: 'style',
    severity: 'info',
    description: 'The `global` keyword creates tight coupling between functions and module state, making code harder to test.',
    suggestion: 'Return values from functions or pass state explicitly. Consider using a class to encapsulate shared state.',
    check: (_, lines) =>
      lines.flatMap((line, i) => {
        const s = stripPythonComments(line);
        return /^\s*global\s+\w/.test(s)
          ? [{ line: i + 1, message: '`global` keyword — prefer returning values or passing state explicitly' }]
          : [];
      }),
  },
  {
    id: 'python2-print',
    category: 'syntax',
    severity: 'error',
    description: '`print` without parentheses is Python 2 syntax and a `SyntaxError` in Python 3.',
    suggestion: 'Use `print(value)` with parentheses as required in Python 3.',
    check: (_, lines) =>
      lines.flatMap((line, i) => {
        const s = stripPythonComments(line);
        return /^\s*print\s+[^(]/.test(s)
          ? [{ line: i + 1, message: 'Python 2 `print` statement — use `print()` function syntax' }]
          : [];
      }),
  },
  {
    id: 'wildcard-import',
    category: 'style',
    severity: 'warning',
    description: 'Wildcard imports (`from module import *`) pollute the namespace and make it unclear what is available.',
    suggestion: 'Import only what you need: `from module import specific_name, another_name`.',
    check: (_, lines) =>
      lines.flatMap((line, i) => {
        const s = stripPythonComments(line);
        return /^\s*from\s+\S+\s+import\s+\*/.test(s)
          ? [{ line: i + 1, message: 'Wildcard import `import *` — import only what you need' }]
          : [];
      }),
  },
  {
    id: 'percent-format',
    category: 'modernization',
    severity: 'hint',
    description: '`%` string formatting is the oldest Python formatting style and less readable than f-strings.',
    suggestion: 'Use f-strings (Python 3.6+): `f"Hello, {name}!"` instead of `"Hello, %s" % name`.',
    check: (_, lines) =>
      lines.flatMap((line, i) => {
        const s = stripPythonComments(line);
        return /["'].*%[sdifgro].*["']\s*%/.test(s)
          ? [{ line: i + 1, message: '`%` string formatting — use f-strings: `f"Hello, {name}!"`' }]
          : [];
      }),
  },
  {
    id: 'format-to-fstring',
    category: 'modernization',
    severity: 'hint',
    description: '`.format()` is verbose compared to f-strings introduced in Python 3.6.',
    suggestion: 'Use f-strings: `f"Hello, {name}!"` instead of `"Hello, {}".format(name)`.',
    check: (_, lines) =>
      lines.flatMap((line, i) => {
        const s = stripPythonComments(line);
        return /["'][^"']*\{\}[^"']*["']\s*\.format\s*\(/.test(s)
          ? [{ line: i + 1, message: '`.format()` string method — use f-string for clarity' }]
          : [];
      }),
  },
  {
    id: 'mutable-default-arg',
    category: 'syntax',
    severity: 'error',
    description: 'Mutable default arguments (list, dict, set) are shared across all calls, causing subtle state-mutation bugs.',
    suggestion: 'Use `None` as the default and initialize the mutable inside the function body.',
    check: (_, lines) =>
      lines.flatMap((line, i) => {
        const s = stripPythonComments(line);
        return /\bdef\s+\w+\s*\([^)]*=\s*[\[{]/.test(s)
          ? [{ line: i + 1, message: 'Mutable default argument — use `None` default and initialize in body' }]
          : [];
      }),
  },
  {
    id: 'except-pass',
    category: 'warning',
    severity: 'warning',
    description: 'Silently passing on exceptions hides bugs and makes debugging extremely difficult.',
    suggestion: 'At minimum, log the exception: `except Exception as e: logger.error(e)` or re-raise it.',
    check: (code) => {
      const lines = code.split('\n');
      const issues: Array<{ line: number; message: string }> = [];
      for (let i = 0; i < lines.length - 1; i++) {
        const s = stripPythonComments(lines[i]);
        const next = stripPythonComments(lines[i + 1]);
        if (/^\s*except[\s:]/.test(s) && /^\s*pass\s*$/.test(next)) {
          issues.push({ line: i + 1, message: '`except: pass` silences exceptions — log or re-raise instead' });
        }
      }
      return issues;
    },
  },
];
