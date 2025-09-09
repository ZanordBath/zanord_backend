const categorySchema = require("../model/categorySchema");
const { deleteFileFromCPanel } = require("./utils/sharedFunction");

module.exports.addCategory = async (req, res) => {
    try {
        const catName = req.body.catName;
        const imageUrl = req.file ? req.file.imageUrl : null;

        console.log("catName", catName);
        console.log("imageUrl", imageUrl);

        if (!catName && !imageUrl) {
            return res.status(400).json({ error: 'Title and Image are required' });
        }

        const newCategory = await categorySchema({ catName, catImage: imageUrl })
        const savedCategory = await newCategory.save();
        res.status(201).json({ message: 'Category added successfully', id: savedCategory._id });
    } catch (error) {
        console.error('Error creating category:', error);
        res.status(500).json({ error: 'Failed to create category: ' + error.message });
    }

};

module.exports.getCategory = async (req, res) => {
    try {
        const categories = await categorySchema.find();
        res.json(categories);
    } catch (error) {
        console.error('Error fetching categories:', error);
        res.status(500).json({ error: 'Failed to fetch categories: ' + error.message });
    }
};

module.exports.updateCategory = async (req, res) => {

    try {
        const title = req.body.catName;
        const id = req.params.id;
        const imageUrl = req.file ? req.file.imageUrl : null;

        if (!title) {
            return res.status(400).json({ error: 'Title is required' });
        }

        const category = await categorySchema.findById(id);
        if (!category) {
            console.error(`Category with ID ${id} not found`);
            return res.status(404).json({ error: 'Category not found' });
        }

        // Delete old image if a new one is uploaded
        if (imageUrl && category.catImage) {
            try {
                await deleteFileFromCPanel(category.catImage);
                console.log(`Old image deleted for category ${id}: ${category.catImage}`);
            } catch (error) {
                console.error(`Failed to delete old image for category ${id}:`, error);
            }
        }

        const updateCategory = {
            catName: title,
            catImage: imageUrl || category.image,
        }
        await categorySchema.findByIdAndUpdate(id, updateCategory, { new: true });
        res.json({ message: 'Category updated successfully' });
    } catch (error) {
        console.error('Error updating category:', error);
        res.status(500).json({ error: 'Failed to update category: ' + error.message });
    }
};

module.exports.deleteCategory = async (req, res) => {

    console.log("Del id", req.params.id);

    try {
        const id = req.params.id;

        // Validate ObjectId
        if (!id) {
            return res.status(400).json({ error: 'Invalid or missing category ID' });
        }

        const category = await categorySchema.findById(id);
        if (!category) {
            return res.status(404).json({ error: 'Category not found' });
        }

        // Delete image from cPanel if it exists
        if (category.catImage) {
            try {
                await deleteFileFromCPanel(category.catImage);
                console.log(`Image deleted for category ${id}: ${category.catImage}`);
            } catch (error) {
                console.error(`Failed to delete image for category ${id}:`, error);
            }
        }

        // Delete the MainCategory (middleware will handle SubCategory deletion)
        await category.deleteOne();
        res.json({ message: 'Category and associated subcategories deleted successfully' });
    } catch (error) {
        console.error('Error deleting category:', error);
        res.status(500).json({ error: 'Failed to delete category: ' + error.message });
    }
};
