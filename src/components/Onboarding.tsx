import React, { useState, useEffect } from 'react';
import { 
  ChevronRight, 
  ChevronLeft, 
  Star, 
  MessageSquare, 
  Smartphone, 
  Check,
  Zap,
  TrendingUp,
  Shield,
  Users,
  BarChart3,
  Sparkles
} from 'lucide-react';

interface OnboardingProps {
  onComplete: () => void;
  onSkip?: () => void;
  showProgress?: boolean;
  autoAdvance?: boolean;
}

const Onboarding: React.FC<OnboardingProps> = ({ 
  onComplete, 
  onSkip,
  showProgress = true,
  autoAdvance = false
}) => {
  const [currentStep, setCurrentStep] = useState(0);
  const [isAnimating, setIsAnimating] = useState(false);

  const steps = [
    {
      icon: <Sparkles className="w-20 h-20 text-yellow-500" />,
      title: "Bienvenue sur Starlinko",
      description: "La plateforme intelligente qui révolutionne la gestion de vos avis Google. Augmentez votre visibilité et fidélisez vos clients automatiquement.",
      color: "from-blue-600 to-purple-600",
      features: ["14 jours d'essai gratuit", "Réponses IA personnalisées", "Setup en 2 minutes"],
      illustration: "🌟"
    },
    {
      icon: <BarChart3 className="w-20 h-20 text-blue-500" />,
      title: "Analyse en temps réel",
      description: "Surveillez votre réputation avec des tableaux de bord intuitifs et des alertes instantanées sur les nouveaux avis.",
      color: "from-green-500 to-blue-500",
      features: ["Tableaux de bord temps réel", "Alertes notifications", "Analyses détaillées"],
      illustration: "📊"
    },
    {
      icon: <MessageSquare className="w-20 h-20 text-green-500" />,
      title: "Réponses IA intelligentes",
      description: "Notre IA génère des réponses personnalisées et authentiques pour chaque avis, tout en préservant l'humain derrière l'écran.",
      color: "from-purple-500 to-pink-500",
      features: ["GPT-4 optimisé", "Ton personnalisable", "Réponses contextuelles"],
      illustration: "🤖"
    },
    {
      icon: <TrendingUp className="w-20 h-20 text-orange-500" />,
      title: "Boostez votre visibilité",
      description: "Améliorez votre score Google et apparaissez plus souvent en tête des résultats de recherche grâce à une gestion proactive.",
      color: "from-orange-500 to-red-500",
      features: ["Score Google amélioré", "Plus de visibilité", "Clients fidélisés"],
      illustration: "🚀"
    },
    {
      icon: <Check className="w-20 h-20 text-emerald-500" />,
      title: "Tout est configuré !",
      description: "Votre compte est prêt. Commencez dès maintenant à transformer vos avis en opportunités de croissance.",
      color: "from-emerald-500 to-cyan-500",
      features: ["Configuration terminée", "Essai gratuit activé", "Support 7j/7"],
      illustration: "🎉"
    }
  ];

  // Auto-advance feature
  useEffect(() => {
    if (!autoAdvance) return;

    const timer = setInterval(() => {
      if (currentStep < steps.length - 1) {
        handleStepChange(currentStep + 1);
      }
    }, 4000);

    return () => clearInterval(timer);
  }, [currentStep, autoAdvance]);

  const handleStepChange = (newStep: number) => {
    setIsAnimating(true);
    setTimeout(() => {
      setCurrentStep(newStep);
      setIsAnimating(false);
    }, 300);
  };

  const nextStep = () => {
    if (currentStep < steps.length - 1) {
      handleStepChange(currentStep + 1);
    } else {
      onComplete();
    }
  };

  const prevStep = () => {
    if (currentStep > 0) {
      handleStepChange(currentStep - 1);
    }
  };

  const goToStep = (step: number) => {
    handleStepChange(step);
  };

  const getProgressPercentage = () => {
    return ((currentStep + 1) / steps.length) * 100;
  };

  return (
    <div className={`min-h-screen bg-gradient-to-br ${steps[currentStep].color} flex items-center justify-center p-4 transition-all duration-500`}>
      <div className="max-w-2xl w-full mx-auto">
        {/* Progress Bar */}
        {showProgress && (
          <div className="mb-8">
            <div className="flex justify-between items-center mb-2 px-2">
              <span className="text-white/80 text-sm font-medium">
                Étape {currentStep + 1} sur {steps.length}
              </span>
              <span className="text-white/80 text-sm">
                {Math.round(getProgressPercentage())}%
              </span>
            </div>
            <div className="bg-white/20 rounded-full h-2 overflow-hidden">
              <div 
                className="bg-white h-full rounded-full transition-all duration-500 ease-out"
                style={{ width: `${getProgressPercentage()}%` }}
              />
            </div>
          </div>
        )}

        {/* Progress indicators */}
        <div className="flex justify-center mb-8">
          <div className="flex space-x-3 bg-white/20 backdrop-blur-sm rounded-full px-4 py-2">
            {steps.map((_, index) => (
              <button
                key={index}
                onClick={() => goToStep(index)}
                className={`w-3 h-3 rounded-full transition-all duration-300 transform ${
                  index === currentStep 
                    ? 'bg-white scale-125 shadow-lg' 
                    : index < currentStep 
                      ? 'bg-white/80 scale-110' 
                      : 'bg-white/30 hover:bg-white/50'
                }`}
                aria-label={`Aller à l'étape ${index + 1}`}
              />
            ))}
          </div>
        </div>

        {/* Content Card */}
        <div className={`bg-white rounded-3xl p-8 text-center shadow-2xl transform transition-all duration-500 ${
          isAnimating ? 'opacity-0 scale-95' : 'opacity-100 scale-100'
        }`}>
          {/* Illustration */}
          <div className="text-6xl mb-2 animate-bounce">
            {steps[currentStep].illustration}
          </div>

          {/* Icon */}
          <div className="flex justify-center mb-6">
            <div className="relative">
              {steps[currentStep].icon}
              <div className="absolute -inset-4 bg-current rounded-full opacity-10 animate-pulse" />
            </div>
          </div>
          
          {/* Title */}
          <h2 className="text-3xl font-bold text-gray-900 mb-4 animate-in fade-in duration-500">
            {steps[currentStep].title}
          </h2>
          
          {/* Description */}
          <p className="text-gray-600 mb-8 leading-relaxed text-lg animate-in slide-in-from-bottom-4 duration-500">
            {steps[currentStep].description}
          </p>

          {/* Features */}
          {steps[currentStep].features && (
            <div className="mb-8 animate-in fade-in duration-500 delay-200">
              <div className="flex flex-wrap justify-center gap-3">
                {steps[currentStep].features.map((feature, index) => (
                  <div
                    key={index}
                    className="flex items-center bg-gradient-to-r from-blue-50 to-purple-50 px-4 py-2 rounded-full border border-blue-100"
                  >
                    <Check className="w-4 h-4 text-green-500 mr-2 flex-shrink-0" />
                    <span className="text-sm font-medium text-gray-700 whitespace-nowrap">
                      {feature}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Navigation */}
          <div className="flex justify-between items-center pt-6 border-t border-gray-200">
            <button
              onClick={prevStep}
              disabled={currentStep === 0}
              className={`flex items-center px-6 py-3 rounded-xl transition-all duration-300 ${
                currentStep === 0
                  ? 'text-gray-400 cursor-not-allowed opacity-50'
                  : 'text-gray-600 hover:bg-gray-100 hover:scale-105 active:scale-95'
              }`}
              aria-label="Étape précédente"
            >
              <ChevronLeft className="w-5 h-5 mr-2" />
              Précédent
            </button>

            {/* Step indicator for mobile */}
            <div className="sm:hidden text-sm text-gray-500 font-medium">
              {currentStep + 1}/{steps.length}
            </div>

            <button
              onClick={nextStep}
              className="group flex items-center px-8 py-4 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-xl hover:from-blue-700 hover:to-purple-700 transition-all duration-300 transform hover:scale-105 active:scale-95 shadow-lg hover:shadow-xl"
            >
              <span className="font-semibold">
                {currentStep === steps.length - 1 ? (
                  <>
                    Commencer l'aventure
                    <Sparkles className="w-4 h-4 inline ml-2" />
                  </>
                ) : (
                  'Continuer'
                )}
              </span>
              <ChevronRight className="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform" />
            </button>
          </div>

          {/* Quick navigation dots */}
          <div className="flex justify-center mt-6 space-x-2">
            {steps.map((_, index) => (
              <button
                key={index}
                onClick={() => goToStep(index)}
                className={`w-2 h-2 rounded-full transition-all ${
                  index === currentStep 
                    ? 'bg-blue-600 scale-125' 
                    : 'bg-gray-300 hover:bg-gray-400'
                }`}
                aria-label={`Aller à l'étape ${index + 1}`}
              />
            ))}
          </div>
        </div>

        {/* Skip option */}
        {(currentStep < steps.length - 1 && onSkip) && (
          <div className="text-center mt-6 animate-in fade-in duration-500">
            <button
              onClick={onSkip}
              className="text-white/80 hover:text-white transition-colors text-sm underline font-medium hover:scale-105 transform duration-200"
            >
              Passer et commencer
            </button>
          </div>
        )}

        {/* Security badge */}
        <div className="text-center mt-6">
          <div className="inline-flex items-center bg-white/20 backdrop-blur-sm rounded-full px-4 py-2">
            <Shield className="w-4 h-4 text-white mr-2" />
            <span className="text-white/90 text-sm font-medium">
              Sécurisé • Sans engagement • 14 jours gratuits
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Onboarding;