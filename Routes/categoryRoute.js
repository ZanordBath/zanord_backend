const express = require("express");
const router = express.Router();
const ctl = require("../Controller/categoryController");
const { uploadSingle } = require("../middleware/multer");

router.post("/addCat",uploadSingle, ctl.addCategory);
router.get("/getCat", ctl.getCategory);
router.put("/updateCat/:id",uploadSingle, ctl.updateCategory);
router.delete("/deleteCat/:id", ctl.deleteCategory);

module.exports = router;