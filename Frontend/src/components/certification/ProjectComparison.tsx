interface ProjectComparisonProps {
  result: any;
}

export const ProjectComparison = ({ result }: ProjectComparisonProps) => {
  return (
    <div className="glass-card p-6">
      <h3 className="text-lg font-semibold mb-4">Project Comparison</h3>
      <p className="text-muted-foreground">
        Your project scores {result.overallScore}/100 compared to industry standards.
      </p>
    </div>
  );
};