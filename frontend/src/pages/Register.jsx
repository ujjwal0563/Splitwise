import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/Card';
import { Input } from '../components/ui/Input';
import { Button } from '../components/ui/Button';
import { CreditCard, AlertCircle, ArrowRight, ArrowLeft } from 'lucide-react';
import api from '../api/axios';
import { motion } from 'framer-motion';

const Register = () => {
    const [formData, setFormData] = useState({ name: '', email: '', password: '' });
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setLoading(true);

        try {
            await api.post('/users/register', formData);
            window.location.href = '/login';
        } catch (err) {
            setError(err.response?.data?.error || 'Failed to register. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center p-4 selection:bg-emerald-100 selection:text-emerald-900 overflow-hidden relative">
            {/* Back to landing link */}
            <Link to="/landing" className="absolute top-6 left-6 flex items-center text-xs font-bold text-slate-400 hover:text-slate-700 transition-colors">
                <ArrowLeft className="w-3.5 h-3.5 mr-1.5" />
                Back to home
            </Link>
            {/* Background Decorations */}
            <div className="absolute top-0 left-0 w-full h-full -z-10">
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-emerald-300/20 rounded-full blur-[120px]"></div>
                <div className="absolute bottom-0 right-0 w-[400px] h-[400px] bg-indigo-300/10 rounded-full blur-[100px]"></div>
            </div>

            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, ease: "easeOut" }}
                className="w-full max-w-md relative z-10"
            >
                <div className="flex justify-center mb-10 relative">
                    <div className="absolute inset-0 bg-emerald-400/20 blur-2xl rounded-full scale-150"></div>
                    <motion.div
                        whileHover={{ rotate: 12, scale: 1.1 }}
                        className="w-16 h-16 bg-gradient-to-br from-emerald-400 to-emerald-600 rounded-[2rem] flex-center shadow-2xl relative z-10 transition-shadow hover:shadow-emerald-500/40"
                    >
                        <CreditCard className="w-8 h-8 text-white" />
                    </motion.div>
                </div>

                <Card className="glass-morphism border-white/50 shadow-[0_32px_64px_-16px_rgba(0,0,0,0.1)]">
                    <CardHeader className="text-center pb-2">
                        <CardTitle className="text-3xl font-black tracking-tight text-slate-900">Get Started</CardTitle>
                        <p className="text-sm font-bold text-slate-400 mt-2 uppercase tracking-widest">Create your premium account</p>
                    </CardHeader>
                    <CardContent className="pt-6">
                        <form onSubmit={handleSubmit} className="space-y-6">
                            {error && (
                                <motion.div
                                    initial={{ opacity: 0, x: -10 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    className="p-4 bg-rose-50 border border-rose-100 text-rose-600 rounded-2xl text-xs font-bold flex items-center uppercase tracking-wide"
                                >
                                    <AlertCircle className="w-4 h-4 mr-3 shrink-0" />
                                    <span>{error}</span>
                                </motion.div>
                            )}

                            <Input
                                label="Full Name"
                                placeholder="John Doe"
                                required
                                value={formData.name}
                                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                            />

                            <Input
                                label="Email Address"
                                type="email"
                                placeholder="john@example.com"
                                required
                                value={formData.email}
                                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                            />

                            <Input
                                label="Password"
                                type="password"
                                placeholder="••••••••"
                                required
                                value={formData.password}
                                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                            />

                            <Button
                                type="submit"
                                className="w-full rounded-2xl py-4 flex-center font-black tracking-widest uppercase text-xs"
                                size="lg"
                                isLoading={loading}
                            >
                                Create Account
                                <ArrowRight className="w-4 h-4 ml-2" />
                            </Button>
                        </form>

                        <div className="mt-10 text-center">
                            <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">
                                Already have an account?{' '}
                                <Link to="/login" className="text-emerald-500 hover:text-emerald-600 transition-colors">
                                    Sign In
                                </Link>
                            </p>
                        </div>
                    </CardContent>
                </Card>
            </motion.div>
        </div>
    );
};

export default Register;
