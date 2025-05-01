const mongoose = require('mongoose');
const Notification = require('./models/Notification');
const Receiver = require('./models/Receiver');

mongoose.connect('mongodb://localhost/foodsave', {
  useNewUrlParser: true,
  useUnifiedTopology: true
})
  .then(async () => {
    console.log('Connected to MongoDB...');

    const receiver = await Receiver.findOne(); // Finds first receiver
    if (!receiver) throw new Error('No receiver found');

    const receiverId = receiver._id;

    const notifications = [
      {
        receiverId,
        icon: 'fa-bell',
        message: 'You have a <strong>new donation request</strong> available. Check your dashboard.'
      },
      {
        receiverId,
        icon: 'fa-calendar-check',
        message: 'Pickup for <strong>Vegetable Soup</strong> scheduled on <em>April 28, 2025 at 3:00 PM</em>.'
      },
      {
        receiverId,
        icon: 'fa-hourglass-half',
        message: '⚠️ <strong>1 item expires in 24 hours:</strong> <em>Packaged Salad</em>. Please prioritize pickup.'
      },
      {
        receiverId,
        icon: 'fa-check-circle',
        message: 'Your scheduled pickup for <strong>Rice & Lentils</strong> has been <span style="color:green">marked as completed</span>.'
      }
    ];

    await Notification.insertMany(notifications);
    console.log('✅ Notifications seeded!');
    mongoose.disconnect();
  })
  .catch(err => {
    console.error('❌ Error seeding notifications:', err);
    mongoose.disconnect();
  });
