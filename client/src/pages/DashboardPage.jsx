import React, { useEffect, useState } from 'react';
import api from '../services/api';
import ProjectCard from '../components/project/ProjectCard';
import { Plus, Music2, Search } from 'lucide-react';
import useAuthStore from '../store/authStore';

const DashboardPage = () => {
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const { user } = useAuthStore();

  useEffect(() => {
    const fetchProjects = async () => {
      try {
        const res = await api.get('/projects');
        if (res.data.success) {
          setProjects(res.data.data);
        }
      } catch (error) {
        console.error('Error fetching projects:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchProjects();
  }, []);

  return (
    <div className="p-6 md:p-8 max-w-7xl mx-auto">
      {/* Header / Welcome */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-10">
        <div>
          <h1 className="text-3xl md:text-4xl font-space font-bold mb-2">
            Welcome back, <span className="text-[var(--accent-violet)]">{user?.username}</span>
          </h1>
          <p className="text-[var(--text-secondary)]">Manage your stems and continue building your masterpieces.</p>
        </div>
        <button className="flex items-center justify-center gap-2 bg-[var(--accent-violet)] hover:bg-opacity-90 text-white px-6 py-3 rounded-xl font-bold transition-all transform hover:-translate-y-1 shadow-lg shadow-[var(--accent-violet)]/20">
          <Plus size={20} />
          <span>New Project</span>
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        {/* Main Content: Projects Grid */}
        <div className="lg:col-span-3">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-space font-bold px-1 border-l-4 border-[var(--accent-amber)] leading-none">Your Projects</h2>
            <div className="relative group">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--text-secondary)] group-focus-within:text-[var(--accent-violet)] transition-colors" size={16} />
              <input 
                type="text" 
                placeholder="Search projects..." 
                className="bg-[var(--bg-secondary)] border border-[var(--border-color)] rounded-full py-2 pl-10 pr-4 text-sm focus:outline-none focus:border-[var(--accent-violet)] transition-all w-48 md:w-64"
              />
            </div>
          </div>

          {loading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {[1, 2, 3, 4].map(n => (
                <div key={n} className="h-48 rounded-2xl animate-pulse bg-[var(--bg-secondary)] border border-[var(--border-color)]" />
              ))}
            </div>
          ) : projects.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {projects.map((project) => (
                <ProjectCard key={project._id} project={project} />
              ))}
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center py-20 px-4 glass-panel rounded-3xl text-center">
              <div className="w-16 h-16 bg-[var(--accent-violet)]/10 rounded-full flex items-center justify-center mb-4">
                <Music2 className="text-[var(--accent-violet)]" size={32} />
              </div>
              <h3 className="text-xl font-space font-bold mb-2">No projects yet</h3>
              <p className="text-[var(--text-secondary)] max-w-sm mb-6">Create your first project and start uploading stems to collaborate with others.</p>
              <button className="text-[var(--accent-violet)] font-bold hover:underline">Get started now</button>
            </div>
          )}
        </div>

        {/* Right Panel: Notifications & Activity */}
        <div className="space-y-8">
          <div>
            <h2 className="text-xl font-space font-bold mb-6">Recent Activity</h2>
            <div className="glass-panel p-6 rounded-2xl space-y-4">
              <p className="text-xs text-[var(--text-secondary)] text-center italic">Activity feed coming soon...</p>
            </div>
          </div>

          <div>
             <h2 className="text-xl font-space font-bold mb-6">Notifications</h2>
             <div className="glass-panel p-6 rounded-2xl space-y-4">
               <p className="text-xs text-[var(--text-secondary)] text-center italic">No new notifications</p>
             </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DashboardPage;
