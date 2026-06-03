const { User } = require('../models');

const sendPushNotification = async (userId, title, body, data = {}) => {
  try {
    const user = await User.findByPk(userId);
    if (!user || !user.fcm_token) return false;
    const message = {
      notification: { title, body },
      data,
      token: user.fcm_token
    };

    const response = await fetch('https://fcm.googleapis.com/fcm/send', {
      method: 'POST',
      headers: {
        'Authorization': `key=${process.env.FCM_SERVER_KEY}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(message)
    });

    return response.ok;
  } catch (error) {
    console.error('FCM error:', error.message);
    return false;
  }
};

const sendPushToMany = async (userIds, title, body, data = {}) => {
  const results = await Promise.allSettled(userIds.map(id => sendPushNotification(id, title, body, data)));
  return results;
};

module.exports = { sendPushNotification, sendPushToMany };
