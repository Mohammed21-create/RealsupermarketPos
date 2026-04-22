const router = require("express").Router();
const admin = require("../controllers/adminController"); // admin-specific controller

// Admin login
router.post("/login",admin.login);

// Get currently logged-in admin info
router.get("/me",admin.me);

// Admin logout
router.post("/logout",admin.logout);
router.post("/change-password", admin.changePassword);

module.exports = router;