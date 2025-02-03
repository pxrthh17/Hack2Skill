const mongoose = require('mongoose');

const RideSchema = new mongoose.Schema(
    {
        rider: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User',
            required: true,
        },
        driver: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User',
        },
        pickupLocation: {
            type: String,
            required: true,
        },
        dropoffLocation: {
            type: String,
            required: true,
        },
        distance: {
            type: String, // Store as "X.XX km"
        },
        price: {
            type: String, // Store as "XX.XX"
        },
        status: {
            type: String,
            enum: ['pending', 'accepted', 'completed', 'canceled'], // Added 'canceled' status
            default: 'pending',
        },
        cancellationDetails: {
            canceledAt: {
                type: Date, // Timestamp when the ride was canceled
            },
            reason: {
                type: String, // Optional reason for cancellation
            },
        },
        driverLocationHistory: [
            {
                timestamp: {
                    type: Date,
                    default: Date.now,
                },
                location: {
                    type: {
                        lat: {
                            type: Number,
                            required: true,
                        },
                        lng: {
                            type: Number,
                            required: true,
                        },
                    },
                    required: true,
                },
            },
        ],
        dynamicPricingFactors: {
            timeOfDayFactor: {
                type: Number,
                default: 0,
            },
            weatherFactor: {
                type: Number,
                default: 0,
            },
            trafficFactor: {
                type: Number,
                default: 0,
            },
            activeDrivers: {
                type: Number,
                default: 0,
            },
            activeRiders: {
                type: Number,
                default: 0,
            },
            cancellationRate: {
                type: Number,
                default: 0,
            },
        },
    },
    { timestamps: true } // Adds createdAt and updatedAt fields
);

module.exports = mongoose.model('Ride', RideSchema);