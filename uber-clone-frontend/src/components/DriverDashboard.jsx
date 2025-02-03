import React, { useEffect, useState } from 'react';
import apiClient from '../api/axiosInstance';
import { useSocket } from '../context/SocketContext';

const DriverDashboard = () => {
    const [pendingRides, setPendingRides] = useState([]);
    const [acceptedRides, setAcceptedRides] = useState([]);
    const [availability, setAvailability] = useState(true);
    const socket = useSocket(); // Use the SocketContext to access the WebSocket connection

    // Fetch pending rides
    useEffect(() => {
        const fetchPendingRides = async () => {
            try {
                const res = await apiClient.get('/rides/pending');
                setPendingRides(res.data);
            } catch (err) {
                console.error(err.response?.data?.msg || 'An error occurred');
            }
        };
        fetchPendingRides();
    }, []);

    // Fetch accepted rides
    useEffect(() => {
        const fetchAcceptedRides = async () => {
            try {
                const res = await apiClient.get('/rides/accepted');
                setAcceptedRides(res.data);
            } catch (err) {
                console.error(err.response?.data?.msg || 'An error occurred');
            }
        };
        fetchAcceptedRides();
    }, []);

    // Listen for ride acceptance events
    useEffect(() => {
        if (socket) {
            socket.on('rideAccepted', ({ rideDetails }) => {
                // Remove the ride from pending rides
                setPendingRides((prevRides) =>
                    prevRides.filter((ride) => ride._id !== rideDetails._id)
                );

                // Add the ride to accepted rides
                setAcceptedRides((prevRides) => [...prevRides, rideDetails]);
            });
        }

        return () => {
            if (socket) {
                socket.off('rideAccepted');
            }
        };
    }, [socket]);

    // Handle accepting a ride
    const handleAccept = async (id) => {
        try {
            await apiClient.put(`/rides/accept/${id}`);
            setPendingRides((prevRides) => prevRides.filter((ride) => ride._id !== id));
        } catch (err) {
            console.error(err.response?.data?.msg || 'An error occurred');
        }
    };

    // Handle canceling a ride
    const handleCancel = async (id) => {
        try {
            await apiClient.post(`/rides/cancel-ride/${id}`);
            setAcceptedRides((prevRides) => prevRides.filter((ride) => ride._id !== id));
        } catch (err) {
            console.error(err.response?.data?.msg || 'An error occurred');
        }
    };

    return (
        <div className="p-8 bg-gray-100 min-h-screen">
            <h2 className="text-3xl font-bold text-gray-800 mb-6">Driver Dashboard</h2>

            {/* Availability Toggle */}
            <div className="mb-6 flex items-center space-x-4">
                <label className="text-gray-700 font-medium">Availability:</label>
                <input
                    type="checkbox"
                    checked={availability}
                    onChange={(e) => setAvailability(e.target.checked)}
                    className="rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
                />
                <span className="ml-2">{availability ? 'Available' : 'Unavailable'}</span>
            </div>

            {/* Pending Rides Section */}
            <h3 className="text-2xl font-bold text-gray-800 mb-4">Pending Rides</h3>
            {pendingRides.length === 0 ? (
                <p className="text-gray-500">No pending rides available.</p>
            ) : (
                <ul className="space-y-4">
                    {pendingRides.map((ride) => (
                        <li key={ride._id} className="p-4 bg-white rounded-lg shadow-sm">
                            <p><strong>Pickup:</strong> {ride.pickupLocation}</p>
                            <p><strong>Dropoff:</strong> {ride.dropoffLocation}</p>
                            <p><strong>Rider:</strong> {ride.rider.name}</p>
                            <button
                                onClick={() => handleAccept(ride._id)}
                                className="mt-2 w-full inline-flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 transition duration-300 ease-in-out"
                            >
                                Accept Ride
                            </button>
                        </li>
                    ))}
                </ul>
            )}

            {/* Accepted Rides Section */}
            <h3 className="text-2xl font-bold text-gray-800 mt-8 mb-4">Accepted Rides</h3>
            {acceptedRides.length === 0 ? (
                <p className="text-gray-500">No accepted rides available.</p>
            ) : (
                <ul className="space-y-4">
                    {acceptedRides.map((ride) => (
                        <li key={ride._id} className="p-4 bg-white rounded-lg shadow-sm">
                            <p><strong>Pickup:</strong> {ride.pickupLocation}</p>
                            <p><strong>Dropoff:</strong> {ride.dropoffLocation}</p>
                            <p><strong>Rider:</strong> {ride.rider.name}</p>
                            <p><strong>Price:</strong> ${ride.price}</p>
                            <button
                                onClick={() => handleCancel(ride._id)}
                                className="mt-2 w-full inline-flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 transition duration-300 ease-in-out"
                            >
                                Cancel Ride
                            </button>
                        </li>
                    ))}
                </ul>
            )}
        </div>
    );
};

export default DriverDashboard;