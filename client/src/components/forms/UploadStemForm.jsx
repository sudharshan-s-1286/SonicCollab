import React, { useState } from 'react';
import { X, Upload, Music, AlertCircle } from 'lucide-react';
import api from '../../services/api';

const UploadStemForm = ({ projectId, onClose, onSuccess }) => {
  const [file, setFile] = useState(null);
  const [name, setName] = useState('');
  const [stemType, setStemType] = useState('other');
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState('');

  const stemTypes = ['vocals', 'drums', 'bass', 'guitar', 'keys', 'synth', 'other'];

  const handleFileChange = (e) => {
    const selectedFile = e.target.files[0];
    if (selectedFile) {
      if (selectedFile.size > 100 * 1024 * 1024) {
        setError('File size exceeds 100MB limit.');
        return;
      }
      setFile(selectedFile);
      setName(selectedFile.name.split('.').slice(0, -1).join('.'));
      setError('');
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!file) return setError('Please select an audio file.');

    setUploading(true);
    setError('');

    const formData = new FormData();
    formData.append('audio', file);
    formData.append('name', name);
    formData.append('stemType', stemType);

    try {
      const res = await api.post(`/projects/${projectId}/tracks`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      if (res.data.success) {
        onSuccess(res.data.data);
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Upload failed. Please try again.');
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
      <div className="glass-panel w-full max-w-md rounded-3xl p-8 relative shadow-2xl animate-fade-in-up border border-[var(--accent-violet)]/20">
        <button 
          onClick={onClose}
          className="absolute top-6 right-6 p-2 text-[var(--text-secondary)] hover:text-white hover:bg-white/10 rounded-full transition-colors"
        >
          <X size={20} />
        </button>

        <h2 className="text-2xl font-space font-bold mb-6 flex items-center gap-3">
           <Upload className="text-[var(--accent-violet)]" /> 
           <span>Upload New Stem</span>
        </h2>

        {error && (
          <div className="bg-red-500/10 border border-red-500/20 text-red-500 p-4 rounded-xl mb-6 flex items-center gap-3 text-sm animate-shake">
            <AlertCircle size={18} />
            <p>{error}</p>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="flex flex-col items-center justify-center border-2 border-dashed border-white/10 rounded-2xl p-8 hover:border-[var(--accent-violet)]/40 transition-colors group relative cursor-pointer">
             <input 
              type="file" 
              accept="audio/*" 
              onChange={handleFileChange}
              className="absolute inset-0 opacity-0 cursor-pointer"
             />
             <div className="w-12 h-12 bg-[var(--accent-violet)]/10 rounded-full flex items-center justify-center mb-3 group-hover:scale-110 transition-transform">
                <Music className="text-[var(--accent-violet)]" />
             </div>
             <p className="text-sm font-medium text-center">
               {file ? <span className="text-[var(--accent-violet)]">{file.name}</span> : 'Click or drop to select audio stem'}
             </p>
             <p className="text-[10px] text-[var(--text-secondary)] uppercase font-bold tracking-widest mt-2">Max size: 100MB</p>
          </div>

          <div className="space-y-4">
             <div>
               <label className="block text-xs font-bold uppercase tracking-widest text-[var(--text-secondary)] mb-2 px-1">Track Name</label>
               <input 
                type="text" 
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g. Lead Vocals Clean"
                className="w-full bg-white/5 border border-white/5 focus:border-[var(--accent-violet)] rounded-xl p-3 text-sm focus:outline-none transition-all"
               />
             </div>

             <div>
               <label className="block text-xs font-bold uppercase tracking-widest text-[var(--text-secondary)] mb-2 px-1">Stem Type</label>
               <div className="grid grid-cols-3 gap-2">
                 {stemTypes.map(type => (
                   <button
                    key={type}
                    type="button"
                    onClick={() => setStemType(type)}
                    className={`px-3 py-2 rounded-lg text-[10px] font-bold uppercase tracking-widest border transition-all ${stemType === type ? 'bg-[var(--accent-violet)]/20 border-[var(--accent-violet)] text-[var(--accent-violet)] shadow-[0_0_10px_rgba(124,92,252,0.2)]' : 'bg-white/5 border-transparent text-[var(--text-secondary)] hover:bg-white/10'}`}
                   >
                     {type}
                   </button>
                 ))}
               </div>
             </div>
          </div>

          <button 
            type="submit"
            disabled={uploading || !file}
            className="w-full bg-[var(--accent-violet)] hover:bg-opacity-90 disabled:opacity-50 text-white font-bold py-4 rounded-xl transition-all shadow-lg shadow-[var(--accent-violet)]/30 mt-4 flex items-center justify-center gap-2"
          >
            {uploading ? (
              <>
                 <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                 <span>Uploading Stems...</span>
              </>
            ) : (
              <>
                 <Upload size={20} />
                 <span>Push to Cloud</span>
              </>
            )}
          </button>
        </form>
      </div>
    </div>
  );
};

export default UploadStemForm;
