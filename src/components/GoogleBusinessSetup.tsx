import React, { useState, useEffect } from 'react';
import { Building2, MapPin, Star, ArrowRight, CheckCircle } from 'lucide-react';

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
  const [step, setStep] = useState<'connect' | 'accounts' | 'locations' | 'complete'>('connect');

  useEffect(() => {
    if (accessToken) {
      fetchAccounts();
    } else {
      setLoading(false);
    }
  }, []);

  const fetchAccounts = async () => {
    try {
      console.log('🔍 Fetching Google My Business accounts via Supabase Edge Function...');
      console.log('🔑 Access token:', accessToken ? 'Present' : 'Missing');
      console.log('🔑 Access token preview:', accessToken ? `${accessToken.substring(0, 20)}...` : 'N/A');
      
      // IMPORTANT: Use Supabase Edge Function as proxy to avoid CORS issues
      const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
      const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY;
      
      if (!supabaseUrl || !supabaseKey) {
        throw new Error('Configuration Supabase manquante');
      }
      
      console.log('📡 Calling Supabase Edge Function for accounts...');
      const response = await fetch(`${supabaseUrl}/functions/v1/auth-login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${supabaseKey}`,
          'apikey': supabaseKey,
        },
        body: JSON.stringify({
          action: 'get-accounts',
          accessToken: accessToken,
        }),
      });
      
      console.log('📡 Response status:', response.status);
      console.log('📡 Response headers:', Object.fromEntries(response.headers.entries()));
      
      if (!response.ok) {
        const text = await response.text();
        console.error('❌ HTTP Error from google-oauth function:', response.status, text);
        
        // Try to parse as JSON first
        try {
          const errorData = JSON.parse(text);
          throw new Error(`Erreur API: ${errorData.error || 'Erreur inconnue'}`);
        } catch (parseError) {
          // If not JSON, it's likely an HTML error page
          if (text.includes('<!DOCTYPE') || text.includes('<html>')) {
            throw new Error('La fonction Supabase google-oauth n\'est pas déployée. Utilisez: supabase functions deploy google-oauth');
          } else {
            throw new Error(`Erreur HTTP ${response.status}: ${text.substring(0, 100)}...`);
          }
        }
      }
      
      const data = await response.json();
      console.log('📊 Accounts response:', data);
      
      if (data && data.success && data.accounts && data.accounts.length > 0) {
        setAccounts(data.accounts);
        if (data.accounts.length === 1) {
          // Auto-select if only one account
          setSelectedAccountId(data.accounts[0].name);
          fetchLocations(data.accounts[0].name);
        }
      } else if (data && data.error) {
        console.error('❌ Aucun compte Google My Business trouvé:', data);
        console.error('🚨 Erreur API:', data.error);
        if (data.error.code === 401 || data.error.status === 401 || response.status === 401) {
          alert('Token d\'accès expiré. Veuillez vous reconnecter.');
        } else if (data.error.code === 403 || data.error.status === 403 || response.status === 403) {
          alert('Accès refusé. Vérifiez que l\'API Google My Business est activée et que vous avez les permissions nécessaires.');
        } else if (data.error.code === 404 || data.error.status === 404 || response.status === 404) {
          alert('Aucun compte Google My Business trouvé. Assurez-vous d\'avoir créé un profil d\'entreprise Google.');
        } else {
          alert(`Erreur API Google: ${data.error.message || data.error.code || 'Erreur inconnue'}`);
        }
      } else {
        console.error('❌ Réponse inattendue:', data);
        alert('Aucun compte Google My Business trouvé. Créez d\'abord un profil d\'entreprise sur Google.');
      }
    } catch (error) {
      console.error('💥 Erreur lors de la récupération des comptes:', error);
      alert(`Erreur de connexion à Google My Business: ${error.message}. Vérifiez votre connexion internet et réessayez.`);
    } finally {
      setLoading(false);
    }
  };

  const fetchLocations = async (accountId: string) => {
    setLoading(true);
    try {
      console.log('🏪 Fetching locations for account via Supabase Edge Function:', accountId);
      
      // IMPORTANT: Use Supabase Edge Function as proxy to avoid CORS issues
      const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
      const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY;
      
      if (!supabaseUrl || !supabaseKey) {
        throw new Error('Configuration Supabase manquante');
      }
      
      console.log('📡 Calling Supabase Edge Function for locations...');
      const response = await fetch(`${supabaseUrl}/functions/v1/auth-login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${supabaseKey}`,
          'apikey': supabaseKey,
        },
        body: JSON.stringify({
          action: 'get-locations',
          accessToken: accessToken,
          accountId: accountId,
        }),
      });
      
      console.log('📡 Locations response status:', response.status);
      
      if (!response.ok) {
        const text = await response.text();
        console.error('❌ HTTP Error from locations API:', response.status, text);
        throw new Error(`Erreur HTTP ${response.status} lors de la récupération des établissements`);
      }
      
      const data = await response.json();
      console.log('🏢 Locations response:', data);
      
      if (data && data.success && data.locations && data.locations.length > 0) {
        setLocations(data.locations);
        setStep('locations');
      } else if (data && data.error) {
        console.error('🚨 Erreur API locations:', data.error);
        alert(`Erreur lors de la récupération des établissements: ${data.error.message || data.error.code || 'Erreur inconnue'}`);
      } else {
        console.error('❌ Aucun établissement trouvé:', data);
        alert('Aucun établissement trouvé pour ce compte. Assurez-vous d\'avoir créé au moins un établissement dans votre profil Google My Business.');
      }
    } catch (error) {
      console.error('💥 Erreur lors de la récupération des établissements:', error);
      alert(`Erreur lors de la récupération des établissements: ${error.message}. Vérifiez votre connexion.`);
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