import { notificationsList, notificationsMarkRead } from '../../lib/api';

export const fetchNotifications = async (query: { unread_only?: boolean; limit?: number } = {}) => {
  return notificationsList(query);
};

export const markReadNotifications = async (payload: { notification_ids: string[] }) => {
  return notificationsMarkRead(payload);
};