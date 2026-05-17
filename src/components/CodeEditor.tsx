import { useRef, useEffect } from 'react';
import Editor from '@monaco-editor/react';
import type { CheckIssue, Language } from '../types';

interface CodeEditorProps {
  code: string;
  language: Language;
  onChange: (value: string) => void;
  errors?: Array<{ line: number; message: string }>;
  checkIssues?: CheckIssue[];
}

const languageMap: Record<Language, string> = {
  javascript: 'javascript',
  typescript: 'typescript',
  python: 'python',
  java: 'java',
  cpp: 'cpp',
};

export function CodeEditor({ code, language, onChange, errors = [], checkIssues = [] }: CodeEditorProps) {
  const editorRef = useRef<any>(null);
  const monacoRef = useRef<any>(null);

  const handleEditorDidMount = (editor: any, monaco: any) => {
    editorRef.current = editor;
    monacoRef.current = monaco;
  };

  // Sync error markers whenever the errors array changes
  useEffect(() => {
    const editor = editorRef.current;
    const monaco = monacoRef.current;
    if (!editor || !monaco) return;

    const model = editor.getModel();
    if (!model) return;

    const markers = errors.map(err => ({
      startLineNumber: err.line,
      startColumn: 1,
      endLineNumber: err.line,
      endColumn: model.getLineMaxColumn(err.line) || 1000,
      message: err.message,
      severity: monaco.MarkerSeverity.Error,
    }));

    monaco.editor.setModelMarkers(model, 'fixcode', markers);
  }, [errors]);

  // Sync online check markers using a separate owner so they don't conflict
  useEffect(() => {
    const editor = editorRef.current;
    const monaco = monacoRef.current;
    if (!editor || !monaco) return;

    const model = editor.getModel();
    if (!model) return;

    const severityMap: Record<CheckIssue['severity'], number> = {
      error:   monaco.MarkerSeverity.Error,
      warning: monaco.MarkerSeverity.Warning,
      info:    monaco.MarkerSeverity.Info,
      hint:    monaco.MarkerSeverity.Hint,
    };

    const markers = checkIssues.map(issue => ({
      startLineNumber: issue.line,
      startColumn: issue.column ?? 1,
      endLineNumber: issue.line,
      endColumn: model.getLineMaxColumn(issue.line) || 1000,
      message: `[${issue.rule}] ${issue.message}`,
      severity: severityMap[issue.severity],
      source: 'Online Check',
    }));

    monaco.editor.setModelMarkers(model, 'online-check', markers);
  }, [checkIssues]);

  return (
    <div className="h-full w-full">
      <Editor
        height="100%"
        language={languageMap[language]}
        value={code}
        onChange={(value) => onChange(value ?? '')}
        onMount={handleEditorDidMount}
        theme="vs-dark"
        options={{
          minimap: { enabled: false },
          fontSize: 14,
          lineNumbers: 'on',
          scrollBeyondLastLine: false,
          automaticLayout: true,
          tabSize: 2,
          wordWrap: 'on',
          padding: { top: 8 },
        }}
      />
    </div>
  );
}
