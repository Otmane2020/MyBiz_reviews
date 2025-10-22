import React, { useState, useEffect, useCallback } from 'react';
import { 
  ChevronRight, 
  ChevronLeft, 
  Star, 
  MessageSquare, 
  Smartphone, 
  Check, 
  Building2, 
  Users, 
  TrendingUp, 
  MapPin, 
  CreditCard, 
  Crown, 
  Zap, 
  Gift, 
  Shield, 
  Search, 
  Loader2,
  AlertCircle,
  ExternalLink,
  Calendar,
  BadgeCheck,
  Sparkles
} from 'lucide-react';
import { useStripe } from '../hooks/useStripe';
import { supabase } from '../lib/supabase';
import BusinessSearch from './BusinessSearch';

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
  onSkip?: () => void;
}

const ComprehensiveOnboarding: React.FC<ComprehensiveOnboardingProps> = ({ 
  user, 
  accessToken: initialAccessToken,
  onComplete,
  onSkip 
}) => {
  const [currentStep, setCurrentStep] = useState(0);
  const [accessToken, setAccessToken] = useState<string>(initialAccessToken || '');
  const [accounts, setAccounts] = useState<GoogleAccount[]>([]);
  const [locations, setLocations] = useState<GoogleLocation[]>([]);
  const [selectedStores, setSelectedStores] = useState<string[]>([]);
  const [selectedPlan, setSelectedPlan] = useState<string>('starter');
  const [billingCycle, setBillingCycle] = useState<'monthly' | 'annual'>('monthly');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [gmbConnected, setGmbConnected] = useState(!!initialAccessToken);
  const [autoLoadingGMB, setAutoLoadingGMB] = useState(false);
  const [businessName, setBusinessName] = useState('');
  const [businessAddress, setBusinessAddress] = useState('');
  const [searchedLocations, setSearchedLocations] = useState<any[]>([]);
  const [searchingDataForSEO, setSearchingDataForSEO] = useState(false);
  const [selectedDataForSEOLocation, setSelectedDataForSEOLocation] = useState<any>(null);
  const [savingLocation, setSavingLocation] = useState(false);
  
  const { products, loading: stripeLoading, redirectToCheckout, fetchProducts } = useStripe();

  // Load Stripe products on mount
  useEffect(() => {
    fetchProducts().catch(err => {
      console.error('Error loading Stripe products:', err);
    });
  }, []);

  // Clear messages after timeout
  useEffect(() => {
    if (error) {
      const timer = setTimeout(() => setError(null), 5000);
      return () => clearTimeout(timer);
    }
  }, [error]);

  useEffect(() => {
    if (success) {
      const timer = setTimeout(() => setSuccess(null), 5000);
      return () => clearTimeout(timer);
    }
  }, [success]);

  // Save selected location to database
  const saveLocationToDatabase = useCallback(async (location: any) => {
    if (!user?.id) {
      throw new Error('Utilisateur non connecté');
    }

    setSavingLocation(true);
    try {
      const { data: locationData, error: locationError } = await supabase
        .from('locations')
        .upsert({
          user_id: user.id,
          location_id: location.place_id,
          location_name: location.name,
          address: location.formatted_address,
          rating: location.rating,
          total_reviews: location.user_ratings_total,
          is_active: true,
          last_synced_at: new Date().toISOString(),
          source: 'google_places'
        }, {
          onConflict: 'user_id,location_id'
        });

      if (locationError) {
        console.error('Error saving location:', locationError);
        throw new Error('Erreur lors de la sauvegarde de l\'établissement');
      }

      return locationData;
    } finally {
      setSavingLocation(false);
    }
  }, [user?.id]);

  // Save Google OAuth locations to database
  const saveGoogleLocationsToDatabase = useCallback(async () => {
    if (!user?.id || selectedStores.length === 0) return;

    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) throw new Error('Session non valide');

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
      const savePromises = selectedStores.map(async (locationName) => {
        const location = locations.find(l => l.name === locationName);
        if (!location) return;

        return supabase
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
            last_synced_at: new Date().toISOString(),
            source: 'google_my_business'
          }, {
            onConflict: 'user_id,location_id'
          });
      });

      await Promise.all(savePromises);
      setSuccess('Établissements sauvegardés avec succès !');
    } catch (error) {
      console.error('Error saving locations to database:', error);
      setError('Erreur lors de la sauvegarde des établissements');
      throw error;
    }
  }, [user?.id, selectedStores, accounts, accessToken, locations]);

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
      color: 'from-blue-500 to-green-500',
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
      color: 'from-yellow-500 to-red-500',
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
      color: 'from-red-500 to-blue-500',
      popular: false,
      payAsYouGo: '0,10€ par réponse supplémentaire'
    }
  ];

  const steps = [
    {
      icon: <Gift className="w-16 h-16 text-yellow-500" />,
      title: "Bienvenue !",
      description: "Félicitations ! Vous venez de rejoindre Starlinko, la plateforme qui va révolutionner la gestion de vos avis Google. Commencez avec 14 jours d'essai gratuit !",
      color: "from-blue-500 to-green-500",
      type: 'welcome'
    },
    {
      icon: <Search className="w-16 h-16 text-blue-500" />,
      title: "Trouvez votre établissement",
      description: "Indiquez le nom de votre établissement et nous le trouverons automatiquement sur Google.",
      color: "from-green-500 to-yellow-500",
      type: 'business-search'
    },
    {
      icon: <Building2 className="w-16 h-16 text-blue-500" />,
      title: "Sélectionnez votre établissement",
      description: "Choisissez votre établissement dans la liste ci-dessous. Nous surveillerons automatiquement vos avis.",
      color: "from-green-500 to-yellow-500",
      type: 'location-selection'
    },
    {
      icon: <CreditCard className="w-16 h-16 text-green-500" />,
      title: "Choisissez votre plan",
      description: "Sélectionnez le plan qui correspond le mieux à vos besoins. Tous les plans incluent 14 jours d'essai gratuit !",
      color: "from-yellow-500 to-red-500",
      type: 'plan-selection'
    },
    {
      icon: <Sparkles className="w-16 h-16 text-yellow-500" />,
      title: "Tout est prêt !",
      description: "Votre compte est configuré et prêt à l'emploi. Commencez dès maintenant votre essai gratuit !",
      color: "from-yellow-500 to-red-500",
      type: 'complete'
    }
  ];

  const handleSubscribe = async (planId: string, billingCycle: 'monthly' | 'annual') => {
    if (!user?.id || !user?.email) {
      setError('Informations utilisateur manquantes');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      // Save selected location to database
      if (selectedDataForSEOLocation) {
        await saveLocationToDatabase(selectedDataForSEOLocation);
      } else if (selectedStores.length > 0) {
        await saveGoogleLocationsToDatabase();
      }

      // Check if Stripe is configured
      if (products.length === 0) {
        console.warn('Stripe not configured, completing onboarding without payment');
        setSuccess('Configuration sauvegardée ! Vous pouvez configurer votre abonnement plus tard.');
        setTimeout(() => {
          onComplete(selectedStores, selectedPlan);
        }, 1500);
        return;
      }

      // Find the corresponding Stripe product and price
      const stripeProduct = products.find(p => p.id === `starlinko_${planId}`);
      if (!stripeProduct) {
        console.warn('Stripe product not found, proceeding with onboarding');
        setSuccess('Configuration sauvegardée ! Vous pouvez configurer votre abonnement plus tard.');
        setTimeout(() => {
          onComplete(selectedStores, selectedPlan);
        }, 1500);
        return;
      }

      const price = stripeProduct.prices.find(p =>
        p.metadata.billing_cycle === billingCycle
      );

      if (!price) {
        console.warn('Price not found, proceeding with onboarding');
        setSuccess('Configuration sauvegardée ! Vous pouvez configurer votre abonnement plus tard.');
        setTimeout(() => {
          onComplete(selectedStores, selectedPlan);
        }, 1500);
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
      setError('Erreur lors de l\'abonnement. Redirection vers le dashboard...');
      setTimeout(() => {
        onComplete(selectedStores, selectedPlan);
      }, 2000);
    } finally {
      setLoading(false);
    }
  };

  const searchBusinessWithDataForSEO = async () => {
    if (!businessName.trim()) {
      setError('Veuillez saisir le nom de votre établissement');
      return;
    }

    setSearchingDataForSEO(true);
    setError(null);
    try {
      const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
      const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

      if (!supabaseUrl || !supabaseKey) {
        throw new Error('Configuration Supabase manquante');
      }

      const response = await fetch(
        `${supabaseUrl}/functions/v1/google-places-search`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${supabaseKey}`,
          },
          body: JSON.stringify({
            query: businessName.trim(),
            location: businessAddress.trim() || undefined
          })
        }
      );

      if (!response.ok) {
        throw new Error(`Erreur HTTP: ${response.status}`);
      }

      const data = await response.json();

      if (!data.success) {
        throw new Error(data.error || 'Erreur lors de la recherche');
      }

      if (data.status === 'ZERO_RESULTS') {
        setSearchedLocations([]);
        setError('Aucun établissement trouvé. Vérifiez le nom et l\'adresse.');
        return;
      }

      setSearchedLocations(data.results || []);
      setSuccess(`${data.results?.length || 0} établissement(s) trouvé(s) !`);

    } catch (error) {
      console.error('Error searching business:', error);
      setError('Erreur lors de la recherche. Veuillez réessayer.');
    } finally {
      setSearchingDataForSEO(false);
    }
  };

  const selectDataForSEOLocation = async (location: any) => {
    setSelectedDataForSEOLocation(location);
    setSuccess(`"${location.name}" sélectionné !`);
    
    // Auto-save the location
    try {
      await saveLocationToDatabase(location);
    } catch (error) {
      console.error('Error auto-saving location:', error);
      // Don't show error to user for auto-save
    }
  };

  const canProceed = () => {
    const currentStepData = steps[currentStep];

    if (currentStepData.type === 'business-search') {
      return businessName.trim().length > 0;
    }

    if (currentStepData.type === 'location-selection') {
      return selectedDataForSEOLocation !== null || selectedStores.length > 0;
    }

    if (currentStepData.type === 'plan-selection') {
      return selectedPlan !== '';
    }

    return true;
  };

  const nextStep = async () => {
    if (currentStep < steps.length - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      // Final step - handle subscription
      await handleSubscribe(selectedPlan, billingCycle);
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

  const renderStepContent = () => {
    const currentStepData = steps[currentStep];

    if (currentStepData.type === 'business-search') {
      return (
        <div className="space-y-6">
          {error && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4 flex items-start">
              <AlertCircle className="w-5 h-5 text-red-500 mr-2 mt-0.5 flex-shrink-0" />
              <p className="text-red-800 text-sm">{error}</p>
            </div>
          )}

          {success && (
            <div className="bg-green-50 border border-green-200 rounded-lg p-4 flex items-start">
              <Check className="w-5 h-5 text-green-500 mr-2 mt-0.5 flex-shrink-0" />
              <p className="text-green-800 text-sm font-medium">{success}</p>
            </div>
          )}

          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Nom de votre établissement *
              </label>
              <input
                type="text"
                value={businessName}
                onChange={(e) => {
                  setBusinessName(e.target.value);
                  setError(null);
                }}
                placeholder="Ex: Decora Home Lognes"
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors"
                disabled={searchingDataForSEO}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Ville ou adresse (optionnel)
              </label>
              <input
                type="text"
                value={businessAddress}
                onChange={(e) => setBusinessAddress(e.target.value)}
                placeholder="Ex: Lognes, France"
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors"
                disabled={searchingDataForSEO}
              />
            </div>

            <button
              onClick={searchBusinessWithDataForSEO}
              disabled={searchingDataForSEO || !businessName.trim()}
              className="w-full flex items-center justify-center px-6 py-4 bg-blue-600 text-white rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 transition-colors duration-200 font-medium"
            >
              {searchingDataForSEO ? (
                <>
                  <Loader2 className="w-5 h-5 mr-3 animate-spin" />
                  Recherche en cours...
                </>
              ) : (
                <>
                  <Search className="w-5 h-5 mr-3" />
                  Rechercher mon établissement
                </>
              )}
            </button>
          </div>

          {searchedLocations.length > 0 && (
            <div className="bg-green-50 rounded-lg p-4 text-center border border-green-200">
              <Check className="w-8 h-8 text-green-500 mx-auto mb-2" />
              <p className="text-green-700 font-medium">
                {searchedLocations.length} établissement{searchedLocations.length > 1 ? 's' : ''} trouvé{searchedLocations.length > 1 ? 's' : ''} !
              </p>
              <p className="text-sm text-green-600 mt-1">
                Passez à l'étape suivante pour sélectionner votre établissement
              </p>
            </div>
          )}
        </div>
      );
    }

    if (currentStepData.type === 'location-selection') {
      return (
        <div className="space-y-4">
          {error && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4 flex items-start">
              <AlertCircle className="w-5 h-5 text-red-500 mr-2 mt-0.5 flex-shrink-0" />
              <p className="text-red-800 text-sm">{error}</p>
            </div>
          )}

          {success && (
            <div className="bg-green-50 border border-green-200 rounded-lg p-4 flex items-start">
              <Check className="w-5 h-5 text-green-500 mr-2 mt-0.5 flex-shrink-0" />
              <p className="text-green-800 text-sm font-medium">{success}</p>
            </div>
          )}

          {savingLocation && (
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 flex items-center">
              <Loader2 className="w-5 h-5 text-blue-500 mr-2 animate-spin" />
              <p className="text-blue-700 text-sm">Sauvegarde de l'établissement...</p>
            </div>
          )}

          {searchedLocations.length === 0 ? (
            <div className="text-center py-8 bg-gray-50 rounded-xl">
              <MapPin className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-600 mb-4">Aucun établissement trouvé</p>
              <p className="text-sm text-gray-500">
                Retournez à l'étape précédente pour rechercher votre établissement
              </p>
            </div>
          ) : (
            <div className="space-y-3 max-h-96 overflow-y-auto">
              {searchedLocations.map((location) => (
                <div
                  key={location.place_id}
                  className={`p-4 border-2 rounded-xl cursor-pointer transition-all ${
                    selectedDataForSEOLocation?.place_id === location.place_id
                      ? 'border-blue-500 bg-blue-50 shadow-md'
                      : 'border-gray-200 hover:border-gray-300 hover:shadow-sm'
                  }`}
                  onClick={() => selectDataForSEOLocation(location)}
                >
                  <div className="flex items-start">
                    <div className={`w-10 h-10 rounded-full flex items-center justify-center mr-3 flex-shrink-0 ${
                      selectedDataForSEOLocation?.place_id === location.place_id
                        ? 'bg-blue-500 text-white'
                        : 'bg-gray-100 text-gray-600'
                    }`}>
                      <Building2 className="w-5 h-5" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="font-medium text-gray-900 mb-1 flex items-center">
                        {location.name}
                        {selectedDataForSEOLocation?.place_id === location.place_id && (
                          <BadgeCheck className="w-4 h-4 text-blue-500 ml-2" />
                        )}
                      </div>
                      <div className="text-sm text-gray-600 mb-2 flex items-center">
                        <MapPin className="w-3 h-3 mr-1" />
                        {location.formatted_address}
                      </div>
                      {location.rating && (
                        <div className="flex items-center gap-3 text-sm">
                          <span className="flex items-center text-yellow-600 font-medium">
                            <Star className="w-4 h-4 mr-1 fill-current" />
                            {location.rating.toFixed(1)} 
                            {location.user_ratings_total && 
                              ` (${location.user_ratings_total.toLocaleString()} avis)`
                            }
                          </span>
                        </div>
                      )}
                    </div>
                    {selectedDataForSEOLocation?.place_id === location.place_id && (
                      <Check className="w-5 h-5 text-blue-500 flex-shrink-0" />
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      );
    }

    if (currentStepData.type === 'plan-selection') {
      return (
        <div className="space-y-6">
          {/* Error/Success Messages */}
          {error && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4 flex items-start">
              <AlertCircle className="w-5 h-5 text-red-500 mr-2 mt-0.5 flex-shrink-0" />
              <p className="text-red-800 text-sm">{error}</p>
            </div>
          )}

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
                <span className="absolute -top-2 -right-2 bg-green-500 text-white text-xs px-1.5 py-0.5 rounded-full">
                  -20%
                </span>
              </button>
            </div>
          </div>
          
          {/* Plans */}
          <div className="space-y-4">
            {plans.map((plan) => (
              <div
                key={plan.id}
                className={`relative border-2 rounded-xl p-4 cursor-pointer transition-all ${
                  selectedPlan === plan.id
                    ? 'border-blue-500 bg-blue-50 shadow-lg'
                    : 'border-gray-200 hover:border-gray-300 hover:shadow-md'
                } ${plan.popular ? 'ring-2 ring-yellow-400 ring-opacity-50' : ''}`}
                onClick={() => setSelectedPlan(plan.id)}
              >
                {plan.popular && (
                  <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
                    <span className="bg-yellow-500 text-white px-3 py-1 rounded-full text-xs font-medium">
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
                      <p className="text-sm text-gray-600">{plan.subtitle}</p>
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
                      <div className="text-xs text-green-600 font-medium">
                        Économie de {plan.annualSavings}
                      </div>
                    )}
                  </div>
                </div>

                {/* Trial Badge */}
                <div className="bg-gradient-to-r from-green-500 to-blue-500 text-white px-3 py-1 rounded-full text-xs font-medium mb-3 inline-block">
                  <Gift className="w-3 h-3 inline mr-1" />
                  {plan.trial} → {plan.trialBonus}
                </div>
                
                <ul className="space-y-2 mb-3">
                  {plan.features.map((feature, index) => (
                    <li key={index} className="flex items-center text-sm text-gray-600">
                      <Check className="w-4 h-4 text-green-500 mr-2 flex-shrink-0" />
                      {feature}
                    </li>
                  ))}
                </ul>

                {/* Pay as you go */}
                <div className="text-xs text-gray-500 bg-gray-50 rounded-lg p-2 border">
                  <strong>Pay-as-you-go:</strong> {plan.payAsYouGo}
                </div>
                
                <div className="mt-3 flex items-center justify-center">
                  <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${
                    selectedPlan === plan.id
                      ? 'border-blue-500 bg-blue-500'
                      : 'border-gray-300'
                  }`}>
                    {selectedPlan === plan.id && (
                      <Check className="w-3 h-3 text-white" />
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
          
          {stripeLoading && (
            <div className="text-center py-4">
              <Loader2 className="w-6 h-6 text-blue-500 mx-auto mb-2 animate-spin" />
              <p className="text-sm text-gray-500">Chargement des plans...</p>
            </div>
          )}

          {/* Security Badge */}
          <div className="text-center pt-4 border-t border-gray-200">
            <div className="flex items-center justify-center text-sm text-gray-500">
              <Shield className="w-4 h-4 text-green-500 mr-2" />
              Paiement 100% sécurisé • Annulation à tout moment
            </div>
          </div>
        </div>
      );
    }

    if (currentStepData.type === 'complete') {
      return (
        <div className="space-y-6 text-center">
          <div className="bg-gradient-to-r from-green-500 to-blue-500 text-white rounded-2xl p-6">
            <Sparkles className="w-12 h-12 mx-auto mb-4" />
            <h3 className="text-xl font-bold mb-2">Votre compte est prêt !</h3>
            <p className="text-blue-100">
              Vous pouvez maintenant commencer votre essai gratuit de 14 jours
            </p>
          </div>

          <div className="space-y-4">
            <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
              <div className="flex items-center">
                <Building2 className="w-5 h-5 text-blue-500 mr-3" />
                <span className="text-sm font-medium">Établissement</span>
              </div>
              <span className="text-sm text-gray-600">
                {selectedDataForSEOLocation?.name || selectedStores.length + ' sélectionné(s)'}
              </span>
            </div>

            <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
              <div className="flex items-center">
                <CreditCard className="w-5 h-5 text-green-500 mr-3" />
                <span className="text-sm font-medium">Plan choisi</span>
              </div>
              <span className="text-sm text-gray-600 capitalize">
                {selectedPlan}
              </span>
            </div>

            <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
              <div className="flex items-center">
                <Calendar className="w-5 h-5 text-purple-500 mr-3" />
                <span className="text-sm font-medium">Essai gratuit</span>
              </div>
              <span className="text-sm text-gray-600">14 jours</span>
            </div>
          </div>

          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
            <div className="flex items-center">
              <Gift className="w-5 h-5 text-yellow-600 mr-2" />
              <p className="text-sm text-yellow-800">
                <strong>Votre essai gratuit commence maintenant !</strong><br />
                Aucun paiement ne sera effectué avant la fin des 14 jours.
              </p>
            </div>
          </div>
        </div>
      );
    }

    // Welcome step
    return (
      <div className="space-y-6">
        {user && (
          <div className="bg-gradient-to-r from-blue-500/10 to-green-500/10 rounded-2xl p-6 border border-blue-200">
            <div className="flex items-center justify-center mb-4">
              <img
                src={user.picture}
                alt={user.name}
                className="w-16 h-16 rounded-full mr-4 border-4 border-white shadow-lg"
              />
              <div className="text-left">
                <div className="font-bold text-gray-900 text-lg">{user.name}</div>
                <div className="text-sm text-gray-600">{user.email}</div>
              </div>
            </div>
            <div className="bg-green-500 text-white px-4 py-2 rounded-full text-sm font-medium inline-flex items-center mx-auto">
              <Gift className="w-4 h-4 mr-2" />
              14 jours d'essai gratuit inclus !
            </div>
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-center">
          <div className="p-4 bg-blue-50 rounded-lg">
            <MessageSquare className="w-8 h-8 text-blue-500 mx-auto mb-2" />
            <h4 className="font-semibold text-gray-900 text-sm">Réponses IA</h4>
            <p className="text-xs text-gray-600">Automatisez vos réponses aux avis</p>
          </div>
          <div className="p-4 bg-green-50 rounded-lg">
            <TrendingUp className="w-8 h-8 text-green-500 mx-auto mb-2" />
            <h4 className="font-semibold text-gray-900 text-sm">Analyse en temps réel</h4>
            <p className="text-xs text-gray-600">Suivez votre réputation</p>
          </div>
          <div className="p-4 bg-purple-50 rounded-lg">
            <Smartphone className="w-8 h-8 text-purple-500 mx-auto mb-2" />
            <h4 className="font-semibold text-gray-900 text-sm">Mobile friendly</h4>
            <p className="text-xs text-gray-600">Gérez depuis votre mobile</p>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className={`min-h-screen bg-gradient-to-br ${steps[currentStep].color} flex items-center justify-center p-4 transition-all duration-500`}>
      <div className="max-w-lg w-full">
        {/* Progress indicators */}
        <div className="flex justify-center mb-8">
          <div className="flex items-center space-x-2 bg-white/20 backdrop-blur-sm rounded-full px-4 py-2">
            {steps.map((_, index) => (
              <button
                key={index}
                onClick={() => goToStep(index)}
                className={`w-3 h-3 rounded-full transition-all flex-shrink-0 ${
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

        {/* Content Card */}
        <div className="bg-white rounded-3xl p-8 text-center shadow-2xl transform transition-all duration-300 hover:shadow-3xl">
          <div className="flex justify-center mb-6">
            {steps[currentStep].icon}
          </div>
          
          <h2 className="text-2xl font-bold text-gray-900 mb-4">
            {steps[currentStep].title}
          </h2>
          
          <p className="text-gray-600 mb-8 leading-relaxed">
            {steps[currentStep].description}
          </p>

          {/* Step-specific content */}
          {renderStepContent()}

          {/* Navigation */}
          <div className="flex justify-between items-center mt-8 pt-6 border-t border-gray-200">
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

            <span className="text-sm text-gray-500 font-medium">
              Étape {currentStep + 1} sur {steps.length}
            </span>

            <button
              onClick={nextStep}
              disabled={!canProceed() || stripeLoading || loading}
              className="flex items-center px-6 py-3 bg-blue-600 text-white rounded-full hover:bg-blue-700 transition-all transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none shadow-lg hover:shadow-xl"
            >
              {currentStep === steps.length - 1 ?
                (stripeLoading || loading ?
                  <>
                    <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                    Chargement...
                  </>
                  :
                  'Commencer l\'essai'
                ) :
                'Suivant'
              }
              {currentStep < steps.length - 1 && <ChevronRight className="w-5 h-5 ml-1" />}
            </button>
          </div>
        </div>

        {/* Skip option */}
        {currentStep < steps.length - 1 && onSkip && (
          <div className="text-center mt-6">
            <button
              onClick={onSkip}
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