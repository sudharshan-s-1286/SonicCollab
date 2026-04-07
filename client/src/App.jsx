import React, { useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import useAuthStore from './store/authStore';

import Navbar from './components/layout/Navbar';
import Sidebar from './components/layout/Sidebar';
import AudioPlayer from './components/audio/AudioPlayer';

import LandingPage from './pages/LandingPage';
import LoginPage from './pages/LoginPage';
import SignupPage from './pages/SignupPage';

import DashboardPage from './pages/DashboardPage';
import ProjectPage from './pages/ProjectPage';
import ExplorePage from './pages/ExplorePage';
import ProfilePage from './pages/ProfilePage';
import NotificationsPage from './pages/NotificationsPage';
import SavedPage from './pages/SavedPage';
import InvitePage from './pages/InvitePage';
import SettingsPage from './pages/SettingsPage';

// Protective Route Wrapper
const PrivateRoute = ({ children }) => {
  const { isAuthenticated, isLoading } = useAuthStore();
  
  if (isLoading) return <div className="p-8 flex justify-center text-[var(--accent-violet)]">Loading...</div>;
  return isAuthenticated ? children : <Navigate to="/login" replace />;
};

function App() {
  const { checkAuth, isLoading } = useAuthStore();
  const [sidebarOpen, setSidebarOpen] = React.useState(false);

  useEffect(() => {
    checkAuth();
  }, [checkAuth]);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[var(--bg-primary)]">
        <div className="w-12 h-12 border-4 border-[var(--accent-violet)] border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <Router>
      <div className="min-h-screen flex flex-col bg-[var(--bg-primary)] text-[var(--text-primary)]">
        <Navbar toggleSidebar={() => setSidebarOpen(!sidebarOpen)} />
        
        <div className="flex flex-1 overflow-hidden">
          <Sidebar isOpen={sidebarOpen} closeSidebar={() => setSidebarOpen(false)} />
          
          <main className="flex-1 overflow-y-auto relative">
            <Routes>
              <Route path="/" element={<LandingPage />} />
              <Route path="/login" element={<LoginPage />} />
              <Route path="/signup" element={<SignupPage />} />
              <Route
                path="/explore"
                element={
                  <PrivateRoute>
                    <ExplorePage />
                  </PrivateRoute>
                }
              />
              <Route 
                path="/dashboard" 
                element={
                  <PrivateRoute>
                    <DashboardPage />
                  </PrivateRoute>
                } 
              />
              <Route 
                path="/projects/:id" 
                element={
                  <PrivateRoute>
                    <ProjectPage />
                  </PrivateRoute>
                } 
              />
              <Route 
                path="/profile/:id" 
                element={
                  <PrivateRoute>
                    <ProfilePage />
                  </PrivateRoute>
                } 
              />
              <Route
                path="/saved"
                element={
                  <PrivateRoute>
                    <SavedPage />
                  </PrivateRoute>
                }
              />
              <Route
                path="/notifications"
                element={
                  <PrivateRoute>
                    <NotificationsPage />
                  </PrivateRoute>
                }
              />
              <Route
                path="/invite/:token"
                element={
                  <PrivateRoute>
                    <InvitePage />
                  </PrivateRoute>
                }
              />
              <Route
                path="/settings"
                element={
                  <PrivateRoute>
                    <SettingsPage />
                  </PrivateRoute>
                }
              />
            </Routes>
          </main>
        </div>
        
        {/* Global Audio Player Bar */}
        <AudioPlayer />
      </div>
    </Router>
  );
}

export default App;
