import React, { useState } from 'react';
import { Search, MapPin, Building2, Loader2, ExternalLink, CheckCircle } from 'lucide-react';
import { importGoogleReviewsViaEdgeFunction } from '../lib/googleReviews';
import { supabase } from '../lib/supabase';

interface Business {
  place_id: string;
  name: string;
  formatted_address: string;
  rating?: number;
  user_ratings_total?: number;
  types?: string[];
  geometry?: {
    location: {
      lat: number;
      lng: number;
    };
  };
}

interface BusinessSearchProps {
  onBusinessSelect?: (business: Business) => void;
  userId?: string;
  autoImportReviews?: boolean;
}

const BusinessSearch: React.FC<BusinessSearchProps> = ({ onBusinessSelect, userId, autoImportReviews = true }) => {
  const [query, setQuery] = useState('');
  const [location, setLocation] = useState('');
  const [businesses, setBusinesses] = useState<Business[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [importingReviews, setImportingReviews] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const searchBusinesses = async () => {
    if (!query.trim()) {
      setError('Veuillez entrer un nom d\'entreprise');
      return;
    }

    setLoading(true);
    setError(null);
    setBusinesses([]);

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
            query: query.trim(),
            location: location.trim() || undefined
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

      if (data.status === 'REQUEST_DENIED') {
        throw new Error('API key invalide ou restrictions activées');
      }

      if (data.status !== 'OK' && data.status !== 'ZERO_RESULTS') {
        throw new Error(`Erreur API: ${data.status}`);
      }

      setBusinesses(data.results || []);

      if (data.results?.length === 0) {
        setError('Aucune entreprise trouvée');
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Erreur inconnue';
      setError(errorMessage);
      console.error('Search error:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      searchBusinesses();
    }
  };

  const handleBusinessClick = async (business: Business) => {
    if (onBusinessSelect) {
      onBusinessSelect(business);
    }

    if (!autoImportReviews || !userId) {
      return;
    }

    setImportingReviews(business.place_id);
    setError(null);
    setSuccessMessage(null);

    try {
      const result = await importGoogleReviewsViaEdgeFunction(business, userId);

      if (result.success) {
        setSuccessMessage(`✅ ${result.reviewsCount} avis importés avec succès !`);
        setTimeout(() => setSuccessMessage(null), 5000);
      } else {
        setError(result.error || 'Erreur lors de l\'importation des avis');
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Erreur inconnue';
      setError(errorMessage);
    } finally {
      setImportingReviews(null);
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <h2 className="text-2xl font-bold text-gray-800 mb-6 flex items-center">
        <Search className="w-6 h-6 mr-2 text-blue-600" />
        Rechercher une entreprise
      </h2>

      <div className="space-y-4 mb-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Nom de l'entreprise
          </label>
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder="Ex: Restaurant Le Gourmet"
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Localisation (optionnel)
          </label>
          <input
            type="text"
            value={location}
            onChange={(e) => setLocation(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder="Ex: Paris, France"
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>

        <button
          onClick={searchBusinesses}
          disabled={loading || !query.trim()}
          className="w-full bg-blue-600 text-white py-3 rounded-lg hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed flex items-center justify-center transition-colors"
        >
          {loading ? (
            <>
              <Loader2 className="w-5 h-5 mr-2 animate-spin" />
              Recherche en cours...
            </>
          ) : (
            <>
              <Search className="w-5 h-5 mr-2" />
              Rechercher
            </>
          )}
        </button>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-4">
          <p className="text-red-800 text-sm">{error}</p>
        </div>
      )}

      {successMessage && (
        <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-4 flex items-center">
          <CheckCircle className="w-5 h-5 text-green-600 mr-2" />
          <p className="text-green-800 text-sm font-medium">{successMessage}</p>
        </div>
      )}

      {businesses.length > 0 && (
        <div className="space-y-3">
          <h3 className="text-lg font-semibold text-gray-800 mb-3">
            Résultats ({businesses.length})
          </h3>
          <div className="max-h-96 overflow-y-auto space-y-2">
            {businesses.map((business) => (
              <div
                key={business.place_id}
                className="border border-gray-200 rounded-lg p-4 hover:bg-blue-50 hover:border-blue-300 transition-colors cursor-pointer relative"
                onClick={() => handleBusinessClick(business)}
              >
                {importingReviews === business.place_id && (
                  <div className="absolute inset-0 bg-blue-50/80 rounded-lg flex items-center justify-center">
                    <div className="flex items-center">
                      <Loader2 className="w-5 h-5 mr-2 animate-spin text-blue-600" />
                      <span className="text-blue-600 font-medium">Importation des avis...</span>
                    </div>
                  </div>
                )}
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <h4 className="font-semibold text-gray-900 flex items-center">
                      <Building2 className="w-4 h-4 mr-2 text-blue-600" />
                      {business.name}
                    </h4>
                    <p className="text-sm text-gray-600 flex items-center mt-1">
                      <MapPin className="w-3 h-3 mr-1" />
                      {business.formatted_address}
                    </p>
                    {business.rating && (
                      <div className="flex items-center mt-2">
                        <span className="text-yellow-500 font-semibold">
                          ⭐ {business.rating}
                        </span>
                        {business.user_ratings_total && (
                          <span className="text-gray-500 text-sm ml-2">
                            ({business.user_ratings_total} avis)
                          </span>
                        )}
                      </div>
                    )}
                  </div>
                  <a
                    href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(business.name)}&query_place_id=${business.place_id}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="ml-4 text-blue-600 hover:text-blue-800"
                    onClick={(e) => e.stopPropagation()}
                  >
                    <ExternalLink className="w-5 h-5" />
                  </a>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default BusinessSearch;
