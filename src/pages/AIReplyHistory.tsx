import React, { useState, useEffect } from 'react';
import { Bot, Star, User, Calendar, CheckCircle, Clock, MessageSquare, Filter, RefreshCw, Sparkles } from 'lucide-react';
import { supabase } from '../lib/supabase';

interface AIReplyHistoryProps {
  user: any;
}

interface ReviewWithReply {
  id: string;
  author: string;
  review_text: string;
  rating: number;
  reply_content: string | null;
  reply_source: 'ai' | 'manual' | null;
  replied_at: string | null;
  created_at: string;
  location_id: string;
}

const AIReplyHistory: React.FC<AIReplyHistoryProps> = ({ user }) => {
  const [reviews, setReviews] = useState<ReviewWithReply[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<'all' | 'ai' | 'manual' | 'pending'>('all');
  const [sortBy, setSortBy] = useState<'recent' | 'rating'>('recent');

  useEffect(() => {
    loadReviews();
  }, [user?.id, filter, sortBy]);

  const loadReviews = async () => {
    if (!user?.id) return;

    setLoading(true);
    try {
      let query = supabase
        .from('reviews')
        .select('*')
        .eq('user_id', user.id);

      if (filter === 'ai') {
        query = query.eq('reply_source', 'ai').not('reply_content', 'is', null);
      } else if (filter === 'manual') {
        query = query.eq('reply_source', 'manual').not('reply_content', 'is', null);
      } else if (filter === 'pending') {
        query = query.is('reply_content', null);
      }

      if (sortBy === 'recent') {
        query = query.order('created_at', { ascending: false });
      } else {
        query = query.order('rating', { ascending: false });
      }

      const { data, error } = await query.limit(100);

      if (error) {
        console.error('Erreur lors du chargement des avis:', error);
      } else {
        setReviews(data || []);
      }
    } catch (error) {
      console.error('Erreur:', error);
    } finally {
      setLoading(false);
    }
  };

  const getStatusBadge = (review: ReviewWithReply) => {
    if (!review.reply_content) {
      return (
        <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
          <Clock className="w-3 h-3 mr-1" />
          En attente
        </span>
      );
    }

    if (review.reply_source === 'ai') {
      return (
        <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
          <Bot className="w-3 h-3 mr-1" />
          IA
        </span>
      );
    }

    return (
      <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
        <CheckCircle className="w-3 h-3 mr-1" />
        Manuel
      </span>
    );
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('fr-FR', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const stats = {
    total: reviews.length,
    ai: reviews.filter(r => r.reply_source === 'ai').length,
    manual: reviews.filter(r => r.reply_source === 'manual').length,
    pending: reviews.filter(r => !r.reply_content).length
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 pt-20">
      <div className="max-w-7xl mx-auto p-6">
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 mb-2 flex items-center">
                <Sparkles className="w-8 h-8 text-blue-500 mr-3" />
                Historique des réponses IA
              </h1>
              <p className="text-gray-600">
                Suivez toutes vos réponses automatiques et manuelles
              </p>
            </div>
            <button
              onClick={loadReviews}
              className="flex items-center px-4 py-2 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
            >
              <RefreshCw className={`w-4 h-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
              Actualiser
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
            <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Total</p>
                  <p className="text-2xl font-bold text-gray-900">{stats.total}</p>
                </div>
                <MessageSquare className="w-8 h-8 text-gray-400" />
              </div>
            </div>

            <div className="bg-blue-50 rounded-xl p-4 shadow-sm border border-blue-100">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-blue-700">Réponses IA</p>
                  <p className="text-2xl font-bold text-blue-900">{stats.ai}</p>
                </div>
                <Bot className="w-8 h-8 text-blue-500" />
              </div>
            </div>

            <div className="bg-green-50 rounded-xl p-4 shadow-sm border border-green-100">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-green-700">Manuelles</p>
                  <p className="text-2xl font-bold text-green-900">{stats.manual}</p>
                </div>
                <CheckCircle className="w-8 h-8 text-green-500" />
              </div>
            </div>

            <div className="bg-yellow-50 rounded-xl p-4 shadow-sm border border-yellow-100">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-yellow-700">En attente</p>
                  <p className="text-2xl font-bold text-yellow-900">{stats.pending}</p>
                </div>
                <Clock className="w-8 h-8 text-yellow-500" />
              </div>
            </div>
          </div>

          <div className="flex flex-wrap gap-3 mb-6">
            <div className="flex items-center bg-white rounded-lg p-1 border border-gray-200">
              <Filter className="w-4 h-4 text-gray-500 ml-2" />
              <button
                onClick={() => setFilter('all')}
                className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                  filter === 'all' ? 'bg-blue-500 text-white' : 'text-gray-700 hover:bg-gray-100'
                }`}
              >
                Tous
              </button>
              <button
                onClick={() => setFilter('ai')}
                className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                  filter === 'ai' ? 'bg-blue-500 text-white' : 'text-gray-700 hover:bg-gray-100'
                }`}
              >
                IA
              </button>
              <button
                onClick={() => setFilter('manual')}
                className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                  filter === 'manual' ? 'bg-blue-500 text-white' : 'text-gray-700 hover:bg-gray-100'
                }`}
              >
                Manuel
              </button>
              <button
                onClick={() => setFilter('pending')}
                className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                  filter === 'pending' ? 'bg-blue-500 text-white' : 'text-gray-700 hover:bg-gray-100'
                }`}
              >
                En attente
              </button>
            </div>

            <div className="flex items-center bg-white rounded-lg p-1 border border-gray-200">
              <button
                onClick={() => setSortBy('recent')}
                className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                  sortBy === 'recent' ? 'bg-blue-500 text-white' : 'text-gray-700 hover:bg-gray-100'
                }`}
              >
                Plus récents
              </button>
              <button
                onClick={() => setSortBy('rating')}
                className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                  sortBy === 'rating' ? 'bg-blue-500 text-white' : 'text-gray-700 hover:bg-gray-100'
                }`}
              >
                Meilleures notes
              </button>
            </div>
          </div>
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-12">
            <RefreshCw className="w-8 h-8 text-blue-500 animate-spin" />
          </div>
        ) : reviews.length === 0 ? (
          <div className="bg-white rounded-2xl shadow-sm p-12 text-center">
            <MessageSquare className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-gray-900 mb-2">Aucun avis trouvé</h3>
            <p className="text-gray-600">
              {filter === 'all'
                ? "Vous n'avez pas encore d'avis"
                : `Aucun avis ${filter === 'ai' ? 'avec réponse IA' : filter === 'manual' ? 'avec réponse manuelle' : 'en attente'}`
              }
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {reviews.map((review) => (
              <div key={review.id} className="bg-white rounded-2xl shadow-sm p-6 border border-gray-100 hover:shadow-md transition-shadow">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full flex items-center justify-center">
                      <User className="w-5 h-5 text-white" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-gray-900">{review.author || 'Anonyme'}</h3>
                      <div className="flex items-center space-x-2 text-sm text-gray-500">
                        <Calendar className="w-4 h-4" />
                        <span>{formatDate(review.created_at)}</span>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    {getStatusBadge(review)}
                    <div className="flex items-center">
                      {[...Array(5)].map((_, i) => (
                        <Star
                          key={i}
                          className={`w-4 h-4 ${
                            i < review.rating ? 'text-yellow-400 fill-current' : 'text-gray-300'
                          }`}
                        />
                      ))}
                    </div>
                  </div>
                </div>

                <div className="mb-4">
                  <h4 className="text-sm font-medium text-gray-700 mb-2">Avis client:</h4>
                  <p className="text-gray-900 leading-relaxed">{review.review_text}</p>
                </div>

                {review.reply_content && (
                  <div className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-xl p-4 border border-blue-100">
                    <div className="flex items-center justify-between mb-2">
                      <h4 className="text-sm font-medium text-gray-900 flex items-center">
                        {review.reply_source === 'ai' ? (
                          <>
                            <Bot className="w-4 h-4 text-blue-500 mr-2" />
                            Réponse IA
                          </>
                        ) : (
                          <>
                            <CheckCircle className="w-4 h-4 text-green-500 mr-2" />
                            Réponse manuelle
                          </>
                        )}
                      </h4>
                      {review.replied_at && (
                        <span className="text-xs text-gray-500">
                          {formatDate(review.replied_at)}
                        </span>
                      )}
                    </div>
                    <p className="text-gray-800 leading-relaxed">{review.reply_content}</p>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default AIReplyHistory;
