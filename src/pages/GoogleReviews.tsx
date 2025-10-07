import React, { useState, useEffect } from 'react';
import { MessageSquare, RefreshCw, AlertCircle } from 'lucide-react';
import ReviewCard from '../components/ReviewCard';
import { supabase } from '../lib/supabase';

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
  onTokenExpired?: () => void;
}

const GoogleReviews: React.FC<GoogleReviewsProps> = ({
  user,
  accessToken,
  selectedLocationId,
  setSelectedLocationId,
  selectedAccountId,
  onNavigate,
  onTokenExpired
}) => {
  const [reviews, setReviews] = useState<GoogleReview[]>([]);
  const [locations, setLocations] = useState<GoogleLocation[]>([]);
  const [loading, setLoading] = useState(false);
  const [syncing, setSyncing] = useState(false);
  const [replyingTo, setReplyingTo] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [usageInfo, setUsageInfo] = useState<any>(null);

  useEffect(() => {
    if (user?.id) {
      loadUserLocations();
      loadUsageInfo();
    }
  }, [user]);

  useEffect(() => {
    if (selectedLocationId && user?.id) {
      loadReviews();
    }
  }, [selectedLocationId, user]);

  const loadUserLocations = async () => {
    try {
      const { data, error } = await supabase
        .from('locations')
        .select('*')
        .eq('is_active', true)
        .order('created_at', { ascending: true });

      if (error) throw error;

      const formattedLocations = data.map(loc => ({
        name: loc.location_id,
        locationName: loc.location_name,
        primaryCategory: {
          displayName: loc.category || 'Business'
        }
      }));

      setLocations(formattedLocations);

      if (formattedLocations.length > 0 && !selectedLocationId) {
        setSelectedLocationId(formattedLocations[0].name);
      }
    } catch (err: any) {
      console.error('Error loading locations:', err);
      setError('Erreur lors du chargement des établissements');
    }
  };

  const loadUsageInfo = async () => {
    try {
      const { data: session } = await supabase.auth.getSession();
      if (!session.session) return;

      const currentMonth = new Date().toISOString().slice(0, 7) + '-01';

      const { data, error } = await supabase
        .from('usage_tracking')
        .select('*')
        .eq('month', currentMonth)
        .maybeSingle();

      if (error && error.code !== 'PGRST116') {
        console.error('Error loading usage info:', error);
      } else {
        setUsageInfo(data);
      }
    } catch (err) {
      console.error('Error loading usage:', err);
    }
  };

  const loadReviews = async () => {
    if (!selectedLocationId) return;

    setLoading(true);
    setError(null);

    try {
      const { data, error } = await supabase
        .from('reviews')
        .select('*')
        .eq('location_id', selectedLocationId)
        .order('created_at', { ascending: false });

      if (error) throw error;

      const convertedReviews = data.map((review: any) => ({
        reviewId: review.review_id,
        reviewer: {
          displayName: review.author,
          profilePhotoUrl: '',
        },
        starRating: ['', 'ONE', 'TWO', 'THREE', 'FOUR', 'FIVE'][review.rating],
        comment: review.comment,
        createTime: review.review_date,
        reviewReply: review.replied ? {
          comment: review.reply_content || 'Répondu',
          updateTime: review.replied_at || review.updated_at
        } : undefined,
      }));

      setReviews(convertedReviews);
    } catch (err: any) {
      console.error('Error loading reviews:', err);
      setError('Erreur lors du chargement des avis');
    } finally {
      setLoading(false);
    }
  };

  const syncReviews = async () => {
    if (!selectedLocationId || !accessToken) {
      setError('Token d\'accès manquant. Veuillez vous reconnecter.');
      if (onTokenExpired) onTokenExpired();
      return;
    }

    setSyncing(true);
    setError(null);

    try {
      const { data: session } = await supabase.auth.getSession();
      if (!session.session) throw new Error('Session expirée');

      const response = await fetch(
        `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/fetch-reviews`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${session.session.access_token}`,
          },
          body: JSON.stringify({
            accessToken,
            locationId: selectedLocationId,
          }),
        }
      );

      const data = await response.json();

      if (!data.success) {
        throw new Error(data.error || 'Erreur lors de la synchronisation');
      }

      await loadReviews();
      await loadUsageInfo();

      if (data.newReviews > 0) {
        alert(`${data.newReviews} nouveaux avis synchronisés !`);
      } else {
        alert('Aucun nouvel avis trouvé');
      }
    } catch (err: any) {
      console.error('Error syncing reviews:', err);
      setError(err.message || 'Erreur lors de la synchronisation des avis');

      if (err.message?.includes('401') || err.message?.includes('Token')) {
        if (onTokenExpired) onTokenExpired();
      }
    } finally {
      setSyncing(false);
    }
  };

  const handleReplyManual = async (reviewId: string, replyText: string) => {
    setReplyingTo(reviewId);
    setError(null);

    try {
      const { data: session } = await supabase.auth.getSession();
      if (!session.session) throw new Error('Session expirée');

      const response = await fetch(
        `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/reply-to-review`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${session.session.access_token}`,
          },
          body: JSON.stringify({
            reviewId,
            replyText,
            replySource: 'manual',
          }),
        }
      );

      const data = await response.json();

      if (!data.success) {
        throw new Error(data.error || 'Erreur lors de l\'envoi de la réponse');
      }

      await loadReviews();
      await loadUsageInfo();

      alert('Réponse envoyée avec succès !');
    } catch (err: any) {
      console.error('Error replying to review:', err);
      setError(err.message || 'Erreur lors de l\'envoi de la réponse');

      if (err.message?.includes('401') || err.message?.includes('Token')) {
        if (onTokenExpired) onTokenExpired();
      }
    } finally {
      setReplyingTo(null);
    }
  };

  const handleReplyAI = async (reviewId: string) => {
    setReplyingTo(reviewId);
    setError(null);

    try {
      const { data: session } = await supabase.auth.getSession();
      if (!session.session) throw new Error('Session expirée');

      const review = reviews.find(r => r.reviewId === reviewId);
      if (!review) throw new Error('Avis introuvable');

      const ratingMap: { [key: string]: number } = {
        'ONE': 1,
        'TWO': 2,
        'THREE': 3,
        'FOUR': 4,
        'FIVE': 5,
      };
      const rating = ratingMap[review.starRating] || 5;

      const aiResponse = await fetch(
        `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/ai-generate-reply`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${session.session.access_token}`,
          },
          body: JSON.stringify({
            reviewText: review.comment,
            rating: rating,
            reviewerName: review.reviewer.displayName,
            businessName: locations.find(l => l.name === selectedLocationId)?.locationName,
          }),
        }
      );

      const aiData = await aiResponse.json();

      if (!aiData.success) {
        throw new Error(aiData.error || 'Erreur lors de la génération de la réponse IA');
      }

      const replyResponse = await fetch(
        `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/reply-to-review`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${session.session.access_token}`,
          },
          body: JSON.stringify({
            reviewId,
            replyText: aiData.reply,
            replySource: 'ai',
          }),
        }
      );

      const replyData = await replyResponse.json();

      if (!replyData.success) {
        throw new Error(replyData.error || 'Erreur lors de l\'envoi de la réponse');
      }

      await loadReviews();
      await loadUsageInfo();

      alert('Réponse IA envoyée avec succès !');
    } catch (err: any) {
      console.error('Error with AI reply:', err);
      setError(err.message || 'Erreur lors de la réponse IA');

      if (err.message?.includes('limit')) {
        alert('Limite de réponses IA atteinte pour ce mois. Passez à un plan supérieur ou attendez le mois prochain.');
      }
    } finally {
      setReplyingTo(null);
    }
  };

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

  return (
    <div className="min-h-screen bg-[#F1F3F4]">
      <main className="max-w-4xl mx-auto py-8 px-4 sm:px-6 lg:px-8 pt-20">
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Avis Google My Business</h1>
          <p className="text-gray-600">Gérez et répondez à vos avis clients</p>
        </div>

        {error && (
          <div className="mb-6 bg-red-50 border border-red-200 rounded-lg p-4">
            <div className="flex items-start">
              <AlertCircle className="w-5 h-5 text-red-500 mt-0.5 mr-3 flex-shrink-0" />
              <div>
                <h3 className="text-sm font-medium text-red-800">Erreur</h3>
                <p className="text-sm text-red-700 mt-1">{error}</p>
              </div>
            </div>
          </div>
        )}

        <div className="bg-white rounded-xl shadow-sm p-6 mb-8">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-lg font-semibold text-gray-900 mb-2">
                Établissement sélectionné
              </h2>

              {locations.length > 0 && (
                <div className="bg-gray-50 rounded-lg p-4">
                  <div className="font-medium text-gray-900">
                    {locations.find(l => l.name === selectedLocationId)?.locationName || 'Chargement...'}
                  </div>
                  <div className="text-sm text-gray-500">
                    {locations.find(l => l.name === selectedLocationId)?.primaryCategory?.displayName}
                  </div>
                </div>
              )}

              {locations.length === 0 && (
                <p className="text-sm text-gray-600">
                  Aucun établissement trouvé. Veuillez en ajouter un dans les paramètres.
                </p>
              )}
            </div>

            {usageInfo && (
              <div className="text-right">
                <div className="text-sm text-gray-600 mb-1">Réponses IA ce mois</div>
                <div className="text-2xl font-bold text-[#4285F4]">
                  {usageInfo.ai_replies_used}/{usageInfo.ai_replies_limit}
                </div>
              </div>
            )}
          </div>

          <button
            onClick={syncReviews}
            disabled={syncing || !selectedLocationId}
            className="inline-flex items-center px-6 py-3 bg-[#4285F4] text-white rounded-lg hover:bg-[#3367D6] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#4285F4] disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-200 font-medium"
          >
            <RefreshCw className={`w-5 h-5 mr-2 ${syncing ? 'animate-spin' : ''}`} />
            {syncing ? 'Synchronisation...' : 'Synchroniser les avis'}
          </button>
        </div>

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
            <ReviewCard
              key={review.reviewId}
              review={review}
              onReplyManual={handleReplyManual}
              onReplyAI={handleReplyAI}
              isReplying={replyingTo === review.reviewId}
            />
          ))}
        </div>
      </main>
    </div>
  );
};

export default GoogleReviews;
