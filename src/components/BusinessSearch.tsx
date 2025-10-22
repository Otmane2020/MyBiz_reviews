import React, { useState, useCallback, useEffect } from 'react';
import { 
  Search, 
  MapPin, 
  Building2, 
  Loader2, 
  ExternalLink, 
  CheckCircle, 
  AlertCircle,
  Filter,
  Star
} from 'lucide-react';
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
  business_status?: string;
  opening_hours?: {
    open_now?: boolean;
  };
  photos?: Array<{
    photo_reference: string;
    height: number;
    width: number;
  }>;
}

interface BusinessSearchProps {
  onBusinessSelect?: (business: Business) => void;
  userId?: string;
  autoImportReviews?: boolean;
  className?: string;
  placeholder?: string;
}

const BusinessSearch: React.FC<BusinessSearchProps> = ({ 
  onBusinessSelect, 
  userId, 
  autoImportReviews = true,
  className = '',
  placeholder = "Ex: Restaurant Le Gourmet"
}) => {
  const [query, setQuery] = useState('');
  const [location, setLocation] = useState('');
  const [businesses, setBusinesses] = useState<Business[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [importingReviews, setImportingReviews] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [recentSearches, setRecentSearches] = useState<string[]>([]);
  const [searchHistory, setSearchHistory] = useState<Business[]>([]);

  // Load recent searches from localStorage on component mount
  useEffect(() => {
    const savedSearches = localStorage.getItem('business-recent-searches');
    if (savedSearches) {
      setRecentSearches(JSON.parse(savedSearches));
    }

    const savedHistory = localStorage.getItem('business-search-history');
    if (savedHistory) {
      setSearchHistory(JSON.parse(savedHistory));
    }
  }, []);

  // Save to recent searches
  const saveToRecentSearches = useCallback((searchTerm: string) => {
    const updatedSearches = [
      searchTerm,
      ...recentSearches.filter(s => s !== searchTerm)
    ].slice(0, 5); // Keep only last 5 searches
    
    setRecentSearches(updatedSearches);
    localStorage.setItem('business-recent-searches', JSON.stringify(updatedSearches));
  }, [recentSearches]);

  // Save to search history
  const saveToSearchHistory = useCallback((business: Business) => {
    const updatedHistory = [
      business,
      ...searchHistory.filter(b => b.place_id !== business.place_id)
    ].slice(0, 10); // Keep only last 10 businesses
    
    setSearchHistory(updatedHistory);
    localStorage.setItem('business-search-history', JSON.stringify(updatedHistory));
  }, [searchHistory]);

  const searchBusinesses = async () => {
    if (!query.trim()) {
      setError('Veuillez entrer un nom d\'entreprise');
      return;
    }

    setLoading(true);
    setError(null);
    setBusinesses([]);
    setSuccessMessage(null);

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
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || `Erreur HTTP: ${response.status}`);
      }

      const data = await response.json();

      if (!data.success) {
        throw new Error(data.error || 'Erreur lors de la recherche');
      }

      if (data.status === 'REQUEST_DENIED') {
        throw new Error('API Google Maps non configurée ou restrictions activées');
      }

      if (data.status === 'OVER_QUERY_LIMIT') {
        throw new Error('Quota Google Maps dépassé. Veuillez réessayer plus tard.');
      }

      if (data.status === 'ZERO_RESULTS') {
        setError('Aucune entreprise trouvée pour cette recherche');
        setBusinesses([]);
      } else if (data.status !== 'OK') {
        throw new Error(`Erreur API Google: ${data.status}`);
      }

      const results = data.results || [];
      setBusinesses(results);

      // Save successful search to recent searches
      if (results.length > 0) {
        saveToRecentSearches(query.trim());
      }

    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Erreur inconnue lors de la recherche';
      setError(errorMessage);
      console.error('Search error:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !loading) {
      searchBusinesses();
    }
  };

  const handleBusinessClick = async (business: Business) => {
    // Save to search history
    saveToSearchHistory(business);

    // Call parent callback if provided
    if (onBusinessSelect) {
      onBusinessSelect(business);
    }

    // Auto-import reviews if enabled and user is logged in
    if (!autoImportReviews || !userId) {
      return;
    }

    setImportingReviews(business.place_id);
    setError(null);
    setSuccessMessage(null);

    try {
      const result = await importGoogleReviewsViaEdgeFunction(business, userId);

      if (result.success) {
        setSuccessMessage(
          result.reviewsCount > 0 
            ? `✅ ${result.reviewsCount} avis importés avec succès !`
            : '✅ Aucun nouvel avis à importer.'
        );
        setTimeout(() => setSuccessMessage(null), 5000);
      } else {
        setError(result.error || 'Erreur lors de l\'importation des avis');
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Erreur inconnue lors de l\'importation';
      setError(errorMessage);
    } finally {
      setImportingReviews(null);
    }
  };

  const clearError = () => setError(null);
  const clearSuccess = () => setSuccessMessage(null);

  const BusinessRating: React.FC<{ rating: number; totalReviews?: number }> = ({ rating, totalReviews }) => (
    <div className="flex items-center mt-2 space-x-2">
      <div className="flex items-center bg-yellow-50 px-2 py-1 rounded-full">
        <Star className="w-3 h-3 fill-yellow-500 text-yellow-500 mr-1" />
        <span className="text-yellow-700 font-semibold text-sm">{rating}</span>
      </div>
      {totalReviews && (
        <span className="text-gray-500 text-xs">
          ({totalReviews.toLocaleString()} avis)
        </span>
      )}
    </div>
  );

  const BusinessStatus: React.FC<{ business: Business }> = ({ business }) => {
    if (business.business_status === 'CLOSED_PERMANENTLY') {
      return (
        <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-red-100 text-red-800">
          Fermé définitivement
        </span>
      );
    }
    
    if (business.opening_hours?.open_now !== undefined) {
      return (
        <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
          business.opening_hours.open_now 
            ? 'bg-green-100 text-green-800' 
            : 'bg-red-100 text-red-800'
        }`}>
          {business.opening_hours.open_now ? 'Ouvert' : 'Fermé'}
        </span>
      );
    }
    
    return null;
  };

  return (
    <div className={`bg-white rounded-lg shadow-md p-6 ${className}`}>
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold text-gray-800 flex items-center">
          <Search className="w-6 h-6 mr-2 text-blue-600" />
          Rechercher une entreprise
        </h2>
        {(recentSearches.length > 0 || searchHistory.length > 0) && (
          <div className="flex items-center text-sm text-gray-500">
            <Filter className="w-4 h-4 mr-1" />
            Historique disponible
          </div>
        )}
      </div>

      {/* Search Form */}
      <div className="space-y-4 mb-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Nom de l'entreprise *
          </label>
          <input
            type="text"
            value={query}
            onChange={(e) => {
              setQuery(e.target.value);
              clearError();
            }}
            onKeyPress={handleKeyPress}
            placeholder={placeholder}
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors"
            disabled={loading}
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
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors"
            disabled={loading}
          />
        </div>

        <button
          onClick={searchBusinesses}
          disabled={loading || !query.trim()}
          className="w-full bg-blue-600 text-white py-3 px-4 rounded-lg hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed flex items-center justify-center transition-colors font-medium"
        >
          {loading ? (
            <>
              <Loader2 className="w-5 h-5 mr-2 animate-spin" />
              Recherche en cours...
            </>
          ) : (
            <>
              <Search className="w-5 h-5 mr-2" />
              Rechercher sur Google Maps
            </>
          )}
        </button>
      </div>

      {/* Recent Searches Quick Access */}
      {recentSearches.length > 0 && businesses.length === 0 && !loading && (
        <div className="mb-4">
          <h3 className="text-sm font-medium text-gray-700 mb-2">Recherches récentes :</h3>
          <div className="flex flex-wrap gap-2">
            {recentSearches.map((searchTerm, index) => (
              <button
                key={index}
                onClick={() => {
                  setQuery(searchTerm);
                  setTimeout(() => searchBusinesses(), 100);
                }}
                className="px-3 py-1 bg-gray-100 text-gray-700 rounded-full text-sm hover:bg-gray-200 transition-colors"
              >
                {searchTerm}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Status Messages */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-4 flex items-start">
          <AlertCircle className="w-5 h-5 text-red-500 mr-2 mt-0.5 flex-shrink-0" />
          <div className="flex-1">
            <p className="text-red-800 text-sm">{error}</p>
            <button
              onClick={clearError}
              className="text-red-600 hover:text-red-800 text-xs mt-1 font-medium"
            >
              × Fermer
            </button>
          </div>
        </div>
      )}

      {successMessage && (
        <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-4 flex items-start">
          <CheckCircle className="w-5 h-5 text-green-600 mr-2 mt-0.5 flex-shrink-0" />
          <div className="flex-1">
            <p className="text-green-800 text-sm font-medium">{successMessage}</p>
            <button
              onClick={clearSuccess}
              className="text-green-600 hover:text-green-800 text-xs mt-1 font-medium"
            >
              × Fermer
            </button>
          </div>
        </div>
      )}

      {/* Search Results */}
      {businesses.length > 0 && (
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold text-gray-800">
              Résultats ({businesses.length})
            </h3>
            <span className="text-sm text-gray-500">
              Cliquez pour {autoImportReviews && userId ? 'importer les avis' : 'sélectionner'}
            </span>
          </div>
          
          <div className="max-h-96 overflow-y-auto space-y-3">
            {businesses.map((business) => (
              <div
                key={business.place_id}
                className={`border border-gray-200 rounded-lg p-4 hover:bg-blue-50 hover:border-blue-300 transition-all cursor-pointer relative group ${
                  importingReviews === business.place_id ? 'bg-blue-50 border-blue-300' : ''
                }`}
                onClick={() => handleBusinessClick(business)}
              >
                {importingReviews === business.place_id && (
                  <div className="absolute inset-0 bg-blue-50/90 rounded-lg flex items-center justify-center z-10">
                    <div className="flex items-center bg-white px-4 py-2 rounded-full shadow-sm">
                      <Loader2 className="w-5 h-5 mr-2 animate-spin text-blue-600" />
                      <span className="text-blue-600 font-medium text-sm">
                        Importation des avis...
                      </span>
                    </div>
                  </div>
                )}
                
                <div className="flex items-start justify-between">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between mb-2">
                      <h4 className="font-semibold text-gray-900 flex items-center text-lg">
                        <Building2 className="w-5 h-5 mr-2 text-blue-600 flex-shrink-0" />
                        <span className="truncate">{business.name}</span>
                      </h4>
                      <BusinessStatus business={business} />
                    </div>
                    
                    <p className="text-sm text-gray-600 flex items-start mt-1">
                      <MapPin className="w-4 h-4 mr-2 text-gray-400 mt-0.5 flex-shrink-0" />
                      <span className="line-clamp-2">{business.formatted_address}</span>
                    </p>
                    
                    {business.rating && (
                      <BusinessRating 
                        rating={business.rating} 
                        totalReviews={business.user_ratings_total} 
                      />
                    )}
                    
                    {business.types && (
                      <div className="flex flex-wrap gap-1 mt-2">
                        {business.types.slice(0, 3).map((type, index) => (
                          <span 
                            key={index}
                            className="inline-block bg-gray-100 text-gray-600 px-2 py-1 rounded text-xs capitalize"
                          >
                            {type.replace(/_/g, ' ')}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>
                  
                  <a
                    href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(business.name)}&query_place_id=${business.place_id}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="ml-4 text-gray-400 hover:text-blue-600 transition-colors flex-shrink-0"
                    onClick={(e) => e.stopPropagation()}
                    title="Voir sur Google Maps"
                  >
                    <ExternalLink className="w-5 h-5" />
                  </a>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Empty State with Search History */}
      {!loading && businesses.length === 0 && searchHistory.length > 0 && (
        <div className="mt-6 pt-6 border-t border-gray-200">
          <h3 className="text-sm font-medium text-gray-700 mb-3">
            Entreprises récemment consultées :
          </h3>
          <div className="space-y-2">
            {searchHistory.slice(0, 3).map((business) => (
              <div
                key={business.place_id}
                className="border border-gray-200 rounded-lg p-3 hover:bg-gray-50 cursor-pointer"
                onClick={() => handleBusinessClick(business)}
              >
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="font-medium text-gray-900 text-sm">
                      {business.name}
                    </h4>
                    <p className="text-xs text-gray-500 truncate">
                      {business.formatted_address}
                    </p>
                  </div>
                  {business.rating && (
                    <div className="flex items-center text-xs text-gray-500">
                      <Star className="w-3 h-3 fill-yellow-500 text-yellow-500 mr-1" />
                      {business.rating}
                    </div>
                  )}
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