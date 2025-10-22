import React from 'react';
import { Star, MessageSquare, TrendingUp, Users, Calendar, Award } from 'lucide-react';

interface DashboardProps {
  user: any;
}

const Dashboard: React.FC<DashboardProps> = ({ user }) => {
  const stats = [
    {
      title: 'Avis totaux',
      value: '127',
      change: '+12%',
      icon: Star,
      color: 'text-[#FBBC05]',
      bgColor: 'bg-[#FBBC05]/10'
    },
    {
      title: 'Réponses envoyées',
      value: '89',
      change: '+8%',
      icon: MessageSquare,
      color: 'text-[#4285F4]',
      bgColor: 'bg-[#4285F4]/10'
    },
    {
      title: 'Note moyenne',
      value: '4.6',
      change: '+0.2',
      icon: Award,
      color: 'text-[#34A853]',
      bgColor: 'bg-[#34A853]/10'
    },
    {
      title: 'Taux de réponse',
      value: '94%',
      change: '+5%',
      icon: TrendingUp,
      color: 'text-[#EA4335]',
      bgColor: 'bg-[#EA4335]/10'
    }
  ];

  const recentReviews = [
    {
      id: 1,
      author: 'Marie Dubois',
      rating: 5,
      comment: 'Excellent service, très professionnel !',
      date: '2024-01-15',
      replied: true
    },
    {
      id: 2,
      author: 'Jean Martin',
      rating: 4,
      comment: 'Bonne expérience dans l\'ensemble.',
      date: '2024-01-14',
      replied: false
    },
    {
      id: 3,
      author: 'Sophie Laurent',
      rating: 5,
      comment: 'Je recommande vivement !',
      date: '2024-01-13',
      replied: true
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
        {/* Stats Cards */}
        <div className="grid grid-cols-2 gap-4 mb-6">
          {stats.map((stat, index) => {
            const Icon = stat.icon;
            return (
              <div key={index} className="bg-white rounded-xl p-4 shadow-sm">
                <div className="flex items-center justify-between mb-2">
                  <div className={`p-2 rounded-lg ${stat.bgColor}`}>
                    <Icon className={`w-5 h-5 ${stat.color}`} />
                  </div>
                  <span className="text-xs text-[#34A853] font-medium">
                    {stat.change}
                  </span>
                </div>
                <div className="text-2xl font-bold text-gray-900 mb-1">
                  {stat.value}
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
            <button className="flex items-center justify-center p-4 bg-[#4285F4]/10 rounded-lg text-[#4285F4] font-medium">
              <Star className="w-5 h-5 mr-2" />
              Voir les avis
            </button>
            <button className="flex items-center justify-center p-4 bg-[#34A853]/10 rounded-lg text-[#34A853] font-medium">
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
            {recentReviews.map((review) => (
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
                      {new Date(review.date).toLocaleDateString('fr-FR')}
                    </span>
                  </div>
                </div>
                <p className="text-sm text-gray-600 line-clamp-2">
                  {review.comment}
                </p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;