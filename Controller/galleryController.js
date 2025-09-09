const gallerySchema = require("../model/gallerySchema");
const { deleteFileFromCPanel } = require("./utils/sharedFunction");

module.exports.addImage = async (req, res) => {

    try {
        const uploadedFiles = req.files?.imageUrls || []; // Use imageUrls returned by upload.js

        if (!uploadedFiles || uploadedFiles.length === 0) {
            return res.status(400).json({ error: "No images uploaded!" });
        }

        const existingImages = await gallerySchema.find().select('image');
        const existingImageUrls = existingImages.map(item => item.image);

        // Filter out duplicates based on the full URL
        const uniqueFiles = uploadedFiles.filter(
            (url) => !existingImageUrls.includes(url)
        );

        if (uniqueFiles.length === 0) {
            return res.status(400).json({ error: "All selected images are duplicates!" });
        }

        // Insert the new image URLs into the database
        const newItems = uniqueFiles.map(url => ({ image: url }));
        const savedItems = await gallerySchema.insertMany(newItems);

        res.status(201).json({ message: "Images uploaded successfully!", result: savedItems });

    } catch (error) {
        console.error("Upload error:", error);
        res.status(500).json({ error: "Internal Server Error" });
    }

}
module.exports.getImage = async (req, res) => {

    try {
        const galleryItems = await gallerySchema.find().sort({ createdAt: -1 }); // Sort by createdAt descending
        // Map _id to id for frontend compatibility
        const formattedItems = galleryItems.map(item => ({
            id: item._id,
            image: item.image
        }));
        console.log("formattedItems", formattedItems);

        res.status(200).json(formattedItems);
    } catch (error) {
        console.error("Fetch error:", error);
        res.status(500).json({ error: "Internal Server Error" });
    }
}

module.exports.updateImage = (req, res) => { }

module.exports.deleteImage = async (req, res) => {
    try {
        const { id } = req.params;

        const item = await gallerySchema.findById(id);
        if (!item) {
            return res.status(404).json({ error: "Gallery item not found" });
        }

        // Delete the image from cPanel via FTP
        try {
            await deleteFileFromCPanel(item.image);
        } catch (error) {
            console.error(`Failed to delete image ${item.image} from cPanel:`, error);
            // Continue with deletion even if the file deletion fails
        }

        await gallerySchema.findByIdAndDelete(id);

        res.status(200).json({ message: "Gallery item deleted successfully!" });
    } catch (error) {
        console.error("Delete error:", error);
        res.status(500).json({ error: "Internal Server Error" });
    }
}