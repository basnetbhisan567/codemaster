import { useState } from 'react';
import { Play, Save, Terminal, Settings } from 'lucide-react';
import { Button } from '../ui/Button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../ui/Tabs';

interface ProjectWorkspaceProps {
  initialCode?: string;
  language?: string;
  onRun?: (code: string) => void;
  onSubmit?: (code: string) => void;
}

export const ProjectWorkspace = ({ 
  initialCode = '', 
  language = 'javascript',
  onRun,
  onSubmit 
}: ProjectWorkspaceProps) => {
  const [code, setCode] = useState(initialCode);
  const [output, setOutput] = useState('');
  const [activeTab, setActiveTab] = useState('editor');

  const handleRun = () => {
    setOutput('Running code...\n> Output will appear here');
    onRun?.(code);
    setActiveTab('output');
  };

  return (
    <div className="glass-card h-[600px] flex flex-col">
      <div className="flex items-center justify-between p-4 border-b border-white/10">
        <div className="flex items-center gap-2">
          <Terminal className="w-5 h-5 text-primary" />
          <span className="font-medium">Project Workspace</span>
          <span className="text-xs text-muted-foreground uppercase ml-2">{language}</span>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" onClick={handleRun} className="gap-1">
            <Play className="w-4 h-4" />
            Run
          </Button>
          <Button size="sm" onClick={() => onSubmit?.(code)} className="gap-1">
            <Save className="w-4 h-4" />
            Submit
          </Button>
        </div>
      </div>
      
      <Tabs value={activeTab} onValueChange={setActiveTab} className="flex-1 flex flex-col">
        <TabsList className="px-4 pt-2">
          <TabsTrigger value="editor">Editor</TabsTrigger>
          <TabsTrigger value="output">Output</TabsTrigger>
          <TabsTrigger value="tests">Tests</TabsTrigger>
        </TabsList>
        
        <TabsContent value="editor" className="flex-1 p-0">
          <textarea
            value={code}
            onChange={(e) => setCode(e.target.value)}
            className="w-full h-full p-4 bg-transparent font-mono text-sm focus:outline-none resize-none"
            placeholder="Write your code here..."
            spellCheck={false}
          />
        </TabsContent>
        
        <TabsContent value="output" className="flex-1 p-4">
          <pre className="font-mono text-sm text-green-400 whitespace-pre-wrap">
            {output || 'No output yet. Run your code to see results.'}
          </pre>
        </TabsContent>
        
        <TabsContent value="tests" className="flex-1 p-4">
          <p className="text-muted-foreground">Test results will appear here...</p>
        </TabsContent>
      </Tabs>
    </div>
  );
};