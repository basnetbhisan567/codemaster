import { useState } from 'react';
import { Upload, FileCode } from 'lucide-react';
import { Button } from '../ui/Button';

interface ProjectUploaderProps {
  onSubmit: (files: FileList | string) => void;
  isLoading: boolean;
}

export const ProjectUploader = ({ onSubmit, isLoading }: ProjectUploaderProps) => {
  const [code, setCode] = useState('');

  return (
    <div className="space-y-6">
      <div className="text-center">
        <div className="w-20 h-20 mx-auto mb-4 rounded-full bg-primary/20 flex items-center justify-center">
          <Upload className="w-10 h-10 text-primary" />
        </div>
        <h3 className="text-xl font-semibold mb-2">Upload Your Project</h3>
        <p className="text-muted-foreground">
          Upload your code files or paste your code below
        </p>
      </div>

      <div className="border-2 border-dashed border-white/20 rounded-xl p-8 text-center">
        <FileCode className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
        <p className="mb-2">Drag & drop your files here</p>
        <p className="text-sm text-muted-foreground mb-4">or</p>
        <Button variant="outline">Browse Files</Button>
      </div>

      <div>
        <label className="block text-sm font-medium mb-2">Or paste your code</label>
        <textarea
          value={code}
          onChange={(e) => setCode(e.target.value)}
          className="w-full h-64 p-4 bg-secondary/20 rounded-xl border border-white/10 focus:outline-none focus:ring-2 focus:ring-primary font-mono text-sm"
          placeholder="Paste your code here..."
        />
      </div>

      <Button
        onClick={() => onSubmit(code)}
        isLoading={isLoading}
        className="w-full"
      >
        Analyze Project
      </Button>
    </div>
  );
};