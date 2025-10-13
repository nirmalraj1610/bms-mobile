import type { Notification } from '../../types/api';

export type NotificationsState = {
  items: Notification[];
  loading: boolean;
  error: string | null;
  marking: boolean;
};