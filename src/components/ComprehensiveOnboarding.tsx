import React, { useState, useEffect } from 'react';
import { ChevronRight, ChevronLeft, Star, MessageSquare, Smartphone, Check, Building2, Users, TrendingUp, MapPin, CreditCard, Crown, Zap, Gift, Shield } from 'lucide-react';
import { useStripe } from '../hooks/useStripe';
import { supabase } from '../lib/supabase';

interface GoogleAccount {
  name: string;
  type: string;
  role: string;
}

interface GoogleLocation {
  name: string;
  locationName: string;
  primaryCategory: {
    displayName: string;
  };
  address?: {
    addressLines: string[];
    locality: string;
    administrativeArea: string;
  };
}

interface ComprehensiveOnboardingProps {
  user: any;
  accessToken?: string;
  onComplete: (selectedStores: string[], selectedPlan: string) => void;
}

const ComprehensiveOnboarding: React.FC<ComprehensiveOnboardingProps> = ({ 
  user, 
  accessToken: initialAccessToken,
  onComplete 
}) => {
  const [currentStep, setCurrentStep] = useState(0);
  const [accessToken, setAccessToken] = useState<string>(initialAccessToken || '');
  const [accounts, setAccounts] = useState<GoogleAccount[]>([]);
  const [locations, setLocations] = useState<GoogleLocation[]>([]);
  const [selectedStores, setSelectedStores] = useState<string[]>([]);
  const [selectedPlan, setSelectedPlan] = useState<string>('starter');
  const [billingCycle, setBillingCycle] = useState<'monthly' | 'annual'>('monthly');
  const [loading, setLoading] = useState(false);
  const [gmbConnected, setGmbConnected] = useState(!!initialAccessToken);
  const [autoLoadingGMB, setAutoLoadingGMB] = useState(false);
  
  const { products, loading: stripeLoading, redirectToCheckout } = useStripe();

  // Save selected locations to database
  const saveLocationsToDatabase = async () => {
    if (!user?.id || selectedStores.length === 0) return;

    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) return;

      // Get the first account ID from the accounts list
      const accountId = accounts[0]?.name || '';

      // Save Google account if not already saved
      if (accessToken && accountId) {
        const { error: accountError } = await supabase
          .from('google_accounts')
          .upsert({
            user_id: user.id,
            account_id: accountId,
            account_name: accounts[0]?.type || 'Google Account',
            access_token: accessToken,
            token_expires_at: new Date(Date.now() + 3600000).toISOString(),
            scopes: ['https://www.googleapis.com/auth/business.manage']
          }, {
            onConflict: 'user_id,account_id'
          });

        if (accountError) {
          console.error('Error saving Google account:', accountError);
        }
      }

      // Get google_account_id for locations
      const { data: googleAccounts } = await supabase
        .from('google_accounts')
        .select('id')
        .eq('user_id', user.id)
        .eq('account_id', accountId)
        .maybeSingle();

      const googleAccountId = googleAccounts?.id;

      // Save all selected locations
      for (const locationName of selectedStores) {
        const location = locations.find(l => l.name === locationName);
        if (!location) continue;

        await supabase
          .from('locations')
          .upsert({
            user_id: user.id,
            google_account_id: googleAccountId,
            location_id: location.name,
            location_name: location.locationName,
            address: location.address ?
              `${location.address.locality}, ${location.address.administrativeArea}` : '',
            category: location.primaryCategory?.displayName || '',
            is_active: true,
            last_synced_at: new Date().toISOString()
          }, {
            onConflict: 'user_id,location_id'
          });
      }
    } catch (error) {
      console.error('Error saving locations to database:', error);
    }
  };

  const plans = [
    {
      id: 'starter',
      name: 'Starter',
      subtitle: 'Découverte',
      price: '9,90€',
      annualPrice: '95,04€',
      annualSavings: '20%',
      period: '/mois',
      annualPeriod: '/an',
      originalPrice: null,
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
      icon: <Star className="w-6 h-6" />,
      color: 'from-[#4285F4] to-[#34A853]',
      popular: false,
      payAsYouGo: '0,10€ par réponse supplémentaire'
    },
    {
      id: 'pro',
      name: 'Pro',
      subtitle: 'Visibilité',
      price: '29,90€',
      annualPrice: '287,04€',
      annualSavings: '20%',
      period: '/mois',
      annualPeriod: '/an',
      originalPrice: null,
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
      icon: <Crown className="w-6 h-6" />,
      color: 'from-[#FBBC05] to-[#EA4335]',
      popular: true,
      payAsYouGo: '0,10€ par réponse supplémentaire'
    },
    {
      id: 'business',
      name: 'Business',
      subtitle: 'Croissance',
      price: '79,90€',
      annualPrice: '767,04€',
      annualSavings: '20%',
      period: '/mois',
      annualPeriod: '/an',
      originalPrice: null,
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
      icon: <Zap className="w-6 h-6" />,
      color: 'from-[#EA4335] to-[#4285F4]',
      popular: false,
      payAsYouGo: '0,10€ par réponse supplémentaire'
    }
  ];

  const steps = [
    {
      icon: <Gift className="w-16 h-16 text-[#FBBC05]" />,
      title: "Bienvenue !",
      description: "Félicitations ! Vous venez de rejoindre Starlinko, la plateforme qui va révolutionner la gestion de vos avis Google My Business. Commencez avec 14 jours d'essai gratuit !",
      color: "from-[#4285F4] to-[#34A853]",
      type: 'welcome'
    },
    {
      icon: <Building2 className="w-16 h-16 text-[#4285F4]" />,
      title: "Connectez Google My Business",
      description: gmbConnected 
        ? "Votre compte Google My Business est connecté ! Sélectionnez les établissements à gérer."
        : "Connectez votre compte Google My Business pour commencer à gérer vos avis automatiquement.",
      color: "from-[#34A853] to-[#FBBC05]",
      type: 'gmb-connection'
    },
    {
      icon: <CreditCard className="w-16 h-16 text-[#34A853]" />,
      title: "Choisissez votre plan",
      description: "Sélectionnez le plan qui correspond le mieux à vos besoins. Tous les plans incluent 14 jours d'essai gratuit avec réponses IA incluses !",
      color: "from-[#FBBC05] to-[#EA4335]",
      type: 'plan-selection'
    },
    {
      icon: <Check className="w-16 h-16 text-[#FBBC05]" />,
      title: "Tout est prêt !",
      description: "Votre compte est configuré et prêt à l'emploi. Commencez dès maintenant votre essai gratuit de 14 jours et améliorez votre réputation en ligne !",
      color: "from-[#FBBC05] to-[#EA4335]",
      type: 'complete'
    }
  ];

  const handleSubscribe = async (planId: string, billingCycle: 'monthly' | 'annual') => {
    if (!user?.id || !user?.email) {
      alert('Informations utilisateur manquantes');
      return;
    }

    try {
      // Save selected locations to database
      await saveLocationsToDatabase();

      // Find the corresponding Stripe product and price
      const stripeProduct = products.find(p => p.id === `starlinko_${planId}`);
      if (!stripeProduct) {
        console.warn('Stripe products not loaded, proceeding with onboarding');
        onComplete(selectedStores, selectedPlan);
        return;
      }

      const price = stripeProduct.prices.find(p =>
        p.metadata.billing_cycle === billingCycle
      );

      if (!price) {
        console.warn('Price not found, proceeding with onboarding');
        onComplete(selectedStores, selectedPlan);
        return;
      }

      // Redirect to Stripe Checkout
      await redirectToCheckout(
        price.id,
        user.id,
        user.email,
        planId,
        billingCycle
      );
    } catch (error) {
      console.error('Error subscribing:', error);
      onComplete(selectedStores, selectedPlan);
    }
  };

  // Auto-load GMB accounts and locations when user is already connected
  useEffect(() => {
    const autoLoadGMBData = async () => {
      // Only auto-load if:
      // 1. User is connected to GMB (has access token)
      // 2. We haven't loaded accounts yet
      // 3. We're not already loading
      // 4. We're on the GMB connection step
      if (gmbConnected && accessToken && accounts.length === 0 && !loading && !autoLoadingGMB && steps[currentStep]?.type === 'gmb-connection') {
        console.log('🔄 Auto-loading GMB accounts and locations...');
        setAutoLoadingGMB(true);
        try {
          await fetchAccounts();
        } catch (error) {
          console.error('Error auto-loading GMB data:', error);
        } finally {
          setAutoLoadingGMB(false);
        }
      }
    };

    autoLoadGMBData();
  }, [gmbConnected, accessToken, accounts.length, loading, currentStep]);

  const connectGoogleMyBusiness = async () => {
    // Check if user is already authenticated with Google via Supabase
    const { data: { session } } = await supabase.auth.getSession();
    
    if (session && session.provider_token) {
      console.log('🔑 Found provider token, setting up GMB connection');
      setAccessToken(session.provider_token);
      setGmbConnected(true);
      console.log('📞 Calling fetchAccounts...');
      await fetchAccounts();
    } else {
      // User needs to authenticate with Google
      alert('Veuillez d\'abord vous connecter avec Google depuis la page de connexion.');
    }
  };

  const fetchAccounts = async () => {
    console.log('🚀 fetchAccounts called with accessToken:', accessToken ? 'Present' : 'Missing');
    if (!accessToken) return;

    setLoading(true);
    try {
      console.log('📡 Making request to google-oauth function...');
      const response = await fetch(`${import.meta.env.VITE_SUPABASE_URL}/functions/v1/google-oauth`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${import.meta.env.VITE_SUPABASE_ANON_KEY}`,
        },
        body: JSON.stringify({
          action: 'get-accounts',
          accessToken: accessToken,
        }),
      });
      console.log('📡 Response status:', response.status);
      const data = await response.json();
      console.log('DEBUG: Data from Google Accounts API:', data);
      
      if (data.accounts && data.accounts.length > 0) {
        console.log('✅ Found', data.accounts.length, 'accounts');
        setAccounts(data.accounts);
        // Fetch locations for the first account
        console.log('📞 Calling fetchLocations for first account...');
        await fetchLocations(data.accounts[0].name);
      } else {
        console.error('❌ Aucun compte trouvé dans onboarding:', data);
        if (data.error) {
          console.error('🚨 Erreur API onboarding:', data.error);
          alert(`Erreur API Google: ${data.error.message || data.error.code || 'Erreur inconnue'}`);
        } else {
          alert('Aucun compte Google My Business trouvé. Assurez-vous d\'avoir créé un profil d\'entreprise Google.');
        }
      }
    } catch (error) {
      console.error('Erreur lors de la récupération des comptes:', error);
      alert(`Erreur lors de la récupération des comptes: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  const fetchLocations = async (accountId: string) => {
    console.log('🏢 fetchLocations called with accountId:', accountId);
    try {
      console.log('📡 Making request to get locations...');
      const response = await fetch(`${import.meta.env.VITE_SUPABASE_URL}/functions/v1/google-oauth`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${import.meta.env.VITE_SUPABASE_ANON_KEY}`,
        },
        body: JSON.stringify({
          action: 'get-locations',
          accessToken: accessToken,
          accountId: accountId,
        }),
      });
      console.log('📡 Locations response status:', response.status);
      const data = await response.json();
      console.log('DEBUG: Data from Google Locations API:', data);
      
      if (data.locations && data.locations.length > 0) {
        console.log('✅ Found', data.locations.length, 'locations');
        setLocations(data.locations);
      } else {
        console.error('❌ Aucun établissement trouvé dans onboarding:', data);
        if (data.error) {
          console.error('🚨 Erreur API établissements onboarding:', data.error);
          alert(`Erreur lors de la récupération des établissements: ${data.error.message || data.error.code || 'Erreur inconnue'}`);
        } else {
          alert('Aucun établissement trouvé. Assurez-vous d\'avoir créé au moins un établissement dans votre profil Google My Business.');
        }
      }
    } catch (error) {
      console.error('Erreur lors de la récupération des établissements:', error);
      alert(`Erreur lors de la récupération des établissements: ${error.message}`);
    }
  };

  const toggleStoreSelection = (locationId: string) => {
    setSelectedStores(prev => 
      prev.includes(locationId)
        ? prev.filter(id => id !== locationId)
        : [...prev, locationId]
    );
  };

  const nextStep = () => {
    if (currentStep < steps.length - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      // If user selected a plan, redirect to Stripe checkout
      if (selectedPlan && user?.id && user?.email) {
        handleSubscribe(selectedPlan, billingCycle);
      } else {
        onComplete(selectedStores, selectedPlan);
      }
    }
  };

  const prevStep = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  const goToStep = (step: number) => {
    setCurrentStep(step);
  };

  const canProceed = () => {
    const currentStepData = steps[currentStep];
    
    if (currentStepData.type === 'gmb-connection') {
      return gmbConnected && selectedStores.length > 0;
    }
    
    if (currentStepData.type === 'plan-selection') {
      return selectedPlan !== '';
    }
    
    return true;
  };

  const renderStepContent = () => {
    const currentStepData = steps[currentStep];

    if (currentStepData.type === 'gmb-connection') {
      return (
        <div className="space-y-6">
          {!gmbConnected ? (
            <button
              onClick={connectGoogleMyBusiness}
              disabled={loading}
              className="w-full flex items-center justify-center px-6 py-4 bg-[#4285F4] text-white rounded-lg hover:bg-[#3367D6] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#4285F4] disabled:opacity-50 transition-colors duration-200 font-medium"
            >
              <svg className="w-5 h-5 mr-3" viewBox="0 0 24 24">
                <path fill="currentColor" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                <path fill="currentColor" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                <path fill="currentColor" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                <path fill="currentColor" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
              </svg>
              {loading ? 'Connexion...' : 'Connecter Google My Business'}
            </button>
          ) : (
            <div className="space-y-4">
              <div className="bg-[#34A853]/10 rounded-lg p-4 text-center">
                <Check className="w-8 h-8 text-[#34A853] mx-auto mb-2" />
                <p className="text-[#34A853] font-medium">Google My Business connecté !</p>
              </div>
              
              {(loading || autoLoadingGMB) && accounts.length === 0 && (
                <div className="text-center py-4">
                  <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-[#4285F4] mx-auto mb-2"></div>
                  <p className="text-sm text-gray-500">Chargement de vos établissements...</p>
                </div>
              )}
              
              {locations.length > 0 && (
                <div>
                  <h3 className="font-semibold text-gray-900 mb-3">
                    Sélectionnez vos établissements ({selectedStores.length} sélectionné{selectedStores.length > 1 ? 's' : ''})
                  </h3>
                  <div className="space-y-2 max-h-48 overflow-y-auto">
                    {locations.map((location) => (
                      <label
                        key={location.name}
                        className="flex items-center p-3 border border-gray-200 rounded-lg hover:border-[#4285F4] hover:bg-[#4285F4]/5 transition-colors cursor-pointer"
                      >
                        <input
                          type="checkbox"
                          checked={selectedStores.includes(location.name)}
                          onChange={() => toggleStoreSelection(location.name)}
                          className="mr-3 h-4 w-4 text-[#4285F4] focus:ring-[#4285F4] border-gray-300 rounded"
                        />
                        <div className="flex-1">
                          <div className="font-medium text-gray-900 text-sm">
                            {location.locationName}
                          </div>
                          <div className="text-xs text-gray-500">
                            {location.primaryCategory?.displayName}
                          </div>
                          {location.address && (
                            <div className="text-xs text-gray-400">
                              {location.address.locality}, {location.address.administrativeArea}
                            </div>
                          )}
                        </div>
                      </label>
                    ))}
                  </div>
                </div>
              )}
              
              {!loading && !autoLoadingGMB && accounts.length === 0 && gmbConnected && (
                <div className="text-center py-4">
                  <p className="text-gray-600 mb-4">Aucun compte Google My Business trouvé.</p>
                  <button
                    onClick={fetchAccounts}
                    className="text-[#4285F4] hover:underline text-sm"
                  >
                    Réessayer le chargement
                  </button>
                </div>
              )}
              
              {!loading && !autoLoadingGMB && accounts.length > 0 && locations.length === 0 && (
                <div className="text-center py-4">
                  <p className="text-gray-600 mb-4">Aucun établissement trouvé dans vos comptes Google My Business.</p>
                  <p className="text-sm text-gray-500">
                    Assurez-vous d'avoir créé au moins un établissement dans votre profil Google My Business.
                  </p>
                </div>
              )}
            </div>
          )}
        </div>
      );
    }

    if (currentStepData.type === 'plan-selection') {
      return (
        <div className="space-y-4">
          {/* Billing Cycle Toggle */}
          <div className="flex items-center justify-center mb-6">
            <div className="bg-gray-100 rounded-lg p-1 flex">
              <button
                onClick={() => setBillingCycle('monthly')}
                className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                  billingCycle === 'monthly'
                    ? 'bg-white text-gray-900 shadow-sm'
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                Mensuel
              </button>
              <button
                onClick={() => setBillingCycle('annual')}
                className={`px-4 py-2 rounded-md text-sm font-medium transition-colors relative ${
                  billingCycle === 'annual'
                    ? 'bg-white text-gray-900 shadow-sm'
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                Annuel
                <span className="absolute -top-2 -right-2 bg-[#34A853] text-white text-xs px-1.5 py-0.5 rounded-full">
                  -20%
                </span>
              </button>
            </div>
          </div>
          
          {plans.map((plan) => (
            <div
              key={plan.id}
              className={`relative border-2 rounded-xl p-4 cursor-pointer transition-all ${
                selectedPlan === plan.id
                  ? 'border-[#4285F4] bg-[#4285F4]/5'
                  : 'border-gray-200 hover:border-gray-300'
              } ${plan.popular ? 'ring-2 ring-[#FBBC05] ring-opacity-50' : ''}`}
              onClick={() => setSelectedPlan(plan.id)}
            >
              {plan.popular && (
                <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
                  <span className="bg-[#FBBC05] text-white px-3 py-1 rounded-full text-xs font-medium">
                    Populaire
                  </span>
                </div>
              )}
              
              <div className="flex items-start justify-between mb-3">
                <div className="flex items-center">
                  <div className={`p-2 rounded-lg bg-gradient-to-r ${plan.color} text-white mr-3`}>
                    {plan.icon}
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900">{plan.name}</h3>
                    <p className="text-sm text-gray-600">"{plan.subtitle}"</p>
                  </div>
                </div>
                
                <div className="text-right">
                  <div className="text-xl font-bold text-gray-900">
                    {billingCycle === 'monthly' ? plan.price : plan.annualPrice}
                  </div>
                  <div className="text-sm text-gray-500">
                    {billingCycle === 'monthly' ? plan.period : plan.annualPeriod}
                  </div>
                  {billingCycle === 'annual' && (
                    <div className="text-xs text-[#34A853] font-medium">
                      Économie de {plan.annualSavings}
                    </div>
                  )}
                </div>
              </div>

              {/* Trial Badge */}
              <div className="bg-gradient-to-r from-[#34A853] to-[#4285F4] text-white px-3 py-1 rounded-full text-xs font-medium mb-3 inline-block">
                <Gift className="w-3 h-3 inline mr-1" />
                {plan.trial} → {plan.trialBonus}
              </div>
              
              <ul className="space-y-1 mb-3">
                {plan.features.map((feature, index) => (
                  <li key={index} className="flex items-center text-sm text-gray-600">
                    <Check className="w-4 h-4 text-[#34A853] mr-2 flex-shrink-0" />
                    {feature}
                  </li>
                ))}
              </ul>

              {/* Pay as you go */}
              <div className="text-xs text-gray-500 bg-gray-50 rounded p-2">
                <strong>Pay-as-you-go:</strong> {plan.payAsYouGo}
              </div>
              
              <div className="mt-3 flex items-center justify-center">
                <div className={`w-4 h-4 rounded-full border-2 ${
                  selectedPlan === plan.id
                    ? 'border-[#4285F4] bg-[#4285F4]'
                    : 'border-gray-300'
                }`}>
                  {selectedPlan === plan.id && (
                    <div className="w-full h-full rounded-full bg-white scale-50"></div>
                  )}
                </div>
              </div>
            </div>
          ))}
          
          {stripeLoading && (
            <div className="text-center py-4">
              <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-[#4285F4] mx-auto"></div>
              <p className="text-sm text-gray-500 mt-2">Chargement des plans...</p>
            </div>
          )}
        </div>
      );
    }

    return null;
  };

  return (
    <div className={`min-h-screen bg-gradient-to-br ${steps[currentStep].color} flex items-center justify-center p-4`}>
      <div className="max-w-lg w-full">
        {/* Progress indicators */}
        <div className="flex justify-center mb-8 overflow-x-auto">
          <div className="flex items-center space-x-2 px-4">
            {steps.map((_, index) => (
              <button
                key={index}
                onClick={() => goToStep(index)}
                className={`w-2.5 h-2.5 rounded-full transition-all flex-shrink-0 ${
                  index === currentStep 
                    ? 'bg-white scale-125' 
                    : index < currentStep 
                      ? 'bg-white/70' 
                      : 'bg-white/30'
                }`}
              />
            ))}
          </div>
        </div>

        {/* Content */}
        <div className="bg-white rounded-3xl p-8 text-center shadow-2xl">
          <div className="flex justify-center mb-6">
            {steps[currentStep].icon}
          </div>
          
          <h2 className="text-2xl font-bold text-gray-900 mb-4">
            {steps[currentStep].title}
          </h2>
          
          <p className="text-gray-600 mb-8 leading-relaxed">
            {steps[currentStep].description}
          </p>

          {/* User info for first step */}
          {currentStep === 0 && user && (
            <div className="bg-gradient-to-r from-[#4285F4]/10 to-[#34A853]/10 rounded-xl p-4 mb-6">
              <div className="flex items-center justify-center mb-3">
                <img
                  src={user.picture}
                  alt={user.name}
                  className="w-12 h-12 rounded-full mr-3"
                />
                <div className="text-left">
                  <div className="font-medium text-gray-900">{user.name}</div>
                  <div className="text-sm text-gray-500">{user.email}</div>
                </div>
              </div>
              <div className="bg-[#34A853] text-white px-4 py-2 rounded-full text-sm font-medium inline-flex items-center">
                <Gift className="w-4 h-4 mr-2" />
                14 jours d'essai gratuit inclus !
              </div>
            </div>
          )}

          {/* Step-specific content */}
          {renderStepContent()}

          {/* Features highlight for feature steps */}
          {steps[currentStep].type === 'feature' && (
            <div className="bg-gradient-to-r from-[#4285F4]/10 to-[#34A853]/10 rounded-xl p-4 mb-6">
              <div className="flex items-center justify-center text-sm text-gray-600">
                <Shield className="w-4 h-4 text-[#34A853] mr-2" />
                Testez gratuitement pendant 14 jours
              </div>
            </div>
          )}

          {/* Navigation */}
          <div className="flex justify-between items-center">
            <button
              onClick={prevStep}
              disabled={currentStep === 0}
              className={`flex items-center px-4 py-2 rounded-full transition-all ${
                currentStep === 0
                  ? 'text-gray-400 cursor-not-allowed'
                  : 'text-gray-600 hover:bg-gray-100'
              }`}
            >
              <ChevronLeft className="w-5 h-5 mr-1" />
              Précédent
            </button>

            <span className="text-sm text-gray-500">
              {currentStep + 1} / {steps.length}
            </span>

            <button
              onClick={nextStep}
              disabled={!canProceed()}
              className="flex items-center px-6 py-3 bg-[#4285F4] text-white rounded-full hover:bg-[#3367D6] transition-all transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
            >
              {currentStep === steps.length - 1 ? 
                (stripeLoading ? 'Chargement...' : 'Commencer l\'essai') : 
                'Suivant'
              }
              <ChevronRight className="w-5 h-5 ml-1" />
            </button>
          </div>
        </div>

        {/* Skip option */}
        {currentStep < steps.length - 1 && (
          <div className="text-center mt-6">
            <button
              onClick={() => onComplete(selectedStores, selectedPlan)}
              className="text-white/80 hover:text-white transition-colors text-sm underline"
            >
              Passer l'introduction
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default ComprehensiveOnboarding;