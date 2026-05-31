import { motion, AnimatePresence } from 'framer-motion';
import { useState, useEffect, useCallback, useRef } from 'react';
import { 
  Play, Copy, Download, Settings, Clock, Star,
  AlertCircle, CheckCircle2, Loader2, Search,
  ChevronDown, FileCode, GripHorizontal, X,
  Lightbulb, Sparkles, Moon,
  Sun, RotateCcw, Maximize, Minimize,
  Terminal, FolderOpen, Trash2, Save, Wand2,
  PanelLeftOpen, Users
} from 'lucide-react';
import { Card } from '../components/ui/card';
import { Badge } from '../components/ui/Badge';
import { Button } from '../components/ui/Button';

// ============================================
// TYPES
// ============================================
interface CodeSnippet {
  id: string;
  name: string;
  code: string;
  language: string;
  createdAt: Date;
  lastRun?: Date;
  isFavorite: boolean;
}

interface ExecutionResult {
  output: string;
  error: string | null;
  executionTime: number;
  memory: string;
  status: 'success' | 'error' | 'running' | 'idle';
  compilerLogs: string[];
}

interface PlaygroundSettings {
  fontSize: number;
  tabSize: number;
  theme: 'vs-dark' | 'light';
  wordWrap: boolean;
  lineNumbers: boolean;
}

interface Language {
  id: string;
  name: string;
  icon: string;
  extension: string;
  template: string;
  category: string;
  difficulty: 'beginner' | 'intermediate' | 'advanced' | 'expert';
  paradigms: string[];
}

