import React, { useState, useEffect, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Play, Pause, SkipBack, SkipForward, Volume2, VolumeX,
  Music as MusicIcon, Shuffle, Repeat, Repeat1,
  Loader2, AlertCircle, List, X, ChevronRight
} from 'lucide-react';
import { Card } from '../components/ui/card';
import { Badge } from '../components/ui/Badge';
import { Button } from '../components/ui/Button';

interface Track { title: string; url: string; duration: string; }
interface PlaylistFromAPI { id: number; name: string; category: string; tracks: Track[]; }

const API = 'http://localhost:5000/api/v1';
let globalAudio: HTMLAudioElement | null = null;
function getGlobalAudio(): HTMLAudioElement {
  if (!globalAudio) { globalAudio = new Audio(); globalAudio.preload = 'auto'; }
  return globalAudio;
}

export default function Music() {
  const [playlists, setPlaylists] = useState<PlaylistFromAPI[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [currentPlaylist, setCurrentPlaylist] = useState<PlaylistFromAPI | null>(null);
  const [currentTrackIndex, setCurrentTrackIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [volume, setVolume] = useState(0.7);
  const [isMuted, setIsMuted] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [isShuffled, setIsShuffled] = useState(false);
  const [repeatMode, setRepeatMode] = useState<'off' | 'all' | 'one'>('off');
  const [showTrackList, setShowTrackList] = useState(false);
  const audioRef = useRef<HTMLAudioElement>(getGlobalAudio());

  const fetchPlaylists = useCallback(async () => {
    setLoading(true);
    try {
      const response = await fetch(API + '/music/playlists');
      const data = await response.json();
      if (Array.isArray(data)) setPlaylists(data);
    } catch (err: any) { setError(err.message); }
    finally { setLoading(false); }
  }, []);
  useEffect(() => { fetchPlaylists(); }, [fetchPlaylists]);

  useEffect(() => {
    const audio = audioRef.current;
    const handlers = {
      timeupdate: () => setCurrentTime(audio.currentTime),
      loadedmetadata: () => setDuration(audio.duration),
      ended: () => handleNext(),
      play: () => setIsPlaying(true),
      pause: () => setIsPlaying(false),
    };
    Object.entries(handlers).forEach(([event, handler]) => audio.addEventListener(event, handler));
    return () => Object.entries(handlers).forEach(([event, handler]) => audio.removeEventListener(event, handler));
  }, [currentTrackIndex, currentPlaylist, repeatMode]);

  useEffect(() => { audioRef.current.volume = isMuted ? 0 : volume; }, [volume, isMuted]);

  const playTrack = (playlist: PlaylistFromAPI, index: number) => {
    if (!playlist?.tracks?.length) return;
    const idx = Math.min(index, playlist.tracks.length - 1);
    setCurrentPlaylist(playlist);
    setCurrentTrackIndex(idx);
    setShowTrackList(false);
    const track = playlist.tracks[idx];
    if (track?.url) {
      // USE PROXY TO BYPASS CORS
      const proxyUrl = API + '/proxy/audio?url=' + encodeURIComponent(track.url);
      audioRef.current.src = proxyUrl;
      audioRef.current.play().catch(() => {});
      setIsPlaying(true);
      setCurrentTime(0);
    }
  };

  const togglePlay = () => {
    if (!audioRef.current.src && currentPlaylist) { playTrack(currentPlaylist, currentTrackIndex); return; }
    isPlaying ? audioRef.current.pause() : audioRef.current.play().catch(() => {});
  };

  const handleNext = () => {
    if (!currentPlaylist) return;
    if (repeatMode === 'one') { audioRef.current.currentTime = 0; audioRef.current.play(); return; }
    const next = currentTrackIndex + 1;
    if (next >= currentPlaylist.tracks.length) {
      if (repeatMode === 'all') playTrack(currentPlaylist, 0);
      else { setIsPlaying(false); audioRef.current.pause(); }
    } else playTrack(currentPlaylist, next);
  };

  const handlePrevious = () => {
    if (!currentPlaylist) return;
    if (audioRef.current.currentTime > 3) { audioRef.current.currentTime = 0; return; }
    const prev = currentTrackIndex - 1;
    playTrack(currentPlaylist, prev < 0 ? currentPlaylist.tracks.length - 1 : prev);
  };

  const formatTime = (s: number) => s && isFinite(s) ? Math.floor(s/60)+':'+String(Math.floor(s%60)).padStart(2,'0') : '0:00';
  const currentTrack = currentPlaylist?.tracks?.[currentTrackIndex];
  const progress = duration > 0 ? (currentTime / duration) * 100 : 0;

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6 pb-12">
      <div><h1 className="text-3xl font-bold">Study Music</h1><p className="text-muted-foreground mt-1">Click a playlist • Music plays everywhere</p></div>
      <Card variant="glass" className="p-6">
        <div className="flex flex-col md:flex-row items-center gap-6">
          <div className={'w-32 h-32 rounded-2xl bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center flex-shrink-0 ' + (isPlaying ? 'animate-pulse' : '')}><MusicIcon className="w-12 h-12 text-white" /></div>
          <div className="flex-1 text-center md:text-left">
            <h2 className="text-xl font-semibold">{currentTrack?.title || 'Select a track'}</h2>
            <p className="text-muted-foreground text-sm">{currentPlaylist?.name || ''}</p>
            <div className="mt-4 space-y-2">
              <div className="flex justify-between text-xs text-slate-400"><span>{formatTime(currentTime)}</span><span>{formatTime(duration)}</span></div>
              <div className="w-full h-2 bg-white/10 rounded-full cursor-pointer" onClick={(e) => { const r = e.currentTarget.getBoundingClientRect(); audioRef.current.currentTime = ((e.clientX - r.left) / r.width) * duration; }}><div className="h-full bg-gradient-to-r from-primary to-blue-500 rounded-full" style={{ width: progress + '%' }} /></div>
            </div>
            <div className="flex items-center justify-center md:justify-start gap-3 mt-4 flex-wrap">
              <Button variant="ghost" size="sm" onClick={() => setIsShuffled(!isShuffled)} className={isShuffled ? 'text-primary' : ''}><Shuffle className="w-4 h-4" /></Button>
              <Button variant="ghost" size="sm" onClick={handlePrevious}><SkipBack className="w-4 h-4" /></Button>
              <Button size="lg" onClick={togglePlay} className="w-12 h-12 rounded-full p-0">{isPlaying ? <Pause className="w-5 h-5" /> : <Play className="w-5 h-5 ml-0.5" />}</Button>
              <Button variant="ghost" size="sm" onClick={handleNext}><SkipForward className="w-4 h-4" /></Button>
              <Button variant="ghost" size="sm" onClick={() => setRepeatMode(repeatMode === 'off' ? 'all' : repeatMode === 'all' ? 'one' : 'off')} className={repeatMode !== 'off' ? 'text-primary' : ''}>{repeatMode === 'one' ? <Repeat1 className="w-4 h-4" /> : <Repeat className="w-4 h-4" />}</Button>
              <div className="flex items-center gap-2"><button onClick={() => setIsMuted(!isMuted)}>{isMuted ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}</button><div className="w-20 h-1.5 bg-white/20 rounded-full cursor-pointer" onClick={(e) => { const r = e.currentTarget.getBoundingClientRect(); setVolume((e.clientX - r.left) / r.width); }}><div className="h-full bg-primary rounded-full" style={{ width: (isMuted ? 0 : volume * 100) + '%' }} /></div></div>
            </div>
          </div>
        </div>
      </Card>

      {showTrackList && currentPlaylist && (
        <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }}><Card variant="glass" className="p-4"><div className="flex items-center justify-between mb-3"><h3 className="font-semibold flex items-center gap-2"><List className="w-4 h-4" />{currentPlaylist.name} — Tracks</h3><Button variant="ghost" size="sm" onClick={() => setShowTrackList(false)}><X className="w-4 h-4" /></Button></div><div className="space-y-1">{currentPlaylist.tracks.map((track, i) => (<div key={i} onClick={() => playTrack(currentPlaylist, i)} className={'flex items-center gap-3 p-3 rounded-lg cursor-pointer transition-all ' + (i === currentTrackIndex ? 'bg-primary/20 border border-primary/30' : 'hover:bg-white/5')}><span className="text-xs text-slate-500 w-6">{i + 1}</span>{i === currentTrackIndex && isPlaying ? (<div className="flex items-end gap-0.5 h-4 w-5"><span className="w-0.5 bg-primary rounded-full animate-bounce" style={{ animationDelay: '0ms', height: '60%' }} /><span className="w-0.5 bg-primary rounded-full animate-bounce" style={{ animationDelay: '150ms', height: '100%' }} /><span className="w-0.5 bg-primary rounded-full animate-bounce" style={{ animationDelay: '300ms', height: '40%' }} /></div>) : (<Play className="w-4 h-4 text-slate-400" />)}<div className="flex-1"><p className={'text-sm ' + (i === currentTrackIndex ? 'text-primary font-medium' : '')}>{track.title}</p></div><span className="text-xs text-slate-500">{track.duration}</span></div>))}</div></Card></motion.div>
      )}

      {loading && <div className="flex justify-center py-12"><Loader2 className="w-8 h-8 animate-spin text-primary" /></div>}
      {error && !loading && <Card variant="glass" className="p-6 text-center border-red-500/30"><AlertCircle className="w-8 h-8 text-red-400 mx-auto mb-2" /><p className="text-red-400">{error}</p></Card>}

      {!loading && !error && (<><h2 className="text-xl font-semibold flex items-center gap-2"><MusicIcon className="w-5 h-5 text-primary" />Playlists <Badge variant="outline" size="sm">{playlists.length}</Badge></h2><div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">{playlists.map(playlist => {const isActive = currentPlaylist?.id === playlist.id; return (<motion.div key={playlist.id} whileHover={{ y: -4 }} whileTap={{ scale: 0.98 }}><Card variant="interactive" className={'p-4 cursor-pointer ' + (isActive ? 'border-primary/50 bg-primary/5 ring-1 ring-primary/30' : '')} onClick={() => { if (isActive) { setShowTrackList(!showTrackList); } else { setCurrentPlaylist(playlist); setShowTrackList(true); } }}><div className="flex items-center gap-3"><div className={'w-12 h-12 rounded-lg bg-gradient-to-br from-primary/30 to-blue-500/30 flex items-center justify-center ' + (isActive && isPlaying ? 'animate-pulse' : '')}>{isActive && isPlaying ? (<div className="flex items-end gap-0.5 h-5"><span className="w-1 bg-primary rounded-full animate-bounce" style={{ animationDelay: '0ms', height: '60%' }} /><span className="w-1 bg-primary rounded-full animate-bounce" style={{ animationDelay: '100ms', height: '100%' }} /><span className="w-1 bg-primary rounded-full animate-bounce" style={{ animationDelay: '200ms', height: '40%' }} /></div>) : <MusicIcon className="w-5 h-5 text-primary" />}</div><div className="flex-1 min-w-0"><h3 className="font-medium truncate">{playlist.name}</h3><p className="text-xs text-muted-foreground">{playlist.tracks?.length || 0} tracks</p></div><Badge variant="outline" size="sm">{playlist.category}</Badge>{isActive && isPlaying && <Badge variant="success" size="sm">Playing</Badge>}<ChevronRight className="w-4 h-4 text-slate-400" /></div></Card></motion.div>);})}</div></>)}
    </motion.div>
  );
}
