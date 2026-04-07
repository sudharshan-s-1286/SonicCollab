import React from 'react';
import { X, VolumeX, Volume2, Music } from 'lucide-react';
import usePlayerStore from '../../store/playerStore';

const MixerPanel = ({ closeMixer }) => {
  const { 
    tracks, 
    updateTrackVolume, 
    toggleTrackMute 
  } = usePlayerStore();

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

  return (
    <div className="absolute bottom-full left-0 right-0 mb-4 mx-4 glass-panel rounded-3xl p-6 shadow-2xl animate-fade-in-up border border-white/10 dark:border-white/5">
      <div className="flex items-center justify-between mb-8">
        <h3 className="text-xl font-space font-bold">Studio Mixer</h3>
        <button 
          onClick={closeMixer}
          className="p-2 hover:bg-white/10 rounded-full transition-colors"
        >
          <X size={20} />
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 max-h-[60vh] overflow-y-auto pr-2 custom-scrollbar">
        {tracks.length === 0 ? (
          <div className="col-span-full py-10 text-center text-[var(--text-secondary)] italic">
            No audio tracks loaded in the mixer.
          </div>
        ) : (
          tracks.map((track) => (
            <div 
              key={track._id} 
              className="bg-black/20 dark:bg-white/5 p-4 rounded-2xl flex items-center gap-4 group"
            >
              {/* Type indicator */}
              <div 
                className="w-1.5 h-12 rounded-full hidden sm:block" 
                style={{ backgroundColor: getStemColor(track.stemType) }}
              />

              <div className="flex-1 overflow-hidden">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-bold truncate pr-2">{track.name}</span>
                  <span className="text-[9px] uppercase font-bold tracking-widest text-[var(--text-secondary)] px-2 py-0.5 rounded-full bg-white/5">
                    {track.stemType}
                  </span>
                </div>

                <div className="flex items-center gap-3">
                  <button 
                    onClick={() => toggleTrackMute(track._id)}
                    className={`p-1.5 rounded-lg transition-all ${track.isMuted ? 'bg-red-500/20 text-red-500' : 'hover:bg-white/10 text-[var(--text-secondary)]'}`}
                  >
                    {track.isMuted ? <VolumeX size={16} /> : <Volume2 size={16} />}
                  </button>
                  
                  <input 
                    type="range"
                    min={0}
                    max={1}
                    step="0.01"
                    value={track.isMuted ? 0 : track.volume}
                    onChange={(e) => updateTrackVolume(track._id, parseFloat(e.target.value))}
                    className="flex-1 h-1 bg-gray-300 dark:bg-gray-700 rounded-full appearance-none cursor-pointer"
                  />
                  
                  <span className="text-[10px] font-medium w-8 text-right text-[var(--text-secondary)]">
                    {Math.round((track.isMuted ? 0 : track.volume) * 100)}%
                  </span>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default MixerPanel;
