import React, { useState, useRef } from 'react';
import apiClient from '../api/axiosInstance';
import { useNavigate } from 'react-router-dom';
import { GoogleMap, Polyline } from '@react-google-maps/api';

const RequestRide = () => {
    const [formData, setFormData] = useState({ pickupLocation: '', dropoffLocation: '' });
    const [estimatedPrice, setEstimatedPrice] = useState(null);
    const [mapCenter, setMapCenter] = useState(null);
    const [markers, setMarkers] = useState([]);
    const [route, setRoute] = useState(null);
    const [error, setError] = useState('');
    const navigate = useNavigate();
    const mapRef = useRef(null);

    const onMapLoad = (map) => {
        mapRef.current = map;
    };

    const estimatePrice = async () => {
        if (!formData.pickupLocation.trim() || !formData.dropoffLocation.trim()) {
            setError('Both pickup and dropoff locations are required.');
            return;
        }

        try {
            const res = await apiClient.post('/rides/estimate-price', formData);
            const { totalPrice, pickupCoords, dropoffCoords } = res.data;

            if (isNaN(totalPrice)) throw new Error('Invalid price received');

            setEstimatedPrice(parseFloat(totalPrice));
            setMapCenter(pickupCoords);
            setError('');

            // Fetch route first
            const routeRes = await apiClient.post('/rides/fetch-route', {
                pickupCoords,
                dropoffCoords
            });
            setRoute(routeRes.data.route);

            // Clear existing markers and set new ones
            if (mapRef.current) {
                // Clear previous markers
                const existingMarkers = mapRef.current.__markers || [];
                existingMarkers.forEach(marker => marker.map = null);
                mapRef.current.__markers = [];

                // Add new markers using API response coordinates
                [pickupCoords, dropoffCoords].forEach((coords, index) => {
                    const label = index === 0 ? 'Pickup' : 'Dropoff';
                    const advancedMarker = new window.google.maps.marker.AdvancedMarkerElement({
                        map: mapRef.current,
                        position: { lat: coords.lat, lng: coords.lng },
                        title: label,
                    });
                    mapRef.current.__markers.push(advancedMarker);
                });
            }

            setMarkers([pickupCoords, dropoffCoords]);

        } catch (err) {
            console.error('Error estimating price:', err.response?.data?.msg || err.message);
            // setError('Failed to estimate price. Please check your locations.');
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            await apiClient.post('/rides/create', formData);
            navigate('/');
        } catch (err) {
            console.error('Error creating ride:', err.response?.data?.msg || 'An error occurred');
            // setError('Failed to create ride. Please try again.');
        }
    };

    const mapStyles = {
        height: '400px',
        width: '100%',
        borderRadius: '1rem',
        boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-indigo-50 to-cyan-50 p-8 flex items-center justify-center">
            <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl p-8 w-full max-w-3xl border border-white/20">
                <h2 className="text-3xl font-bold bg-gradient-to-r from-cyan-600 to-blue-700 bg-clip-text text-transparent text-center mb-8">
                    Request a Ride
                </h2>

                <form onSubmit={handleSubmit} className="space-y-6">
                    <div className="grid md:grid-cols-2 gap-6">
                        {/* Pickup Location Input */}
                        <div className="relative">
                            <input
                                type="text"
                                name="pickupLocation"
                                placeholder="Enter pickup location"
                                value={formData.pickupLocation}
                                onChange={(e) => setFormData({ ...formData, pickupLocation: e.target.value })}
                                onBlur={estimatePrice}
                                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500 transition-all duration-200 placeholder-gray-400"
                                required
                            />
                            <div className="absolute inset-y-0 right-3 flex items-center pointer-events-none">
                                <svg className="w-5 h-5 text-cyan-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                                </svg>
                            </div>
                        </div>

                        {/* Dropoff Location Input */}
                        <div className="relative">
                            <input
                                type="text"
                                name="dropoffLocation"
                                placeholder="Enter dropoff location"
                                value={formData.dropoffLocation}
                                onChange={(e) => setFormData({ ...formData, dropoffLocation: e.target.value })}
                                onBlur={estimatePrice}
                                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500 transition-all duration-200 placeholder-gray-400"
                                required
                            />
                            <div className="absolute inset-y-0 right-3 flex items-center pointer-events-none">
                                <svg className="w-5 h-5 text-cyan-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                                </svg>
                            </div>
                        </div>
                    </div>

                    {/* Price Estimation Display */}
                    {estimatedPrice && (
                        <div className="bg-gradient-to-br from-green-50 to-cyan-50 p-4 rounded-xl text-center">
                            <p className="text-lg font-semibold text-green-600">
                                Estimated Price:
                                <span className="ml-2 text-2xl">₹{estimatedPrice.toFixed(2)}</span>
                            </p>
                        </div>
                    )}

                    {/* Error Message Display */}
                    {error && (
                        <div className="bg-red-50 p-4 rounded-xl flex items-center justify-center space-x-2 text-red-600">
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                            </svg>
                            <span>{error}</span>
                        </div>
                    )}

                    {/* Map Display */}
                    {mapCenter && (
                        <div className="rounded-xl overflow-hidden">
                            <GoogleMap
                                mapContainerStyle={mapStyles}
                                zoom={13}
                                center={mapCenter}
                                onLoad={onMapLoad}
                            >
                                {route && (
                                    <Polyline
                                        path={decodePolyline(route)}
                                        options={{
                                            strokeColor: '#06b6d4',
                                            strokeOpacity: 0.8,
                                            strokeWeight: 4,
                                            icons: [{
                                                icon: {
                                                    path: window.google.maps.SymbolPath.FORWARD_CLOSED_ARROW,
                                                    strokeColor: '#06b6d4',
                                                    scale: 3
                                                },
                                                offset: '100%',
                                                repeat: '100px'
                                            }]
                                        }}
                                    />
                                )}
                            </GoogleMap>
                        </div>
                    )}

                    {/* Submit Button */}
                    <button
                        type="submit"
                        className="w-full bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-600 hover:to-blue-700 text-white font-medium py-3 px-6 rounded-lg transition-all duration-300 hover:shadow-xl hover:scale-[1.02]"
                    >
                        Request Ride Now
                    </button>
                </form>
            </div>
        </div>
    );
};

// Polyline Decoding Function
const decodePolyline = (encoded) => {
    const points = [];
    let index = 0, len = encoded.length;
    let lat = 0, lng = 0;

    while (index < len) {
        let b, shift = 0, result = 0;
        do {
            b = encoded.charCodeAt(index++) - 63;
            result |= (b & 0x1f) << shift;
            shift += 5;
        } while (b >= 0x20);

        const dlat = ((result & 1) ? ~(result >> 1) : (result >> 1));
        lat += dlat;
        shift = 0;
        result = 0;

        do {
            b = encoded.charCodeAt(index++) - 63;
            result |= (b & 0x1f) << shift;
            shift += 5;
        } while (b >= 0x20);

        const dlng = ((result & 1) ? ~(result >> 1) : (result >> 1));
        lng += dlng;

        points.push({
            lat: lat / 1e5,
            lng: lng / 1e5
        });
    }

    return points;
};

export default RequestRide;