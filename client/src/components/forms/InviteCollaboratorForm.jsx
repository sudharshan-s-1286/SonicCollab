import React, { useMemo, useState } from 'react';
import { X, Mail, ShieldCheck } from 'lucide-react';
import api from '../../services/api';

const InviteCollaboratorForm = ({ projectId, onClose, onInvited }) => {
  const [invitedEmail, setInvitedEmail] = useState('');
  const [role, setRole] = useState('viewer');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  const [inviteLink, setInviteLink] = useState('');
  const canSubmit = invitedEmail.trim().length > 3 && !submitting;

  const title = useMemo(() => (role === 'collaborator' ? 'Invite as Collaborator' : 'Invite as Viewer'), [role]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!invitedEmail.trim()) {
      setError('Email is required.');
      return;
    }

    setSubmitting(true);
    try {
      const res = await api.post(`/projects/${projectId}/invite`, {
        invitedEmail,
        role,
      });

      if (res.data.success) {
        const link = res.data.data?.inviteLink || '';
        setInviteLink(link);
        if (onInvited) onInvited(link);
      } else {
        setError(res.data.message || 'Invite failed');
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Invite failed');
    } finally {
      setSubmitting(false);
    }
  };

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(inviteLink);
    } catch {
      // Fallback: no-op if clipboard isn't available.
    }
  };

  return (
    <div className="fixed inset-0 z-[70] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
      <div className="glass-panel w-full max-w-md rounded-3xl p-8 shadow-2xl border border-[var(--accent-violet)]/20 relative">
        <button
          onClick={onClose}
          className="absolute top-6 right-6 p-2 text-[var(--text-secondary)] hover:text-white hover:bg-white/10 rounded-full transition-colors"
        >
          <X size={20} />
        </button>

        <div className="mb-6">
          <h2 className="text-2xl font-space font-bold flex items-center gap-3">
            <Mail className="text-[var(--accent-violet)]" />
            Invite Collaborator
          </h2>
          <p className="text-sm text-[var(--text-secondary)] mt-2">
            {title}. Email sending is disabled for now; you’ll copy a token link instead.
          </p>
        </div>

        {!inviteLink ? (
          <form onSubmit={handleSubmit} className="space-y-5">
            {error ? (
              <div className="bg-red-500/10 border border-red-500/20 text-red-500 p-4 rounded-xl flex items-center gap-3 text-sm">
                <ShieldCheck size={18} />
                <span>{error}</span>
              </div>
            ) : null}

            <div>
              <label className="block text-xs font-bold uppercase tracking-widest text-[var(--text-secondary)] mb-2 px-1">
                Email
              </label>
              <input
                type="email"
                value={invitedEmail}
                onChange={(e) => setInvitedEmail(e.target.value)}
                placeholder="artist@example.com"
                className="w-full bg-white/5 border border-white/10 focus:border-[var(--accent-violet)] rounded-xl p-3 text-sm focus:outline-none transition-all"
              />
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-widest text-[var(--text-secondary)] mb-2 px-1">
                Role
              </label>
              <div className="grid grid-cols-2 gap-3">
                <button
                  type="button"
                  onClick={() => setRole('collaborator')}
                  className={`px-4 py-3 rounded-xl border text-sm font-bold transition-all ${
                    role === 'collaborator'
                      ? 'bg-[var(--accent-violet)]/20 border-[var(--accent-violet)] text-[var(--accent-violet)]'
                      : 'bg-white/5 border-white/10 text-[var(--text-secondary)] hover:bg-white/10'
                  }`}
                >
                  Collaborator
                </button>
                <button
                  type="button"
                  onClick={() => setRole('viewer')}
                  className={`px-4 py-3 rounded-xl border text-sm font-bold transition-all ${
                    role === 'viewer'
                      ? 'bg-[var(--accent-violet)]/20 border-[var(--accent-violet)] text-[var(--accent-violet)]'
                      : 'bg-white/5 border-white/10 text-[var(--text-secondary)] hover:bg-white/10'
                  }`}
                >
                  Viewer
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={!canSubmit}
              className="w-full bg-[var(--accent-violet)] hover:bg-opacity-90 disabled:opacity-50 text-white font-bold py-4 rounded-xl transition-all shadow-lg shadow-[var(--accent-violet)]/30 flex items-center justify-center gap-2"
            >
              {submitting ? 'Creating...' : 'Create Invite Link'}
            </button>
          </form>
        ) : (
          <div className="space-y-5">
            <div className="p-4 rounded-2xl bg-[var(--accent-violet)]/10 border border-[var(--accent-violet)]/20">
              <p className="text-xs font-bold uppercase tracking-widest text-[var(--text-secondary)] mb-2">
                Copy this link
              </p>
              <input
                value={inviteLink}
                readOnly
                onFocus={(e) => e.target.select()}
                className="w-full bg-white/5 border border-white/10 rounded-xl p-3 text-sm text-[var(--text-primary)]"
              />
            </div>

            <div className="flex gap-3">
              <button
                onClick={copy}
                className="flex-1 bg-[var(--accent-violet)] hover:bg-opacity-90 text-white font-bold py-3 rounded-xl transition-colors shadow-lg shadow-[var(--accent-violet)]/20"
              >
                Copy
              </button>
              <button
                onClick={onClose}
                className="flex-1 bg-white/5 hover:bg-white/10 text-[var(--text-secondary)] border border-white/10 font-bold py-3 rounded-xl transition-colors"
              >
                Done
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default InviteCollaboratorForm;

