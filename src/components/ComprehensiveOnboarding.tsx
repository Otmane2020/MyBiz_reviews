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
  onTokenExpired?: () => void;
}

const ComprehensiveOnboarding: React.FC<ComprehensiveOnboardingProps> = ({ 
  user, 
  accessToken: initialAccessToken,
  onComplete,
  onTokenExpired
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
  
  const { products, loading: stripeLoading, redirectToCheckout } = useStripe();

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
      title: `Bienvenue ${user?.name?.split(' ')[0]} !`,
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
      icon: <MessageSquare className="w-16 h-16 text-[#EA4335]" />,
      title: "IA de réponse intelligente",
      description: "Notre intelligence artificielle analyse chaque avis et génère des réponses personnalisées et professionnelles en quelques secondes. Testez gratuitement pendant 14 jours !",
      color: "from-[#EA4335] to-[#4285F4]",
      type: 'feature'
    },
    {
      icon: <TrendingUp className="w-16 h-16 text-[#4285F4]" />,
      title: "Tableau de bord analytique",
      description: "Suivez l'évolution de votre réputation avec des statistiques détaillées : note moyenne, taux de réponse, tendances et rapports PDF mensuels.",
      color: "from-[#4285F4] to-[#34A853]",
      type: 'feature'
    },
    {
      icon: <Smartphone className="w-16 h-16 text-[#34A853]" />,
      title: "Notifications en temps réel",
      description: "Recevez des alertes instantanées pour chaque nouvel avis et ne manquez jamais une opportunité d'interaction avec vos clients.",
      color: "from-[#34A853] to-[#FBBC05]",
      type: 'feature'
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
      // Find the corresponding Stripe product and price
      const stripeProduct = products.find(p => p.id === `starlinko_${planId}`);
      if (!stripeProduct) {
        // If products not loaded yet, proceed with onboarding
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
      // Fallback to completing onboarding
      onComplete(selectedStores, selectedPlan);
    }
  };

  const connectGoogleMyBusiness = async () => {
    setLoading(true);
    
    try {
      // Check if user is already authenticated with Google via Supabase
      const { data: { session } } = await supabase.auth.getSession();
      
      if (session && session.provider_token) {
        setAccessToken(session.provider_token);
        setGmbConnected(true);
        await fetchAccounts();
      } else {
        // Initiate Google OAuth sign-in with Supabase
        const { error } = await supabase.auth.signInWithOAuth({
          provider: 'google',
          options: {
            redirectTo: `${window.location.origin}?onboarding=true`,
            queryParams: {
              access_type: 'offline',
              prompt: 'consent',
            },
            scopes: 'https://www.googleapis.com/auth/business.manage https://www.googleapis.com/auth/userinfo.profile https://www.googleapis.com/auth/userinfo.email'
          }
        });
        
        if (error) {
          throw error;
        }
      }
    } catch (error) {
      console.error('Error connecting Google My Business:', error);
      alert('Erreur lors de la connexion à Google My Business. Veuillez réessayer.');
    } finally {
      setLoading(false);
    }
  };

  const fetchAccounts = async () => {
    if (!accessToken) return;

    setLoading(true);
    try {
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
      const data = await response.json();
      
      if (data.accounts && data.accounts.length > 0) {
        setAccounts(data.accounts);
        // Fetch locations for the first account
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
    try {
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
      const data = await response.json();
      
      if (data.locations && data.locations.length > 0) {
        setLocations(data.locations);
      } else {
        console.error('❌ Aucun établissement trouvé dans onboarding:', data);
      }
    } catch (error) {
      console.error('Erreur lors de la récupération des établissements:', error);
      alert(`Erreur lors de la récupération des établissements: ${error.message}`);
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      {/* Onboarding content will be implemented here */}
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-800 mb-4">Onboarding en cours...</h1>
          <p className="text-gray-600">Configuration de votre compte Starlinko</p>
        </div>
      </div>
    </div>
  );
}

export default ComprehensiveOnboarding;