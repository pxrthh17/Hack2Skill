const Ride = require('../models/Ride');
const io = require('../server').io;

// Helper function to geocode place names into coordinates
const geocodePlace = async (placeName) => {
    try {
        console.log(`Geocoding place: ${placeName}`);
        const response = await fetch(
            `https://maps.googleapis.com/maps/api/geocode/json?address=${encodeURIComponent(placeName)}&key=AIzaSyDuiLtmeuKUFdg7KkL5G9NQqoLwT8Bxv7o`
        );
        const data = await response.json();
        if (data.status === 'OK') {
            const { lat, lng } = data.results[0].geometry.location;
            console.log(`Geocoded place: ${placeName}, Coordinates: ${lat}, ${lng}`);
            return { lat, lng };
        } else {
            console.error(`Geocoding failed for place: ${placeName}. Status: ${data.status}`);
            throw new Error('Invalid place name');
        }
    } catch (error) {
        console.error('Error geocoding place:', error.message);
        throw new Error('Failed to geocode location');
    }
};

// Helper function to fetch the route between two coordinates
const fetchRoute = async (pickupCoords, dropoffCoords) => {
    try {
        const response = await fetch(
            `https://maps.googleapis.com/maps/api/directions/json?origin=${pickupCoords.lat},${pickupCoords.lng}&destination=${dropoffCoords.lat},${dropoffCoords.lng}&key=AIzaSyDuiLtmeuKUFdg7KkL5G9NQqoLwT8Bxv7o`
        );
        const data = await response.json();
        if (data.status === 'OK') {
            const route = data.routes[0].overview_polyline.points; // Encoded polyline
            console.log('Route calculated successfully');
            return route;
        } else {
            console.error(`Failed to calculate route. Status: ${data.status}`);
            throw new Error('Failed to calculate route');
        }
    } catch (error) {
        console.error('Error fetching route:', error.message);
        throw new Error('Unable to fetch route');
    }
};

// Helper function to calculate distance between two coordinates
const calculateDistance = (pickupCoords, dropoffCoords) => {
    try {
        // Validate the coordinates
        if (
            isNaN(pickupCoords.lat) || isNaN(pickupCoords.lng) ||
            isNaN(dropoffCoords.lat) || isNaN(dropoffCoords.lng)
        ) {
            throw new Error('Invalid coordinates');
        }

        // Haversine formula
        const R = 6371; // Earth's radius in kilometers
        const dLat = ((dropoffCoords.lat - pickupCoords.lat) * Math.PI) / 180;
        const dLng = ((dropoffCoords.lng - pickupCoords.lng) * Math.PI) / 180;
        const a =
            Math.sin(dLat / 2) * Math.sin(dLat / 2) +
            Math.cos((pickupCoords.lat * Math.PI) / 180) *
            Math.cos((dropoffCoords.lat * Math.PI) / 180) *
            Math.sin(dLng / 2) *
            Math.sin(dLng / 2);
        const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
        const distance = R * c; // Distance in kilometers
        console.log(`Calculated distance: ${distance.toFixed(2)} km`);
        return distance;
    } catch (error) {
        console.error('Error calculating distance:', error.message);
        throw new Error('Unable to calculate distance');
    }
};

