const User = require('../models/User');
const Food = require('../models/Food');
const Request = require('../models/Request');
const Notification = require('../models/Notification');
const fs = require('fs');
const path = require('path');

// Admin dashboard
exports.getDashboard = async (req, res) => {
  try {
    // Count total users by role
    const totalUsers = await User.countDocuments();
    const totalDonors = await User.countDocuments({ role: 'donor' });
    const totalReceivers = await User.countDocuments({ role: 'receiver' });
    
    // Count foods by status
    const totalFoods = await Food.countDocuments();
    const availableFoods = await Food.countDocuments({ status: 'available' });
    const reservedFoods = await Food.countDocuments({ status: 'reserved' });
    const completedFoods = await Food.countDocuments({ status: 'completed' });
    
    // Count requests by status
    const totalRequests = await Request.countDocuments();
    const pendingRequests = await Request.countDocuments({ status: 'pending' });
    const approvedRequests = await Request.countDocuments({ status: 'approved' });
    const completedRequests = await Request.countDocuments({ status: 'completed' });
    
    // Get recent users
    const recentUsers = await User.find()
      .sort({ joinedDate: -1 })
      .limit(5);
    
    // Get recent food listings
    const recentFoods = await Food.find()
      .sort({ createdAt: -1 })
      .limit(5)
      .populate('donor', 'name');
    
    // Get recent requests
    const recentRequests = await Request.find()
      .sort({ createdAt: -1 })
      .limit(5)
      .populate('donor', 'name')
      .populate('receiver', 'name')
      .populate('food', 'title');
    
    res.render('dashboard/admin', {
      title: 'Admin Dashboard',
      user: req.user,
      stats: {
        users: {
          total: totalUsers,
          donors: totalDonors,
          receivers: totalReceivers
        },
        foods: {
          total: totalFoods,
          available: availableFoods,
          reserved: reservedFoods,
          completed: completedFoods
        },
        requests: {
          total: totalRequests,
          pending: pendingRequests,
          approved: approvedRequests,
          completed: completedRequests
        }
      },
      recentUsers,
      recentFoods,
      recentRequests
    });
  } catch (err) {
    console.error(err);
    req.flash('error_msg', 'Failed to load dashboard data');
    res.redirect('/admin/dashboard');
  }
};

// Get all users
exports.getUsers = async (req, res) => {
  try {
    // Pagination
    const page = parseInt(req.query.page) || 1;
    const limit = 20;
    const skip = (page - 1) * limit;
    
    // Filtering
    const filter = {};
    if (req.query.role) {
      filter.role = req.query.role;
    }
    if (req.query.search) {
      filter.$or = [
        { name: { $regex: req.query.search, $options: 'i' } },
        { email: { $regex: req.query.search, $options: 'i' } }
      ];
    }
    
    const totalUsers = await User.countDocuments(filter);
    const totalPages = Math.ceil(totalUsers / limit);
    
    const users = await User.find(filter)
      .sort({ joinedDate: -1 })
      .skip(skip)
      .limit(limit);
    
    res.render('admin/users', {
      title: 'User Management',
      users,
      page,
      totalPages,
      filter: {
        role: req.query.role || 'all',
        search: req.query.search || ''
      },
      user: req.user
    });
  } catch (err) {
    console.error(err);
    req.flash('error_msg', 'Failed to load users');
    res.redirect('/admin/dashboard');
  }
};

// Get user details
exports.getUser = async (req, res) => {
  try {
    const userDetails = await User.findById(req.params.id);
    
    if (!userDetails) {
      req.flash('error_msg', 'User not found');
      return res.redirect('/admin/users');
    }
    
    // Get user's activity
    const foodCount = await Food.countDocuments({ donor: userDetails._id });
    const requestsMade = await Request.countDocuments({ receiver: userDetails._id });
    const requestsReceived = await Request.countDocuments({ donor: userDetails._id });
    
    res.render('admin/user-detail', {
      title: 'User Details',
      userDetails,
      activity: {
        foodCount,
        requestsMade,
        requestsReceived
      },
      user: req.user
    });
  } catch (err) {
    console.error(err);
    req.flash('error_msg', 'Failed to load user details');
    res.redirect('/admin/users');
  }
};

