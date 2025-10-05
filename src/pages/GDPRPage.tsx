import React, { useState } from 'react';
import {
  Shield,
  ArrowLeft,
  Download,
  Trash2,
  Eye,
  Edit3,
  Mail,
  FileText,
  CheckCircle,
  Users,
  AlertTriangle,
} from 'lucide-react';
import StarlinkoLogo from '../components/StarlinkoLogo';

const GDPRPage: React.FC = () => {
  const [requestType, setRequestType] = useState<'access' | 'rectification' | 'erasure' | 'portability' | ''>('');
  const [requestDetails, setRequestDetails] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const goBack = () => window.history.back();

  const handleSubmitRequest = async () => {
    if (!requestType || !requestDetails.trim()) {
      alert('Veuillez sélectionner un type de demande et fournir des détails.');
      return;
    }

    setIsSubmitting(true);

    // Simulation d’envoi
    setTimeout(() => {
      alert(
        '✅ Votre demande RGPD a été envoyée avec succès.\nNous vous répondrons dans un délai maximum de 30 jours.'
      );
      setRequestType('');
      setRequestDetails('');
      setIsSubmitting(false);
    }, 2000);
  };

  const rights = [
    {
      id: 'access',
      title: "Droit d'accès",
      icon: <Eye className="w-6 h-6" />,
      color: 'text-[#4285F4]',
      bgColor: 'bg-[#4285F4]/10',
      description:
        'Obtenez une copie de toutes les données personnelles que nous détenons sur vous.',
      details: [
        'Données de profil (nom, email, photo)',
        'Historique des avis et réponses',
        'Paramètres et préférences',
        'Logs de connexion et d’activité',
        'Données de facturation',
      ],
    },
    {
      id: 'rectification',
      title: 'Droit de rectification',
      icon: <Edit3 className="w-6 h-6" />,
      color: 'text-[#34A853]',
      bgColor: 'bg-[#34A853]/10',
      description: 'Corrigez ou mettez à jour vos informations personnelles inexactes.',
      details: [
        'Modification du nom ou email',
        'Mise à jour des informations de profil',
        'Correction des données d’établissement',
        'Actualisation des préférences',
      ],
    },
    {
      id: 'erasure',
      title: "Droit à l’effacement",
      icon: <Trash2 className="w-6 h-6" />,
      color: 'text-[#EA4335]',
      bgColor: 'bg-[#EA4335]/10',
      description:
        'Demandez la suppression de vos données personnelles (“droit à l’oubli”).',
      details: [
        'Suppression complète du compte',
        'Effacement des données de profil',
        'Suppression de l’historique des avis',
        'Anonymisation des données de facturation',
      ],
    },
    {
      id: 'portability',
      title: 'Droit à la portabilité',
      icon: <Download className="w-6 h-6" />,
      color: 'text-[#FBBC05]',
      bgColor: 'bg-[#FBBC05]/10',
      description:
        'Exportez vos données dans un format structuré et lisible par machine.',
      details: [
        'Export JSON de toutes vos données',
        'Historique complet des avis',
        'Paramètres et configurations',
        'Statistiques et analytics',
      ],
    },
  ];

  return (
    <div className="min-h-screen bg-[#F1F3F4]">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 shadow-sm">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center h-16">
            <button
              onClick={goBack}
              className="mr-4 p-2 rounded-lg hover:bg-gray-100 transition-colors"
              aria-label="Revenir en arrière"
            >
              <ArrowLeft className="w-5 h-5 text-gray-600" />
            </button>
            <StarlinkoLogo size="md" showText />
          </div>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="bg-white rounded-xl shadow-sm p-8">
          {/* Header */}
          <div className="text-center mb-8">
            <div className="w-16 h-16 bg-[#4285F4]/10 rounded-full flex items-center justify-center mx-auto mb-4">
              <Shield className="w-8 h-8 text-[#4285F4]" />
            </div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Vos droits RGPD</h1>
            <p className="text-gray-600">
              Exercez vos droits sur vos données personnelles conformément au règlement européen
            </p>
          </div>

          {/* Introduction */}
          <div className="bg-gradient-to-r from-[#4285F4]/10 to-[#34A853]/10 rounded-lg p-6 mb-8">
            <h2 className="text-xl font-semibold text-gray-900 mb-3 flex items-center">
              <Users className="w-5 h-5 mr-2 text-[#4285F4]" />
              Règlement Général sur la Protection des Données (RGPD)
            </h2>
            <p className="text-gray-700 mb-4">
              Le RGPD vous donne le contrôle sur vos données personnelles. Chez Starlinko, nous
              respectons pleinement ces droits et facilitons leur exercice.
            </p>
            <div className="grid md:grid-cols-2 gap-3">
              <div className="flex items-center text-sm text-gray-700">
                <CheckCircle className="w-5 h-5 text-[#34A853] mr-2" />
                Conformité RGPD certifiée
              </div>
              <div className="flex items-center text-sm text-gray-700">
                <CheckCircle className="w-5 h-5 text-[#34A853] mr-2" />
                Réponse sous 30 jours maximum
              </div>
            </div>
          </div>

          {/* Rights Grid */}
          <h2 className="text-2xl font-bold text-gray-900 mb-6">Vos droits fondamentaux</h2>
          <div className="grid md:grid-cols-2 gap-6 mb-8">
            {rights.map((right) => (
              <div
                key={right.id}
                onClick={() => setRequestType(right.id as any)}
                className={`border-2 rounded-xl p-6 cursor-pointer transition-all ${
                  requestType === right.id
                    ? 'border-[#4285F4] bg-[#4285F4]/5'
                    : 'border-gray-200 hover:border-gray-300'
                }`}
              >
                <div className="flex items-center mb-4">
                  <div className={`p-3 rounded-lg ${right.bgColor} mr-4`}>
                    <div className={right.color}>{right.icon}</div>
                  </div>
                  <h3 className="text-lg font-semibold text-gray-900">{right.title}</h3>
                </div>
                <p className="text-gray-600 mb-3">{right.description}</p>
                <ul className="space-y-1 text-sm text-gray-600">
                  {right.details.map((detail, i) => (
                    <li key={i} className="flex items-center">
                      <span className="w-1.5 h-1.5 bg-gray-400 rounded-full mr-2" />
                      {detail}
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>

          {/* Request Form */}
          {requestType && (
            <div className="bg-gray-50 rounded-xl p-6 mb-8">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">
                Formulaire de demande — {rights.find((r) => r.id === requestType)?.title}
              </h3>

              <label className="block text-sm font-medium text-gray-700 mb-2">
                Détails de votre demande
              </label>
              <textarea
                value={requestDetails}
                onChange={(e) => setRequestDetails(e.target.value)}
                rows={4}
                placeholder="Décrivez précisément votre demande..."
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#4285F4] focus:outline-none mb-4"
              />

              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-4">
                <h4 className="font-semibold text-blue-900 mb-2">Informations importantes</h4>
                <ul className="text-sm text-blue-800 space-y-1">
                  <li>• Réponse sous 30 jours maximum</li>
                  <li>• Une pièce d’identité peut être demandée</li>
                  <li>• Confirmation par email à la réception</li>
                  <li>• Certaines données sont conservées pour des obligations légales</li>
                </ul>
              </div>

              <div className="flex flex-col sm:flex-row gap-3">
                <button
                  onClick={handleSubmitRequest}
                  disabled={isSubmitting}
                  className="flex items-center justify-center px-6 py-3 bg-[#4285F4] text-white rounded-lg hover:bg-[#3367D6] disabled:opacity-50 transition font-medium"
                >
                  {isSubmitting ? (
                    <>
                      <div className="animate-spin h-4 w-4 border-b-2 border-white rounded-full mr-2" />
                      Envoi en cours...
                    </>
                  ) : (
                    <>
                      <Mail className="w-5 h-5 mr-2" /> Envoyer la demande
                    </>
                  )}
                </button>
                <button
                  onClick={() => {
                    setRequestType('');
                    setRequestDetails('');
                  }}
                  className="flex items-center justify-center px-6 py-3 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition font-medium"
                >
                  Annuler
                </button>
              </div>
            </div>
          )}

          {/* Info complémentaire */}
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Informations complémentaires</h2>

          <div className="grid md:grid-cols-2 gap-6 mb-6">
            <div className="bg-green-50 rounded-lg p-6">
              <h3 className="text-lg font-semibold text-green-900 mb-3 flex items-center">
                <CheckCircle className="w-5 h-5 mr-2" /> Base légale du traitement
              </h3>
              <ul className="text-sm text-green-800 space-y-2">
                <li>• Consentement : utilisation de l’IA, marketing</li>
                <li>• Contrat : fourniture du service Starlinko</li>
                <li>• Intérêt légitime : amélioration et sécurité</li>
                <li>• Obligation légale : facturation, comptabilité</li>
              </ul>
            </div>

            <div className="bg-blue-50 rounded-lg p-6">
              <h3 className="text-lg font-semibold text-blue-900 mb-3 flex items-center">
                <FileText className="w-5 h-5 mr-2" /> Délais de traitement
              </h3>
              <ul className="text-sm text-blue-800 space-y-2">
                <li>• Accès : 30 jours max</li>
                <li>• Rectification : 72 h à 30 jours</li>
                <li>• Effacement : 30 jours max</li>
                <li>• Portabilité : 30 jours max</li>
              </ul>
            </div>
          </div>

          <div className="bg-yellow-50 border-l-4 border-yellow-400 rounded-lg p-6 mb-6">
            <h3 className="text-lg font-semibold text-yellow-900 mb-3 flex items-center">
              <AlertTriangle className="w-5 h-5 mr-2" /> Limitations importantes
            </h3>
            <ul className="text-sm text-yellow-800 space-y-2">
              <li>• Certaines données doivent être conservées (facturation, obligations légales)</li>
              <li>• L’effacement peut limiter le fonctionnement de votre compte</li>
              <li>• Les données anonymisées ne peuvent pas être supprimées</li>
              <li>• Les sauvegardes peuvent nécessiter jusqu’à 90 jours pour suppression complète</li>
            </ul>
          </div>

          {/* Contact DPO */}
          <div className="bg-gradient-to-r from-[#4285F4]/10 to-[#34A853]/10 rounded-lg p-6 mb-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-3">Délégué à la Protection des Données (DPO)</h3>
            <p className="text-gray-700 mb-4">
              Notre DPO est votre interlocuteur pour toutes questions relatives à la protection de vos données.
            </p>
            <div className="grid md:grid-cols-2 gap-4">
              <div className="flex items-center">
                <Mail className="w-5 h-5 text-[#4285F4] mr-3" />
                <div>
                  <div className="font-medium text-gray-900">Email DPO</div>
                  <div className="text-sm text-gray-600">dpo@starlinko.com</div>
                </div>
              </div>
              <div className="flex items-center">
                <Shield className="w-5 h-5 text-[#34A853] mr-3" />
                <div>
                  <div className="font-medium text-gray-900">Certification</div>
                  <div className="text-sm text-gray-600">CNIL - DPO certifié</div>
                </div>
              </div>
            </div>
          </div>

          {/* CNIL Info */}
          <div className="bg-red-50 rounded-lg p-6">
            <h3 className="text-lg font-semibold text-red-900 mb-3">Réclamation auprès de la CNIL</h3>
            <p className="text-red-800 mb-4">
              Si vous estimez que vos droits ne sont pas respectés, vous pouvez contacter l’autorité
              de contrôle française :
            </p>
            <ul className="text-sm text-red-800 space-y-1">
              <li>
                <strong>CNIL</strong> — Commission Nationale de l’Informatique et des Libertés
              </li>
              <li>
                <strong>Site web :</strong>{' '}
                <a
                  href="https://www.cnil.fr"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="underline"
                >
                  www.cnil.fr
                </a>
              </li>
              <li>
                <strong>Adresse :</strong> 3 Place de Fontenoy, TSA 80715, 75334 Paris Cedex 07
              </li>
              <li>
                <strong>Téléphone :</strong> 01 53 73 22 22
              </li>
            </ul>
          </div>
        </div>
      </main>
    </div>
  );
};

export default GDPRPage;
