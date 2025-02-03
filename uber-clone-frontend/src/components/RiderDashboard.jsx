import React, { useContext, useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { GoogleMap, Marker, DirectionsRenderer } from '@react-google-maps/api';
import apiClient from '../api/axiosInstance';
import { useSocket } from '../context/SocketContext';
import { MapContext } from '../context/MapContext';

const RiderDashboard = () => {
    const { isMapLoaded } = useContext(MapContext); // Get map loading state
    const [rides, setRides] = useState([]); // Ride history
    const [activeRide, setActiveRide] = useState(null); // Current active ride
    const [driverLocation, setDriverLocation] = useState(null); // Driver's real-time location
    const [route, setRoute] = useState(null); // Encoded route for DirectionsRenderer
    const socket = useSocket();

    // Fetch ride history
    useEffect(() => {
        const fetchRides = async () => {
            try {
                const res = await apiClient.get('/rides/history'); // Fetch ride history
                setRides(res.data);
            } catch (err) {
                console.error(err.response?.data?.msg || 'An error occurred');
            }
        };
        fetchRides();
    }, []);

    // Listen for ride acceptance
    useEffect(() => {
        if (socket) {
            socket.on('rideAccepted', async ({ rideId, driverName, driverLocation }) => {
                setActiveRide({
                    rideId,
                    driverName,
                    status: 'accepted',
                });
                setDriverLocation(driverLocation); // Update driver's initial location

                // Fetch the route for the active ride
                try {
                    const pickupCoords = { lat: driverLocation.lat, lng: driverLocation.lng }; // Initial driver location
                    const dropoffCoords = { lat: 19.076, lng: 72.8777 }; // Default dropoff (replace with actual dropoff)
                    const res = await apiClient.post('/rides/fetch-route', { pickupCoords, dropoffCoords });
                    setRoute(res.data.route); // Set the encoded route for DirectionsRenderer
                } catch (err) {
                    console.error('Error fetching route:', err.response?.data?.msg || 'An error occurred');
                }
            });
        }
        return () => {
            if (socket) {
                socket.off('rideAccepted');
            }
        };
    }, [socket]);

    // Listen for driver location updates
    useEffect(() => {
        if (socket) {
            socket.on('driverLocationUpdated', ({ rideId, driverLocation }) => {
                if (activeRide && activeRide.rideId === rideId) {
                    setDriverLocation(driverLocation); // Update driver's real-time location
                }
            });
        }
        return () => {
            if (socket) {
                socket.off('driverLocationUpdated');
            }
        };
    }, [socket, activeRide]);

    // Listen for ride cancellation
    useEffect(() => {
        if (socket) {
            socket.on('rideCanceled', ({ rideId }) => {
                if (activeRide && activeRide.rideId === rideId) {
                    setActiveRide(null); // Clear the active ride
                    setDriverLocation(null); // Clear the driver's location
                    setRoute(null); // Clear the route
                }

                // Update the ride history to reflect the canceled ride
                setRides((prevRides) =>
                    prevRides.map((ride) =>
                        ride._id === rideId ? { ...ride, status: 'canceled' } : ride
                    )
                );
            });
        }
        return () => {
            if (socket) {
                socket.off('rideCanceled');
            }
        };
    }, [socket, activeRide]);

    // Function to cancel a ride
    const cancelRide = async (rideId) => {
        try {
            await apiClient.post(`/rides/cancel-ride/${rideId}`); // Make sure the URL matches the backend route
            console.log('Ride canceled successfully');

            // Update the ride history to reflect the canceled ride
            setRides((prevRides) =>
                prevRides.map((ride) =>
                    ride._id === rideId ? { ...ride, status: 'canceled' } : ride
                )
            );
        } catch (error) {
            console.error('Error canceling ride:', error.response?.data?.msg || 'An error occurred');
        }
    };

    // Map container styles
    const mapStyles = {
        height: '300px',
        width: '100%',
    };

    const defaultCenter = {
        lat: 19.076, // Default latitude (Mumbai)
        lng: 72.8777, // Default longitude (Mumbai)
    };

    return (
        <div className="p-8 bg-gray-100 min-h-screen">
            <h2 className="text-3xl font-bold text-gray-800 mb-6">Rider Dashboard</h2>

            {/* Request Ride Button */}
            <Link
                to="/request-ride"
                className="inline-flex items-center justify-center px-6 py-3 border border-transparent text-base font-medium rounded-md shadow-sm text-white bg-gradient-to-r from-indigo-500 to-purple-500 hover:from-indigo-600 hover:to-purple-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition duration-300 ease-in-out"
            >
                Request a Ride
            </Link>

            {/* Active Ride Section */}
            {activeRide && (
                <div className="mt-8 p-6 bg-white rounded-lg shadow-lg">
                    <h3 className="text-xl font-semibold text-gray-800 mb-4">Active Ride</h3>
                    <div className="space-y-2">
                        <p><strong>Status:</strong> {activeRide.status}</p>
                        <p><strong>Driver:</strong> {activeRide.driverName}</p>
                    </div>

                    {/* Real-Time Driver Location Map */}
                    {isMapLoaded && (
                        <div className="mt-4">
                            <GoogleMap
                                mapContainerStyle={mapStyles}
                                zoom={13}
                                center={driverLocation ? { lat: driverLocation.lat, lng: driverLocation.lng } : defaultCenter}
                            >
                                {/* Render the driver's marker */}
                                {driverLocation && (
                                    <Marker position={{ lat: driverLocation.lat, lng: driverLocation.lng }} label="Driver" />
                                )}

                                {/* Render the route between pickup and dropoff */}
                                {route && <DirectionsRenderer directions={{ routes: [{ overview_polyline: route }] }} />}
                            </GoogleMap>
                        </div>
                    )}

                    {/* Cancel Ride Button */}
                    <button
                        onClick={() => cancelRide(activeRide.rideId)}
                        className="mt-4 inline-flex items-center justify-center px-6 py-3 border border-transparent text-base font-medium rounded-md shadow-sm text-white bg-red-500 hover:bg-red-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 transition duration-300 ease-in-out"
                    >
                        Cancel Ride
                    </button>
                </div>
            )}

            {/* Ride History Section */}
            <div className="mt-8">
                <h3 className="text-2xl font-bold text-gray-800 mb-4">Ride History</h3>
                {rides.length === 0 ? (
                    <p className="text-gray-500">No ride history available.</p>
                ) : (
                    <ul className="space-y-4">
                        {rides.map((ride) => (
                            <li key={ride._id} className="p-4 bg-white rounded-lg shadow-sm">
                                <p><strong>Pickup:</strong> {ride.pickupLocation}</p>
                                <p><strong>Dropoff:</strong> {ride.dropoffLocation}</p>
                                <p><strong>Distance:</strong> {ride.distance}</p>
                                <p><strong>Price:</strong> ${ride.price}</p>
                                <p><strong>Status:</strong> {ride.status}</p>

                                {/* Cancel Button for Pending or Accepted Rides */}
                                {['pending', 'accepted'].includes(ride.status) && (
                                    <button
                                        onClick={() => cancelRide(ride._id)}
                                        className="mt-2 inline-flex items-center justify-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-red-500 hover:bg-red-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 transition duration-300 ease-in-out"
                                    >
                                        Cancel Ride
                                    </button>
                                )}
                            </li>
                        ))}
                    </ul>
                )}
            </div>
        </div>
    );
};

export default RiderDashboard;