// Update user
exports.updateUser = async (req, res) => {
  try {
    const { name, email, role, isVerified } = req.body;
    
    const userToUpdate = await User.findById(req.params.id);
    
    if (!userToUpdate) {
      req.flash('error_msg', 'User not found');
      return res.redirect('/admin/users');
    }
    
    // Update fields
    userToUpdate.name = name;
    userToUpdate.email = email;
    userToUpdate.role = role;
    userToUpdate.isVerified = isVerified === 'on' || isVerified === true;
    
    await userToUpdate.save();
    
    req.flash('success_msg', 'User updated successfully');
    res.redirect(`/admin/users/${req.params.id}`);
  } catch (err) {
    console.error(err);
    req.flash('error_msg', 'Failed to update user');
    res.redirect(`/admin/users/${req.params.id}`);
  }
};

// Delete user
exports.deleteUser = async (req, res) => {
  try {
    const user = await User.findById(req.params.id);

    if (!user) {
      req.flash('error_msg', 'User not found');
      return res.redirect('/admin/users');
    }

    // Prevent self-deletion
    if (req.user && user._id.toString() === req.user._id.toString()) {
      req.flash('error_msg', 'You cannot delete your own account');
      return res.redirect('/admin/users');
    }

    // Delete profile image
    if (user.profileImage && user.profileImage !== 'default-profile.png') {
      const imagePath = path.join(__dirname, '../public/uploads/profiles', user.profileImage);
      fs.unlink(imagePath, err => {
        if (err) console.error(`Failed to delete profile image: ${err}`);
      });
    }

    // Delete food listings and their images
    const foods = await Food.find({ donor: user._id });

    for (const food of foods) {
      if (food.images && food.images.length) {
        for (const filename of food.images) {
          const imagePath = path.join(__dirname, '../public/uploads/foods', filename);
          fs.unlink(imagePath, err => {
            if (err) console.error(`Failed to delete food image: ${err}`);
          });
        }
      }
    }

    // Delete food entries, requests, and notifications
    await Food.deleteMany({ donor: user._id });
    await Request.deleteMany({ $or: [{ donor: user._id }, { receiver: user._id }] });
    await Notification.deleteMany({ recipient: user._id });

    // Finally, delete the user
    await user.deleteOne();

    req.flash('success_msg', 'User deleted successfully');
    res.redirect('/admin/users');
  } catch (err) {
    console.error('Error deleting user:', err);
    req.flash('error_msg', 'Failed to delete user');
    res.redirect('/admin/users');
  }
};


// Get all food listings
exports.getFoods = async (req, res) => {
  try {
    // Pagination
    const page = parseInt(req.query.page) || 1;
    const limit = 20;
    const skip = (page - 1) * limit;
    
    // Filtering
    const filter = {};
    if (req.query.status) {
      filter.status = req.query.status;
    }
    if (req.query.search) {
      filter.$text = { $search: req.query.search };
    }
    
    const totalFoods = await Food.countDocuments(filter);
    const totalPages = Math.ceil(totalFoods / limit);
    
    const foods = await Food.find(filter)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .populate('donor', 'name');
    
    res.render('admin/foods', {
      title: 'Food Listings Management',
      foods,
      page,
      totalPages,
      filter: {
        status: req.query.status || 'all',
        search: req.query.search || ''
      },
      user: req.user
    });
  } catch (err) {
    console.error(err);
    req.flash('error_msg', 'Failed to load food listings');
    res.redirect('/admin/dashboard');
  }
};

// Get food details
exports.getFood = async (req, res) => {
  try {
    const food = await Food.findById(req.params.id)
      .populate('donor', 'name email phone');
    
    if (!food) {
      req.flash('error_msg', 'Food listing not found');
      return res.redirect('/admin/foods');
    }
    
    // Get associated requests
    const requests = await Request.find({ food: food._id })
      .populate('receiver', 'name email')
      .sort({ createdAt: -1 });
    
    res.render('admin/food-detail', {
      title: 'Food Listing Details',
      food,
      requests,
      user: req.user
    });
  } catch (err) {
    console.error(err);
    req.flash('error_msg', 'Failed to load food details');
    res.redirect('/admin/foods');
  }
};

