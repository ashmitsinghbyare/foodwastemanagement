const mongoose = require('mongoose');
const Schema = mongoose.Schema;

// Define the Article schema
const categorySchema = new Schema({
  name: { type: String, required: true },
  description: { type: String },
  articles: [{ type: Schema.Types.ObjectId, ref: 'Article' }]  // Reference to Article model
});

module.exports = mongoose.model('Category', categorySchema);
