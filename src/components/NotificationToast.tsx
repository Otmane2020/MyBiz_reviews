import React, { useEffect, useState } from 'react';
import { X, Star, MessageSquare } from 'lucide-react';

interface NotificationToastProps {
  notification: {
    id: string;
    type: 'new_review' | 'review_reply';
    title: string;
    message: string;
    review: {
      author: string;
      rating: number;
      comment: string;
    };
  };
  onClose: () => void;
  autoClose?: boolean;
  duration?: number;
}

const NotificationToast: React.FC<NotificationToastProps> = ({
  notification,
  onClose,
  autoClose = true,
  duration = 5000,
}) => {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    // Animate in
    const timer = setTimeout(() => setIsVisible(true), 100);
    
    // Auto close
    if (autoClose) {
      const closeTimer = setTimeout(() => {
        handleClose();
      }, duration);
      
      return () => {
        clearTimeout(timer);
        clearTimeout(closeTimer);
      };
    }
    
    return () => clearTimeout(timer);
  }, [autoClose, duration]);

  const handleClose = () => {
    setIsVisible(false);
    setTimeout(onClose, 300); // Wait for animation
  };

  const renderStars = (rating: number) => {
    return (
      <div className="flex">
        {[1, 2, 3, 4, 5].map((star) => (
          <Star
            key={star}
            className={`w-3 h-3 ${
              star <= rating ? 'text-[#FBBC05] fill-current' : 'text-gray-300'
            }`}
          />
        ))}
      </div>
    );
  };

  return (
    <div
      className={`fixed top-4 right-4 z-50 max-w-sm w-full bg-white rounded-lg shadow-lg border border-gray-200 transform transition-all duration-300 ${
        isVisible ? 'translate-x-0 opacity-100' : 'translate-x-full opacity-0'
      }`}
    >
      <div className="p-4">
        <div className="flex items-start justify-between">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              {notification.type === 'new_review' ? (
                <div className="w-8 h-8 bg-[#4285F4]/10 rounded-full flex items-center justify-center">
                  <Star className="w-4 h-4 text-[#4285F4]" />
                </div>
              ) : (
                <div className="w-8 h-8 bg-[#34A853]/10 rounded-full flex items-center justify-center">
                  <MessageSquare className="w-4 h-4 text-[#34A853]" />
                </div>
              )}
            </div>
            <div className="ml-3 flex-1">
              <p className="text-sm font-medium text-gray-900">
                {notification.title}
              </p>
              <p className="text-sm text-gray-600 mt-1">
                {notification.message}
              </p>
              {notification.type === 'new_review' && (
                <div className="mt-2">
                  {renderStars(notification.review.rating)}
                  {notification.review.comment && (
                    <p className="text-xs text-gray-500 mt-1 line-clamp-2">
                      "{notification.review.comment}"
                    </p>
                  )}
                </div>
              )}
            </div>
          </div>
          <button
            onClick={handleClose}
            className="flex-shrink-0 ml-2 p-1 rounded-full hover:bg-gray-100 transition-colors"
          >
            <X className="w-4 h-4 text-gray-400" />
          </button>
        </div>
      </div>
      
      {/* Progress bar for auto-close */}
      {autoClose && (
        <div className="h-1 bg-gray-100 rounded-b-lg overflow-hidden">
          <div
            className="h-full bg-[#4285F4] transition-all ease-linear"
            style={{
              animation: `shrink ${duration}ms linear`,
            }}
          />
        </div>
      )}
      
      <style jsx>{`
        @keyframes shrink {
          from { width: 100%; }
          to { width: 0%; }
        }
      `}</style>
    </div>
  );
};

export default NotificationToast;