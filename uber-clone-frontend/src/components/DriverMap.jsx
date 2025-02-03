import React, { useEffect, useState } from 'react';
import { useSocket } from '../context/SocketContext';

const DriverMap = () => {
    const socket = useSocket();
    const [location, setLocation] = useState({ lat: 0, lng: 0 });

    const handleUpdateLocation = () => {
        const newLocation = { lat: Math.random() * 100, lng: Math.random() * 100 }; // Simulate location update
        setLocation(newLocation);
        socket.emit('updateLocation', { userId: 'driver123', location: newLocation });
    };

    return (
        <div>
            <h2>Driver Map</h2>
            <p>Current Location: {JSON.stringify(location)}</p>
            <button onClick={handleUpdateLocation} className="bg-blue-500 text-white px-4 py-2 rounded">
                Update Location
            </button>
        </div>
    );
};

export default DriverMap;