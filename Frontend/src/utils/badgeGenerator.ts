import { Certification } from '../types/certification';

export const generateBadgeSvg = (certification: Certification): string => {
  const { projectName, score, skills, verificationCode } = certification;
  
  return `
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 400 500" width="400" height="500">
      <defs>
        <linearGradient id="grad" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" style="stop-color:#3b82f6;stop-opacity:1" />
          <stop offset="100%" style="stop-color:#8b5cf6;stop-opacity:1" />
        </linearGradient>
        <filter id="shadow">
          <feDropShadow dx="0" dy="4" stdDeviation="8" flood-opacity="0.3"/>
        </filter>
      </defs>
      
      <rect x="20" y="20" width="360" height="460" rx="20" fill="url(#grad)" filter="url(#shadow)"/>
      <rect x="30" y="30" width="340" height="440" rx="15" fill="#1e293b"/>
      
      <text x="200" y="80" text-anchor="middle" fill="#3b82f6" font-size="24" font-weight="bold" font-family="Arial">
        CodeMaster
      </text>
      
      <text x="200" y="130" text-anchor="middle" fill="#ffffff" font-size="20" font-family="Arial">
        Certification of Completion
      </text>
      
      <text x="200" y="180" text-anchor="middle" fill="#94a3b8" font-size="14" font-family="Arial">
        This certifies that
      </text>
      
      <text x="200" y="220" text-anchor="middle" fill="#60a5fa" font-size="22" font-weight="bold" font-family="Arial">
        ${projectName}
      </text>
      
      <text x="200" y="260" text-anchor="middle" fill="#94a3b8" font-size="14" font-family="Arial">
        has been successfully validated with a score of
      </text>
      
      <text x="200" y="310" text-anchor="middle" fill="${score >= 80 ? '#22c55e' : '#eab308'}" font-size="36" font-weight="bold" font-family="Arial">
        ${score}/100
      </text>
      
      <text x="200" y="360" text-anchor="middle" fill="#94a3b8" font-size="12" font-family="Arial">
        Skills Demonstrated: ${skills.join(', ')}
      </text>
      
      <text x="200" y="420" text-anchor="middle" fill="#64748b" font-size="10" font-family="monospace">
        Verification: ${verificationCode}
      </text>
    </svg>
  `;
};

export const generateVerificationCode = (): string => {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  let code = '';
  for (let i = 0; i < 12; i++) {
    if (i === 4 || i === 8) code += '-';
    code += chars[Math.floor(Math.random() * chars.length)];
  }
  return code;
};

export const downloadBadge = (certification: Certification): void => {
  const svg = generateBadgeSvg(certification);
  const blob = new Blob([svg], { type: 'image/svg+xml' });
  const url = URL.createObjectURL(blob);
  
  const link = document.createElement('a');
  link.href = url;
  link.download = `codemaster-${certification.projectName.toLowerCase().replace(/\s+/g, '-')}.svg`;
  link.click();
  
  URL.revokeObjectURL(url);
};