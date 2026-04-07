import React, { useState } from 'react';
import { Heart, Bookmark, Share2, Music, UserCircle, Globe, Lock } from 'lucide-react';
import api from '../../services/api';

const ProjectHeader = ({ project, onRefresh }) => {
  const [isLiking, setIsLiking] = useState(false);

  const toggleLike = async () => {
    setIsLiking(true);
    try {
      const res = await api.post(`/projects/${project._id}/like`);
      if (res.data.success) {
        onRefresh();
      }
    } catch (error) {
      console.error('Error toggling like:', error);
    } finally {
      setIsLiking(false);
    }
  };

  return (
    <div className="glass-panel border-b border-borderBase p-6 md:p-8">
      <div className="container mx-auto flex flex-col md:flex-row md:items-center justify-between gap-6">
        
        <div className="flex items-start gap-6">
          <div 
            className="w-16 h-16 md:w-24 md:h-24 rounded-2xl flex items-center justify-center text-white shadow-xl"
            style={{ backgroundColor: project.coverColor || 'var(--accent-violet)' }}
          >
            <Music size={40} className="md:size-48" />
          </div>

          <div>
             <div className="flex items-center gap-3 mb-2">
                <h1 className="text-2xl md:text-4xl font-space font-bold tracking-tight">{project.title}</h1>
                <span className={`px-3 py-1 rounded-full text-[10px] font-bold uppercase flex items-center gap-1.5 ${project.isPublic ? 'bg-teal-500/10 text-teal-500' : 'bg-red-500/10 text-red-500'}`}>
                  {project.isPublic ? <Globe size={12}/> : <Lock size={12}/>}
                  {project.isPublic ? 'Public' : 'Private'}
                </span>
             </div>

             <div className="flex flex-wrap items-center gap-4 text-sm text-[var(--text-secondary)]">
                <span className="bg-white/5 px-3 py-1 rounded-full border border-white/5 font-medium text-[var(--accent-violet)] uppercase text-[10px] tracking-widest">{project.genre || 'No Genre'}</span>
                
                <div className="flex items-center gap-1.5">
                   <UserCircle size={16} />
                   <span className="font-medium text-[var(--text-primary)]">Created by {project.owner?.username}</span>
                </div>

                <div className="flex items-center -space-x-1">
                   {project.collaborators?.map((c, i) => (
                     <div 
                      key={i} 
                      className="w-6 h-6 rounded-full border border-[var(--bg-primary)] bg-gray-600 flex items-center justify-center overflow-hidden"
                      title={c.user?.username}
                     >
                       {c.user?.profilePicUrl ? (
                         <img src={c.user.profilePicUrl} alt={c.user.username} className="w-full h-full object-cover" />
                       ) : (
                         <span className="text-[8px] text-white uppercase">{c.user?.username?.charAt(0)}</span>
                       )}
                     </div>
                   ))}
                </div>
             </div>
          </div>
        </div>

        <div className="flex items-center gap-3">
           <button 
             onClick={toggleLike}
             disabled={isLiking}
             className={`flex items-center gap-2 px-5 py-2.5 rounded-xl font-bold transition-all border ${project.likes?.includes(project.owner?._id) ? 'bg-red-500/10 border-red-500/20 text-red-500 hover:bg-red-500/20' : 'bg-white/5 border-white/5 text-[var(--text-secondary)] hover:bg-white/10'}`}
           >
              <Heart size={18} fill={project.likes?.length > 0 ? 'currentColor' : 'none'} />
              <span>{project.likes?.length || 0}</span>
           </button>

           <button className="p-3 bg-white/5 hover:bg-white/10 text-[var(--text-secondary)] rounded-xl border border-white/5 transition-all">
              <Bookmark size={18} />
           </button>

           <button className="flex items-center gap-2 px-5 py-2.5 bg-[var(--accent-violet)] hover:bg-opacity-90 text-white rounded-xl font-bold transition-transform transform hover:-translate-y-1 shadow-lg shadow-[var(--accent-violet)]/20 ml-2">
              <Share2 size={18} />
              <span>Invite</span>
           </button>
        </div>
      </div>
    </div>
  );
};

export default ProjectHeader;
