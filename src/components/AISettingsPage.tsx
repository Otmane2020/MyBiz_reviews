import React, { useState, useEffect } from 'react';
import { Bot, Settings, Save, RefreshCw, Zap, Volume2, FileText, Ligature as Signature, TestTube, Send } from 'lucide-react';
import { supabase } from '../lib/supabase';

interface AISettingsPageProps {
  user: any;
}

interface AISettings {
  enabled: boolean;
  tone: string;
  style: string;
  responseLength: 'S' | 'M' | 'L';
  includeSignature: boolean;
  signature: string;
  customTemplate: string;
  autoReplyDelay: number;
  onlyPositiveReviews: boolean;
  minimumRating: number;
}

const AISettingsPage: React.FC<AISettingsPageProps> = ({ user }) => {
  const [settings, setSettings] = useState<AISettings>({
    enabled: true,
    tone: 'amical et professionnel',
    style: 'chaleureux et naturel',
    responseLength: 'M',
    includeSignature: true,
    signature: '— L\'équipe Starlinko',
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
  const [isGenerating, setIsGenerating] = useState(false);

  const tones = [
    'amical et professionnel',
    'formel et poli',
    'chaleureux et empathique',
    'minimaliste et neutre',
    'énergique et positif'
  ];

  const styles = [
    'chaleureux et naturel',
    'direct et efficace',
    'élégant et raffiné',
    'décontracté et moderne',
    'traditionnel et respectueux'
  ];

  const responseLengths = [
    { id: 'S', name: 'Court (20-40 mots)', description: '1-2 phrases courtes' },
    { id: 'M', name: 'Moyen (40-80 mots)', description: '2-4 phrases' },
    { id: 'L', name: 'Long (80-150 mots)', description: '4-6 phrases détaillées' }
  ];

  useEffect(() => {
    const loadSettings = async () => {
      if (!user?.id) return;

      const { data, error } = await supabase
        .from('ai_settings')
        .select('*')
        .eq('user_id', user.id)
        .maybeSingle();

      if (error) {
        console.error('Erreur lors du chargement des paramètres:', error);
        return;
      }

      if (data) {
        setSettings({
          enabled: data.enabled ?? true,
          tone: data.tone || 'amical et professionnel',
          style: data.style || 'chaleureux et naturel',
          responseLength: data.response_length || 'M',
          includeSignature: data.include_signature ?? true,
          signature: data.signature || '— L\'équipe Starlinko',
          customTemplate: data.custom_template || '',
          autoReplyDelay: data.auto_reply_delay || 5,
          onlyPositiveReviews: data.only_positive_reviews ?? false,
          minimumRating: data.minimum_rating || 3
        });
      }
    };

    loadSettings();
  }, [user?.id]);

  const handleSettingChange = (key: keyof AISettings, value: any) => {
    setSettings(prev => ({
      ...prev,
      [key]: value
    }));
  };

  const saveSettings = async () => {
    setIsSaving(true);
    try {
      if (!user?.id) {
        console.error('Utilisateur non connecté');
        alert('Erreur: Utilisateur non connecté');
        setIsSaving(false);
        return;
      }

      const { error } = await supabase
        .from('ai_settings')
        .upsert({
          user_id: user.id,
          enabled: settings.enabled,
          tone: settings.tone,
          style: settings.style,
          response_length: settings.responseLength,
          include_signature: settings.includeSignature,
          signature: settings.signature,
          custom_template: settings.customTemplate,
          auto_reply_delay: settings.autoReplyDelay,
          only_positive_reviews: settings.onlyPositiveReviews,
          minimum_rating: settings.minimumRating,
          updated_at: new Date().toISOString()
        }, {
          onConflict: 'user_id'
        });

      if (error) {
        console.error('Erreur lors de la sauvegarde:', error);
        alert('Erreur lors de la sauvegarde des paramètres');
      } else {
        alert('Préférences IA sauvegardées ✅');
      }

      setIsSaving(false);
    } catch (error) {
      console.error('Erreur lors de la sauvegarde:', error);
      alert('Erreur lors de la sauvegarde des paramètres');
      setIsSaving(false);
    }
  };

  const generateTestResponse = async () => {
    setIsGenerating(true);
    try {
      const webhookUrl = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/zapier-webhook`;

      const response = await fetch(webhookUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          review_text: testReview.comment,
          rating: testReview.rating,
          author: testReview.author,
          business_name: 'Notre Entreprise',
          user_id: user?.id,
          tone: settings.tone,
          style: settings.style,
          signature: settings.signature,
          response_length: settings.responseLength
        })
      });

      const data = await response.json();

      if (data.success && data.reply) {
        setGeneratedResponse(data.reply);
      } else {
        setGeneratedResponse('Erreur: ' + (data.error || 'Impossible de générer une réponse'));
      }
    } catch (error) {
      console.error('Erreur génération:', error);
      setGeneratedResponse('Erreur lors de la génération de la réponse.');
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 pt-20">
      <div className="max-w-5xl mx-auto p-6">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2 flex items-center">
            <Bot className="w-8 h-8 text-blue-500 mr-3" />
            Paramètres d'assistant IA
          </h1>
          <p className="text-gray-600">
            Configurez les réponses automatiques avec DeepSeek AI pour vos avis Google My Business
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-6">
            <div className="bg-white rounded-2xl shadow-sm p-6 border border-gray-100">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 flex items-center">
                    <Zap className="w-5 h-5 text-yellow-500 mr-2" />
                    Réponses automatiques DeepSeek
                  </h3>
                  <p className="text-sm text-gray-600">
                    Activer ou désactiver les réponses automatiques
                  </p>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    className="sr-only peer"
                    checked={settings.enabled}
                    onChange={(e) => handleSettingChange('enabled', e.target.checked)}
                  />
                  <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-500"></div>
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
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
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
                        className="mr-2 h-4 w-4 text-blue-500 focus:ring-blue-500 border-gray-300 rounded"
                      />
                      <span className="text-sm text-gray-700">Seulement les avis positifs</span>
                    </label>

                    {settings.onlyPositiveReviews && (
                      <div className="flex items-center">
                        <span className="text-sm text-gray-600 mr-2">Note minimum:</span>
                        <select
                          value={settings.minimumRating}
                          onChange={(e) => handleSettingChange('minimumRating', parseInt(e.target.value))}
                          className="px-2 py-1 border border-gray-300 rounded text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
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

            <div className="bg-white rounded-2xl shadow-sm p-6 border border-gray-100">
              <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                <Volume2 className="w-5 h-5 text-green-500 mr-2" />
                Ton de réponse
              </h3>
              <select
                value={settings.tone}
                onChange={(e) => handleSettingChange('tone', e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900"
              >
                {tones.map((t) => (
                  <option key={t} value={t}>
                    {t}
                  </option>
                ))}
              </select>
              <p className="text-sm text-gray-500 mt-2">
                Choisissez le ton général de vos réponses automatiques
              </p>
            </div>

            <div className="bg-white rounded-2xl shadow-sm p-6 border border-gray-100">
              <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                <Settings className="w-5 h-5 text-purple-500 mr-2" />
                Style de réponse
              </h3>
              <select
                value={settings.style}
                onChange={(e) => handleSettingChange('style', e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900"
              >
                {styles.map((s) => (
                  <option key={s} value={s}>
                    {s}
                  </option>
                ))}
              </select>
              <p className="text-sm text-gray-500 mt-2">
                Définissez le style d'écriture de vos réponses
              </p>
            </div>

            <div className="bg-white rounded-2xl shadow-sm p-6 border border-gray-100">
              <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                <FileText className="w-5 h-5 text-orange-500 mr-2" />
                Longueur de réponse
              </h3>
              <div className="space-y-3">
                {responseLengths.map((length) => (
                  <div
                    key={length.id}
                    className={`p-4 border-2 rounded-lg cursor-pointer transition-all ${
                      settings.responseLength === length.id
                        ? 'border-blue-500 bg-blue-50'
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                    onClick={() => handleSettingChange('responseLength', length.id)}
                  >
                    <div className="flex items-center justify-between">
                      <h4 className="font-medium text-gray-900">{length.name}</h4>
                      <span className="text-sm text-gray-500">{length.description}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="bg-white rounded-2xl shadow-sm p-6 border border-gray-100">
              <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                <Signature className="w-5 h-5 text-red-500 mr-2" />
                Signature
              </h3>
              <div className="space-y-4">
                <label className="flex items-center">
                  <input
                    type="checkbox"
                    checked={settings.includeSignature}
                    onChange={(e) => handleSettingChange('includeSignature', e.target.checked)}
                    className="mr-3 h-4 w-4 text-blue-500 focus:ring-blue-500 border-gray-300 rounded"
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
                      placeholder="— L'équipe Starlinko"
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                    <p className="text-xs text-gray-500 mt-1">
                      Cette signature sera ajoutée à la fin de chaque réponse
                    </p>
                  </div>
                )}
              </div>
            </div>
          </div>

          <div className="space-y-6">
            <div className="bg-white rounded-2xl shadow-sm p-6 border border-gray-100">
              <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                <TestTube className="w-5 h-5 text-blue-500 mr-2" />
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
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                    <textarea
                      value={testReview.comment}
                      onChange={(e) => setTestReview(prev => ({...prev, comment: e.target.value}))}
                      placeholder="Commentaire de l'avis..."
                      rows={3}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                </div>

                <button
                  onClick={generateTestResponse}
                  disabled={isGenerating || !settings.enabled}
                  className="w-full flex items-center justify-center px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
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
                  <div className="mt-4 p-4 bg-blue-50 rounded-lg border border-blue-100">
                    <h4 className="text-sm font-medium text-gray-900 mb-2">Réponse générée:</h4>
                    <p className="text-sm text-gray-700 whitespace-pre-line">{generatedResponse}</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        <div className="mt-8 flex justify-center">
          <button
            onClick={saveSettings}
            disabled={isSaving}
            className="flex items-center px-8 py-3 bg-green-500 text-white rounded-lg hover:bg-green-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors font-medium shadow-lg"
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
