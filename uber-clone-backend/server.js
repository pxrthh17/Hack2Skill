const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const dotenv = require('dotenv');
const http = require('http');
const socketIo = require('socket.io');

dotenv.config();

const app = express();
app.use(express.json());
app.use(cors());

// Connect to MongoDB
mongoose.connect(process.env.MONGO_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
}).then(() => console.log('MongoDB connected'))
    .catch(err => console.log(err));

// Routes
app.use('/api/auth', require('./routes/auth'));
app.use('/api/rides', require('./routes/ride'));

// Create HTTP server
const server = http.createServer(app);

// Initialize Socket.IO
const io = socketIo(server, {
    cors: {
        origin: ["http://localhost:5174", "http://localhost:5173"],
        methods: ['GET', 'POST'],
    },
});

// Export the io object for use in other files
module.exports.io = io;

// Store connected users (drivers and riders)
const activeUsers = {};

// Listen for socket connections
io.on('connection', (socket) => {
    console.log('A user connected:', socket.id);

    // Handle location updates from drivers
    socket.on('updateLocation', ({ userId, location }) => {
        io.emit('locationUpdate', { userId, location }); // Broadcast to all clients
    });

    // Handle new ride requests
    socket.on('newRideRequest', ({ rideId, pickupLocation, dropoffLocation }) => {
        io.emit('newRideRequest', { rideId, pickupLocation, dropoffLocation });
    });

    // Handle ride acceptance
    socket.on('rideAccepted', ({ rideId, driverId }) => {
        io.emit('rideAccepted', { rideId, driverId });
    });

    // Handle disconnection
    socket.on('disconnect', () => {
        console.log('A user disconnected:', socket.id);
        const userId = Object.keys(activeUsers).find((key) => activeUsers[key] === socket.id);
        if (userId) {
            delete activeUsers[userId];
        }
    });
});

// Start the server
const PORT = process.env.PORT || 5000;
server.listen(PORT, () => console.log(`Server running on port ${PORT}`));