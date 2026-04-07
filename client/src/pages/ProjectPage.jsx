import React, { useEffect, useState, useCallback } from 'react';
import { useParams } from 'react-router-dom';
import api from '../services/api';
import usePlayerStore from '../store/playerStore';
import useAudioEngine from '../hooks/useAudioEngine';
import StemTrack from '../components/audio/StemTrack';
import ProjectHeader from '../components/project/ProjectHeader';
import CommentThread from '../components/comment/CommentThread';
import UploadStemForm from '../components/forms/UploadStemForm';
import { Plus, Download, Share2, History, MessageCircle } from 'lucide-react';
import VersionSelector from '../components/project/VersionSelector';
import VersionHistoryPage from './VersionHistoryPage';
import InviteCollaboratorForm from '../components/forms/InviteCollaboratorForm';

const ProjectPage = () => {
  const { id } = useParams();
  const [project, setProject] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [activeTab, setActiveTab] = useState('stems'); // stems | comments | history
  const [showInviteModal, setShowInviteModal] = useState(false);
  const [selectedVersionNumber, setSelectedVersionNumber] = useState(null);

  const { setActiveProjectId, setTracks } = usePlayerStore();
  const { loadTrack, pauseAll } = useAudioEngine();

  const fetchProject = useCallback(async () => {
    try {
      const res = await api.get(`/projects/${id}`);
      if (res.data.success) {
        const projectData = res.data.data;
        setProject(projectData);
        
        // Update player store context
        setActiveProjectId(id);
      }
    } catch (error) {
      console.error('Error fetching project:', error);
    } finally {
      setLoading(false);
    }
  }, [id, setActiveProjectId]);

  useEffect(() => {
    fetchProject();
  }, [id, fetchProject]);

  useEffect(() => {
    if (!project) return;
    const versions = project.versions || [];
    const exists = selectedVersionNumber !== null && versions.some((v) => v.versionNumber === selectedVersionNumber);
    if (selectedVersionNumber === null || !exists) {
      setSelectedVersionNumber(project.currentVersion);
    }
  }, [project, selectedVersionNumber]);

  useEffect(() => {
    if (!project) return;
    const versions = project.versions || [];
    const version =
      versions.find((v) => v.versionNumber === selectedVersionNumber) ||
      versions.find((v) => v.versionNumber === project.currentVersion);

    if (!version) return;

    pauseAll();
    const tracks = version.tracks || [];
    setTracks(tracks);
    tracks.forEach((t) => loadTrack(t));
  }, [project, selectedVersionNumber, setTracks, loadTrack, pauseAll]);

  if (loading) return <div className="p-20 text-center text-[var(--accent-violet)] font-bold animate-pulse">Loading Workspace...</div>;
  if (!project) return <div className="p-20 text-center">Project not found.</div>;

  return (
    <div className="min-h-full flex flex-col pb-24">
      {/* Project Header Area */}
      <ProjectHeader project={project} onRefresh={fetchProject} onInviteClick={() => setShowInviteModal(true)} />

      <div className="flex-1 container mx-auto px-4 py-8 grid grid-cols-1 lg:grid-cols-4 gap-8">
        
        {/* Main Content: Stems / Mix Area */}
        <div className="lg:col-span-3 space-y-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
               <h2 className="text-xl font-space font-bold border-l-4 border-[var(--accent-violet)] pl-3 leading-none">
                 Multi-track Mixer
               </h2>
            </div>

            <button 
              onClick={() => setShowUploadModal(true)}
              className="flex items-center gap-2 text-xs font-bold bg-[var(--accent-violet)]/10 text-[var(--accent-violet)] px-4 py-2 rounded-lg hover:bg-[var(--accent-violet)]/20 transition-all border border-[var(--accent-violet)]/20"
            >
              <Plus size={16} /> Add Stem
            </button>
          </div>

          <div className="mt-4">
            <VersionSelector
              versions={project.versions || []}
              selectedVersionNumber={selectedVersionNumber ?? project.currentVersion}
              onSelect={(vNum) => setSelectedVersionNumber(vNum)}
            />
          </div>

          <div className="space-y-3">
             {(project.versions.find(v => v.versionNumber === selectedVersionNumber) || project.versions.find(v => v.versionNumber === project.currentVersion))?.tracks?.length === 0 ? (
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
               (project.versions.find(v => v.versionNumber === selectedVersionNumber) || project.versions.find(v => v.versionNumber === project.currentVersion))?.tracks.map((track) => (
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
              {activeTab === 'history' && <VersionHistoryPage projectId={id} onVersionCreated={fetchProject} />}
              {activeTab === 'stems' && (
                <div className="glass-panel p-6 rounded-2xl space-y-6">
                   <div>
                     <h3 className="text-sm font-bold mb-3 uppercase tracking-wider text-[var(--text-secondary)]">Actions</h3>
                     <div className="space-y-2">
                        <ActionButton
                          icon={<Download size={16} />}
                          label="Download current stems"
                          onClick={async () => {
                            try {
                              const res = await api.get(`/projects/${id}/download/zip`, { responseType: 'blob' });
                              const url = URL.createObjectURL(new Blob([res.data]));
                              const a = document.createElement('a');
                              a.href = url;
                              a.download = `${project.title.replace(/ /g, '_')}_v${project.currentVersion}.zip`;
                              document.body.appendChild(a);
                              a.click();
                              a.remove();
                              URL.revokeObjectURL(url);
                            } catch (err) {
                              console.error('Download failed:', err);
                            }
                          }}
                        />
                        <ActionButton
                          icon={<Share2 size={16} />}
                          label="Invite collaborator"
                          onClick={() => setShowInviteModal(true)}
                        />
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

      {showInviteModal && (
        <InviteCollaboratorForm
          projectId={id}
          onClose={() => setShowInviteModal(false)}
          onInvited={() => {
            // Link copy is handled inside the modal.
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

const ActionButton = ({ icon, label, onClick }) => (
  <button
    onClick={onClick}
    className="w-full flex items-center gap-3 px-4 py-3 bg-white/5 hover:bg-white/10 rounded-xl text-sm font-medium transition-all group"
  >
    <div className="text-[var(--text-secondary)] group-hover:text-[var(--accent-violet)] transition-colors">{icon}</div>
    <span>{label}</span>
  </button>
);

export default ProjectPage;
