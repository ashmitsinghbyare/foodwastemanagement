const Food = require('../models/Food');
const Request = require('../models/Request');
const Notification = require('../models/Notification');
const User = require('../models/User');
const fs = require('fs');
const path = require('path');

// Get donor dashboard
exports.getDashboard = async (req, res) => {
  try {
    // Get donor's statistics
    const totalListings = await Food.countDocuments({ donor: req.user._id });
    const activeListings = await Food.countDocuments({ 
      donor: req.user._id, 
      status: 'available' 
    });
    const pendingRequests = await Request.countDocuments({
      donor: req.user._id,
      status: 'pending'
    });
    const completedDonations = await Request.countDocuments({
      donor: req.user._id,
      status: 'completed'
    });
    
    // Get recent listings
    const recentListings = await Food.find({ donor: req.user._id })
      .sort({ createdAt: -1 })
      .limit(5);
    
    // Get recent requests
    const recentRequests = await Request.find({ donor: req.user._id })
      .sort({ createdAt: -1 })
      .limit(5)
      .populate('receiver', 'name profileImage')
      .populate('food', 'title');
    
    // Get unread notifications count
    const unreadNotifications = await Notification.countDocuments({
      recipient: req.user._id,
      isRead: false
    });
    
    res.render('dashboard/donor', {
      title: 'Donor Dashboard',
      user: req.user,
      stats: {
        totalListings,
        activeListings,
        pendingRequests,
        completedDonations,
        unreadNotifications
      },
      recentListings,
      recentRequests
    });
  } catch (err) {
    console.error(err);
    req.flash('error_msg', 'Failed to load dashboard data');
    res.redirect('/');
  }
};

// Get donor's food listings
exports.getFoodListings = async (req, res) => {
  try {
    // Pagination
    const page = parseInt(req.query.page) || 1;
    const limit = 10;
    const skip = (page - 1) * limit;
    
    // Filtering
    const filter = { donor: req.user._id };
    if (req.query.status) {
      filter.status = req.query.status;
    }
    
    const totalListings = await Food.countDocuments(filter);
    const totalPages = Math.ceil(totalListings / limit);
    
    const foods = await Food.find(filter)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);
    
    res.render('food/list', {
      title: 'My Food Listings',
      foods,
      page,
      totalPages,
      status: req.query.status || 'all',
      user: req.user,
      viewType: null // Adding missing viewType parameter
    });
  } catch (err) {
    console.error(err);
    req.flash('error_msg', 'Failed to load food listings');
    res.redirect('/donor/dashboard');
  }
};

// Get create food page
exports.getCreateFood = (req, res) => {
  res.render('food/create', {
    title: 'Create Food Listing',
    user: req.user
  });
};

// Create new food listing
exports.postCreateFood = async (req, res) => {
  try {
    const {
      title,
      description,
      quantity,
      unit,
      category,
      expiryDate,
      pickupStreet,
      pickupCity,
      pickupState,
      pickupPostalCode,
      pickupCountry,
      pickupInstructions,
      availability
    } = req.body;
    
    // Parse availability array
    let availabilityArray = [];
    if (availability && typeof availability === 'string') {
      // Single availability entry
      const [day, timeRange] = availability.split('|');
      const [from, to] = timeRange.split('-');
      availabilityArray.push({ day, from, to });
    } else if (availability && availability.length) {
      // Multiple availability entries
      availabilityArray = availability.map(avail => {
        const [day, timeRange] = avail.split('|');
        const [from, to] = timeRange.split('-');
        return { day, from, to };
      });
    }
    
    // Process uploaded images
    const images = [];
    if (req.files && req.files.length > 0) {
      req.files.forEach(file => {
        images.push(file.filename);
      });
    }
    
    // Create new food listing
    const newFood = new Food({
      title,
      description,
      quantity,
      unit,
      category,
      expiryDate,
      images,
      donor: req.user._id,
      pickupDetails: {
        address: {
          street: pickupStreet,
          city: pickupCity,
          state: pickupState,
          postalCode: pickupPostalCode,
          country: pickupCountry
        },
        instructions: pickupInstructions,
        availability: availabilityArray
      }
    });
    
    await newFood.save();
    
    // Notify nearby receivers (in a real app, this would use geolocation)
    try {
      const notificationHelper = require('../utils/notificationHelper');
      const receivers = await User.find({ role: 'receiver' }).limit(10);
      
      // Create notifications for receivers if any receivers exist
      if (receivers && receivers.length > 0) {
        const notificationPromises = receivers.map(receiver => {
          return notificationHelper.createNotification({
            recipientId: receiver._id,
            type: 'food_listed',
            message: `New food available: ${title}`,
            relatedTo: {
              model: 'Food',
              id: newFood._id
            },
            url: `/receiver/foods/${newFood._id}`
          });
        });
        
        await Promise.all(notificationPromises);
        console.log(`Sent notifications to ${receivers.length} potential receivers`);
      }
    } catch (notifyErr) {
      // Log error but don't fail the entire operation
      console.error('Error sending notifications:', notifyErr);
    }
    
    req.flash('success_msg', 'Food listing created successfully');
    res.redirect('/donor/foods');
  } catch (err) {
    console.error(err);
    req.flash('error_msg', 'Failed to create food listing');
    res.redirect('/donor/foods/new');
  }
};

