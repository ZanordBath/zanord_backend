const sliderSchema = require("../model/sliderSchema");
const { deleteFileFromCPanel } = require("./utils/sharedFunction");

const ftpConfig = {
    user: 'zanord1@zanordbath.com',
    host: 'ftp.zanordbath.com',
    password: 'Yky-yoiD;@=f',
    port: 21,
    secure: false,
    passive: true,
    connTimeout: 10000,
    pasvTimeout: 10000,
    keepalive: 10000,
};

module.exports.addSlider = async (req, res) => {
    const imageUrl = req.file ? req.file.imageUrl : null; // Allow image to be null
    const { title, description } = req.body;

    // Validate required fields (image is now optional)
    if (!title || !description) {
        console.error("Validation failed in addSlider:", { title, description, imageUrl });
        return res.status(400).json({ error: "Title and description are required" });
    }

    try {
        const newSlider = new sliderSchema({
            image: imageUrl, // Can be null if no image is provided
            title,
            description
        });
        const savedSlider = await newSlider.save();
        console.log("Slider added to database:", savedSlider);
        res.json({ success: true, message: "Slider added successfully", id: savedSlider._id });
    } catch (error) {
        console.error("Error in addSlider:", error);
        res.status(500).json({ error: "Failed to save slider to database", details: error.message });
    }
};

module.exports.getSlider = async (req, res) => {

    try {
        const sliders = await sliderSchema.find().select('_id image title description')
        console.log("Fetched sliders from database:", sliders);
        sliders.forEach(slider => {
            console.log(`Slider ${slider._id} image URL: ${slider.image}`);
        });

        const formattedSliders = sliders.map(slider => ({
            id: slider._id,
            image: slider.image,
            title: slider.title,
            description: slider.description
        }))

        res.json(formattedSliders)

    } catch (error) {
        console.error("Error fetching sliders:", error);
        res.status(500).json({ error: "Failed to fetch sliders", details: error.message });
    }

}

module.exports.updateSlider = async (req, res) => {

    const id = req.params.id;
    const { title, description } = req.body;
    const imageUrl = req.file ? req.file.imageUrl : null;

    console.log("id",id);
    console.log("title",title);
    console.log("description",description);
    console.log("imageUrl",imageUrl);
    

    try {

        const oldSlider = await sliderSchema.findById(id);
        if (!oldSlider) {
            console.error(`Slider with ID ${id} not found`);
            return res.status(404).json({ error: "Slider not found" });
        }

        if (imageUrl && oldSlider.image) {
            try {
                await deleteFileFromCPanel(oldSlider.image);
                console.log(`Old image deleted for slider ${id}: ${oldSlider.image}`);
            } catch (error) {
                console.error(`Failed to delete old image ${oldSlider.image} for slider ${id}:`, error);
            }
        }

        const updatedSlider = {
            image: imageUrl !== null ? imageUrl : oldSlider.image,
            title: title || oldSlider.title,
            description: description || oldSlider.description
        };

        const slider = await sliderSchema.findByIdAndUpdate(id, updatedSlider, { new: true });
        console.log("Slider updated in database:", slider);
        res.json({ success: true, message: "Slider updated successfully" });

    } catch (error) {
        console.error("Error in updateSlider:", error);
        res.status(500).json({ error: "Failed to update slider", details: error.message });
    }
}


module.exports.deleteSlider = async (req, res) => {
    const deleteId = req.params.id;
    console.log("delete id", deleteId);
    if (!deleteId) {
        console.log("Missing ID in request body");
        return res.status(400).json({ error: "Missing ID in request body" });
    }

    try {
        const slider = await sliderSchema.findById(deleteId);
        if (!slider) {
            console.error(`Slider with ID ${deleteId} not found`);
            return res.status(404).json({ error: "Slider not found" });
        }

        if (slider.image) { // Fixed: slider.image instead of sliderSchema.image
            try {
                await deleteFileFromCPanel(slider.image);
                console.log(`Image deleted for slider ${deleteId}: ${slider.image}`);
            } catch (error) {
                console.error(`Failed to delete image ${slider.image} for slider ${deleteId}:`, error.message);
                // Optionally, decide whether to continue or throw an error
            }
        }

        await sliderSchema.findByIdAndDelete(deleteId);
        console.log("Slider deleted from database:", { deleteId });
        res.json({ success: true, message: "Slider deleted successfully" });
    } catch (error) {
        console.error("Error in deleteSlider:", error.message);
        res.status(500).json({ error: "Failed to delete slider", details: error.message });
    }
};
