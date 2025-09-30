import React, { useState, useEffect } from 'react';
import { Loader2, Building2, MapPin, AlertCircle, CheckCircle, Wifi, WifiOff, RefreshCw, ExternalLink } from 'lucide-react';
import { supabase } from '../lib/supabase';

interface GoogleBusinessSetupProps {
  accessToken: string;
  onSetupComplete: (accountId: string, locationId: string) => void;
  onTokenExpired?: () => void;
}

interface Account {
  name: string;
  accountName: string;
}

interface Location {
  name: string;
  locationName: string;
  primaryCategory?: {
    displayName: string;
  };
  address?: {
    locality: string;
    administrativeArea: string;
  };
}

const GoogleBusinessSetup: React.FC<GoogleBusinessSetupProps> = ({ 
  accessToken, 
  onSetupComplete,
  onTokenExpired
}) => {
  const [accounts, setAccounts] = useState<Account[]>([]);
  const [locations, setLocations] = useState<Location[]>([]);
  const [selectedAccount, setSelectedAccount] = useState<Account | null>(null);
  const [selectedLocation, setSelectedLocation] = useState<Location | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [step, setStep] = useState<'accounts' | 'locations' | 'complete'>('accounts');

  // Debug logging function
  const debugLog = (message: string, data?: any) => {
    console.log(`[DEBUG GoogleBusinessSetup] ${message}`, data || '');
  };

  // Fetch Google My Business accounts
  const fetchAccounts = async () => {
    try {
      debugLog('Starting fetchAccounts', { 
        accessToken: accessToken ? `${accessToken.substring(0, 20)}...` : 'null',
        tokenLength: accessToken?.length || 0
      });
      setLoading(true);
      setError(null);

      const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
      const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

      if (!supabaseUrl || !supabaseKey) {
        throw new Error('Configuration Supabase manquante. Vérifiez vos variables d\'environnement.');
      }

      // Vérifier que le token est valide
      if (!accessToken || accessToken.length < 50) {
        debugLog('Invalid or missing access token', { tokenLength: accessToken?.length || 0 });
        throw new Error('Token d\'accès manquant ou invalide. Veuillez vous reconnecter.');
      }

      debugLog('Calling Supabase Edge Function', { 
        url: `${supabaseUrl}/functions/v1/google-oauth`,
        hasToken: !!accessToken 
      });

      const response = await fetch(`${supabaseUrl}/functions/v1/google-oauth`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${supabaseKey}`,
          'X-Debug-Token-Length': accessToken.length.toString(),
        },
        body: JSON.stringify({
          action: 'get-accounts',
          accessToken: accessToken
        }),
      });

      debugLog('Edge Function response', { 
        status: response.status, 
        statusText: response.statusText,
        headers: Object.fromEntries(response.headers.entries())
      });

      if (!response.ok) {
        const errorText = await response.text();
        debugLog('Edge Function error response', errorText);
        throw new Error(`Erreur HTTP ${response.status}: ${errorText}`);
      }

      const data = await response.json();
      debugLog('fetchAccounts response data', data);

      if (!data.success) {
        throw new Error(data.error || 'Échec de récupération des comptes');
      }

      setAccounts(data.accounts || []);
      debugLog(`Found ${data.accounts?.length || 0} accounts`);

      if (data.accounts && data.accounts.length > 0) {
        debugLog('Accounts found successfully', {
          accountCount: data.accounts.length,
          firstAccountName: data.accounts[0]?.name || 'N/A',
          firstAccountType: data.accounts[0]?.type || 'N/A'
        });
        setSelectedAccount(data.accounts[0]);
      }

    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Erreur inconnue';
      debugLog('fetchAccounts error', errorMessage);
      setError(`Erreur lors du chargement des comptes: ${errorMessage}`);
      
      // Si c'est une erreur de token, proposer une reconnexion
      if (errorMessage.includes('401') || errorMessage.includes('invalide') || errorMessage.includes('expiré')) {
        debugLog('Token error detected, suggesting reconnection');
        if (onTokenExpired) {
          setTimeout(() => onTokenExpired(), 2000);
          return;
        }
      }
    } finally {
      setLoading(false);
    }
  };

  // Fetch locations for selected account
  const fetchLocations = async (account: Account) => {
    try {
      debugLog('Starting fetchLocations', { account: account.name });
      setLoading(true);
      setError(null);

      const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
      const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

      const response = await fetch(`${supabaseUrl}/functions/v1/google-oauth`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${supabaseKey}`,
        },
        body: JSON.stringify({
          action: 'get-locations',
          accessToken: accessToken,
          accountId: account.name
        }),
      });

      debugLog('fetchLocations response', { status: response.status });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Erreur HTTP ${response.status}: ${errorText}`);
      }

      const data = await response.json();
      debugLog('fetchLocations response data', data);

      if (!data.success) {
        throw new Error(data.error || 'Échec de récupération des établissements');
      }

      setLocations(data.locations || []);
      debugLog(`Found ${data.locations?.length || 0} locations`);

      if (data.locations && data.locations.length > 0) {
        setSelectedLocation(data.locations[0]);
      }

      setStep('locations');

    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Erreur inconnue';
      debugLog('fetchLocations error', errorMessage);
      setError(`Erreur lors du chargement des établissements: ${errorMessage}`);
    } finally {
      setLoading(false);
    }
  };

  // Handle account selection
  const handleAccountSelect = (account: Account) => {
    setSelectedAccount(account);
    setSelectedLocation(null);
    setLocations([]);
    fetchLocations(account);
  };

  // Handle setup completion
  const handleComplete = () => {
    if (selectedAccount && selectedLocation) {
      debugLog('Setup complete', { 
        accountId: selectedAccount.name, 
        locationId: selectedLocation.name 
      });
      onSetupComplete(selectedAccount.name, selectedLocation.name);
    }
  };

  // Retry function
  const handleRetry = () => {
    setError(null);
    setAccounts([]);
    setLocations([]);
    setSelectedAccount(null);
    setSelectedLocation(null);
    setStep('accounts');
    fetchAccounts();
  };

  // Load accounts on component mount
  useEffect(() => {
    if (accessToken) {
      fetchAccounts();
    } else {
      setError('Token d\'accès manquant');
      setLoading(false);
    }
  }, [accessToken]);

  // Error display component with improved design
  const ErrorDisplay = ({ message }: { message: string }) => {
    const isTokenError = message.includes('401') || message.includes('invalide') || message.includes('expiré');
    
    return (
    <div className="bg-gradient-to-r from-red-50 to-red-100 border-l-4 border-red-500 rounded-lg p-6 mb-6">
      <div className="flex items-start">
        <div className="flex-shrink-0">
          <AlertCircle className="w-6 h-6 text-red-500" />
        </div>
        <div className="ml-3 flex-1">
          <h3 className="text-lg font-semibold text-red-800 mb-2">
            {isTokenError ? 'Session Google expirée' : 'Erreur de connexion à Google My Business'}
          </h3>
          <p className="text-red-700 mb-4">{message}</p>
          
          {isTokenError && (
            <div className="bg-white/50 rounded-lg p-4 mb-4">
              <h4 className="font-semibold text-red-800 mb-2">Session expirée :</h4>
              <ul className="list-disc list-inside space-y-1 text-sm text-red-700">
                <li>Votre session Google a expiré</li>
                <li>Cliquez sur "Reconnecter Google" pour vous reconnecter</li>
                <li>Vous serez redirigé vers Google pour une nouvelle authentification</li>
              </ul>
            </div>
          )}

          {message.includes('My Business Account Management API') && (
            <div className="bg-white/50 rounded-lg p-4 mb-4">
              <h4 className="font-semibold text-red-800 mb-2">Actions requises :</h4>
              <ul className="list-disc list-inside space-y-1 text-sm text-red-700">
                <li>Activez l'API "My Business Account Management API" dans Google Cloud Console</li>
                <li>Activez l'API "My Business Business Information API"</li>
                <li>Vérifiez que votre compte a accès à Google My Business</li>
                <li>Attendez 5-10 minutes après activation des APIs</li>
              </ul>
            </div>
          )}

          {message.includes('Edge Function') && (
            <div className="bg-white/50 rounded-lg p-4 mb-4">
              <h4 className="font-semibold text-red-800 mb-2">Problème de connexion :</h4>
              <ul className="list-disc list-inside space-y-1 text-sm text-red-700">
                <li>Vérifiez votre connexion internet</li>
                <li>Les fonctions Supabase Edge peuvent être temporairement indisponibles</li>
                <li>Vérifiez la configuration de vos variables d'environnement</li>
              </ul>
            </div>
          )}

          <div className="flex flex-col sm:flex-row gap-3">
            {isTokenError ? (
              <button
                onClick={() => {
                  if (onTokenExpired) {
                    onTokenExpired();
                  } else {
                    // Fallback si onTokenExpired n'est pas défini
                    window.location.reload();
                  }
                }}
                className="flex items-center justify-center px-4 py-2 bg-[#4285F4] text-white rounded-lg hover:bg-[#3367D6] transition-colors font-medium"
              >
                <RefreshCw className="w-4 h-4 mr-2" />
                Reconnecter Google
              </button>
            ) : (
            <button
              onClick={handleRetry}
              className="flex items-center justify-center px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors font-medium"
            >
              <RefreshCw className="w-4 h-4 mr-2" />
              Réessayer
            </button>
            )}
            <a
              href="https://console.cloud.google.com/apis/dashboard"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center justify-center px-4 py-2 bg-white text-red-600 border border-red-300 rounded-lg hover:bg-red-50 transition-colors font-medium"
            >
              <ExternalLink className="w-4 h-4 mr-2" />
              Google Cloud Console
            </a>
          </div>
        </div>
      </div>
    </div>
    );
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#4285F4] via-[#34A853] to-[#FBBC05] flex items-center justify-center p-4">
      <div className="max-w-2xl w-full">
        <div className="bg-white rounded-2xl shadow-2xl p-8">
          {/* Header */}
          <div className="text-center mb-8">
            <div className="w-16 h-16 bg-gradient-to-r from-[#4285F4] to-[#34A853] rounded-full flex items-center justify-center mx-auto mb-4">
              <Building2 className="w-8 h-8 text-white" />
            </div>
            <h2 className="text-2xl font-bold text-gray-900 mb-2">
              Configuration Google My Business
            </h2>
            <p className="text-gray-600">
              Connectez vos établissements pour commencer à gérer vos avis
            </p>
          </div>

          {/* Connection Status */}
          <div className="flex items-center justify-center mb-6">
            <div className={`flex items-center px-4 py-2 rounded-full text-sm font-medium ${
              error ? 'bg-red-100 text-red-700' : 
              loading ? 'bg-yellow-100 text-yellow-700' : 
              'bg-green-100 text-green-700'
            }`}>
              {error ? <WifiOff className="w-4 h-4 mr-2" /> : 
               loading ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : 
               <Wifi className="w-4 h-4 mr-2" />}
              {error ? 'Connexion échouée' : 
               loading ? 'Connexion en cours...' : 
               'Connecté'}
            </div>
          </div>

          {error && <ErrorDisplay message={error} />}

          {loading && !error && (
            <div className="flex flex-col items-center justify-center py-12">
              <Loader2 className="w-12 h-12 animate-spin text-[#4285F4] mb-4" />
              <p className="text-gray-600 text-center">
                {step === 'accounts' ? 'Chargement des comptes...' : 'Chargement des établissements...'}
              </p>
            </div>
          )}

          {!loading && !error && (
            <>
              {/* Account Selection */}
              <div className="mb-8">
                <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center">
                  <Building2 className="w-5 h-5 mr-2 text-[#4285F4]" />
                  Sélectionnez votre compte ({accounts.length})
                </h3>
                
                {accounts.length === 0 ? (
                  <div className="text-center py-8 bg-gray-50 rounded-xl">
                    <Building2 className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                    <p className="text-gray-600 mb-4">Aucun compte Google My Business trouvé</p>
                    <p className="text-sm text-gray-500">
                      Vérifiez que vous avez créé un profil d'entreprise Google
                    </p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {accounts.map((account) => (
                      <div
                        key={account.name}
                        className={`p-4 border-2 rounded-xl cursor-pointer transition-all ${
                          selectedAccount?.name === account.name
                            ? 'border-[#4285F4] bg-[#4285F4]/5 shadow-md'
                            : 'border-gray-200 hover:border-gray-300 hover:shadow-sm'
                        }`}
                        onClick={() => handleAccountSelect(account)}
                      >
                        <div className="flex items-center">
                          <div className={`w-10 h-10 rounded-full flex items-center justify-center mr-3 ${
                            selectedAccount?.name === account.name 
                              ? 'bg-[#4285F4] text-white' 
                              : 'bg-gray-100 text-gray-600'
                          }`}>
                            <Building2 className="w-5 h-5" />
                          </div>
                          <div className="flex-1">
                            <div className="font-medium text-gray-900">{account.accountName}</div>
                            <div className="text-sm text-gray-500">{account.name}</div>
                          </div>
                          {selectedAccount?.name === account.name && (
                            <CheckCircle className="w-5 h-5 text-[#4285F4]" />
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Location Selection */}
              {step === 'locations' && selectedAccount && (
                <div className="mb-8">
                  <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center">
                    <MapPin className="w-5 h-5 mr-2 text-[#34A853]" />
                    Sélectionnez votre établissement ({locations.length})
                  </h3>
                  
                  {locations.length === 0 ? (
                    <div className="text-center py-8 bg-gray-50 rounded-xl">
                      <MapPin className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                      <p className="text-gray-600 mb-4">Aucun établissement trouvé</p>
                      <p className="text-sm text-gray-500">
                        Créez un établissement dans Google My Business
                      </p>
                    </div>
                  ) : (
                    <div className="space-y-3">
                      {locations.map((location) => (
                        <div
                          key={location.name}
                          className={`p-4 border-2 rounded-xl cursor-pointer transition-all ${
                            selectedLocation?.name === location.name
                              ? 'border-[#34A853] bg-[#34A853]/5 shadow-md'
                              : 'border-gray-200 hover:border-gray-300 hover:shadow-sm'
                          }`}
                          onClick={() => setSelectedLocation(location)}
                        >
                          <div className="flex items-center">
                            <div className={`w-10 h-10 rounded-full flex items-center justify-center mr-3 ${
                              selectedLocation?.name === location.name 
                                ? 'bg-[#34A853] text-white' 
                                : 'bg-gray-100 text-gray-600'
                            }`}>
                              <MapPin className="w-5 h-5" />
                            </div>
                            <div className="flex-1">
                              <div className="font-medium text-gray-900">{location.locationName}</div>
                              <div className="text-sm text-gray-500">
                                {location.primaryCategory?.displayName}
                              </div>
                              {location.address && (
                                <div className="text-xs text-gray-400">
                                  {location.address.locality}, {location.address.administrativeArea}
                                </div>
                              )}
                            </div>
                            {selectedLocation?.name === location.name && (
                              <CheckCircle className="w-5 h-5 text-[#34A853]" />
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {/* Complete Button */}
              {selectedAccount && selectedLocation && (
                <div className="text-center">
                  <button
                    onClick={handleComplete}
                    className="inline-flex items-center px-8 py-3 bg-gradient-to-r from-[#4285F4] to-[#34A853] text-white rounded-xl hover:from-[#3367D6] hover:to-[#2D8A47] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#4285F4] transition-all transform hover:scale-105 font-medium shadow-lg"
                  >
                    <CheckCircle className="w-5 h-5 mr-2" />
                    Terminer la configuration
                  </button>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default GoogleBusinessSetup;