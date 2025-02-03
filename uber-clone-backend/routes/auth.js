const express = require('express');
const jwt = require('jsonwebtoken');
const User = require('../models/User');

const router = express.Router();

router.post('/register', register);
router.post('/login', login);

// Validate token
router.get('/validate-token', async (req, res) => {
    const token = req.headers.authorization?.split(' ')[1];
    if (!token) return res.json({ isAuthenticated: false });

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        const user = await User.findById(decoded.id);
        if (!user) return res.json({ isAuthenticated: false });

        res.json({ isAuthenticated: true });
    } catch (err) {
        console.error('Error validating token:', err.message);
        res.json({ isAuthenticated: false });
    }
});

module.exports = router;