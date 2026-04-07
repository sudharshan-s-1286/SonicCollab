import { create } from 'zustand';

const usePlayerStore = create((set, get) => ({
  isPlaying: false,
  currentTime: 0,
  duration: 0,
  tracks: [], // Loaded track objects with source/gain/analyser refs
  activeProjectId: null,
  masterVolume: 1.0,

  setIsPlaying: (playing) => set({ isPlaying: playing }),
  setCurrentTime: (time) => set({ currentTime: time }),
  setDuration: (duration) => set({ duration: duration }),
  setMasterVolume: (v) => set({ masterVolume: v }),
  
  setActiveProjectId: (projectId) => {
    if (get().activeProjectId !== projectId) {
      set({ 
        activeProjectId: projectId, 
        tracks: [], 
        currentTime: 0, 
        duration: 0, 
        isPlaying: false 
      });
    }
  },

  setTracks: (tracks) => set({ tracks }),
  
  updateTrackVolume: (trackId, volume) => {
    set((state) => ({
      tracks: state.tracks.map((t) => 
        t._id === trackId ? { ...t, volume } : t
      )
    }));
  },

  toggleTrackMute: (trackId) => {
    set((state) => ({
      tracks: state.tracks.map((t) => 
        t._id === trackId ? { ...t, isMuted: !t.isMuted } : t
      )
    }));
  }
}));

export default usePlayerStore;