// Get edit food page
exports.getEditFood = async (req, res) => {
  try {
    const food = await Food.findOne({
      _id: req.params.id,
      donor: req.user._id
    });
    
    if (!food) {
      req.flash('error_msg', 'Food listing not found');
      return res.redirect('/donor/foods');
    }
    
    // Check if food can be edited (not already reserved or completed)
    if (food.status !== 'available' && food.status !== 'cancelled') {
      req.flash('error_msg', 'This food listing cannot be edited in its current state');
      return res.redirect('/donor/foods');
    }
    
    res.render('food/edit', {
      title: 'Edit Food Listing',
      food,
      user: req.user
    });
  } catch (err) {
    console.error(err);
    req.flash('error_msg', 'Failed to load food listing');
    res.redirect('/donor/foods');
  }
};

// Update food listing
exports.updateFood = async (req, res) => {
  try {
    const food = await Food.findOne({
      _id: req.params.id,
      donor: req.user._id
    });
    
    if (!food) {
      req.flash('error_msg', 'Food listing not found');
      return res.redirect('/donor/foods');
    }
    
    // Check if food can be edited
    if (food.status !== 'available' && food.status !== 'cancelled') {
      req.flash('error_msg', 'This food listing cannot be edited in its current state');
      return res.redirect('/donor/foods');
    }
    
    const {
      title,
      description,
      quantity,
      unit,
      category,
      expiryDate,
      pickupStreet,
      pickupCity,
      pickupState,
      pickupPostalCode,
      pickupCountry,
      pickupInstructions,
      availability,
      removeImages
    } = req.body;
    
    // Parse availability array
    let availabilityArray = [];
    if (availability && typeof availability === 'string') {
      // Single availability entry
      const [day, timeRange] = availability.split('|');
      const [from, to] = timeRange.split('-');
      availabilityArray.push({ day, from, to });
    } else if (availability && availability.length) {
      // Multiple availability entries
      availabilityArray = availability.map(avail => {
        const [day, timeRange] = avail.split('|');
        const [from, to] = timeRange.split('-');
        return { day, from, to };
      });
    }
    
    // Update food object
    food.title = title;
    food.description = description;
    food.quantity = quantity;
    food.unit = unit;
    food.category = category;
    food.expiryDate = expiryDate;
    food.pickupDetails.address = {
      street: pickupStreet,
      city: pickupCity,
      state: pickupState,
      postalCode: pickupPostalCode,
      country: pickupCountry
    };
    food.pickupDetails.instructions = pickupInstructions;
    food.pickupDetails.availability = availabilityArray;
    
    // Handle image removals
    if (removeImages && removeImages.length) {
      const imagesToRemove = Array.isArray(removeImages) ? removeImages : [removeImages];
      
      imagesToRemove.forEach(filename => {
        // Remove from database
        const imageIndex = food.images.indexOf(filename);
        if (imageIndex > -1) {
          food.images.splice(imageIndex, 1);
        }
        
        // Remove from filesystem
        const imagePath = path.join(__dirname, '../public/uploads/foods', filename);
        fs.unlink(imagePath, err => {
          if (err) console.error(`Failed to delete image: ${err}`);
        });
      });
    }
    
    // Add new images
    if (req.files && req.files.length > 0) {
      req.files.forEach(file => {
        food.images.push(file.filename);
      });
    }
    
    await food.save();
    
    req.flash('success_msg', 'Food listing updated successfully');
    res.redirect('/donor/foods');
  } catch (err) {
    console.error(err);
    req.flash('error_msg', 'Failed to update food listing');
    res.redirect(`/donor/foods/${req.params.id}/edit`);
  }
};

