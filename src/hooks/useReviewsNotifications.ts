import { useEffect, useState } from 'react';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || '';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || '';

const supabase = createClient(supabaseUrl, supabaseAnonKey);

interface Review {
  id: number;
  review_id: string;
  location_id: string;
  author: string;
  rating: number;
  comment: string;
  review_date: string;
  replied: boolean;
  created_at: string;
}

interface Notification {
  id: string;
  type: 'new_review' | 'review_reply';
  title: string;
  message: string;
  review: Review;
  timestamp: Date;
  read: boolean;
}

export const useReviewsNotifications = (locationId?: string) => {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);

  useEffect(() => {
    if (!locationId) return;

    // Subscribe to new reviews
    const channel = supabase
      .channel('reviews-notifications')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'reviews',
          filter: `location_id=eq.${locationId}`,
        },
        (payload) => {
          const newReview = payload.new as Review;
          
          const notification: Notification = {
            id: `review-${newReview.id}-${Date.now()}`,
            type: 'new_review',
            title: 'Nouvel avis reçu !',
            message: `${newReview.author} a laissé un avis ${newReview.rating} étoiles`,
            review: newReview,
            timestamp: new Date(),
            read: false,
          };

          setNotifications(prev => [notification, ...prev]);
          setUnreadCount(prev => prev + 1);

          // Show browser notification if permission granted
          if (Notification.permission === 'granted') {
            new Notification(notification.title, {
              body: notification.message,
              icon: '/favicon.ico',
              tag: notification.id,
            });
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [locationId]);

  // Request notification permission
  useEffect(() => {
    if ('Notification' in window && Notification.permission === 'default') {
      Notification.requestPermission();
    }
  }, []);

  const markAsRead = (notificationId: string) => {
    setNotifications(prev =>
      prev.map(notif =>
        notif.id === notificationId ? { ...notif, read: true } : notif
      )
    );
    setUnreadCount(prev => Math.max(0, prev - 1));
  };

  const markAllAsRead = () => {
    setNotifications(prev =>
      prev.map(notif => ({ ...notif, read: true }))
    );
    setUnreadCount(0);
  };

  const clearNotifications = () => {
    setNotifications([]);
    setUnreadCount(0);
  };

  return {
    notifications,
    unreadCount,
    markAsRead,
    markAllAsRead,
    clearNotifications,
  };
};