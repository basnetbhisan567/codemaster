import { ScoreGauge } from '../ui/ScoreGauge';

interface CodeQualityScoreProps {
  score: number;
}

export const CodeQualityScore = ({ score }: CodeQualityScoreProps) => {
  return (
    <div className="glass-card p-6">
      <h3 className="text-lg font-semibold mb-4">Code Quality</h3>
      <ScoreGauge value={score} />
      <p className="text-sm text-muted-foreground mt-4 text-center">
        {score >= 80 ? 'Excellent quality!' : score >= 60 ? 'Good quality' : 'Needs improvement'}
      </p>
    </div>
  );
};