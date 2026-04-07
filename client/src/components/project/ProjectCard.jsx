import React from 'react';
import { Link } from 'react-router-dom';
import { Heart, MessageSquare, User, Clock, MoreVertical } from 'lucide-react';

const ProjectCard = ({ project }) => {
  const {
    _id,
    title,
    genre,
    owner,
    collaborators,
    likes,
    comments,
    currentVersion,
    coverColor,
    updatedAt
  } = project;

  return (
    <Link 
      to={`/projects/${_id}`}
      className="group relative bg-[var(--bg-secondary)] rounded-2xl overflow-hidden border border-[var(--border-color)] hover:border-[var(--accent-violet)] transition-all duration-300 hover:-translate-y-1 block shadow-sm hover:shadow-xl"
    >
      {/* Cover Color Strip / Header */}
      <div 
        className="h-2 w-full" 
        style={{ backgroundColor: coverColor || 'var(--accent-violet)' }}
      />
      
      <div className="p-5">
        <div className="flex justify-between items-start mb-3">
          <span className="px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider bg-[var(--accent-violet)]/10 text-[var(--accent-violet)]">
            {genre || 'No Genre'}
          </span>
          <button className="text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-colors">
            <MoreVertical size={16} />
          </button>
        </div>

        <h3 className="text-lg font-space font-bold mb-2 group-hover:text-[var(--accent-violet)] transition-colors truncate">
          {title}
        </h3>

        <div className="flex items-center gap-2 mb-4 text-[var(--text-secondary)] text-xs">
          <Clock size={14} />
          <span>v{currentVersion || 1} • {new Date(updatedAt).toLocaleDateString()}</span>
        </div>

        <div className="flex items-center justify-between mt-6 pt-4 border-t border-[var(--border-color)]">
          {/* Collaborators / Owner */}
          <div className="flex -space-x-2 overflow-hidden">
            {collaborators?.slice(0, 3).map((c, i) => (
              <div 
                key={i}
                className="inline-block h-7 w-7 rounded-full ring-2 ring-[var(--bg-secondary)] bg-gray-600 flex items-center justify-center overflow-hidden"
              >
                {c.user?.profilePicUrl ? (
                  <img src={c.user.profilePicUrl} alt={c.user.username} className="h-full w-full object-cover" />
                ) : (
                  <User size={12} className="text-white" />
                )}
              </div>
            ))}
            {(collaborators?.length > 3) && (
              <div className="flex items-center justify-center h-7 w-7 rounded-full ring-2 ring-[var(--bg-secondary)] bg-[var(--bg-primary)] text-[10px] font-bold text-[var(--text-secondary)]">
                +{collaborators.length - 3}
              </div>
            )}
          </div>

          {/* Stats */}
          <div className="flex items-center gap-3 text-[var(--text-secondary)] text-xs font-medium">
            <div className="flex items-center gap-1 group/stat">
              <Heart size={14} className="group-hover/stat:text-red-500 transition-colors" />
              <span>{likes?.length || 0}</span>
            </div>
            <div className="flex items-center gap-1 group/stat">
              <MessageSquare size={14} className="group-hover/stat:text-[var(--accent-violet)] transition-colors" />
              <span>{comments?.length || 0}</span>
            </div>
          </div>
        </div>
      </div>
    </Link>
  );
};

export default ProjectCard;
