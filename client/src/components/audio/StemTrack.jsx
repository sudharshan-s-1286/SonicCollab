import React from 'react';
import { Volume2, VolumeX, Trash2, Edit2, Play, Music } from 'lucide-react';
import usePlayerStore from '../../store/playerStore';
import api from '../../services/api';

const StemTrack = ({ track, onRefresh }) => {
  const { updateTrackVolume, toggleTrackMute } = usePlayerStore();

  const getStemColor = (type) => {
    const colors = {
      vocals: '#7C5CFC', // Violet
      drums: '#F5A623', // Amber
      bass: '#14B8A6', // Teal
      guitar: '#F43F5E', // Coral
      keys: '#8B5CF6',
      synth: '#D946EF',
      other: '#64748B'
    };
    return colors[type] || colors.other;
  };

  const handleDelete = async () => {
    if (window.confirm(`Are you sure you want to delete ${track.name}?`)) {
      try {
        await api.delete(`/tracks/${track._id}`);
        onRefresh();
      } catch (error) {
        console.error('Error deleting track:', error);
      }
    }
  };

  return (
    <div className="bg-[var(--bg-secondary)] border border-[var(--border-color)] rounded-2xl p-4 flex items-center gap-6 hover:border-[var(--accent-violet)] transition-all group shadow-sm">
      
      {/* Type indicator and play solo button */}
      <div className="flex flex-col items-center gap-2">
        <div 
          className="w-1.5 h-16 rounded-full" 
          style={{ backgroundColor: getStemColor(track.stemType) }}
        />
        <button className="p-1.5 rounded-full hover:bg-[var(--accent-violet)]/10 text-[var(--accent-violet)] opacity-0 group-hover:opacity-100 transition-opacity">
           <Play size={14} fill="currentColor" />
        </button>
      </div>

      {/* Main Info */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 mb-2">
          <Music size={16} className="text-[var(--text-secondary)]" />
          <h4 className="font-space font-bold text-sm truncate">{track.name}</h4>
          <span className="text-[9px] uppercase font-bold tracking-widest text-[var(--text-secondary)] px-2 py-0.5 rounded-full bg-white/5 border border-white/5">
            {track.stemType}
          </span>
        </div>
        
        {/* Simplified Waveform Visualization Placeholder */}
        <div className="h-10 w-full flex items-end gap-[2px] transition-all group-hover:gap-1">
           {[...Array(40)].map((_, i) => {
             const h = 5 + Math.random() * 20;
             return (
               <div 
                 key={i} 
                 className="flex-1 bg-gradient-to-t from-[var(--bg-primary)] to-[var(--text-secondary)] rounded-t-sm group-hover:from-[var(--accent-violet)]/20"
                 style={{ height: `${h}px` }}
               />
             );
           })}
        </div>
      </div>

      {/* Controls */}
      <div className="flex flex-col items-end gap-3 min-w-[140px]">
        <div className="flex items-center gap-4">
           <div className="flex items-center gap-2 text-xs font-bold text-[var(--text-secondary)]">
             <span>{Math.round(track.volume * 100)}%</span>
             <input 
               type="range"
               min={0}
               max={1}
               step="0.01"
               value={track.isMuted ? 0 : track.volume}
               onChange={(e) => updateTrackVolume(track._id, parseFloat(e.target.value))}
               className="w-20"
             />
           </div>
           
           <button 
             onClick={() => toggleTrackMute(track._id)}
             className={`p-2 rounded-lg transition-all ${track.isMuted ? 'bg-red-500/10 text-red-500' : 'hover:bg-white/10 text-[var(--text-secondary)]'}`}
           >
             {track.isMuted ? <VolumeX size={18} /> : <Volume2 size={18} />}
           </button>
        </div>

        <div className="flex items-center gap-2">
           <button className="p-2 text-[var(--text-secondary)] hover:bg-white/10 rounded-lg transition-colors">
              <Edit2 size={16} />
           </button>
           <button 
             onClick={handleDelete}
             className="p-2 text-red-500/50 hover:text-red-500 hover:bg-red-500/10 rounded-lg transition-colors"
           >
              <Trash2 size={16} />
           </button>
        </div>
      </div>
    </div>
  );
};

export default StemTrack;
