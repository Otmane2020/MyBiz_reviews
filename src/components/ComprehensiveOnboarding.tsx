import React, { useState } from 'react';
import { ChevronRight, ChevronLeft, Star, MessageSquare, Smartphone, Check, Building2, Users, TrendingUp } from 'lucide-react';

interface ComprehensiveOnboardingProps {
  user: any;
  onComplete: () => void;
}

const ComprehensiveOnboarding: React.FC<ComprehensiveOnboardingProps> = ({ user, onComplete }) => {
  const [currentStep, setCurrentStep] = useState(0);

  const steps = [
    {
      icon: <Star className="w-16 h-16 text-[#FBBC05]" />,
      title: `Bienvenue ${user?.name?.split(' ')[0]} !`,
      description: "Félicitations ! Vous venez de rejoindre Starlinko, la plateforme qui va révolutionner la gestion de vos avis Google My Business.",
      color: "from-[#4285F4] to-[#34A853]"
    },
    {
      icon: <Building2 className="w-16 h-16 text-[#4285F4]" />,
      title: "Votre établissement connecté",
      description: "Votre compte Google My Business est maintenant synchronisé. Tous vos avis seront automatiquement importés et organisés.",
      color: "from-[#34A853] to-[#FBBC05]"
    },
    {
      icon: <MessageSquare className="w-16 h-16 text-[#34A853]" />,
      title: "IA de réponse intelligente",
      description: "Notre intelligence artificielle analyse chaque avis et génère des réponses personnalisées et professionnelles en quelques secondes.",
      color: "from-[#FBBC05] to-[#EA4335]"
    },
    {
      icon: <TrendingUp className="w-16 h-16 text-[#EA4335]" />,
      title: "Tableau de bord analytique",
      description: "Suivez l'évolution de votre réputation avec des statistiques détaillées : note moyenne, taux de réponse, tendances.",
      color: "from-[#EA4335] to-[#4285F4]"
    },
    {
      icon: <Smartphone className="w-16 h-16 text-[#4285F4]" />,
      title: "Notifications en temps réel",
      description: "Recevez des alertes instantanées pour chaque nouvel avis et ne manquez jamais une opportunité d'interaction.",
      color: "from-[#4285F4] to-[#34A853]"
    },
    {
      icon: <Users className="w-16 h-16 text-[#34A853]" />,
      title: "Gestion multi-établissements",
      description: "Gérez plusieurs établissements depuis une seule interface. Parfait pour les chaînes et franchises.",
      color: "from-[#34A853] to-[#FBBC05]"
    },
    {
      icon: <Check className="w-16 h-16 text-[#FBBC05]" />,
      title: "Tout est prêt !",
      description: "Votre compte est configuré et prêt à l'emploi. Commencez dès maintenant à améliorer votre réputation en ligne.",
      color: "from-[#FBBC05] to-[#EA4335]"
    }
  ];

  const nextStep = () => {
    if (currentStep < steps.length - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      onComplete();
    }
  };

  const prevStep = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  const goToStep = (step: number) => {
    setCurrentStep(step);
  };

  return (
    <div className={`min-h-screen bg-gradient-to-br ${steps[currentStep].color} flex items-center justify-center p-4`}>
      <div className="max-w-lg w-full">
        {/* Progress indicators */}
        <div className="flex justify-center mb-8 overflow-x-auto">
          <div className="flex items-center space-x-2 px-4">
            {steps.map((_, index) => (
              <button
                key={index}
                onClick={() => goToStep(index)}
                className={`w-2.5 h-2.5 rounded-full transition-all flex-shrink-0 ${
                  index === currentStep 
                    ? 'bg-white scale-125' 
                    : index < currentStep 
                      ? 'bg-white/70' 
                      : 'bg-white/30'
                }`}
              />
            ))}
          </div>
        </div>

        {/* Content */}
        <div className="bg-white rounded-3xl p-8 text-center shadow-2xl">
          <div className="flex justify-center mb-6">
            {steps[currentStep].icon}
          </div>
          
          <h2 className="text-2xl font-bold text-gray-900 mb-4">
            {steps[currentStep].title}
          </h2>
          
          <p className="text-gray-600 mb-8 leading-relaxed">
            {steps[currentStep].description}
          </p>

          {/* User info for first step */}
          {currentStep === 0 && user && (
            <div className="bg-gray-50 rounded-xl p-4 mb-6">
              <div className="flex items-center justify-center">
                <img
                  src={user.picture}
                  alt={user.name}
                  className="w-12 h-12 rounded-full mr-3"
                />
                <div className="text-left">
                  <div className="font-medium text-gray-900">{user.name}</div>
                  <div className="text-sm text-gray-500">{user.email}</div>
                </div>
              </div>
            </div>
          )}

          {/* Features highlight for middle steps */}
          {currentStep >= 2 && currentStep <= 5 && (
            <div className="bg-gradient-to-r from-[#4285F4]/10 to-[#34A853]/10 rounded-xl p-4 mb-6">
              <div className="flex items-center justify-center text-sm text-gray-600">
                <Check className="w-4 h-4 text-[#34A853] mr-2" />
                Fonctionnalité incluse dans votre compte
              </div>
            </div>
          )}

          {/* Navigation */}
          <div className="flex justify-between items-center">
            <button
              onClick={prevStep}
              disabled={currentStep === 0}
              className={`flex items-center px-4 py-2 rounded-full transition-all ${
                currentStep === 0
                  ? 'text-gray-400 cursor-not-allowed'
                  : 'text-gray-600 hover:bg-gray-100'
              }`}
            >
              <ChevronLeft className="w-5 h-5 mr-1" />
              Précédent
            </button>

            <span className="text-sm text-gray-500">
              {currentStep + 1} / {steps.length}
            </span>

            <button
              onClick={nextStep}
              className="flex items-center px-6 py-3 bg-[#4285F4] text-white rounded-full hover:bg-[#3367D6] transition-all transform hover:scale-105"
            >
              {currentStep === steps.length - 1 ? 'Commencer' : 'Suivant'}
              <ChevronRight className="w-5 h-5 ml-1" />
            </button>
          </div>
        </div>

        {/* Skip option */}
        {currentStep < steps.length - 1 && (
          <div className="text-center mt-6">
            <button
              onClick={onComplete}
              className="text-white/80 hover:text-white transition-colors text-sm underline"
            >
              Passer l'introduction
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default ComprehensiveOnboarding;