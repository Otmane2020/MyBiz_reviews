import React, { useState, useEffect } from 'react';
import { Building2, MapPin, Star, ArrowRight, CheckCircle } from 'lucide-react';
import { supabase } from '../lib/supabase';

// Utiliser la variable d'environnement
const GOOGLE_CLIENT_ID = import.meta.env.VITE_GOOGLE_CLIENT_ID || '';

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

interface GoogleBusinessSetupProps {
  accessToken: string;
  onSetupComplete: (accountId: string, locationId: string) => void;
}

const GoogleBusinessSetup: React.FC<GoogleBusinessSetupProps> = ({
  accessToken,
  onSetupComplete
}) => {
  const [accounts, setAccounts] = useState<GoogleAccount[]>([]);
  const [locations, setLocations] = useState<GoogleLocation[]>([]);
  const [selectedAccountId, setSelectedAccountId] = useState<string>('');
  const [selectedLocationId, setSelectedLocationId] = useState<string>('');
  const [loading, setLoading] = useState(true);
  const [step, setStep] = useState<'accounts' | 'locations' | 'complete'>('accounts');

  useEffect(() => {
    // Check if user has Google access token from Supabase session
    const initializeWithSupabaseSession = async () => {
      console.log('🚀 [DEBUG] Initializing GoogleBusinessSetup...');
      
      const { data: { session } } = await supabase.auth.getSession();
      
      console.log('📋 [DEBUG] Supabase session present:', !!session);
      console.log('📋 [DEBUG] Provider token present:', !!session?.provider_token);
      console.log('📋 [DEBUG] Fallback accessToken present:', !!accessToken);
      
      if (session && session.provider_token) {
        // Use the access token from Supabase session
        console.log('✅ [DEBUG] Using provider token from Supabase session');
        fetchAccounts(session.provider_token);
      } else if (accessToken) {
        // Fallback to provided access token
        console.log('✅ [DEBUG] Using fallback accessToken from props');
        fetchAccounts(accessToken);
      } else {
        console.error('❌ [DEBUG] No access token available from any source');
        setLoading(false);
        alert('Aucun token d\'accès Google trouvé.\n\nCauses possibles:\n• Session Supabase expirée\n• Token non fourni en props\n• Problème d\'authentification\n\nVeuillez vous reconnecter.');
      }
    };
    
    initializeWithSupabaseSession();
  }, []);

  const fetchAccounts = async (token: string = accessToken) => {
    try {
      console.log('🔍 [DEBUG] Starting fetchAccounts...');
      console.log('🔑 [DEBUG] Access token present:', !!token);
      console.log('🔑 [DEBUG] Access token (first 20 chars):', token ? token.substring(0, 20) + '...' : 'MISSING');
      console.log('🌐 [DEBUG] Supabase URL:', import.meta.env.VITE_SUPABASE_URL);
      console.log('🔐 [DEBUG] Supabase Key present:', !!import.meta.env.VITE_SUPABASE_ANON_KEY);
      
      console.log('🔍 Fetching Google My Business accounts via Supabase Edge Function...');
      
      // IMPORTANT: Use Supabase Edge Function as proxy to avoid CORS issues
      console.log('📡 Calling Supabase Edge Function for accounts...');
      const edgeFunctionUrl = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/google-oauth`;
      console.log('🎯 [DEBUG] Edge Function URL:', edgeFunctionUrl);
      
      const requestBody = {
        action: 'get-accounts',
        accessToken: token,
      };
      console.log('📤 [DEBUG] Request body:', { ...requestBody, accessToken: token ? token.substring(0, 20) + '...' : 'MISSING' });
      
      const response = await fetch(`${import.meta.env.VITE_SUPABASE_URL}/functions/v1/google-oauth`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${import.meta.env.VITE_SUPABASE_ANON_KEY}`,
        },
        body: JSON.stringify(requestBody),
      });
      
      console.log('📡 [DEBUG] Response status:', response.status);
      console.log('📡 [DEBUG] Response headers:', Object.fromEntries(response.headers.entries()));
      console.log('📡 [DEBUG] Response ok:', response.ok);
      
      if (!response.ok) {
        const text = await response.text();
        console.error('❌ [DEBUG] HTTP Error from google-oauth function:', response.status, text);
        console.error('❌ [DEBUG] Full response text:', text);
        
        // Try to parse as JSON first
        try {
          const errorData = JSON.parse(text);
          console.error('❌ [DEBUG] Parsed error data:', errorData);
          throw new Error(`Erreur API: ${errorData.error || 'Erreur inconnue'}`);
        } catch (parseError) {
          console.error('❌ [DEBUG] Failed to parse error as JSON:', parseError);
          // If not JSON, it's likely an HTML error page
          if (text.includes('<!DOCTYPE') || text.includes('<html>')) {
            throw new Error('La fonction Supabase google-oauth n\'est pas déployée correctement. Vérifiez que la fonction Edge est active dans votre projet Supabase.');
          } else {
            throw new Error(`Erreur HTTP ${response.status}: ${text.substring(0, 100)}...`);
          }
        }
      }
      
      const data = await response.json();
      console.log('📊 [DEBUG] Raw accounts response:', data);
      console.log('📊 [DEBUG] Response success:', data.success);
      console.log('📊 [DEBUG] Response accounts count:', data.accounts ? data.accounts.length : 0);
      console.log('📊 [DEBUG] Response error:', data.error);
      
      if (data && data.success && data.accounts && data.accounts.length > 0) {
        console.log('✅ [DEBUG] Accounts loaded successfully:', data.accounts.length);
        setAccounts(data.accounts);
        if (data.accounts.length === 1) {
          // Auto-select if only one account
          console.log('🎯 [DEBUG] Auto-selecting single account:', data.accounts[0].name);
          setSelectedAccountId(data.accounts[0].name);
          fetchLocations(data.accounts[0].name);
        }
      } else if (data && data.error) {
        console.error('❌ [DEBUG] No GMB accounts found:', data);
        console.error('🚨 [DEBUG] API error details:', data.error);
        
        // Show detailed error to user
        let userErrorMessage = 'Erreur lors de la récupération des comptes Google My Business:\n\n';
        
        if (data.error.code === 401 || data.error.status === 401) {
          userErrorMessage += '🔑 Token d\'accès expiré. Veuillez vous reconnecter.';
        } else if (data.error.code === 403 || data.error.status === 403) {
          userErrorMessage += '🚫 Accès refusé. Vérifiez que l\'API "My Business Account Management API" est activée dans Google Cloud Console et que vous avez les permissions nécessaires.';
        } else if (data.error.code === 404 || data.error.status === 404) {
          userErrorMessage += '🔍 Aucun compte Google My Business trouvé. Assurez-vous d\'avoir créé un profil d\'entreprise Google.';
        } else {
          userErrorMessage += `⚠️ Erreur API Google: ${data.error.message || data.error.code || 'Erreur inconnue'}`;
        }
        
        userErrorMessage += '\n\n🔍 Détails techniques dans la console (F12)';
        alert(userErrorMessage);
      } else {
        console.error('❌ [DEBUG] Unexpected response structure:', data);
        alert('Réponse inattendue du serveur. Vérifiez les logs de la console (F12) pour plus de détails.');
      }
    } catch (error) {
      console.error('💥 [DEBUG] Fatal error in fetchAccounts:', error);
      console.error('💥 [DEBUG] Error stack:', error.stack);
      
      let userErrorMessage = 'Erreur critique lors de la récupération des comptes:\n\n';
      userErrorMessage += `📝 Message: ${error.message}\n\n`;
      userErrorMessage += '🔍 Vérifications suggérées:\n';
      userErrorMessage += '• Variables d\'environnement Supabase configurées\n';
      userErrorMessage += '• Fonction Edge "google-oauth" déployée\n';
      userErrorMessage += '• APIs Google activées dans Cloud Console\n';
      userErrorMessage += '• Token d\'accès valide avec les bons scopes\n\n';
      userErrorMessage += '🔍 Détails techniques dans la console (F12)';
      
      alert(userErrorMessage);
    } finally {
      setLoading(false);
    }
  };

  const fetchLocations = async (accountId: string) => {
    setLoading(true);
    try {
      console.log('🏪 [DEBUG] Starting fetchLocations...');
      console.log('🏪 [DEBUG] Account ID:', accountId);
      
      // Get current access token
      const { data: { session } } = await supabase.auth.getSession();
      const token = session?.provider_token || accessToken;
      
      console.log('🔑 [DEBUG] Token for locations present:', !!token);
      console.log('🔑 [DEBUG] Token source:', session?.provider_token ? 'Supabase session' : 'Props');
      
      console.log('🏪 Fetching locations for account via Supabase Edge Function:', accountId);
      
      // IMPORTANT: Use Supabase Edge Function as proxy to avoid CORS issues
      console.log('📡 Calling Supabase Edge Function for locations...');
      const edgeFunctionUrl = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/google-oauth`;
      console.log('🎯 [DEBUG] Edge Function URL:', edgeFunctionUrl);
      
      const requestBody = {
        action: 'get-locations',
        accessToken: token,
        accountId: accountId,
      };
      console.log('📤 [DEBUG] Request body:', { ...requestBody, accessToken: token ? token.substring(0, 20) + '...' : 'MISSING' });
      
      const response = await fetch(`${import.meta.env.VITE_SUPABASE_URL}/functions/v1/google-oauth`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${import.meta.env.VITE_SUPABASE_ANON_KEY}`,
        },
        body: JSON.stringify(requestBody),
      });
      
      console.log('📡 [DEBUG] Locations response status:', response.status);
      console.log('📡 [DEBUG] Locations response ok:', response.ok);
      
      if (!response.ok) {
        const text = await response.text();
        console.error('❌ [DEBUG] HTTP Error from locations API:', response.status, text);
        console.error('❌ [DEBUG] Full locations response text:', text);
        throw new Error(`Erreur HTTP ${response.status} lors de la récupération des établissements`);
      }
      
      const data = await response.json();
      console.log('🏢 [DEBUG] Raw locations response:', data);
      console.log('🏢 [DEBUG] Locations success:', data.success);
      console.log('🏢 [DEBUG] Locations count:', data.locations ? data.locations.length : 0);
      console.log('🏢 [DEBUG] Locations error:', data.error);
      
      if (data && data.success && data.locations && data.locations.length > 0) {
        console.log('✅ [DEBUG] Locations loaded successfully:', data.locations.length);
        setLocations(data.locations);
        setStep('locations');
      } else if (data && data.error) {
        console.error('🚨 [DEBUG] Locations API error:', data.error);
        
        let userErrorMessage = 'Erreur lors de la récupération des établissements:\n\n';
        
        if (data.error.code === 403 || data.error.status === 403) {
          if (data.error.message?.includes('My Business Business Information API')) {
            userErrorMessage += '🚫 L\'API "My Business Business Information API" n\'est pas activée.\n';
            userErrorMessage += 'Activez-la sur: https://console.cloud.google.com/apis/library/mybusinessbusinessinformation.googleapis.com';
          } else {
            userErrorMessage += '🚫 Accès refusé aux établissements. Vérifiez vos permissions Google My Business.';
          }
        } else if (data.error.code === 401 || data.error.status === 401) {
          userErrorMessage += '🔑 Token d\'accès invalide ou expiré. Reconnectez-vous.';
        } else {
          userErrorMessage += `⚠️ ${data.error.message || data.error.code || 'Erreur inconnue'}`;
        }
        
        userErrorMessage += '\n\n🔍 Détails techniques dans la console (F12)';
        alert(userErrorMessage);
      } else {
        console.error('❌ [DEBUG] No locations found or unexpected response:', data);
        alert('Aucun établissement trouvé pour ce compte.\n\nAssurez-vous d\'avoir créé au moins un établissement dans votre profil Google My Business.\n\n🔍 Détails techniques dans la console (F12)');
      }
    } catch (error) {
      console.error('💥 [DEBUG] Fatal error in fetchLocations:', error);
      console.error('💥 [DEBUG] Error stack:', error.stack);
      
      let userErrorMessage = 'Erreur critique lors de la récupération des établissements:\n\n';
      userErrorMessage += `📝 Message: ${error.message}\n\n`;
      userErrorMessage += '🔍 Vérifications suggérées:\n';
      userErrorMessage += '• Connexion internet stable\n';
      userErrorMessage += '• APIs Google activées\n';
      userErrorMessage += '• Token d\'accès valide\n';
      userErrorMessage += '• Fonction Edge déployée\n\n';
      userErrorMessage += '🔍 Détails techniques dans la console (F12)';
      
      alert(userErrorMessage);
    } finally {
      setLoading(false);
    }
  };

  const handleAccountSelect = (accountId: string) => {
    setSelectedAccountId(accountId);
    fetchLocations(accountId);
  };

  const handleLocationSelect = (locationId: string) => {
    setSelectedLocationId(locationId);
    setStep('complete');
  };

  const handleComplete = () => {
    onSetupComplete(selectedAccountId, selectedLocationId);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-[#4285F4] via-[#34A853] to-[#FBBC05] flex items-center justify-center">
        <div className="text-center text-white">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white mx-auto mb-4"></div>
          <p>Chargement de vos comptes Google My Business...</p>
          <p className="text-sm text-white/70 mt-2">Vérifiez la console (F12) pour les détails</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#4285F4] via-[#34A853] to-[#FBBC05] flex items-center justify-center p-4">
      <div className="max-w-2xl w-full">
        {/* Progress Steps */}
        <div className="flex justify-center mb-8">
          <div className="flex items-center space-x-4">
            <div className={`flex items-center justify-center w-8 h-8 rounded-full ${
              step === 'accounts' ? 'bg-white text-[#4285F4]' : 'bg-white/30 text-white'
            }`}>
              1
            </div>
            <div className="w-12 h-0.5 bg-white/30"></div>
            <div className={`flex items-center justify-center w-8 h-8 rounded-full ${
              step === 'locations' ? 'bg-white text-[#4285F4]' : 'bg-white/30 text-white'
            }`}>
              2
            </div>
            <div className="w-12 h-0.5 bg-white/30"></div>
            <div className={`flex items-center justify-center w-8 h-8 rounded-full ${
              step === 'complete' ? 'bg-white text-[#4285F4]' : 'bg-white/30 text-white'
            }`}>
              3
            </div>
          </div>
        </div>

        <div className="bg-white rounded-2xl p-8 shadow-2xl">
          {step === 'accounts' && (
            <>
              <div className="text-center mb-6">
                <Building2 className="w-12 h-12 text-[#4285F4] mx-auto mb-4" />
                <h2 className="text-2xl font-bold text-gray-900 mb-2">
                  Sélectionnez votre compte
                </h2>
                <p className="text-gray-600">
                  Choisissez le compte Google My Business que vous souhaitez gérer
                </p>
              </div>

              <div className="space-y-3">
                {accounts.map((account) => (
                  <button
                    key={account.name}
                    onClick={() => handleAccountSelect(account.name)}
                    className="w-full p-4 border border-gray-200 rounded-lg hover:border-[#4285F4] hover:bg-[#4285F4]/5 transition-colors text-left"
                  >
                    <div className="flex items-center justify-between">
                      <div>
                        <div className="font-medium text-gray-900">
                          {account.name.split('/')[1]}
                        </div>
                        <div className="text-sm text-gray-500">
                          {account.type} • {account.role}
                        </div>
                      </div>
                      <ArrowRight className="w-5 h-5 text-gray-400" />
                    </div>
                  </button>
                ))}
              </div>
            </>
          )}

          {step === 'locations' && (
            <>
              <div className="text-center mb-6">
                <MapPin className="w-12 h-12 text-[#4285F4] mx-auto mb-4" />
                <h2 className="text-2xl font-bold text-gray-900 mb-2">
                  Choisissez votre établissement
                </h2>
                <p className="text-gray-600">
                  Sélectionnez l'établissement dont vous voulez gérer les avis
                </p>
              </div>

              <div className="space-y-3">
                {locations.map((location) => (
                  <button
                    key={location.name}
                    onClick={() => handleLocationSelect(location.name)}
                    className="w-full p-4 border border-gray-200 rounded-lg hover:border-[#4285F4] hover:bg-[#4285F4]/5 transition-colors text-left"
                  >
                    <div className="flex items-center justify-between">
                      <div>
                        <div className="font-medium text-gray-900">
                          {location.locationName}
                        </div>
                        <div className="text-sm text-gray-500">
                          {location.primaryCategory?.displayName}
                        </div>
                        {location.address && (
                          <div className="text-xs text-gray-400 mt-1">
                            {location.address.locality}, {location.address.administrativeArea}
                          </div>
                        )}
                      </div>
                      <ArrowRight className="w-5 h-5 text-gray-400" />
                    </div>
                  </button>
                ))}
              </div>

              <button
                onClick={() => setStep('accounts')}
                className="mt-4 text-[#4285F4] hover:underline text-sm"
              >
                ← Retour aux comptes
              </button>
            </>
          )}

          {step === 'complete' && (
            <>
              <div className="text-center mb-6">
                <CheckCircle className="w-12 h-12 text-[#34A853] mx-auto mb-4" />
                <h2 className="text-2xl font-bold text-gray-900 mb-2">
                  Configuration terminée !
                </h2>
                <p className="text-gray-600">
                  Votre compte Google My Business est maintenant connecté
                </p>
              </div>

              <div className="bg-gray-50 rounded-lg p-4 mb-6">
                <div className="text-sm text-gray-600 mb-2">Établissement sélectionné :</div>
                <div className="font-medium text-gray-900">
                  {locations.find(l => l.name === selectedLocationId)?.locationName}
                </div>
                <div className="text-sm text-gray-500">
                  {locations.find(l => l.name === selectedLocationId)?.primaryCategory?.displayName}
                </div>
              </div>

              <button
                onClick={handleComplete}
                className="w-full bg-[#4285F4] text-white py-3 px-4 rounded-lg hover:bg-[#3367D6] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#4285F4] transition-colors duration-200 font-medium"
              >
                Commencer à gérer mes avis
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default GoogleBusinessSetup;