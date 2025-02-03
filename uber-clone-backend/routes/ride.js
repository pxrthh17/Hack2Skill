const express = require('express');
const router = express.Router();
const rideController = require('../controllers/rideController'); // Import the controller
const authMiddleware = require('../middleware/authMiddleware'); // Import authentication middleware

// Existing routes
router.post('/create', authMiddleware, rideController.createRide);
router.get('/history', authMiddleware, rideController.getRideHistory);
router.get('/pending', authMiddleware, rideController.getPendingRides);
router.put('/accept/:id', authMiddleware, rideController.acceptRide);
router.post('/estimate-price', authMiddleware, rideController.estimatePrice);
router.post('/fetch-route', authMiddleware, rideController.fetchRoute);

// New route for canceling a ride
router.post('/cancel-ride/:id', authMiddleware, rideController.cancelRide);

// New route for fetching accepted rides for the logged-in driver
router.get('/accepted', authMiddleware, rideController.getAcceptedRides);

module.exports = router;