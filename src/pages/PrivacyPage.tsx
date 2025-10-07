import React from 'react';
import { Shield, ArrowLeft, Eye, Lock, Database, UserCheck, Mail, Phone } from 'lucide-react';
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

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="bg-white rounded-xl shadow-sm p-8">
          {/* Header */}
          <div className="text-center mb-8">
            <div className="w-16 h-16 bg-[#4285F4]/10 rounded-full flex items-center justify-center mx-auto mb-4">
              <Shield className="w-8 h-8 text-[#4285F4]" />
            </div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">
              Politique de Confidentialité
            </h1>
            <p className="text-gray-600">
              Dernière mise à jour : 1er janvier 2024
            </p>
          </div>

          {/* Content */}
          <div className="prose prose-lg max-w-none">
            <div className="bg-[#4285F4]/5 rounded-lg p-6 mb-8">
              <h2 className="text-xl font-semibold text-gray-900 mb-3 flex items-center">
                <Eye className="w-5 h-5 mr-2 text-[#4285F4]" />
                Résumé de notre engagement
              </h2>
              <p className="text-gray-700">
                Chez Starlinko, nous nous engageons à protéger votre vie privée et vos données personnelles. 
                Cette politique explique comment nous collectons, utilisons et protégeons vos informations 
                lorsque vous utilisez notre plateforme de gestion d'avis Google My Business.
              </p>
            </div>

            <h2 className="text-2xl font-bold text-gray-900 mb-4">1. Informations que nous collectons</h2>
            
            <h3 className="text-xl font-semibold text-gray-800 mb-3">1.1 Informations d'identification</h3>
            <ul className="list-disc pl-6 mb-4 space-y-2">
              <li>Nom complet et adresse email (via Google OAuth)</li>
              <li>Photo de profil Google (optionnelle)</li>
              <li>Identifiant unique Google</li>
            </ul>

            <h3 className="text-xl font-semibold text-gray-800 mb-3">1.2 Données Google My Business</h3>
            <ul className="list-disc pl-6 mb-4 space-y-2">
              <li>Informations sur vos établissements (nom, adresse, catégorie)</li>
              <li>Avis clients et leurs métadonnées (auteur, note, commentaire, date)</li>
              <li>Réponses aux avis que vous publiez</li>
              <li>Statistiques de performance de vos établissements</li>
            </ul>

            <h3 className="text-xl font-semibold text-gray-800 mb-3">1.3 Données d'utilisation</h3>
            <ul className="list-disc pl-6 mb-6 space-y-2">
              <li>Logs de connexion et d'activité</li>
              <li>Préférences de configuration IA</li>
              <li>Historique des réponses générées</li>
              <li>Données de facturation et d'abonnement</li>
            </ul>

            <h2 className="text-2xl font-bold text-gray-900 mb-4">2. Comment nous utilisons vos informations</h2>
            
            <div className="bg-[#34A853]/5 rounded-lg p-6 mb-6">
              <h3 className="text-xl font-semibold text-gray-800 mb-3 flex items-center">
                <Database className="w-5 h-5 mr-2 text-[#34A853]" />
                Finalités du traitement
              </h3>
              <ul className="list-disc pl-6 space-y-2">
                <li><strong>Fourniture du service</strong> : Synchronisation et gestion de vos avis Google My Business</li>
                <li><strong>Génération IA</strong> : Création de réponses personnalisées aux avis clients</li>
                <li><strong>Analytics</strong> : Analyse de performance et statistiques de vos établissements</li>
                <li><strong>Support client</strong> : Assistance technique et résolution de problèmes</li>
                <li><strong>Facturation</strong> : Gestion des abonnements et paiements</li>
                <li><strong>Amélioration du service</strong> : Développement de nouvelles fonctionnalités</li>
              </ul>
            </div>

            <h2 className="text-2xl font-bold text-gray-900 mb-4">3. Partage et divulgation des données</h2>
            
            <h3 className="text-xl font-semibold text-gray-800 mb-3">3.1 Partenaires technologiques</h3>
            <ul className="list-disc pl-6 mb-4 space-y-2">
              <li><strong>Google</strong> : Pour l'authentification OAuth et l'accès aux APIs Google My Business</li>
              <li><strong>Supabase</strong> : Pour le stockage sécurisé des données et l'authentification</li>
              <li><strong>Stripe</strong> : Pour le traitement des paiements et la gestion des abonnements</li>
              <li><strong>DeepSeek AI</strong> : Pour la génération de réponses IA (données anonymisées)</li>
            </ul>

            <h3 className="text-xl font-semibold text-gray-800 mb-3">3.2 Nous ne vendons jamais vos données</h3>
            <div className="bg-[#EA4335]/5 border-l-4 border-[#EA4335] rounded-lg p-4 mb-6">
              <p className="text-gray-700">
                <strong>Engagement ferme :</strong> Starlinko ne vend, ne loue et ne partage jamais vos données 
                personnelles ou commerciales à des tiers à des fins marketing ou publicitaires.
              </p>
            </div>

            <h2 className="text-2xl font-bold text-gray-900 mb-4">4. Sécurité des données</h2>
            
            <div className="bg-[#FBBC05]/5 rounded-lg p-6 mb-6">
              <h3 className="text-xl font-semibold text-gray-800 mb-3 flex items-center">
                <Lock className="w-5 h-5 mr-2 text-[#FBBC05]" />
                Mesures de protection
              </h3>
              <ul className="list-disc pl-6 space-y-2">
                <li><strong>Chiffrement</strong> : Toutes les données sont chiffrées en transit (TLS 1.3) et au repos (AES-256)</li>
                <li><strong>Authentification</strong> : OAuth 2.0 sécurisé avec Google, pas de stockage de mots de passe</li>
                <li><strong>Accès limité</strong> : Principe du moindre privilège, accès aux données strictement nécessaire</li>
                <li><strong>Surveillance</strong> : Monitoring 24/7 et alertes de sécurité automatiques</li>
                <li><strong>Sauvegardes</strong> : Sauvegardes automatiques et chiffrées de vos données</li>
                <li><strong>Conformité</strong> : Infrastructure conforme SOC 2 Type II et ISO 27001</li>
              </ul>
            </div>

            <h2 className="text-2xl font-bold text-gray-900 mb-4">5. Vos droits (RGPD)</h2>
            
            <div className="grid md:grid-cols-2 gap-6 mb-6">
              <div className="bg-gray-50 rounded-lg p-4">
                <h4 className="font-semibold text-gray-900 mb-2">Droit d'accès</h4>
                <p className="text-sm text-gray-600">Consultez toutes les données que nous détenons sur vous</p>
              </div>
              <div className="bg-gray-50 rounded-lg p-4">
                <h4 className="font-semibold text-gray-900 mb-2">Droit de rectification</h4>
                <p className="text-sm text-gray-600">Corrigez ou mettez à jour vos informations personnelles</p>
              </div>
              <div className="bg-gray-50 rounded-lg p-4">
                <h4 className="font-semibold text-gray-900 mb-2">Droit à l'effacement</h4>
                <p className="text-sm text-gray-600">Demandez la suppression de vos données personnelles</p>
              </div>
              <div className="bg-gray-50 rounded-lg p-4">
                <h4 className="font-semibold text-gray-900 mb-2">Droit à la portabilité</h4>
                <p className="text-sm text-gray-600">Exportez vos données dans un format structuré</p>
              </div>
            </div>

            <h2 className="text-2xl font-bold text-gray-900 mb-4">6. Cookies et technologies similaires</h2>
            <p className="mb-4">
              Nous utilisons des cookies essentiels pour le fonctionnement de notre service :
            </p>
            <ul className="list-disc pl-6 mb-6 space-y-2">
              <li><strong>Cookies d'authentification</strong> : Pour maintenir votre session connectée</li>
              <li><strong>Cookies de préférences</strong> : Pour sauvegarder vos paramètres IA</li>
              <li><strong>Cookies de sécurité</strong> : Pour protéger contre les attaques CSRF</li>
              <li><strong>Analytics anonymes</strong> : Pour améliorer notre service (données agrégées uniquement)</li>
            </ul>

            <h2 className="text-2xl font-bold text-gray-900 mb-4">7. Conservation des données</h2>
            <ul className="list-disc pl-6 mb-6 space-y-2">
              <li><strong>Données de compte</strong> : Conservées tant que votre compte est actif</li>
              <li><strong>Avis et réponses</strong> : Conservés pendant 3 ans après la fin de votre abonnement</li>
              <li><strong>Logs de sécurité</strong> : Conservés 1 an pour la sécurité et la conformité</li>
              <li><strong>Données de facturation</strong> : Conservées 10 ans pour les obligations légales</li>
            </ul>

            <h2 className="text-2xl font-bold text-gray-900 mb-4">8. Transferts internationaux</h2>
            <p className="mb-6">
              Vos données peuvent être traitées dans l'Union Européenne et aux États-Unis par nos 
              partenaires technologiques (Google, Supabase, Stripe). Tous nos partenaires respectent 
              les standards de protection des données européens et disposent de certifications appropriées.
            </p>

            <h2 className="text-2xl font-bold text-gray-900 mb-4">9. Contact et réclamations</h2>
            <div className="bg-gradient-to-r from-[#4285F4]/10 to-[#34A853]/10 rounded-lg p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Pour exercer vos droits ou poser des questions :</h3>
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
                    <div className="font-medium text-gray-900">Délégué à la protection des données</div>
                    <div className="text-sm text-gray-600">dpo@starlinko.com</div>
                  </div>
                </div>
              </div>
              <div className="mt-4 pt-4 border-t border-gray-200">
                <p className="text-sm text-gray-600">
                  <strong>Droit de réclamation :</strong> Vous avez le droit de déposer une réclamation 
                  auprès de la CNIL (Commission Nationale de l'Informatique et des Libertés) si vous 
                  estimez que vos droits ne sont pas respectés.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PrivacyPage;