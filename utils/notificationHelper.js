const Notification = require('../models/Notification');
const User = require('../models/User');

/**
 * Create a notification in the database
 * @param {Object} options - Notification options
 * @param {String} options.recipientId - User ID of the recipient
 * @param {String} options.type - Type of notification
 * @param {String} options.message - Notification message
 * @param {Object} [options.relatedTo] - Related model and ID
 * @param {String} [options.url] - URL to redirect to when notification is clicked
 * @returns {Promise<Notification>} - The created notification
 */
async function createNotification(options) {
  try {
    const { recipientId, type, message, relatedTo, url } = options;
    
    // Handle notifications for admins (recipientId is null)
    if (recipientId === null) {
      // If recipient is null, find all admin users
      const adminUsers = await User.find({ role: 'admin' });
      
      if (adminUsers.length === 0) {
        console.log('No admin users found to send notification to');
        return null;
      }
      
      // Create notifications for each admin
      const notifications = [];
      for (const admin of adminUsers) {
        // Check admin notification preferences
        const prefKey = `app_${type.split('_')[0]}s`; // Convert 'feedback' to 'app_feedbacks'
        const shouldReceive = !admin.notificationPreferences || admin.notificationPreferences[prefKey] !== false;
        
        if (!shouldReceive) {
          console.log(`Admin ${admin.name} has opted out of ${type} notifications`);
          continue;
        }
        
        const notification = new Notification({
          recipient: admin._id,
          type,
          message,
          relatedTo,
          url,
          isRead: false
        });
        
        await notification.save();
        notifications.push(notification);
      }
      
      return notifications.length > 0 ? notifications : null;
    } else {
      // Regular notification for a specific user
      const user = await User.findById(recipientId);
      if (!user) {
        throw new Error(`User with ID ${recipientId} not found`);
      }
      
      // Check if the user wants to receive this type of notification
      const prefKey = `app_${type.split('_')[0]}s`; // Convert 'request_received' to 'app_requests'
      const shouldReceive = !user.notificationPreferences || user.notificationPreferences[prefKey] !== false;
      
      if (!shouldReceive) {
        console.log(`User ${user.name} has opted out of ${type} notifications`);
        return null;
      }
      
      // Create the notification
      const notification = new Notification({
        recipient: recipientId,
        type,
        message,
        relatedTo,
        url,
        isRead: false
      });
      
      await notification.save();
      return notification;
    }
  } catch (error) {
    console.error('Error creating notification:', error);
    return null;
  }
}

/**
 * Get unread notification count for a user
 * @param {String} userId - User ID
 * @returns {Promise<Number>} - Count of unread notifications
 */
async function getUnreadCount(userId) {
  try {
    return await Notification.countDocuments({ 
      recipient: userId,
      isRead: false 
    });
  } catch (error) {
    console.error('Error getting unread notification count:', error);
    return 0;
  }
}

/**
 * Mark all notifications as read for a user
 * @param {String} userId - User ID
 * @returns {Promise<Object>} - Result of the operation
 */
async function markAllAsRead(userId) {
  try {
    const result = await Notification.updateMany(
      { recipient: userId, isRead: false },
      { isRead: true }
    );
    
    return {
      success: true,
      count: result.modifiedCount
    };
  } catch (error) {
    console.error('Error marking notifications as read:', error);
    return { success: false, error: error.message };
  }
}

/**
 * Delete old notifications (older than specified days)
 * @param {Number} days - Number of days to keep notifications
 * @returns {Promise<Number>} - Number of deleted notifications
 */
async function deleteOldNotifications(days = 30) {
  try {
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - days);
    
    const result = await Notification.deleteMany({
      createdAt: { $lt: cutoffDate }
    });
    
    return result.deletedCount;
  } catch (error) {
    console.error('Error deleting old notifications:', error);
    return 0;
  }
}

module.exports = {
  createNotification,
  getUnreadCount,
  markAllAsRead,
  deleteOldNotifications
};