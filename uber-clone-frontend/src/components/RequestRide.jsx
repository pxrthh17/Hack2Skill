import React, { useState, useRef } from 'react';
import apiClient from '../api/axiosInstance';
import { useNavigate } from 'react-router-dom';
import { GoogleMap, Polyline } from '@react-google-maps/api';

const RequestRide = () => {
    const [formData, setFormData] = useState({ pickupLocation: '', dropoffLocation: '' });
    const [estimatedPrice, setEstimatedPrice] = useState(null);
    const [mapCenter, setMapCenter] = useState(null);
    const [markers, setMarkers] = useState([]);
    const [route, setRoute] = useState(null); // Store the route (polyline)
    const [error, setError] = useState('');
    const navigate = useNavigate();

    // Reference to the Google Maps instance
    const mapRef = useRef(null);

    // Function to handle map load and store the map instance
    const onMapLoad = (map) => {
        mapRef.current = map;
    };

    const estimatePrice = async () => {
        if (!formData.pickupLocation.trim() || !formData.dropoffLocation.trim()) {
            setError('Both pickup and dropoff locations are required.');
            return;
        }

        try {
            // Call the backend to estimate the price
            const res = await apiClient.post('/rides/estimate-price', formData);
            const { distance, totalPrice, pickupCoords, dropoffCoords } = res.data;

            if (isNaN(totalPrice)) {
                throw new Error('Invalid price received from the backend');
            }

            // Update state with estimated price and coordinates
            setEstimatedPrice(parseFloat(totalPrice));
            setMapCenter(pickupCoords);
            setMarkers([pickupCoords, dropoffCoords]);
            setError('');

            // Fetch the route between pickup and dropoff
            const routeRes = await apiClient.post('/rides/fetch-route', { pickupCoords, dropoffCoords });
            setRoute(routeRes.data.route);

            // Clear existing markers
            if (mapRef.current) {
                const existingMarkers = mapRef.current.__markers || [];
                existingMarkers.forEach(marker => marker.map.remove());
                mapRef.current.__markers = [];
            }

            // Add new markers using AdvancedMarkerElement
            if (mapRef.current) {
                markers.forEach((marker, index) => {
                    const label = index === 0 ? 'Pickup' : 'Dropoff';
                    const advancedMarker = new google.maps.marker.AdvancedMarkerElement({
                        map: mapRef.current,
                        position: { lat: marker.lat, lng: marker.lng },
                        title: label,
                    });

                    // Store the marker reference
                    if (!mapRef.current.__markers) {
                        mapRef.current.__markers = [];
                    }
                    mapRef.current.__markers.push(advancedMarker);
                });
            }
        } catch (err) {
            console.error('Error estimating price:', err.response?.data?.msg || 'An error occurred');
            setError('Failed to estimate price. Please check your locations.');
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            // Create the ride request
            await apiClient.post('/rides/create', formData);
            navigate('/');
        } catch (err) {
            console.error('Error creating ride:', err.response?.data?.msg || 'An error occurred');
            setError('Failed to create ride. Please try again.');
        }
    };

    const mapStyles = {
        height: '300px',
        width: '100%',
    };

    return (
        <div className="flex items-center justify-center min-h-screen bg-gray-100">
            <form onSubmit={handleSubmit} className="bg-white p-8 rounded shadow-md w-96">
                <h2 className="text-2xl font-bold mb-4 text-center">Request a Ride</h2>

                {/* Pickup Location Input */}
                <input
                    type="text"
                    name="pickupLocation"
                    placeholder="Pickup Location (e.g., Mumbai)"
                    value={formData.pickupLocation}
                    onChange={(e) => setFormData({ ...formData, pickupLocation: e.target.value })}
                    onBlur={estimatePrice}
                    className="w-full p-2 mb-4 border rounded"
                    required
                />

                {/* Dropoff Location Input */}
                <input
                    type="text"
                    name="dropoffLocation"
                    placeholder="Dropoff Location (e.g., New York)"
                    value={formData.dropoffLocation}
                    onChange={(e) => setFormData({ ...formData, dropoffLocation: e.target.value })}
                    onBlur={estimatePrice}
                    className="w-full p-2 mb-4 border rounded"
                    required
                />

                {/* Display Estimated Price */}
                {estimatedPrice && typeof estimatedPrice === 'number' && (
                    <p className="text-green-600 text-center mb-4">
                        Estimated Price: ${estimatedPrice.toFixed(2)}
                    </p>
                )}

                {/* Display Error Message */}
                {error && <p className="text-red-500 text-center mb-4">{error}</p>}

                {/* Google Map */}
                {mapCenter && (
                    <div className="mb-4">
                        <GoogleMap
                            mapContainerStyle={mapStyles}
                            zoom={13}
                            center={mapCenter}
                            onLoad={onMapLoad} // Get the map instance
                        >
                            {route && (
                                <Polyline
                                    path={decodePolyline(route)} // Decode the polyline
                                    options={{
                                        strokeColor: '#FF0000',
                                        strokeOpacity: 0.75,
                                        strokeWeight: 3,
                                    }}
                                />
                            )}
                        </GoogleMap>
                    </div>
                )}

                {/* Submit Button */}
                <button
                    type="submit"
                    className="w-full bg-blue-500 text-white p-2 rounded hover:bg-blue-600"
                >
                    Request Ride
                </button>
            </form>
        </div>
    );
};

// Helper function to decode the polyline
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

        points.push({ lat: lat / 1e5, lng: lng / 1e5 });
    }

    return points;
};

export default RequestRide;