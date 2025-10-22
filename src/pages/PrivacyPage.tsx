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
                Chez <strong>Starlinko</strong>, marque développée par la société{' '}
                <strong>Decora Home - Decora Home - SWEET DECO</strong>, nous nous engageons à protéger votre vie privée et vos
                données personnelles. Cette politique décrit comment vos informations sont
                collectées, utilisées et protégées lorsque vous utilisez notre plateforme SaaS
                Starlinko.
              </p>
            </div>

            <h2 className="text-2xl font-bold text-gray-900 mb-4">
              1. Informations collectées
            </h2>

            <ul className="list-disc pl-6 mb-6 space-y-2">
              <li>Nom complet, adresse e-mail et identifiant Google (via OAuth 2.0)</li>
              <li>Photo de profil Google (si disponible)</li>
              <li>Données issues de Google Business Profile (établissements, avis, statistiques)</li>
              <li>Données d’utilisation et journaux de connexion</li>
              <li>Informations de facturation et d’abonnement (via Stripe)</li>
            </ul>

            <h2 className="text-2xl font-bold text-gray-900 mb-4">
              2. Utilisation de vos données
            </h2>

            <div className="bg-[#34A853]/5 rounded-lg p-6 mb-6">
              <h3 className="text-xl font-semibold text-gray-800 mb-3 flex items-center">
                <Database className="w-5 h-5 mr-2 text-[#34A853]" />
                Finalités du traitement
              </h3>
              <ul className="list-disc pl-6 space-y-2">
                <li>Connexion sécurisée via Google OAuth</li>
                <li>Accès et gestion de vos fiches Google Business Profile</li>
                <li>Génération automatique de réponses et rapports</li>
                <li>Facturation et gestion des abonnements</li>
                <li>Amélioration continue du service</li>
              </ul>
            </div>

            <h2 className="text-2xl font-bold text-gray-900 mb-4">
              3. Partage et hébergement des données
            </h2>

            <ul className="list-disc pl-6 mb-6 space-y-2">
              <li>
                <strong>Google</strong> : pour l’authentification et l’accès aux données Google
                Business Profile.
              </li>
              <li>
                <strong>Supabase</strong> : pour le stockage sécurisé et l’hébergement des données.
              </li>
              <li>
                <strong>Stripe</strong> : pour la gestion des paiements et abonnements.
              </li>
            </ul>

            <div className="bg-[#EA4335]/5 border-l-4 border-[#EA4335] rounded-lg p-4 mb-6">
              <p className="text-gray-700">
                <strong>Engagement :</strong> Starlinko et Decora Home - Decora Home - SWEET DECO ne vendent, ne louent et ne
                partagent jamais vos données personnelles à des tiers à des fins commerciales.
              </p>
            </div>

            <h2 className="text-2xl font-bold text-gray-900 mb-4">4. Sécurité</h2>

            <div className="bg-[#FBBC05]/5 rounded-lg p-6 mb-6">
              <h3 className="text-xl font-semibold text-gray-800 mb-3 flex items-center">
                <Lock className="w-5 h-5 mr-2 text-[#FBBC05]" />
                Mesures de protection
              </h3>
              <ul className="list-disc pl-6 space-y-2">
                <li>Chiffrement TLS 1.3 et stockage AES-256</li>
                <li>Authentification OAuth 2.0 sans mot de passe local</li>
                <li>Accès restreint selon le principe du moindre privilège</li>
                <li>Surveillance et sauvegardes automatiques</li>
              </ul>
            </div>

            <h2 className="text-2xl font-bold text-gray-900 mb-4">
              5. Vos droits (RGPD)
            </h2>

            <div className="grid md:grid-cols-2 gap-6 mb-6">
              <div className="bg-gray-50 rounded-lg p-4">
                <h4 className="font-semibold text-gray-900 mb-2">Droit d’accès</h4>
                <p className="text-sm text-gray-600">
                  Vous pouvez demander l’accès à l’ensemble de vos données personnelles.
                </p>
              </div>
              <div className="bg-gray-50 rounded-lg p-4">
                <h4 className="font-semibold text-gray-900 mb-2">Droit de rectification</h4>
                <p className="text-sm text-gray-600">
                  Vous pouvez corriger ou mettre à jour vos informations à tout moment.
                </p>
              </div>
              <div className="bg-gray-50 rounded-lg p-4">
                <h4 className="font-semibold text-gray-900 mb-2">Droit à l’effacement</h4>
                <p className="text-sm text-gray-600">
                  Vous pouvez demander la suppression définitive de vos données.
                </p>
              </div>
              <div className="bg-gray-50 rounded-lg p-4">
                <h4 className="font-semibold text-gray-900 mb-2">Droit à la portabilité</h4>
                <p className="text-sm text-gray-600">
                  Vous pouvez obtenir une copie de vos données dans un format structuré.
                </p>
              </div>
            </div>

            <h2 className="text-2xl font-bold text-gray-900 mb-4">
              6. Contact et réclamations
            </h2>

            <div className="bg-gradient-to-r from-[#4285F4]/10 to-[#34A853]/10 rounded-lg p-6 mb-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">
                Pour toute question ou demande relative à vos données :
              </h3>

              <div className="grid md:grid-cols-2 gap-4">
                <div className="flex items-center">
                  <Mail className="w-5 h-5 text-[#4285F4] mr-3" />
                  <div>
                    <div className="font-medium text-gray-900">Email</div>
                    <div className="text-sm text-gray-600">privacy@starlinko.com</div>
                  </div>
                </div>

                <div className="flex items-center">
                  <UserCheck className="w-5 h-5 text-[#34A853] mr-3" />
                  <div>
                    <div className="font-medium text-gray-900">
                      Délégué à la protection des données
                    </div>
                    <div className="text-sm text-gray-600">dpo@starlinko.com</div>
                  </div>
                </div>
              </div>

              <div className="mt-4 pt-4 border-t border-gray-200">
                <p className="text-sm text-gray-600">
                  <strong>Droit de réclamation :</strong> Vous pouvez déposer une réclamation auprès
                  de la CNIL (Commission Nationale de l’Informatique et des Libertés) si vous estimez
                  que vos droits ne sont pas respectés.
                </p>
              </div>
            </div>

            <div className="text-sm text-gray-500 border-t pt-6">
              <div className="flex items-center mb-2">
                <Building className="w-4 h-4 text-gray-400 mr-2" />
                <span>
                  Éditeur : <strong>Decora Home - SWEET DECO</strong> – 280 Boulevard de la Boissière, 93100
                  Montreuil, France
                </span>
              </div>
              <p>SIRET : 897 801 775 00015 – contact@starlinko.com</p>
              <p className="mt-2">© {new Date().getFullYear()} Decora Home - Decora Home - SWEET DECO / Starlinko – Tous droits réservés.</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PrivacyPage;
