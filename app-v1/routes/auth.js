const express = require('express');
const router = new express.Router();

const UserController = require('./../controllers/UserController');
const { authenticate, authorize, authorizePermission } = require('../middlewares/auth');


router.post(`/login`, UserController.login);

// Example protected routes
router.get(`/me`, authenticate, UserController.me);
// Example permission-protected route (uses permission, not role)
router.get(`/admin-only`, authenticate, authorizePermission('admin.view'), (req, res) => {
    res.json({ success: true, message: 'Admin content', data: null });
});




module.exports = router
