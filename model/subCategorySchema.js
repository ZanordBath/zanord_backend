const mongoose = require("mongoose");
const productSchema = require("./productSchema");
const { deleteFileFromCPanel } = require("../Controller/utils/sharedFunction");
const Schema = mongoose.Schema;

const subCategorySchema = new Schema({
    subCatImage: {
        type: String,
        required: true
    },
    subCatName: {
        type: String,
        required: true
    },
    main_category_id: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'category',
        required: true
    },
    created_at: {
        type: Date,
        default: Date.now
    },
    updated_at: {
        type: Date,
        default: Date.now,
    },
}, { collection: 'sub_category' })


subCategorySchema.pre('save', function (next) {
    this.updated_at = Date.now();
    next();
});

subCategorySchema.pre('findOneAndUpdate', function (next) {
    this.set({ updated_at: Date.now() });
    next();
});


subCategorySchema.pre('deleteOne', { document: true, query: false }, async function (next) {
    try {
        console.log(`Starting deletion process for SubCategory ${this._id}`);

        // Step 1: Find all Products linked to this SubCategory
        const products = await productSchema.find({ sub_category_id: this._id });
        console.log(`Found ${products.length} products for SubCategory ${this._id}`);
        console.log("products:", products);

        // Step 2: Delete Products and their images
        for (const product of products) {
            // Delete Product image if it exists
            if (product.productImage) {
                try {
                    console.log(`Attempting to delete image: ${product.productImage}`);
                    await deleteFileFromCPanel(product.productImage);
                    console.log(`Deleted image for Product ${product._id}: ${product.productImage}`);
                } catch (error) {
                    console.error(`Failed to delete image for Product ${product._id}:`, error.message);
                }
            }

            // Delete the Product itself
            try {
                await productSchema.findByIdAndDelete(product._id);
                console.log(`Deleted Product ${product._id}`);
            } catch (error) {
                console.error(`Failed to delete Product ${product._id}:`, error.message);
            }
        }

        // Step 3: Delete the SubCategory's image if it exists
        if (this.subCatImage) {
            try {
                console.log(`Attempting to delete image: ${this.subCatImage}`);
                await deleteFileFromCPanel(this.subCatImage);
                console.log(`Deleted SubCategory ${this._id} image: ${this.subCatImage}`);
            } catch (error) {
                console.error(`Failed to delete SubCategory ${this._id} image:`, error.message);
            }
        }

        console.log(`Completed deletion process for SubCategory ${this._id}. Deleted ${products.length} products.`);
        next();
    } catch (error) {
        console.error(`Error in SubCategory pre-deleteOne middleware for SubCategory ${this._id}:`, error.message);
        next(error); // Pass error to Mongoose, but SubCategory deletion may still proceed
    }
});


module.exports = mongoose.model("SubCategory", subCategorySchema);