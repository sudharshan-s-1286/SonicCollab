import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';
import ProjectCard from '../components/project/ProjectCard';
import useAuthStore from '../store/authStore';
import { Plus, Music2 } from 'lucide-react';

const SavedPage = () => {
  const navigate = useNavigate();
  const { user } = useAuthStore();
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchSaved = async () => {
      try {
        if (!user) return;
        const res = await api.get('/users/me/bookmarked-projects');
        if (res.data.success) setProjects(res.data.data || []);
      } catch (err) {
        console.error('Error fetching saved projects:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchSaved();
  }, [user]);

  return (
    <div className="p-6 md:p-8 max-w-7xl mx-auto pb-24">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-10">
        <div>
          <h1 className="text-3xl md:text-4xl font-space font-bold mb-2">
            Saved Projects
          </h1>
          <p className="text-[var(--text-secondary)]">Your bookmarked collaborations.</p>
        </div>
        <button
          className="flex items-center justify-center gap-2 bg-[var(--accent-violet)] hover:bg-opacity-90 text-white px-6 py-3 rounded-xl font-bold transition-all transform hover:-translate-y-1 shadow-lg shadow-[var(--accent-violet)]/20"
          onClick={() => navigate('/explore')}
        >
          <Plus size={20} />
          <span>Find Projects</span>
        </button>
      </div>

      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {[1, 2, 3, 4].map((n) => (
            <div
              key={n}
              className="h-48 rounded-2xl animate-pulse bg-[var(--bg-secondary)] border border-[var(--border-color)]"
            />
          ))}
        </div>
      ) : projects.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {projects.map((p) => (
            <ProjectCard key={p._id} project={p} />
          ))}
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center py-20 px-4 glass-panel rounded-3xl text-center">
          <div className="w-16 h-16 bg-[var(--accent-violet)]/10 rounded-full flex items-center justify-center mb-4">
            <Music2 className="text-[var(--accent-violet)]" size={32} />
          </div>
          <h3 className="text-xl font-space font-bold mb-2">No saved projects yet</h3>
          <p className="text-[var(--text-secondary)] max-w-sm mb-6">
            Bookmark projects to revisit and collaborate later.
          </p>
          <button
            onClick={() => navigate('/explore')}
            className="text-[var(--accent-violet)] font-bold hover:underline"
          >
            Explore now
          </button>
        </div>
      )}
    </div>
  );
};

export default SavedPage;

