import React, { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { CreditCard, LayoutDashboard, Users, LogOut, UserCheck, User, Menu, X } from 'lucide-react';
import { Button } from '../ui/Button';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '../../utils/cn';

export const Navbar = () => {
    const location = useLocation();
    const navigate = useNavigate();
    const token = localStorage.getItem('token');
    const user = JSON.parse(localStorage.getItem('user') || '{}');
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

    const navLinks = [
        { name: 'Dashboard', path: '/', icon: LayoutDashboard },
        { name: 'Groups', path: '/groups', icon: Users },
        { name: 'Friends', path: '/friends', icon: UserCheck },
    ];

    if (!token) return null;

    const handleLogout = () => {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        navigate('/landing');
    };

    return (
        <motion.header
            initial={{ y: -100 }}
            animate={{ y: 0 }}
            transition={{ type: 'spring', stiffness: 100, damping: 20 }}
            className="fixed top-0 left-0 right-0 z-50 flex justify-center p-4 lg:p-6 pointer-events-none"
        >
            <nav className="w-full max-w-7xl glass rounded-[2rem] px-4 py-3 flex items-center justify-between pointer-events-auto shadow-[0_8px_32px_0_rgba(0,0,0,0.05)] border border-white/40">
                <div className="flex items-center space-x-8">
                    <Link to="/" className="group flex items-center space-x-3 transition-transform hover:scale-105">
                        <div className="w-10 h-10 bg-gradient-to-br from-emerald-400 to-emerald-600 rounded-2xl flex-center shadow-lg shadow-emerald-500/20 group-hover:rotate-6 transition-transform">
                            <CreditCard className="w-6 h-6 text-white" />
                        </div>
                        <span className="text-xl font-extrabold tracking-tight text-slate-800">
                            Split<span className="text-emerald-500">Wise</span>
                        </span>
                    </Link>

                    <div className="hidden md:flex items-center space-x-1 p-1 bg-slate-100/50 rounded-2xl border border-slate-200/50">
                        {navLinks.map((link) => {
                            const isActive = location.pathname === link.path || (link.path !== '/' && location.pathname.startsWith(link.path));
                            return (
                                <Link key={link.path} to={link.path} className="relative">
                                    <div className={cn(
                                        "relative px-5 py-2 rounded-xl text-sm font-bold transition-all duration-300 flex items-center space-x-2 z-10",
                                        isActive ? "text-emerald-600" : "text-slate-500 hover:text-slate-700"
                                    )}>
                                        <link.icon className="w-4 h-4" />
                                        <span>{link.name}</span>
                                    </div>
                                    {isActive && (
                                        <motion.div
                                            layoutId="nav-pill"
                                            className="absolute inset-0 bg-white rounded-xl shadow-sm z-0"
                                            transition={{ type: 'spring', stiffness: 300, damping: 30 }}
                                        />
                                    )}
                                </Link>
                            );
                        })}
                    </div>
                </div>

                <div className="flex items-center space-x-4">
                    <div className="hidden sm:flex flex-col items-end mr-2">
                        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest leading-none mb-1">Authenticated</span>
                        <Link to="/profile" className="text-sm font-extrabold text-slate-700 leading-none hover:text-emerald-600 transition-colors">
                            {user.name || user.email || 'User'}
                        </Link>
                    </div>

                    <Button
                        variant="secondary"
                        size="sm"
                        className="hidden md:inline-flex rounded-xl border-rose-100/50 text-rose-600 hover:bg-rose-50 hover:text-rose-700 hover:border-rose-200 transition-all font-bold"
                        onClick={handleLogout}
                    >
                        <LogOut className="w-4 h-4 mr-2" />
                        Logout
                    </Button>

                    {/* Mobile hamburger */}
                    <button
                        className="md:hidden p-2 rounded-xl text-slate-600 hover:bg-slate-100 transition-colors"
                        onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                    >
                        {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
                    </button>
                </div>
            </nav>

            {/* Mobile dropdown menu */}
            <AnimatePresence>
                {mobileMenuOpen && (
                    <motion.div
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                        transition={{ duration: 0.2 }}
                        className="md:hidden w-full max-w-7xl mt-2 glass rounded-2xl p-4 pointer-events-auto shadow-lg border border-white/40 space-y-2"
                    >
                        {navLinks.map((link) => {
                            const isActive = location.pathname === link.path || (link.path !== '/' && location.pathname.startsWith(link.path));
                            return (
                                <Link
                                    key={link.path}
                                    to={link.path}
                                    onClick={() => setMobileMenuOpen(false)}
                                    className={cn(
                                        "flex items-center space-x-3 px-4 py-3 rounded-xl text-sm font-bold transition-all",
                                        isActive ? "bg-white text-emerald-600 shadow-sm" : "text-slate-600 hover:bg-white/50"
                                    )}
                                >
                                    <link.icon className="w-4 h-4" />
                                    <span>{link.name}</span>
                                </Link>
                            );
                        })}
                        <Link
                            to="/profile"
                            onClick={() => setMobileMenuOpen(false)}
                            className="flex items-center space-x-3 px-4 py-3 rounded-xl text-sm font-bold text-slate-600 hover:bg-white/50 transition-all"
                        >
                            <User className="w-4 h-4" />
                            <span>Profile</span>
                        </Link>
                        <button
                            onClick={() => { setMobileMenuOpen(false); handleLogout(); }}
                            className="flex items-center space-x-3 px-4 py-3 rounded-xl text-sm font-bold text-rose-600 hover:bg-rose-50 transition-all w-full"
                        >
                            <LogOut className="w-4 h-4" />
                            <span>Logout</span>
                        </button>
                    </motion.div>
                )}
            </AnimatePresence>
        </motion.header>
    );
};
