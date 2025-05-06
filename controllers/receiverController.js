const Food = require('../models/Food');
const Request = require('../models/Request');
const Notification = require('../models/Notification');
const User = require('../models/User');

// Get receiver dashboard
exports.getDashboard = async (req, res) => {
  try {
    // Get receiver's statistics
    const pendingRequests = await Request.countDocuments({
      receiver: req.user._id,
      status: 'pending'
    });
    
    const approvedRequests = await Request.countDocuments({
      receiver: req.user._id,
      status: 'approved'
    });
    
    const completedRequests = await Request.countDocuments({
      receiver: req.user._id,
      status: 'completed'
    });
    
    // Get recent food listings
    const recentFoods = await Food.find({ 
      status: 'available',
      expiryDate: { $gt: new Date() }
    })
    .sort({ createdAt: -1 })
    .limit(6)
    .populate('donor', 'name');
    
    // Get receiver's requests
    const recentRequests = await Request.find({ receiver: req.user._id })
      .sort({ createdAt: -1 })
      .limit(5)
      .populate('donor', 'name')
      .populate('food', 'title images');
    
    // Get unread notifications count
    const unreadNotifications = await Notification.countDocuments({
      recipient: req.user._id,
      isRead: false
    });
    
    res.render('dashboard/receiver', {
      title: 'Receiver Dashboard',
      user: req.user,
      stats: {
        pendingRequests,
        approvedRequests,
        completedRequests,
        unreadNotifications
      },
      recentFoods,
      recentRequests
    });
  } catch (err) {
    console.error(err);
    req.flash('error_msg', 'Failed to load dashboard');
    res.redirect('/');
  }
};

// Browse available foods
exports.browseFoods = async (req, res) => {
  try {
    // Pagination
    const page = parseInt(req.query.page) || 1;
    const limit = 12;
    const skip = (page - 1) * limit;
    
    // Filtering
    const filter = { 
      status: 'available',
      expiryDate: { $gt: new Date() }
    };
    
    if (req.query.category) {
      filter.category = req.query.category;
    }
    
    // Sorting
    let sort = { createdAt: -1 }; // Default: newest first
    if (req.query.sort === 'expiry') {
      sort = { expiryDate: 1 }; // Expiring soon
    }
    
    const totalFoods = await Food.countDocuments(filter);
    const totalPages = Math.ceil(totalFoods / limit);
    
    const foods = await Food.find(filter)
      .sort(sort)
      .skip(skip)
      .limit(limit)
      .populate('donor', 'name');
    
    // Get categories for filter options
    const categories = [
      'cooked food', 'raw food', 'packaged food', 
      'fruits', 'vegetables', 'bread', 'dairy', 'other'
    ];
    
    res.render('food/list', {
      title: 'Available Foods',
      foods,
      page,
      totalPages,
      category: req.query.category || 'all',
      sort: req.query.sort || 'newest',
      categories,
      user: req.user,
      viewType: 'browse'
    });
  } catch (err) {
    console.error(err);
    req.flash('error_msg', 'Failed to load food listings');
    res.redirect('/receiver/dashboard');
  }
};

// Search food listings
exports.searchFoods = async (req, res) => {
  try {
    const searchQuery = req.query.q;
    
    if (!searchQuery) {
      return res.redirect('/receiver/browse');
    }
    
    // Pagination
    const page = parseInt(req.query.page) || 1;
    const limit = 12;
    const skip = (page - 1) * limit;
    
    // Search filter
    const filter = {
      $text: { $search: searchQuery },
      status: 'available',
      expiryDate: { $gt: new Date() }
    };
    
    const totalFoods = await Food.countDocuments(filter);
    const totalPages = Math.ceil(totalFoods / limit);
    
    const foods = await Food.find(filter, { score: { $meta: 'textScore' } })
      .sort({ score: { $meta: 'textScore' } })
      .skip(skip)
      .limit(limit)
      .populate('donor', 'name');
    
    // Get categories for filter options
    const categories = [
      'cooked food', 'raw food', 'packaged food', 
      'fruits', 'vegetables', 'bread', 'dairy', 'other'
    ];
    
    res.render('food/list', {
      title: `Search Results for "${searchQuery}"`,
      foods,
      page,
      totalPages,
      searchQuery,
      categories,
      user: req.user,
      viewType: 'search'
    });
  } catch (err) {
    console.error(err);
    req.flash('error_msg', 'Failed to search food listings');
    res.redirect('/receiver/browse');
  }
};

