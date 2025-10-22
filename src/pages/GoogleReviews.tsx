import React, { useState, useEffect } from 'react';
import { Star, MessageSquare, User, Calendar, Copy, ExternalLink, Check, Loader2, RefreshCw } from 'lucide-react';
import StarlinkoLogo from '../components/StarlinkoLogo';

interface GoogleReview {
  reviewId: string;
  reviewer: {
    profilePhotoUrl?: string;
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
  primaryCategory?: {
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
  user: propUser,
  accessToken: propAccessToken,
  selectedLocationId: propSelectedLocationId,
  setSelectedLocationId: propSetSelectedLocationId,
  selectedAccountId: propSelectedAccountId,
  onNavigate,
  onTokenExpired,
}) => {
  const [accessToken, setAccessToken] = useState<string>(propAccessToken || '');
  const [user, setUser] = useState<any>(propUser || null);
  const [accounts, setAccounts] = useState<GoogleAccount[]>([]);
  const [locations, setLocations] = useState<GoogleLocation[]>([]);
  const [selectedAccountId, setSelectedAccountId] = useState<string>(propSelectedAccountId || '');
  const [reviews, setReviews] = useState<GoogleReview[]>([]);
  const [loading, setLoading] = useState(false);
  const [replyingTo, setReplyingTo] = useState<string>('');
  const [generatedReplies, setGeneratedReplies] = useState<Record<string, string>>({});
  const [copiedReview, setCopiedReview] = useState<string>('');

  const selectedLocationId = propSelectedLocationId;
  const setSelectedLocationId = propSetSelectedLocationId;

  // === FETCH ACCOUNTS ===
  const fetchAccounts = async (token: string) => {
    try {
      const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
      const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

      const res = await fetch(`${supabaseUrl}/functions/v1/google-oauth`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${supabaseKey}`,
        },
        body: JSON.stringify({
          action: 'get-accounts',
          accessToken: token,
        }),
      });

      const data = await res.json();

      if (data.success && data.accounts) {
        setAccounts(data.accounts);
        const firstAccount = data.accounts[0]?.name;
        if (!selectedAccountId && firstAccount) {
          setSelectedAccountId(firstAccount);
          fetchLocations(token, firstAccount);
        }
      } else if (data.error) {
        throw new Error(data.error.message || 'Erreur API comptes');
      }
    } catch (err: any) {
      alert('Erreur lors de la connexion à Google My Business.');
    }
  };

  // === FETCH LOCATIONS ===
  const fetchLocations = async (token: string, accountId: string) => {
    try {
      const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
      const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

      const res = await fetch(`${supabaseUrl}/functions/v1/google-oauth`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${supabaseKey}`,
        },
        body: JSON.stringify({
          action: 'get-locations',
          accessToken: token,
          accountId,
        }),
      });

      const data = await res.json();

      if (data.success && data.locations) {
        setLocations(data.locations);
        const firstLocation = data.locations[0]?.name;
        if (!selectedLocationId && firstLocation) {
          setSelectedLocationId(firstLocation);
        }
      } else if (data.error) {
        throw new Error(data.error.message || 'Erreur API locations');
      }
    } catch (err: any) {
      if (err.message.includes('401') && onTokenExpired) onTokenExpired();
    }
  };

  // === FETCH REVIEWS ===
  const fetchReviews = async () => {
    if (!selectedLocationId || !accessToken) return;

    setLoading(true);
    try {
      const { supabase } = await import('../lib/supabase');
      const { data: { session } } = await supabase.auth.getSession();

      if (!session) {
        throw new Error('No active session');
      }

      const res = await fetch(`${import.meta.env.VITE_SUPABASE_URL}/functions/v1/fetch-reviews`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${session.access_token}`,
        },
        body: JSON.stringify({
          accessToken,
          locationId: selectedLocationId,
        }),
      });

      const data = await res.json();
      if (data.success) {
        await fetchStoredReviews();
        if (data.newReviews > 0) console.log(`✅ ${data.newReviews} nouveaux avis ajoutés`);
      } else {
        throw new Error(data.error || 'Erreur API fetch-reviews');
      }
    } catch (err: any) {
      console.error('Erreur fetchReviews:', err);
      if (err.message.includes('401') && onTokenExpired) onTokenExpired();
    } finally {
      setLoading(false);
    }
  };

  // === FETCH STORED REVIEWS ===
  const fetchStoredReviews = async () => {
    if (!selectedLocationId) return;
    try {
      const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
      const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

      const res = await fetch(
        `${supabaseUrl}/rest/v1/reviews?location_id=eq.${selectedLocationId}&order=created_at.desc`,
        {
          headers: {
            apikey: supabaseKey,
            Authorization: `Bearer ${supabaseKey}`,
          },
        }
      );

      const stored = await res.json();

      const converted = stored.map((r: any) => ({
        reviewId: r.review_id,
        reviewer: {
          displayName: r.author,
        },
        starRating: ['ZERO', 'ONE', 'TWO', 'THREE', 'FOUR', 'FIVE'][r.rating] as any,
        comment: r.comment,
        createTime: r.review_date,
        reviewReply: r.replied
          ? { comment: 'Répondu', updateTime: r.updated_at }
          : undefined,
      }));

      setReviews(converted);
    } catch (err) {
      console.error('Erreur fetchStoredReviews:', err);
    }
  };

  // === GENERATE AI REPLY ===
  const generateAIReply = async (reviewId: string, review: GoogleReview) => {
    setReplyingTo(reviewId);

    try {
      const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
      const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

      const response = await fetch(`${supabaseUrl}/functions/v1/zapier-webhook`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${supabaseKey}`,
        },
        body: JSON.stringify({
          review_text: review.comment,
          rating: getStarRating(review.starRating),
          author: review.reviewer.displayName,
          business_name: locations.find((l) => l.name === selectedLocationId)?.locationName || 'votre établissement',
        }),
      });

      if (response.ok) {
        const data = await response.json();
        if (data.success && data.reply) {
          setGeneratedReplies((prev) => ({ ...prev, [reviewId]: data.reply }));
        } else {
          alert('Erreur lors de la génération de la réponse');
        }
      } else {
        console.error('Erreur lors de la génération:', await response.text());
        alert('Erreur lors de la génération de la réponse');
      }
    } catch (err) {
      console.error('Erreur generateAIReply:', err);
      alert('Erreur lors de la génération de la réponse');
    } finally {
      setReplyingTo('');
    }
  };

  // === COPY REPLY AND OPEN GMB ===
  const copyAndOpenGMB = (reviewId: string, reply: string) => {
    navigator.clipboard.writeText(reply);
    setCopiedReview(reviewId);
    setTimeout(() => setCopiedReview(''), 2000);

    const location = locations.find((l) => l.name === selectedLocationId);
    if (location) {
      window.open('https://business.google.com/reviews', '_blank');
    }
  };

  // === POST REPLY TO REVIEW ===
  const postReplyToReview = async (reviewId: string, comment: string) => {
    if (!selectedLocationId || !accessToken) {
      alert('Connexion Google manquante');
      return;
    }

    setReplyingTo(reviewId);
    try {
      const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
      const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

      const response = await fetch(`${supabaseUrl}/functions/v1/google-oauth`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${supabaseKey}`,
        },
        body: JSON.stringify({
          action: 'reply-review',
          accessToken,
          locationId: selectedLocationId,
          reviewId,
          comment,
        }),
      });

      const data = await response.json();

      if (response.ok && data.success) {
        alert('Réponse publiée avec succès !');

        // Update the review in database
        const { supabase } = await import('../lib/supabase');
        await supabase
          .from('reviews')
          .update({ replied: true, ai_reply: comment, updated_at: new Date().toISOString() })
          .eq('review_id', reviewId);

        // Refresh reviews
        await fetchStoredReviews();
      } else {
        throw new Error(data.error || 'Erreur lors de la publication de la réponse');
      }
    } catch (err: any) {
      console.error('Erreur postReplyToReview:', err);
      alert(err.message || 'Erreur lors de la publication de la réponse');
    } finally {
      setReplyingTo('');
    }
  };

  // Load stored reviews from database on mount and when location changes
  useEffect(() => {
    if (user?.id) {
      loadStoredReviewsFromDB();

      // Set up polling to check for new locations and reviews every 30 seconds
      const pollInterval = setInterval(() => {
        loadStoredReviewsFromDB();
      }, 30000); // 30 seconds

      return () => clearInterval(pollInterval);
    }
  }, [user?.id]);

  // Load reviews from Google when OAuth is available
  useEffect(() => {
    if (accessToken && user) {
      fetchAccounts(accessToken);
      if (selectedLocationId) fetchStoredReviews();
    }
  }, [accessToken, user, selectedLocationId]);

  // Load reviews from database for all user locations
  const loadStoredReviewsFromDB = async () => {
    if (!user?.id) return;

    try {
      const { supabase } = await import('../lib/supabase');

      // Get all user's locations
      const { data: locations, error: locError } = await supabase
        .from('locations')
        .select('location_id, location_name')
        .eq('user_id', user.id)
        .eq('is_active', true);

      if (locError) throw locError;

      if (!locations || locations.length === 0) {
        setReviews([]);
        return;
      }

      const locationIds = locations.map(l => l.location_id);

      // Fetch reviews for all locations
      const { data: reviewsData, error: reviewsError } = await supabase
        .from('reviews')
        .select('*')
        .in('location_id', locationIds)
        .order('review_date', { ascending: false });

      if (reviewsError) throw reviewsError;

      // Convert to GoogleReview format
      const converted = (reviewsData || []).map((r: any) => ({
        reviewId: r.review_id,
        reviewer: {
          displayName: r.author,
        },
        starRating: ['ZERO', 'ONE', 'TWO', 'THREE', 'FOUR', 'FIVE'][r.rating] as any,
        comment: r.comment,
        createTime: r.review_date,
        reviewReply: r.replied
          ? { comment: r.ai_reply || 'Répondu', updateTime: r.updated_at }
          : undefined,
      }));

      setReviews(converted);
    } catch (err) {
      console.error('Error loading reviews from database:', err);
    }
  };

  const getStarRating = (rating: string): number =>
    ({ ONE: 1, TWO: 2, THREE: 3, FOUR: 4, FIVE: 5 }[rating] || 0);

  const renderStars = (rating: number) => (
    <div className="flex items-center">
      {[1, 2, 3, 4, 5].map((s) => (
        <Star key={s} className={`w-4 h-4 ${s <= rating ? 'text-[#FBBC05] fill-current' : 'text-gray-300'}`} />
      ))}
      <span className="ml-2 text-sm text-gray-600">({rating}/5)</span>
    </div>
  );

  const formatDate = (date: string) =>
    new Date(date).toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' });

  return (
    <div className="min-h-screen bg-[#F1F3F4] pt-20">
      <main className="max-w-4xl mx-auto px-4 py-8">
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Avis Google My Business</h1>
          <p className="text-gray-600">Gérez et répondez à vos avis clients</p>
        </div>

        {/* Établissement sélectionné */}
        <div className="bg-white rounded-xl shadow-sm p-6 mb-8">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Établissement sélectionné</h2>

          <div className="bg-gray-50 rounded-lg p-4 mb-4">
            <div className="font-medium text-gray-900">
              {locations.find((l) => l.name === selectedLocationId)?.locationName || 'Chargement...'}
            </div>
            <div className="text-sm text-gray-500">
              {locations.find((l) => l.name === selectedLocationId)?.primaryCategory?.displayName}
            </div>
          </div>

          <button
            onClick={fetchReviews}
            disabled={loading}
            className="bg-[#4285F4] text-white px-6 py-3 rounded-lg hover:bg-[#3367D6] transition disabled:opacity-50 font-medium"
          >
            {loading ? 'Synchronisation...' : 'Synchroniser les avis'}
          </button>
        </div>

        {/* Liste des avis */}
        <div className="space-y-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-gray-900">
              Tous les avis ({reviews.length})
            </h2>
            <button
              onClick={loadStoredReviewsFromDB}
              className="flex items-center text-sm text-[#4285F4] hover:text-[#3367D6] transition"
            >
              <RefreshCw className="w-4 h-4 mr-1" />
              Actualiser
            </button>
          </div>

          {reviews.length === 0 && !loading && (
            <div className="text-center py-12 bg-white rounded-xl shadow-sm">
              <MessageSquare className="mx-auto h-12 w-12 text-gray-400" />
              <h3 className="mt-2 text-sm font-medium text-gray-900">Aucun avis</h3>
              <p className="mt-1 text-sm text-gray-500">Ajoutez un établissement pour voir vos avis</p>
            </div>
          )}

          {reviews.map((r) => (
            <div key={r.reviewId} className="bg-white rounded-xl shadow-sm p-6">
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center">
                  {r.reviewer.profilePhotoUrl ? (
                    <img
                      src={r.reviewer.profilePhotoUrl}
                      alt={r.reviewer.displayName}
                      className="w-10 h-10 rounded-full mr-3"
                    />
                  ) : (
                    <div className="w-10 h-10 rounded-full bg-gray-300 flex items-center justify-center mr-3">
                      <User className="w-6 h-6 text-gray-600" />
                    </div>
                  )}
                  <div>
                    <h3 className="font-semibold text-gray-900">{r.reviewer.displayName}</h3>
                    {renderStars(getStarRating(r.starRating))}
                  </div>
                </div>
                <div className="flex items-center text-gray-500 text-sm">
                  <Calendar className="w-4 h-4 mr-1" />
                  {formatDate(r.createTime)}
                </div>
              </div>

              <p className="text-gray-700 mb-4">{r.comment}</p>

              {r.reviewReply ? (
                <div className="bg-gray-50 rounded-lg p-4">
                  <div className="text-sm font-medium text-gray-800 mb-1">Votre réponse :</div>
                  <p className="text-gray-700">{r.reviewReply.comment}</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {!generatedReplies[r.reviewId] ? (
                    <button
                      onClick={() => generateAIReply(r.reviewId, r)}
                      disabled={replyingTo === r.reviewId}
                      className="inline-flex items-center px-4 py-2 bg-[#4285F4] text-white rounded-lg text-sm font-medium hover:bg-[#3367D6] transition disabled:opacity-50"
                    >
                      <MessageSquare className="w-4 h-4 mr-2" />
                      {replyingTo === r.reviewId ? 'Génération...' : 'Générer réponse IA'}
                    </button>
                  ) : (
                    <div className="bg-[#4285F4]/5 border-2 border-[#4285F4] rounded-lg p-4 space-y-3">
                      <div className="flex items-start justify-between">
                        <div className="text-sm font-medium text-[#4285F4] mb-1">Réponse générée par IA :</div>
                        <button
                          onClick={() => generateAIReply(r.reviewId, r)}
                          className="text-xs text-[#4285F4] hover:underline"
                        >
                          Régénérer
                        </button>
                      </div>
                      <p className="text-gray-700">{generatedReplies[r.reviewId]}</p>
                      <div className="flex gap-2 flex-wrap">
                        {accessToken ? (
                          <button
                            onClick={() => postReplyToReview(r.reviewId, generatedReplies[r.reviewId])}
                            disabled={replyingTo === r.reviewId}
                            className="inline-flex items-center px-4 py-2 bg-[#34A853] text-white rounded-lg text-sm font-medium hover:bg-[#2D9348] transition disabled:opacity-50"
                          >
                            {replyingTo === r.reviewId ? (
                              <>
                                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                                Publication...
                              </>
                            ) : (
                              <>
                                <MessageSquare className="w-4 h-4 mr-2" />
                                Publier automatiquement
                              </>
                            )}
                          </button>
                        ) : (
                          <button
                            onClick={() => copyAndOpenGMB(r.reviewId, generatedReplies[r.reviewId])}
                            className="inline-flex items-center px-4 py-2 bg-[#34A853] text-white rounded-lg text-sm font-medium hover:bg-[#2D9348] transition"
                          >
                            {copiedReview === r.reviewId ? (
                              <>
                                <Check className="w-4 h-4 mr-2" />
                                Copié !
                              </>
                            ) : (
                              <>
                                <Copy className="w-4 h-4 mr-2" />
                                Copier & Ouvrir GMB
                              </>
                            )}
                          </button>
                        )}
                        <button
                          onClick={() => {
                            navigator.clipboard.writeText(generatedReplies[r.reviewId]);
                            setCopiedReview(r.reviewId);
                            setTimeout(() => setCopiedReview(''), 2000);
                          }}
                          className="inline-flex items-center px-4 py-2 bg-white border-2 border-gray-300 text-gray-700 rounded-lg text-sm font-medium hover:bg-gray-50 transition"
                        >
                          {copiedReview === r.reviewId ? (
                            <>
                              <Check className="w-4 h-4 mr-2" />
                              Copié
                            </>
                          ) : (
                            <>
                              <Copy className="w-4 h-4 mr-2" />
                              Copier seulement
                            </>
                          )}
                        </button>
                      </div>
                      <p className="text-xs text-gray-500 italic">
                        Collez la réponse directement sur Google My Business (Ctrl+V)
                      </p>
                    </div>
                  )}
                </div>
              )}
            </div>
          ))}
        </div>
      </main>
    </div>
  );
};

export default GoogleReviews;
