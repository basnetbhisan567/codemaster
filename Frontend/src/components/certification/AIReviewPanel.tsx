import { motion } from 'framer-motion';
import { CodeQualityScore } from './CodeQualityScore';
import { BestPracticesCheck } from './BestPracticesCheck';
import { SecurityScan } from './SecurityScan';
import { PerformanceMetrics } from './PerformanceMetrics';
import { ImprovementSuggestions } from './ImprovementSuggestions';
import { Button } from '../ui/Button';
import { Download, Share2 } from 'lucide-react';
import type { AnalysisResult } from '../../types/validation';

interface AIReviewPanelProps {
  result: AnalysisResult;
}

export const AIReviewPanel = ({ result }: AIReviewPanelProps) => {
  const passed = result.overallScore >= 70;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-6"
    >
      <div className="text-center">
        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 text-primary">
          <span className={`text-2xl font-bold ${passed ? 'text-green-400' : 'text-yellow-400'}`}>
            {result.overallScore}/100
          </span>
          <span>Overall Score</span>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <CodeQualityScore score={result.codeQuality} />
        <BestPracticesCheck checks={result.bestPractices} />
        <SecurityScan vulnerabilities={result.security} />
        <PerformanceMetrics metrics={result.performance} />
      </div>

      <ImprovementSuggestions suggestions={result.suggestions} />

      {passed && (
        <div className="flex justify-center gap-4 pt-4">
          <Button className="gap-2">
            <Download className="w-4 h-4" />
            Download Certificate
          </Button>
          <Button variant="outline" className="gap-2">
            <Share2 className="w-4 h-4" />
            Share on LinkedIn
          </Button>
        </div>
      )}
    </motion.div>
  );
};