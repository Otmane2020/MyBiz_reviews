import React, { useState, useEffect } from 'react';
import { User, CreditCard, Building2, Bell, Shield, LogOut, Check, Crown, Star, Zap } from 'lucide-react';

interface SettingsPageProps {
  user: any;
  onLogout: () => void;
}

const SettingsPage: React.FC<SettingsPageProps> = ({ user, onLogout }) => {
  const [activeTab, setActiveTab] = useState('profile');
  const [selectedPlan, setSelectedPlan] = useState('starter');
  const [selectedStores, setSelectedStores] = useState<string[]>([]);
  const [billingInfo, setBillingInfo] = useState({
    companyName: '',
    address: '',
    city: '',
    postalCode: '',
    country: 'France',
    vatNumber: ''
  });

  const plans = [
    {
      id: 'starter',
      name: 'Starter',
      price: '29€',
      period: '/mois',
      description: 'Parfait pour débuter',
      features: [
        '1 établissement',
        '100 réponses IA/mois',
        'Notifications en temps réel',
        'Tableau de bord basique'
      ],
      icon: <Star className="w-5 h-5" />,
      color: 'from-[#4285F4] to-[#34A853]',
      popular: false
    },
    {
      id: 'professional',
      name: 'Professional',
      price: '79€',
      period: '/mois',
      description: 'Pour les entreprises en croissance',
      features: [
        '5 établissements',
        'Réponses IA illimitées',
        'Analytics avancés',
        'Support prioritaire',
        'Personnalisation des réponses'
      ],
      icon: <Crown className="w-5 h-5" />,
      color: 'from-[#FBBC05] to-[#EA4335]',
      popular: true
    },
    {
      id: 'enterprise',
      name: 'Enterprise',
      price: '199€',
      period: '/mois',
      description: 'Pour les grandes entreprises',
      features: [
        'Établissements illimités',
        'IA personnalisée',
        'API complète',
        'Support dédié',
        'Intégrations avancées',
        'Rapports personnalisés'
      ],
      icon: <Zap className="w-5 h-5" />,
      color: 'from-[#EA4335] to-[#4285F4]',
      popular: false
    }
  ];

  const tabs = [
    { id: 'profile', label: 'Profil', icon: User },
    { id: 'billing', label: 'Facturation', icon: CreditCard },
    { id: 'stores', label: 'Établissements', icon: Building2 },
    { id: 'notifications', label: 'Notifications', icon: Bell },
    { id: 'security', label: 'Sécurité', icon: Shield }
  ];

  useEffect(() => {
    // Load saved data
    const savedPlan = localStorage.getItem('selectedPlan');
    const savedStores = localStorage.getItem('selectedStores');
    
    if (savedPlan) setSelectedPlan(savedPlan);
    if (savedStores) setSelectedStores(JSON.parse(savedStores));
  }, []);

  const handlePlanChange = (planId: string) => {
    setSelectedPlan(planId);
    localStorage.setItem('selectedPlan', planId);
    // Here you would integrate with Stripe to change the subscription
  };

  const handleBillingInfoChange = (field: string, value: string) => {
    setBillingInfo(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const connectStripe = () => {
    // Redirect to Stripe setup
    window.open('https://bolt.new/setup/stripe', '_blank');
  };

  const renderTabContent = () => {
    switch (activeTab) {
      case 'profile':
        return (
          <div className="space-y-6">
            <div className="flex items-center space-x-4">
              <img
                src={user?.picture}
                alt={user?.name}
                className="w-20 h-20 rounded-full"
              />
              <div>
                <h3 className="text-xl font-semibold text-gray-900">{user?.name}</h3>
                <p className="text-gray-600">{user?.email}</p>
                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-[#34A853]/10 text-[#34A853] mt-2">
                  Compte vérifié
                </span>
              </div>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Nom complet
                </label>
                <input
                  type="text"
                  value={user?.name || ''}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#4285F4] focus:border-transparent"
                  readOnly
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Email
                </label>
                <input
                  type="email"
                  value={user?.email || ''}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#4285F4] focus:border-transparent"
                  readOnly
                />
              </div>
            </div>
          </div>
        );

      case 'billing':
        return (
          <div className="space-y-6">
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Plan actuel</h3>
              <div className="grid gap-4">
                {plans.map((plan) => (
                  <div
                    key={plan.id}
                    className={`relative border-2 rounded-xl p-4 cursor-pointer transition-all ${
                      selectedPlan === plan.id
                        ? 'border-[#4285F4] bg-[#4285F4]/5'
                        : 'border-gray-200 hover:border-gray-300'
                    } ${plan.popular ? 'ring-2 ring-[#FBBC05] ring-opacity-50' : ''}`}
                    onClick={() => handlePlanChange(plan.id)}
                  >
                    {plan.popular && (
                      <div className="absolute -top-3 left-4">
                        <span className="bg-[#FBBC05] text-white px-3 py-1 rounded-full text-xs font-medium">
                          Populaire
                        </span>
                      </div>
                    )}
                    
                    <div className="flex items-center justify-between">
                      <div className="flex items-center">
                        <div className={`p-2 rounded-lg bg-gradient-to-r ${plan.color} text-white mr-3`}>
                          {plan.icon}
                        </div>
                        <div>
                          <h4 className="font-semibold text-gray-900">{plan.name}</h4>
                          <p className="text-sm text-gray-600">{plan.description}</p>
                        </div>
                      </div>
                      
                      <div className="text-right">
                        <div className="text-xl font-bold text-gray-900">{plan.price}</div>
                        <div className="text-sm text-gray-500">{plan.period}</div>
                      </div>
                    </div>
                    
                    {selectedPlan === plan.id && (
                      <div className="mt-3 flex items-center text-sm text-[#34A853]">
                        <Check className="w-4 h-4 mr-2" />
                        Plan actuel
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>

            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Informations de facturation</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Nom de l'entreprise
                  </label>
                  <input
                    type="text"
                    value={billingInfo.companyName}
                    onChange={(e) => handleBillingInfoChange('companyName', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#4285F4] focus:border-transparent"
                    placeholder="Votre entreprise"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Numéro de TVA
                  </label>
                  <input
                    type="text"
                    value={billingInfo.vatNumber}
                    onChange={(e) => handleBillingInfoChange('vatNumber', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#4285F4] focus:border-transparent"
                    placeholder="FR12345678901"
                  />
                </div>
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Adresse
                  </label>
                  <input
                    type="text"
                    value={billingInfo.address}
                    onChange={(e) => handleBillingInfoChange('address', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#4285F4] focus:border-transparent"
                    placeholder="123 Rue de la Paix"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Ville
                  </label>
                  <input
                    type="text"
                    value={billingInfo.city}
                    onChange={(e) => handleBillingInfoChange('city', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#4285F4] focus:border-transparent"
                    placeholder="Paris"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Code postal
                  </label>
                  <input
                    type="text"
                    value={billingInfo.postalCode}
                    onChange={(e) => handleBillingInfoChange('postalCode', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#4285F4] focus:border-transparent"
                    placeholder="75001"
                  />
                </div>
              </div>
            </div>

            <div className="bg-[#4285F4]/10 rounded-lg p-4">
              <h4 className="font-semibold text-gray-900 mb-2">Configuration des paiements</h4>
              <p className="text-sm text-gray-600 mb-3">
                Connectez Stripe pour gérer vos paiements et abonnements de manière sécurisée.
              </p>
              <button
                onClick={connectStripe}
                className="bg-[#635BFF] text-white px-4 py-2 rounded-lg hover:bg-[#5A52E8] transition-colors font-medium"
              >
                Configurer Stripe
              </button>
            </div>
          </div>
        );

      case 'stores':
        return (
          <div className="space-y-6">
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-4">
                Établissements connectés ({selectedStores.length})
              </h3>
              {selectedStores.length === 0 ? (
                <div className="text-center py-8 bg-gray-50 rounded-lg">
                  <Building2 className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-600">Aucun établissement connecté</p>
                  <button className="mt-4 bg-[#4285F4] text-white px-4 py-2 rounded-lg hover:bg-[#3367D6] transition-colors">
                    Connecter un établissement
                  </button>
                </div>
              ) : (
                <div className="space-y-3">
                  {selectedStores.map((storeId, index) => (
                    <div key={storeId} className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
                      <div className="flex items-center">
                        <div className="w-10 h-10 bg-[#4285F4]/10 rounded-full flex items-center justify-center mr-3">
                          <Building2 className="w-5 h-5 text-[#4285F4]" />
                        </div>
                        <div>
                          <div className="font-medium text-gray-900">Établissement {index + 1}</div>
                          <div className="text-sm text-gray-500">ID: {storeId.split('/').pop()}</div>
                        </div>
                      </div>
                      <div className="flex items-center space-x-2">
                        <span className="bg-[#34A853]/10 text-[#34A853] px-2 py-1 rounded-full text-xs font-medium">
                          Connecté
                        </span>
                        <button className="text-gray-400 hover:text-gray-600">
                          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 5v.01M12 12v.01M12 19v.01M12 6a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2z" />
                          </svg>
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        );

      case 'notifications':
        return (
          <div className="space-y-6">
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Préférences de notification</h3>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <div className="font-medium text-gray-900">Nouveaux avis</div>
                    <div className="text-sm text-gray-500">Recevoir une notification pour chaque nouvel avis</div>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input type="checkbox" className="sr-only peer" defaultChecked />
                    <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-[#4285F4]/20 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#4285F4]"></div>
                  </label>
                </div>
                
                <div className="flex items-center justify-between">
                  <div>
                    <div className="font-medium text-gray-900">Réponses automatiques</div>
                    <div className="text-sm text-gray-500">Notification quand l'IA répond automatiquement</div>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input type="checkbox" className="sr-only peer" defaultChecked />
                    <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-[#4285F4]/20 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#4285F4]"></div>
                  </label>
                </div>
                
                <div className="flex items-center justify-between">
                  <div>
                    <div className="font-medium text-gray-900">Rapports hebdomadaires</div>
                    <div className="text-sm text-gray-500">Résumé hebdomadaire de vos avis et performances</div>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input type="checkbox" className="sr-only peer" />
                    <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-[#4285F4]/20 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#4285F4]"></div>
                  </label>
                </div>
              </div>
            </div>
          </div>
        );

      case 'security':
        return (
          <div className="space-y-6">
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Sécurité du compte</h3>
              <div className="space-y-4">
                <div className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
                  <div>
                    <div className="font-medium text-gray-900">Authentification Google</div>
                    <div className="text-sm text-gray-500">Connecté via Google OAuth</div>
                  </div>
                  <span className="bg-[#34A853]/10 text-[#34A853] px-3 py-1 rounded-full text-sm font-medium">
                    Actif
                  </span>
                </div>
                
                <div className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
                  <div>
                    <div className="font-medium text-gray-900">Sessions actives</div>
                    <div className="text-sm text-gray-500">1 session active</div>
                  </div>
                  <button className="text-[#4285F4] hover:underline text-sm font-medium">
                    Gérer
                  </button>
                </div>
              </div>
            </div>
            
            <div className="border-t border-gray-200 pt-6">
              <button
                onClick={onLogout}
                className="flex items-center text-[#EA4335] hover:bg-[#EA4335]/10 px-4 py-2 rounded-lg transition-colors"
              >
                <LogOut className="w-5 h-5 mr-2" />
                Déconnexion
              </button>
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-[#F1F3F4] pt-20">
      <div className="max-w-6xl mx-auto p-4">
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Paramètres</h1>
          <p className="text-gray-600">Gérez votre compte et vos préférences</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Sidebar */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-xl shadow-sm p-4">
              <nav className="space-y-1">
                {tabs.map((tab) => {
                  const Icon = tab.icon;
                  return (
                    <button
                      key={tab.id}
                      onClick={() => setActiveTab(tab.id)}
                      className={`w-full flex items-center px-3 py-2 text-left rounded-lg transition-colors ${
                        activeTab === tab.id
                          ? 'bg-[#4285F4]/10 text-[#4285F4]'
                          : 'text-gray-700 hover:bg-gray-50'
                      }`}
                    >
                      <Icon className={`w-5 h-5 mr-3 ${
                        activeTab === tab.id ? 'text-[#4285F4]' : 'text-gray-500'
                      }`} />
                      {tab.label}
                    </button>
                  );
                })}
              </nav>
            </div>
          </div>

          {/* Content */}
          <div className="lg:col-span-3">
            <div className="bg-white rounded-xl shadow-sm p-6">
              {renderTabContent()}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SettingsPage;