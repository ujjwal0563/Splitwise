import React, { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/Card';
import { Input } from '../components/ui/Input';
import { Button } from '../components/ui/Button';
import { ShieldCheck, AlertCircle, ArrowLeft, CheckCircle2, Eye, EyeOff } from 'lucide-react';
import api from '../api/axios';

const ResetPassword = () => {
    const navigate = useNavigate();

    const [otp, setOtp] = useState('');
    const [newPassword, setNewPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const [success, setSuccess] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');

        if (otp.length !== 6 || isNaN(otp)) {
            setError('Please enter a valid 6-digit OTP.');
            return;
        }
        if (newPassword.length < 6) {
            setError('Password must be at least 6 characters long.');
            return;
        }
        if (newPassword !== confirmPassword) {
            setError('Passwords do not match.');
            return;
        }

        setLoading(true);

        try {
            await api.post('/users/reset-password', {
                token: otp,
                new_password: newPassword,
            });
            setSuccess(true);
        } catch (err) {
            setError(err.response?.data?.error || 'Failed to reset password. OTP may be invalid or expired.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center p-4 selection:bg-emerald-100 selection:text-emerald-900 overflow-hidden relative">
            <Link to="/login" className="absolute top-6 left-6 flex items-center text-xs font-bold text-slate-400 hover:text-slate-700 transition-colors">
                <ArrowLeft className="w-3.5 h-3.5 mr-1.5" />
                Back to login
            </Link>

            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-indigo-300/20 rounded-full blur-[100px] pointer-events-none"></div>
            <div className="absolute top-0 right-0 w-[400px] h-[400px] bg-emerald-300/10 rounded-full blur-[80px] pointer-events-none"></div>

            <div className="w-full max-w-md animate-in fade-in zoom-in-95 duration-700 relative z-10">
                <div className="flex justify-center mb-8 relative">
                    <div className="absolute inset-0 bg-indigo-400/20 blur-xl rounded-full scale-150"></div>
                    <div className="w-14 h-14 bg-gradient-to-br from-indigo-400 to-indigo-600 rounded-2xl flex items-center justify-center shadow-2xl relative z-10 transition-transform duration-500 hover:rotate-12 hover:scale-110">
                        <ShieldCheck className="w-7 h-7 text-white" />
                    </div>
                </div>

                <Card className="border-white/40 shadow-[0_8px_30px_rgb(0,0,0,0.08)] bg-white/70 backdrop-blur-xl">
                    <CardHeader className="text-center pb-2">
                        <CardTitle className="text-3xl font-extrabold tracking-tight">
                            {success ? 'Password Reset!' : 'Reset Password'}
                        </CardTitle>
                        <p className="text-sm font-medium text-slate-500 mt-2">
                            {success
                                ? 'Your password has been changed successfully'
                                : 'Enter the 6-digit OTP sent to your email and choose a new password'}
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
                                    <label className="text-sm font-medium text-slate-700" htmlFor="otp">6-Digit OTP</label>
                                    <Input
                                        id="otp"
                                        type="text"
                                        placeholder="Enter 6-digit OTP"
                                        required
                                        maxLength="6"
                                        value={otp}
                                        onChange={(e) => setOtp(e.target.value.replace(/\D/g, ''))}
                                    />
                                    <p className="text-xs text-slate-500">Check your email for the OTP. It expires in 10 minutes.</p>
                                </div>

                                <div className="space-y-2">
                                    <label className="text-sm font-medium text-slate-700" htmlFor="newPassword">New Password</label>
                                    <div className="relative">
                                        <Input
                                            id="newPassword"
                                            type={showPassword ? 'text' : 'password'}
                                            placeholder="At least 6 characters"
                                            required
                                            value={newPassword}
                                            onChange={(e) => setNewPassword(e.target.value)}
                                        />
                                        <button
                                            type="button"
                                            onClick={() => setShowPassword(!showPassword)}
                                            className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors"
                                        >
                                            {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                                        </button>
                                    </div>
                                </div>

                                <div className="space-y-2">
                                    <label className="text-sm font-medium text-slate-700" htmlFor="confirmPassword">Confirm Password</label>
                                    <Input
                                        id="confirmPassword"
                                        type={showPassword ? 'text' : 'password'}
                                        placeholder="Re-enter your new password"
                                        required
                                        value={confirmPassword}
                                        onChange={(e) => setConfirmPassword(e.target.value)}
                                    />
                                </div>

                                <Button type="submit" className="w-full text-base py-5 mt-2" disabled={loading}>
                                    {loading ? 'Resetting...' : 'Reset Password'}
                                </Button>
                            </form>
                        ) : (
                            <div className="space-y-5 mt-4">
                                <div className="p-3 bg-emerald-50 border border-emerald-200 text-emerald-700 rounded-lg text-sm flex items-start animate-in fade-in">
                                    <CheckCircle2 className="w-4 h-4 mr-2 mt-0.5 shrink-0" />
                                    <span>Your password has been reset. You can now sign in with your new password.</span>
                                </div>

                                <Button onClick={() => navigate('/login')} className="w-full text-base py-5">
                                    Go to Sign In →
                                </Button>
                            </div>
                        )}

                        <div className="mt-6 text-center text-sm text-slate-500">
                            Don't have a token?{' '}
                            <Link to="/forgot-password" className="font-semibold text-emerald-600 hover:text-emerald-500 hover:underline transition-all">
                                Get one here
                            </Link>
                        </div>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
};

export default ResetPassword;
