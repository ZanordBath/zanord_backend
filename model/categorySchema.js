const mongoose = require("mongoose");
const subCategorySchema = require("./subCategorySchema");
const { deleteFileFromCPanel } = require("../Controller/utils/sharedFunction");
const productSchema = require("./productSchema");
const Schema = mongoose.Schema;

const categorySchema = new Schema({
    catImage: {
        type: String,
        required: true
    },
    catName: {
        type: String,
        required: true
    },
    created_at: {
        type: Date,
        default: Date.now
    }
}, { collection: 'category' })


categorySchema.pre('save', function (next) {
    this.updated_at = Date.now();
    next();
});

categorySchema.pre('findOneAndUpdate', function (next) {
    this.set({ updated_at: Date.now() });
    next();
});


categorySchema.pre('deleteOne', { document: true, query: false }, async function (next) {
    try {
        console.log(`Starting deletion process for MainCategory ${this._id}`);

        // Step 1: Find all SubCategories linked to this MainCategory
        const subCategories = await subCategorySchema.find({ main_category_id: this._id });
        console.log(`Found ${subCategories.length} subcategories for MainCategory ${this._id}`);
        console.log("subCategories:", subCategories);

        // Step 2: Delete SubCategories and their images
        for (const subCat of subCategories) {
            // Delete SubCategory image if it exists
            if (subCat.subCatImage) {
                try {
                    console.log(`Attempting to delete image: ${subCat.subCatImage}`);
                    await deleteFileFromCPanel(subCat.subCatImage);
                    console.log(`Deleted image for SubCategory ${subCat._id}: ${subCat.subCatImage}`);
                } catch (error) {
                    console.error(`Failed to delete image for SubCategory ${subCat._id}:`, error.message);
                }
            }

            // Delete the SubCategory itself
            try {
                await subCategorySchema.findByIdAndDelete(subCat._id);
                console.log(`Deleted SubCategory ${subCat._id}`);
            } catch (error) {
                console.error(`Failed to delete SubCategory ${subCat._id}:`, error.message);
            }
        }

        // Step 3: Find and delete all Products linked to the SubCategories
        const subCategoryIds = subCategories.map(subCat => subCat._id);
        const products = await productSchema.find({ sub_category_id: { $in: subCategoryIds } });
        console.log(`Found ${products.length} products for subCategories of MainCategory ${this._id}`);
        console.log("products:", products);

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

        // Step 4: Delete the MainCategory's image if it exists
        if (this.image) {
            try {
                console.log(`Attempting to delete image: ${this.image}`);
                await deleteFileFromCPanel(this.image);
                console.log(`Deleted MainCategory ${this._id} image: ${this.image}`);
            } catch (error) {
                console.error(`Failed to delete MainCategory ${this._id} image:`, error.message);
            }
        }

        console.log(`Completed deletion process for MainCategory ${this._id}. Deleted ${subCategories.length} subcategories and ${products.length} products.`);
        next();
    } catch (error) {
        console.error(`Error in MainCategory pre-deleteOne middleware for MainCategory ${this._id}:`, error.message);
        next(error); // Pass error to Mongoose, but MainCategory deletion may still proceed
    }
});
module.exports = mongoose.model("category", categorySchema);