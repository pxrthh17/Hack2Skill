import React, { useContext, useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { GoogleMap, Marker, DirectionsRenderer } from '@react-google-maps/api';
import apiClient from '../api/axiosInstance';
import { useSocket } from '../context/SocketContext';
import { MapContext } from '../context/MapContext';

const RiderDashboard = () => {
    const { isMapLoaded } = useContext(MapContext);
    const [rides, setRides] = useState([]);
    const [activeRide, setActiveRide] = useState(null);
    const [driverLocation, setDriverLocation] = useState(null);
    const [route, setRoute] = useState(null);
    const socket = useSocket();

    useEffect(() => {
        const fetchRides = async () => {
            try {
                const res = await apiClient.get('/rides/history');
                setRides(res.data);
            } catch (err) {
                console.error(err.response?.data?.msg || 'An error occurred');
            }
        };
        fetchRides();
    }, []);

    useEffect(() => {
        if (socket) {
            socket.on('rideAccepted', async ({ rideId, driverName, driverLocation }) => {
                setActiveRide({ rideId, driverName, status: 'accepted' });
                setDriverLocation(driverLocation);
                try {
                    const pickupCoords = { lat: driverLocation.lat, lng: driverLocation.lng };
                    const dropoffCoords = { lat: 19.076, lng: 72.8777 };
                    const res = await apiClient.post('/rides/fetch-route', { pickupCoords, dropoffCoords });
                    setRoute(res.data.route);
                } catch (err) {
                    console.error('Error fetching route:', err.response?.data?.msg || 'An error occurred');
                }
            });
        }
        return () => socket?.off('rideAccepted');
    }, [socket]);

    useEffect(() => {
        if (socket) {
            socket.on('driverLocationUpdated', ({ rideId, driverLocation }) => {
                if (activeRide?.rideId === rideId) setDriverLocation(driverLocation);
            });
        }
        return () => socket?.off('driverLocationUpdated');
    }, [socket, activeRide]);

    useEffect(() => {
        if (socket) {
            socket.on('rideCanceled', ({ rideId }) => {
                if (activeRide?.rideId === rideId) {
                    setActiveRide(null);
                    setDriverLocation(null);
                    setRoute(null);
                }
                setRides(prev => prev.map(ride => ride._id === rideId ? {...ride, status: 'canceled'} : ride));
            });
        }
        return () => socket?.off('rideCanceled');
    }, [socket, activeRide]);

    const cancelRide = async (rideId) => {
        try {
            await apiClient.post(`/rides/cancel-ride/${rideId}`);
            setRides(prev => prev.map(ride => ride._id === rideId ? {...ride, status: 'canceled'} : ride));
        } catch (error) {
            console.error('Error canceling ride:', error.response?.data?.msg || 'An error occurred');
        }
    };

    const mapStyles = {
        height: '300px',
        width: '100%',
        borderRadius: '1rem',
        boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
    };

    const defaultCenter = { lat: 19.076, lng: 72.8777 };

    return (
        <div className="min-h-screen bg-gradient-to-br from-indigo-50 to-cyan-50 p-8">
            <div className="max-w-6xl mx-auto">
                {/* Header Section */}
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8">
                    <h2 className="text-4xl font-bold bg-gradient-to-r from-cyan-600 to-blue-700 bg-clip-text text-transparent mb-4 md:mb-0">
                        Rider Dashboard
                    </h2>
                    <Link
                        to="/request-ride"
                        className="bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-600 hover:to-blue-700 text-white font-medium px-6 py-3 rounded-xl transition-all duration-300 hover:shadow-xl hover:scale-[1.02]"
                    >
                        Request a Ride
                    </Link>
                </div>

                {/* Active Ride Section */}
                {activeRide && (
                    <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl p-6 mb-8 border border-white/20">
                        <h3 className="text-2xl font-bold bg-gradient-to-r from-cyan-600 to-blue-700 bg-clip-text text-transparent mb-6">
                            Active Ride
                        </h3>

                        <div className="grid md:grid-cols-2 gap-6 mb-6">
                            <div className="space-y-3">
                                <div className="flex items-center space-x-3">
                                    <div className="bg-cyan-100 p-2 rounded-lg">
                                        <span className="text-2xl">🚕</span>
                                    </div>
                                    <div>
                                        <p className="text-sm text-cyan-600 font-medium">Driver</p>
                                        <p className="text-gray-700">{activeRide.driverName}</p>
                                    </div>
                                </div>
                                <div className="flex items-center space-x-3">
                                    <div className="bg-cyan-100 p-2 rounded-lg">
                                        <span className="text-2xl">📌</span>
                                    </div>
                                    <div>
                                        <p className="text-sm text-cyan-600 font-medium">Status</p>
                                        <p className="text-gray-700 capitalize">{activeRide.status}</p>
                                    </div>
                                </div>
                            </div>

                            {isMapLoaded && (
                                <GoogleMap
                                    mapContainerStyle={mapStyles}
                                    zoom={13}
                                    center={driverLocation || defaultCenter}
                                >
                                    {driverLocation && (
                                        <Marker
                                            position={{ lat: driverLocation.lat, lng: driverLocation.lng }}
                                            icon={{
                                                path: window.google.maps.SymbolPath.CIRCLE,
                                                scale: 7,
                                                fillColor: '#06b6d4',
                                                fillOpacity: 1,
                                                strokeColor: '#ffffff',
                                                strokeWeight: 2
                                            }}
                                        />
                                    )}
                                    {route && <DirectionsRenderer directions={{ routes: [{ overview_polyline: route }] }} />}
                                </GoogleMap>
                            )}
                        </div>

                        <button
                            onClick={() => cancelRide(activeRide.rideId)}
                            className="w-full bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 text-white font-medium py-2 px-4 rounded-lg transition-all duration-300 hover:shadow-lg hover:scale-[1.02]"
                        >
                            Cancel Ride
                        </button>
                    </div>
                )}

                {/* Ride History Section */}
                <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl p-6 border border-white/20">
                    <h3 className="text-2xl font-bold bg-gradient-to-r from-cyan-600 to-blue-700 bg-clip-text text-transparent mb-6">
                        Ride History
                    </h3>

                    {rides.length === 0 ? (
                        <div className="text-center p-6 text-gray-500">
                            No ride history available
                        </div>
                    ) : (
                        <div className="space-y-4">
                            {rides.map((ride) => (
                                <div key={ride._id} className="bg-gradient-to-br from-indigo-50 to-cyan-50 p-4 rounded-xl shadow-sm hover:shadow-md transition-shadow duration-200">
                                    <div className="grid md:grid-cols-4 gap-4">
                                        <div>
                                            <p className="text-sm text-cyan-600 font-medium">Pickup</p>
                                            <p className="text-gray-700">{ride.pickupLocation}</p>
                                        </div>
                                        <div>
                                            <p className="text-sm text-cyan-600 font-medium">Dropoff</p>
                                            <p className="text-gray-700">{ride.dropoffLocation}</p>
                                        </div>
                                        <div>
                                            <p className="text-sm text-cyan-600 font-medium">Price</p>
                                            <p className="text-gray-700">₹{ride.price}</p>
                                        </div>
                                        <div className="flex flex-col justify-between">
                                            <div>
                                                <p className="text-sm text-cyan-600 font-medium">Status</p>
                                                <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                                                    ride.status === 'completed' ? 'bg-green-100 text-green-800' :
                                                        ride.status === 'canceled' ? 'bg-red-100 text-red-800' :
                                                            'bg-cyan-100 text-cyan-800'
                                                }`}>
                                                    {ride.status}
                                                </span>
                                            </div>
                                            {['pending', 'accepted'].includes(ride.status) && (
                                                <button
                                                    onClick={() => cancelRide(ride._id)}
                                                    className="mt-2 flex items-center justify-center space-x-2 bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 text-white py-2 px-4 rounded-xl transition-all duration-300 hover:shadow-lg hover:scale-[1.02] active:scale-95 focus:outline-none focus:ring-2 focus:ring-red-300 focus:ring-offset-2"
                                                >
                                                    <svg
                                                        xmlns="http://www.w3.org/2000/svg"
                                                        className="w-4 h-4 text-red-100"
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
                                                    <span className="text-sm font-medium">Cancel Ride</span>
                                                </button>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default RiderDashboard;