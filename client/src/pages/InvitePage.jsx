import React, { useEffect, useState } from 'react';
import { useNavigate, useParams, Link as RouterLink } from 'react-router-dom';
import api from '../services/api';
import useAuthStore from '../store/authStore';

const InvitePage = () => {
  const { token } = useParams();
  const navigate = useNavigate();
  const { user } = useAuthStore();

  const [invite, setInvite] = useState(null);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [error, setError] = useState('');

  const fetchInvite = async () => {
    setLoading(true);
    setError('');
    try {
      const res = await api.get(`/invites/${token}`);
      if (res.data.success) setInvite(res.data.data);
      else setError(res.data.message || 'Invite not found');
    } catch (err) {
      setError(err.response?.data?.message || 'Invite not found');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchInvite();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [token]);

  const projectId = invite?.projectId;

  const isExpired = invite?.expiresAt ? new Date(invite.expiresAt).getTime() < Date.now() : false;

  const accept = async () => {
    if (!projectId) return;
    setActionLoading(true);
    setError('');
    try {
      const res = await api.put(`/projects/${projectId}/invite/${token}/accept`);
      if (res.data.success) navigate(`/projects/${projectId}`);
      else setError(res.data.message || 'Failed to accept invite');
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to accept invite');
    } finally {
      setActionLoading(false);
    }
  };

  const decline = async () => {
    if (!projectId) return;
    setActionLoading(true);
    setError('');
    try {
      const res = await api.put(`/projects/${projectId}/invite/${token}/decline`);
      if (res.data.success) navigate('/dashboard');
      else setError(res.data.message || 'Failed to decline invite');
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to decline invite');
    } finally {
      setActionLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-[calc(100vh-73px)] flex items-center justify-center">
        <div className="text-[var(--accent-violet)] font-bold animate-pulse">Loading invite...</div>
      </div>
    );
  }

  if (!invite) {
    return (
      <div className="min-h-[calc(100vh-73px)] flex items-center justify-center p-6 pb-24">
        <div className="glass-panel p-8 rounded-3xl border border-white/10 max-w-md w-full text-center">
          <h1 className="text-2xl font-space font-bold mb-3">Invitation not found</h1>
          <p className="text-sm text-[var(--text-secondary)]">{error || 'This invite may have expired.'}</p>
          <RouterLink className="text-[var(--accent-violet)] font-bold mt-6 block hover:underline" to="/explore">
            Go to Explore
          </RouterLink>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-[calc(100vh-73px)] flex items-center justify-center p-6 pb-24">
      <div className="glass-panel p-8 rounded-3xl border border-white/10 max-w-lg w-full">
        <div className="flex items-start gap-5">
          <div
            className="w-16 h-16 rounded-2xl flex items-center justify-center text-white shadow-xl shrink-0"
            style={{ backgroundColor: invite.project?.coverColor || 'var(--accent-violet)' }}
          >
            <span className="font-space font-bold text-xl">S</span>
          </div>
          <div className="flex-1">
            <h1 className="text-2xl font-space font-bold">{invite.project?.title}</h1>
            <p className="text-sm text-[var(--text-secondary)] mt-2">
              Role: <span className="text-[var(--accent-violet)] font-bold uppercase">{invite.role}</span>
            </p>
            <p className="text-xs text-[var(--text-secondary)] mt-2">
              Status: <span className="font-bold">{invite.status}</span>
              {isExpired ? <span className="text-red-500 font-bold ml-2">Expired</span> : null}
            </p>
          </div>
        </div>

        {error ? (
          <div className="mt-5 bg-red-500/10 border border-red-500/20 text-red-500 p-4 rounded-xl text-sm">
            {error}
          </div>
        ) : null}

        <div className="mt-6 space-y-3">
          {!user ? (
            <div className="text-center">
              <p className="text-sm text-[var(--text-secondary)] mb-3">
                Log in to accept or decline this invite.
              </p>
              <RouterLink
                to="/login"
                className="inline-block px-6 py-3 rounded-2xl bg-[var(--accent-violet)] hover:bg-opacity-90 text-white font-bold transition-colors"
              >
                Log in
              </RouterLink>
            </div>
          ) : invite.status !== 'pending' ? (
            <div className="text-center">
              <p className="text-sm text-[var(--text-secondary)]">
                This invite is no longer pending.
              </p>
              <button
                onClick={() => navigate(`/projects/${projectId}`)}
                className="mt-4 w-full bg-[var(--accent-violet)] hover:bg-opacity-90 text-white font-bold py-3 rounded-xl transition-transform transform hover:-translate-y-1"
              >
                Open Project
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <button
                onClick={accept}
                disabled={actionLoading || isExpired}
                className="w-full bg-[var(--accent-violet)] hover:bg-opacity-90 text-white font-bold py-3 rounded-xl transition-transform transform hover:-translate-y-1 disabled:opacity-50"
              >
                {actionLoading ? 'Accepting...' : 'Accept'}
              </button>
              <button
                onClick={decline}
                disabled={actionLoading || isExpired}
                className="w-full bg-white/5 hover:bg-white/10 text-[var(--text-secondary)] border border-white/10 font-bold py-3 rounded-xl transition-colors disabled:opacity-50"
              >
                Decline
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default InvitePage;

