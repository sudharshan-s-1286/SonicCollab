import React, { useState, useEffect } from 'react';
import api from '../services/api';
import ProjectCard from '../components/project/ProjectCard';
import { Search, Filter, Music, Users, ArrowRight } from 'lucide-react';
import useDebounce from '../hooks/useDebounce';

const ExplorePage = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [activeGenre, setActiveGenre] = useState('All');
  const [results, setResults] = useState({ projects: [], artists: [] });
  const [loading, setLoading] = useState(true);
  const debouncedSearch = useDebounce(searchTerm, 300);

  const genres = ['All', 'Rock', 'Pop', 'Hip-Hop', 'Electronic', 'Jazz', 'Classical', 'Acoustic'];

  const fetchResults = async () => {
    setLoading(true);
    try {
      const res = await api.get(`/search?q=${debouncedSearch}&genre=${activeGenre}`);
      if (res.data.success) {
        setResults(res.data.data);
      }
    } catch (err) {
      console.error('Error fetching search results:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchResults();
  }, [debouncedSearch, activeGenre]);

  return (
    <div className="p-6 md:p-8 max-w-7xl mx-auto space-y-12 pb-24">
      
      {/* Hero Search Area */}
      <div className="relative glass-panel p-8 md:p-12 rounded-[40px] overflow-hidden">
        <div className="absolute top-0 right-0 -mr-16 -mt-16 w-64 h-64 bg-[var(--accent-violet)]/10 rounded-full blur-3xl pointer-events-none" />
        <div className="relative z-10 flex flex-col items-center text-center">
          <h1 className="text-4xl md:text-5xl font-space font-bold mb-4 tracking-tight">Discover your next <span className="text-[var(--accent-violet)]">masterpiece.</span></h1>
          <p className="text-[var(--text-secondary)] mb-8 max-w-xl">Find talented artists and open projects to collaborate and build amazing music together.</p>
          
          <div className="w-full max-w-2xl relative">
             <Search className="absolute left-6 top-1/2 -translate-y-1/2 text-[var(--accent-violet)]" size={20} />
             <input 
              type="text" 
              placeholder="Search for projects, genres, or artists..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full bg-[var(--bg-primary)] border border-white/5 focus:border-[var(--accent-violet)] rounded-full py-4 pl-14 pr-6 text-base focus:outline-none transition-all shadow-xl"
             />
          </div>
        </div>
      </div>

      {/* Genre Filter Chips */}
      <div className="flex items-center gap-3 overflow-x-auto pb-4 hide-scrollbar">
         {genres.map(genre => (
           <button
            key={genre}
            onClick={() => setActiveGenre(genre)}
            className={`px-6 py-2 rounded-full whitespace-nowrap text-sm font-bold uppercase tracking-wider transition-all border ${activeGenre === genre ? 'bg-[var(--accent-violet)] border-[var(--accent-violet)] text-white shadow-lg' : 'bg-[var(--bg-secondary)] border-white/5 text-[var(--text-secondary)] hover:border-[var(--accent-violet)]/40 hover:text-[var(--text-primary)]'}`}
           >
             {genre}
           </button>
         ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-12">
        
        {/* Main: Public Projects */}
        <div className="lg:col-span-3 space-y-8">
           <div className="flex items-center justify-between border-b border-white/5 pb-4">
              <h2 className="text-2xl font-space font-bold flex items-center gap-3">
                 <Music className="text-[var(--accent-violet)]" size={24} /> 
                 <span>Featured Projects</span>
              </h2>
              <span className="text-xs font-bold text-[var(--text-secondary)] uppercase tracking-widest">{results.projects.length} results</span>
           </div>

           {loading ? (
             <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
               {[1, 2, 3, 4].map(n => (
                 <div key={n} className="h-64 bg-[var(--bg-secondary)] rounded-3xl animate-pulse" />
               ))}
             </div>
           ) : results.projects.length > 0 ? (
             <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                {results.projects.map(p => (
                  <ProjectCard key={p._id} project={p} />
                ))}
             </div>
           ) : (
             <div className="py-20 text-center opacity-50 flex flex-col items-center">
                <Music size={48} className="mb-4" />
                <p className="font-space">No projects found matching your criteria.</p>
             </div>
           )}
        </div>

        {/* Sidebar: New Artists */}
        <div className="space-y-8">
           <div className="flex items-center justify-between border-b border-white/5 pb-4">
              <h2 className="text-2xl font-space font-bold flex items-center gap-3">
                 <Users className="text-[var(--accent-amber)]" size={24} /> 
                 <span>Artists</span>
              </h2>
           </div>

           <div className="space-y-6">
              {loading ? (
                [1, 2, 3].map(n => <div key={n} className="h-20 bg-[var(--bg-secondary)] rounded-2xl animate-pulse" />)
              ) : results.artists.length > 0 ? (
                results.artists.map(artist => (
                  <ArtistCard key={artist._id} artist={artist} />
                ))
              ) : (
                <p className="text-center text-xs text-[var(--text-secondary)] italic">No artists found.</p>
              )}
           </div>
        </div>
      </div>
    </div>
  );
};

const ArtistCard = ({ artist }) => (
  <div className="group bg-[var(--bg-secondary)] border border-white/5 p-4 rounded-2xl flex items-center gap-4 hover:border-[var(--accent-amber)]/40 transition-all cursor-pointer">
     <div className="w-12 h-12 rounded-full overflow-hidden border-2 border-white/5 group-hover:border-[var(--accent-amber)] transition-colors">
        {artist.profilePicUrl ? (
          <img src={artist.profilePicUrl} alt={artist.username} className="w-full h-full object-cover" />
        ) : (
          <div className="w-full h-full bg-gray-600 flex items-center justify-center text-white font-bold uppercase">{artist.username.charAt(0)}</div>
        )}
     </div>
     <div className="flex-1 overflow-hidden">
        <h4 className="font-bold text-sm text-[var(--text-primary)] truncate group-hover:text-[var(--accent-amber)] transition-colors">{artist.username}</h4>
        <p className="text-[10px] text-[var(--text-secondary)] uppercase tracking-wider font-bold truncate">{artist.genres?.slice(0, 2).join(' / ') || 'Explorer'}</p>
     </div>
     <ArrowRight size={14} className="text-[var(--text-secondary)] opacity-0 group-hover:opacity-100 transition-all transform translate-x-[-10px] group-hover:translate-x-0" />
  </div>
);

export default ExplorePage;
