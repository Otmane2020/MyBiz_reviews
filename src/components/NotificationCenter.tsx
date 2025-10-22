import React, { useState, useEffect, useRef } from 'react';
import { Bell, X, Star, MessageSquare, Check, Trash2 } from 'lucide-react';

interface Notification {
  id: string;
  type: 'new_review' | 'review_reply';
  title: string;
  message: string;
  review: {
    author: string;
    rating: number;
    comment: string;
  };
  timestamp: Date;
  read: boolean;
}

interface NotificationCenterProps {
  notifications: Notification[];
  unreadCount: number;
  onMarkAsRead: (id: string) => void;
  onMarkAllAsRead: () => void;
  onClearAll: () => void;
}

const NotificationCenter: React.FC<NotificationCenterProps> = ({
  notifications,
  unreadCount,
  onMarkAsRead,
  onMarkAllAsRead,
  onClearAll,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [shouldShake, setShouldShake] = useState(false);
  const prevUnreadCountRef = useRef(unreadCount);

  // Animate bell when new notification arrives
  useEffect(() => {
    if (unreadCount > prevUnreadCountRef.current && unreadCount > 0) {
      setShouldShake(true);
      setTimeout(() => setShouldShake(false), 1000);

      // Play notification sound (optional)
      try {
        const audio = new Audio('data:audio/wav;base64,UklGRnoGAABXQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YQoGAACBhYqFbF1fdJivrJBhNjVgodDbq2EcBj+a2/LDciUFLIHO8tiJNwgZaLvt559NEAxQp+PwtmMcBjiR1/LMeSwFJHfH8N2QQAoUXrTp66hVFApGn+DyvmwhBTGH0fPTgjMGHm7A7+OZOR0FPJXb8cf');
        audio.volume = 0.3;
        audio.play().catch(() => {}); // Ignore errors if audio fails
      } catch (e) {
        // Silent fail for audio
      }
    }
    prevUnreadCountRef.current = unreadCount;
  }, [unreadCount]);

  const formatTime = (date: Date) => {
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(diff / 3600000);
    const days = Math.floor(diff / 86400000);

    if (minutes < 1) return 'À l\'instant';
    if (minutes < 60) return `Il y a ${minutes}min`;
    if (hours < 24) return `Il y a ${hours}h`;
    return `Il y a ${days}j`;
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
    <div className="relative">
      {/* Notification Bell */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={`relative p-2 rounded-full hover:bg-gray-100 transition-colors ${
          shouldShake ? 'animate-bounce' : ''
        }`}
      >
        <Bell className={`w-6 h-6 text-gray-600 ${shouldShake ? 'animate-pulse' : ''}`} />
        {unreadCount > 0 && (
          <span className="absolute -top-1 -right-1 bg-[#EA4335] text-white text-xs rounded-full w-5 h-5 flex items-center justify-center font-medium animate-pulse">
            {unreadCount > 9 ? '9+' : unreadCount}
          </span>
        )}
      </button>

      {/* Notification Panel */}
      {isOpen && (
        <>
          {/* Overlay */}
          <div
            className="fixed inset-0 z-40"
            onClick={() => setIsOpen(false)}
          />
          
          {/* Panel */}
          <div className="absolute right-0 top-full mt-2 w-80 bg-white rounded-lg shadow-lg border border-gray-200 z-50 max-h-96 overflow-hidden">
            {/* Header */}
            <div className="p-4 border-b border-gray-200">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold text-gray-900">
                  Notifications
                </h3>
                <button
                  onClick={() => setIsOpen(false)}
                  className="p-1 rounded-full hover:bg-gray-100"
                >
                  <X className="w-4 h-4 text-gray-400" />
                </button>
              </div>
              
              {notifications.length > 0 && (
                <div className="flex items-center justify-between mt-2">
                  <span className="text-sm text-gray-500">
                    {unreadCount} non lues
                  </span>
                  <div className="flex space-x-2">
                    {unreadCount > 0 && (
                      <button
                        onClick={onMarkAllAsRead}
                        className="text-xs text-[#4285F4] hover:underline flex items-center"
                      >
                        <Check className="w-3 h-3 mr-1" />
                        Tout marquer lu
                      </button>
                    )}
                    <button
                      onClick={onClearAll}
                      className="text-xs text-gray-500 hover:underline flex items-center"
                    >
                      <Trash2 className="w-3 h-3 mr-1" />
                      Effacer tout
                    </button>
                  </div>
                </div>
              )}
            </div>

            {/* Notifications List */}
            <div className="max-h-64 overflow-y-auto">
              {notifications.length === 0 ? (
                <div className="p-8 text-center">
                  <Bell className="w-8 h-8 text-gray-300 mx-auto mb-2" />
                  <p className="text-gray-500 text-sm">Aucune notification</p>
                </div>
              ) : (
                notifications.map((notification) => (
                  <div
                    key={notification.id}
                    className={`p-4 border-b border-gray-100 last:border-b-0 hover:bg-gray-50 cursor-pointer ${
                      !notification.read ? 'bg-blue-50' : ''
                    }`}
                    onClick={() => onMarkAsRead(notification.id)}
                  >
                    <div className="flex items-start">
                      <div className="flex-shrink-0 mr-3">
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
                      
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between">
                          <p className="text-sm font-medium text-gray-900 truncate">
                            {notification.title}
                          </p>
                          {!notification.read && (
                            <div className="w-2 h-2 bg-[#4285F4] rounded-full ml-2" />
                          )}
                        </div>
                        
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
                        
                        <p className="text-xs text-gray-400 mt-2">
                          {formatTime(notification.timestamp)}
                        </p>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default NotificationCenter;