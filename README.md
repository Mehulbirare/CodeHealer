# FixCode

A fully client-side web application that detects and automatically fixes syntax errors and common programming mistakes in your code.

## Features

- 🔍 **Syntax Error Detection** - Detects missing semicolons, unclosed brackets, and other syntax issues
- 🔧 **Auto-Fix** - Automatically fixes safe, well-known errors
- 📊 **Before/After Comparison** - Side-by-side diff view showing all changes
- 💡 **Clear Explanations** - Detailed explanations for each fix applied
- 🎨 **Modern UI** - Beautiful dark mode interface with glassmorphism and neon accents
- ⚡ **Fully Offline** - No AI, no database, no backend - everything runs in your browser

## Supported Languages

1. **JavaScript** - Missing semicolons, unclosed brackets, undefined variables, formatting
2. **TypeScript** - Type errors, missing imports, invalid typings, formatting
3. **Python** - SyntaxError, indentation issues, missing colons, unused imports
4. **Java** - Missing semicolons, missing braces, import issues, basic syntax errors
5. **C++** - Missing semicolons, unclosed braces, invalid includes, formatting issues

## Tech Stack

- **React + Vite** - Modern frontend framework
- **TypeScript** - Type-safe development
- **Monaco Editor** - VS Code editor in the browser
- **Tailwind CSS** - Utility-first CSS framework
- **Framer Motion** - Smooth animations
- **Zustand** - Lightweight state management
- **diff-match-patch** - Diff visualization

## Getting Started

### Installation

```bash
npm install
```

### Development

```bash
npm run dev
```

### Build

```bash
npm run build
```

### Preview

```bash
npm run preview
```

## Usage

1. Select your programming language
2. Paste or type your code in the editor
3. Click "Analyze & Fix"
4. Review the fixes and explanations
5. Copy or download the fixed code

## Design Principles

- ✅ Fully offline-capable
- ✅ Deterministic output
- ✅ Fast execution (<200ms)
- ✅ Transparent fixes
- ✅ Developer trust

## License

MIT
