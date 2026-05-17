<div align="center">

```
███████╗██╗██╗  ██╗ ██████╗ ██████╗ ██████╗ ███████╗
██╔════╝██║╚██╗██╔╝██╔════╝██╔═══██╗██╔══██╗██╔════╝
█████╗  ██║ ╚███╔╝ ██║     ██║   ██║██║  ██║█████╗
██╔══╝  ██║ ██╔██╗ ██║     ██║   ██║██║  ██║██╔══╝
██║     ██║██╔╝ ██╗╚██████╗╚██████╔╝██████╔╝███████╗
╚═╝     ╚═╝╚═╝  ╚═╝ ╚═════╝ ╚═════╝ ╚═════╝ ╚══════╝
```

**Detect. Fix. Trust. — In your browser, offline, instantly.**

[![MIT License](https://img.shields.io/badge/license-MIT-blue.svg?style=flat-square)](./LICENSE)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.x-3178c6?style=flat-square&logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![React](https://img.shields.io/badge/React-19-61dafb?style=flat-square&logo=react&logoColor=white)](https://react.dev/)
[![Vite](https://img.shields.io/badge/Vite-7.x-646cff?style=flat-square&logo=vite&logoColor=white)](https://vitejs.dev/)
[![No Backend](https://img.shields.io/badge/backend-none-success?style=flat-square)](#)
[![PRs Welcome](https://img.shields.io/badge/PRs-welcome-brightgreen?style=flat-square)](./CONTRIBUTING.md)

</div>

---

## What is FixCode?

**FixCode** is a fully client-side developer tool that detects, explains, and automatically repairs syntax errors and common programming mistakes — with zero latency, zero telemetry, and zero server round-trips.

Unlike AI-powered code fixers that send your code to a remote model, FixCode runs entirely inside your browser using deterministic rule-based analysis. Every fix is explainable, reproducible, and instant.

> **Philosophy:** Developers deserve tools that are fast, transparent, and respect their privacy. FixCode never sees your code — your browser does.

---

## Features

| Feature | Description |
|---|---|
| 📁 **Multi-Project Workspace** | Create, rename, switch, and delete named projects — each with its own code, language, and history |
| 🔍 **Syntax Error Detection** | Identifies missing semicolons, unclosed brackets, mismatched delimiters, and structural issues |
| 🔧 **Auto-Fix Engine** | Applies safe, well-understood fixes automatically — no guessing, no hallucinations |
| 📊 **Side-by-Side Diff** | Before/after comparison view with highlighted change regions using `diff-match-patch` |
| 💡 **Fix Explanations** | Every applied fix is annotated with a human-readable explanation of what changed and why |
| 🕓 **Per-Project History** | Last 50 analyses stored per project in localStorage — restore any previous run in one click |
| 💾 **Auto-Save** | Editor content is automatically saved to the active project as you type |
| ⚡ **Sub-200ms Analysis** | Deterministic rule execution with no network calls — results appear instantly |
| 🌐 **Fully Offline** | No AI, no API, no database, no backend — zero external dependencies at runtime |
| 🎨 **Monaco Editor** | The same editor that powers VS Code, with syntax highlighting and IntelliSense |

---

## Supported Languages

FixCode currently supports **5 languages** with dedicated rule engines:

<table>
<thead>
<tr><th>Language</th><th>Rules Covered</th></tr>
</thead>
<tbody>
<tr>
  <td><strong>JavaScript</strong></td>
  <td>Missing semicolons, unclosed brackets/parens/braces, <code>var</code> → <code>let/const</code> suggestions, console.log cleanup, formatting normalization</td>
</tr>
<tr>
  <td><strong>TypeScript</strong></td>
  <td>All JS rules + type annotation errors, missing <code>interface</code> fields, invalid generic syntax, missing import types</td>
</tr>
<tr>
  <td><strong>Python</strong></td>
  <td>IndentationError, missing colons after <code>if/for/while/def/class</code>, unused imports, mixed tabs/spaces, trailing whitespace</td>
</tr>
<tr>
  <td><strong>Java</strong></td>
  <td>Missing semicolons, unclosed braces, missing <code>public static void main</code> signature, import resolution, basic access modifier issues</td>
</tr>
<tr>
  <td><strong>C++</strong></td>
  <td>Missing semicolons, unclosed braces, invalid <code>#include</code> syntax, missing <code>std::</code> namespace, formatting issues</td>
</tr>
</tbody>
</table>

> Want support for another language? [Open a feature request →](../../issues/new?template=feature_request.md)

---

## Architecture

FixCode is a single-page React application with no backend. Here's how it works:

```
┌──────────────────────────────────────────────────────────┐
│                     Browser (Client)                      │
│                                                           │
│  ┌─────────────────────────────────────────────────────┐ │
│  │               Zustand Store (localStorage)           │ │
│  │  projects[]  activeProjectId  result  isAnalyzing   │ │
│  └───────────────────────┬─────────────────────────────┘ │
│                          │                                │
│  ┌───────────────────────▼─────────────────────────────┐ │
│  │                   Project Workspace                  │ │
│  │   name · language · code · history (last 50)        │ │
│  └──────────┬──────────────────────────────────────────┘ │
│             │                                             │
│  ┌──────────▼──────────┐    ┌───────────────────────┐    │
│  │    Monaco Editor    │───▶│     Rule Engine        │    │
│  │    (Input Panel)    │    │  JS / TS / PY          │    │
│  └─────────────────────┘    │  JAVA / C++            │    │
│                             └──────────┬──────────────┘   │
│                                        │                  │
│              ┌─────────────────────────┼──────────┐       │
│              ▼                         ▼          ▼       │
│      ┌──────────────┐  ┌──────────────────┐  ┌──────┐    │
│      │  Fixed Code  │  │  Fix Explanations│  │ Diff │    │
│      └──────────────┘  └──────────────────┘  └──────┘    │
└──────────────────────────────────────────────────────────┘
```

**No network calls are made after the initial page load.** Once the app is loaded, it operates entirely in memory.

---

## Tech Stack

```
Frontend Framework   React 19 + Vite 7
Language             TypeScript 5
Editor               Monaco Editor (VS Code core)
Styling              Tailwind CSS v3
Animations           Framer Motion
State Management     Zustand (with localStorage persistence)
Diff Algorithm       diff-match-patch
```

### Why these choices?

- **Monaco Editor** — The gold standard for code editing in browsers. Provides syntax highlighting, multi-cursor, and keyboard shortcuts developers already know.
- **Zustand** — Minimal boilerplate, no providers, and excellent DevTools support. Project workspaces are persisted via the `persist` middleware with a version migration path.
- **diff-match-patch** — Google's battle-tested diff library, used in production by Google Docs and others.
- **Vite** — Sub-second HMR and optimized production builds with native ESM.

---

## Getting Started

### Prerequisites

- Node.js `>=18.0.0`
- npm `>=9.0.0`

### Installation

```bash
# Clone the repository
git clone https://github.com/your-username/fixcode.git
cd fixcode

# Install dependencies
npm install
```

### Development

```bash
# Start the dev server with HMR
npm run dev
```

The app will be available at `http://localhost:5173`.

### Production Build

```bash
# Type-check + build for production
npm run build

# Preview the production build locally
npm run preview
```

### Other Scripts

```bash
npm run lint          # Run ESLint
npm run type-check    # Run tsc without emitting files
```

---

## Usage

### Projects

FixCode organizes your work into **named projects**. Each project stores its own language setting, editor code, and analysis history independently.

- Click the **project dropdown** in the header to switch between projects
- Use **"New project"** inside the dropdown to create one
- Hover a project row to reveal **rename (✎)** and **delete (✕)** actions
- Switching projects automatically restores that project's last code and language

### Analyzing Code

1. **Select a project** — or create a new one from the header dropdown
2. **Select a language** — use the language dropdown (JS, TS, Python, Java, C++)
3. **Paste or type code** — editor auto-saves to the active project as you type
4. **Click "Analyze & Fix"** — the rule engine runs instantly in the browser
5. **Review the results** — switch between the **Fixes** tab (annotated issue list) and the **Diff** tab (before/after comparison)
6. **Copy or download** — export the fixed code via the toolbar buttons

### History

Each project maintains its own history of the last 50 analyses. Open it with the **History** button in the header. Click any entry to restore that code and language to the editor.

### Keyboard Shortcuts

| Shortcut | Action |
|---|---|
| `Ctrl/Cmd + Enter` | Run analysis |
| `Ctrl/Cmd + Shift + C` | Copy fixed code |
| `Ctrl/Cmd + D` | Toggle diff view |
| `Ctrl/Cmd + K` | Clear editor |

---

## Design Principles

FixCode is built around a strict set of constraints that prioritize **developer trust** over feature breadth:

- **Deterministic output** — The same input always produces the same output. No variance, no surprises.
- **Explainability first** — Every fix must be explainable to a junior developer in one sentence.
- **Zero telemetry** — No analytics, no error tracking, no usage data collection of any kind.
- **Offline-capable** — Works after the initial load with no internet connection.
- **Fast by default** — Analysis must complete in under 200ms on a mid-range device.
- **Conservative fixes only** — FixCode never rewrites logic, only corrects structural/syntactic issues where the intent is unambiguous.

---

## Contributing

Contributions are welcome. Please read the [contribution guide](./CONTRIBUTING.md) before opening a PR.

### Adding a New Language

1. Create a new analyzer in `src/analyzers/<language>.ts` extending `BaseAnalyzer`
2. Implement `analyze(code)` and `fix(code, fixes)` methods
3. Register it in `src/analyzers/index.ts`
4. Add the language to the `Language` union type in `src/types/index.ts`

Each analyzer must follow this contract:

```typescript
interface Analyzer {
  analyze(code: string): Promise<CodeFix[]>;
  fix(code: string, fixes: CodeFix[]): Promise<string>;
}

interface CodeFix {
  line: number;
  column: number;
  message: string;
  severity: 'error' | 'warning' | 'info';
  fix: string;
  explanation: string;
}
```

### Reporting Bugs

Please include:
- The language selected
- The input code that triggered the issue
- The actual vs. expected output
- Browser and OS version

---

## Roadmap

- [ ] CSS / SCSS support
- [ ] Go support
- [ ] Rust support
- [ ] VS Code extension
- [ ] CLI version (`npx fixcode ./src`)
- [x] Rule severity levels (error / warning / info)
- [ ] Custom rule configuration via `.fixcoderc`
- [ ] Shareable fix permalinks (URL-encoded state)
- [x] Multi-project workspace with per-project history
- [x] Auto-save editor state per project

---

## License

MIT © 2024. See [LICENSE](./LICENSE) for full terms.

---

<div align="center">

Built for developers who value speed, transparency, and privacy.

**[Report a Bug](../../issues/new?template=bug_report.md) · [Request a Feature](../../issues/new?template=feature_request.md) · [Discuss](../../discussions)**

</div>
