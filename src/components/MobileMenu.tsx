import React, { useState } from 'react';
import { Menu, X, Home, Star, MessageSquare, Settings, User, LogOut, Bot, Building2 } from 'lucide-react';
import StarlinkoLogo from './StarlinkoLogo';
import NotificationCenter from './NotificationCenter';

interface MobileMenuProps {
  user: any;
  currentPage: string;
  onNavigate: (page: string) => void;
  onLogout: () => void;
  notifications: any[];
  unreadCount: number;
  onMarkAsRead: (id: string) => void;
  onMarkAllAsRead: () => void;
  onClearAll: () => void;
}

const MobileMenu: React.FC<MobileMenuProps> = ({ 
  user, 
  currentPage, 
  onNavigate, 
  onLogout,
  notifications,
  unreadCount,
  onMarkAsRead,
  onMarkAllAsRead,
  onClearAll
}) => {
  const [isOpen, setIsOpen] = useState(false);

  const menuItems = [
    { id: 'dashboard', label: 'Tableau de bord', icon: Home },
    { id: 'reviews', label: 'Avis', icon: Star },
    { id: 'google-my-business', label: 'Analytics GMB', icon: Building2 },
    { id: 'avis-ia', label: 'Avis IA', icon: Bot },
    { id: 'responses', label: 'Réponses', icon: MessageSquare },
    { id: 'settings', label: 'Paramètres', icon: Settings },
  ];

  const toggleMenu = () => setIsOpen(!isOpen);

  const handleNavigate = (page: string) => {
    onNavigate(page);
    setIsOpen(false);
  };


  return (
    <>
      {/* Header avec menu burger */}
      <header className="bg-white border-b border-gray-200 shadow-sm sticky top-0 z-40 block md:block">
        <div className="flex items-center justify-between h-16 px-4">
          <div className="flex items-center">
            <StarlinkoLogo 
              size="md" 
              showGoogleIcon={true} 
              onClick={() => handleNavigate('dashboard')}
            />
          </div>
          
          <div className="flex items-center space-x-2">
            <NotificationCenter
              notifications={notifications}
              unreadCount={unreadCount}
              onMarkAsRead={onMarkAsRead}
              onMarkAllAsRead={onMarkAllAsRead}
              onClearAll={onClearAll}
            />
            
            <button
              onClick={toggleMenu}
              className="p-2 rounded-md text-gray-600 hover:bg-gray-100 transition-colors"
            >
              {isOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </header>

      {/* Overlay */}
      {isOpen && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 z-40"
          onClick={() => setIsOpen(false)}
        />
      )}

      {/* Menu latéral */}
      <div className={`fixed top-0 right-0 h-full w-80 bg-white shadow-2xl transform transition-transform duration-300 ease-in-out z-50 ${
        isOpen ? 'translate-x-0' : 'translate-x-full'
      }`}>
        {/* Header du menu */}
        <div className="bg-gradient-to-r from-[#4285F4] to-[#34A853] p-6 text-white">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-semibold">Menu</h2>
            <button
              onClick={toggleMenu}
              className="p-1 rounded-full hover:bg-white/20 transition-colors"
            >
              <X className="w-6 h-6" />
            </button>
          </div>
          
          {user && (
            <div className="flex items-center">
              <img
                src={user.picture}
                alt={user.name}
                className="w-12 h-12 rounded-full mr-3 border-2 border-white/30"
              />
              <div>
                <div className="font-medium">Utilisateur</div>
                <div className="text-sm text-white/80">Mode démo</div>
              </div>
            </div>
          )}
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
                className={`w-full flex items-center px-6 py-4 text-left transition-colors ${
                  isActive
                    ? 'bg-[#4285F4]/10 text-[#4285F4] border-r-4 border-[#4285F4]'
                    : 'text-gray-700 hover:bg-gray-50'
                }`}
              >
                <Icon className={`w-5 h-5 mr-3 ${isActive ? 'text-[#4285F4]' : 'text-gray-500'}`} />
                {item.label}
              </button>
            );
          })}
        </nav>

        {/* Footer du menu */}
        <div className="border-t border-gray-200 p-4">
          <button
            onClick={() => {
              onLogout();
              setIsOpen(false);
            }}
            className="w-full flex items-center px-2 py-3 text-gray-700 hover:bg-gray-50 rounded-lg transition-colors"
          >
            <LogOut className="w-5 h-5 mr-3 text-gray-500" />
            {user?.authMethod === 'demo' ? 'Quitter le mode démo' : 'Déconnexion'}
          </button>
        </div>
      </div>
    </>
  );
};

export default MobileMenu;