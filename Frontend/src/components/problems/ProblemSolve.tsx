import { useState } from 'react';
import { Play, Send } from 'lucide-react';
import { Button } from '../ui/Button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../ui/Tabs';

interface TestCase {
  id: string;
  input: string;
  expectedOutput: string;
  actualOutput?: string;
  passed?: boolean;
}

interface ProblemSolveProps {
  problemId: string;
  initialCode?: string;
}

// Inline TestCases component
const TestCases = () => {
  const testCases: TestCase[] = [
    { id: '1', input: '[1, 2, 3]', expectedOutput: '6', actualOutput: '6', passed: true },
    { id: '2', input: '[5, 5, 5]', expectedOutput: '15', actualOutput: '15', passed: true },
    { id: '3', input: '[0, -1, 1]', expectedOutput: '0', passed: false },
  ];

  return (
    <div className="space-y-3">
      <h4 className="font-medium mb-3">Test Cases</h4>
      {testCases.map((test) => (
        <div key={test.id} className="p-3 bg-secondary/20 rounded-lg">
          <div className="flex items-center gap-2 mb-2">
            {test.passed === true && <span className="text-green-400">✓</span>}
            {test.passed === false && <span className="text-red-400">✗</span>}
            {test.passed === undefined && <span className="text-muted-foreground">○</span>}
            <span className="text-sm font-medium">Test Case {test.id}</span>
          </div>
          <p className="text-xs text-muted-foreground">Input: {test.input}</p>
          <p className="text-xs text-muted-foreground">Expected: {test.expectedOutput}</p>
          {test.actualOutput && (
            <p className="text-xs text-muted-foreground">Actual: {test.actualOutput}</p>
          )}
        </div>
      ))}
    </div>
  );
};

// Inline HintSystem component
const HintSystem = ({ problemId }: { problemId: string }) => {
  const [revealedHints, setRevealedHints] = useState<number[]>([]);
  
  const hints = [
    'Think about using a loop to iterate through the array.',
    'You can use a variable to keep track of the running sum.',
    'Consider edge cases like empty arrays.',
  ];

  const revealHint = (index: number) => {
    if (!revealedHints.includes(index)) {
      setRevealedHints([...revealedHints, index]);
    }
  };

  return (
    <div className="space-y-3">
      <div className="flex items-center gap-2 mb-4">
        <span className="text-yellow-400">💡</span>
        <h4 className="font-medium">Progressive Hints</h4>
      </div>
      
      {hints.map((hint, index) => (
        <div key={index} className="border border-white/10 rounded-lg overflow-hidden">
          <button
            onClick={() => revealHint(index)}
            className="w-full flex items-center justify-between p-3 text-left hover:bg-white/5 transition-colors"
          >
            <span className="text-sm font-medium">Hint {index + 1}</span>
            <span>{revealedHints.includes(index) ? '▲' : '▼'}</span>
          </button>
          
          {revealedHints.includes(index) && (
            <div className="p-3 bg-secondary/20 border-t border-white/10">
              <p className="text-sm text-muted-foreground">{hint}</p>
            </div>
          )}
        </div>
      ))}
    </div>
  );
};

export const ProblemSolve = ({ problemId, initialCode = '' }: ProblemSolveProps) => {
  const [code, setCode] = useState(initialCode);
  const [language, setLanguage] = useState('javascript');
  const [output, setOutput] = useState('');
  const [activeTab, setActiveTab] = useState('editor');

  const handleRun = () => {
    setOutput('Running tests...\n✓ Test 1 passed\n✓ Test 2 passed\n✓ Test 3 passed');
  };

  const handleSubmit = () => {
    setOutput('Submitting solution...\n✓ All tests passed!\nScore: 100/100');
  };

  return (
    <div className="glass-card h-[500px] flex flex-col">
      <div className="flex items-center justify-between p-4 border-b border-white/10">
        <select
          value={language}
          onChange={(e) => setLanguage(e.target.value)}
          className="bg-secondary/20 px-3 py-1.5 rounded-lg text-sm border border-white/10"
        >
          <option value="javascript">JavaScript</option>
          <option value="python">Python</option>
          <option value="java">Java</option>
          <option value="cpp">C++</option>
        </select>
        
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" onClick={handleRun} className="gap-1">
            <Play className="w-4 h-4" />
            Run
          </Button>
          <Button size="sm" onClick={handleSubmit} className="gap-1">
            <Send className="w-4 h-4" />
            Submit
          </Button>
        </div>
      </div>
      
      <div className="flex-1 flex flex-col">
        <div className="flex gap-1 px-4 pt-2 border-b border-white/10">
          {(['editor', 'testcases', 'hints'] as const).map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-4 py-2 text-sm font-medium capitalize transition-all border-b-2 -mb-[1px] ${
                activeTab === tab
                  ? 'text-primary border-primary'
                  : 'text-muted-foreground border-transparent hover:text-foreground'
              }`}
            >
              {tab === 'testcases' ? 'Test Cases' : tab}
            </button>
          ))}
        </div>
        
        <div className="flex-1 overflow-hidden">
          {activeTab === 'editor' && (
            <textarea
              value={code}
              onChange={(e) => setCode(e.target.value)}
              className="w-full h-full p-4 bg-transparent font-mono text-sm focus:outline-none resize-none"
              placeholder="Write your solution here..."
              spellCheck={false}
            />
          )}
          
          {activeTab === 'testcases' && (
            <div className="h-full overflow-auto p-4">
              <TestCases />
            </div>
          )}
          
          {activeTab === 'hints' && (
            <div className="h-full overflow-auto p-4">
              <HintSystem problemId={problemId} />
            </div>
          )}
        </div>
      </div>
      
      {output && (
        <div className="p-4 border-t border-white/10 bg-black/20">
          <pre className="text-sm font-mono text-green-400">{output}</pre>
        </div>
      )}
    </div>
  );
};