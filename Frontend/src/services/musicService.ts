import { apiClient } from './apiClient';
import { MusicTrack, Playlist } from '../types/music';

export const musicService = {
  async getPlaylists(): Promise<Playlist[]> {
    const response = await apiClient.get<Playlist[]>('/music/playlists');
    return response.data || [];
  },

  async getTracks(category: string): Promise<MusicTrack[]> {
    const response = await apiClient.get<MusicTrack[]>(`/music/tracks/${category}`);
    return response.data || [];
  },

  async getTrackUrl(trackId: string): Promise<string> {
    const response = await apiClient.get<{ url: string }>(`/music/track/${trackId}`);
    return response.data?.url || '';
  },
};