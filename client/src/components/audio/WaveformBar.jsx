import React, { useRef, useEffect } from 'react';
import usePlayerStore from '../../store/playerStore';
import useAudioEngine from '../../hooks/useAudioEngine';

const WaveformBar = ({ width, height, isThumbnail }) => {
  const canvasRef = useRef(null);
  const { isPlaying } = usePlayerStore();
  const { getTrackNodes } = useAudioEngine();
  const rafId = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    
    const draw = () => {
      // Find the first available analyser node
      const trackNodes = getTrackNodes();
      const analysers = Object.values(trackNodes).map(n => n.analyser).filter(Boolean);
      if (analysers.length === 0) {
        // Draw static placeholder bars if nothing is playing
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        ctx.fillStyle = isThumbnail ? 'rgba(124, 92, 252, 0.4)' : 'transparent';
        const numBars = 20;
        const barWidth = canvas.width / numBars;
        for (let i = 0; i < numBars; i++) {
          const h = 4 + Math.random() * 8;
          ctx.fillRect(i * barWidth + 1, (canvas.height - h) / 2, barWidth - 1, h);
        }
        if (isPlaying) rafId.current = requestAnimationFrame(draw);
        return;
      }

      // Use the first analyser to get data
      const analyser = analysers[0];
      const bufferLength = analyser.frequencyBinCount;
      const dataArray = new Uint8Array(bufferLength);
      analyser.getByteTimeDomainData(dataArray);

      ctx.clearRect(0, 0, canvas.width, canvas.height);
      
      const barWidth = (canvas.width / bufferLength) * 2.5;
      let x = 0;

      for (let i = 0; i < bufferLength; i++) {
        const v = dataArray[i] / 128.0;
        const h = v * (canvas.height / 2);

        // Gradient color
        const gradient = ctx.createLinearGradient(0, 0, 0, canvas.height);
        gradient.addColorStop(0, '#7C5CFC'); // Violet
        gradient.addColorStop(1, '#F5A623'); // Amber
        
        ctx.fillStyle = gradient;
        ctx.fillRect(x, (canvas.height / 2) - h/2, barWidth - 1, h);

        x += barWidth;
      }

      rafId.current = requestAnimationFrame(draw);
    };

    if (isPlaying) {
      draw();
    } else {
      draw(); // Draw once for initial look
    }

    return () => {
      if (rafId.current) cancelAnimationFrame(rafId.current);
    };
  }, [isPlaying, getTrackNodes, isThumbnail]);

  return (
    <canvas 
      ref={canvasRef} 
      width={width || 300} 
      height={height || 32}
      className={`${isThumbnail ? 'rounded-md' : 'w-full'}`}
    />
  );
};

export default WaveformBar;
