// scheduler.js
const cron = require('node-cron');
const Pickup = require('./models/pickup');

// Schedule a task to check for pickups every minute
cron.schedule('* * * * *', async () => {
  const now = new Date();
  const pickups = await Pickup.find({ pickupTime: { $lte: now }, status: 'Scheduled' });

  pickups.forEach(pickup => {
    // Send reminder or perform action
    console.log(`Reminder: Pickup scheduled for ${pickup.pickupTime}`);
    // Update status to 'Completed' or send notifications as needed
  });
});
