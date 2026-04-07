import React, { useState } from 'react';
import api from '../services/api';
import useAuthStore from '../store/authStore';

const SettingsPage = () => {
  const { user, checkAuth } = useAuthStore();
  const [bio, setBio] = useState(user?.bio || '');
  const [genresText, setGenresText] = useState((user?.genres || []).join(', '));
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const save = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    setSaving(true);
    try {
      const genres = genresText
        .split(',')
        .map((g) => g.trim())
        .filter(Boolean);

      const res = await api.put('/users/profile', { bio, genres });
      if (res.data.success) {
        setSuccess('Profile updated.');
        await checkAuth();
      } else {
        setError(res.data.message || 'Update failed');
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Update failed');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="p-6 md:p-8 max-w-3xl mx-auto pb-24">
      <h1 className="text-3xl font-space font-bold mb-3">Settings</h1>
      <p className="text-[var(--text-secondary)] mb-8">Update your profile details.</p>

      <form onSubmit={save} className="glass-panel p-6 md:p-8 rounded-3xl border border-white/10 space-y-6">
        {error ? <div className="bg-red-500/10 border border-red-500/20 text-red-500 p-4 rounded-xl text-sm">{error}</div> : null}
        {success ? <div className="bg-green-500/10 border border-green-500/20 text-green-400 p-4 rounded-xl text-sm">{success}</div> : null}

        <div className="space-y-2">
          <label className="block text-xs font-bold uppercase tracking-widest text-[var(--text-secondary)] mb-1">
            Username
          </label>
          <div className="px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-sm font-bold text-[var(--text-primary)]">
            {user?.username}
          </div>
        </div>

        <div className="space-y-2">
          <label className="block text-xs font-bold uppercase tracking-widest text-[var(--text-secondary)] mb-1">
            Bio
          </label>
          <textarea
            value={bio}
            onChange={(e) => setBio(e.target.value)}
            rows={5}
            className="w-full bg-white/5 border border-white/10 focus:border-[var(--accent-violet)] rounded-xl p-3 text-sm focus:outline-none transition-all resize-none"
            placeholder="Tell people about your sound..."
          />
        </div>

        <div className="space-y-2">
          <label className="block text-xs font-bold uppercase tracking-widest text-[var(--text-secondary)] mb-1">
            Genres (comma-separated)
          </label>
          <input
            value={genresText}
            onChange={(e) => setGenresText(e.target.value)}
            className="w-full bg-white/5 border border-white/10 focus:border-[var(--accent-violet)] rounded-xl p-3 text-sm focus:outline-none transition-all"
            placeholder="Rock, Electronic, Jazz"
          />
        </div>

        <button
          type="submit"
          disabled={saving}
          className="w-full bg-[var(--accent-violet)] hover:bg-opacity-90 disabled:opacity-50 text-white font-bold py-3 rounded-xl transition-transform transform hover:-translate-y-1 shadow-lg shadow-[var(--accent-violet)]/20"
        >
          {saving ? 'Saving...' : 'Save Changes'}
        </button>
      </form>
    </div>
  );
};

export default SettingsPage;

