const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const productSchema = new Schema({
    productName: {
        type: String,
        required: true,
        trim: true,
    },
    sub_category_id: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'SubCategory', 
        required: true,
    },
    productImage: {
        type: String,
        required: true, 
    },
    created_at: {
        type: Date,
        default: Date.now,
    },
    updated_at: {
        type: Date,
        default: Date.now,
    },
}, { collection: 'products' });

// Update `updated_at` before save
productSchema.pre('save', function (next) {
    this.updated_at = Date.now();
    next();
});

productSchema.pre('findOneAndUpdate', function (next) {
    this.set({ updated_at: Date.now() });
    next();
});

module.exports = mongoose.model('Product', productSchema);
