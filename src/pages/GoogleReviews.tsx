import React, { useState, useEffect } from 'react';
import { Star, MessageSquare, User, Calendar } from 'lucide-react';
import StarlinkoLogo from '../components/StarlinkoLogo';

const GOOGLE_CLIENT_ID = import.meta.env.VITE_GOOGLE_CLIENT_ID || '';

interface GoogleReview {
  reviewId: string;
  reviewer: {
    profilePhotoUrl: string;
    displayName: string;
  };
  starRating: 'ONE' | 'TWO' | 'THREE' | 'FOUR' | 'FIVE';
  comment: string;
  createTime: string;
  reviewReply?: {
    comment: string;
    updateTime: string;
  };
}

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
}

interface GoogleReviewsProps {
  user?: any;
  accessToken?: string;
  selectedLocationId: string;
  setSelectedLocationId: (id: string) => void;
  selectedAccountId: string;
  onNavigate: (page: string) => void;
}

const GoogleReviews: React.FC<GoogleReviewsProps> = ({ 
  user: propUser, 
  accessToken: propAccessToken, 
  selectedLocationId: propSelectedLocationId,
  setSelectedLocationId: propSetSelectedLocationId,
  selectedAccountId: propSelectedAccountId,
  onNavigate
}) => {
  const [accessToken, setAccessToken] = useState<string>(propAccessToken || '');
  const [user, setUser] = useState<any>(propUser || null);
  const [accounts, setAccounts] = useState<GoogleAccount[]>([]);
  const [locations, setLocations] = useState<GoogleLocation[]>([]);
  const [selectedAccountId, setSelectedAccountId] = useState<string>(propSelectedAccountId || '');
  const [reviews, setReviews] = useState<GoogleReview[]>([]);
  const [loading, setLoading] = useState(false);
  const [replyingTo, setReplyingTo] = useState<string>('');
  
  const selectedLocationId = propSelectedLocationId;
  const setSelectedLocationId = propSetSelectedLocationId;

  const fetchAccounts = async (token: string) => {
    try {
      // Use the new Google My Business API endpoint
      const response = await fetch('https://mybusinessaccountmanagement.googleapis.com/v1/accounts', {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      const data = await response.json();
      
      console.log('GMB Accounts:', data);
      
      if (data.accounts) {
        setAccounts(data.accounts);
        if (data.accounts.length > 0) {
          if (!selectedAccountId) {
            setSelectedAccountId(data.accounts[0].name);
            fetchLocations(token, data.accounts[0].name);
          } else {
            fetchLocations(token, selectedAccountId);
          }
        }
      }
    } catch (error) {
      console.error('Erreur lors de la récupération des comptes:', error);
    } catch (error) {
      console.error('Erreur lors de la récupération des comptes:', error);
    }
  };

  const fetchLocations = async (token: string, accountId: string) => {
    try {
      // Use the new API endpoint
      const response = await fetch(`https://mybusinessbusinessinformation.googleapis.com/v1/${accountId}/locations`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      const data = await response.json();
      
      console.log('GMB Locations:', data);
      
      if (data.locations) {
        setLocations(data.locations);
        if (data.locations.length > 0) {
          if (!selectedLocationId) {
            setSelectedLocationId(data.locations[0].name);
          }
        }
      }
    } catch (error) {
      console.error('Erreur lors de la récupération des établissements:', error);
    }
  };

  const fetchReviews = async () => {
    if (!selectedLocationId || !accessToken) {
      return;
    }

    setLoading(true);
    try {
      // Use the new fetch-reviews function that stores in Supabase
      const response = await fetch(`${import.meta.env.VITE_SUPABASE_URL}/functions/v1/fetch-reviews`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${import.meta.env.VITE_SUPABASE_ANON_KEY}`,
        },
        body: JSON.stringify({
          accessToken,
          locationId: selectedLocationId,
        }),
      });
      
      const data = await response.json();
      if (data.success) {
        // Refresh the reviews display
        await fetchStoredReviews();
        
        if (data.newReviews > 0) {
          console.log(`${data.newReviews} nouveaux avis ajoutés`);
        }
      }
    } catch (error) {
      console.error('Erreur lors de la récupération des avis:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchStoredReviews = async () => {
    if (!selectedLocationId) return;

    try {
      const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
      const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;
      
      const response = await fetch(`${supabaseUrl}/rest/v1/reviews?location_id=eq.${selectedLocationId}&order=created_at.desc`, {
        headers: {
          'apikey': supabaseAnonKey,
          'Authorization': `Bearer ${supabaseAnonKey}`,
        },
      });
      
      const storedReviews = await response.json();
      
      // Convert stored reviews to GoogleReview format
      const convertedReviews = storedReviews.map((review: any) => ({
        reviewId: review.review_id,
        reviewer: {
          displayName: review.author,
          profilePhotoUrl: '',
        },
        starRating: ['', 'ONE', 'TWO', 'THREE', 'FOUR', 'FIVE'][review.rating],
        comment: review.comment,
        createTime: review.review_date,
        reviewReply: review.replied ? { comment: 'Répondu', updateTime: review.updated_at } : undefined,
      }));
      
      setReviews(convertedReviews);
    } catch (error) {
      console.error('Erreur lors de la récupération des avis stockés:', error);
    }
  };

  const replyToReview = async (reviewId: string) => {
    if (!selectedLocationId || !accessToken) {
      return;
    }

    setReplyingTo(reviewId);
    try {
      const response = await fetch('/api/google-oauth?action=reply-review', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          accessToken,
          locationId: selectedLocationId,
          reviewId,
          comment: "Merci beaucoup pour votre retour 🙏",
        }),
      });

      if (response.ok) {
        // Rafraîchir les avis pour voir la réponse
        fetchReviews();
      }
    } catch (error) {
      console.error('Erreur lors de la réponse à l\'avis:', error);
    } finally {
      setReplyingTo('');
    }
  };

  // Fonction pour rafraîchir le token si nécessaire
  const refreshAccessToken = async () => {
    const refreshToken = localStorage.getItem('refreshToken');
    if (!refreshToken) return null;

    try {
      const response = await fetch('/api/google-oauth?action=refresh-token', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          refreshToken,
        }),
      });

      const data = await response.json();
      if (response.ok) {
        setAccessToken(data.access_token);
        localStorage.setItem('accessToken', data.access_token);
        return data.access_token;
      }
    } catch (error) {
      console.error('Erreur lors du rafraîchissement du token:', error);
    }
    return null;
  };

  // Load saved data and fetch accounts on startup
  useEffect(() => {
    if (accessToken && user) {
      fetchAccounts(accessToken);
      if (selectedLocationId) {
        fetchStoredReviews();
      }
    }
  }, [accessToken, user, selectedLocationId]);

  if (loading && reviews.length === 0) {
    return (
      <div className="flex items-center justify-center min-h-[calc(100vh-64px)]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#4285F4] mx-auto mb-4"></div>
          <p className="text-gray-600">Chargement des avis...</p>
        </div>
      </div>
    );
  }

  const getStarRating = (rating: string): number => {
    const ratingMap: { [key: string]: number } = {
      'ONE': 1,
      'TWO': 2,
      'THREE': 3,
      'FOUR': 4,
      'FIVE': 5,
    };
    return ratingMap[rating] || 0;
  };

  const renderStars = (rating: number) => {
    return (
      <div className="flex items-center">
        {[1, 2, 3, 4, 5].map((star) => (
          <Star
            key={star}
            className={`w-4 h-4 ${
              star <= rating ? 'text-[#FBBC05] fill-current' : 'text-gray-300'
            }`}
          />
        ))}
        <span className="ml-2 text-sm text-gray-600">({rating}/5)</span>
      </div>
    );
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('fr-FR', {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
    });
  };

  return (
    <div className="min-h-screen bg-[#F1F3F4]">
      {/* Contenu principal */}
      <main className="max-w-4xl mx-auto py-8 px-4 sm:px-6 lg:px-8 pt-20">
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Avis Google My Business</h1>
          <p className="text-gray-600">Gérez et répondez à vos avis clients</p>
        </div>

        {/* Sélection des comptes et établissements */}
        <div className="bg-white rounded-xl shadow-sm p-6 mb-8">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">
            Établissement sélectionné
          </h2>
          
          <div className="bg-gray-50 rounded-lg p-4 mb-4">
            <div className="font-medium text-gray-900">
              {locations.find(l => l.name === selectedLocationId)?.locationName || 'Chargement...'}
            </div>
            <div className="text-sm text-gray-500">
              {locations.find(l => l.name === selectedLocationId)?.primaryCategory?.displayName}
            </div>
          </div>

          <button
            onClick={fetchReviews}
            disabled={loading || !selectedLocationId}
            className="bg-[#4285F4] text-white px-6 py-3 rounded-lg hover:bg-[#3367D6] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#4285F4] disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-200 font-medium"
          >
            {loading ? 'Synchronisation...' : 'Synchroniser les avis'}
          </button>
        </div>

        {/* Liste des avis */}
        <div className="space-y-6">
          {reviews.length === 0 && !loading && (
            <div className="text-center py-12 bg-white rounded-xl shadow-sm">
              <MessageSquare className="mx-auto h-12 w-12 text-gray-400" />
              <h3 className="mt-2 text-sm font-medium text-gray-900">Aucun avis</h3>
              <p className="mt-1 text-sm text-gray-500">
                Cliquez sur "Synchroniser les avis" pour charger vos avis
              </p>
            </div>
          )}

          {reviews.map((review) => (
            <div key={review.reviewId} className="bg-white rounded-xl shadow-sm p-6">
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center">
                  {review.reviewer.profilePhotoUrl ? (
                    <img
                      src={review.reviewer.profilePhotoUrl}
                      alt={review.reviewer.displayName}
                      className="w-10 h-10 rounded-full mr-3"
                    />
                  ) : (
                    <div className="w-10 h-10 rounded-full bg-gray-300 flex items-center justify-center mr-3">
                      <User className="w-6 h-6 text-gray-600" />
                    </div>
                  )}
                  <div>
                    <h3 className="font-semibold text-gray-900">
                      {review.reviewer.displayName}
                    </h3>
                    <div className="flex items-center mt-1">
                      {renderStars(getStarRating(review.starRating))}
                    </div>
                  </div>
                </div>
                
                <div className="flex items-center text-gray-500 text-sm">
                  <Calendar className="w-4 h-4 mr-1" />
                  {formatDate(review.createTime)}
                </div>
              </div>

              <p className="text-gray-700 mb-4 leading-relaxed">
                {review.comment}
              </p>

              {review.reviewReply ? (
                <div className="bg-[#F1F3F4] rounded-lg p-4 mb-4">
                  <div className="flex items-center mb-2">
                    <span className="font-medium text-gray-900">Votre réponse:</span>
                    <span className="ml-2 text-sm text-gray-500">
                      {formatDate(review.reviewReply.updateTime)}
                    </span>
                  </div>
                  <p className="text-gray-700">{review.reviewReply.comment}</p>
                </div>
              ) : (
                <button
                  onClick={() => replyToReview(review.reviewId)}
                  disabled={replyingTo === review.reviewId}
                  className="inline-flex items-center px-4 py-2 bg-[#4285F4] text-white text-sm font-medium rounded-lg hover:bg-[#3367D6] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#4285F4] disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-200"
                >
                  <MessageSquare className="w-4 h-4 mr-2" />
                  {replyingTo === review.reviewId ? 'Envoi...' : 'Répondre avec IA'}
                </button>
              )}
            </div>
          ))}
        </div>
      </main>
    </div>
  );
};

export default GoogleReviews;