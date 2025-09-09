const express = require("express");
const router = express.Router();
const ctl = require("../Controller/productController");
const { uploadSingle } = require("../middleware/multer");

router.post("/addProduct", uploadSingle, ctl.addProduct);
router.get("/getProduct", ctl.getProduct);
router.put("/updateProduct/:id", uploadSingle, ctl.updateProduct);
router.delete("/deleteProduct/:id", ctl.deleteProduct);

module.exports = router;