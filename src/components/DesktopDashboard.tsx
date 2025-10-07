import React, { useState } from 'react';
import { Star, MessageSquare, TrendingUp, Users, Calendar, Award, Building2, Settings, LogOut, Bell, Menu, X, Bot, Home } from 'lucide-react';
import StarlinkoLogo from './StarlinkoLogo';
import Dashboard from './Dashboard';
import GoogleReviews from '../pages/GoogleReviews';
import GoogleMyBusinessPage from '../pages/GoogleMyBusinessPage';
import AISettingsPage from './AISettingsPage';
import SettingsPage from './SettingsPage';
import NotificationCenter from './NotificationCenter';

interface DesktopDashboardProps {
  user: any;
  accessToken: string;
  selectedLocationId: string;
  setSelectedLocationId: (id: string) => void;
  selectedAccountId: string;
  onNavigate: (page: string) => void;
  onLogout: () => void;
  notifications: any[];
  unreadCount: number;
  onMarkAsRead: (id: string) => void;
  onMarkAllAsRead: () => void;
  onClearAll: () => void;
  onTokenExpired: () => void;
}

const DesktopDashboard: React.FC<DesktopDashboardProps> = ({
  user,
  accessToken,
  selectedLocationId,
  setSelectedLocationId,
  selectedAccountId,
  onNavigate,
  onLogout,
  notifications,
  unreadCount,
  onMarkAsRead,
  onMarkAllAsRead,
  onClearAll,
  onTokenExpired
}) => {
  const [currentPage, setCurrentPage] = useState('dashboard');
  const [sidebarOpen, setSidebarOpen] = useState(true);

  const menuItems = [
    { id: 'dashboard', label: 'Tableau de bord', icon: Home },
    { id: 'reviews', label: 'Avis', icon: Star },
    { id: 'google-my-business', label: 'Analytics GMB', icon: Building2 },
    { id: 'avis-ia', label: 'Avis IA', icon: Bot },
    { id: 'responses', label: 'Réponses', icon: MessageSquare },
    { id: 'settings', label: 'Paramètres', icon: Settings },
  ];

  const handleNavigate = (page: string) => {
    setCurrentPage(page);
  };

  const renderContent = () => {
    switch (currentPage) {
      case 'dashboard':
        return <Dashboard user={user} />;
      case 'reviews':
        return (
          <GoogleReviews 
            user={user} 
            accessToken={accessToken}
            selectedLocationId={selectedLocationId}
            setSelectedLocationId={setSelectedLocationId}
            onNavigate={handleNavigate}
            selectedAccountId={selectedAccountId}
            onTokenExpired={onTokenExpired}
          />
        );
      case 'google-my-business':
        return (
          <GoogleMyBusinessPage 
            user={user} 
            accessToken={accessToken}
            selectedLocationId={selectedLocationId}
            setSelectedLocationId={setSelectedLocationId}
            onNavigate={handleNavigate}
            selectedAccountId={selectedAccountId}
          />
        );
      case 'avis-ia':
        return <AISettingsPage user={user} />;
      case 'responses':
        return (
          <div className="p-8">
            <div className="max-w-4xl mx-auto">
              <h1 className="text-2xl font-bold text-gray-900 mb-4">Réponses</h1>
              <div className="bg-white rounded-xl p-6 shadow-sm text-center">
                <p className="text-gray-600">Fonctionnalité en cours de développement</p>
              </div>
            </div>
          </div>
        );
      case 'settings':
        return <SettingsPage user={user} onLogout={onLogout} />;
      default:
        return <Dashboard user={user} />;
    }
  };

  return (
    <div className="min-h-screen bg-[#F1F3F4] flex">
      {/* Sidebar */}
      <div className={`${sidebarOpen ? 'w-64' : 'w-16'} bg-white shadow-lg transition-all duration-300 flex flex-col`}>
        {/* Header */}
        <div className="p-4 border-b border-gray-200">
          <div className="flex items-center justify-between">
            {sidebarOpen && (
              <StarlinkoLogo size="md" showText={true} />
            )}
            <button
              onClick={() => setSidebarOpen(!sidebarOpen)}
              className="p-2 rounded-lg hover:bg-gray-100 transition-colors"
            >
              {sidebarOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>

        {/* Navigation */}
        <nav className="flex-1 py-4">
          {menuItems.map((item) => {
            const Icon = item.icon;
            const isActive = currentPage === item.id;
            
            return (
              <button
                key={item.id}
                onClick={() => handleNavigate(item.id)}
                className={`w-full flex items-center px-4 py-3 text-left transition-colors ${
                  isActive
                    ? 'bg-[#4285F4]/10 text-[#4285F4] border-r-4 border-[#4285F4]'
                    : 'text-gray-700 hover:bg-gray-50'
                }`}
                title={!sidebarOpen ? item.label : undefined}
              >
                <Icon className={`w-5 h-5 ${sidebarOpen ? 'mr-3' : 'mx-auto'} ${isActive ? 'text-[#4285F4]' : 'text-gray-500'}`} />
                {sidebarOpen && (
                  <span className="font-medium">{item.label}</span>
                )}
              </button>
            );
          })}
        </nav>

        {/* User Profile */}
        <div className="p-4 border-t border-gray-200">
          {sidebarOpen ? (
            <div className="space-y-3">
              <div className="flex items-center">
                <img
                  src={user?.picture}
                  alt={user?.name}
                  className="w-10 h-10 rounded-full mr-3"
                />
                <div className="flex-1 min-w-0">
                  <div className="font-medium text-gray-900 truncate">{user?.name || 'Utilisateur'}</div>
                  <div className="text-sm text-gray-500 truncate">{user?.email || 'Compte Google'}</div>
                </div>
              </div>
              <button
                onClick={onLogout}
                className="w-full flex items-center px-3 py-2 text-gray-700 hover:bg-gray-50 rounded-lg transition-colors"
              >
                <LogOut className="w-4 h-4 mr-2" />
                Déconnexion
              </button>
            </div>
          ) : (
            <div className="flex flex-col items-center space-y-2">
              <img
                src={user?.picture}
                alt={user?.name}
                className="w-8 h-8 rounded-full"
              />
              <button
                onClick={onLogout}
                className="p-2 text-gray-700 hover:bg-gray-50 rounded-lg transition-colors"
                title="Déconnexion"
              >
                <LogOut className="w-4 h-4" />
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col">
        {/* Top Bar */}
        <header className="bg-white border-b border-gray-200 shadow-sm">
          <div className="flex items-center justify-between h-16 px-6">
            <div>
              <h1 className="text-xl font-semibold text-gray-900">
                {menuItems.find(item => item.id === currentPage)?.label || 'Dashboard'}
              </h1>
            </div>
            
            <div className="flex items-center space-x-4">
              <NotificationCenter
                notifications={notifications}
                unreadCount={unreadCount}
                onMarkAsRead={onMarkAsRead}
                onMarkAllAsRead={onMarkAllAsRead}
                onClearAll={onClearAll}
              />
              
              {/* Trial Status */}
              <div className="hidden md:flex items-center bg-[#FBBC05]/10 text-[#FBBC05] px-3 py-1 rounded-full text-sm font-medium">
                <div className="w-2 h-2 bg-[#FBBC05] rounded-full mr-2 animate-pulse"></div>
                Essai gratuit - 14 jours restants
              </div>
            </div>
          </div>
        </header>

        {/* Content */}
        <main className="flex-1 overflow-auto">
          {renderContent()}
        </main>
      </div>
    </div>
  );
};

export default DesktopDashboard;