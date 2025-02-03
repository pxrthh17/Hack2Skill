import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import App from './App';
import Register from './components/Register';
import Login from './components/Login';
import RequestRide from './components/RequestRide';
import RoleBasedDashboard from './components/RoleBasedDashboard'; // Role-based dashboard
import RiderMap from './components/RiderMap';
import DriverMap from './components/DriverMap';
import { SocketProvider } from './context/SocketContext';
import { AuthProvider } from './context/AuthContext'; // Authentication context
import ProtectedRoute from './components/ProtectedRoute'; // Protected routes
import { MapProvider } from './context/MapContext'; // Map context
import './index.css';

ReactDOM.createRoot(document.getElementById('root')).render(
    <React.StrictMode>
        {/* Wrap the app with AuthProvider for authentication state management */}
        <AuthProvider>
            {/* Wrap the app with SocketProvider for real-time communication */}
            <SocketProvider>
                {/* Wrap the app with MapProvider for centralized map script loading */}
                <MapProvider>
                    <Router>
                        <Routes>
                            {/* Public Routes */}
                            <Route path="/" element={<App />} />
                            <Route path="/register" element={<Register />} />
                            <Route path="/login" element={<Login />} />

                            {/* Protected Routes */}
                            <Route
                                path="/dashboard"
                                element={
                                    <ProtectedRoute>
                                        <RoleBasedDashboard /> {/* Role-based dashboard */}
                                    </ProtectedRoute>
                                }
                            />
                            <Route
                                path="/request-ride"
                                element={
                                    <ProtectedRoute>
                                        <RequestRide />
                                    </ProtectedRoute>
                                }
                            />
                            <Route
                                path="/rider-map"
                                element={
                                    <ProtectedRoute>
                                        <RiderMap />
                                    </ProtectedRoute>
                                }
                            />
                            <Route
                                path="/driver-map"
                                element={
                                    <ProtectedRoute>
                                        <DriverMap />
                                    </ProtectedRoute>
                                }
                            />
                        </Routes>
                    </Router>
                </MapProvider>
            </SocketProvider>
        </AuthProvider>
    </React.StrictMode>
);