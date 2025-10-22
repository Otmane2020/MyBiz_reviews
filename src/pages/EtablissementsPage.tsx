import React, { useEffect, useState } from 'react';
import { Building2, Plus, ExternalLink, Trash2, RefreshCw, CheckCircle } from 'lucide-react';
import { supabase } from '../lib/supabase';
import BusinessSearch from '../components/BusinessSearch';

interface Location {
  id: string;
  location_name: string;
  address: string;
  is_active: boolean;
  last_synced_at: string;
}

interface EtablissementsPageProps {
  user: any;
  onNavigate?: (page: string) => void;
}

const EtablissementsPage: React.FC<EtablissementsPageProps> = ({ user, onNavigate }) => {
  const [locations, setLocations] = useState<Location[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAddBusiness, setShowAddBusiness] = useState(false);

  useEffect(() => {
    if (user?.id) {
      loadLocations();
    }
  }, [user]);

  const loadLocations = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('locations')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (error) throw error;

      setLocations(data || []);
    } catch (error) {
      console.error('Error loading locations:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleMyBusinessConnect = () => {
    const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
    const redirectUrl = `${window.location.origin}`;

    window.location.href = `${supabaseUrl}/auth/v1/authorize?provider=google&redirect_to=${encodeURIComponent(redirectUrl)}&scopes=https://www.googleapis.com/auth/business.manage`;
  };

  const handleDeleteLocation = async (locationId: string) => {
    if (!confirm('Êtes-vous sûr de vouloir supprimer cet établissement ?')) {
      return;
    }

    try {
      const { error } = await supabase
        .from('locations')
        .delete()
        .eq('id', locationId)
        .eq('user_id', user.id);

      if (error) throw error;

      await loadLocations();
    } catch (error) {
      console.error('Error deleting location:', error);
      alert('Erreur lors de la suppression');
    }
  };

  const handleBusinessAdded = () => {
    setShowAddBusiness(false);
    loadLocations();
  };

  if (showAddBusiness) {
    return (
      <div className="min-h-screen bg-gray-50 pt-16">
        <div className="max-w-4xl mx-auto p-6">
          <button
            onClick={() => setShowAddBusiness(false)}
            className="mb-4 text-blue-600 hover:text-blue-800 flex items-center"
          >
            ← Retour
          </button>
          <BusinessSearch
            onBusinessSelect={handleBusinessAdded}
            userId={user?.id}
            autoImportReviews={true}
          />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 pt-16 pb-20">
      <div className="max-w-4xl mx-auto p-6">
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-gray-900 mb-2 flex items-center">
            <Building2 className="w-8 h-8 mr-3 text-blue-600" />
            Mes établissements
          </h1>
          <p className="text-gray-600">
            Gérez vos établissements et connectez Google My Business
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
          <button
            onClick={() => setShowAddBusiness(true)}
            className="bg-gradient-to-r from-blue-600 to-blue-700 text-white p-6 rounded-lg hover:from-blue-700 hover:to-blue-800 transition-all shadow-lg flex items-center justify-center"
          >
            <Plus className="w-6 h-6 mr-2" />
            Ajouter un établissement
          </button>

          <button
            onClick={handleGoogleMyBusinessConnect}
            className="bg-gradient-to-r from-green-600 to-green-700 text-white p-6 rounded-lg hover:from-green-700 hover:to-green-800 transition-all shadow-lg flex items-center justify-center"
          >
            <Building2 className="w-6 h-6 mr-2" />
            Connecter Google My Business
          </button>
        </div>

        {loading ? (
          <div className="bg-white rounded-lg shadow-md p-8 text-center">
            <RefreshCw className="w-8 h-8 animate-spin text-blue-600 mx-auto mb-2" />
            <p className="text-gray-600">Chargement...</p>
          </div>
        ) : locations.length === 0 ? (
          <div className="bg-white rounded-lg shadow-md p-8 text-center">
            <Building2 className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              Aucun établissement
            </h3>
            <p className="text-gray-600 mb-4">
              Commencez par ajouter votre premier établissement
            </p>
            <button
              onClick={() => setShowAddBusiness(true)}
              className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors inline-flex items-center"
            >
              <Plus className="w-5 h-5 mr-2" />
              Ajouter un établissement
            </button>
          </div>
        ) : (
          <div className="space-y-4">
            {locations.map((location) => (
              <div
                key={location.id}
                className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow"
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center mb-2">
                      <h3 className="text-lg font-semibold text-gray-900">
                        {location.location_name}
                      </h3>
                      {location.is_active && (
                        <span className="ml-3 flex items-center text-green-600 text-sm">
                          <CheckCircle className="w-4 h-4 mr-1" />
                          Actif
                        </span>
                      )}
                    </div>
                    <p className="text-gray-600 text-sm mb-2">{location.address}</p>
                    <p className="text-gray-400 text-xs">
                      Dernière sync: {new Date(location.last_synced_at).toLocaleDateString('fr-FR')}
                    </p>
                  </div>
                  <div className="flex items-center space-x-2 ml-4">
                    <button
                      onClick={() => handleDeleteLocation(location.id)}
                      className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                      title="Supprimer"
                    >
                      <Trash2 className="w-5 h-5" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default EtablissementsPage;
