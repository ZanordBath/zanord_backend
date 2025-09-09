const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const gallerySchema = new Schema({
  image: {
    type: String,
    required: true // The image URL is required
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
}, { collection: 'gallery' }); // Specify the collection name

module.exports = mongoose.model('Gallery', gallerySchema);