// Moderate food listing
exports.moderateFood = async (req, res) => {
  try {
    const { isApproved } = req.body;
    
    const food = await Food.findById(req.params.id);
    
    if (!food) {
      req.flash('error_msg', 'Food listing not found');
      return res.redirect('/admin/foods');
    }
    
    // Update approval status
    food.isApproved = isApproved === 'true';
    await food.save();
    
    // Notify donor
    await new Notification({
      recipient: food.donor,
      type: 'system',
      message: food.isApproved
        ? `Your food listing "${food.title}" has been approved`
        : `Your food listing "${food.title}" has been disapproved by an administrator`,
      relatedTo: {
        model: 'Food',
        id: food._id
      },
      url: `/donor/foods`
    }).save();
    
    req.flash('success_msg', `Food listing ${food.isApproved ? 'approved' : 'disapproved'} successfully`);
    res.redirect('/admin/foods');
  } catch (err) {
    console.error(err);
    req.flash('error_msg', 'Failed to moderate food listing');
    res.redirect('/admin/foods');
  }
};

// Delete food listing

exports.deleteFood = async (req, res) => {
  try {
    const food = await Food.findById(req.params.id);

    if (!food) {
      req.flash('error_msg', 'Food listing not found');
      return res.redirect('/admin/foods');
    }

    // Delete associated requests
    await Request.deleteMany({ food: food._id });

    // Delete associated images
    if (food.images && food.images.length > 0) {
      for (const filename of food.images) {
        const imagePath = path.join(__dirname, '../public/uploads/foods', filename);
        try {
          await fs.unlink(imagePath);
        } catch (err) {
          console.error(`Failed to delete image '${filename}':`, err);
        }
      }
    }

    // Notify donor (if exists)
    if (food.donor) {
      await new Notification({
        recipient: food.donor,
        type: 'system',
        message: `Your food listing "${food.title}" has been removed by an administrator.`,
        relatedTo: {
          model: 'User',
          id: food.donor
        },
        url: '/donor/foods'
      }).save();
    }

    // Delete the food listing
    await food.deleteOne();

    req.flash('success_msg', 'Food listing deleted successfully');
    res.redirect('/admin/foods');
  } catch (err) {
    console.error('Error deleting food listing:', err);
    req.flash('error_msg', 'Failed to delete food listing');
    res.redirect('/admin/foods');
  }
};
// Get all requests
exports.getRequests = async (req, res) => {
  try {
    // Pagination
    const page = parseInt(req.query.page) || 1;
    const limit = 20;
    const skip = (page - 1) * limit;
    
    // Filtering
    const filter = {};
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
      .populate('receiver', 'name')
      .populate('food', 'title');
    
    res.render('admin/requests', {
      title: 'Request Management',
      requests,
      page,
      totalPages,
      filter: {
        status: req.query.status || 'all'
      },
      user: req.user
    });
  } catch (err) {
    console.error(err);
    req.flash('error_msg', 'Failed to load requests');
    res.redirect('/admin/dashboard');
  }
};

// Get request details
exports.getRequest = async (req, res) => {
  try {
    const request = await Request.findById(req.params.id)
      .populate('donor', 'name email phone')
      .populate('receiver', 'name email phone')
      .populate('food');
    
    if (!request) {
      req.flash('error_msg', 'Request not found');
      return res.redirect('/admin/requests');
    }
    
    res.render('admin/request-detail', {
      title: 'Request Details',
      request,
      user: req.user
    });
  } catch (err) {
    console.error(err);
    req.flash('error_msg', 'Failed to load request details');
    res.redirect('/admin/requests');
  }
};

// Moderate request
exports.moderateRequest = async (req, res) => {
  try {
    const { status } = req.body;
    
    const request = await Request.findById(req.params.id);
    
    if (!request) {
      req.flash('error_msg', 'Request not found');
      return res.redirect('/admin/requests');
    }
    
    // Update status
    request.status = status;
    await request.save();
    
    // Update food status if needed
    if (status === 'approved') {
      await Food.findByIdAndUpdate(request.food, {
        status: 'reserved',
        receiverId: request.receiver
      });
    } else if (status === 'completed') {
      await Food.findByIdAndUpdate(request.food, {
        status: 'completed'
      });
    } else if (status === 'rejected' || status === 'cancelled') {
      const food = await Food.findById(request.food);
      if (food.status === 'reserved' && food.receiverId.toString() === request.receiver.toString()) {
        food.status = 'available';
        food.receiverId = null;
        await food.save();
      }
    }
    
    // Notify both donor and receiver
    const message = `Your food request status has been updated to "${status}" by an administrator`;
    
    await Promise.all([
      new Notification({
        recipient: request.donor,
        type: 'system',
        message,
        relatedTo: {
          model: 'Request',
          id: request._id
        },
        url: `/donor/requests/${request._id}`
      }).save(),
      
      new Notification({
        recipient: request.receiver,
        type: 'system',
        message,
        relatedTo: {
          model: 'Request',
          id: request._id
        },
        url: `/receiver/requests/${request._id}`
      }).save()
    ]);
    
    req.flash('success_msg', 'Request status updated successfully');
    res.redirect('/admin/requests');
  } catch (err) {
    console.error(err);
    req.flash('error_msg', 'Failed to update request status');
    res.redirect('/admin/requests');
  }
};

