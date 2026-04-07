import React, { useEffect, useState, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../services/api';
import usePlayerStore from '../store/playerStore';
import useAudioEngine from '../hooks/useAudioEngine';
import StemTrack from '../components/audio/StemTrack';
import ProjectHeader from '../components/project/ProjectHeader';
import CommentThread from '../components/comment/CommentThread';
import UploadStemForm from '../components/forms/UploadStemForm';
import { Plus, Download, Share2, History, MessageCircle } from 'lucide-react';
import io from 'socket.io-client';

const ProjectPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [project, setProject] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [activeTab, setActiveTab] = useState('stems'); // stems | comments | history

  const { setActiveProjectId, setTracks } = usePlayerStore();
  const { loadTrack } = useAudioEngine();

  const fetchProject = useCallback(async () => {
    try {
      const res = await api.get(`/projects/${id}`);
      if (res.data.success) {
        const projectData = res.data.data;
        setProject(projectData);
        
        // Update player store context
        setActiveProjectId(id);
        
        // Load tracks for the current version
        const currentVersionData = projectData.versions.find(v => v.versionNumber === projectData.currentVersion);
        if (currentVersionData) {
          const tracks = currentVersionData.tracks;
          setTracks(tracks);
          // Pre-load audio buffers
          tracks.forEach(t => loadTrack(t));
        }
      }
    } catch (error) {
      console.error('Error fetching project:', error);
    } finally {
      setLoading(false);
    }
  }, [id, setActiveProjectId, setTracks, loadTrack]);

  useEffect(() => {
    fetchProject();

    // Socket.io for real-time updates
    const socket = io(import.meta.env.VITE_SOCKET_URL || 'http://localhost:5000');
    socket.emit('join:project', id);

    socket.on('track:uploaded', (newTrack) => {
      fetchProject();
    });

    socket.on('track:deleted', (trackId) => {
      fetchProject();
    });

    socket.on('comment:new', (comment) => {
      // Logic handled in CommentThread component or here
    });

    return () => {
      socket.disconnect();
    };
  }, [id, fetchProject]);

  if (loading) return <div className="p-20 text-center text-[var(--accent-violet)] font-bold animate-pulse">Loading Workspace...</div>;
  if (!project) return <div className="p-20 text-center">Project not found.</div>;

  return (
    <div className="min-h-full flex flex-col pb-24">
      {/* Project Header Area */}
      <ProjectHeader project={project} onRefresh={fetchProject} />

      <div className="flex-1 container mx-auto px-4 py-8 grid grid-cols-1 lg:grid-cols-4 gap-8">
        
        {/* Main Content: Stems / Mix Area */}
        <div className="lg:col-span-3 space-y-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
               <h2 className="text-xl font-space font-bold border-l-4 border-[var(--accent-violet)] pl-3 leading-none">
                 Multi-track Mixer
               </h2>
               <span className="text-[10px] uppercase font-bold tracking-widest text-[var(--text-secondary)] px-2 py-0.5 rounded-full bg-white/5">
                 Version {project.currentVersion}
               </span>
            </div>

            <button 
              onClick={() => setShowUploadModal(true)}
              className="flex items-center gap-2 text-xs font-bold bg-[var(--accent-violet)]/10 text-[var(--accent-violet)] px-4 py-2 rounded-lg hover:bg-[var(--accent-violet)]/20 transition-all border border-[var(--accent-violet)]/20"
            >
              <Plus size={16} /> Add Stem
            </button>
          </div>

          <div className="space-y-3">
             {project.versions.find(v => v.versionNumber === project.currentVersion)?.tracks.length === 0 ? (
               <div className="py-20 flex flex-col items-center justify-center glass-panel rounded-3xl border-dashed border-2 border-white/5">
                 <p className="text-[var(--text-secondary)] mb-4">No tracks uploaded to this version yet.</p>
                 <button 
                  onClick={() => setShowUploadModal(true)}
                  className="text-[var(--accent-violet)] font-bold hover:underline"
                 >
                   Upload your first stem
                 </button>
               </div>
             ) : (
               project.versions.find(v => v.versionNumber === project.currentVersion)?.tracks.map((track) => (
                 <StemTrack key={track._id} track={track} onRefresh={fetchProject} />
               ))
             )}
          </div>
        </div>

        {/* Sidebar: Collaboration / History / Activity */}
        <div className="space-y-6">
           <div className="glass-panel p-2 rounded-2xl flex items-center justify-between gap-1 overflow-hidden">
               <TabButton active={activeTab === 'stems'} onClick={() => setActiveTab('stems')} icon={<Plus size={16}/>} label="Mix"/>
               <TabButton active={activeTab === 'comments'} onClick={() => setActiveTab('comments')} icon={<MessageCircle size={16}/>} label="Talk"/>
               <TabButton active={activeTab === 'history'} onClick={() => setActiveTab('history')} icon={<History size={16}/>} label="Versions"/>
           </div>

           <div className="min-h-[500px]">
              {activeTab === 'comments' && <CommentThread projectId={id} />}
              {activeTab === 'stems' && (
                <div className="glass-panel p-6 rounded-2xl space-y-6">
                   <div>
                     <h3 className="text-sm font-bold mb-3 uppercase tracking-wider text-[var(--text-secondary)]">Actions</h3>
                     <div className="space-y-2">
                        <ActionButton icon={<Download size={16}/>} label="Download current stems"/>
                        <ActionButton icon={<Share2 size={16}/>} label="Invite collaborator"/>
                     </div>
                   </div>
                </div>
              )}
           </div>
        </div>
      </div>

      {showUploadModal && (
        <UploadStemForm 
          projectId={id} 
          onClose={() => setShowUploadModal(false)}
          onSuccess={() => {
            setShowUploadModal(false);
            fetchProject();
          }}
        />
      )}
    </div>
  );
};

const TabButton = ({ active, onClick, icon, label }) => (
  <button 
    onClick={onClick}
    className={`flex-1 flex flex-col items-center gap-1 py-3 rounded-xl transition-all ${active ? 'bg-[var(--accent-violet)] text-white shadow-lg' : 'text-[var(--text-secondary)] hover:bg-white/5'}`}
  >
    {icon}
    <span className="text-[10px] font-bold uppercase">{label}</span>
  </button>
);

const ActionButton = ({ icon, label }) => (
  <button className="w-full flex items-center gap-3 px-4 py-3 bg-white/5 hover:bg-white/10 rounded-xl text-sm font-medium transition-all group">
    <div className="text-[var(--text-secondary)] group-hover:text-[var(--accent-violet)] transition-colors">{icon}</div>
    <span>{label}</span>
  </button>
);

export default ProjectPage;
