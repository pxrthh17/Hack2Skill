import React, { useEffect, useState } from 'react';
import { useSocket } from '../context/SocketContext';

const RiderMap = () => {
    const socket = useSocket();
    const [driverLocation, setDriverLocation] = useState(null);

    useEffect(() => {
        if (socket) {
            socket.on('locationUpdate', ({ userId, location }) => {
                setDriverLocation(location);
            });
        }

        return () => {
            if (socket) {
                socket.off('locationUpdate');
            }
        };
    }, [socket]);

    return (
        <div className="min-h-screen bg-gradient-to-br from-indigo-50 to-cyan-50 p-8">
            <div className="max-w-4xl mx-auto bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl p-6 border border-white/20">
                {/* Header */}
                <div className="mb-8">
                    <h2 className="text-3xl font-bold bg-gradient-to-r from-cyan-600 to-blue-700 bg-clip-text text-transparent">
                        Live Driver Tracking
                    </h2>
                    <p className="text-gray-600 mt-2">Real-time updates of your driver's position</p>
                </div>

                {/* Location Display */}
                <div className="bg-gradient-to-br from-indigo-50 to-cyan-50 rounded-xl p-6 mb-8 shadow-sm">
                    {driverLocation ? (
                        <div className="flex items-center space-x-4">
                            <div className="bg-cyan-100 p-3 rounded-lg">
                                <svg className="w-6 h-6 text-cyan-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                                </svg>
                            </div>
                            <div>
                                <p className="text-sm text-cyan-600 font-medium">Driver's Current Position</p>
                                <div className="flex space-x-4 mt-2">
                                    <div>
                                        <span className="text-xs text-gray-500">Latitude</span>
                                        <p className="text-gray-700 font-mono">{driverLocation.lat.toFixed(6)}</p>
                                    </div>
                                    <div>
                                        <span className="text-xs text-gray-500">Longitude</span>
                                        <p className="text-gray-700 font-mono">{driverLocation.lng.toFixed(6)}</p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    ) : (
                        <div className="text-center p-6 text-gray-500">
                            <div className="flex flex-col items-center justify-center space-y-2">
                                <svg className="w-8 h-8 text-gray-400 animate-pulse" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                                </svg>
                                <p>Awaiting driver connection...</p>
                            </div>
                        </div>
                    )}
                </div>

                {/* Map Visualization (Mock) */}
                <div className="relative bg-gray-100 rounded-xl h-64 mb-8 overflow-hidden">
                    <div className="absolute inset-0 bg-gradient-to-br from-cyan-100 to-blue-100 opacity-50"></div>
                    {driverLocation && (
                        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2">
                            <div className="w-16 h-16 bg-cyan-500 rounded-full flex items-center justify-center shadow-lg animate-pulse">
                                <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7" />
                                </svg>
                            </div>
                        </div>
                    )}
                </div>

                {/* Status Indicator */}
                <div className="text-center text-sm text-gray-600">
                    {driverLocation ? (
                        <div className="flex items-center justify-center space-x-2 text-green-600">
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                            </svg>
                            <span>Live tracking active</span>
                        </div>
                    ) : (
                        <div className="flex items-center justify-center space-x-2 text-cyan-600">
                            <svg className="w-4 h-4 animate-pulse" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                            <span>Searching for nearby drivers...</span>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default RiderMap;