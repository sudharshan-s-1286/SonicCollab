import React from 'react';
import { NavLink } from 'react-router-dom';
import { LayoutDashboard, Compass, FolderHeart, Settings, CircleDashed } from 'lucide-react';
import useAuthStore from '../../store/authStore';

const Sidebar = ({ isOpen, closeSidebar }) => {
  const { user } = useAuthStore();

  const navLinks = [
    { name: 'Dashboard', path: '/dashboard', icon: <LayoutDashboard size={20} /> },
    { name: 'Explore', path: '/explore', icon: <Compass size={20} /> },
    { name: 'Saved Projects', path: '/saved', icon: <FolderHeart size={20} /> },
    { name: 'Settings', path: '/settings', icon: <Settings size={20} /> },
  ];

  if (!user) return null;

  return (
    <>
      {/* Mobile overlay */}
      {isOpen && (
        <div 
          className="fixed inset-0 bg-black/50 z-40 lg:hidden"
          onClick={closeSidebar}
        />
      )}

      {/* Sidebar container */}
      <aside className={`fixed lg:static inset-y-0 left-0 w-64 glass-panel border-r border-borderBase transform transition-transform duration-300 ease-in-out z-50 pt-[73px] lg:pt-0 lg:translate-x-0 ${isOpen ? 'translate-x-0' : '-translate-x-full'}`}>
        
        <div className="h-full flex flex-col pt-6 pb-20 overflow-y-auto">
          {/* Mini profile snippet */}
          <div className="px-6 mb-8 flex items-center gap-3">
             <div className="w-10 h-10 rounded-full bg-accentViolet flex items-center justify-center text-white font-bold text-lg">
               {user.username.charAt(0).toUpperCase()}
             </div>
             <div className="overflow-hidden">
               <p className="font-semibold text-textMain truncate">{user.username}</p>
               <p className="text-xs text-textMuted uppercase space-font">Artist</p>
             </div>
          </div>

          <nav className="flex-1 px-4 space-y-1">
            {navLinks.map((link) => (
              <NavLink
                key={link.name}
                to={link.path}
                onClick={() => {
                  if (window.innerWidth < 1024) closeSidebar();
                }}
                className={({ isActive }) => 
                  `flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-all ${
                    isActive 
                    ? 'bg-accentViolet/10 text-accentViolet border-l-4 border-accentViolet' 
                    : 'text-textMuted hover:bg-black/5 dark:hover:bg-white/5 hover:text-textMain border-l-4 border-transparent'
                  }`
                }
              >
                {link.icon}
                {link.name}
              </NavLink>
            ))}
          </nav>
          
          <div className="px-6 mt-8">
             <div className="bg-black/5 dark:bg-white/5 p-4 rounded-xl text-center">
                <CircleDashed className="mx-auto text-accentAmber mb-2" size={24} animate="spin" />
                <p className="text-xs text-textMuted mb-2">Upgrade to Pro for unlimited stems</p>
                <button className="text-xs font-medium text-accentAmber hover:underline">Learn more</button>
             </div>
          </div>
        </div>
      </aside>
    </>
  );
};

export default Sidebar;
