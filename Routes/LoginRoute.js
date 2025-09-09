const express = require('express');
const router = express.Router();
const ctl = require("../Controller/loginController");
const { auth } = require('../middleware/auth');

router.post("/logAdmin", ctl.logIn);
router.get("/getAdmin", auth, ctl.getAdmin);

//pass auth middleware
router.get('/admin/dashboard', auth, (req, res) => {
    res.json({ success: true, message: "Welcome to Admin Dashboard" })
})
router.post("/logout", auth, ctl.logOut);

module.exports = router;