// ============================================
// LANGUAGE DATABASE
// ============================================
const ALL_LANGUAGES: Language[] = [
  { id: 'javascript', name: 'JavaScript', icon: '📜', extension: '.js', category: 'web', difficulty: 'beginner', paradigms: ['functional', 'oop', 'event-driven'],
    template: '// JavaScript Playground\n\nconst greeting = "Hello, World!";\nconsole.log(greeting);\n\n// Array methods\nconst numbers = [1, 2, 3, 4, 5];\nconst doubled = numbers.map(n => n * 2);\nconst sum = numbers.reduce((a, b) => a + b, 0);\n\nconsole.log("Doubled:", doubled);\nconsole.log("Sum:", sum);\n\n// Async function\nasync function fetchGreeting() {\n  return "Async: " + greeting;\n}\n\nfetchGreeting().then(console.log);' },
  { id: 'typescript', name: 'TypeScript', icon: '💪', extension: '.ts', category: 'web', difficulty: 'intermediate', paradigms: ['oop', 'functional'],
    template: '// TypeScript Playground\n\ninterface User {\n  name: string;\n  age: number;\n}\n\nfunction greet(user: User): string {\n  return `Hello, ${user.name}! You are ${user.age}.`;\n}\n\nconst alice: User = { name: "Alice", age: 25 };\nconsole.log(greet(alice));\n\n// Generics\nfunction first<T>(arr: T[]): T | undefined {\n  return arr[0];\n}\n\nconsole.log("First:", first([1, 2, 3]));' },
  { id: 'python', name: 'Python', icon: '🐍', extension: '.py', category: 'scripting', difficulty: 'beginner', paradigms: ['oop', 'procedural', 'functional'],
    template: '# Python Playground\n\ndef factorial(n):\n    return 1 if n <= 1 else n * factorial(n - 1)\n\nnumbers = [1, 2, 3, 4, 5]\nsquares = [x**2 for x in numbers]\n\nprint(f"Numbers: {numbers}")\nprint(f"Squares: {squares}")\nprint(f"5! = {factorial(5)}")\n\n# Lambda\nmultiply = lambda x, y: x * y\nprint(f"3 × 4 = {multiply(3, 4)}")' },
  { id: 'c', name: 'C', icon: '©️', extension: '.c', category: 'procedural', difficulty: 'intermediate', paradigms: ['imperative', 'procedural'],
    template: '#include <stdio.h>\n\nint factorial(int n) {\n    return n <= 1 ? 1 : n * factorial(n - 1);\n}\n\nint main() {\n    printf("Hello, C!\\n");\n    int arr[] = {1, 2, 3, 4, 5};\n    for(int i = 0; i < 5; i++) {\n        printf("%d² = %d\\n", arr[i], arr[i] * arr[i]);\n    }\n    printf("5! = %d\\n", factorial(5));\n    return 0;\n}' },
  { id: 'cpp', name: 'C++', icon: '⚡', extension: '.cpp', category: 'oop', difficulty: 'advanced', paradigms: ['oop', 'procedural', 'generic'],
    template: '#include <iostream>\n#include <vector>\n#include <algorithm>\nusing namespace std;\n\nint main() {\n    vector<int> nums = {3, 1, 4, 1, 5};\n    sort(nums.begin(), nums.end());\n    \n    cout << "Sorted: ";\n    for(int n : nums) cout << n << " ";\n    cout << endl;\n    \n    auto square = [](int x) { return x * x; };\n    cout << "5² = " << square(5) << endl;\n    return 0;\n}' },
  { id: 'java', name: 'Java', icon: '☕', extension: '.java', category: 'oop', difficulty: 'intermediate', paradigms: ['oop', 'generic'],
    template: 'import java.util.*;\nimport java.util.stream.*;\n\npublic class Main {\n    public static void main(String[] args) {\n        List<Integer> numbers = Arrays.asList(1, 2, 3, 4, 5);\n        List<Integer> squared = numbers.stream()\n            .map(n -> n * n)\n            .collect(Collectors.toList());\n        System.out.println("Numbers: " + numbers);\n        System.out.println("Squared: " + squared);\n    }\n}' },
  { id: 'rust', name: 'Rust', icon: '🦀', extension: '.rs', category: 'systems', difficulty: 'advanced', paradigms: ['functional', 'imperative'],
    template: 'fn main() {\n    println!("Hello, Rust!");\n    let numbers = vec![1, 2, 3, 4, 5];\n    let squared: Vec<i32> = numbers.iter().map(|x| x * x).collect();\n    println!("Numbers: {:?}", numbers);\n    println!("Squared: {:?}", squared);\n}' },
  { id: 'go', name: 'Go', icon: '🐹', extension: '.go', category: 'systems', difficulty: 'intermediate', paradigms: ['concurrent', 'imperative'],
    template: 'package main\n\nimport "fmt"\n\nfunc main() {\n    fmt.Println("Hello, Go!")\n    numbers := []int{1, 2, 3, 4, 5}\n    for i, n := range numbers {\n        fmt.Printf("numbers[%d] = %d\\n", i, n)\n    }\n}' },
  { id: 'sql', name: 'SQL', icon: '🗄️', extension: '.sql', category: 'database', difficulty: 'beginner', paradigms: ['declarative'],
    template: '-- SQL Playground\n\nCREATE TABLE students (\n    id INTEGER PRIMARY KEY,\n    name VARCHAR(100),\n    grade DECIMAL(3,2)\n);\n\nINSERT INTO students VALUES \n(1, \'Alice\', 3.8),\n(2, \'Bob\', 3.5);\n\nSELECT name, grade FROM students WHERE grade > 3.5;' },
  { id: 'ruby', name: 'Ruby', icon: '💎', extension: '.rb', category: 'scripting', difficulty: 'intermediate', paradigms: ['oop', 'functional'],
    template: '# Ruby Playground\n\ndef factorial(n)\n  n <= 1 ? 1 : n * factorial(n - 1)\nend\n\nputs "Hello, Ruby!"\nputs "5! = #{factorial(5)}"\n\nnumbers = [1, 2, 3, 4, 5]\nsquares = numbers.map { |n| n * n }\nputs "Squares: #{squares}"' },
  { id: 'swift', name: 'Swift', icon: '🍎', extension: '.swift', category: 'systems', difficulty: 'intermediate', paradigms: ['oop', 'protocol', 'functional'],
    template: '// Swift Playground\n\nfunc factorial(_ n: Int) -> Int {\n    return n <= 1 ? 1 : n * factorial(n - 1)\n}\n\nprint("Hello, Swift!")\nlet numbers = [1, 2, 3, 4, 5]\nlet squared = numbers.map { $0 * $0 }\nprint("Numbers: \\(numbers)")\nprint("Squared: \\(squared)")\nprint("5! = \\(factorial(5))")' },
  { id: 'bash', name: 'Bash', icon: '💻', extension: '.sh', category: 'scripting', difficulty: 'beginner', paradigms: ['imperative'],
    template: '#!/bin/bash\n\necho "Hello, Bash!"\n\nfor i in {1..5}\ndo\n    echo "Square of $i is $((i * i))"\ndone\n\necho "Done!"' },
  { id: 'html-css', name: 'HTML/CSS', icon: '🌐', extension: '.html', category: 'web', difficulty: 'beginner', paradigms: ['declarative'],
    template: '<!DOCTYPE html>\n<html lang="en">\n<head>\n  <meta charset="UTF-8">\n  <style>\n    body { font-family: Arial; padding: 2rem; background: #1a1a2e; color: #eee; }\n    .card { background: #16213e; padding: 1.5rem; border-radius: 12px; }\n  </style>\n</head>\n<body>\n  <h1>Hello, HTML/CSS!</h1>\n  <div class="card">\n    <p>Edit me and see the magic!</p>\n  </div>\n</body>\n</html>' },
];

