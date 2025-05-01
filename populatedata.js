const mongoose = require('mongoose');
const Category = require('./models/Category');
const Article = require('./models/Articles');

// Connect to MongoDB
mongoose.connect('mongodb://localhost:27017/foodsave', {
  useNewUrlParser: true,
  useUnifiedTopology: true
})
.then(() => {
  console.log('Connected to MongoDB');
})
.catch((err) => {
  console.error('Error connecting to MongoDB', err);
  process.exit(1); // Exit process with failure
});

// Create articles
const article1 = new Article({ title: 'How to Create an Account', content: 'This article explains how to sign up for an account on FoodSave...' });
const article2 = new Article({ title: 'How to Use the Dashboard', content: 'Once you log in, the dashboard will provide an overview...' });
const article3 = new Article({ title: 'Troubleshooting Login Issues', content: 'If you’re having trouble logging in, make sure your email and password are correct...' });

// Save articles to the database
Promise.all([article1.save(), article2.save(), article3.save()])
  .then(savedArticles => {
    // Create a category with these articles
    const category = new Category({
      name: 'Account Setup',
      articles: savedArticles.map(article => article._id)  // Map the saved articles to their IDs
    });

    // Save the category
    return category.save();
  })
  .then(savedCategory => {
    console.log('Category and articles saved:', savedCategory);
    mongoose.connection.close(); // Close connection after saving
  })
  .catch(err => {
    console.error('Error saving category or articles:', err);
    mongoose.connection.close(); // Close connection in case of error
  });
