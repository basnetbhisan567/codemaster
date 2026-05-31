import { Award } from 'lucide-react';

export const CertificationsList = ({ certifications }: { certifications: string[] }) => (
  <div className="glass-card p-4"><h4 className="font-medium mb-3">Certifications</h4>{certifications.map((c, i) => <div key={i} className="flex items-center gap-2 p-2"><Award className="w-4 h-4 text-primary" /><span className="text-sm">{c}</span></div>)}</div>
);