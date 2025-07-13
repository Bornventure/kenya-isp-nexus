
import React, { useState } from 'react';
import { Menu, LogOut } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import Sidebar from './Sidebar';
import ThemeToggle from './ThemeToggle';
import GlobalSearch from './GlobalSearch';
import RealtimeNotifications from './RealtimeNotifications';
import LicenseExpiredBanner from '@/components/license/LicenseExpiredBanner';

interface DashboardLayoutProps {
  children: React.ReactNode;
}

const DashboardLayout = ({ children }: DashboardLayoutProps) => {
  const [sidebarOpen, setSidebarOpen] = useState(false); // Default to closed on mobile
  const { user } = useAuth();
  const navigate = useNavigate();

  const handleSignOut = async () => {
    // TODO: Implement sign out functionality
    navigate('/login');
  };

  const toggleSidebar = () => {
    setSidebarOpen(!sidebarOpen);
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <Sidebar 
        isOpen={sidebarOpen} 
        onClose={() => setSidebarOpen(false)}
        onToggle={toggleSidebar} 
      />
      
      {/* Main content area */}
      <div className={`transition-all duration-300 ease-in-out ${sidebarOpen ? 'lg:ml-64' : 'lg:ml-16'}`}>
        {/* Header */}
        <header className="bg-white dark:bg-gray-800 shadow-sm border-b border-gray-200 dark:border-gray-700 sticky top-0 z-30">
          <div className="px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between items-center h-16">
              <div className="flex items-center">
                {/* Mobile menu button - always visible on mobile */}
                <button
                  onClick={toggleSidebar}
                  className="lg:hidden p-2 rounded-md text-gray-400 hover:text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <Menu className="h-6 w-6" />
                </button>
                <h1 className="ml-4 lg:ml-0 text-xl font-semibold text-gray-900 dark:text-gray-100">
                  Dashboard
                </h1>
              </div>
              
              <div className="flex items-center space-x-4">
                <RealtimeNotifications />
                <ThemeToggle />
                <GlobalSearch />
                <button
                  onClick={handleSignOut}
                  className="flex items-center space-x-2 px-3 py-2 rounded-md text-sm font-medium text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                >
                  <LogOut className="h-4 w-4" />
                  <span>Sign Out</span>
                </button>
              </div>
            </div>
          </div>
        </header>

        {/* Main content */}
        <main className="py-6">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <LicenseExpiredBanner />
            {children}
          </div>
        </main>
      </div>
    </div>
  );
};

export default DashboardLayout;
