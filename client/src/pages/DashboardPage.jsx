import React, { useEffect, useState } from 'react';
import api from '../services/api';
import ProjectCard from '../components/project/ProjectCard';
import { Plus, Music2, Search, Heart, Bookmark as BookmarkIcon } from 'lucide-react';
import useAuthStore from '../store/authStore';
import useNotificationStore from '../store/notificationStore';
import { useNavigate } from 'react-router-dom';

const DashboardPage = () => {
  const navigate = useNavigate();
  const { fetchPreview, fetchUnreadCount, preview } = useNotificationStore();
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const { user } = useAuthStore();
  const [tab, setTab] = useState('your'); // your | liked | saved

  useEffect(() => {
    if (!user) return;
    fetchUnreadCount();
    fetchPreview(5);
    const t = setInterval(() => fetchPreview(5), 30000);
    return () => clearInterval(t);
  }, [user, fetchPreview, fetchUnreadCount]);

  useEffect(() => {
    const fetchProjects = async () => {
      try {
        const res =
          tab === 'your'
            ? await api.get('/projects')
            : tab === 'liked'
              ? await api.get('/users/me/liked-projects')
              : await api.get('/users/me/bookmarked-projects');

        if (res.data.success) {
          setProjects(res.data.data || []);
        }
      } catch (error) {
        console.error('Error fetching projects:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchProjects();
  }, [tab, user]);

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
          <div className="flex items-center justify-between mb-6 flex-wrap gap-3">
            <h2 className="text-xl font-space font-bold px-1 border-l-4 border-[var(--accent-amber)] leading-none">
              {tab === 'your' ? 'Your Projects' : tab === 'liked' ? 'Liked Projects' : 'Saved Projects'}
            </h2>
            <div className="relative group">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--text-secondary)] group-focus-within:text-[var(--accent-violet)] transition-colors" size={16} />
              <input 
                type="text" 
                placeholder="Search projects..." 
                className="bg-[var(--bg-secondary)] border border-[var(--border-color)] rounded-full py-2 pl-10 pr-4 text-sm focus:outline-none focus:border-[var(--accent-violet)] transition-all w-48 md:w-64"
              />
            </div>
          </div>

          <div className="flex gap-3 mb-6 flex-wrap">
            <button
              onClick={() => setTab('your')}
              className={`px-4 py-2 rounded-full text-xs font-bold uppercase tracking-widest border transition-colors ${
                tab === 'your'
                  ? 'bg-[var(--accent-violet)] text-white border-[var(--accent-violet)]'
                  : 'bg-white/5 border-white/10 text-[var(--text-secondary)] hover:border-[var(--accent-violet)]/40'
              }`}
            >
              Your Projects
            </button>
            <button
              onClick={() => setTab('liked')}
              className={`px-4 py-2 rounded-full text-xs font-bold uppercase tracking-widest border transition-colors ${
                tab === 'liked'
                  ? 'bg-[var(--accent-violet)] text-white border-[var(--accent-violet)]'
                  : 'bg-white/5 border-white/10 text-[var(--text-secondary)] hover:border-[var(--accent-violet)]/40'
              }`}
            >
              <span className="inline-flex items-center gap-2">
                <Heart size={14} />
                Liked
              </span>
            </button>
            <button
              onClick={() => setTab('saved')}
              className={`px-4 py-2 rounded-full text-xs font-bold uppercase tracking-widest border transition-colors ${
                tab === 'saved'
                  ? 'bg-[var(--accent-violet)] text-white border-[var(--accent-violet)]'
                  : 'bg-white/5 border-white/10 text-[var(--text-secondary)] hover:border-[var(--accent-violet)]/40'
              }`}
            >
              <span className="inline-flex items-center gap-2">
                <BookmarkIcon size={14} />
                Saved
              </span>
            </button>
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
               {preview?.length ? (
                 <div className="space-y-3">
                   {preview.slice(0, 5).map((n) => (
                     <button
                       key={n._id}
                       onClick={() => navigate('/notifications')}
                       className="w-full text-left px-4 py-3 rounded-2xl border border-white/10 bg-white/5 hover:border-[var(--accent-violet)]/30 transition-colors"
                     >
                       <div className="text-xs font-bold uppercase tracking-widest text-[var(--text-secondary)]">
                         {n.type}
                       </div>
                       <div className="text-sm mt-1">{n.message}</div>
                       <div className="text-[10px] text-[var(--text-secondary)] mt-2">
                         {n.createdAt ? new Date(n.createdAt).toLocaleDateString() : ''}
                       </div>
                     </button>
                   ))}
                   <button
                     onClick={() => navigate('/notifications')}
                     className="w-full mt-2 px-4 py-2 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-sm font-bold transition-colors text-[var(--text-primary)]"
                   >
                     View all notifications
                   </button>
                 </div>
               ) : (
                 <p className="text-xs text-[var(--text-secondary)] text-center italic">No new notifications</p>
               )}
             </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DashboardPage;
