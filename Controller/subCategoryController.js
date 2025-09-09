const subCategorySchema = require("../model/subCategorySchema");
const { deleteFileFromCPanel } = require("./utils/sharedFunction");

module.exports.addSubCategory = async (req, res) => {

    const { subCatName, main_category_id } = req.body;
    const imageUrl = req.file.imageUrl;

    console.log("subCatName", subCatName, main_category_id);
    console.log("imageUrl", imageUrl);

    if (!subCatName || !imageUrl || !main_category_id) {
        return res.status(400).json("Title, main image, and main category are required")
    }

    try {

        const newSubCategory = new subCategorySchema({
            main_category_id,
            subCatName,
            subCatImage: imageUrl
        })
        const savedSubCategory = await newSubCategory.save()

        console.log("Subcategory added:", savedSubCategory);
        res.status(201).json({ message: "Subcategory added successfully", id: savedSubCategory._id });
    } catch (error) {
        console.error("Error in addSubCategory:", err.message);
        res.status(500).json({ error: "Failed to add subcategory: " + err.message });
    }

}

module.exports.getSubCategory = async (req, res) => {
    try {
        const subCategories = await subCategorySchema.find();

        const formattedSubCategories = subCategories.map((sub) => ({
            id: sub._id,
            subCatName: sub.subCatName,
            subCatImage: sub.subCatImage,
            main_category_id: sub.main_category_id,
            created_at: sub.created_at,
            updated_at: sub.updated_at,
        }));

        console.log("formattedSubCat", formattedSubCategories);
        res.status(200).json(formattedSubCategories);

    } catch (error) {
        console.error("Error in getSubCategories:", error.message);
        res.status(500).json({ error: "Failed to fetch subcategories: " + error.message });
    }
}

module.exports.updateSubCategory = async (req, res) => {
    const id = req.params.id;
    const { subCatName, main_category_id } = req.body;
    const imageUrl = req.file?.imageUrl;
    console.log("Received PATCH request for subcategory ID:", id);
    console.log("Request body:", req.body);
    console.log("Uploaded files:", imageUrl);

    try {
        const existingSubCategory = await subCategorySchema.findById(id);
        if (!existingSubCategory) {
            console.log("Subcategory not found for ID:", id);
            return res.status(404).json({ error: "Subcategory not found" });
        }
        console.log("existingSubCategory", existingSubCategory);

        if (imageUrl && existingSubCategory.subCatImage) {
            try {
                console.log(`Attempting to delete old image: ${existingSubCategory.subCatImage}`);
                await deleteFileFromCPanel(existingSubCategory.subCatImage);
                console.log(`Old image deleted for category ${id}: ${existingSubCategory.subCatImage}`);
            } catch (error) {
                console.error(`Failed to delete old image for category ${id}:`, error);
            }
        }

        if (subCatName) existingSubCategory.subCatName = subCatName;
        if (imageUrl) existingSubCategory.subCatImage = imageUrl || existingSubCategory.subCatImage;
        if (main_category_id) existingSubCategory.main_category_id = main_category_id;

        await existingSubCategory.save();
        res.json({ message: 'Category updated successfully' });
    } catch (error) {
        console.error("Error in updateSubCategory:", error.message);
        res.status(500).json({ error: "Failed to update subcategory: " + error.message });
    }

}

module.exports.deleteSubCategory = async (req, res) => {
    const id = req.params.id;
    try {
        const subCategory = await subCategorySchema.findById(id);
        if (!subCategory) {
            return res.status(404).json({ error: "Subcategory not found" });
        }

        try {
            await deleteFileFromCPanel(subCategory.subCatImage);
        } catch (error) {
            console.error(`Error deleting image ${subCategory.subCatImage} from cPanel:`, error);
        }


        await subCategory.deleteOne();
        res.status(200).json({ message: "Subcategory deleted successfully" });
    } catch (err) {
        console.error("Error in deleteSubCategory:", err.message);
        res.status(500).json({ error: "Failed to delete subcategory: " + err.message });
    }
}