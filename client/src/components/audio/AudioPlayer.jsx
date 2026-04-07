import React, { useState } from 'react';
import { Play, Pause, Volume2, Maximize2, SkipForward, SkipBack } from 'lucide-react';
import usePlayerStore from '../../store/playerStore';
import useAudioEngine from '../../hooks/useAudioEngine';
import WaveformBar from './WaveformBar';
import MixerPanel from './MixerPanel';
import formatTime from '../../utils/formatTime';

const AudioPlayer = () => {
  const {
    isPlaying,
    currentTime,
    duration,
    masterVolume,
    setMasterVolume,
    activeProjectId,
  } = usePlayerStore();

  const { playAll, pauseAll, seekTo } = useAudioEngine();
  const [mixerOpen, setMixerOpen] = useState(false);

  if (!activeProjectId) return null;

  const handlePlayPause = () => {
    if (isPlaying) pauseAll();
    else playAll();
  };

  const handleSeek = (e) => {
    const time = parseFloat(e.target.value);
    seekTo(time);
  };

  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 glass-panel border-t border-[var(--accent-violet)]/20 shadow-2xl safe-area-bottom px-6 py-4 flex items-center justify-between transition-all duration-300">
      
      {/* Left: Project Preview */}
      <div className="flex items-center gap-4 w-1/4">
        <div className="hidden lg:block w-12 h-12 bg-[var(--accent-violet)]/10 rounded-lg overflow-hidden border border-[var(--border-color)]">
           <WaveformBar height={48} width={48} isThumbnail={true} />
        </div>
        <div className="overflow-hidden">
          <h4 className="text-sm font-space font-bold truncate">Project in Session</h4>
          <p className="text-[10px] text-[var(--accent-violet)] font-bold uppercase tracking-wider">Active Mix</p>
        </div>
      </div>

      {/* Center: Playback Controls */}
      <div className="flex flex-col items-center gap-2 flex-1 max-w-xl px-8">
        <div className="flex items-center gap-6">
          <button className="text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-colors">
            <SkipBack size={20} />
          </button>
          
          <button 
            onClick={handlePlayPause}
            className="w-12 h-12 rounded-full bg-[var(--accent-violet)] text-white flex items-center justify-center transition-all transform hover:scale-105 shadow-lg shadow-[var(--accent-violet)]/30"
          >
            {isPlaying ? <Pause size={24} /> : <Play size={24} className="ml-1" />}
          </button>

          <button className="text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-colors">
            <SkipForward size={20} />
          </button>
        </div>

        <div className="flex items-center gap-4 w-full text-[10px] text-[var(--text-secondary)] font-medium">
          <span>{formatTime(currentTime)}</span>
          <div className="relative flex-1 group">
             <input 
               type="range"
               min={0}
               max={duration || 1}
               step="0.1"
               value={currentTime}
               onChange={handleSeek}
               className="w-full h-1 bg-gray-300 dark:bg-gray-700 rounded-full appearance-none cursor-pointer"
             />
             {/* Progress Fill Mask */}
             <div 
               className="absolute top-1/2 -translate-y-1/2 left-0 h-1 bg-gradient-to-r from-[var(--accent-violet)] to-[var(--accent-amber)] rounded-full pointer-events-none"
               style={{ width: `${(currentTime / (duration || 1)) * 100}%` }}
             />
          </div>
          <span>{formatTime(duration)}</span>
        </div>
      </div>

      {/* Right: Master Control */}
      <div className="flex items-center justify-end gap-6 w-1/4">
        <div className="hidden lg:flex items-center gap-3">
          <Volume2 size={18} className="text-[var(--text-secondary)]" />
          <input 
            type="range"
            min={0}
            max={1}
            step="0.01"
            value={masterVolume}
            onChange={(e) => setMasterVolume(parseFloat(e.target.value))}
            className="w-20"
          />
        </div>

        <button 
          onClick={() => setMixerOpen(!mixerOpen)}
          className={`p-2 rounded-lg transition-colors ${mixerOpen ? 'bg-[var(--accent-violet)] text-white' : 'text-[var(--text-secondary)] hover:bg-white/10'}`}
        >
          <Maximize2 size={20} />
        </button>
      </div>

      {/* Mixer Panel Drawer */}
      {mixerOpen && <MixerPanel closeMixer={() => setMixerOpen(false)} />}
    </div>
  );
};

export default AudioPlayer;
