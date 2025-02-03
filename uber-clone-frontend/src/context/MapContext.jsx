import React, { createContext, useState } from 'react';
import { LoadScript } from '@react-google-maps/api';

export const MapContext = createContext();

export const MapProvider = ({ children }) => {
    const [isMapLoaded, setIsMapLoaded] = useState(false);

    return (
        <MapContext.Provider value={{ isMapLoaded }}>
            {!isMapLoaded && (
                <LoadScript
                    googleMapsApiKey={import.meta.env.VITE_GOOGLE_MAPS_API_KEY} // Use Vite's env syntax
                    onLoad={() => setIsMapLoaded(true)} // Mark map as loaded
                />
            )}
            {children}
        </MapContext.Provider>
    );
};