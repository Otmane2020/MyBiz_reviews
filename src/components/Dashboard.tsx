import React, { useState, useEffect } from 'react';
import { Star, MessageSquare, TrendingUp, Users, Calendar, Award, Loader2, AlertCircle } from 'lucide-react';
import { supabase } from '../lib/supabase';

interface DashboardProps {
  user: any;
  onNavigate?: (page: string) => void;
}

interface Review {
  id: string;
  author: string;
  rating: number;
  comment: string;
  review_date: string;
  replied: boolean;
  ai_reply?: string;
}

interface Stats {
  totalReviews: number;
  totalReplies: number;
  averageRating: number;
  replyRate: number;
}

const Dashboard: React.FC<DashboardProps> = ({ user, onNavigate }) => {
  const [stats, setStats] = useState<Stats>({
    totalReviews: 0,
    totalReplies: 0,
    averageRating: 0,
    replyRate: 0
  });
  const [recentReviews, setRecentReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (user?.id) {
      loadDashboardData();
    }
  }, [user?.id]);

  const loadDashboardData = async () => {
    try {
      setLoading(true);
      setError(null);

      // Fetch user's locations
      const { data: locations, error: locError } = await supabase
        .from('locations')
        .select('location_id')
        .eq('user_id', user.id)
        .eq('is_active', true);

      if (locError) throw locError;

      if (!locations || locations.length === 0) {
        setStats({
          totalReviews: 0,
          totalReplies: 0,
          averageRating: 0,
          replyRate: 0
        });
        setRecentReviews([]);
        setLoading(false);
        return;
      }

      const locationIds = locations.map(l => l.location_id);

      // Fetch reviews for these locations
      const { data: reviews, error: reviewsError } = await supabase
        .from('reviews')
        .select('*')
        .in('location_id', locationIds)
        .order('review_date', { ascending: false })
        .limit(5);

      if (reviewsError) throw reviewsError;

      // Fetch all reviews for stats
      const { data: allReviews, error: allReviewsError } = await supabase
        .from('reviews')
        .select('rating, replied')
        .in('location_id', locationIds);

      if (allReviewsError) throw allReviewsError;

      // Calculate stats
      const totalReviews = allReviews?.length || 0;
      const totalReplies = allReviews?.filter(r => r.replied).length || 0;
      const averageRating = totalReviews > 0
        ? allReviews.reduce((sum, r) => sum + (r.rating || 0), 0) / totalReviews
        : 0;
      const replyRate = totalReviews > 0 ? (totalReplies / totalReviews) * 100 : 0;

      setStats({
        totalReviews,
        totalReplies,
        averageRating: Math.round(averageRating * 10) / 10,
        replyRate: Math.round(replyRate)
      });

      setRecentReviews(reviews || []);
    } catch (err: any) {
      console.error('Error loading dashboard data:', err);
      setError('Erreur lors du chargement des données');
    } finally {
      setLoading(false);
    }
  };
  const statsDisplay = [
    {
      title: 'Avis totaux',
      value: loading ? '...' : stats.totalReviews.toString(),
      icon: Star,
      color: 'text-[#FBBC05]',
      bgColor: 'bg-[#FBBC05]/10'
    },
    {
      title: 'Réponses envoyées',
      value: loading ? '...' : stats.totalReplies.toString(),
      icon: MessageSquare,
      color: 'text-[#4285F4]',
      bgColor: 'bg-[#4285F4]/10'
    },
    {
      title: 'Note moyenne',
      value: loading ? '...' : stats.averageRating > 0 ? stats.averageRating.toFixed(1) : '0.0',
      icon: Award,
      color: 'text-[#34A853]',
      bgColor: 'bg-[#34A853]/10'
    },
    {
      title: 'Taux de réponse',
      value: loading ? '...' : `${stats.replyRate}%`,
      icon: TrendingUp,
      color: 'text-[#EA4335]',
      bgColor: 'bg-[#EA4335]/10'
    }
  ];


  const renderStars = (rating: number) => {
    return (
      <div className="flex">
        {[1, 2, 3, 4, 5].map((star) => (
          <Star
            key={star}
            className={`w-4 h-4 ${
              star <= rating ? 'text-[#FBBC05] fill-current' : 'text-gray-300'
            }`}
          />
        ))}
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-[#F1F3F4] pb-20">
      {/* Welcome Section */}
      <div className="bg-gradient-to-r from-[#4285F4] to-[#34A853] text-white p-6">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-2xl font-bold mb-2">
            Bonjour {user?.name || 'Utilisateur'} ! 👋
          </h1>
          <p className="text-white/90">
            Bienvenue sur Starlinko - Voici un aperçu de vos avis Google My Business
          </p>
          
          {/* Trial Status */}
          <div className="mt-4 bg-white/10 backdrop-blur-sm rounded-lg p-3 inline-block">
            <div className="flex items-center text-sm">
              <div className="w-2 h-2 bg-[#FBBC05] rounded-full mr-2 animate-pulse"></div>
              Essai gratuit actif - 14 jours restants
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto p-4 -mt-4">
        {/* Error Message */}
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-xl p-4 mb-6 flex items-start">
            <AlertCircle className="w-5 h-5 text-red-500 mr-2 mt-0.5 flex-shrink-0" />
            <div>
              <p className="text-red-800 text-sm font-medium">{error}</p>
              <button
                onClick={loadDashboardData}
                className="text-red-600 text-sm underline mt-1"
              >
                Réessayer
              </button>
            </div>
          </div>
        )}

        {/* Stats Cards */}
        <div className="grid grid-cols-2 gap-4 mb-6">
          {statsDisplay.map((stat, index) => {
            const Icon = stat.icon;
            return (
              <div key={index} className="bg-white rounded-xl p-4 shadow-sm">
                <div className="flex items-center justify-between mb-2">
                  <div className={`p-2 rounded-lg ${stat.bgColor}`}>
                    <Icon className={`w-5 h-5 ${stat.color}`} />
                  </div>
                </div>
                <div className="text-2xl font-bold text-gray-900 mb-1">
                  {loading ? <Loader2 className="w-6 h-6 animate-spin" /> : stat.value}
                </div>
                <div className="text-sm text-gray-600">
                  {stat.title}
                </div>
              </div>
            );
          })}
        </div>

        {/* Quick Actions */}
        <div className="bg-white rounded-xl p-6 shadow-sm mb-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">
            Actions rapides
          </h2>
          <div className="grid grid-cols-2 gap-3">
            <button
              onClick={() => onNavigate?.('google-reviews')}
              className="flex items-center justify-center p-4 bg-[#4285F4]/10 rounded-lg text-[#4285F4] font-medium hover:bg-[#4285F4]/20 transition"
            >
              <Star className="w-5 h-5 mr-2" />
              Voir les avis
            </button>
            <button
              onClick={() => onNavigate?.('google-reviews')}
              className="flex items-center justify-center p-4 bg-[#34A853]/10 rounded-lg text-[#34A853] font-medium hover:bg-[#34A853]/20 transition"
            >
              <MessageSquare className="w-5 h-5 mr-2" />
              Répondre
            </button>
          </div>
        </div>

        {/* Recent Reviews */}
        <div className="bg-white rounded-xl p-6 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-gray-900">
              Avis récents
            </h2>
            <button className="text-[#4285F4] text-sm font-medium">
              Voir tout
            </button>
          </div>
          
          <div className="space-y-4">
            {loading ? (
              <div className="flex justify-center py-8">
                <Loader2 className="w-8 h-8 animate-spin text-[#4285F4]" />
              </div>
            ) : recentReviews.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                <MessageSquare className="w-12 h-12 mx-auto mb-3 text-gray-400" />
                <p className="text-sm">Aucun avis pour le moment</p>
                <button
                  onClick={() => onNavigate?.('google-my-business')}
                  className="mt-3 text-[#4285F4] text-sm font-medium hover:underline"
                >
                  Connecter un établissement
                </button>
              </div>
            ) : (
              recentReviews.map((review) => (
                <div key={review.id} className="border-b border-gray-100 last:border-b-0 pb-4 last:pb-0">
                  <div className="flex items-start justify-between mb-2">
                    <div>
                      <div className="font-medium text-gray-900 text-sm">
                        {review.author}
                      </div>
                      {renderStars(review.rating)}
                    </div>
                    <div className="flex items-center">
                      {review.replied && (
                        <span className="bg-[#34A853]/10 text-[#34A853] text-xs px-2 py-1 rounded-full mr-2">
                          Répondu
                        </span>
                      )}
                      <span className="text-xs text-gray-500">
                        {new Date(review.review_date).toLocaleDateString('fr-FR')}
                      </span>
                    </div>
                  </div>
                  <p className="text-sm text-gray-600 line-clamp-2">
                    {review.comment}
                  </p>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;