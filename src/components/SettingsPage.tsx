import React, { useState, useEffect } from 'react';
import { User, CreditCard, Building2, Bell, Shield, LogOut, Check, Crown, Star, Zap, Gift, Users, Settings } from 'lucide-react';

interface SettingsPageProps {
  user: any;
  onLogout: () => void;
}

const SettingsPage: React.FC<SettingsPageProps> = ({ user, onLogout }) => {
  const [activeTab, setActiveTab] = useState('profile');
  const [selectedPlan, setSelectedPlan] = useState('starter');
  const [selectedStores, setSelectedStores] = useState<string[]>([]);
  const [isTrialActive, setIsTrialActive] = useState(true);
  const [trialDaysLeft, setTrialDaysLeft] = useState(14);
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
      subtitle: 'Découverte',
      price: '9,90€',
      period: '/mois',
      description: 'Parfait pour débuter',
      trial: '14 jours gratuits',
      trialBonus: '20 réponses IA incluses',
      features: [
        '1 établissement Google',
        '50 avis/réponses automatiques par mois',
        'Réponses IA basiques (GPT-4 mini)',
        'Alertes email sur nouveaux avis',
        'Tableau de bord basique'
      ],
      icon: <Star className="w-5 h-5" />,
      color: 'from-[#4285F4] to-[#34A853]',
      popular: false,
      payAsYouGo: '0,10€ par réponse supplémentaire'
    },
    {
      id: 'pro',
      name: 'Pro',
      subtitle: 'Visibilité',
      price: '29,90€',
      period: '/mois',
      description: 'Pour développer votre visibilité',
      trial: '14 jours gratuits',
      trialBonus: '100 réponses IA incluses',
      features: [
        'Jusqu\'à 3 établissements',
        '300 avis/réponses automatiques par mois',
        'Réponses IA premium (GPT-4.1)',
        'Notifications temps réel + dashboard complet',
        'Statistiques (note moyenne, tendances)',
        'Support email prioritaire'
      ],
      icon: <Crown className="w-5 h-5" />,
      color: 'from-[#FBBC05] to-[#EA4335]',
      popular: true,
      payAsYouGo: '0,10€ par réponse supplémentaire'
    },
    {
      id: 'business',
      name: 'Business',
      subtitle: 'Croissance',
      price: '79,90€',
      period: '/mois',
      description: 'Pour les entreprises en croissance',
      trial: '14 jours gratuits',
      trialBonus: '200 réponses IA incluses',
      features: [
        'Établissements illimités',
        '1 000 avis/réponses automatiques par mois',
        'Réponses IA premium + posts auto sur Google Business',
        'Rapports PDF mensuels',
        'Support prioritaire (chat + téléphone)',
        'API complète',
        'Intégrations avancées'
      ],
      icon: <Zap className="w-5 h-5" />,
      color: 'from-[#EA4335] to-[#4285F4]',
      popular: false,
      payAsYouGo: '0,10€ par réponse supplémentaire'
    }
  ];

  const tabs = [
    { id: 'profile', label: 'Profil', icon: User },
    { id: 'billing', label: 'Facturation', icon: CreditCard },
    { id: 'stores', label: 'Établissements', icon: Building2 },
    { id: 'notifications', label: 'Notifications', icon: Bell },
    { id: 'security', label: 'Sécurité', icon: Shield },
    { id: 'admin', label: 'Super Admin', icon: Settings }
  ];

  useEffect(() => {
    // Load saved data
    const savedPlan = localStorage.getItem('selectedPlan');
    const savedStores = localStorage.getItem('selectedStores');
    
    if (savedPlan) setSelectedPlan(savedPlan);
    if (savedStores) setSelectedStores(JSON.parse(savedStores));

    // Calculate trial days left (mock calculation)
    const trialStartDate = localStorage.getItem('trialStartDate');
    if (!trialStartDate) {
      localStorage.setItem('trialStartDate', new Date().toISOString());
    } else {
      const start = new Date(trialStartDate);
      const now = new Date();
      const diffTime = Math.abs(now.getTime() - start.getTime());
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
      const daysLeft = Math.max(0, 14 - diffDays);
      setTrialDaysLeft(daysLeft);
      setIsTrialActive(daysLeft > 0);
    }
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
                <div className="flex items-center mt-2 space-x-2">
                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-[#34A853]/10 text-[#34A853]">
                    Compte vérifié
                  </span>
                  {isTrialActive && (
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-[#FBBC05]/10 text-[#FBBC05]">
                      <Gift className="w-3 h-3 mr-1" />
                      Essai gratuit - {trialDaysLeft} jours restants
                    </span>
                  )}
                </div>
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

            {/* Trial Status */}
            {isTrialActive && (
              <div className="bg-gradient-to-r from-[#4285F4]/10 to-[#34A853]/10 rounded-lg p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="font-semibold text-gray-900 flex items-center">
                      <Gift className="w-5 h-5 mr-2 text-[#FBBC05]" />
                      Essai gratuit actif
                    </h4>
                    <p className="text-sm text-gray-600 mt-1">
                      Profitez de toutes les fonctionnalités gratuitement pendant encore {trialDaysLeft} jours
                    </p>
                  </div>
                  <div className="text-right">
                    <div className="text-2xl font-bold text-[#4285F4]">{trialDaysLeft}</div>
                    <div className="text-sm text-gray-500">jours restants</div>
                  </div>
                </div>
              </div>
            )}
          </div>
        );

      case 'billing':
        return (
          <div className="space-y-6">
            {/* Trial Status */}
            {isTrialActive && (
              <div className="bg-gradient-to-r from-[#FBBC05]/10 to-[#34A853]/10 rounded-lg p-4 mb-6">
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="font-semibold text-gray-900 flex items-center">
                      <Gift className="w-5 h-5 mr-2 text-[#FBBC05]" />
                      Période d'essai gratuit
                    </h4>
                    <p className="text-sm text-gray-600">
                      Votre facturation commencera dans {trialDaysLeft} jours
                    </p>
                  </div>
                  <button className="bg-[#4285F4] text-white px-4 py-2 rounded-lg hover:bg-[#3367D6] transition-colors">
                    Choisir un plan
                  </button>
                </div>
              </div>
            )}

            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Plans disponibles</h3>
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
                    
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center">
                        <div className={`p-2 rounded-lg bg-gradient-to-r ${plan.color} text-white mr-3`}>
                          {plan.icon}
                        </div>
                        <div>
                          <h4 className="font-semibold text-gray-900">{plan.name}</h4>
                          <p className="text-sm text-gray-600">"{plan.subtitle}"</p>
                        </div>
                      </div>
                      
                      <div className="text-right">
                        <div className="text-xl font-bold text-gray-900">{plan.price}</div>
                        <div className="text-sm text-gray-500">{plan.period}</div>
                      </div>
                    </div>

                    {/* Trial Badge */}
                    <div className="bg-gradient-to-r from-[#34A853] to-[#4285F4] text-white px-3 py-1 rounded-full text-xs font-medium mb-3 inline-block">
                      <Gift className="w-3 h-3 inline mr-1" />
                      {plan.trial} → {plan.trialBonus}
                    </div>

                    {/* Pay as you go */}
                    <div className="text-xs text-gray-500 bg-gray-50 rounded p-2 mb-3">
                      <strong>Pay-as-you-go:</strong> {plan.payAsYouGo}
                    </div>
                    
                    {selectedPlan === plan.id && (
                      <div className="flex items-center text-sm text-[#34A853]">
                        <Check className="w-4 h-4 mr-2" />
                        {isTrialActive ? 'Plan sélectionné (essai gratuit)' : 'Plan actuel'}
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

                <div className="flex items-center justify-between">
                  <div>
                    <div className="font-medium text-gray-900">Fin d'essai gratuit</div>
                    <div className="text-sm text-gray-500">Rappel avant la fin de votre période d'essai</div>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input type="checkbox" className="sr-only peer" defaultChecked />
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

      case 'admin':
        return (
          <div className="space-y-6">
            <div className="bg-gradient-to-r from-[#EA4335]/10 to-[#4285F4]/10 rounded-lg p-4 mb-6">
              <div className="flex items-center">
                <Shield className="w-6 h-6 text-[#EA4335] mr-3" />
                <div>
                  <h4 className="font-semibold text-gray-900">Panneau Super Admin</h4>
                  <p className="text-sm text-gray-600">Accès aux fonctionnalités d'administration avancées</p>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="bg-white border border-gray-200 rounded-lg p-4">
                <div className="flex items-center justify-between mb-3">
                  <h4 className="font-semibold text-gray-900">Utilisateurs totaux</h4>
                  <Users className="w-5 h-5 text-[#4285F4]" />
                </div>
                <div className="text-2xl font-bold text-gray-900">1,247</div>
                <div className="text-sm text-gray-500">+12% ce mois</div>
              </div>

              <div className="bg-white border border-gray-200 rounded-lg p-4">
                <div className="flex items-center justify-between mb-3">
                  <h4 className="font-semibold text-gray-900">Revenus mensuels</h4>
                  <CreditCard className="w-5 h-5 text-[#34A853]" />
                </div>
                <div className="text-2xl font-bold text-gray-900">€24,890</div>
                <div className="text-sm text-gray-500">+8% ce mois</div>
              </div>

              <div className="bg-white border border-gray-200 rounded-lg p-4">
                <div className="flex items-center justify-between mb-3">
                  <h4 className="font-semibold text-gray-900">Avis traités</h4>
                  <Star className="w-5 h-5 text-[#FBBC05]" />
                </div>
                <div className="text-2xl font-bold text-gray-900">45,123</div>
                <div className="text-sm text-gray-500">+25% ce mois</div>
              </div>

              <div className="bg-white border border-gray-200 rounded-lg p-4">
                <div className="flex items-center justify-between mb-3">
                  <h4 className="font-semibold text-gray-900">Établissements</h4>
                  <Building2 className="w-5 h-5 text-[#EA4335]" />
                </div>
                <div className="text-2xl font-bold text-gray-900">3,456</div>
                <div className="text-sm text-gray-500">+15% ce mois</div>
              </div>
            </div>

            <div className="space-y-4">
              <h4 className="font-semibold text-gray-900">Actions d'administration</h4>
              
              <button className="w-full flex items-center justify-between p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">
                <div className="flex items-center">
                  <Users className="w-5 h-5 text-[#4285F4] mr-3" />
                  <div className="text-left">
                    <div className="font-medium text-gray-900">Gérer les utilisateurs</div>
                    <div className="text-sm text-gray-500">Voir, modifier et supprimer des comptes utilisateurs</div>
                  </div>
                </div>
                <ChevronRight className="w-5 h-5 text-gray-400" />
              </button>

              <button className="w-full flex items-center justify-between p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">
                <div className="flex items-center">
                  <CreditCard className="w-5 h-5 text-[#34A853] mr-3" />
                  <div className="text-left">
                    <div className="font-medium text-gray-900">Gestion des abonnements</div>
                    <div className="text-sm text-gray-500">Modifier les plans et gérer la facturation</div>
                  </div>
                </div>
                <ChevronRight className="w-5 h-5 text-gray-400" />
              </button>

              <button className="w-full flex items-center justify-between p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">
                <div className="flex items-center">
                  <Settings className="w-5 h-5 text-[#FBBC05] mr-3" />
                  <div className="text-left">
                    <div className="font-medium text-gray-900">Configuration système</div>
                    <div className="text-sm text-gray-500">Paramètres globaux et configuration IA</div>
                  </div>
                </div>
                <ChevronRight className="w-5 h-5 text-gray-400" />
              </button>

              <button className="w-full flex items-center justify-between p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">
                <div className="flex items-center">
                  <Shield className="w-5 h-5 text-[#EA4335] mr-3" />
                  <div className="text-left">
                    <div className="font-medium text-gray-900">Logs et sécurité</div>
                    <div className="text-sm text-gray-500">Consulter les logs système et les alertes de sécurité</div>
                  </div>
                </div>
                <ChevronRight className="w-5 h-5 text-gray-400" />
              </button>
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  // Only show admin tab for specific users (you can add your logic here)
  const isAdmin = user?.email === 'admin@starlinko.com' || user?.email === 'oben.rockman@gmail.com';
  const filteredTabs = isAdmin ? tabs : tabs.filter(tab => tab.id !== 'admin');

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
                {filteredTabs.map((tab) => {
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
                      {tab.id === 'admin' && (
                        <span className="ml-auto bg-[#EA4335] text-white text-xs px-2 py-1 rounded-full">
                          Admin
                        </span>
                      )}
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