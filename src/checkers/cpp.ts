import type { CheckRule } from './base';
import { stripComments } from './base';

export const cppRules: CheckRule[] = [
  {
    id: 'c-printf',
    category: 'modernization',
    severity: 'info',
    description: '`printf`/`scanf` are C-style I/O functions with no type safety — format string mismatches cause undefined behavior.',
    suggestion: 'Use `std::cout`/`std::cin` for type-safe I/O, or `std::format` (C++20) for formatted output.',
    check: (_, lines) =>
      lines.flatMap((line, i) => {
        const s = stripComments(line);
        return /\b(printf|scanf|fprintf|fscanf|sprintf|sscanf)\s*\(/.test(s)
          ? [{ line: i + 1, message: '`printf`/`scanf` — use `std::cout`/`std::cin` for type-safe I/O' }]
          : [];
      }),
  },
  {
    id: 'raw-new',
    category: 'modernization',
    severity: 'warning',
    description: 'Raw `new` creates owning raw pointers that must be manually managed, risking memory leaks.',
    suggestion: 'Use `std::make_unique<T>()` or `std::make_shared<T>()` for automatic memory management.',
    check: (_, lines) =>
      lines.flatMap((line, i) => {
        const s = stripComments(line);
        // Match `new Type(` but not `new` inside strings
        return /\bnew\s+[A-Z]\w*\s*[\[(]|\bnew\s+[a-z]\w*\s*\[/.test(s)
          ? [{ line: i + 1, message: 'Raw `new` — use `std::make_unique<T>()` or `std::make_shared<T>()`' }]
          : [];
      }),
  },
  {
    id: 'raw-delete',
    category: 'modernization',
    severity: 'warning',
    description: 'Manual `delete` is error-prone — double-delete, use-after-free, and exception-safety issues.',
    suggestion: 'Use smart pointers (`unique_ptr`, `shared_ptr`) which automatically call destructors.',
    check: (_, lines) =>
      lines.flatMap((line, i) => {
        const s = stripComments(line);
        return /\bdelete\s+\w+|\bdelete\[\]\s+\w+/.test(s)
          ? [{ line: i + 1, message: 'Raw `delete` — use smart pointers for automatic memory management' }]
          : [];
      }),
  },
  {
    id: 'null-ptr',
    category: 'modernization',
    severity: 'info',
    description: '`NULL` is a C macro that can implicitly convert to integer types, causing ambiguous overload resolution.',
    suggestion: 'Use `nullptr` (C++11) for null pointer values — it is type-safe and cannot convert to integers.',
    check: (_, lines) =>
      lines.flatMap((line, i) => {
        const s = stripComments(line);
        return /\bNULL\b/.test(s)
          ? [{ line: i + 1, message: '`NULL` macro — use `nullptr` (C++11) for type-safe null pointer' }]
          : [];
      }),
  },
  {
    id: 'using-namespace',
    category: 'style',
    severity: 'warning',
    description: '`using namespace std;` in the global scope imports all std names, causing potential name conflicts.',
    suggestion: 'Use specific `using std::cout;` declarations or qualify names with `std::` prefix.',
    check: (_, lines) =>
      lines.flatMap((line, i) => {
        const s = stripComments(line);
        return /^\s*using\s+namespace\s+std\s*;/.test(s)
          ? [{ line: i + 1, message: '`using namespace std` in global scope — qualify with `std::` instead' }]
          : [];
      }),
  },
  {
    id: 'c-style-cast',
    category: 'modernization',
    severity: 'info',
    description: 'C-style casts `(Type)value` can silently perform reinterpret_cast or const_cast, hiding dangerous conversions.',
    suggestion: 'Use C++ casts: `static_cast<T>()`, `dynamic_cast<T>()`, `reinterpret_cast<T>()`, or `const_cast<T>()`.',
    check: (_, lines) =>
      lines.flatMap((line, i) => {
        const s = stripComments(line);
        return /\(\s*(int|char|float|double|long|short|unsigned|void\s*\*)\s*\)\s*\w/.test(s)
          ? [{ line: i + 1, message: 'C-style cast — use `static_cast<T>()` or `reinterpret_cast<T>()` instead' }]
          : [];
      }),
  },
  {
    id: 'c-header',
    category: 'modernization',
    severity: 'info',
    description: 'C-style headers like `<string.h>` and `<stdlib.h>` are deprecated in C++. Use their C++ equivalents.',
    suggestion: 'Replace `<string.h>` with `<cstring>`, `<stdlib.h>` with `<cstdlib>`, `<math.h>` with `<cmath>`, etc.',
    check: (_, lines) =>
      lines.flatMap((line, i) => {
        const s = stripComments(line);
        return /#include\s*<(string|stdlib|stdio|math|ctype|time|assert|limits)\.h>/.test(s)
          ? [{ line: i + 1, message: 'C-style header — use C++ equivalent (e.g. `<cstring>` instead of `<string.h>`)' }]
          : [];
      }),
  },
  {
    id: 'c-malloc',
    category: 'modernization',
    severity: 'warning',
    description: '`malloc`/`free` bypass constructors/destructors and mix poorly with C++ object lifecycle.',
    suggestion: 'Use `new`/`delete` (or better, smart pointers) to ensure constructors and destructors are called.',
    check: (_, lines) =>
      lines.flatMap((line, i) => {
        const s = stripComments(line);
        return /\b(malloc|calloc|realloc|free)\s*\(/.test(s)
          ? [{ line: i + 1, message: '`malloc`/`free` bypass C++ constructors — use smart pointers instead' }]
          : [];
      }),
  },
  {
    id: 'prefer-auto',
    category: 'modernization',
    severity: 'hint',
    description: 'Explicit iterator types are verbose. `auto` makes range-for loops and iterator declarations cleaner.',
    suggestion: 'Use `auto` for iterator types: `for (auto& item : container)` or `auto it = container.begin()`.',
    check: (_, lines) =>
      lines.flatMap((line, i) => {
        const s = stripComments(line);
        return /std::\w+<[^>]+>::(const_)?iterator/.test(s)
          ? [{ line: i + 1, message: 'Verbose iterator type — use `auto` for iterator declarations' }]
          : [];
      }),
  },
];
