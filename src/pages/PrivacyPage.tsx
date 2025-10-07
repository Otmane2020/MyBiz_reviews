import React from 'react';
import {
  Shield,
  ArrowLeft,
  Eye,
  Lock,
  Database,
  UserCheck,
  Mail,
  Phone,
  Building,
} from 'lucide-react';
import StarlinkoLogo from '../components/StarlinkoLogo';

const PrivacyPage: React.FC = () => {
  const goBack = () => {
    window.history.back();
  };

  return (
    <div className="min-h-screen bg-[#F1F3F4]">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 shadow-sm">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center">
              <button
                onClick={goBack}
                className="mr-4 p-2 rounded-lg hover:bg-gray-100 transition-colors"
              >
                <ArrowLeft className="w-5 h-5 text-gray-600" />
              </button>
              <StarlinkoLogo size="md" showText={true} />
            </div>
          </div>
        </div>
      </header>

      {/* Content */}
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="bg-white rounded-xl shadow-sm p-8">
          <div className="text-center mb-8">
            <div className="w-16 h-16 bg-[#4285F4]/10 rounded-full flex items-center justify-center mx-auto mb-4">
              <Shield className="w-8 h-8 text-[#4285F4]" />
            </div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">
              Politique de Confidentialité
            </h1>
            <p className="text-gray-600">Dernière mise à jour : 1er janvier 2024</p>
          </div>

          <div className="prose prose-lg max-w-none">
            <div className="bg-[#4285F4]/5 rounded-lg p-6 mb-8">
              <h2 className="text-xl font-semibold text-gray-900 mb-3 flex items-center">
                <Eye className="w-5 h-5 mr-2 text-[#4285F4]" />
                Résumé de notre engagement
              </h2>
              <p className="text-gray-700">
                Chez Starlinko (propriété de SWEET DECO), nous nous engageons à protéger votre vie
                privée et vos données personnelles. Cette politique explique comment nous collectons,
                utilisons et protégeons vos informations lorsque vous utilisez notre plateforme de
                gestion et d’analyse de fiches Google My Business.
              </p>
            </div>

            <h2 className="text-2xl font-bold text-gray-900 mb-4">
              1. Informations que nous collectons
            </h2>

            <ul className="list-disc pl-6 mb-6 space-y-2">
              <li>Nom complet et adresse e-mail (via connexion Google OAuth)</li>
              <li>Photo de profil Google (optionnelle)</li>
              <li>Identifiant unique Google</li>
              <li>Données d’établissement issues de votre compte Google Business Profile</li>
              <li>Avis clients et statistiques associées</li>
              <li>Données d’utilisation et logs techniques (IP, navigateur, heure de connexion)</li>
            </ul>

            <h2 className="text-2xl font-bold text-gray-900 mb-4">
              2. Comment nous utilisons vos données
            </h2>

            <div className="bg-[#34A853]/5 rounded-lg p-6 mb-6">
              <h3 className="text-xl font-semibold text-gray-800 mb-3 flex items-center">
                <Database className="w-5 h-5 mr-2 text-[#34A853]" />
                Finalités du traitement
              </h3>
              <ul className="list-disc pl-6 space-y-2">
                <li>Permettre la connexion sécurisée via Google (OAuth 2.0)</li>
                <li>Afficher et gérer vos établissements et avis</li>
                <li>Générer automatiquement des réponses IA personnalisées</li>
                <li>Assurer la facturation et la gestion des abonnements</li>
                <li>Améliorer le service via analyses statistiques anonymisées</li>
              </ul>
            </div>

            <h2 className="text-2xl font-bold text-gray-900 mb-4">
              3. Partage et hébergement des données
            </h2>

            <ul className="list-disc pl-6 mb-6 space-y-2">
              <li>
                <strong>Google</strong> — Authentification et accès aux données de votre
