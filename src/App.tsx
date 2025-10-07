import React, { useState, useEffect } from 'react';
import { supabase } from './lib/supabase';
import SuperAdmin from './pages/SuperAdmin';
import AuthPage from './components/AuthPage';
import LandingPage from './components/LandingPage';
import GoogleBusinessSetup from './components/GoogleBusinessSetup';
import ComprehensiveOnboarding from './components/ComprehensiveOnboarding';
import MobileMenu from './components/MobileMenu';
import Dashboard from './components/Dashboard';
import GoogleReviews from './pages/GoogleReviews';
import GoogleMyBusinessPage from './pages/GoogleMyBusinessPage';
import SettingsPage from './components/SettingsPage';
import SuccessPage from './pages/SuccessPage';
import AISettingsPage from './components/AISettingsPage';
import DesktopDashboard from './components/DesktopDashboard';
import { useReviewsNotifications } from './hooks/useReviewsNotifications';

// ✅ Pages légales
import PrivacyPage from './pages/PrivacyPage';
import TermsPage from './pages/TermsPage';
import CookiesPage from './pages/CookiesPage';
import GDPRPage from './pages/GDPRPage';

// ✅ Nouvelles pages statiques (à créer)
import FeaturesPage from './pages/FeaturesPage';
import PricingPage from './pages/PricingPage';
import DemoPage from './pages/DemoPage';
import IntegrationsPage from './pages/IntegrationsPage';
import AboutPage from './pages/AboutPage';
import BlogPage from './pages/BlogPage';
import CareersPage from './pages/CareersPage';
import PressPage from './pages/PressPage';
import HelpPage from './pages/HelpPage';
import ContactPage from './pages/ContactPage';
import StatusPage from './pages/StatusPage';
import CommunityPage from './pages/CommunityPage';

function App() {
  const [currentView, setCurrentView] = useState<'landing' | 'auth' | 'google-setup' | 'onboarding' | 'app'>('landing');
  const [currentPage, setCurrentPage] = useState('dashboard');
  const [user, setUser] = useState<any>(null);
  const [accessToken, setAccessToken] = useState<string>('');
  const [selectedLocationId, setSelectedLocationId] = useState<string>('');
  const [selectedAccountId, setSelectedAccountId] = useState<string>('');
  const [hasCompletedOnboarding, setHasCompletedOnboarding] = useState<boolean>(false);

  const {
    notifications,
    unreadCount,
    markAsRead,
    markAllAsRead,
    clearNotifications,
  } = useReviewsNotifications(selectedLocationId);

  // ✅ Routes détectées par pathname
  const path = window.location.pathname;

  const staticRoutes: Record<string, JSX.Element> = {
    '/superadmin': <SuperAdmin />,
    '/success': <SuccessPage />,
    '/privacy': <PrivacyPage />,
    '/terms': <TermsPage />,
    '/cookies': <CookiesPage />,
    '/gdpr': <GDPRPage />,
    '/features': <FeaturesPage />,
    '/pricing': <PricingPage />,
    '/demo': <DemoPage />,
    '/integrations': <IntegrationsPage />,
    '/about': <AboutPage />,
    '/blog': <BlogPage />,
    '/careers': <CareersPage />,
    '/press': <PressPage />,
    '/help': <HelpPage />,
    '/contact': <ContactPage />,
    '/status': <StatusPage />,
    '/community': <CommunityPage />,
  };

  // ✅ Si le path correspond à une route statique, on l’affiche directement
  if (path in staticRoutes) {
    return staticRoutes[path];
  }

  // ✅ (Le reste de ton code handleSession et Supabase ne change pas)
  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => handleSession(session));
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      handleSession(session);
    });
    return () => subscription.unsubscribe();
  }, []);

  // ... tout ton handleSession() ici (inchangé)
  // ... tout ton onboarding, logout, etc. inchangé

  // ✅ Affichage de base selon currentView
  if (currentView === 'landing') {
    return <LandingPage onGetStarted={() => setCurrentView('auth')} />;
  }

  if (currentView === 'auth') {
    return <AuthPage onGoogleAuth={() => {}} onEmailAuth={() => {}} />;
  }

  if (currentView === 'google-setup') {
    return (
      <GoogleBusinessSetup
        accessToken={accessToken}
        onSetupComplete={() => {}}
        onTokenExpired={() => {}}
      />
    );
  }

  if (currentView === 'onboarding') {
    return (
      <ComprehensiveOnboarding
        user={user}
        accessToken={accessToken}
        onComplete={() => setCurrentView('app')}
      />
    );
  }

  if (currentView === 'app') {
    const isDesktop = window.innerWidth >= 1024;
    if (isDesktop) {
      return (
        <DesktopDashboard
          user={user}
          accessToken={accessToken}
          selectedLocationId={selectedLocationId}
          setSelectedLocationId={setSelectedLocationId}
          selectedAccountId={selectedAccountId}
          onNavigate={setCurrentPage}
          onLogout={() => supabase.auth.signOut()}
          notifications={notifications}
          unreadCount={unreadCount}
          onMarkAsRead={markAsRead}
          onMarkAllAsRead={markAllAsRead}
          onClearAll={clearNotifications}
          onTokenExpired={() => {}}
        />
      );
    }
  }

  return (
    <div className="min-h-screen bg-[#F1F3F4]">
      <MobileMenu
        user={user}
        currentPage={currentPage}
        onNavigate={setCurrentPage}
        onLogout={() => supabase.auth.signOut()}
        notifications={notifications}
        unreadCount={unreadCount}
        onMarkAsRead={markAsRead}
        onMarkAllAsRead={markAllAsRead}
        onClearAll={clearNotifications}
      />

      {currentPage === 'dashboard' && <Dashboard user={user} />}
      {currentPage === 'reviews' && <GoogleReviews user={user} accessToken={accessToken} />}
      {currentPage === 'google-my-business' && <GoogleMyBusinessPage user={user} accessToken={accessToken} />}
      {currentPage === 'avis-ia' && <AISettingsPage user={user} />}
      {currentPage === 'settings' && <SettingsPage user={user} onLogout={() => supabase.auth.signOut()} />}
    </div>
  );
}

export default App;
