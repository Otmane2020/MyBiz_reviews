import React, { useState } from 'react';
import { ChevronRight, ChevronLeft, Star, MessageSquare, Smartphone, Check } from 'lucide-react';

interface OnboardingProps {
  onComplete: () => void;
}

const Onboarding: React.FC<OnboardingProps> = ({ onComplete }) => {
  const [currentStep, setCurrentStep] = useState(0);

  const steps = [
    {
      icon: <Star className="w-16 h-16 text-[#FBBC05]" />,
      title: "Bienvenue sur ReviewsManager",
      description: "Gérez tous vos avis Google My Business depuis une seule interface moderne et intuitive.",
      color: "from-[#4285F4] to-[#34A853]"
    },
    {
      icon: <MessageSquare className="w-16 h-16 text-[#4285F4]" />,
      title: "Réponses automatiques",
      description: "Notre IA génère des réponses personnalisées et professionnelles pour chaque avis reçu.",
      color: "from-[#34A853] to-[#FBBC05]"
    },
    {
      icon: <Smartphone className="w-16 h-16 text-[#34A853]" />,
      title: "Optimisé mobile",
      description: "Accédez à vos avis et répondez en déplacement grâce à notre interface mobile-first.",
      color: "from-[#FBBC05] to-[#EA4335]"
    },
    {
      icon: <Check className="w-16 h-16 text-[#EA4335]" />,
      title: "Prêt à commencer !",
      description: "Connectez votre compte Google pour commencer à gérer vos avis efficacement.",
      color: "from-[#EA4335] to-[#4285F4]"
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
      <div className="max-w-md w-full">
        {/* Progress indicators */}
        <div className="flex justify-center mb-8">
          {steps.map((_, index) => (
            <button
              key={index}
              onClick={() => goToStep(index)}
              className={`w-3 h-3 rounded-full mx-1 transition-all ${
                index === currentStep 
                  ? 'bg-white scale-125' 
                  : index < currentStep 
                    ? 'bg-white/70' 
                    : 'bg-white/30'
              }`}
            />
          ))}
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

export default Onboarding;