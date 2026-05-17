import type { CheckRule } from './base';
import { stripComments } from './base';

export const jsRules: CheckRule[] = [
  {
    id: 'no-var',
    category: 'modernization',
    severity: 'warning',
    description: '`var` uses function-level scoping and hoisting, which leads to hard-to-track bugs.',
    suggestion: 'Use `const` for values that never change, or `let` for reassignable variables (block-scoped).',
    check: (_, lines) =>
      lines.flatMap((line, i) => {
        const s = stripComments(line);
        return /\bvar\s+[a-zA-Z_$]/.test(s)
          ? [{ line: i + 1, message: '`var` declaration — prefer `const` or `let`' }]
          : [];
      }),
  },
  {
    id: 'eqeqeq',
    category: 'warning',
    severity: 'warning',
    description: 'Loose equality (`==`/`!=`) performs type coercion, e.g. `0 == ""` evaluates to `true`.',
    suggestion: 'Use strict equality `===` or `!==` to compare values without implicit coercion.',
    check: (_, lines) =>
      lines.flatMap((line, i) => {
        const s = stripComments(line);
        const n = s.replace(/===|!==/g, '~~~');
        if (/[^=!<>]==[^=]|[^!]!=[^=]/.test(n)) {
          return [{ line: i + 1, message: 'Loose equality (`==`/`!=`) — use `===` or `!==`' }];
        }
        return [];
      }),
  },
  {
    id: 'no-eval',
    category: 'syntax',
    severity: 'error',
    description: '`eval()` executes arbitrary code at runtime, creating XSS vulnerabilities and breaking optimizations.',
    suggestion: 'Use `JSON.parse()` for JSON data, or restructure code to avoid dynamic evaluation.',
    check: (_, lines) =>
      lines.flatMap((line, i) => {
        const s = stripComments(line);
        return /\beval\s*\(/.test(s)
          ? [{ line: i + 1, message: '`eval()` usage — dangerous and prevents engine optimizations' }]
          : [];
      }),
  },
  {
    id: 'no-console',
    category: 'style',
    severity: 'hint',
    description: 'Debug `console` statements should not remain in production code.',
    suggestion: 'Remove debug `console` statements or replace with a structured logging library.',
    check: (_, lines) =>
      lines.flatMap((line, i) => {
        const s = stripComments(line);
        const m = s.match(/\bconsole\.(log|warn|error|info|debug|dir|table)\s*\(/);
        return m
          ? [{ line: i + 1, message: `\`console.${m[1]}()\` — remove or replace debug statement` }]
          : [];
      }),
  },
  {
    id: 'no-new-array',
    category: 'modernization',
    severity: 'info',
    description: '`new Array(n)` creates a sparse array of length n, not `[n]` — behavior is often surprising.',
    suggestion: 'Use array literal `[]` syntax or `Array.from({ length: n })` for explicit intent.',
    check: (_, lines) =>
      lines.flatMap((line, i) => {
        const s = stripComments(line);
        return /\bnew\s+Array\s*\(/.test(s)
          ? [{ line: i + 1, message: '`new Array()` — use `[]` or `Array.from()` instead' }]
          : [];
      }),
  },
  {
    id: 'no-new-object',
    category: 'modernization',
    severity: 'info',
    description: '`new Object()` is verbose and equivalent to the object literal syntax.',
    suggestion: 'Use object literal `{}` instead of `new Object()`.',
    check: (_, lines) =>
      lines.flatMap((line, i) => {
        const s = stripComments(line);
        return /\bnew\s+Object\s*\(\s*\)/.test(s)
          ? [{ line: i + 1, message: '`new Object()` — use object literal `{}` instead' }]
          : [];
      }),
  },
  {
    id: 'no-document-write',
    category: 'warning',
    severity: 'warning',
    description: '`document.write()` overwrites the entire page when called after load and is considered deprecated.',
    suggestion: 'Use DOM methods like `element.textContent`, `element.innerHTML`, or `document.createElement()`.',
    check: (_, lines) =>
      lines.flatMap((line, i) => {
        const s = stripComments(line);
        return /\bdocument\.write\s*\(/.test(s)
          ? [{ line: i + 1, message: '`document.write()` is deprecated — use DOM manipulation instead' }]
          : [];
      }),
  },
  {
    id: 'no-escape',
    category: 'modernization',
    severity: 'warning',
    description: '`escape()` and `unescape()` are deprecated and do not correctly encode all URI characters.',
    suggestion: 'Use `encodeURIComponent()`/`decodeURIComponent()` for query strings or `encodeURI()`/`decodeURI()` for full URLs.',
    check: (_, lines) =>
      lines.flatMap((line, i) => {
        const s = stripComments(line);
        return /\b(escape|unescape)\s*\(/.test(s)
          ? [{ line: i + 1, message: '`escape()`/`unescape()` are deprecated — use `encodeURIComponent()`' }]
          : [];
      }),
  },
  {
    id: 'prefer-arrow-callback',
    category: 'modernization',
    severity: 'hint',
    description: 'Arrow functions are concise and lexically bind `this`, preventing common `this` binding bugs in callbacks.',
    suggestion: 'Replace anonymous `function()` callbacks with arrow functions `() => {}`.',
    check: (_, lines) =>
      lines.flatMap((line, i) => {
        const s = stripComments(line);
        return /[,(]\s*function\s*\(/.test(s)
          ? [{ line: i + 1, message: 'Anonymous `function()` in callback — consider arrow function `() =>`' }]
          : [];
      }),
  },
  {
    id: 'prefer-template-literal',
    category: 'modernization',
    severity: 'hint',
    description: 'String concatenation with `+` is verbose and error-prone. Template literals are more readable.',
    suggestion: 'Use template literals: `` `Hello, ${name}!` `` instead of `"Hello, " + name + "!"`.',
    check: (_, lines) =>
      lines.flatMap((line, i) => {
        const s = stripComments(line);
        if (/(["'][^"']*["']\s*\+\s*\w|\w\s*\+\s*["'][^"']*["'])/.test(s)) {
          return [{ line: i + 1, message: 'String concatenation with `+` — consider template literal' }];
        }
        return [];
      }),
  },
  {
    id: 'no-then-chain',
    category: 'modernization',
    severity: 'info',
    description: 'Chained `.then()` calls create "promise chains" that are harder to read and debug than `async/await`.',
    suggestion: 'Convert promise chains to `async/await` for flatter, more readable asynchronous code.',
    check: (code) => {
      const lines = code.split('\n');
      const issues: Array<{ line: number; message: string }> = [];
      let chainStart = -1;
      let chainCount = 0;
      for (let i = 0; i < lines.length; i++) {
        const s = stripComments(lines[i]);
        if (/\.then\s*\(/.test(s)) {
          if (chainStart === -1) chainStart = i;
          chainCount++;
        } else if (chainCount >= 2) {
          issues.push({ line: chainStart + 1, message: `${chainCount} chained \`.then()\` calls — prefer \`async/await\`` });
          chainStart = -1;
          chainCount = 0;
        } else {
          chainStart = -1;
          chainCount = 0;
        }
      }
      if (chainCount >= 2 && chainStart !== -1) {
        issues.push({ line: chainStart + 1, message: `${chainCount} chained \`.then()\` calls — prefer \`async/await\`` });
      }
      return issues;
    },
  },
  {
    id: 'no-typeof-undefined',
    category: 'modernization',
    severity: 'info',
    description: '`typeof x === "undefined"` is verbose. Modern JavaScript safely compares against `undefined`.',
    suggestion: 'Use `x === undefined` or optional chaining `x?.property` for cleaner undefined checks.',
    check: (_, lines) =>
      lines.flatMap((line, i) => {
        const s = stripComments(line);
        return /typeof\s+\w+\s*[!=]==?\s*["']undefined["']/.test(s)
          ? [{ line: i + 1, message: '`typeof x === "undefined"` — use `x === undefined` instead' }]
          : [];
      }),
  },
  {
    id: 'no-alert',
    category: 'style',
    severity: 'warning',
    description: '`alert()`, `confirm()`, and `prompt()` block the main thread and provide poor user experience.',
    suggestion: 'Use custom modal or dialog UI components for a better user experience.',
    check: (_, lines) =>
      lines.flatMap((line, i) => {
        const s = stripComments(line);
        return /\b(alert|confirm|prompt)\s*\(/.test(s)
          ? [{ line: i + 1, message: '`alert()`/`confirm()`/`prompt()` — replace with custom UI dialogs' }]
          : [];
      }),
  },
  {
    id: 'prefer-optional-chain',
    category: 'modernization',
    severity: 'hint',
    description: 'Manual null-guard patterns like `obj && obj.prop` are replaced by optional chaining in ES2020.',
    suggestion: 'Use optional chaining `obj?.prop` to simplify null and undefined checks.',
    check: (_, lines) =>
      lines.flatMap((line, i) => {
        const s = stripComments(line);
        return /\b\w+\s*&&\s*\w+\.\w+/.test(s)
          ? [{ line: i + 1, message: 'Manual null guard (`&&`) — consider optional chaining `?.`' }]
          : [];
      }),
  },
  {
    id: 'no-inner-html-assign',
    category: 'performance',
    severity: 'warning',
    description: 'Assigning to `innerHTML` forces full re-parsing of HTML and can introduce XSS vulnerabilities.',
    suggestion: 'Use `textContent` for plain text, or `createElement()` + `appendChild()` for safe DOM manipulation.',
    check: (_, lines) =>
      lines.flatMap((line, i) => {
        const s = stripComments(line);
        return /\.innerHTML\s*[+]?=/.test(s)
          ? [{ line: i + 1, message: '`innerHTML` assignment — use `textContent` or DOM methods for safety' }]
          : [];
      }),
  },
  {
    id: 'no-with',
    category: 'syntax',
    severity: 'error',
    description: '`with` statements make it impossible to determine at compile time which identifier refers to which variable.',
    suggestion: 'Explicitly reference object properties: `obj.property` instead of using `with (obj)`.',
    check: (_, lines) =>
      lines.flatMap((line, i) => {
        const s = stripComments(line);
        return /\bwith\s*\(/.test(s)
          ? [{ line: i + 1, message: '`with` statement is forbidden in strict mode and confuses scope' }]
          : [];
      }),
  },
];
