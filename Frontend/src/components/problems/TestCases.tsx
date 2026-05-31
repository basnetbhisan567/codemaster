import { CheckCircle, XCircle, Circle } from 'lucide-react';

interface TestCase {
  id: string;
  input: string;
  expectedOutput: string;
  actualOutput?: string;
  passed?: boolean;
}

export const TestCases = () => {
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
            {test.passed === true && <CheckCircle className="w-4 h-4 text-green-400" />}
            {test.passed === false && <XCircle className="w-4 h-4 text-red-400" />}
            {test.passed === undefined && <Circle className="w-4 h-4 text-muted-foreground" />}
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