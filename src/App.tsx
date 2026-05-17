import { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { CodeEditor } from './components/CodeEditor';
import { DiffViewer } from './components/DiffViewer';
import { FixExplanation } from './components/FixExplanation';
import { OnlineCheckPanel } from './components/OnlineCheckPanel';
import { LanguageSelector } from './components/LanguageSelector';
import { LoadingAnimation } from './components/LoadingAnimation';
import { HistoryPanel } from './components/HistoryPanel';
import { Toast } from './components/Toast';
import { StatsBar } from './components/StatsBar';
import { ProjectSelector } from './components/ProjectSelector';
import { useStore, selectActiveProject } from './store/useStore';
import { analyzeCode } from './services/analyzer';
import { runOnlineCheck } from './checkers';
import type { HistoryItem, Language, OnlineCheckResult } from './types';

type ResultTab = 'fixes' | 'diff' | 'check';
type MobileView = 'editor' | 'results';

const extMap: Record<Language, string> = {
  typescript: 'ts',
  javascript: 'js',
  python: 'py',
  java: 'java',
  cpp: 'cpp',
};

function App() {
  const state = useStore();
  const activeProject = selectActiveProject(state);
  const { code, language, history } = activeProject;
  const {
    projects,
    activeProjectId,
    result,
    isAnalyzing,
    setCode,
    setLanguage,
    setResult,
    setIsAnalyzing,
    addToHistory,
    createProject,
    deleteProject,
    renameProject,
    setActiveProject,
  } = state;

  const [showHistory, setShowHistory] = useState(false);
  const [toast, setToast] = useState<string | null>(null);
  const [resultTab, setResultTab] = useState<ResultTab>('check');
  const [mobileView, setMobileView] = useState<MobileView>('editor');
  const [onlineCheckResult, setOnlineCheckResult] = useState<OnlineCheckResult | null>(null);
  const [isChecking, setIsChecking] = useState(false);

  // Debounced live validation — runs 500ms after code/language change
  useEffect(() => {
    if (!code.trim()) {
      setOnlineCheckResult(null);
      setIsChecking(false);
      return;
    }
    setIsChecking(true);
    const timer = setTimeout(() => {
      setOnlineCheckResult(runOnlineCheck(code, language));
      setIsChecking(false);
    }, 500);
    return () => clearTimeout(timer);
  }, [code, language]);

  // Reset check result when switching projects
  useEffect(() => {
    setShowHistory(false);
    setOnlineCheckResult(null);
  }, [activeProjectId]);

  const showToast = useCallback((msg: string) => {
    setToast(msg);
  }, []);

  const handleAnalyze = useCallback(async () => {
    if (!code.trim() || isAnalyzing) return;
    setIsAnalyzing(true);
    try {
      const analysisResult = await analyzeCode(code, language);
      setResult(analysisResult);
      addToHistory({
        id: Date.now().toString(),
        language,
        originalCode: code,
        fixedCode: analysisResult.fixedCode,
        timestamp: Date.now(),
      });
      setResultTab('fixes');
      setMobileView('results');
    } catch (err) {
      console.error('Analysis error:', err);
    } finally {
      setIsAnalyzing(false);
    }
  }, [code, language, isAnalyzing, setResult, setIsAnalyzing, addToHistory]);

  const handleCopy = useCallback((text: string) => {
    navigator.clipboard.writeText(text);
    showToast('Copied to clipboard!');
  }, [showToast]);

  const handleDownload = useCallback((text: string, lang: Language) => {
    const blob = new Blob([text], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `fixed.${extMap[lang]}`;
    a.click();
    URL.revokeObjectURL(url);
    showToast('Downloaded!');
  }, [showToast]);

  const handleRestore = useCallback((item: HistoryItem) => {
    setCode(item.originalCode);
    setLanguage(item.language);
    setResult(null);
    setMobileView('editor');
  }, [setCode, setLanguage, setResult]);

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      const mod = e.ctrlKey || e.metaKey;
      if (mod && e.key === 'Enter') {
        e.preventDefault();
        handleAnalyze();
      } else if (mod && e.shiftKey && e.key === 'C') {
        e.preventDefault();
        if (result) handleCopy(result.fixedCode);
      } else if (mod && e.key === 'k') {
        e.preventDefault();
        setCode('');
        setResult(null);
      } else if (mod && e.key === 'd') {
        e.preventDefault();
        if (result) setResultTab(t => t === 'diff' ? 'fixes' : 'diff');
      }
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [handleAnalyze, handleCopy, result, setCode, setResult]);

  const allFixes = result ? [...result.errors, ...result.fixes] : [];
  const checkCount = onlineCheckResult?.issues.length ?? 0;
  const checkHasErrors = (onlineCheckResult?.issues.filter(i => i.severity === 'error').length ?? 0) > 0;

  // When there's no result, always show the check tab content
  const activeTab: ResultTab = !result && resultTab !== 'check' ? 'check' : resultTab;

  return (
    <div className="h-screen flex flex-col bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900">

      {/* Header */}
      <motion.header
        initial={{ y: -20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        className="flex-shrink-0 flex flex-wrap items-center gap-x-3 gap-y-2 px-4 sm:px-5 py-2.5 sm:py-3 bg-white/5 backdrop-blur-md border-b border-white/10"
      >
        <h1 className="text-xl font-bold bg-gradient-to-r from-neon-cyan to-neon-pink bg-clip-text text-transparent tracking-tight">
          FixCode
        </h1>

        <div className="hidden sm:block w-px h-5 bg-white/10" />

        {/* Controls — inline on desktop, full-width second row on mobile */}
        <div className="flex items-center gap-2 order-last w-full sm:order-none sm:w-auto">
          <ProjectSelector
            projects={projects}
            activeProjectId={activeProjectId}
            onSwitch={setActiveProject}
            onCreate={createProject}
            onRename={renameProject}
            onDelete={deleteProject}
          />
          <LanguageSelector language={language} onChange={setLanguage} />
        </div>

        <div className="flex-1" />

        {result && <div className="hidden sm:block"><StatsBar result={result} /></div>}

        <button
          onClick={() => setShowHistory(h => !h)}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all bg-white/5 border border-white/10 hover:bg-white/10 ${
            showHistory ? 'text-neon-cyan border-neon-cyan/40' : 'text-gray-400'
          }`}
        >
          History
          {history.length > 0 && (
            <span className="bg-neon-cyan/20 text-neon-cyan rounded-full w-4 h-4 flex items-center justify-center text-xs leading-none">
              {history.length > 9 ? '9+' : history.length}
            </span>
          )}
        </button>
      </motion.header>

      {/* Mobile tab bar */}
      <div className="sm:hidden flex-shrink-0 flex border-b border-white/10">
        <button
          onClick={() => setMobileView('editor')}
          className={`flex-1 py-2.5 text-xs font-semibold transition-colors border-b-2 ${
            mobileView === 'editor'
              ? 'text-neon-cyan border-neon-cyan'
              : 'text-gray-500 border-transparent hover:text-gray-300'
          }`}
        >
          Editor
        </button>
        <button
          onClick={() => setMobileView('results')}
          className={`flex-1 py-2.5 text-xs font-semibold transition-colors border-b-2 ${
            mobileView === 'results'
              ? 'text-neon-cyan border-neon-cyan'
              : 'text-gray-500 border-transparent hover:text-gray-300'
          }`}
        >
          {activeTab === 'check'
            ? `Check${checkCount > 0 ? ` (${checkCount})` : ''}`
            : `Results (${allFixes.length})`}
        </button>
      </div>

      {/* Split pane */}
      <div className="flex flex-1 overflow-hidden">

        {/* Left — editor */}
        <div className={`flex-col w-full sm:w-1/2 border-r border-white/10 overflow-hidden ${mobileView === 'editor' ? 'flex' : 'hidden sm:flex'}`}>
          <div className="flex-shrink-0 flex items-center justify-between px-4 py-2 bg-white/3 border-b border-white/10">
            <span className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Input</span>
            <div className="flex items-center gap-2">
              <button
                onClick={() => { setCode(''); setResult(null); }}
                title="Clear editor (⌘K)"
                className="px-2.5 py-1 text-xs bg-white/5 border border-white/10 rounded text-gray-500 hover:text-gray-300 hover:bg-white/10 transition-colors"
              >
                Clear
              </button>
              <motion.button
                whileHover={{ scale: 1.03 }}
                whileTap={{ scale: 0.97 }}
                onClick={handleAnalyze}
                disabled={isAnalyzing || !code.trim()}
                title="Analyze & Fix (⌘Enter)"
                className="flex items-center gap-1.5 px-3 py-1 bg-neon-cyan text-gray-900 text-xs font-bold rounded disabled:opacity-40 disabled:cursor-not-allowed"
              >
                {isAnalyzing ? (
                  <><LoadingAnimation /><span className="hidden sm:inline">Analyzing…</span></>
                ) : (
                  <><span className="sm:hidden">Fix</span><span className="hidden sm:inline">Analyze & Fix</span></>
                )}
              </motion.button>
            </div>
          </div>

          <div className="flex-1 overflow-hidden">
            <CodeEditor
              code={code}
              language={language}
              onChange={setCode}
              errors={result?.errors.map(e => ({ line: e.line, message: e.message })) ?? []}
              checkIssues={onlineCheckResult?.issues ?? []}
            />
          </div>
        </div>

        {/* Right — results + online check */}
        <div className={`flex-col w-full sm:w-1/2 overflow-hidden ${mobileView === 'results' ? 'flex' : 'hidden sm:flex'}`}>

          {/* Tab bar — always visible */}
          <div className="flex-shrink-0 flex items-center gap-1.5 px-4 py-2 bg-white/3 border-b border-white/10">
            {/* Online Check tab */}
            <button
              onClick={() => { setResultTab('check'); setMobileView('results'); }}
              className={`flex items-center gap-1.5 px-2.5 py-1 text-xs rounded font-semibold transition-all ${
                activeTab === 'check'
                  ? 'bg-neon-cyan text-gray-900'
                  : 'text-gray-500 hover:text-gray-300 bg-white/5 hover:bg-white/10'
              }`}
            >
              <span>Live Check</span>
              {checkCount > 0 && (
                <span className={`rounded-full w-4 h-4 flex items-center justify-center text-xs leading-none font-bold ${
                  activeTab === 'check'
                    ? 'bg-gray-900/40 text-gray-900'
                    : checkHasErrors
                    ? 'bg-red-500/20 text-red-400'
                    : 'bg-yellow-500/20 text-yellow-400'
                }`}>
                  {checkCount > 9 ? '9+' : checkCount}
                </span>
              )}
              {isChecking && (
                <motion.span
                  animate={{ opacity: [0.4, 1, 0.4] }}
                  transition={{ duration: 0.8, repeat: Infinity }}
                  className={`w-1.5 h-1.5 rounded-full ${activeTab === 'check' ? 'bg-gray-900' : 'bg-cyan-400'}`}
                />
              )}
            </button>

            {/* Fixes + Diff — only when analysis result exists */}
            {result && (
              <>
                <button
                  onClick={() => setResultTab('fixes')}
                  className={`px-2.5 py-1 text-xs rounded font-semibold transition-all ${
                    activeTab === 'fixes'
                      ? 'bg-neon-cyan text-gray-900'
                      : 'text-gray-500 hover:text-gray-300 bg-white/5 hover:bg-white/10'
                  }`}
                >
                  Fixes ({allFixes.length})
                </button>
                <button
                  onClick={() => setResultTab('diff')}
                  title="Toggle diff (⌘D)"
                  className={`px-2.5 py-1 text-xs rounded font-semibold transition-all ${
                    activeTab === 'diff'
                      ? 'bg-neon-cyan text-gray-900'
                      : 'text-gray-500 hover:text-gray-300 bg-white/5 hover:bg-white/10'
                  }`}
                >
                  Diff
                </button>
              </>
            )}

            <div className="flex-1" />

            {result && (
              <>
                <div className="sm:hidden"><StatsBar result={result} /></div>
                <button
                  onClick={() => handleCopy(result.fixedCode)}
                  title="Copy fixed code (⌘⇧C)"
                  className="px-2.5 py-1 text-xs bg-white/5 border border-white/10 rounded text-gray-500 hover:text-gray-300 hover:bg-white/10 transition-colors"
                >
                  Copy
                </button>
                <button
                  onClick={() => handleDownload(result.fixedCode, result.language)}
                  className="hidden sm:block px-2.5 py-1 text-xs bg-white/5 border border-white/10 rounded text-gray-500 hover:text-gray-300 hover:bg-white/10 transition-colors"
                >
                  Download
                </button>
              </>
            )}
          </div>

          {/* Panel content */}
          <div className="flex-1 overflow-auto p-4">
            <AnimatePresence mode="wait">
              {activeTab === 'check' ? (
                <motion.div
                  key="check"
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0 }}
                >
                  <OnlineCheckPanel result={onlineCheckResult} isChecking={isChecking} />
                </motion.div>
              ) : activeTab === 'fixes' ? (
                <motion.div
                  key="fixes"
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0 }}
                >
                  <FixExplanation fixes={allFixes} />
                </motion.div>
              ) : (
                <motion.div
                  key="diff"
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0 }}
                  className="h-full"
                >
                  {result && <DiffViewer original={result.originalCode} fixed={result.fixedCode} />}
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </div>

      {/* History panel */}
      <AnimatePresence>
        {showHistory && (
          <HistoryPanel
            onRestore={handleRestore}
            onClose={() => setShowHistory(false)}
          />
        )}
      </AnimatePresence>

      <Toast message={toast} onDismiss={() => setToast(null)} />
    </div>
  );
}

export default App;
