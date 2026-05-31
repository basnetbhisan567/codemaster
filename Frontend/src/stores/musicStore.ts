import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { PlayerState, MusicTrack, Playlist } from '../types/music';
import { STORAGE_KEYS } from '../config/constants';

interface MusicState extends PlayerState {
  playlists: Playlist[];
  
  setTrack: (track: MusicTrack | null) => void;
  play: () => void;
  pause: () => void;
  togglePlay: () => void;
  next: () => void;
  previous: () => void;
  setVolume: (volume: number) => void;
  setProgress: (progress: number) => void;
  setPlaylist: (playlist: MusicTrack[]) => void;
  toggleShuffle: () => void;
  toggleRepeat: () => void;
  addPlaylist: (playlist: Playlist) => void;
  removePlaylist: (playlistId: string) => void;
}

export const useMusicStore = create<MusicState>()(
  persist(
    (set, get) => ({
      currentTrack: null,
      isPlaying: false,
      volume: 0.7,
      progress: 0,
      playlist: [],
      shuffle: false,
      repeat: 'off',
      playlists: [],

      setTrack: (track: MusicTrack | null) => {
        set({ currentTrack: track, progress: 0 });
        if (track) {
          get().play();
        }
      },

      play: () => {
        set({ isPlaying: true });
        const audio = document.querySelector('audio') as HTMLAudioElement;
        audio?.play();
      },

      pause: () => {
        set({ isPlaying: false });
        const audio = document.querySelector('audio') as HTMLAudioElement;
        audio?.pause();
      },

      togglePlay: () => {
        const { isPlaying } = get();
        if (isPlaying) {
          get().pause();
        } else {
          get().play();
        }
      },

      next: () => {
        const { playlist, currentTrack, shuffle } = get();
        if (!currentTrack || playlist.length === 0) return;
        
        let nextIndex: number;
        if (shuffle) {
          nextIndex = Math.floor(Math.random() * playlist.length);
        } else {
          const currentIndex = playlist.findIndex(t => t.id === currentTrack.id);
          nextIndex = (currentIndex + 1) % playlist.length;
        }
        
        get().setTrack(playlist[nextIndex]);
      },

      previous: () => {
        const { playlist, currentTrack } = get();
        if (!currentTrack || playlist.length === 0) return;
        
        const currentIndex = playlist.findIndex(t => t.id === currentTrack.id);
        const prevIndex = currentIndex === 0 ? playlist.length - 1 : currentIndex - 1;
        get().setTrack(playlist[prevIndex]);
      },

      setVolume: (volume: number) => {
        set({ volume });
        const audio = document.querySelector('audio') as HTMLAudioElement;
        if (audio) audio.volume = volume;
      },

      setProgress: (progress: number) => {
        set({ progress });
      },

      setPlaylist: (playlist: MusicTrack[]) => {
        set({ playlist });
      },

      toggleShuffle: () => {
        set(state => ({ shuffle: !state.shuffle }));
      },

      toggleRepeat: () => {
        set(state => ({
          repeat: state.repeat === 'off' ? 'all' : state.repeat === 'all' ? 'one' : 'off',
        }));
      },

      addPlaylist: (playlist: Playlist) => {
        set(state => ({ playlists: [...state.playlists, playlist] }));
      },

      removePlaylist: (playlistId: string) => {
        set(state => ({
          playlists: state.playlists.filter(p => p.id !== playlistId),
        }));
      },
    }),
    {
      name: STORAGE_KEYS.music,
      partialize: (state) => ({
        volume: state.volume,
        shuffle: state.shuffle,
        repeat: state.repeat,
        playlists: state.playlists,
      }),
    }
  )
);