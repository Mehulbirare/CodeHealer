import { useRef } from 'react';
import Editor from '@monaco-editor/react';
import type { Language } from '../types';

interface CodeEditorProps {
  code: string;
  language: Language;
  onChange: (value: string) => void;
  errors?: Array<{ line: number; message: string }>;
}

const languageMap: Record<Language, string> = {
  javascript: 'javascript',
  typescript: 'typescript',
  python: 'python',
  java: 'java',
  cpp: 'cpp',
};

export function CodeEditor({ code, language, onChange, errors = [] }: CodeEditorProps) {
  const editorRef = useRef<any>(null);

  const handleEditorDidMount = (editor: any, monaco: any) => {
    editorRef.current = editor;
    
    // Configure markers for errors
    if (errors.length > 0) {
      const markers = errors.map(err => ({
        startLineNumber: err.line,
        startColumn: 1,
        endLineNumber: err.line,
        endColumn: 1000,
        message: err.message,
        severity: monaco.MarkerSeverity.Error,
      }));
      
      monaco.editor.setModelMarkers(editor.getModel(), 'owner', markers);
    }
  };

  return (
    <div className="h-full w-full border border-white/20 rounded-lg overflow-hidden">
      <Editor
        height="100%"
        language={languageMap[language]}
        value={code}
        onChange={(value) => onChange(value || '')}
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
        }}
      />
    </div>
  );
}
