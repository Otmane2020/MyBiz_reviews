import React, { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { Building2, MapPin, Star, CheckCircle, AlertCircle, Loader2 } from 'lucide-react';

interface GoogleBusinessSetupProps {
  accessToken?: string;
  onSetupComplete: (locationData: any) => void;
}

interface Account {
  name: string;
  accountName?: string;
}

interface Location {
  name: string;
  title?: string;
  storefrontAddress?: {
    addressLines?: string[];
    locality?: string;
    administrativeArea?: string;
    postalCode?: string;
  };
}

export default function GoogleBusinessSetup({ accessToken, onSetupComplete }: GoogleBusinessSetupProps) {
  const [step, setStep] = useState<'connect' | 'accounts' | 'locations' | 'reviews'>('connect');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [accounts, setAccounts] = useState<Account[]>([]);
  const [locations, setLocations] = useState<Location[]>([]);
  const [selectedAccount, setSelectedAccount] = useState<string | null>(null);
  const [selectedLocation, setSelectedLocation] = useState<string | null>(null);
  const [reviews, setReviews] = useState<any[]>([]);

  useEffect(() => {
    if (accessToken) {
      setStep('accounts');
      fetchAccounts();
    }
  }, [accessToken]);

  const handleGoogleConnect = () => {
    const clientId = import.meta.env.VITE_GOOGLE_CLIENT_ID;
    const redirectUri = `${window.location.origin}/auth/callback`;
    
    const scope = [
      'https://www.googleapis.com/auth/business.manage',
      'https://www.googleapis.com/auth/userinfo.email',
      'https://www.googleapis.com/auth/userinfo.profile'
    ].join(' ');

    const authUrl = `https://accounts.google.com/oauth/authorize?` +
      `client_id=${clientId}&` +
      `redirect_uri=${encodeURIComponent(redirectUri)}&` +
      `scope=${encodeURIComponent(scope)}&` +
      `response_type=code&` +
      `access_type=offline&` +
      `prompt=consent`;

    window.location.href = authUrl;
  };

  const fetchAccounts = async () => {
    if (!accessToken) return;
    
    setLoading(true);
    setError(null);

    try {
      const { data, error } = await supabase.functions.invoke('auth-login', {
        body: {
          action: 'get-accounts',
          accessToken: accessToken
        }
      });

      if (error) throw error;

      if (data.success) {
        setAccounts(data.accounts || []);
        if (data.accounts?.length === 1) {
          setSelectedAccount(data.accounts[0].name);
          fetchLocations(data.accounts[0].name);
        }
      } else {
        throw new Error(data.error?.message || 'Erreur lors de la récupération des comptes');
      }
    } catch (err: any) {
      console.error('Error fetching accounts:', err);
      setError(err.message || 'Erreur lors de la récupération des comptes');
    } finally {
      setLoading(false);
    }
  };

  const fetchLocations = async (accountId: string) => {
    if (!accessToken) return;
    
    setLoading(true);
    setError(null);

    try {
      const { data, error } = await supabase.functions.invoke('auth-login', {
        body: {
          action: 'get-locations',
          accessToken: accessToken,
          accountId: accountId
        }
      });

      if (error) throw error;

      if (data.success) {
        setLocations(data.locations || []);
        setStep('locations');
      } else {
        throw new Error(data.error?.message || 'Erreur lors de la récupération des établissements');
      }
    } catch (err: any) {
      console.error('Error fetching locations:', err);
      setError(err.message || 'Erreur lors de la récupération des établissements');
    } finally {
      setLoading(false);
    }
  };

  const fetchReviews = async (locationName: string) => {
    if (!accessToken) return;
    
    setLoading(true);
    setError(null);

    try {
      const { data, error } = await supabase.functions.invoke('auth-login', {
        body: {
          action: 'get-reviews',
          accessToken: accessToken,
          locationName: locationName
        }
      });

      if (error) throw error;

      if (data.success) {
        setReviews(data.reviews || []);
        setStep('reviews');
        
        // Appeler onSetupComplete avec les données de l'établissement
        const selectedLocationData = locations.find(loc => loc.name === locationName);
        onSetupComplete({
          accountId: selectedAccount,
          locationId: locationName,
          locationData: selectedLocationData,
          reviewsCount: data.totalReviews || 0,
          newReviews: data.newReviews || 0
        });
      } else {
        throw new Error(data.error?.message || 'Erreur lors de la récupération des avis');
      }
    } catch (err: any) {
      console.error('Error fetching reviews:', err);
      setError(err.message || 'Erreur lors de la récupération des avis');
    } finally {
      setLoading(false);
    }
  };

  const handleAccountSelect = (accountId: string) => {
    setSelectedAccount(accountId);
    fetchLocations(accountId);
  };

  const handleLocationSelect = (locationName: string) => {
    setSelectedLocation(locationName);
    fetchReviews(locationName);
  };

  if (step === 'connect') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl shadow-xl p-8 max-w-md w-full">
          <div className="text-center mb-8">
            <Building2 className="w-16 h-16 text-blue-600 mx-auto mb-4" />
            <h1 className="text-2xl font-bold text-gray-900 mb-2">
              Connecter Google My Business
            </h1>
            <p className="text-gray-600">
              Connectez votre compte Google My Business pour gérer vos avis
            </p>
          </div>

          <button
            onClick={handleGoogleConnect}
            className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 px-4 rounded-lg transition-colors flex items-center justify-center gap-2"
          >
            <Building2 className="w-5 h-5" />
            Se connecter avec Google
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-4">
      <div className="max-w-4xl mx-auto">
        <div className="bg-white rounded-2xl shadow-xl p-8">
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">
              Configuration Google My Business
            </h1>
            <p className="text-gray-600">
              Sélectionnez votre établissement pour commencer à gérer vos avis
            </p>
          </div>

          {error && (
            <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg flex items-center gap-3">
              <AlertCircle className="w-5 h-5 text-red-500 flex-shrink-0" />
              <p className="text-red-700">{error}</p>
            </div>
          )}

          {step === 'accounts' && (
            <div>
              <h2 className="text-xl font-semibold text-gray-900 mb-4 flex items-center gap-2">
                <Building2 className="w-5 h-5" />
                Sélectionnez votre compte
              </h2>
              
              {loading ? (
                <div className="flex items-center justify-center py-8">
                  <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
                </div>
              ) : (
                <div className="space-y-3">
                  {accounts.map((account) => (
                    <button
                      key={account.name}
                      onClick={() => handleAccountSelect(account.name)}
                      className="w-full p-4 border border-gray-200 rounded-lg hover:border-blue-300 hover:bg-blue-50 transition-colors text-left"
                    >
                      <div className="font-medium text-gray-900">
                        {account.accountName || account.name}
                      </div>
                    </button>
                  ))}
                </div>
              )}
            </div>
          )}

          {step === 'locations' && (
            <div>
              <h2 className="text-xl font-semibold text-gray-900 mb-4 flex items-center gap-2">
                <MapPin className="w-5 h-5" />
                Sélectionnez votre établissement
              </h2>
              
              {loading ? (
                <div className="flex items-center justify-center py-8">
                  <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
                </div>
              ) : (
                <div className="space-y-3">
                  {locations.map((location) => (
                    <button
                      key={location.name}
                      onClick={() => handleLocationSelect(location.name)}
                      className="w-full p-4 border border-gray-200 rounded-lg hover:border-blue-300 hover:bg-blue-50 transition-colors text-left"
                    >
                      <div className="font-medium text-gray-900 mb-1">
                        {location.title || location.name}
                      </div>
                      {location.storefrontAddress && (
                        <div className="text-sm text-gray-600">
                          {location.storefrontAddress.addressLines?.join(', ')}, {' '}
                          {location.storefrontAddress.locality}, {' '}
                          {location.storefrontAddress.administrativeArea} {' '}
                          {location.storefrontAddress.postalCode}
                        </div>
                      )}
                    </button>
                  ))}
                </div>
              )}
            </div>
          )}

          {step === 'reviews' && (
            <div>
              <div className="flex items-center gap-2 mb-6">
                <CheckCircle className="w-6 h-6 text-green-500" />
                <h2 className="text-xl font-semibold text-gray-900">
                  Configuration terminée !
                </h2>
              </div>
              
              <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-6">
                <div className="flex items-center gap-2 mb-2">
                  <Star className="w-5 h-5 text-yellow-500" />
                  <span className="font-medium text-green-800">
                    {reviews.length} avis récupérés
                  </span>
                </div>
                <p className="text-green-700 text-sm">
                  Votre établissement a été configuré avec succès. Vous allez être redirigé vers le tableau de bord.
                </p>
              </div>

              {loading && (
                <div className="flex items-center justify-center py-4">
                  <Loader2 className="w-6 h-6 animate-spin text-blue-600" />
                  <span className="ml-2 text-gray-600">Finalisation...</span>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}