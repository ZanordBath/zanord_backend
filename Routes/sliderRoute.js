const express = require('express');
const router = express.Router();
const ctl = require("../Controller/sliderController");
const { uploadSingle } = require('../middleware/multer');


router.post("/addSlider", uploadSingle,ctl.addSlider);
router.get("/getSlider", ctl.getSlider);
router.put("/updateSlider/:id",uploadSingle, ctl.updateSlider);
router.delete("/deleteSlider/:id", ctl.deleteSlider);

module.exports = router;