export type Notification = {
  id: string;
  type: NotificationType;
  title: string;
  message: string;
  data?: Record<string, unknown>;
  read: boolean;
  createdAt: string;
  actionUrl?: string;
  actionLabel?: string;
};

export type NotificationType = 
  | 'reminder'
  | 'achievement'
  | 'streak'
  | 'assignment_due'
  | 'certification_earned'
  | 'project_validated'
  | 'system';

export type NotificationPreferences = {
  enabled: boolean;
  email: boolean;
  push: boolean;
  quietHours: {
    enabled: boolean;
    start: string;
    end: string;
  };
  types: Record<NotificationType, boolean>;
};