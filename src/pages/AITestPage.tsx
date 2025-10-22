import React, { useState, useEffect } from 'react';
import { Bot, Send, RefreshCw, Star, User, MessageSquare, Sparkles } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { mapSettingsToDeepSeekPayload, callZapierWebhook, loadAISettings, AISettings } from '../lib/aiHelper';

const AITestPage: React.FC = () => {
  const [user, setUser] = useState<any>(null);
  const [settings, setSettings] = useState<AISettings | null>(null);
  const [testReview, setTestReview] = useState({
    rating: 5,
    comment: 'Excellent service, très professionnel et accueil chaleureux. Je recommande vivement !',
    author: 'Marie Dubois'
  });
  const [generatedResponse, setGeneratedResponse] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => {
      setUser(data.user);
      if (data.user?.id) {
        loadAISettings(data.user.id, supabase).then(setSettings);
      }
    });
  }, []);

  const handleGenerate = async () => {
    if (!user?.id || !settings) {
      setError('Utilisateur non connecté ou paramètres non chargés');
      return;
    }

    setIsGenerating(true);
    setError('');
    setGeneratedResponse('');

    try {
      const payload = mapSettingsToDeepSeekPayload(
        testReview.comment,
        testReview.rating,
        testReview.author,
        'Starlinko',
        settings
      );

      const reply = await callZapierWebhook(payload);
      setGeneratedResponse(reply);
    } catch (err: any) {
      setError(err.message || 'Erreur lors de la génération');
      console.error('Erreur:', err);
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 pt-20">
      <div className="max-w-4xl mx-auto p-6">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-r from-blue-500 to-purple-500 rounded-2xl mb-4">
            <Bot className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Test DeepSeek AI
          </h1>
          <p className="text-gray-600">
            Testez vos paramètres IA en temps réel
          </p>
        </div>

        {!user && (
          <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-4 mb-6">
            <p className="text-yellow-800 text-sm">
              Vous devez être connecté pour utiliser cette page.
            </p>
          </div>
        )}

        {user && !settings && (
          <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 mb-6">
            <p className="text-blue-800 text-sm">
              Configurez d'abord vos paramètres IA dans les paramètres.
            </p>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Input */}
          <div className="bg-white rounded-2xl shadow-lg p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4 flex items-center">
              <MessageSquare className="w-5 h-5 text-blue-500 mr-2" />
              Avis de test
            </h2>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Auteur
                </label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <input
                    type="text"
                    value={testReview.author}
                    onChange={(e) => setTestReview(prev => ({ ...prev, author: e.target.value }))}
                    placeholder="Nom du client"
                    className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Note
                </label>
                <div className="flex space-x-2">
                  {[1, 2, 3, 4, 5].map((rating) => (
                    <button
                      key={rating}
                      onClick={() => setTestReview(prev => ({ ...prev, rating }))}
                      className={`p-2 rounded-lg transition-all ${
                        testReview.rating >= rating
                          ? 'bg-yellow-400 text-white'
                          : 'bg-gray-100 text-gray-400 hover:bg-gray-200'
                      }`}
                    >
                      <Star className={`w-6 h-6 ${testReview.rating >= rating ? 'fill-current' : ''}`} />
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Commentaire
                </label>
                <textarea
                  value={testReview.comment}
                  onChange={(e) => setTestReview(prev => ({ ...prev, comment: e.target.value }))}
                  placeholder="Commentaire de l'avis..."
                  rows={5}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <button
                onClick={handleGenerate}
                disabled={isGenerating || !user || !settings}
                className="w-full flex items-center justify-center px-6 py-3 bg-gradient-to-r from-blue-500 to-purple-500 text-white rounded-lg hover:from-blue-600 hover:to-purple-600 disabled:opacity-50 disabled:cursor-not-allowed transition-all font-medium"
              >
                {isGenerating ? (
                  <>
                    <RefreshCw className="w-5 h-5 mr-2 animate-spin" />
                    Génération en cours...
                  </>
                ) : (
                  <>
                    <Sparkles className="w-5 h-5 mr-2" />
                    Générer une réponse IA
                  </>
                )}
              </button>
            </div>
          </div>

          {/* Output */}
          <div className="bg-white rounded-2xl shadow-lg p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4 flex items-center">
              <Send className="w-5 h-5 text-purple-500 mr-2" />
              Réponse générée
            </h2>

            {error && (
              <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-4">
                <p className="text-red-800 text-sm">{error}</p>
              </div>
            )}

            {!generatedResponse && !error && (
              <div className="flex flex-col items-center justify-center h-64 text-gray-400">
                <Bot className="w-16 h-16 mb-4 opacity-20" />
                <p className="text-sm">La réponse IA apparaîtra ici</p>
              </div>
            )}

            {generatedResponse && (
              <div className="bg-gradient-to-br from-blue-50 to-purple-50 rounded-xl p-6 border border-blue-100">
                <div className="flex items-start">
                  <div className="flex-shrink-0 w-10 h-10 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full flex items-center justify-center mr-3">
                    <Bot className="w-6 h-6 text-white" />
                  </div>
                  <div className="flex-1">
                    <p className="text-gray-800 leading-relaxed whitespace-pre-line">
                      {generatedResponse}
                    </p>
                  </div>
                </div>
              </div>
            )}

            {settings && (
              <div className="mt-6 pt-6 border-t border-gray-200">
                <h3 className="text-sm font-medium text-gray-700 mb-3">Paramètres actuels</h3>
                <div className="space-y-2 text-sm text-gray-600">
                  <div className="flex justify-between">
                    <span>Ton:</span>
                    <span className="font-medium text-gray-900">{settings.tone}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Longueur:</span>
                    <span className="font-medium text-gray-900">{settings.responseLength}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Signature:</span>
                    <span className="font-medium text-gray-900">
                      {settings.includeSignature ? 'Oui' : 'Non'}
                    </span>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AITestPage;
