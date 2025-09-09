const express = require("express");
const router = express.Router();
const ctl = require("../Controller/ebrochureController");
const { uploadEBrochureFields } = require("../middleware/multer");

router.get("/getBrochure", ctl.getBrochure);
router.post("/addBrochure", uploadEBrochureFields, ctl.addBrochure)
router.put("/updateBrochure/:id", uploadEBrochureFields, ctl.updateBrochure)
router.delete("/deleteBrochure/:id", ctl.deleteBrochure)

module.exports = router;