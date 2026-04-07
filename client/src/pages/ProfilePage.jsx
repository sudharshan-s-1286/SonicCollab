import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import api from '../services/api';
import ProjectCard from '../components/project/ProjectCard';
import { Music, Users, ShieldCheck, Globe } from 'lucide-react';
import useAuthStore from '../store/authStore';

const ProfilePage = () => {
  const { id } = useParams();
  const { user: currentUser } = useAuthStore();
  const [profile, setProfile] = useState(null);
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isFollowing, setIsFollowing] = useState(false);

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const res = await api.get(`/users/${id}`);
        if (res.data.success) {
          setProfile(res.data.data.user);
          setProjects(res.data.data.projects);
          setIsFollowing(res.data.data.user.followers?.some(f => f._id === currentUser?._id));
        }
      } catch (err) {
        console.error('Error fetching profile:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchProfile();
  }, [id, currentUser?._id]);

  const handleFollow = async () => {
    try {
      const res = await api.post(`/users/${id}/follow`);
      if (res.data.success) {
        setIsFollowing(res.data.isFollowing);
      }
    } catch (err) {
      console.error('Error toggling follow:', err);
    }
  };

  if (loading) return <div className="p-20 text-center text-[var(--accent-violet)] animate-pulse font-bold">Scanning Artist Profile...</div>;
  if (!profile) return <div className="p-20 text-center">Artist not found.</div>;

  return (
    <div className="pb-24">
      {/* Profile Header / Banner Area */}
      <div className="h-64 md:h-80 bg-gradient-to-br from-[var(--accent-violet)] to-[var(--accent-amber)] relative">
         <div className="absolute inset-0 bg-black/20" />
      </div>

      <div className="container mx-auto px-4">
        <div className="relative -mt-24 mb-12 flex flex-col md:flex-row md:items-end gap-6">
           {/* Avatar */}
           <div className="w-32 h-32 md:w-48 md:h-48 rounded-[40px] bg-[var(--bg-secondary)] border-8 border-[var(--bg-primary)] shadow-2xl overflow-hidden flex-shrink-0">
             {profile.profilePicUrl ? (
               <img src={profile.profilePicUrl} alt={profile.username} className="w-full h-full object-cover" />
             ) : (
               <div className="w-full h-full flex items-center justify-center text-4xl font-bold bg-white/5 text-[var(--text-secondary)]">
                 {profile.username.charAt(0)}
               </div>
             )}
           </div>

           {/* Info & Actions */}
           <div className="flex-1 pb-4">
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                 <div>
                    <div className="flex items-center gap-3 mb-2">
                       <h1 className="text-4xl font-space font-bold">{profile.username}</h1>
                       <ShieldCheck className="text-[var(--accent-violet)]" size={24} title="Verified Artist" />
                    </div>
                    <div className="flex flex-wrap items-center gap-4 text-sm text-[var(--text-secondary)]">
                       <div className="flex items-center gap-1.5"><Users size={16} /> <span>{profile.followers?.length || 0} Followers</span></div>
                       <div className="flex items-center gap-1.5"><Music size={16} /> <span>{projects.length} Public Projects</span></div>
                    </div>
                 </div>

                 {currentUser?._id !== id && (
                   <button 
                    onClick={handleFollow}
                    className={`px-8 py-3 rounded-2xl font-bold transition-all shadow-lg ${isFollowing ? 'bg-white/5 border border-white/10 hover:bg-red-500/10 hover:text-red-500 hover:border-red-500/20' : 'bg-[var(--accent-violet)] text-white hover:scale-105 active:scale-95 shadow-[var(--accent-violet)]/20'}`}
                   >
                     {isFollowing ? 'Unfollow' : 'Follow Artist'}
                   </button>
                 )}
              </div>
           </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-12">
           {/* Sidebar: Bio & Metadata */}
           <div className="space-y-8">
              <div className="glass-panel p-6 rounded-3xl space-y-6">
                 <div>
                    <h3 className="text-xs font-bold uppercase tracking-widest text-[var(--text-secondary)] mb-3">About</h3>
                    <p className="text-sm leading-relaxed">{profile.bio || "No biography provided yet."}</p>
                 </div>

                 <div>
                    <h3 className="text-xs font-bold uppercase tracking-widest text-[var(--text-secondary)] mb-3">Masteries</h3>
                    <div className="flex flex-wrap gap-2">
                       {(profile.genres?.length > 0 ? profile.genres : ['Producer', 'Musician']).map(g => (
                         <span key={g} className="px-3 py-1 bg-[var(--accent-violet)]/10 text-[var(--accent-violet)] border border-[var(--accent-violet)]/20 rounded-lg text-[10px] font-bold uppercase tracking-widest">{g}</span>
                       ))}
                    </div>
                 </div>

                 <div className="pt-4 border-t border-white/5 space-y-4">
                    <SocialLink icon={<Globe size={16} />} label="Website" />
                    <SocialLink icon={<Users size={16} />} label="Community" />
                 </div>
              </div>
           </div>

           {/* Main: Portfolio */}
           <div className="lg:col-span-3 space-y-8">
              <h2 className="text-2xl font-space font-bold border-l-4 border-[var(--accent-amber)] pl-4 leading-none">Public Portfolio</h2>
              
              {projects.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                   {projects.map(p => (
                     <ProjectCard key={p._id} project={p} />
                   ))}
                </div>
              ) : (
                <div className="py-20 text-center opacity-30 italic text-sm">
                   This artist hasn't published any projects yet.
                </div>
              )}
           </div>
        </div>
      </div>
    </div>
  );
};

const SocialLink = ({ icon, label }) => (
  <button className="flex items-center gap-3 text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-colors group">
     <div className="w-8 h-8 rounded-lg bg-white/5 flex items-center justify-center group-hover:scale-110 transition-transform">{icon}</div>
     <span className="text-xs font-medium">{label}</span>
  </button>
);

export default ProfilePage;
