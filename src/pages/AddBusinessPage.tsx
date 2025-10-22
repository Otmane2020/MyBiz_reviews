import React, { useEffect, useState } from 'react';
import { ArrowLeft } from 'lucide-react';
import BusinessSearch from '../components/BusinessSearch';
import { supabase } from '../lib/supabase';

interface AddBusinessPageProps {
  onBack: () => void;
  onBusinessAdded?: () => void;
}

const AddBusinessPage: React.FC<AddBusinessPageProps> = ({ onBack, onBusinessAdded }) => {
  const [userId, setUserId] = useState<string | null>(null);

  useEffect(() => {
    const getUserId = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        setUserId(user.id);
      }
    };
    getUserId();
  }, []);

  const handleBusinessSelect = () => {
    if (onBusinessAdded) {
      onBusinessAdded();
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-gradient-to-r from-blue-600 to-green-500 text-white p-6">
        <div className="max-w-4xl mx-auto">
          <button
            onClick={onBack}
            className="flex items-center text-white/90 hover:text-white mb-4 transition-colors"
          >
            <ArrowLeft className="w-5 h-5 mr-2" />
            Retour
          </button>
          <h1 className="text-3xl font-bold">Ajouter un établissement</h1>
          <p className="text-white/90 mt-2">
            Recherchez votre établissement et importez automatiquement ses avis Google
          </p>
        </div>
      </div>

      <div className="max-w-4xl mx-auto p-6">
        <BusinessSearch
          onBusinessSelect={handleBusinessSelect}
          userId={userId || undefined}
          autoImportReviews={true}
        />

        <div className="mt-6 bg-blue-50 border border-blue-200 rounded-lg p-4">
          <h3 className="font-semibold text-blue-900 mb-2">Comment ça marche ?</h3>
          <ol className="list-decimal list-inside space-y-2 text-blue-800 text-sm">
            <li>Recherchez votre établissement par nom et localisation</li>
            <li>Cliquez sur l'établissement dans les résultats</li>
            <li>Les avis Google seront automatiquement importés</li>
            <li>Vous pourrez ensuite gérer et répondre aux avis depuis votre dashboard</li>
          </ol>
        </div>
      </div>
    </div>
  );
};

export default AddBusinessPage;
