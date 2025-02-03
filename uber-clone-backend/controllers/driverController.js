const Ride = require('../models/Ride');
const io = require('../server').io;

exports.updateDriverLocation = async (req, res) => {
    const { latitude, longitude } = req.body;
    const driver = req.user;

    try {
        driver.location = { latitude, longitude };
        await driver.save();

        // Notify riders about the updated location
        io.emit('driverLocationUpdate', {
            driverId: driver._id,
            location: { latitude, longitude },
        });

        res.json({ message: 'Location updated successfully' });
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server error');
    }
};