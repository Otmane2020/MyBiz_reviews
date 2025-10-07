import React, { useState } from 'react';
import { Star, MessageSquare, User, Calendar, Sparkles, Send } from 'lucide-react';

interface Review {
  reviewId: string;
  reviewer: {
    profilePhotoUrl: string;
    displayName: string;
  };
  starRating: 'ONE' | 'TWO' | 'THREE' | 'FOUR' | 'FIVE';
  comment: string;
  createTime: string;
  reviewReply?: {
    comment: string;
    updateTime: string;
  };
}

interface ReviewCardProps {
  review: Review;
  onReplyManual: (reviewId: string, replyText: string) => Promise<void>;
  onReplyAI: (reviewId: string) => Promise<void>;
  isReplying: boolean;
}

const ReviewCard: React.FC<ReviewCardProps> = ({ review, onReplyManual, onReplyAI, isReplying }) => {
  const [showReplyForm, setShowReplyForm] = useState(false);
  const [replyText, setReplyText] = useState('');
  const [isGeneratingAI, setIsGeneratingAI] = useState(false);

  const getStarRating = (rating: string): number => {
    const ratingMap: { [key: string]: number } = {
      'ONE': 1,
      'TWO': 2,
      'THREE': 3,
      'FOUR': 4,
      'FIVE': 5,
    };
    return ratingMap[rating] || 0;
  };

  const renderStars = (rating: number) => {
    return (
      <div className="flex items-center">
        {[1, 2, 3, 4, 5].map((star) => (
          <Star
            key={star}
            className={`w-4 h-4 ${
              star <= rating ? 'text-[#FBBC05] fill-current' : 'text-gray-300'
            }`}
          />
        ))}
        <span className="ml-2 text-sm text-gray-600">({rating}/5)</span>
      </div>
    );
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('fr-FR', {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
    });
  };

  const handleGenerateAI = async () => {
    setIsGeneratingAI(true);
    try {
      await onReplyAI(review.reviewId);
      setShowReplyForm(false);
    } finally {
      setIsGeneratingAI(false);
    }
  };

  const handleSubmitReply = async () => {
    if (!replyText.trim()) return;

    try {
      await onReplyManual(review.reviewId, replyText);
      setReplyText('');
      setShowReplyForm(false);
    } catch (error) {
      console.error('Error submitting reply:', error);
    }
  };

  const rating = getStarRating(review.starRating);

  return (
    <div className="bg-white rounded-xl shadow-sm p-6">
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center">
          {review.reviewer.profilePhotoUrl ? (
            <img
              src={review.reviewer.profilePhotoUrl}
              alt={review.reviewer.displayName}
              className="w-10 h-10 rounded-full mr-3"
            />
          ) : (
            <div className="w-10 h-10 rounded-full bg-gray-300 flex items-center justify-center mr-3">
              <User className="w-6 h-6 text-gray-600" />
            </div>
          )}
          <div>
            <h3 className="font-semibold text-gray-900">
              {review.reviewer.displayName}
            </h3>
            <div className="flex items-center mt-1">
              {renderStars(rating)}
            </div>
          </div>
        </div>

        <div className="flex items-center text-gray-500 text-sm">
          <Calendar className="w-4 h-4 mr-1" />
          {formatDate(review.createTime)}
        </div>
      </div>

      <p className="text-gray-700 mb-4 leading-relaxed">
        {review.comment}
      </p>

      {review.reviewReply ? (
        <div className="bg-[#F1F3F4] rounded-lg p-4">
          <div className="flex items-center mb-2">
            <span className="font-medium text-gray-900">Votre réponse:</span>
            <span className="ml-2 text-sm text-gray-500">
              {formatDate(review.reviewReply.updateTime)}
            </span>
          </div>
          <p className="text-gray-700">{review.reviewReply.comment}</p>
        </div>
      ) : (
        <div className="space-y-3">
          {!showReplyForm ? (
            <div className="flex gap-2">
              <button
                onClick={() => setShowReplyForm(true)}
                disabled={isReplying}
                className="inline-flex items-center px-4 py-2 bg-[#4285F4] text-white text-sm font-medium rounded-lg hover:bg-[#3367D6] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#4285F4] disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-200"
              >
                <MessageSquare className="w-4 h-4 mr-2" />
                Répondre
              </button>

              <button
                onClick={handleGenerateAI}
                disabled={isReplying || isGeneratingAI}
                className="inline-flex items-center px-4 py-2 bg-gradient-to-r from-[#FBBC05] to-[#EA4335] text-white text-sm font-medium rounded-lg hover:opacity-90 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#FBBC05] disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200"
              >
                <Sparkles className="w-4 h-4 mr-2" />
                {isGeneratingAI ? 'Génération...' : 'Réponse IA'}
              </button>
            </div>
          ) : (
            <div className="space-y-3">
              <textarea
                value={replyText}
                onChange={(e) => setReplyText(e.target.value)}
                placeholder="Écrivez votre réponse..."
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#4285F4] focus:border-transparent resize-none"
                rows={4}
              />
              <div className="flex gap-2">
                <button
                  onClick={handleSubmitReply}
                  disabled={!replyText.trim() || isReplying}
                  className="inline-flex items-center px-4 py-2 bg-[#4285F4] text-white text-sm font-medium rounded-lg hover:bg-[#3367D6] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#4285F4] disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-200"
                >
                  <Send className="w-4 h-4 mr-2" />
                  {isReplying ? 'Envoi...' : 'Envoyer'}
                </button>

                <button
                  onClick={handleGenerateAI}
                  disabled={isReplying || isGeneratingAI}
                  className="inline-flex items-center px-4 py-2 bg-gradient-to-r from-[#FBBC05] to-[#EA4335] text-white text-sm font-medium rounded-lg hover:opacity-90 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#FBBC05] disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200"
                >
                  <Sparkles className="w-4 h-4 mr-2" />
                  {isGeneratingAI ? 'Génération...' : 'Générer avec IA'}
                </button>

                <button
                  onClick={() => {
                    setShowReplyForm(false);
                    setReplyText('');
                  }}
                  className="px-4 py-2 bg-gray-200 text-gray-700 text-sm font-medium rounded-lg hover:bg-gray-300 transition-colors duration-200"
                >
                  Annuler
                </button>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default ReviewCard;