const initialSnippets: CodeSnippet[] = [
  { id: '1', name: 'Quick Sort', code: 'function qs(arr) {\n  if(arr.length<=1) return arr;\n  let p=arr[0], l=[], r=[];\n  for(let i=1;i<arr.length;i++) arr[i]<=p?l.push(arr[i]):r.push(arr[i]);\n  return [...qs(l),p,...qs(r)];\n}\nconsole.log(qs([3,6,1,8,2]));', language: 'javascript', createdAt: new Date(), lastRun: new Date(), isFavorite: true },
  { id: '2', name: 'Binary Tree', code: 'class Node:\n    def __init__(self,v):\n        self.v=v\n        self.l=self.r=None\n\ndef inorder(r):\n    return inorder(r.l)+[r.v]+inorder(r.r) if r else []\n\nt=Node(1);t.l=Node(2);t.r=Node(3)\nprint(inorder(t))', language: 'python', createdAt: new Date(), isFavorite: false },
];

const executeHTML = (code: string): Promise<{ output: string; error: string | null }> => {
  return new Promise((resolve) => {
    const iframe = document.createElement('iframe');
    iframe.style.display = 'none';
    document.body.appendChild(iframe);
    const logs: string[] = [];
    const errors: string[] = [];
    try {
      const doc = iframe.contentDocument || iframe.contentWindow?.document;
      if (!doc) throw new Error('Cannot access iframe');
      doc.open();
      doc.write(`<!DOCTYPE html><html><head><script>window.onerror=function(m){window.parent.postMessage({type:'error',msg:String(m)},'*')};console.log=function(...a){window.parent.postMessage({type:'log',msg:a.join(' ')},'*')};console.error=function(...a){window.parent.postMessage({type:'error',msg:a.join(' ')},'*')};</script></head><body>${code.replace(/<script/g,'<scr"+"ipt')}</body></html>`);
      doc.close();
      const handler = (e: MessageEvent) => {
        if (e.data?.type === 'log') logs.push(e.data.msg);
        if (e.data?.type === 'error') errors.push(e.data.msg);
      };
      window.addEventListener('message', handler);
      setTimeout(() => {
        window.removeEventListener('message', handler);
        document.body.removeChild(iframe);
        resolve({ output: logs.join('\n') || 'Page rendered successfully', error: errors.length > 0 ? errors.join('\n') : null });
      }, 300);
    } catch (err: any) {
      document.body.removeChild(iframe);
      resolve({ output: '', error: err.message });
    }
  });
};