// Send system notifications
exports.sendNotification = async (req, res) => {
  try {
    const { recipientType, message } = req.body;
    
    // Validate message
    if (!message || message.trim() === '') {
      req.flash('error_msg', 'Message cannot be empty');
      return res.redirect('/admin/dashboard');
    }
    
    // Determine recipients
    let filter = {};
    if (recipientType === 'donors') {
      filter.role = 'donor';
    } else if (recipientType === 'receivers') {
      filter.role = 'receiver';
    }
    
    // Find recipients
    const recipients = await User.find(filter);
    
    // Create notifications for each recipient
    const notifications = recipients.map(recipient => ({
      recipient: recipient._id,
      type: 'system',
      message,
      relatedTo: {
        model: 'User',
        id: req.user._id
      },
      url: '/notifications'
    }));
    
    // Save notifications in bulk
    await Notification.insertMany(notifications);
    
    req.flash('success_msg', `Notification sent to ${recipients.length} user(s)`);
    res.redirect('/admin/dashboard');
  } catch (err) {
    console.error(err);
    req.flash('error_msg', 'Failed to send notifications');
    res.redirect('/admin/dashboard');
  }
};

// Get system statistics
exports.getStats = async (req, res) => {
  try {
    // Time range filter
    const timeRange = req.query.timeRange || 'all';
    let dateFilter = {};
    
    if (timeRange !== 'all') {
      const now = new Date();
      let startDate;
      
      switch (timeRange) {
        case 'today':
          startDate = new Date(now.setHours(0, 0, 0, 0));
          break;
        case 'week':
          startDate = new Date(now.setDate(now.getDate() - 7));
          break;
        case 'month':
          startDate = new Date(now.setMonth(now.getMonth() - 1));
          break;
        case 'year':
          startDate = new Date(now.setFullYear(now.getFullYear() - 1));
          break;
      }
      
      dateFilter = { createdAt: { $gte: startDate } };
    }
    
    // User statistics
    const userStats = {
      total: await User.countDocuments(),
      donors: await User.countDocuments({ role: 'donor' }),
      receivers: await User.countDocuments({ role: 'receiver' }),
      newUsers: await User.countDocuments({
        ...dateFilter
      })
    };
    
    // Food statistics
    const foodStats = {
      total: await Food.countDocuments(),
      available: await Food.countDocuments({ status: 'available' }),
      reserved: await Food.countDocuments({ status: 'reserved' }),
      completed: await Food.countDocuments({ status: 'completed' }),
      expired: await Food.countDocuments({ status: 'expired' }),
      newListings: await Food.countDocuments({
        ...dateFilter
      })
    };
    
    // Request statistics
    const requestStats = {
      total: await Request.countDocuments(),
      pending: await Request.countDocuments({ status: 'pending' }),
      approved: await Request.countDocuments({ status: 'approved' }),
      completed: await Request.countDocuments({ status: 'completed' }),
      rejected: await Request.countDocuments({ status: 'rejected' }),
      cancelled: await Request.countDocuments({ status: 'cancelled' }),
      newRequests: await Request.countDocuments({
        ...dateFilter
      })
    };
    
    res.render('admin/stats', {
      title: 'System Statistics',
      timeRange,
      userStats,
      foodStats,
      requestStats,
      user: req.user
    });
  } catch (err) {
    console.error(err);
    req.flash('error_msg', 'Failed to load statistics');
    res.redirect('/admin/dashboard');
  }
};

// Get system logs
exports.getLogs = (req, res) => {
  // In a real implementation, this would retrieve system logs
  // For this example, we'll just render a placeholder page
  res.render('admin/logs', {
    title: 'System Logs',
    logs: [],
    user: req.user
  });
};


