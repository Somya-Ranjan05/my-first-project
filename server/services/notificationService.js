import { NotificationRepo } from '../db/database.js';

export const NotificationService = {
  getNotifications(options = {}) {
    return NotificationRepo.findAll(options);
  },

  markRead(id) {
    return NotificationRepo.markAsRead(id);
  },

  markAllRead() {
    NotificationRepo.markAllAsRead();
    return { success: true };
  }
};