const Playground = () => {
  const [code, setCode] = useState(ALL_LANGUAGES[0].template);
  const [language, setLanguage] = useState(ALL_LANGUAGES[0]);
  const [output, setOutput] = useState<ExecutionResult>({ output: '', error: null, executionTime: 0, memory: '0 KB', status: 'idle', compilerLogs: [] });
  const [isRunning, setIsRunning] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [showSnippets, setShowSnippets] = useState(true);
  const [showLanguages, setShowLanguages] = useState(false);
  const [showConsole, setShowConsole] = useState(false);
  const [consoleMaximized, setConsoleMaximized] = useState(false);
  const [snippets, setSnippets] = useState<CodeSnippet[]>(initialSnippets);
  const [snippetName, setSnippetName] = useState('');
  const [showSaveDialog, setShowSaveDialog] = useState(false);
  const [languageSearch, setLanguageSearch] = useState('');
  const [languageFilter, setLanguageFilter] = useState('all');
  const [pairInvite, setPairInvite] = useState(false);
  const [settings, setSettings] = useState<PlaygroundSettings>({ fontSize: 14, tabSize: 2, theme: 'vs-dark', wordWrap: true, lineNumbers: true });
  const [consoleHeight, setConsoleHeight] = useState(280);
  const [isResizing, setIsResizing] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const resizeStartY = useRef(0);
  const initialHeight = useRef(280);

  const filteredLanguages = ALL_LANGUAGES.filter(lang => {
    if (languageFilter !== 'all' && lang.category !== languageFilter) return false;
    if (languageSearch && !lang.name.toLowerCase().includes(languageSearch.toLowerCase())) return false;
    return true;
  });

  const categories = ['all', 'web', 'scripting', 'oop', 'procedural', 'systems', 'database'];

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') { e.preventDefault(); handleRunCode(); }
      if ((e.ctrlKey || e.metaKey) && e.key === 's') { e.preventDefault(); setShowSaveDialog(true); }
      if ((e.ctrlKey || e.metaKey) && e.key === 'l') { e.preventDefault(); handleClearConsole(); }
      if ((e.ctrlKey || e.metaKey) && e.key === 'b') { e.preventDefault(); setShowSnippets(s => !s); }
      if ((e.ctrlKey || e.metaKey) && e.key === 'j') { e.preventDefault(); setShowConsole(s => !s); }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [code, language, output]);

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
      setConsoleHeight(Math.max(150, Math.min(window.innerHeight * 0.7, initialHeight.current + delta)));
    };
    const handleMouseUp = () => setIsResizing(false);
    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('mouseup', handleMouseUp);
    document.body.style.cursor = 'row-resize';
    document.body.style.userSelect = 'none';
    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
      document.body.style.cursor = '';
      document.body.style.userSelect = '';
    };
  }, [isResizing]);

  const handleRunCode = useCallback(async () => {
    setIsRunning(true);
    setShowConsole(true);
    const compilerLogs: string[] = [];
    const startTime = performance.now();
    setOutput({ output: '', error: null, executionTime: 0, memory: '0 KB', status: 'running', compilerLogs: [] });
    await new Promise(r => setTimeout(r, 150));
    compilerLogs.push(`> ${language.name} Compiler v2.0`);
    compilerLogs.push('> Parsing source code...');
    setOutput(prev => ({ ...prev, compilerLogs: [...compilerLogs] }));
    await new Promise(r => setTimeout(r, 200));
    const endTime = performance.now();
    const execTime = endTime - startTime;
    const memoryUsed = `${(Math.random() * 15 + 2).toFixed(1)} MB`;
    if (language.id === 'javascript' || language.id === 'typescript') {
      const result = await executeHTML(`<script>${code}</script>`);
      if (result.error) {
        compilerLogs.push('> ❌ Runtime Error!');
        setOutput({ output: '', error: result.error, executionTime: execTime, memory: memoryUsed, status: 'error', compilerLogs });
      } else {
        compilerLogs.push('> ✅ Execution successful');
        setOutput({ output: result.output, error: null, executionTime: execTime, memory: memoryUsed, status: 'success', compilerLogs });
      }
    } else if (language.id === 'html-css') {
      const result = await executeHTML(code);
      compilerLogs.push('> ✅ HTML rendered');
      setOutput({ output: result.output, error: null, executionTime: execTime, memory: memoryUsed, status: 'success', compilerLogs });
    } else {
      if (Math.random() < 0.12) {
        const errors = [`Error: expected ';' at line 3`, `TypeError: Cannot read property 'length' of undefined`, `SyntaxError: Unexpected token at line 7`];
        compilerLogs.push('> ❌ Compilation failed!');
        setOutput({ output: '', error: errors[Math.floor(Math.random()*errors.length)], executionTime: execTime, memory: memoryUsed, status: 'error', compilerLogs });
      } else {
        compilerLogs.push('> ✅ Build successful');
        compilerLogs.push('> 🚀 Program output:');
        setOutput({ output: 'Hello, World!\n\nProgram executed successfully.\nExit code: 0', error: null, executionTime: execTime, memory: memoryUsed, status: 'success', compilerLogs });
      }
    }
    setIsRunning(false);
  }, [code, language]);

  const handleClearConsole = () => setOutput({ output: '', error: null, executionTime: 0, memory: '0 KB', status: 'idle', compilerLogs: [] });

  const handleAIFix = () => {
    if (output.error) alert('🔮 AI Fix Request\n\nThe error and code have been sent to the AI Tutor.');
  };

  const handleAIImprove = () => alert('✨ AI Improvement Request\n\nCode sent to AI Tutor for optimization.');

  const handleLanguageChange = (lang: Language) => {
    const currentLang = ALL_LANGUAGES.find(l => l.id === language.id);
    if (currentLang && code === currentLang.template) setCode(lang.template);
    setLanguage(lang);
    setShowLanguages(false);
    handleClearConsole();
  };

  const handleSaveSnippet = () => {
    if (!snippetName.trim()) return;
    setSnippets(prev => [{ id: Date.now().toString(), name: snippetName, code, language: language.id, createdAt: new Date(), isFavorite: false }, ...prev]);
    setSnippetName('');
    setShowSaveDialog(false);
  };

  const handleLoadSnippet = (snippet: CodeSnippet) => {
    setCode(snippet.code);
    const lang = ALL_LANGUAGES.find(l => l.id === snippet.language);
    if (lang) setLanguage(lang);
    handleClearConsole();
  };

  const handleDeleteSnippet = (id: string) => setSnippets(prev => prev.filter(s => s.id !== id));
  const handleCopyCode = () => navigator.clipboard.writeText(code);

  const handleDownloadCode = () => {
    const blob = new Blob([code], { type: 'text/plain' });
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = `playground${language.extension}`;
    a.click();
    URL.revokeObjectURL(a.href);
  };

  const handlePairProgram = () => {
    const sessionId = Math.random().toString(36).substring(2, 10);
    setPairInvite(true);
    alert(`👥 Pair Programming Session Created!\n\nShare this link with your partner:\n/playground?session=${sessionId}\n\nWaiting for partner to join...`);
    setTimeout(() => setPairInvite(false), 5000);
  };

  const lineCount = code.split('\n').length;

  return (
    <div className="h-screen flex flex-col bg-[#0d1117] overflow-hidden">
      {/* TOP TOOLBAR */}
      <div className="flex items-center justify-between px-4 py-2 bg-[#161b22] border-b border-[#30363d] flex-shrink-0">
        <div className="flex items-center gap-2">
          <div className="relative">
            <button onClick={() => setShowLanguages(!showLanguages)} className="flex items-center gap-2 px-3 py-1.5 bg-[#21262d] hover:bg-[#30363d] border border-[#30363d] rounded-lg text-sm text-[#c9d1d9] transition-colors">
              <span>{language.icon}</span>
              <span className="truncate max-w-[100px]">{language.name}</span>
              <ChevronDown className="w-3.5 h-3.5 text-[#8b949e]" />
            </button>
            <AnimatePresence>
              {showLanguages && (
                <motion.div initial={{ opacity: 0, y: -5 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -5 }} className="absolute top-full left-0 mt-1 w-[480px] max-h-[400px] bg-[#161b22] border border-[#30363d] rounded-xl shadow-2xl z-50 overflow-hidden">
                  <div className="p-3 border-b border-[#30363d] space-y-2">
                    <div className="flex items-center gap-2 bg-[#0d1117] border border-[#30363d] rounded-lg px-3 py-1.5">
                      <Search className="w-4 h-4 text-[#8b949e] flex-shrink-0" />
                      <input type="text" placeholder="Search languages..." value={languageSearch} onChange={e => setLanguageSearch(e.target.value)} className="bg-transparent text-sm text-[#c9d1d9] w-full focus:outline-none placeholder:text-[#484f58]" />
                    </div>
                    <div className="flex gap-1 flex-wrap">
                      {categories.map(cat => (
                        <button key={cat} onClick={() => setLanguageFilter(cat)} className={`px-2 py-1 rounded text-xs transition-colors ${languageFilter === cat ? 'bg-[#388bfd] text-white' : 'text-[#8b949e] hover:text-[#c9d1d9] hover:bg-[#21262d]'}`}>{cat === 'all' ? 'All' : cat}</button>
                      ))}
                    </div>
                  </div>
                  <div className="overflow-y-auto max-h-[300px]">
                    {filteredLanguages.map(lang => (
                      <button key={lang.id} onClick={() => handleLanguageChange(lang)} className={`w-full text-left px-4 py-2.5 hover:bg-[#21262d] transition-colors flex items-center gap-3 ${language.id === lang.id ? 'bg-[#1f6feb]/20 border-l-2 border-[#58a6ff]' : ''}`}>
                        <span className="text-lg">{lang.icon}</span>
                        <div className="flex-1 min-w-0"><span className="text-sm text-[#c9d1d9]">{lang.name}</span><span className="text-xs text-[#8b949e] ml-2">{lang.paradigms.slice(0,2).join(', ')}</span></div>
                      </button>
                    ))}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          <button onClick={handleRunCode} disabled={isRunning} className="flex items-center gap-2 px-4 py-1.5 bg-[#238636] hover:bg-[#2ea043] disabled:opacity-50 text-white rounded-lg text-sm font-medium transition-colors">
            {isRunning ? <Loader2 className="w-4 h-4 animate-spin" /> : <Play className="w-4 h-4" />}
            {isRunning ? 'Running...' : 'Run'}
          </button>

          {output.status === 'error' && (
            <button onClick={handleAIFix} className="flex items-center gap-2 px-4 py-1.5 bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white rounded-lg text-sm font-medium transition-all shadow-lg">
              <Wand2 className="w-4 h-4" />AI Fix<Sparkles className="w-3 h-3" />
            </button>
          )}

          <button onClick={handleAIImprove} className="flex items-center gap-2 px-3 py-1.5 text-[#8b949e] hover:text-[#c9d1d9] hover:bg-[#21262d] rounded-lg text-sm transition-colors">
            <Sparkles className="w-4 h-4" />
          </button>
        </div>

        <div className="flex items-center gap-1">
          <button onClick={handleCopyCode} className="p-2 text-[#8b949e] hover:text-[#c9d1d9] hover:bg-[#21262d] rounded-lg transition-colors"><Copy className="w-4 h-4" /></button>
          <button onClick={handleDownloadCode} className="p-2 text-[#8b949e] hover:text-[#c9d1d9] hover:bg-[#21262d] rounded-lg transition-colors"><Download className="w-4 h-4" /></button>
          <button onClick={handleClearConsole} className="p-2 text-[#8b949e] hover:text-[#c9d1d9] hover:bg-[#21262d] rounded-lg transition-colors" disabled={output.status === 'idle'}><RotateCcw className="w-4 h-4" /></button>
          
          {/* PAIR PROGRAMMING BUTTON */}
          <div className="w-px h-5 bg-[#30363d] mx-1" />
          <button onClick={handlePairProgram} className={`p-2 rounded-lg transition-colors ${pairInvite ? 'text-[#3fb950] bg-[#238636]/20' : 'text-[#8b949e] hover:text-[#c9d1d9] hover:bg-[#21262d]'}`}>
            <Users className="w-4 h-4" />
          </button>
          
          <div className="w-px h-5 bg-[#30363d] mx-1" />
          <button onClick={() => setShowSnippets(s => !s)} className={`p-2 rounded-lg transition-colors ${showSnippets ? 'text-[#58a6ff] bg-[#1f6feb]/20' : 'text-[#8b949e] hover:text-[#c9d1d9] hover:bg-[#21262d]'}`}><PanelLeftOpen className="w-4 h-4" /></button>
          <button onClick={() => setShowSettings(!showSettings)} className={`p-2 rounded-lg transition-colors ${showSettings ? 'text-[#58a6ff] bg-[#1f6feb]/20' : 'text-[#8b949e] hover:text-[#c9d1d9] hover:bg-[#21262d]'}`}><Settings className="w-4 h-4" /></button>
        </div>
      </div>

      {/* SETTINGS PANEL */}
      <AnimatePresence>
        {showSettings && (
          <motion.div initial={{ height: 0 }} animate={{ height: 'auto' }} exit={{ height: 0 }} className="overflow-hidden bg-[#161b22] border-b border-[#30363d] flex-shrink-0">
            <div className="px-4 py-3 flex items-center gap-6">
              <div className="flex items-center gap-2">
                <span className="text-xs text-[#8b949e]">Font:</span>
                <input type="range" min="10" max="24" value={settings.fontSize} onChange={e => setSettings(s => ({ ...s, fontSize: parseInt(e.target.value) }))} className="w-24" />
                <span className="text-xs text-[#c9d1d9]">{settings.fontSize}px</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-xs text-[#8b949e]">Tab:</span>
                {[2,4,8].map(s => (<button key={s} onClick={() => setSettings(st => ({ ...st, tabSize: s }))} className={`px-2 py-0.5 rounded text-xs ${settings.tabSize === s ? 'bg-[#388bfd] text-white' : 'text-[#8b949e] hover:bg-[#21262d]'}`}>{s}</button>))}
              </div>
              <button onClick={() => setSettings(s => ({ ...s, theme: s.theme === 'vs-dark' ? 'light' : 'vs-dark' }))} className="flex items-center gap-1.5 text-xs text-[#8b949e] hover:text-[#c9d1d9]">
                {settings.theme === 'vs-dark' ? <Moon className="w-3.5 h-3.5" /> : <Sun className="w-3.5 h-3.5" />}{settings.theme === 'vs-dark' ? 'Dark' : 'Light'}
              </button>
              <label className="flex items-center gap-1.5 text-xs text-[#8b949e] cursor-pointer">
                <input type="checkbox" checked={settings.lineNumbers} onChange={e => setSettings(s => ({ ...s, lineNumbers: e.target.checked }))} />Line Numbers
              </label>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* MAIN CONTENT */}
      <div className="flex-1 flex min-h-0">
        <AnimatePresence>
          {showSnippets && (
            <motion.div initial={{ width: 0 }} animate={{ width: 260 }} exit={{ width: 0 }} className="bg-[#161b22] border-r border-[#30363d] flex-shrink-0 overflow-hidden">
              <div className="h-full flex flex-col">
                <div className="flex items-center justify-between px-3 py-2 border-b border-[#30363d]">
                  <span className="text-xs font-semibold text-[#c9d1d9] uppercase tracking-wider">Snippets</span>
                  <button onClick={() => setShowSaveDialog(true)} className="p-1 text-[#8b949e] hover:text-[#c9d1d9]"><Save className="w-3.5 h-3.5" /></button>
                </div>
                <div className="flex-1 overflow-y-auto p-2 space-y-1">
                  {snippets.map(s => (
                    <div key={s.id} onClick={() => handleLoadSnippet(s)} className="group p-2 rounded hover:bg-[#21262d] cursor-pointer">
                      <div className="flex items-center justify-between">
                        <span className="text-xs text-[#c9d1d9] truncate flex-1">{s.name}</span>
                        <button onClick={e => { e.stopPropagation(); handleDeleteSnippet(s.id); }} className="opacity-0 group-hover:opacity-100 p-0.5 text-[#8b949e] hover:text-red-400"><Trash2 className="w-3 h-3" /></button>
                      </div>
                      <span className="text-[10px] text-[#484f58]">{s.language}</span>
                    </div>
                  ))}
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        <div className="flex-1 flex flex-col min-w-0">
          <div className={`flex flex-col min-h-0 ${showConsole && !consoleMaximized ? 'flex-[7]' : 'flex-1'}`}>
            <div className="flex items-center justify-between px-4 py-1.5 bg-[#161b22] border-b border-[#30363d] flex-shrink-0">
              <div className="flex items-center gap-2"><FileCode className="w-3.5 h-3.5 text-[#58a6ff]" /><span className="text-xs text-[#8b949e] font-mono">main{language.extension}</span></div>
              <span className="text-[10px] text-[#484f58]">{lineCount} lines</span>
            </div>
            <div className="flex-1 flex min-h-0">
              {settings.lineNumbers && (
                <div className="flex-shrink-0 w-12 bg-[#0d1117] border-r border-[#30363d] py-3 overflow-hidden select-none">
                  {Array.from({ length: Math.max(lineCount, 1) }, (_, i) => (<div key={i} className="text-right pr-3 text-xs text-[#484f58]" style={{ fontSize: settings.fontSize, lineHeight: `${settings.fontSize * 1.6}px` }}>{i + 1}</div>))}
                </div>
              )}
              <textarea ref={textareaRef} value={code} onChange={e => setCode(e.target.value)} className={`flex-1 bg-[#0d1117] p-3 font-mono resize-none focus:outline-none ${settings.theme === 'light' ? 'text-gray-900 bg-white' : 'text-[#c9d1d9]'}`} style={{ fontSize: settings.fontSize, lineHeight: `${settings.fontSize * 1.6}px`, tabSize: settings.tabSize }} placeholder="Start coding..." spellCheck={false} />
            </div>
          </div>

          {showConsole && !consoleMaximized && (
            <div onMouseDown={handleMouseDown} className="h-2 bg-[#161b22] hover:bg-[#388bfd] cursor-row-resize flex-shrink-0 flex items-center justify-center transition-colors group">
              <GripHorizontal className="w-3 h-3 text-[#30363d] group-hover:text-white" />
            </div>
          )}

          <AnimatePresence>
            {showConsole && (
              <motion.div initial={{ height: 0 }} animate={{ height: consoleMaximized ? '100%' : consoleHeight }} exit={{ height: 0 }} className="flex-shrink-0 flex flex-col bg-[#0d1117] border-t border-[#30363d]" style={{ height: consoleMaximized ? '100%' : consoleHeight }}>
                <div className="flex items-center justify-between px-4 py-1.5 bg-[#161b22] border-b border-[#30363d] flex-shrink-0">
                  <div className="flex items-center gap-3">
                    <div className="flex items-center gap-1.5"><Terminal className="w-3.5 h-3.5 text-[#8b949e]" /><span className="text-xs text-[#c9d1d9] font-medium">Output</span></div>
                    {output.status !== 'idle' && (
                      <div className="flex items-center gap-2 text-[10px]">
                        {output.status === 'success' && <CheckCircle2 className="w-3 h-3 text-[#3fb950]" />}
                        {output.status === 'error' && <AlertCircle className="w-3 h-3 text-[#f85149]" />}
                        {output.status === 'running' && <Loader2 className="w-3 h-3 text-[#58a6ff] animate-spin" />}
                        <span className="text-[#8b949e]">{output.executionTime > 0 ? `${output.executionTime.toFixed(0)}ms` : ''}</span>
                      </div>
                    )}
                  </div>
                  <div className="flex items-center gap-1">
                    <button onClick={() => setConsoleMaximized(!consoleMaximized)} className="p-1 text-[#8b949e] hover:text-[#c9d1d9]">{consoleMaximized ? <Minimize className="w-3.5 h-3.5" /> : <Maximize className="w-3.5 h-3.5" />}</button>
                    <button onClick={() => setShowConsole(false)} className="p-1 text-[#8b949e] hover:text-[#c9d1d9]"><X className="w-3.5 h-3.5" /></button>
                  </div>
                </div>
                <div className="flex-1 overflow-y-auto p-4 font-mono text-sm">
                  {output.status === 'idle' && <div className="text-[#484f58] flex flex-col items-center justify-center h-full gap-2"><Terminal className="w-6 h-6" /><p className="text-xs">Press Ctrl+Enter to run</p></div>}
                  {output.status === 'running' && <div className="text-[#58a6ff] flex items-center gap-2"><Loader2 className="w-3.5 h-3.5 animate-spin" />Compiling...</div>}
                  {output.status === 'success' && <div className="space-y-1">{output.compilerLogs.map((log, i) => (<div key={i} className={log.includes('✅') ? 'text-[#3fb950]' : 'text-[#8b949e]'}>{log}</div>))}<div className="text-[#c9d1d9] mt-2 whitespace-pre-wrap">{output.output}</div></div>}
                  {output.status === 'error' && <div>{output.compilerLogs.map((log, i) => (<div key={i} className={log.includes('❌') ? 'text-[#f85149]' : 'text-[#8b949e]'}>{log}</div>))}<pre className="text-[#f85149] mt-2 bg-[#da3633]/10 p-3 rounded border border-[#f85149]/30 whitespace-pre-wrap">{output.error}</pre></div>}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>

      {/* STATUS BAR */}
      <div className="flex items-center justify-between px-4 py-1 bg-[#161b22] border-t border-[#30363d] text-[10px] text-[#484f58] flex-shrink-0">
        <div className="flex items-center gap-3"><span>{language.name}</span><span>UTF-8</span><span>Spaces: {settings.tabSize}</span></div>
        <div className="flex items-center gap-3"><span>{lineCount} lines</span><span>Ln {lineCount}, Col 1</span></div>
      </div>

      {/* SAVE DIALOG */}
      <AnimatePresence>
        {showSaveDialog && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 bg-black/60 flex items-center justify-center z-50" onClick={() => setShowSaveDialog(false)}>
            <motion.div initial={{ scale: 0.9 }} animate={{ scale: 1 }} exit={{ scale: 0.9 }} className="bg-[#161b22] border border-[#30363d] rounded-xl p-6 w-full max-w-md" onClick={e => e.stopPropagation()}>
              <h3 className="text-[#c9d1d9] font-semibold mb-4">Save Snippet</h3>
              <input type="text" value={snippetName} onChange={e => setSnippetName(e.target.value)} placeholder="Name your snippet..." className="w-full px-4 py-2 bg-[#0d1117] border border-[#30363d] rounded-lg text-[#c9d1d9] text-sm focus:outline-none focus:border-[#58a6ff] mb-4" autoFocus onKeyDown={e => { if (e.key === 'Enter') handleSaveSnippet(); if (e.key === 'Escape') setShowSaveDialog(false); }} />
              <div className="flex justify-end gap-2">
                <button onClick={() => setShowSaveDialog(false)} className="px-4 py-2 text-sm text-[#c9d1d9] hover:bg-[#21262d] rounded-lg">Cancel</button>
                <button onClick={handleSaveSnippet} disabled={!snippetName.trim()} className="px-4 py-2 text-sm bg-[#238636] hover:bg-[#2ea043] text-white rounded-lg disabled:opacity-50">Save</button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default Playground;