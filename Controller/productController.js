const productSchema = require("../model/productSchema");
const { deleteFileFromCPanel } = require("./utils/sharedFunction");

module.exports.addProduct = async (req, res) => {

    console.log("productName", req.body);
    try {
        const { productName, sub_category_id } = req.body;
        const imageUrl = req.file.imageUrl;

        console.log("imageUrl", imageUrl);

        if (!productName || !imageUrl || !sub_category_id) {
            return res.status(400).json("Title, main image, and main category are required")
        }

        const newProduct = await productSchema({
            sub_category_id,
            productName,
            productImage: imageUrl
        })
        const savedProduct = await newProduct.save();

        console.log("Product added:", savedProduct);
        res.status(201).json({ message: "Product added successfully", id: savedProduct._id });
    } catch (error) {
        console.error("Error in product:", error.message);
        res.status(500).json({ error: "Failed to add product: " + error.message });
    }

};
module.exports.getProduct = async (req, res) => {

    try {
        const product = await productSchema.find();

        const formattedProduct = product.map((product) => ({
            id: product._id,
            sub_category_id: product.sub_category_id,
            productName: product.productName,
            productImage: product.productImage,
            created_at: product.created_at,
            updated_at: product.updated_at,
        }))

        console.log("formattedProduct", formattedProduct);

        res.status(200).json(formattedProduct)
    } catch (error) {
        console.error("Error in getProducts:", error.message);
        res.status(500).json({ error: "Failed to fetch products: " + error.message });
    }

};
module.exports.updateProduct = async (req, res) => {


    const id = req.params.id;
    const { productName, sub_category_id } = req.body;
    const imageUrl = req.file?.imageUrl;
    console.log("Received PATCH request for subcategory ID:", id);
    console.log("Request body:", req.body);
    console.log("Uploaded files:", imageUrl);

    try {
        const existingProduct = await productSchema.findById(id);
        if (!existingProduct) {
            console.log("{Product not found for ID:", id);
            return res.status(404).json({ error: "Product not found" });
        }
        console.log("existingProduct", existingProduct);

        if (imageUrl && existingProduct.productImage) {
            try {
                console.log(`Attempting to delete old image: ${existingProduct.productImage}`);
                await deleteFileFromCPanel(existingProduct.productImage);
                console.log(`Old image deleted for product ${id}: ${existingProduct.productImage}`);
            } catch (error) {
                console.error(`Failed to delete old image for product ${id}:`, error);
            }
        }

        if (productName) existingProduct.productName = productName;
        if (imageUrl) existingProduct.productImage = imageUrl || existingProduct.productImage;
        if (sub_category_id) existingProduct.main_category_id = sub_category_id;

        await existingProduct.save();
        res.json({ message: 'Product updated successfully' });
    } catch (error) {
        console.error("Error in update Product:", error.message);
        res.status(500).json({ error: "Failed to update product: " + error.message });
    }


};
module.exports.deleteProduct = async (req, res) => {


    const id = req.params.id;
    try {
        const product = await productSchema.findById(id);
        if (!product) {
            return res.status(404).json({ error: "Product not found" });
        }

        console.log("product", product);

        try {
            await deleteFileFromCPanel(product.productImage);
        } catch (error) {
            console.error(`Error deleting image ${product.productImage} from cPanel:`, error);
        }


        await productSchema.findByIdAndDelete(id);
        res.status(200).json({ message: "Product deleted successfully" });
    } catch (err) {
        console.error("Error in product:", err.message);
        res.status(500).json({ error: "Failed to delete product: " + err.message });
    }
};    