import React, { useState, useEffect } from 'react';
import { Bot, MessageSquare, Settings, Save, RefreshCw, Zap, Volume2, Smile, Heart, Coffee, User, FileText, Ligature as Signature, TestTube, Send } from 'lucide-react';
import { useChatGPT } from '../hooks/useChatGPT';

interface AISettingsPageProps {
  user: any;
}

interface AISettings {
  enabled: boolean;
  tone: 'professional' | 'friendly' | 'humorous' | 'warm';
  responseLength: 'S' | 'M' | 'L';
  includeSignature: boolean;
  signature: string;
  customTemplate: string;
  autoReplyDelay: number; // en minutes
  onlyPositiveReviews: boolean;
  minimumRating: number;
}

const AISettingsPage: React.FC<AISettingsPageProps> = ({ user }) => {
  const [settings, setSettings] = useState<AISettings>({
    enabled: true,
    tone: 'friendly',
    responseLength: 'M',
    includeSignature: true,
    signature: 'L\'équipe {business_name}',
    customTemplate: '',
    autoReplyDelay: 5,
    onlyPositiveReviews: false,
    minimumRating: 3
  });

  const [testReview, setTestReview] = useState({
    rating: 5,
    comment: 'Excellent service, très professionnel et accueil chaleureux. Je recommande vivement !',
    author: 'Marie Dubois'
  });

  const [generatedResponse, setGeneratedResponse] = useState('');
  const [isSaving, setIsSaving] = useState(false);
  
  const { generateResponse, loading: isGenerating, error: generationError } = useChatGPT();

  const tones = [
    {
      id: 'professional',
      name: 'Professionnel',
      icon: <User className="w-5 h-5" />,
      description: 'Ton formel et professionnel',
      example: 'Nous vous remercions pour votre retour positif concernant nos services.'
    },
    {
      id: 'friendly',
      name: 'Amical',
      icon: <Smile className="w-5 h-5" />,
      description: 'Ton chaleureux et convivial',
      example: 'Merci beaucoup pour ce super avis ! Ça nous fait vraiment plaisir.'
    },
    {
      id: 'humorous',
      name: 'Humoristique',
      icon: <Coffee className="w-5 h-5" />,
      description: 'Ton léger avec une pointe d\'humour',
      example: 'Wow, 5 étoiles ! On va avoir les chevilles qui gonflent ! 😄 Merci infiniment !'
    },
    {
      id: 'warm',
      name: 'Chaleureux',
      icon: <Heart className="w-5 h-5" />,
      description: 'Ton bienveillant et empathique',
      example: 'Votre message nous touche énormément. Merci de nous faire confiance.'
    }
  ];

  const responseLengths = [
    {
      id: 'S',
      name: 'Court (S)',
      description: '20-40 mots',
      example: 'Merci beaucoup pour cet avis ! 😊'
    },
    {
      id: 'M',
      name: 'Moyen (M)',
      description: '40-80 mots',
      example: 'Merci beaucoup pour ce retour positif ! Nous sommes ravis que notre service vous ait plu. Votre satisfaction est notre priorité.'
    },
    {
      id: 'L',
      name: 'Long (L)',
      description: '80-150 mots',
      example: 'Nous vous remercions chaleureusement pour ce magnifique avis ! Votre retour nous fait énormément plaisir et motive toute notre équipe à continuer de vous offrir le meilleur service possible. N\'hésitez pas à revenir nous voir bientôt !'
    }
  ];

  // Charger les paramètres sauvegardés
  useEffect(() => {
    const savedSettings = localStorage.getItem('aiSettings');
    if (savedSettings) {
      setSettings(JSON.parse(savedSettings));
    }
  }, []);

  const handleSettingChange = (key: keyof AISettings, value: any) => {
    setSettings(prev => ({
      ...prev,
      [key]: value
    }));
  };

  const saveSettings = async () => {
    setIsSaving(true);
    try {
      // Sauvegarder localement
      localStorage.setItem('aiSettings', JSON.stringify(settings));
      
      // TODO: Sauvegarder en base de données via Supabase
      // await supabase.from('ai_settings').upsert({
      //   user_id: user.id,
      //   settings: settings
      // });
      
      setTimeout(() => {
        setIsSaving(false);
      }, 1000);
    } catch (error) {
      console.error('Erreur lors de la sauvegarde:', error);
      setIsSaving(false);
    }
  };

  const generateTestResponse = async () => {
    try {
      const response = await generateResponse(
        {
          author: testReview.author,
          rating: testReview.rating,
          comment: testReview.comment
        },
        settings,
        'Notre Entreprise'
      );
      
      if (response) {
        setGeneratedResponse(response);
      } else {
        setGeneratedResponse('Erreur lors de la génération de la réponse.');
      }
    } catch (error) {
      console.error('Erreur génération:', error);
      setGeneratedResponse('Erreur lors de la génération de la réponse.');
    }
  };

  return (
    <div className="min-h-screen bg-[#F1F3F4] pt-20">
      <div className="max-w-4xl mx-auto p-4">
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-gray-900 mb-2 flex items-center">
            <Bot className="w-8 h-8 text-[#4285F4] mr-3" />
            Intelligence Artificielle (DeepSeek)
          </h1>
          <p className="text-gray-600">
            Configurez les réponses automatiques avec DeepSeek AI pour vos avis Google My Business
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Paramètres principaux */}
          <div className="lg:col-span-2 space-y-6">
            {/* Activation/Désactivation */}
            <div className="bg-white rounded-xl shadow-sm p-6">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 flex items-center">
                    <Zap className="w-5 h-5 text-[#FBBC05] mr-2" />
                    Réponses automatiques DeepSeek
                  </h3>
                  <p className="text-sm text-gray-600">
                    Activer ou désactiver les réponses automatiques avec DeepSeek AI
                  </p>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    className="sr-only peer"
                    checked={settings.enabled}
                    onChange={(e) => handleSettingChange('enabled', e.target.checked)}
                  />
                  <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-[#4285F4]/20 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#4285F4]"></div>
                </label>
              </div>

              {settings.enabled && (
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Délai avant réponse automatique
                    </label>
                    <select
                      value={settings.autoReplyDelay}
                      onChange={(e) => handleSettingChange('autoReplyDelay', parseInt(e.target.value))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#4285F4] focus:border-transparent"
                    >
                      <option value={0}>Immédiat</option>
                      <option value={5}>5 minutes</option>
                      <option value={15}>15 minutes</option>
                      <option value={30}>30 minutes</option>
                      <option value={60}>1 heure</option>
                      <option value={120}>2 heures</option>
                    </select>
                  </div>

                  <div className="flex items-center space-x-4">
                    <label className="flex items-center">
                      <input
                        type="checkbox"
                        checked={settings.onlyPositiveReviews}
                        onChange={(e) => handleSettingChange('onlyPositiveReviews', e.target.checked)}
                        className="mr-2 h-4 w-4 text-[#4285F4] focus:ring-[#4285F4] border-gray-300 rounded"
                      />
                      <span className="text-sm text-gray-700">Seulement les avis positifs</span>
                    </label>

                    {settings.onlyPositiveReviews && (
                      <div className="flex items-center">
                        <span className="text-sm text-gray-600 mr-2">Note minimum:</span>
                        <select
                          value={settings.minimumRating}
                          onChange={(e) => handleSettingChange('minimumRating', parseInt(e.target.value))}
                          className="px-2 py-1 border border-gray-300 rounded text-sm focus:outline-none focus:ring-2 focus:ring-[#4285F4]"
                        >
                          <option value={3}>3 étoiles</option>
                          <option value={4}>4 étoiles</option>
                          <option value={5}>5 étoiles</option>
                        </select>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>

            {/* Ton de réponse */}
            <div className="bg-white rounded-xl shadow-sm p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                <Volume2 className="w-5 h-5 text-[#34A853] mr-2" />
                Ton de réponse
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {tones.map((tone) => (
                  <div
                    key={tone.id}
                    className={`p-4 border-2 rounded-lg cursor-pointer transition-all ${
                      settings.tone === tone.id
                        ? 'border-[#4285F4] bg-[#4285F4]/5'
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                    onClick={() => handleSettingChange('tone', tone.id)}
                  >
                    <div className="flex items-center mb-2">
                      <div className={`p-2 rounded-lg mr-3 ${
                        settings.tone === tone.id ? 'bg-[#4285F4] text-white' : 'bg-gray-100 text-gray-600'
                      }`}>
                        {tone.icon}
                      </div>
                      <div>
                        <h4 className="font-medium text-gray-900">{tone.name}</h4>
                        <p className="text-xs text-gray-500">{tone.description}</p>
                      </div>
                    </div>
                    <p className="text-sm text-gray-600 italic">"{tone.example}"</p>
                  </div>
                ))}
              </div>
            </div>

            {/* Longueur de réponse */}
            <div className="bg-white rounded-xl shadow-sm p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                <FileText className="w-5 h-5 text-[#FBBC05] mr-2" />
                Longueur de réponse
              </h3>
              <div className="space-y-3">
                {responseLengths.map((length) => (
                  <div
                    key={length.id}
                    className={`p-4 border-2 rounded-lg cursor-pointer transition-all ${
                      settings.responseLength === length.id
                        ? 'border-[#4285F4] bg-[#4285F4]/5'
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                    onClick={() => handleSettingChange('responseLength', length.id)}
                  >
                    <div className="flex items-center justify-between mb-2">
                      <h4 className="font-medium text-gray-900">{length.name}</h4>
                      <span className="text-sm text-gray-500">{length.description}</span>
                    </div>
                    <p className="text-sm text-gray-600 italic">"{length.example}"</p>
                  </div>
                ))}
              </div>
            </div>

            {/* Signature */}
            <div className="bg-white rounded-xl shadow-sm p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                <Signature className="w-5 h-5 text-[#EA4335] mr-2" />
                Signature
              </h3>
              <div className="space-y-4">
                <label className="flex items-center">
                  <input
                    type="checkbox"
                    checked={settings.includeSignature}
                    onChange={(e) => handleSettingChange('includeSignature', e.target.checked)}
                    className="mr-3 h-4 w-4 text-[#4285F4] focus:ring-[#4285F4] border-gray-300 rounded"
                  />
                  <span className="text-sm font-medium text-gray-700">Inclure une signature</span>
                </label>

                {settings.includeSignature && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Texte de signature
                    </label>
                    <input
                      type="text"
                      value={settings.signature}
                      onChange={(e) => handleSettingChange('signature', e.target.value)}
                      placeholder="L'équipe {business_name}"
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#4285F4] focus:border-transparent"
                    />
                    <p className="text-xs text-gray-500 mt-1">
                      Utilisez {'{business_name}'} pour insérer automatiquement le nom de votre entreprise
                    </p>
                  </div>
                )}
              </div>
            </div>

            {/* Template personnalisé */}
            <div className="bg-white rounded-xl shadow-sm p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                <Settings className="w-5 h-5 text-gray-600 mr-2" />
                Template personnalisé (optionnel)
              </h3>
              <textarea
                value={settings.customTemplate}
                onChange={(e) => handleSettingChange('customTemplate', e.target.value)}
                placeholder="Exemple: Bonjour {customer_name}, merci pour votre avis {rating} étoiles concernant {comment}..."
                rows={4}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#4285F4] focus:border-transparent"
              />
              <p className="text-xs text-gray-500 mt-2">
                Variables disponibles: {'{customer_name}'}, {'{rating}'}, {'{comment}'}, {'{business_name}'}
              </p>
            </div>
          </div>

          {/* Aperçu et test */}
          <div className="space-y-6">
            {/* Test de réponse */}
            <div className="bg-white rounded-xl shadow-sm p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                <TestTube className="w-5 h-5 text-[#4285F4] mr-2" />
                Test de réponse
              </h3>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Avis de test
                  </label>
                  <div className="space-y-2">
                    <div className="flex items-center">
                      <span className="text-sm text-gray-600 mr-2">Note:</span>
                      <select
                        value={testReview.rating}
                        onChange={(e) => setTestReview(prev => ({...prev, rating: parseInt(e.target.value)}))}
                        className="px-2 py-1 border border-gray-300 rounded text-sm"
                      >
                        {[1,2,3,4,5].map(rating => (
                          <option key={rating} value={rating}>{rating} étoile{rating > 1 ? 's' : ''}</option>
                        ))}
                      </select>
                    </div>
                    <input
                      type="text"
                      value={testReview.author}
                      onChange={(e) => setTestReview(prev => ({...prev, author: e.target.value}))}
                      placeholder="Nom du client"
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#4285F4]"
                    />
                    <textarea
                      value={testReview.comment}
                      onChange={(e) => setTestReview(prev => ({...prev, comment: e.target.value}))}
                      placeholder="Commentaire de l'avis..."
                      rows={3}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#4285F4]"
                    />
                  </div>
                </div>

                <button
                  onClick={generateTestResponse}
                  disabled={isGenerating || !settings.enabled}
                  className="w-full flex items-center justify-center px-4 py-2 bg-[#4285F4] text-white rounded-lg hover:bg-[#3367D6] disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  {isGenerating ? (
                    <>
                      <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                      Génération...
                    </>
                  ) : (
                    <>
                      <Send className="w-4 h-4 mr-2" />
                      Générer une réponse
                    </>
                  )}
                </button>

                {generatedResponse && (
                  <div className="mt-4 p-4 bg-gray-50 rounded-lg">
                    <h4 className="text-sm font-medium text-gray-900 mb-2">Réponse générée:</h4>
                    <p className="text-sm text-gray-700 whitespace-pre-line">{generatedResponse}</p>
                  </div>
                )}
              </div>
            </div>

            {/* Statistiques */}
            <div className="bg-white rounded-xl shadow-sm p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Statistiques DeepSeek</h3>
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">Réponses ce mois</span>
                  <span className="text-sm font-medium text-gray-900">47</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">Taux de satisfaction</span>
                  <span className="text-sm font-medium text-[#34A853]">94%</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">Temps de réponse moyen</span>
                  <span className="text-sm font-medium text-gray-900">2 min</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Bouton de sauvegarde */}
        <div className="mt-8 flex justify-center">
          <button
            onClick={saveSettings}
            disabled={isSaving}
            className="flex items-center px-8 py-3 bg-[#34A853] text-white rounded-lg hover:bg-[#2D8A47] disabled:opacity-50 disabled:cursor-not-allowed transition-colors font-medium"
          >
            {isSaving ? (
              <>
                <RefreshCw className="w-5 h-5 mr-2 animate-spin" />
                Sauvegarde...
              </>
            ) : (
              <>
                <Save className="w-5 h-5 mr-2" />
                Sauvegarder les paramètres
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

export default AISettingsPage;