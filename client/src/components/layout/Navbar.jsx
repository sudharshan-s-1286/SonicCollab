import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Bell, Menu, UserCircle, LogOut } from 'lucide-react';
import ThemeToggle from './ThemeToggle';
import useAuthStore from '../../store/authStore';
import useNotificationStore from '../../store/notificationStore';

const Navbar = ({ toggleSidebar }) => {
  const { user, logout } = useAuthStore();
  const navigate = useNavigate();
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [notifOpen, setNotifOpen] = useState(false);
  const { unreadCount, preview, fetchPreview, fetchUnreadCount, markRead } = useNotificationStore();

  const handleLogout = async () => {
    await logout();
    navigate('/');
  };

  useEffect(() => {
    if (!user) return;
    fetchUnreadCount();
    fetchPreview(5);
  }, [user, fetchUnreadCount, fetchPreview]);

  return (
    <nav className="h-[73px] w-full glass-panel border-b border-borderBase sticky top-0 z-40 px-4 flex items-center justify-between">
      <div className="flex items-center gap-4">
        <button 
          onClick={toggleSidebar}
          className="p-2 hover:bg-black/10 dark:hover:bg-white/10 rounded-lg lg:hidden"
        >
          <Menu className="text-textMain" size={24} />
        </button>
        <Link to="/" className="font-space font-bold text-xl tracking-tight flex items-center gap-2">
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-accentViolet to-accentAmber">
            SonicCollab
          </span>
        </Link>
      </div>

      <div className="flex items-center gap-4">
        {user ? (
          <>
            <div className="relative">
              <button
                className="relative p-2 hover:bg-black/10 dark:hover:bg-white/10 rounded-full transition-colors"
                onClick={() => setNotifOpen(!notifOpen)}
                aria-label="Open notifications"
              >
                <Bell className="text-textMuted hover:text-textMain" size={20} />
                {unreadCount > 0 ? (
                  <span className="absolute top-1 right-1 w-4 h-4 bg-accentAmber text-[10px] font-bold rounded-full flex items-center justify-center text-black">
                    {Math.min(99, unreadCount)}
                  </span>
                ) : null}
              </button>

              {notifOpen && (
                <div className="absolute right-0 mt-2 w-80 bg-surface border border-borderBase rounded-lg shadow-xl py-1 transform origin-top-right transition-all z-50">
                  <div className="px-4 py-2 border-b border-borderBase mb-1">
                    <p className="text-sm font-bold text-textMain truncate">Notifications</p>
                    <p className="text-xs text-textMuted truncate">{unreadCount} unread</p>
                  </div>
                  {preview?.length ? (
                    <div className="max-h-[50vh] overflow-y-auto px-1 custom-scrollbar">
                      {preview.map((n) => (
                        <button
                          key={n._id}
                          onClick={async () => {
                            if (!n.isRead) await markRead(n._id);
                            setNotifOpen(false);
                            if (n.project?._id) navigate(`/projects/${n.project._id}`);
                            else navigate('/notifications');
                          }}
                          className="w-full text-left px-4 py-3 hover:bg-white/10 transition-colors"
                        >
                          <div className={`text-xs font-bold uppercase tracking-widest ${n.isRead ? 'text-textMuted' : 'text-accentViolet'}`}>
                            {n.type}
                          </div>
                          <div className={`text-sm mt-1 ${n.isRead ? 'text-textMain' : 'text-[var(--accent-violet)]'}`}>
                            {n.message}
                          </div>
                        </button>
                      ))}
                      <div className="px-4 pb-3 pt-1">
                        <button
                          className="w-full px-4 py-2 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-sm font-bold transition-colors text-textMain"
                          onClick={() => {
                            setNotifOpen(false);
                            navigate('/notifications');
                          }}
                        >
                          View all
                        </button>
                      </div>
                    </div>
                  ) : (
                    <div className="px-4 py-8 text-center text-xs text-textMuted italic">No notifications.</div>
                  )}
                </div>
              )}
            </div>
            <ThemeToggle />
            <div className="relative">
              <button 
                onClick={() => setDropdownOpen(!dropdownOpen)}
                className="flex items-center gap-2 hover:bg-black/10 dark:hover:bg-white/10 p-1.5 rounded-full transition-colors"
              >
                {user.profilePicUrl ? (
                  <img src={user.profilePicUrl} alt={user.username} className="w-8 h-8 rounded-full object-cover" />
                ) : (
                  <UserCircle className="text-textMain w-8 h-8" />
                )}
              </button>

              {dropdownOpen && (
                <div className="absolute right-0 mt-2 w-48 bg-surface border border-borderBase rounded-lg shadow-xl py-1 transform origin-top-right transition-all">
                  <div className="px-4 py-2 border-b border-borderBase mb-1">
                    <p className="text-sm font-medium text-textMain truncate">{user.username}</p>
                    <p className="text-xs text-textMuted truncate">{user.email}</p>
                  </div>
                  <Link 
                    to={`/profile/${user._id}`}
                    onClick={() => setDropdownOpen(false)}
                    className="block px-4 py-2 text-sm text-textMain hover:bg-accentViolet/10 hover:text-accentViolet"
                  >
                    Profile
                  </Link>
                  <button 
                    onClick={handleLogout}
                    className="w-full text-left px-4 py-2 text-sm text-red-500 hover:bg-red-500/10 flex items-center gap-2"
                  >
                    <LogOut size={16} /> Logout
                  </button>
                </div>
              )}
            </div>
          </>
        ) : (
          <>
             <ThemeToggle />
             <Link to="/login" className="text-sm font-medium hover:text-accentViolet transition-colors">Log In</Link>
             <Link to="/signup" className="text-sm font-medium bg-accentViolet text-white px-4 py-2 rounded-full hover:bg-opacity-90 transition-transform transform hover:-translate-y-0.5">Sign Up</Link>
          </>
        )}
      </div>
    </nav>
  );
};

export default Navbar;