// Get food details
exports.getFoodDetails = async (req, res) => {
  try {
    const food = await Food.findOne({
      _id: req.params.id,
      status: 'available',
      expiryDate: { $gt: new Date() }
    }).populate('donor', 'name organization');
    
    if (!food) {
      req.flash('error_msg', 'Food listing not found or no longer available');
      return res.redirect('/receiver/browse');
    }
    
    // Check if user has already requested this food
    let existingRequest = null;
    if (req.isAuthenticated()) {
      existingRequest = await Request.findOne({
        food: food._id,
        receiver: req.user._id
      });
    }
    
    res.render('food/detail', {
      title: food.title,
      food,
      existingRequest,
      user: req.user
    });
  } catch (err) {
    console.error(err);
    req.flash('error_msg', 'Failed to load food details');
    res.redirect('/receiver/browse');
  }
};

// Request food
exports.requestFood = async (req, res) => {
  try {
    const food = await Food.findOne({
      _id: req.params.id,
      status: 'available',
      expiryDate: { $gt: new Date() }
    });
    
    if (!food) {
      req.flash('error_msg', 'Food listing not found or no longer available');
      return res.redirect('/receiver/browse');
    }
    
    // Check if user has already requested this food
    const existingRequest = await Request.findOne({
      food: food._id,
      receiver: req.user._id
    });
    
    if (existingRequest) {
      req.flash('error_msg', 'You have already requested this food');
      return res.redirect(`/receiver/foods/${food._id}`);
    }
    
    // Create new request
    const newRequest = new Request({
      food: food._id,
      receiver: req.user._id,
      donor: food.donor,
      message: req.body.message
    });
    
    await newRequest.save();
    
    // Create notification for donor
    try {
      const notificationHelper = require('../utils/notificationHelper');
      await notificationHelper.createNotification({
        recipientId: food.donor,
        type: 'request_received',
        message: `${req.user.name} has requested your food listing: "${food.title}"`,
        relatedTo: {
          model: 'Request',
          id: newRequest._id
        },
        url: `/donor/requests/${newRequest._id}`
      });
      console.log('Notification sent to donor:', food.donor);
    } catch (notifyError) {
      console.error('Error creating notification:', notifyError);
      // Continue with the request process even if notification fails
    }
    
    req.flash('success_msg', 'Food request submitted successfully');
    res.redirect('/receiver/requests');
  } catch (err) {
    console.error(err);
    req.flash('error_msg', 'Failed to submit food request');
    res.redirect(`/receiver/foods/${req.params.id}`);
  }
};

// Get my requests
exports.getMyRequests = async (req, res) => {
  try {
    // Pagination
    const page = parseInt(req.query.page) || 1;
    const limit = 10;
    const skip = (page - 1) * limit;
    
    // Filtering
    const filter = { receiver: req.user._id };
    if (req.query.status) {
      filter.status = req.query.status;
    }
    
    const totalRequests = await Request.countDocuments(filter);
    const totalPages = Math.ceil(totalRequests / limit);
    
    const requests = await Request.find(filter)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .populate('donor', 'name')
      .populate('food', 'title images');
    
    res.render('receiver/requests', {
      title: 'My Requests',
      requests,
      page,
      totalPages,
      status: req.query.status || 'all',
      user: req.user
    });
  } catch (err) {
    console.error(err);
    req.flash('error_msg', 'Failed to load requests');
    res.redirect('/receiver/dashboard');
  }
};

// View single request
exports.getRequest = async (req, res) => {
  try {
    const request = await Request.findOne({
      _id: req.params.id,
      receiver: req.user._id
    })
    .populate('donor', 'name email phone profileImage address organization bio')
    .populate('food');
    
    if (!request) {
      req.flash('error_msg', 'Request not found');
      return res.redirect('/receiver/requests');
    }
    
    res.render('receiver/request-detail', {
      title: 'Request Details',
      request,
      user: req.user
    });
  } catch (err) {
    console.error(err);
    req.flash('error_msg', 'Failed to load request details');
    res.redirect('/receiver/requests');
  }
};

