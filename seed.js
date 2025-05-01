const mongoose = require('mongoose');
const Donation = require('./models/donation'); // ✅ Corrected path

mongoose.connect('mongodb://localhost:27017/foodwastemanagement', {
  useNewUrlParser: true,
  useUnifiedTopology: true,
})
.then(() => {
  console.log('MongoDB connected');

  return Donation.insertMany([
    {
      donorName: "Ravi",
      location: "indore",
      category: "Food",
      phone: "1234567890",
      datetime: new Date(),
      address: "MG Road",
      quantity: 10,
      amount: 50,
    },
    {
      donorName: "Anita",
      location: "bhopal",
      category: "Food",
      phone: "9876543210",
      datetime: new Date(),
      address: "New Market",
      quantity: 15,
      amount: 100,
    },
    {
      donorName: "Ramesh",
      location: "indore",
      category: "Snacks",
      phone: "6789012345",
      datetime: new Date(),
      address: "Palasia",
      quantity: 8,
      amount: 70,
    }
  ]);
})
.then(() => {
  console.log('Seeding completed');
  mongoose.disconnect();
})
.catch(err => {
  console.error('Error:', err);
  mongoose.disconnect();
});