// Helper function to calculate dynamic price
const calculateDynamicPrice = async (pickupLocation, dropoffLocation) => {
    try {
        console.log(`Calculating dynamic price for pickup: ${pickupLocation}, dropoff: ${dropoffLocation}`);

        // Geocode place names into coordinates
        const pickupCoords = await geocodePlace(pickupLocation);
        const dropoffCoords = await geocodePlace(dropoffLocation);

        if (!pickupCoords || !dropoffCoords) {
            throw new Error('Invalid pickup or dropoff location');
        }

        const distance = calculateDistance(pickupCoords, dropoffCoords); // Distance in kilometers

        // Fetch external data (e.g., time of day, weather, traffic)
        const timeOfDayFactor = getTimeOfDayFactor();
        const weatherFactor = await getWeatherFactor(pickupCoords);
        const trafficFactor = await getTrafficFactor(pickupCoords, dropoffCoords);

        // Fetch internal data (e.g., active drivers, riders, cancellations)
        const activeDrivers = await getActiveDriversInRegion(pickupCoords);
        const activeRiders = await getActiveRidersInRegion(pickupCoords);
        const cancellationRate = await getCancellationRate();

        // Base price per kilometer
        const basePricePerKm = 10;

        // Dynamic pricing logic
        let priceMultiplier = 1; // Default multiplier

        // Factor 1: Time of Day (Peak hours increase price)
        priceMultiplier += timeOfDayFactor;

        // Factor 2: Weather Conditions (Bad weather increases price)
        priceMultiplier += weatherFactor;

        // Factor 3: Traffic Conditions (High traffic increases price)
        priceMultiplier += trafficFactor;

        // Factor 4: Driver Availability (Fewer drivers increase price)
        if (activeDrivers < 10) priceMultiplier += 0.5; // 50% increase if fewer than 10 drivers

        // Factor 5: Rider Demand (High rider demand increases price)
        if (activeRiders > 5) priceMultiplier += 0.3; // 30% increase if more than 5 riders

        // Factor 6: Cancellation Rates (High cancellation rates increase price)
        if (cancellationRate > 0.2) priceMultiplier += 0.2; // 20% increase if cancellation rate > 20%

        // Calculate final price
        const totalPrice = distance * basePricePerKm * priceMultiplier;

        // Ensure totalPrice is a number
        if (isNaN(totalPrice)) {
            throw new Error('Failed to calculate total price');
        }

        console.log(`Calculated price: $${totalPrice.toFixed(2)}`);
        return { distance, totalPrice, pickupCoords, dropoffCoords }; // Return coordinates
    } catch (error) {
        console.error('Error calculating dynamic price:', error.message);
        throw error;
    }
};

// Estimate price for a ride
exports.estimatePrice = async (req, res) => {
    const { pickupLocation, dropoffLocation } = req.body;

    try {
        // Validate inputs
        if (!pickupLocation || !dropoffLocation) {
            return res.status(400).json({ msg: 'Pickup and dropoff locations are required' });
        }

        if (typeof pickupLocation !== 'string' || typeof dropoffLocation !== 'string') {
            return res.status(400).json({ msg: 'Pickup and dropoff locations must be strings' });
        }

        // Calculate dynamic price and get coordinates
        const { distance, totalPrice, pickupCoords, dropoffCoords } = await calculateDynamicPrice(pickupLocation, dropoffLocation);

        // Return the estimated price and coordinates
        res.json({
            distance: distance.toFixed(2),
            totalPrice: parseFloat(totalPrice).toFixed(2), // Ensure totalPrice is parsed as a float
            pickupCoords,
            dropoffCoords,
        });
    } catch (err) {
        console.error(err.message);
        res.status(500).json({ msg: 'Server error', error: err.message });
    }
};

// Fetch the route between pickup and dropoff locations
exports.fetchRoute = async (req, res) => {
    const { pickupCoords, dropoffCoords } = req.body;

    try {
        // Validate inputs
        if (!pickupCoords || !dropoffCoords) {
            return res.status(400).json({ msg: 'Pickup and dropoff coordinates are required' });
        }

        if (
            isNaN(pickupCoords.lat) || isNaN(pickupCoords.lng) ||
            isNaN(dropoffCoords.lat) || isNaN(dropoffCoords.lng)
        ) {
            return res.status(400).json({ msg: 'Invalid coordinates' });
        }

        // Fetch the route
        const route = await fetchRoute(pickupCoords, dropoffCoords);

        // Return the encoded polyline
        res.json({ route });
    } catch (err) {
        console.error(err.message);
        res.status(500).json({ msg: 'Server error', error: err.message });
    }
};

// Create a new ride request
exports.createRide = async (req, res) => {
    const { pickupLocation, dropoffLocation } = req.body;
    const rider = req.user;

    try {
        // Validate inputs
        if (!pickupLocation || !dropoffLocation) {
            return res.status(400).json({ msg: 'Pickup and dropoff locations are required' });
        }

        if (typeof pickupLocation !== 'string' || typeof dropoffLocation !== 'string') {
            return res.status(400).json({ msg: 'Pickup and dropoff locations must be strings' });
        }

        if (!rider || !rider._id) {
            return res.status(401).json({ msg: 'Unauthorized: User not authenticated' });
        }

        // Calculate dynamic price and get coordinates
        const { distance, totalPrice, pickupCoords, dropoffCoords } = await calculateDynamicPrice(pickupLocation, dropoffLocation);

        // Format coordinates as strings for storage
        const formattedPickup = `${pickupCoords.lat},${pickupCoords.lng}`;
        const formattedDropoff = `${dropoffCoords.lat},${dropoffCoords.lng}`;

        // Create the ride object
        const ride = new Ride({
            rider: rider._id,
            pickupLocation: formattedPickup,
            dropoffLocation: formattedDropoff,
            distance: `${distance.toFixed(2)} km`,
            price: parseFloat(totalPrice).toFixed(2), // Ensure totalPrice is parsed as a float
            status: 'pending',
        });

        await ride.save();

        // Notify drivers about the new ride request
        io.emit('newRideRequest', {
            rideId: ride._id,
            pickupLocation,
            dropoffLocation,
            price: parseFloat(totalPrice).toFixed(2),
        });

        res.status(201).json({ message: 'Ride request created successfully', ride });
    } catch (err) {
        console.error(err.message);
        res.status(500).json({ msg: 'Server error', error: err.message });
    }
};