// Delete food listing
exports.deleteFood = async (req, res) => {
  try {
    const food = await Food.findOne({
      _id: req.params.id,
      donor: req.user._id
    });
    
    if (!food) {
      req.flash('error_msg', 'Food listing not found');
      return res.redirect('/donor/foods');
    }
    
    // Check if food can be deleted (not reserved or completed)
    if (food.status === 'reserved' || food.status === 'completed') {
      req.flash('error_msg', 'This food listing cannot be deleted in its current state');
      return res.redirect('/donor/foods');
    }
    
    // Delete associated requests
    await Request.deleteMany({ food: food._id });
    
    // Delete images from filesystem
    if (food.images && food.images.length) {
      food.images.forEach(filename => {
        const imagePath = path.join(__dirname, '../public/uploads/foods', filename);
        fs.unlink(imagePath, err => {
          if (err) console.error(`Failed to delete image: ${err}`);
        });
      });
    }
    
    // Delete food document
    await food.deleteOne();
    
    req.flash('success_msg', 'Food listing deleted successfully');
    res.redirect('/donor/foods');
  } catch (err) {
    console.error(err);
    req.flash('error_msg', 'Failed to delete food listing');
    res.redirect('/donor/foods');
  }
};

// Get requests for donor's food
exports.getRequests = async (req, res) => {
  try {
    // Pagination
    const page = parseInt(req.query.page) || 1;
    const limit = 10;
    const skip = (page - 1) * limit;
    
    // Filtering
    const filter = { donor: req.user._id };
    if (req.query.status) {
      filter.status = req.query.status;
    }
    
    const totalRequests = await Request.countDocuments(filter);
    const totalPages = Math.ceil(totalRequests / limit);
    
    const requests = await Request.find(filter)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .populate('receiver', 'name profileImage')
      .populate('food', 'title images');
    
    res.render('donor/requests', {
      title: 'Food Requests',
      requests,
      page,
      totalPages,
      status: req.query.status || 'all',
      user: req.user
    });
  } catch (err) {
    console.error(err);
    req.flash('error_msg', 'Failed to load requests');
    res.redirect('/donor/dashboard');
  }
};

// View single request
exports.getRequest = async (req, res) => {
  try {
    const request = await Request.findOne({
      _id: req.params.id,
      donor: req.user._id
    })
    .populate('receiver', 'name email phone profileImage address organization bio')
    .populate('food');
    
    if (!request) {
      req.flash('error_msg', 'Request not found');
      return res.redirect('/donor/requests');
    }
    
    res.render('donor/request-detail', {
      title: 'Request Details',
      request,
      user: req.user
    });
  } catch (err) {
    console.error(err);
    req.flash('error_msg', 'Failed to load request details');
    res.redirect('/donor/requests');
  }
};

// Approve request
exports.approveRequest = async (req, res) => {
  try {
    const request = await Request.findOne({
      _id: req.params.id,
      donor: req.user._id,
      status: 'pending'
    });
    
    if (!request) {
      req.flash('error_msg', 'Request not found or cannot be approved');
      return res.redirect('/donor/requests');
    }
    
    // Update request status
    request.status = 'approved';
    request.pickupTime = req.body.pickupTime || Date.now();
    await request.save();
    
    // Update food status
    await Food.findByIdAndUpdate(request.food, {
      status: 'reserved',
      receiverId: request.receiver
    });
    
    // Create notification for receiver
    try {
      const notificationHelper = require('../utils/notificationHelper');
      const foodItem = await Food.findById(request.food);
      
      await notificationHelper.createNotification({
        recipientId: request.receiver,
        type: 'request_approved',
        message: `Your request for "${foodItem ? foodItem.title : 'food'}" has been approved`,
        relatedTo: {
          model: 'Request',
          id: request._id
        },
        url: `/receiver/requests/${request._id}`
      });
    } catch (notifyErr) {
      console.error('Error sending approval notification:', notifyErr);
    }
    
    req.flash('success_msg', 'Request approved successfully');
    res.redirect('/donor/requests');
  } catch (err) {
    console.error(err);
    req.flash('error_msg', 'Failed to approve request');
    res.redirect('/donor/requests');
  }
};

