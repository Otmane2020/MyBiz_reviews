import React, { useState, useEffect } from 'react';
import { Building2, Star, TrendingUp, Users, MapPin, Phone, Globe, Clock, Eye, MousePointer, Navigation, BarChart3, Calendar, CheckCircle, AlertCircle, Wifi, WifiOff } from 'lucide-react';

interface GoogleMyBusinessPageProps {
  user?: any;
  accessToken?: string;
  selectedLocationId: string;
  setSelectedLocationId: (id: string) => void;
  selectedAccountId: string;
  onNavigate: (page: string) => void;
}

interface LocationInsights {
  views: number;
  searches: number;
  actions: number;
  clicks: number;
  calls: number;
  directions: number;
  websiteClicks: number;
  photoViews: number;
}

interface LocationInfo {
  name: string;
  address: string;
  phone: string;
  website: string;
  category: string;
  rating: number;
  reviewCount: number;
  isVerified: boolean;
  status: 'active' | 'suspended' | 'pending';
}

const GoogleMyBusinessPage: React.FC<GoogleMyBusinessPageProps> = ({ 
  user, 
  accessToken, 
  selectedLocationId,
  setSelectedLocationId,
  selectedAccountId,
  onNavigate
}) => {
  const [isConnected, setIsConnected] = useState(!!accessToken);
  const [locationInfo, setLocationInfo] = useState<LocationInfo | null>(null);
  const [insights, setInsights] = useState<LocationInsights | null>(null);
  const [loading, setLoading] = useState(false);
  const [timeRange, setTimeRange] = useState<'7d' | '30d' | '90d'>('30d');

  // Mock data pour la démonstration
  useEffect(() => {
    if (isConnected && selectedLocationId) {
      setLocationInfo({
        name: 'Meublei - Mobilier Design',
        address: '123 Rue de la Paix, 75001 Paris',
        phone: '+33 1 23 45 67 89',
        website: 'https://meublei.com',
        category: 'Magasin de meubles',
        rating: 4.6,
        reviewCount: 127,
        isVerified: true,
        status: 'active'
      });

      setInsights({
        views: 2847,
        searches: 1523,
        actions: 456,
        clicks: 234,
        calls: 89,
        directions: 167,
        websiteClicks: 123,
        photoViews: 1234
      });
    }
  }, [isConnected, selectedLocationId]);

  const connectGoogleMyBusiness = () => {
    // Rediriger vers la page de configuration Google My Business
    onNavigate('google-setup');
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'text-[#34A853]';
      case 'suspended': return 'text-[#EA4335]';
      case 'pending': return 'text-[#FBBC05]';
      default: return 'text-gray-500';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'active': return <CheckCircle className="w-4 h-4" />;
      case 'suspended': return <AlertCircle className="w-4 h-4" />;
      case 'pending': return <Clock className="w-4 h-4" />;
      default: return <AlertCircle className="w-4 h-4" />;
    }
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
        <span className="ml-2 text-sm text-gray-600">({rating})</span>
      </div>
    );
  };

  if (!isConnected) {
    return (
      <div className="min-h-screen bg-[#F1F3F4] pt-20">
        <div className="max-w-4xl mx-auto p-4">
          <div className="text-center py-16">
            <div className="w-24 h-24 bg-[#4285F4]/10 rounded-full flex items-center justify-center mx-auto mb-6">
              <WifiOff className="w-12 h-12 text-[#4285F4]" />
            </div>
            <h1 className="text-2xl font-bold text-gray-900 mb-4">
              Google My Business non connecté
            </h1>
            <p className="text-gray-600 mb-8 max-w-md mx-auto">
              Connectez votre compte Google My Business pour accéder aux statistiques, 
              gérer vos informations et suivre vos performances.
            </p>
            <button
              onClick={connectGoogleMyBusiness}
              className="inline-flex items-center px-6 py-3 bg-[#4285F4] text-white rounded-lg hover:bg-[#3367D6] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#4285F4] transition-colors duration-200 font-medium"
            >
              <Building2 className="w-5 h-5 mr-2" />
              Connecter Google My Business
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F1F3F4] pt-20">
      <div className="max-w-6xl mx-auto p-4">
        {/* Header */}
        <div className="mb-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900 mb-2 flex items-center">
                <Building2 className="w-8 h-8 text-[#4285F4] mr-3" />
                Google My Business
              </h1>
              <p className="text-gray-600">
                Gérez votre présence en ligne et suivez vos performances
              </p>
            </div>
            <div className="flex items-center">
              <Wifi className="w-5 h-5 text-[#34A853] mr-2" />
              <span className="text-sm text-[#34A853] font-medium">Connecté</span>
            </div>
          </div>
        </div>

        {/* Informations de l'établissement */}
        {locationInfo && (
          <div className="bg-white rounded-xl shadow-sm p-6 mb-6">
            <div className="flex items-start justify-between mb-4">
              <div className="flex-1">
                <div className="flex items-center mb-2">
                  <h2 className="text-xl font-semibold text-gray-900 mr-3">
                    {locationInfo.name}
                  </h2>
                  <div className={`flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                    locationInfo.status === 'active' ? 'bg-[#34A853]/10 text-[#34A853]' :
                    locationInfo.status === 'suspended' ? 'bg-[#EA4335]/10 text-[#EA4335]' :
                    'bg-[#FBBC05]/10 text-[#FBBC05]'
                  }`}>
                    {getStatusIcon(locationInfo.status)}
                    <span className="ml-1 capitalize">{locationInfo.status}</span>
                  </div>
                  {locationInfo.isVerified && (
                    <div className="ml-2 flex items-center px-2 py-1 bg-blue-50 text-blue-700 rounded-full text-xs font-medium">
                      <CheckCircle className="w-3 h-3 mr-1" />
                      Vérifié
                    </div>
                  )}
                </div>
                <p className="text-gray-600 text-sm mb-1">{locationInfo.category}</p>
                {renderStars(locationInfo.rating)}
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="flex items-center text-sm text-gray-600">
                <MapPin className="w-4 h-4 mr-2 text-gray-400" />
                {locationInfo.address}
              </div>
              <div className="flex items-center text-sm text-gray-600">
                <Phone className="w-4 h-4 mr-2 text-gray-400" />
                {locationInfo.phone}
              </div>
              <div className="flex items-center text-sm text-gray-600">
                <Globe className="w-4 h-4 mr-2 text-gray-400" />
                <a href={locationInfo.website} target="_blank" rel="noopener noreferrer" className="text-[#4285F4] hover:underline">
                  Site web
                </a>
              </div>
              <div className="flex items-center text-sm text-gray-600">
                <Star className="w-4 h-4 mr-2 text-gray-400" />
                {locationInfo.reviewCount} avis
              </div>
            </div>
          </div>
        )}

        {/* Sélecteur de période */}
        <div className="bg-white rounded-xl shadow-sm p-4 mb-6">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold text-gray-900">Performances</h3>
            <div className="flex bg-gray-100 rounded-lg p-1">
              {[
                { id: '7d', label: '7 jours' },
                { id: '30d', label: '30 jours' },
                { id: '90d', label: '90 jours' }
              ].map((period) => (
                <button
                  key={period.id}
                  onClick={() => setTimeRange(period.id as any)}
                  className={`px-3 py-1 rounded-md text-sm font-medium transition-colors ${
                    timeRange === period.id
                      ? 'bg-white text-gray-900 shadow-sm'
                      : 'text-gray-600 hover:text-gray-900'
                  }`}
                >
                  {period.label}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Statistiques principales */}
        {insights && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
            <div className="bg-white rounded-xl p-6 shadow-sm">
              <div className="flex items-center justify-between mb-4">
                <div className="p-3 bg-[#4285F4]/10 rounded-lg">
                  <Eye className="w-6 h-6 text-[#4285F4]" />
                </div>
                <span className="text-sm text-[#34A853] font-medium">+12%</span>
              </div>
              <div className="text-2xl font-bold text-gray-900 mb-1">
                {insights.views.toLocaleString()}
              </div>
              <div className="text-sm text-gray-600">Vues du profil</div>
            </div>

            <div className="bg-white rounded-xl p-6 shadow-sm">
              <div className="flex items-center justify-between mb-4">
                <div className="p-3 bg-[#34A853]/10 rounded-lg">
                  <Users className="w-6 h-6 text-[#34A853]" />
                </div>
                <span className="text-sm text-[#34A853] font-medium">+8%</span>
              </div>
              <div className="text-2xl font-bold text-gray-900 mb-1">
                {insights.searches.toLocaleString()}
              </div>
              <div className="text-sm text-gray-600">Recherches</div>
            </div>

            <div className="bg-white rounded-xl p-6 shadow-sm">
              <div className="flex items-center justify-between mb-4">
                <div className="p-3 bg-[#FBBC05]/10 rounded-lg">
                  <MousePointer className="w-6 h-6 text-[#FBBC05]" />
                </div>
                <span className="text-sm text-[#34A853] font-medium">+15%</span>
              </div>
              <div className="text-2xl font-bold text-gray-900 mb-1">
                {insights.actions.toLocaleString()}
              </div>
              <div className="text-sm text-gray-600">Actions totales</div>
            </div>

            <div className="bg-white rounded-xl p-6 shadow-sm">
              <div className="flex items-center justify-between mb-4">
                <div className="p-3 bg-[#EA4335]/10 rounded-lg">
                  <TrendingUp className="w-6 h-6 text-[#EA4335]" />
                </div>
                <span className="text-sm text-[#34A853] font-medium">+22%</span>
              </div>
              <div className="text-2xl font-bold text-gray-900 mb-1">
                {insights.clicks.toLocaleString()}
              </div>
              <div className="text-sm text-gray-600">Clics totaux</div>
            </div>
          </div>
        )}

        {/* Actions détaillées */}
        {insights && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
            <div className="bg-white rounded-xl p-6 shadow-sm">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Actions des clients</h3>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center">
                    <Phone className="w-5 h-5 text-[#34A853] mr-3" />
                    <span className="text-gray-700">Appels téléphoniques</span>
                  </div>
                  <div className="text-right">
                    <div className="font-semibold text-gray-900">{insights.calls}</div>
                    <div className="text-xs text-[#34A853]">+18%</div>
                  </div>
                </div>

                <div className="flex items-center justify-between">
                  <div className="flex items-center">
                    <Navigation className="w-5 h-5 text-[#4285F4] mr-3" />
                    <span className="text-gray-700">Demandes d'itinéraire</span>
                  </div>
                  <div className="text-right">
                    <div className="font-semibold text-gray-900">{insights.directions}</div>
                    <div className="text-xs text-[#34A853]">+25%</div>
                  </div>
                </div>

                <div className="flex items-center justify-between">
                  <div className="flex items-center">
                    <Globe className="w-5 h-5 text-[#FBBC05] mr-3" />
                    <span className="text-gray-700">Clics site web</span>
                  </div>
                  <div className="text-right">
                    <div className="font-semibold text-gray-900">{insights.websiteClicks}</div>
                    <div className="text-xs text-[#34A853]">+12%</div>
                  </div>
                </div>

                <div className="flex items-center justify-between">
                  <div className="flex items-center">
                    <Eye className="w-5 h-5 text-[#EA4335] mr-3" />
                    <span className="text-gray-700">Vues des photos</span>
                  </div>
                  <div className="text-right">
                    <div className="font-semibold text-gray-900">{insights.photoViews}</div>
                    <div className="text-xs text-[#34A853]">+8%</div>
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-xl p-6 shadow-sm">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Tendances</h3>
              <div className="space-y-4">
                <div className="bg-gradient-to-r from-[#4285F4]/10 to-[#34A853]/10 rounded-lg p-4">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium text-gray-700">Performance globale</span>
                    <span className="text-sm text-[#34A853] font-medium">Excellente</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div className="bg-gradient-to-r from-[#4285F4] to-[#34A853] h-2 rounded-full" style={{width: '85%'}}></div>
                  </div>
                </div>

                <div className="space-y-3">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-600">Visibilité</span>
                    <span className="font-medium text-gray-900">Très bonne</span>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-600">Engagement</span>
                    <span className="font-medium text-gray-900">En hausse</span>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-600">Avis récents</span>
                    <span className="font-medium text-gray-900">Positifs</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Actions rapides */}
        <div className="bg-white rounded-xl p-6 shadow-sm">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Actions rapides</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <button 
              onClick={() => onNavigate('reviews')}
              className="flex items-center justify-center p-4 border border-gray-200 rounded-lg hover:border-[#4285F4] hover:bg-[#4285F4]/5 transition-colors"
            >
              <Star className="w-5 h-5 text-[#4285F4] mr-3" />
              <div className="text-left">
                <div className="font-medium text-gray-900">Gérer les avis</div>
                <div className="text-sm text-gray-500">Répondre aux avis clients</div>
              </div>
            </button>

            <button className="flex items-center justify-center p-4 border border-gray-200 rounded-lg hover:border-[#34A853] hover:bg-[#34A853]/5 transition-colors">
              <BarChart3 className="w-5 h-5 text-[#34A853] mr-3" />
              <div className="text-left">
                <div className="font-medium text-gray-900">Rapport détaillé</div>
                <div className="text-sm text-gray-500">Télécharger les stats</div>
              </div>
            </button>

            <button className="flex items-center justify-center p-4 border border-gray-200 rounded-lg hover:border-[#FBBC05] hover:bg-[#FBBC05]/5 transition-colors">
              <Calendar className="w-5 h-5 text-[#FBBC05] mr-3" />
              <div className="text-left">
                <div className="font-medium text-gray-900">Programmer un post</div>
                <div className="text-sm text-gray-500">Publier du contenu</div>
              </div>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default GoogleMyBusinessPage;