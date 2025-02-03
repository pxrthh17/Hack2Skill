import React from 'react';
import { useAuth } from '../context/AuthContext';
import RiderDashboard from './RiderDashboard';
import DriverDashboard from './DriverDashboard';

const RoleBasedDashboard = () => {
    const { user } = useAuth();

    return user.role === 'driver' ? <DriverDashboard /> : <RiderDashboard />;
};

export default RoleBasedDashboard;