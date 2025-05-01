const express = require('express');
const router = express.Router();
const Feedback = require('../models/feedback'); // Adjust path if needed

// GET /feedbacks — Show all feedback
/*router.get('/feedbacks', async (req, res) => {
  try {
    // Fetching all feedbacks sorted by creation date in descending order
    const feedbacks = await Feedback.find().sort({ createdAt: -1 });
    
    // Rendering feedback page with fetched feedbacks
    res.render('feedbacks', {
      feedbacks,
      hideNavbar: true,
      noFooter: true
    });
  } catch (error) {
    console.error('❌ Error fetching feedbacks:', error);
    res.status(500).send('Internal Server Error');
  }
});*/

/*router.get('/feedbacks', async (req, res) => {
  try {
    // Fetching all feedbacks from the database, sorted by the creation date (newest first)
    const feedbacks = await Feedback.find().sort({ createdAt: -1 });

    // Render the feedbacks page with the fetched feedbacks
    res.render('feedbacks', {
      feedbacks,  // Passing all the feedbacks to the view
      hideNavbar: true,
      noFooter: true
    });
  } catch (error) {
    console.error('❌ Error fetching feedbacks:', error);
    res.status(500).send('Internal Server Error');
  }
});*/

router.get('/feedbacks', async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1; // Default to page 1
    const limit = 5; // Number of feedbacks per page
    const skip = (page - 1) * limit; // Number of feedbacks to skip

    const totalFeedbacks = await Feedback.countDocuments(); // Get total number of feedbacks
    const feedbacks = await Feedback.find()
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    res.render('feedbacks', {
      feedbacks,
      currentPage: page,
      totalPages: Math.ceil(totalFeedbacks / limit),
      hideNavbar: true,
      noFooter: true
    });
  } catch (error) {
    console.error('❌ Error fetching feedbacks:', error);
    res.status(500).send('Internal Server Error');
  }
});



// POST /feedbacks — Submit feedback
/*router.post('/feedbacks', async (req, res) => {
  const { name, email, message, rating } = req.body;

  try {
    // Validate that rating is between 1 and 5
    if (rating < 1 || rating > 5) {
      return res.status(400).send('Rating must be between 1 and 5.');
    }

    console.log('📝 Feedback received:', req.body);

    // Save the feedback to the database
    await Feedback.create({ name, email, message, rating });

    // Redirect back to the feedback page
    res.redirect('/feedbacks');
  } catch (error) {
    console.error('🔥 Error saving feedback:', error);
    res.status(500).send('Internal Server Error');
  }
});
*/

/*router.post('/feedbacks', async (req, res) => {
  const { name, email, message, rating } = req.body;

  try {
     // Validate that rating is between 1 and 5
     if (rating < 1 || rating > 5) {
      return res.status(400).send('Rating must be between 1 and 5.');}
    console.log('📝 Feedback received:', req.body);

    await Feedback.create({ name, email, message, rating });

    res.redirect('/feedbacks'); // Redirect to feedbacks list or success page
      } catch (error) {
    console.error('🔥 Error saving feedback:', error);
    res.status(500).send('Internal Server Error');
  }
});
router.post('/feedbacks', async (req, res) => {
  const { name, email, message, rating, role } = req.body;

  try {
    // Validate that the rating is between 1 and 5
    if (rating < 1 || rating > 5) {
      return res.status(400).send('Rating must be between 1 and 5.');
    }

    // Create a new feedback document
    await Feedback.create({ name, email, message, rating, role });

    // Redirect back to the feedback list page
    res.redirect('/feedbacks');
  } catch (error) {
    console.error('🔥 Error saving feedback:', error);
    res.status(500).send('Internal Server Error');
  }
});
*/
router.post('/feedbacks', async (req, res) => {
  const { name, email, message, rating, role } = req.body;

  // Validate that the required fields are present
  if (!name || !email || !message || !rating || !role) {
    return res.status(400).send('All fields are required.');
  }

  // Validate that rating is between 1 and 5
  if (rating < 1 || rating > 5) {
    return res.status(400).send('Rating must be between 1 and 5.');
  }

  // Optionally, validate the email format using a simple regex (could be more complex if needed)
  const emailRegex = /^[a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,4}$/;
  if (!emailRegex.test(email)) {
    return res.status(400).send('Invalid email format.');
  }

  try {
    // Create a new feedback document
    await Feedback.create({ name, email, message, rating, role });

    // Redirect back to the feedback list page
    res.redirect('/feedbacks');
  } catch (error) {
    console.error('🔥 Error saving feedback:', error);
    res.status(500).send('Internal Server Error');
  }
});


module.exports = router;
