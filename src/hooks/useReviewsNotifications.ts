import { useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';

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

export const useReviewsNotifications = (userId?: string) => {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [userLocations, setUserLocations] = useState<string[]>([]);

  // Fetch user's locations
  useEffect(() => {
    if (!userId) return;

    const fetchUserLocations = async () => {
      const { data, error } = await supabase
        .from('locations')
        .select('location_id')
        .eq('user_id', userId)
        .eq('is_active', true);

      if (!error && data) {
        setUserLocations(data.map(l => l.location_id));
      }
    };

    fetchUserLocations();

    // Re-fetch locations every 30 seconds to catch new additions
    const interval = setInterval(fetchUserLocations, 30000);
    return () => clearInterval(interval);
  }, [userId]);

  // Subscribe to new reviews for all user locations
  useEffect(() => {
    if (!userId || userLocations.length === 0) return;

    // Subscribe to new reviews for all user's locations
    const channel = supabase
      .channel('reviews-notifications')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'reviews',
        },
        async (payload) => {
          const newReview = payload.new as Review;

          // Check if this review belongs to one of user's locations
          if (!userLocations.includes(newReview.location_id)) return;

          // Get location name
          const { data: locationData } = await supabase
            .from('locations')
            .select('location_name')
            .eq('location_id', newReview.location_id)
            .single();

          const locationName = locationData?.location_name || 'Établissement';

          const notification: Notification = {
            id: `review-${newReview.id}-${Date.now()}`,
            type: 'new_review',
            title: 'Nouvel avis reçu !',
            message: `${newReview.author} a laissé un avis ${newReview.rating} étoiles sur ${locationName}`,
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
  }, [userId, userLocations]);

  // Request notification permission on mount
  useEffect(() => {
    if ('Notification' in window && Notification.permission === 'default') {
      Notification.requestPermission().then(permission => {
        if (permission === 'granted') {
          console.log('✅ Notifications activées');
        }
      });
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