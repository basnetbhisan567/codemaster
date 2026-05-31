const categories = ['all', 'AI', 'Web', 'Mobile', 'DevOps'];

interface CategoryFilterProps { selected: string; onChange: (c: string) => void; }

export const CategoryFilter = ({ selected, onChange }: CategoryFilterProps) => (
  <div className="flex gap-2">
    {categories.map(c => <button key={c} onClick={() => onChange(c)} className={`px-3 py-1.5 rounded-lg text-sm ${selected === c ? 'bg-primary text-white' : 'glass'}`}>{c}</button>)}
  </div>
);