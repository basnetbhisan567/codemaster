export const OutputConsole = ({ output }: { output: string }) => (
  <div className="h-full p-4 bg-black/20 font-mono text-sm"><pre className="text-green-400">{output || '> Ready'}</pre></div>
);