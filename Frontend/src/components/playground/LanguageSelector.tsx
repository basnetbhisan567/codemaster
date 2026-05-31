const languages = ['javascript', 'python', 'java', 'cpp'];

export const LanguageSelector = ({ selected, onChange }: { selected: string; onChange: (l: string) => void }) => (
  <select value={selected} onChange={(e) => onChange(e.target.value)} className="glass px-3 py-1.5 rounded-lg text-sm">
    {languages.map(l => <option key={l} value={l}>{l}</option>)}
  </select>
);