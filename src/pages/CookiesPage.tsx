import React, { useState } from 'react';
import { Cookie, ArrowLeft, Settings, Eye, BarChart3, Shield, Check, X } from 'lucide-react';
import StarlinkoLogo from '../components/StarlinkoLogo';

const CookiesPage: React.FC = () => {
  const [cookiePreferences, setCookiePreferences] = useState({
    essential: true, // Toujours activé
    analytics: false,
    marketing: false,
    preferences: true
  });

  const goBack = () => {
    window.history.back();
  };

  const handlePreferenceChange = (type: string, value: boolean) => {
    if (type === 'essential') return; // Les cookies essentiels ne peuvent pas être désactivés
    
    setCookiePreferences(prev => ({
      ...prev,
      [type]: value
    }));
  };

  const savePreferences = () => {
    localStorage.setItem('cookiePreferences', JSON.stringify(cookiePreferences));
    alert('Préférences sauvegardées !');
  };

  const acceptAll = () => {
    const allAccepted = {
      essential: true,
      analytics: true,
      marketing: true,
      preferences: true
    };
    setCookiePreferences(allAccepted);
    localStorage.setItem('cookiePreferences', JSON.stringify(allAccepted));
    alert('Tous les cookies acceptés !');
  };

  const rejectOptional = () => {
    const essentialOnly = {
      essential: true,
      analytics: false,
      marketing: false,
      preferences: false
    };
    setCookiePreferences(essentialOnly);
    localStorage.setItem('cookiePreferences', JSON.stringify(essentialOnly));
    alert('Seuls les cookies essentiels sont activés !');
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
              <StarlinkoLogo size="md" showText={true} />
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="bg-white rounded-xl shadow-sm p-8">
          {/* Header */}
          <div className="text-center mb-8">
            <div className="w-16 h-16 bg-[#FBBC05]/10 rounded-full flex items-center justify-center mx-auto mb-4">
              <Cookie className="w-8 h-8 text-[#FBBC05]" />
            </div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">
              Politique des Cookies
            </h1>
            <p className="text-gray-600">
              Dernière mise à jour : 1er janvier 2024
            </p>
          </div>

          {/* Content */}
          <div className="prose prose-lg max-w-none">
            <div className="bg-[#FBBC05]/5 rounded-lg p-6 mb-8">
              <h2 className="text-xl font-semibold text-gray-900 mb-3 flex items-center">
                <Cookie className="w-5 h-5 mr-2 text-[#FBBC05]" />
                Qu'est-ce qu'un cookie ?
              </h2>
              <p className="text-gray-700">
                Les cookies sont de petits fichiers texte stockés sur votre appareil lorsque vous 
                visitez un site web. Ils nous aident à améliorer votre expérience et à fournir 
                nos services de manière optimale.
              </p>
            </div>

            <h2 className="text-2xl font-bold text-gray-900 mb-6">Types de cookies que nous utilisons</h2>

            {/* Cookie Categories */}
            <div className="space-y-6 mb-8">
              {/* Essential Cookies */}
              <div className="border border-gray-200 rounded-lg p-6">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center">
                    <Shield className="w-6 h-6 text-[#34A853] mr-3" />
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900">Cookies essentiels</h3>
                      <p className="text-sm text-gray-600">Nécessaires au fonctionnement du site</p>
                    </div>
                  </div>
                  <div className="flex items-center">
                    <span className="text-sm text-gray-500 mr-2">Toujours activé</span>
                    <div className="w-11 h-6 bg-[#34A853] rounded-full relative">
                      <div className="absolute right-[2px] top-[2px] bg-white w-5 h-5 rounded-full"></div>
                    </div>
                  </div>
                </div>
                <ul className="text-sm text-gray-600 space-y-1">
                  <li>• <strong>Session d'authentification</strong> : Maintient votre connexion</li>
                  <li>• <strong>Sécurité CSRF</strong> : Protection contre les attaques</li>
                  <li>• <strong>Préférences de langue</strong> : Mémorise votre langue</li>
                  <li>• <strong>Consentement cookies</strong> : Mémorise vos choix</li>
                </ul>
              </div>

              {/* Preferences Cookies */}
              <div className="border border-gray-200 rounded-lg p-6">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center">
                    <Settings className="w-6 h-6 text-[#4285F4] mr-3" />
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900">Cookies de préférences</h3>
                      <p className="text-sm text-gray-600">Mémorisent vos paramètres personnalisés</p>
                    </div>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      className="sr-only peer"
                      checked={cookiePreferences.preferences}
                      onChange={(e) => handlePreferenceChange('preferences', e.target.checked)}
                    />
                    <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#4285F4]"></div>
                  </label>
                </div>
                <ul className="text-sm text-gray-600 space-y-1">
                  <li>• <strong>Paramètres IA</strong> : Ton, longueur, signature des réponses</li>
                  <li>• <strong>Interface utilisateur</strong> : Thème, disposition, préférences d'affichage</li>
                  <li>• <strong>Établissements sélectionnés</strong> : Mémorise vos choix</li>
                </ul>
              </div>

              {/* Analytics Cookies */}
              <div className="border border-gray-200 rounded-lg p-6">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center">
                    <BarChart3 className="w-6 h-6 text-[#FBBC05] mr-3" />
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900">Cookies d'analyse</h3>
                      <p className="text-sm text-gray-600">Nous aident à améliorer notre service</p>
                    </div>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      className="sr-only peer"
                      checked={cookiePreferences.analytics}
                      onChange={(e) => handlePreferenceChange('analytics', e.target.checked)}
                    />
                    <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#4285F4]"></div>
                  </label>
                </div>
                <ul className="text-sm text-gray-600 space-y-1">
                  <li>• <strong>Utilisation anonyme</strong> : Pages visitées, fonctionnalités utilisées</li>
                  <li>• <strong>Performance</strong> : Temps de chargement, erreurs techniques</li>
                  <li>• <strong>Amélioration</strong> : Données agrégées pour optimiser l'expérience</li>
                </ul>
              </div>

              {/* Marketing Cookies */}
              <div className="border border-gray-200 rounded-lg p-6">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center">
                    <Eye className="w-6 h-6 text-[#EA4335] mr-3" />
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900">Cookies marketing</h3>
                      <p className="text-sm text-gray-600">Pour personnaliser votre expérience</p>
                    </div>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      className="sr-only peer"
                      checked={cookiePreferences.marketing}
                      onChange={(e) => handlePreferenceChange('marketing', e.target.checked)}
                    />
                    <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#4285F4]"></div>
                  </label>
                </div>
                <ul className="text-sm text-gray-600 space-y-1">
                  <li>• <strong>Recommandations</strong> : Suggestions de fonctionnalités personnalisées</li>
                  <li>• <strong>Communications</strong> : Emails ciblés selon vos intérêts</li>
                  <li>• <strong>Retargeting</strong> : Publicités pertinentes sur d'autres sites</li>
                </ul>
              </div>
            </div>

            <h2 className="text-2xl font-bold text-gray-900 mb-4">Gestion de vos préférences</h2>
            
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

            <h2 className="text-2xl font-bold text-gray-900 mb-4">Cookies tiers</h2>
            <div className="grid md:grid-cols-2 gap-6 mb-6">
              <div className="bg-gray-50 rounded-lg p-4">
                <h4 className="font-semibold text-gray-900 mb-2">Google OAuth</h4>
                <p className="text-sm text-gray-600 mb-2">
                  Cookies d'authentification Google pour la connexion sécurisée
                </p>
                <p className="text-xs text-gray-500">Durée : Session</p>
              </div>
              <div className="bg-gray-50 rounded-lg p-4">
                <h4 className="font-semibold text-gray-900 mb-2">Stripe</h4>
                <p className="text-sm text-gray-600 mb-2">
                  Cookies de paiement sécurisé pour la facturation
                </p>
                <p className="text-xs text-gray-500">Durée : Session</p>
              </div>
              <div className="bg-gray-50 rounded-lg p-4">
                <h4 className="font-semibold text-gray-900 mb-2">Supabase</h4>
                <p className="text-sm text-gray-600 mb-2">
                  Cookies de session pour l'authentification et la base de données
                </p>
                <p className="text-xs text-gray-500">Durée : 7 jours</p>
              </div>
              <div className="bg-gray-50 rounded-lg p-4">
                <h4 className="font-semibold text-gray-900 mb-2">DeepSeek AI</h4>
                <p className="text-sm text-gray-600 mb-2">
                  Aucun cookie, communication API uniquement
                </p>
                <p className="text-xs text-gray-500">Durée : N/A</p>
              </div>
            </div>

            <h2 className="text-2xl font-bold text-gray-900 mb-4">Contrôle des cookies</h2>
            <div className="bg-blue-50 border-l-4 border-blue-400 rounded-lg p-4 mb-6">
              <h3 className="font-semibold text-blue-900 mb-2">Options de contrôle</h3>
              <ul className="text-sm text-blue-800 space-y-1">
                <li>• <strong>Navigateur</strong> : Configurez les paramètres de cookies dans votre navigateur</li>
                <li>• <strong>Extensions</strong> : Utilisez des extensions de blocage de cookies</li>
                <li>• <strong>Mode privé</strong> : Naviguez en mode incognito/privé</li>
                <li>• <strong>Starlinko</strong> : Utilisez les paramètres ci-dessus pour personnaliser</li>
              </ul>
            </div>

            <h2 className="text-2xl font-bold text-gray-900 mb-4">Impact de la désactivation</h2>
            <div className="grid md:grid-cols-2 gap-6 mb-8">
              <div className="bg-green-50 rounded-lg p-4">
                <h4 className="font-semibold text-green-900 mb-2 flex items-center">
                  <Check className="w-4 h-4 mr-2" />
                  Fonctionnalités préservées
                </h4>
                <ul className="text-sm text-green-800 space-y-1">
                  <li>• Connexion et authentification</li>
                  <li>• Synchronisation des avis</li>
                  <li>• Génération de réponses IA</li>
                  <li>• Gestion des établissements</li>
                </ul>
              </div>
              <div className="bg-yellow-50 rounded-lg p-4">
                <h4 className="font-semibold text-yellow-900 mb-2 flex items-center">
                  <AlertTriangle className="w-4 h-4 mr-2" />
                  Fonctionnalités limitées
                </h4>
                <ul className="text-sm text-yellow-800 space-y-1">
                  <li>• Perte des préférences personnalisées</li>
                  <li>• Pas de recommandations personnalisées</li>
                  <li>• Analytics moins précises</li>
                  <li>• Expérience moins fluide</li>
                </ul>
              </div>
            </div>

            <h2 className="text-2xl font-bold text-gray-900 mb-4">Durée de conservation</h2>
            <div className="overflow-x-auto mb-6">
              <table className="w-full border border-gray-200 rounded-lg">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-4 py-3 text-left text-sm font-semibold text-gray-900">Type de cookie</th>
                    <th className="px-4 py-3 text-left text-sm font-semibold text-gray-900">Durée</th>
                    <th className="px-4 py-3 text-left text-sm font-semibold text-gray-900">Finalité</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  <tr>
                    <td className="px-4 py-3 text-sm text-gray-900">Session d'authentification</td>
                    <td className="px-4 py-3 text-sm text-gray-600">7 jours</td>
                    <td className="px-4 py-3 text-sm text-gray-600">Maintenir la connexion</td>
                  </tr>
                  <tr>
                    <td className="px-4 py-3 text-sm text-gray-900">Préférences IA</td>
                    <td className="px-4 py-3 text-sm text-gray-600">1 an</td>
                    <td className="px-4 py-3 text-sm text-gray-600">Paramètres personnalisés</td>
                  </tr>
                  <tr>
                    <td className="px-4 py-3 text-sm text-gray-900">Consentement cookies</td>
                    <td className="px-4 py-3 text-sm text-gray-600">1 an</td>
                    <td className="px-4 py-3 text-sm text-gray-600">Mémoriser vos choix</td>
                  </tr>
                  <tr>
                    <td className="px-4 py-3 text-sm text-gray-900">Analytics</td>
                    <td className="px-4 py-3 text-sm text-gray-600">2 ans</td>
                    <td className="px-4 py-3 text-sm text-gray-600">Amélioration du service</td>
                  </tr>
                </tbody>
              </table>
            </div>

            <h2 className="text-2xl font-bold text-gray-900 mb-4">Contact</h2>
            <div className="bg-gradient-to-r from-[#4285F4]/10 to-[#34A853]/10 rounded-lg p-6">
              <p className="text-gray-700 mb-4">
                Pour toute question concernant notre utilisation des cookies ou pour exercer vos droits :
              </p>
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
      </div>
    </div>
  );
};

export default CookiesPage;