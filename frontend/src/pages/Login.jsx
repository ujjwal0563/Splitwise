import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/Card';
import { Input } from '../components/ui/Input';
import { Button } from '../components/ui/Button';
import { CreditCard, AlertCircle, ArrowLeft } from 'lucide-react';
import api from '../api/axios';

const Login = () => {
    const navigate = useNavigate();
    const [formData, setFormData] = useState({ email: '', password: '' });
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    React.useEffect(() => {
        if (localStorage.getItem('token')) {
            navigate('/');
        }
    }, [navigate]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setLoading(true);

        try {
            const response = await api.post('/users/login', formData);
            if (response.data && response.data.token) {
                localStorage.setItem('token', response.data.token);

                // Fetch user profile to get the name
                try {
                    const profileRes = await api.get('/users/profile');
                    localStorage.setItem('user', JSON.stringify(profileRes.data));
                } catch (profileErr) {
                    localStorage.setItem('user', JSON.stringify({ email: formData.email }));
                }

                window.location.href = '/';
            }
        } catch (err) {
            setError(err.response?.data?.error || 'Failed to login. Please check your credentials.');
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

            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-emerald-300/20 rounded-full blur-[100px] pointer-events-none"></div>
            <div className="absolute top-0 right-0 w-[400px] h-[400px] bg-indigo-300/10 rounded-full blur-[80px] pointer-events-none"></div>

            <div className="w-full max-w-md animate-in fade-in zoom-in-95 duration-700 relative z-10">
                <div className="flex justify-center mb-8 relative">
                    <div className="absolute inset-0 bg-emerald-400/20 blur-xl rounded-full scale-150"></div>
                    <div className="w-14 h-14 bg-gradient-to-br from-emerald-400 to-emerald-600 rounded-2xl flex items-center justify-center shadow-2xl relative z-10 transition-transform duration-500 hover:rotate-12 hover:scale-110">
                        <CreditCard className="w-7 h-7 text-white" />
                    </div>
                </div>

                <Card className="border-white/40 shadow-[0_8px_30px_rgb(0,0,0,0.08)] bg-white/70 backdrop-blur-xl">
                    <CardHeader className="text-center pb-2">
                        <CardTitle className="text-3xl font-extrabold tracking-tight">Welcome back</CardTitle>
                        <p className="text-sm font-medium text-slate-500 mt-2">Enter your credentials to access your account</p>
                    </CardHeader>
                    <CardContent>
                        <form onSubmit={handleSubmit} className="space-y-4 mt-4">
                            {error && (
                                <div className="p-3 bg-red-50 border border-red-200 text-red-600 rounded-lg text-sm flex items-start animate-in fade-in">
                                    <AlertCircle className="w-4 h-4 mr-2 mt-0.5 shrink-0" />
                                    <span>{error}</span>
                                </div>
                            )}

                            <div className="space-y-2">
                                <label className="text-sm font-medium text-slate-700" htmlFor="email">Email</label>
                                <Input
                                    id="email"
                                    type="email"
                                    placeholder="name@example.com"
                                    required
                                    value={formData.email}
                                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                                />
                            </div>
                            <div className="space-y-2">
                                <label className="text-sm font-medium text-slate-700" htmlFor="password">Password</label>
                                <Input
                                    id="password"
                                    type="password"
                                    required
                                    value={formData.password}
                                    onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                                />
                            </div>

                            <Button type="submit" className="w-full text-base py-5 mt-2" disabled={loading}>
                                {loading ? 'Signing in...' : 'Sign in'}
                            </Button>
                        </form>

                        <div className="mt-6 text-center text-sm text-slate-500">
                            Don't have an account?{' '}
                            <Link to="/register" className="font-semibold text-emerald-600 hover:text-emerald-500 hover:underline transition-all">
                                Sign up
                            </Link>
                        </div>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
};

export default Login;