// Cancel request
exports.cancelRequest = async (req, res) => {
  try {
    const request = await Request.findOne({
      _id: req.params.id,
      receiver: req.user._id,
      status: 'pending'
    });
    
    if (!request) {
      req.flash('error_msg', 'Request not found or cannot be cancelled');
      return res.redirect('/receiver/requests');
    }
    
    // Update request status
    request.status = 'cancelled';
    await request.save();
    
    // Create notification for donor
    try {
      const notificationHelper = require('../utils/notificationHelper');
      const foodItem = await Food.findById(request.food);
      
      await notificationHelper.createNotification({
        recipientId: request.donor,
        type: 'system',
        message: `${req.user.name} has cancelled their request for "${foodItem ? foodItem.title : 'food'}"`,
        relatedTo: {
          model: 'Request',
          id: request._id
        },
        url: `/donor/requests/${request._id}`
      });
    } catch (notifyError) {
      console.error('Error creating cancellation notification:', notifyError);
      // Continue with the request process even if notification fails
    }
    
    req.flash('success_msg', 'Request cancelled successfully');
    res.redirect('/receiver/requests');
  } catch (err) {
    console.error(err);
    req.flash('error_msg', 'Failed to cancel request');
    res.redirect('/receiver/requests');
  }
};

// Confirm pickup
exports.confirmPickup = async (req, res) => {
  try {
    const request = await Request.findOne({
      _id: req.params.id,
      receiver: req.user._id,
      status: 'approved'
    });
    
    if (!request) {
      req.flash('error_msg', 'Request not found or cannot be confirmed');
      return res.redirect('/receiver/requests');
    }
    
    // Update request
    request.pickupConfirmed = true;
    await request.save();
    
    // Create notification for donor
    try {
      const notificationHelper = require('../utils/notificationHelper');
      const foodItem = await Food.findById(request.food);
      
      await notificationHelper.createNotification({
        recipientId: request.donor,
        type: 'pickup_confirmed',
        message: `${req.user.name} has confirmed pickup for "${foodItem ? foodItem.title : 'food'}"`,
        relatedTo: {
          model: 'Request',
          id: request._id
        },
        url: `/donor/requests/${request._id}`
      });
    } catch (notifyError) {
      console.error('Error creating pickup confirmation notification:', notifyError);
      // Continue with the request process even if notification fails
    }
    
    req.flash('success_msg', 'Pickup confirmed successfully');
    res.redirect('/receiver/requests');
  } catch (err) {
    console.error(err);
    req.flash('error_msg', 'Failed to confirm pickup');
    res.redirect('/receiver/requests');
  }
};

// Leave feedback for donor
exports.leaveFeedback = async (req, res) => {
  try {
    const { rating, feedback } = req.body;
    
    if (!rating || rating < 1 || rating > 5) {
      req.flash('error_msg', 'Please provide a valid rating (1-5)');
      return res.redirect(`/receiver/requests/${req.params.id}`);
    }
    
    const request = await Request.findOne({
      _id: req.params.id,
      receiver: req.user._id,
      status: 'completed'
    });
    
    if (!request) {
      req.flash('error_msg', 'Request not found or feedback cannot be provided at this time');
      return res.redirect('/receiver/requests');
    }
    
    // Update request with feedback
    request.receiverRating = rating;
    request.receiverFeedback = feedback;
    await request.save();
    
    req.flash('success_msg', 'Feedback submitted successfully');
    res.redirect('/receiver/requests');
  } catch (err) {
    console.error(err);
    req.flash('error_msg', 'Failed to submit feedback');
    res.redirect(`/receiver/requests/${req.params.id}`);
  }
};

// Get notifications
exports.getNotifications = async (req, res) => {
  try {
    const notifications = await Notification.find({
      recipient: req.user._id
    })
    .sort({ createdAt: -1 })
    .limit(50);
    
    res.render('notifications', {
      title: 'My Notifications',
      notifications,
      user: req.user
    });
  } catch (err) {
    console.error(err);
    req.flash('error_msg', 'Failed to load notifications');
    res.redirect('/receiver/dashboard');
  }
};

// Mark notification as read
exports.markNotificationRead = async (req, res) => {
  try {
    const notification = await Notification.findOne({
      _id: req.params.id,
      recipient: req.user._id
    });
    
    if (!notification) {
      return res.status(404).json({ success: false, message: 'Notification not found' });
    }
    
    notification.isRead = true;
    await notification.save();
    
    res.status(200).json({ success: true });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};