// Get ride history for the logged-in rider
exports.getRideHistory = async (req, res) => {
    const rider = req.user;

    try {
        if (!rider || !rider._id) {
            return res.status(401).json({ msg: 'Unauthorized: User not authenticated' });
        }

        const rides = await Ride.find({ rider: rider._id }).populate('driver', 'name');
        res.json(rides);
    } catch (err) {
        console.error(err.message);
        res.status(500).json({ msg: 'Server error', error: err.message });
    }
};

// Get pending rides for drivers
exports.getPendingRides = async (req, res) => {
    try {
        const rides = await Ride.find({ status: 'pending' }).populate('rider', 'name email');
        res.json(rides);
    } catch (err) {
        console.error(err.message);
        res.status(500).json({ msg: 'Server error', error: err.message });
    }
};

// Accept a ride request
exports.acceptRide = async (req, res) => {
    const { id } = req.params;
    const driver = req.user;

    try {
        if (!driver || !driver._id) {
            return res.status(401).json({ msg: 'Unauthorized: User not authenticated' });
        }

        const ride = await Ride.findById(id);
        if (!ride) return res.status(404).json({ msg: 'Ride not found' });

        ride.driver = driver._id;
        ride.status = 'accepted';
        await ride.save();

        // Notify the rider and other drivers about the accepted ride
        io.emit('rideAccepted', {
            rideId: ride._id,
            driverName: driver.name,
            driverLocation: driver.location || null, // Initial driver location
            rideDetails: {
                _id: ride._id,
                pickupLocation: ride.pickupLocation,
                dropoffLocation: ride.dropoffLocation,
                price: ride.price,
                rider: ride.rider, // Include rider details
            },
        });

        res.json({ message: 'Ride accepted successfully', ride });
    } catch (err) {
        console.error(err.message);
        res.status(500).json({ msg: 'Server error', error: err.message });
    }
};

exports.getAcceptedRides = async (req, res) => {
    const driver = req.user; // Logged-in driver
    try {
        if (!driver || !driver._id) {
            return res.status(401).json({ msg: 'Unauthorized: User not authenticated' });
        }

        // Fetch rides where the driver is the logged-in user and the status is "accepted"
        const rides = await Ride.find({ driver: driver._id, status: 'accepted' }).populate('rider', 'name email');

        res.json(rides);
    } catch (err) {
        console.error(err.message);
        res.status(500).json({ msg: 'Server error', error: err.message });
    }
};

// Update driver location
exports.updateDriverLocation = async (req, res) => {
    const { rideId, location } = req.body; // location = { lat, lng }
    const driver = req.user;

    try {
        if (!driver || !driver._id) {
            return res.status(401).json({ msg: 'Unauthorized: User not authenticated' });
        }

        if (!rideId || !location || isNaN(location.lat) || isNaN(location.lng)) {
            return res.status(400).json({ msg: 'Invalid ride ID or location' });
        }

        const ride = await Ride.findById(rideId);
        if (!ride) return res.status(404).json({ msg: 'Ride not found' });

        // Update the driver's location in the ride object
        ride.driverLocation = location;
        await ride.save();

        // Notify the rider about the updated driver location
        io.emit('driverLocationUpdated', {
            rideId,
            driverLocation: location,
        });

        res.json({ message: 'Driver location updated successfully' });
    } catch (err) {
        console.error(err.message);
        res.status(500).json({ msg: 'Server error', error: err.message });
    }
};

