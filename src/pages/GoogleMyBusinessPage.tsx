import React, { useState, useEffect } from 'react';
import {
  Building2,
  Star,
  TrendingUp,
  Users,
  MapPin,
  Phone,
  Globe,
  Clock,
  Eye,
  MousePointer,
  Navigation,
  BarChart3,
  Calendar,
  CheckCircle,
  AlertCircle,
  Wifi,
  WifiOff,
} from 'lucide-react';

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
  onNavigate,
}) => {
  const [isConnected, setIsConnected] = useState<boolean>(!!accessToken);
  const [locationInfo, setLocationInfo] = useState<LocationInfo | null>(null);
  const [insights, setInsights] = useState<LocationInsights | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [timeRange, setTimeRange] = useState<'7d' | '30d' | '90d'>('30d');

  /** Simulation (mock) de données GMB */
  useEffect(() => {
    if (!isConnected || !selectedLocationId) return;

    setLocationInfo({
      name: 'Meublei - Mobilier Design',
      address: '123 Rue de la Paix, 75001 Paris',
      phone: '+33 1 23 45 67 89',
      website: 'https://meublei.com',
      category: 'Magasin de meubles',
      rating: 4.6,
      reviewCount: 127,
      isVerified: true,
      status: 'active',
    });

    setInsights({
      views: 2847,
      searches: 1523,
      actions: 456,
      clicks: 234,
      calls: 89,
      directions: 167,
      websiteClicks: 123,
      photoViews: 1234,
    });
  }, [isConnected, selectedLocationId]);

  /** Connexion OAuth Google My Business */
  const connectGoogleMyBusiness = async () => {
    setLoading(true);
    const clientId = import.meta.env.VITE_GOOGLE_CLIENT_ID || '';

    if (!clientId) {
      console.warn('⚠️ Aucun client_id Google configuré — passage en mode démo');
      setIsConnected(true);
      setLoading(false);
      return;
    }

    try {
      const redirectUri = `${window.location.origin}`;
      const authUrl = `https://accounts.google.com/o/oauth2/v2/auth?` +
        `client_id=${clientId}&` +
        `redirect_uri=${encodeURIComponent(redirectUri)}&` +
        `response_type=code&` +
        `scope=${encodeURIComponent('https://www.googleapis.com/auth/business.manage')}&` +
        `access_type=offline&prompt=consent`;

      window.location.href = authUrl;
    } catch (err) {
      console.error('❌ Erreur OAuth :', err);
      setIsConnected(true);
      setLoading(false);
    }
  };

  /** Icônes de statut établissement */
  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'active':
        return <CheckCircle className="w-4 h-4 text-[#34A853]" />;
      case 'suspended':
        return <AlertCircle className="w-4 h-4 text-[#EA4335]" />;
      case 'pending':
        return <Clock className="w-4 h-4 text-[#FBBC05]" />;
      default:
        return <AlertCircle className="w-4 h-4 text-gray-500" />;
    }
  };

  /** Étoiles de notation */
  const renderStars = (rating: number) => (
    <div className="flex items-center">
      {[1, 2, 3, 4, 5].map((star) => (
        <Star
          key={star}
          className={`w-4 h-4 ${
            star <= Math.round(rating) ? 'text-[#FBBC05] fill-current' : 'text-gray-300'
          }`}
        />
      ))}
      <span className="ml-2 text-sm text-gray-600">({rating})</span>
    </div>
  );

  /** Si non connecté */
  if (!isConnected) {
    return (
      <div className="min-h-screen bg-[#F1F3F4] flex items-center justify-center">
        <div className="text-center p-8 bg-white rounded-xl shadow-md max-w-md">
          <div className="w-24 h-24 bg-[#4285F4]/10 rounded-full flex items-center justify-center mx-auto mb-6">
            <WifiOff className="w-12 h-12 text-[#4285F4]" />
          </div>
          <h1 className="text-2xl font-bold text-gray-900 mb-3">
            Google My Business non connecté
          </h1>
          <p className="text-gray-600 mb-8">
            Connectez votre compte pour consulter les statistiques, gérer vos avis et suivre vos performances.
          </p>
          <button
            onClick={connectGoogleMyBusiness}
            disabled={loading}
            className="inline-flex items-center px-6 py-3 bg-[#4285F4] text-white rounded-lg hover:bg-[#3367D6] transition font-medium"
          >
            <Building2 className="w-5 h-5 mr-2" />
            {loading ? 'Connexion...' : 'Connecter Google My Business'}
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F1F3F4] pt-20">
      <div className="max-w-6xl mx-auto p-4">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 flex items-center mb-1">
              <Building2 className="w-7 h-7 text-[#4285F4] mr-3" />
              Tableau de bord Google My Business
            </h1>
            <p className="text-gray-600 text-sm">
              Suivez vos performances et gérez votre présence en ligne
            </p>
          </div>
          <div className="flex items-center text-[#34A853]">
            <Wifi className="w-5 h-5 mr-2" />
            <span className="text-sm font-medium">Connecté</span>
          </div>
        </div>

        {/* Infos établissement */}
        {locationInfo && (
          <div className="bg-white rounded-xl shadow-sm p-6 mb-6">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h2 className="text-xl font-semibold text-gray-900 flex items-center">
                  {locationInfo.name}
                  <span
                    className={`ml-3 flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                      locationInfo.status === 'active'
                        ? 'bg-[#34A853]/10 text-[#34A853]'
                        : locationInfo.status === 'suspended'
                        ? 'bg-[#EA4335]/10 text-[#EA4335]'
                        : 'bg-[#FBBC05]/10 text-[#FBBC05]'
                    }`}
                  >
                    {getStatusIcon(locationInfo.status)}
                    <span className="ml-1 capitalize">{locationInfo.status}</span>
                  </span>
                  {locationInfo.isVerified && (
                    <span className="ml-2 flex items-center px-2 py-1 bg-blue-50 text-blue-700 rounded-full text-xs font-medium">
                      <CheckCircle className="w-3 h-3 mr-1" />
                      Vérifié
                    </span>
                  )}
                </h2>
                <p className="text-gray-600 text-sm">{locationInfo.category}</p>
                {renderStars(locationInfo.rating)}
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 text-sm text-gray-600">
              <div className="flex items-center">
                <MapPin className="w-4 h-4 mr-2 text-gray-400" /> {locationInfo.address}
              </div>
              <div className="flex items-center">
                <Phone className="w-4 h-4 mr-2 text-gray-400" /> {locationInfo.phone}
              </div>
              <div className="flex items-center">
                <Globe className="w-4 h-4 mr-2 text-gray-400" />
                <a href={locationInfo.website} target="_blank" rel="noopener noreferrer" className="text-[#4285F4] hover:underline">
                  Site web
                </a>
              </div>
              <div className="flex items-center">
                <Star className="w-4 h-4 mr-2 text-gray-400" /> {locationInfo.reviewCount} avis
              </div>
            </div>
          </div>
        )}

        {/* Sélecteur de période */}
        <div className="bg-white rounded-xl shadow-sm p-4 mb-6 flex items-center justify-between">
          <h3 className="text-lg font-semibold text-gray-900">Performances</h3>
          <div className="flex bg-gray-100 rounded-lg p-1">
            {['7d', '30d', '90d'].map((range) => (
              <button
                key={range}
                onClick={() => setTimeRange(range as any)}
                className={`px-3 py-1 rounded-md text-sm font-medium ${
                  timeRange === range
                    ? 'bg-white text-gray-900 shadow-sm'
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                {range === '7d' ? '7 jours' : range === '30d' ? '30 jours' : '90 jours'}
              </button>
            ))}
          </div>
        </div>

        {/* Statistiques principales */}
        {insights && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            {[
              { icon: Eye, color: '#4285F4', label: 'Vues du profil', value: insights.views, delta: '+12%' },
              { icon: Users, color: '#34A853', label: 'Recherches', value: insights.searches, delta: '+8%' },
              { icon: MousePointer, color: '#FBBC05', label: 'Actions totales', value: insights.actions, delta: '+15%' },
              { icon: TrendingUp, color: '#EA4335', label: 'Clics totaux', value: insights.clicks, delta: '+22%' },
            ].map(({ icon: Icon, color, label, value, delta }) => (
              <div key={label} className="bg-white rounded-xl p-6 shadow-sm">
                <div className="flex items-center justify-between mb-4">
                  <div className="p-3 rounded-lg" style={{ backgroundColor: `${color}1A` }}>
                    <Icon className="w-6 h-6" style={{ color }} />
                  </div>
                  <span className="text-sm text-[#34A853] font-medium">{delta}</span>
                </div>
                <div className="text-2xl font-bold text-gray-900 mb-1">
                  {value.toLocaleString()}
                </div>
                <div className="text-sm text-gray-600">{label}</div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default GoogleMyBusinessPage;
