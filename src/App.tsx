import React from 'react';
import { useState, useEffect } from 'react';
import LandingPage from './components/LandingPage';
import Onboarding from './components/Onboarding';
import MobileMenu from './components/MobileMenu';
import Dashboard from './components/Dashboard';
import GoogleReviews from './pages/GoogleReviews';

function App() {
  const [currentView, setCurrentView] = useState<'landing' | 'onboarding' | 'app'>('landing');
  const [currentPage, setCurrentPage] = useState('dashboard');
  const [user, setUser] = useState<any>(null);
  const [accessToken, setAccessToken] = useState<string>('');

  // Vérifier si l'utilisateur a déjà vu l'onboarding
  useEffect(() => {
    const hasSeenOnboarding = localStorage.getItem('hasSeenOnboarding');
    const savedUser = localStorage.getItem('user');
    const savedToken = localStorage.getItem('accessToken');

    if (savedUser && savedToken) {
      setUser(JSON.parse(savedUser));
      setAccessToken(savedToken);
      setCurrentView('app');
    } else if (hasSeenOnboarding) {
      setCurrentView('app');
    }
  }, []);

  const handleGetStarted = () => {
    setCurrentView('onboarding');
  };

  const handleOnboardingComplete = () => {
    localStorage.setItem('hasSeenOnboarding', 'true');
    setCurrentView('app');
  };

  const handleUserLogin = (userData: any, token: string) => {
    setUser(userData);
    setAccessToken(token);
    localStorage.setItem('user', JSON.stringify(userData));
    localStorage.setItem('accessToken', token);
  };

  const handleLogout = () => {
    setUser(null);
    setAccessToken('');
    setCurrentPage('dashboard');
    localStorage.removeItem('user');
    localStorage.removeItem('accessToken');
    localStorage.removeItem('hasSeenOnboarding');
    setCurrentView('landing');
  };

  const handleNavigate = (page: string) => {
    setCurrentPage(page);
  };

  if (currentView === 'landing') {
    return <LandingPage onGetStarted={handleGetStarted} />;
  }

  if (currentView === 'onboarding') {
    return <Onboarding onComplete={handleOnboardingComplete} />;
  }

  return (
    <div className="min-h-screen bg-[#F1F3F4]">
      <MobileMenu
        user={user}
        currentPage={currentPage}
        onNavigate={handleNavigate}
        onLogout={handleLogout}
      />
      
      {currentPage === 'dashboard' && <Dashboard user={user} />}
      {currentPage === 'reviews' && (
        <GoogleReviews 
          user={user} 
          accessToken={accessToken}
          onUserLogin={handleUserLogin}
        />
      )}
      {currentPage === 'responses' && (
        <div className="p-4 pt-20">
          <div className="max-w-4xl mx-auto">
            <h1 className="text-2xl font-bold text-gray-900 mb-4">Réponses</h1>
            <div className="bg-white rounded-xl p-6 shadow-sm text-center">
              <p className="text-gray-600">Fonctionnalité en cours de développement</p>
            </div>
          </div>
        </div>
      )}
      {currentPage === 'settings' && (
        <div className="p-4 pt-20">
          <div className="max-w-4xl mx-auto">
            <h1 className="text-2xl font-bold text-gray-900 mb-4">Paramètres</h1>
            <div className="bg-white rounded-xl p-6 shadow-sm text-center">
              <p className="text-gray-600">Fonctionnalité en cours de développement</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default App;