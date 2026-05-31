export type MusicTrack = {
  id: string;
  title: string;
  artist: string;
  duration: number;
  url: string;
  category: MusicCategory;
  coverArt?: string;
};

export type MusicCategory = 'focus' | 'study' | 'instrumental' | 'lofi' | 'classical' | 'ambient';

export type Playlist = {
  id: string;
  name: string;
  description: string;
  tracks: MusicTrack[];
  category: MusicCategory;
  createdAt: string;
};

export type PlayerState = {
  currentTrack: MusicTrack | null;
  isPlaying: boolean;
  volume: number;
  progress: number;
  playlist: MusicTrack[];
  shuffle: boolean;
  repeat: 'off' | 'one' | 'all';
};