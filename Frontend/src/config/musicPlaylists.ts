import { MusicTrack, Playlist } from '../types/music';

export const FOCUS_PLAYLIST: Playlist = {
  id: 'focus-default',
  name: 'Deep Focus',
  description: 'Instrumental tracks for maximum concentration',
  category: 'focus',
  createdAt: new Date().toISOString(),
  tracks: [
    {
      id: 'focus-1',
      title: 'Ambient Study',
      artist: 'CodeMaster',
      duration: 3600,
      url: '/music/ambient-study.mp3',
      category: 'focus',
    },
    {
      id: 'focus-2',
      title: 'Lo-fi Beats',
      artist: 'CodeMaster',
      duration: 3600,
      url: '/music/lofi-beats.mp3',
      category: 'lofi',
    },
  ],
};

export const STUDY_PLAYLIST: Playlist = {
  id: 'study-default',
  name: 'Study Session',
  description: 'Calm music for learning',
  category: 'study',
  createdAt: new Date().toISOString(),
  tracks: [
    {
      id: 'study-1',
      title: 'Classical Piano',
      artist: 'CodeMaster',
      duration: 3600,
      url: '/music/classical-piano.mp3',
      category: 'classical',
    },
  ],
};

export const ALL_PLAYLISTS = [FOCUS_PLAYLIST, STUDY_PLAYLIST] as const;

export const MUSIC_CATEGORIES = [
  { id: 'focus', name: 'Focus', emoji: '🎯' },
  { id: 'study', name: 'Study', emoji: '📚' },
  { id: 'instrumental', name: 'Instrumental', emoji: '🎹' },
  { id: 'lofi', name: 'Lo-fi', emoji: '🎵' },
  { id: 'classical', name: 'Classical', emoji: '🎻' },
  { id: 'ambient', name: 'Ambient', emoji: '🌌' },
] as const;