// Complete a ride
exports.completeRide = async (req, res) => {
    const { id } = req.params;
    const driver = req.user;

    try {
        if (!driver || !driver._id) {
            return res.status(401).json({ msg: 'Unauthorized: User not authenticated' });
        }

        const ride = await Ride.findById(id);
        if (!ride) return res.status(404).json({ msg: 'Ride not found' });

        // Ensure the driver is the one who accepted the ride
        if (ride.driver.toString() !== driver._id.toString()) {
            return res.status(403).json({ msg: 'You are not authorized to complete this ride' });
        }

        // Update the ride status to "completed"
        ride.status = 'completed';
        await ride.save();

        // Notify the rider that the ride has been completed
        io.emit('rideCompleted', {
            rideId: ride._id,
        });

        res.json({ message: 'Ride completed successfully', ride });
    } catch (err) {
        console.error(err.message);
        res.status(500).json({ msg: 'Server error', error: err.message });
    }
};

// Cancel a ride
exports.cancelRide = async (req, res) => {
    const { id } = req.params; // Ride ID from the URL
    const user = req.user; // Authenticated user

    try {
        if (!user || !user._id) {
            return res.status(401).json({ msg: 'Unauthorized: User not authenticated' });
        }

        const ride = await Ride.findById(id); // Find the ride by ID
        if (!ride) return res.status(404).json({ msg: 'Ride not found' });

        // Allow cancellation only if the ride is pending or accepted
        if (ride.status !== 'pending' && ride.status !== 'accepted') {
            return res.status(400).json({ msg: 'This ride cannot be canceled' });
        }

        // Ensure the user is either the rider or the driver
        if (ride.rider.toString() !== user._id.toString() && ride.driver?.toString() !== user._id.toString()) {
            return res.status(403).json({ msg: 'You are not authorized to cancel this ride' });
        }

        // Update the ride status to "canceled"
        ride.status = 'canceled';
        await ride.save();

        // Notify the other party (driver or rider) about the cancellation
        io.emit('rideCanceled', {
            rideId: ride._id,
        });

        res.json({ message: 'Ride canceled successfully', ride });
    } catch (err) {
        console.error(err.message);
        res.status(500).json({ msg: 'Server error', error: err.message });
    }
};

// Helper function to determine time of day factor
const getTimeOfDayFactor = () => {
    const hour = new Date().getHours();
    if ((hour >= 7 && hour <= 9) || (hour >= 17 && hour <= 19)) {
        return 0.5; // 50% increase during peak hours
    }
    return 0; // No increase otherwise
};

// Helper function to fetch weather factor
const getWeatherFactor = async (coords) => {
    try {
        const response = await fetch(
            `https://api.openweathermap.org/data/2.5/weather?lat=${coords.lat}&lon=${coords.lng}&appid=YOUR_WEATHER_API_KEY`
        );
        const data = await response.json();
        const weatherCondition = data.weather[0].main.toLowerCase();

        if (weatherCondition.includes('rain') || weatherCondition.includes('storm')) {
            return 0.3; // 30% increase for bad weather
        }
        return 0; // No increase for good weather
    } catch (error) {
        console.error('Error fetching weather data:', error.message);
        return 0; // Default to no increase
    }
};

// Helper function to fetch traffic factor
const getTrafficFactor = async (pickupCoords, dropoffCoords) => {
    try {
        const response = await fetch(
            `https://maps.googleapis.com/maps/api/directions/json?origin=${pickupCoords.lat},${pickupCoords.lng}&destination=${dropoffCoords.lat},${dropoffCoords.lng}&key=AIzaSyDuiLtmeuKUFdg7KkL5G9NQqoLwT8Bxv7o`
        );
        const data = await response.json();
        const durationInTraffic = data.routes[0].legs[0].duration_in_traffic.value; // In seconds
        const normalDuration = data.routes[0].legs[0].duration.value; // In seconds

        if (durationInTraffic > normalDuration * 1.5) {
            return 0.4; // 40% increase for heavy traffic
        }
        return 0; // No increase for normal traffic
    } catch (error) {
        console.error('Error fetching traffic data:', error.message);
        return 0; // Default to no increase
    }
};

// Helper function to simulate fetching active drivers in a region
const getActiveDriversInRegion = async (coords) => {
    // Replace with actual logic to fetch active drivers
    return Math.floor(Math.random() * 10); // Random number between 0 and 10
};

// Helper function to simulate fetching active riders in a region
const getActiveRidersInRegion = async (coords) => {
    // Replace with actual logic to fetch active riders
    return Math.floor(Math.random() * 15); // Random number between 0 and 15
};

// Helper function to simulate fetching cancellation rate
const getCancellationRate = async () => {
    // Replace with actual logic to fetch cancellation rate
    return Math.random(); // Random value between 0 and 1
};