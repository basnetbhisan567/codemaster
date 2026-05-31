import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { Notification, NotificationPreferences, NotificationType } from '../types/notification';

interface NotificationState {
  notifications: Notification[];
  preferences: NotificationPreferences;
  unreadCount: number;
  
  addNotification: (notification: Omit<Notification, 'id' | 'createdAt' | 'read'>) => void;
  markAsRead: (id: string) => void;
  markAllAsRead: () => void;
  removeNotification: (id: string) => void;
  clearAll: () => void;
  updatePreferences: (preferences: Partial<NotificationPreferences>) => void;
  isNotificationEnabled: (type: NotificationType) => boolean;
}

const defaultPreferences: NotificationPreferences = {
  enabled: true,
  email: true,
  push: true,
  quietHours: {
    enabled: false,
    start: '22:00',
    end: '07:00',
  },
  types: {
    reminder: true,
    achievement: true,
    streak: true,
    assignment_due: true,
    certification_earned: true,
    project_validated: true,
    system: true,
  },
};

export const useNotificationStore = create<NotificationState>()(
  persist(
    (set, get) => ({
      notifications: [],
      preferences: defaultPreferences,
      unreadCount: 0,

      addNotification: (notification) => {
        const { preferences } = get();
        
        if (!preferences.enabled) return;
        if (!preferences.types[notification.type]) return;
        
        const newNotification: Notification = {
          ...notification,
          id: `notif-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
          read: false,
          createdAt: new Date().toISOString(),
        };
        
        set(state => ({
          notifications: [newNotification, ...state.notifications].slice(0, 100),
          unreadCount: state.unreadCount + 1,
        }));
        
        if (preferences.push && 'Notification' in window) {
          const browserNotification = new window.Notification(notification.title, {
            body: notification.message,
            icon: '/favicon.ico',
          });
        }
      },

      markAsRead: (id: string) => {
        set(state => {
          const notifications = state.notifications.map(n =>
            n.id === id ? { ...n, read: true } : n
          );
          return {
            notifications,
            unreadCount: notifications.filter(n => !n.read).length,
          };
        });
      },

      markAllAsRead: () => {
        set(state => ({
          notifications: state.notifications.map(n => ({ ...n, read: true })),
          unreadCount: 0,
        }));
      },

      removeNotification: (id: string) => {
        set(state => {
          const notifications = state.notifications.filter(n => n.id !== id);
          return {
            notifications,
            unreadCount: notifications.filter(n => !n.read).length,
          };
        });
      },

      clearAll: () => {
        set({ notifications: [], unreadCount: 0 });
      },

      updatePreferences: (preferences: Partial<NotificationPreferences>) => {
        set(state => ({
          preferences: { ...state.preferences, ...preferences },
        }));
      },

      isNotificationEnabled: (type: NotificationType): boolean => {
        const { preferences } = get();
        return preferences.enabled && preferences.types[type];
      },
    }),
    {
      name: 'notification-storage',
      partialize: (state) => ({
        preferences: state.preferences,
      }),
    }
  )
);