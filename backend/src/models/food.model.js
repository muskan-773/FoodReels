const mongoose = require('mongoose');

const foodSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true,
  },
  video: {
    type: String,
    required: true,
    trim: true,
  },
  description: {
    type: String,
    default: '',
    trim: true,
  },
  cuisine: {
    type: String,
    default: 'General',
    trim: true,
  },
  dietaryTags: {
    type: [String],
    default: [],
  },
  price: {
    type: Number,
    default: 0,
    min: 0,
  },
  foodPartner: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'foodpartner',
    required: true,
  },
  likeCount: {
    type: Number,
    default: 0,
    min: 0,
  },
  savesCount: {
    type: Number,
    default: 0,
    min: 0,
  },
  commentsCount: {
    type: Number,
    default: 0,
    min: 0,
  },
}, { timestamps: true });

// Text search index for fast text searches
foodSchema.index({ name: 'text', description: 'text', cuisine: 'text' });

const foodModel = mongoose.model('food', foodSchema);
module.exports = foodModel;
