const Notification = require('../models/Notification');

/**
 * Create an in-app notification
 * @param {Object} data
 * @param {string|ObjectId} data.recipient
 * @param {string} data.title
 * @param {string} data.message
 * @param {string} data.type
 * @param {string} data.link
 */
const createNotification = async ({ recipient, title, message, type = 'GENERAL', link = '' }) => {
  try {
    const notification = await Notification.create({
      recipient,
      title,
      message,
      type,
      link,
    });
    return notification;
  } catch (err) {
    console.error('Error creating notification:', err.message);
  }
};

module.exports = {
  createNotification,
};
