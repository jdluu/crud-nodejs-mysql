const express = require('express');
const router = express.Router();
const { isAuthenticated } = require('../middleware/auth');

const customerController = require('../controllers/customerController');
const authController = require('../controllers/authController');

// Authentication routes
router.get('/login', authController.loginPage);
router.post('/login', authController.login);
router.get('/logout', authController.logout);

// Customer routes (protected)
router.get('/', isAuthenticated, customerController.list);
router.post('/add', isAuthenticated, customerController.save);
router.get('/delete/:id', isAuthenticated, customerController.delete);
router.get('/restore/:id', isAuthenticated, customerController.restore);
router.get('/update/:id', isAuthenticated, customerController.edit);
router.post('/update/:id', isAuthenticated, customerController.update);

// Additional routes
router.get('/deleted', isAuthenticated, customerController.listDeleted);
router.get('/versions/:id', isAuthenticated, customerController.viewVersions);
router.get('/activity-log', isAuthenticated, customerController.viewActivityLog);

module.exports = router;