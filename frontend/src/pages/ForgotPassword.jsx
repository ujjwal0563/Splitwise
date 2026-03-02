import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/Card';
import { Input } from '../components/ui/Input';
import { Button } from '../components/ui/Button';
import { KeyRound, AlertCircle, ArrowLeft, CheckCircle2 } from 'lucide-react';
import api from '../api/axios';

const ForgotPassword = () => {
    const navigate = useNavigate();
    const [email, setEmail] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const [success, setSuccess] = useState(false);
    const [resetToken, setResetToken] = useState('');

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setLoading(true);

        try {
            const response = await api.post('/users/forgot-password', { email });
            if (response.data && response.data.token) {
                setResetToken(response.data.token);
                setSuccess(true);
            }
        } catch (err) {
            setError(err.response?.data?.error || 'Failed to process request. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    const handleGoToReset = () => {
        navigate('/reset-password', { state: { token: resetToken } });
    };

    return (
        <div className="min-h-screen flex items-center justify-center p-4 selection:bg-emerald-100 selection:text-emerald-900 overflow-hidden relative">
            <Link to="/login" className="absolute top-6 left-6 flex items-center text-xs font-bold text-slate-400 hover:text-slate-700 transition-colors">
                <ArrowLeft className="w-3.5 h-3.5 mr-1.5" />
                Back to login
            </Link>

            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-amber-300/20 rounded-full blur-[100px] pointer-events-none"></div>
            <div className="absolute top-0 right-0 w-[400px] h-[400px] bg-indigo-300/10 rounded-full blur-[80px] pointer-events-none"></div>

            <div className="w-full max-w-md animate-in fade-in zoom-in-95 duration-700 relative z-10">
                <div className="flex justify-center mb-8 relative">
                    <div className="absolute inset-0 bg-amber-400/20 blur-xl rounded-full scale-150"></div>
                    <div className="w-14 h-14 bg-gradient-to-br from-amber-400 to-amber-600 rounded-2xl flex items-center justify-center shadow-2xl relative z-10 transition-transform duration-500 hover:rotate-12 hover:scale-110">
                        <KeyRound className="w-7 h-7 text-white" />
                    </div>
                </div>

                <Card className="border-white/40 shadow-[0_8px_30px_rgb(0,0,0,0.08)] bg-white/70 backdrop-blur-xl">
                    <CardHeader className="text-center pb-2">
                        <CardTitle className="text-3xl font-extrabold tracking-tight">
                            {success ? 'Token Generated' : 'Forgot Password'}
                        </CardTitle>
                        <p className="text-sm font-medium text-slate-500 mt-2">
                            {success
                                ? 'Use the token below to reset your password'
                                : 'Enter your email and we\'ll generate a reset token'}
                        </p>
                    </CardHeader>
                    <CardContent>
                        {!success ? (
                            <form onSubmit={handleSubmit} className="space-y-4 mt-4">
                                {error && (
                                    <div className="p-3 bg-red-50 border border-red-200 text-red-600 rounded-lg text-sm flex items-start animate-in fade-in">
                                        <AlertCircle className="w-4 h-4 mr-2 mt-0.5 shrink-0" />
                                        <span>{error}</span>
                                    </div>
                                )}

                                <div className="space-y-2">
                                    <label className="text-sm font-medium text-slate-700" htmlFor="email">Email address</label>
                                    <Input
                                        id="email"
                                        type="email"
                                        placeholder="name@example.com"
                                        required
                                        value={email}
                                        onChange={(e) => setEmail(e.target.value)}
                                    />
                                </div>

                                <Button type="submit" className="w-full text-base py-5 mt-2" disabled={loading}>
                                    {loading ? 'Sending...' : 'Get Reset Token'}
                                </Button>
                            </form>
                        ) : (
                            <div className="space-y-5 mt-4">
                                <div className="p-3 bg-emerald-50 border border-emerald-200 text-emerald-700 rounded-lg text-sm flex items-start animate-in fade-in">
                                    <CheckCircle2 className="w-4 h-4 mr-2 mt-0.5 shrink-0" />
                                    <span>Reset token generated successfully!</span>
                                </div>

                                <div className="space-y-2">
                                    <label className="text-xs font-bold uppercase tracking-widest text-slate-500">Your Reset Token</label>
                                    <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl text-xs font-mono text-slate-700 break-all select-all">
                                        {resetToken}
                                    </div>
                                    <p className="text-[11px] text-slate-400 font-medium">
                                        Copy this token — you'll need it to reset your password.
                                    </p>
                                </div>

                                <Button onClick={handleGoToReset} className="w-full text-base py-5">
                                    Reset Password →
                                </Button>
                            </div>
                        )}

                        <div className="mt-6 text-center text-sm text-slate-500">
                            Remember your password?{' '}
                            <Link to="/login" className="font-semibold text-emerald-600 hover:text-emerald-500 hover:underline transition-all">
                                Sign in
                            </Link>
                        </div>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
};

export default ForgotPassword;
