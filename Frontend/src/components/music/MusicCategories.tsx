interface MusicCategoriesProps { categories: string[]; selected: string; onSelect: (c: string) => void; }

export const MusicCategories = ({ categories, selected, onSelect }: MusicCategoriesProps) => (
  <div className="flex flex-wrap gap-2">
    {categories.map(c => (
      <button key={c} onClick={() => onSelect(c)} className={`px-3 py-1 rounded-full text-xs ${selected === c ? 'bg-primary text-white' : 'glass'}`}>{c}</button>
    ))}
  </div>
);