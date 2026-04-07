import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Layers, PlayCircle, Users } from 'lucide-react';

const LandingPage = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-[calc(100vh-73px)] relative overflow-hidden">
      {/* Background SVG / Decor */}
      <div className="absolute top-0 w-full h-full -z-10 bg-gradient-to-b from-background to-surface">
        <div className="absolute top-1/4 -left-1/4 w-[500px] h-[500px] bg-accentViolet/10 rounded-full blur-[100px]" />
        <div className="absolute bottom-1/4 -right-1/4 w-[500px] h-[500px] bg-accentAmber/10 rounded-full blur-[100px]" />
      </div>

      <div className="container mx-auto px-4 py-20 flex flex-col items-center justify-center text-center">
        <h1 className="text-5xl md:text-7xl font-space font-bold mb-6 tracking-tight">
          Build songs. <span className="text-transparent bg-clip-text bg-gradient-to-r from-accentViolet to-accentAmber">Together.</span>
        </h1>
        <p className="text-lg md:text-xl text-textMuted max-w-2xl mb-10 leading-relaxed">
          The collaborative workspace for independent musicians. Upload stems, mix tracks in the browser, and build your next masterpiece with artists around the globe.
        </p>

        <div className="flex flex-col sm:flex-row gap-4 mb-20">
          <button 
            onClick={() => navigate('/signup')}
            className="px-8 py-3.5 rounded-full bg-accentViolet hover:bg-opacity-90 text-white font-medium text-lg transition-transform transform hover:-translate-y-1 shadow-[0_0_20px_rgba(124,92,252,0.4)]"
          >
            Start Collaborating
          </button>
          <button 
            onClick={() => navigate('/explore')}
            className="px-8 py-3.5 rounded-full bg-surface border border-borderBase hover:border-accentAmber text-textMain font-medium text-lg transition-colors hover:text-accentAmber"
          >
            Explore Projects
          </button>
        </div>

        <div className="grid md:grid-cols-3 gap-8 w-full max-w-5xl">
          <FeatureCard 
            icon={<Layers size={32} className="text-accentViolet" />}
            title="Upload Stems"
            desc="Easily drag and drop individual instrument stems up to 100MB per file."
          />
          <FeatureCard 
             icon={<PlayCircle size={32} className="text-accentAmber" />}
             title="Mix Tracks"
             desc="Built-in Web Audio mixer to solo, mute, and adjust track volumes in real-time."
          />
          <FeatureCard 
            icon={<Users size={32} className="text-teal-400" />}
            title="Collaborate Live"
            desc="Leave timestamped comments and seamlessly invite artists to your project."
          />
        </div>
      </div>
    </div>
  );
};

const FeatureCard = ({ icon, title, desc }) => (
  <div className="glass-panel p-8 rounded-2xl flex flex-col items-center text-center transform transition-transform hover:-translate-y-2">
    <div className="p-4 rounded-full bg-black/20 mb-4 inline-block">
      {icon}
    </div>
    <h3 className="text-xl font-space font-bold mb-3">{title}</h3>
    <p className="text-textMuted">{desc}</p>
  </div>
);

export default LandingPage;
