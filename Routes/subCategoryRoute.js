const express = require("express");
const router = express.Router();
const ctl = require("../Controller/subCategoryController");
const { uploadSingle } = require("../middleware/multer");

router.post("/addSubCat",uploadSingle, ctl.addSubCategory);
router.get("/getSubCat", ctl.getSubCategory);
router.put("/updateSubCat/:id",uploadSingle, ctl.updateSubCategory);
router.delete("/deleteSubCat/:id", ctl.deleteSubCategory);

module.exports = router;