const mongoose = require('mongoose');

const foodPartnerSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true, // Restaurant / Business name
    trim: true
  },

  contactName: {
    type: String,
    required: true, // Owner / Contact person name
    trim: true
  },

  email: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
    trim: true
  },

  phone: {
    type: String,
    required: true,
    trim: true
  },

  address: {
    type: String,
    required: true,
    trim: true
  },

  password: {
    type: String,
    required: true
  }

}, {
  timestamps: true
});

const foodPartnerModel = mongoose.model("foodpartner", foodPartnerSchema);

module.exports = foodPartnerModel;
