import React, { useState, useEffect, useRef, useCallback } from 'react';
import { motion } from 'framer-motion';
import {
  Play, Pause, SkipBack, SkipForward, Volume2, VolumeX,
  Music as MusicIcon, Shuffle, Repeat, Repeat1,
  Loader2, AlertCircle, Heart
} from 'lucide-react';
import { Card } from '../components/ui/card';
import { Badge } from '../components/ui/Badge';
import { Button } from '../components/ui/Button';
import { apiClient } from '../services/apiClient';

// Types from backend
interface Track {
  title: string;
  url: string;
  duration: string;
}

interface PlaylistFromAPI {
  id: number;
  name: string;
  category: string;
  tracks: Track[];
  tracks_count?: number;
}

// Global Audio Context (simple version)
let globalAudio: HTMLAudioElement | null = null;
let globalListeners: Set<() => void> = new Set();

function getGlobalAudio(): HTMLAudioElement {
  if (!globalAudio) {
    globalAudio = new Audio();
    globalAudio.preload = 'auto';
  }
  return globalAudio;
}

function notifyListeners() {
  globalListeners.forEach(fn => fn());
}

export default function Music() {
  // Backend data
  const [playlists, setPlaylists] = useState<PlaylistFromAPI[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Player state
  const [currentPlaylist, setCurrentPlaylist] = useState<PlaylistFromAPI | null>(null);
  const [currentTrackIndex, setCurrentTrackIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [volume, setVolume] = useState(0.7);
  const [isMuted, setIsMuted] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [isShuffled, setIsShuffled] = useState(false);
  const [repeatMode, setRepeatMode] = useState<'off' | 'all' | 'one'>('off');
  const [shuffledOrder, setShuffledOrder] = useState<number[]>([]);
  const [updateTick, setUpdateTick] = useState(0);

  const audioRef = useRef<HTMLAudioElement>(getGlobalAudio());

  // Subscribe to global audio changes
  useEffect(() => {
    const listener = () => setUpdateTick(t => t + 1);
    globalListeners.add(listener);
    return () => { globalListeners.delete(listener); };
  }, []);

  // ============================================
  // FETCH PLAYLISTS FROM BACKEND
  // ============================================
  const fetchPlaylists = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const response = await apiClient.get('/music/playlists', { requiresAuth: false });
      const data = response.data as any;
      if (Array.isArray(data)) {
        const enriched = data.map((p: any) => ({
          ...p,
          tracks_count: p.tracks?.length || 0,
        }));
        setPlaylists(enriched);
      }
    } catch (err: any) {
      setError(err.message || 'Failed to load playlists');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchPlaylists(); }, [fetchPlaylists]);

  // ============================================
  // AUDIO EVENT HANDLERS
  // ============================================
  useEffect(() => {
    const audio = audioRef.current;
    
    const onTimeUpdate = () => {
      setCurrentTime(audio.currentTime);
      notifyListeners();
    };
    const onLoadedMetadata = () => {
      setDuration(audio.duration);
      notifyListeners();
    };
    const onEnded = () => handleNext();
    const onPlay = () => { setIsPlaying(true); notifyListeners(); };
    const onPause = () => { setIsPlaying(false); notifyListeners(); };

    audio.addEventListener('timeupdate', onTimeUpdate);
    audio.addEventListener('loadedmetadata', onLoadedMetadata);
    audio.addEventListener('ended', onEnded);
    audio.addEventListener('play', onPlay);
    audio.addEventListener('pause', onPause);

    return () => {
      audio.removeEventListener('timeupdate', onTimeUpdate);
      audio.removeEventListener('loadedmetadata', onLoadedMetadata);
      audio.removeEventListener('ended', onEnded);
      audio.removeEventListener('play', onPlay);
      audio.removeEventListener('pause', onPause);
    };
  }, [currentTrackIndex, currentPlaylist, repeatMode]);

  // Volume control
  useEffect(() => {
    audioRef.current.volume = isMuted ? 0 : volume;
  }, [volume, isMuted]);

  // ============================================
  // PLAYER CONTROLS
  // ============================================
  const getCurrentTrack = (): Track | null => {
    if (!currentPlaylist?.tracks?.length) return null;
    const idx = isShuffled ? shuffledOrder[currentTrackIndex] : currentTrackIndex;
    return currentPlaylist.tracks[idx] || null;
  };

  const playPlaylist = (playlist: PlaylistFromAPI, startIndex: number = 0) => {
    setCurrentPlaylist(playlist);
    setCurrentTrackIndex(startIndex);
    
    const track = playlist.tracks[startIndex];
    if (track?.url) {
      const audio = audioRef.current;
      audio.src = track.url;
      audio.play().catch(() => {});
      setIsPlaying(true);
      setCurrentTime(0);
    }

    // Generate shuffle order
    if (playlist.tracks.length > 0) {
      const order = Array.from({ length: playlist.tracks.length }, (_, i) => i);
      for (let i = order.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [order[i], order[j]] = [order[j], order[i]];
      }
      setShuffledOrder(order);
    }
  };

  const togglePlay = () => {
    const audio = audioRef.current;
    if (!audio.src && currentPlaylist) {
      playPlaylist(currentPlaylist, currentTrackIndex);
      return;
    }
    if (isPlaying) {
      audio.pause();
    } else {
      audio.play().catch(() => {});
    }
  };

  const handleNext = () => {
    if (!currentPlaylist) return;
    
    if (repeatMode === 'one') {
      audioRef.current.currentTime = 0;
      audioRef.current.play().catch(() => {});
      return;
    }

    const total = currentPlaylist.tracks.length;
    const nextIdx = currentTrackIndex + 1;

    if (nextIdx >= total) {
      if (repeatMode === 'all') {
        playPlaylist(currentPlaylist, 0);
      } else {
        setIsPlaying(false);
        audioRef.current.pause();
      }
    } else {
      playPlaylist(currentPlaylist, nextIdx);
    }
  };

  const handlePrevious = () => {
    if (!currentPlaylist) return;
    if (audioRef.current.currentTime > 3) {
      audioRef.current.currentTime = 0;
      return;
    }
    const prevIdx = currentTrackIndex - 1;
    if (prevIdx < 0) {
      playPlaylist(currentPlaylist, currentPlaylist.tracks.length - 1);
    } else {
      playPlaylist(currentPlaylist, prevIdx);
    }
  };

  const handleSeek = (e: React.MouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const percent = (e.clientX - rect.left) / rect.width;
    audioRef.current.currentTime = percent * duration;
  };

  const toggleMute = () => setIsMuted(!isMuted);
  const toggleShuffle = () => setIsShuffled(!isShuffled);
  const toggleRepeat = () => {
    const modes: Array<'off' | 'all' | 'one'> = ['off', 'all', 'one'];
    const currentIdx = modes.indexOf(repeatMode);
    setRepeatMode(modes[(currentIdx + 1) % 3]);
  };

  const formatTime = (seconds: number): string => {
    if (!seconds || !isFinite(seconds)) return '0:00';
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const currentTrack = getCurrentTrack();
  const progressPercent = duration > 0 ? (currentTime / duration) * 100 : 0;

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6 pb-12">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold">Study Music</h1>
        <p className="text-muted-foreground mt-1">Focus-enhancing music that plays across all pages</p>
      </div>

      {/* Now Playing Card */}
      <Card variant="glass" className="p-6">
        <div className="flex flex-col md:flex-row items-center gap-6">
          {/* Album Art */}
          <div className={`w-32 h-32 rounded-2xl bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center flex-shrink-0 ${isPlaying ? 'animate-pulse' : ''}`}>
            {currentPlaylist ? (
              <div className="text-center">
                <MusicIcon className="w-12 h-12 text-white mx-auto" />
                <span className="text-xs text-white/70 mt-1 block">{currentPlaylist.category}</span>
              </div>
            ) : (
              <MusicIcon className="w-12 h-12 text-white" />
            )}
          </div>

          <div className="flex-1 text-center md:text-left">
            {/* Track Info */}
            <h2 className="text-xl font-semibold">
              {currentTrack?.title || currentPlaylist?.name || 'No track selected'}
            </h2>
            <p className="text-muted-foreground text-sm">
              {currentPlaylist ? `${currentPlaylist.name} • Track ${currentTrackIndex + 1}/${currentPlaylist.tracks.length}` : 'Select a playlist to start'}
            </p>

            {/* Progress Bar with timestamps */}
            <div className="mt-4 space-y-2">
              <div className="flex items-center justify-between text-xs text-slate-400">
                <span>{formatTime(currentTime)}</span>
                <span>{formatTime(duration)}</span>
              </div>
              <div 
                className="w-full h-2 bg-white/10 rounded-full cursor-pointer group"
                onClick={handleSeek}
              >
                <div 
                  className="h-full bg-gradient-to-r from-primary to-blue-500 rounded-full relative transition-all"
                  style={{ width: `${progressPercent}%` }}
                >
                  <div className="absolute right-0 top-1/2 -translate-y-1/2 w-3 h-3 bg-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity" />
                </div>
              </div>
            </div>

            {/* Controls */}
            <div className="flex items-center justify-center md:justify-start gap-3 mt-4 flex-wrap">
              {/* Shuffle */}
              <Button 
                variant="ghost" 
                size="sm" 
                onClick={toggleShuffle}
                className={isShuffled ? 'text-primary' : ''}
              >
                <Shuffle className="w-4 h-4" />
              </Button>

              {/* Previous */}
              <Button variant="ghost" size="sm" onClick={handlePrevious}>
                <SkipBack className="w-4 h-4" />
              </Button>

              {/* Play/Pause */}
              <Button 
                size="lg" 
                onClick={togglePlay} 
                className="w-12 h-12 rounded-full p-0"
                disabled={!currentPlaylist}
              >
                {isPlaying ? <Pause className="w-5 h-5" /> : <Play className="w-5 h-5 ml-0.5" />}
              </Button>

              {/* Next */}
              <Button variant="ghost" size="sm" onClick={handleNext}>
                <SkipForward className="w-4 h-4" />
              </Button>

              {/* Repeat */}
              <Button 
                variant="ghost" 
                size="sm" 
                onClick={toggleRepeat}
                className={repeatMode !== 'off' ? 'text-primary' : ''}
              >
                {repeatMode === 'one' ? <Repeat1 className="w-4 h-4" /> : <Repeat className="w-4 h-4" />}
              </Button>

              {/* Volume */}
              <div className="flex items-center gap-2 ml-2">
                <button onClick={toggleMute} className="text-slate-400 hover:text-white transition-colors">
                  {isMuted || volume === 0 ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
                </button>
                <div className="w-20 h-1.5 bg-white/20 rounded-full cursor-pointer group" onClick={(e) => {
                  const rect = e.currentTarget.getBoundingClientRect();
                  setVolume((e.clientX - rect.left) / rect.width);
                }}>
                  <div className="h-full bg-primary rounded-full" style={{ width: `${isMuted ? 0 : volume * 100}%` }} />
                </div>
              </div>
            </div>
          </div>
        </div>
      </Card>

      {/* Loading State */}
      {loading && (
        <div className="flex items-center justify-center py-12">
          <Loader2 className="w-8 h-8 text-primary animate-spin" />
          <span className="ml-3 text-slate-400">Loading playlists...</span>
        </div>
      )}

      {/* Error State */}
      {error && !loading && (
        <Card variant="glass" className="p-6 text-center border-red-500/30">
          <AlertCircle className="w-8 h-8 text-red-400 mx-auto mb-2" />
          <p className="text-red-400">{error}</p>
          <Button variant="outline" size="sm" className="mt-3" onClick={fetchPlaylists}>Retry</Button>
        </Card>
      )}

      {/* Playlists Grid */}
      {!loading && !error && (
        <>
          <h2 className="text-xl font-semibold flex items-center gap-2">
            <MusicIcon className="w-5 h-5 text-primary" />
            Playlists
            <Badge variant="outline" size="sm">{playlists.length}</Badge>
          </h2>

          {playlists.length === 0 ? (
            <Card variant="glass" className="p-12 text-center">
              <MusicIcon className="w-12 h-12 text-slate-600 mx-auto mb-3" />
              <p className="text-slate-400">No playlists available</p>
            </Card>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {playlists.map((playlist) => {
                const isActive = currentPlaylist?.id === playlist.id;
                return (
                  <motion.div
                    key={playlist.id}
                    whileHover={{ y: -4 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    <Card 
                      variant="interactive" 
                      className={`p-4 cursor-pointer transition-all ${
                        isActive ? 'border-primary/50 bg-primary/5 ring-1 ring-primary/30' : ''
                      }`}
                      onClick={() => playPlaylist(playlist, 0)}
                    >
                      <div className="flex items-center gap-3">
                        <div className={`w-12 h-12 rounded-lg bg-gradient-to-br from-primary/30 to-blue-500/30 flex items-center justify-center ${isActive && isPlaying ? 'animate-pulse' : ''}`}>
                          {isActive && isPlaying ? (
                            <div className="flex items-end gap-0.5 h-5">
                              <span className="w-1 bg-primary rounded-full animate-bounce" style={{ animationDelay: '0ms', height: '60%' }} />
                              <span className="w-1 bg-primary rounded-full animate-bounce" style={{ animationDelay: '100ms', height: '100%' }} />
                              <span className="w-1 bg-primary rounded-full animate-bounce" style={{ animationDelay: '200ms', height: '40%' }} />
                              <span className="w-1 bg-primary rounded-full animate-bounce" style={{ animationDelay: '300ms', height: '80%' }} />
                            </div>
                          ) : (
                            <MusicIcon className="w-5 h-5 text-primary" />
                          )}
                        </div>
                        <div className="flex-1 min-w-0">
                          <h3 className="font-medium truncate">{playlist.name}</h3>
                          <p className="text-xs text-muted-foreground">
                            {playlist.tracks?.length || 0} tracks
                          </p>
                        </div>
                        <div className="flex items-center gap-2">
                          <Badge variant="outline" size="sm" className="text-xs">{playlist.category}</Badge>
                          {isActive && isPlaying && (
                            <Badge variant="success" size="sm" className="text-xs">Playing</Badge>
                          )}
                        </div>
                      </div>
                    </Card>
                  </motion.div>
                );
              })}
            </div>
          )}
        </>
      )}
    </motion.div>
  );
}