import React, { useState, useEffect } from 'react';
import { Loader2, Building2, MapPin, AlertCircle, CheckCircle } from 'lucide-react';
import { supabase } from '../lib/supabase';

interface GoogleBusinessSetupProps {
  accessToken: string;
  onSetupComplete: (accountId: string, locationId: string) => void;
}

interface Account {
  name: string;
  accountName: string;
}

interface Location {
  name: string;
  locationName: string;
}

const GoogleBusinessSetup: React.FC<GoogleBusinessSetupProps> = ({ 
  accessToken, 
  onSetupComplete 
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
      debugLog('Starting fetchAccounts', { accessToken: accessToken ? `${accessToken.substring(0, 10)}...` : 'null' });
      setLoading(true);
      setError(null);

      const { data, error: supabaseError } = await supabase.functions.invoke('google-oauth', {
        body: {
          action: 'get-accounts',
          accessToken: accessToken
        }
      });

      debugLog('fetchAccounts response', { data, error: supabaseError });

      if (supabaseError) {
        throw new Error(`Supabase error: ${supabaseError.message}`);
      }

      if (!data.success) {
        throw new Error(data.error || 'Failed to fetch accounts');
      }

      setAccounts(data.accounts || []);
      debugLog(`Found ${data.accounts?.length || 0} accounts`);

      if (data.accounts && data.accounts.length > 0) {
        setSelectedAccount(data.accounts[0]);
      }

    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Unknown error occurred';
      debugLog('fetchAccounts error', errorMessage);
      setError(`Erreur lors du chargement des comptes: ${errorMessage}`);
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

      const { data, error: supabaseError } = await supabase.functions.invoke('google-oauth', {
        body: {
          action: 'get-locations',
          accessToken: accessToken,
          accountId: account.name
        }
      });

      debugLog('fetchLocations response', { data, error: supabaseError });

      if (supabaseError) {
        throw new Error(`Supabase error: ${supabaseError.message}`);
      }

      if (!data.success) {
        throw new Error(data.error || 'Failed to fetch locations');
      }

      setLocations(data.locations || []);
      debugLog(`Found ${data.locations?.length || 0} locations`);

      if (data.locations && data.locations.length > 0) {
        setSelectedLocation(data.locations[0]);
      }

      setStep('locations');

    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Unknown error occurred';
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

  // Load accounts on component mount
  useEffect(() => {
    if (accessToken) {
      fetchAccounts();
    } else {
      setError('Token d\'accès manquant');
    }
  }, [accessToken]);

  // Error display component
  const ErrorDisplay = ({ message }: { message: string }) => (
    <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-4">
      <div className="flex items-center">
        <AlertCircle className="w-5 h-5 text-red-500 mr-2" />
        <div>
          <h3 className="text-red-800 font-medium">Erreur de connexion à Google My Business</h3>
          <p className="text-red-700 text-sm mt-1">{message}</p>
          {message.includes('My Business Account Management API') && (
            <div className="mt-3 text-sm text-red-600">
              <p className="font-medium">Actions requises :</p>
              <ul className="list-disc list-inside mt-1 space-y-1">
                <li>Activez l'API "My Business Account Management API" dans Google Cloud Console</li>
                <li>Activez l'API "My Business Business Information API"</li>
                <li>Vérifiez que votre compte a accès à Google My Business</li>
                <li>Attendez 5-10 minutes après activation des APIs</li>
              </ul>
            </div>
          )}
        </div>
      </div>
    </div>
  );

  return (
    <div className="max-w-2xl mx-auto p-6">
      <div className="bg-white rounded-lg shadow-lg p-6">
        <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center">
          <Building2 className="w-6 h-6 mr-2 text-blue-600" />
          Configuration Google My Business
        </h2>

        {error && <ErrorDisplay message={error} />}

        {loading && (
          <div className="flex items-center justify-center py-8">
            <Loader2 className="w-8 h-8 animate-spin text-blue-600 mr-3" />
            <span className="text-gray-600">
              {step === 'accounts' ? 'Chargement des comptes...' : 'Chargement des établissements...'}
            </span>
          </div>
        )}

        {!loading && !error && (
          <>
            {/* Account Selection */}
            <div className="mb-6">
              <h3 className="text-lg font-semibold text-gray-800 mb-3 flex items-center">
                <Building2 className="w-5 h-5 mr-2 text-blue-600" />
                Sélectionnez votre compte ({accounts.length})
              </h3>
              
              {accounts.length === 0 ? (
                <div className="text-gray-500 text-center py-4">
                  Aucun compte Google My Business trouvé. Vérifiez vos permissions.
                </div>
              ) : (
                <div className="space-y-2">
                  {accounts.map((account) => (
                    <div
                      key={account.name}
                      className={`p-3 border rounded-lg cursor-pointer transition-colors ${
                        selectedAccount?.name === account.name
                          ? 'border-blue-500 bg-blue-50'
                          : 'border-gray-200 hover:border-gray-300'
                      }`}
                      onClick={() => handleAccountSelect(account)}
                    >
                      <div className="font-medium text-gray-900">{account.accountName}</div>
                      <div className="text-sm text-gray-500">{account.name}</div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Location Selection */}
            {step === 'locations' && selectedAccount && (
              <div className="mb-6">
                <h3 className="text-lg font-semibold text-gray-800 mb-3 flex items-center">
                  <MapPin className="w-5 h-5 mr-2 text-green-600" />
                  Sélectionnez votre établissement ({locations.length})
                </h3>
                
                {locations.length === 0 ? (
                  <div className="text-gray-500 text-center py-4">
                    Aucun établissement trouvé pour ce compte.
                  </div>
                ) : (
                  <div className="space-y-2">
                    {locations.map((location) => (
                      <div
                        key={location.name}
                        className={`p-3 border rounded-lg cursor-pointer transition-colors ${
                          selectedLocation?.name === location.name
                            ? 'border-green-500 bg-green-50'
                            : 'border-gray-200 hover:border-gray-300'
                        }`}
                        onClick={() => setSelectedLocation(location)}
                      >
                        <div className="font-medium text-gray-900">{location.locationName}</div>
                        <div className="text-sm text-gray-500">{location.name}</div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* Complete Button */}
            {selectedAccount && selectedLocation && (
              <div className="flex justify-end">
                <button
                  onClick={handleComplete}
                  className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors flex items-center"
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
  );
};

export default GoogleBusinessSetup;