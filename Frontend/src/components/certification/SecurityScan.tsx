import { AlertTriangle, Shield } from 'lucide-react';

interface SecurityScanProps {
  vulnerabilities: Array<{ severity: 'high' | 'medium' | 'low'; description: string }>;
}

export const SecurityScan = ({ vulnerabilities }: SecurityScanProps) => {
  const severityColors = {
    high: 'text-red-400',
    medium: 'text-yellow-400',
    low: 'text-blue-400',
  };

  return (
    <div className="glass-card p-6">
      <h3 className="text-lg font-semibold mb-4">Security Scan</h3>
      {vulnerabilities.length === 0 ? (
        <div className="flex items-center gap-2 text-green-400">
          <Shield className="w-5 h-5" />
          <span>No vulnerabilities found</span>
        </div>
      ) : (
        <div className="space-y-2">
          {vulnerabilities.map((vuln, index) => (
            <div key={index} className="flex items-start gap-2">
              <AlertTriangle className={`w-4 h-4 mt-0.5 ${severityColors[vuln.severity]}`} />
              <span className="text-sm">{vuln.description}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};