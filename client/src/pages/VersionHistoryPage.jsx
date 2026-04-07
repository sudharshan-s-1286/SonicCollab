import React, { useEffect, useMemo, useState } from 'react';
import api from '../services/api';
import { Plus, Sparkles } from 'lucide-react';

const stemColor = (type) => {
  const colors = {
    vocals: '#7C5CFC',
    drums: '#F5A623',
    bass: '#14B8A6',
    guitar: '#F43F5E',
    keys: '#8B5CF6',
    synth: '#D946EF',
    other: '#64748B',
  };
  return colors[type] || colors.other;
};

const VersionHistoryPage = ({ projectId, onVersionCreated }) => {
  const [versions, setVersions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [creating, setCreating] = useState(false);

  const fetchVersions = async () => {
    setLoading(true);
    try {
      const res = await api.get(`/projects/${projectId}/versions`);
      if (res.data.success) setVersions(res.data.data || []);
    } catch (err) {
      console.error('Error fetching versions:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchVersions();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [projectId]);

  const sorted = useMemo(() => [...versions].sort((a, b) => a.versionNumber - b.versionNumber), [versions]);

  const diffs = useMemo(() => {
    const list = [];

    for (let i = 0; i < sorted.length; i++) {
      const curr = sorted[i];
      const prev = sorted[i - 1];
      if (!prev) {
        list.push({ versionNumber: curr.versionNumber, added: curr.tracks || [], removed: [] });
        continue;
      }

      const prevIds = new Set((prev.tracks || []).map((t) => t._id?.toString?.() || t._id));
      const currIds = new Set((curr.tracks || []).map((t) => t._id?.toString?.() || t._id));

      const added = (curr.tracks || []).filter((t) => !prevIds.has(t._id?.toString?.() || t._id));
      const removed = (prev.tracks || []).filter((t) => !currIds.has(t._id?.toString?.() || t._id));

      list.push({ versionNumber: curr.versionNumber, added, removed });
    }

    return list;
  }, [sorted]);

  const handleCreateVersion = async () => {
    setCreating(true);
    try {
      const res = await api.post(`/projects/${projectId}/versions`, {});
      if (res.data.success) {
        await fetchVersions();
        if (onVersionCreated) onVersionCreated();
      }
    } catch (err) {
      console.error('Error creating version:', err);
    } finally {
      setCreating(false);
    }
  };

  return (
    <div className="glass-panel p-6 rounded-3xl border border-white/5">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-6">
        <div>
          <div className="flex items-center gap-2 mb-2">
            <Sparkles size={18} className="text-[var(--accent-violet)]" />
            <h2 className="text-xl font-space font-bold">Version History</h2>
          </div>
          <p className="text-[var(--text-secondary)] text-sm">
            Track additions/removals between versions.
          </p>
        </div>

        <button
          onClick={handleCreateVersion}
          className="flex items-center gap-2 bg-[var(--accent-violet)] hover:bg-opacity-90 text-white px-5 py-2.5 rounded-xl font-bold transition-transform transform hover:-translate-y-1 shadow-lg shadow-[var(--accent-violet)]/20 disabled:opacity-50"
          disabled={creating}
        >
          <Plus size={18} />
          {creating ? 'Creating...' : 'Create New Version'}
        </button>
      </div>

      {loading ? (
        <div className="py-10 text-center text-[var(--accent-violet)] font-bold animate-pulse">Loading...</div>
      ) : sorted.length === 0 ? (
        <div className="py-12 text-center text-xs text-[var(--text-secondary)] italic">
          No versions yet.
        </div>
      ) : (
        <div className="space-y-6">
          {sorted.map((v) => {
            const diff = diffs.find((d) => d.versionNumber === v.versionNumber);
            return (
              <div key={v.versionNumber} className="rounded-2xl border border-white/10 bg-white/5 p-5">
                <div className="flex items-center justify-between gap-4 mb-3">
                  <div>
                    <div className="text-sm font-bold text-[var(--text-primary)] uppercase tracking-widest">
                      Version v{v.versionNumber}
                    </div>
                    <div className="text-xs text-[var(--text-secondary)] mt-1">
                      {v.label || ''}
                    </div>
                  </div>
                  <div className="text-[10px] text-[var(--text-secondary)]">
                    {v.createdAt ? new Date(v.createdAt).toLocaleDateString() : ''}
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <div className="text-xs font-bold uppercase tracking-widest text-[var(--accent-amber)] mb-2">
                      Added
                    </div>
                    {diff?.added?.length ? (
                      <div className="space-y-2">
                        {diff.added.map((t) => (
                          <div key={t._id} className="flex items-center gap-2 text-sm">
                            <span className="w-2 h-2 rounded-full" style={{ backgroundColor: stemColor(t.stemType) }} />
                            <span className="truncate">{t.name}</span>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="text-xs text-[var(--text-secondary)] italic">None</div>
                    )}
                  </div>

                  <div>
                    <div className="text-xs font-bold uppercase tracking-widest text-red-500 mb-2">
                      Removed
                    </div>
                    {diff?.removed?.length ? (
                      <div className="space-y-2">
                        {diff.removed.map((t) => (
                          <div key={t._id} className="flex items-center gap-2 text-sm">
                            <span className="w-2 h-2 rounded-full" style={{ backgroundColor: stemColor(t.stemType) }} />
                            <span className="truncate">{t.name}</span>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="text-xs text-[var(--text-secondary)] italic">None</div>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default VersionHistoryPage;

