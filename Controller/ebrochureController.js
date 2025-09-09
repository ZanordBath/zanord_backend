const eBrochureSchema = require("../model/eBrochureSchema");
const { deleteFileFromCPanel } = require("./utils/sharedFunction");

module.exports.getBrochure = async (req, res) => {

    try {
        const eBrochure = await eBrochureSchema.findOne(); // Fetch the first e-brochure
        if (!eBrochure) {
            return res.status(200).json(null); // No e-brochure exists
        }
        // Format the response to match the frontend expectation
        const formattedEBrochure = {
            id: eBrochure._id,
            cover_image: eBrochure.cover_image,
            pdf_file: eBrochure.pdf_file,
            created_at: eBrochure.created_at
        };
        console.log("formattedEBrochure", formattedEBrochure);

        res.status(200).json(formattedEBrochure);
    } catch (err) {
        console.error("Error in getEBrochure:", err.message);
        res.status(500).json({ error: "Failed to fetch e-brochure: " + err.message });
    }

}

module.exports.addBrochure = async (req, res) => {
    try {
        const uploadedFiles = req.files?.uploadedFiles;
        console.log("Uploaded files:", uploadedFiles);

        if (!uploadedFiles?.cover_image?.[0] || !uploadedFiles?.pdf_file?.[0]) {
            return res.status(400).json({ error: "Please upload both a cover image and a PDF file." });
        }

        const newEBrochure = new eBrochureSchema({
            cover_image: uploadedFiles.cover_image[0], // Use the URL from FTP
            pdf_file: uploadedFiles.pdf_file[0], // Use the URL from FTP
        });

        const brochure = await newEBrochure.save();
        console.log("Brochure saved:", brochure);

        res.status(201).json({ message: "E-Brochure added successfully", id: brochure._id });
    } catch (error) {
        console.error("Error in addBrochure:", error.message);
        res.status(500).json({ error: "Failed to save e-brochure: " + error.message });
    }
};

module.exports.updateBrochure = async (req, res) => {
    console.log("response");
    
    const uploadedFiles = req.files?.uploadedFiles || {};
    const cover_image = uploadedFiles.cover_image ? uploadedFiles.cover_image[0] : null;
    const pdf_file = uploadedFiles.pdf_file ? uploadedFiles.pdf_file[0] : null;

    try {
        const existingEBrochure = await eBrochureSchema.findOne();

        let newCoverImage = existingEBrochure.cover_image;
        let newPdfFile = existingEBrochure.pdf_file;

        if (cover_image) {
            if (existingEBrochure.cover_image) {
                try {
                    await deleteFileFromCPanel(existingEBrochure.cover_image);
                } catch (error) {
                    console.error(`Error deleting old cover image ${existingEBrochure.cover_image} from cPanel:`, error);
                }
            }
            newCoverImage = cover_image;
        }

        // If a new PDF file is uploaded, delete the old one
        if (pdf_file) {
            if (existingEBrochure.pdf_file) {
                try {
                    await deleteFileFromCPanel(existingEBrochure.pdf_file);
                } catch (error) {
                    console.error(`Error deleting old PDF file ${existingEBrochure.pdf_file} from cPanel:`, error);
                }
            }
            newPdfFile = pdf_file;
        }

        if (!cover_image && !pdf_file) {
            return res.status(400).json({ error: "Please upload at least one file (cover image or PDF) to update the e-brochure." });
        }

        // Ensure that after the update, both fields are non-null
        if (!newCoverImage || !newPdfFile) {
            return res.status(400).json({ error: "Both cover image and PDF file are required after the update." });
        }

        const updatedEBrochure = await eBrochureSchema.findByIdAndUpdate(
            existingEBrochure._id,
            { cover_image: newCoverImage, pdf_file: newPdfFile },
            { new: true }
        );

        res.status(200).json({ message: "E-Brochure updated successfully" });

    } catch (error) {
        console.error("Error in UpdateEBrochure:", err.message);
        res.status(500).json({ error: "Failed to save e-brochure: " + err.message });
    }
}

module.exports.deleteBrochure = async (req, res) => {
    console.log("req.params", req.params);

    try {
        const eBrochure = await eBrochureSchema.findOne();
        if (!eBrochure) {
            return res.status(404).json({ error: "E-Brochure not found" });
        }

        const filesToDelete = [eBrochure.cover_image, eBrochure.pdf_file].filter(Boolean);

        for (const fileUrl of filesToDelete) {
            try {
                await deleteFileFromCPanel(fileUrl);
            } catch (error) {
                console.error(`Error deleting file ${fileUrl} from cPanel:`, error);
            }
        }

        await eBrochureSchema.deleteMany();
        res.status(200).json({ message: "E-Brochure deleted successfully" });
    } catch (error) {
        console.error("Error in deleteEBrochure:", err.message);
        res.status(500).json({ error: "Failed to delete e-brochure: " + err.message });
    }
}