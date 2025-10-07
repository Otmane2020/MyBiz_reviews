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
  Building,
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
              Conditions Générales d’Utilisation
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
                En accédant ou en utilisant le service <strong>Starlinko</strong>, développé et
                exploité par la société <strong>SWEET DECO</strong>, vous acceptez sans réserve les
                présentes Conditions Générales d’Utilisation (CGU). Si vous n’acceptez pas ces
                conditions, vous ne devez pas utiliser la plateforme.
              </p>
            </div>

            <h2 className="text-2xl font-bold text-gray-900 mb-4">1. Objet du service</h2>
            <p className="mb-4">
              <strong>Starlinko</strong> est une application SaaS qui permet aux entreprises de
              connecter leurs comptes Google Business Profile afin de :
            </p>
            <ul className="list-disc pl-6 mb-6 space-y-2">
              <li>Synchroniser et gérer automatiquement leurs fiches et avis</li>
              <li>Analyser les performances locales et statistiques</li>
              <li>Générer des réponses et rapports automatisés</li>
              <li>Centraliser la gestion multi-établissements</li>
            </ul>

            <h2 className="text-2xl font-bold text-gray-900 mb-4">2. Création de compte</h2>
            <h3 className="text-xl font-semibold text-gray-800 mb-3">
              2.1 Conditions d’inscription
            </h3>
            <ul className="list-disc pl-6 mb-4 space-y-2">
              <li>L’utilisateur doit être majeur ou représenter une personne morale.</li>
              <li>Un compte Google valide est requis pour l’authentification OAuth.</li>
              <li>Les informations transmises doivent être exactes et à jour.</li>
            </ul>

            <h3 className="text-xl font-semibold text-gray-800 mb-3">
              2.2 Responsabilité de l’utilisateur
            </h3>
            <ul className="list-disc pl-6 mb-6 space-y-2">
              <li>L’utilisateur est responsable de la sécurité de son compte Google.</li>
              <li>
                Toute activité réalisée via le compte est réputée effectuée par l’utilisateur
                concerné.
              </li>
              <li>
                En cas d’usage non autorisé, l’utilisateur doit immédiatement contacter le support.
              </li>
            </ul>

            <h2 className="text-2xl font-bold text-gray-900 mb-4">3. Utilisation acceptable</h2>
            <div className="bg-[#EA4335]/5 rounded-lg p-6 mb-6">
              <h3 className="text-xl font-semibold text-gray-800 mb-3 flex items-center">
                <AlertTriangle className="w-5 h-5 mr-2 text-[#EA4335]" />
                Utilisations interdites
              </h3>
              <ul className="list-disc pl-6 space-y-2">
                <li>Génération de faux avis ou manipulation de notations Google.</li>
                <li>Usage du service à des fins illégales, frauduleuses ou diffamatoires.</li>
                <li>Partage d’accès non autorisé ou revente du service.</li>
                <li>Tentative de contournement des restrictions de sécurité.</li>
              </ul>
            </div>

            <h2 className="text-2xl font-bold text-gray-900 mb-4">4. Abonnement et facturation</h2>
            <ul className="list-disc pl-6 mb-6 space-y-2">
              <li>Le service est proposé sous forme d’abonnement mensuel ou annuel.</li>
              <li>Paiement via <strong>Stripe</strong>, conforme aux normes PCI-DSS.</li>
              <li>Annulation possible à tout moment depuis l’espace utilisateur.</li>
              <li>
                En cas de résiliation, le compte reste actif jusqu’à la fin de la période déjà
                réglée.
              </li>
            </ul>

            <h2 className="text-2xl font-bold text-gray-900 mb-4">
              5. Propriété intellectuelle
            </h2>
            <ul className="list-disc pl-6 mb-6 space-y-2">
              <li>Starlinko et son contenu sont la propriété exclusive de SWEET DECO.</li>
              <li>Les utilisateurs conservent la propriété de leurs données et établissements.</li>
              <li>
                Toute reproduction, copie ou diffusion non autorisée du logiciel est interdite.
              </li>
            </ul>

            <h2 className="text-2xl font-bold text-gray-900 mb-4">
              6. Limitation de responsabilité
            </h2>
            <div className="bg-yellow-50 border-l-4 border-yellow-400 rounded-lg p-4 mb-6">
              <p className="text-gray-700">
                Le service est fourni “tel quel”. SWEET DECO ne saurait être tenue responsable de
                tout dommage indirect, perte de données ou interruption due à des causes externes
                (pannes réseau, API Google, etc.).
              </p>
            </div>

            <h2 className="text-2xl font-bold text-gray-900 mb-4">7. Résiliation</h2>
            <ul className="list-disc pl-6 mb-6 space-y-2">
              <li>
                L’utilisateur peut supprimer son compte à tout moment via l’interface Starlinko.
              </li>
              <li>
                SWEET DECO peut suspendre un compte en cas de fraude, non-paiement ou violation des
                présentes conditions.
              </li>
              <li>
                Les données seront supprimées dans un délai maximum de 30 jours après résiliation.
              </li>
            </ul>

            <h2 className="text-2xl font-bold text-gray-900 mb-4">
              8. Modifications et droit applicable
            </h2>
            <p className="mb-8">
              SWEET DECO se réserve le droit de modifier les présentes CGU à tout moment. Les
              utilisateurs seront informés par e-mail avant leur entrée en vigueur.  
              Le présent contrat est régi par le droit français.  
              En cas de litige, les tribunaux compétents seront ceux du ressort de Paris, France.
            </p>

            {/* Contact */}
            <div className="bg-gradient-to-r from-[#4285F4]/10 to-[#34A853]/10 rounded-lg p-6 mb-6">
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

            {/* Footer / Legal info */}
            <div className="text-sm text-gray-500 border-t pt-6">
              <div className="flex items-center mb-2">
                <Building className="w-4 h-4 text-gray-400 mr-2" />
                <span>
                  Éditeur : <strong>SWEET DECO</strong> – 280 Boulevard de la Boissière, 93100
                  Montreuil, France
                </span>
              </div>
              <p>SIRET : 897 801 775 00015 – contact@starlinko.com</p>
              <p className="mt-2">
                © {new Date().getFullYear()} SWEET DECO / Starlinko – Tous droits réservés.
              </p>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default TermsPage;