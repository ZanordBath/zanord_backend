const express = require("express");
const router = express.Router();
const ctl = require("../Controller/galleryController");
const { uploadMultiple } = require("../middleware/multer");

router.post("/addImage",uploadMultiple, ctl.addImage);
router.post("/updateImage/:id",uploadMultiple, ctl.updateImage);
router.get("/getImage", ctl.getImage);
router.delete("/deleteImage/:id", ctl.deleteImage);

module.exports = router;