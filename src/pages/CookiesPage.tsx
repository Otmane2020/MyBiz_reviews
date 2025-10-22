import React, { useState } from 'react';
import {
  Cookie,
  ArrowLeft,
  Settings,
  Eye,
  BarChart3,
  Shield,
  Check,
  X,
  Mail,
  AlertTriangle,
} from 'lucide-react';
import StarlinkoLogo from '../components/StarlinkoLogo';

const CookiesPage: React.FC = () => {
  const [cookiePreferences, setCookiePreferences] = useState({
    essential: true, // Toujours activé
    analytics: false,
    marketing: false,
    preferences: true,
  });

  const goBack = () => window.history.back();

  const handlePreferenceChange = (type: string, value: boolean) => {
    if (type === 'essential') return; // Les cookies essentiels ne peuvent pas être désactivés
    setCookiePreferences((prev) => ({ ...prev, [type]: value }));
  };

  const savePreferences = () => {
    localStorage.setItem('cookiePreferences', JSON.stringify(cookiePreferences));
    alert('Préférences sauvegardées ✅');
  };

  const acceptAll = () => {
    const allAccepted = {
      essential: true,
      analytics: true,
      marketing: true,
      preferences: true,
    };
    setCookiePreferences(allAccepted);
    localStorage.setItem('cookiePreferences', JSON.stringify(allAccepted));
    alert('Tous les cookies ont été acceptés 🍪');
  };

  const rejectOptional = () => {
    const essentialOnly = {
      essential: true,
      analytics: false,
      marketing: false,
      preferences: false,
    };
    setCookiePreferences(essentialOnly);
    localStorage.setItem('cookiePreferences', JSON.stringify(essentialOnly));
    alert('Seuls les cookies essentiels sont activés ⚙️');
  };

  return (
    <div className="min-h-screen bg-[#F1F3F4]">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 shadow-sm">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center">
              <button
                onClick={goBack}
                className="mr-4 p-2 rounded-lg hover:bg-gray-100 transition-colors"
              >
                <ArrowLeft className="w-5 h-5 text-gray-600" />
              </button>
              <StarlinkoLogo size="md" showText />
            </div>
          </div>
        </div>
      </header>

      {/* Main content */}
      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="bg-white rounded-xl shadow-sm p-8">
          {/* Header */}
          <div className="text-center mb-8">
            <div className="w-16 h-16 bg-[#FBBC05]/10 rounded-full flex items-center justify-center mx-auto mb-4">
              <Cookie className="w-8 h-8 text-[#FBBC05]" />
            </div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">
              Politique des Cookies
            </h1>
            <p className="text-gray-600">Dernière mise à jour : 1er janvier 2024</p>
          </div>

          {/* Intro */}
          <div className="prose prose-lg max-w-none">
            <div className="bg-[#FBBC05]/5 rounded-lg p-6 mb-8">
              <h2 className="text-xl font-semibold text-gray-900 mb-3 flex items-center">
                <Cookie className="w-5 h-5 mr-2 text-[#FBBC05]" />
                Qu'est-ce qu'un cookie ?
              </h2>
              <p className="text-gray-700">
                Les cookies sont de petits fichiers texte stockés sur votre appareil lorsque vous
                visitez un site web. Ils nous aident à améliorer votre expérience et à fournir nos
                services de manière optimale.
              </p>
            </div>

            <h2 className="text-2xl font-bold text-gray-900 mb-6">Types de cookies utilisés</h2>

            {/* Cookie Categories */}
            <div className="space-y-6 mb-8">
              {/* Essential */}
              <div className="border border-gray-200 rounded-lg p-6">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center">
                    <Shield className="w-6 h-6 text-[#34A853] mr-3" />
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900">Cookies essentiels</h3>
                      <p className="text-sm text-gray-600">
                        Nécessaires au fonctionnement du site
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center">
                    <span className="text-sm text-gray-500 mr-2">Toujours activé</span>
                    <div className="w-11 h-6 bg-[#34A853] rounded-full relative">
                      <div className="absolute right-[2px] top-[2px] bg-white w-5 h-5 rounded-full" />
                    </div>
                  </div>
                </div>
                <ul className="text-sm text-gray-600 space-y-1">
                  <li>• Session d'authentification — Maintient votre connexion</li>
                  <li>• Sécurité CSRF — Protection contre les attaques</li>
                  <li>• Préférences de langue — Mémorise votre langue</li>
                  <li>• Consentement cookies — Mémorise vos choix</li>
                </ul>
              </div>

              {/* Preferences */}
              <div className="border border-gray-200 rounded-lg p-6">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center">
                    <Settings className="w-6 h-6 text-[#4285F4] mr-3" />
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900">
                        Cookies de préférences
                      </h3>
                      <p className="text-sm text-gray-600">
                        Mémorisent vos paramètres personnalisés
                      </p>
                    </div>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      className="sr-only peer"
                      checked={cookiePreferences.preferences}
                      onChange={(e) =>
                        handlePreferenceChange('preferences', e.target.checked)
                      }
                    />
                    <div className="w-11 h-6 bg-gray-200 rounded-full peer-checked:bg-[#4285F4] after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:after:translate-x-full" />
                  </label>
                </div>
                <ul className="text-sm text-gray-600 space-y-1">
                  <li>• Paramètres IA — Ton, longueur, signature des réponses</li>
                  <li>• Interface utilisateur — Thème, disposition</li>
                  <li>• Établissements sélectionnés — Mémorise vos choix</li>
                </ul>
              </div>

              {/* Analytics */}
              <div className="border border-gray-200 rounded-lg p-6">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center">
                    <BarChart3 className="w-6 h-6 text-[#FBBC05] mr-3" />
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900">Cookies d'analyse</h3>
                      <p className="text-sm text-gray-600">
                        Nous aident à améliorer notre service
                      </p>
                    </div>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      className="sr-only peer"
                      checked={cookiePreferences.analytics}
                      onChange={(e) =>
                        handlePreferenceChange('analytics', e.target.checked)
                      }
                    />
                    <div className="w-11 h-6 bg-gray-200 rounded-full peer-checked:bg-[#4285F4] after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:after:translate-x-full" />
                  </label>
                </div>
                <ul className="text-sm text-gray-600 space-y-1">
                  <li>• Utilisation anonyme — Pages visitées, fonctionnalités utilisées</li>
                  <li>• Performance — Temps de chargement, erreurs</li>
                  <li>• Amélioration — Données agrégées pour optimiser l’expérience</li>
                </ul>
              </div>

              {/* Marketing */}
              <div className="border border-gray-200 rounded-lg p-6">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center">
                    <Eye className="w-6 h-6 text-[#EA4335] mr-3" />
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900">Cookies marketing</h3>
                      <p className="text-sm text-gray-600">
                        Pour personnaliser votre expérience
                      </p>
                    </div>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      className="sr-only peer"
                      checked={cookiePreferences.marketing}
                      onChange={(e) =>
                        handlePreferenceChange('marketing', e.target.checked)
                      }
                    />
                    <div className="w-11 h-6 bg-gray-200 rounded-full peer-checked:bg-[#4285F4] after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:after:translate-x-full" />
                  </label>
                </div>
                <ul className="text-sm text-gray-600 space-y-1">
                  <li>• Recommandations — Suggestions de fonctionnalités</li>
                  <li>• Communications — Emails ciblés selon vos intérêts</li>
                  <li>• Retargeting — Publicités pertinentes sur d'autres sites</li>
                </ul>
              </div>
            </div>

            {/* Actions rapides */}
            <div className="bg-gradient-to-r from-[#4285F4]/10 to-[#34A853]/10 rounded-lg p-6 mb-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Actions rapides</h3>
              <div className="flex flex-col sm:flex-row gap-3">
                <button
                  onClick={acceptAll}
                  className="flex items-center justify-center px-6 py-3 bg-[#34A853] text-white rounded-lg hover:bg-[#2D8A47] transition-colors font-medium"
                >
                  <Check className="w-5 h-5 mr-2" />
                  Accepter tous les cookies
                </button>
                <button
                  onClick={rejectOptional}
                  className="flex items-center justify-center px-6 py-3 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors font-medium"
                >
                  <X className="w-5 h-5 mr-2" />
                  Refuser les cookies optionnels
                </button>
                <button
                  onClick={savePreferences}
                  className="flex items-center justify-center px-6 py-3 bg-[#4285F4] text-white rounded-lg hover:bg-[#3367D6] transition-colors font-medium"
                >
                  <Settings className="w-5 h-5 mr-2" />
                  Sauvegarder mes choix
                </button>
              </div>
            </div>

            {/* Contact */}
            <div className="bg-gradient-to-r from-[#4285F4]/10 to-[#34A853]/10 rounded-lg p-6 mt-10">
              <h2 className="text-lg font-semibold text-gray-900 mb-3">Contact</h2>
              <div className="flex items-center">
                <Mail className="w-5 h-5 text-[#4285F4] mr-3" />
                <div>
                  <div className="font-medium text-gray-900">Email</div>
                  <div className="text-sm text-gray-600">privacy@starlinko.com</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default CookiesPage;
