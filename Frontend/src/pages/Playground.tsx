import React, { useEffect, useMemo, useRef, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Editor, { type OnMount } from '@monaco-editor/react';
import {
  Play,
  Copy,
  Download,
  Terminal,
  Loader2,
  Sparkles,
  RotateCcw,
  Settings,
  Sun,
  Moon,
  FileCode2,
  Plus,
  Trash2,
  PanelRightClose,
  PanelLeftClose,
  Maximize2,
  Minimize2,
  Search,
  Save,
  History,
  Code2,
  AlertCircle,
  FileText,
  Wand2,
} from 'lucide-react';
import { Button } from '../components/ui/Button';

type LanguageId =
  | 'javascript'
  | 'typescript'
  | 'python'
  | 'html'
  | 'cpp'
  | 'java'
  | 'c'
  | 'php'
  | 'go'
  | 'sql';

type PlaygroundFile = {
  id: string;
  name: string;
  language: LanguageId;
  content: string;
};

type RunResult = {
  stdout?: string;
  stderr?: string;
  output?: string;
  exitCode?: number;
  execution_time_ms?: number;
  language?: string;
  success?: boolean;
};

const LANGUAGE_OPTIONS: { id: LanguageId; name: string; icon: string; ext: string }[] = [
  { id: 'javascript', name: 'JavaScript', icon: '📜', ext: '.js' },
  { id: 'typescript', name: 'TypeScript', icon: '💪', ext: '.ts' },
  { id: 'python', name: 'Python', icon: '🐍', ext: '.py' },
  { id: 'html', name: 'HTML', icon: '🌐', ext: '.html' },
  { id: 'cpp', name: 'C++', icon: '⚡', ext: '.cpp' },
  { id: 'java', name: 'Java', icon: '☕', ext: '.java' },
  { id: 'c', name: 'C', icon: '🔧', ext: '.c' },
  { id: 'php', name: 'PHP', icon: '🐘', ext: '.php' },
  { id: 'go', name: 'Go', icon: '🌀', ext: '.go' },
  { id: 'sql', name: 'SQL', icon: '🗄️', ext: '.sql' },
];

const TEMPLATES: Record<LanguageId, string> = {
  javascript: `// JavaScript Playground
console.log("Hello, CodeMaster!");

const arr = [1, 2, 3];
console.log(arr.map((x) => x * 2).join(", "));`,
  typescript: `// TypeScript Playground
const greet = (name: string): string => {
  return \`Hello, \${name}!\`;
};

console.log(greet("CodeMaster"));`,
  python: `# Python Playground
print("Hello, CodeMaster!")

arr = [1, 2, 3]
print([x * 2 for x in arr])`,
  html: `<!DOCTYPE html>
<html>
  <head>
    <meta charset="UTF-8" />
    <title>Playground</title>
  </head>
  <body>
    <h1>Hello, CodeMaster!</h1>
    <p>Start building...</p>
  </body>
</html>`,
  cpp: `#include <iostream>
using namespace std;

int main() {
    cout << "Hello, CodeMaster!" << endl;
    return 0;
}`,
  java: `public class Main {
    public static void main(String[] args) {
        System.out.println("Hello, CodeMaster!");
    }
}`,
  c: `#include <stdio.h>

int main() {
    printf("Hello, CodeMaster!\\n");
    return 0;
}`,
  php: `<?php
echo "Hello, CodeMaster!\\n";`,
  go: `package main

import "fmt"

func main() {
    fmt.Println("Hello, CodeMaster!")
}`,
  sql: `-- SQL Playground
SELECT 'Hello, CodeMaster!' AS message;`,
};

const uid = () => Math.random().toString(36).slice(2, 10);

export default function Playground() {
  const [files, setFiles] = useState<PlaygroundFile[]>([
    { id: 'file-1', name: 'main.ts', language: 'typescript', content: TEMPLATES.typescript },
  ]);
  const [activeFileId, setActiveFileId] = useState('file-1');
  const [outputTab, setOutputTab] = useState<'output' | 'errors' | 'ai' | 'history'>('output');
  const [consoleHeight, setConsoleHeight] = useState(280);
  const [isResizing, setIsResizing] = useState(false);
  const [theme, setTheme] = useState<'dark' | 'light'>('dark');
  const [fontSize, setFontSize] = useState(14);
  const [showSettings, setShowSettings] = useState(false);
  const [showSidebar, setShowSidebar] = useState(true);
  const [showRightPanel, setShowRightPanel] = useState(true);
  const [isRunning, setIsRunning] = useState(false);
  const [runOutput, setRunOutput] = useState('');
  const [runError, setRunError] = useState('');
  const [aiResponse, setAiResponse] = useState('');
  const [isAiLoading, setIsAiLoading] = useState(false);
  const [history, setHistory] = useState<string[]>([]);
  const [search, setSearch] = useState('');
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [language, setLanguage] = useState<LanguageId>('typescript');
  const resizeStartY = useRef(0);
  const initialHeight = useRef(280);
  const editorRef = useRef<any>(null);
  const monacoRef = useRef<any>(null);

  const activeFile = useMemo(
    () => files.find((f) => f.id === activeFileId) || files[0],
    [files, activeFileId]
  );

  useEffect(() => {
    if (activeFile) setLanguage(activeFile.language);
  }, [activeFile?.id]);

  useEffect(() => {
    const saved = localStorage.getItem('playground-state');
    if (!saved) return;
    try {
      const parsed = JSON.parse(saved);
      if (parsed.files) setFiles(parsed.files);
      if (parsed.activeFileId) setActiveFileId(parsed.activeFileId);
      if (parsed.theme) setTheme(parsed.theme);
      if (parsed.fontSize) setFontSize(parsed.fontSize);
      if (parsed.consoleHeight) setConsoleHeight(parsed.consoleHeight);
      if (parsed.showSidebar !== undefined) setShowSidebar(parsed.showSidebar);
      if (parsed.showRightPanel !== undefined) setShowRightPanel(parsed.showRightPanel);
    } catch {}
  }, []);

  useEffect(() => {
    localStorage.setItem(
      'playground-state',
      JSON.stringify({
        files,
        activeFileId,
        theme,
        fontSize,
        consoleHeight,
        showSidebar,
        showRightPanel,
      })
    );
  }, [files, activeFileId, theme, fontSize, consoleHeight, showSidebar, showRightPanel]);

  const updateActiveFile = (content: string) => {
    setFiles((prev) => prev.map((file) => (file.id === activeFileId ? { ...file, content } : file)));
  };

  const setLanguageAndTemplate = (nextLang: LanguageId) => {
    setLanguage(nextLang);
    const ext = LANGUAGE_OPTIONS.find((l) => l.id === nextLang)?.ext || '';
    setFiles((prev) =>
      prev.map((file) =>
        file.id === activeFileId
          ? { ...file, language: nextLang, name: `main${ext}`, content: TEMPLATES[nextLang] || '' }
          : file
      )
    );
  };

  const addFile = () => {
    const ext = LANGUAGE_OPTIONS.find((l) => l.id === language)?.ext || '.txt';
    const newFile: PlaygroundFile = {
      id: uid(),
      name: `file-${files.length + 1}${ext}`,
      language,
      content: TEMPLATES[language] || '',
    };
    setFiles((prev) => [...prev, newFile]);
    setActiveFileId(newFile.id);
  };

  const deleteFile = (id: string) => {
    if (files.length === 1) return;
    const idx = files.findIndex((f) => f.id === id);
    const next = files.filter((f) => f.id !== id);
    setFiles(next);
    if (id === activeFileId) setActiveFileId(next[Math.max(0, idx - 1)]?.id || next[0].id);
  };

  const renameFile = (id: string, name: string) => {
    setFiles((prev) => prev.map((f) => (f.id === id ? { ...f, name } : f)));
  };

  const handleMouseDown = (e: React.MouseEvent) => {
    setIsResizing(true);
    resizeStartY.current = e.clientY;
    initialHeight.current = consoleHeight;
    e.preventDefault();
  };

  useEffect(() => {
    if (!isResizing) return;
    const handleMouseMove = (e: MouseEvent) => {
      const delta = resizeStartY.current - e.clientY;
      setConsoleHeight(Math.max(140, Math.min(600, initialHeight.current + delta)));
    };
    const handleMouseUp = () => setIsResizing(false);
    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('mouseup', handleMouseUp);
    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
    };
  }, [isResizing]);

  const onMount: OnMount = (editor, monaco) => {
    editorRef.current = editor;
    monacoRef.current = monaco;
    editor.layout();
  };

  useEffect(() => {
    if (editorRef.current) editorRef.current.layout();
  }, [showSidebar, showRightPanel, isFullscreen, consoleHeight]);

  const handleRun = async () => {
    if (!activeFile) return;
    setIsRunning(true);
    setRunOutput('');
    setRunError('');

    try {
      const response = await fetch('http://localhost:5000/api/v1/playground/run', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          code: activeFile.content,
          language: activeFile.language,
          stdin: '',
          filename: activeFile.name,
        }),
      });

      const data: RunResult = await response.json();
      setRunOutput(data.stdout || data.output || 'No output');
      setRunError(data.stderr || '');
      setHistory((prev) => [
        `[${new Date().toLocaleTimeString()}] ${activeFile.name} • ${activeFile.language}`,
        ...prev.slice(0, 19),
      ]);
      setOutputTab(data.stderr ? 'errors' : 'output');
    } catch {
      setRunError('Backend not available. Start the server first.');
      setOutputTab('errors');
    } finally {
      setIsRunning(false);
    }
  };

  const handleAiHelp = async () => {
    if (!activeFile) return;
    setIsAiLoading(true);
    setAiResponse('');
    try {
      const response = await fetch('http://localhost:5000/api/v1/ai/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messages: [
            {
              role: 'user',
              content: `Analyze this ${activeFile.language} code. Explain what it does, find bugs, and suggest improvements:\n\n\`\`\`${activeFile.language}\n${activeFile.content}\n\`\`\``,
            },
          ],
          provider: 'auto',
        }),
      });
      const data = await response.json();
      setAiResponse(data.response || 'AI unavailable');
      setOutputTab('ai');
    } catch {
      setAiResponse('AI service not available. Start the backend server.');
      setOutputTab('ai');
    } finally {
      setIsAiLoading(false);
    }
  };

  const copyCode = async () => {
    if (!activeFile) return;
    await navigator.clipboard.writeText(activeFile.content);
  };

  const downloadCode = () => {
    if (!activeFile) return;
    const blob = new Blob([activeFile.content], { type: 'text/plain' });
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = activeFile.name;
    a.click();
    URL.revokeObjectURL(a.href);
  };

  const resetToTemplate = () => {
    if (!activeFile) return;
    setFiles((prev) =>
      prev.map((file) => (file.id === activeFileId ? { ...file, content: TEMPLATES[file.language] || '' } : file))
    );
  };

  const bg = theme === 'dark' ? 'bg-[#0d1117]' : 'bg-white';
  const textColor = theme === 'dark' ? 'text-[#c9d1d9]' : 'text-gray-900';
  const panelBg = theme === 'dark' ? 'bg-[#161b22]' : 'bg-gray-100';
  const borderColor = theme === 'dark' ? 'border-[#30363d]' : 'border-gray-300';
  const filteredFiles = files.filter((f) => `${f.name} ${f.language}`.toLowerCase().includes(search.toLowerCase()));
  const editorLanguage = activeFile?.language === 'cpp' ? 'cpp' : activeFile?.language || 'typescript';

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className={`${isFullscreen ? 'fixed inset-0 z-50' : 'h-[calc(100vh-4rem)]'} ${bg} ${textColor} flex flex-col overflow-hidden`}>
      <div className={`flex items-center justify-between px-3 py-2 ${panelBg} border-b ${borderColor} flex-shrink-0`}>
        <div className="flex items-center gap-2">
          <Button size="sm" variant="ghost" onClick={() => setShowSidebar((v) => !v)} className="h-8">
            <PanelLeftClose className="w-4 h-4" />
          </Button>

          <select
            value={language}
            onChange={(e) => setLanguageAndTemplate(e.target.value as LanguageId)}
            className={`${theme === 'dark' ? 'bg-[#21262d] border-[#30363d] text-white' : 'bg-white border-gray-300 text-black'} border rounded px-2 py-1 text-xs h-8`}
          >
            {LANGUAGE_OPTIONS.map((l) => (
              <option key={l.id} value={l.id}>
                {l.icon} {l.name}
              </option>
            ))}
          </select>

          <Button size="sm" onClick={handleRun} disabled={isRunning} className="gap-1.5 bg-green-600 hover:bg-green-700 h-8 text-xs">
            {isRunning ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Play className="w-3.5 h-3.5" />}
            Run
          </Button>

          <Button size="sm" variant="ghost" onClick={handleAiHelp} disabled={isAiLoading} className="gap-1.5 h-8 text-xs">
            <Sparkles className="w-3.5 h-3.5 text-purple-400" />
            AI
          </Button>

          <Button size="sm" variant="ghost" onClick={resetToTemplate} className="h-8">
            <RotateCcw className="w-3.5 h-3.5" />
          </Button>
        </div>

        <div className="flex items-center gap-1">
          <Button size="sm" variant="ghost" onClick={copyCode} className="h-8"><Copy className="w-3.5 h-3.5" /></Button>
          <Button size="sm" variant="ghost" onClick={downloadCode} className="h-8"><Download className="w-3.5 h-3.5" /></Button>
          <Button size="sm" variant="ghost" onClick={() => setShowSettings((v) => !v)} className="h-8"><Settings className="w-3.5 h-3.5" /></Button>
          <Button size="sm" variant="ghost" onClick={() => setShowRightPanel((v) => !v)} className="h-8"><PanelRightClose className="w-4 h-4" /></Button>
          <Button size="sm" variant="ghost" onClick={() => setIsFullscreen((v) => !v)} className="h-8">{isFullscreen ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}</Button>
        </div>
      </div>

      <AnimatePresence>
        {showSettings && (
          <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }} className={`overflow-hidden ${panelBg} border-b ${borderColor}`}>
            <div className="px-4 py-2 flex items-center gap-5 text-xs">
              <button onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')} className="flex items-center gap-1">
                {theme === 'dark' ? <Sun className="w-3.5 h-3.5" /> : <Moon className="w-3.5 h-3.5" />}
                {theme === 'dark' ? 'Light' : 'Dark'}
              </button>
              <span>Font: {fontSize}px</span>
              <input type="range" min="10" max="24" value={fontSize} onChange={(e) => setFontSize(parseInt(e.target.value))} className="w-28" />
              <button onClick={() => setShowSidebar((v) => !v)} className="flex items-center gap-1">
                <FileText className="w-3.5 h-3.5" />
                Sidebar
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="flex-1 min-h-0 flex overflow-hidden">
        <AnimatePresence>
          {showSidebar && (
            <motion.aside initial={{ width: 0, opacity: 0 }} animate={{ width: 280, opacity: 1 }} exit={{ width: 0, opacity: 0 }} className={`border-r ${borderColor} ${panelBg} flex flex-col overflow-hidden flex-shrink-0`}>
              <div className={`px-3 py-2 border-b ${borderColor} flex items-center justify-between`}>
                <div className="flex items-center gap-2 text-sm font-medium"><Code2 className="w-4 h-4" />Files</div>
                <Button size="sm" variant="ghost" onClick={addFile} className="h-7 px-2"><Plus className="w-3.5 h-3.5" /></Button>
              </div>

              <div className="p-3 border-b border-inherit">
                <div className="relative">
                  <Search className="w-4 h-4 absolute left-2 top-2.5 opacity-60" />
                  <input
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    placeholder="Search files..."
                    className={`w-full pl-8 pr-3 py-2 rounded border text-sm ${theme === 'dark' ? 'bg-[#0d1117] border-[#30363d] text-white' : 'bg-white border-gray-300 text-gray-900'}`}
                  />
                </div>
              </div>

              <div className="flex-1 overflow-y-auto p-2 space-y-1">
                {filteredFiles.map((file) => (
                  <div
                    key={file.id}
                    onClick={() => setActiveFileId(file.id)}
                    className={`group rounded border px-3 py-2 cursor-pointer transition-colors ${file.id === activeFileId ? 'bg-blue-600/15 border-blue-500' : 'hover:bg-black/5 border-transparent'}`}
                  >
                    <div className="flex items-center justify-between gap-2">
                      <div className="min-w-0">
                        <div className="text-sm font-medium truncate flex items-center gap-2">
                          <FileCode2 className="w-4 h-4 flex-shrink-0" />
                          <input
                            value={file.name}
                            onChange={(e) => renameFile(file.id, e.target.value)}
                            onClick={(e) => e.stopPropagation()}
                            className={`bg-transparent outline-none w-full truncate ${textColor}`}
                          />
                        </div>
                        <div className="text-[11px] opacity-70">{file.language}</div>
                      </div>
                      <button onClick={(e) => { e.stopPropagation(); deleteFile(file.id); }} className="opacity-0 group-hover:opacity-100 transition-opacity">
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>

              <div className={`p-3 border-t ${borderColor} text-xs opacity-80 space-y-2`}>
                <div className="flex items-center gap-2"><Save className="w-3.5 h-3.5" />Auto-saved locally</div>
                <div className="flex items-center gap-2"><History className="w-3.5 h-3.5" />Run history: {history.length}</div>
              </div>
            </motion.aside>
          )}
        </AnimatePresence>

        <div className="flex-1 min-w-0 flex flex-col">
          <div className={`px-3 py-2 border-b ${borderColor} ${panelBg} flex items-center justify-between flex-shrink-0`}>
            <div className="flex items-center gap-2 overflow-x-auto">
              {files.map((file) => (
                <button
                  key={file.id}
                  onClick={() => setActiveFileId(file.id)}
                  className={`px-3 py-1.5 rounded text-xs whitespace-nowrap border ${file.id === activeFileId ? 'bg-blue-600 text-white border-blue-500' : `${theme === 'dark' ? 'bg-[#0d1117] border-[#30363d]' : 'bg-white border-gray-300'}`}`}
                >
                  {file.name}
                </button>
              ))}
            </div>
          </div>

          <div className="flex-1 min-h-0">
            <Editor
              height="100%"
              language={editorLanguage}
              value={activeFile?.content || ''}
              theme={theme === 'dark' ? 'vs-dark' : 'light'}
              onChange={(value) => updateActiveFile(value ?? '')}
              onMount={onMount}
              options={{
                fontSize,
                minimap: { enabled: false },
                wordWrap: 'on',
                smoothScrolling: true,
                scrollBeyondLastLine: false,
                automaticLayout: true,
                tabSize: 2,
                readOnly: false,
              }}
            />
          </div>

          <div onMouseDown={handleMouseDown} className={`h-2 ${panelBg} hover:bg-blue-500 cursor-row-resize flex-shrink-0 flex items-center justify-center transition-colors group`}>
            <div className={`w-10 h-1 rounded ${theme === 'dark' ? 'bg-[#30363d]' : 'bg-gray-400'} group-hover:bg-white`} />
          </div>

          <div className={`flex-shrink-0 ${panelBg} border-t ${borderColor} flex flex-col`} style={{ height: consoleHeight }}>
            <div className={`flex items-center justify-between px-3 py-1.5 border-b ${borderColor}`}>
              <div className="flex items-center gap-2">
                <button onClick={() => setOutputTab('output')} className={`text-xs flex items-center gap-1 ${outputTab === 'output' ? 'text-green-400' : 'opacity-70'}`}><Terminal className="w-3.5 h-3.5" />Output</button>
                <button onClick={() => setOutputTab('errors')} className={`text-xs flex items-center gap-1 ${outputTab === 'errors' ? 'text-red-400' : 'opacity-70'}`}><AlertCircle className="w-3.5 h-3.5" />Errors</button>
                <button onClick={() => setOutputTab('ai')} className={`text-xs flex items-center gap-1 ${outputTab === 'ai' ? 'text-purple-400' : 'opacity-70'}`}><Sparkles className="w-3.5 h-3.5" />AI</button>
                <button onClick={() => setOutputTab('history')} className={`text-xs flex items-center gap-1 ${outputTab === 'history' ? 'text-blue-400' : 'opacity-70'}`}><History className="w-3.5 h-3.5" />History</button>
              </div>

              <div className="flex items-center gap-1">
                {isRunning && <Loader2 className="w-3 h-3 animate-spin text-blue-400" />}
                <button onClick={() => { setRunOutput(''); setRunError(''); }} className="text-xs opacity-70 hover:opacity-100">
                  <RotateCcw className="w-3 h-3" />
                </button>
              </div>
            </div>

            <div className="flex-1 overflow-y-auto p-3 font-mono whitespace-pre-wrap" style={{ fontSize: `${fontSize}px` }}>
              {outputTab === 'output' && <span className={textColor}>{runOutput || 'Run your code to see output here...'}</span>}
              {outputTab === 'errors' && <span className="text-red-400">{runError || 'No errors yet.'}</span>}
              {outputTab === 'ai' && <div className="text-purple-300">{isAiLoading ? 'Analyzing your code...' : aiResponse || 'Click AI to analyze your code.'}</div>}
              {outputTab === 'history' && <div className="space-y-2 text-sm">{history.length ? history.map((item, idx) => <div key={idx}>{item}</div>) : <div>No history yet.</div>}</div>}
            </div>
          </div>
        </div>

        <AnimatePresence>
          {showRightPanel && (
            <motion.aside initial={{ width: 0, opacity: 0 }} animate={{ width: 300, opacity: 1 }} exit={{ width: 0, opacity: 0 }} className={`border-l ${borderColor} ${panelBg} flex flex-col overflow-hidden flex-shrink-0`}>
              <div className={`px-3 py-2 border-b ${borderColor} flex items-center justify-between`}>
                <div className="text-sm font-medium flex items-center gap-2"><Wand2 className="w-4 h-4" />Assistant</div>
                <Button size="sm" variant="ghost" onClick={() => setShowRightPanel(false)} className="h-7 px-2">
                  <PanelRightClose className="w-4 h-4" />
                </Button>
              </div>

              <div className="p-3 text-sm space-y-3 overflow-y-auto">
                <div className="rounded border border-blue-500/30 bg-blue-500/10 p-3">
                  <div className="font-medium mb-1">Current file</div>
                  <div className="opacity-80">{activeFile?.name}</div>
                  <div className="opacity-80">{activeFile?.language}</div>
                </div>

                <div className="rounded border p-3">
                  <div className="font-medium mb-2">Tips</div>
                  <ul className="space-y-2 opacity-80">
                    <li>Use the backend runner for real execution.</li>
                    <li>Keep file names aligned with imports.</li>
                    <li>Store snippets in localStorage for fast reloads.</li>
                  </ul>
                </div>

                <div className="rounded border p-3">
                  <div className="font-medium mb-2">AI response</div>
                  <div className="whitespace-pre-wrap opacity-80">{aiResponse || 'No AI analysis yet.'}</div>
                </div>
              </div>
            </motion.aside>
          )}
        </AnimatePresence>
      </div>
    </motion.div>
  );
}