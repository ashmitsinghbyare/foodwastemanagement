const Notification = require('../models/Notification');

// Function to create a notification
/*async function createNotification(userId, icon, message) {
  try {
    const newNotification = new Notification({
      receiverId: userId,// Use req.user._id or req.user.id based on your session setup  
            icon,
      message,
      createdAt: new Date()
    });
    await newNotification.save();
  } catch (err) {
    console.error('Error creating notification:', err);
  }
}
*/
/*async function createNotification(userId, icon, message) {
  if (!userId) {
    console.error("Error: userId is required to create a notification.");
    return;
  }

  try {
    const newNotification = new Notification({
      receiverId: userId,
      icon,
      message,
      createdAt: new Date()
    });
    await newNotification.save();
  } catch (err) {
    console.error('Error creating notification:', err);
  }
}*/

async function createNotification(userId = null, icon, message) {
  if (!userId) {
    console.error("Error: userId is required to create a notification.");
    return;
  }

  try {
    const newNotification = new Notification({
      receiverId: userId,
      icon,
      message,
      createdAt: new Date()
    });
    await newNotification.save();
  } catch (err) {
    console.error('Error creating notification:', err);
  }
}




// Example: Notify user when a pickup is confirmed
async function notifyPickupConfirmed(userId, pickupDate) {
  const icon = 'fa-circle-check';
  const message = `Your food pickup has been confirmed for ${pickupDate}.`;
  await createNotification(userId, icon, message);
}

// Example: Notify user when a pickup is delayed
async function notifyPickupDelayed(userId, newPickupDate) {
  const icon = 'fa-triangle-exclamation';
  const message = `Your pickup has been delayed. The new pickup time is ${newPickupDate}.`;
  await createNotification(userId, icon, message);
}

module.exports = {
  createNotification,
  notifyPickupConfirmed,
  notifyPickupDelayed
};
