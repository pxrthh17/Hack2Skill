import React from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from './context/AuthContext.jsx';

const App = () => {
    const { user, logout } = useAuth();

    return (
        <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100">
            <h1 className="text-3xl font-bold mb-4">Uber Clone</h1>
            <nav className="space-x-4">
                {!user && (
                    <>
                        <Link to="/register" className="text-blue-500 hover:underline">
                            Register
                        </Link>
                        <Link to="/login" className="text-blue-500 hover:underline">
                            Login
                        </Link>
                    </>
                )}
                {user && (
                    <>
                        <Link to="/dashboard" className="text-blue-500 hover:underline">
                            Dashboard
                        </Link>
                        <button
                            onClick={logout}
                            className="text-red-500 hover:underline focus:outline-none"
                        >
                            Logout
                        </button>
                    </>
                )}
            </nav>
        </div>
    );
};

export default App;