// Reject request
exports.rejectRequest = async (req, res) => {
  try {
    const request = await Request.findOne({
      _id: req.params.id,
      donor: req.user._id,
      status: 'pending'
    });
    
    if (!request) {
      req.flash('error_msg', 'Request not found or cannot be rejected');
      return res.redirect('/donor/requests');
    }
    
    // Update request status
    request.status = 'rejected';
    await request.save();
    
    // Create notification for receiver
    try {
      const notificationHelper = require('../utils/notificationHelper');
      const foodItem = await Food.findById(request.food);
      
      await notificationHelper.createNotification({
        recipientId: request.receiver,
        type: 'request_rejected',
        message: `Your request for "${foodItem ? foodItem.title : 'food'}" has been rejected`,
        relatedTo: {
          model: 'Request',
          id: request._id
        },
        url: `/receiver/requests/${request._id}`
      });
    } catch (notifyErr) {
      console.error('Error sending rejection notification:', notifyErr);
    }
    
    req.flash('success_msg', 'Request rejected successfully');
    res.redirect('/donor/requests');
  } catch (err) {
    console.error(err);
    req.flash('error_msg', 'Failed to reject request');
    res.redirect('/donor/requests');
  }
};

// Complete request
exports.completeRequest = async (req, res) => {
  try {
    const request = await Request.findOne({
      _id: req.params.id,
      donor: req.user._id,
      status: 'approved'
    });
    
    if (!request) {
      req.flash('error_msg', 'Request not found or cannot be completed');
      return res.redirect('/donor/requests');
    }
    
    // Update request status
    request.status = 'completed';
    await request.save();
    
    // Update food status
    await Food.findByIdAndUpdate(request.food, { status: 'completed' });
    
    // Create notification for receiver
    try {
      const notificationHelper = require('../utils/notificationHelper');
      const foodItem = await Food.findById(request.food);
      
      await notificationHelper.createNotification({
        recipientId: request.receiver,
        type: 'completion',
        message: `Donation for "${foodItem ? foodItem.title : 'food'}" has been marked as completed`,
        relatedTo: {
          model: 'Request',
          id: request._id
        },
        url: `/receiver/requests/${request._id}`
      });
    } catch (notifyErr) {
      console.error('Error sending completion notification:', notifyErr);
    }
    
    req.flash('success_msg', 'Request marked as completed successfully');
    res.redirect('/donor/requests');
  } catch (err) {
    console.error(err);
    req.flash('error_msg', 'Failed to complete request');
    res.redirect('/donor/requests');
  }
};

// Leave feedback for receiver
exports.leaveFeedback = async (req, res) => {
  try {
    const { rating, feedback } = req.body;
    
    if (!rating || rating < 1 || rating > 5) {
      req.flash('error_msg', 'Please provide a valid rating (1-5)');
      return res.redirect(`/donor/requests/${req.params.id}`);
    }
    
    const request = await Request.findOne({
      _id: req.params.id,
      donor: req.user._id,
      status: 'completed'
    });
    
    if (!request) {
      req.flash('error_msg', 'Request not found or feedback cannot be provided at this time');
      return res.redirect('/donor/requests');
    }
    
    // Update request with feedback
    request.donorRating = rating;
    request.donorFeedback = feedback;
    await request.save();
    
    req.flash('success_msg', 'Feedback submitted successfully');
    res.redirect('/donor/requests');
  } catch (err) {
    console.error(err);
    req.flash('error_msg', 'Failed to submit feedback');
    res.redirect(`/donor/requests/${req.params.id}`);
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
    res.redirect('/donor/dashboard');
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
