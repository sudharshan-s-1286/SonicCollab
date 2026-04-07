import { useRef, useEffect, useCallback } from 'react';
import usePlayerStore from '../store/playerStore';

// Audio Context Singleton
let audioCtx = null;

const useAudioEngine = () => {
  const {
    isPlaying,
    currentTime,
    duration,
    setIsPlaying,
    setCurrentTime,
    setDuration,
    tracks,
    masterVolume,
  } = usePlayerStore();

  // Refs for audio nodes and buffers
  const trackBuffers = useRef({}); // { trackId: AudioBuffer }
  const trackNodes = useRef({}); // { trackId: { source, gain, analyser } }
  const startTime = useRef(0);
  const offset = useRef(0);
  const rafId = useRef(null);

  // Initialize Audio Context on first use
  const getContext = useCallback(() => {
    if (!audioCtx) {
      audioCtx = new (window.AudioContext || window.webkitAudioContext)();
    }
    if (audioCtx.state === 'suspended') {
      audioCtx.resume();
    }
    return audioCtx;
  }, []);

  // Fetch and decode audio track
  const loadTrack = useCallback(async (track) => {
    if (trackBuffers.current[track._id]) return;

    try {
      const response = await fetch(track.audioUrl);
      const arrayBuffer = await response.arrayBuffer();
      const ctx = getContext();
      const audioBuffer = await ctx.decodeAudioData(arrayBuffer);
      
      trackBuffers.current[track._id] = audioBuffer;
      
      // Update max duration if this track is longer
      if (audioBuffer.duration > duration) {
        setDuration(audioBuffer.duration);
      }
    } catch (err) {
      console.error('Error loading track:', err);
    }
  }, [getContext, duration, setDuration]);

  // Create nodes for a specific track
  const connectTrack = useCallback((trackId, buffer, startOffset = 0) => {
    const ctx = getContext();
    
    const source = ctx.createBufferSource();
    source.buffer = buffer;

    const gainNode = ctx.createGain();
    const analyser = ctx.createAnalyser();
    analyser.fftSize = 256;

    // Connect nodes: Source -> Gain -> Analyser -> Destination
    source.connect(gainNode);
    gainNode.connect(analyser);
    analyser.connect(ctx.destination);

    // Set initial volume
    const trackData = tracks.find(t => t._id === trackId);
    gainNode.gain.value = trackData?.isMuted ? 0 : (trackData?.volume || 1.0) * masterVolume;

    source.start(0, startOffset);
    
    return { source, gain: gainNode, analyser };
  }, [getContext, tracks, masterVolume]);

  const stopAll = useCallback(() => {
    Object.values(trackNodes.current).forEach(nodes => {
      if (nodes.source) {
        try { source.stop(); } catch(e) {}
        nodes.source.disconnect();
      }
    });
    trackNodes.current = {};
    if (rafId.current) cancelAnimationFrame(rafId.current);
  }, []);

  const playAll = useCallback(() => {
    const ctx = getContext();
    stopAll();

    startTime.current = ctx.currentTime - offset.current;
    
    Object.keys(trackBuffers.current).forEach(id => {
      const buffer = trackBuffers.current[id];
      if (offset.current < buffer.duration) {
        trackNodes.current[id] = connectTrack(id, buffer, offset.current);
      }
    });

    setIsPlaying(true);
    
    const updateProgress = () => {
      const now = ctx.currentTime;
      const currentPos = now - startTime.current;
      
      if (currentPos >= duration) {
        setIsPlaying(false);
        offset.current = 0;
        setCurrentTime(0);
        stopAll();
      } else {
        setCurrentTime(currentPos);
        rafId.current = requestAnimationFrame(updateProgress);
      }
    };
    rafId.current = requestAnimationFrame(updateProgress);
  }, [getContext, stopAll, connectTrack, duration, setIsPlaying, setCurrentTime]);

  const pauseAll = useCallback(() => {
    const ctx = getContext();
    offset.current = ctx.currentTime - startTime.current;
    stopAll();
    setIsPlaying(false);
  }, [getContext, stopAll, setIsPlaying]);

  const seekTo = useCallback((seconds) => {
    offset.current = seconds;
    setCurrentTime(seconds);
    if (isPlaying) {
      playAll();
    }
  }, [isPlaying, playAll, setCurrentTime]);

  // Sync node volumes with store state
  useEffect(() => {
    tracks.forEach(track => {
      const nodes = trackNodes.current[track._id];
      if (nodes) {
        nodes.gain.gain.setTargetAtTime(
          track.isMuted ? 0 : track.volume * masterVolume,
          getContext().currentTime,
          0.02
        );
      }
    });
  }, [tracks, masterVolume, getContext]);

  return {
    loadTrack,
    playAll,
    pauseAll,
    seekTo,
    trackNodes: trackNodes.current
  };
};

export default useAudioEngine;
