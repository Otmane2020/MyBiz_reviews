import React from 'react';
import {
  FileText,
  ArrowLeft,
  CheckCircle,
  AlertTriangle,
  CreditCard,
  Shield,
  Users,
  Mail,
} from 'lucide-react';
import StarlinkoLogo from '../components/StarlinkoLogo';

const TermsPage: React.FC = () => {
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
              <StarlinkoLogo size="md" showText />
            </div>
          </div>
        </div>
      </header>

      {/* Main content */}
      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="bg-white rounded-xl shadow-sm p-8">
          {/* Page title */}
          <div className="text-center mb-8">
            <div className="w-16 h-16 bg-[#34A853]/10 rounded-full flex items-center justify-center mx-auto mb-4">
              <FileText className="w-8 h-8 text-[#34A853]" />
            </div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">
              Conditions Générales d'Utilisation
            </h1>
            <p className="text-gray-600">Dernière mise à jour : 1er janvier 2024</p>
          </div>

          {/* Content */}
          <div className="prose prose-lg max-w-none">
            <div className="bg-[#34A853]/5 rounded-lg p-6 mb-8">
              <h2 className="text-xl font-semibold text-gray-900 mb-3 flex items-center">
                <CheckCircle className="w-5 h-5 mr-2 text-[#34A853]" />
                Acceptation des conditions
              </h2>
              <p className="text-gray-700">
                En utilisant Starlinko, vous acceptez ces conditions d'utilisation. Si vous n'acceptez
                pas ces termes, veuillez ne pas utiliser notre service.
              </p>
            </div>

            <h2 className="text-2xl font-bold text-gray-900 mb-4">1. Description du service</h2>
            <p className="mb-4">Starlinko est une plateforme SaaS qui permet aux entreprises de :</p>
            <ul className="list-disc pl-6 mb-6 space-y-2">
              <li>Synchroniser automatiquement leurs avis Google My Business</li>
              <li>Générer des réponses personnalisées grâce à l’intelligence artificielle</li>
              <li>Analyser les performances de leur réputation en ligne</li>
              <li>Gérer plusieurs établissements depuis une interface unique</li>
            </ul>

            <h2 className="text-2xl font-bold text-gray-900 mb-4">2. Inscription et compte utilisateur</h2>

            <h3 className="text-xl font-semibold text-gray-800 mb-3">2.1 Conditions d'inscription</h3>
            <ul className="list-disc pl-6 mb-4 space-y-2">
              <li>Vous devez être âgé d'au moins 18 ans ou représenter une entreprise</li>
              <li>Vous devez posséder un compte Google My Business actif</li>
              <li>Les informations fournies doivent être exactes et à jour</li>
              <li>Un seul compte par utilisateur/entreprise est autorisé</li>
            </ul>

            <h3 className="text-xl font-semibold text-gray-800 mb-3">2.2 Responsabilités du compte</h3>
            <ul className="list-disc pl-6 mb-6 space-y-2">
              <li>Vous êtes responsable de la sécurité de votre compte Google</li>
              <li>Vous devez nous notifier immédiatement de tout usage non autorisé</li>
              <li>Vous êtes responsable de toutes les activités sous votre compte</li>
            </ul>

            <h2 className="text-2xl font-bold text-gray-900 mb-4">3. Utilisation acceptable</h2>

            <div className="bg-[#EA4335]/5 rounded-lg p-6 mb-6">
              <h3 className="text-xl font-semibold text-gray-800 mb-3 flex items-center">
                <AlertTriangle className="w-5 h-5 mr-2 text-[#EA4335]" />
                Utilisations interdites
              </h3>
              <ul className="list-disc pl-6 space-y-2">
                <li>Générer de faux avis ou manipuler les évaluations</li>
                <li>Utiliser le service pour du spam ou du harcèlement</li>
                <li>Tenter de contourner les limitations techniques</li>
                <li>Partager votre compte avec des tiers non autorisés</li>
                <li>Utiliser le service à des fins illégales ou frauduleuses</li>
                <li>Pratiquer du reverse engineering ou tenter un accès non autorisé</li>
              </ul>
            </div>

            <h2 className="text-2xl font-bold text-gray-900 mb-4">4. Plans et facturation</h2>

            <h3 className="text-xl font-semibold text-gray-800 mb-3">4.1 Essai gratuit</h3>
            <ul className="list-disc pl-6 mb-4 space-y-2">
              <li>14 jours d'essai gratuit pour tous les nouveaux utilisateurs</li>
              <li>Accès complet aux fonctionnalités pendant l'essai</li>
              <li>Aucune carte de crédit requise pour commencer</li>
              <li>Annulation possible à tout moment pendant l'essai</li>
            </ul>

            <h3 className="text-xl font-semibold text-gray-800 mb-3">4.2 Abonnements payants</h3>
            <div className="bg-[#4285F4]/5 rounded-lg p-6 mb-6">
              <div className="grid md:grid-cols-3 gap-4">
                <div className="text-center">
                  <div className="font-bold text-[#4285F4] text-lg">Starter</div>
                  <div className="text-sm text-gray-600">9,90€/mois</div>
                  <div className="text-xs text-gray-500">1 établissement</div>
                </div>
                <div className="text-center">
                  <div className="font-bold text-[#FBBC05] text-lg">Pro</div>
                  <div className="text-sm text-gray-600">29,90€/mois</div>
                  <div className="text-xs text-gray-500">3 établissements</div>
                </div>
                <div className="text-center">
                  <div className="font-bold text-[#EA4335] text-lg">Business</div>
                  <div className="text-sm text-gray-600">79,90€/mois</div>
                  <div className="text-xs text-gray-500">Illimité</div>
                </div>
              </div>
            </div>

            <h3 className="text-xl font-semibold text-gray-800 mb-3">4.3 Conditions de paiement</h3>
            <ul className="list-disc pl-6 mb-6 space-y-2">
              <li>Facturation mensuelle ou annuelle (20% de réduction sur l'annuel)</li>
              <li>Paiement par carte bancaire via Stripe (sécurisé)</li>
              <li>Renouvellement automatique sauf résiliation</li>
              <li>Remboursement au prorata en cas de résiliation anticipée</li>
              <li>Pay-as-you-go : 0,10€ par réponse IA supplémentaire</li>
            </ul>

            <h2 className="text-2xl font-bold text-gray-900 mb-4">5. Propriété intellectuelle</h2>
            <ul className="list-disc pl-6 mb-6 space-y-2">
              <li>Starlinko et ses fonctionnalités sont protégés par le droit d'auteur</li>
              <li>Vous conservez la propriété de vos données et contenus</li>
              <li>Vous nous accordez une licence d'utilisation pour fournir le service</li>
              <li>Les réponses IA générées vous appartiennent</li>
            </ul>

            <h2 className="text-2xl font-bold text-gray-900 mb-4">6. Limitation de responsabilité</h2>
            <div className="bg-yellow-50 border-l-4 border-yellow-400 rounded-lg p-4 mb-6">
              <p className="text-gray-700">
                <strong>Service fourni "en l'état" :</strong> Starlinko s'efforce de fournir un service
                de qualité, mais ne peut garantir une disponibilité à 100%. Nous ne sommes pas responsables
                des dommages indirects ou de la perte de données dus à des facteurs externes.
              </p>
            </div>

            <h2 className="text-2xl font-bold text-gray-900 mb-4">7. Résiliation</h2>

            <h3 className="text-xl font-semibold text-gray-800 mb-3">7.1 Résiliation par l'utilisateur</h3>
            <ul className="list-disc pl-6 mb-4 space-y-2">
              <li>Vous pouvez résilier votre compte à tout moment depuis les paramètres</li>
              <li>La résiliation prend effet à la fin de la période de facturation en cours</li>
              <li>Vos données seront supprimées 30 jours après la résiliation</li>
            </ul>

            <h3 className="text-xl font-semibold text-gray-800 mb-3">7.2 Résiliation par Starlinko</h3>
            <ul className="list-disc pl-6 mb-6 space-y-2">
              <li>En cas de violation des conditions d'utilisation</li>
              <li>En cas de non-paiement après 30 jours</li>
              <li>Pour des raisons de sécurité ou de conformité légale</li>
              <li>Préavis de 30 jours sauf en cas de violation grave</li>
            </ul>

            <h2 className="text-2xl font-bold text-gray-900 mb-4">8. Modifications des conditions</h2>
            <p className="mb-6">
              Nous nous réservons le droit de modifier ces conditions. Les utilisateurs seront
              notifiés par e-mail 30 jours avant l'entrée en vigueur des modifications importantes.
              L'utilisation continue du service après notification constitue une acceptation des nouvelles conditions.
            </p>

            <h2 className="text-2xl font-bold text-gray-900 mb-4">9. Droit applicable</h2>
            <p className="mb-8">
              Ces conditions sont régies par le droit français. Tout litige sera soumis à la
              compétence exclusive des tribunaux de Paris, France.
            </p>

            {/* Contact */}
            <div className="bg-gradient-to-r from-[#4285F4]/10 to-[#34A853]/10 rounded-lg p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Contact</h3>
              <div className="grid md:grid-cols-2 gap-4">
                <div className="flex items-center">
                  <Mail className="w-5 h-5 text-[#4285F4] mr-3" />
                  <div>
                    <div className="font-medium text-gray-900">Support</div>
                    <div className="text-sm text-gray-600">support@starlinko.com</div>
                  </div>
                </div>
                <div className="flex items-center">
                  <FileText className="w-5 h-5 text-[#34A853] mr-3" />
                  <div>
                    <div className="font-medium text-gray-900">Questions légales</div>
                    <div className="text-sm text-gray-600">legal@starlinko.com</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default TermsPage;
