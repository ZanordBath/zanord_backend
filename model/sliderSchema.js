const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const sliderSchema = new Schema({
  image: {
    type: String,
    default: null // Image URL can be null (optional)
  },
  title: {
    type: String,
    required: true,
    trim: true
  },
  description: {
    type: String,
    required: true,
    trim: true
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
}, { collection: 'slider' }); // Specify the collection name

module.exports = mongoose.model('Slider', sliderSchema);