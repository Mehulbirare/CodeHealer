import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { CodeEditor } from './components/CodeEditor';
import { DiffViewer } from './components/DiffViewer';
import { FixExplanation } from './components/FixExplanation';
import { LanguageSelector } from './components/LanguageSelector';
import { LoadingAnimation } from './components/LoadingAnimation';
import { useStore } from './store/useStore';
import { analyzeCode } from './services/analyzer';

function App() {
  const {
    code,
    language,
    result,
    isAnalyzing,
    setCode,
    setLanguage,
    setResult,
    setIsAnalyzing,
    addToHistory,
  } = useStore();

  const [activeTab, setActiveTab] = useState<'editor' | 'results'>('editor');

  const handleAnalyze = async () => {
    if (!code.trim()) return;

    setIsAnalyzing(true);
    try {
      const analysisResult = await analyzeCode(code, language);
      setResult(analysisResult);
      
      // Add to history
      addToHistory({
        id: Date.now().toString(),
        language,
        originalCode: code,
        fixedCode: analysisResult.fixedCode,
        timestamp: Date.now(),
      });

      setActiveTab('results');
    } catch (error) {
      console.error('Analysis error:', error);
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleCopy = (text: string) => {
    navigator.clipboard.writeText(text);
  };

  const handleDownload = (text: string, filename: string) => {
    const blob = new Blob([text], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900">
      {/* Header */}
      <motion.header
        initial={{ y: -20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        className="glass-strong border-b border-white/10 p-6"
      >
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center justify-between mb-4">
            <h1 className="text-3xl font-bold bg-gradient-to-r from-neon-cyan to-neon-pink bg-clip-text text-transparent">
              FixCode
            </h1>
            <LanguageSelector language={language} onChange={setLanguage} />
          </div>
          <p className="text-gray-400 text-sm">
            Paste your code and get instant fixes for syntax errors and common mistakes
          </p>
        </div>
      </motion.header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto p-6">
        {/* Tabs */}
        <div className="flex gap-2 mb-4">
          <button
            onClick={() => setActiveTab('editor')}
            className={`px-4 py-2 rounded-lg font-semibold transition-all ${
              activeTab === 'editor'
                ? 'bg-neon-cyan text-gray-900 neon-glow'
                : 'glass text-gray-300 hover:bg-white/10'
            }`}
          >
            Editor
          </button>
          <button
            onClick={() => setActiveTab('results')}
            className={`px-4 py-2 rounded-lg font-semibold transition-all ${
              activeTab === 'results'
                ? 'bg-neon-cyan text-gray-900 neon-glow'
                : 'glass text-gray-300 hover:bg-white/10'
            }`}
            disabled={!result}
          >
            Results {result && `(${result.fixes.length + result.errors.length})`}
          </button>
        </div>

        <AnimatePresence mode="wait">
          {activeTab === 'editor' ? (
            <motion.div
              key="editor"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
              className="glass rounded-lg p-6"
            >
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-semibold text-gray-200">Code Editor</h2>
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={handleAnalyze}
                  disabled={isAnalyzing || !code.trim()}
                  className="px-6 py-2 bg-neon-cyan text-gray-900 font-semibold rounded-lg disabled:opacity-50 disabled:cursor-not-allowed neon-glow flex items-center gap-2"
                >
                  {isAnalyzing ? (
                    <>
                      <LoadingAnimation />
                      Analyzing...
                    </>
                  ) : (
                    'Analyze & Fix'
                  )}
                </motion.button>
              </div>
              
              <div className="h-[600px]">
                <CodeEditor
                  code={code}
                  language={language}
                  onChange={setCode}
                  errors={result?.errors.map(e => ({ line: e.line, message: e.message })) || []}
                />
              </div>
            </motion.div>
          ) : (
            result && (
              <motion.div
                key="results"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="space-y-6"
              >
                {/* Fix Explanations */}
                <div className="glass rounded-lg p-6">
                  <h2 className="text-xl font-semibold text-gray-200 mb-4">Fixes Applied</h2>
                  <FixExplanation fixes={[...result.errors, ...result.fixes]} />
                </div>

                {/* Diff Viewer */}
                <div className="glass rounded-lg p-6">
                  <div className="flex items-center justify-between mb-4">
                    <h2 className="text-xl font-semibold text-gray-200">Code Comparison</h2>
                    <div className="flex gap-2">
                      <button
                        onClick={() => handleCopy(result.fixedCode)}
                        className="px-4 py-2 glass rounded-lg text-sm font-semibold hover:bg-white/10 transition-colors"
                      >
                        Copy Fixed
                      </button>
                      <button
                        onClick={() => handleDownload(result.fixedCode, `fixed.${language === 'typescript' ? 'ts' : language === 'javascript' ? 'js' : language === 'python' ? 'py' : language === 'java' ? 'java' : 'cpp'}`)}
                        className="px-4 py-2 glass rounded-lg text-sm font-semibold hover:bg-white/10 transition-colors"
                      >
                        Download
                      </button>
                    </div>
                  </div>
                  <div className="h-[500px]">
                    <DiffViewer
                      original={result.originalCode}
                      fixed={result.fixedCode}
                      fixes={[...result.errors, ...result.fixes]}
                    />
                  </div>
                </div>
              </motion.div>
            )
          )}
        </AnimatePresence>
      </main>

      {/* Footer */}
      <footer className="mt-12 p-6 text-center text-gray-500 text-sm">
        <p>Fully client-side • No AI • No Backend • No Database</p>
      </footer>
    </div>
  );
}

export default App;
