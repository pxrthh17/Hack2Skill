import React from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from './context/AuthContext.jsx';

const App = () => {
    const { user, logout } = useAuth();

    return (
        <div className="min-h-screen bg-gray-100 overflow-x-hidden">
            {/* Navigation */}
            <nav className="fixed w-full top-0 left-0 z-50 backdrop-blur-md border-b border-white/10 bg-indigo-900/30">
                <div className="container mx-auto px-4 py-4 flex justify-between items-center">
                    <Link to="/" className="text-2xl font-bold bg-gradient-to-r from-cyan-400 to-blue-500 bg-clip-text text-transparent">
                        UberClone
                    </Link>
                    <div className="space-x-6 flex items-center">
                        {!user && (
                            <>
                                <Link
                                    to="/register"
                                    className="px-4 py-2 bg-gradient-to-r from-cyan-400 to-blue-500 text-white rounded-lg
                                    hover:shadow-xl hover:scale-105 transition-all duration-300"
                                >
                                    Register
                                </Link>
                                <Link
                                    to="/login"
                                    className="px-4 py-2 border-2 border-cyan-300 text-cyan-300 rounded-lg
                                    hover:bg-cyan-300/10 hover:border-cyan-400 hover:text-cyan-400 transition-all duration-300"
                                >
                                    Login
                                </Link>
                            </>
                        )}
                        {user && (
                            <>
                                <Link
                                    to="/dashboard"
                                    className="text-white/80 hover:text-white transition-colors duration-300"
                                >
                                    Dashboard
                                </Link>
                                <button
                                    onClick={logout}
                                    className="text-red-300 hover:text-red-400 transition-colors duration-300"
                                >
                                    Logout
                                </button>
                            </>
                        )}
                    </div>
                </div>
            </nav>

            {/* Hero Section */}
            <section className="relative pt-32 bg-gradient-to-br from-indigo-900 via-blue-900 to-cyan-900 text-white py-28 overflow-hidden">
                <div className="absolute inset-0 opacity-10">
                    <div className="absolute top-20 -left-20 w-96 h-96 bg-cyan-400 rounded-full mix-blend-screen opacity-20 animate-blob animation-delay-2000"></div>
                    <div className="absolute top-40 -right-20 w-96 h-96 bg-blue-400 rounded-full mix-blend-screen opacity-20 animate-blob animation-delay-3000"></div>
                </div>

                <div className="container mx-auto px-4 text-center relative">
                    <h1 className="text-5xl md:text-6xl font-bold mb-6 animate-fade-in-up">
                        <span className="bg-clip-text text-transparent bg-gradient-to-r from-cyan-400 to-blue-400">
                            Smart Urban Mobility
                        </span>
                    </h1>
                    <p className="text-xl md:text-2xl mb-10 max-w-3xl mx-auto animate-fade-in-up animation-delay-100">
                        Revolutionize your commute with AI-powered ride matching, real-time tracking, and eco-friendly transportation solutions.
                    </p>
                    <div className="flex flex-col sm:flex-row justify-center gap-4 animate-fade-in-up animation-delay-200">
                        <Link
                            to={user ? "/dashboard" : "/register"}
                            className="px-8 py-4 bg-gradient-to-r from-cyan-400 to-blue-500 text-white font-semibold rounded-xl
                            hover:shadow-2xl hover:scale-105 transition-all duration-300"
                        >
                            {user ? "Go to Dashboard" : "Get Started Free"}
                        </Link>
                        {!user && (
                            <Link
                                to="/login"
                                className="px-8 py-4 border-2 border-cyan-300 text-cyan-300 font-semibold rounded-xl
                                hover:bg-cyan-300/10 hover:border-cyan-400 hover:text-cyan-400 transition-all duration-300"
                            >
                                Existing User? Login
                            </Link>
                        )}
                    </div>
                </div>
            </section>

            {/* How It Works Section */}
            <section className="py-24 bg-white">
                <div className="container mx-auto px-4">
                    <h2 className="text-4xl font-bold text-center mb-16">
                        <span className="bg-clip-text text-transparent bg-gradient-to-r from-indigo-600 to-cyan-500">
                            How It Works
                        </span>
                    </h2>
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
                        {[
                            { icon: '📱', title: 'Book Ride', desc: 'Instantly request a ride through our mobile app or website' },
                            { icon: '🚗', title: 'Match Driver', desc: 'AI matches you with the nearest available driver' },
                            { icon: '📍', title: 'Track Live', desc: 'Real-time GPS tracking of your driver\'s arrival' },
                            { icon: '💳', title: 'Pay Secure', desc: 'Cashless payments with multiple payment options' }
                        ].map((step, idx) => (
                            <div
                                key={idx}
                                className="p-8 bg-gradient-to-br from-indigo-50 to-cyan-50 rounded-2xl shadow-lg hover:shadow-xl transition-shadow duration-300"
                            >
                                <div className="text-4xl mb-4">{step.icon}</div>
                                <h3 className="text-2xl font-bold text-indigo-900 mb-2">{step.title}</h3>
                                <p className="text-gray-600">{step.desc}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* Safety Features Section */}
            <section className="py-24 bg-indigo-50">
                <div className="container mx-auto px-4">
                    <h2 className="text-4xl font-bold text-center mb-16">
                        <span className="bg-clip-text text-transparent bg-gradient-to-r from-indigo-600 to-cyan-500">
                            Your Safety First
                        </span>
                    </h2>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                        {[
                            { icon: '🛡️', title: 'Driver Verification', desc: 'Rigorous background checks for all drivers' },
                            { icon: '📲', title: 'Share Ride Details', desc: 'Real-time ride sharing with emergency contacts' },
                            { icon: '🚨', title: '24/7 Support', desc: 'Instant access to emergency assistance' }
                        ].map((feature, idx) => (
                            <div
                                key={idx}
                                className="p-8 bg-white rounded-2xl shadow-lg hover:shadow-xl transition-shadow duration-300"
                            >
                                <div className="text-4xl mb-4">{feature.icon}</div>
                                <h3 className="text-2xl font-bold text-indigo-900 mb-2">{feature.title}</h3>
                                <p className="text-gray-600">{feature.desc}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* Pricing Section */}
            <section className="py-24 bg-gradient-to-br from-indigo-900 to-blue-900 text-white">
                <div className="container mx-auto px-4">
                    <h2 className="text-4xl font-bold text-center mb-16">
                        <span className="bg-clip-text text-transparent bg-gradient-to-r from-cyan-400 to-blue-400">
                            Flexible Pricing
                        </span>
                    </h2>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                        {[
                            {
                                title: 'Basic',
                                price: '1.5x',
                                features: ['Standard rides', 'Regular vehicles', 'Basic support', 'Cash payments']
                            },
                            {
                                title: 'Premium',
                                price: '2.0x',
                                features: ['Priority rides', 'Luxury vehicles', '24/7 support', 'Advanced safety features'],
                                popular: true
                            },
                            {
                                title: 'Business',
                                price: 'Custom',
                                features: ['Dedicated fleet', 'Corporate billing', 'Multiple users', 'Premium support']
                            }
                        ].map((plan, idx) => (
                            <div
                                key={idx}
                                className={`p-8 rounded-2xl ${plan.popular ? 'bg-gradient-to-br from-cyan-500 to-blue-600' : 'bg-white/10'} 
                                backdrop-blur-sm hover:shadow-xl transition-shadow duration-300`}
                            >
                                {plan.popular && (
                                    <div className="bg-white text-blue-900 px-4 py-1 rounded-full text-sm font-bold mb-4 w-max">
                                        Most Popular
                                    </div>
                                )}
                                <h3 className="text-3xl font-bold mb-2">{plan.title}</h3>
                                <div className="text-4xl font-bold mb-6">{plan.price}</div>
                                <ul className="space-y-3">
                                    {plan.features.map((feature, fIdx) => (
                                        <li key={fIdx} className="flex items-center">
                                            <span className="mr-2">✓</span>
                                            {feature}
                                        </li>
                                    ))}
                                </ul>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* App Download Section */}
            <section className="py-24 bg-white">
                <div className="container mx-auto px-4">
                    <div className="bg-gradient-to-br from-indigo-600 to-cyan-500 rounded-3xl p-12 text-white">
                        <div className="flex flex-col md:flex-row items-center justify-between">
                            <div className="md:w-1/2 mb-8 md:mb-0">
                                <h2 className="text-4xl font-bold mb-4">Get the App</h2>
                                <p className="text-xl mb-6">Download our app for faster bookings and exclusive features</p>
                                <div className="flex gap-4">
                                    <button className="bg-black/20 hover:bg-black/30 px-6 py-3 rounded-xl transition-all duration-300">
                                        <span className="flex items-center">
                                            <span className="text-2xl mr-2">🍏</span>
                                            App Store
                                        </span>
                                    </button>
                                    <button className="bg-black/20 hover:bg-black/30 px-6 py-3 rounded-xl transition-all duration-300">
                                        <span className="flex items-center">
                                            <span className="text-2xl mr-2">🤖</span>
                                            Play Store
                                        </span>
                                    </button>
                                </div>
                            </div>
                            <div className="md:w-1/2 flex justify-center">
                                <div className="relative w-64 h-64 bg-white/10 backdrop-blur-sm rounded-2xl transform rotate-6 shadow-2xl">
                                    <div className="absolute inset-0 flex items-center justify-center">
                                        <div className="text-6xl">📱</div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* Footer */}
            <footer className="bg-indigo-900 text-white py-12">
                <div className="container mx-auto px-4">
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
                        <div>
                            <h3 className="text-xl font-bold mb-4">UberClone</h3>
                            <p className="text-gray-400">Redefining urban transportation since 2023</p>
                        </div>
                        <div>
                            <h4 className="font-bold mb-4">Company</h4>
                            <ul className="space-y-2 text-gray-400">
                                <li><a href="#" className="hover:text-cyan-400 transition-colors">About</a></li>
                                <li><a href="#" className="hover:text-cyan-400 transition-colors">Careers</a></li>
                                <li><a href="#" className="hover:text-cyan-400 transition-colors">Blog</a></li>
                            </ul>
                        </div>
                        <div>
                            <h4 className="font-bold mb-4">Legal</h4>
                            <ul className="space-y-2 text-gray-400">
                                <li><a href="#" className="hover:text-cyan-400 transition-colors">Privacy</a></li>
                                <li><a href="#" className="hover:text-cyan-400 transition-colors">Terms</a></li>
                                <li><a href="#" className="hover:text-cyan-400 transition-colors">Security</a></li>
                            </ul>
                        </div>
                        <div>
                            <h4 className="font-bold mb-4">Connect</h4>
                            <div className="flex space-x-4">
                                {['📘', '📷', '🐦', '💼'].map((icon, idx) => (
                                    <button
                                        key={idx}
                                        className="text-2xl hover:text-cyan-400 transition-colors"
                                    >
                                        {icon}
                                    </button>
                                ))}
                            </div>
                        </div>
                    </div>
                    <div className="border-t border-white/10 mt-12 pt-8 text-center text-gray-400">
                        <p>&copy; 2023 UberClone. All rights reserved.</p>
                    </div>
                </div>
            </footer>
        </div>
    );
};

export default App;