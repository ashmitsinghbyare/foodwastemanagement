const mongoose = require('mongoose');

// HelpArticle Schema
const helpArticleSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,  // Title is required
    unique: true,    // Ensure the title is unique
  },
  content: {
    type: String,
    required: true,  // Content is required
  },
  createdAt: {
    type: Date,
    default: Date.now, // Default to the current date
  },
  updatedAt: {
    type: Date,
    default: Date.now, // Default to the current date
  }
});

// HelpCategory Schema
const helpCategorySchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,  // Name is required
    unique: true,    // Ensure category name is unique
  },
  articles: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'HelpArticle',  // Reference to HelpArticle model
  }],
}, {
  timestamps: true,  // Automatically add createdAt and updatedAt fields
});

module.exports = mongoose.model('HelpCategory', helpCategorySchema);
