import React, { useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import useNotificationStore from '../store/notificationStore';
import { Clock, Bell } from 'lucide-react';
import useAuthStore from '../store/authStore';

const startOfDay = (d) => new Date(d.getFullYear(), d.getMonth(), d.getDate()).getTime();

const NotificationSection = ({ title, items, onOpen }) => (
  <div className="space-y-3">
    <h3 className="text-sm font-bold uppercase tracking-widest text-[var(--text-secondary)]">
      {title}
    </h3>
    {items.length === 0 ? (
      <div className="py-6 text-center text-xs text-[var(--text-secondary)] italic">No items.</div>
    ) : (
      <div className="space-y-2">
        {items.map((n) => (
          <button
            key={n._id}
            onClick={() => onOpen(n)}
            className={`w-full text-left px-4 py-3 rounded-2xl border transition-all ${
              n.isRead
                ? 'bg-white/5 border-white/10 hover:border-[var(--accent-violet)]/30'
                : 'bg-[var(--accent-violet)]/10 border-[var(--accent-violet)]/30 hover:border-[var(--accent-violet)]/50'
            }`}
          >
            <div className="flex items-start justify-between gap-4">
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-1">
                  <Bell size={16} className={n.isRead ? 'text-[var(--text-secondary)]' : 'text-[var(--accent-violet)]'} />
                  <span className="text-xs font-bold uppercase tracking-widest text-[var(--text-secondary)]">
                    {n.type.replace('_', ' ')}
                  </span>
                </div>
                <p className="text-sm text-[var(--text-primary)]">{n.message}</p>
              </div>
              <div className="flex items-center gap-1 text-[10px] text-[var(--text-secondary)] whitespace-nowrap">
                <Clock size={12} />
                {n.createdAt ? new Date(n.createdAt).toLocaleDateString() : ''}
              </div>
            </div>
          </button>
        ))}
      </div>
    )}
  </div>
);

const NotificationsPage = () => {
  const navigate = useNavigate();
  const { user } = useAuthStore();
  const { notifications, fetchNotifications, fetchUnreadCount, markAllRead, markRead, isLoading } =
    useNotificationStore();

  useEffect(() => {
    if (!user) return;
    fetchUnreadCount();
    fetchNotifications({ page: 1, limit: 50 });
  }, [user, fetchUnreadCount, fetchNotifications]);

  const grouped = useMemo(() => {
    const today = startOfDay(new Date());
    const weekAgo = today - 7 * 24 * 60 * 60 * 1000;

    const sections = {
      Today: [],
      'This Week': [],
      Earlier: [],
    };

    for (const n of notifications || []) {
      const created = n.createdAt ? new Date(n.createdAt).getTime() : today;
      const t = startOfDay(new Date(created));
      if (t === today) sections.Today.push(n);
      else if (t >= weekAgo) sections['This Week'].push(n);
      else sections.Earlier.push(n);
    }
    return sections;
  }, [notifications]);

  return (
    <div className="p-6 md:p-8 max-w-5xl mx-auto pb-24 space-y-8">
      <div className="flex items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-space font-bold">Notifications</h1>
          <p className="text-[var(--text-secondary)] mt-2">Updates from your collaborations.</p>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={markAllRead}
            className="px-4 py-2 rounded-xl bg-white/5 border border-white/10 hover:bg-white/10 transition-colors text-sm font-bold text-[var(--text-primary)]"
            disabled={isLoading}
          >
            Mark all read
          </button>
        </div>
      </div>

      {isLoading ? (
        <div className="py-12 text-center text-[var(--accent-violet)] font-bold">Loading...</div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="md:col-span-3 space-y-8">
            <NotificationSection
              title="Today"
              items={grouped.Today}
              onOpen={async (n) => {
                if (!n.isRead) await markRead(n._id);
                if (n.project?._id) navigate(`/projects/${n.project._id}`);
              }}
            />
            <NotificationSection
              title="This Week"
              items={grouped['This Week']}
              onOpen={async (n) => {
                if (!n.isRead) await markRead(n._id);
                if (n.project?._id) navigate(`/projects/${n.project._id}`);
              }}
            />
            <NotificationSection
              title="Earlier"
              items={grouped.Earlier}
              onOpen={async (n) => {
                if (!n.isRead) await markRead(n._id);
                if (n.project?._id) navigate(`/projects/${n.project._id}`);
              }}
            />
          </div>
        </div>
      )}
    </div>
  );
};

export default NotificationsPage;

