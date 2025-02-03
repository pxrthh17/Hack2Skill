import React from 'react';
import { Link } from 'react-router-dom';

const LandingPage = () => {
    return (
        <div className="bg-gray-100 min-h-screen">
            {/* Hero Section */}
            <section className="bg-gradient-to-br from-indigo-600 to-purple-600 text-white py-20">
                <div className="container mx-auto px-4 text-center">
                    <h1 className="text-5xl font-bold mb-4 animate-fade-in">Welcome to Uber Clone</h1>
                    <p className="text-xl mb-8 animate-fade-in">Your ultimate ride-sharing solution with real-time tracking and dynamic pricing.</p>
                    <div className="space-x-4 animate-fade-in">
                        <Link
                            to="/register"
                            className="inline-block px-6 py-3 bg-white text-indigo-600 font-medium rounded-md shadow-md hover:bg-gray-100 transition duration-300"
                        >
                            Register
                        </Link>
                        <Link
                            to="/login"
                            className="inline-block px-6 py-3 bg-transparent border border-white text-white font-medium rounded-md shadow-md hover:bg-white hover:text-indigo-600 transition duration-300"
                        >
                            Login
                        </Link>
                    </div>
                </div>
            </section>

            {/* Features Section */}
            <section className="py-20 bg-gray-100">
                <div className="container mx-auto px-4">
                    <h2 className="text-4xl font-bold text-center text-gray-800 mb-12">Why Choose Us?</h2>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                        {/* Feature 1 */}
                        <div className="text-center p-6 bg-white rounded-lg shadow-lg transform hover:scale-105 transition-transform duration-300">
                            <svg
                                xmlns="http://www.w3.org/2000/svg"
                                className="h-12 w-12 mx-auto text-indigo-500 mb-4"
                                fill="none"
                                viewBox="0 0 24 24"
                                stroke="currentColor"
                            >
                                <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth={2}
                                    d="M12 6v6m0 0v6m0-6h6m-6 0H6"
                                />
                            </svg>
                            <h3 className="text-xl font-semibold text-gray-800 mb-2">Real-Time Tracking</h3>
                            <p className="text-gray-600">Track your driver in real-time and know exactly when they'll arrive.</p>
                        </div>

                        {/* Feature 2 */}
                        <div className="text-center p-6 bg-white rounded-lg shadow-lg transform hover:scale-105 transition-transform duration-300">
                            <svg
                                xmlns="http://www.w3.org/2000/svg"
                                className="h-12 w-12 mx-auto text-indigo-500 mb-4"
                                fill="none"
                                viewBox="0 0 24 24"
                                stroke="currentColor"
                            >
                                <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth={2}
                                    d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-6a2 2 0 11-4 0 2 2 0 014 0z"
                                />
                            </svg>
                            <h3 className="text-xl font-semibold text-gray-800 mb-2">Dynamic Pricing</h3>
                            <p className="text-gray-600">Get fair prices based on demand, distance, and availability.</p>
                        </div>

                        {/* Feature 3 */}
                        <div className="text-center p-6 bg-white rounded-lg shadow-lg transform hover:scale-105 transition-transform duration-300">
                            <svg
                                xmlns="http://www.w3.org/2000/svg"
                                className="h-12 w-12 mx-auto text-indigo-500 mb-4"
                                fill="none"
                                viewBox="0 0 24 24"
                                stroke="currentColor"
                            >
                                <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth={2}
                                    d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
                                />
                            </svg>
                            <h3 className="text-xl font-semibold text-gray-800 mb-2">Secure Payments</h3>
                            <p className="text-gray-600">Pay securely with multiple payment options.</p>
                        </div>
                    </div>
                </div>
            </section>

            {/* Testimonials Section */}
            <section className="py-20 bg-indigo-600 text-white">
                <div className="container mx-auto px-4">
                    <h2 className="text-4xl font-bold text-center mb-12">What Our Users Say</h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                        {/* Testimonial 1 */}
                        <div className="p-6 bg-indigo-700 rounded-lg shadow-lg">
                            <p className="text-lg italic mb-4">"The app is amazing! Real-time tracking makes it so convenient."</p>
                            <p className="font-bold">- Sarah L.</p>
                        </div>

                        {/* Testimonial 2 */}
                        <div className="p-6 bg-indigo-700 rounded-lg shadow-lg">
                            <p className="text-lg italic mb-4">"Dynamic pricing is fair and transparent. I love it!"</p>
                            <p className="font-bold">- John D.</p>
                        </div>

                        {/* Testimonial 3 */}
                        <div className="p-6 bg-indigo-700 rounded-lg shadow-lg">
                            <p className="text-lg italic mb-4">"The drivers are always on time, and payments are secure."</p>
                            <p className="font-bold">- Emily R.</p>
                        </div>
                    </div>
                </div>
            </section>

            {/* Footer */}
            <footer className="bg-gray-800 text-white py-8">
                <div className="container mx-auto px-4 text-center">
                    <p>&copy; 2023 Uber Clone. All rights reserved.</p>
                    <div className="mt-4 space-x-4">
                        <a href="#" className="hover:text-indigo-500 transition duration-300">Privacy Policy</a>
                        <a href="#" className="hover:text-indigo-500 transition duration-300">Terms of Service</a>
                    </div>
                </div>
            </footer>
        </div>
    );
};

export default LandingPage;