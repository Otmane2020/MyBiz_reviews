import React, { useState } from 'react';
import { Menu, X, Home, Star, MessageSquare, Settings, User, LogOut } from 'lucide-react';

interface MobileMenuProps {
  user: any;
  currentPage: string;
  onNavigate: (page: string) => void;
  onLogout: () => void;
}

const MobileMenu: React.FC<MobileMenuProps> = ({ user, currentPage, onNavigate, onLogout }) => {
  const [isOpen, setIsOpen] = useState(false);

  const menuItems = [
    { id: 'dashboard', label: 'Tableau de bord', icon: Home },
    { id: 'reviews', label: 'Avis', icon: Star },
    { id: 'responses', label: 'Réponses', icon: MessageSquare },
    { id: 'settings', label: 'Paramètres', icon: Settings },
  ];

  const toggleMenu = () => setIsOpen(!isOpen);

  const handleNavigate = (page: string) => {
    onNavigate(page);
    setIsOpen(false);
  };

  const GoogleLogo = () => (
    <svg width="20" height="20" viewBox="0 0 24 24" className="mr-2">
      <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
      <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
      <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
      <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
    </svg>
  );

  return (
    <>
      {/* Header avec menu burger */}
      <header className="bg-white border-b border-gray-200 shadow-sm sticky top-0 z-40">
        <div className="flex items-center justify-between h-16 px-4">
          <div className="flex items-center">
            <GoogleLogo />
            <h1 className="text-lg font-semibold text-gray-900">
              ReviewsManager
            </h1>
          </div>
          
          <button
            onClick={toggleMenu}
            className="p-2 rounded-md text-gray-600 hover:bg-gray-100 transition-colors"
          >
            {isOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
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
                <div className="font-medium">{user.name}</div>
                <div className="text-sm text-white/80">{user.email}</div>
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
            Déconnexion
          </button>
        </div>
      </div>
    </>
  );
};

export default MobileMenu;