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
        <div>
            <h2>Rider Map</h2>
            {driverLocation ? (
                <p>Driver Location: {JSON.stringify(driverLocation)}</p>
            ) : (
                <p>Waiting for driver...</p>
            )}
        </div>
    );
};

export default RiderMap;