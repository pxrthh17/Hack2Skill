import React, { useEffect, useState } from 'react';
import apiClient from '../api/axiosInstance';
import { useSocket } from '../context/SocketContext';

const DriverDashboard = () => {
    const [pendingRides, setPendingRides] = useState([]);
    const [acceptedRides, setAcceptedRides] = useState([]);
    const [availability, setAvailability] = useState(true);
    const socket = useSocket();

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
                setPendingRides((prevRides) =>
                    prevRides.filter((ride) => ride._id !== rideDetails._id)
                );
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
        <div className="min-h-screen bg-gradient-to-br from-indigo-50 to-cyan-50 p-8">
            <div className="max-w-6xl mx-auto">
                {/* Header Section */}
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8">
                    <h2 className="text-4xl font-bold bg-gradient-to-r from-cyan-600 to-blue-700 bg-clip-text text-transparent mb-4 md:mb-0">
                        Driver Dashboard
                    </h2>

                    {/* Availability Toggle */}
                    <div className="flex items-center space-x-3 bg-white/80 backdrop-blur-sm p-3 rounded-xl shadow-sm">
                        <span className="text-sm font-medium text-gray-700">Availability:</span>
                        <label className="relative inline-flex items-center cursor-pointer">
                            <input
                                type="checkbox"
                                checked={availability}
                                onChange={(e) => setAvailability(e.target.checked)}
                                className="sr-only peer"
                            />
                            <div className="w-11 h-6 bg-gray-200 rounded-full peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-0.5 after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-gradient-to-r peer-checked:from-cyan-500 peer-checked:to-blue-600"></div>
                        </label>
                        <span className={`text-sm font-medium ${availability ? 'text-cyan-600' : 'text-gray-500'}`}>
                            {availability ? 'Available' : 'Offline'}
                        </span>
                    </div>
                </div>

                {/* Rides Container */}
                <div className="grid md:grid-cols-2 gap-8">
                    {/* Pending Rides Section */}
                    <div className="bg-white/80 backdrop-blur-sm p-6 rounded-2xl shadow-xl border border-white/20">
                        <h3 className="text-2xl font-bold bg-gradient-to-r from-cyan-600 to-blue-700 bg-clip-text text-transparent mb-6">
                            Pending Rides
                        </h3>

                        {pendingRides.length === 0 ? (
                            <div className="text-center p-6 text-gray-500">
                                No pending ride requests
                            </div>
                        ) : (
                            <div className="space-y-4">
                                {pendingRides.map((ride) => (
                                    <div key={ride._id} className="bg-gradient-to-br from-indigo-50 to-cyan-50 p-4 rounded-xl shadow-sm hover:shadow-md transition-shadow duration-200">
                                        <div className="flex items-start space-x-3">
                                            <div className="bg-cyan-100 p-2 rounded-lg">
                                                <span className="text-2xl">🚖</span>
                                            </div>
                                            <div className="flex-1">
                                                <div className="flex items-center space-x-2 mb-2">
                                                    <span className="font-medium text-cyan-700">Pickup:</span>
                                                    <p className="text-gray-700">{ride.pickupLocation}</p>
                                                </div>
                                                <div className="flex items-center space-x-2 mb-2">
                                                    <span className="font-medium text-cyan-700">Dropoff:</span>
                                                    <p className="text-gray-700">{ride.dropoffLocation}</p>
                                                </div>
                                                <div className="flex items-center space-x-2">
                                                    <span className="font-medium text-cyan-700">Rider:</span>
                                                    <p className="text-gray-700">{ride.rider.name}</p>
                                                </div>
                                                <button
                                                    onClick={() => handleAccept(ride._id)}
                                                    className="mt-3 w-full flex items-center justify-center space-x-2 bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white font-medium py-3 px-6 rounded-xl transition-all duration-300 hover:shadow-lg hover:scale-[1.02] active:scale-95 focus:outline-none focus:ring-2 focus:ring-green-300 focus:ring-offset-2"
                                                >
                                                    <svg
                                                        xmlns="http://www.w3.org/2000/svg"
                                                        className="w-5 h-5 text-green-100"
                                                        fill="none"
                                                        viewBox="0 0 24 24"
                                                        stroke="currentColor"
                                                        strokeWidth="2"
                                                    >
                                                        <path
                                                            strokeLinecap="round"
                                                            strokeLinejoin="round"
                                                            d="M5 13l4 4L19 7"
                                                        />
                                                    </svg>
                                                    <span className="text-sm font-semibold tracking-wide">Accept Ride</span>
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>

                    {/* Accepted Rides Section */}
                    <div className="bg-white/80 backdrop-blur-sm p-6 rounded-2xl shadow-xl border border-white/20">
                        <h3 className="text-2xl font-bold bg-gradient-to-r from-cyan-600 to-blue-700 bg-clip-text text-transparent mb-6">
                            Active Rides
                        </h3>

                        {acceptedRides.length === 0 ? (
                            <div className="text-center p-6 text-gray-500">
                                No active rides
                            </div>
                        ) : (
                            <div className="space-y-4">
                                {acceptedRides.map((ride) => (
                                    <div key={ride._id} className="bg-gradient-to-br from-indigo-50 to-cyan-50 p-4 rounded-xl shadow-sm hover:shadow-md transition-shadow duration-200">
                                        <div className="flex items-start space-x-3">
                                            <div className="bg-cyan-100 p-2 rounded-lg">
                                                <span className="text-2xl">📍</span>
                                            </div>
                                            <div className="flex-1">
                                                <div className="flex items-center space-x-2 mb-2">
                                                    <span className="font-medium text-cyan-700">Pickup:</span>
                                                    <p className="text-gray-700">{ride.pickupLocation}</p>
                                                </div>
                                                <div className="flex items-center space-x-2 mb-2">
                                                    <span className="font-medium text-cyan-700">Dropoff:</span>
                                                    <p className="text-gray-700">{ride.dropoffLocation}</p>
                                                </div>
                                                <div className="flex items-center space-x-2 mb-2">
                                                    <span className="font-medium text-cyan-700">Rider:</span>
                                                    <p className="text-gray-700">{ride.rider.name}</p>
                                                </div>
                                                <div className="flex items-center space-x-2 mb-3">
                                                    <span className="font-medium text-cyan-700">Price:</span>
                                                    <p className="text-gray-700 font-semibold">₹{ride.price}</p>
                                                </div>
                                                <button
                                                    onClick={() => handleCancel(ride._id)}
                                                    className="w-full flex items-center justify-center space-x-2 bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 text-white font-medium py-3 px-6 rounded-xl transition-all duration-300 hover:shadow-lg hover:scale-[1.02] active:scale-95 focus:outline-none focus:ring-2 focus:ring-red-300 focus:ring-offset-2"
                                                >
                                                    <svg
                                                        xmlns="http://www.w3.org/2000/svg"
                                                        className="w-5 h-5 text-red-100"
                                                        fill="none"
                                                        viewBox="0 0 24 24"
                                                        stroke="currentColor"
                                                        strokeWidth="2"
                                                    >
                                                        <path
                                                            strokeLinecap="round"
                                                            strokeLinejoin="round"
                                                            d="M6 18L18 6M6 6l12 12"
                                                        />
                                                    </svg>
                                                    <span className="text-sm font-semibold tracking-wide">Cancel Ride</span>
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default DriverDashboard;