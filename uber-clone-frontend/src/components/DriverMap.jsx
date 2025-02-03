import React, { useEffect, useState } from 'react';
import { useSocket } from '../context/SocketContext';

const DriverMap = () => {
    const socket = useSocket();
    const [location, setLocation] = useState({ lat: 0, lng: 0 });

    const handleUpdateLocation = () => {
        const newLocation = { lat: Math.random() * 100, lng: Math.random() * 100 };
        setLocation(newLocation);
        socket.emit('updateLocation', { userId: 'driver123', location: newLocation });
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-indigo-50 to-cyan-50 p-8">
            <div className="max-w-4xl mx-auto bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl p-6 border border-white/20">
                {/* Header */}
                <div className="mb-8">
                    <h2 className="text-3xl font-bold bg-gradient-to-r from-cyan-600 to-blue-700 bg-clip-text text-transparent">
                        Live Location Tracking
                    </h2>
                    <p className="text-gray-600 mt-2">Real-time position updates for your vehicle</p>
                </div>

                {/* Location Display */}
                <div className="bg-gradient-to-br from-indigo-50 to-cyan-50 rounded-xl p-6 mb-8 shadow-sm">
                    <div className="flex items-center space-x-4">
                        <div className="bg-cyan-100 p-3 rounded-lg">
                            <svg className="w-6 h-6 text-cyan-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                            </svg>
                        </div>
                        <div>
                            <p className="text-sm text-cyan-600 font-medium">Current Coordinates</p>
                            <div className="flex space-x-4">
                                <div>
                                    <span className="text-xs text-gray-500">Latitude</span>
                                    <p className="text-gray-700 font-mono">{location.lat.toFixed(6)}</p>
                                </div>
                                <div>
                                    <span className="text-xs text-gray-500">Longitude</span>
                                    <p className="text-gray-700 font-mono">{location.lng.toFixed(6)}</p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Map Visualization (Mock) */}
                <div className="relative bg-gray-100 rounded-xl h-64 mb-8 overflow-hidden">
                    <div className="absolute inset-0 bg-gradient-to-br from-cyan-100 to-blue-100 opacity-50"></div>
                    <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2">
                        <div className="w-16 h-16 bg-cyan-500 rounded-full flex items-center justify-center shadow-lg">
                            <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7" />
                            </svg>
                        </div>
                    </div>
                </div>

                {/* Update Button */}
                <button
                    onClick={handleUpdateLocation}
                    className="w-full bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-600 hover:to-blue-700 text-white font-medium py-3 px-6 rounded-lg transition-all duration-300 hover:shadow-xl hover:scale-[1.02] flex items-center justify-center space-x-2"
                >
                    <svg className="w-5 h-5 text-cyan-200" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                    </svg>
                    <span>Update Location</span>
                </button>
            </div>
        </div>
    );
};

export default DriverMap;