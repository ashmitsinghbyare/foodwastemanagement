const mongoose = require('mongoose');
const Schema = mongoose.Schema;

// Define the Article schema
const articleSchema = new Schema({
  title: { type: String, required: true },
  content: { type: String, required: true },
  category: { type: Schema.Types.ObjectId, ref: 'Category' }  // Reference to Category model
});

module.exports = mongoose.model('Article', articleSchema);
