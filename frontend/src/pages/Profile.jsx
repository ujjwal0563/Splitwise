import React, { useState, useEffect } from 'react';
import { Layout } from '../components/layout/Layout';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { User, Mail, Calendar, Edit3, CheckCircle, AlertCircle, Shield } from 'lucide-react';
import api from '../api/axios';
import { motion } from 'framer-motion';

const Profile = () => {
    const [profile, setProfile] = useState(null);
    const [editName, setEditName] = useState('');
    const [isEditing, setIsEditing] = useState(false);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [success, setSuccess] = useState('');
    const [error, setError] = useState('');

    useEffect(() => {
        fetchProfile();
    }, []);

    const fetchProfile = async () => {
        try {
            const res = await api.get('/users/profile');
            setProfile(res.data);
            setEditName(res.data.name || '');
        } catch (err) {
            setError('Failed to load profile.');
        } finally {
            setLoading(false);
        }
    };

    const handleUpdateProfile = async (e) => {
        e.preventDefault();
        if (!editName.trim()) {
            setError('Name cannot be empty.');
            return;
        }
        setSaving(true);
        setError('');
        setSuccess('');
        try {
            await api.put('/users/profile', { name: editName.trim() });
            // Update localStorage
            const stored = JSON.parse(localStorage.getItem('user') || '{}');
            localStorage.setItem('user', JSON.stringify({ ...stored, name: editName.trim() }));
            setProfile(prev => ({ ...prev, name: editName.trim() }));
            setIsEditing(false);
            setSuccess('Profile updated successfully!');
            setTimeout(() => setSuccess(''), 3000);
        } catch (err) {
            setError(err.response?.data?.error || 'Failed to update profile.');
        } finally {
            setSaving(false);
        }
    };

    if (loading) return (
        <Layout>
            <div className="flex items-center justify-center min-h-[60vh]">
                <div className="w-12 h-12 border-4 border-emerald-500/20 border-t-emerald-500 rounded-full animate-spin" />
            </div>
        </Layout>
    );

    const initials = profile?.name
        ? profile.name.split(' ').map(w => w[0]).join('').toUpperCase().slice(0, 2)
        : profile?.email?.[0]?.toUpperCase() || 'U';

    return (
        <Layout>
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="max-w-2xl mx-auto space-y-8 pb-20"
            >
                {/* Header */}
                <div>
                    <h1 className="text-4xl font-black tracking-tight text-slate-800">Your Profile</h1>
                    <p className="text-slate-500 font-medium mt-1">Manage your account information</p>
                </div>

                {/* Avatar + Summary Card */}
                <Card className="overflow-hidden border-none shadow-2xl">
                    <div className="h-28 bg-gradient-to-r from-emerald-500 via-teal-500 to-emerald-600 relative">
                        <div className="absolute inset-0 opacity-20"
                            style={{ backgroundImage: "url(\"data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='0.4'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E\")" }}
                        />
                    </div>
                    <CardContent className="pt-0 px-8 pb-8">
                        <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4 -mt-12 mb-6">
                            <div className="w-24 h-24 rounded-3xl bg-white shadow-xl flex items-center justify-center text-3xl font-black text-emerald-600 border-4 border-white ring-4 ring-emerald-100">
                                {initials}
                            </div>
                        </div>
                        <h2 className="text-2xl font-black text-slate-800">{profile?.name || 'No name set'}</h2>
                        <p className="text-slate-500 font-medium">{profile?.email}</p>
                    </CardContent>
                </Card>

                {/* Feedback Messages */}
                {success && (
                    <motion.div initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }}
                        className="flex items-center space-x-3 p-4 bg-emerald-50 border border-emerald-200 rounded-2xl">
                        <CheckCircle className="w-5 h-5 text-emerald-500 shrink-0" />
                        <p className="text-sm font-bold text-emerald-700">{success}</p>
                    </motion.div>
                )}
                {error && (
                    <motion.div initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }}
                        className="flex items-center space-x-3 p-4 bg-rose-50 border border-rose-200 rounded-2xl">
                        <AlertCircle className="w-5 h-5 text-rose-500 shrink-0" />
                        <p className="text-sm font-bold text-rose-700">{error}</p>
                    </motion.div>
                )}

                {/* Edit Profile Card */}
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between pb-2">
                        <div className="flex items-center space-x-3">
                            <div className="w-10 h-10 rounded-2xl bg-emerald-100 flex items-center justify-center">
                                <User className="w-5 h-5 text-emerald-600" />
                            </div>
                            <CardTitle className="text-lg">Personal Information</CardTitle>
                        </div>
                        {!isEditing && (
                            <Button variant="secondary" size="sm" className="rounded-xl"
                                onClick={() => { setIsEditing(true); setError(''); }}>
                                <Edit3 className="w-4 h-4 mr-2" />
                                Edit
                            </Button>
                        )}
                    </CardHeader>
                    <CardContent className="space-y-6">
                        {isEditing ? (
                            <form onSubmit={handleUpdateProfile} className="space-y-5">
                                <Input
                                    label="Display Name"
                                    placeholder="Your full name"
                                    value={editName}
                                    onChange={e => setEditName(e.target.value)}
                                    required
                                />
                                <div className="space-y-2">
                                    <label className="text-xs font-black uppercase tracking-widest text-slate-400">Email Address</label>
                                    <div className="flex items-center space-x-3 p-4 bg-slate-50 rounded-2xl border border-slate-100">
                                        <Mail className="w-4 h-4 text-slate-400" />
                                        <span className="text-sm font-bold text-slate-500">{profile?.email}</span>
                                        <span className="ml-auto text-[10px] font-black text-slate-400 bg-slate-100 px-2 py-1 rounded-lg uppercase tracking-widest">Cannot change</span>
                                    </div>
                                </div>
                                <div className="flex gap-4 pt-2">
                                    <Button type="button" variant="secondary" className="flex-1 rounded-2xl"
                                        onClick={() => { setIsEditing(false); setEditName(profile?.name || ''); setError(''); }}>
                                        Cancel
                                    </Button>
                                    <Button type="submit" className="flex-1 rounded-2xl" disabled={saving}>
                                        {saving ? 'Saving...' : 'Save Changes'}
                                    </Button>
                                </div>
                            </form>
                        ) : (
                            <div className="space-y-5">
                                <div className="flex items-center space-x-4 p-4 bg-slate-50/80 rounded-2xl">
                                    <div className="w-9 h-9 rounded-xl bg-white shadow-sm flex items-center justify-center border border-slate-100">
                                        <User className="w-4 h-4 text-slate-500" />
                                    </div>
                                    <div>
                                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-0.5">Display Name</p>
                                        <p className="text-sm font-extrabold text-slate-800">{profile?.name || <span className="text-slate-400 font-medium italic">Not set</span>}</p>
                                    </div>
                                </div>
                                <div className="flex items-center space-x-4 p-4 bg-slate-50/80 rounded-2xl">
                                    <div className="w-9 h-9 rounded-xl bg-white shadow-sm flex items-center justify-center border border-slate-100">
                                        <Mail className="w-4 h-4 text-slate-500" />
                                    </div>
                                    <div>
                                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-0.5">Email Address</p>
                                        <p className="text-sm font-extrabold text-slate-800">{profile?.email}</p>
                                    </div>
                                </div>
                                <div className="flex items-center space-x-4 p-4 bg-slate-50/80 rounded-2xl">
                                    <div className="w-9 h-9 rounded-xl bg-white shadow-sm flex items-center justify-center border border-slate-100">
                                        <Calendar className="w-4 h-4 text-slate-500" />
                                    </div>
                                    <div>
                                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-0.5">Member Since</p>
                                        <p className="text-sm font-extrabold text-slate-800">
                                            {profile?.created_at
                                                ? new Date(profile.created_at).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })
                                                : '—'}
                                        </p>
                                    </div>
                                </div>
                            </div>
                        )}
                    </CardContent>
                </Card>

                {/* Security Info */}
                <Card className="bg-slate-50/50 border-slate-100">
                    <CardContent className="p-6 flex items-center space-x-4">
                        <div className="w-12 h-12 rounded-2xl bg-slate-100 flex items-center justify-center shrink-0">
                            <Shield className="w-6 h-6 text-slate-500" />
                        </div>
                        <div>
                            <p className="text-sm font-extrabold text-slate-700">Password & Security</p>
                            <p className="text-xs font-medium text-slate-400 mt-0.5">Password changes are not currently supported via the app.</p>
                        </div>
                    </CardContent>
                </Card>
            </motion.div>
        </Layout>
    );
};

export default Profile;
