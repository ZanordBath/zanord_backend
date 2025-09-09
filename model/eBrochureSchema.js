const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const eBrochureSchema = new Schema({
  cover_image: {
    type: String,
    required: true // The cover image URL is required
  },
  pdf_file: {
    type: String,
    required: true // The PDF file URL is required
  },
  created_at: {
    type: Date,
    default: Date.now
  }
}, { collection: 'e_brochures' }); // Specify the collection name

module.exports = mongoose.model('EBrochure', eBrochureSchema);