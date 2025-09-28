import React, { useState, useEffect } from 'react';
import { Star, MessageSquare, User, Calendar } from 'lucide-react';
import { useReviewsNotifications } from '../hooks/useReviewsNotifications';
import NotificationToast from '../components/NotificationToast';
import NotificationCenter from '../components/NotificationCenter';

const GOOGLE_CLIENT_ID = import.meta.env.VITE_GOOGLE_CLIENT_ID || '';
const APP_URL = import.meta.env.VITE_APP_URL || 'http://localhost:5173';
const REDIRECT_URI = `${APP_URL}/callback`;

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
  onUserLogin?: (user: any, token: string) => void;
}

const GoogleReviews: React.FC<GoogleReviewsProps> = ({ 
  user: propUser, 
  accessToken: propAccessToken, 
  onUserLogin 
}) => {
  const [accessToken, setAccessToken] = useState<string>(propAccessToken || '');
  const [user, setUser] = useState<any>(propUser || null);
  const [accounts, setAccounts] = useState<GoogleAccount[]>([]);
  const [locations, setLocations] = useState<GoogleLocation[]>([]);
  const [selectedAccountId, setSelectedAccountId] = useState<string>('');
  const [selectedLocationId, setSelectedLocationId] = useState<string>('');
  const [reviews, setReviews] = useState<GoogleReview[]>([]);
  const [loading, setLoading] = useState(false);
  const [replyingTo, setReplyingTo] = useState<string>('');
  const [activeToast, setActiveToast] = useState<any>(null);

  // Notifications hook
  const {
    notifications,
    unreadCount,
    markAsRead,
    markAllAsRead,
    clearNotifications,
  } = useReviewsNotifications(selectedLocationId);

  // Show toast for new notifications
  useEffect(() => {
    const latestNotification = notifications.find(n => !n.read);
    if (latestNotification && !activeToast) {
      setActiveToast(latestNotification);
    }
  }, [notifications, activeToast]);

  useEffect(() => {
    // Vérifier si on revient du callback OAuth
    const urlParams = new URLSearchParams(window.location.search);
    const code = urlParams.get('code');
    
    if (code) {
      handleOAuthCallback(code);
      // Nettoyer l'URL
      window.history.replaceState({}, document.title, window.location.pathname);
    }
  }, []);

  const handleOAuthCallback = async (code: string) => {
    setLoading(true);
    try {
      const response = await fetch('/api/google-oauth?action=exchange-code', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          code,
          redirectUri: REDIRECT_URI,
        }),
      });

      const data = await response.json();
      
      if (response.ok) {
        setAccessToken(data.access_token);
        setUser(data.user);
        
        // Sauvegarder les tokens
        localStorage.setItem('accessToken', data.access_token);
        localStorage.setItem('refreshToken', data.refresh_token);
        localStorage.setItem('user', JSON.stringify(data.user));
        
        if (onUserLogin) {
          onUserLogin(data.user, data.access_token);
        }
        
        fetchAccounts(data.access_token);
      } else {
        console.error('OAuth error:', data.error);
      }
    } catch (error) {
      console.error('Erreur lors de l\'échange du code:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleLogin = () => {
    if (!GOOGLE_CLIENT_ID) {
      alert('Configuration Google OAuth manquante');
      return;
    }

    const authUrl = `https://accounts.google.com/o/oauth2/v2/auth?` +
      `client_id=${GOOGLE_CLIENT_ID}&` +
      `redirect_uri=${encodeURIComponent(REDIRECT_URI)}&` +
      `response_type=code&` +
      `scope=${encodeURIComponent('https://www.googleapis.com/auth/business.manage')}&` +
      `access_type=offline&` +
      `prompt=consent`;
    
    window.location.href = authUrl;
  };

  const fetchAccounts = async (token: string) => {
    try {
      const response = await fetch('https://mybusiness.googleapis.com/v4/accounts', {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      const data = await response.json();
      if (data.accounts) {
        setAccounts(data.accounts);
        if (data.accounts.length > 0) {
          setSelectedAccountId(data.accounts[0].name);
          fetchLocations(token, data.accounts[0].name);
        }
      }
    } catch (error) {
      console.error('Erreur lors de la récupération des comptes:', error);
    }
  };

  const fetchLocations = async (token: string, accountId: string) => {
    try {
      const response = await fetch(`https://mybusiness.googleapis.com/v4/${accountId}/locations`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      const data = await response.json();
      if (data.locations) {
        setLocations(data.locations);
        if (data.locations.length > 0) {
          setSelectedLocationId(data.locations[0].name);
        }
      }
    } catch (error) {
      console.error('Erreur lors de la récupération des établissements:', error);
    }
  };

  const fetchReviews = async () => {
    if (!selectedAccountId || !selectedLocationId || !accessToken) {
      return;
    }

    setLoading(true);
    try {
      // Use the new fetch-reviews function that stores in Supabase
      const response = await fetch('/api/fetch-reviews', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
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

  // Charger les données sauvegardées au démarrage
  useEffect(() => {
    const savedToken = localStorage.getItem('accessToken');
    const savedUser = localStorage.getItem('user');
    
    if (savedToken && savedUser) {
      setAccessToken(savedToken);
      setUser(JSON.parse(savedUser));
      fetchAccounts(savedToken);
    }
  }, []);

  if (loading && !accessToken) {
    return (
      <div className="flex items-center justify-center min-h-[calc(100vh-64px)]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#4285F4] mx-auto mb-4"></div>
          <p className="text-gray-600">Connexion en cours...</p>
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

  const GoogleLogo = () => (
    <svg width="20" height="20" viewBox="0 0 24 24" className="mr-3">
      <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
      <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
      <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
      <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
    </svg>
  );

  if (!accessToken) {
    return (
        <div className="flex items-center justify-center min-h-[calc(100vh-64px)]">
          <div className="max-w-md w-full space-y-8 p-8">
            <div className="text-center">
              <h2 className="mt-6 text-3xl font-extrabold text-gray-900">
                Connectez-vous à Google
              </h2>
              <p className="mt-2 text-sm text-gray-600">
                Accédez à vos avis Google My Business
              </p>
            </div>
            
            <div className="flex justify-center">
              <button
                onClick={handleGoogleLogin}
                className="group relative flex justify-center items-center py-3 px-6 border border-gray-300 text-sm font-medium rounded-lg text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#4285F4] transition-colors duration-200 shadow-sm"
              >
                <GoogleLogo />
                Connexion avec Google
              </button>
            </div>
          </div>
        </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F1F3F4]">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center">
              <GoogleLogo />
              <h1 className="text-xl font-semibold text-gray-900">
                Gestion des Avis Google
              </h1>
            </div>
            
            <div className="flex items-center space-x-4">
              <NotificationCenter
                notifications={notifications}
                unreadCount={unreadCount}
                onMarkAsRead={markAsRead}
                onMarkAllAsRead={markAllAsRead}
                onClearAll={clearNotifications}
              />
              
              {user && (
                <>
                <img
                  src={user.picture}
                  alt={user.name}
                  className="w-8 h-8 rounded-full"
                />
                <span className="text-sm font-medium text-gray-700">
                  {user.name}
                </span>
                </>
              )}
            </div>
          </div>
        </div>
      </header>

      {/* Contenu principal */}
      <main className="max-w-4xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
        {/* Sélection des comptes et établissements */}
        <div className="bg-white rounded-lg shadow-sm p-6 mb-8">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">
            Sélectionner un établissement
          </h2>
          
          <div className="grid md:grid-cols-2 gap-4 mb-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Compte Google My Business
              </label>
              <select
                value={selectedAccountId}
                onChange={(e) => {
                  setSelectedAccountId(e.target.value);
                  fetchLocations(accessToken, e.target.value);
                }}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#4285F4] focus:border-transparent"
              >
                {accounts.map((account) => (
                  <option key={account.name} value={account.name}>
                    {account.name.split('/')[1]}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Établissement
              </label>
              <select
                value={selectedLocationId}
                onChange={(e) => setSelectedLocationId(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#4285F4] focus:border-transparent"
              >
                {locations.map((location) => (
                  <option key={location.name} value={location.name}>
                    {location.locationName}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <button
            onClick={fetchReviews}
            disabled={loading || !selectedLocationId}
            className="bg-[#4285F4] text-white px-6 py-2 rounded-md hover:bg-[#3367D6] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#4285F4] disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-200"
          >
            {loading ? 'Chargement...' : 'Charger les avis'}
          </button>
        </div>

        {/* Liste des avis */}
        <div className="space-y-6">
          {reviews.length === 0 && !loading && (
            <div className="text-center py-12 bg-white rounded-lg shadow-sm">
              <MessageSquare className="mx-auto h-12 w-12 text-gray-400" />
              <h3 className="mt-2 text-sm font-medium text-gray-900">Aucun avis</h3>
              <p className="mt-1 text-sm text-gray-500">
                Sélectionnez un établissement et cliquez sur "Charger les avis"
              </p>
            </div>
          )}

          {reviews.map((review) => (
            <div key={review.reviewId} className="bg-white rounded-lg shadow-sm p-6">
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
                  className="inline-flex items-center px-4 py-2 bg-[#4285F4] text-white text-sm font-medium rounded-md hover:bg-[#3367D6] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#4285F4] disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-200"
                >
                  <MessageSquare className="w-4 h-4 mr-2" />
                  {replyingTo === review.reviewId ? 'Envoi...' : 'Répondre avec IA'}
                </button>
              )}
            </div>
          ))}
        </div>
      </main>
      
      {/* Toast Notification */}
      {activeToast && (
        <NotificationToast
          notification={activeToast}
          onClose={() => setActiveToast(null)}
        />
      )}
    </div>
  );
};

export default GoogleReviews;