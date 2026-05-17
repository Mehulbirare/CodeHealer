import type { CheckRule } from './base';
import { stripComments } from './base';
import { jsRules } from './javascript';

const tsOnlyRules: CheckRule[] = [
  {
    id: 'no-any',
    category: 'warning',
    severity: 'warning',
    description: 'Using `any` disables TypeScript\'s type checking for that value, defeating the purpose of using TypeScript.',
    suggestion: 'Use a specific type, `unknown` (then narrow with type guards), or a generic type parameter.',
    check: (_, lines) =>
      lines.flatMap((line, i) => {
        const s = stripComments(line);
        return /:\s*any\b|<any>|Array<any>|\bany\[\]/.test(s)
          ? [{ line: i + 1, message: '`any` type — use a specific type or `unknown` for safety' }]
          : [];
      }),
  },
  {
    id: 'no-as-any',
    category: 'warning',
    severity: 'warning',
    description: '`as any` casts silence type errors without actually solving the underlying type mismatch.',
    suggestion: 'Fix the type mismatch properly, or use `as unknown as TargetType` with a comment explaining why.',
    check: (_, lines) =>
      lines.flatMap((line, i) => {
        const s = stripComments(line);
        return /\bas\s+any\b/.test(s)
          ? [{ line: i + 1, message: '`as any` cast — fix the type mismatch or use `unknown`' }]
          : [];
      }),
  },
  {
    id: 'no-ts-ignore',
    category: 'warning',
    severity: 'warning',
    description: '`@ts-ignore` suppresses the next line\'s type errors without explaining why it is safe.',
    suggestion: 'Fix the underlying type error, or use `@ts-expect-error` with a comment documenting the reason.',
    check: (_, lines) =>
      lines.flatMap((line, i) =>
        /\/\/\s*@ts-ignore/.test(line)
          ? [{ line: i + 1, message: '`@ts-ignore` suppresses type errors — use `@ts-expect-error` with a comment' }]
          : []
      ),
  },
  {
    id: 'no-ts-nocheck',
    category: 'warning',
    severity: 'warning',
    description: '`@ts-nocheck` disables all type checking for the entire file.',
    suggestion: 'Remove `@ts-nocheck` and fix individual type errors. Use `@ts-expect-error` for specific exceptions.',
    check: (_, lines) =>
      lines.flatMap((line, i) =>
        /\/\/\s*@ts-nocheck/.test(line)
          ? [{ line: i + 1, message: '`@ts-nocheck` disables all type checking for this file' }]
          : []
      ),
  },
  {
    id: 'no-object-type',
    category: 'modernization',
    severity: 'info',
    description: 'The `Object` type accepts any non-nullish value and provides no useful type information.',
    suggestion: 'Use `Record<string, unknown>` for key-value maps, or define an explicit interface.',
    check: (_, lines) =>
      lines.flatMap((line, i) => {
        const s = stripComments(line);
        // Match : Object, <Object>, | Object, & Object, but not Object.keys()
        return /:\s*Object\b(?!\.)|\bObject\b(?!\.)(?=\s*[|&>,)])/.test(s)
          ? [{ line: i + 1, message: '`Object` type — use `Record<K,V>` or a specific interface' }]
          : [];
      }),
  },
  {
    id: 'no-function-type',
    category: 'modernization',
    severity: 'info',
    description: 'The `Function` type accepts any callable and provides no information about argument or return types.',
    suggestion: 'Use a specific function signature: `(arg: Type) => ReturnType` instead of `Function`.',
    check: (_, lines) =>
      lines.flatMap((line, i) => {
        const s = stripComments(line);
        return /:\s*Function\b|\bFunction\b(?=\s*[|&>,)])/.test(s)
          ? [{ line: i + 1, message: '`Function` type — use a typed signature `(x: T) => R` instead' }]
          : [];
      }),
  },
  {
    id: 'no-non-null-assertion',
    category: 'warning',
    severity: 'info',
    description: 'The non-null assertion `!` tells TypeScript to ignore null/undefined, which can cause runtime errors.',
    suggestion: 'Use optional chaining `?.` and nullish coalescing `??`, or add explicit null checks.',
    check: (_, lines) =>
      lines.flatMap((line, i) => {
        const s = stripComments(line);
        // Match x! where ! is used as non-null assertion (not !=, !==, !(...)
        const matches = (s.match(/\w+!/g) || []).filter(m => !m.includes('!='));
        return matches.length > 0
          ? [{ line: i + 1, message: 'Non-null assertion `!` — add proper null check or use `?.`' }]
          : [];
      }),
  },
];

export const tsRules: CheckRule[] = [...jsRules, ...tsOnlyRules];
