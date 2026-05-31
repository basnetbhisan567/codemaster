interface PlaylistSelectorProps {
  playlists: string[];
  selected: string;
  onSelect: (playlist: string) => void;
}

export const PlaylistSelector = ({ playlists, selected, onSelect }: PlaylistSelectorProps) => (
  <div className="flex gap-2">
    {playlists.map(p => (
      <button key={p} onClick={() => onSelect(p)} className={`px-3 py-1.5 rounded-lg text-sm ${selected === p ? 'bg-primary text-white' : 'glass'}`}>{p}</button>
    ))}
  </div>
);